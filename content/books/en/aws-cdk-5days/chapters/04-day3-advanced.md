---
title: Day 3 - Advanced Constructs and Patterns
order: 4
---

# Day 3 - Advanced Constructs and Patterns

## Today's Goals

1. Create custom reusable Constructs
2. Learn advanced CDK patterns and best practices
3. Implement cross-stack resource sharing
4. Build a multi-tier application architecture
5. Understand CDK Aspects for governance

## 1. Custom Constructs

### 1.1 Creating a Reusable Web API Construct

Create a new file `lib/web-api-construct.ts`:

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

    // DynamoDB Table
    this.table = new dynamodb.Table(this, 'ApiTable', {
      tableName: props?.tableName || `${id}-table`,
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda Function
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
          
          console.log('Request:', { method, path, tableName });
          
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
                  response = { message: 'Hello from Web API!', path, method };
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
                  
                  response = { message: 'Item created', item };
                } else {
                  response = { message: 'POST endpoint', path };
                }
                break;
                
              default:
                response = { message: 'Method not supported', method };
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
            console.error('Error:', error);
            return {
              statusCode: 500,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                error: 'Internal server error',
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

    // Grant Lambda permissions to DynamoDB
    this.table.grantReadWriteData(this.lambdaFunction);

    // API Gateway
    this.api = new apigateway.RestApi(this, 'Api', {
      restApiName: props?.apiName || `${id}-api`,
      description: 'Web API with Lambda and DynamoDB',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // Lambda Integration
    const lambdaIntegration = new apigateway.LambdaIntegration(this.lambdaFunction);

    // API Routes
    this.api.root.addMethod('GET', lambdaIntegration);
    
    const itemsResource = this.api.root.addResource('items');
    itemsResource.addMethod('GET', lambdaIntegration);
    itemsResource.addMethod('POST', lambdaIntegration);
  }

  // Helper method to add custom routes
  public addRoute(path: string, method: string): apigateway.Resource {
    const resource = this.api.root.addResource(path);
    const integration = new apigateway.LambdaIntegration(this.lambdaFunction);
    resource.addMethod(method, integration);
    return resource;
  }
}
```

### 1.2 Using the Custom Construct

Update your main stack to use the custom construct:

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

    // Static Website (from Day 2)
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

    // NEW: Use our custom Web API construct
    const webApi = new WebApiConstruct(this, 'WebApi', {
      tableName: `web-api-table-${environment}`,
      lambdaMemorySize: environment === 'prod' ? 512 : 256,
      apiName: `web-api-${environment}`,
    });

    // Add custom routes to the API
    webApi.addRoute('health', 'GET');
    webApi.addRoute('users', 'GET');

    // Deploy website content
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('./website')],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // Outputs
    new cdk.CfnOutput(this, 'WebsiteURL', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'CloudFront Website URL',
    });

    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: webApi.api.url,
      description: 'API Gateway Endpoint',
    });

    new cdk.CfnOutput(this, 'DynamoDBTableName', {
      value: webApi.table.tableName,
      description: 'DynamoDB Table Name',
    });
  }
}
```

## 2. Advanced Patterns

### 2.1 Cross-Stack References

Create separate stacks for different concerns:

Create `lib/database-stack.ts`:

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

    // VPC for RDS
    this.vpc = new ec2.Vpc(this, 'AppVpc', {
      maxAzs: 2,
      natGateways: 1,
    });

    // DynamoDB for user sessions
    this.userTable = new dynamodb.Table(this, 'UserTable', {
      tableName: `users-${this.stackName}`,
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // RDS for application data (optional - for demonstration)
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

    // Export values for cross-stack reference
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

Create `lib/application-stack.ts`:

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

    // Import VPC from Database Stack
    const vpc = ec2.Vpc.fromLookup(this, 'ImportedVpc', {
      vpcId: props.vpcId,
    });

    // Lambda function that uses the shared user table
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
      vpc: vpc, // Deploy Lambda in VPC
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

Update your app entry point to use multiple stacks:

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

// Ensure proper deployment order
applicationStack.addDependency(databaseStack);
```

## 3. CDK Aspects for Governance

### 3.1 Security Aspect

Create `lib/security-aspect.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { IConstruct } from 'constructs';

export class SecurityAspect implements cdk.IAspect {
  visit(node: IConstruct): void {
    // Ensure all S3 buckets have encryption
    if (node instanceof s3.CfnBucket) {
      if (!node.bucketEncryption) {
        cdk.Annotations.of(node).addError(
          'S3 bucket must have encryption enabled'
        );
      }
    }

    // Ensure Lambda functions have reasonable timeouts
    if (node instanceof lambda.CfnFunction) {
      if (!node.timeout || node.timeout > 300) {
        cdk.Annotations.of(node).addWarning(
          'Lambda timeout should be less than 5 minutes'
        );
      }
    }

    // Check for hardcoded values that should be parameterized
    if (node instanceof cdk.CfnResource) {
      const template = JSON.stringify(node._toCloudFormation());
      if (template.includes('password') || template.includes('secret')) {
        cdk.Annotations.of(node).addWarning(
          'Potential hardcoded credentials detected'
        );
      }
    }
  }
}
```

### 3.2 Cost Optimization Aspect

Create `lib/cost-aspect.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { IConstruct } from 'constructs';

export class CostOptimizationAspect implements cdk.IAspect {
  constructor(private environment: string) {}

  visit(node: IConstruct): void {
    // In non-production environments, suggest smaller instance types
    if (this.environment !== 'prod') {
      if (node instanceof ec2.CfnInstance) {
        if (node.instanceType && !node.instanceType.includes('micro') && !node.instanceType.includes('small')) {
          cdk.Annotations.of(node).addWarning(
            `Consider using smaller instance type in ${this.environment} environment`
          );
        }
      }

      if (node instanceof rds.CfnDBInstance) {
        if (node.dbInstanceClass && !node.dbInstanceClass.includes('micro')) {
          cdk.Annotations.of(node).addWarning(
            `Consider using db.t3.micro in ${this.environment} environment`
          );
        }
      }
    }

    // Check for NAT Gateways in development
    if (this.environment === 'dev' && node instanceof ec2.CfnNatGateway) {
      cdk.Annotations.of(node).addWarning(
        'NAT Gateway incurs charges. Consider using NAT Instance for development'
      );
    }
  }
}
```

### 3.3 Apply Aspects to Your Stack

Update your stack to use Aspects:

```typescript
import { SecurityAspect } from './security-aspect';
import { CostOptimizationAspect } from './cost-aspect';

export class MyFirstCdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const environment = this.node.tryGetContext('environment') || 'dev';

    // ... your existing resources ...

    // Apply governance aspects
    cdk.Aspects.of(this).add(new SecurityAspect());
    cdk.Aspects.of(this).add(new CostOptimizationAspect(environment));
  }
}
```

## 4. Exercise: Build a Complete Application

### 4.1 Requirements

Build a todo application with:
- Frontend hosted on CloudFront + S3
- API Gateway + Lambda for backend
- DynamoDB for data storage
- Proper security and monitoring

### 4.2 Solution Structure

```
lib/
├── todo-app-stack.ts          # Main application stack
├── constructs/
│   ├── todo-api.ts            # Todo API construct
│   ├── todo-frontend.ts       # Frontend hosting construct
│   └── todo-database.ts       # Database construct
└── aspects/
    ├── security-aspect.ts     # Security governance
    └── monitoring-aspect.ts   # Monitoring governance
```

### 4.3 Todo API Construct

Create `lib/constructs/todo-api.ts`:

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

    // Lambda function for Todo operations
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
          
          console.log('Request:', { method, path, body: event.body });
          
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
                  
                  response = { message: 'Todo created', todo };
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
                  
                  response = { message: 'Todo updated' };
                }
                break;
                
              case 'DELETE':
                if (path.startsWith('/todos/')) {
                  const id = path.split('/')[2];
                  
                  await dynamodb.delete({
                    TableName: tableName,
                    Key: { id },
                  }).promise();
                  
                  response = { message: 'Todo deleted' };
                }
                break;
                
              default:
                response = { message: 'Method not allowed' };
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
            console.error('Error:', error);
            return {
              statusCode: 500,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                error: 'Internal server error',
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

    // Grant permissions
    props.table.grantReadWriteData(todoFunction);

    // API Gateway
    this.api = new apigateway.RestApi(this, 'TodoApi', {
      restApiName: 'Todo API',
      description: 'Todo application API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const lambdaIntegration = new apigateway.LambdaIntegration(todoFunction);

    // Routes
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

## Summary

Today you learned:

1. ✅ Creating custom, reusable Constructs
2. ✅ Advanced CDK patterns and best practices  
3. ✅ Cross-stack resource sharing and dependencies
4. ✅ CDK Aspects for governance and compliance
5. ✅ Building complex, multi-tier applications

### Key Concepts Covered

- **Custom Constructs**: Encapsulating multiple resources into reusable components
- **Cross-Stack References**: Sharing resources between different stacks
- **CDK Aspects**: Implementing governance and compliance checks
- **Multi-Tier Architecture**: Separating concerns across different stacks

### Architecture Pattern Built

```
Frontend Stack    →  Application Stack  →  Database Stack
(S3 + CloudFront) →  (Lambda + API GW)   →  (DynamoDB + RDS)
```

### Next Steps

Tomorrow (Day 4), we'll focus on testing your CDK applications, setting up CI/CD pipelines, and ensuring code quality through automated testing strategies.

---

**Best Practice Tips from Day 3:**

1. **Construct Design**: Make constructs configurable and reusable
2. **Stack Separation**: Separate concerns by lifecycle (database vs application)
3. **Governance**: Use Aspects to enforce organizational standards
4. **Resource Naming**: Use consistent, environment-aware naming
5. **Cross-References**: Minimize tight coupling between stacks