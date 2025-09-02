---
title: 시작하기 - AWS CDK의 세계에 오신 것을 환영합니다
order: 1
---

# 시작하기 - AWS CDK의 세계에 오신 것을 환영합니다

## 이 책에 대하여

이 책은 5일 동안 AWS Cloud Development Kit(AWS CDK)를 배우고 실용적인 인프라 관리 기술을 습득하는 것을 목표로 합니다.

### 대상 독자

- AWS 기본 지식이 있는 분
- 프로그래밍 경험(특히 TypeScript/JavaScript)이 있는 분
- Infrastructure as Code(IaC)에 관심이 있는 분
- 수동 인프라 관리에서 벗어나고 싶은 분

### 학습 목표

이 책을 마치면 다음과 같은 것들을 할 수 있게 됩니다:

1. AWS CDK의 기본 개념을 이해하고 환경을 설정할 수 있습니다
2. CDK를 사용하여 기본적인 AWS 리소스를 생성하고 관리할 수 있습니다
3. 재사용 가능한 컴포넌트(Construct)를 만들 수 있습니다
4. 테스트 및 CI/CD 파이프라인과 통합할 수 있습니다
5. 프로덕션 환경에 안전하게 배포할 수 있습니다

## AWS CDK란?

AWS Cloud Development Kit(AWS CDK)는 프로그래밍 언어를 사용하여 클라우드 애플리케이션 리소스를 정의하기 위한 오픈 소스 프레임워크입니다.

### 기존 방법과의 차이점

#### 기존 CloudFormation
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

### AWS CDK의 특징

1. **프로그래밍 언어의 강력함 활용**
   - 조건문, 반복문, 함수 등 사용 가능
   - IDE 자동 완성 및 리팩토링 기능 활용
   - 기존 프로그래밍 스킬 활용

2. **재사용성과 모듈화**
   - 커스텀 Construct 생성 및 재사용
   - npm 패키지로 공유 가능
   - 조직 내 베스트 프랙티스 표준화

3. **타입 안정성**
   - 컴파일 시점에 오류 감지
   - 속성 자동 완성 및 검증
   - 문서화된 API

4. **CloudFormation과의 호환성**
   - 최종적으로 CloudFormation 템플릿 생성
   - 기존 CloudFormation 리소스와 통합 가능
   - CloudFormation의 모든 기능 사용 가능

## 학습 진행 방법

### 5일간의 학습 일정

| 일차 | 주제 | 내용 |
|-----|------|------|
| 1일차 | 기초 및 설정 | CDK 기본 개념, 환경 구축, 첫 배포 |
| 2일차 | 코어 Construct와 Stack | 기본 AWS 리소스 생성, Stack 관리 |
| 3일차 | 고급 Construct와 패턴 | 커스텀 Construct, 디자인 패턴 |
| 4일차 | 테스트와 CI/CD | 유닛 테스트, 통합 테스트, CI/CD 파이프라인 |
| 5일차 | 베스트 프랙티스와 프로덕션 배포 | 보안, 모니터링, 프로덕션 운영 |

### 사전 지식 확인

시작하기 전에 다음 지식이 있는지 확인하세요:

#### AWS 기초 지식
- EC2, S3, Lambda, RDS 등 기본 서비스
- IAM 기본 개념(역할, 정책)
- VPC와 네트워킹 기초

#### 프로그래밍 지식
- TypeScript/JavaScript 기본 문법
- npm/yarn 사용 경험
- 기본적인 Git 작업

#### 개발 환경
- Node.js 18.x 이상
- IDE 또는 에디터 (VS Code 권장)
- AWS CLI
- Git

## 책의 구성

각 장은 다음과 같이 구성되어 있습니다:

1. **개요** - 그날 배울 내용의 개요
2. **이론** - 기본 개념과 이론적 배경
3. **실습** - 실제 코드를 작성하며 학습
4. **연습** - 이해를 깊게 하기 위한 과제
5. **요약** - 그날 학습 내용 정리

## 샘플 프로젝트에 대하여

이 책에서는 다음과 같이 단계적으로 웹 애플리케이션을 구축합니다:

1. **Day 1**: 정적 웹사이트 (S3 + CloudFront)
2. **Day 2**: 서버리스 API (Lambda + API Gateway)
3. **Day 3**: 데이터베이스 통합 (DynamoDB)
4. **Day 4**: CI/CD 파이프라인
5. **Day 5**: 모니터링 및 알림

### 아키텍처 개요

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

## 다음 단계

준비가 되면 1일차 "AWS CDK 환경 설정과 첫 걸음"으로 진행하세요.

실제 코드를 작성하며 학습함으로써 AWS CDK의 강력함과 편리함을 경험할 수 있을 것입니다.

---

**참고**: 이 책의 샘플 코드를 실행할 때 AWS 사용 요금이 발생할 수 있습니다. AWS 무료 사용 한도 내에서 실습하는 것을 권장합니다. 또한 불필요해진 리소스는 반드시 삭제하세요.