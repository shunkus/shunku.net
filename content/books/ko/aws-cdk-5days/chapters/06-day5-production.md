---
title: Day 5 - 프로덕션 모범 사례와 운영 우수성
order: 6
---

# Day 5 - 프로덕션 모범 사례와 운영 우수성

## 오늘의 목표

1. 프로덕션을 위한 보안 모범 사례 구현
2. 포괄적인 모니터링과 알림 설정
3. 백업 및 재해 복구 구성
4. 운영 우수성 관행 확립
5. 프로덕션 준비 배포 전략 생성

## 1. 보안 모범 사례

### 1.1 보안 기반 컨스트럭트

`lib/security/security-foundation.ts`를 생성합니다:

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

    // 데이터 암호화를 위한 KMS 키
    this.kmsKey = new kms.Key(this, 'AppKey', {
      description: `${props.applicationName} ${props.environment} 환경용 암호화 키`,
      enableKeyRotation: props.enableKeyRotation ?? true,
      removalPolicy: props.environment === 'prod' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
    });

    // KMS 키 별칭
    this.kmsKey.addAlias(`alias/${props.applicationName}-${props.environment}`);

    // 보안 로그 S3 버킷
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
          expiration: cdk.Duration.days(2555), // 7년 보관
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

    // 최소 권한 원칙을 가진 Lambda 실행 역할
    this.executionRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      roleName: `${props.applicationName}-${props.environment}-lambda-role`,
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // 세밀한 접근 권한을 가진 CloudWatch Logs 권한
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

    // X-Ray 추적 권한
    this.executionRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'xray:PutTraceSegments',
        'xray:PutTelemetryRecords'
      ],
      resources: ['*']
    }));

    // KMS 키 사용 권한
    this.kmsKey.grantDecrypt(this.executionRole);

    // 보안 정책 검증
    this.addSecurityValidation();

    // 출력값
    new cdk.CfnOutput(this, 'KMSKeyId', {
      value: this.kmsKey.keyId,
      description: '암호화용 KMS 키 ID',
    });

    new cdk.CfnOutput(this, 'SecurityBucketName', {
      value: this.securityBucket.bucketName,
      description: '보안 로그 버킷 이름',
    });
  }

  // KMS 키 접근 권한 부여
  public grantKeyAccess(grantee: iam.IGrantable, ...actions: string[]) {
    return iam.Grant.addToPrincipalOrResource({
      grantee,
      actions,
      resourceArns: [this.kmsKey.keyArn],
      resource: this.kmsKey
    });
  }

  // 보안 버킷 쓰기 접근 권한 부여
  public grantSecurityLogsWrite(grantee: iam.IGrantable) {
    return this.securityBucket.grantWrite(grantee);
  }

  // Aspects를 사용한 보안 정책 검증
  private addSecurityValidation() {
    cdk.Aspects.of(this).add({
      visit: (node: any) => {
        // S3 버킷 암호화 확인
        if (node.node && node.node.id && node.node.id.includes('Bucket') && node instanceof cdk.aws_s3.CfnBucket) {
          if (!node.bucketEncryption) {
            cdk.Annotations.of(node).addError('S3 버킷에는 암호화가 활성화되어야 합니다');
          }
        }
        
        // Lambda 함수 환경 변수 암호화 확인
        if (node instanceof cdk.aws_lambda.CfnFunction) {
          const environment = node.environment as any;
          if (!node.kmsKeyArn && environment?.Variables) {
            cdk.Annotations.of(node).addWarning('Lambda 함수는 환경 변수에 KMS 암호화를 사용해야 합니다');
          }
        }
        
        // IAM 역할 신뢰 정책 확인
        if (node instanceof cdk.aws_iam.CfnRole) {
          const trustPolicy = node.assumeRolePolicyDocument as any;
          if (trustPolicy && trustPolicy.Statement) {
            for (const statement of trustPolicy.Statement) {
              if (statement.Principal === '*' || (statement.Principal && statement.Principal.AWS === '*')) {
                cdk.Annotations.of(node).addError('IAM 역할은 모든 주체(*)가 역할을 맡는 것을 허용하지 않아야 합니다');
              }
            }
          }
        }
      }
    });
  }
}
```

### 1.2 보안 Lambda 함수

`lib/constructs/secure-lambda.ts`를 생성합니다:

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

    // 더 나은 제어를 위한 사용자 정의 로그 그룹
    this.logGroup = new logs.LogGroup(this, 'LogGroup', {
      logGroupName: `/aws/lambda/${props.functionName}`,
      retention: logs.RetentionDays.ONE_MONTH,
      encryptionKey: props.securityFoundation.kmsKey,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // 보안 모범 사례를 적용한 Lambda 함수
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
      reservedConcurrentExecutions: 10, // 비용 폭증 방지
      deadLetterQueueEnabled: true,
      retryAttempts: 2,
    });

    // 보안 정책
    this.addSecurityPolicies();
  }

  private addSecurityPolicies() {
    // 민감한 작업에 대한 접근 거부
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

    // 필요한 KMS 작업만 허용
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

  // 특정 DynamoDB 권한 부여
  public grantDynamoDBAccess(tableArn: string, actions: string[]) {
    this.function.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions,
      resources: [tableArn, `${tableArn}/index/*`]
    }));
  }

  // 특정 S3 권한 부여
  public grantS3Access(bucketArn: string, actions: string[]) {
    this.function.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions,
      resources: [bucketArn, `${bucketArn}/*`]
    }));
  }
}
```

## 2. 모니터링과 관찰 가능성

### 2.1 포괄적인 모니터링

`lib/monitoring/monitoring-construct.ts`를 생성합니다:

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

    // 알림을 위한 SNS 토픽
    this.alertTopic = new sns.Topic(this, 'AlertTopic', {
      topicName: `${props.environment}-alerts`,
      displayName: `${props.environment} 환경 알림`,
    });

    if (props.notificationEmail) {
      this.alertTopic.addSubscription(
        new subscriptions.EmailSubscription(props.notificationEmail)
      );
    }

    // CloudWatch 대시보드
    this.dashboard = new cloudwatch.Dashboard(this, 'MonitoringDashboard', {
      dashboardName: `${props.environment}-monitoring-dashboard`,
      defaultInterval: cdk.Duration.hours(1),
    });

    // 공통 위젯 추가
    this.addCommonWidgets();
  }

  private addCommonWidgets() {
    // 시스템 상태 위젯
    this.dashboard.addWidgets(
      new cloudwatch.TextWidget({
        markdown: `# ${this.node.tryGetContext('environment')} 환경 모니터링\n\n마지막 업데이트: ${new Date().toISOString()}`,
        width: 24,
        height: 2,
      })
    );
  }

  // Lambda 함수 모니터링 추가
  public addLambdaMonitoring(
    func: lambda.Function, 
    options?: {
      errorRateThreshold?: number;
      durationThreshold?: number;
    }
  ) {
    const errorRateThreshold = options?.errorRateThreshold ?? 5;
    const durationThreshold = options?.durationThreshold ?? 10000;

    // 오류율 알람
    const errorAlarm = new cloudwatch.Alarm(this, `${func.functionName}ErrorAlarm`, {
      alarmName: `${func.functionName}-high-error-rate`,
      metric: func.metricErrors({
        period: cdk.Duration.minutes(5),
        statistic: 'Sum'
      }),
      threshold: errorRateThreshold,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      alarmDescription: `${func.functionName}에서 높은 오류율이 감지되었습니다`,
    });
    
    errorAlarm.addAlarmAction(new actions.SnsAction(this.alertTopic));

    // 지속 시간 알람
    const durationAlarm = new cloudwatch.Alarm(this, `${func.functionName}DurationAlarm`, {
      alarmName: `${func.functionName}-high-duration`,
      metric: func.metricDuration({
        period: cdk.Duration.minutes(5),
        statistic: 'Average'
      }),
      threshold: durationThreshold,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      alarmDescription: `${func.functionName}에서 높은 지속 시간이 감지되었습니다`,
    });
    
    durationAlarm.addAlarmAction(new actions.SnsAction(this.alertTopic));

    // 대시보드에 Lambda 위젯 추가
    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: `${func.functionName} 메트릭`,
        left: [
          func.metricInvocations({ label: '호출 수' }),
          func.metricErrors({ label: '오류' }),
        ],
        right: [
          func.metricDuration({ label: '지속 시간' }),
        ],
        width: 12,
        height: 6,
      }),
      new cloudwatch.LogQueryWidget({
        title: `${func.functionName} 오류 로그`,
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

  // API Gateway 모니터링 추가
  public addApiGatewayMonitoring(api: apigateway.RestApi) {
    // 4XX 및 5XX 오류 알람
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

    // API Gateway 위젯 추가
    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: `${api.restApiName} API 메트릭`,
        left: [
          api.metricCount({ label: '요청 수' }),
          api.metricClientError({ label: '4XX 오류' }),
          api.metricServerError({ label: '5XX 오류' }),
        ],
        right: [
          api.metricLatency({ label: '지연 시간' }),
        ],
        width: 24,
        height: 6,
      })
    );
  }

  // DynamoDB 모니터링 추가
  public addDynamoDBMonitoring(table: dynamodb.Table) {
    // 스로틀링 알람
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

    // DynamoDB 위젯 추가
    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: `${table.tableName} DynamoDB 메트릭`,
        left: [
          table.metricConsumedReadCapacityUnits({ label: '읽기 용량' }),
          table.metricConsumedWriteCapacityUnits({ label: '쓰기 용량' }),
        ],
        right: [
          table.metricSuccessfulRequestLatency({
            operations: [dynamodb.Operation.GET_ITEM],
            label: 'GET 지연 시간'
          }),
          table.metricSuccessfulRequestLatency({
            operations: [dynamodb.Operation.PUT_ITEM],
            label: 'PUT 지연 시간'
          }),
        ],
        width: 24,
        height: 6,
      })
    );
  }

  // 사용자 정의 메트릭 모니터링 추가
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
        title: `사용자 정의 메트릭: ${metricName}`,
        left: [customMetric],
        width: 12,
        height: 6,
      })
    );
  }

  // 이메일 알림 추가
  public addEmailNotification(email: string) {
    this.alertTopic.addSubscription(new subscriptions.EmailSubscription(email));
  }
}
```

## 3. 프로덕션 준비 스택

### 3.1 프로덕션 스택

`lib/production-stack.ts`를 생성합니다:

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SecurityFoundation } from './security/security-foundation';
import { MonitoringConstruct } from './monitoring/monitoring-construct';

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
      description: `${props.applicationName} - ${props.environment}를 위한 프로덕션 준비 CDK 스택`,
      tags: {
        Environment: props.environment,
        Application: props.applicationName,
        CreatedBy: 'AWS CDK',
        CostCenter: props.environment === 'production' ? 'production' : 'development'
      }
    });

    // 보안 기반
    this.security = new SecurityFoundation(this, 'Security', {
      environment: props.environment,
      applicationName: props.applicationName,
      enableKeyRotation: props.environment === 'production',
      enableCloudTrail: props.environment === 'production'
    });

    // 포괄적인 모니터링
    this.monitoring = new MonitoringConstruct(this, 'Monitoring', {
      environment: props.environment,
      notificationEmail: props.notificationEmail
    });

    // 프로덕션별 구성
    if (props.environment === 'production') {
      this.addProductionSpecificConfigurations();
    }

    // 스택 출력값
    new cdk.CfnOutput(this, 'Environment', {
      value: props.environment,
      description: '배포 환경'
    });

    new cdk.CfnOutput(this, 'MonitoringDashboard', {
      value: `https://console.aws.amazon.com/cloudwatch/home?region=${this.region}#dashboards:name=${this.monitoring.dashboard.dashboardName}`,
      description: 'CloudWatch 모니터링 대시보드 URL'
    });
  }

  private addProductionSpecificConfigurations() {
    // 프로덕션 스택 보호
    this.templateOptions.metadata = {
      'AWS::CloudFormation::Interface': {
        ParameterGroups: [
          {
            Label: { default: '프로덕션 구성' },
            Parameters: []
          }
        ]
      }
    };

    // 스택 종료 보호
    const cfnStack = this.node.defaultChild as cdk.CfnStack;
    cfnStack.addPropertyOverride('EnableTerminationProtection', true);

    // 프로덕션 리소스 태그
    cdk.Tags.of(this).add('BackupRequired', 'true');
    cdk.Tags.of(this).add('ComplianceLevel', 'high');
    cdk.Tags.of(this).add('DataClassification', 'confidential');

    // CloudFormation 드리프트 감지
    new cdk.CfnOutput(this, 'DriftDetectionCommand', {
      value: `aws cloudformation detect-stack-drift --stack-name ${this.stackName}`,
      description: '구성 드리프트 감지 명령어'
    });

    // 프로덕션 상태 검사
    this.addProductionHealthChecks();
  }

  private addProductionHealthChecks() {
    // 상태 검사를 위한 사용자 정의 리소스
    new cdk.CustomResource(this, 'HealthCheck', {
      serviceToken: new cdk.aws_lambda.Function(this, 'HealthCheckFunction', {
        runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        handler: 'index.handler',
        code: cdk.aws_lambda.Code.fromInline(`
          const AWS = require('aws-sdk');
          const response = require('cfn-response');

          exports.handler = async (event, context) => {
            console.log('상태 검사 트리거됨:', JSON.stringify(event));
            
            try {
              // 기본 상태 검사
              const checks = {
                timestamp: new Date().toISOString(),
                region: process.env.AWS_REGION,
                stackName: event.StackId?.split('/')[1] || 'unknown'
              };
              
              console.log('상태 검사 결과:', checks);
              
              // CloudFormation에 성공 응답 전송
              await response.send(event, context, response.SUCCESS, checks);
            } catch (error) {
              console.error('상태 검사 실패:', error);
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

### 3.2 다중 환경 앱

앱 진입점 `bin/my-first-cdk-app.ts`를 업데이트합니다:

```typescript
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MyFirstCdkAppStack } from '../lib/my-first-cdk-app-stack';
import { ProductionStack } from '../lib/production-stack';

const app = new cdk.App();

// 환경 구성
const environment = app.node.tryGetContext('environment') || 'development';
const applicationName = 'my-cdk-app';

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
};

// 개발 스택 (포괄적인 학습 스택)
if (environment === 'development') {
  new MyFirstCdkAppStack(app, 'MyFirstCdkAppStack', {
    env,
    description: '모든 CDK 튜토리얼 실습이 포함된 개발 스택',
    tags: {
      Environment: 'development',
      Application: applicationName,
      Purpose: 'learning'
    }
  });
}

// 스테이징 환경
if (environment === 'staging') {
  new ProductionStack(app, `${applicationName}-staging`, {
    env,
    environment: 'staging',
    applicationName,
    notificationEmail: process.env.NOTIFICATION_EMAIL,
    description: 'CDK 튜토리얼 애플리케이션의 스테이징 환경',
    tags: {
      Environment: 'staging',
      Application: applicationName,
      CostCenter: 'development'
    }
  });
}

// 프로덕션 환경
if (environment === 'production') {
  new ProductionStack(app, `${applicationName}-production`, {
    env,
    environment: 'production',
    applicationName,
    notificationEmail: process.env.NOTIFICATION_EMAIL,
    description: 'CDK 튜토리얼 애플리케이션의 프로덕션 환경',
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

## 4. 백업 및 재해 복구

### 4.1 자동화된 백업 전략

`lib/backup/backup-construct.ts`를 생성합니다:

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

    // 암호화가 적용된 백업 볼트
    this.backupVault = new backup.BackupVault(this, 'BackupVault', {
      backupVaultName: `${props.environment}-backup-vault`,
      encryptionKey: cdk.aws_kms.Alias.fromAliasName(this, 'BackupKey', 'alias/aws/backup'),
      removalPolicy: props.environment === 'production' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
    });

    // 백업 계획
    this.backupPlan = backup.BackupPlan.dailyWeeklyMonthly5YearRetention(this, 'BackupPlan', {
      backupPlanName: `${props.environment}-backup-plan`,
      backupVault: this.backupVault,
    });

    // 중요한 데이터를 위한 추가 백업 규칙
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

  // DynamoDB 테이블을 백업에 추가
  public addDynamoDBTable(table: dynamodb.Table) {
    this.backupPlan.addSelection('DynamoDBBackup', {
      resources: [
        backup.BackupResource.fromDynamoDbTable(table)
      ],
      allowRestores: true,
    });
  }

  // S3 버킷을 백업에 추가 (라이프사이클 정책을 통해)
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

## 5. 운영 우수성

### 5.1 운영 대시보드

모니터링 컨스트럭트에 포괄적인 운영 대시보드를 추가합니다:

```typescript
// 모니터링 컨스트럭트에 추가
public createOperationalDashboard() {
  const operationalDashboard = new cloudwatch.Dashboard(this, 'OperationalDashboard', {
    dashboardName: `${this.environment}-operational-dashboard`,
    defaultInterval: cdk.Duration.hours(24),
  });

  // 비용 추적 위젯
  operationalDashboard.addWidgets(
    new cloudwatch.LogQueryWidget({
      title: '비용 분석',
      logGroups: [],
      queryLines: [
        'fields @timestamp, @message',
        'filter @message like /BILLING/',
        'stats count() by bin(5m)'
      ],
      width: 12,
      height: 6,
    }),
    
    // 성능 요약
    new cloudwatch.GraphWidget({
      title: '성능 요약',
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

    // 모든 서비스의 오류 요약
    new cloudwatch.GraphWidget({
      title: '오류 요약',
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

### 5.2 자동화된 복구

`lib/automation/auto-remediation.ts`를 생성합니다:

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

    // 자동 복구 Lambda
    const remediationFunction = new lambda.Function(this, 'RemediationFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const AWS = require('aws-sdk');
        const cloudwatch = new AWS.CloudWatch();
        const lambda = new AWS.Lambda();

        exports.handler = async (event) => {
          console.log('알람 수신:', JSON.stringify(event, null, 2));
          
          const detail = event.detail;
          const alarmName = detail.alarmName;
          const state = detail.state.value;
          
          if (state === 'ALARM') {
            try {
              if (alarmName.includes('high-error-rate')) {
                // Lambda 함수 재시작 (캐시된 연결 정리)
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
                
                console.log(\`함수 재시작 트리거됨: \${functionName}\`);
              }
              
              if (alarmName.includes('high-duration')) {
                // 높은 지속 시간 알람에 대해 메모리 스케일업
                const functionName = alarmName.split('-')[0];
                const config = await lambda.getFunctionConfiguration({
                  FunctionName: functionName
                }).promise();
                
                const newMemory = Math.min(config.MemorySize * 1.5, 3008);
                
                await lambda.updateFunctionConfiguration({
                  FunctionName: functionName,
                  MemorySize: newMemory
                }).promise();
                
                console.log(\`\${functionName}의 메모리를 \${newMemory}MB로 증가시킴\`);
              }
              
            } catch (error) {
              console.error('복구 실패:', error);
              throw error;
            }
          }
          
          return { statusCode: 200, body: '복구 완료' };
        };
      `),
      timeout: cdk.Duration.seconds(60),
    });

    // 알람 상태 변경에 대한 CloudWatch Events 규칙
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

    // 필요한 권한 부여
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

## 6. 요약 및 모범 사례

### 6.1 프로덕션 배포 체크리스트

✅ **보안**
- 저장 데이터의 KMS 암호화
- 최소 권한 원칙의 IAM 역할
- 최소한의 필요 접근만 허용하는 보안 그룹
- CloudTrail 로깅 활성화

✅ **모니터링 및 알림**
- 핵심 메트릭을 위한 CloudWatch 대시보드
- 오류율, 지연 시간, 비용에 대한 알람
- 중요한 알림을 위한 SNS 알림
- 로그 집계 및 분석

✅ **백업 및 복구**
- 자동화된 백업 전략
- 중요한 데이터의 교차 리전 백업
- 문서화된 재해 복구 절차
- 정기적으로 수행되는 복구 테스트

✅ **운영 우수성**
- 모든 리소스에 대한 Infrastructure as Code
- 자동화된 배포 파이프라인
- 구성 드리프트 감지
- 가능한 곳의 자동화된 복구

✅ **성능 및 비용**
- 리소스의 적절한 크기 조정
- 적절한 곳의 예약 용량
- 비용 모니터링 및 알림
- 메트릭 기반 성능 최적화

### 6.2 일일 운영 명령어

```bash
# 다른 환경에 배포
cdk deploy --context environment=dev
cdk deploy --context environment=staging
cdk deploy --context environment=production

# 스택 드리프트 모니터링
aws cloudformation detect-stack-drift --stack-name MyStack

# 모니터링 대시보드 보기
aws cloudwatch get-dashboard --dashboard-name prod-monitoring-dashboard

# 백업 상태 확인
aws backup list-backup-jobs --by-backup-vault-name prod-backup-vault

# 최근 알람 보기
aws cloudwatch describe-alarms --state-value ALARM --max-records 10
```

### 6.3 문제 해결 가이드

**높은 오류율**
1. 오류 패턴에 대한 CloudWatch Logs 확인
2. 최근 배포 검토
3. 외부 종속성 확인
4. 필요시 리소스 확장

**높은 지연 시간**
1. 데이터베이스 연결 풀링 확인
2. Lambda 메모리 할당 검토
3. 콜드 스타트 영향 분석
4. API Gateway 캐싱 확인

**비용 급증**
1. CloudWatch 비용 메트릭 검토
2. 폭주하는 함수 확인
3. 데이터 전송 비용 검토
4. 리소스 적정 크기 검증

## 최종 실습: 완전한 프로덕션 애플리케이션

다음을 포함한 완전히 프로덕션 준비된 애플리케이션을 배포합니다:

1. **다중 환경 지원** (dev/staging/prod)
2. **포괄적인 보안** (KMS, IAM, 보안 그룹)
3. **완전한 모니터링** (대시보드, 알람, 로그)
4. **자동화된 백업** (DynamoDB, S3)
5. **CI/CD 파이프라인** (GitHub Actions)
6. **자동 복구** (기본 자가 치료)

```bash
# 완전한 솔루션 배포
export NOTIFICATION_EMAIL=your-email@domain.com
cdk deploy --context environment=production
```

## 축하합니다! 🎉

5일간의 AWS CDK 여정을 성공적으로 완료하셨습니다! 이제 다음을 갖추게 되었습니다:

1. ✅ **견고한 CDK 기반** - 컨스트럭트, 스택, 앱의 이해
2. ✅ **실용적인 경험** - AWS 서비스로 실제 애플리케이션 구축
3. ✅ **고급 패턴** - 사용자 정의 컨스트럭트 및 스택 간 참조
4. ✅ **테스팅 지식** - 단위, 통합, 종단간 테스트
5. ✅ **프로덕션 기술** - 보안, 모니터링, 운영 우수성

### 다음 단계

- **CDK 패턴 탐색** - AWS의 더 많은 디자인 패턴 학습
- **CDK 기여** - 오픈 소스 커뮤니티 참여
- **자체 컨스트럭트 구축** - 조직을 위한 재사용 가능한 컴포넌트 생성
- **고급 주제** - 다중 리전 배포, CDK Pipelines, 사용자 정의 리소스

### 지속적인 학습을 위한 리소스

- [AWS CDK 문서](https://docs.aws.amazon.com/cdk/)
- [CDK 패턴](https://cdkpatterns.com/)
- [AWS CDK 예제](https://github.com/aws-samples/aws-cdk-examples)
- [CDK 워크샵](https://cdkworkshop.com/)

계속 구축하고, 계속 학습하며, Infrastructure as Code 혁명에 오신 것을 환영합니다! 🚀