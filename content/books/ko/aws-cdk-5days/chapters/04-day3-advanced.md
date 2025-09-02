---
title: Day 3 - 고급 컨스트럭트와 패턴
order: 4
---

# Day 3 - 고급 컨스트럭트와 패턴

## 오늘의 목표

1. 사용자 정의 재사용 가능한 컨스트럭트 생성
2. 고급 CDK 패턴과 모범 사례 학습
3. 스택 간 리소스 공유 구현
4. 다중 계층 애플리케이션 아키텍처 구축
5. 거버넌스를 위한 CDK Aspects 이해

## 1. 사용자 정의 컨스트럭트

### 1.1 재사용 가능한 Web API 컨스트럭트 생성

새 파일 `lib/web-api-construct.ts`를 생성합니다:

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export interface WebApiProps {
  tableName?: string;
  lambdaMemorySize?: number;
  apiName?: string;
}

export class WebApiConstruct extends Construct {
  public readonly api: apigateway.RestApi;
  public readonly table: dynamodb.Table;
  public readonly lambdaFunction: lambda.Function;

  constructor(scope: Construct, id: string, props?: WebApiProps) {
    super(scope, id);

    // DynamoDB 테이블
    this.table = new dynamodb.Table(this, 'ApiTable', {
      tableName: props?.tableName || `${id}-table`,
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda 함수
    this.lambdaFunction = new lambda.Function(this, 'ApiFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const AWS = require('aws-sdk');
        const dynamodb = new AWS.DynamoDB.DocumentClient();
        
        exports.handler = async (event) => {
          const method = event.httpMethod;
          const path = event.path;
          const tableName = process.env.TABLE_NAME;
          
          console.log('요청:', { method, path, tableName });
          
          try {
            let response;
            
            switch (method) {
              case 'GET':
                if (path === '/items') {
                  const result = await dynamodb.scan({
                    TableName: tableName,
                    Limit: 50
                  }).promise();
                  response = { items: result.Items || [] };
                } else {
                  response = { message: 'Web API에서 안녕하세요!', path, method };
                }
                break;
                
              case 'POST':
                if (path === '/items') {
                  const body = JSON.parse(event.body || '{}');
                  const item = {
                    pk: 'ITEM',
                    sk: Date.now().toString(),
                    ...body,
                    createdAt: new Date().toISOString()
                  };
                  
                  await dynamodb.put({
                    TableName: tableName,
                    Item: item
                  }).promise();
                  
                  response = { message: '아이템 생성됨', item };
                } else {
                  response = { message: 'POST 엔드포인트', path };
                }
                break;
                
              default:
                response = { message: '지원되지 않는 메서드', method };
            }
            
            return {
              statusCode: 200,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(response)
            };
            
          } catch (error) {
            console.error('오류:', error);
            return {
              statusCode: 500,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                error: '내부 서버 오류',
                message: error.message
              })
            };
          }
        };
      `),
      memorySize: props?.lambdaMemorySize || 256,
      timeout: cdk.Duration.seconds(30),
      environment: {
        TABLE_NAME: this.table.tableName,
      },
    });

    // Lambda에 DynamoDB 권한 부여
    this.table.grantReadWriteData(this.lambdaFunction);

    // API Gateway
    this.api = new apigateway.RestApi(this, 'Api', {
      restApiName: props?.apiName || `${id}-api`,
      description: 'Lambda와 DynamoDB를 사용한 Web API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // Lambda 통합
    const lambdaIntegration = new apigateway.LambdaIntegration(this.lambdaFunction);

    // API 경로
    this.api.root.addMethod('GET', lambdaIntegration);
    
    const itemsResource = this.api.root.addResource('items');
    itemsResource.addMethod('GET', lambdaIntegration);
    itemsResource.addMethod('POST', lambdaIntegration);
  }

  // 사용자 정의 경로 추가를 위한 헬퍼 메서드
  public addRoute(path: string, method: string): apigateway.Resource {
    const resource = this.api.root.addResource(path);
    const integration = new apigateway.LambdaIntegration(this.lambdaFunction);
    resource.addMethod(method, integration);
    return resource;
  }
}
```

### 1.2 사용자 정의 컨스트럭트 사용

메인 스택을 업데이트하여 사용자 정의 컨스트럭트를 사용합니다:

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { WebApiConstruct } from './web-api-construct';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

export class MyFirstCdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const environment = this.node.tryGetContext('environment') || 'dev';

    // 정적 웹사이트 (Day 2에서)
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `my-website-bucket-${environment}-${Date.now()}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OAI');
    websiteBucket.grantRead(originAccessIdentity);

    const distribution = new cloudfront.Distribution(this, 'WebsiteDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket, { originAccessIdentity }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
    });

    // 신규: 사용자 정의 Web API 컨스트럭트 사용
    const webApi = new WebApiConstruct(this, 'WebApi', {
      tableName: `web-api-table-${environment}`,
      lambdaMemorySize: environment === 'prod' ? 512 : 256,
      apiName: `web-api-${environment}`,
    });

    // API에 사용자 정의 경로 추가
    webApi.addRoute('health', 'GET');
    webApi.addRoute('users', 'GET');

    // 웹사이트 콘텐츠 배포
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('./website')],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // 출력값
    new cdk.CfnOutput(this, 'WebsiteURL', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'CloudFront 웹사이트 URL',
    });

    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: webApi.api.url,
      description: 'API Gateway 엔드포인트',
    });

    new cdk.CfnOutput(this, 'DynamoDBTableName', {
      value: webApi.table.tableName,
      description: 'DynamoDB 테이블 이름',
    });
  }
}
```

## 2. 고급 패턴

### 2.1 스택 간 참조

다른 관심사를 위해 별도의 스택을 생성합니다:

`lib/database-stack.ts`를 생성합니다:

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class DatabaseStack extends cdk.Stack {
  public readonly userTable: dynamodb.Table;
  public readonly database: rds.DatabaseInstance;
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // RDS를 위한 VPC
    this.vpc = new ec2.Vpc(this, 'AppVpc', {
      maxAzs: 2,
      natGateways: 1,
    });

    // 사용자 세션을 위한 DynamoDB
    this.userTable = new dynamodb.Table(this, 'UserTable', {
      tableName: `users-${this.stackName}`,
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // 애플리케이션 데이터를 위한 RDS (시연용 - 선택사항)
    this.database = new rds.DatabaseInstance(this, 'AppDatabase', {
      engine: rds.DatabaseInstanceEngine.mysql({
        version: rds.MysqlEngineVersion.VER_8_0_35,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MICRO),
      credentials: rds.Credentials.fromGeneratedSecret('admin'),
      vpc: this.vpc,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      deletionProtection: false,
    });

    // 스택 간 참조를 위한 값 내보내기
    new cdk.CfnOutput(this, 'UserTableName', {
      value: this.userTable.tableName,
      exportName: `${this.stackName}-UserTableName`,
    });

    new cdk.CfnOutput(this, 'VpcId', {
      value: this.vpc.vpcId,
      exportName: `${this.stackName}-VpcId`,
    });
  }
}
```

`lib/application-stack.ts`를 생성합니다:

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export interface ApplicationStackProps extends cdk.StackProps {
  userTableName: string;
  vpcId: string;
}

export class ApplicationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApplicationStackProps) {
    super(scope, id, props);

    // Database Stack에서 VPC 가져오기
    const vpc = ec2.Vpc.fromLookup(this, 'ImportedVpc', {
      vpcId: props.vpcId,
    });

    // 공유 사용자 테이블을 사용하는 Lambda 함수
    const userService = new lambda.Function(this, 'UserService', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const AWS = require('aws-sdk');
        const dynamodb = new AWS.DynamoDB.DocumentClient();
        
        exports.handler = async (event) => {
          const tableName = process.env.USER_TABLE_NAME;
          
          try {
            const result = await dynamodb.scan({
              TableName: tableName,
              Limit: 10
            }).promise();
            
            return {
              statusCode: 200,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                users: result.Items || [],
                count: result.Count || 0
              })
            };
          } catch (error) {
            return {
              statusCode: 500,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                error: error.message
              })
            };
          }
        };
      `),
      environment: {
        USER_TABLE_NAME: props.userTableName,
      },
      vpc: vpc, // VPC에 Lambda 배포
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'UserApi', {
      restApiName: 'User Service API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const userIntegration = new apigateway.LambdaIntegration(userService);
    api.root.addResource('users').addMethod('GET', userIntegration);

    new cdk.CfnOutput(this, 'UserApiUrl', {
      value: api.url,
      description: 'User Service API URL',
    });
  }
}
```

여러 스택을 사용하도록 앱 진입점을 업데이트합니다:

```typescript
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DatabaseStack } from '../lib/database-stack';
import { ApplicationStack } from '../lib/application-stack';

const app = new cdk.App();
const environment = app.node.tryGetContext('environment') || 'dev';

const databaseStack = new DatabaseStack(app, `DatabaseStack-${environment}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

const applicationStack = new ApplicationStack(app, `ApplicationStack-${environment}`, {
  userTableName: databaseStack.userTable.tableName,
  vpcId: databaseStack.vpc.vpcId,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

// 적절한 배포 순서 보장
applicationStack.addDependency(databaseStack);
```

## 3. 거버넌스를 위한 CDK Aspects

### 3.1 보안 Aspect

`lib/security-aspect.ts`를 생성합니다:

```typescript
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { IConstruct } from 'constructs';

export class SecurityAspect implements cdk.IAspect {
  visit(node: IConstruct): void {
    // 모든 S3 버킷에 암호화가 있는지 확인
    if (node instanceof s3.CfnBucket) {
      if (!node.bucketEncryption) {
        cdk.Annotations.of(node).addError(
          'S3 버킷에는 암호화가 활성화되어야 합니다'
        );
      }
    }

    // Lambda 함수에 합리적인 타임아웃이 있는지 확인
    if (node instanceof lambda.CfnFunction) {
      if (!node.timeout || node.timeout > 300) {
        cdk.Annotations.of(node).addWarning(
          'Lambda 타임아웃은 5분 미만이어야 합니다'
        );
      }
    }

    // 매개변수화되어야 할 하드코딩된 값 확인
    if (node instanceof cdk.CfnResource) {
      const template = JSON.stringify(node._toCloudFormation());
      if (template.includes('password') || template.includes('secret')) {
        cdk.Annotations.of(node).addWarning(
          '하드코딩된 자격 증명이 감지될 수 있습니다'
        );
      }
    }
  }
}
```

### 3.2 비용 최적화 Aspect

`lib/cost-aspect.ts`를 생성합니다:

```typescript
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { IConstruct } from 'constructs';

export class CostOptimizationAspect implements cdk.IAspect {
  constructor(private environment: string) {}

  visit(node: IConstruct): void {
    // 비운영 환경에서는 더 작은 인스턴스 유형 제안
    if (this.environment !== 'prod') {
      if (node instanceof ec2.CfnInstance) {
        if (node.instanceType && !node.instanceType.includes('micro') && !node.instanceType.includes('small')) {
          cdk.Annotations.of(node).addWarning(
            `${this.environment} 환경에서는 더 작은 인스턴스 유형을 고려하세요`
          );
        }
      }

      if (node instanceof rds.CfnDBInstance) {
        if (node.dbInstanceClass && !node.dbInstanceClass.includes('micro')) {
          cdk.Annotations.of(node).addWarning(
            `${this.environment} 환경에서는 db.t3.micro를 고려하세요`
          );
        }
      }
    }

    // 개발 환경에서 NAT Gateway 확인
    if (this.environment === 'dev' && node instanceof ec2.CfnNatGateway) {
      cdk.Annotations.of(node).addWarning(
        'NAT Gateway는 요금이 발생합니다. 개발용으로 NAT Instance를 고려하세요'
      );
    }
  }
}
```

### 3.3 스택에 Aspects 적용

Aspects를 사용하도록 스택을 업데이트합니다:

```typescript
import { SecurityAspect } from './security-aspect';
import { CostOptimizationAspect } from './cost-aspect';

export class MyFirstCdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const environment = this.node.tryGetContext('environment') || 'dev';

    // ... 기존 리소스들 ...

    // 거버넌스 aspects 적용
    cdk.Aspects.of(this).add(new SecurityAspect());
    cdk.Aspects.of(this).add(new CostOptimizationAspect(environment));
  }
}
```

## 4. 실습: 완전한 애플리케이션 구축

### 4.1 요구사항

다음을 포함한 할 일 애플리케이션을 구축합니다:
- CloudFront + S3에서 호스팅되는 프론트엔드
- 백엔드를 위한 API Gateway + Lambda
- 데이터 저장을 위한 DynamoDB
- 적절한 보안과 모니터링

### 4.2 솔루션 구조

```
lib/
├── todo-app-stack.ts          # 메인 애플리케이션 스택
├── constructs/
│   ├── todo-api.ts            # Todo API 컨스트럭트
│   ├── todo-frontend.ts       # 프론트엔드 호스팅 컨스트럭트
│   └── todo-database.ts       # 데이터베이스 컨스트럭트
└── aspects/
    ├── security-aspect.ts     # 보안 거버넌스
    └── monitoring-aspect.ts   # 모니터링 거버넌스
```

### 4.3 Todo API 컨스트럭트

`lib/constructs/todo-api.ts`를 생성합니다:

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export interface TodoApiProps {
  table: dynamodb.Table;
}

export class TodoApiConstruct extends Construct {
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: TodoApiProps) {
    super(scope, id);

    // Todo 작업을 위한 Lambda 함수
    const todoFunction = new lambda.Function(this, 'TodoFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const AWS = require('aws-sdk');
        const dynamodb = new AWS.DynamoDB.DocumentClient();
        const { v4: uuidv4 } = require('uuid');
        
        exports.handler = async (event) => {
          const method = event.httpMethod;
          const path = event.path;
          const tableName = process.env.TABLE_NAME;
          
          console.log('요청:', { method, path, body: event.body });
          
          try {
            let response;
            
            switch (method) {
              case 'GET':
                if (path === '/todos') {
                  const result = await dynamodb.scan({
                    TableName: tableName,
                  }).promise();
                  response = { todos: result.Items || [] };
                } else {
                  response = { message: 'Todo API', version: '1.0.0' };
                }
                break;
                
              case 'POST':
                if (path === '/todos') {
                  const body = JSON.parse(event.body || '{}');
                  const todo = {
                    id: uuidv4(),
                    text: body.text || '',
                    completed: false,
                    createdAt: new Date().toISOString(),
                  };
                  
                  await dynamodb.put({
                    TableName: tableName,
                    Item: todo,
                  }).promise();
                  
                  response = { message: 'Todo 생성됨', todo };
                }
                break;
                
              case 'PUT':
                if (path.startsWith('/todos/')) {
                  const id = path.split('/')[2];
                  const body = JSON.parse(event.body || '{}');
                  
                  await dynamodb.update({
                    TableName: tableName,
                    Key: { id },
                    UpdateExpression: 'SET completed = :completed, updatedAt = :updatedAt',
                    ExpressionAttributeValues: {
                      ':completed': body.completed || false,
                      ':updatedAt': new Date().toISOString(),
                    },
                  }).promise();
                  
                  response = { message: 'Todo 업데이트됨' };
                }
                break;
                
              case 'DELETE':
                if (path.startsWith('/todos/')) {
                  const id = path.split('/')[2];
                  
                  await dynamodb.delete({
                    TableName: tableName,
                    Key: { id },
                  }).promise();
                  
                  response = { message: 'Todo 삭제됨' };
                }
                break;
                
              default:
                response = { message: '허용되지 않는 메서드' };
            }
            
            return {
              statusCode: 200,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(response),
            };
            
          } catch (error) {
            console.error('오류:', error);
            return {
              statusCode: 500,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                error: '내부 서버 오류',
                message: error.message,
              }),
            };
          }
        };
      `),
      environment: {
        TABLE_NAME: props.table.tableName,
      },
      timeout: cdk.Duration.seconds(30),
    });

    // 권한 부여
    props.table.grantReadWriteData(todoFunction);

    // API Gateway
    this.api = new apigateway.RestApi(this, 'TodoApi', {
      restApiName: 'Todo API',
      description: 'Todo 애플리케이션 API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const lambdaIntegration = new apigateway.LambdaIntegration(todoFunction);

    // 경로
    this.api.root.addMethod('GET', lambdaIntegration);
    
    const todosResource = this.api.root.addResource('todos');
    todosResource.addMethod('GET', lambdaIntegration);
    todosResource.addMethod('POST', lambdaIntegration);
    
    const todoResource = todosResource.addResource('{id}');
    todoResource.addMethod('PUT', lambdaIntegration);
    todoResource.addMethod('DELETE', lambdaIntegration);
  }
}
```

## 정리

오늘 배운 내용:

1. ✅ 사용자 정의, 재사용 가능한 컨스트럭트 생성
2. ✅ 고급 CDK 패턴과 모범 사례
3. ✅ 스택 간 리소스 공유와 의존성
4. ✅ 거버넌스와 컴플라이언스를 위한 CDK Aspects
5. ✅ 복잡한 다중 계층 애플리케이션 구축

### 핵심 개념 정리

- **사용자 정의 컨스트럭트**: 여러 리소스를 재사용 가능한 컴포넌트로 캡슐화
- **스택 간 참조**: 다른 스택 간의 리소스 공유
- **CDK Aspects**: 거버넌스와 컴플라이언스 검사 구현
- **다중 계층 아키텍처**: 다른 스택에서 관심사 분리

### 오늘 구축한 아키텍처 패턴

```
프론트엔드 스택    →  애플리케이션 스택  →  데이터베이스 스택
(S3 + CloudFront) →  (Lambda + API GW)   →  (DynamoDB + RDS)
```

### 다음 단계

내일 (Day 4)에는 CDK 애플리케이션 테스팅, CI/CD 파이프라인 설정, 자동화된 테스팅 전략을 통한 코드 품질 보장에 중점을 둘 것입니다.

---

**Day 3의 모범 사례 팁:**

1. **컨스트럭트 설계**: 컨스트럭트를 구성 가능하고 재사용 가능하게 만들기
2. **스택 분리**: 라이프사이클별로 관심사 분리(데이터베이스 vs 애플리케이션)
3. **거버넌스**: Aspects를 사용하여 조직 표준 강제하기
4. **리소스 명명**: 일관되고 환경을 고려한 명명 사용
5. **교차 참조**: 스택 간 강한 결합 최소화하기