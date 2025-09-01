---
title: 3日目 - 高度なConstructとパターン
order: 4
---

# 3日目 - 高度なConstructとパターン

## 今日の目標

1. カスタムConstructの作成方法を学ぶ
2. よく使われるデザインパターンを理解する
3. 再利用可能なコンポーネントを設計する
4. サーバーレスアプリケーションの完成

## 1. カスタムConstructの作成

### 1.1 基本的なカスタムConstruct

よく使用される構成をカスタムConstructとして抽象化してみましょう。

`lib/constructs/secure-bucket.ts`を作成：

```typescript
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface SecureBucketProps {
  bucketName?: string;
  environment: string;
  enableVersioning?: boolean;
  lifecycleDays?: number;
  allowedPrincipals?: iam.IPrincipal[];
}

export class SecureBucket extends Construct {
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: SecureBucketProps) {
    super(scope, id);

    const {
      bucketName,
      environment,
      enableVersioning = false,
      lifecycleDays = 30,
      allowedPrincipals = []
    } = props;

    // セキュリティベストプラクティスを適用したS3バケット
    this.bucket = new s3.Bucket(this, 'Bucket', {
      bucketName: bucketName || `secure-bucket-${environment}-${Date.now()}`,
      
      // セキュリティ設定
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      
      // バージョニング設定
      versioned: enableVersioning,
      
      // ライフサイクル設定
      lifecycleRules: [{
        id: 'DeleteOldVersions',
        enabled: true,
        noncurrentVersionExpiration: cdk.Duration.days(lifecycleDays),
        abortIncompleteMultipartUploadAfter: cdk.Duration.days(1),
      }],
      
      // 環境に応じた削除ポリシー
      removalPolicy: environment === 'prod' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: environment !== 'prod',
      
      // 通知設定（オプション）
      eventBridgeEnabled: true,
    });

    // 特定のプリンシパルにアクセス権限を付与
    allowedPrincipals.forEach((principal, index) => {
      this.bucket.addToResourcePolicy(new iam.PolicyStatement({
        sid: `AllowedPrincipal${index}`,
        effect: iam.Effect.ALLOW,
        principals: [principal],
        actions: [
          's3:GetObject',
          's3:PutObject',
          's3:DeleteObject'
        ],
        resources: [this.bucket.arnForObjects('*')]
      }));
    });

    // タグ付け
    cdk.Tags.of(this).add('Environment', environment);
    cdk.Tags.of(this).add('SecurityLevel', 'High');
    cdk.Tags.of(this).add('ManagedBy', 'CDK');
  }

  // メソッド: 読み込み専用アクセスを許可
  public grantReadOnly(identity: iam.IGrantable): iam.Grant {
    return this.bucket.grantRead(identity);
  }

  // メソッド: 読み書きアクセスを許可
  public grantReadWrite(identity: iam.IGrantable): iam.Grant {
    return this.bucket.grantReadWrite(identity);
  }
}
```

### 1.2 高機能なカスタムConstruct

より複雑な例として、サーバーレスAPI用のConstructを作成してみましょう。

`lib/constructs/serverless-api.ts`を作成：

```typescript
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface ServerlessApiProps {
  apiName: string;
  environment: string;
  corsOptions?: apigateway.CorsOptions;
  enableLogging?: boolean;
  enableTracing?: boolean;
}

export interface ApiEndpoint {
  path: string;
  method: string;
  functionCode: string;
  timeout?: cdk.Duration;
  memorySize?: number;
  environment?: { [key: string]: string };
}

export class ServerlessApi extends Construct {
  public readonly api: apigateway.RestApi;
  public readonly table: dynamodb.Table;
  private readonly functions: lambda.Function[] = [];

  constructor(scope: Construct, id: string, props: ServerlessApiProps) {
    super(scope, id);

    const { apiName, environment, corsOptions, enableLogging = true, enableTracing = false } = props;

    // DynamoDB テーブル
    this.table = new dynamodb.Table(this, 'Table', {
      tableName: `${apiName}-${environment}`,
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: environment === 'prod' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: environment === 'prod',
      
      // GSI for querying
      globalSecondaryIndexes: [{
        indexName: 'gsi1',
        partitionKey: { name: 'gsi1pk', type: dynamodb.AttributeType.STRING },
        sortKey: { name: 'gsi1sk', type: dynamodb.AttributeType.STRING },
      }]
    });

    // API Gateway
    this.api = new apigateway.RestApi(this, 'Api', {
      restApiName: `${apiName}-${environment}`,
      description: `${apiName} API for ${environment} environment`,
      
      // CORS設定
      defaultCorsPreflightOptions: corsOptions || {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
      
      // デプロイ設定
      deploy: true,
      deployOptions: {
        stageName: environment,
        loggingLevel: enableLogging ? apigateway.MethodLoggingLevel.INFO : apigateway.MethodLoggingLevel.OFF,
        dataTraceEnabled: enableLogging,
        tracingEnabled: enableTracing,
      },
      
      // API Key設定（本番環境のみ）
      apiKeySourceType: environment === 'prod' 
        ? apigateway.ApiKeySourceType.HEADER 
        : undefined,
    });

    // CloudWatch Logs設定
    if (enableLogging) {
      const logGroup = new logs.LogGroup(this, 'ApiLogGroup', {
        logGroupName: `/aws/apigateway/${apiName}-${environment}`,
        retention: environment === 'prod' 
          ? logs.RetentionDays.ONE_MONTH 
          : logs.RetentionDays.ONE_WEEK,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      });
    }
  }

  // メソッド: エンドポイントの追加
  public addEndpoint(endpoint: ApiEndpoint): lambda.Function {
    const { path, method, functionCode, timeout, memorySize, environment } = endpoint;

    // Lambda関数の作成
    const func = new lambda.Function(this, `Function${path.replace(/\//g, '')}${method}`, {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromInline(functionCode),
      handler: 'index.handler',
      timeout: timeout || cdk.Duration.seconds(30),
      memorySize: memorySize || 256,
      environment: {
        TABLE_NAME: this.table.tableName,
        ...environment,
      },
      tracing: lambda.Tracing.ACTIVE,
    });

    // DynamoDBアクセス権限を付与
    this.table.grantReadWriteData(func);

    // API Gatewayとの統合
    const resource = this.getOrCreateResource(path);
    const integration = new apigateway.LambdaIntegration(func, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
    });
    
    resource.addMethod(method, integration, {
      apiKeyRequired: false, // 必要に応じて変更
    });

    this.functions.push(func);
    return func;
  }

  // プライベートメソッド: リソースの取得または作成
  private getOrCreateResource(path: string): apigateway.Resource {
    const pathParts = path.split('/').filter(part => part !== '');
    let resource = this.api.root;

    for (const part of pathParts) {
      const existingResource = resource.getResource(part);
      if (existingResource) {
        resource = existingResource;
      } else {
        resource = resource.addResource(part);
      }
    }

    return resource;
  }

  // メソッド: 全てのLambda関数にアクセス権限を付与
  public grantTableAccess(grantee: iam.IGrantable): iam.Grant {
    return this.table.grantReadWriteData(grantee);
  }

  // メソッド: API URL の取得
  public getApiUrl(): string {
    return this.api.url;
  }
}
```

### 1.3 カスタムConstructの使用

作成したカスタムConstructを使用してStackを更新します。

`lib/application-stack.ts`を作成：

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ServerlessApi } from './constructs/serverless-api';
import { SecureBucket } from './constructs/secure-bucket';

export interface ApplicationStackProps extends cdk.StackProps {
  environment: string;
}

export class ApplicationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApplicationStackProps) {
    super(scope, id, props);

    const { environment } = props;

    // セキュアなS3バケット
    const assetsBucket = new SecureBucket(this, 'AssetsBucket', {
      environment,
      enableVersioning: environment === 'prod',
      lifecycleDays: environment === 'prod' ? 90 : 30,
    });

    // サーバーレスAPI
    const api = new ServerlessApi(this, 'TodoApi', {
      apiName: 'todo-app',
      environment,
      enableLogging: true,
      enableTracing: environment === 'prod',
    });

    // APIエンドポイントの追加
    
    // GET /todos - 全TODOの取得
    api.addEndpoint({
      path: '/todos',
      method: 'GET',
      functionCode: `
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const result = await dynamodb.scan({
      TableName: process.env.TABLE_NAME,
    }).promise();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        todos: result.Items || [],
        count: result.Count || 0
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
      `,
    });

    // POST /todos - TODO作成
    api.addEndpoint({
      path: '/todos',
      method: 'POST',
      functionCode: `
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const todo = {
      pk: 'TODO#' + uuidv4(),
      sk: 'METADATA',
      title: body.title,
      description: body.description || '',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await dynamodb.put({
      TableName: process.env.TABLE_NAME,
      Item: todo
    }).promise();
    
    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ todo })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
      `,
      timeout: cdk.Duration.seconds(10),
    });

    // PUT /todos/{id} - TODO更新
    api.addEndpoint({
      path: '/todos/{id}',
      method: 'PUT',
      functionCode: `
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const todoId = 'TODO#' + event.pathParameters.id;
    const body = JSON.parse(event.body);
    
    const updateParams = {
      TableName: process.env.TABLE_NAME,
      Key: { pk: todoId, sk: 'METADATA' },
      UpdateExpression: 'SET #title = :title, #description = :description, #completed = :completed, #updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#title': 'title',
        '#description': 'description', 
        '#completed': 'completed',
        '#updatedAt': 'updatedAt'
      },
      ExpressionAttributeValues: {
        ':title': body.title,
        ':description': body.description || '',
        ':completed': body.completed || false,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };
    
    const result = await dynamodb.update(updateParams).promise();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ todo: result.Attributes })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
      `,
    });

    // DELETE /todos/{id} - TODO削除
    api.addEndpoint({
      path: '/todos/{id}',
      method: 'DELETE',
      functionCode: `
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const todoId = 'TODO#' + event.pathParameters.id;
    
    await dynamodb.delete({
      TableName: process.env.TABLE_NAME,
      Key: { pk: todoId, sk: 'METADATA' }
    }).promise();
    
    return {
      statusCode: 204,
      headers: { 'Access-Control-Allow-Origin': '*' }
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
      `,
    });

    // 出力
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.getApiUrl(),
      description: 'Todo API URL',
      exportName: `${environment}-todo-api-url`,
    });

    new cdk.CfnOutput(this, 'AssetsBucketName', {
      value: assetsBucket.bucket.bucketName,
      description: 'Assets bucket name',
      exportName: `${environment}-assets-bucket`,
    });
  }
}
```

## 2. よく使われるデザインパターン

### 2.1 Factory Pattern

リソース作成ロジックを抽象化するFactoryパターン：

```typescript
export class LambdaFactory {
  public static createNodejsFunction(
    scope: Construct, 
    id: string, 
    props: {
      entry: string;
      environment?: string;
      timeout?: cdk.Duration;
      memorySize?: number;
    }
  ): lambda.Function {
    return new lambda.Function(scope, id, {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(props.entry),
      handler: 'index.handler',
      timeout: props.timeout || cdk.Duration.seconds(30),
      memorySize: props.memorySize || 256,
      environment: {
        NODE_ENV: props.environment || 'development',
      },
      tracing: lambda.Tracing.ACTIVE,
    });
  }

  public static createPythonFunction(
    scope: Construct,
    id: string,
    props: {
      entry: string;
      environment?: string;
    }
  ): lambda.Function {
    return new lambda.Function(scope, id, {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(props.entry),
      handler: 'app.handler',
      // Python固有の設定...
    });
  }
}
```

### 2.2 Builder Pattern

複雑な設定を段階的に構築するBuilderパターン：

```typescript
export class ApiGatewayBuilder {
  private props: Partial<apigateway.RestApiProps> = {};

  public withName(name: string): this {
    this.props.restApiName = name;
    return this;
  }

  public withCors(origins: string[]): this {
    this.props.defaultCorsPreflightOptions = {
      allowOrigins: origins,
      allowMethods: apigateway.Cors.ALL_METHODS,
    };
    return this;
  }

  public withApiKey(): this {
    this.props.apiKeySourceType = apigateway.ApiKeySourceType.HEADER;
    return this;
  }

  public withLogging(level: apigateway.MethodLoggingLevel = apigateway.MethodLoggingLevel.INFO): this {
    this.props.deployOptions = {
      ...this.props.deployOptions,
      loggingLevel: level,
      dataTraceEnabled: true,
    };
    return this;
  }

  public build(scope: Construct, id: string): apigateway.RestApi {
    return new apigateway.RestApi(scope, id, this.props as apigateway.RestApiProps);
  }
}

// 使用例
const api = new ApiGatewayBuilder()
  .withName('my-api')
  .withCors(['https://example.com'])
  .withApiKey()
  .withLogging()
  .build(this, 'MyApi');
```

### 2.3 Observer Pattern

イベント駆動アーキテクチャのためのObserverパターン：

```typescript
export class EventDrivenStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3バケット
    const bucket = new s3.Bucket(this, 'EventBucket');

    // SNSトピック
    const topic = new sns.Topic(this, 'ProcessingTopic');

    // S3イベントでSNSトピックを通知
    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.SnsDestination(topic)
    );

    // 複数の処理関数をサブスクライブ
    const processors = [
      this.createImageProcessor(),
      this.createMetadataExtractor(),
      this.createVirusScanProcessor(),
    ];

    processors.forEach(processor => {
      topic.addSubscription(new subs.LambdaSubscription(processor));
    });
  }

  private createImageProcessor(): lambda.Function {
    return new lambda.Function(this, 'ImageProcessor', {
      // 画像処理ロジック
    });
  }

  private createMetadataExtractor(): lambda.Function {
    return new lambda.Function(this, 'MetadataExtractor', {
      // メタデータ抽出ロジック
    });
  }

  private createVirusScanProcessor(): lambda.Function {
    return new lambda.Function(this, 'VirusScanProcessor', {
      // ウイルススキャンロジック
    });
  }
}
```

## 3. パッケージとしての配布

### 3.1 NPMパッケージの作成

カスタムConstructをNPMパッケージとして公開する準備：

`package.json`の設定：

```json
{
  "name": "my-company-cdk-constructs",
  "version": "1.0.0",
  "description": "Custom CDK Constructs for My Company",
  "main": "lib/index.js",
  "types": "lib/index.d.ts",
  "files": [
    "lib/**/*"
  ],
  "scripts": {
    "build": "tsc",
    "prepare": "npm run build"
  },
  "keywords": ["aws-cdk", "constructs", "infrastructure"],
  "author": "Your Name",
  "license": "MIT",
  "peerDependencies": {
    "aws-cdk-lib": "^2.0.0",
    "constructs": "^10.0.0"
  }
}
```

`lib/index.ts`でエクスポート：

```typescript
export * from './constructs/secure-bucket';
export * from './constructs/serverless-api';
export * from './patterns/event-driven-stack';
```

## 4. 演習問題

### 演習 1: モニタリングConstruct
以下の機能を持つMonitoringConstructを作成してください：

1. CloudWatchダッシュボード
2. アラーム設定
3. SNS通知
4. Lambda関数のメトリクス監視

<details>
<summary>解答例</summary>

**MonitoringConstruct:** `lib/constructs/monitoring-construct.ts`
```typescript
import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export interface MonitoringConstructProps {
  functions: lambda.Function[];
  environment: string;
  alertEmail: string;
  api?: apigateway.RestApi;
  tables?: dynamodb.Table[];
  applicationName?: string;
}

export class MonitoringConstruct extends Construct {
  public readonly dashboard: cloudwatch.Dashboard;
  public readonly alertTopic: sns.Topic;

  constructor(scope: Construct, id: string, props: MonitoringConstructProps) {
    super(scope, id);

    const { functions, environment, alertEmail, api, tables, applicationName = 'MyApp' } = props;

    // 1. SNSトピック
    this.alertTopic = new sns.Topic(this, 'AlertTopic', {
      displayName: `${applicationName}-${environment}-alerts`,
      topicName: `${applicationName}-${environment}-alerts`,
    });

    // Eメール通知の設定
    this.alertTopic.addSubscription(
      new subscriptions.EmailSubscription(alertEmail)
    );

    // 2. CloudWatchダッシュボード
    this.dashboard = new cloudwatch.Dashboard(this, 'Dashboard', {
      dashboardName: `${applicationName}-${environment}-dashboard`,
    });

    // 3. Lambda関数のメトリクス監視
    this.setupLambdaMonitoring(functions);

    // 4. API Gatewayの監視（存在する場合）
    if (api) {
      this.setupApiGatewayMonitoring(api);
    }

    // 5. DynamoDBの監視（存在する場合）
    if (tables && tables.length > 0) {
      this.setupDynamoDbMonitoring(tables);
    }

    // 6. システム全体のヘルスチェック
    this.setupSystemHealthCheck();

    // 出力
    new cdk.CfnOutput(this, 'DashboardURL', {
      value: `https://console.aws.amazon.com/cloudwatch/home?region=${cdk.Stack.of(this).region}#dashboards:name=${this.dashboard.dashboardName}`,
      description: 'CloudWatch Dashboard URL',
    });

    new cdk.CfnOutput(this, 'AlertTopicArn', {
      value: this.alertTopic.topicArn,
      description: 'SNS Alert Topic ARN',
    });
  }

  private setupLambdaMonitoring(functions: lambda.Function[]) {
    const lambdaWidgets: cloudwatch.IWidget[] = [];

    functions.forEach((func, index) => {
      // エラーレートアラーム
      const errorAlarm = new cloudwatch.Alarm(this, `LambdaErrorAlarm${index}`, {
        alarmName: `${func.functionName}-errors`,
        metric: func.metricErrors({
          period: cdk.Duration.minutes(5),
          statistic: 'Sum',
        }),
        threshold: 3,
        evaluationPeriods: 2,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
        alarmDescription: `Error rate alarm for ${func.functionName}`,
      });
      errorAlarm.addAlarmAction(new actions.SnsAction(this.alertTopic));

      // 実行時間アラーム
      const durationAlarm = new cloudwatch.Alarm(this, `LambdaDurationAlarm${index}`, {
        alarmName: `${func.functionName}-duration`,
        metric: func.metricDuration({
          period: cdk.Duration.minutes(5),
          statistic: 'Average',
        }),
        threshold: func.timeout?.toMilliseconds() || 30000 * 0.8, // タイムアウトの80%
        evaluationPeriods: 3,
        alarmDescription: `Duration alarm for ${func.functionName}`,
      });
      durationAlarm.addAlarmAction(new actions.SnsAction(this.alertTopic));

      // スロットルアラーム
      const throttleAlarm = new cloudwatch.Alarm(this, `LambdaThrottleAlarm${index}`, {
        alarmName: `${func.functionName}-throttles`,
        metric: func.metricThrottles({
          period: cdk.Duration.minutes(5),
          statistic: 'Sum',
        }),
        threshold: 1,
        evaluationPeriods: 2,
        alarmDescription: `Throttle alarm for ${func.functionName}`,
      });
      throttleAlarm.addAlarmAction(new actions.SnsAction(this.alertTopic));

      // 同時実行数アラーム
      const concurrentAlarm = new cloudwatch.Alarm(this, `LambdaConcurrentAlarm${index}`, {
        alarmName: `${func.functionName}-concurrent`,
        metric: func.metricConcurrentExecutions({
          period: cdk.Duration.minutes(5),
          statistic: 'Maximum',
        }),
        threshold: 900, // AWS Lambda default concurrent execution limit is 1000
        evaluationPeriods: 2,
        alarmDescription: `Concurrent execution alarm for ${func.functionName}`,
      });
      concurrentAlarm.addAlarmAction(new actions.SnsAction(this.alertTopic));

      // Lambda メトリクスウィジェット
      lambdaWidgets.push(
        new cloudwatch.GraphWidget({
          title: `${func.functionName} - Invocations & Errors`,
          left: [func.metricInvocations()],
          right: [func.metricErrors()],
          width: 12,
          height: 6,
        })
      );

      lambdaWidgets.push(
        new cloudwatch.GraphWidget({
          title: `${func.functionName} - Duration & Memory`,
          left: [func.metricDuration()],
          right: [
            new cloudwatch.Metric({
              namespace: 'AWS/Lambda',
              metricName: 'MemoryUtilization',
              dimensionsMap: {
                FunctionName: func.functionName,
              },
            })
          ],
          width: 12,
          height: 6,
        })
      );
    });

    // Lambda セクションをダッシュボードに追加
    if (lambdaWidgets.length > 0) {
      this.dashboard.addWidgets(
        new cloudwatch.TextWidget({
          markdown: '# Lambda Functions Monitoring',
          width: 24,
          height: 1,
        }),
        ...lambdaWidgets
      );
    }
  }

  private setupApiGatewayMonitoring(api: apigateway.RestApi) {
    // 4xxエラーアラーム
    const clientErrorAlarm = new cloudwatch.Alarm(this, 'ApiGateway4xxAlarm', {
      alarmName: `${api.restApiName}-4xx-errors`,
      metric: api.metricClientError({
        period: cdk.Duration.minutes(5),
        statistic: 'Sum',
      }),
      threshold: 10,
      evaluationPeriods: 2,
      alarmDescription: `4xx error rate alarm for ${api.restApiName}`,
    });
    clientErrorAlarm.addAlarmAction(new actions.SnsAction(this.alertTopic));

    // 5xxエラーアラーム
    const serverErrorAlarm = new cloudwatch.Alarm(this, 'ApiGateway5xxAlarm', {
      alarmName: `${api.restApiName}-5xx-errors`,
      metric: api.metricServerError({
        period: cdk.Duration.minutes(5),
        statistic: 'Sum',
      }),
      threshold: 1,
      evaluationPeriods: 1,
      alarmDescription: `5xx error rate alarm for ${api.restApiName}`,
    });
    serverErrorAlarm.addAlarmAction(new actions.SnsAction(this.alertTopic));

    // レイテンシアラーム
    const latencyAlarm = new cloudwatch.Alarm(this, 'ApiGatewayLatencyAlarm', {
      alarmName: `${api.restApiName}-latency`,
      metric: api.metricLatency({
        period: cdk.Duration.minutes(5),
        statistic: 'Average',
      }),
      threshold: 3000, // 3秒
      evaluationPeriods: 3,
      alarmDescription: `Latency alarm for ${api.restApiName}`,
    });
    latencyAlarm.addAlarmAction(new actions.SnsAction(this.alertTopic));

    // API Gateway ダッシュボードウィジェット
    this.dashboard.addWidgets(
      new cloudwatch.TextWidget({
        markdown: '# API Gateway Monitoring',
        width: 24,
        height: 1,
      }),
      new cloudwatch.GraphWidget({
        title: 'API Gateway - Request Count & Errors',
        left: [api.metricCount()],
        right: [api.metricClientError(), api.metricServerError()],
        width: 12,
        height: 6,
      }),
      new cloudwatch.GraphWidget({
        title: 'API Gateway - Latency',
        left: [api.metricLatency()],
        width: 12,
        height: 6,
      })
    );
  }

  private setupDynamoDbMonitoring(tables: dynamodb.Table[]) {
    const dynamoWidgets: cloudwatch.IWidget[] = [];

    tables.forEach((table, index) => {
      // スロットルアラーム
      const readThrottleAlarm = new cloudwatch.Alarm(this, `DynamoReadThrottleAlarm${index}`, {
        alarmName: `${table.tableName}-read-throttles`,
        metric: table.metricUserErrors({
          period: cdk.Duration.minutes(5),
          statistic: 'Sum',
        }),
        threshold: 1,
        evaluationPeriods: 2,
        alarmDescription: `Read throttle alarm for ${table.tableName}`,
      });
      readThrottleAlarm.addAlarmAction(new actions.SnsAction(this.alertTopic));

      // システムエラーアラーム
      const systemErrorAlarm = new cloudwatch.Alarm(this, `DynamoSystemErrorAlarm${index}`, {
        alarmName: `${table.tableName}-system-errors`,
        metric: table.metricSystemErrors({
          period: cdk.Duration.minutes(5),
          statistic: 'Sum',
        }),
        threshold: 1,
        evaluationPeriods: 1,
        alarmDescription: `System error alarm for ${table.tableName}`,
      });
      systemErrorAlarm.addAlarmAction(new actions.SnsAction(this.alertTopic));

      // DynamoDB メトリクスウィジェット
      dynamoWidgets.push(
        new cloudwatch.GraphWidget({
          title: `DynamoDB - ${table.tableName}`,
          left: [table.metricConsumedReadCapacityUnits(), table.metricConsumedWriteCapacityUnits()],
          right: [table.metricSuccessfulRequestLatency()],
          width: 12,
          height: 6,
        })
      );
    });

    // DynamoDB セクションをダッシュボードに追加
    if (dynamoWidgets.length > 0) {
      this.dashboard.addWidgets(
        new cloudwatch.TextWidget({
          markdown: '# DynamoDB Monitoring',
          width: 24,
          height: 1,
        }),
        ...dynamoWidgets
      );
    }
  }

  private setupSystemHealthCheck() {
    // カスタムメトリクス用の設定
    const healthCheckWidget = new cloudwatch.TextWidget({
      markdown: `
# System Health Status

## 監視項目
- Lambda Function Errors & Duration
- API Gateway 4xx/5xx Errors & Latency  
- DynamoDB Throttles & System Errors
- Custom Business Metrics

## アラート通知先
- Email: ${(this.alertTopic.topicName)}

## ダッシュボード更新時刻
${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
      `,
      width: 24,
      height: 4,
    });

    this.dashboard.addWidgets(healthCheckWidget);
  }

  // カスタムメトリクスを追加するメソッド
  public addCustomMetric(name: string, namespace: string, value: number, unit?: cloudwatch.Unit) {
    const customMetric = new cloudwatch.Metric({
      namespace,
      metricName: name,
      statistic: 'Sum',
      unit: unit || cloudwatch.Unit.COUNT,
    });

    const customAlarm = new cloudwatch.Alarm(this, `CustomAlarm${name}`, {
      alarmName: `custom-${name.toLowerCase()}`,
      metric: customMetric,
      threshold: value,
      evaluationPeriods: 2,
      alarmDescription: `Custom metric alarm for ${name}`,
    });
    customAlarm.addAlarmAction(new actions.SnsAction(this.alertTopic));

    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: `Custom Metric - ${name}`,
        left: [customMetric],
        width: 12,
        height: 6,
      })
    );
  }
}
```

**使用例:** MonitoringConstructをApplicationStackで使用
```typescript
import { MonitoringConstruct } from './constructs/monitoring-construct';

export class ApplicationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApplicationStackProps) {
    super(scope, id, props);

    // アプリケーションリソースを作成
    const api = new ServerlessApi(this, 'TodoApi', {
      apiName: 'todo-app',
      environment: props.environment,
    });

    // モニタリングを追加
    const monitoring = new MonitoringConstruct(this, 'Monitoring', {
      functions: [/* api.functions */], // Lambda関数のリストを渡す
      environment: props.environment,
      alertEmail: 'admin@example.com',
      api: api.api,
      tables: [api.table],
      applicationName: 'TodoApp',
    });

    // カスタムビジネスメトリクスの追加例
    monitoring.addCustomMetric('TodosCreated', 'TodoApp/Business', 100);
    monitoring.addCustomMetric('ActiveUsers', 'TodoApp/Business', 50);
  }
}
```
</details>

### 演習 2: 本格的なWebアプリケーション
今日作成したTodo APIを使用してフロントエンドアプリケーションを作成し、完全なWebアプリケーションとして統合してください。

<details>
<summary>解答例</summary>

**完全なWebアプリケーション:** `lib/full-web-app-stack.ts`
```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import { ServerlessApi } from './constructs/serverless-api';
import { MonitoringConstruct } from './constructs/monitoring-construct';

export class FullWebAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // バックエンドAPI
    const api = new ServerlessApi(this, 'TodoApi', {
      apiName: 'todo-app',
      environment: 'production',
      enableLogging: true,
      enableTracing: true,
    });

    // Todo CRUD エンドポイントを追加
    this.setupTodoEndpoints(api);

    // フロントエンド用S3バケット
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `todo-app-frontend-${Date.now()}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // CloudFront設定
    const oai = new cloudfront.OriginAccessIdentity(this, 'OAI');
    websiteBucket.addToResourcePolicy(new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [websiteBucket.arnForObjects('*')],
      principals: [new iam.CanonicalUserPrincipal(
        oai.cloudFrontOriginAccessIdentityS3CanonicalUserId
      )]
    }));

    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket, {
          originAccessIdentity: oai
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        }
      ]
    });

    // 本格的なReact風フロントエンドアプリケーション
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [
        s3deploy.Source.inline('index.html', this.createReactLikeApp(api.getApiUrl())),
        s3deploy.Source.inline('styles.css', this.createAppStyles()),
        s3deploy.Source.inline('app.js', this.createAppJavaScript()),
      ],
      destinationBucket: websiteBucket,
      distribution: distribution,
      distributionPaths: ['/*'],
    });

    // モニタリング設定
    new MonitoringConstruct(this, 'Monitoring', {
      functions: [], // api.getAllFunctions(), // 実際の実装では関数リストを取得
      environment: 'production',
      alertEmail: 'admin@example.com',
      api: api.api,
      tables: [api.table],
      applicationName: 'TodoApp',
    });

    // 出力
    new cdk.CfnOutput(this, 'WebsiteURL', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'Todo App Website URL',
    });

    new cdk.CfnOutput(this, 'ApiURL', {
      value: api.getApiUrl(),
      description: 'Todo API URL',
    });
  }

  private setupTodoEndpoints(api: ServerlessApi) {
    // GET /todos - 全TODO取得
    api.addEndpoint({
      path: '/todos',
      method: 'GET',
      functionCode: `
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    console.log('Getting all todos');
    
    const result = await dynamodb.scan({
      TableName: process.env.TABLE_NAME,
      FilterExpression: 'begins_with(pk, :pk)',
      ExpressionAttributeValues: {
        ':pk': 'TODO#'
      }
    }).promise();
    
    const todos = result.Items.map(item => ({
      id: item.pk.replace('TODO#', ''),
      title: item.title,
      description: item.description || '',
      completed: item.completed || false,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ todos, count: todos.length })
    };
  } catch (error) {
    console.error('Error getting todos:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to get todos' })
    };
  }
};
      `,
    });

    // POST /todos - TODO作成
    api.addEndpoint({
      path: '/todos',
      method: 'POST',
      functionCode: `
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    
    if (!body.title) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Title is required' })
      };
    }
    
    const todoId = uuidv4();
    const now = new Date().toISOString();
    
    const todo = {
      pk: 'TODO#' + todoId,
      sk: 'METADATA',
      title: body.title,
      description: body.description || '',
      completed: false,
      createdAt: now,
      updatedAt: now,
    };
    
    await dynamodb.put({
      TableName: process.env.TABLE_NAME,
      Item: todo
    }).promise();
    
    const responseTodo = {
      id: todoId,
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt
    };
    
    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ todo: responseTodo })
    };
  } catch (error) {
    console.error('Error creating todo:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to create todo' })
    };
  }
};
      `,
    });

    // PUT /todos/{id} - TODO更新
    api.addEndpoint({
      path: '/todos/{id}',
      method: 'PUT',
      functionCode: `
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const todoId = 'TODO#' + event.pathParameters.id;
    const body = JSON.parse(event.body);
    
    const updateParams = {
      TableName: process.env.TABLE_NAME,
      Key: { pk: todoId, sk: 'METADATA' },
      UpdateExpression: 'SET #title = :title, #description = :description, #completed = :completed, #updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#title': 'title',
        '#description': 'description', 
        '#completed': 'completed',
        '#updatedAt': 'updatedAt'
      },
      ExpressionAttributeValues: {
        ':title': body.title,
        ':description': body.description || '',
        ':completed': body.completed || false,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };
    
    const result = await dynamodb.update(updateParams).promise();
    
    const responseTodo = {
      id: event.pathParameters.id,
      title: result.Attributes.title,
      description: result.Attributes.description,
      completed: result.Attributes.completed,
      createdAt: result.Attributes.createdAt,
      updatedAt: result.Attributes.updatedAt
    };
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ todo: responseTodo })
    };
  } catch (error) {
    console.error('Error updating todo:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to update todo' })
    };
  }
};
      `,
    });

    // DELETE /todos/{id} - TODO削除
    api.addEndpoint({
      path: '/todos/{id}',
      method: 'DELETE',
      functionCode: `
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const todoId = 'TODO#' + event.pathParameters.id;
    
    await dynamodb.delete({
      TableName: process.env.TABLE_NAME,
      Key: { pk: todoId, sk: 'METADATA' }
    }).promise();
    
    return {
      statusCode: 204,
      headers: { 'Access-Control-Allow-Origin': '*' }
    };
  } catch (error) {
    console.error('Error deleting todo:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to delete todo' })
    };
  }
};
      `,
    });
  }

  private createReactLikeApp(apiUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Todo App - AWS CDK</title>
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    <div id="app">
        <header class="header">
            <h1>📝 Todo App</h1>
            <p>AWS CDKで構築したフルスタックアプリケーション</p>
        </header>

        <main class="main">
            <section class="todo-input">
                <h2>新しいTodoを追加</h2>
                <form id="todoForm">
                    <input type="text" id="todoTitle" placeholder="タイトルを入力" required>
                    <textarea id="todoDescription" placeholder="説明（オプション）"></textarea>
                    <button type="submit">追加</button>
                </form>
            </section>

            <section class="todo-list">
                <h2>Todo一覧 <span id="todoCount">(0件)</span></h2>
                <div id="loading" class="loading">読み込み中...</div>
                <div id="todoContainer"></div>
            </section>
        </main>

        <footer class="footer">
            <p>API Endpoint: <code>${apiUrl}</code></p>
            <p>Built with AWS CDK, Lambda, DynamoDB, S3, CloudFront</p>
        </footer>
    </div>

    <script>
        window.API_URL = '${apiUrl}';
    </script>
    <script src="/app.js"></script>
</body>
</html>
    `;
  }

  private createAppStyles(): string {
    return `
/* Reset & Base Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #333;
    min-height: 100vh;
    line-height: 1.6;
}

#app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

/* Header */
.header {
    background: rgba(255, 255, 255, 0.95);
    padding: 2rem;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
}

.header h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    color: #4a5568;
}

.header p {
    color: #718096;
    font-size: 1.1rem;
}

/* Main Content */
.main {
    flex: 1;
    max-width: 800px;
    margin: 2rem auto;
    padding: 0 2rem;
    width: 100%;
}

.todo-input {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
}

.todo-input h2 {
    margin-bottom: 1.5rem;
    color: #2d3748;
    font-size: 1.5rem;
}

#todoForm {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

#todoTitle {
    padding: 0.75rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s;
}

#todoTitle:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

#todoDescription {
    padding: 0.75rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    resize: vertical;
    min-height: 80px;
    font-family: inherit;
    transition: all 0.2s;
}

#todoDescription:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

#todoForm button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 0.75rem 2rem;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 600;
}

#todoForm button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

#todoForm button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

/* Todo List */
.todo-list {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.todo-list h2 {
    margin-bottom: 1.5rem;
    color: #2d3748;
    font-size: 1.5rem;
}

#todoCount {
    font-weight: normal;
    color: #718096;
    font-size: 1rem;
}

.loading {
    text-align: center;
    padding: 2rem;
    color: #718096;
    font-style: italic;
}

.todo-item {
    background: #f7fafc;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    transition: all 0.2s;
    position: relative;
}

.todo-item:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.todo-item.completed {
    opacity: 0.7;
    background: #f0fff4;
    border-color: #9ae6b4;
}

.todo-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
}

.todo-checkbox {
    width: 20px;
    height: 20px;
    cursor: pointer;
}

.todo-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2d3748;
    flex: 1;
}

.todo-title.completed {
    text-decoration: line-through;
    color: #718096;
}

.todo-actions {
    display: flex;
    gap: 0.5rem;
}

.btn-edit, .btn-delete {
    padding: 0.25rem 0.75rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s;
}

.btn-edit {
    background: #4299e1;
    color: white;
}

.btn-edit:hover {
    background: #3182ce;
}

.btn-delete {
    background: #e53e3e;
    color: white;
}

.btn-delete:hover {
    background: #c53030;
}

.todo-description {
    margin-left: 2rem;
    color: #4a5568;
    margin-top: 0.5rem;
}

.todo-meta {
    margin-left: 2rem;
    color: #a0aec0;
    font-size: 0.875rem;
    margin-top: 0.5rem;
}

.empty-state {
    text-align: center;
    padding: 3rem;
    color: #a0aec0;
}

.empty-state h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
}

/* Footer */
.footer {
    background: rgba(255, 255, 255, 0.95);
    padding: 2rem;
    text-align: center;
    color: #718096;
    backdrop-filter: blur(10px);
    margin-top: auto;
}

.footer code {
    background: #f7fafc;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-family: 'Monaco', 'Consolas', monospace;
    font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 768px) {
    .main {
        margin: 1rem auto;
        padding: 0 1rem;
    }
    
    .header {
        padding: 1.5rem;
    }
    
    .header h1 {
        font-size: 2rem;
    }
    
    .todo-input, .todo-list {
        padding: 1.5rem;
    }
}

/* Animations */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.todo-item {
    animation: fadeIn 0.3s ease-out;
}

/* Success/Error Messages */
.message {
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    animation: fadeIn 0.3s ease-out;
}

.message.success {
    background: #f0fff4;
    border: 2px solid #9ae6b4;
    color: #2f855a;
}

.message.error {
    background: #fed7d7;
    border: 2px solid #fc8181;
    color: #c53030;
}
    `;
  }

  private createAppJavaScript(): string {
    return `
class TodoApp {
    constructor() {
        this.apiUrl = window.API_URL;
        this.todos = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTodos();
    }

    setupEventListeners() {
        const form = document.getElementById('todoForm');
        form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const title = document.getElementById('todoTitle').value.trim();
        const description = document.getElementById('todoDescription').value.trim();
        
        if (!title) return;

        try {
            await this.createTodo({ title, description });
            document.getElementById('todoForm').reset();
            this.showMessage('Todoが作成されました！', 'success');
        } catch (error) {
            this.showMessage('Todo作成に失敗しました: ' + error.message, 'error');
        }
    }

    async loadTodos() {
        try {
            this.showLoading(true);
            
            const response = await fetch(\`\${this.apiUrl}todos\`);
            if (!response.ok) throw new Error('Failed to load todos');
            
            const data = await response.json();
            this.todos = data.todos || [];
            this.renderTodos();
            this.updateTodoCount();
        } catch (error) {
            console.error('Error loading todos:', error);
            this.showMessage('Todoの読み込みに失敗しました: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async createTodo(todoData) {
        const response = await fetch(\`\${this.apiUrl}todos\`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(todoData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create todo');
        }

        const data = await response.json();
        this.todos.unshift(data.todo);
        this.renderTodos();
        this.updateTodoCount();
        
        return data.todo;
    }

    async updateTodo(id, updates) {
        const response = await fetch(\`\${this.apiUrl}todos/\${id}\`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update todo');
        }

        const data = await response.json();
        const index = this.todos.findIndex(todo => todo.id === id);
        if (index !== -1) {
            this.todos[index] = data.todo;
            this.renderTodos();
        }
        
        return data.todo;
    }

    async deleteTodo(id) {
        const response = await fetch(\`\${this.apiUrl}todos/\${id}\`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete todo');
        }

        this.todos = this.todos.filter(todo => todo.id !== id);
        this.renderTodos();
        this.updateTodoCount();
    }

    renderTodos() {
        const container = document.getElementById('todoContainer');
        
        if (this.todos.length === 0) {
            container.innerHTML = \`
                <div class="empty-state">
                    <h3>📝 Todoがありません</h3>
                    <p>上のフォームから新しいTodoを追加してみましょう！</p>
                </div>
            \`;
            return;
        }

        container.innerHTML = this.todos.map(todo => \`
            <div class="todo-item \${todo.completed ? 'completed' : ''}">
                <div class="todo-header">
                    <input 
                        type="checkbox" 
                        class="todo-checkbox" 
                        \${todo.completed ? 'checked' : ''} 
                        onchange="app.toggleTodo('\${todo.id}', this.checked)"
                    >
                    <span class="todo-title \${todo.completed ? 'completed' : ''}">\${this.escapeHtml(todo.title)}</span>
                    <div class="todo-actions">
                        <button class="btn-edit" onclick="app.editTodo('\${todo.id}')">編集</button>
                        <button class="btn-delete" onclick="app.deleteTodoWithConfirm('\${todo.id}')">削除</button>
                    </div>
                </div>
                \${todo.description ? \`<div class="todo-description">\${this.escapeHtml(todo.description)}</div>\` : ''}
                <div class="todo-meta">
                    作成: \${new Date(todo.createdAt).toLocaleString('ja-JP')}
                    \${todo.updatedAt !== todo.createdAt ? \` | 更新: \${new Date(todo.updatedAt).toLocaleString('ja-JP')}\` : ''}
                </div>
            </div>
        \`).join('');
    }

    async toggleTodo(id, completed) {
        try {
            const todo = this.todos.find(t => t.id === id);
            if (!todo) return;

            await this.updateTodo(id, {
                title: todo.title,
                description: todo.description,
                completed
            });
            
            this.showMessage(completed ? 'Todoを完了にしました！' : 'Todoを未完了に戻しました！', 'success');
        } catch (error) {
            this.showMessage('Todo更新に失敗しました: ' + error.message, 'error');
            // チェックボックスを元に戻す
            this.renderTodos();
        }
    }

    async editTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        const newTitle = prompt('新しいタイトル:', todo.title);
        if (newTitle === null) return;
        if (!newTitle.trim()) {
            alert('タイトルは必須です');
            return;
        }

        const newDescription = prompt('新しい説明:', todo.description || '');
        if (newDescription === null) return;

        try {
            await this.updateTodo(id, {
                title: newTitle.trim(),
                description: newDescription.trim(),
                completed: todo.completed
            });
            this.showMessage('Todoが更新されました！', 'success');
        } catch (error) {
            this.showMessage('Todo更新に失敗しました: ' + error.message, 'error');
        }
    }

    async deleteTodoWithConfirm(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        if (!confirm(\`"\${todo.title}" を削除しますか？\`)) return;

        try {
            await this.deleteTodo(id);
            this.showMessage('Todoが削除されました！', 'success');
        } catch (error) {
            this.showMessage('Todo削除に失敗しました: ' + error.message, 'error');
        }
    }

    updateTodoCount() {
        const count = this.todos.length;
        const completedCount = this.todos.filter(t => t.completed).length;
        document.getElementById('todoCount').textContent = 
            \`(\${count}件 - 完了: \${completedCount}件)\`;
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        const container = document.getElementById('todoContainer');
        
        if (show) {
            loading.style.display = 'block';
            container.style.display = 'none';
        } else {
            loading.style.display = 'none';
            container.style.display = 'block';
        }
    }

    showMessage(message, type) {
        // 既存のメッセージを削除
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = \`message \${type}\`;
        messageDiv.textContent = message;

        const todoList = document.querySelector('.todo-list');
        todoList.insertBefore(messageDiv, todoList.firstChild);

        // 3秒後に自動削除
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// アプリケーション初期化
const app = new TodoApp();

// グローバルスコープに公開（イベントハンドラー用）
window.app = app;
    `;
  }
}
```

**デプロイと確認:**
```bash
# フルWebアプリケーションをデプロイ
cdk deploy FullWebAppStack

# 出力されたWebsite URLにアクセスして完全なTodoアプリを使用
```

**特徴:**
1. **完全なCRUD操作**: Todo の作成、読取、更新、削除
2. **レスポンシブデザイン**: モバイルフレンドリーなUI
3. **リアルタイム更新**: API呼び出し後の即座のUI反映
4. **エラーハンドリング**: ユーザーフレンドリーなエラー表示
5. **モニタリング統合**: CloudWatchダッシュボードとアラート
6. **本番品質**: セキュリティ、パフォーマンス、可用性を考慮
</details>

## 5. 今日のまとめ

### 学習したこと
- カスタムConstructの設計と実装
- よく使われるデザインパターン（Factory, Builder, Observer）
- 再利用可能なコンポーネントの作成方法
- NPMパッケージとしての配布準備

### 重要なポイント
1. **抽象化の重要性**: 共通のパターンをConstructとして抽象化
2. **設計パターンの活用**: 既存のパターンをCDKに適用
3. **再利用性の追求**: チームや組織で共有できるコンポーネント設計
4. **テスタビリティ**: カスタムConstructもテスト可能に設計

### 明日の予告
明日は、作成したConstructとStackのテスト方法、CI/CDパイプラインとの統合について学習します。

---

**今日のプロジェクト構成**
```
my-first-cdk-app/
├── lib/
│   ├── constructs/
│   │   ├── secure-bucket.ts
│   │   └── serverless-api.ts
│   ├── application-stack.ts
│   └── website-stack.ts
├── bin/
│   └── my-first-cdk-app.ts
└── [その他のファイル]
```