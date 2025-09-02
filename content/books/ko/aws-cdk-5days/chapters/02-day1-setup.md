---
title: 1일차 - AWS CDK 환경 설정과 첫 걸음
order: 2
---

# 1일차 - AWS CDK 환경 설정과 첫 걸음

## 오늘의 목표

1. AWS CDK 개발 환경 설정하기
2. 첫 CDK 프로젝트 생성하기
3. 간단한 S3 버킷 배포하기
4. CDK 기본 명령어 이해하기

## 1. 환경 설정

### 1.1 Node.js 설치 확인

AWS CDK는 Node.js에서 실행됩니다. 먼저 현재 버전을 확인해 봅시다.

```bash
node --version
npm --version
```

Node.js 18.x 이상이 필요합니다. 설치되어 있지 않다면 [Node.js 공식 사이트](https://nodejs.org/)에서 다운로드하세요.

### 1.2 AWS CLI 설정

AWS CDK는 AWS CLI를 사용하여 AWS 계정과 통신합니다.

```bash
# AWS CLI 버전 확인
aws --version

# AWS 인증 정보 설정
aws configure
```

다음 정보를 입력하세요:
- AWS Access Key ID
- AWS Secret Access Key  
- Default region name (예: ap-northeast-2)
- Default output format (json 권장)

### 1.3 AWS CDK 설치

AWS CDK를 전역으로 설치합니다.

```bash
npm install -g aws-cdk
```

설치가 완료되면 버전을 확인합니다.

```bash
cdk --version
```

### 1.4 CDK Bootstrap

CDK를 사용하기 전에 AWS 계정과 리전에서 부트스트랩을 실행해야 합니다.

```bash
cdk bootstrap
```

이렇게 하면 CDK가 사용하는 S3 버킷과 IAM 역할 등의 리소스가 생성됩니다.

## 2. 첫 프로젝트 생성

### 2.1 프로젝트 디렉토리 생성

```bash
mkdir my-first-cdk-app
cd my-first-cdk-app
```

### 2.2 CDK 애플리케이션 초기화

TypeScript 템플릿을 사용하여 새 CDK 앱을 초기화합니다:

```bash
cdk init app --language typescript
```

다음과 같은 프로젝트 구조가 생성됩니다:

```
my-first-cdk-app/
├── bin/
│   └── my-first-cdk-app.ts     # 앱 진입점
├── lib/
│   └── my-first-cdk-app-stack.ts # Stack 정의
├── test/
│   └── my-first-cdk-app.test.ts  # 유닛 테스트
├── cdk.json                     # CDK 설정
├── package.json                 # npm 의존성
└── tsconfig.json               # TypeScript 설정
```

### 2.3 의존성 설치

```bash
npm install
```

## 3. 기본 구조 이해하기

### 3.1 앱 진입점 (bin/my-first-cdk-app.ts)

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

### 3.2 Stack 정의 (lib/my-first-cdk-app-stack.ts)

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class MyFirstCdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 리소스는 여기에 정의됩니다
  }
}
```

## 4. 첫 S3 버킷 생성하기

### 4.1 S3 버킷 추가를 위해 Stack 수정

`lib/my-first-cdk-app-stack.ts`를 수정합니다:

```typescript
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class MyFirstCdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 버킷 생성
    const bucket = new s3.Bucket(this, 'MyFirstBucket', {
      bucketName: 'my-first-cdk-bucket-' + Math.random().toString(36).substring(7),
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // 버킷 이름 출력
    new cdk.CfnOutput(this, 'BucketName', {
      value: bucket.bucketName,
      description: 'S3 버킷 이름',
    });
  }
}
```

### 4.2 주요 속성 설명

- **bucketName**: 고유한 버킷 이름 (랜덤 접미사 포함)
- **versioned**: 객체 버저닝 활성화
- **removalPolicy**: Stack 삭제 시 처리 방법 (DESTROY는 삭제 허용)
- **blockPublicAccess**: 모든 퍼블릭 액세스 차단 보안 설정

## 5. CDK 명령어

### 5.1 CloudFormation 템플릿 합성

```bash
cdk synth
```

CloudFormation 템플릿을 생성하고 표시합니다. CDK 코드가 CloudFormation으로 어떻게 변환되는지 확인할 수 있습니다.

### 5.2 변경 사항 비교

```bash
cdk diff
```

현재 Stack과 배포된 Stack 간의 차이점을 보여줍니다.

### 5.3 Stack 배포

```bash
cdk deploy
```

Stack을 AWS에 배포합니다. 배포 전에 변경 사항을 확인하라는 메시지가 표시됩니다.

### 5.4 모든 Stack 나열

```bash
cdk list
```

CDK 앱의 모든 Stack을 표시합니다.

### 5.5 Stack 삭제

```bash
cdk destroy
```

AWS에서 Stack과 모든 리소스를 삭제합니다.

## 6. 연습: 여러 리소스 생성하기

Stack에 더 많은 리소스를 추가해 보세요:

### 6.1 웹사이트 호스팅이 가능한 S3 버킷 추가

```typescript
// Stack에 추가
const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
  bucketName: 'my-website-bucket-' + Math.random().toString(36).substring(7),
  websiteIndexDocument: 'index.html',
  websiteErrorDocument: 'error.html',
  publicReadAccess: true,
  removalPolicy: cdk.RemovalPolicy.DESTROY,
});

new cdk.CfnOutput(this, 'WebsiteURL', {
  value: websiteBucket.bucketWebsiteUrl,
  description: '웹사이트 URL',
});
```

### 6.2 배포 및 테스트

```bash
# 생성될 내용 확인
cdk diff

# 변경 사항 배포
cdk deploy
```

AWS 콘솔에서 생성된 리소스를 확인하세요.

## 7. 1일차 베스트 프랙티스

### 7.1 명명 규칙

- Construct에 설명적인 이름 사용
- 리소스 이름에 환경이나 용도 포함
- 일관된 명명 패턴 사용

### 7.2 리소스 관리

- 개발 리소스에는 항상 `removalPolicy` 설정
- 퍼블릭 액세스가 필요하지 않으면 S3 버킷에 `blockPublicAccess` 사용
- 중요한 리소스 속성에 대한 의미 있는 출력 추가

### 7.3 코드 구성

- Stack 파일을 집중적이고 너무 크지 않게 유지
- 복잡한 구성을 설명하기 위해 주석 사용
- TypeScript 베스트 프랙티스 따르기

## 8. 일반적인 문제 해결

### 8.1 Bootstrap 문제

Bootstrap이 실패하는 경우:
```bash
# AWS 자격 증명 확인
aws sts get-caller-identity

# 명시적인 리전으로 부트스트랩 시도
cdk bootstrap aws://ACCOUNT-NUMBER/REGION
```

### 8.2 버킷 이름 충돌

S3 버킷 이름은 전역적으로 고유해야 합니다. 배포가 실패하면:
- 예제에서 보여준 것처럼 랜덤 접미사 사용
- 버킷 이름에 타임스탬프나 계정 ID 포함

### 8.3 권한 문제

AWS 사용자에게 충분한 권한이 있는지 확인:
- CloudFormation 전체 액세스
- 역할 생성을 위한 IAM 권한
- 사용하는 서비스(S3, Lambda 등)에 대한 권한

## 요약

오늘 배운 내용:

1. ✅ AWS CDK 개발 환경 설정
2. ✅ 첫 CDK 프로젝트 생성
3. ✅ CDK를 사용하여 S3 버킷 배포
4. ✅ 기본 CDK 명령어와 워크플로우 이해

### 다룬 핵심 개념

- **CDK Bootstrap**: AWS 계정에서 CDK를 위한 일회성 설정
- **Constructs**: CDK 애플리케이션의 빌딩 블록
- **Stacks**: CDK의 배포 단위
- **Synthesis**: CDK 코드를 CloudFormation 템플릿으로 변환

### 다음 단계

내일(2일차)에는 CDK Construct에 대해 더 깊이 알아보고 Lambda와 API Gateway 같은 더 많은 AWS 서비스를 탐색할 예정입니다.

---

**연습 문제 해답:**

여러 리소스가 포함된 완전한 Stack:

```typescript
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class MyFirstCdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 데이터 저장용 프라이빗 버킷
    const dataBucket = new s3.Bucket(this, 'DataBucket', {
      bucketName: 'my-data-bucket-' + Math.random().toString(36).substring(7),
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // 웹사이트 호스팅용 퍼블릭 버킷
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: 'my-website-bucket-' + Math.random().toString(36).substring(7),
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'error.html',
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // 출력
    new cdk.CfnOutput(this, 'DataBucketName', {
      value: dataBucket.bucketName,
      description: '프라이빗 데이터 버킷 이름',
    });

    new cdk.CfnOutput(this, 'WebsiteURL', {
      value: websiteBucket.bucketWebsiteUrl,
      description: '웹사이트 URL',
    });
  }
}
```