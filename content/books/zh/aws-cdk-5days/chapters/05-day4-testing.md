---
title: 第4天 - 测试与CI/CD集成
order: 5
---

# 第4天 - 测试与CI/CD集成

## 今日目标

1. 为CDK构造编写单元测试
2. 实现集成测试策略
3. 设置GitHub Actions CI/CD管道
4. 配置自动化部署工作流
5. 学习基础设施即代码的测试最佳实践

## 1. CDK测试基础

### 1.1 安装测试依赖

首先，安装必要的测试包：

```bash
npm install --save-dev jest @types/jest ts-jest
npm install --save-dev aws-cdk-lib/assertions
```

更新您的`package.json`以包含测试脚本：

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

### 1.2 基本单元测试

创建`test/my-first-cdk-app-stack.test.ts`：

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

  test('使用正确属性创建S3存储桶', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    });
  });

  test('创建CloudFront分发', () => {
    template.hasResource('AWS::CloudFront::Distribution', {
      Properties: Match.objectLike({
        DistributionConfig: Match.objectLike({
          DefaultRootObject: 'index.html',
          Enabled: true,
        }),
      }),
    });
  });

  test('使用正确运行时创建Lambda函数', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Runtime: 'nodejs18.x',
      Timeout: 30,
    });
  });

  test('使用CORS创建API Gateway', () => {
    template.hasResource('AWS::ApiGateway::RestApi', {});
    
    // 检查CORS方法
    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'OPTIONS',
    });
  });

  test('Lambda函数具有DynamoDB权限', () => {
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

  test('堆栈具有必需的输出', () => {
    template.hasOutput('WebsiteURL', {});
    template.hasOutput('ApiEndpoint', {});
  });

  test('生产环境中资源有适当标签', () => {
    const prodApp = new cdk.App({ context: { environment: 'prod' } });
    const prodStack = new MyFirstCdkAppStack(prodApp, 'ProdStack', {
      tags: { Environment: 'prod' }
    });
    const prodTemplate = Template.fromStack(prodStack);

    // 检查资源是否正确标记
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

### 1.3 测试自定义构造

创建`test/web-api-construct.test.ts`：

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

  test('创建所有必需资源', () => {
    new WebApiConstruct(stack, 'TestWebApi');
    template = Template.fromStack(stack);

    // 应该创建DynamoDB表
    template.resourceCountIs('AWS::DynamoDB::Table', 1);
    
    // 应该创建Lambda函数
    template.resourceCountIs('AWS::Lambda::Function', 1);
    
    // 应该创建API Gateway
    template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
  });

  test('DynamoDB表具有正确结构', () => {
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

  test('Lambda函数具有环境变量', () => {
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

  test('API Gateway配置了CORS', () => {
    new WebApiConstruct(stack, 'TestWebApi');
    template = Template.fromStack(stack);

    // 应该有用于CORS的OPTIONS方法
    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'OPTIONS',
      Integration: {
        Type: 'MOCK'
      }
    });
  });

  test('正确应用自定义属性', () => {
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

### 1.4 集成测试

创建`test/integration/app-integration.test.ts`：

```typescript
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { DatabaseStack } from '../../lib/database-stack';
import { ApplicationStack } from '../../lib/application-stack';

describe('多堆栈集成', () => {
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

  test('应用程序堆栈正确引用数据库资源', () => {
    const appTemplate = Template.fromStack(applicationStack);
    const dbTemplate = Template.fromStack(databaseStack);

    // 数据库堆栈应该导出值
    dbTemplate.hasOutput('UserTableName', {});
    dbTemplate.hasOutput('VpcId', {});

    // 应用程序堆栈应该使用正确的表名
    appTemplate.hasResourceProperties('AWS::Lambda::Function', {
      Environment: {
        Variables: {
          USER_TABLE_NAME: databaseStack.userTable.tableName
        }
      }
    });
  });

  test('堆栈具有正确的依赖关系', () => {
    const dependencies = applicationStack.dependencies;
    expect(dependencies).toContain(databaseStack);
  });

  test('VPC配置一致', () => {
    const dbTemplate = Template.fromStack(databaseStack);
    const appTemplate = Template.fromStack(applicationStack);

    // 两个堆栈都应该引用相同的VPC
    dbTemplate.hasResource('AWS::EC2::VPC', {});
    appTemplate.hasResourceProperties('AWS::Lambda::Function', {
      VpcConfig: cdk.Match.anyValue()
    });
  });
});
```

### 1.5 快照测试

创建`test/snapshots/stack-snapshot.test.ts`：

```typescript
import * as cdk from 'aws-cdk-lib';
import { MyFirstCdkAppStack } from '../../lib/my-first-cdk-app-stack';

describe('堆栈快照', () => {
  test('堆栈快照匹配预期模板', () => {
    const app = new cdk.App();
    const stack = new MyFirstCdkAppStack(app, 'TestStack');
    
    expect(app.synth().getStackArtifact(stack.artifactId).template).toMatchSnapshot();
  });

  test('生产堆栈快照', () => {
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

## 2. 高级测试策略

### 2.1 基于属性的测试

创建`test/property-tests/construct-properties.test.ts`：

```typescript
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { WebApiConstruct } from '../../lib/web-api-construct';

describe('WebApiConstruct属性测试', () => {
  test.each([
    [128, 'tiny-table', 'tiny-api'],
    [256, 'medium-table', 'medium-api'],  
    [512, 'large-table', 'large-api'],
  ])('使用内存: %i, 表: %s, API: %s创建构造', (memory, tableName, apiName) => {
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

### 2.2 测试错误条件

创建`test/error-conditions/validation.test.ts`：

```typescript
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { WebApiConstruct } from '../../lib/web-api-construct';

describe('错误条件测试', () => {
  let app: cdk.App;
  let stack: cdk.Stack;

  beforeEach(() => {
    app = new cdk.App();
    stack = new cdk.Stack(app, 'TestStack');
  });

  test('无效内存大小应使用默认值', () => {
    const construct = new WebApiConstruct(stack, 'TestConstruct', {
      lambdaMemorySize: -1 // 无效值
    });

    const template = Template.fromStack(stack);
    
    // 应该使用默认值而不是无效值
    template.hasResourceProperties('AWS::Lambda::Function', {
      MemorySize: 256 // 默认值
    });
  });

  test('空表名应生成默认值', () => {
    new WebApiConstruct(stack, 'TestConstruct', {
      tableName: '' // 空表名
    });

    const template = Template.fromStack(stack);
    
    // 应该创建具有生成名称的表
    template.hasResource('AWS::DynamoDB::Table', {
      Properties: {
        TableName: cdk.Match.stringLikeRegexp('TestConstruct.*')
      }
    });
  });
});
```

## 3. CI/CD管道设置

### 3.1 GitHub Actions工作流

创建`.github/workflows/ci-cd.yml`：

```yaml
name: CDK CI/CD管道

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
    name: 运行测试
    runs-on: ubuntu-latest
    
    steps:
    - name: 检出代码
      uses: actions/checkout@v4
      
    - name: 设置Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: 安装依赖
      run: npm ci
      
    - name: 运行代码检查
      run: npm run lint
      continue-on-error: true
      
    - name: 运行单元测试
      run: npm run test
      
    - name: 运行测试覆盖率
      run: npm run test:coverage
      
    - name: 上传覆盖率到Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: cdk-coverage
      continue-on-error: true
      
    - name: CDK合成
      run: npx cdk synth
      
    - name: CDK安全扫描 (cdk-nag)
      run: |
        npm install -g cdk-nag
        npx cdk synth --app "npx ts-node --prefer-ts-exts bin/my-first-cdk-app.ts" 2>&1 | tee synth-output.txt || true
      continue-on-error: true

  deploy-dev:
    name: 部署到开发环境
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/develop'
    environment: development
    
    steps:
    - name: 检出代码
      uses: actions/checkout@v4
      
    - name: 设置Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: 安装依赖
      run: npm ci
      
    - name: 配置AWS凭据
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
        
    - name: CDK Bootstrap（如果需要）
      run: npx cdk bootstrap --require-approval never
      continue-on-error: true
      
    - name: CDK部署到开发环境
      run: |
        npx cdk deploy --all --require-approval never \
        --context environment=dev \
        --outputs-file outputs-dev.json
        
    - name: 存储部署输出
      uses: actions/upload-artifact@v3
      with:
        name: dev-outputs
        path: outputs-dev.json
        
    - name: 运行集成测试
      run: |
        echo "针对开发环境运行集成测试"
        # 在此处添加您的集成测试命令
        
  deploy-staging:
    name: 部署到预发布环境
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    environment: staging
    
    steps:
    - name: 检出代码
      uses: actions/checkout@v4
      
    - name: 设置Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: 安装依赖
      run: npm ci
      
    - name: 配置AWS凭据
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.STAGING_AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.STAGING_AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
        
    - name: CDK部署到预发布环境
      run: |
        npx cdk deploy --all --require-approval never \
        --context environment=staging \
        --outputs-file outputs-staging.json
        
    - name: 存储部署输出
      uses: actions/upload-artifact@v3
      with:
        name: staging-outputs
        path: outputs-staging.json

  deploy-production:
    name: 部署到生产环境
    runs-on: ubuntu-latest
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - name: 检出代码
      uses: actions/checkout@v4
      
    - name: 设置Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: 安装依赖
      run: npm ci
      
    - name: 配置AWS凭据
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.PROD_AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.PROD_AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
        
    - name: CDK差异比较
      run: npx cdk diff --context environment=prod
      continue-on-error: true
      
    - name: CDK部署到生产环境
      run: |
        npx cdk deploy --all --require-approval never \
        --context environment=prod \
        --outputs-file outputs-prod.json
        
    - name: 存储部署输出
      uses: actions/upload-artifact@v3
      with:
        name: prod-outputs
        path: outputs-prod.json
        
    - name: 部署后健康检查
      run: |
        echo "运行部署后健康检查"
        # 在此处添加您的健康检查命令
        
    - name: 通知部署成功
      if: success()
      run: |
        echo "生产环境部署成功！"
        # 添加通知逻辑（Slack、邮件等）

  cleanup-pr:
    name: 清理PR环境
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    
    steps:
    - name: 检出代码
      uses: actions/checkout@v4
      
    - name: 设置Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: 安装依赖
      run: npm ci
      
    - name: 配置AWS凭据
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
        
    - name: 销毁PR环境
      run: |
        PR_NUMBER=${{ github.event.number }}
        npx cdk destroy --force \
        --context environment=pr-${PR_NUMBER}
      continue-on-error: true
```

### 3.2 预提交钩子

创建`.pre-commit-config.yaml`：

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
        name: TypeScript检查
        entry: npx tsc --noEmit
        language: system
        files: \.(ts|tsx)$
        
      - id: eslint
        name: ESLint
        entry: npx eslint --fix
        language: system
        files: \.(ts|tsx)$
        
      - id: jest-tests
        name: 运行Jest测试
        entry: npm test
        language: system
        pass_filenames: false
        
      - id: cdk-synth
        name: CDK合成检查
        entry: npx cdk synth
        language: system
        pass_filenames: false
```

### 3.3 测试配置文件

创建`jest.config.js`：

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

创建`test/setup.ts`：

```typescript
// 全局测试设置
import * as aws from 'aws-sdk';

// 为测试模拟AWS SDK
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

// 设置测试环境变量
process.env.AWS_REGION = 'us-east-1';
process.env.AWS_ACCOUNT_ID = '123456789012';
```

## 4. 运行测试

### 4.1 测试命令

运行不同类型的测试：

```bash
# 运行所有测试
npm test

# 以观察模式运行测试
npm run test:watch

# 运行带覆盖率的测试
npm run test:coverage

# 运行特定测试文件
npm test -- web-api-construct.test.ts

# 运行匹配模式的测试
npm test -- --testNamePattern="DynamoDB"

# 更新快照
npm test -- --updateSnapshot
```

### 4.2 测试组织

以清晰的结构组织您的测试：

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

## 5. 练习：完整测试套件

### 5.1 添加端到端测试

创建`test/e2e/api-endpoints.test.ts`：

```typescript
import axios from 'axios';

describe('API端到端测试', () => {
  const apiUrl = process.env.API_ENDPOINT || 'https://example.com/api';

  test('GET / 返回API信息', async () => {
    const response = await axios.get(apiUrl);
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('message');
  });

  test('POST /todos 创建新的待办事项', async () => {
    const todoData = {
      text: '测试待办事项',
    };

    const response = await axios.post(`${apiUrl}/todos`, todoData);
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('todo');
    expect(response.data.todo.text).toBe(todoData.text);
  });

  test('GET /todos 返回待办事项列表', async () => {
    const response = await axios.get(`${apiUrl}/todos`);
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('todos');
    expect(Array.isArray(response.data.todos)).toBe(true);
  });
});
```

### 5.2 性能测试

创建`test/performance/load-test.ts`：

```typescript
import axios from 'axios';

describe('性能测试', () => {
  const apiUrl = process.env.API_ENDPOINT || 'https://example.com/api';

  test('API在可接受的时间限制内响应', async () => {
    const startTime = Date.now();
    const response = await axios.get(apiUrl);
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    
    expect(response.status).toBe(200);
    expect(responseTime).toBeLessThan(2000); // 少于2秒
  });

  test('API处理并发请求', async () => {
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

## 总结

今天您学到了：

1. ✅ 为CDK构造编写全面的单元测试
2. ✅ 实现集成测试策略  
3. ✅ 设置GitHub Actions CI/CD管道
4. ✅ 配置自动化部署工作流
5. ✅ 基础设施即代码的测试最佳实践

### 涵盖的关键概念

- **单元测试**: 测试单独的构造和堆栈
- **集成测试**: 测试跨堆栈依赖关系
- **快照测试**: 确保模板一致性
- **CI/CD管道**: 自动化测试和部署
- **测试组织**: 为可维护性构建测试

### CDK测试金字塔

```
    端到端测试（少数）
      ↑
  集成测试（一些）  
      ↑
    单元测试（许多）
```

### 下一步

明天（第5天），我们将专注于生产最佳实践、安全性、监控和CDK应用程序的卓越运营。

---

**测试最佳实践：**

1. **测试结构**: 使用AAA模式（准备、行动、断言）
2. **测试覆盖率**: 目标是80%以上的代码覆盖率
3. **快速测试**: 保持单元测试快速且确定性
4. **CI集成**: 在每次提交时运行测试
5. **环境一致性**: 在类似于生产的环境中测试