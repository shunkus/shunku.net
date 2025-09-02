---
title: 第5天 - 生产最佳实践和卓越运营
order: 6
---

# 第5天 - 生产最佳实践和卓越运营

## 今日目标

1. 实施生产环境的安全最佳实践
2. 设置全面的监控和报警
3. 配置备份和灾难恢复
4. 建立卓越运营实践
5. 创建生产就绪的部署策略

## 1. 安全最佳实践

### 1.1 安全基础构造

创建`lib/security/security-foundation.ts`：

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

    // 用于数据加密的KMS密钥
    this.kmsKey = new kms.Key(this, 'AppKey', {
      description: `${props.applicationName}在${props.environment}环境的加密密钥`,
      enableKeyRotation: props.enableKeyRotation ?? true,
      removalPolicy: props.environment === 'prod' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
    });

    // KMS密钥别名
    this.kmsKey.addAlias(`alias/${props.applicationName}-${props.environment}`);

    // 安全日志S3存储桶
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
          expiration: cdk.Duration.days(2555), // 7年保留期
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

    // 遵循最小权限原则的Lambda执行角色
    this.executionRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      roleName: `${props.applicationName}-${props.environment}-lambda-role`,
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // 具有细粒度访问权限的CloudWatch日志权限
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

    // X-Ray跟踪权限
    this.executionRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'xray:PutTraceSegments',
        'xray:PutTelemetryRecords'
      ],
      resources: ['*']
    }));

    // KMS密钥使用权限
    this.kmsKey.grantDecrypt(this.executionRole);

    // 安全策略验证
    this.addSecurityValidation();

    // 输出
    new cdk.CfnOutput(this, 'KMSKeyId', {
      value: this.kmsKey.keyId,
      description: '用于加密的KMS密钥ID',
    });

    new cdk.CfnOutput(this, 'SecurityBucketName', {
      value: this.securityBucket.bucketName,
      description: '安全日志存储桶名称',
    });
  }

  // 授予KMS密钥访问权限
  public grantKeyAccess(grantee: iam.IGrantable, ...actions: string[]) {
    return iam.Grant.addToPrincipalOrResource({
      grantee,
      actions,
      resourceArns: [this.kmsKey.keyArn],
      resource: this.kmsKey
    });
  }

  // 授予安全存储桶写入权限
  public grantSecurityLogsWrite(grantee: iam.IGrantable) {
    return this.securityBucket.grantWrite(grantee);
  }

  // 使用方面进行安全策略验证
  private addSecurityValidation() {
    cdk.Aspects.of(this).add({
      visit: (node: any) => {
        // S3存储桶加密检查
        if (node.node && node.node.id && node.node.id.includes('Bucket') && node instanceof cdk.aws_s3.CfnBucket) {
          if (!node.bucketEncryption) {
            cdk.Annotations.of(node).addError('S3存储桶必须启用加密');
          }
        }
        
        // Lambda函数环境变量加密检查
        if (node instanceof cdk.aws_lambda.CfnFunction) {
          const environment = node.environment as any;
          if (!node.kmsKeyArn && environment?.Variables) {
            cdk.Annotations.of(node).addWarning('Lambda函数应使用KMS加密环境变量');
          }
        }
        
        // IAM角色信任策略检查
        if (node instanceof cdk.aws_iam.CfnRole) {
          const trustPolicy = node.assumeRolePolicyDocument as any;
          if (trustPolicy && trustPolicy.Statement) {
            for (const statement of trustPolicy.Statement) {
              if (statement.Principal === '*' || (statement.Principal && statement.Principal.AWS === '*')) {
                cdk.Annotations.of(node).addError('IAM角色不应允许任何主体(*)承担');
              }
            }
          }
        }
      }
    });
  }
}
```

### 1.2 安全Lambda函数

创建`lib/constructs/secure-lambda.ts`：

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

    // 自定义日志组以获得更好的控制
    this.logGroup = new logs.LogGroup(this, 'LogGroup', {
      logGroupName: `/aws/lambda/${props.functionName}`,
      retention: logs.RetentionDays.ONE_MONTH,
      encryptionKey: props.securityFoundation.kmsKey,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // 具有安全最佳实践的Lambda函数
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
      reservedConcurrentExecutions: 10, // 防止失控成本
      deadLetterQueueEnabled: true,
      retryAttempts: 2,
    });

    // 安全策略
    this.addSecurityPolicies();
  }

  private addSecurityPolicies() {
    // 拒绝访问敏感操作
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

    // 只允许必要的KMS操作
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

  // 授予特定DynamoDB权限
  public grantDynamoDBAccess(tableArn: string, actions: string[]) {
    this.function.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions,
      resources: [tableArn, `${tableArn}/index/*`]
    }));
  }

  // 授予特定S3权限
  public grantS3Access(bucketArn: string, actions: string[]) {
    this.function.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions,
      resources: [bucketArn, `${bucketArn}/*`]
    }));
  }
}
```

## 2. 监控和可观测性

### 2.1 全面监控

创建`lib/monitoring/monitoring-construct.ts`：

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

    // 用于警报的SNS主题
    this.alertTopic = new sns.Topic(this, 'AlertTopic', {
      topicName: `${props.environment}-alerts`,
      displayName: `${props.environment}环境警报`,
    });

    if (props.notificationEmail) {
      this.alertTopic.addSubscription(
        new subscriptions.EmailSubscription(props.notificationEmail)
      );
    }

    // CloudWatch仪表板
    this.dashboard = new cloudwatch.Dashboard(this, 'MonitoringDashboard', {
      dashboardName: `${props.environment}-monitoring-dashboard`,
      defaultInterval: cdk.Duration.hours(1),
    });

    // 添加通用小部件
    this.addCommonWidgets();
  }

  private addCommonWidgets() {
    // 系统健康小部件
    this.dashboard.addWidgets(
      new cloudwatch.TextWidget({
        markdown: `# ${this.node.tryGetContext('environment')}环境监控\n\n最后更新时间: ${new Date().toISOString()}`,
        width: 24,
        height: 2,
      })
    );
  }

  // 添加Lambda函数监控
  public addLambdaMonitoring(
    func: lambda.Function, 
    options?: {
      errorRateThreshold?: number;
      durationThreshold?: number;
    }
  ) {
    const errorRateThreshold = options?.errorRateThreshold ?? 5;
    const durationThreshold = options?.durationThreshold ?? 10000;

    // 错误率警报
    const errorAlarm = new cloudwatch.Alarm(this, `${func.functionName}ErrorAlarm`, {
      alarmName: `${func.functionName}-high-error-rate`,
      metric: func.metricErrors({
        period: cdk.Duration.minutes(5),
        statistic: 'Sum'
      }),
      threshold: errorRateThreshold,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      alarmDescription: `在${func.functionName}中检测到高错误率`,
    });
    
    errorAlarm.addAlarmAction(new actions.SnsAction(this.alertTopic));

    // 持续时间警报
    const durationAlarm = new cloudwatch.Alarm(this, `${func.functionName}DurationAlarm`, {
      alarmName: `${func.functionName}-high-duration`,
      metric: func.metricDuration({
        period: cdk.Duration.minutes(5),
        statistic: 'Average'
      }),
      threshold: durationThreshold,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      alarmDescription: `在${func.functionName}中检测到高持续时间`,
    });
    
    durationAlarm.addAlarmAction(new actions.SnsAction(this.alertTopic));

    // 将Lambda小部件添加到仪表板
    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: `${func.functionName}指标`,
        left: [
          func.metricInvocations({ label: '调用次数' }),
          func.metricErrors({ label: '错误数' }),
        ],
        right: [
          func.metricDuration({ label: '持续时间' }),
        ],
        width: 12,
        height: 6,
      }),
      new cloudwatch.LogQueryWidget({
        title: `${func.functionName}错误日志`,
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

  // 添加API Gateway监控
  public addApiGatewayMonitoring(api: apigateway.RestApi) {
    // 4XX和5XX错误警报
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

    // 添加API Gateway小部件
    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: `${api.restApiName} API指标`,
        left: [
          api.metricCount({ label: '请求数' }),
          api.metricClientError({ label: '4XX错误' }),
          api.metricServerError({ label: '5XX错误' }),
        ],
        right: [
          api.metricLatency({ label: '延迟' }),
        ],
        width: 24,
        height: 6,
      })
    );
  }

  // 添加DynamoDB监控
  public addDynamoDBMonitoring(table: dynamodb.Table) {
    // 限制警报
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

    // 添加DynamoDB小部件
    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: `${table.tableName} DynamoDB指标`,
        left: [
          table.metricConsumedReadCapacityUnits({ label: '读取容量' }),
          table.metricConsumedWriteCapacityUnits({ label: '写入容量' }),
        ],
        right: [
          table.metricSuccessfulRequestLatency({
            operations: [dynamodb.Operation.GET_ITEM],
            label: '获取延迟'
          }),
          table.metricSuccessfulRequestLatency({
            operations: [dynamodb.Operation.PUT_ITEM],
            label: '放置延迟'
          }),
        ],
        width: 24,
        height: 6,
      })
    );
  }

  // 添加自定义指标监控
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
        title: `自定义指标: ${metricName}`,
        left: [customMetric],
        width: 12,
        height: 6,
      })
    );
  }

  // 添加电子邮件通知
  public addEmailNotification(email: string) {
    this.alertTopic.addSubscription(new subscriptions.EmailSubscription(email));
  }
}
```

## 3. 生产就绪堆栈

### 3.1 生产堆栈

创建`lib/production-stack.ts`：

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SecurityFoundation } from './security/security-foundation';
import { MonitoringConstruct } from './monitoring/monitoring-construct';
import { WebApiConstruct } from './web-api-construct';

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
      description: `${props.applicationName}的生产就绪CDK堆栈 - ${props.environment}`,
      tags: {
        Environment: props.environment,
        Application: props.applicationName,
        CreatedBy: 'AWS CDK',
        CostCenter: props.environment === 'production' ? 'production' : 'development'
      }
    });

    // 安全基础
    this.security = new SecurityFoundation(this, 'Security', {
      environment: props.environment,
      applicationName: props.applicationName,
      enableKeyRotation: props.environment === 'production',
      enableCloudTrail: props.environment === 'production'
    });

    // 生产级Web API
    const webApi = new WebApiConstruct(this, 'WebApi', {
      tableName: `web-api-table-${props.environment}`,
      lambdaMemorySize: props.environment === 'production' ? 1024 : 512,
      apiName: `web-api-${props.environment}`,
    });

    // 全面监控
    this.monitoring = new MonitoringConstruct(this, 'Monitoring', {
      environment: props.environment,
      notificationEmail: props.notificationEmail
    });
    
    // 监控关键组件
    this.monitoring.addLambdaMonitoring(webApi.lambdaFunction, {
      errorRateThreshold: props.environment === 'production' ? 1 : 5,
      durationThreshold: props.environment === 'production' ? 5000 : 10000
    });
    
    this.monitoring.addApiGatewayMonitoring(webApi.api);
    this.monitoring.addDynamoDBMonitoring(webApi.table);

    // 生产环境的电子邮件通知
    if (props.environment === 'production' && props.notificationEmail) {
      this.monitoring.addEmailNotification(props.notificationEmail);
    }

    // 生产特定配置
    if (props.environment === 'production') {
      this.addProductionSpecificConfigurations();
    }

    // 堆栈输出
    new cdk.CfnOutput(this, 'Environment', {
      value: props.environment,
      description: '部署环境'
    });

    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: webApi.api.url,
      description: '主API端点URL'
    });

    new cdk.CfnOutput(this, 'MonitoringDashboard', {
      value: `https://console.aws.amazon.com/cloudwatch/home?region=${this.region}#dashboards:name=${this.monitoring.dashboard.dashboardName}`,
      description: 'CloudWatch监控仪表板URL'
    });
  }

  private addProductionSpecificConfigurations() {
    // 生产堆栈保护
    this.templateOptions.metadata = {
      'AWS::CloudFormation::Interface': {
        ParameterGroups: [
          {
            Label: { default: '生产配置' },
            Parameters: []
          }
        ]
      }
    };

    // 堆栈终止保护
    const cfnStack = this.node.defaultChild as cdk.CfnStack;
    cfnStack.addPropertyOverride('EnableTerminationProtection', true);

    // 生产资源标签
    cdk.Tags.of(this).add('BackupRequired', 'true');
    cdk.Tags.of(this).add('ComplianceLevel', 'high');
    cdk.Tags.of(this).add('DataClassification', 'confidential');

    // CloudFormation漂移检测
    new cdk.CfnOutput(this, 'DriftDetectionCommand', {
      value: `aws cloudformation detect-stack-drift --stack-name ${this.stackName}`,
      description: '检测配置漂移的命令'
    });

    // 生产健康检查
    this.addProductionHealthChecks();
  }

  private addProductionHealthChecks() {
    // 用于健康检查的自定义资源
    new cdk.CustomResource(this, 'HealthCheck', {
      serviceToken: new cdk.aws_lambda.Function(this, 'HealthCheckFunction', {
        runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        handler: 'index.handler',
        code: cdk.aws_lambda.Code.fromInline(`
          const AWS = require('aws-sdk');
          const response = require('cfn-response');

          exports.handler = async (event, context) => {
            console.log('触发健康检查:', JSON.stringify(event));
            
            try {
              // 基本健康检查
              const checks = {
                timestamp: new Date().toISOString(),
                region: process.env.AWS_REGION,
                stackName: event.StackId?.split('/')[1] || 'unknown'
              };
              
              console.log('健康检查结果:', checks);
              
              // 向CloudFormation发送成功响应
              await response.send(event, context, response.SUCCESS, checks);
            } catch (error) {
              console.error('健康检查失败:', error);
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

## 4. 备份和灾难恢复

### 4.1 自动备份策略

创建`lib/backup/backup-construct.ts`：

```typescript
import * as cdk from 'aws-cdk-lib';
import * as backup from 'aws-cdk-lib/aws-backup';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
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

    // 带加密的备份保险库
    this.backupVault = new backup.BackupVault(this, 'BackupVault', {
      backupVaultName: `${props.environment}-backup-vault`,
      encryptionKey: cdk.aws_kms.Alias.fromAliasName(this, 'BackupKey', 'alias/aws/backup'),
      removalPolicy: props.environment === 'production' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
    });

    // 备份计划
    this.backupPlan = backup.BackupPlan.dailyWeeklyMonthly5YearRetention(this, 'BackupPlan', {
      backupPlanName: `${props.environment}-backup-plan`,
      backupVault: this.backupVault,
    });

    // 关键数据的额外备份规则
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

  // 将DynamoDB表添加到备份
  public addDynamoDBTable(table: dynamodb.Table) {
    this.backupPlan.addSelection('DynamoDBBackup', {
      resources: [
        backup.BackupResource.fromDynamoDbTable(table)
      ],
      allowRestores: true,
    });
  }

  // 添加S3存储桶备份（通过生命周期策略）
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

## 5. 卓越运营

### 5.1 自动化修复

创建`lib/automation/auto-remediation.ts`：

```typescript
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';

export class AutoRemediationConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // 自动修复Lambda
    const remediationFunction = new lambda.Function(this, 'RemediationFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const AWS = require('aws-sdk');
        const cloudwatch = new AWS.CloudWatch();
        const lambda = new AWS.Lambda();

        exports.handler = async (event) => {
          console.log('收到警报:', JSON.stringify(event, null, 2));
          
          const detail = event.detail;
          const alarmName = detail.alarmName;
          const state = detail.state.value;
          
          if (state === 'ALARM') {
            try {
              if (alarmName.includes('high-error-rate')) {
                // 重启Lambda函数（清除任何缓存连接）
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
                
                console.log(\`为函数触发重启: \${functionName}\`);
              }
              
              if (alarmName.includes('high-duration')) {
                // 为高持续时间警报扩展内存
                const functionName = alarmName.split('-')[0];
                const config = await lambda.getFunctionConfiguration({
                  FunctionName: functionName
                }).promise();
                
                const newMemory = Math.min(config.MemorySize * 1.5, 3008);
                
                await lambda.updateFunctionConfiguration({
                  FunctionName: functionName,
                  MemorySize: newMemory
                }).promise();
                
                console.log(\`为\${functionName}增加内存到\${newMemory}MB\`);
              }
              
            } catch (error) {
              console.error('修复失败:', error);
              throw error;
            }
          }
          
          return { statusCode: 200, body: '修复完成' };
        };
      `),
      timeout: cdk.Duration.seconds(60),
    });

    // 警报状态更改的CloudWatch事件规则
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

    // 授予必要权限
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

## 6. 总结和最佳实践

### 6.1 生产部署检查清单

✅ **安全**
- 所有静态数据的KMS加密
- 遵循最小权限原则的IAM角色
- 具有最小必需访问权限的安全组
- 启用CloudTrail日志记录

✅ **监控和报警**
- 关键指标的CloudWatch仪表板
- 错误率、延迟和成本的警报
- 关键警报的SNS通知
- 日志聚合和分析

✅ **备份和恢复**
- 自动化备份策略
- 关键数据的跨区域备份
- 记录的灾难恢复程序
- 定期执行恢复测试

✅ **卓越运营**
- 所有资源的基础设施即代码
- 自动化部署管道
- 配置漂移检测
- 在可能的地方自动化修复

✅ **性能和成本**
- 资源的适当大小调整
- 在适当的地方预留容量
- 成本监控和警报
- 基于指标的性能优化

### 6.2 日常运营命令

```bash
# 部署到不同环境
cdk deploy --context environment=dev
cdk deploy --context environment=staging
cdk deploy --context environment=production

# 监控堆栈漂移
aws cloudformation detect-stack-drift --stack-name MyStack

# 查看监控仪表板
aws cloudwatch get-dashboard --dashboard-name prod-monitoring-dashboard

# 检查备份状态
aws backup list-backup-jobs --by-backup-vault-name prod-backup-vault

# 查看最近的警报
aws cloudwatch describe-alarms --state-value ALARM --max-records 10
```

### 6.3 故障排除指南

**高错误率**
1. 检查CloudWatch日志中的错误模式
2. 查看最近的部署
3. 检查外部依赖
4. 如需要则扩展资源

**高延迟**
1. 检查数据库连接池
2. 查看Lambda内存分配
3. 分析冷启动影响
4. 检查API Gateway缓存

**成本激增**
1. 查看CloudWatch成本指标
2. 检查失控函数
3. 查看数据传输成本
4. 验证资源适当大小调整

## 最终练习：完整的生产应用程序

部署一个完全生产就绪的应用程序，包含：

1. **多环境支持** (dev/staging/prod)
2. **全面安全** (KMS、IAM、安全组)
3. **完整监控** (仪表板、警报、日志)
4. **自动化备份** (DynamoDB、S3)
5. **CI/CD管道** (GitHub Actions)
6. **自动修复** (基本自我修复)

```bash
# 部署完整解决方案
export NOTIFICATION_EMAIL=your-email@domain.com
cdk deploy --context environment=production
```

## 恭喜！ 🎉

您已经成功完成了5天的AWS CDK之旅！您现在拥有：

1. ✅ **扎实的CDK基础** - 理解构造、堆栈和应用程序
2. ✅ **实践经验** - 使用AWS服务构建真实应用程序
3. ✅ **高级模式** - 自定义构造和跨堆栈引用
4. ✅ **测试知识** - 单元、集成和端到端测试
5. ✅ **生产技能** - 安全、监控和卓越运营

### 下一步

- **探索CDK模式** - 从AWS学习更多设计模式
- **为CDK做贡献** - 加入开源社区
- **构建您自己的构造** - 为您的组织创建可重用组件
- **高级主题** - 多区域部署、CDK管道、自定义资源

### 持续学习资源

- [AWS CDK文档](https://docs.aws.amazon.com/cdk/)
- [CDK模式](https://cdkpatterns.com/)
- [AWS CDK示例](https://github.com/aws-samples/aws-cdk-examples)
- [CDK研讨会](https://cdkworkshop.com/)

继续构建，继续学习，欢迎来到基础设施即代码革命！🚀