---
title: Day 4 - 테스팅과 CI/CD 통합
order: 5
---

# Day 4 - 테스팅과 CI/CD 통합

## 오늘의 목표

1. CDK 컨스트럭트를 위한 단위 테스트 작성
2. 통합 테스트 전략 구현
3. GitHub Actions CI/CD 파이프라인 설정
4. 자동화된 배포 워크플로우 구성
5. Infrastructure as Code 테스팅 모범 사례 학습

## 1. CDK 테스팅 기초

### 1.1 테스팅 종속성 설치

먼저 필요한 테스팅 패키지를 설치합니다:

```bash
npm install --save-dev jest @types/jest ts-jest
npm install --save-dev aws-cdk-lib/assertions
```

테스트 스크립트를 포함하도록 `package.json`을 업데이트합니다:

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

### 1.2 기본 단위 테스트

`test/my-first-cdk-app-stack.test.ts`를 생성합니다:

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

  test('올바른 속성으로 S3 버킷 생성', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    });
  });

  test('CloudFront 배포 생성', () => {
    template.hasResource('AWS::CloudFront::Distribution', {
      Properties: Match.objectLike({
        DistributionConfig: Match.objectLike({
          DefaultRootObject: 'index.html',
          Enabled: true,
        }),
      }),
    });
  });

  test('올바른 런타임으로 Lambda 함수 생성', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Runtime: 'nodejs18.x',
      Timeout: 30,
    });
  });

  test('CORS와 함께 API Gateway 생성', () => {
    template.hasResource('AWS::ApiGateway::RestApi', {});
    
    // CORS 메서드 확인
    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'OPTIONS',
    });
  });

  test('Lambda 함수가 DynamoDB 권한을 가짐', () => {
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

  test('스택에 필요한 출력값 있음', () => {
    template.hasOutput('WebsiteURL', {});
    template.hasOutput('ApiEndpoint', {});
  });

  test('운영 환경에서 리소스에 적절한 태그 있음', () => {
    const prodApp = new cdk.App({ context: { environment: 'prod' } });
    const prodStack = new MyFirstCdkAppStack(prodApp, 'ProdStack', {
      tags: { Environment: 'prod' }
    });
    const prodTemplate = Template.fromStack(prodStack);

    // 리소스에 적절한 태그가 있는지 확인
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

### 1.3 사용자 정의 컨스트럭트 테스팅

`test/web-api-construct.test.ts`를 생성합니다:

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

  test('모든 필요한 리소스 생성', () => {
    new WebApiConstruct(stack, 'TestWebApi');
    template = Template.fromStack(stack);

    // DynamoDB 테이블 생성해야 함
    template.resourceCountIs('AWS::DynamoDB::Table', 1);
    
    // Lambda 함수 생성해야 함
    template.resourceCountIs('AWS::Lambda::Function', 1);
    
    // API Gateway 생성해야 함
    template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
  });

  test('DynamoDB 테이블의 올바른 구조', () => {
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

  test('Lambda 함수에 환경 변수 있음', () => {
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

  test('API Gateway에 CORS 구성됨', () => {
    new WebApiConstruct(stack, 'TestWebApi');
    template = Template.fromStack(stack);

    // CORS를 위한 OPTIONS 메서드가 있어야 함
    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'OPTIONS',
      Integration: {
        Type: 'MOCK'
      }
    });
  });

  test('사용자 정의 속성이 올바르게 적용됨', () => {
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

### 1.4 통합 테스트

`test/integration/app-integration.test.ts`를 생성합니다:

```typescript
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { DatabaseStack } from '../../lib/database-stack';
import { ApplicationStack } from '../../lib/application-stack';

describe('다중 스택 통합', () => {
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

  test('애플리케이션 스택이 데이터베이스 리소스를 올바르게 참조', () => {
    const appTemplate = Template.fromStack(applicationStack);
    const dbTemplate = Template.fromStack(databaseStack);

    // 데이터베이스 스택이 값을 내보내야 함
    dbTemplate.hasOutput('UserTableName', {});
    dbTemplate.hasOutput('VpcId', {});

    // 애플리케이션 스택이 올바른 테이블 이름을 사용해야 함
    appTemplate.hasResourceProperties('AWS::Lambda::Function', {
      Environment: {
        Variables: {
          USER_TABLE_NAME: databaseStack.userTable.tableName
        }
      }
    });
  });

  test('스택에 올바른 종속성 있음', () => {
    const dependencies = applicationStack.dependencies;
    expect(dependencies).toContain(databaseStack);
  });

  test('VPC 구성이 일관됨', () => {
    const dbTemplate = Template.fromStack(databaseStack);
    const appTemplate = Template.fromStack(applicationStack);

    // 두 스택 모두 동일한 VPC를 참조해야 함
    dbTemplate.hasResource('AWS::EC2::VPC', {});
    appTemplate.hasResourceProperties('AWS::Lambda::Function', {
      VpcConfig: cdk.Match.anyValue()
    });
  });
});
```

### 1.5 스냅샷 테스팅

`test/snapshots/stack-snapshot.test.ts`를 생성합니다:

```typescript
import * as cdk from 'aws-cdk-lib';
import { MyFirstCdkAppStack } from '../../lib/my-first-cdk-app-stack';

describe('스택 스냅샷', () => {
  test('스택 스냅샷이 예상 템플릿과 일치', () => {
    const app = new cdk.App();
    const stack = new MyFirstCdkAppStack(app, 'TestStack');
    
    expect(app.synth().getStackArtifact(stack.artifactId).template).toMatchSnapshot();
  });

  test('운영 스택 스냅샷', () => {
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

## 2. 고급 테스팅 전략

### 2.1 속성 기반 테스팅

`test/property-tests/construct-properties.test.ts`를 생성합니다:

```typescript
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { WebApiConstruct } from '../../lib/web-api-construct';

describe('WebApiConstruct 속성 테스트', () => {
  test.each([
    [128, 'tiny-table', 'tiny-api'],
    [256, 'medium-table', 'medium-api'],  
    [512, 'large-table', 'large-api'],
  ])('메모리: %i, 테이블: %s, API: %s로 컨스트럭트 생성', (memory, tableName, apiName) => {
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

### 2.2 오류 조건 테스팅

`test/error-conditions/validation.test.ts`를 생성합니다:

```typescript
import * as cdk from 'aws-cdk-lib';
import { WebApiConstruct } from '../../lib/web-api-construct';

describe('오류 조건 테스트', () => {
  let app: cdk.App;
  let stack: cdk.Stack;

  beforeEach(() => {
    app = new cdk.App();
    stack = new cdk.Stack(app, 'TestStack');
  });

  test('잘못된 메모리 크기는 기본값을 사용해야 함', () => {
    const construct = new WebApiConstruct(stack, 'TestConstruct', {
      lambdaMemorySize: -1 // 잘못된 값
    });

    const template = Template.fromStack(stack);
    
    // 잘못된 값 대신 기본값을 사용해야 함
    template.hasResourceProperties('AWS::Lambda::Function', {
      MemorySize: 256 // 기본값
    });
  });

  test('빈 테이블 이름은 기본값을 생성해야 함', () => {
    new WebApiConstruct(stack, 'TestConstruct', {
      tableName: '' // 빈 테이블 이름
    });

    const template = Template.fromStack(stack);
    
    // 생성된 이름으로 테이블을 생성해야 함
    template.hasResource('AWS::DynamoDB::Table', {
      Properties: {
        TableName: cdk.Match.stringLikeRegexp('TestConstruct.*')
      }
    });
  });
});
```

## 3. CI/CD 파이프라인 설정

### 3.1 GitHub Actions 워크플로우

`.github/workflows/ci-cd.yml`을 생성합니다:

```yaml
name: CDK CI/CD 파이프라인

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
    name: 테스트 실행
    runs-on: ubuntu-latest
    
    steps:
    - name: 코드 체크아웃
      uses: actions/checkout@v4
      
    - name: Node.js 설정
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: 종속성 설치
      run: npm ci
      
    - name: 린팅 실행
      run: npm run lint
      continue-on-error: true
      
    - name: 단위 테스트 실행
      run: npm run test
      
    - name: 테스트 커버리지 실행
      run: npm run test:coverage
      
    - name: Codecov에 커버리지 업로드
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: cdk-coverage
      continue-on-error: true
      
    - name: CDK 합성
      run: npx cdk synth
      
    - name: CDK 보안 스캔 (cdk-nag)
      run: |
        npm install -g cdk-nag
        npx cdk synth --app "npx ts-node --prefer-ts-exts bin/my-first-cdk-app.ts" 2>&1 | tee synth-output.txt || true
      continue-on-error: true

  deploy-dev:
    name: 개발 환경 배포
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/develop'
    environment: development
    
    steps:
    - name: 코드 체크아웃
      uses: actions/checkout@v4
      
    - name: Node.js 설정
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: 종속성 설치
      run: npm ci
      
    - name: AWS 자격 증명 구성
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
        
    - name: CDK 부트스트랩 (필요시)
      run: npx cdk bootstrap --require-approval never
      continue-on-error: true
      
    - name: 개발 환경에 CDK 배포
      run: |
        npx cdk deploy --all --require-approval never \
        --context environment=dev \
        --outputs-file outputs-dev.json
        
    - name: 배포 출력값 저장
      uses: actions/upload-artifact@v3
      with:
        name: dev-outputs
        path: outputs-dev.json
        
    - name: 통합 테스트 실행
      run: |
        echo "개발 환경에 대한 통합 테스트 실행"
        # 여기에 통합 테스트 명령을 추가하세요
        
  deploy-staging:
    name: 스테이징 환경 배포
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    environment: staging
    
    steps:
    - name: 코드 체크아웃
      uses: actions/checkout@v4
      
    - name: Node.js 설정
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: 종속성 설치
      run: npm ci
      
    - name: AWS 자격 증명 구성
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.STAGING_AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.STAGING_AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
        
    - name: 스테이징에 CDK 배포
      run: |
        npx cdk deploy --all --require-approval never \
        --context environment=staging \
        --outputs-file outputs-staging.json
        
    - name: 배포 출력값 저장
      uses: actions/upload-artifact@v3
      with:
        name: staging-outputs
        path: outputs-staging.json

  deploy-production:
    name: 운영 환경 배포
    runs-on: ubuntu-latest
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - name: 코드 체크아웃
      uses: actions/checkout@v4
      
    - name: Node.js 설정
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: 종속성 설치
      run: npm ci
      
    - name: AWS 자격 증명 구성
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.PROD_AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.PROD_AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
        
    - name: CDK 차이점 확인
      run: npx cdk diff --context environment=prod
      continue-on-error: true
      
    - name: 운영 환경에 CDK 배포
      run: |
        npx cdk deploy --all --require-approval never \
        --context environment=prod \
        --outputs-file outputs-prod.json
        
    - name: 배포 출력값 저장
      uses: actions/upload-artifact@v3
      with:
        name: prod-outputs
        path: outputs-prod.json
        
    - name: 배포 후 상태 검사
      run: |
        echo "배포 후 상태 검사 실행"
        # 여기에 상태 검사 명령을 추가하세요
        
    - name: 배포 성공 알림
      if: success()
      run: |
        echo "운영 배포 성공!"
        # 알림 로직 추가 (Slack, 이메일 등)

  cleanup-pr:
    name: PR 환경 정리
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    
    steps:
    - name: 코드 체크아웃
      uses: actions/checkout@v4
      
    - name: Node.js 설정
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: 종속성 설치
      run: npm ci
      
    - name: AWS 자격 증명 구성
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
        
    - name: PR 환경 제거
      run: |
        PR_NUMBER=${{ github.event.number }}
        npx cdk destroy --force \
        --context environment=pr-${PR_NUMBER}
      continue-on-error: true
```

### 3.2 Pre-commit 훅

`.pre-commit-config.yaml`을 생성합니다:

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
        name: TypeScript 검사
        entry: npx tsc --noEmit
        language: system
        files: \.(ts|tsx)$
        
      - id: eslint
        name: ESLint
        entry: npx eslint --fix
        language: system
        files: \.(ts|tsx)$
        
      - id: jest-tests
        name: Jest 테스트 실행
        entry: npm test
        language: system
        pass_filenames: false
        
      - id: cdk-synth
        name: CDK 합성 검사
        entry: npx cdk synth
        language: system
        pass_filenames: false
```

### 3.3 테스트 구성 파일

`jest.config.js`를 생성합니다:

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

`test/setup.ts`를 생성합니다:

```typescript
// 전역 테스트 설정
import * as aws from 'aws-sdk';

// 테스트용 AWS SDK 모킹
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

// 테스트 환경 변수 설정
process.env.AWS_REGION = 'us-east-1';
process.env.AWS_ACCOUNT_ID = '123456789012';
```

## 4. 테스트 실행

### 4.1 테스트 명령어

다양한 유형의 테스트 실행:

```bash
# 모든 테스트 실행
npm test

# 감시 모드로 테스트 실행
npm run test:watch

# 커버리지와 함께 테스트 실행
npm run test:coverage

# 특정 테스트 파일 실행
npm test -- web-api-construct.test.ts

# 패턴과 일치하는 테스트 실행
npm test -- --testNamePattern="DynamoDB"

# 스냅샷 업데이트
npm test -- --updateSnapshot
```

### 4.2 테스트 구성

명확한 구조로 테스트를 구성합니다:

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

## 5. 실습: 완전한 테스팅 스위트

### 5.1 종단간 테스트 추가

`test/e2e/api-endpoints.test.ts`를 생성합니다:

```typescript
import axios from 'axios';

describe('API 종단간 테스트', () => {
  const apiUrl = process.env.API_ENDPOINT || 'https://example.com/api';

  test('GET /이 API 정보 반환', async () => {
    const response = await axios.get(apiUrl);
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('message');
  });

  test('POST /todos가 새 할 일 생성', async () => {
    const todoData = {
      text: '테스트 할 일 항목',
    };

    const response = await axios.post(`${apiUrl}/todos`, todoData);
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('todo');
    expect(response.data.todo.text).toBe(todoData.text);
  });

  test('GET /todos가 할 일 목록 반환', async () => {
    const response = await axios.get(`${apiUrl}/todos`);
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('todos');
    expect(Array.isArray(response.data.todos)).toBe(true);
  });
});
```

### 5.2 성능 테스트

`test/performance/load-test.ts`를 생성합니다:

```typescript
import axios from 'axios';

describe('성능 테스트', () => {
  const apiUrl = process.env.API_ENDPOINT || 'https://example.com/api';

  test('API가 허용 가능한 시간 제한 내에 응답', async () => {
    const startTime = Date.now();
    const response = await axios.get(apiUrl);
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    
    expect(response.status).toBe(200);
    expect(responseTime).toBeLessThan(2000); // 2초 미만
  });

  test('API가 동시 요청 처리', async () => {
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

## 정리

오늘 배운 내용:

1. ✅ CDK 컨스트럭트를 위한 포괄적인 단위 테스트 작성
2. ✅ 통합 테스트 전략 구현
3. ✅ GitHub Actions CI/CD 파이프라인 설정
4. ✅ 자동화된 배포 워크플로우 구성
5. ✅ Infrastructure as Code 테스팅 모범 사례

### 핵심 개념 정리

- **단위 테스팅**: 개별 컨스트럭트와 스택 테스팅
- **통합 테스팅**: 스택 간 종속성 테스팅
- **스냅샷 테스팅**: 템플릿 일관성 보장
- **CI/CD 파이프라인**: 자동화된 테스팅과 배포
- **테스트 구성**: 유지보수성을 위한 테스트 구조화

### CDK를 위한 테스팅 피라미드

```
    종단간 테스트 (적음)
      ↑
  통합 테스트 (일부)  
      ↑
    단위 테스트 (많음)
```

### 다음 단계

내일 (Day 5)에는 프로덕션 모범 사례, 보안, 모니터링 및 CDK 애플리케이션의 운영 우수성에 중점을 둘 것입니다.

---

**테스팅 모범 사례:**

1. **테스트 구조**: AAA 패턴 사용 (Arrange, Act, Assert)
2. **테스트 커버리지**: 80% 이상의 코드 커버리지 목표
3. **빠른 테스트**: 단위 테스트를 빠르고 결정론적으로 유지
4. **CI 통합**: 모든 커밋에 테스트 실행
5. **환경 동등성**: 프로덕션과 유사한 환경에서 테스트