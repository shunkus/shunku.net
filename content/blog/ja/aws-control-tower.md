---
title: "AWS Control Tower：ランディングゾーンとガードレールによるガバナンス"
date: "2025-12-07"
excerpt: "AWS Control Towerでマルチアカウント環境を自動構築 - ランディングゾーン、ガードレール、Account Factory、AFT（Account Factory for Terraform）を解説します。"
tags: ["AWS", "Control Tower", "Landing Zone", "Governance", "Multi-Account"]
author: "Shunku"
---

AWS Control Towerは、マルチアカウント環境を自動的にセットアップし、継続的にガバナンスを維持するサービスです。AWS Organizationsの上に構築され、ベストプラクティスに基づいた「ランディングゾーン」を提供します。

## なぜControl Towerが必要か

### Organizations単独の課題

AWS Organizationsは強力ですが、すべてを手動で設定する必要があります：

| 作業 | Organizations単独 | Control Tower |
|------|------------------|---------------|
| OU構造の設計 | 手動設計 | ベストプラクティス提供 |
| SCPの作成 | 一から作成 | ガードレールとして提供 |
| ログ集約設定 | 手動構築 | 自動セットアップ |
| アカウント作成 | API/コンソール | Account Factory |
| コンプライアンス監視 | 個別設定 | ダッシュボード提供 |

## ランディングゾーンとは

### 概念

ランディングゾーンは、セキュアでスケーラブルなマルチアカウント環境の「着地点」です。Control Towerが自動的に構築します。

```mermaid
flowchart TB
    subgraph LandingZone["Landing Zone"]
        subgraph Core["コアアカウント"]
            Mgmt["Management Account"]
            Log["Log Archive Account"]
            Audit["Audit Account"]
        end

        subgraph OUs["デフォルトOU"]
            Security["Security OU"]
            Sandbox["Sandbox OU"]
        end

        subgraph Services["自動設定されるサービス"]
            CT["CloudTrail"]
            Config["AWS Config"]
            SSO["IAM Identity Center"]
            SCP["SCPガードレール"]
        end
    end

    Core --> OUs
    OUs --> Services

    style LandingZone fill:#3b82f6,color:#fff
    style Core fill:#8b5cf6,color:#fff
    style OUs fill:#22c55e,color:#fff
    style Services fill:#f59e0b,color:#000
```

### 自動作成されるリソース

| リソース | 目的 |
|---------|------|
| **Log Archive Account** | 全アカウントのCloudTrailログを集約 |
| **Audit Account** | セキュリティ監査用のクロスアカウントアクセス |
| **Security OU** | Log ArchiveとAuditアカウントを格納 |
| **Sandbox OU** | 実験用アカウントを格納 |
| **CloudTrail** | 組織全体のAPI監査 |
| **AWS Config** | リソースコンプライアンス監視 |

## ガードレール

### ガードレールとは

ガードレールは、組織全体に適用されるポリシーです。「予防的」と「検出的」の2種類があります。

```mermaid
flowchart LR
    subgraph Preventive["予防的ガードレール"]
        P1["SCPで実装"]
        P2["アクションを禁止"]
        P3["即座に効果"]
    end

    subgraph Detective["検出的ガードレール"]
        D1["AWS Configルールで実装"]
        D2["違反を検出・通知"]
        D3["是正アクション可能"]
    end

    style Preventive fill:#ef4444,color:#fff
    style Detective fill:#3b82f6,color:#fff
```

### ガードレールの分類

| 分類 | 説明 | 例 |
|------|------|-----|
| **必須** | 無効化不可 | CloudTrailの有効化維持 |
| **強く推奨** | AWSが推奨 | S3パブリックアクセスの禁止 |
| **選択的** | ユースケースに応じて選択 | 特定リージョンの禁止 |

### 主要なガードレール例

#### 予防的ガードレール

```
✓ ルートユーザーによるアクションを禁止
✓ CloudTrailログファイルの整合性検証を維持
✓ CloudTrailのS3バケットへのパブリックアクセスを禁止
✓ AWS Config設定の変更を禁止
✓ ログアーカイブの削除を禁止
```

#### 検出的ガードレール

```
✓ MFAなしのIAMユーザーを検出
✓ 暗号化されていないEBSボリュームを検出
✓ パブリックにアクセス可能なRDSを検出
✓ 暗号化されていないS3バケットを検出
✓ VPCフローログが無効なVPCを検出
```

## Account Factory

### 概要

Account Factoryは、標準化されたアカウントを作成するためのセルフサービスポータルです。

```mermaid
flowchart TB
    subgraph AccountFactory["Account Factory"]
        Template["アカウントテンプレート"]
        Baseline["ベースライン設定"]
        Network["ネットワーク設定"]
    end

    subgraph Process["作成プロセス"]
        Request["アカウント要求"]
        Provision["プロビジョニング"]
        Configure["設定適用"]
        Ready["使用可能"]
    end

    AccountFactory --> Request
    Request --> Provision
    Provision --> Configure
    Configure --> Ready

    style AccountFactory fill:#3b82f6,color:#fff
    style Process fill:#22c55e,color:#fff
```

### 設定可能な項目

| 項目 | 説明 |
|------|------|
| **アカウント名** | 識別用の名前 |
| **メールアドレス** | 一意のルートメール |
| **OU** | 所属するOU |
| **IAM Identity Center** | SSOユーザー/グループの割り当て |
| **VPC設定** | オプションでVPCを自動作成 |

### Service Catalogからの作成

Account FactoryはService Catalogを通じて提供されます：

1. Service Catalogコンソールにアクセス
2. 「AWS Control Tower Account Factory」を選択
3. パラメータを入力してアカウントを作成
4. 自動的にガードレールとベースラインが適用

## AFT（Account Factory for Terraform）

### 概要

AFTは、Terraformを使用してAccount Factoryを拡張するソリューションです。

```mermaid
flowchart LR
    subgraph AFT["AFT アーキテクチャ"]
        Git["GitRepository"]
        Pipeline["CodePipeline"]
        Lambda["Lambda"]
        CT["Control Tower"]
    end

    Git --> |"プッシュ"| Pipeline
    Pipeline --> |"トリガー"| Lambda
    Lambda --> |"API呼び出し"| CT

    style AFT fill:#8b5cf6,color:#fff
```

### AFTのメリット

| 機能 | Account Factory | AFT |
|------|----------------|-----|
| GitOps対応 | ❌ | ✅ |
| カスタマイゼーション | 限定的 | 高度 |
| 承認ワークフロー | ❌ | ✅ |
| バージョン管理 | ❌ | ✅ |
| ドリフト検出 | ❌ | ✅ |

### AFTのコンポーネント

```hcl
# AFT アカウントリクエスト例
module "account_request" {
  source = "./modules/aft-account-request"

  control_tower_parameters = {
    AccountEmail              = "new-account@example.com"
    AccountName              = "production-app1"
    ManagedOrganizationalUnit = "Production"
    SSOUserEmail             = "admin@example.com"
    SSOUserFirstName         = "Admin"
    SSOUserLastName          = "User"
  }

  account_tags = {
    Environment = "Production"
    CostCenter  = "12345"
  }

  account_customizations_name = "production-baseline"
}
```

### カスタマイゼーション

AFTでは以下のカスタマイゼーションが可能：

```
aft-global-customizations/     # 全アカウントに適用
├── terraform/
│   └── main.tf

aft-account-customizations/    # 特定アカウントに適用
├── production-baseline/
│   └── terraform/
│       └── main.tf
└── development-baseline/
    └── terraform/
        └── main.tf
```

## Control Towerの制限と考慮事項

### リージョン制限

```mermaid
flowchart TB
    subgraph Regions["リージョン考慮事項"]
        Home["ホームリージョン<br/>（変更不可）"]
        Governed["ガバナンス対象リージョン<br/>（追加可能）"]
        OptIn["オプトインリージョン<br/>（個別有効化が必要）"]
    end

    Home --> |"Control Tower設定時に決定"| Governed
    Governed --> |"後から追加"| OptIn

    style Home fill:#ef4444,color:#fff
    style Governed fill:#3b82f6,color:#fff
    style OptIn fill:#22c55e,color:#fff
```

### 主な制限

| 制限 | 詳細 |
|------|------|
| ホームリージョン | 初期設定後は変更不可 |
| ネストされたOU | 最大5レベル |
| 既存アカウント | 登録（Enroll）が必要 |
| カスタムSCP | ガードレールとの整合性が必要 |

## 既存環境への導入

### 既存アカウントの登録（Enrollment）

```mermaid
flowchart TB
    subgraph Enrollment["アカウント登録プロセス"]
        Step1["1. 前提条件の確認"]
        Step2["2. OUの選択"]
        Step3["3. Enrollを実行"]
        Step4["4. ベースライン適用"]
        Step5["5. ガードレール適用"]
    end

    Step1 --> Step2
    Step2 --> Step3
    Step3 --> Step4
    Step4 --> Step5

    style Enrollment fill:#3b82f6,color:#fff
```

### 前提条件

- アカウントがOrganizationsのメンバーであること
- AWS Configが有効でないこと（Control Towerが設定するため）
- 登録先のOUがControl Towerに登録済みであること

## ベストプラクティス

### 設計時のポイント

```mermaid
flowchart TB
    subgraph Design["設計のポイント"]
        D1["ホームリージョンを慎重に選択"]
        D2["ガードレールを段階的に有効化"]
        D3["カスタマイゼーションにAFTを検討"]
        D4["既存アカウントの登録計画を立てる"]
    end

    style Design fill:#22c55e,color:#fff
```

### チェックリスト

| フェーズ | チェック項目 |
|---------|-------------|
| **計画** | ホームリージョンの決定 |
| **計画** | 必要なガードレールの特定 |
| **計画** | 既存アカウントの棚卸し |
| **導入** | Log Archive/Auditアカウントの確認 |
| **導入** | IAM Identity Centerの設定 |
| **運用** | ダッシュボードの定期確認 |
| **運用** | ドリフト検出への対応 |

## Control Tower vs Organizations単独

### 選択基準

```mermaid
flowchart TD
    Q1{"マルチアカウント環境を<br/>新規構築する？"}
    Q2{"ベストプラクティスに<br/>沿いたい？"}
    Q3{"カスタマイズが<br/>多く必要？"}

    Q1 -->|Yes| Q2
    Q1 -->|No| Organizations["Organizations単独<br/>（既存環境を維持）"]

    Q2 -->|Yes| ControlTower["Control Tower推奨"]
    Q2 -->|No| Q3

    Q3 -->|Yes| Organizations
    Q3 -->|No| ControlTower

    style ControlTower fill:#22c55e,color:#fff
    style Organizations fill:#3b82f6,color:#fff
```

### 比較表

| 観点 | Control Tower | Organizations単独 |
|------|--------------|------------------|
| セットアップ時間 | 短い（自動化） | 長い（手動） |
| ベストプラクティス | 組み込み | 自分で実装 |
| 柔軟性 | 中程度 | 高い |
| 学習コスト | 低い | 高い |
| 運用負荷 | 低い | 高い |

## まとめ

```mermaid
flowchart LR
    subgraph ControlTower["Control Tower"]
        LZ["Landing Zone"]
        GR["ガードレール"]
        AF["Account Factory"]
    end

    LZ --> |"環境構築"| Foundation["基盤"]
    GR --> |"ポリシー適用"| Governance["Governance"]
    AF --> |"アカウント作成"| Scale["スケール"]

    style ControlTower fill:#3b82f6,color:#fff
    style Foundation fill:#8b5cf6,color:#fff
    style Governance fill:#22c55e,color:#fff
    style Scale fill:#f59e0b,color:#000
```

| コンポーネント | 機能 | 重要度 |
|--------------|------|--------|
| ランディングゾーン | 環境の自動構築 | ★★★ |
| ガードレール | コンプライアンス維持 | ★★★ |
| Account Factory | 標準化されたアカウント作成 | ★★☆ |
| AFT | Terraform連携 | ★★☆ |

Control Towerは、マルチアカウント環境のベストプラクティスを自動的に実装します。新規環境の構築には最適な選択肢です。

## 参考資料

- [AWS Control Tower User Guide](https://docs.aws.amazon.com/controltower/latest/userguide/)
- [AWS Control Tower Guardrails Reference](https://docs.aws.amazon.com/controltower/latest/userguide/guardrails-reference.html)
- [Account Factory for Terraform](https://docs.aws.amazon.com/controltower/latest/userguide/aft-overview.html)
