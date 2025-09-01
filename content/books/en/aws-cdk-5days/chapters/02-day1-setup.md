---
title: Day 1 - AWS CDK Environment Setup and First Steps
order: 2
---

# Day 1 - AWS CDK Environment Setup and First Steps

## Today's Goals

1. Set up AWS CDK development environment
2. Create your first CDK project
3. Deploy a simple S3 bucket
4. Understand basic CDK commands

## 1. Environment Setup

### 1.1 Node.js Installation Check

AWS CDK runs on Node.js. First, let's check the current version.

```bash
node --version
npm --version
```

Node.js 18.x or higher is required. If not installed, download from the [Node.js official website](https://nodejs.org/).

### 1.2 AWS CLI Setup

AWS CDK uses AWS CLI to communicate with your AWS account.

```bash
# Check AWS CLI version
aws --version

# Configure AWS credentials
aws configure
```

Enter the following information:
- AWS Access Key ID
- AWS Secret Access Key  
- Default region name (e.g., ap-northeast-1)
- Default output format (json recommended)

### 1.3 AWS CDK Installation

Install AWS CDK globally.

```bash
npm install -g aws-cdk
```

After installation, check the version.

```bash
cdk --version
```

### 1.4 CDK Bootstrap

Before using CDK, you need to run bootstrap for your AWS account and region.

```bash
cdk bootstrap
```

This creates resources that CDK uses, such as S3 buckets and IAM roles.

## 2. Creating Your First Project

### 2.1 Create Project Directory

```bash
mkdir my-first-cdk-app
cd my-first-cdk-app
```

### 2.2 Initialize CDK Application

Initialize a new CDK app using TypeScript template:

```bash
cdk init app --language typescript
```

This creates the following project structure:

```
my-first-cdk-app/
├── bin/
│   └── my-first-cdk-app.ts     # App entry point
├── lib/
│   └── my-first-cdk-app-stack.ts # Stack definition
├── test/
│   └── my-first-cdk-app.test.ts  # Unit tests
├── cdk.json                     # CDK configuration
├── package.json                 # npm dependencies
└── tsconfig.json               # TypeScript configuration
```

### 2.3 Install Dependencies

```bash
npm install
```

## 3. Understanding the Basic Structure

### 3.1 App Entry Point (bin/my-first-cdk-app.ts)

```typescript
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MyFirstCdkAppStack } from '../lib/my-first-cdk-app-stack';

const app = new cdk.App();
new MyFirstCdkAppStack(app, 'MyFirstCdkAppStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
```

### 3.2 Stack Definition (lib/my-first-cdk-app-stack.ts)

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class MyFirstCdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Your resources will be defined here
  }
}
```

## 4. Creating Your First S3 Bucket

### 4.1 Modify Stack to Add S3 Bucket

Edit `lib/my-first-cdk-app-stack.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class MyFirstCdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create an S3 bucket
    const bucket = new s3.Bucket(this, 'MyFirstBucket', {
      bucketName: 'my-first-cdk-bucket-' + Math.random().toString(36).substring(7),
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // Output the bucket name
    new cdk.CfnOutput(this, 'BucketName', {
      value: bucket.bucketName,
      description: 'The name of the S3 bucket',
    });
  }
}
```

### 4.2 Key Properties Explained

- **bucketName**: Unique bucket name (with random suffix)
- **versioned**: Enable object versioning
- **removalPolicy**: What to do when stack is deleted (DESTROY allows deletion)
- **blockPublicAccess**: Security setting to block all public access

## 5. CDK Commands

### 5.1 Synthesize CloudFormation Template

```bash
cdk synth
```

This generates the CloudFormation template and displays it. You can see how your CDK code translates to CloudFormation.

### 5.2 Compare Changes

```bash
cdk diff
```

Shows the differences between your current stack and the deployed stack.

### 5.3 Deploy the Stack

```bash
cdk deploy
```

This deploys your stack to AWS. You'll be prompted to confirm the changes before deployment.

### 5.4 List All Stacks

```bash
cdk list
```

Shows all stacks in your CDK app.

### 5.5 Destroy the Stack

```bash
cdk destroy
```

Deletes the stack and all its resources from AWS.

## 6. Exercise: Create Multiple Resources

Try adding more resources to your stack:

### 6.1 Add Another S3 Bucket with Website Hosting

```typescript
// Add to your stack
const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
  bucketName: 'my-website-bucket-' + Math.random().toString(36).substring(7),
  websiteIndexDocument: 'index.html',
  websiteErrorDocument: 'error.html',
  publicReadAccess: true,
  removalPolicy: cdk.RemovalPolicy.DESTROY,
});

new cdk.CfnOutput(this, 'WebsiteURL', {
  value: websiteBucket.bucketWebsiteUrl,
  description: 'Website URL',
});
```

### 6.2 Deploy and Test

```bash
# See what will be created
cdk diff

# Deploy the changes
cdk deploy
```

Check the AWS Console to see your created resources.

## 7. Best Practices for Day 1

### 7.1 Naming Conventions

- Use descriptive names for constructs
- Include environment or purpose in resource names
- Use consistent naming patterns

### 7.2 Resource Management

- Always set `removalPolicy` for development resources
- Use `blockPublicAccess` for S3 buckets unless public access is needed
- Add meaningful outputs for important resource properties

### 7.3 Code Organization

- Keep stack files focused and not too large
- Use comments to explain complex configurations
- Follow TypeScript best practices

## 8. Troubleshooting Common Issues

### 8.1 Bootstrap Issues

If bootstrap fails:
```bash
# Check AWS credentials
aws sts get-caller-identity

# Try bootstrapping with explicit region
cdk bootstrap aws://ACCOUNT-NUMBER/REGION
```

### 8.2 Bucket Name Conflicts

S3 bucket names must be globally unique. If deployment fails:
- Use random suffixes as shown in examples
- Include timestamp or account ID in bucket names

### 8.3 Permission Issues

Ensure your AWS user has sufficient permissions:
- CloudFormation full access
- IAM permissions for creating roles
- Permissions for services you're using (S3, Lambda, etc.)

## Summary

Today you learned:

1. ✅ Set up AWS CDK development environment
2. ✅ Created your first CDK project
3. ✅ Deployed an S3 bucket using CDK
4. ✅ Understood basic CDK commands and workflow

### Key Concepts Covered

- **CDK Bootstrap**: One-time setup for CDK in your AWS account
- **Constructs**: Building blocks of CDK applications
- **Stacks**: Units of deployment in CDK
- **Synthesis**: Converting CDK code to CloudFormation templates

### Next Steps

Tomorrow (Day 2), we'll dive deeper into CDK constructs and explore more AWS services like Lambda and API Gateway.

---

**Exercise Solution:**

Complete stack with multiple resources:

```typescript
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class MyFirstCdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Private bucket for data storage
    const dataBucket = new s3.Bucket(this, 'DataBucket', {
      bucketName: 'my-data-bucket-' + Math.random().toString(36).substring(7),
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // Public bucket for website hosting
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: 'my-website-bucket-' + Math.random().toString(36).substring(7),
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'error.html',
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Outputs
    new cdk.CfnOutput(this, 'DataBucketName', {
      value: dataBucket.bucketName,
      description: 'Name of the private data bucket',
    });

    new cdk.CfnOutput(this, 'WebsiteURL', {
      value: websiteBucket.bucketWebsiteUrl,
      description: 'Website URL',
    });
  }
}
```