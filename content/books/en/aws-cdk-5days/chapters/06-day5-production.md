---
title: Day 5 - Production Best Practices and Operational Excellence
order: 6
---

# Day 5 - Production Best Practices and Operational Excellence

## Today's Goals

1. Implement security best practices for production
2. Set up comprehensive monitoring and alerting
3. Configure backup and disaster recovery
4. Establish operational excellence practices
5. Create production-ready deployment strategies

## 1. Security Best Practices

### 1.1 Security Foundation Construct

Create `lib/security/security-foundation.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface SecurityFoundationProps {
  environment: string;
  applicationName: string;
  enableKeyRotation?: boolean;
  enableCloudTrail?: boolean;
}

export class SecurityFoundation extends Construct {
  public readonly kmsKey: kms.Key;
  public readonly executionRole: iam.Role;
  public readonly securityBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: SecurityFoundationProps) {
    super(scope, id);

    // KMS Key for data encryption
    this.kmsKey = new kms.Key(this, 'AppKey', {
      description: `${props.applicationName} encryption key for ${props.environment}`,
      enableKeyRotation: props.enableKeyRotation ?? true,
      removalPolicy: props.environment === 'prod' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
    });

    // KMS Key Alias
    this.kmsKey.addAlias(`alias/${props.applicationName}-${props.environment}`);

    // Security logs S3 bucket
    this.securityBucket = new s3.Bucket(this, 'SecurityBucket', {
      bucketName: `${props.applicationName}-${props.environment}-security-logs-${cdk.Stack.of(this).account}`,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: this.kmsKey,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      lifecycleRules: [
        {
          id: 'SecurityLogsLifecycle',
          enabled: true,
          expiration: cdk.Duration.days(2555), // 7 years retention
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(90)
            },
            {
              storageClass: s3.StorageClass.GLACIER,
              transitionAfter: cdk.Duration.days(365)
            },
            {
              storageClass: s3.StorageClass.DEEP_ARCHIVE,
              transitionAfter: cdk.Duration.days(730)
            }
          ]
        }
      ],
      removalPolicy: props.environment === 'prod' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY
    });

    // Lambda execution role with least privilege
    this.executionRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      roleName: `${props.applicationName}-${props.environment}-lambda-role`,
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // CloudWatch Logs permissions with fine-grained access
    this.executionRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents'
      ],
      resources: [
        `arn:aws:logs:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:log-group:/aws/lambda/${props.applicationName}-${props.environment}-*`
      ]
    }));

    // X-Ray tracing permissions
    this.executionRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'xray:PutTraceSegments',
        'xray:PutTelemetryRecords'
      ],
      resources: ['*']
    }));

    // KMS key usage permissions
    this.kmsKey.grantDecrypt(this.executionRole);

    // Security policy validation
    this.addSecurityValidation();

    // Outputs
    new cdk.CfnOutput(this, 'KMSKeyId', {
      value: this.kmsKey.keyId,
      description: 'KMS Key ID for encryption',
    });

    new cdk.CfnOutput(this, 'SecurityBucketName', {
      value: this.securityBucket.bucketName,
      description: 'Security logs bucket name',
    });
  }

  // Grant KMS key access
  public grantKeyAccess(grantee: iam.IGrantable, ...actions: string[]) {
    return iam.Grant.addToPrincipalOrResource({
      grantee,
      actions,
      resourceArns: [this.kmsKey.keyArn],
      resource: this.kmsKey
    });
  }

  // Grant security bucket write access
  public grantSecurityLogsWrite(grantee: iam.IGrantable) {
    return this.securityBucket.grantWrite(grantee);
  }

  // Security policy validation using Aspects
  private addSecurityValidation() {
    cdk.Aspects.of(this).add({
      visit: (node: any) => {
        // S3 bucket encryption check
        if (node.node && node.node.id && node.node.id.includes('Bucket') && node instanceof cdk.aws_s3.CfnBucket) {
          if (!node.bucketEncryption) {
            cdk.Annotations.of(node).addError('S3 bucket must have encryption enabled');
          }
        }
        
        // Lambda function environment variable encryption check
        if (node instanceof cdk.aws_lambda.CfnFunction) {
          const environment = node.environment as any;
          if (!node.kmsKeyArn && environment?.Variables) {
            cdk.Annotations.of(node).addWarning('Lambda function should use KMS encryption for environment variables');
          }
        }
        
        // IAM role trust policy check
        if (node instanceof cdk.aws_iam.CfnRole) {
          const trustPolicy = node.assumeRolePolicyDocument as any;
          if (trustPolicy && trustPolicy.Statement) {
            for (const statement of trustPolicy.Statement) {
              if (statement.Principal === '*' || (statement.Principal && statement.Principal.AWS === '*')) {
                cdk.Annotations.of(node).addError('IAM role should not allow assume by any principal (*)');
              }
            }
          }
        }
      }
    });
  }
}
```

### 1.2 Secure Lambda Function

Create `lib/constructs/secure-lambda.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { SecurityFoundation } from '../security/security-foundation';

export interface SecureLambdaProps {
  functionName: string;
  handler: string;
  code: lambda.Code;
  environment?: { [key: string]: string };
  securityFoundation: SecurityFoundation;
  memorySize?: number;
  timeout?: cdk.Duration;
}

export class SecureLambda extends Construct {
  public readonly function: lambda.Function;
  public readonly logGroup: logs.LogGroup;

  constructor(scope: Construct, id: string, props: SecureLambdaProps) {
    super(scope, id);

    // Custom log group for better control
    this.logGroup = new logs.LogGroup(this, 'LogGroup', {
      logGroupName: `/aws/lambda/${props.functionName}`,
      retention: logs.RetentionDays.ONE_MONTH,
      encryptionKey: props.securityFoundation.kmsKey,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda function with security best practices
    this.function = new lambda.Function(this, 'Function', {
      functionName: props.functionName,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: props.handler,
      code: props.code,
      role: props.securityFoundation.executionRole,
      environment: {
        ...props.environment,
        KMS_KEY_ID: props.securityFoundation.kmsKey.keyId,
      },
      environmentEncryption: props.securityFoundation.kmsKey,
      memorySize: props.memorySize ?? 256,
      timeout: props.timeout ?? cdk.Duration.seconds(30),
      tracing: lambda.Tracing.ACTIVE,
      logGroup: this.logGroup,
      reservedConcurrentExecutions: 10, // Prevent runaway costs
      deadLetterQueueEnabled: true,
      retryAttempts: 2,
    });

    // Security policies
    this.addSecurityPolicies();
  }

  private addSecurityPolicies() {
    // Deny access to sensitive actions
    this.function.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.DENY,
      actions: [
        'iam:*',
        'sts:AssumeRole',
        'kms:Decrypt',
        's3:GetObject',
        'dynamodb:*'
      ],
      resources: ['*'],
      conditions: {
        StringNotEquals: {
          'aws:RequestedRegion': cdk.Stack.of(this).region
        }
      }
    }));

    // Allow only necessary KMS operations
    this.function.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'kms:Decrypt',
        'kms:DescribeKey'
      ],
      resources: [cdk.Stack.of(this).formatArn({
        service: 'kms',
        resource: 'key',
        resourceName: '*'
      })],
      conditions: {
        StringEquals: {
          'kms:ViaService': [
            `s3.${cdk.Stack.of(this).region}.amazonaws.com`,
            `dynamodb.${cdk.Stack.of(this).region}.amazonaws.com`
          ]
        }
      }
    }));
  }

  // Grant specific DynamoDB permissions
  public grantDynamoDBAccess(tableArn: string, actions: string[]) {
    this.function.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions,
      resources: [tableArn, `${tableArn}/index/*`]
    }));
  }

  // Grant specific S3 permissions
  public grantS3Access(bucketArn: string, actions: string[]) {
    this.function.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions,
      resources: [bucketArn, `${bucketArn}/*`]
    }));
  }
}
```

## 2. Monitoring and Observability

### 2.1 Comprehensive Monitoring

Create `lib/monitoring/monitoring-construct.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import { Construct } from 'constructs';

export interface MonitoringProps {
  notificationEmail?: string;
  environment: string;
}

export class MonitoringConstruct extends Construct {
  public readonly dashboard: cloudwatch.Dashboard;
  public readonly alertTopic: sns.Topic;

  constructor(scope: Construct, id: string, props: MonitoringProps) {
    super(scope, id);

    // SNS Topic for alerts
    this.alertTopic = new sns.Topic(this, 'AlertTopic', {
      topicName: `${props.environment}-alerts`,
      displayName: `${props.environment} Environment Alerts`,
    });

    if (props.notificationEmail) {
      this.alertTopic.addSubscription(
        new subscriptions.EmailSubscription(props.notificationEmail)
      );
    }

    // CloudWatch Dashboard
    this.dashboard = new cloudwatch.Dashboard(this, 'MonitoringDashboard', {
      dashboardName: `${props.environment}-monitoring-dashboard`,
      defaultInterval: cdk.Duration.hours(1),
    });

    // Add common widgets
    this.addCommonWidgets();
  }

  private addCommonWidgets() {
    // System health widget
    this.dashboard.addWidgets(
      new cloudwatch.TextWidget({
        markdown: `# ${this.node.tryGetContext('environment')} Environment Monitoring\n\nLast updated: ${new Date().toISOString()}`,
        width: 24,
        height: 2,
      })
    );
  }

  // Add Lambda function monitoring
  public addLambdaMonitoring(
    func: lambda.Function, 
    options?: {
      errorRateThreshold?: number;
      durationThreshold?: number;
    }
  ) {
    const errorRateThreshold = options?.errorRateThreshold ?? 5;
    const durationThreshold = options?.durationThreshold ?? 10000;

    // Error rate alarm
    const errorAlarm = new cloudwatch.Alarm(this, `${func.functionName}ErrorAlarm`, {
      alarmName: `${func.functionName}-high-error-rate`,
      metric: func.metricErrors({
        period: cdk.Duration.minutes(5),
        statistic: 'Sum'
      }),
      threshold: errorRateThreshold,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      alarmDescription: `High error rate detected in ${func.functionName}`,
    });
    
    errorAlarm.addAlarmAction(new actions.SnsAction(this.alertTopic));

    // Duration alarm
    const durationAlarm = new cloudwatch.Alarm(this, `${func.functionName}DurationAlarm`, {
      alarmName: `${func.functionName}-high-duration`,
      metric: func.metricDuration({
        period: cdk.Duration.minutes(5),
        statistic: 'Average'
      }),
      threshold: durationThreshold,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      alarmDescription: `High duration detected in ${func.functionName}`,
    });
    
    durationAlarm.addAlarmAction(new actions.SnsAction(this.alertTopic));

    // Add Lambda widgets to dashboard
    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: `${func.functionName} Metrics`,
        left: [
          func.metricInvocations({ label: 'Invocations' }),
          func.metricErrors({ label: 'Errors' }),
        ],
        right: [
          func.metricDuration({ label: 'Duration' }),
        ],
        width: 12,
        height: 6,
      }),
      new cloudwatch.LogQueryWidget({
        title: `${func.functionName} Error Logs`,
        logGroups: [func.logGroup!],
        queryLines: [
          'fields @timestamp, @message',
          'filter @message like /ERROR/',
          'sort @timestamp desc',
          'limit 20'
        ],
        width: 12,
        height: 6,
      })
    );
  }

  // Add API Gateway monitoring
  public addApiGatewayMonitoring(api: apigateway.RestApi) {
    // 4XX and 5XX error alarms
    const clientErrorAlarm = new cloudwatch.Alarm(this, `${api.restApiName}ClientErrorAlarm`, {
      alarmName: `${api.restApiName}-high-4xx-errors`,
      metric: api.metricClientError({
        period: cdk.Duration.minutes(5),
        statistic: 'Sum'
      }),
      threshold: 10,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    });
    
    clientErrorAlarm.addAlarmAction(new actions.SnsAction(this.alertTopic));

    const serverErrorAlarm = new cloudwatch.Alarm(this, `${api.restApiName}ServerErrorAlarm`, {
      alarmName: `${api.restApiName}-high-5xx-errors`,
      metric: api.metricServerError({
        period: cdk.Duration.minutes(5),
        statistic: 'Sum'
      }),
      threshold: 5,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    });
    
    serverErrorAlarm.addAlarmAction(new actions.SnsAction(this.alertTopic));

    // Add API Gateway widgets
    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: `${api.restApiName} API Metrics`,
        left: [
          api.metricCount({ label: 'Requests' }),
          api.metricClientError({ label: '4XX Errors' }),
          api.metricServerError({ label: '5XX Errors' }),
        ],
        right: [
          api.metricLatency({ label: 'Latency' }),
        ],
        width: 24,
        height: 6,
      })
    );
  }

  // Add DynamoDB monitoring
  public addDynamoDBMonitoring(table: dynamodb.Table) {
    // Throttling alarm
    const throttleAlarm = new cloudwatch.Alarm(this, `${table.tableName}ThrottleAlarm`, {
      alarmName: `${table.tableName}-throttling`,
      metric: table.metricThrottledRequestsForOperations({
        operations: [dynamodb.Operation.PUT_ITEM, dynamodb.Operation.GET_ITEM],
        period: cdk.Duration.minutes(5),
        statistic: 'Sum'
      }),
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    });
    
    throttleAlarm.addAlarmAction(new actions.SnsAction(this.alertTopic));

    // Add DynamoDB widgets
    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: `${table.tableName} DynamoDB Metrics`,
        left: [
          table.metricConsumedReadCapacityUnits({ label: 'Read Capacity' }),
          table.metricConsumedWriteCapacityUnits({ label: 'Write Capacity' }),
        ],
        right: [
          table.metricSuccessfulRequestLatency({
            operations: [dynamodb.Operation.GET_ITEM],
            label: 'Get Latency'
          }),
          table.metricSuccessfulRequestLatency({
            operations: [dynamodb.Operation.PUT_ITEM],
            label: 'Put Latency'
          }),
        ],
        width: 24,
        height: 6,
      })
    );
  }

  // Add custom metric monitoring
  public addCustomMetric(metricName: string, namespace: string, threshold: number) {
    const customMetric = new cloudwatch.Metric({
      metricName,
      namespace,
      statistic: 'Average',
      period: cdk.Duration.minutes(5),
    });

    const customAlarm = new cloudwatch.Alarm(this, `${metricName}Alarm`, {
      alarmName: `custom-${metricName}-alarm`,
      metric: customMetric,
      threshold,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    });
    
    customAlarm.addAlarmAction(new actions.SnsAction(this.alertTopic));

    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: `Custom Metric: ${metricName}`,
        left: [customMetric],
        width: 12,
        height: 6,
      })
    );
  }

  // Add email notification
  public addEmailNotification(email: string) {
    this.alertTopic.addSubscription(new subscriptions.EmailSubscription(email));
  }
}
```

## 3. Production-Ready Stack

### 3.1 Production Stack

Create `lib/production-stack.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SecurityFoundation } from './security/security-foundation';
import { MonitoringConstruct } from './monitoring/monitoring-construct';
import { S3BucketConstruct } from './s3-construct';
import { LambdaApiConstruct } from './lambda-api-construct';
import { TodoApiConstruct } from './todo-api-construct';

export interface ProductionStackProps extends cdk.StackProps {
  environment: 'staging' | 'production';
  applicationName: string;
  notificationEmail?: string;
}

export class ProductionStack extends cdk.Stack {
  public readonly security: SecurityFoundation;
  public readonly monitoring: MonitoringConstruct;

  constructor(scope: Construct, id: string, props: ProductionStackProps) {
    super(scope, id, {
      ...props,
      description: `Production-ready CDK stack for ${props.applicationName} - ${props.environment}`,
      tags: {
        Environment: props.environment,
        Application: props.applicationName,
        CreatedBy: 'AWS CDK',
        CostCenter: props.environment === 'production' ? 'production' : 'development'
      }
    });

    // Security foundation
    this.security = new SecurityFoundation(this, 'Security', {
      environment: props.environment,
      applicationName: props.applicationName,
      enableKeyRotation: props.environment === 'production',
      enableCloudTrail: props.environment === 'production'
    });

    // Production-grade S3 bucket
    const secureStorage = new S3BucketConstruct(this, 'SecureStorage', {
      versioned: true,
      publicReadAccess: false,
      bucketName: `${props.applicationName}-${props.environment}-secure-storage-${this.account}`
    });

    // Production-grade Lambda API
    const prodApi = new LambdaApiConstruct(this, 'ProdApi', {
      functionName: `${props.applicationName}-${props.environment}-api`,
      apiName: `${props.applicationName}-${props.environment}-api`,
      memorySize: props.environment === 'production' ? 1024 : 512,
      timeout: cdk.Duration.seconds(props.environment === 'production' ? 30 : 60)
    });

    // Production-grade Todo API
    const todoApi = new TodoApiConstruct(this, 'ProdTodoApi');

    // Comprehensive monitoring
    this.monitoring = new MonitoringConstruct(this, 'Monitoring', {
      environment: props.environment,
      notificationEmail: props.notificationEmail
    });
    
    // Monitor key components
    this.monitoring.addLambdaMonitoring(prodApi.function, {
      errorRateThreshold: props.environment === 'production' ? 1 : 5,
      durationThreshold: props.environment === 'production' ? 5000 : 10000
    });
    
    this.monitoring.addApiGatewayMonitoring(prodApi.api);
    this.monitoring.addApiGatewayMonitoring(todoApi.api);
    this.monitoring.addDynamoDBMonitoring(todoApi.table);

    // Email notifications for production
    if (props.environment === 'production' && props.notificationEmail) {
      this.monitoring.addEmailNotification(props.notificationEmail);
    }

    // Production-specific configurations
    if (props.environment === 'production') {
      this.addProductionSpecificConfigurations();
    }

    // Stack outputs
    new cdk.CfnOutput(this, 'Environment', {
      value: props.environment,
      description: 'Deployment environment'
    });

    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: prodApi.api.url,
      description: 'Main API endpoint URL'
    });

    new cdk.CfnOutput(this, 'TodoApiEndpoint', {
      value: todoApi.api.url,
      description: 'Todo API endpoint URL'
    });

    new cdk.CfnOutput(this, 'MonitoringDashboard', {
      value: `https://console.aws.amazon.com/cloudwatch/home?region=${this.region}#dashboards:name=${this.monitoring.dashboard.dashboardName}`,
      description: 'CloudWatch monitoring dashboard URL'
    });
  }

  private addProductionSpecificConfigurations() {
    // Production stack protection
    this.templateOptions.metadata = {
      'AWS::CloudFormation::Interface': {
        ParameterGroups: [
          {
            Label: { default: 'Production Configuration' },
            Parameters: []
          }
        ]
      }
    };

    // Stack termination protection
    const cfnStack = this.node.defaultChild as cdk.CfnStack;
    cfnStack.addPropertyOverride('EnableTerminationProtection', true);

    // Production resource tags
    cdk.Tags.of(this).add('BackupRequired', 'true');
    cdk.Tags.of(this).add('ComplianceLevel', 'high');
    cdk.Tags.of(this).add('DataClassification', 'confidential');

    // CloudFormation drift detection
    new cdk.CfnOutput(this, 'DriftDetectionCommand', {
      value: `aws cloudformation detect-stack-drift --stack-name ${this.stackName}`,
      description: 'Command to detect configuration drift'
    });

    // Production health checks
    this.addProductionHealthChecks();
  }

  private addProductionHealthChecks() {
    // Custom resource for health checks
    new cdk.CustomResource(this, 'HealthCheck', {
      serviceToken: new cdk.aws_lambda.Function(this, 'HealthCheckFunction', {
        runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        handler: 'index.handler',
        code: cdk.aws_lambda.Code.fromInline(`
          const AWS = require('aws-sdk');
          const response = require('cfn-response');

          exports.handler = async (event, context) => {
            console.log('Health check triggered:', JSON.stringify(event));
            
            try {
              // Basic health checks
              const checks = {
                timestamp: new Date().toISOString(),
                region: process.env.AWS_REGION,
                stackName: event.StackId?.split('/')[1] || 'unknown'
              };
              
              console.log('Health check results:', checks);
              
              // Send success response to CloudFormation
              await response.send(event, context, response.SUCCESS, checks);
            } catch (error) {
              console.error('Health check failed:', error);
              await response.send(event, context, response.FAILED, {
                error: error.message
              });
            }
          };
        `),
        role: this.security.executionRole,
        timeout: cdk.Duration.minutes(1)
      }).functionArn
    });
  }
}
```

### 3.2 Multi-Environment App

Update your app entry point `bin/my-first-cdk-app.ts`:

```typescript
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MyFirstCdkAppStack } from '../lib/my-first-cdk-app-stack';
import { ProductionStack } from '../lib/production-stack';

const app = new cdk.App();

// Environment configuration
const environment = app.node.tryGetContext('environment') || 'development';
const applicationName = 'my-cdk-app';

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
};

// Development stack (comprehensive learning stack)
if (environment === 'development') {
  new MyFirstCdkAppStack(app, 'MyFirstCdkAppStack', {
    env,
    description: 'Development stack with all CDK tutorial exercises',
    tags: {
      Environment: 'development',
      Application: applicationName,
      Purpose: 'learning'
    }
  });
}

// Staging environment
if (environment === 'staging') {
  new ProductionStack(app, `${applicationName}-staging`, {
    env,
    environment: 'staging',
    applicationName,
    notificationEmail: process.env.NOTIFICATION_EMAIL,
    description: 'Staging environment for CDK tutorial application',
    tags: {
      Environment: 'staging',
      Application: applicationName,
      CostCenter: 'development'
    }
  });
}

// Production environment
if (environment === 'production') {
  new ProductionStack(app, `${applicationName}-production`, {
    env,
    environment: 'production',
    applicationName,
    notificationEmail: process.env.NOTIFICATION_EMAIL,
    description: 'Production environment for CDK tutorial application',
    tags: {
      Environment: 'production',
      Application: applicationName,
      CostCenter: 'production',
      BackupRequired: 'true',
      ComplianceLevel: 'high'
    }
  });
}
```

## 4. Backup and Disaster Recovery

### 4.1 Automated Backup Strategy

Create `lib/backup/backup-construct.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import * as backup from 'aws-cdk-lib/aws-backup';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface BackupConstructProps {
  environment: string;
  retentionDays: number;
}

export class BackupConstruct extends Construct {
  public readonly backupVault: backup.BackupVault;
  public readonly backupPlan: backup.BackupPlan;

  constructor(scope: Construct, id: string, props: BackupConstructProps) {
    super(scope, id);

    // Backup vault with encryption
    this.backupVault = new backup.BackupVault(this, 'BackupVault', {
      backupVaultName: `${props.environment}-backup-vault`,
      encryptionKey: cdk.aws_kms.Alias.fromAliasName(this, 'BackupKey', 'alias/aws/backup'),
      removalPolicy: props.environment === 'production' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
    });

    // Backup plan
    this.backupPlan = backup.BackupPlan.dailyWeeklyMonthly5YearRetention(this, 'BackupPlan', {
      backupPlanName: `${props.environment}-backup-plan`,
      backupVault: this.backupVault,
    });

    // Additional backup rule for critical data
    if (props.environment === 'production') {
      this.backupPlan.addRule(backup.BackupPlanRule.fromProps({
        ruleName: 'CriticalDataBackup',
        scheduleExpression: backup.ScheduleExpression.cron({
          hour: '2',
          minute: '0'
        }),
        deleteAfter: cdk.Duration.days(props.retentionDays),
        moveToColdStorageAfter: cdk.Duration.days(30),
        copyActions: [{
          destinationBackupVault: this.backupVault,
          deleteAfter: cdk.Duration.days(props.retentionDays * 2),
        }],
      }));
    }
  }

  // Add DynamoDB table to backup
  public addDynamoDBTable(table: dynamodb.Table) {
    this.backupPlan.addSelection('DynamoDBBackup', {
      resources: [
        backup.BackupResource.fromDynamoDbTable(table)
      ],
      allowRestores: true,
    });
  }

  // Add S3 bucket to backup (via lifecycle policy)
  public addS3BucketBackup(bucket: s3.Bucket) {
    bucket.addLifecycleRule({
      id: 'BackupLifecycle',
      enabled: true,
      transitions: [
        {
          storageClass: s3.StorageClass.INFREQUENT_ACCESS,
          transitionAfter: cdk.Duration.days(30),
        },
        {
          storageClass: s3.StorageClass.GLACIER,
          transitionAfter: cdk.Duration.days(90),
        },
        {
          storageClass: s3.StorageClass.DEEP_ARCHIVE,
          transitionAfter: cdk.Duration.days(180),
        },
      ],
    });
  }
}
```

## 5. Operational Excellence

### 5.1 Operational Dashboard

Create a comprehensive operational dashboard:

```typescript
// Add to your monitoring construct
public createOperationalDashboard() {
  const operationalDashboard = new cloudwatch.Dashboard(this, 'OperationalDashboard', {
    dashboardName: `${this.environment}-operational-dashboard`,
    defaultInterval: cdk.Duration.hours(24),
  });

  // Cost tracking widget
  operationalDashboard.addWidgets(
    new cloudwatch.LogQueryWidget({
      title: 'Cost Analysis',
      logGroups: [],
      queryLines: [
        'fields @timestamp, @message',
        'filter @message like /BILLING/',
        'stats count() by bin(5m)'
      ],
      width: 12,
      height: 6,
    }),
    
    // Performance summary
    new cloudwatch.GraphWidget({
      title: 'Performance Summary',
      left: [
        new cloudwatch.Metric({
          metricName: 'Invocations',
          namespace: 'AWS/Lambda',
          statistic: 'Sum'
        }),
      ],
      width: 12,
      height: 6,
    }),

    // Error summary across all services
    new cloudwatch.GraphWidget({
      title: 'Error Summary',
      left: [
        new cloudwatch.Metric({
          metricName: 'Errors',
          namespace: 'AWS/Lambda',
          statistic: 'Sum'
        }),
        new cloudwatch.Metric({
          metricName: '5XXError',
          namespace: 'AWS/ApiGateway',
          statistic: 'Sum'
        }),
      ],
      width: 24,
      height: 6,
    })
  );

  return operationalDashboard;
}
```

### 5.2 Automated Remediation

Create `lib/automation/auto-remediation.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';

export class AutoRemediationConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Auto-remediation Lambda
    const remediationFunction = new lambda.Function(this, 'RemediationFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const AWS = require('aws-sdk');
        const cloudwatch = new AWS.CloudWatch();
        const lambda = new AWS.Lambda();

        exports.handler = async (event) => {
          console.log('Received alarm:', JSON.stringify(event, null, 2));
          
          const detail = event.detail;
          const alarmName = detail.alarmName;
          const state = detail.state.value;
          
          if (state === 'ALARM') {
            try {
              if (alarmName.includes('high-error-rate')) {
                // Restart Lambda function (clear any cached connections)
                const functionName = alarmName.split('-')[0];
                await lambda.updateFunctionConfiguration({
                  FunctionName: functionName,
                  Environment: {
                    Variables: {
                      ...process.env,
                      RESTART_TIMESTAMP: Date.now().toString()
                    }
                  }
                }).promise();
                
                console.log(\`Triggered restart for function: \${functionName}\`);
              }
              
              if (alarmName.includes('high-duration')) {
                // Scale up memory for high duration alarms
                const functionName = alarmName.split('-')[0];
                const config = await lambda.getFunctionConfiguration({
                  FunctionName: functionName
                }).promise();
                
                const newMemory = Math.min(config.MemorySize * 1.5, 3008);
                
                await lambda.updateFunctionConfiguration({
                  FunctionName: functionName,
                  MemorySize: newMemory
                }).promise();
                
                console.log(\`Increased memory for \${functionName} to \${newMemory}MB\`);
              }
              
            } catch (error) {
              console.error('Remediation failed:', error);
              throw error;
            }
          }
          
          return { statusCode: 200, body: 'Remediation completed' };
        };
      `),
      timeout: cdk.Duration.seconds(60),
    });

    // CloudWatch Events rule for alarm state changes
    const alarmRule = new events.Rule(this, 'AlarmRule', {
      eventPattern: {
        source: ['aws.cloudwatch'],
        detailType: ['CloudWatch Alarm State Change'],
        detail: {
          state: {
            value: ['ALARM']
          }
        }
      }
    });

    alarmRule.addTarget(new targets.LambdaFunction(remediationFunction));

    // Grant necessary permissions
    remediationFunction.addToRolePolicy(new cdk.aws_iam.PolicyStatement({
      effect: cdk.aws_iam.Effect.ALLOW,
      actions: [
        'lambda:UpdateFunctionConfiguration',
        'lambda:GetFunctionConfiguration'
      ],
      resources: ['*']
    }));
  }
}
```

## 6. Summary and Best Practices

### 6.1 Production Deployment Checklist

✅ **Security**
- KMS encryption for all data at rest
- IAM roles with least privilege principle
- Security groups with minimal required access
- CloudTrail logging enabled

✅ **Monitoring & Alerting**
- CloudWatch dashboards for key metrics
- Alarms for error rates, latency, and costs
- SNS notifications for critical alerts
- Log aggregation and analysis

✅ **Backup & Recovery**
- Automated backup strategies
- Cross-region backup for critical data
- Disaster recovery procedures documented
- Recovery testing performed regularly

✅ **Operational Excellence**
- Infrastructure as Code for all resources
- Automated deployment pipelines
- Configuration drift detection
- Automated remediation where possible

✅ **Performance & Cost**
- Right-sizing of resources
- Reserved capacity where appropriate
- Cost monitoring and alerts
- Performance optimization based on metrics

### 6.2 Daily Operations Commands

```bash
# Deploy to different environments
cdk deploy --context environment=dev
cdk deploy --context environment=staging
cdk deploy --context environment=production

# Monitor stack drift
aws cloudformation detect-stack-drift --stack-name MyStack

# View monitoring dashboard
aws cloudwatch get-dashboard --dashboard-name prod-monitoring-dashboard

# Check backup status
aws backup list-backup-jobs --by-backup-vault-name prod-backup-vault

# View recent alarms
aws cloudwatch describe-alarms --state-value ALARM --max-records 10
```

### 6.3 Troubleshooting Guide

**High Error Rates**
1. Check CloudWatch Logs for error patterns
2. Review recent deployments
3. Check external dependencies
4. Scale resources if needed

**High Latency**
1. Check database connection pooling
2. Review Lambda memory allocation
3. Analyze cold start impacts
4. Check API Gateway caching

**Cost Spikes**
1. Review CloudWatch cost metrics
2. Check for runaway functions
3. Review data transfer costs
4. Validate resource right-sizing

## Final Exercise: Complete Production Application

Deploy a fully production-ready application with:

1. **Multi-environment support** (dev/staging/prod)
2. **Comprehensive security** (KMS, IAM, security groups)
3. **Full monitoring** (dashboards, alarms, logs)
4. **Automated backups** (DynamoDB, S3)
5. **CI/CD pipeline** (GitHub Actions)
6. **Auto-remediation** (basic self-healing)

```bash
# Deploy the complete solution
export NOTIFICATION_EMAIL=your-email@domain.com
cdk deploy --context environment=production
```

## Congratulations! 🎉

You have successfully completed the 5-day AWS CDK journey! You now have:

1. ✅ **Solid CDK Foundation** - Understanding of constructs, stacks, and apps
2. ✅ **Practical Experience** - Built real applications with AWS services
3. ✅ **Advanced Patterns** - Custom constructs and cross-stack references
4. ✅ **Testing Knowledge** - Unit, integration, and end-to-end testing
5. ✅ **Production Skills** - Security, monitoring, and operational excellence

### Next Steps

- **Explore CDK Patterns** - Learn more design patterns from AWS
- **Contribute to CDK** - Join the open-source community
- **Build Your Own Constructs** - Create reusable components for your organization
- **Advanced Topics** - Multi-region deployments, CDK Pipelines, Custom Resources

### Resources for Continued Learning

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [CDK Patterns](https://cdkpatterns.com/)
- [AWS CDK Examples](https://github.com/aws-samples/aws-cdk-examples)
- [CDK Workshop](https://cdkworkshop.com/)

Keep building, keep learning, and welcome to the Infrastructure as Code revolution! 🚀