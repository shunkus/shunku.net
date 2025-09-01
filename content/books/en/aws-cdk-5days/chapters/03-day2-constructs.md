---
title: Day 2 - Understanding Core Constructs and Stacks
order: 3
---

# Day 2 - Understanding Core Constructs and Stacks

## Today's Goals

1. Understand the hierarchical structure of Construct, Stack, and App
2. Combine multiple AWS services
3. Build the foundation of a serverless web application
4. Learn environment-specific configuration management

## 1. CDK's Three-Layer Structure

### 1.1 Understanding Construct Hierarchy

CDK provides three levels of Constructs:

#### L1 Constructs (CFN Resources)
- Direct wrappers around CloudFormation resources
- Prefixed with `Cfn`
- Most granular control possible, but complex configuration

```typescript
import * as cdk from 'aws-cdk-lib';

// L1 Construct example
const cfnBucket = new cdk.aws_s3.CfnBucket(this, 'L1Bucket', {
  bucketName: 'my-l1-bucket',
  versioningConfiguration: {
    status: 'Enabled'
  }
});
```

#### L2 Constructs (AWS Constructs)
- High-level wrappers for AWS services
- Provide sensible defaults
- Most commonly used

```typescript
import * as s3 from 'aws-cdk-lib/aws-s3';

// L2 Construct example
const bucket = new s3.Bucket(this, 'L2Bucket', {
  versioned: true,
  bucketName: 'my-l2-bucket'
});
```

#### L3 Constructs (Patterns)
- Patterns combining multiple AWS services
- Incorporate best practices
- Designed for specific use cases

```typescript
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

// L3 Construct example
new s3deploy.BucketDeployment(this, 'DeployWebsite', {
  sources: [s3deploy.Source.asset('./website')],
  destinationBucket: bucket
});
```

## 2. Practice: Building a Static Website

Let's extend yesterday's project to build a static website using CloudFront.

### 2.1 Update Stack Implementation

Update `lib/my-first-cdk-app-stack.ts`:

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

    // S3 Bucket for static website hosting
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `my-website-bucket-${Date.now()}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // Access only via CloudFront
    });

    // Origin Access Identity for CloudFront
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OAI', {
      comment: 'OAI for my website'
    });

    // Grant CloudFront access to S3 bucket
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

    // Deploy website content
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('./website')],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // Outputs
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

### 2.2 Create Website Content

Create a `website` directory in your project root:

```bash
mkdir website
```

Create `website/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My CDK Website</title>
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
        <h1>Welcome to My CDK Website!</h1>
        <div class="feature">
            <h3>🚀 Deployed with AWS CDK</h3>
            <p>This website is deployed using Infrastructure as Code with AWS CDK.</p>
        </div>
        <div class="feature">
            <h3>☁️ Powered by CloudFront</h3>
            <p>Fast global content delivery with AWS CloudFront CDN.</p>
        </div>
        <div class="feature">
            <h3>📦 Stored in S3</h3>
            <p>Static content securely stored in Amazon S3.</p>
        </div>
        <div class="feature">
            <h3>🔒 Secure by Default</h3>
            <p>HTTPS redirection and Origin Access Identity for security.</p>
        </div>
    </div>
</body>
</html>
```

Create `website/error.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Not Found</title>
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
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <a href="/" style="color: white;">Go back to home</a>
    </div>
</body>
</html>
```

### 2.3 Deploy the Website

```bash
# Synthesize to check the generated CloudFormation
cdk synth

# Deploy the stack
cdk deploy
```

After deployment, you'll receive a CloudFront URL that you can visit to see your website.

## 3. Adding a Lambda API

Now let's add a serverless API using Lambda and API Gateway.

### 3.1 Create Lambda Function

Create `lambda` directory and add `hello.js`:

```bash
mkdir lambda
```

Create `lambda/hello.js`:

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
            message: 'Hello from CDK Lambda!',
            timestamp: new Date().toISOString(),
            requestId: event.requestContext?.requestId || 'unknown'
        }),
    };
    return response;
};
```

### 3.2 Update Stack with Lambda and API Gateway

Add the following to your stack:

```typescript
// Add these imports at the top
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

// Add this inside your stack constructor, after the CloudFront setup

// Lambda function
const helloFunction = new lambda.Function(this, 'HelloFunction', {
  runtime: lambda.Runtime.NODEJS_18_X,
  handler: 'hello.handler',
  code: lambda.Code.fromAsset('lambda'),
  timeout: cdk.Duration.seconds(30),
});

// API Gateway
const api = new apigateway.RestApi(this, 'HelloApi', {
  restApiName: 'Hello Service',
  description: 'This service serves hello requests.',
  defaultCorsPreflightOptions: {
    allowOrigins: apigateway.Cors.ALL_ORIGINS,
    allowMethods: apigateway.Cors.ALL_METHODS,
  },
});

const helloIntegration = new apigateway.LambdaIntegration(helloFunction);
api.root.addMethod('GET', helloIntegration);

const helloResource = api.root.addResource('hello');
helloResource.addMethod('GET', helloIntegration);

// Add API URL to outputs
new cdk.CfnOutput(this, 'ApiUrl', {
  value: api.url,
  description: 'API Gateway URL',
});
```

### 3.3 Update Website to Call API

Update `website/index.html` to include API integration:

```html
<!-- Add this button after the existing features -->
<div class="feature">
    <h3>⚡ Serverless API</h3>
    <p>Click the button to test our Lambda API:</p>
    <button onclick="callApi()" style="padding: 10px 20px; margin: 10px 0; cursor: pointer;">
        Call Lambda API
    </button>
    <div id="api-response" style="margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 5px; display: none;">
    </div>
</div>

<script>
async function callApi() {
    const responseDiv = document.getElementById('api-response');
    const apiUrl = 'YOUR_API_URL_HERE'; // Replace with actual API URL after deployment
    
    try {
        responseDiv.style.display = 'block';
        responseDiv.innerHTML = 'Loading...';
        
        const response = await fetch(apiUrl + '/hello');
        const data = await response.json();
        
        responseDiv.innerHTML = `
            <h4>API Response:</h4>
            <pre>${JSON.stringify(data, null, 2)}</pre>
        `;
    } catch (error) {
        responseDiv.innerHTML = `
            <h4>Error:</h4>
            <p>${error.message}</p>
        `;
    }
}
</script>
```

### 3.4 Deploy and Test

```bash
cdk deploy
```

After deployment, update the `apiUrl` in your HTML with the actual API Gateway URL from the output, then redeploy:

```bash
cdk deploy
```

## 4. Environment Management

### 4.1 Environment-Specific Configuration

Create different configurations for different environments:

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

### 4.2 Using Environment Variables

Update your app entry point:

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

Deploy to different environments:

```bash
# Deploy to dev (default)
cdk deploy

# Deploy to staging
cdk deploy --context environment=staging

# Deploy to production
cdk deploy --context environment=prod
```

## 5. Exercise: Add DynamoDB Integration

### 5.1 Add DynamoDB Table

```typescript
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

// Add to your stack constructor
const table = new dynamodb.Table(this, 'VisitorTable', {
  tableName: `visitors-${environment}`,
  partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
  removalPolicy: cdk.RemovalPolicy.DESTROY, // Only for dev/testing
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
});

// Grant Lambda permission to access DynamoDB
table.grantReadWriteData(helloFunction);

// Pass table name to Lambda
helloFunction.addEnvironment('TABLE_NAME', table.tableName);
```

### 5.2 Update Lambda Function

Update `lambda/hello.js`:

```javascript
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const tableName = process.env.TABLE_NAME;
    const visitorId = event.requestContext?.requestId || 'unknown';
    
    try {
        // Record visitor
        await dynamodb.put({
            TableName: tableName,
            Item: {
                id: visitorId,
                timestamp: new Date().toISOString(),
                userAgent: event.headers?.['User-Agent'] || 'unknown'
            }
        }).promise();
        
        // Get visitor count
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
                message: 'Hello from CDK Lambda with DynamoDB!',
                visitorId: visitorId,
                totalVisitors: result.Count,
                timestamp: new Date().toISOString()
            }),
        };
        return response;
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                message: 'Internal server error',
                error: error.message
            }),
        };
    }
};
```

## Summary

Today you learned:

1. ✅ CDK's three-layer Construct hierarchy (L1, L2, L3)
2. ✅ Building a complete static website with CloudFront
3. ✅ Creating serverless APIs with Lambda and API Gateway
4. ✅ Environment-specific configuration management
5. ✅ DynamoDB integration for data persistence

### Key Concepts Covered

- **Construct Levels**: L1 (CFN), L2 (AWS), L3 (Patterns)
- **CloudFront**: Global CDN with Origin Access Identity
- **Lambda Functions**: Serverless compute with API Gateway
- **Environment Management**: Context-based configuration
- **Cross-Service Integration**: Lambda + DynamoDB permissions

### Architecture Built Today

```
Internet → CloudFront → S3 (Static Website)
              ↓
         API Gateway → Lambda → DynamoDB
```

### Next Steps

Tomorrow (Day 3), we'll explore advanced CDK patterns, custom constructs, and learn how to create reusable components that follow AWS best practices.

---

**Note**: Remember to clean up resources when done practicing to avoid unnecessary charges:

```bash
cdk destroy
```