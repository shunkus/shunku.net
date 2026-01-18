---
title: "AWSデータ複製戦略：RDS、Aurora、S3、DynamoDBのレプリケーション"
date: "2025-12-14"
excerpt: "AWSの各種データストアのレプリケーションを徹底解説 - RDS Multi-AZ、Aurora Global Database、S3クロスリージョンレプリケーション、DynamoDB Global Tablesの設計と使い分けを紹介します。"
tags: ["AWS", "Replication", "RDS", "Aurora", "S3", "DynamoDB"]
author: "Shunku"
---

データの可用性と耐久性を確保するために、AWSは各種データストアにレプリケーション機能を提供しています。ユースケースに応じて適切なレプリケーション戦略を選択することが重要です。

## レプリケーションの種類

### 同期 vs 非同期

```mermaid
flowchart TB
    subgraph Sync["同期レプリケーション"]
        S1["書き込み"]
        S2["プライマリ"]
        S3["レプリカ"]
        S4["確認応答"]

        S1 --> S2
        S2 --> S3
        S3 --> S4
    end

    subgraph Async["非同期レプリケーション"]
        A1["書き込み"]
        A2["プライマリ"]
        A3["確認応答"]
        A4["レプリカ"]

        A1 --> A2
        A2 --> A3
        A2 -.-> A4
    end

    style Sync fill:#22c55e,color:#fff
    style Async fill:#f59e0b,color:#000
```

| 特性 | 同期 | 非同期 |
|------|------|--------|
| データ一貫性 | 強い | 結果整合性 |
| レイテンシー | 高い | 低い |
| 可用性への影響 | あり | 少ない |
| 距離 | 近距離向け | 遠距離可能 |

## RDSのレプリケーション

### Multi-AZ配置

```mermaid
flowchart TB
    subgraph VPC["VPC"]
        subgraph AZ1["AZ-a"]
            Primary["プライマリDB"]
        end

        subgraph AZ2["AZ-b"]
            Standby["スタンバイDB"]
        end
    end

    Primary --> |"同期レプリケーション"| Standby
    App["アプリケーション"] --> |"エンドポイント"| Primary
    App -.-> |"フェイルオーバー時"| Standby

    style AZ1 fill:#3b82f6,color:#fff
    style AZ2 fill:#22c55e,color:#fff
```

特徴：
- **同期レプリケーション**: データ損失なし
- **自動フェイルオーバー**: 60-120秒
- **単一エンドポイント**: アプリケーション変更不要

### リードレプリカ

```mermaid
flowchart TB
    subgraph Primary["プライマリリージョン"]
        Master["マスターDB"]
    end

    subgraph SameRegion["同一リージョン"]
        RR1["リードレプリカ1"]
        RR2["リードレプリカ2"]
    end

    subgraph CrossRegion["クロスリージョン"]
        RR3["リードレプリカ3"]
    end

    Master --> |"非同期"| RR1
    Master --> |"非同期"| RR2
    Master --> |"非同期"| RR3

    App["アプリ"] --> |"書き込み"| Master
    App --> |"読み取り"| RR1
    App --> |"読み取り"| RR2

    style Primary fill:#3b82f6,color:#fff
    style SameRegion fill:#22c55e,color:#fff
    style CrossRegion fill:#8b5cf6,color:#fff
```

| 用途 | 説明 |
|------|------|
| 読み取りスケーリング | 読み取り負荷の分散 |
| DR | クロスリージョンのバックアップ |
| 移行 | 昇格によるカットオーバー |

### 設定例

```bash
# Multi-AZ有効化
aws rds modify-db-instance \
    --db-instance-identifier mydb \
    --multi-az \
    --apply-immediately

# リードレプリカ作成（クロスリージョン）
aws rds create-db-instance-read-replica \
    --db-instance-identifier mydb-replica \
    --source-db-instance-identifier arn:aws:rds:ap-northeast-1:xxx:db:mydb \
    --region us-west-2
```

## Auroraのレプリケーション

### Aurora レプリカ

```mermaid
flowchart TB
    subgraph AuroraCluster["Aurora クラスター"]
        subgraph Storage["共有ストレージ"]
            Vol["クラスターボリューム<br/>（3AZに6コピー）"]
        end

        Writer["ライターインスタンス"]
        Reader1["リーダーインスタンス1"]
        Reader2["リーダーインスタンス2"]

        Writer --> Vol
        Reader1 --> Vol
        Reader2 --> Vol
    end

    style Storage fill:#f59e0b,color:#000
```

特徴：
- **最大15リーダー**: 高い読み取りスケーラビリティ
- **ミリ秒単位のレプリカラグ**: 共有ストレージのため
- **自動フェイルオーバー**: 30秒以内

### Aurora Global Database

```mermaid
flowchart TB
    subgraph Primary["プライマリリージョン"]
        PCluster["プライマリクラスター"]
        PStorage["ストレージ"]
    end

    subgraph Secondary1["セカンダリリージョン1"]
        SCluster1["セカンダリクラスター"]
        SStorage1["ストレージ"]
    end

    subgraph Secondary2["セカンダリリージョン2"]
        SCluster2["セカンダリクラスター"]
        SStorage2["ストレージ"]
    end

    PStorage --> |"ストレージレベル<br/>レプリケーション<br/>（< 1秒）"| SStorage1
    PStorage --> |"ストレージレベル<br/>レプリケーション"| SStorage2

    style Primary fill:#3b82f6,color:#fff
    style Secondary1 fill:#22c55e,color:#fff
    style Secondary2 fill:#8b5cf6,color:#fff
```

| 特徴 | 詳細 |
|------|------|
| レプリケーションラグ | 通常1秒未満 |
| セカンダリリージョン | 最大5リージョン |
| フェイルオーバー | 計画的: 分単位、非計画: RPO 1秒 |
| ユースケース | グローバルDR、低レイテンシー読み取り |

### 設定例

```bash
# Global Databaseの作成
aws rds create-global-cluster \
    --global-cluster-identifier my-global-db \
    --source-db-cluster-identifier my-primary-cluster \
    --region ap-northeast-1

# セカンダリリージョンにクラスターを追加
aws rds create-db-cluster \
    --db-cluster-identifier my-secondary-cluster \
    --global-cluster-identifier my-global-db \
    --engine aurora-mysql \
    --region us-west-2

# 計画的フェイルオーバー
aws rds failover-global-cluster \
    --global-cluster-identifier my-global-db \
    --target-db-cluster-identifier arn:aws:rds:us-west-2:xxx:cluster:my-secondary-cluster
```

## S3のレプリケーション

### レプリケーションの種類

```mermaid
flowchart TB
    subgraph Types["S3レプリケーション"]
        SRR["Same-Region<br/>Replication (SRR)"]
        CRR["Cross-Region<br/>Replication (CRR)"]
    end

    SRR --> |"同一リージョン"| Compliance["コンプライアンス<br/>ログ集約"]
    CRR --> |"クロスリージョン"| DR["DR<br/>レイテンシー低減"]

    style SRR fill:#3b82f6,color:#fff
    style CRR fill:#22c55e,color:#fff
```

### レプリケーションルール

```json
{
  "Rules": [
    {
      "ID": "ReplicateAll",
      "Status": "Enabled",
      "Priority": 1,
      "Filter": {},
      "Destination": {
        "Bucket": "arn:aws:s3:::destination-bucket",
        "ReplicationTime": {
          "Status": "Enabled",
          "Time": {"Minutes": 15}
        },
        "Metrics": {
          "Status": "Enabled",
          "EventThreshold": {"Minutes": 15}
        }
      },
      "DeleteMarkerReplication": {"Status": "Enabled"}
    }
  ]
}
```

### S3 Replication Time Control (RTC)

```mermaid
flowchart LR
    subgraph Source["ソースバケット"]
        Object["オブジェクト"]
    end

    subgraph RTC["Replication Time Control"]
        SLA["99.99%のオブジェクトを<br/>15分以内にレプリケート"]
    end

    subgraph Dest["宛先バケット"]
        Replica["レプリカ"]
    end

    Object --> RTC
    RTC --> Replica

    style RTC fill:#f59e0b,color:#000
```

### バッチレプリケーション

既存オブジェクトのレプリケーション：

```bash
# S3 Batch Replicationジョブの作成
aws s3control create-job \
    --account-id 123456789012 \
    --operation '{"S3ReplicateObject":{}}' \
    --manifest '{"Spec":{"Format":"S3BatchOperations_CSV_20180820","Fields":["Bucket","Key"]},"Location":{"ObjectArn":"arn:aws:s3:::manifest-bucket/manifest.csv","ETag":"xxx"}}' \
    --report '{"Bucket":"arn:aws:s3:::report-bucket","Format":"Report_CSV_20180820","Enabled":true,"Prefix":"reports/"}' \
    --priority 10 \
    --role-arn arn:aws:iam::123456789012:role/S3BatchRole
```

## DynamoDBのレプリケーション

### DynamoDB Global Tables

```mermaid
flowchart TB
    subgraph Tokyo["東京"]
        Table1["テーブル"]
        App1["アプリ"]
    end

    subgraph Singapore["シンガポール"]
        Table2["テーブル"]
        App2["アプリ"]
    end

    subgraph Virginia["バージニア"]
        Table3["テーブル"]
        App3["アプリ"]
    end

    Table1 <--> |"双方向レプリケーション"| Table2
    Table2 <--> |"双方向レプリケーション"| Table3
    Table1 <--> Table3

    App1 --> |"読み書き"| Table1
    App2 --> |"読み書き"| Table2
    App3 --> |"読み書き"| Table3

    style Tokyo fill:#3b82f6,color:#fff
    style Singapore fill:#22c55e,color:#fff
    style Virginia fill:#8b5cf6,color:#fff
```

特徴：
- **アクティブ-アクティブ**: 全リージョンで読み書き可能
- **結果整合性**: 通常1秒未満で伝播
- **競合解決**: 最後の書き込みが優先
- **自動**: 追加設定なしでフェイルオーバー

### 設定例

```bash
# Global Tableの作成（既存テーブルにレプリカ追加）
aws dynamodb update-table \
    --table-name MyTable \
    --replica-updates \
        Create={RegionName=us-west-2} \
        Create={RegionName=eu-west-1}

# レプリカの確認
aws dynamodb describe-table --table-name MyTable \
    --query "Table.Replicas"
```

### DynamoDB Streams

変更データキャプチャ：

```mermaid
flowchart LR
    subgraph DynamoDB["DynamoDB"]
        Table["テーブル"]
        Stream["DynamoDB Streams"]
    end

    subgraph Consumers["コンシューマー"]
        Lambda["Lambda"]
        KCL["Kinesis Client<br/>Library"]
    end

    Table --> |"変更イベント"| Stream
    Stream --> Lambda
    Stream --> KCL

    style DynamoDB fill:#3b82f6,color:#fff
```

## レプリケーション戦略の選択

### 選択フローチャート

```mermaid
flowchart TD
    Q1{"データストアの種類は？"}
    Q2{"リレーショナル？"}
    Q3{"グローバル分散<br/>が必要？"}
    Q4{"Multi-AZ<br/>で十分？"}

    Q1 -->|RDB| Q2
    Q1 -->|NoSQL| DynamoDB["DynamoDB<br/>Global Tables"]
    Q1 -->|オブジェクト| S3["S3 CRR/SRR"]

    Q2 -->|Yes| Q3
    Q3 -->|Yes| Aurora["Aurora<br/>Global Database"]
    Q3 -->|No| Q4
    Q4 -->|Yes| MultiAZ["RDS Multi-AZ"]
    Q4 -->|No| ReadReplica["RDS<br/>リードレプリカ"]

    style Aurora fill:#22c55e,color:#fff
    style DynamoDB fill:#f59e0b,color:#000
    style S3 fill:#3b82f6,color:#fff
```

### 比較表

| サービス | レプリケーション | ラグ | フェイルオーバー |
|---------|----------------|------|----------------|
| RDS Multi-AZ | 同期 | 0 | 60-120秒 |
| RDS リードレプリカ | 非同期 | 秒〜分 | 手動昇格 |
| Aurora レプリカ | 同期（ストレージ） | ミリ秒 | 30秒以内 |
| Aurora Global | 非同期 | < 1秒 | 分単位 |
| S3 CRR | 非同期 | 分〜時間 | N/A |
| S3 RTC | 非同期（SLA付き） | 15分以内 | N/A |
| DynamoDB Global | 非同期 | < 1秒 | 自動 |

## ベストプラクティス

### RDS/Aurora

```mermaid
flowchart TB
    subgraph Best["Best Practices"]
        B1["本番は必ずMulti-AZ"]
        B2["読み取りスケーリングにリードレプリカ"]
        B3["DRにはAurora Global Database"]
        B4["定期的なフェイルオーバーテスト"]
    end

    style Best fill:#22c55e,color:#fff
```

### S3

| 項目 | 推奨 |
|------|------|
| バージョニング | 必須（レプリケーション要件） |
| 暗号化 | ソースと宛先で一貫性を保つ |
| RTCの使用 | RPO要件がある場合 |
| 監視 | レプリケーションメトリクスを監視 |

### DynamoDB

| 項目 | 推奨 |
|------|------|
| キー設計 | ホットパーティションを避ける |
| 競合 | 最終書き込み優先を理解 |
| コスト | レプリカリージョンの書き込みも課金 |

## まとめ

```mermaid
flowchart TB
    subgraph Replication["データレプリケーション"]
        RDS["RDS/Aurora"]
        S3["S3"]
        DDB["DynamoDB"]
    end

    RDS --> |"HA"| MultiAZ["Multi-AZ"]
    RDS --> |"スケール/DR"| Replica["リードレプリカ/<br/>Global Database"]
    S3 --> |"DR/コンプライアンス"| CRR["CRR/SRR"]
    DDB --> |"グローバル"| GlobalTables["Global Tables"]

    style Replication fill:#3b82f6,color:#fff
```

| 要件 | 推奨ソリューション |
|------|------------------|
| RDBの高可用性 | RDS Multi-AZ |
| RDBの読み取りスケール | リードレプリカ |
| グローバルRDB DR | Aurora Global Database |
| オブジェクトDR | S3 CRR |
| グローバルNoSQL | DynamoDB Global Tables |

適切なレプリケーション戦略により、データの可用性、耐久性、パフォーマンスを最適化できます。

## 参考資料

- [Amazon RDS Multi-AZ Deployments](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html)
- [Aurora Global Database](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-global-database.html)
- [S3 Replication](https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html)
- [DynamoDB Global Tables](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GlobalTables.html)
