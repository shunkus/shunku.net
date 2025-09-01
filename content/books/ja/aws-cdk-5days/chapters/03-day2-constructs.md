---
title: 2日目 - コアConstructとStackの理解
order: 3
---

# 2日目 - コアConstructとStackの理解

## 今日の目標

1. Construct、Stack、Appの階層構造を理解する
2. 複数のAWSサービスを組み合わせる
3. サーバーレスWebアプリケーションの基盤を構築する
4. 環境ごとの設定管理を学ぶ

## 1. CDKの三層構造

### 1.1 Construct階層の理解

CDKは三つのレベルのConstructsを提供しています：

#### L1 Constructs (CFN Resources)
- CloudFormationリソースの直接的なラッパー
- プレフィックス `Cfn` が付く
- 最も細かい制御が可能、但し設定が複雑

```typescript
import * as cdk from 'aws-cdk-lib';

// L1 Construct の例
const cfnBucket = new cdk.aws_s3.CfnBucket(this, 'L1Bucket', {
  bucketName: 'my-l1-bucket',
  versioningConfiguration: {
    status: 'Enabled'
  }
});
```

#### L2 Constructs (AWS Constructs)
- AWSサービスの高レベルなラッパー
- 合理的なデフォルト値を提供
- 最も一般的に使用される

```typescript
import * as s3 from 'aws-cdk-lib/aws-s3';

// L2 Construct の例
const bucket = new s3.Bucket(this, 'L2Bucket', {
  versioned: true,
  bucketName: 'my-l2-bucket'
});
```

#### L3 Constructs (Patterns)
- 複数のAWSサービスを組み合わせたパターン
- ベストプラクティスを内包
- 特定のユースケース向け

```typescript
import * as patterns from 'aws-cdk-lib/aws-s3-deployment';

// L3 Construct の例
new patterns.BucketDeployment(this, 'DeployWebsite', {
  sources: [patterns.Source.asset('./website')],
  destinationBucket: bucket
});
```

## 2. 実践: 静的ウェブサイトの構築

昨日のプロジェクトを拡張して、CloudFrontを使った静的ウェブサイトを構築します。

### 2.1 新しい依存関係の追加

```bash
npm install @aws-cdk/aws-cloudfront-origins
```

### 2.2 Stack の更新

`lib/my-first-cdk-app-stack.ts`を以下のように更新します：

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

export class MyFirstCdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3バケット（静的ウェブサイトホスティング用）
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `my-website-bucket-${Date.now()}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // CloudFront経由でのみアクセス
    });

    // Origin Access Identity
    const oai = new cloudfront.OriginAccessIdentity(this, 'OAI', {
      comment: `OAI for ${websiteBucket.bucketName}`
    });

    // S3バケットポリシー
    websiteBucket.addToResourcePolicy(new cdk.aws_iam.PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [websiteBucket.arnForObjects('*')],
      principals: [new cdk.aws_iam.CanonicalUserPrincipal(
        oai.cloudFrontOriginAccessIdentityS3CanonicalUserId
      )]
    }));

    // CloudFront Distribution
    const distribution = new cloudfront.Distribution(this, 'WebsiteDistribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket, {
          originAccessIdentity: oai
        }),
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0),
        }
      ]
    });

    // 簡単なHTMLファイルをデプロイ
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.inline('index.html', `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First CDK Website</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; }
        .info { background: #e3f2fd; padding: 20px; border-radius: 4px; margin: 20px 0; }
        .timestamp { color: #666; font-size: 0.9em; text-align: center; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 AWS CDKで作成したウェブサイト</h1>
        <div class="info">
            <p><strong>おめでとうございます！</strong></p>
            <p>AWS CDKを使用して、S3とCloudFrontを組み合わせた静的ウェブサイトの作成に成功しました。</p>
            <ul>
                <li>✅ S3バケットでコンテンツをホスティング</li>
                <li>✅ CloudFrontでグローバル配信</li>
                <li>✅ HTTPS対応</li>
                <li>✅ Infrastructure as Codeで管理</li>
            </ul>
        </div>
        <div class="timestamp">
            <p>デプロイ日時: ${new Date().toLocaleString('ja-JP')}</p>
        </div>
    </div>
</body>
</html>
      `)],
      destinationBucket: websiteBucket,
      distribution: distribution,
      distributionPaths: ['/*'], // キャッシュを無効化
    });

    // 出力
    new cdk.CfnOutput(this, 'WebsiteBucketName', {
      value: websiteBucket.bucketName,
      description: 'Name of the S3 bucket for website hosting',
    });

    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: distribution.distributionDomainName,
      description: 'CloudFront distribution domain name',
    });

    new cdk.CfnOutput(this, 'WebsiteURL', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'Website URL',
    });
  }
}
```

### 2.3 デプロイと確認

```bash
# 差分確認
cdk diff

# デプロイ
cdk deploy
```

デプロイが完了したら、出力されたWebsite URLにアクセスして確認してみましょう。

## 3. 複数Stackの管理

### 3.1 環境別Stackの作成

実際のプロジェクトでは、開発環境、ステージング環境、本番環境など複数の環境を管理する必要があります。

新しいファイル`lib/website-stack.ts`を作成：

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';

export interface WebsiteStackProps extends cdk.StackProps {
  environment: string;
  domainName?: string;
}

export class WebsiteStack extends cdk.Stack {
  public readonly bucket: s3.Bucket;
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: WebsiteStackProps) {
    super(scope, id, props);

    const { environment } = props;

    // 環境ごとに設定を変更
    const bucketProps: s3.BucketProps = {
      bucketName: `my-website-${environment}-${Date.now()}`,
      removalPolicy: environment === 'prod' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: environment !== 'prod',
      versioned: environment === 'prod',
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    };

    this.bucket = new s3.Bucket(this, 'WebsiteBucket', bucketProps);

    // Origin Access Identity
    const oai = new cloudfront.OriginAccessIdentity(this, 'OAI', {
      comment: `OAI for ${this.bucket.bucketName}`
    });

    // S3バケットポリシー
    this.bucket.addToResourcePolicy(new cdk.aws_iam.PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [this.bucket.arnForObjects('*')],
      principals: [new cdk.aws_iam.CanonicalUserPrincipal(
        oai.cloudFrontOriginAccessIdentityS3CanonicalUserId
      )]
    }));

    // CloudFront設定（環境別）
    const distributionProps: cloudfront.DistributionProps = {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: new origins.S3Origin(this.bucket, {
          originAccessIdentity: oai
        }),
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      // 本番環境では長時間キャッシュ、開発環境では短時間
      defaultBehavior: {
        ...distributionProps.defaultBehavior,
        cachePolicy: environment === 'prod'
          ? cloudfront.CachePolicy.CACHING_OPTIMIZED
          : cloudfront.CachePolicy.CACHING_DISABLED
      },
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0),
        }
      ]
    };

    this.distribution = new cloudfront.Distribution(this, 'Distribution', distributionProps);

    // タグ付け（環境管理用）
    cdk.Tags.of(this).add('Environment', environment);
    cdk.Tags.of(this).add('Project', 'CDK-Learning');

    // 出力
    new cdk.CfnOutput(this, 'BucketName', {
      value: this.bucket.bucketName,
      exportName: `${environment}-website-bucket-name`,
    });

    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: this.distribution.distributionDomainName,
      exportName: `${environment}-website-domain`,
    });

    new cdk.CfnOutput(this, 'WebsiteURL', {
      value: `https://${this.distribution.distributionDomainName}`,
      exportName: `${environment}-website-url`,
    });
  }
}
```

### 3.2 アプリケーションエントリーポイントの更新

`bin/my-first-cdk-app.ts`を更新：

```typescript
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { WebsiteStack } from '../lib/website-stack';

const app = new cdk.App();

// 環境変数から環境を取得（デフォルトはdev）
const environment = app.node.tryGetContext('environment') || 'dev';

// 環境別のStack作成
new WebsiteStack(app, `Website-${environment}`, {
  environment,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  description: `Website stack for ${environment} environment`,
});
```

### 3.3 環境別デプロイ

```bash
# 開発環境
cdk deploy -c environment=dev

# ステージング環境
cdk deploy -c environment=staging

# 本番環境
cdk deploy -c environment=prod
```

## 4. 設定管理のベストプラクティス

### 4.1 設定ファイルの作成

`config/environments.ts`を作成：

```typescript
export interface EnvironmentConfig {
  environment: string;
  region: string;
  bucketRetention: boolean;
  cachingEnabled: boolean;
  domainName?: string;
  certificateArn?: string;
}

export const environments: Record<string, EnvironmentConfig> = {
  dev: {
    environment: 'dev',
    region: 'ap-northeast-1',
    bucketRetention: false,
    cachingEnabled: false,
  },
  staging: {
    environment: 'staging', 
    region: 'ap-northeast-1',
    bucketRetention: false,
    cachingEnabled: true,
  },
  prod: {
    environment: 'prod',
    region: 'ap-northeast-1',
    bucketRetention: true,
    cachingEnabled: true,
    domainName: 'example.com',
    certificateArn: 'arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012',
  }
};
```

### 4.2 設定を使用したStackの更新

設定ファイルを利用してStackを更新します：

```typescript
import { environments, EnvironmentConfig } from '../config/environments';

export class WebsiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: WebsiteStackProps) {
    super(scope, id, props);

    const config: EnvironmentConfig = environments[props.environment];
    
    // 設定に基づいてリソースを作成
    this.bucket = new s3.Bucket(this, 'WebsiteBucket', {
      removalPolicy: config.bucketRetention 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
      // その他の設定...
    });
  }
}
```

## 5. リソース間の依存関係

### 5.1 Cross-Stack参照

異なるStack間でリソースを参照する方法：

```typescript
// データベースStack
export class DatabaseStack extends cdk.Stack {
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.table = new dynamodb.Table(this, 'DataTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    });
  }
}

// アプリケーションStack（データベースStackを参照）
export class ApplicationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApplicationStackProps) {
    super(scope, id, props);

    // 他のStackのリソースを参照
    const tableName = props.databaseStack.table.tableName;
    
    // Lambda関数で使用
    const lambda = new lambda.Function(this, 'MyFunction', {
      // ...
      environment: {
        TABLE_NAME: tableName
      }
    });
    
    // Lambdaにテーブルアクセス権限を付与
    props.databaseStack.table.grantReadWriteData(lambda);
  }
}
```

## 6. 演習問題

### 演習 1: Lambda関数の追加
現在の静的ウェブサイトに、簡単なAPI機能を追加してください：

1. Lambda関数を作成（現在時刻を返すAPI）
2. API Gatewayを設定
3. ウェブサイトからAPIを呼び出すJavaScriptを追加

<details>
<summary>解答例</summary>

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';

export class WebsiteWithApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. Lambda関数を作成（現在時刻を返すAPI）
    const timeFunction = new lambda.Function(this, 'TimeFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          console.log('Request:', JSON.stringify(event, null, 2));
          
          return {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              currentTime: new Date().toISOString(),
              message: 'Hello from AWS CDK Lambda!',
              timestamp: Date.now(),
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            })
          };
        };
      `),
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(30),
      memorySize: 128,
    });

    // 2. API Gatewayを設定
    const api = new apigateway.RestApi(this, 'TimeApi', {
      restApiName: 'Time Service API',
      description: 'Simple API to get current time',
      // CORS設定
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    const timeIntegration = new apigateway.LambdaIntegration(timeFunction, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
    });

    const timeResource = api.root.addResource('time');
    timeResource.addMethod('GET', timeIntegration);

    // 既存のS3とCloudFrontの設定
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `my-website-with-api-${Date.now()}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    const oai = new cloudfront.OriginAccessIdentity(this, 'OAI', {
      comment: `OAI for ${websiteBucket.bucketName}`
    });

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
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0),
        }
      ]
    });

    // 3. ウェブサイトからAPIを呼び出すJavaScriptを含むHTMLをデプロイ
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.inline('index.html', `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CDK Website with API</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            background: #f5f5f5; 
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            padding: 40px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
        }
        h1 { 
            color: #333; 
            text-align: center; 
        }
        .api-section {
            background: #e8f4fd;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        button {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background: #0056b3;
        }
        button:disabled {
            background: #6c757d;
            cursor: not-allowed;
        }
        .result {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            padding: 15px;
            border-radius: 4px;
            margin-top: 15px;
            white-space: pre-wrap;
        }
        .loading {
            color: #6c757d;
            font-style: italic;
        }
        .error {
            color: #dc3545;
        }
        .success {
            color: #28a745;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 CDK Website with API</h1>
        
        <div class="api-section">
            <h3>📡 API Test</h3>
            <p>以下のボタンをクリックして、Lambda関数からデータを取得してみましょう：</p>
            
            <button id="fetchTimeBtn" onclick="fetchCurrentTime()">現在時刻を取得</button>
            
            <div id="result" class="result" style="display:none;"></div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #666;">
            <p>API URL: ${api.url}</p>
            <p>デプロイ日時: ${new Date().toLocaleString('ja-JP')}</p>
        </div>
    </div>

    <script>
        const API_URL = '${api.url}time';
        
        async function fetchCurrentTime() {
            const button = document.getElementById('fetchTimeBtn');
            const resultDiv = document.getElementById('result');
            
            // ボタンを無効化してローディング表示
            button.disabled = true;
            button.textContent = '取得中...';
            resultDiv.style.display = 'block';
            resultDiv.className = 'result loading';
            resultDiv.textContent = 'API からデータを取得しています...';
            
            try {
                console.log('Fetching from:', API_URL);
                
                const response = await fetch(API_URL, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                
                console.log('Response status:', response.status);
                
                if (!response.ok) {
                    throw new Error(\`HTTP error! status: \${response.status}\`);
                }
                
                const data = await response.json();
                console.log('Response data:', data);
                
                // 成功時の表示
                resultDiv.className = 'result success';
                resultDiv.textContent = \`✅ API レスポンス:
                
現在時刻: \${new Date(data.currentTime).toLocaleString('ja-JP')}
メッセージ: \${data.message}
タイムスタンプ: \${data.timestamp}
タイムゾーン: \${data.timezone || '不明'}

Raw JSON:
\${JSON.stringify(data, null, 2)}\`;
                
            } catch (error) {
                console.error('Error:', error);
                
                // エラー時の表示
                resultDiv.className = 'result error';
                resultDiv.textContent = \`❌ エラーが発生しました:
                
エラーメッセージ: \${error.message}
API URL: \${API_URL}

トラブルシューティング:
1. API Gatewayが正しくデプロイされているか確認してください
2. Lambda関数がエラーを返していないか確認してください
3. CORS設定が正しいか確認してください\`;
            } finally {
                // ボタンを元に戻す
                button.disabled = false;
                button.textContent = '現在時刻を取得';
            }
        }
        
        // ページロード時にAPI URLをログに出力
        console.log('API endpoint:', API_URL);
    </script>
</body>
</html>
      `)],
      destinationBucket: websiteBucket,
      distribution: distribution,
      distributionPaths: ['/*'],
    });

    // 出力
    new cdk.CfnOutput(this, 'WebsiteURL', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'Website URL with API integration',
    });

    new cdk.CfnOutput(this, 'ApiURL', {
      value: api.url,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'TimeEndpoint', {
      value: `${api.url}time`,
      description: 'Time API endpoint',
    });
  }
}
```

**実装のポイント：**

1. **Lambda関数**: 現在時刻とタイムゾーン情報を返すシンプルなAPI
2. **CORS設定**: ブラウザからのクロスオリジンリクエストを許可
3. **エラーハンドリング**: JavaScriptでAPIエラーを適切に処理
4. **ユーザビリティ**: ローディング表示とわかりやすいエラーメッセージ
5. **デバッグ支援**: コンソールログとAPIエンドポイントの表示

**デプロイと確認方法：**
```bash
cdk deploy
# 出力されたWebsite URLにアクセスして「現在時刻を取得」ボタンをテスト
```
</details>

### 演習 2: 環境ごとの設定
以下の要件で環境別設定を実装してください：

1. dev環境：キャッシュ無効、リソース削除可能
2. prod環境：キャッシュ有効、リソース保持、バージョニング有効
3. 環境変数でAPI URLを設定

<details>
<summary>解答例</summary>

**設定ファイルの作成:** `config/environments.ts`
```typescript
export interface EnvironmentConfig {
  environment: string;
  region: string;
  cachingEnabled: boolean;
  bucketRetention: boolean;
  bucketVersioning: boolean;
  lambdaMemorySize: number;
  lambdaTimeout: number;
  apiKeyRequired: boolean;
  logRetention: number; // days
}

export const environments: Record<string, EnvironmentConfig> = {
  dev: {
    environment: 'dev',
    region: 'ap-northeast-1',
    cachingEnabled: false,
    bucketRetention: false,
    bucketVersioning: false,
    lambdaMemorySize: 128,
    lambdaTimeout: 30,
    apiKeyRequired: false,
    logRetention: 7,
  },
  staging: {
    environment: 'staging',
    region: 'ap-northeast-1',
    cachingEnabled: true,
    bucketRetention: false,
    bucketVersioning: true,
    lambdaMemorySize: 256,
    lambdaTimeout: 30,
    apiKeyRequired: true,
    logRetention: 30,
  },
  prod: {
    environment: 'prod',
    region: 'ap-northeast-1',
    cachingEnabled: true,
    bucketRetention: true,
    bucketVersioning: true,
    lambdaMemorySize: 512,
    lambdaTimeout: 60,
    apiKeyRequired: true,
    logRetention: 90,
  }
};
```

**環境対応Stack:** `lib/environment-aware-stack.ts`
```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { environments, EnvironmentConfig } from '../config/environments';

export interface EnvironmentAwareStackProps extends cdk.StackProps {
  environment: string;
}

export class EnvironmentAwareStack extends cdk.Stack {
  public readonly config: EnvironmentConfig;
  public readonly apiUrl: string;

  constructor(scope: Construct, id: string, props: EnvironmentAwareStackProps) {
    super(scope, id, props);

    // 環境設定を取得
    this.config = environments[props.environment];
    if (!this.config) {
      throw new Error(`Unknown environment: ${props.environment}`);
    }

    // S3バケット（環境別設定）
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `website-${this.config.environment}-${Date.now()}`,
      
      // 環境別削除ポリシー
      removalPolicy: this.config.bucketRetention 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: !this.config.bucketRetention,
      
      // 環境別バージョニング
      versioned: this.config.bucketVersioning,
      
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      
      // 本番環境のみライフサイクル設定
      ...(this.config.environment === 'prod' && {
        lifecycleRules: [{
          id: 'OptimizeStorage',
          enabled: true,
          transitions: [{
            storageClass: s3.StorageClass.INFREQUENT_ACCESS,
            transitionAfter: cdk.Duration.days(30),
          }]
        }]
      }),
    });

    // Lambda関数（環境別設定）
    const apiFunction = new lambda.Function(this, 'ApiFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          const environment = process.env.ENVIRONMENT;
          const timestamp = new Date().toISOString();
          
          console.log(\`[\${environment}] Request received at \${timestamp}\`);
          console.log('Event:', JSON.stringify(event, null, 2));
          
          return {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: \`Hello from \${environment} environment!\`,
              timestamp,
              environment,
              memorySize: process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE,
              version: process.env.AWS_LAMBDA_FUNCTION_VERSION,
              requestId: event.requestContext?.requestId || 'N/A'
            })
          };
        };
      `),
      handler: 'index.handler',
      
      // 環境別リソース設定
      memorySize: this.config.lambdaMemorySize,
      timeout: cdk.Duration.seconds(this.config.lambdaTimeout),
      
      environment: {
        ENVIRONMENT: this.config.environment,
        API_VERSION: 'v1',
        LOG_LEVEL: this.config.environment === 'prod' ? 'WARN' : 'DEBUG',
      },
      
      // 環境別ログ保持期間
      logRetention: this.config.logRetention === 7 
        ? logs.RetentionDays.ONE_WEEK
        : this.config.logRetention === 30 
        ? logs.RetentionDays.ONE_MONTH
        : logs.RetentionDays.THREE_MONTHS,
    });

    // API Gateway（環境別設定）
    const api = new apigateway.RestApi(this, 'Api', {
      restApiName: `api-${this.config.environment}`,
      description: `API for ${this.config.environment} environment`,
      
      // 環境別CORS設定
      defaultCorsPreflightOptions: {
        allowOrigins: this.config.environment === 'prod'
          ? ['https://yourdomain.com'] // 本番環境は特定ドメインのみ
          : apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
      
      deployOptions: {
        stageName: this.config.environment,
        
        // 環境別ログ設定
        loggingLevel: this.config.environment === 'prod'
          ? apigateway.MethodLoggingLevel.ERROR
          : apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: this.config.environment !== 'prod',
        
        // 本番環境のみスロットリング設定
        ...(this.config.environment === 'prod' && {
          throttleSettings: {
            rateLimit: 1000,
            burstLimit: 2000,
          }
        }),
      },
      
      // 環境別APIキー要求設定
      apiKeySourceType: this.config.apiKeyRequired 
        ? apigateway.ApiKeySourceType.HEADER 
        : undefined,
    });

    // APIエンドポイント
    const integration = new apigateway.LambdaIntegration(apiFunction);
    const resource = api.root.addResource('api');
    resource.addMethod('GET', integration, {
      apiKeyRequired: this.config.apiKeyRequired,
    });

    // APIキーとUsage Plan（必要な環境のみ）
    if (this.config.apiKeyRequired) {
      const apiKey = new apigateway.ApiKey(this, 'ApiKey', {
        apiKeyName: `${this.config.environment}-api-key`,
        description: `API Key for ${this.config.environment} environment`,
      });

      const usagePlan = new apigateway.UsagePlan(this, 'UsagePlan', {
        name: `${this.config.environment}-usage-plan`,
        description: `Usage plan for ${this.config.environment}`,
        apiStages: [{
          api,
          stage: api.deploymentStage,
        }],
        quota: {
          limit: this.config.environment === 'prod' ? 10000 : 1000,
          period: apigateway.Period.DAY,
        },
        throttle: {
          rateLimit: this.config.environment === 'prod' ? 100 : 10,
          burstLimit: this.config.environment === 'prod' ? 200 : 20,
        },
      });

      usagePlan.addApiKey(apiKey);

      new cdk.CfnOutput(this, 'ApiKeyId', {
        value: apiKey.keyId,
        description: 'API Key ID',
      });
    }

    // CloudFront（環境別キャッシュ設定）
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
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        
        // 環境別キャッシュ設定
        cachePolicy: this.config.cachingEnabled
          ? cloudfront.CachePolicy.CACHING_OPTIMIZED
          : cloudfront.CachePolicy.CACHING_DISABLED,
      },
    });

    // タグ付け
    cdk.Tags.of(this).add('Environment', this.config.environment);
    cdk.Tags.of(this).add('Project', 'CDK-Learning');

    // 出力
    this.apiUrl = api.url;
    
    new cdk.CfnOutput(this, 'Environment', {
      value: this.config.environment,
      description: 'Deployment environment',
    });

    new cdk.CfnOutput(this, 'WebsiteURL', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'Website URL',
      exportName: `${this.config.environment}-website-url`,
    });

    new cdk.CfnOutput(this, 'ApiURL', {
      value: this.apiUrl,
      description: 'API Gateway URL',
      exportName: `${this.config.environment}-api-url`,
    });

    new cdk.CfnOutput(this, 'CachingEnabled', {
      value: this.config.cachingEnabled.toString(),
      description: 'CloudFront caching enabled',
    });
  }
}
```

**アプリケーションエントリーポイント:** `bin/app.ts`
```typescript
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { EnvironmentAwareStack } from '../lib/environment-aware-stack';

const app = new cdk.App();

// 環境を取得（デフォルトはdev）
const environment = app.node.tryGetContext('environment') || 'dev';

console.log(`Deploying to ${environment} environment`);

new EnvironmentAwareStack(app, `MyApp-${environment}`, {
  environment,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  description: `CDK Learning Stack for ${environment} environment`,
});
```

**デプロイコマンド:**
```bash
# 開発環境
cdk deploy -c environment=dev

# ステージング環境
cdk deploy -c environment=staging

# 本番環境
cdk deploy -c environment=prod
```

**環境の確認:**
```bash
# 環境別の差分確認
cdk diff -c environment=prod

# デプロイされたStackの確認
aws cloudformation describe-stacks --stack-name MyApp-prod
```

**重要なポイント:**
1. **設定の外部化**: 環境固有の設定を別ファイルで管理
2. **条件分岐**: 環境に応じてリソース設定を変更
3. **タグ付け**: リソースに環境タグを付与して管理を容易に
4. **出力のエクスポート**: 他のStackから参照可能な形で出力
5. **セキュリティ**: 本番環境では厳格な設定を適用
</details>

## 7. 今日のまとめ

### 学習したこと
- CDKの三層Construct構造（L1, L2, L3）
- 複数のAWSサービスの組み合わせ方
- 環境別Stack管理の方法
- 設定ファイルを使った柔軟な構成管理
- Cross-Stack参照によるリソース連携

### 重要なポイント
1. **適切なConstruct選択**: 用途に応じてL1, L2, L3を使い分ける
2. **環境管理**: 開発・ステージング・本番環境を適切に分離
3. **設定の外部化**: 環境固有の設定はコードから分離
4. **リソース依存**: Stack間の依存関係を適切に管理

### 明日の予告
明日は、より高度なConstructパターンとカスタムConstructの作成方法を学び、再利用可能なコンポーネントの開発方法を習得します。

---

**今日のファイル構成**
```
my-first-cdk-app/
├── bin/
│   └── my-first-cdk-app.ts
├── lib/
│   ├── my-first-cdk-app-stack.ts
│   └── website-stack.ts
├── config/
│   └── environments.ts
└── [その他のファイル]
```