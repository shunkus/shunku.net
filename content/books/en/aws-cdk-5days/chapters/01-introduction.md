---
title: Introduction - Welcome to the AWS CDK World
order: 1
---

# Introduction - Welcome to the AWS CDK World

## About This Book

This book aims to help you learn AWS Cloud Development Kit (AWS CDK) in 5 days and acquire practical infrastructure management skills.

### Target Audience

- Those with basic AWS knowledge
- Those with programming experience (especially TypeScript/JavaScript)
- Those interested in Infrastructure as Code (IaC)
- Those who want to move away from manual infrastructure management

### Learning Objectives

By the end of this book, you will be able to:

1. Understand AWS CDK basic concepts and set up the environment
2. Create and manage basic AWS resources using CDK
3. Create reusable components (Constructs)
4. Integrate with testing and CI/CD pipelines
5. Deploy safely to production environments

## What is AWS CDK?

AWS Cloud Development Kit (AWS CDK) is an open-source framework for defining cloud application resources using programming languages.

### Differences from Traditional Methods

#### Traditional CloudFormation
```yaml
Resources:
  MyBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: my-app-bucket-12345
      VersioningConfiguration:
        Status: Enabled
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true
```

#### AWS CDK (TypeScript)
```typescript
import * as s3 from 'aws-cdk-lib/aws-s3';

const bucket = new s3.Bucket(this, 'MyBucket', {
  bucketName: 'my-app-bucket-12345',
  versioned: true,
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL
});
```

### AWS CDK Features

1. **Leverage Programming Language Power**
   - Use conditional statements, loops, functions, etc.
   - Utilize IDE completion and refactoring features
   - Apply existing programming skills

2. **Reusability and Modularization**
   - Create and reuse custom Constructs
   - Share as npm packages
   - Standardize best practices within organizations

3. **Type Safety**
   - Detect errors at compile time
   - Property completion and validation
   - Documented APIs

4. **CloudFormation Compatibility**
   - Generates CloudFormation templates ultimately
   - Integrable with existing CloudFormation resources
   - Access to all CloudFormation features

## How to Proceed with Learning

### 5-Day Learning Schedule

| Day | Theme | Content |
|-----|-------|---------|
| Day 1 | Basics and Setup | CDK basic concepts, environment setup, initial deployment |
| Day 2 | Core Constructs and Stack | Creating basic AWS resources, Stack management |
| Day 3 | Advanced Constructs and Patterns | Custom Constructs, design patterns |
| Day 4 | Testing and CI/CD | Unit tests, integration tests, CI/CD pipelines |
| Day 5 | Best Practices and Production Deployment | Security, monitoring, production operations |

### Prerequisites Check

Before starting, please confirm you have the following knowledge:

#### AWS Basic Knowledge
- Basic services like EC2, S3, Lambda, RDS
- Basic IAM concepts (roles, policies)
- VPC and networking basics

#### Programming Knowledge
- Basic TypeScript/JavaScript syntax
- Experience with npm/yarn
- Basic Git operations

#### Development Environment
- Node.js 18.x or higher
- Any IDE or editor (VS Code recommended)
- AWS CLI
- Git

## Book Structure

Each chapter is structured as follows:

1. **Overview** - Summary of content to be learned that day
2. **Theory** - Basic concepts and theoretical background
3. **Practice** - Hands-on learning by writing actual code
4. **Exercises** - Tasks to deepen understanding
5. **Summary** - Review of that day's learning content

## About the Sample Project

In this book, we will progressively build a web application as follows:

1. **Day 1**: Static website (S3 + CloudFront)
2. **Day 2**: Serverless API (Lambda + API Gateway)
3. **Day 3**: Database integration (DynamoDB)
4. **Day 4**: CI/CD pipeline
5. **Day 5**: Monitoring and alerts

### Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CloudFront    │────│   API Gateway    │────│     Lambda      │
│  (Static Web)   │    │   (REST API)     │    │  (Business      │
└─────────────────┘    └──────────────────┘    │   Logic)        │
                                               └─────────────────┘
                                                        │
                                               ┌─────────────────┐
                                               │    DynamoDB     │
                                               │   (Database)    │
                                               └─────────────────┘
```

## Next Steps

When ready, proceed to Day 1: "AWS CDK Environment Setup and First Steps".

By learning through writing actual code, you should experience the power and convenience of AWS CDK.

---

**Note**: Running the sample code in this book may incur AWS charges. We recommend practicing within the AWS free tier limits. Be sure to delete unnecessary resources when done.