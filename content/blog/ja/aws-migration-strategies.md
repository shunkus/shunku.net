---
title: "7つのR：AWSマイグレーション戦略の選択基準"
date: "2025-12-15"
excerpt: "AWSへの移行戦略を徹底解説 - Rehost、Replatform、Refactor、Repurchase、Retain、Retire、Relocateの7つのRと、ワークロードに応じた選択基準を紹介します。"
tags: ["AWS", "マイグレーション", "クラウド移行", "7R", "アーキテクチャ"]
author: "Shunku"
---

クラウド移行を成功させるには、各ワークロードに最適な移行戦略を選択することが重要です。AWSは「7つのR」と呼ばれる移行パターンを定義しており、これに基づいて計画を立てることで効率的な移行が可能になります。

## 7つのRの概要

```mermaid
flowchart TB
    subgraph SevenRs["7つのR"]
        Rehost["Rehost<br/>（リフト&シフト）"]
        Replatform["Replatform<br/>（リフト&最適化）"]
        Refactor["Refactor/Re-architect<br/>（再設計）"]
        Repurchase["Repurchase<br/>（SaaSへ移行）"]
        Retain["Retain<br/>（維持）"]
        Retire["Retire<br/>（廃止）"]
        Relocate["Relocate<br/>（VMware Cloud移行）"]
    end

    style Rehost fill:#3b82f6,color:#fff
    style Replatform fill:#22c55e,color:#fff
    style Refactor fill:#8b5cf6,color:#fff
    style Repurchase fill:#f59e0b,color:#000
    style Retain fill:#6b7280,color:#fff
    style Retire fill:#ef4444,color:#fff
    style Relocate fill:#14b8a6,color:#fff
```

### 比較表

| 戦略 | 変更度 | 労力 | コスト最適化 | 速度 |
|------|--------|------|-------------|------|
| Rehost | 最小 | 低 | 低 | 最速 |
| Replatform | 小〜中 | 中 | 中 | 速い |
| Refactor | 大 | 高 | 高 | 遅い |
| Repurchase | 中 | 中 | 中〜高 | 中程度 |
| Retain | なし | なし | なし | N/A |
| Retire | なし | 低 | 高 | N/A |
| Relocate | 最小 | 低 | 低 | 速い |

## Rehost（リフト&シフト）

### 概要

アプリケーションをそのままAWSに移行します。最も迅速な移行方法です。

```mermaid
flowchart LR
    subgraph OnPrem["オンプレミス"]
        VM1["VMware VM"]
        App1["アプリケーション"]
    end

    subgraph AWS["AWS"]
        EC2["EC2インスタンス"]
        App2["同じアプリケーション"]
    end

    OnPrem --> |"リフト&シフト"| AWS

    style OnPrem fill:#6b7280,color:#fff
    style AWS fill:#3b82f6,color:#fff
```

### 使用するサービス

| サービス | 用途 |
|---------|------|
| AWS Application Migration Service | サーバーの自動移行 |
| AWS Server Migration Service | VMの移行（レガシー） |
| CloudEndure Migration | 継続的レプリケーション |

### メリット/デメリット

| メリット | デメリット |
|---------|-----------|
| 迅速な移行 | クラウド最適化されない |
| 低リスク | コスト効率が低い可能性 |
| スキル要件が低い | 技術的負債が残る |

### 適したケース

- 迅速なデータセンター撤退が必要
- アプリケーションの変更が困難
- 移行後の最適化を計画している

## Replatform（リフト&最適化）

### 概要

コアアーキテクチャは維持しつつ、一部のコンポーネントをマネージドサービスに置き換えます。

```mermaid
flowchart LR
    subgraph OnPrem["オンプレミス"]
        App["アプリ"]
        DB1["MySQL<br/>（自己管理）"]
    end

    subgraph AWS["AWS"]
        EC2["EC2"]
        RDS["RDS MySQL<br/>（マネージド）"]
    end

    App --> DB1
    EC2 --> RDS
    OnPrem --> |"Replatform"| AWS

    style OnPrem fill:#6b7280,color:#fff
    style AWS fill:#22c55e,color:#fff
```

### 一般的なReplatformパターン

| 変更前 | 変更後 | メリット |
|--------|--------|---------|
| 自己管理MySQL | RDS MySQL | 運用負荷削減 |
| ファイルサーバー | EFS/FSx | スケーラビリティ |
| 自己管理キャッシュ | ElastiCache | マネージド化 |
| Cron | EventBridge + Lambda | サーバーレス化 |

### 適したケース

- 運用負荷を削減したい
- マネージドサービスの利点を活用したい
- 大幅なコード変更は避けたい

## Refactor/Re-architect（再設計）

### 概要

クラウドネイティブアーキテクチャに再設計します。最も労力がかかりますが、最大のメリットを得られます。

```mermaid
flowchart TB
    subgraph OnPrem["オンプレミス（モノリス）"]
        Mono["モノリシック<br/>アプリケーション"]
    end

    subgraph AWS["AWS（マイクロサービス）"]
        API["API Gateway"]
        Lambda1["Lambda"]
        Lambda2["Lambda"]
        Lambda3["Lambda"]
        DDB["DynamoDB"]
        SQS["SQS"]
    end

    Mono --> |"Refactor"| AWS
    API --> Lambda1
    API --> Lambda2
    Lambda1 --> DDB
    Lambda2 --> SQS
    SQS --> Lambda3

    style OnPrem fill:#6b7280,color:#fff
    style AWS fill:#8b5cf6,color:#fff
```

### Refactorパターン

| パターン | 説明 |
|---------|------|
| マイクロサービス化 | モノリスを分割 |
| サーバーレス化 | Lambda/Fargateへ移行 |
| コンテナ化 | ECS/EKSへ移行 |
| イベント駆動化 | SNS/SQS/EventBridgeを活用 |

### 適したケース

- スケーラビリティが重要
- 新機能の開発速度を上げたい
- 運用コストを大幅に削減したい
- 技術的負債を解消したい

## Repurchase（SaaSへ移行）

### 概要

既存のアプリケーションをSaaSソリューションに置き換えます。

```mermaid
flowchart LR
    subgraph OnPrem["オンプレミス"]
        CRM1["自社CRMシステム"]
        Email1["メールサーバー"]
        HR1["人事システム"]
    end

    subgraph SaaS["SaaS"]
        CRM2["Salesforce"]
        Email2["Microsoft 365"]
        HR2["Workday"]
    end

    CRM1 --> CRM2
    Email1 --> Email2
    HR1 --> HR2

    style OnPrem fill:#6b7280,color:#fff
    style SaaS fill:#f59e0b,color:#000
```

### 一般的なRepurchase例

| カテゴリ | 自社運用 | SaaS |
|---------|---------|------|
| CRM | 独自開発 | Salesforce |
| ERP | SAP on-prem | SAP S/4HANA Cloud |
| メール | Exchange | Microsoft 365 |
| コラボ | ファイルサーバー | Google Workspace |
| HR | PeopleSoft | Workday |

### 適したケース

- コモディティ化されたアプリケーション
- 差別化要因ではないシステム
- 運用から解放されたい

## Retain（維持）

### 概要

移行せず、オンプレミスに残します。

```mermaid
flowchart TB
    subgraph Retain["Retain対象"]
        Legacy["レガシーシステム<br/>（EOL間近）"]
        Compliance["コンプライアンス<br/>制約あり"]
        Complex["複雑な依存関係"]
        Recent["最近の大規模投資"]
    end

    style Retain fill:#6b7280,color:#fff
```

### 適したケース

- 近い将来に廃止予定
- 移行のROIが低い
- 規制上の制約がある
- 最近大規模な投資をした

## Retire（廃止）

### 概要

不要なアプリケーションを特定し、廃止します。

```mermaid
flowchart LR
    subgraph Assessment["評価"]
        A1["使用状況分析"]
        A2["依存関係確認"]
        A3["廃止計画"]
    end

    subgraph Retire["廃止"]
        R1["データアーカイブ"]
        R2["システム停止"]
        R3["リソース解放"]
    end

    Assessment --> Retire

    style Assessment fill:#3b82f6,color:#fff
    style Retire fill:#ef4444,color:#fff
```

### 発見される典型的なケース

- 重複したシステム
- 未使用のアプリケーション
- テスト/開発環境の残骸
- 買収で引き継いだ冗長システム

## Relocate（VMware Cloud移行）

### 概要

VMware Cloud on AWSを使用して、VMwareワークロードをそのまま移行します。

```mermaid
flowchart LR
    subgraph OnPrem["オンプレミス"]
        vSphere1["vSphere環境"]
    end

    subgraph VMC["VMware Cloud on AWS"]
        vSphere2["vSphere環境<br/>（AWSインフラ上）"]
    end

    subgraph Native["AWSネイティブ"]
        S3["S3"]
        RDS["RDS"]
    end

    vSphere1 --> |"HCX"| vSphere2
    vSphere2 <--> Native

    style OnPrem fill:#6b7280,color:#fff
    style VMC fill:#14b8a6,color:#fff
    style Native fill:#3b82f6,color:#fff
```

### 適したケース

- VMware環境への大規模投資がある
- VMware固有の機能を使用している
- 運用チームのスキルセットを維持したい

## 移行フェーズ

### AWS Migration Framework

```mermaid
flowchart LR
    subgraph Phases["移行フェーズ"]
        Assess["1. 評価<br/>（Assess）"]
        Mobilize["2. 準備<br/>（Mobilize）"]
        Migrate["3. 移行<br/>（Migrate & Modernize）"]
    end

    Assess --> |"ポートフォリオ分析"| Mobilize
    Mobilize --> |"パイロット"| Migrate

    style Phases fill:#3b82f6,color:#fff
```

### 評価フェーズで使用するツール

| ツール | 用途 |
|--------|------|
| AWS Migration Hub | 移行の一元管理 |
| AWS Application Discovery Service | サーバー/依存関係の発見 |
| AWS Migration Evaluator | TCO分析 |
| CART | クラウドレディネス評価 |

## 戦略選択のフローチャート

```mermaid
flowchart TD
    Start["アプリケーション"]
    Q1{"使用されている？"}
    Q2{"クラウドで<br/>動作可能？"}
    Q3{"SaaSで<br/>代替可能？"}
    Q4{"最適化の<br/>価値がある？"}
    Q5{"大幅な変更<br/>が必要？"}
    Q6{"VMware<br/>環境？"}

    Start --> Q1
    Q1 -->|No| Retire["Retire"]
    Q1 -->|Yes| Q2
    Q2 -->|No| Retain["Retain"]
    Q2 -->|Yes| Q3
    Q3 -->|Yes| Repurchase["Repurchase"]
    Q3 -->|No| Q4
    Q4 -->|No| Q6
    Q6 -->|Yes| Relocate["Relocate"]
    Q6 -->|No| Rehost["Rehost"]
    Q4 -->|Yes| Q5
    Q5 -->|Yes| Refactor["Refactor"]
    Q5 -->|No| Replatform["Replatform"]

    style Retire fill:#ef4444,color:#fff
    style Retain fill:#6b7280,color:#fff
    style Repurchase fill:#f59e0b,color:#000
    style Rehost fill:#3b82f6,color:#fff
    style Replatform fill:#22c55e,color:#fff
    style Refactor fill:#8b5cf6,color:#fff
    style Relocate fill:#14b8a6,color:#fff
```

## 大規模移行のベストプラクティス

### ウェーブ計画

```mermaid
flowchart TB
    subgraph Waves["移行ウェーブ"]
        Wave1["Wave 1: パイロット<br/>（5-10アプリ）"]
        Wave2["Wave 2: 基盤<br/>（共有サービス）"]
        Wave3["Wave 3: 本番<br/>（ビジネスアプリ）"]
        Wave4["Wave 4: 残り<br/>（複雑なアプリ）"]
    end

    Wave1 --> Wave2
    Wave2 --> Wave3
    Wave3 --> Wave4

    style Waves fill:#3b82f6,color:#fff
```

### 成功のポイント

| ポイント | 説明 |
|---------|------|
| 自動化 | 移行ツールを最大限活用 |
| 並行実行 | 複数ワークロードを同時移行 |
| テスト | 各ウェーブでテストを徹底 |
| ロールバック | 失敗時の戻り手順を準備 |

## まとめ

```mermaid
flowchart TB
    subgraph Strategies["7つのR"]
        Quick["迅速な移行"]
        Optimize["最適化移行"]
        Transform["変革"]
        Other["その他"]
    end

    Quick --> Rehost["Rehost"]
    Quick --> Relocate["Relocate"]
    Optimize --> Replatform["Replatform"]
    Transform --> Refactor["Refactor"]
    Transform --> Repurchase["Repurchase"]
    Other --> Retain["Retain"]
    Other --> Retire["Retire"]

    style Strategies fill:#3b82f6,color:#fff
```

| 戦略 | 主なユースケース | 推奨度 |
|------|----------------|--------|
| Rehost | 迅速な移行 | ★★★ |
| Replatform | 運用効率化 | ★★★ |
| Refactor | 長期最適化 | ★★☆ |
| Repurchase | コモディティ化 | ★★☆ |
| Relocate | VMware環境 | ★★☆ |
| Retain | 制約あり | ★☆☆ |
| Retire | 不要システム | ★★★ |

適切な移行戦略の選択により、コスト、リスク、速度のバランスを取りながら、クラウドの価値を最大化できます。

## 参考資料

- [AWS Migration Whitepaper](https://docs.aws.amazon.com/whitepapers/latest/aws-migration-whitepaper/)
- [AWS Prescriptive Guidance](https://docs.aws.amazon.com/prescriptive-guidance/)
- [AWS Migration Hub](https://docs.aws.amazon.com/migrationhub/latest/ug/)
