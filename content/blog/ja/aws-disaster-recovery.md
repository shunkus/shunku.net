---
title: "AWS災害復旧（DR）戦略：RTO/RPOから選ぶ4つのアプローチ"
date: "2025-12-12"
excerpt: "AWSの災害復旧戦略を徹底解説 - Backup/Restore、Pilot Light、Warm Standby、Active-Activeの4つのアプローチ、RTO/RPOに基づく選択基準を紹介します。"
tags: ["AWS", "災害復旧", "DR", "高可用性", "バックアップ"]
author: "Shunku"
---

災害復旧（Disaster Recovery、DR）は、自然災害、ハードウェア障害、サイバー攻撃などからビジネスを守るための重要な戦略です。AWSは複数のDRオプションを提供しており、要件に応じて適切なアプローチを選択できます。

## DR計画の基本概念

### RTO と RPO

```mermaid
flowchart LR
    subgraph Timeline["タイムライン"]
        LastBackup["最後の<br/>バックアップ"]
        Disaster["障害発生"]
        Recovery["復旧完了"]
    end

    LastBackup --> |"RPO<br/>（データ損失許容量）"| Disaster
    Disaster --> |"RTO<br/>（復旧時間目標）"| Recovery

    style Disaster fill:#ef4444,color:#fff
    style LastBackup fill:#3b82f6,color:#fff
    style Recovery fill:#22c55e,color:#fff
```

| 指標 | 定義 | 質問 |
|------|------|------|
| **RTO** | Recovery Time Objective | どれだけ早く復旧する必要があるか？ |
| **RPO** | Recovery Point Objective | どれだけのデータ損失を許容できるか？ |

### 高可用性 vs 災害復旧

| 項目 | 高可用性（HA） | 災害復旧（DR） |
|------|---------------|---------------|
| 目的 | 単一障害点の排除 | 大規模障害からの復旧 |
| 範囲 | 単一リージョン内 | リージョン間 |
| 自動化 | 通常は自動 | 手動または自動 |
| コスト | 中程度 | 戦略により変動 |

## 4つのDR戦略

### 概要比較

```mermaid
flowchart TB
    subgraph Strategies["DR戦略"]
        BR["Backup/Restore<br/>💰 低コスト<br/>⏱️ 長いRTO"]
        PL["Pilot Light<br/>💰 中コスト<br/>⏱️ 中程度RTO"]
        WS["Warm Standby<br/>💰💰 高コスト<br/>⏱️ 短いRTO"]
        AA["Active-Active<br/>💰💰💰 最高コスト<br/>⏱️ 最短RTO"]
    end

    BR --> |"RTO: 24時間+"| Low["低優先度システム"]
    PL --> |"RTO: 数時間"| Medium["中優先度システム"]
    WS --> |"RTO: 数分〜1時間"| High["高優先度システム"]
    AA --> |"RTO: 秒〜分"| Critical["ミッションクリティカル"]

    style BR fill:#6b7280,color:#fff
    style PL fill:#3b82f6,color:#fff
    style WS fill:#f59e0b,color:#000
    style AA fill:#22c55e,color:#fff
```

### 戦略比較表

| 戦略 | RTO | RPO | コスト | 複雑さ |
|------|-----|-----|--------|--------|
| Backup/Restore | 24時間+ | 24時間+ | 最低 | 低 |
| Pilot Light | 数時間 | 分〜時間 | 低 | 中 |
| Warm Standby | 分〜1時間 | 秒〜分 | 中 | 中〜高 |
| Active-Active | 秒〜分 | ほぼゼロ | 最高 | 高 |

## Backup/Restore

### 概要

最もシンプルでコスト効率の高い戦略。データをバックアップし、災害時に復元します。

```mermaid
flowchart TB
    subgraph Primary["プライマリリージョン"]
        App["アプリケーション"]
        DB["データベース"]
        Storage["ストレージ"]
    end

    subgraph DR["DRリージョン"]
        S3DR["S3バックアップ"]
    end

    App --> |"AMI"| S3DR
    DB --> |"スナップショット"| S3DR
    Storage --> |"レプリケーション"| S3DR

    style Primary fill:#3b82f6,color:#fff
    style DR fill:#22c55e,color:#fff
```

### 実装方法

```bash
# EBSスナップショットのクロスリージョンコピー
aws ec2 copy-snapshot \
    --source-region ap-northeast-1 \
    --source-snapshot-id snap-xxx \
    --destination-region us-west-2

# RDSスナップショットのクロスリージョンコピー
aws rds copy-db-snapshot \
    --source-db-snapshot-identifier arn:aws:rds:ap-northeast-1:xxx:snapshot:xxx \
    --target-db-snapshot-identifier my-snapshot-copy \
    --source-region ap-northeast-1

# S3クロスリージョンレプリケーション
aws s3api put-bucket-replication \
    --bucket my-bucket \
    --replication-configuration file://replication.json
```

### AWS Backupによる自動化

```mermaid
flowchart LR
    subgraph AWSBackup["AWS Backup"]
        Plan["バックアップ<br/>プラン"]
        Vault["バックアップ<br/>ボールト"]
    end

    subgraph Resources["リソース"]
        EC2["EC2"]
        RDS["RDS"]
        EFS["EFS"]
        DynamoDB["DynamoDB"]
    end

    subgraph DR["DRリージョン"]
        DRVault["DRボールト"]
    end

    Resources --> Plan
    Plan --> Vault
    Vault --> |"クロスリージョン<br/>コピー"| DRVault

    style AWSBackup fill:#f59e0b,color:#000
```

### 適したユースケース

- 開発/テスト環境
- 低優先度のワークロード
- コスト最優先のシステム
- 長いRTOが許容される場合

## Pilot Light

### 概要

コアシステム（データベース等）のみをDRリージョンで常時稼働させ、災害時に残りのコンポーネントを起動します。

```mermaid
flowchart TB
    subgraph Primary["プライマリリージョン"]
        App1["アプリサーバー"]
        Web1["Webサーバー"]
        DB1[("データベース")]
    end

    subgraph DR["DRリージョン（Pilot Light）"]
        DB2[("レプリカDB<br/>（常時稼働）")]
        App2["アプリサーバー<br/>（停止中）"]
        Web2["Webサーバー<br/>（停止中）"]
    end

    DB1 --> |"非同期<br/>レプリケーション"| DB2

    style Primary fill:#3b82f6,color:#fff
    style DB2 fill:#22c55e,color:#fff
    style App2 fill:#6b7280,color:#fff
    style Web2 fill:#6b7280,color:#fff
```

### 実装方法

#### データベースレプリケーション

```bash
# RDS リードレプリカ（クロスリージョン）
aws rds create-db-instance-read-replica \
    --db-instance-identifier mydb-replica \
    --source-db-instance-identifier arn:aws:rds:ap-northeast-1:xxx:db:mydb \
    --source-region ap-northeast-1 \
    --region us-west-2

# Aurora Global Database
aws rds create-global-cluster \
    --global-cluster-identifier my-global-cluster \
    --source-db-cluster-identifier arn:aws:rds:ap-northeast-1:xxx:cluster:my-cluster
```

#### 復旧時の手順

1. データベースレプリカを昇格
2. EC2インスタンスを起動
3. Route 53でトラフィックを切り替え

### 適したユースケース

- 中程度の優先度のワークロード
- 数時間のRTOが許容される場合
- コストとRTOのバランスを取りたい場合

## Warm Standby

### 概要

DRリージョンで縮小版のシステムを常時稼働させます。災害時はスケールアップして本番トラフィックを処理します。

```mermaid
flowchart TB
    subgraph Primary["プライマリリージョン"]
        ALB1["ALB"]
        ASG1["Auto Scaling Group<br/>（10台）"]
        DB1[("RDS Multi-AZ")]
    end

    subgraph DR["DRリージョン（Warm Standby）"]
        ALB2["ALB"]
        ASG2["Auto Scaling Group<br/>（2台 → 10台）"]
        DB2[("RDS レプリカ")]
    end

    ALB1 --> ASG1
    ASG1 --> DB1
    DB1 --> |"レプリケーション"| DB2
    ALB2 --> ASG2
    ASG2 --> DB2

    style Primary fill:#3b82f6,color:#fff
    style DR fill:#f59e0b,color:#000
```

### 実装のポイント

| コンポーネント | プライマリ | Warm Standby |
|--------------|-----------|--------------|
| EC2 | フルキャパシティ | 最小構成 |
| Auto Scaling | アクティブ | 小さい最小値 |
| ALB | アクティブ | アクティブ（待機） |
| RDS | マスター | リードレプリカ |

### 復旧手順

```bash
# 1. Auto Scaling Groupの容量を増加
aws autoscaling update-auto-scaling-group \
    --auto-scaling-group-name my-dr-asg \
    --min-size 10 \
    --desired-capacity 10

# 2. RDSレプリカを昇格
aws rds promote-read-replica \
    --db-instance-identifier mydb-replica

# 3. Route 53でフェイルオーバー（自動の場合はヘルスチェック依存）
```

### 適したユースケース

- 高優先度のビジネスアプリケーション
- 分〜1時間のRTOが必要な場合
- 中程度のコストが許容される場合

## Active-Active（Multi-Site）

### 概要

複数のリージョンで本番トラフィックを処理します。災害時のフェイルオーバーは最小限で済みます。

```mermaid
flowchart TB
    subgraph Users["ユーザー"]
        User["エンドユーザー"]
    end

    subgraph DNS["Route 53"]
        R53["レイテンシーベース<br/>ルーティング"]
    end

    subgraph Region1["東京リージョン"]
        ALB1["ALB"]
        App1["アプリ"]
        DB1[("Aurora<br/>Global DB")]
    end

    subgraph Region2["シンガポール"]
        ALB2["ALB"]
        App2["アプリ"]
        DB2[("Aurora<br/>レプリカ")]
    end

    User --> R53
    R53 --> ALB1
    R53 --> ALB2
    ALB1 --> App1
    ALB2 --> App2
    App1 --> DB1
    App2 --> DB2
    DB1 <--> |"レプリケーション"| DB2

    style Region1 fill:#3b82f6,color:#fff
    style Region2 fill:#22c55e,color:#fff
```

### 主要コンポーネント

#### Aurora Global Database

```bash
# プライマリクラスターからグローバルデータベースを作成
aws rds create-global-cluster \
    --global-cluster-identifier my-global-db \
    --source-db-cluster-identifier my-primary-cluster

# セカンダリリージョンにクラスターを追加
aws rds create-db-cluster \
    --db-cluster-identifier my-secondary-cluster \
    --global-cluster-identifier my-global-db \
    --engine aurora-mysql \
    --region us-west-2
```

#### DynamoDB Global Tables

```bash
# グローバルテーブルの作成
aws dynamodb create-table \
    --table-name MyTable \
    --attribute-definitions AttributeName=pk,AttributeType=S \
    --key-schema AttributeName=pk,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --stream-specification StreamEnabled=true,StreamViewType=NEW_AND_OLD_IMAGES

# レプリカの追加
aws dynamodb update-table \
    --table-name MyTable \
    --replica-updates Create={RegionName=us-west-2}
```

### 適したユースケース

- ミッションクリティカルなシステム
- グローバルユーザーベース
- ほぼゼロのダウンタイムが必要な場合
- コストより可用性を優先

## 戦略選択フローチャート

```mermaid
flowchart TD
    Start["RTO要件は？"]
    Q1{"24時間以上<br/>許容？"}
    Q2{"数時間<br/>許容？"}
    Q3{"1時間以内<br/>必要？"}

    Q1 -->|Yes| BR["Backup/Restore"]
    Q1 -->|No| Q2
    Q2 -->|Yes| PL["Pilot Light"]
    Q2 -->|No| Q3
    Q3 -->|Yes| WS["Warm Standby"]
    Q3 -->|No| AA["Active-Active"]

    Start --> Q1

    style BR fill:#6b7280,color:#fff
    style PL fill:#3b82f6,color:#fff
    style WS fill:#f59e0b,color:#000
    style AA fill:#22c55e,color:#fff
```

## DR実装のベストプラクティス

### 自動化

```mermaid
flowchart LR
    subgraph Automation["自動化すべき項目"]
        Backup["バックアップ"]
        Replication["レプリケーション"]
        Failover["フェイルオーバー"]
        Testing["テスト"]
    end

    subgraph Tools["使用ツール"]
        AWSBackup["AWS Backup"]
        CloudFormation["CloudFormation"]
        Lambda["Lambda"]
        EventBridge["EventBridge"]
    end

    Backup --> AWSBackup
    Replication --> CloudFormation
    Failover --> Lambda
    Testing --> EventBridge

    style Automation fill:#3b82f6,color:#fff
    style Tools fill:#22c55e,color:#fff
```

### テスト

| テスト種類 | 頻度 | 内容 |
|-----------|------|------|
| バックアップ検証 | 週次 | リストアテスト |
| フェイルオーバー演習 | 月次 | 手順の確認 |
| 本番切り替えテスト | 四半期 | 実際のフェイルオーバー |
| カオスエンジニアリング | 継続的 | 障害注入テスト |

### ドキュメント化

必ず文書化すべき項目：
- RPO/RTO目標
- 復旧手順（ランブック）
- 連絡先リスト
- 責任者と承認フロー
- テスト結果の履歴

## まとめ

```mermaid
flowchart TB
    subgraph DRStrategy["DR戦略"]
        BR["Backup/Restore"]
        PL["Pilot Light"]
        WS["Warm Standby"]
        AA["Active-Active"]
    end

    BR --> |"低コスト"| LowCost["開発/テスト"]
    PL --> |"バランス"| Balance["一般業務"]
    WS --> |"高可用性"| HighAvail["重要システム"]
    AA --> |"最高可用性"| Critical["ミッションクリティカル"]

    style DRStrategy fill:#3b82f6,color:#fff
```

| 戦略 | RTO | RPO | コスト | 推奨用途 |
|------|-----|-----|--------|---------|
| Backup/Restore | 24h+ | 24h+ | $ | 開発環境 |
| Pilot Light | 数時間 | 分〜時間 | $$ | 一般業務 |
| Warm Standby | 分〜1時間 | 秒〜分 | $$$ | 重要業務 |
| Active-Active | 秒〜分 | ほぼ0 | $$$$ | 最重要システム |

適切なDR戦略の選択は、ビジネス要件、コスト、技術的複雑さのバランスに基づいて行います。定期的なテストと改善が、DR計画の成功の鍵です。

## 参考資料

- [Disaster Recovery on AWS](https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/)
- [AWS Backup User Guide](https://docs.aws.amazon.com/aws-backup/latest/devguide/)
- [Aurora Global Database](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-global-database.html)
