---
title: "AWS Organizations完全ガイド：マルチアカウント戦略の設計"
date: "2025-12-06"
excerpt: "AWS Organizationsによるマルチアカウント管理を徹底解説 - OU設計、SCP（サービスコントロールポリシー）、一括請求、アカウント階層のベストプラクティスを学びます。"
tags: ["AWS", "Organizations", "Multi-Account", "SCP", "Governance"]
author: "Shunku"
---

AWS Organizationsは、複数のAWSアカウントを一元管理するためのサービスです。エンタープライズ規模の組織では、セキュリティ、コスト管理、コンプライアンスの観点から、適切なマルチアカウント戦略が不可欠です。

## なぜマルチアカウントが必要か

### 単一アカウントの限界

1つのAWSアカウントですべてを運用すると、以下の問題が発生します：

```mermaid
flowchart TB
    subgraph Problems["単一アカウントの問題"]
        P1["セキュリティ境界がない"]
        P2["コスト配分が困難"]
        P3["リソース制限の共有"]
        P4["権限管理が複雑化"]
        P5["コンプライアンス対応が困難"]
    end

    style Problems fill:#ef4444,color:#fff
```

### マルチアカウントのメリット

| 観点 | 単一アカウント | マルチアカウント |
|------|---------------|-----------------|
| セキュリティ | 全リソースが同一境界 | アカウント単位で分離 |
| コスト | タグベースの配分のみ | アカウント単位で明確 |
| 権限 | IAMポリシーが複雑化 | アカウント単位で簡素化 |
| 障害影響 | 全環境に影響 | 影響範囲を限定 |
| サービス制限 | 全体で共有 | アカウント単位で独立 |

## AWS Organizationsの構造

### 基本コンポーネント

```mermaid
flowchart TB
    subgraph Org["Organization"]
        Root["Root"]

        subgraph OU1["OU: Production"]
            Prod1["Account: Prod-App1"]
            Prod2["Account: Prod-App2"]
        end

        subgraph OU2["OU: Development"]
            Dev1["Account: Dev"]
            Stage1["Account: Staging"]
        end

        subgraph OU3["OU: Security"]
            Log["Account: Log Archive"]
            Audit["Account: Audit"]
        end

        Mgmt["Management Account"]
    end

    Root --> OU1
    Root --> OU2
    Root --> OU3
    Mgmt -.-> Root

    style Org fill:#3b82f6,color:#fff
    style OU1 fill:#22c55e,color:#fff
    style OU2 fill:#f59e0b,color:#000
    style OU3 fill:#8b5cf6,color:#fff
```

### 用語の整理

| コンポーネント | 説明 |
|---------------|------|
| **Organization** | 複数のAWSアカウントの集合体 |
| **Management Account** | 組織の管理アカウント（旧Master Account） |
| **Member Account** | 組織に属する一般アカウント |
| **Root** | 組織階層の最上位 |
| **OU（Organizational Unit）** | アカウントをグループ化する単位 |
| **SCP** | OUまたはアカウントに適用するポリシー |

## OU設計のベストプラクティス

### 推奨OU構造

```mermaid
flowchart TB
    Root["Root"]

    subgraph Core["コアOU"]
        Security["Security OU"]
        Infrastructure["Infrastructure OU"]
        Sandbox["Sandbox OU"]
    end

    subgraph Workloads["ワークロードOU"]
        Prod["Production OU"]
        SDLC["SDLC OU"]
    end

    subgraph Additional["追加OU"]
        Suspended["Suspended OU"]
        PolicyStaging["Policy Staging OU"]
    end

    Root --> Core
    Root --> Workloads
    Root --> Additional

    Security --> LogArchive["Log Archive"]
    Security --> Audit["Audit"]

    Infrastructure --> Network["Network"]
    Infrastructure --> SharedServices["Shared Services"]

    Prod --> ProdApp1["App1 Prod"]
    Prod --> ProdApp2["App2 Prod"]

    SDLC --> Dev["Development"]
    SDLC --> Staging["Staging"]

    style Core fill:#8b5cf6,color:#fff
    style Workloads fill:#22c55e,color:#fff
    style Additional fill:#6b7280,color:#fff
```

### OU設計の原則

1. **セキュリティを最優先**: Security OUは独立させる
2. **環境で分離**: 本番とSDLC（開発/ステージング）を分ける
3. **シンプルに保つ**: 深すぎる階層は避ける（最大5レベル）
4. **成長を見据える**: 将来のアカウント追加を考慮

## SCP（サービスコントロールポリシー）

### SCPとは

SCPは組織全体またはOU単位で「できること」の上限を定義します。IAMポリシーとは異なり、**許可を与えるのではなく、許可の上限を制限**します。

```mermaid
flowchart LR
    subgraph Effective["有効な権限"]
        direction TB
        SCP["SCP<br/>（許可の上限）"]
        IAM["IAMポリシー<br/>（付与された権限）"]
        Result["実際に使える権限"]
    end

    SCP --> Result
    IAM --> Result

    Note["SCPとIAMの<br/>共通部分のみ有効"]

    style SCP fill:#ef4444,color:#fff
    style IAM fill:#3b82f6,color:#fff
    style Result fill:#22c55e,color:#fff
```

### SCP vs IAMポリシー

| 特徴 | SCP | IAMポリシー |
|------|-----|------------|
| 適用対象 | アカウント/OU | ユーザー/ロール/グループ |
| 目的 | 許可の上限を設定 | 権限を付与 |
| Management Account | 影響なし | 影響あり |
| デフォルト | FullAWSAccess | 権限なし |

### SCPの戦略

#### Deny List（推奨）

デフォルトで全て許可し、禁止事項を明示的にDeny：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyRootUser",
      "Effect": "Deny",
      "Action": "*",
      "Resource": "*",
      "Condition": {
        "StringLike": {
          "aws:PrincipalArn": "arn:aws:iam::*:root"
        }
      }
    }
  ]
}
```

#### Allow List

すべてをデフォルトで禁止し、許可するサービスを明示：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:*",
        "s3:*",
        "rds:*"
      ],
      "Resource": "*"
    }
  ]
}
```

### 実践的なSCP例

#### リージョン制限

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyNonApprovedRegions",
      "Effect": "Deny",
      "NotAction": [
        "iam:*",
        "organizations:*",
        "support:*",
        "budgets:*"
      ],
      "Resource": "*",
      "Condition": {
        "StringNotEquals": {
          "aws:RequestedRegion": [
            "ap-northeast-1",
            "us-east-1"
          ]
        }
      }
    }
  ]
}
```

#### セキュリティサービスの保護

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ProtectSecurityServices",
      "Effect": "Deny",
      "Action": [
        "cloudtrail:StopLogging",
        "cloudtrail:DeleteTrail",
        "config:StopConfigurationRecorder",
        "config:DeleteConfigurationRecorder",
        "guardduty:DeleteDetector",
        "guardduty:DisassociateFromMasterAccount"
      ],
      "Resource": "*"
    }
  ]
}
```

#### S3パブリックアクセス禁止

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyS3PublicAccess",
      "Effect": "Deny",
      "Action": [
        "s3:PutBucketPublicAccessBlock",
        "s3:DeletePublicAccessBlock"
      ],
      "Resource": "*",
      "Condition": {
        "StringNotEquals": {
          "aws:PrincipalOrgMasterAccountId": "${aws:PrincipalAccount}"
        }
      }
    }
  ]
}
```

## 一括請求（Consolidated Billing）

### メリット

```mermaid
flowchart TB
    subgraph Benefits["一括請求のメリット"]
        B1["ボリュームディスカウント"]
        B2["Reserved Instance共有"]
        B3["Savings Plans共有"]
        B4["一元的なコスト管理"]
    end

    subgraph Example["例：EC2使用量"]
        A1["Account A: 50台"]
        A2["Account B: 30台"]
        A3["Account C: 20台"]
        Total["合計: 100台<br/>→ より高いディスカウント"]
    end

    Benefits --> Example

    style Benefits fill:#22c55e,color:#fff
    style Example fill:#3b82f6,color:#fff
```

### RIとSavings Plansの共有

Reserved InstancesとSavings Plansは組織内で自動的に共有されます：

| 設定 | 動作 |
|------|------|
| 共有ON（デフォルト） | 組織全体で利用可能 |
| 共有OFF | 購入アカウントのみ利用可能 |

## アカウント作成の自動化

### Organizations API

```python
import boto3

org_client = boto3.client('organizations')

# 新しいアカウントを作成
response = org_client.create_account(
    Email='new-account@example.com',
    AccountName='new-production-account',
    RoleName='OrganizationAccountAccessRole',
    IamUserAccessToBilling='DENY'
)

# 作成状態を確認
create_status = org_client.describe_create_account_status(
    CreateAccountRequestId=response['CreateAccountStatus']['Id']
)
```

### Account Factory（Control Tower）

大規模なアカウント作成には、Control TowerのAccount Factoryを使用します（次の記事で詳述）。

## 委任管理者

### 委任可能なサービス

Management Account以外に管理権限を委任できます：

| サービス | 委任内容 |
|---------|---------|
| AWS Config | 組織全体のルール管理 |
| GuardDuty | 脅威検出の一元管理 |
| Security Hub | セキュリティ統合 |
| CloudFormation StackSets | スタックのデプロイ |
| Systems Manager | 運用管理 |

```bash
# GuardDutyの委任管理者を設定
aws organizations register-delegated-administrator \
    --account-id 123456789012 \
    --service-principal guardduty.amazonaws.com
```

## ベストプラクティス

### Management Accountの保護

```mermaid
flowchart TB
    subgraph MgmtAccount["Management Account"]
        M1["最小限のリソースのみ"]
        M2["ワークロードは配置しない"]
        M3["アクセスを厳格に制限"]
        M4["MFAを必須化"]
    end

    subgraph Delegate["委任すべき機能"]
        D1["ログ集約 → Log Archive"]
        D2["セキュリティ監視 → Audit"]
        D3["ネットワーク → Network"]
    end

    MgmtAccount --> Delegate

    style MgmtAccount fill:#ef4444,color:#fff
    style Delegate fill:#22c55e,color:#fff
```

### チェックリスト

| カテゴリ | ベストプラクティス |
|---------|------------------|
| **アカウント設計** | ワークロードごとにアカウントを分離 |
| **OU設計** | セキュリティ、インフラ、ワークロードで分類 |
| **SCP** | Deny Listアプローチを採用 |
| **Management Account** | ワークロードを配置しない |
| **委任** | 可能な限り委任管理者を使用 |
| **自動化** | アカウント作成をコード化 |

## よくある間違い

### 1. SCPがManagement Accountに効かない

SCPはManagement Accountには適用されません。これは仕様です。

### 2. SCPで権限を付与しようとする

SCPは「上限」を設定するもので、権限を「付与」するものではありません。実際の権限付与はIAMポリシーで行います。

### 3. 深すぎるOU階層

OUは最大5レベルまでですが、2-3レベルに抑えることを推奨します。

## まとめ

```mermaid
flowchart LR
    subgraph Organizations["AWS Organizations"]
        OU["OU設計"]
        SCP["SCP"]
        Billing["一括請求"]
        Delegate["委任管理者"]
    end

    OU --> |"アカウント整理"| Governance["Governance"]
    SCP --> |"権限制限"| Security["Security"]
    Billing --> |"コスト集約"| Cost["Cost Management"]
    Delegate --> |"権限分散"| Operations["運用効率"]

    style Organizations fill:#3b82f6,color:#fff
    style Governance fill:#22c55e,color:#fff
    style Security fill:#8b5cf6,color:#fff
    style Cost fill:#f59e0b,color:#000
    style Operations fill:#ef4444,color:#fff
```

| 機能 | 用途 | 重要度 |
|------|------|--------|
| OU | アカウントのグループ化 | ★★★ |
| SCP | 権限の上限設定 | ★★★ |
| 一括請求 | コスト最適化 | ★★☆ |
| 委任管理者 | 運用の分散 | ★★☆ |

AWS Organizationsは、マルチアカウント戦略の基盤です。適切なOU設計とSCPにより、セキュリティとガバナンスを両立できます。

## 参考資料

- [AWS Organizations User Guide](https://docs.aws.amazon.com/organizations/latest/userguide/)
- [AWS Multi-Account Strategy](https://docs.aws.amazon.com/whitepapers/latest/organizing-your-aws-environment/)
- [SCP Examples](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps_examples.html)
