---
title: 第3天 - 高级构造和模式
order: 4
---

# 第3天 - 高级构造和模式

## 今日目标

1. 创建自定义可重用构造
2. 学习高级CDK模式和最佳实践
3. 实现跨堆栈资源共享
4. 构建多层应用程序架构
5. 了解用于治理的CDK方面（Aspects）

## 1. 自定义构造

### 1.1 创建可重用的Web API构造

创建新文件`lib/web-api-construct.ts`：

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

    // DynamoDB表
    this.table = new dynamodb.Table(this, 'ApiTable', {
      tableName: props?.tableName || `${id}-table`,
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda函数
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
          
          console.log('请求:', { method, path, tableName });
          
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
                  response = { message: '来自Web API的问候！', path, method };
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
                  
                  response = { message: '项目已创建', item };
                } else {
                  response = { message: 'POST端点', path };
                }
                break;
                
              default:
                response = { message: '不支持的方法', method };
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
            console.error('错误:', error);
            return {
              statusCode: 500,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                error: '内部服务器错误',
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

    // 授予Lambda访问DynamoDB的权限
    this.table.grantReadWriteData(this.lambdaFunction);

    // API Gateway
    this.api = new apigateway.RestApi(this, 'Api', {
      restApiName: props?.apiName || `${id}-api`,
      description: '带Lambda和DynamoDB的Web API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // Lambda集成
    const lambdaIntegration = new apigateway.LambdaIntegration(this.lambdaFunction);

    // API路由
    this.api.root.addMethod('GET', lambdaIntegration);
    
    const itemsResource = this.api.root.addResource('items');
    itemsResource.addMethod('GET', lambdaIntegration);
    itemsResource.addMethod('POST', lambdaIntegration);
  }

  // 添加自定义路由的辅助方法
  public addRoute(path: string, method: string): apigateway.Resource {
    const resource = this.api.root.addResource(path);
    const integration = new apigateway.LambdaIntegration(this.lambdaFunction);
    resource.addMethod(method, integration);
    return resource;
  }
}
```

### 1.2 使用自定义构造

更新您的主堆栈以使用自定义构造：

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

    // 静态网站（来自第2天）
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

    // 新增：使用我们的自定义Web API构造
    const webApi = new WebApiConstruct(this, 'WebApi', {
      tableName: `web-api-table-${environment}`,
      lambdaMemorySize: environment === 'prod' ? 512 : 256,
      apiName: `web-api-${environment}`,
    });

    // 向API添加自定义路由
    webApi.addRoute('health', 'GET');
    webApi.addRoute('users', 'GET');

    // 部署网站内容
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('./website')],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // 输出
    new cdk.CfnOutput(this, 'WebsiteURL', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'CloudFront网站URL',
    });

    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: webApi.api.url,
      description: 'API Gateway端点',
    });

    new cdk.CfnOutput(this, 'DynamoDBTableName', {
      value: webApi.table.tableName,
      description: 'DynamoDB表名',
    });
  }
}
```

## 2. 高级模式

### 2.1 跨堆栈引用

为不同关注点创建单独的堆栈：

创建`lib/database-stack.ts`：

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

    // 用于RDS的VPC
    this.vpc = new ec2.Vpc(this, 'AppVpc', {
      maxAzs: 2,
      natGateways: 1,
    });

    // 用于用户会话的DynamoDB
    this.userTable = new dynamodb.Table(this, 'UserTable', {
      tableName: `users-${this.stackName}`,
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // 用于应用程序数据的RDS（可选 - 用于演示）
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

    // 导出值用于跨堆栈引用
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

创建`lib/application-stack.ts`：

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

    // 从数据库堆栈导入VPC
    const vpc = ec2.Vpc.fromLookup(this, 'ImportedVpc', {
      vpcId: props.vpcId,
    });

    // 使用共享用户表的Lambda函数
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
      vpc: vpc, // 在VPC中部署Lambda
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'UserApi', {
      restApiName: '用户服务API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const userIntegration = new apigateway.LambdaIntegration(userService);
    api.root.addResource('users').addMethod('GET', userIntegration);

    new cdk.CfnOutput(this, 'UserApiUrl', {
      value: api.url,
      description: '用户服务API URL',
    });
  }
}
```

更新您的应用入口点以使用多个堆栈：

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

// 确保适当的部署顺序
applicationStack.addDependency(databaseStack);
```

## 3. 用于治理的CDK方面

### 3.1 安全方面

创建`lib/security-aspect.ts`：

```typescript
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { IConstruct } from 'constructs';

export class SecurityAspect implements cdk.IAspect {
  visit(node: IConstruct): void {
    // 确保所有S3存储桶都启用了加密
    if (node instanceof s3.CfnBucket) {
      if (!node.bucketEncryption) {
        cdk.Annotations.of(node).addError(
          'S3存储桶必须启用加密'
        );
      }
    }

    // 确保Lambda函数具有合理的超时时间
    if (node instanceof lambda.CfnFunction) {
      if (!node.timeout || node.timeout > 300) {
        cdk.Annotations.of(node).addWarning(
          'Lambda超时时间应少于5分钟'
        );
      }
    }

    // 检查应参数化的硬编码值
    if (node instanceof cdk.CfnResource) {
      const template = JSON.stringify(node._toCloudFormation());
      if (template.includes('password') || template.includes('secret')) {
        cdk.Annotations.of(node).addWarning(
          '检测到潜在的硬编码凭据'
        );
      }
    }
  }
}
```

### 3.2 成本优化方面

创建`lib/cost-aspect.ts`：

```typescript
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { IConstruct } from 'constructs';

export class CostOptimizationAspect implements cdk.IAspect {
  constructor(private environment: string) {}

  visit(node: IConstruct): void {
    // 在非生产环境中，建议使用更小的实例类型
    if (this.environment !== 'prod') {
      if (node instanceof ec2.CfnInstance) {
        if (node.instanceType && !node.instanceType.includes('micro') && !node.instanceType.includes('small')) {
          cdk.Annotations.of(node).addWarning(
            `考虑在${this.environment}环境中使用更小的实例类型`
          );
        }
      }

      if (node instanceof rds.CfnDBInstance) {
        if (node.dbInstanceClass && !node.dbInstanceClass.includes('micro')) {
          cdk.Annotations.of(node).addWarning(
            `考虑在${this.environment}环境中使用db.t3.micro`
          );
        }
      }
    }

    // 在开发中检查NAT网关
    if (this.environment === 'dev' && node instanceof ec2.CfnNatGateway) {
      cdk.Annotations.of(node).addWarning(
        'NAT网关会产生费用。考虑在开发中使用NAT实例'
      );
    }
  }
}
```

### 3.3 将方面应用到您的堆栈

更新您的堆栈以使用方面：

```typescript
import { SecurityAspect } from './security-aspect';
import { CostOptimizationAspect } from './cost-aspect';

export class MyFirstCdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const environment = this.node.tryGetContext('environment') || 'dev';

    // ... 您现有的资源 ...

    // 应用治理方面
    cdk.Aspects.of(this).add(new SecurityAspect());
    cdk.Aspects.of(this).add(new CostOptimizationAspect(environment));
  }
}
```

## 4. 练习：构建完整应用程序

### 4.1 需求

构建一个待办事项应用程序，包含：
- 托管在CloudFront + S3上的前端
- API Gateway + Lambda后端
- DynamoDB数据存储
- 适当的安全性和监控

### 4.2 解决方案结构

```
lib/
├── todo-app-stack.ts          # 主应用程序堆栈
├── constructs/
│   ├── todo-api.ts            # 待办事项API构造
│   ├── todo-frontend.ts       # 前端托管构造
│   └── todo-database.ts       # 数据库构造
└── aspects/
    ├── security-aspect.ts     # 安全治理
    └── monitoring-aspect.ts   # 监控治理
```

### 4.3 待办事项API构造

创建`lib/constructs/todo-api.ts`：

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

    // 用于待办事项操作的Lambda函数
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
          
          console.log('请求:', { method, path, body: event.body });
          
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
                  response = { message: '待办事项API', version: '1.0.0' };
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
                  
                  response = { message: '待办事项已创建', todo };
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
                  
                  response = { message: '待办事项已更新' };
                }
                break;
                
              case 'DELETE':
                if (path.startsWith('/todos/')) {
                  const id = path.split('/')[2];
                  
                  await dynamodb.delete({
                    TableName: tableName,
                    Key: { id },
                  }).promise();
                  
                  response = { message: '待办事项已删除' };
                }
                break;
                
              default:
                response = { message: '不允许的方法' };
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
            console.error('错误:', error);
            return {
              statusCode: 500,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                error: '内部服务器错误',
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

    // 授予权限
    props.table.grantReadWriteData(todoFunction);

    // API Gateway
    this.api = new apigateway.RestApi(this, 'TodoApi', {
      restApiName: '待办事项API',
      description: '待办事项应用程序API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const lambdaIntegration = new apigateway.LambdaIntegration(todoFunction);

    // 路由
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

## 总结

今天您学到了：

1. ✅ 创建自定义、可重用的构造
2. ✅ 高级CDK模式和最佳实践  
3. ✅ 跨堆栈资源共享和依赖
4. ✅ 用于治理和合规的CDK方面
5. ✅ 构建复杂的多层应用程序

### 涵盖的关键概念

- **自定义构造**: 将多个资源封装到可重用组件中
- **跨堆栈引用**: 在不同堆栈之间共享资源
- **CDK方面**: 实施治理和合规检查
- **多层架构**: 跨不同堆栈分离关注点

### 构建的架构模式

```
前端堆栈      →  应用程序堆栈     →  数据库堆栈
(S3 + CloudFront) →  (Lambda + API GW)   →  (DynamoDB + RDS)
```

### 下一步

明天（第4天），我们将专注于测试您的CDK应用程序，设置CI/CD管道，并通过自动化测试策略确保代码质量。

---

**第3天的最佳实践技巧：**

1. **构造设计**: 使构造可配置和可重用
2. **堆栈分离**: 按生命周期分离关注点（数据库 vs 应用程序）
3. **治理**: 使用方面执行组织标准
4. **资源命名**: 使用一致的、环境感知的命名
5. **跨引用**: 最小化堆栈之间的紧密耦合