---
title: Day 2 - 핵심 컨스트럭트와 스택 이해하기
order: 3
---

# Day 2 - 핵심 컨스트럭트와 스택 이해하기

## 오늘의 목표

1. Construct, Stack, App의 계층 구조 이해하기
2. 여러 AWS 서비스 결합하기
3. 서버리스 웹 애플리케이션의 기반 구축하기
4. 환경별 설정 관리 학습하기

## 1. CDK의 3계층 구조

### 1.1 Construct 계층 이해하기

CDK는 3단계의 Construct 레벨을 제공합니다:

#### L1 Constructs (CFN Resources)
- CloudFormation 리소스를 직접 래핑
- `Cfn` 접두사가 붙음
- 가장 세밀한 제어가 가능하지만 복잡한 설정 필요

```typescript
import * as cdk from 'aws-cdk-lib';

// L1 Construct 예제
const cfnBucket = new cdk.aws_s3.CfnBucket(this, 'L1Bucket', {
  bucketName: 'my-l1-bucket',
  versioningConfiguration: {
    status: 'Enabled'
  }
});
```

#### L2 Constructs (AWS Constructs)
- AWS 서비스를 위한 고수준 래퍼
- 합리적인 기본값 제공
- 가장 일반적으로 사용됨

```typescript
import * as s3 from 'aws-cdk-lib/aws-s3';

// L2 Construct 예제
const bucket = new s3.Bucket(this, 'L2Bucket', {
  versioned: true,
  bucketName: 'my-l2-bucket'
});
```

#### L3 Constructs (패턴)
- 여러 AWS 서비스를 결합한 패턴
- 모범 사례가 통합되어 있음
- 특정 사용 사례를 위해 설계됨

```typescript
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

// L3 Construct 예제
new s3deploy.BucketDeployment(this, 'DeployWebsite', {
  sources: [s3deploy.Source.asset('./website')],
  destinationBucket: bucket
});
```

## 2. 실습: 정적 웹사이트 구축하기

어제의 프로젝트를 확장하여 CloudFront를 사용한 정적 웹사이트를 구축해봅시다.

### 2.1 스택 구현 업데이트

`lib/my-first-cdk-app-stack.ts` 파일을 업데이트합니다:

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

    // 정적 웹사이트 호스팅을 위한 S3 버킷
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `my-website-bucket-${Date.now()}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // CloudFront를 통해서만 접근
    });

    // CloudFront를 위한 Origin Access Identity
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OAI', {
      comment: '내 웹사이트를 위한 OAI'
    });

    // CloudFront에 S3 버킷 접근 권한 부여
    websiteBucket.grantRead(originAccessIdentity);

    // CloudFront Distribution
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

    // 웹사이트 콘텐츠 배포
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('./website')],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // 출력값
    new cdk.CfnOutput(this, 'WebsiteURL', {
      value: distribution.distributionDomainName,
      description: 'CloudFront Distribution URL',
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      value: distribution.distributionId,
      description: 'CloudFront Distribution ID',
    });
  }
}
```

### 2.2 웹사이트 콘텐츠 생성

프로젝트 루트에 `website` 디렉터리를 생성합니다:

```bash
mkdir website
```

`website/index.html` 파일을 생성합니다:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>내 CDK 웹사이트</title>
    <style>
        body {
            font-family: Arial, sans-serif;
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
        <h1>내 CDK 웹사이트에 오신 것을 환영합니다!</h1>
        <div class="feature">
            <h3>🚀 AWS CDK로 배포됨</h3>
            <p>이 웹사이트는 AWS CDK를 사용한 Infrastructure as Code로 배포되었습니다.</p>
        </div>
        <div class="feature">
            <h3>☁️ CloudFront 기반</h3>
            <p>AWS CloudFront CDN을 통한 빠른 글로벌 콘텐츠 전송입니다.</p>
        </div>
        <div class="feature">
            <h3>📦 S3에 저장됨</h3>
            <p>정적 콘텐츠가 Amazon S3에 안전하게 저장되어 있습니다.</p>
        </div>
        <div class="feature">
            <h3>🔒 기본적으로 보안</h3>
            <p>HTTPS 리다이렉션과 Origin Access Identity로 보안이 강화되었습니다.</p>
        </div>
    </div>
</body>
</html>
```

`website/error.html` 파일을 생성합니다:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>페이지를 찾을 수 없음</title>
    <style>
        body {
            font-family: Arial, sans-serif;
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
        <h1>404 - 페이지를 찾을 수 없음</h1>
        <p>찾고 계신 페이지가 존재하지 않습니다.</p>
        <a href="/" style="color: white;">홈으로 돌아가기</a>
    </div>
</body>
</html>
```

### 2.3 웹사이트 배포

```bash
# CloudFormation 생성 확인을 위한 합성
cdk synth

# 스택 배포
cdk deploy
```

배포 후에는 방문할 수 있는 CloudFront URL을 받게 됩니다.

## 3. Lambda API 추가하기

이제 Lambda와 API Gateway를 사용하여 서버리스 API를 추가해봅시다.

### 3.1 Lambda 함수 생성

`lambda` 디렉터리를 생성하고 `hello.js`를 추가합니다:

```bash
mkdir lambda
```

`lambda/hello.js` 파일을 생성합니다:

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
            message: 'CDK Lambda에서 안녕하세요!',
            timestamp: new Date().toISOString(),
            requestId: event.requestContext?.requestId || 'unknown'
        }),
    };
    return response;
};
```

### 3.2 Lambda와 API Gateway로 스택 업데이트

스택에 다음 내용을 추가합니다:

```typescript
// 상단에 이 import문을 추가하세요
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

// CloudFront 설정 후에 스택 생성자 내부에 추가하세요

// Lambda 함수
const helloFunction = new lambda.Function(this, 'HelloFunction', {
  runtime: lambda.Runtime.NODEJS_18_X,
  handler: 'hello.handler',
  code: lambda.Code.fromAsset('lambda'),
  timeout: cdk.Duration.seconds(30),
});

// API Gateway
const api = new apigateway.RestApi(this, 'HelloApi', {
  restApiName: 'Hello Service',
  description: '헬로 요청을 처리하는 서비스입니다.',
  defaultCorsPreflightOptions: {
    allowOrigins: apigateway.Cors.ALL_ORIGINS,
    allowMethods: apigateway.Cors.ALL_METHODS,
  },
});

const helloIntegration = new apigateway.LambdaIntegration(helloFunction);
api.root.addMethod('GET', helloIntegration);

const helloResource = api.root.addResource('hello');
helloResource.addMethod('GET', helloIntegration);

// 출력에 API URL 추가
new cdk.CfnOutput(this, 'ApiUrl', {
  value: api.url,
  description: 'API Gateway URL',
});
```

### 3.3 API 호출을 위한 웹사이트 업데이트

`website/index.html`을 업데이트하여 API 통합을 포함합니다:

```html
<!-- 기존 feature들 다음에 이 버튼을 추가하세요 -->
<div class="feature">
    <h3>⚡ 서버리스 API</h3>
    <p>버튼을 클릭하여 Lambda API를 테스트해보세요:</p>
    <button onclick="callApi()" style="padding: 10px 20px; margin: 10px 0; cursor: pointer;">
        Lambda API 호출
    </button>
    <div id="api-response" style="margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 5px; display: none;">
    </div>
</div>

<script>
async function callApi() {
    const responseDiv = document.getElementById('api-response');
    const apiUrl = 'YOUR_API_URL_HERE'; // 배포 후 실제 API URL로 교체하세요
    
    try {
        responseDiv.style.display = 'block';
        responseDiv.innerHTML = '로딩 중...';
        
        const response = await fetch(apiUrl + '/hello');
        const data = await response.json();
        
        responseDiv.innerHTML = `
            <h4>API 응답:</h4>
            <pre>${JSON.stringify(data, null, 2)}</pre>
        `;
    } catch (error) {
        responseDiv.innerHTML = `
            <h4>오류:</h4>
            <p>${error.message}</p>
        `;
    }
}
</script>
```

### 3.4 배포 및 테스트

```bash
cdk deploy
```

배포 후, HTML의 `apiUrl`을 출력에서 나온 실제 API Gateway URL로 업데이트한 다음 다시 배포합니다:

```bash
cdk deploy
```

## 4. 환경 관리

### 4.1 환경별 설정

다른 환경을 위한 다양한 설정을 만듭니다:

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

### 4.2 환경 변수 사용

앱 진입점을 업데이트합니다:

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

다른 환경에 배포하기:

```bash
# dev에 배포 (기본값)
cdk deploy

# staging에 배포
cdk deploy --context environment=staging

# production에 배포
cdk deploy --context environment=prod
```

## 5. 실습: DynamoDB 통합 추가

### 5.1 DynamoDB 테이블 추가

```typescript
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

// 스택 생성자에 추가하세요
const table = new dynamodb.Table(this, 'VisitorTable', {
  tableName: `visitors-${environment}`,
  partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
  removalPolicy: cdk.RemovalPolicy.DESTROY, // 개발/테스트에서만
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
});

// Lambda에 DynamoDB 접근 권한 부여
table.grantReadWriteData(helloFunction);

// 테이블 이름을 Lambda에 전달
helloFunction.addEnvironment('TABLE_NAME', table.tableName);
```

### 5.2 Lambda 함수 업데이트

`lambda/hello.js`를 업데이트합니다:

```javascript
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const tableName = process.env.TABLE_NAME;
    const visitorId = event.requestContext?.requestId || 'unknown';
    
    try {
        // 방문자 기록
        await dynamodb.put({
            TableName: tableName,
            Item: {
                id: visitorId,
                timestamp: new Date().toISOString(),
                userAgent: event.headers?.['User-Agent'] || 'unknown'
            }
        }).promise();
        
        // 방문자 수 조회
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
                message: 'DynamoDB와 함께하는 CDK Lambda에서 안녕하세요!',
                visitorId: visitorId,
                totalVisitors: result.Count,
                timestamp: new Date().toISOString()
            }),
        };
        return response;
    } catch (error) {
        console.error('오류:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                message: '내부 서버 오류',
                error: error.message
            }),
        };
    }
};
```

## 정리

오늘 배운 내용:

1. ✅ CDK의 3계층 Construct 계층 구조 (L1, L2, L3)
2. ✅ CloudFront를 사용한 완전한 정적 웹사이트 구축
3. ✅ Lambda와 API Gateway를 사용한 서버리스 API 생성
4. ✅ 환경별 설정 관리
5. ✅ 데이터 지속성을 위한 DynamoDB 통합

### 핵심 개념 정리

- **Construct 레벨**: L1 (CFN), L2 (AWS), L3 (패턴)
- **CloudFront**: Origin Access Identity를 사용한 글로벌 CDN
- **Lambda 함수**: API Gateway와 함께하는 서버리스 컴퓨팅
- **환경 관리**: 컨텍스트 기반 설정
- **서비스 간 통합**: Lambda + DynamoDB 권한

### 오늘 구축한 아키텍처

```
인터넷 → CloudFront → S3 (정적 웹사이트)
              ↓
         API Gateway → Lambda → DynamoDB
```

### 다음 단계

내일 (Day 3)에는 고급 CDK 패턴, 사용자 정의 컨스트럭트를 살펴보고 AWS 모범 사례를 따르는 재사용 가능한 컴포넌트를 만드는 방법을 배워보겠습니다.

---

**참고**: 연습이 끝나면 불필요한 요금을 피하기 위해 리소스를 정리하는 것을 잊지 마세요:

```bash
cdk destroy
```