---
title: 第2天 - 理解核心构造和堆栈
order: 3
---

# 第2天 - 理解核心构造和堆栈

## 今日目标

1. 理解构造（Construct）、堆栈（Stack）和应用（App）的层次结构
2. 组合多个AWS服务
3. 构建无服务器Web应用程序的基础
4. 学习特定环境的配置管理

## 1. CDK的三层结构

### 1.1 理解构造层次结构

CDK提供三个级别的构造：

#### L1构造（CFN资源）
- CloudFormation资源的直接包装器
- 以`Cfn`为前缀
- 最精细的控制，但配置复杂

```typescript
import * as cdk from 'aws-cdk-lib';

// L1构造示例
const cfnBucket = new cdk.aws_s3.CfnBucket(this, 'L1Bucket', {
  bucketName: 'my-l1-bucket',
  versioningConfiguration: {
    status: 'Enabled'
  }
});
```

#### L2构造（AWS构造）
- AWS服务的高级包装器
- 提供合理的默认值
- 最常用

```typescript
import * as s3 from 'aws-cdk-lib/aws-s3';

// L2构造示例
const bucket = new s3.Bucket(this, 'L2Bucket', {
  versioned: true,
  bucketName: 'my-l2-bucket'
});
```

#### L3构造（模式）
- 组合多个AWS服务的模式
- 包含最佳实践
- 为特定用例而设计

```typescript
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

// L3构造示例
new s3deploy.BucketDeployment(this, 'DeployWebsite', {
  sources: [s3deploy.Source.asset('./website')],
  destinationBucket: bucket
});
```

## 2. 实践：构建静态网站

让我们扩展昨天的项目，使用CloudFront构建静态网站。

### 2.1 更新堆栈实现

更新`lib/my-first-cdk-app-stack.ts`：

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

    // 用于静态网站托管的S3存储桶
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `my-website-bucket-${Date.now()}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // 仅通过CloudFront访问
    });

    // CloudFront的源访问身份
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OAI', {
      comment: '我的网站的OAI'
    });

    // 授予CloudFront访问S3存储桶的权限
    websiteBucket.grantRead(originAccessIdentity);

    // CloudFront分发
    const distribution = new cloudfront.Distribution(this, 'WebsiteDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket, {
          originAccessIdentity: originAccessIdentity
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 404,
          responsePagePath: '/error.html',
        }
      ]
    });

    // 部署网站内容
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('./website')],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // 输出
    new cdk.CfnOutput(this, 'WebsiteURL', {
      value: distribution.distributionDomainName,
      description: 'CloudFront分发URL',
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      value: distribution.distributionId,
      description: 'CloudFront分发ID',
    });
  }
}
```

### 2.2 创建网站内容

在项目根目录创建`website`目录：

```bash
mkdir website
```

创建`website/index.html`：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>我的CDK网站</title>
    <style>
        body {
            font-family: "Microsoft YaHei", Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        h1 {
            text-align: center;
            margin-bottom: 30px;
        }
        .feature {
            margin: 20px 0;
            padding: 15px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>欢迎访问我的CDK网站！</h1>
        <div class="feature">
            <h3>🚀 使用AWS CDK部署</h3>
            <p>此网站使用AWS CDK基础设施即代码进行部署。</p>
        </div>
        <div class="feature">
            <h3>☁️ 由CloudFront提供支持</h3>
            <p>通过AWS CloudFront CDN实现快速全球内容分发。</p>
        </div>
        <div class="feature">
            <h3>📦 存储在S3中</h3>
            <p>静态内容安全存储在Amazon S3中。</p>
        </div>
        <div class="feature">
            <h3>🔒 默认安全</h3>
            <p>HTTPS重定向和源访问身份确保安全性。</p>
        </div>
    </div>
</body>
</html>
```

创建`website/error.html`：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>页面未找到</title>
    <style>
        body {
            font-family: "Microsoft YaHei", Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .error-container {
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 10px;
            backdrop-filter: blur(10px);
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <h1>404 - 页面未找到</h1>
        <p>您寻找的页面不存在。</p>
        <a href="/" style="color: white;">返回首页</a>
    </div>
</body>
</html>
```

### 2.3 部署网站

```bash
# 合成以检查生成的CloudFormation
cdk synth

# 部署堆栈
cdk deploy
```

部署完成后，您将收到一个CloudFront URL，可以访问查看您的网站。

## 3. 添加Lambda API

现在让我们使用Lambda和API Gateway添加无服务器API。

### 3.1 创建Lambda函数

创建`lambda`目录并添加`hello.js`：

```bash
mkdir lambda
```

创建`lambda/hello.js`：

```javascript
exports.handler = async (event) => {
    const response = {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        },
        body: JSON.stringify({
            message: '来自CDK Lambda的问候！',
            timestamp: new Date().toISOString(),
            requestId: event.requestContext?.requestId || 'unknown'
        }),
    };
    return response;
};
```

### 3.2 使用Lambda和API Gateway更新堆栈

将以下内容添加到您的堆栈：

```typescript
// 在顶部添加这些导入
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

// 在CloudFront设置之后，在堆栈构造函数内添加以下内容

// Lambda函数
const helloFunction = new lambda.Function(this, 'HelloFunction', {
  runtime: lambda.Runtime.NODEJS_18_X,
  handler: 'hello.handler',
  code: lambda.Code.fromAsset('lambda'),
  timeout: cdk.Duration.seconds(30),
});

// API Gateway
const api = new apigateway.RestApi(this, 'HelloApi', {
  restApiName: '问候服务',
  description: '此服务提供问候请求。',
  defaultCorsPreflightOptions: {
    allowOrigins: apigateway.Cors.ALL_ORIGINS,
    allowMethods: apigateway.Cors.ALL_METHODS,
  },
});

const helloIntegration = new apigateway.LambdaIntegration(helloFunction);
api.root.addMethod('GET', helloIntegration);

const helloResource = api.root.addResource('hello');
helloResource.addMethod('GET', helloIntegration);

// 将API URL添加到输出
new cdk.CfnOutput(this, 'ApiUrl', {
  value: api.url,
  description: 'API Gateway URL',
});
```

### 3.3 更新网站以调用API

更新`website/index.html`以包含API集成：

```html
<!-- 在现有功能之后添加此按钮 -->
<div class="feature">
    <h3>⚡ 无服务器API</h3>
    <p>点击按钮测试我们的Lambda API：</p>
    <button onclick="callApi()" style="padding: 10px 20px; margin: 10px 0; cursor: pointer;">
        调用Lambda API
    </button>
    <div id="api-response" style="margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 5px; display: none;">
    </div>
</div>

<script>
async function callApi() {
    const responseDiv = document.getElementById('api-response');
    const apiUrl = 'YOUR_API_URL_HERE'; // 部署后替换为实际的API URL
    
    try {
        responseDiv.style.display = 'block';
        responseDiv.innerHTML = '加载中...';
        
        const response = await fetch(apiUrl + '/hello');
        const data = await response.json();
        
        responseDiv.innerHTML = `
            <h4>API响应：</h4>
            <pre>${JSON.stringify(data, null, 2)}</pre>
        `;
    } catch (error) {
        responseDiv.innerHTML = `
            <h4>错误：</h4>
            <p>${error.message}</p>
        `;
    }
}
</script>
```

### 3.4 部署和测试

```bash
cdk deploy
```

部署完成后，使用输出中的实际API Gateway URL更新HTML中的`apiUrl`，然后重新部署：

```bash
cdk deploy
```

## 4. 环境管理

### 4.1 特定环境的配置

为不同环境创建不同的配置：

```typescript
export interface EnvironmentConfig {
  bucketName: string;
  apiName: string;
  enableLogging: boolean;
}

export const getConfig = (environment: string): EnvironmentConfig => {
  switch (environment) {
    case 'prod':
      return {
        bucketName: 'my-prod-website-bucket',
        apiName: 'production-api',
        enableLogging: true,
      };
    case 'staging':
      return {
        bucketName: 'my-staging-website-bucket',
        apiName: 'staging-api',
        enableLogging: true,
      };
    default:
      return {
        bucketName: 'my-dev-website-bucket',
        apiName: 'dev-api',
        enableLogging: false,
      };
  }
};
```

### 4.2 使用环境变量

更新您的应用入口点：

```typescript
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MyFirstCdkAppStack } from '../lib/my-first-cdk-app-stack';

const app = new cdk.App();
const environment = app.node.tryGetContext('environment') || 'dev';

new MyFirstCdkAppStack(app, `MyFirstCdkAppStack-${environment}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  tags: {
    Environment: environment,
    Project: 'my-first-cdk-app',
  },
});
```

部署到不同环境：

```bash
# 部署到dev（默认）
cdk deploy

# 部署到staging
cdk deploy --context environment=staging

# 部署到production
cdk deploy --context environment=prod
```

## 5. 练习：添加DynamoDB集成

### 5.1 添加DynamoDB表

```typescript
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

// 添加到堆栈构造函数
const table = new dynamodb.Table(this, 'VisitorTable', {
  tableName: `visitors-${environment}`,
  partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
  removalPolicy: cdk.RemovalPolicy.DESTROY, // 仅用于开发/测试
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
});

// 授予Lambda访问DynamoDB的权限
table.grantReadWriteData(helloFunction);

// 将表名传递给Lambda
helloFunction.addEnvironment('TABLE_NAME', table.tableName);
```

### 5.2 更新Lambda函数

更新`lambda/hello.js`：

```javascript
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const tableName = process.env.TABLE_NAME;
    const visitorId = event.requestContext?.requestId || 'unknown';
    
    try {
        // 记录访问者
        await dynamodb.put({
            TableName: tableName,
            Item: {
                id: visitorId,
                timestamp: new Date().toISOString(),
                userAgent: event.headers?.['User-Agent'] || 'unknown'
            }
        }).promise();
        
        // 获取访问者计数
        const result = await dynamodb.scan({
            TableName: tableName,
            Select: 'COUNT'
        }).promise();
        
        const response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            body: JSON.stringify({
                message: '来自带DynamoDB的CDK Lambda的问候！',
                visitorId: visitorId,
                totalVisitors: result.Count,
                timestamp: new Date().toISOString()
            }),
        };
        return response;
    } catch (error) {
        console.error('错误:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                message: '内部服务器错误',
                error: error.message
            }),
        };
    }
};
```

## 总结

今天您学到了：

1. ✅ CDK的三层构造层次结构（L1、L2、L3）
2. ✅ 使用CloudFront构建完整的静态网站
3. ✅ 使用Lambda和API Gateway创建无服务器API
4. ✅ 特定环境的配置管理
5. ✅ DynamoDB集成用于数据持久化

### 涵盖的关键概念

- **构造级别**: L1（CFN）、L2（AWS）、L3（模式）
- **CloudFront**: 带源访问身份的全球CDN
- **Lambda函数**: 带API Gateway的无服务器计算
- **环境管理**: 基于上下文的配置
- **跨服务集成**: Lambda + DynamoDB权限

### 今天构建的架构

```
互联网 → CloudFront → S3（静态网站）
              ↓
         API Gateway → Lambda → DynamoDB
```

### 下一步

明天（第3天），我们将探索高级CDK模式、自定义构造，并学习如何创建遵循AWS最佳实践的可重用组件。

---

**注意**: 记住在完成练习后清理资源以避免不必要的费用：

```bash
cdk destroy
```