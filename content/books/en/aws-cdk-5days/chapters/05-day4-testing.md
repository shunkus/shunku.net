---
title: Day 4 - Testing and CI/CD Integration
order: 5
---

# Day 4 - Testing and CI/CD Integration

## Today's Goals

1. Write unit tests for CDK constructs
2. Implement integration testing strategies
3. Set up GitHub Actions CI/CD pipeline
4. Configure automated deployment workflows
5. Learn testing best practices for Infrastructure as Code

## 1. CDK Testing Fundamentals

### 1.1 Install Testing Dependencies

First, install the necessary testing packages:

```bash
npm install --save-dev jest @types/jest ts-jest
npm install --save-dev aws-cdk-lib/assertions
```

Update your `package.json` to include test scripts:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "preset": "ts-jest",
    "testEnvironment": "node",
    "testMatch": ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
    "collectCoverageFrom": [
      "lib/**/*.ts",
      "!lib/**/*.d.ts"
    ]
  }
}
```

### 1.2 Basic Unit Tests

Create `test/my-first-cdk-app-stack.test.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { MyFirstCdkAppStack } from '../lib/my-first-cdk-app-stack';

describe('MyFirstCdkAppStack', () => {
  let app: cdk.App;
  let stack: MyFirstCdkAppStack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new MyFirstCdkAppStack(app, 'TestStack');
    template = Template.fromStack(stack);
  });

  test('Creates S3 bucket with correct properties', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    });
  });

  test('Creates CloudFront distribution', () => {
    template.hasResource('AWS::CloudFront::Distribution', {
      Properties: Match.objectLike({
        DistributionConfig: Match.objectLike({
          DefaultRootObject: 'index.html',
          Enabled: true,
        }),
      }),
    });
  });

  test('Creates Lambda function with correct runtime', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Runtime: 'nodejs18.x',
      Timeout: 30,
    });
  });

  test('Creates API Gateway with CORS', () => {
    template.hasResource('AWS::ApiGateway::RestApi', {});
    
    // Check for CORS method
    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'OPTIONS',
    });
  });

  test('Lambda function has DynamoDB permissions', () => {
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Effect: 'Allow',
            Action: Match.arrayWith([
              'dynamodb:BatchGetItem',
              'dynamodb:GetRecords',
              'dynamodb:Query',
              'dynamodb:BatchWriteItem',
              'dynamodb:PutItem',
              'dynamodb:UpdateItem',
              'dynamodb:DeleteItem',
            ]),
          }),
        ]),
      },
    });
  });

  test('Stack has required outputs', () => {
    template.hasOutput('WebsiteURL', {});
    template.hasOutput('ApiEndpoint', {});
  });

  test('Resources have proper tags in production', () => {
    const prodApp = new cdk.App({ context: { environment: 'prod' } });
    const prodStack = new MyFirstCdkAppStack(prodApp, 'ProdStack', {
      tags: { Environment: 'prod' }
    });
    const prodTemplate = Template.fromStack(prodStack);

    // Check that resources are properly tagged
    prodTemplate.hasResource('AWS::S3::Bucket', {
      Properties: Match.objectLike({
        Tags: Match.arrayWith([
          { Key: 'Environment', Value: 'prod' }
        ])
      })
    });
  });
});
```

### 1.3 Testing Custom Constructs

Create `test/web-api-construct.test.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { WebApiConstruct } from '../lib/web-api-construct';

describe('WebApiConstruct', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new cdk.Stack(app, 'TestStack');
  });

  test('Creates all required resources', () => {
    new WebApiConstruct(stack, 'TestWebApi');
    template = Template.fromStack(stack);

    // Should create DynamoDB table
    template.resourceCountIs('AWS::DynamoDB::Table', 1);
    
    // Should create Lambda function
    template.resourceCountIs('AWS::Lambda::Function', 1);
    
    // Should create API Gateway
    template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
  });

  test('DynamoDB table has correct structure', () => {
    new WebApiConstruct(stack, 'TestWebApi');
    template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::DynamoDB::Table', {
      KeySchema: [
        { AttributeName: 'pk', KeyType: 'HASH' },
        { AttributeName: 'sk', KeyType: 'RANGE' }
      ],
      BillingMode: 'PAY_PER_REQUEST',
    });
  });

  test('Lambda function has environment variables', () => {
    new WebApiConstruct(stack, 'TestWebApi');
    template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::Lambda::Function', {
      Environment: {
        Variables: {
          TABLE_NAME: { Ref: cdk.Match.anyValue() }
        }
      }
    });
  });

  test('API Gateway has CORS configured', () => {
    new WebApiConstruct(stack, 'TestWebApi');
    template = Template.fromStack(stack);

    // Should have OPTIONS methods for CORS
    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'OPTIONS',
      Integration: {
        Type: 'MOCK'
      }
    });
  });

  test('Custom properties are applied correctly', () => {
    new WebApiConstruct(stack, 'TestWebApi', {
      tableName: 'custom-table',
      lambdaMemorySize: 512,
      apiName: 'custom-api'
    });
    template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'custom-table'
    });

    template.hasResourceProperties('AWS::Lambda::Function', {
      MemorySize: 512
    });

    template.hasResourceProperties('AWS::ApiGateway::RestApi', {
      Name: 'custom-api'
    });
  });
});
```

### 1.4 Integration Tests

Create `test/integration/app-integration.test.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { DatabaseStack } from '../../lib/database-stack';
import { ApplicationStack } from '../../lib/application-stack';

describe('Multi-Stack Integration', () => {
  let app: cdk.App;
  let databaseStack: DatabaseStack;
  let applicationStack: ApplicationStack;

  beforeEach(() => {
    app = new cdk.App();
    databaseStack = new DatabaseStack(app, 'TestDatabaseStack');
    applicationStack = new ApplicationStack(app, 'TestApplicationStack', {
      userTableName: databaseStack.userTable.tableName,
      vpcId: databaseStack.vpc.vpcId,
    });
  });

  test('Application stack references database resources correctly', () => {
    const appTemplate = Template.fromStack(applicationStack);
    const dbTemplate = Template.fromStack(databaseStack);

    // Database stack should export values
    dbTemplate.hasOutput('UserTableName', {});
    dbTemplate.hasOutput('VpcId', {});

    // Application stack should use the correct table name
    appTemplate.hasResourceProperties('AWS::Lambda::Function', {
      Environment: {
        Variables: {
          USER_TABLE_NAME: databaseStack.userTable.tableName
        }
      }
    });
  });

  test('Stacks have correct dependencies', () => {
    const dependencies = applicationStack.dependencies;
    expect(dependencies).toContain(databaseStack);
  });

  test('VPC configuration is consistent', () => {
    const dbTemplate = Template.fromStack(databaseStack);
    const appTemplate = Template.fromStack(applicationStack);

    // Both stacks should reference the same VPC
    dbTemplate.hasResource('AWS::EC2::VPC', {});
    appTemplate.hasResourceProperties('AWS::Lambda::Function', {
      VpcConfig: cdk.Match.anyValue()
    });
  });
});
```

### 1.5 Snapshot Testing

Create `test/snapshots/stack-snapshot.test.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import { MyFirstCdkAppStack } from '../../lib/my-first-cdk-app-stack';

describe('Stack Snapshots', () => {
  test('Stack snapshot matches expected template', () => {
    const app = new cdk.App();
    const stack = new MyFirstCdkAppStack(app, 'TestStack');
    
    expect(app.synth().getStackArtifact(stack.artifactId).template).toMatchSnapshot();
  });

  test('Production stack snapshot', () => {
    const app = new cdk.App({ 
      context: { environment: 'prod' } 
    });
    const stack = new MyFirstCdkAppStack(app, 'ProdStack', {
      tags: { Environment: 'prod' }
    });
    
    expect(app.synth().getStackArtifact(stack.artifactId).template).toMatchSnapshot();
  });
});
```

## 2. Advanced Testing Strategies

### 2.1 Property-Based Testing

Create `test/property-tests/construct-properties.test.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { WebApiConstruct } from '../../lib/web-api-construct';

describe('WebApiConstruct Property Tests', () => {
  test.each([
    [128, 'tiny-table', 'tiny-api'],
    [256, 'medium-table', 'medium-api'],  
    [512, 'large-table', 'large-api'],
  ])('Creates construct with memory: %i, table: %s, api: %s', (memory, tableName, apiName) => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'TestStack');
    
    new WebApiConstruct(stack, 'TestConstruct', {
      lambdaMemorySize: memory,
      tableName: tableName,
      apiName: apiName
    });

    const template = Template.fromStack(stack);
    
    template.hasResourceProperties('AWS::Lambda::Function', {
      MemorySize: memory
    });
    
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: tableName
    });
    
    template.hasResourceProperties('AWS::ApiGateway::RestApi', {
      Name: apiName
    });
  });
});
```

### 2.2 Testing Error Conditions

Create `test/error-conditions/validation.test.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import { WebApiConstruct } from '../../lib/web-api-construct';

describe('Error Condition Tests', () => {
  let app: cdk.App;
  let stack: cdk.Stack;

  beforeEach(() => {
    app = new cdk.App();
    stack = new cdk.Stack(app, 'TestStack');
  });

  test('Invalid memory size should use default', () => {
    const construct = new WebApiConstruct(stack, 'TestConstruct', {
      lambdaMemorySize: -1 // Invalid value
    });

    const template = Template.fromStack(stack);
    
    // Should use default value instead of invalid one
    template.hasResourceProperties('AWS::Lambda::Function', {
      MemorySize: 256 // Default value
    });
  });

  test('Empty table name should generate default', () => {
    new WebApiConstruct(stack, 'TestConstruct', {
      tableName: '' // Empty table name
    });

    const template = Template.fromStack(stack);
    
    // Should create table with generated name
    template.hasResource('AWS::DynamoDB::Table', {
      Properties: {
        TableName: cdk.Match.stringLikeRegexp('TestConstruct.*')
      }
    });
  });
});
```

## 3. CI/CD Pipeline Setup

### 3.1 GitHub Actions Workflow

Create `.github/workflows/ci-cd.yml`:

```yaml
name: CDK CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  AWS_REGION: us-east-1
  NODE_VERSION: '18'

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run linting
      run: npm run lint
      continue-on-error: true
      
    - name: Run unit tests
      run: npm run test
      
    - name: Run test coverage
      run: npm run test:coverage
      
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: cdk-coverage
      continue-on-error: true
      
    - name: CDK Synth
      run: npx cdk synth
      
    - name: CDK Security Scan (cdk-nag)
      run: |
        npm install -g cdk-nag
        npx cdk synth --app "npx ts-node --prefer-ts-exts bin/my-first-cdk-app.ts" 2>&1 | tee synth-output.txt || true
      continue-on-error: true

  deploy-dev:
    name: Deploy to Development
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/develop'
    environment: development
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
        
    - name: CDK Bootstrap (if needed)
      run: npx cdk bootstrap --require-approval never
      continue-on-error: true
      
    - name: CDK Deploy to Development
      run: |
        npx cdk deploy --all --require-approval never \
        --context environment=dev \
        --outputs-file outputs-dev.json
        
    - name: Store deployment outputs
      uses: actions/upload-artifact@v3
      with:
        name: dev-outputs
        path: outputs-dev.json
        
    - name: Run integration tests
      run: |
        echo "Running integration tests against development environment"
        # Add your integration test commands here
        
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    environment: staging
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.STAGING_AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.STAGING_AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
        
    - name: CDK Deploy to Staging
      run: |
        npx cdk deploy --all --require-approval never \
        --context environment=staging \
        --outputs-file outputs-staging.json
        
    - name: Store deployment outputs
      uses: actions/upload-artifact@v3
      with:
        name: staging-outputs
        path: outputs-staging.json

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.PROD_AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.PROD_AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
        
    - name: CDK Diff
      run: npx cdk diff --context environment=prod
      continue-on-error: true
      
    - name: CDK Deploy to Production
      run: |
        npx cdk deploy --all --require-approval never \
        --context environment=prod \
        --outputs-file outputs-prod.json
        
    - name: Store deployment outputs
      uses: actions/upload-artifact@v3
      with:
        name: prod-outputs
        path: outputs-prod.json
        
    - name: Post-deployment health check
      run: |
        echo "Running post-deployment health checks"
        # Add your health check commands here
        
    - name: Notify deployment success
      if: success()
      run: |
        echo "Production deployment successful!"
        # Add notification logic (Slack, email, etc.)

  cleanup-pr:
    name: Cleanup PR Environment
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
        
    - name: Destroy PR environment
      run: |
        PR_NUMBER=${{ github.event.number }}
        npx cdk destroy --force \
        --context environment=pr-${PR_NUMBER}
      continue-on-error: true
```

### 3.2 Pre-commit Hooks

Create `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-json
      - id: check-yaml
      - id: check-merge-conflict
      
  - repo: local
    hooks:
      - id: typescript-check
        name: TypeScript Check
        entry: npx tsc --noEmit
        language: system
        files: \.(ts|tsx)$
        
      - id: eslint
        name: ESLint
        entry: npx eslint --fix
        language: system
        files: \.(ts|tsx)$
        
      - id: jest-tests
        name: Run Jest Tests
        entry: npm test
        language: system
        pass_filenames: false
        
      - id: cdk-synth
        name: CDK Synth Check
        entry: npx cdk synth
        language: system
        pass_filenames: false
```

### 3.3 Test Configuration Files

Create `jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test', '<rootDir>/lib'],
  testMatch: ['**/__tests__/**/*.ts', '**/*.(test|spec).ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  collectCoverageFrom: [
    'lib/**/*.ts',
    '!lib/**/*.d.ts',
    '!lib/**/*.test.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts']
};
```

Create `test/setup.ts`:

```typescript
// Global test setup
import * as aws from 'aws-sdk';

// Mock AWS SDK for tests
jest.mock('aws-sdk', () => ({
  DynamoDB: {
    DocumentClient: jest.fn().mockImplementation(() => ({
      put: jest.fn().mockReturnValue({ promise: jest.fn() }),
      get: jest.fn().mockReturnValue({ promise: jest.fn() }),
      scan: jest.fn().mockReturnValue({ promise: jest.fn() }),
      update: jest.fn().mockReturnValue({ promise: jest.fn() }),
      delete: jest.fn().mockReturnValue({ promise: jest.fn() }),
    })),
  },
  S3: jest.fn().mockImplementation(() => ({
    putObject: jest.fn().mockReturnValue({ promise: jest.fn() }),
    getObject: jest.fn().mockReturnValue({ promise: jest.fn() }),
  })),
}));

// Set test environment variables
process.env.AWS_REGION = 'us-east-1';
process.env.AWS_ACCOUNT_ID = '123456789012';
```

## 4. Running Tests

### 4.1 Test Commands

Run different types of tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- web-api-construct.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="DynamoDB"

# Update snapshots
npm test -- --updateSnapshot
```

### 4.2 Test Organization

Organize your tests in a clear structure:

```
test/
├── unit/
│   ├── constructs/
│   │   ├── web-api-construct.test.ts
│   │   └── todo-api-construct.test.ts
│   └── stacks/
│       ├── my-first-cdk-app-stack.test.ts
│       └── database-stack.test.ts
├── integration/
│   ├── app-integration.test.ts
│   └── cross-stack.test.ts
├── snapshots/
│   ├── stack-snapshot.test.ts
│   └── __snapshots__/
├── property-tests/
│   └── construct-properties.test.ts
└── setup.ts
```

## 5. Exercise: Complete Testing Suite

### 5.1 Add End-to-End Tests

Create `test/e2e/api-endpoints.test.ts`:

```typescript
import axios from 'axios';

describe('API End-to-End Tests', () => {
  const apiUrl = process.env.API_ENDPOINT || 'https://example.com/api';

  test('GET / returns API information', async () => {
    const response = await axios.get(apiUrl);
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('message');
  });

  test('POST /todos creates a new todo', async () => {
    const todoData = {
      text: 'Test todo item',
    };

    const response = await axios.post(`${apiUrl}/todos`, todoData);
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('todo');
    expect(response.data.todo.text).toBe(todoData.text);
  });

  test('GET /todos returns todo list', async () => {
    const response = await axios.get(`${apiUrl}/todos`);
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('todos');
    expect(Array.isArray(response.data.todos)).toBe(true);
  });
});
```

### 5.2 Performance Tests

Create `test/performance/load-test.ts`:

```typescript
import axios from 'axios';

describe('Performance Tests', () => {
  const apiUrl = process.env.API_ENDPOINT || 'https://example.com/api';

  test('API responds within acceptable time limits', async () => {
    const startTime = Date.now();
    const response = await axios.get(apiUrl);
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    
    expect(response.status).toBe(200);
    expect(responseTime).toBeLessThan(2000); // Less than 2 seconds
  });

  test('API handles concurrent requests', async () => {
    const concurrentRequests = 10;
    const promises = Array(concurrentRequests).fill(null).map(() => 
      axios.get(apiUrl)
    );

    const responses = await Promise.all(promises);
    
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });
  });
});
```

## Summary

Today you learned:

1. ✅ Writing comprehensive unit tests for CDK constructs
2. ✅ Implementing integration testing strategies  
3. ✅ Setting up GitHub Actions CI/CD pipeline
4. ✅ Configuring automated deployment workflows
5. ✅ Testing best practices for Infrastructure as Code

### Key Concepts Covered

- **Unit Testing**: Testing individual constructs and stacks
- **Integration Testing**: Testing cross-stack dependencies
- **Snapshot Testing**: Ensuring template consistency
- **CI/CD Pipeline**: Automated testing and deployment
- **Test Organization**: Structuring tests for maintainability

### Testing Pyramid for CDK

```
    E2E Tests (Few)
      ↑
  Integration Tests (Some)  
      ↑
    Unit Tests (Many)
```

### Next Steps

Tomorrow (Day 5), we'll focus on production best practices, security, monitoring, and operational excellence for your CDK applications.

---

**Testing Best Practices:**

1. **Test Structure**: Use AAA pattern (Arrange, Act, Assert)
2. **Test Coverage**: Aim for 80%+ code coverage
3. **Fast Tests**: Keep unit tests fast and deterministic
4. **CI Integration**: Run tests on every commit
5. **Environment Parity**: Test in environments similar to production