---
title: 5日目 - ベストプラクティスと本番運用
order: 6
---

# 5日目 - ベストプラクティスと本番運用

## 今日の目標

1. セキュリティベストプラクティスの実装
2. 監視・ログ・アラートの設定
3. 本番運用のための準備
4. トラブルシューティングとメンテナンス手法

## 1. セキュリティベストプラクティス

### 1.1 IAMセキュリティの強化

`lib/security/iam-security.ts`を作成：

```typescript
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';

export class SecurityFoundation extends Construct {
  public readonly kmsKey: kms.Key;
  public readonly executionRole: iam.Role;

  constructor(scope: Construct, id: string, props: {
    environment: string;
    applicationName: string;
  }) {
    super(scope, id);

    // KMS キーの作成（データ暗号化用）
    this.kmsKey = new kms.Key(this, 'AppKey', {
      description: `${props.applicationName} encryption key for ${props.environment}`,
      enableKeyRotation: true, // 年次ローテーション
      removalPolicy: props.environment === 'prod' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
    });

    // KMS キーのエイリアス
    this.kmsKey.addAlias(`alias/${props.applicationName}-${props.environment}`);

    // Lambda実行ロール（最小権限の原則）
    this.executionRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      roleName: `${props.applicationName}-${props.environment}-lambda-role`,
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // CloudWatchログへの書き込み権限（詳細制御）
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

    // X-Ray トレーシング権限
    this.executionRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'xray:PutTraceSegments',
        'xray:PutTelemetryRecords'
      ],
      resources: ['*']
    }));

    // セキュリティグループのルール最適化
    this.addSecurityPolicyValidation();
  }

  // セキュリティポリシーの検証
  private addSecurityPolicyValidation() {
    // cdk-nagによるセキュリティルール適用
    cdk.Aspects.of(this).add({
      visit: (node: any) => {
        // S3バケットの暗号化チェック
        if (node instanceof cdk.aws_s3.CfnBucket) {
          if (!node.bucketEncryption) {
            cdk.Annotations.of(node).addError('S3 bucket must have encryption enabled');
          }
        }
        
        // RDSインスタンスの暗号化チェック
        if (node instanceof cdk.aws_rds.CfnDBInstance) {
          if (!node.storageEncrypted) {
            cdk.Annotations.of(node).addError('RDS instance must have storage encryption enabled');
          }
        }
      }
    });
  }

  // DynamoDBテーブルへの安全なアクセス権限付与
  public grantDynamoDbAccess(table: cdk.aws_dynamodb.Table, actions?: string[]) {
    const defaultActions = [
      'dynamodb:GetItem',
      'dynamodb:PutItem', 
      'dynamodb:UpdateItem',
      'dynamodb:DeleteItem',
      'dynamodb:Query',
      'dynamodb:Scan'
    ];

    this.executionRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: actions || defaultActions,
      resources: [
        table.tableArn,
        `${table.tableArn}/index/*` // GSI へのアクセス
      ]
    }));
  }
}
```

### 1.2 ネットワークセキュリティ

`lib/security/network-security.ts`を作成：

```typescript
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import { Construct } from 'constructs';

export class NetworkSecurity extends Construct {
  public readonly vpc: ec2.Vpc;
  public readonly webAcl: wafv2.CfnWebACL;

  constructor(scope: Construct, id: string, props: {
    environment: string;
  }) {
    super(scope, id);

    // VPC設定（本番環境のみ）
    if (props.environment === 'prod') {
      this.vpc = new ec2.Vpc(this, 'SecureVpc', {
        maxAzs: 3,
        natGateways: 3, // 高可用性のため
        subnetConfiguration: [
          {
            cidrMask: 24,
            name: 'public',
            subnetType: ec2.SubnetType.PUBLIC,
          },
          {
            cidrMask: 24,
            name: 'private',
            subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          },
          {
            cidrMask: 28,
            name: 'isolated',
            subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          }
        ],
        gatewayEndpoints: {
          S3: {
            service: ec2.GatewayVpcEndpointAwsService.S3,
          },
          DynamoDB: {
            service: ec2.GatewayVpcEndpointAwsService.DYNAMODB,
          },
        },
      });

      // VPCフローログの有効化
      new ec2.FlowLog(this, 'VpcFlowLog', {
        resourceType: ec2.FlowLogResourceType.fromVpc(this.vpc),
        trafficType: ec2.FlowLogTrafficType.ALL,
      });
    }

    // WAF v2 設定
    this.webAcl = new wafv2.CfnWebACL(this, 'WebAcl', {
      scope: 'CLOUDFRONT',
      defaultAction: { allow: {} },
      name: `${props.environment}-web-acl`,
      rules: [
        // AWS Managed Rules - Common Rule Set
        {
          name: 'AWS-AWSManagedRulesCommonRuleSet',
          priority: 1,
          overrideAction: { none: {} },
          statement: {
            managedRuleGroupStatement: {
              vendorName: 'AWS',
              name: 'AWSManagedRulesCommonRuleSet'
            }
          },
          visibilityConfig: {
            sampledRequestsEnabled: true,
            cloudWatchMetricsEnabled: true,
            metricName: 'CommonRuleSetMetric'
          }
        },
        // Rate Limiting
        {
          name: 'RateLimitRule',
          priority: 2,
          action: { block: {} },
          statement: {
            rateBasedStatement: {
              limit: 10000, // 5分間で10,000リクエスト
              aggregateKeyType: 'IP'
            }
          },
          visibilityConfig: {
            sampledRequestsEnabled: true,
            cloudWatchMetricsEnabled: true,
            metricName: 'RateLimitMetric'
          }
        },
        // 地理的制限（必要に応じて）
        {
          name: 'GeoBlockingRule',
          priority: 3,
          action: { block: {} },
          statement: {
            geoMatchStatement: {
              countryCodes: ['CN', 'RU'] // 必要に応じて調整
            }
          },
          visibilityConfig: {
            sampledRequestsEnabled: true,
            cloudWatchMetricsEnabled: true,
            metricName: 'GeoBlockingMetric'
          }
        }
      ],
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: 'WebAclMetric'
      }
    });
  }
}
```

## 2. 監視とアラート

### 2.1 包括的な監視システム

`lib/monitoring/observability.ts`を作成：

```typescript
import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import { Construct } from 'constructs';

export interface ObservabilityProps {
  environment: string;
  applicationName: string;
  alertEmail: string;
  functions: lambda.Function[];
  apiGateway?: cdk.aws_apigateway.RestApi;
  dynamoTables?: cdk.aws_dynamodb.Table[];
}

export class Observability extends Construct {
  public readonly dashboard: cloudwatch.Dashboard;
  public readonly alertTopic: sns.Topic;

  constructor(scope: Construct, id: string, props: ObservabilityProps) {
    super(scope, id);

    const { environment, applicationName, alertEmail, functions } = props;

    // SNS トピック（アラート通知用）
    this.alertTopic = new sns.Topic(this, 'AlertTopic', {
      displayName: `${applicationName}-${environment}-alerts`,
    });

    // Eメール通知の設定
    this.alertTopic.addSubscription(
      new subscriptions.EmailSubscription(alertEmail)
    );

    // Slackへの通知（オプション）
    if (process.env.SLACK_WEBHOOK_URL) {
      this.setupSlackNotifications();
    }

    // CloudWatch ダッシュボード
    this.dashboard = new cloudwatch.Dashboard(this, 'Dashboard', {
      dashboardName: `${applicationName}-${environment}`,
    });

    // Lambda関数の監視
    this.setupLambdaMonitoring(functions);

    // API Gateway の監視
    if (props.apiGateway) {
      this.setupApiGatewayMonitoring(props.apiGateway);
    }

    // DynamoDB の監視
    if (props.dynamoTables) {
      this.setupDynamoDbMonitoring(props.dynamoTables);
    }

    // カスタムメトリクス
    this.setupCustomMetrics();

    // コスト監視
    this.setupCostMonitoring();
  }

  private setupLambdaMonitoring(functions: lambda.Function[]) {
    functions.forEach((func, index) => {
      // エラーレートアラーム
      const errorAlarm = new cloudwatch.Alarm(this, `LambdaErrorAlarm${index}`, {
        metric: func.metricErrors({
          period: cdk.Duration.minutes(5),
          statistic: 'Sum',
        }),
        threshold: 5,
        evaluationPeriods: 2,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
        alarmDescription: `High error rate for ${func.functionName}`,
      });
      
      errorAlarm.addAlarmAction(new actions.SnsAction(this.alertTopic));

      // 実行時間アラーム
      const durationAlarm = new cloudwatch.Alarm(this, `LambdaDurationAlarm${index}`, {
        metric: func.metricDuration({
          period: cdk.Duration.minutes(5),
          statistic: 'Average',
        }),
        threshold: func.timeout?.toMilliseconds() || 30000 * 0.8, // タイムアウトの80%
        evaluationPeriods: 3,
        alarmDescription: `High duration for ${func.functionName}`,
      });
      
      durationAlarm.addAlarmAction(new actions.SnsAction(this.alertTopic));

      // スロットルアラーム
      const throttleAlarm = new cloudwatch.Alarm(this, `LambdaThrottleAlarm${index}`, {
        metric: func.metricThrottles({
          period: cdk.Duration.minutes(5),
          statistic: 'Sum',
        }),
        threshold: 1,
        evaluationPeriods: 2,
        alarmDescription: `Throttling detected for ${func.functionName}`,
      });
      
      throttleAlarm.addAlarmAction(new actions.SnsAction(this.alertTopic));

      // ダッシュボードにウィジェット追加
      this.dashboard.addWidgets(
        new cloudwatch.Row({
          left: [
            new cloudwatch.GraphWidget({
              title: `${func.functionName} - Invocations & Errors`,
              left: [func.metricInvocations()],
              right: [func.metricErrors()],
              width: 12,
            })
          ],
          right: [
            new cloudwatch.GraphWidget({
              title: `${func.functionName} - Duration & Throttles`,
              left: [func.metricDuration()],
              right: [func.metricThrottles()],
              width: 12,
            })
          ]
        })
      );
    });
  }

  private setupApiGatewayMonitoring(api: cdk.aws_apigateway.RestApi) {
    // 4xxエラーアラーム
    const clientErrorAlarm = new cloudwatch.Alarm(this, 'ApiGateway4xxAlarm', {
      metric: api.metricClientError({
        period: cdk.Duration.minutes(5),
        statistic: 'Sum',
      }),
      threshold: 10,
      evaluationPeriods: 2,
      alarmDescription: 'High 4xx error rate on API Gateway',
    });
    
    clientErrorAlarm.addAlarmAction(new actions.SnsAction(this.alertTopic));

    // 5xxエラーアラーム
    const serverErrorAlarm = new cloudwatch.Alarm(this, 'ApiGateway5xxAlarm', {
      metric: api.metricServerError({
        period: cdk.Duration.minutes(5),
        statistic: 'Sum',
      }),
      threshold: 1,
      evaluationPeriods: 1,
      alarmDescription: 'Server errors detected on API Gateway',
    });
    
    serverErrorAlarm.addAlarmAction(new actions.SnsAction(this.alertTopic));

    // レイテンシアラーム
    const latencyAlarm = new cloudwatch.Alarm(this, 'ApiGatewayLatencyAlarm', {
      metric: api.metricLatency({
        period: cdk.Duration.minutes(5),
        statistic: 'Average',
      }),
      threshold: 5000, // 5秒
      evaluationPeriods: 3,
      alarmDescription: 'High latency on API Gateway',
    });
    
    latencyAlarm.addAlarmAction(new actions.SnsAction(this.alertTopic));

    // APIダッシュボードウィジェット
    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'API Gateway Metrics',
        left: [api.metricCount(), api.metricClientError(), api.metricServerError()],
        right: [api.metricLatency()],
        width: 24,
      })
    );
  }

  private setupDynamoDbMonitoring(tables: cdk.aws_dynamodb.Table[]) {
    tables.forEach((table, index) => {
      // スロットルアラーム
      const readThrottleAlarm = new cloudwatch.Alarm(this, `DynamoReadThrottleAlarm${index}`, {
        metric: table.metricUserErrors({
          period: cdk.Duration.minutes(5),
          statistic: 'Sum',
        }),
        threshold: 1,
        evaluationPeriods: 2,
        alarmDescription: `Read throttling on ${table.tableName}`,
      });
      
      readThrottleAlarm.addAlarmAction(new actions.SnsAction(this.alertTopic));

      // 消費容量アラーム
      const consumedReadAlarm = new cloudwatch.Alarm(this, `DynamoConsumedReadAlarm${index}`, {
        metric: table.metricConsumedReadCapacityUnits({
          period: cdk.Duration.minutes(5),
          statistic: 'Average',
        }),
        threshold: 80, // プロビジョンド容量の80%
        evaluationPeriods: 3,
        alarmDescription: `High read capacity consumption on ${table.tableName}`,
      });
      
      consumedReadAlarm.addAlarmAction(new actions.SnsAction(this.alertTopic));

      // ダッシュボードウィジェット
      this.dashboard.addWidgets(
        new cloudwatch.GraphWidget({
          title: `DynamoDB - ${table.tableName}`,
          left: [table.metricConsumedReadCapacityUnits(), table.metricConsumedWriteCapacityUnits()],
          right: [table.metricSuccessfulRequestLatency()],
          width: 24,
        })
      );
    });
  }

  private setupCustomMetrics() {
    // ビジネスメトリクスの例
    const customMetric = new cloudwatch.Metric({
      namespace: 'TodoApp/Business',
      metricName: 'TodosCreated',
      statistic: 'Sum',
    });

    const businessAlarm = new cloudwatch.Alarm(this, 'LowActivityAlarm', {
      metric: customMetric,
      threshold: 1,
      evaluationPeriods: 12, // 1時間（5分 × 12）
      comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.BREACHING,
      alarmDescription: 'Low user activity detected',
    });

    businessAlarm.addAlarmAction(new actions.SnsAction(this.alertTopic));

    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'Business Metrics',
        left: [customMetric],
        width: 24,
      })
    );
  }

  private setupCostMonitoring() {
    // 予算アラート（Budgets API使用）
    // 注意: これは実際には Budgets サービスで設定する必要があります
    
    // CloudWatch でのコスト監視（概算）
    const estimatedCostMetric = new cloudwatch.Metric({
      namespace: 'AWS/Billing',
      metricName: 'EstimatedCharges',
      dimensionsMap: {
        Currency: 'USD',
        ServiceName: 'AmazonDynamoDB'
      },
      statistic: 'Maximum',
    });

    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'Estimated Costs',
        left: [estimatedCostMetric],
        width: 24,
      })
    );
  }

  private setupSlackNotifications() {
    // Slack通知用Lambda関数
    const slackNotifier = new lambda.Function(this, 'SlackNotifier', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromInline(`
const https = require('https');
const url = require('url');

exports.handler = async (event) => {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  const message = JSON.parse(event.Records[0].Sns.Message);
  
  const slackMessage = {
    text: \`🚨 \${message.AlarmName}\`,
    attachments: [{
      color: 'danger',
      fields: [
        { title: 'Alarm', value: message.AlarmName, short: true },
        { title: 'Status', value: message.NewStateValue, short: true },
        { title: 'Reason', value: message.NewStateReason, short: false }
      ]
    }]
  };
  
  const options = url.parse(webhookUrl);
  options.method = 'POST';
  options.headers = {
    'Content-Type': 'application/json',
  };
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      resolve({ statusCode: res.statusCode });
    });
    
    req.on('error', (e) => {
      reject(e);
    });
    
    req.write(JSON.stringify(slackMessage));
    req.end();
  });
};
      `),
      handler: 'index.handler',
      environment: {
        SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL!,
      },
    });

    this.alertTopic.addSubscription(
      new subscriptions.LambdaSubscription(slackNotifier)
    );
  }
}
```

## 3. ログ管理

### 3.1 構造化ログとログ集約

`lib/logging/log-management.ts`を作成：

```typescript
import * as cdk from 'aws-cdk-lib';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export class LogManagement extends Construct {
  public readonly logGroup: logs.LogGroup;

  constructor(scope: Construct, id: string, props: {
    environment: string;
    applicationName: string;
    functions: lambda.Function[];
  }) {
    super(scope, id);

    const { environment, applicationName, functions } = props;

    // 集約ロググループ
    this.logGroup = new logs.LogGroup(this, 'AppLogGroup', {
      logGroupName: `/aws/lambda/${applicationName}-${environment}`,
      retention: environment === 'prod' 
        ? logs.RetentionDays.ONE_MONTH 
        : logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda関数のログ設定
    functions.forEach(func => {
      // 個別のロググループを作成
      new logs.LogGroup(this, `${func.node.id}LogGroup`, {
        logGroupName: `/aws/lambda/${func.functionName}`,
        retention: environment === 'prod' 
          ? logs.RetentionDays.ONE_MONTH 
          : logs.RetentionDays.ONE_WEEK,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      });
    });

    // ログインサイト用クエリ
    this.createLogInsights();

    // エラーログフィルタ
    this.setupErrorLogFilters();
  }

  private createLogInsights() {
    // エラーログクエリ
    new logs.QueryDefinition(this, 'ErrorLogQuery', {
      queryDefinitionName: 'TodoApp-Errors',
      queryString: `
fields @timestamp, @message, @requestId
| filter @type = "ERROR"
| sort @timestamp desc
| limit 100
      `,
      logGroups: [this.logGroup],
    });

    // パフォーマンスクエリ
    new logs.QueryDefinition(this, 'PerformanceQuery', {
      queryDefinitionName: 'TodoApp-Performance',
      queryString: `
fields @timestamp, @duration, @billedDuration, @maxMemoryUsed
| filter @type = "REPORT"
| stats avg(@duration) as avgDuration, max(@duration) as maxDuration, min(@duration) as minDuration by bin(5m)
      `,
      logGroups: [this.logGroup],
    });
  }

  private setupErrorLogFilters() {
    // エラーメトリクスフィルタ
    new logs.MetricFilter(this, 'ErrorMetricFilter', {
      logGroup: this.logGroup,
      metricNamespace: 'TodoApp/Logs',
      metricName: 'ErrorCount',
      filterPattern: logs.FilterPattern.anyTerm('ERROR', 'Error', 'error'),
      metricValue: '1',
    });

    // 警告メトリクスフィルタ
    new logs.MetricFilter(this, 'WarnMetricFilter', {
      logGroup: this.logGroup,
      metricNamespace: 'TodoApp/Logs',
      metricName: 'WarnCount',
      filterPattern: logs.FilterPattern.anyTerm('WARN', 'Warning', 'warning'),
      metricValue: '1',
    });
  }
}
```

## 4. 災害復旧とバックアップ

### 4.1 バックアップ戦略

`lib/backup/backup-strategy.ts`を作成：

```typescript
import * as cdk from 'aws-cdk-lib';
import * as backup from 'aws-cdk-lib/aws-backup';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class BackupStrategy extends Construct {
  constructor(scope: Construct, id: string, props: {
    environment: string;
    tables: dynamodb.Table[];
    buckets: s3.Bucket[];
  }) {
    super(scope, id);

    const { environment, tables, buckets } = props;

    // Backup Vault
    const backupVault = new backup.BackupVault(this, 'BackupVault', {
      backupVaultName: `${environment}-backup-vault`,
      encryptionKey: new cdk.aws_kms.Key(this, 'BackupKey', {
        description: 'Backup encryption key',
        enableKeyRotation: true,
      }),
      removalPolicy: environment === 'prod' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
    });

    // Backup Role
    const backupRole = new iam.Role(this, 'BackupRole', {
      assumedBy: new iam.ServicePrincipal('backup.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSBackupServiceRolePolicyForBackup'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSBackupServiceRolePolicyForRestores'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSBackupServiceRolePolicyForS3Backup'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSBackupServiceRolePolicyForS3Restore'),
      ],
    });

    // Backup Plan
    const backupPlan = backup.BackupPlan.daily35DayRetention(this, 'BackupPlan', backupVault);

    if (environment === 'prod') {
      // 本番環境では追加で週次・月次バックアップ
      backupPlan.addRule(backup.BackupPlanRule.weekly5YearRetention());
      backupPlan.addRule(backup.BackupPlanRule.monthly7YearRetention());
    }

    // DynamoDBテーブルをバックアップに追加
    tables.forEach((table, index) => {
      backupPlan.addSelection(`DynamoSelection${index}`, {
        resources: [backup.BackupResource.fromDynamoDbTable(table)],
        role: backupRole,
        allowRestores: true,
      });

      // Point-in-Time Recovery (本番環境のみ)
      if (environment === 'prod') {
        // Note: この設定はTable作成時に行う必要があります
      }
    });

    // S3バケットのバージョニングとクロスリージョンレプリケーション（本番環境のみ）
    if (environment === 'prod') {
      this.setupS3Replication(buckets);
    }
  }

  private setupS3Replication(buckets: s3.Bucket[]) {
    // クロスリージョンレプリケーションのためのロール
    const replicationRole = new iam.Role(this, 'S3ReplicationRole', {
      assumedBy: new iam.ServicePrincipal('s3.amazonaws.com'),
    });

    buckets.forEach((bucket, index) => {
      // レプリケーション先バケット（異なるリージョン）
      const replicationBucket = new s3.Bucket(this, `ReplicationBucket${index}`, {
        bucketName: `${bucket.bucketName}-replica`,
        versioned: true,
        encryption: s3.BucketEncryption.S3_MANAGED,
      });

      // レプリケーション設定
      replicationRole.addToPolicy(new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['s3:GetObjectVersionForReplication', 's3:GetObjectVersionAcl'],
        resources: [`${bucket.bucketArn}/*`],
      }));

      replicationRole.addToPolicy(new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['s3:ReplicateObject', 's3:ReplicateDelete'],
        resources: [`${replicationBucket.bucketArn}/*`],
      }));
    });
  }
}
```

## 5. パフォーマンス最適化

### 5.1 Lambda最適化

```typescript
export class LambdaOptimization {
  static optimizeFunction(func: lambda.Function, environment: string) {
    // 本番環境でのProvisionedConcurrency
    if (environment === 'prod') {
      const alias = func.currentVersion.addAlias('live');
      new lambda.ProvisionedConcurrencyConfiguration(func, 'ProvisionedConcurrency', {
        function: func,
        qualifier: alias.aliasName,
        provisionedConcurrentExecutions: 10,
      });
    }

    // Lambda Layer（共通ライブラリ）
    const commonLayer = new lambda.LayerVersion(func, 'CommonLayer', {
      code: lambda.Code.fromAsset('layers/common'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
      description: 'Common utilities and libraries',
    });

    // X-Ray トレーシング
    func.addEnvironment('_X_AMZN_TRACE_ID', '');
    
    return { alias, layer: commonLayer };
  }
}
```

### 5.2 DynamoDB最適化

```typescript
export class DynamoDbOptimization {
  static optimizeTable(table: dynamodb.Table, environment: string) {
    // Auto Scaling設定
    if (environment === 'prod') {
      table.autoScaleReadCapacity({
        minCapacity: 5,
        maxCapacity: 100,
      }).scaleOnUtilization({
        targetUtilizationPercent: 70,
      });

      table.autoScaleWriteCapacity({
        minCapacity: 5,
        maxCapacity: 100,
      }).scaleOnUtilization({
        targetUtilizationPercent: 70,
      });
    }

    // DAX クラスター（キャッシュ）
    if (environment === 'prod') {
      new cdk.aws_dax.CfnCluster(table, 'DaxCluster', {
        iamRoleArn: 'arn:aws:iam::account:role/DAXServiceRole',
        nodeType: 'dax.t3.small',
        replicationFactor: 3,
        clusterName: `${table.tableName}-cache`,
      });
    }
  }
}
```

## 6. 本番デプロイメント

### 6.1 最終的な本番用Stack

`lib/production-stack.ts`を作成：

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApplicationStack } from './application-stack';
import { SecurityFoundation } from './security/iam-security';
import { NetworkSecurity } from './security/network-security';
import { Observability } from './monitoring/observability';
import { LogManagement } from './logging/log-management';
import { BackupStrategy } from './backup/backup-strategy';

export class ProductionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // セキュリティ基盤
    const security = new SecurityFoundation(this, 'Security', {
      environment: 'prod',
      applicationName: 'todo-app',
    });

    // ネットワークセキュリティ
    const networkSecurity = new NetworkSecurity(this, 'NetworkSecurity', {
      environment: 'prod',
    });

    // メインアプリケーション
    const app = new ApplicationStack(this, 'Application', {
      environment: 'prod',
    });

    // 監視・アラート
    const observability = new Observability(this, 'Observability', {
      environment: 'prod',
      applicationName: 'todo-app',
      alertEmail: 'alerts@example.com',
      functions: [], // アプリケーションのLambda関数を渡す
    });

    // ログ管理
    const logManagement = new LogManagement(this, 'LogManagement', {
      environment: 'prod',
      applicationName: 'todo-app',
      functions: [], // アプリケーションのLambda関数を渡す
    });

    // バックアップ戦略
    const backup = new BackupStrategy(this, 'Backup', {
      environment: 'prod',
      tables: [], // DynamoDBテーブルを渡す
      buckets: [], // S3バケットを渡す
    });

    // 依存関係の設定
    app.node.addDependency(security);
    observability.node.addDependency(app);
    logManagement.node.addDependency(app);
    backup.node.addDependency(app);
  }
}
```

## 7. 運用・保守

### 7.1 デプロイメント戦略

```bash
#!/bin/bash
# deploy-prod.sh

set -e

echo "🚀 Production Deployment Started"

# 1. Pre-deployment checks
echo "📋 Running pre-deployment checks..."
npm run test
npm run lint
npm run security-scan

# 2. Create changeset
echo "📝 Creating changeset..."
cdk diff -c environment=prod > changeset.txt

# 3. Manual approval (can be automated with appropriate checks)
read -p "Continue with deployment? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# 4. Backup current state
echo "💾 Creating backup..."
aws dynamodb create-backup \
    --table-name todo-app-prod \
    --backup-name "pre-deploy-$(date +%Y%m%d-%H%M%S)"

# 5. Deploy with gradual rollout
echo "🔄 Deploying to production..."
cdk deploy ProductionStack \
    -c environment=prod \
    --require-approval never \
    --progress events

# 6. Post-deployment verification
echo "✅ Running post-deployment tests..."
npm run test:e2e:prod

# 7. Health check
echo "🏥 Health check..."
curl -f https://api.example.com/health || {
    echo "❌ Health check failed! Rolling back..."
    # Implement rollback logic
    exit 1
}

echo "🎉 Production deployment completed successfully!"
```

### 7.2 監視ダッシュボード

本番環境では以下の監視項目を重点的にチェック：

1. **ビジネスメトリクス**
   - アクティブユーザー数
   - API使用量
   - エラー率

2. **技術メトリクス**
   - Lambda実行時間・エラー率
   - DynamoDB読み書き容量
   - API Gatewayレイテンシ

3. **インフラメトリクス**
   - コスト監視
   - セキュリティアラート
   - 可用性監視

## 8. 演習問題と解答

### 演習 1: 災害復旧シナリオ
DynamoDBテーブルが削除された場合の復旧手順を作成してください。

#### 解答 1: 災害復旧シナリオと復旧手順

`scripts/disaster-recovery.sh`を作成：

```bash
#!/bin/bash

# 災害復旧スクリプト - DynamoDB テーブル削除対応
# Usage: ./disaster-recovery.sh <environment> <table-name> <backup-arn>

set -e

ENVIRONMENT=$1
TABLE_NAME=$2
BACKUP_ARN=$3
RECOVERY_TABLE_NAME="${TABLE_NAME}-recovery-$(date +%Y%m%d-%H%M%S)"

if [ -z "$ENVIRONMENT" ] || [ -z "$TABLE_NAME" ] || [ -z "$BACKUP_ARN" ]; then
    echo "Usage: $0 <environment> <table-name> <backup-arn>"
    echo "Example: $0 prod todo-app-prod arn:aws:dynamodb:region:account:table/todo-app-prod/backup/01234567890123-abcdef12"
    exit 1
fi

echo "🚨 === DynamoDB 災害復旧プロセス開始 ==="
echo "環境: $ENVIRONMENT"
echo "テーブル名: $TABLE_NAME"
echo "バックアップARN: $BACKUP_ARN"
echo "復旧テーブル名: $RECOVERY_TABLE_NAME"
echo

# ステップ1: 復旧前確認
echo "📋 ステップ1: 復旧前確認"
echo "テーブルが本当に削除されているか確認中..."
aws dynamodb describe-table --table-name $TABLE_NAME 2>/dev/null && {
    echo "⚠️ テーブルがまだ存在しています。復旧は必要ありません。"
    exit 0
} || {
    echo "✓ テーブルの削除を確認しました。復旧を続行します。"
}

# ステップ2: バックアップから復元
echo
echo "🔄 ステップ2: バックアップから復元"
echo "バックアップから一時的な復旧テーブルを作成中..."

RESTORE_JOB_ARN=$(aws dynamodb restore-table-from-backup \
    --target-table-name $RECOVERY_TABLE_NAME \
    --backup-arn $BACKUP_ARN \
    --query 'TableDescription.RestoreStatus.RestoreInProgress' \
    --output text)

if [ "$RESTORE_JOB_ARN" = "True" ]; then
    echo "✓ 復元ジョブが開始されました"
else
    echo "❌ 復元ジョブの開始に失敗しました"
    exit 1
fi

# ステップ3: 復元完了待機
echo
echo "⏳ ステップ3: 復元完了待機"
echo "復元が完了するまで待機中..."

while true; do
    STATUS=$(aws dynamodb describe-table \
        --table-name $RECOVERY_TABLE_NAME \
        --query 'Table.TableStatus' \
        --output text 2>/dev/null)
    
    if [ "$STATUS" = "ACTIVE" ]; then
        echo "✓ 復元が完了しました"
        break
    elif [ "$STATUS" = "CREATING" ]; then
        echo "復元中... ($(date))"
        sleep 30
    else
        echo "❌ 復元に失敗しました。ステータス: $STATUS"
        exit 1
    fi
done

# ステップ4: データ整合性チェック
echo
echo "🔍 ステップ4: データ整合性チェック"
echo "復旧データの整合性を確認中..."

# アイテム数の確認
ITEM_COUNT=$(aws dynamodb scan \
    --table-name $RECOVERY_TABLE_NAME \
    --select "COUNT" \
    --query 'Count' \
    --output text)

echo "復旧テーブルのアイテム数: $ITEM_COUNT"

# サンプルデータの確認
echo "サンプルデータの確認:"
aws dynamodb scan \
    --table-name $RECOVERY_TABLE_NAME \
    --limit 3 \
    --query 'Items[].{PK:pk.S,SK:sk.S,Title:title.S}' \
    --output table

# ステップ5: 本番テーブルへの置換
echo
echo "🔄 ステップ5: 本番テーブルへの置換"
read -p "復旧データを確認しました。本番テーブルとして置換しますか？ (y/N) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "復旧プロセスを中断しました。復旧テーブル $RECOVERY_TABLE_NAME は保持されます。"
    echo "手動で確認後、以下のコマンドで置換してください："
    echo "  aws dynamodb create-table --cli-input-json file://backup-table-config.json"
    exit 0
fi

# テーブル設定のバックアップ
echo "現在のテーブル設定をバックアップ中..."
aws dynamodb describe-table \
    --table-name $RECOVERY_TABLE_NAME \
    --query 'Table.{TableName:`'$TABLE_NAME'`,AttributeDefinitions:AttributeDefinitions,KeySchema:KeySchema,BillingMode:BillingModeSummary.BillingMode,ProvisionedThroughput:ProvisionedThroughput,GlobalSecondaryIndexes:GlobalSecondaryIndexes}' \
    > table-config-backup.json

echo "✓ テーブル設定をバックアップしました: table-config-backup.json"

# CDKスタックの再デプロイ
echo
echo "🚀 ステップ6: CDKスタックの再デプロイ"
echo "CDKスタックを再デプロイして正式なテーブルを作成中..."

# 復旧テーブルを一時的にリネーム
TEMP_TABLE_NAME="${TABLE_NAME}-backup-temp"
echo "復旧テーブルを一時的にリネーム: $RECOVERY_TABLE_NAME -> $TEMP_TABLE_NAME"

# Note: DynamoDBは直接テーブル名変更ができないため、データのコピーが必要
echo "データ移行の準備..."
cat > copy-table-data.py << 'EOF'
import boto3
import sys
from concurrent.futures import ThreadPoolExecutor
import time

def copy_item(item, target_table):
    """単一アイテムをコピー"""
    try:
        target_table.put_item(Item=item)
        return True
    except Exception as e:
        print(f"Error copying item: {e}")
        return False

def copy_table_data(source_table_name, target_table_name):
    """テーブル間でデータをコピー"""
    dynamodb = boto3.resource('dynamodb')
    source_table = dynamodb.Table(source_table_name)
    target_table = dynamodb.Table(target_table_name)
    
    print(f"Copying data from {source_table_name} to {target_table_name}")
    
    # ソーステーブルをスキャン
    response = source_table.scan()
    items = response['Items']
    
    # 残りのページを取得
    while 'LastEvaluatedKey' in response:
        response = source_table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
        items.extend(response['Items'])
    
    print(f"Total items to copy: {len(items)}")
    
    # 並列でアイテムをコピー
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(copy_item, item, target_table) for item in items]
        successful = sum(1 for future in futures if future.result())
    
    print(f"Successfully copied {successful}/{len(items)} items")
    return successful == len(items)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python copy-table-data.py <source-table> <target-table>")
        sys.exit(1)
    
    source = sys.argv[1]
    target = sys.argv[2]
    
    success = copy_table_data(source, target)
    sys.exit(0 if success else 1)
EOF

# CDKデプロイメント
echo "CDKを使用して新しいテーブルをデプロイ中..."
cdk deploy --context environment=$ENVIRONMENT --require-approval never

# データのコピー
echo "復旧データを新しいテーブルにコピー中..."
python3 copy-table-data.py $RECOVERY_TABLE_NAME $TABLE_NAME

if [ $? -eq 0 ]; then
    echo "✓ データコピーが完了しました"
else
    echo "❌ データコピーに失敗しました"
    exit 1
fi

# ステップ7: 検証とクリーンアップ
echo
echo "✅ ステップ7: 検証とクリーンアップ"

# 最終検証
FINAL_COUNT=$(aws dynamodb scan \
    --table-name $TABLE_NAME \
    --select "COUNT" \
    --query 'Count' \
    --output text)

echo "最終テーブルのアイテム数: $FINAL_COUNT"

if [ "$ITEM_COUNT" -eq "$FINAL_COUNT" ]; then
    echo "✓ データ整合性が確認されました"
else
    echo "⚠️ データ数に差異があります。手動で確認してください"
fi

# アプリケーションの健全性チェック
echo "アプリケーションの健全性チェック..."
if [ "$ENVIRONMENT" = "prod" ]; then
    curl -f https://api.example.com/health || echo "⚠️ ヘルスチェックに失敗しました"
else
    curl -f https://staging-api.example.com/health || echo "⚠️ ヘルスチェックに失敗しました"
fi

# 復旧テーブルのクリーンアップ確認
echo
read -p "復旧が成功しました。一時テーブル $RECOVERY_TABLE_NAME を削除しますか？ (y/N) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "一時テーブルを削除中..."
    aws dynamodb delete-table --table-name $RECOVERY_TABLE_NAME
    echo "✓ クリーンアップが完了しました"
else
    echo "一時テーブル $RECOVERY_TABLE_NAME は保持されます"
fi

# 復旧レポートの生成
echo
echo "📄 復旧レポートを生成中..."
cat > disaster-recovery-report.md << EOF
# 災害復旧レポート

## 基本情報
- **復旧日時**: $(date)
- **環境**: $ENVIRONMENT
- **対象テーブル**: $TABLE_NAME
- **使用バックアップ**: $BACKUP_ARN
- **復旧方法**: バックアップからの復元 + CDK再デプロイ

## 復旧結果
- **復旧前データ数**: $ITEM_COUNT
- **復旧後データ数**: $FINAL_COUNT
- **データ整合性**: $([ "$ITEM_COUNT" -eq "$FINAL_COUNT" ] && echo "✅ 正常" || echo "⚠️ 要確認")
- **復旧時間**: 約$((($(date +%s) - $(date -d "1 hour ago" +%s)) / 60))分

## 実行されたアクション
1. 削除されたテーブルの確認
2. バックアップからの復元
3. データ整合性チェック
4. CDKスタックの再デプロイ
5. データの移行
6. 最終検証
7. クリーンアップ

## 今後の対策
- [ ] バックアップ頻度の見直し
- [ ] アラート設定の強化
- [ ] 復旧手順の文書化更新
- [ ] チームへの報告と共有

## 関連ファイル
- table-config-backup.json: テーブル設定のバックアップ
- copy-table-data.py: データ移行スクリプト
- disaster-recovery-report.md: このレポート
EOF

echo "✓ 復旧レポートを生成しました: disaster-recovery-report.md"
echo
echo "🎉 === 災害復旧プロセス完了 ==="
echo
echo "📋 復旧後の確認事項:"
echo "- [ ] アプリケーションの動作確認"
echo "- [ ] 関係者への報告"
echo "- [ ] 根本原因の調査"
echo "- [ ] 再発防止策の検討"
echo "- [ ] バックアップ戦略の見直し"
```

災害復旧手順書 `docs/disaster-recovery-runbook.md`：

```markdown
# 災害復旧手順書

## 概要
このドキュメントはシステム障害発生時の復旧手順を定めています。

## 連絡先
- **システム管理者**: admin@example.com
- **緊急連絡先**: +81-90-1234-5678
- **Slack**: #incident-response

## 復旧シナリオ別手順

### 1. DynamoDBテーブル削除
**症状**: アプリケーションからデータベースアクセスエラー

**確認方法**:
```bash
aws dynamodb describe-table --table-name todo-app-prod
```

**復旧手順**:
1. 最新のバックアップARNを確認
   ```bash
   aws dynamodb list-backups --table-name todo-app-prod
   ```

2. 復旧スクリプトの実行
   ```bash
   ./scripts/disaster-recovery.sh prod todo-app-prod <backup-arn>
   ```

### 2. Lambda関数の障害
**症状**: APIレスポンスの大幅な遅延または500エラー

**確認方法**:
```bash
aws logs filter-log-events --log-group-name /aws/lambda/todo-app-prod-get-todos
```

**復旧手順**:
1. CDKスタックの再デプロイ
2. 関数設定の確認
3. ロールバック（必要に応じて）

### 3. API Gateway障害
**症状**: APIエンドポイントへのアクセス不可

**復旧手順**:
1. カスタムドメインの確認
2. ステージ設定の確認
3. WAF設定の確認

## RTO/RPO目標
- **RTO (Recovery Time Objective)**: 1時間
- **RPO (Recovery Point Objective)**: 24時間
```

### 演習 2: パフォーマンステスト
負荷テストを実装し、システムのボトルネックを特定してください。

#### 解答 2: パフォーマンステストの実装

包括的なパフォーマンステスト `performance-tests/comprehensive-load-test.yml`：

```yaml
config:
  target: "{{ $processEnvironment.API_URL }}"
  phases:
    # ベースライン測定
    - duration: 120
      arrivalRate: 1
      name: "Baseline"
    # 段階的負荷増加
    - duration: 300
      arrivalRate: 2
      rampTo: 10
      name: "Ramp-up Phase 1"
    - duration: 300
      arrivalRate: 10
      rampTo: 25
      name: "Ramp-up Phase 2" 
    - duration: 300
      arrivalRate: 25
      rampTo: 50
      name: "Ramp-up Phase 3"
    # 持続負荷テスト
    - duration: 900
      arrivalRate: 50
      name: "Sustained Load"
    # ピーク負荷テスト
    - duration: 300
      arrivalRate: 50
      rampTo: 100
      name: "Peak Load"
    # スパイクテスト
    - duration: 60
      arrivalRate: 200
      name: "Spike Test"
    # 復旧テスト
    - duration: 300
      arrivalRate: 100
      rampTo: 10
      name: "Recovery Test"

defaults:
  headers:
    User-Agent: "LoadTest/1.0"
    Accept: "application/json"

before:
  flow:
    - log: "Starting comprehensive load test"

scenarios:
  # 読み取り集約的なワークロード (60%)
  - name: "Read Heavy Workload"
    weight: 60
    flow:
      - loop:
          - get:
              url: "/todos"
              capture:
                - json: "$"
                  as: "todoList"
              expect:
                - statusCode: 200
                - hasProperty: "todos"
          - think: 2
          - get:
              url: "/todos/{{ $randomString() }}"
              expect:
                - statusCode: [200, 404]
          - think: 1
        count: 3

  # 書き込み集約的なワークロード (25%)  
  - name: "Write Heavy Workload"
    weight: 25
    flow:
      - post:
          url: "/todos"
          json:
            title: "Performance Test Todo {{ $randomInt(1, 1000) }}"
            description: "Load test todo created at {{ $timestamp() }}"
            priority: "{{ $randomString() }}"
          capture:
            - json: "$.todo.id"
              as: "todoId"
          expect:
            - statusCode: 201
      - think: 1
      - put:
          url: "/todos/{{ todoId }}"
          json:
            title: "Updated Todo {{ $randomInt(1, 1000) }}"
            completed: true
            completedAt: "{{ $timestamp() }}"
          expect:
            - statusCode: 200
      - think: 2
      - delete:
          url: "/todos/{{ todoId }}"
          expect:
            - statusCode: 200

  # 混合ワークロード (15%)
  - name: "Mixed Workload"
    weight: 15  
    flow:
      - get:
          url: "/todos"
      - think: 1
      - post:
          url: "/todos"
          json:
            title: "Mixed Test {{ $randomString() }}"
            description: "Mixed workload test"
          capture:
            - json: "$.todo.id"
              as: "mixedTodoId"
      - think: 1
      - get:
          url: "/todos/{{ mixedTodoId }}"
      - think: 1
      - put:
          url: "/todos/{{ mixedTodoId }}"
          json:
            title: "Updated Mixed Todo"
            completed: false

# パフォーマンス期待値
expect:
  - statusCode: [200, 201, 404]
  - maxResponseTime: 5000  # 5秒以下

# プラグイン設定
plugins:
  expect: {}
  metrics-by-endpoint: {}
  
engines:
  http:
    # 接続プールの設定
    maxSockets: 25
    # タイムアウト設定
    timeout: 30000
```

パフォーマンス分析スクリプト `performance-tests/analyze-performance.js`：

```javascript
const fs = require('fs');
const path = require('path');

class PerformanceAnalyzer {
    constructor(reportFile) {
        this.report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
        this.analysis = {
            summary: {},
            bottlenecks: [],
            recommendations: []
        };
    }

    analyze() {
        this.analyzeSummary();
        this.identifyBottlenecks();
        this.generateRecommendations();
        this.createDetailedReport();
        return this.analysis;
    }

    analyzeSummary() {
        const stats = this.report.aggregate;
        
        this.analysis.summary = {
            totalRequests: stats.counters['vusers.completed'] || 0,
            totalErrors: stats.counters['errors.total'] || 0,
            errorRate: this.calculateErrorRate(),
            responseTime: {
                min: stats.summaries?.['http.response_time']?.min || 0,
                max: stats.summaries?.['http.response_time']?.max || 0,
                mean: stats.summaries?.['http.response_time']?.mean || 0,
                median: stats.summaries?.['http.response_time']?.median || 0,
                p95: stats.summaries?.['http.response_time']?.p95 || 0,
                p99: stats.summaries?.['http.response_time']?.p99 || 0
            },
            throughput: {
                requestsPerSecond: this.calculateThroughput(),
                concurrentUsers: this.calculateMaxConcurrentUsers()
            }
        };
    }

    identifyBottlenecks() {
        const { errorRate, responseTime, throughput } = this.analysis.summary;

        // エラー率のチェック
        if (errorRate > 5) {
            this.analysis.bottlenecks.push({
                type: 'HIGH_ERROR_RATE',
                severity: 'CRITICAL',
                value: `${errorRate.toFixed(2)}%`,
                description: '高いエラー率が検出されました。システム容量またはコード品質に問題があります。'
            });
        }

        // レスポンス時間のチェック
        if (responseTime.p95 > 3000) {
            this.analysis.bottlenecks.push({
                type: 'HIGH_LATENCY_P95',
                severity: 'HIGH',
                value: `${responseTime.p95.toFixed(0)}ms`,
                description: '95パーセンタイルのレスポンス時間が3秒を超えています。'
            });
        }

        if (responseTime.p99 > 5000) {
            this.analysis.bottlenecks.push({
                type: 'HIGH_LATENCY_P99',
                severity: 'MEDIUM',
                value: `${responseTime.p99.toFixed(0)}ms`,
                description: '99パーセンタイルのレスポンス時間が5秒を超えています。'
            });
        }

        // スループットのチェック
        if (throughput.requestsPerSecond < 10) {
            this.analysis.bottlenecks.push({
                type: 'LOW_THROUGHPUT',
                severity: 'HIGH',
                value: `${throughput.requestsPerSecond.toFixed(2)} req/s`,
                description: '低いスループットが検出されました。システムの処理能力に制限があります。'
            });
        }

        // メモリ使用量の分析（CloudWatch連携が必要）
        this.checkResourceUtilization();
    }

    generateRecommendations() {
        const bottlenecks = this.analysis.bottlenecks;

        bottlenecks.forEach(bottleneck => {
            switch (bottleneck.type) {
                case 'HIGH_ERROR_RATE':
                    this.analysis.recommendations.push({
                        category: 'ERROR_HANDLING',
                        priority: 'HIGH',
                        action: 'Lambda関数のエラーハンドリングを改善し、DynamoDBの容量設定を確認してください。',
                        implementation: [
                            'Lambda関数のメモリ設定を増加',
                            'DynamoDBのRead/Write容量の拡張',
                            'エラーログの詳細分析',
                            'リトライ機構の実装'
                        ]
                    });
                    break;

                case 'HIGH_LATENCY_P95':
                case 'HIGH_LATENCY_P99':
                    this.analysis.recommendations.push({
                        category: 'PERFORMANCE_OPTIMIZATION',
                        priority: 'HIGH',
                        action: 'レスポンス時間の最適化が必要です。',
                        implementation: [
                            'Lambda関数のコールドスタート対策（Provisioned Concurrency）',
                            'DynamoDBアクセスパターンの最適化',
                            'APIレスポンスのキャッシュ実装',
                            'データベースクエリの最適化'
                        ]
                    });
                    break;

                case 'LOW_THROUGHPUT':
                    this.analysis.recommendations.push({
                        category: 'SCALABILITY',
                        priority: 'MEDIUM',
                        action: 'システムのスケーラビリティを向上させてください。',
                        implementation: [
                            'Lambda予約同時実行数の調整',
                            'API Gateway スロットリング設定の確認',
                            'DynamoDB Auto Scalingの有効化',
                            'CloudFront CDNの導入検討'
                        ]
                    });
                    break;
            }
        });

        // 一般的な推奨事項
        this.analysis.recommendations.push({
            category: 'MONITORING',
            priority: 'MEDIUM',
            action: '継続的なパフォーマンス監視の実装',
            implementation: [
                'CloudWatch Dashboardのセットアップ',
                'X-Rayトレーシングの有効化',
                '定期的な負荷テストの自動化',
                'パフォーマンスアラートの設定'
            ]
        });
    }

    checkResourceUtilization() {
        // 実際の実装ではCloudWatchからメトリクスを取得
        // ここではサンプル実装
        const estimatedLambdaUtilization = this.estimateLambdaUtilization();
        const estimatedDynamoUtilization = this.estimateDynamoUtilization();

        if (estimatedLambdaUtilization > 80) {
            this.analysis.bottlenecks.push({
                type: 'HIGH_LAMBDA_UTILIZATION',
                severity: 'HIGH',
                value: `${estimatedLambdaUtilization}%`,
                description: 'Lambda関数の使用率が高くなっています。'
            });
        }

        if (estimatedDynamoUtilization > 70) {
            this.analysis.bottlenecks.push({
                type: 'HIGH_DYNAMO_UTILIZATION',
                severity: 'HIGH',
                value: `${estimatedDynamoUtilization}%`,
                description: 'DynamoDB容量の使用率が高くなっています。'
            });
        }
    }

    createDetailedReport() {
        const reportPath = 'performance-analysis-report.md';
        const report = this.generateMarkdownReport();
        fs.writeFileSync(reportPath, report);
        console.log(`📊 詳細なパフォーマンス分析レポートを生成しました: ${reportPath}`);
    }

    generateMarkdownReport() {
        const { summary, bottlenecks, recommendations } = this.analysis;
        
        return `
# パフォーマンステスト分析レポート

## 実行サマリー

### 基本統計
- **総リクエスト数**: ${summary.totalRequests.toLocaleString()}
- **総エラー数**: ${summary.totalErrors}
- **エラー率**: ${this.calculateErrorRate().toFixed(2)}%
- **平均スループット**: ${summary.throughput.requestsPerSecond.toFixed(2)} req/s

### レスポンス時間統計
| メトリクス | 値 |
|-----------|-----|
| 平均 | ${summary.responseTime.mean.toFixed(0)}ms |
| 中央値 | ${summary.responseTime.median.toFixed(0)}ms |
| 95%タイル | ${summary.responseTime.p95.toFixed(0)}ms |
| 99%タイル | ${summary.responseTime.p99.toFixed(0)}ms |
| 最大 | ${summary.responseTime.max.toFixed(0)}ms |

## 検出されたボトルネック

${bottlenecks.map(b => `
### ${b.type} (${b.severity})
- **値**: ${b.value}
- **説明**: ${b.description}
`).join('')}

## 推奨改善策

${recommendations.map((r, i) => `
### ${i + 1}. ${r.category} (優先度: ${r.priority})

**アクション**: ${r.action}

**実装方法**:
${r.implementation.map(impl => `- ${impl}`).join('\n')}
`).join('')}

## パフォーマンス評価

${this.generatePerformanceScore()}

## 次のステップ

1. **即座に対応が必要な項目**:
${bottlenecks.filter(b => b.severity === 'CRITICAL').map(b => `   - ${b.description}`).join('\n')}

2. **短期的な改善項目**:
${recommendations.filter(r => r.priority === 'HIGH').map(r => `   - ${r.action}`).join('\n')}

3. **継続的な監視**:
   - 定期的な負荷テストの実施
   - パフォーマンスメトリクスの監視
   - ユーザー体験の測定

---
*レポート生成日時: ${new Date().toLocaleString('ja-JP')}*
        `;
    }

    // ヘルパーメソッド
    calculateErrorRate() {
        const stats = this.report.aggregate;
        const total = stats.counters['vusers.completed'] || 0;
        const errors = stats.counters['errors.total'] || 0;
        return total > 0 ? (errors / total) * 100 : 0;
    }

    calculateThroughput() {
        // テスト実行時間を基に計算（概算）
        const stats = this.report.aggregate;
        const total = stats.counters['vusers.completed'] || 0;
        const duration = this.estimateTestDuration(); // seconds
        return duration > 0 ? total / duration : 0;
    }

    calculateMaxConcurrentUsers() {
        // テストフェーズから最大同時ユーザー数を推定
        return 200; // スパイクテストでの最大値
    }

    estimateTestDuration() {
        // テストフェーズの合計時間を計算
        return 120 + 300 + 300 + 300 + 900 + 300 + 60 + 300; // seconds
    }

    estimateLambdaUtilization() {
        // レスポンス時間から Lambda 使用率を推定
        const avgResponseTime = this.analysis.summary.responseTime.mean;
        return Math.min(avgResponseTime / 50, 100); // 簡易推定
    }

    estimateDynamoUtilization() {
        // エラー率から DynamoDB 使用率を推定
        const errorRate = this.calculateErrorRate();
        return Math.min(errorRate * 10, 100); // 簡易推定
    }

    generatePerformanceScore() {
        let score = 100;
        const { errorRate, responseTime } = this.analysis.summary;

        // エラー率による減点
        if (errorRate > 1) score -= 20;
        if (errorRate > 5) score -= 30;

        // レスポンス時間による減点
        if (responseTime.p95 > 2000) score -= 15;
        if (responseTime.p95 > 3000) score -= 25;
        if (responseTime.p99 > 5000) score -= 10;

        // スループットによる減点
        if (this.analysis.summary.throughput.requestsPerSecond < 10) score -= 20;

        score = Math.max(0, score);

        let grade = 'A';
        if (score < 90) grade = 'B';
        if (score < 70) grade = 'C';
        if (score < 50) grade = 'D';
        if (score < 30) grade = 'F';

        return `
### 総合パフォーマンススコア: ${score}/100 (${grade}ランク)

**評価基準**:
- A (90-100): 優秀なパフォーマンス
- B (70-89): 良好なパフォーマンス
- C (50-69): 平均的なパフォーマンス
- D (30-49): 改善が必要
- F (0-29): 大幅な改善が必要
        `;
    }
}

// メイン実行
function analyzePerformance(reportFile) {
    try {
        console.log('🔍 パフォーマンス分析を開始します...');
        
        const analyzer = new PerformanceAnalyzer(reportFile);
        const analysis = analyzer.analyze();
        
        // サマリー表示
        console.log('\n📊 テスト結果サマリー:');
        console.log(`   総リクエスト数: ${analysis.summary.totalRequests.toLocaleString()}`);
        console.log(`   エラー率: ${analyzer.calculateErrorRate().toFixed(2)}%`);
        console.log(`   平均レスポンス時間: ${analysis.summary.responseTime.mean.toFixed(0)}ms`);
        console.log(`   95%レスポンス時間: ${analysis.summary.responseTime.p95.toFixed(0)}ms`);
        console.log(`   スループット: ${analysis.summary.throughput.requestsPerSecond.toFixed(2)} req/s`);
        
        // ボトルネック表示
        if (analysis.bottlenecks.length > 0) {
            console.log('\n⚠️ 検出されたボトルネック:');
            analysis.bottlenecks.forEach(bottleneck => {
                console.log(`   - ${bottleneck.type}: ${bottleneck.value} (${bottleneck.severity})`);
            });
        } else {
            console.log('\n✅ 重大なボトルネックは検出されませんでした');
        }
        
        // 推奨事項表示
        console.log(`\n💡 ${analysis.recommendations.length}件の改善推奨事項があります`);
        
        console.log('\n✅ 分析完了！詳細なレポートを確認してください。');
        
    } catch (error) {
        console.error('❌ 分析に失敗しました:', error.message);
        process.exit(1);
    }
}

// コマンドライン実行
if (require.main === module) {
    const reportFile = process.argv[2];
    if (!reportFile) {
        console.error('Usage: node analyze-performance.js <artillery-report.json>');
        process.exit(1);
    }
    
    analyzePerformance(reportFile);
}

module.exports = { PerformanceAnalyzer };
```

自動化されたパフォーマンステストスイート `performance-tests/run-performance-suite.sh`：

```bash
#!/bin/bash

# 包括的パフォーマンステストスイート
set -e

# 設定
ENVIRONMENT=${1:-staging}
API_URL=${2:-https://staging-api.example.com}
REPORT_DIR="reports/$(date +%Y%m%d-%H%M%S)"
BASELINE_REPORT="baseline-report.json"

echo "🚀 包括的パフォーマンステスト開始"
echo "環境: $ENVIRONMENT"
echo "API URL: $API_URL"
echo "レポートディレクトリ: $REPORT_DIR"

# レポートディレクトリの作成
mkdir -p $REPORT_DIR

# ベースライン測定
echo
echo "📏 ベースライン測定中..."
export API_URL=$API_URL
artillery run performance-tests/baseline-test.yml \
    --output "$REPORT_DIR/baseline-raw.json"

artillery report "$REPORT_DIR/baseline-raw.json" \
    --output "$REPORT_DIR/baseline-report.html"

# ベースライン分析
echo "ベースライン分析..."
node performance-tests/analyze-performance.js "$REPORT_DIR/baseline-raw.json"
cp performance-analysis-report.md "$REPORT_DIR/baseline-analysis.md"

# 包括的負荷テスト
echo
echo "🔥 包括的負荷テスト実行中..."
artillery run performance-tests/comprehensive-load-test.yml \
    --output "$REPORT_DIR/load-test-raw.json"

artillery report "$REPORT_DIR/load-test-raw.json" \
    --output "$REPORT_DIR/load-test-report.html"

# 負荷テスト分析
echo "負荷テスト分析..."
node performance-tests/analyze-performance.js "$REPORT_DIR/load-test-raw.json"
cp performance-analysis-report.md "$REPORT_DIR/load-test-analysis.md"

# エンドポイント別テスト
echo
echo "🎯 エンドポイント別性能テスト..."

# GET /todos テスト
artillery run performance-tests/endpoint-specific/get-todos-test.yml \
    --output "$REPORT_DIR/get-todos-raw.json"

# POST /todos テスト
artillery run performance-tests/endpoint-specific/post-todos-test.yml \
    --output "$REPORT_DIR/post-todos-raw.json"

# PUT /todos/:id テスト
artillery run performance-tests/endpoint-specific/put-todos-test.yml \
    --output "$REPORT_DIR/put-todos-raw.json"

# DELETE /todos/:id テスト
artillery run performance-tests/endpoint-specific/delete-todos-test.yml \
    --output "$REPORT_DIR/delete-todos-raw.json"

# 比較分析
echo
echo "📊 結果比較分析..."
node performance-tests/compare-results.js \
    "$REPORT_DIR/baseline-raw.json" \
    "$REPORT_DIR/load-test-raw.json" \
    > "$REPORT_DIR/comparison-report.md"

# CloudWatchメトリクスの取得
echo
echo "📈 CloudWatchメトリクス取得..."
aws cloudwatch get-metric-statistics \
    --namespace AWS/Lambda \
    --metric-name Duration \
    --dimensions Name=FunctionName,Value=todo-app-$ENVIRONMENT-get-todos \
    --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
    --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
    --period 300 \
    --statistics Average,Maximum > "$REPORT_DIR/lambda-metrics.json"

aws cloudwatch get-metric-statistics \
    --namespace AWS/DynamoDB \
    --metric-name ConsumedReadCapacityUnits \
    --dimensions Name=TableName,Value=todo-app-$ENVIRONMENT \
    --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
    --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
    --period 300 \
    --statistics Sum,Average > "$REPORT_DIR/dynamodb-metrics.json"

# 統合レポートの生成
echo
echo "📄 統合レポート生成中..."
cat > "$REPORT_DIR/executive-summary.md" << EOF
# パフォーマンステスト実行サマリー

## テスト概要
- **実行日時**: $(date)
- **テスト環境**: $ENVIRONMENT
- **対象API**: $API_URL
- **テスト種類**: ベースライン、包括的負荷テスト、エンドポイント別テスト

## ファイル一覧
- \`baseline-analysis.md\`: ベースライン測定結果
- \`load-test-analysis.md\`: 負荷テスト結果  
- \`comparison-report.md\`: 結果比較分析
- \`lambda-metrics.json\`: Lambda CloudWatchメトリクス
- \`dynamodb-metrics.json\`: DynamoDB CloudWatchメトリクス
- \`*.html\`: 詳細なHTMLレポート

## 推奨次ステップ
1. 各分析レポートの確認
2. 検出されたボトルネックの対処
3. 改善後の再テスト実施
4. 継続的な監視体制の整備

## パフォーマンステスト自動化
このテストスイートは以下のスケジュールで自動実行することを推奨します：
- 週次: ベースラインテスト
- 月次: 包括的負荷テスト
- リリース前: 全テストスイート

---
*詳細な分析結果は各レポートファイルを参照してください*
EOF

echo
echo "✅ パフォーマンステストスイート完了"
echo "📁 結果は以下のディレクトリに保存されました: $REPORT_DIR"
echo
echo "📋 確認推奨ファイル:"
echo "  - $REPORT_DIR/executive-summary.md (概要)"
echo "  - $REPORT_DIR/load-test-analysis.md (主要分析)"
echo "  - $REPORT_DIR/load-test-report.html (詳細レポート)"
echo
echo "🔍 分析結果に基づいて必要な最適化を実施してください。"

# Slack通知（オプション）
if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
    echo "📬 Slack通知送信中..."
    curl -X POST -H 'Content-type: application/json' \
        --data "{
            \"text\":\"🚀 パフォーマンステスト完了\",
            \"attachments\":[{
                \"color\":\"good\",
                \"fields\":[
                    {\"title\":\"環境\",\"value\":\"$ENVIRONMENT\",\"short\":true},
                    {\"title\":\"レポート\",\"value\":\"$REPORT_DIR\",\"short\":true}
                ]
            }]
        }" \
        $SLACK_WEBHOOK_URL
fi
```

この包括的なパフォーマンステスト実装には以下の機能が含まれています：

1. **多段階負荷テスト**: ベースライン→段階的増加→持続負荷→ピーク→スパイク→復旧
2. **詳細な分析**: ボトルネック特定、パフォーマンススコア算出、具体的な改善提案
3. **CloudWatch統合**: AWS実リソースメトリクスとの連携分析
4. **自動化**: 定期実行可能なテストスイート
5. **レポート生成**: 技術者向け詳細分析とエグゼクティブサマリー

## 9. 今日のまとめ

### 学習したこと
- セキュリティベストプラクティスの実装
- 包括的な監視・アラートシステムの構築
- ログ管理とトラブルシューティング
- バックアップ・災害復旧戦略
- 本番運用のための準備とデプロイメント戦略

### 重要なポイント
1. **多層防御**: セキュリティは複数の層で実装
2. **可観測性**: 監視・ログ・トレーシングの重要性
3. **自動化**: 運用作業の自動化によるヒューマンエラー削減
4. **継続的改善**: 監視データに基づく継続的な改善

## 5日間の学習まとめ

### 達成したこと
- AWS CDKの基本から応用まで習得
- 実用的なサーバーレスアプリケーションの構築
- テスト・CI/CD・本番運用の完全な理解
- セキュリティ・監視・保守の実装

### 次のステップ
1. **実際のプロジェクトでの適用**
2. **チーム開発での活用**
3. **CDKコミュニティへの参加**
4. **最新機能のキャッチアップ**

おめでとうございます！AWS CDKマスターへの道のりが完了しました。

---

**本番デプロイチェックリスト**
- [ ] セキュリティレビュー完了
- [ ] パフォーマンステスト実施
- [ ] 監視・アラート設定
- [ ] バックアップ戦略確認
- [ ] ドキュメント整備
- [ ] 運用手順書作成
- [ ] ロールバック手順確認