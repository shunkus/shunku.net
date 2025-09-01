---
title: 4日目 - テストとCI/CD統合
order: 5
---

# 4日目 - テストとCI/CD統合

## 今日の目標

1. CDKアプリケーションのテスト手法を理解する
2. ユニットテストと統合テストの実装
3. CI/CDパイプラインの構築
4. 自動デプロイメントの実現

## 1. CDKテストの基礎

### 1.1 テストの種類

CDKアプリケーションでは主に以下のテストを実装します：

1. **ユニットテスト**: 個別のConstructやStackの動作確認
2. **統合テスト**: 複数のリソース間の連携確認
3. **スナップショットテスト**: CloudFormationテンプレートの変更検知
4. **アサーションテスト**: 特定のリソースプロパティの確認

### 1.2 テスト環境の準備

必要なパッケージをインストールします：

```bash
npm install --save-dev @aws-cdk/assertions jest @types/jest ts-jest
```

`jest.config.js`を作成：

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'lib/**/*.ts',
    '!lib/**/*.d.ts',
    '!lib/**/*.test.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};
```

`package.json`にテストスクリプトを追加：

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## 2. ユニットテストの実装

### 2.1 基本的なユニットテスト

`test/secure-bucket.test.ts`を作成：

```typescript
import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as iam from 'aws-cdk-lib/aws-iam';
import { SecureBucket } from '../lib/constructs/secure-bucket';

describe('SecureBucket', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new cdk.Stack(app, 'TestStack');
  });

  test('creates bucket with security best practices', () => {
    // Arrange & Act
    new SecureBucket(stack, 'TestBucket', {
      environment: 'test',
      enableVersioning: true
    });

    // Assert
    template = Template.fromStack(stack);
    
    // S3バケットが作成されることを確認
    template.hasResourceProperties('AWS::S3::Bucket', {
      VersioningConfiguration: {
        Status: 'Enabled'
      },
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true
      }
    });
  });

  test('applies correct lifecycle rules', () => {
    // Arrange & Act
    new SecureBucket(stack, 'TestBucket', {
      environment: 'test',
      lifecycleDays: 90
    });

    // Assert
    template = Template.fromStack(stack);
    
    template.hasResourceProperties('AWS::S3::Bucket', {
      LifecycleConfiguration: {
        Rules: [
          Match.objectLike({
            Id: 'DeleteOldVersions',
            Status: 'Enabled',
            NoncurrentVersionExpirationInDays: 90
          })
        ]
      }
    });
  });

  test('sets correct removal policy for prod environment', () => {
    // Arrange & Act
    new SecureBucket(stack, 'ProdBucket', {
      environment: 'prod'
    });

    // Assert
    template = Template.fromStack(stack);
    
    // 本番環境では DeletionPolicy: Retain が設定されることを確認
    template.hasResource('AWS::S3::Bucket', {
      DeletionPolicy: 'Retain'
    });
  });

  test('sets correct removal policy for dev environment', () => {
    // Arrange & Act
    new SecureBucket(stack, 'DevBucket', {
      environment: 'dev'
    });

    // Assert
    template = Template.fromStack(stack);
    
    // 開発環境では DeletionPolicy: Delete が設定されることを確認
    template.hasResource('AWS::S3::Bucket', {
      DeletionPolicy: 'Delete'
    });
  });

  test('grants correct permissions to principals', () => {
    // Arrange
    const testRole = new iam.Role(stack, 'TestRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
    });

    // Act
    const secureBucket = new SecureBucket(stack, 'TestBucket', {
      environment: 'test',
      allowedPrincipals: [testRole]
    });

    // Assert
    template = Template.fromStack(stack);
    
    template.hasResourceProperties('AWS::S3::BucketPolicy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Effect: 'Allow',
            Principal: {
              AWS: Match.anyValue()
            },
            Action: [
              's3:GetObject',
              's3:PutObject',
              's3:DeleteObject'
            ]
          })
        ])
      }
    });
  });

  test('provides correct grant methods', () => {
    // Arrange
    const testRole = new iam.Role(stack, 'TestRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
    });
    
    const secureBucket = new SecureBucket(stack, 'TestBucket', {
      environment: 'test'
    });

    // Act
    secureBucket.grantReadWrite(testRole);

    // Assert
    template = Template.fromStack(stack);
    
    // IAMポリシーが正しく作成されることを確認
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Effect: 'Allow',
            Action: Match.arrayWith(['s3:GetObject*', 's3:PutObject*'])
          })
        ])
      }
    });
  });

  test('applies correct tags', () => {
    // Arrange & Act
    new SecureBucket(stack, 'TestBucket', {
      environment: 'staging'
    });

    // Assert
    template = Template.fromStack(stack);
    
    // タグが正しく設定されることを確認
    template.hasResourceProperties('AWS::S3::Bucket', {
      Tags: Match.arrayWith([
        {
          Key: 'Environment',
          Value: 'staging'
        },
        {
          Key: 'SecurityLevel',
          Value: 'High'
        },
        {
          Key: 'ManagedBy',
          Value: 'CDK'
        }
      ])
    });
  });
});
```

### 2.2 ServerlessApi のテスト

`test/serverless-api.test.ts`を作成：

```typescript
import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { ServerlessApi } from '../lib/constructs/serverless-api';

describe('ServerlessApi', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new cdk.Stack(app, 'TestStack');
  });

  test('creates API Gateway with correct configuration', () => {
    // Arrange & Act
    new ServerlessApi(stack, 'TestApi', {
      apiName: 'test-api',
      environment: 'test'
    });

    // Assert
    template = Template.fromStack(stack);
    
    template.hasResourceProperties('AWS::ApiGateway::RestApi', {
      Name: 'test-api-test'
    });
  });

  test('creates DynamoDB table with correct schema', () => {
    // Arrange & Act
    new ServerlessApi(stack, 'TestApi', {
      apiName: 'test-api',
      environment: 'test'
    });

    // Assert
    template = Template.fromStack(stack);
    
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'test-api-test',
      KeySchema: [
        {
          AttributeName: 'pk',
          KeyType: 'HASH'
        },
        {
          AttributeName: 'sk',
          KeyType: 'RANGE'
        }
      ],
      GlobalSecondaryIndexes: [
        Match.objectLike({
          IndexName: 'gsi1',
          KeySchema: [
            {
              AttributeName: 'gsi1pk',
              KeyType: 'HASH'
            },
            {
              AttributeName: 'gsi1sk',
              KeyType: 'RANGE'
            }
          ]
        })
      ]
    });
  });

  test('enables point-in-time recovery for prod environment', () => {
    // Arrange & Act
    new ServerlessApi(stack, 'ProdApi', {
      apiName: 'prod-api',
      environment: 'prod'
    });

    // Assert
    template = Template.fromStack(stack);
    
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      PointInTimeRecoverySpecification: {
        PointInTimeRecoveryEnabled: true
      }
    });
  });

  test('adds endpoint correctly', () => {
    // Arrange
    const api = new ServerlessApi(stack, 'TestApi', {
      apiName: 'test-api',
      environment: 'test'
    });

    // Act
    api.addEndpoint({
      path: '/users',
      method: 'GET',
      functionCode: 'exports.handler = async () => ({ statusCode: 200 });'
    });

    // Assert
    template = Template.fromStack(stack);
    
    // Lambda関数が作成されることを確認
    template.hasResourceProperties('AWS::Lambda::Function', {
      Runtime: 'nodejs18.x',
      Handler: 'index.handler'
    });

    // API Gatewayリソースが作成されることを確認
    template.hasResourceProperties('AWS::ApiGateway::Resource', {
      PathPart: 'users'
    });

    // API GatewayメソッドGETが作成されることを確認
    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'GET'
    });
  });
});
```

## 3. 統合テスト

### 3.1 スタックレベルの統合テスト

`test/application-stack.test.ts`を作成：

```typescript
import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { ApplicationStack } from '../lib/application-stack';

describe('ApplicationStack', () => {
  test('creates complete Todo application', () => {
    // Arrange
    const app = new cdk.App();
    
    // Act
    const stack = new ApplicationStack(app, 'TestApplicationStack', {
      environment: 'test'
    });

    // Assert
    const template = Template.fromStack(stack);
    
    // 必要なリソースがすべて作成されることを確認
    template.resourceCountIs('AWS::S3::Bucket', 1);
    template.resourceCountIs('AWS::DynamoDB::Table', 1);
    template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
    template.resourceCountIs('AWS::Lambda::Function', 4); // 4つのエンドポイント
  });

  test('outputs are correctly defined', () => {
    // Arrange
    const app = new cdk.App();
    
    // Act
    const stack = new ApplicationStack(app, 'TestApplicationStack', {
      environment: 'test'
    });

    // Assert
    const template = Template.fromStack(stack);
    
    // 出力が正しく定義されることを確認
    template.hasOutput('ApiUrl', {});
    template.hasOutput('AssetsBucketName', {});
  });
});
```

### 3.2 End-to-End テスト

実際のAWSリソースを使用したE2Eテストの例：

`test/e2e/todo-api.e2e.test.ts`を作成：

```typescript
import * as AWS from 'aws-sdk';

// 注意: このテストは実際のAWSリソースが必要
describe('Todo API E2E', () => {
  let apiUrl: string;
  let dynamoClient: AWS.DynamoDB.DocumentClient;
  let tableName: string;

  beforeAll(async () => {
    // 環境変数からテスト用リソース情報を取得
    apiUrl = process.env.TEST_API_URL!;
    tableName = process.env.TEST_TABLE_NAME!;
    dynamoClient = new AWS.DynamoDB.DocumentClient();
    
    // テストデータをクリーンアップ
    await cleanupTestData();
  });

  afterAll(async () => {
    // テスト後のクリーンアップ
    await cleanupTestData();
  });

  test('can create and retrieve todo', async () => {
    // Arrange
    const todoData = {
      title: 'Test Todo',
      description: 'This is a test todo'
    };

    // Act - Create todo
    const createResponse = await fetch(`${apiUrl}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todoData)
    });

    expect(createResponse.status).toBe(201);
    const createdTodo = await createResponse.json();

    // Act - Retrieve todos
    const getResponse = await fetch(`${apiUrl}/todos`);
    expect(getResponse.status).toBe(200);
    
    const { todos } = await getResponse.json();
    
    // Assert
    expect(todos).toHaveLength(1);
    expect(todos[0]).toMatchObject(todoData);
  });

  test('can update todo', async () => {
    // Arrange - Create a todo first
    const createResponse = await fetch(`${apiUrl}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Original Title' })
    });
    
    const { todo } = await createResponse.json();
    const todoId = todo.pk.replace('TODO#', '');

    // Act - Update todo
    const updateData = {
      title: 'Updated Title',
      completed: true
    };

    const updateResponse = await fetch(`${apiUrl}/todos/${todoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    // Assert
    expect(updateResponse.status).toBe(200);
    const { todo: updatedTodo } = await updateResponse.json();
    expect(updatedTodo.title).toBe('Updated Title');
    expect(updatedTodo.completed).toBe(true);
  });

  async function cleanupTestData() {
    const scanResult = await dynamoClient.scan({
      TableName: tableName
    }).promise();

    if (scanResult.Items && scanResult.Items.length > 0) {
      const deletePromises = scanResult.Items.map(item =>
        dynamoClient.delete({
          TableName: tableName,
          Key: { pk: item.pk, sk: item.sk }
        }).promise()
      );

      await Promise.all(deletePromises);
    }
  }
});
```

## 4. CI/CDパイプライン

### 4.1 GitHubActionsの設定

`.github/workflows/cdk-deploy.yml`を作成：

```yaml
name: CDK Deploy

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'
  AWS_REGION: 'ap-northeast-1'

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run linter
      run: npm run lint
      
    - name: Run tests
      run: npm run test:coverage
      
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        
    - name: CDK Synth
      run: npm run cdk synth
      
    - name: Store CDK outputs
      uses: actions/upload-artifact@v3
      with:
        name: cdk-outputs
        path: cdk.out/

  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/develop'
    environment: staging
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
        
    - name: Deploy to staging
      run: |
        npm run cdk bootstrap
        npm run cdk deploy --all -c environment=staging --require-approval never

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.PROD_AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.PROD_AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
        
    - name: Deploy to production
      run: |
        npm run cdk bootstrap
        npm run cdk deploy --all -c environment=prod --require-approval never

  e2e-test:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: deploy-staging
    if: github.ref == 'refs/heads/develop'
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
        
    - name: Get stack outputs
      run: |
        API_URL=$(aws cloudformation describe-stacks \
          --stack-name Website-staging \
          --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
          --output text)
        echo "TEST_API_URL=$API_URL" >> $GITHUB_ENV
        
        TABLE_NAME=$(aws cloudformation describe-stacks \
          --stack-name Website-staging \
          --query 'Stacks[0].Outputs[?OutputKey==`TableName`].OutputValue' \
          --output text)
        echo "TEST_TABLE_NAME=$TABLE_NAME" >> $GITHUB_ENV
        
    - name: Run E2E tests
      run: npm run test:e2e
```

### 4.2 セルフホスト型CI/CD（CDK Pipelines）

CDK自体を使ってCI/CDパイプラインを構築：

`lib/pipeline-stack.ts`を作成：

```typescript
import * as cdk from 'aws-cdk-lib';
import * as pipelines from 'aws-cdk-lib/pipelines';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import { Construct } from 'constructs';
import { ApplicationStack } from './application-stack';

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // CodeCommitリポジトリ（または既存リポジトリを参照）
    const repo = new codecommit.Repository(this, 'CdkRepo', {
      repositoryName: 'cdk-todo-app'
    });

    // パイプライン
    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      pipelineName: 'CdkTodoAppPipeline',
      synth: new pipelines.ShellStep('Synth', {
        input: pipelines.CodePipelineSource.codeCommit(repo, 'main'),
        commands: [
          'npm ci',
          'npm run build',
          'npm run test',
          'npx cdk synth'
        ],
        primaryOutputDirectory: 'cdk.out',
      }),
    });

    // ステージング環境のデプロイ
    const stagingStage = new ApplicationStage(this, 'Staging', {
      environment: 'staging'
    });
    
    const stagingDeployment = pipeline.addStage(stagingStage, {
      pre: [
        new pipelines.ShellStep('Validate', {
          commands: ['npm run lint', 'npm run test']
        })
      ],
      post: [
        new pipelines.ShellStep('IntegrationTests', {
          commands: [
            'npm install',
            // ここでstagingステージの出力を使用してE2Eテストを実行
            'npm run test:integration'
          ],
          envFromCfnOutputs: {
            API_URL: stagingStage.apiUrl,
          }
        })
      ]
    });

    // 本番環境のデプロイ（手動承認付き）
    const prodStage = new ApplicationStage(this, 'Production', {
      environment: 'prod'
    });
    
    pipeline.addStage(prodStage, {
      pre: [
        new pipelines.ManualApprovalStep('PromoteToProd', {
          comment: 'Please review and approve deployment to production'
        })
      ]
    });
  }
}

// アプリケーションステージ
class ApplicationStage extends cdk.Stage {
  public readonly apiUrl: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props: {
    environment: string;
  }) {
    super(scope, id);

    const appStack = new ApplicationStack(this, 'App', {
      environment: props.environment
    });

    this.apiUrl = appStack.node.findChild('ApiUrl') as cdk.CfnOutput;
  }
}
```

## 5. テストのベストプラクティス

### 5.1 テストピラミッド

1. **ユニットテスト（多数）**
   - 個別のConstruct/Stackのテスト
   - 高速で信頼性が高い
   - 開発中に頻繁に実行

2. **統合テスト（中程度）**
   - 複数のリソース間の連携テスト
   - CloudFormationテンプレートの検証

3. **E2Eテスト（少数）**
   - 実際のAWSリソースを使用
   - 実行時間が長く、コストがかかる
   - 重要なユースケースのみ

### 5.2 モック戦略

```typescript
// AWS SDK のモック
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const ddbMock = mockClient(DynamoDBDocumentClient);

beforeEach(() => {
  ddbMock.reset();
});

test('lambda function saves item correctly', async () => {
  // Arrange
  ddbMock.on(PutCommand).resolves({});
  
  // Act & Assert
  // Lambda関数をテスト...
});
```

## 6. 演習問題と解答

### 演習 1: カスタムConstructのテスト
昨日作成したMonitoringConstructのテストを作成してください。

#### 解答 1: MonitoringConstructのテスト

`test/monitoring-construct.test.ts`を作成：

```typescript
import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as sns from 'aws-cdk-lib/aws-sns';
import { MonitoringConstruct } from '../lib/constructs/monitoring-construct';

describe('MonitoringConstruct', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let template: Template;
  let alarmTopic: sns.Topic;

  beforeEach(() => {
    app = new cdk.App();
    stack = new cdk.Stack(app, 'TestStack');
    alarmTopic = new sns.Topic(stack, 'TestTopic');
  });

  test('creates CloudWatch dashboard with correct widgets', () => {
    // Arrange & Act
    new MonitoringConstruct(stack, 'TestMonitoring', {
      applicationName: 'test-app',
      environment: 'test',
      alarmTopic
    });

    // Assert
    template = Template.fromStack(stack);
    
    template.hasResourceProperties('AWS::CloudWatch::Dashboard', {
      DashboardName: 'test-app-test-monitoring',
      DashboardBody: Match.stringLikeRegexp('.*test-app.*')
    });
  });

  test('creates API Gateway alarms', () => {
    // Arrange & Act
    new MonitoringConstruct(stack, 'TestMonitoring', {
      applicationName: 'test-app',
      environment: 'test',
      alarmTopic,
      apiName: 'test-api'
    });

    // Assert
    template = Template.fromStack(stack);
    
    // 4XX エラーアラーム
    template.hasResourceProperties('AWS::CloudWatch::Alarm', {
      AlarmName: 'test-app-test-api-4XX-errors',
      MetricName: '4XXError',
      Namespace: 'AWS/ApiGateway',
      Statistic: 'Sum',
      Threshold: 10,
      ComparisonOperator: 'GreaterThanThreshold',
      EvaluationPeriods: 2
    });

    // 5XX エラーアラーム
    template.hasResourceProperties('AWS::CloudWatch::Alarm', {
      AlarmName: 'test-app-test-api-5XX-errors',
      MetricName: '5XXError',
      Namespace: 'AWS/ApiGateway',
      Statistic: 'Sum',
      Threshold: 5,
      ComparisonOperator: 'GreaterThanThreshold'
    });

    // レイテンシアラーム
    template.hasResourceProperties('AWS::CloudWatch::Alarm', {
      AlarmName: 'test-app-test-api-high-latency',
      MetricName: 'Latency',
      Namespace: 'AWS/ApiGateway',
      Statistic: 'Average',
      Threshold: 3000,
      ComparisonOperator: 'GreaterThanThreshold'
    });
  });

  test('creates DynamoDB alarms when table name provided', () => {
    // Arrange & Act
    new MonitoringConstruct(stack, 'TestMonitoring', {
      applicationName: 'test-app',
      environment: 'test',
      alarmTopic,
      dynamoTableName: 'test-table'
    });

    // Assert
    template = Template.fromStack(stack);
    
    // スロットルアラーム
    template.hasResourceProperties('AWS::CloudWatch::Alarm', {
      AlarmName: 'test-app-test-table-read-throttled',
      MetricName: 'ReadThrottleEvents',
      Namespace: 'AWS/DynamoDB',
      Dimensions: [{ Name: 'TableName', Value: 'test-table' }],
      Statistic: 'Sum',
      Threshold: 0,
      ComparisonOperator: 'GreaterThanThreshold'
    });

    template.hasResourceProperties('AWS::CloudWatch::Alarm', {
      AlarmName: 'test-app-test-table-write-throttled',
      MetricName: 'WriteThrottleEvents',
      Namespace: 'AWS/DynamoDB'
    });
  });

  test('creates Lambda alarms when function names provided', () => {
    // Arrange & Act
    new MonitoringConstruct(stack, 'TestMonitoring', {
      applicationName: 'test-app',
      environment: 'test',
      alarmTopic,
      lambdaFunctionNames: ['func1', 'func2']
    });

    // Assert
    template = Template.fromStack(stack);
    
    // エラーアラーム（各関数に対して作成される）
    template.hasResourceProperties('AWS::CloudWatch::Alarm', {
      AlarmName: 'test-app-func1-errors',
      MetricName: 'Errors',
      Namespace: 'AWS/Lambda',
      Dimensions: [{ Name: 'FunctionName', Value: 'func1' }],
      Statistic: 'Sum',
      Threshold: 5,
      ComparisonOperator: 'GreaterThanThreshold'
    });

    template.hasResourceProperties('AWS::CloudWatch::Alarm', {
      AlarmName: 'test-app-func2-errors',
      MetricName: 'Errors',
      Namespace: 'AWS/Lambda',
      Dimensions: [{ Name: 'FunctionName', Value: 'func2' }]
    });

    // 実行時間アラーム
    template.hasResourceProperties('AWS::CloudWatch::Alarm', {
      AlarmName: 'test-app-func1-duration',
      MetricName: 'Duration',
      Namespace: 'AWS/Lambda',
      Statistic: 'Average',
      Threshold: 30000,
      ComparisonOperator: 'GreaterThanThreshold'
    });
  });

  test('all alarms are configured with correct SNS action', () => {
    // Arrange & Act
    new MonitoringConstruct(stack, 'TestMonitoring', {
      applicationName: 'test-app',
      environment: 'test',
      alarmTopic,
      apiName: 'test-api',
      dynamoTableName: 'test-table',
      lambdaFunctionNames: ['test-func']
    });

    // Assert
    template = Template.fromStack(stack);
    
    // すべてのアラームにSNSアクションが設定されていることを確認
    const alarms = template.findResources('AWS::CloudWatch::Alarm');
    Object.values(alarms).forEach(alarm => {
      expect(alarm.Properties.AlarmActions).toEqual([{ Ref: Match.anyValue() }]);
    });
  });

  test('dashboard includes all necessary widgets', () => {
    // Arrange & Act
    new MonitoringConstruct(stack, 'TestMonitoring', {
      applicationName: 'test-app',
      environment: 'test',
      alarmTopic,
      apiName: 'test-api',
      dynamoTableName: 'test-table',
      lambdaFunctionNames: ['test-func']
    });

    // Assert
    template = Template.fromStack(stack);
    
    const dashboard = template.findResources('AWS::CloudWatch::Dashboard');
    const dashboardBody = JSON.parse(dashboard[Object.keys(dashboard)[0]].Properties.DashboardBody);
    
    // ウィジェットの存在確認
    expect(dashboardBody.widgets).toBeDefined();
    expect(dashboardBody.widgets.length).toBeGreaterThan(0);
    
    // API Gatewayウィジェットの確認
    const apiWidgets = dashboardBody.widgets.filter((widget: any) => 
      JSON.stringify(widget).includes('AWS/ApiGateway')
    );
    expect(apiWidgets.length).toBeGreaterThan(0);
    
    // DynamoDBウィジェットの確認
    const dynamoWidgets = dashboardBody.widgets.filter((widget: any) => 
      JSON.stringify(widget).includes('AWS/DynamoDB')
    );
    expect(dynamoWidgets.length).toBeGreaterThan(0);
    
    // Lambdaウィジェットの確認
    const lambdaWidgets = dashboardBody.widgets.filter((widget: any) => 
      JSON.stringify(widget).includes('AWS/Lambda')
    );
    expect(lambdaWidgets.length).toBeGreaterThan(0);
  });

  test('handles minimal configuration correctly', () => {
    // Arrange & Act
    new MonitoringConstruct(stack, 'MinimalMonitoring', {
      applicationName: 'minimal-app',
      environment: 'test',
      alarmTopic
    });

    // Assert
    template = Template.fromStack(stack);
    
    // ダッシュボードは作成される
    template.resourceCountIs('AWS::CloudWatch::Dashboard', 1);
    
    // アプリケーション固有のアラームは作成されない
    const alarms = template.findResources('AWS::CloudWatch::Alarm');
    expect(Object.keys(alarms).length).toBe(0);
  });
});
```

### 演習 2: パイプライン改善
現在のパイプラインに以下の機能を追加してください：

1. セキュリティスキャン（cdk-nag）
2. パフォーマンステスト
3. ロールバック機能

#### 解答 2: 改善されたパイプライン

まず必要なパッケージを追加：

```bash
npm install --save-dev cdk-nag
npm install --save-dev artillery  # パフォーマンステスト用
```

改善された`lib/pipeline-stack.ts`：

```typescript
import * as cdk from 'aws-cdk-lib';
import * as pipelines from 'aws-cdk-lib/pipelines';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { ApplicationStack } from './application-stack';

export class EnhancedPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // アーティファクト保存用S3バケット
    const artifactsBucket = new s3.Bucket(this, 'PipelineArtifacts', {
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      lifecycleRules: [{
        id: 'DeleteOldArtifacts',
        enabled: true,
        expiration: cdk.Duration.days(30)
      }]
    });

    const repo = new codecommit.Repository(this, 'CdkRepo', {
      repositoryName: 'cdk-todo-app'
    });

    // セキュリティスキャン用のビルドプロジェクト
    const securityScanProject = new codebuild.Project(this, 'SecurityScan', {
      source: codebuild.Source.codeCommit({ repository: repo }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        computeType: codebuild.ComputeType.SMALL
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            'runtime-versions': {
              nodejs: '18'
            },
            commands: [
              'npm ci'
            ]
          },
          pre_build: {
            commands: [
              'echo Running security scan...',
              'npx cdk synth'
            ]
          },
          build: {
            commands: [
              '# CDK-NAG セキュリティチェック',
              'node security-scan.js'
            ]
          }
        },
        artifacts: {
          files: [
            'security-report.json',
            'cdk.out/**/*'
          ]
        }
      })
    });

    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      pipelineName: 'EnhancedCdkTodoAppPipeline',
      artifactBucket: artifactsBucket,
      synth: new pipelines.ShellStep('Synth', {
        input: pipelines.CodePipelineSource.codeCommit(repo, 'main'),
        commands: [
          'npm ci',
          'npm run build',
          'npm run test:coverage',
          'npx cdk synth'
        ],
        primaryOutputDirectory: 'cdk.out',
      }),
      // セルフミューテーションを有効化（パイプライン自体の更新）
      selfMutation: true,
      // クロスアカウントキーを使用
      crossAccountKeys: true
    });

    // セキュリティスキャンステップ
    const securityScanStep = new pipelines.CodeBuildStep('SecurityScan', {
      project: securityScanProject,
      input: pipelines.CodePipelineSource.codeCommit(repo, 'main'),
      commands: [], // BuildSpecで定義済み
      primaryOutputDirectory: 'cdk.out'
    });

    // ステージング環境のデプロイ
    const stagingStage = new ApplicationStage(this, 'Staging', {
      environment: 'staging'
    });
    
    const stagingDeployment = pipeline.addStage(stagingStage, {
      pre: [
        // セキュリティスキャン
        securityScanStep,
        // 追加のバリデーション
        new pipelines.ShellStep('PreDeployValidation', {
          commands: [
            'echo Validating infrastructure...',
            'npm run lint',
            'npm run test',
            'npm run validate-config'
          ]
        })
      ],
      post: [
        // パフォーマンステスト
        new pipelines.ShellStep('PerformanceTests', {
          commands: [
            'npm install -g artillery',
            'echo Running performance tests...',
            'artillery run performance-tests/load-test.yml --output performance-report.json',
            'artillery report performance-report.json --output performance-report.html',
            '# パフォーマンス結果の検証',
            'node validate-performance.js performance-report.json'
          ],
          envFromCfnOutputs: {
            API_URL: stagingStage.apiUrl,
          }
        }),
        // 統合テスト
        new pipelines.ShellStep('IntegrationTests', {
          commands: [
            'npm install',
            'npm run test:integration',
            '# スモークテスト',
            'npm run test:smoke'
          ],
          envFromCfnOutputs: {
            API_URL: stagingStage.apiUrl,
            TABLE_NAME: stagingStage.tableName
          }
        })
      ]
    });

    // 本番環境のデプロイ（手動承認付き + ロールバック機能）
    const prodStage = new ApplicationStage(this, 'Production', {
      environment: 'prod'
    });
    
    const prodDeployment = pipeline.addStage(prodStage, {
      pre: [
        // 最終的な手動承認
        new pipelines.ManualApprovalStep('PromoteToProd', {
          comment: `
🚀 本番環境へのデプロイ承認

📋 デプロイ前チェックリスト:
- [ ] ステージング環境でのテストが全て成功している
- [ ] セキュリティスキャンが通過している  
- [ ] パフォーマンステストの結果が許容範囲内
- [ ] 関係者への事前通知が完了している
- [ ] ロールバック手順が準備できている

⚠️ 承認後、本番環境に変更が適用されます。
🔄 問題が発生した場合は、即座にロールバックしてください。
          `
        }),
        // 本番前最終チェック
        new pipelines.ShellStep('PreProdValidation', {
          commands: [
            'echo Final validation before production deployment...',
            'npm run validate-prod-config',
            '# データベースの健全性チェック',
            'npm run check-data-integrity'
          ]
        })
      ],
      post: [
        // デプロイ後の検証
        new pipelines.ShellStep('PostDeployValidation', {
          commands: [
            'echo Validating production deployment...',
            '# 本番環境のヘルスチェック',
            'npm run health-check',
            '# クリティカルパスのテスト',
            'npm run test:critical-path',
            '# メトリクス確認',
            'npm run verify-metrics'
          ],
          envFromCfnOutputs: {
            API_URL: prodStage.apiUrl,
          }
        }),
        // ロールバックの準備
        new pipelines.ShellStep('PrepareRollback', {
          commands: [
            'echo Preparing rollback information...',
            '# 現在のデプロイメント情報を保存',
            'aws cloudformation describe-stacks --stack-name Website-prod > current-deployment.json',
            '# ロールバックスクリプトの準備',
            'echo "aws cloudformation cancel-update-stack --stack-name Website-prod" > rollback.sh',
            'echo "aws cloudformation continue-update-rollback --stack-name Website-prod" >> rollback.sh',
            'chmod +x rollback.sh',
            '# S3にロールバック情報をアップロード',
            'aws s3 cp current-deployment.json s3://rollback-info-bucket/$(date +%Y%m%d-%H%M%S)/',
            'aws s3 cp rollback.sh s3://rollback-info-bucket/$(date +%Y%m%d-%H%M%S)/'
          ]
        })
      ]
    });

    // ロールバック用の手動ステップを追加
    const rollbackStage = new cdk.Stage(this, 'Rollback');
    const rollbackStep = new pipelines.ManualApprovalStep('InitiateRollback', {
      comment: `
🔄 緊急ロールバック

⚠️ 本番環境で問題が検出された場合のみ実行してください。

📋 ロールバック前チェックリスト:
- [ ] 問題の性質と影響範囲を確認済み
- [ ] ロールバックによる副作用を検討済み
- [ ] 関係者への通知が完了している
- [ ] データの整合性が保たれることを確認済み

🎯 ロールバック手順:
1. この承認後、自動的に前のバージョンに戻ります
2. ロールバック完了後、システムの健全性を確認してください
3. 根本原因の調査と修正を行ってください

承認するとロールバックが実行されます。
      `
    });

    // 波及用のCfnOutput
    new cdk.CfnOutput(this, 'PipelineName', {
      value: pipeline.pipeline.pipelineName,
      description: 'Name of the deployment pipeline'
    });

    new cdk.CfnOutput(this, 'ArtifactsBucket', {
      value: artifactsBucket.bucketName,
      description: 'S3 bucket for pipeline artifacts'
    });
  }
}

// アプリケーションステージ（拡張版）
class ApplicationStage extends cdk.Stage {
  public readonly apiUrl: cdk.CfnOutput;
  public readonly tableName: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props: {
    environment: string;
  }) {
    super(scope, id);

    const appStack = new ApplicationStack(this, 'App', {
      environment: props.environment
    });

    // 出力値を取得
    this.apiUrl = appStack.node.findChild('ApiUrl') as cdk.CfnOutput;
    
    // テーブル名の出力を追加
    this.tableName = new cdk.CfnOutput(appStack, 'TableName', {
      value: appStack.table.tableName,
      description: 'DynamoDB table name'
    });
  }
}
```

セキュリティスキャン用のスクリプト `security-scan.js`：

```javascript
const { AwsCdkNagApp } = require('cdk-nag');
const fs = require('fs');

// CDK-NAGを使用してセキュリティスキャンを実行
async function runSecurityScan() {
    try {
        console.log('🔍 Running security scan with CDK-NAG...');
        
        // CDK-NAG の実行
        const nagApp = new AwsCdkNagApp({
            cdkOutDir: './cdk.out'
        });
        
        const findings = await nagApp.scan();
        
        // 結果をレポートとして保存
        const report = {
            timestamp: new Date().toISOString(),
            totalFindings: findings.length,
            highSeverity: findings.filter(f => f.severity === 'HIGH').length,
            mediumSeverity: findings.filter(f => f.severity === 'MEDIUM').length,
            lowSeverity: findings.filter(f => f.severity === 'LOW').length,
            findings: findings
        };
        
        fs.writeFileSync('security-report.json', JSON.stringify(report, null, 2));
        
        console.log(`📊 Security scan completed:`);
        console.log(`   Total findings: ${report.totalFindings}`);
        console.log(`   High severity: ${report.highSeverity}`);
        console.log(`   Medium severity: ${report.mediumSeverity}`);
        console.log(`   Low severity: ${report.lowSeverity}`);
        
        // 高重要度の問題がある場合はビルドを失敗させる
        if (report.highSeverity > 0) {
            console.error('❌ High severity security issues found. Failing build.');
            process.exit(1);
        }
        
        console.log('✅ Security scan passed!');
        
    } catch (error) {
        console.error('❌ Security scan failed:', error);
        process.exit(1);
    }
}

runSecurityScan();
```

パフォーマンステスト設定 `performance-tests/load-test.yml`：

```yaml
config:
  target: "{{ $processEnvironment.API_URL }}"
  phases:
    # ウォームアップフェーズ
    - duration: 60
      arrivalRate: 1
      name: "Warm-up"
    # 負荷段階的増加
    - duration: 300
      arrivalRate: 5
      rampTo: 25
      name: "Ramp-up load"
    # 持続負荷テスト
    - duration: 600
      arrivalRate: 25
      name: "Sustained load"
    # ピーク負荷テスト
    - duration: 120
      arrivalRate: 50
      name: "Peak load"

scenarios:
  # 基本的なAPIテスト
  - name: "Basic API operations"
    weight: 60
    flow:
      - get:
          url: "/todos"
      - think: 2
      - post:
          url: "/todos"
          json:
            title: "Test Todo {{ $randomString() }}"
            description: "Performance test todo"
      - think: 1
      - get:
          url: "/todos"
  
  # 読み取り集約的なテスト
  - name: "Read-heavy operations"
    weight: 30
    flow:
      - loop:
          - get:
              url: "/todos"
          - think: 1
        count: 5
  
  # 書き込み集約的なテスト
  - name: "Write-heavy operations"
    weight: 10
    flow:
      - post:
          url: "/todos"
          json:
            title: "Bulk Test {{ $randomString() }}"
            description: "Bulk operation test"
      - think: 1
      - put:
          url: "/todos/{{ $randomString() }}"
          json:
            title: "Updated Todo"
            completed: true

# パフォーマンスメトリクスの閾値
expect:
  - statusCode: 200
  - hasProperty: 'todos'
  - maxResponseTime: 3000
```

パフォーマンス結果検証スクリプト `validate-performance.js`：

```javascript
const fs = require('fs');

function validatePerformance(reportFile) {
    try {
        const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
        
        console.log('📈 Performance Test Results:');
        console.log(`   Total requests: ${report.aggregate.counters['vusers.completed'] || 0}`);
        console.log(`   Success rate: ${((1 - (report.aggregate.counters['errors.total'] || 0) / (report.aggregate.counters['vusers.completed'] || 1)) * 100).toFixed(2)}%`);
        console.log(`   Average response time: ${report.aggregate.summaries?.['http.response_time']?.mean || 0}ms`);
        console.log(`   95th percentile: ${report.aggregate.summaries?.['http.response_time']?.p95 || 0}ms`);
        console.log(`   99th percentile: ${report.aggregate.summaries?.['http.response_time']?.p99 || 0}ms`);
        
        // パフォーマンス基準のチェック
        const errorRate = (report.aggregate.counters['errors.total'] || 0) / (report.aggregate.counters['vusers.completed'] || 1);
        const avgResponseTime = report.aggregate.summaries?.['http.response_time']?.mean || 0;
        const p95ResponseTime = report.aggregate.summaries?.['http.response_time']?.p95 || 0;
        
        let passed = true;
        
        if (errorRate > 0.01) { // 1%以下のエラー率
            console.error(`❌ Error rate too high: ${(errorRate * 100).toFixed(2)}%`);
            passed = false;
        }
        
        if (avgResponseTime > 1000) { // 平均1秒以下
            console.error(`❌ Average response time too high: ${avgResponseTime}ms`);
            passed = false;
        }
        
        if (p95ResponseTime > 3000) { // 95%タイルが3秒以下
            console.error(`❌ 95th percentile response time too high: ${p95ResponseTime}ms`);
            passed = false;
        }
        
        if (passed) {
            console.log('✅ Performance tests passed!');
            process.exit(0);
        } else {
            console.error('❌ Performance tests failed!');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ Failed to validate performance results:', error);
        process.exit(1);
    }
}

// コマンドライン引数からレポートファイルを取得
const reportFile = process.argv[2];
if (!reportFile) {
    console.error('Usage: node validate-performance.js <report-file>');
    process.exit(1);
}

validatePerformance(reportFile);
```

この改善されたパイプラインには以下の機能が含まれています：

1. **セキュリティスキャン**: CDK-NAGを使用した自動セキュリティチェック
2. **パフォーマンステスト**: Artilleryを使用した負荷テストと結果検証
3. **ロールバック機能**: 問題発生時の即座のロールバック対応
4. **詳細な監視**: 各ステップでの健全性チェック
5. **アーティファクト管理**: パイプライン成果物の適切な保存と管理

## 7. 今日のまとめ

### 学習したこと
- CDKアプリケーションのテスト手法
- ユニットテスト、統合テスト、E2Eテストの実装
- CI/CDパイプラインの構築（GitHub Actions + CDK Pipelines）
- テストのベストプラクティスとモック戦略

### 重要なポイント
1. **テストピラミッド**: 適切なテストバランスの維持
2. **自動化**: CI/CDによる品質保証の自動化
3. **環境分離**: 開発・ステージング・本番環境の適切な管理
4. **フィードバックループ**: 早期発見・早期修正

### 明日の予告
最終日は、セキュリティベストプラクティス、監視・ログ設定、本番運用のポイントについて学習します。

---

**テスト実行コマンド**
```bash
# 全テスト実行
npm run test

# カバレッジ付きテスト
npm run test:coverage

# ウォッチモード
npm run test:watch

# E2Eテスト
npm run test:e2e
```