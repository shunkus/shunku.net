---
title: "AWSクロスアカウントアクセス：IAMロール、RAM、Organizations連携"
date: "2025-12-08"
excerpt: "AWSアカウント間のリソース共有とアクセス制御を徹底解説 - IAMロールのAssumeRole、Resource Access Manager（RAM）、Organizations連携のベストプラクティスを紹介します。"
tags: ["AWS", "IAM", "クロスアカウント", "RAM", "セキュリティ"]
author: "Shunku"
---

マルチアカウント環境では、アカウント間でリソースを共有したり、他のアカウントにアクセスしたりする必要があります。AWSは複数のクロスアカウントアクセス方法を提供しており、ユースケースに応じて適切な方法を選択することが重要です。

## クロスアカウントアクセスの概要

### なぜクロスアカウントアクセスが必要か

```mermaid
flowchart TB
    subgraph UseCases["ユースケース"]
        UC1["中央集権的なログ管理"]
        UC2["共有サービスの利用"]
        UC3["CI/CDパイプライン"]
        UC4["監査・セキュリティ"]
        UC5["ネットワークリソース共有"]
    end

    style UseCases fill:#3b82f6,color:#fff
```

### アクセス方法の分類

| 方法 | 用途 | アクセス対象 |
|------|------|-------------|
| **IAMロール（AssumeRole）** | 一時的なアクセス | 任意のリソース |
| **リソースベースポリシー** | 特定リソースへのアクセス | S3、SNS、SQS等 |
| **RAM** | リソースの共有 | VPC、Route 53等 |
| **IAM Identity Center** | SSOアクセス | コンソール・CLI |

## IAMロールによるクロスアカウントアクセス

### AssumeRoleの仕組み

```mermaid
sequenceDiagram
    participant User as アカウントAのユーザー
    participant STS as AWS STS
    participant Role as アカウントBのロール
    participant Resource as アカウントBのリソース

    User->>STS: 1. AssumeRole要求
    STS->>Role: 2. 信頼ポリシー確認
    Role-->>STS: 3. 許可
    STS-->>User: 4. 一時認証情報
    User->>Resource: 5. 一時認証情報でアクセス
```

### 信頼ポリシー（Trust Policy）

アカウントBのロールに設定する信頼ポリシー：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::111111111111:root"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "unique-external-id"
        }
      }
    }
  ]
}
```

### 権限ポリシー（Permission Policy）

ロールに付与する権限：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::shared-bucket",
        "arn:aws:s3:::shared-bucket/*"
      ]
    }
  ]
}
```

### アカウントAからのAssumeRole

アカウントAのユーザー/ロールに必要な権限：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "sts:AssumeRole",
      "Resource": "arn:aws:iam::222222222222:role/CrossAccountRole"
    }
  ]
}
```

### CLIでのAssumeRole

```bash
# 一時認証情報を取得
aws sts assume-role \
    --role-arn arn:aws:iam::222222222222:role/CrossAccountRole \
    --role-session-name my-session \
    --external-id unique-external-id

# プロファイルを設定（~/.aws/config）
[profile cross-account]
role_arn = arn:aws:iam::222222222222:role/CrossAccountRole
source_profile = default
external_id = unique-external-id
```

## External IDの重要性

### 混乱した代理問題（Confused Deputy）

```mermaid
flowchart TB
    subgraph Problem["混乱した代理問題"]
        Attacker["攻撃者"]
        Service["サードパーティサービス"]
        Victim["被害者アカウント"]

        Attacker -->|"1. サービスに<br/>被害者のARNを設定"| Service
        Service -->|"2. 被害者の<br/>ロールをAssume"| Victim
    end

    subgraph Solution["External IDによる対策"]
        SafeService["サービス"]
        Customer["正規の顧客"]
        Role["ロール"]

        SafeService -->|"External ID必須"| Role
        Customer -.->|"External IDを共有"| SafeService
    end

    style Problem fill:#ef4444,color:#fff
    style Solution fill:#22c55e,color:#fff
```

### External IDの使い方

| シナリオ | External ID |
|---------|-------------|
| 自社アカウント間 | 省略可能 |
| サードパーティ連携 | 必須 |
| Organizationsメンバー間 | 省略可能（org-idで制御） |

## リソースベースポリシー

### 対応サービス

```mermaid
flowchart TB
    subgraph Services["リソースベースポリシー対応サービス"]
        S3["S3バケット"]
        SNS["SNSトピック"]
        SQS["SQSキュー"]
        Lambda["Lambda関数"]
        KMS["KMSキー"]
        SecretsManager["Secrets Manager"]
        ECR["ECRリポジトリ"]
    end

    style Services fill:#3b82f6,color:#fff
```

### S3バケットポリシー例

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CrossAccountAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::111111111111:role/DataPipelineRole"
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::shared-data-bucket/*"
    }
  ]
}
```

### IAMロール vs リソースベースポリシー

| 特徴 | IAMロール | リソースベースポリシー |
|------|----------|---------------------|
| アイデンティティ切り替え | あり | なし |
| 元のアクセス権 | 失われる | 保持される |
| 設定場所 | 両方のアカウント | リソース側のみ |
| 対応リソース | すべて | 一部のサービスのみ |

**重要な違い**: リソースベースポリシーでは、元のアイデンティティの権限を保持したままアクセスできます。

## AWS Resource Access Manager（RAM）

### RAMとは

RAMは、AWSリソースを他のアカウントと共有するためのサービスです。

```mermaid
flowchart LR
    subgraph OwnerAccount["オーナーアカウント"]
        Resource["共有リソース<br/>（VPCサブネット等）"]
    end

    subgraph RAM["RAM"]
        Share["リソース共有"]
    end

    subgraph Consumer1["コンシューマー1"]
        Use1["リソース利用"]
    end

    subgraph Consumer2["コンシューマー2"]
        Use2["リソース利用"]
    end

    Resource --> Share
    Share --> Use1
    Share --> Use2

    style OwnerAccount fill:#3b82f6,color:#fff
    style RAM fill:#f59e0b,color:#000
    style Consumer1 fill:#22c55e,color:#fff
    style Consumer2 fill:#22c55e,color:#fff
```

### 共有可能なリソース

| サービス | 共有可能なリソース |
|---------|------------------|
| **VPC** | サブネット、Transit Gateway |
| **Route 53** | ルールグループ、Resolver |
| **EC2** | 専有ホスト、容量予約 |
| **License Manager** | ライセンス設定 |
| **AWS Outposts** | ローカルゲートウェイ |
| **Systems Manager** | インシデントマネージャー |

### VPCサブネットの共有

```mermaid
flowchart TB
    subgraph NetworkAccount["ネットワークアカウント"]
        VPC["共有VPC"]
        Subnet1["サブネットA"]
        Subnet2["サブネットB"]
    end

    subgraph AppAccount1["アプリアカウント1"]
        EC2_1["EC2インスタンス"]
    end

    subgraph AppAccount2["アプリアカウント2"]
        EC2_2["EC2インスタンス"]
    end

    Subnet1 --> |"RAM共有"| EC2_1
    Subnet2 --> |"RAM共有"| EC2_2

    style NetworkAccount fill:#3b82f6,color:#fff
    style AppAccount1 fill:#22c55e,color:#fff
    style AppAccount2 fill:#22c55e,color:#fff
```

### RAMの設定

```bash
# リソース共有を作成
aws ram create-resource-share \
    --name "shared-vpc-subnets" \
    --resource-arns arn:aws:ec2:ap-northeast-1:111111111111:subnet/subnet-12345 \
    --principals arn:aws:organizations::111111111111:ou/o-xxx/ou-yyy

# Organizations内での自動共有を有効化
aws ram enable-sharing-with-aws-organization
```

## Organizationsとの連携

### Organizations内でのアクセス制御

```mermaid
flowchart TB
    subgraph OrgAccess["Organizations内アクセス"]
        Condition["aws:PrincipalOrgID"]
        OrgPath["aws:PrincipalOrgPaths"]
        Account["aws:PrincipalAccount"]
    end

    Condition --> |"組織全体"| AllAccounts["全アカウント許可"]
    OrgPath --> |"特定OU"| OUAccounts["OU内アカウント許可"]
    Account --> |"特定アカウント"| SpecificAccount["指定アカウント許可"]

    style OrgAccess fill:#8b5cf6,color:#fff
```

### 組織ID条件

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::shared-bucket/*",
      "Condition": {
        "StringEquals": {
          "aws:PrincipalOrgID": "o-xxxxxxxxxx"
        }
      }
    }
  ]
}
```

### OUパス条件

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "sts:AssumeRole",
      "Condition": {
        "ForAnyValue:StringLike": {
          "aws:PrincipalOrgPaths": [
            "o-xxx/r-xxx/ou-xxx-production/*"
          ]
        }
      }
    }
  ]
}
```

## 実践パターン

### パターン1: 中央ログ集約

```mermaid
flowchart TB
    subgraph MemberAccounts["メンバーアカウント"]
        CT1["CloudTrail"]
        CT2["CloudTrail"]
        CT3["CloudTrail"]
    end

    subgraph LogAccount["ログアーカイブアカウント"]
        S3["中央S3バケット"]
    end

    CT1 --> |"クロスアカウント書き込み"| S3
    CT2 --> S3
    CT3 --> S3

    style MemberAccounts fill:#3b82f6,color:#fff
    style LogAccount fill:#22c55e,color:#fff
```

S3バケットポリシー：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AWSCloudTrailAclCheck",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudtrail.amazonaws.com"
      },
      "Action": "s3:GetBucketAcl",
      "Resource": "arn:aws:s3:::central-logs-bucket",
      "Condition": {
        "StringEquals": {
          "aws:SourceOrgID": "o-xxxxxxxxxx"
        }
      }
    },
    {
      "Sid": "AWSCloudTrailWrite",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudtrail.amazonaws.com"
      },
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::central-logs-bucket/*",
      "Condition": {
        "StringEquals": {
          "aws:SourceOrgID": "o-xxxxxxxxxx"
        }
      }
    }
  ]
}
```

### パターン2: 共有VPCネットワーク

```mermaid
flowchart TB
    subgraph NetworkAccount["ネットワークアカウント"]
        VPC["共有VPC"]
        TGW["Transit Gateway"]
        subgraph Subnets["サブネット"]
            Public["パブリック"]
            Private["プライベート"]
        end
    end

    subgraph WorkloadAccounts["ワークロードアカウント"]
        App1["アプリ1"]
        App2["アプリ2"]
    end

    RAM["RAM"]

    Subnets --> RAM
    TGW --> RAM
    RAM --> App1
    RAM --> App2

    style NetworkAccount fill:#3b82f6,color:#fff
    style WorkloadAccounts fill:#22c55e,color:#fff
```

### パターン3: CI/CDクロスアカウントデプロイ

```mermaid
flowchart LR
    subgraph DevOps["DevOpsアカウント"]
        Pipeline["CodePipeline"]
    end

    subgraph Dev["開発アカウント"]
        DevRole["DeployRole"]
    end

    subgraph Staging["ステージング"]
        StageRole["DeployRole"]
    end

    subgraph Prod["本番アカウント"]
        ProdRole["DeployRole"]
    end

    Pipeline --> |"AssumeRole"| DevRole
    Pipeline --> |"AssumeRole"| StageRole
    Pipeline --> |"AssumeRole"| ProdRole

    style DevOps fill:#f59e0b,color:#000
    style Dev fill:#3b82f6,color:#fff
    style Staging fill:#8b5cf6,color:#fff
    style Prod fill:#22c55e,color:#fff
```

## セキュリティベストプラクティス

### チェックリスト

| カテゴリ | ベストプラクティス |
|---------|------------------|
| **最小権限** | 必要最小限のアクションのみ許可 |
| **External ID** | サードパーティ連携では必須 |
| **条件キー** | aws:PrincipalOrgID等で制限 |
| **ロール名規則** | 命名規則を統一 |
| **監査** | CloudTrailでAssumeRoleを監視 |
| **有効期限** | セッション時間を適切に設定 |

### 避けるべきパターン

```json
// ❌ 悪い例: 全アカウントを許可
{
  "Principal": {"AWS": "*"}
}

// ✅ 良い例: 組織IDで制限
{
  "Principal": {"AWS": "*"},
  "Condition": {
    "StringEquals": {
      "aws:PrincipalOrgID": "o-xxxxxxxxxx"
    }
  }
}
```

## まとめ

```mermaid
flowchart TB
    subgraph Methods["クロスアカウントアクセス方法"]
        IAM["IAMロール<br/>AssumeRole"]
        Resource["リソースベース<br/>ポリシー"]
        RAM["Resource Access<br/>Manager"]
    end

    IAM --> |"一時的なアクセス"| Temp["一時認証情報"]
    Resource --> |"直接アクセス"| Direct["リソース直接操作"]
    RAM --> |"リソース共有"| Share["共有リソース利用"]

    style Methods fill:#3b82f6,color:#fff
    style Temp fill:#8b5cf6,color:#fff
    style Direct fill:#22c55e,color:#fff
    style Share fill:#f59e0b,color:#000
```

| 方法 | ユースケース | 設定の複雑さ |
|------|------------|-------------|
| IAMロール | 汎用的なアクセス | 中 |
| リソースベースポリシー | 特定リソースへのアクセス | 低 |
| RAM | VPC等の共有 | 低 |
| Organizations条件 | 組織全体での制御 | 低 |

適切なクロスアカウントアクセス設計により、セキュリティを維持しながら効率的なマルチアカウント運用が可能になります。

## 参考資料

- [IAM Roles for Cross-Account Access](https://docs.aws.amazon.com/IAM/latest/UserGuide/tutorial_cross-account-with-roles.html)
- [AWS Resource Access Manager User Guide](https://docs.aws.amazon.com/ram/latest/userguide/)
- [Cross-Account Policy Evaluation](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic-cross-account.html)
