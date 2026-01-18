---
title: "AWSパフォーマンス設計：コンピュート、ストレージ、データベースの選択"
date: "2025-12-20"
excerpt: "AWSでのパフォーマンス最適化を徹底解説 - コンピュート、ストレージ、データベースの選択基準、キャッシング戦略、グローバル配信のベストプラクティスを紹介します。"
tags: ["AWS", "パフォーマンス", "アーキテクチャ", "Well-Architected", "最適化"]
author: "Shunku"
---

パフォーマンス効率は、AWS Well-Architected Frameworkの柱の1つです。ワークロードの要件に応じて適切なリソースを選択し、継続的に最適化することが重要です。

## パフォーマンス設計の原則

```mermaid
flowchart TB
    subgraph Principles["設計原則"]
        P1["先進技術の民主化"]
        P2["数分でグローバル展開"]
        P3["サーバーレスの活用"]
        P4["より頻繁な実験"]
        P5["機械的共感"]
    end

    style Principles fill:#3b82f6,color:#fff
```

## コンピュート選択

### 選択フローチャート

```mermaid
flowchart TD
    Start["ワークロードの特性は？"]
    Q1{"サーバーレスで<br/>対応可能？"}
    Q2{"コンテナ化<br/>されている？"}
    Q3{"特定のOS/<br/>カスタマイズ必要？"}

    Start --> Q1
    Q1 -->|Yes| Lambda["Lambda/Fargate"]
    Q1 -->|No| Q2
    Q2 -->|Yes| Container["ECS/EKS"]
    Q2 -->|No| Q3
    Q3 -->|Yes| EC2["EC2"]
    Q3 -->|No| Container

    style Lambda fill:#f59e0b,color:#000
    style Container fill:#8b5cf6,color:#fff
    style EC2 fill:#3b82f6,color:#fff
```

### EC2インスタンスファミリー

| ファミリー | 用途 | ユースケース |
|-----------|------|-------------|
| M | 汎用 | Webサーバー、アプリサーバー |
| C | コンピュート最適化 | バッチ処理、HPC |
| R | メモリ最適化 | インメモリDB、キャッシュ |
| I/D | ストレージ最適化 | データウェアハウス、分散FS |
| G/P | GPU | 機械学習、グラフィックス |
| T | バースト | 開発、小規模ワークロード |

### インスタンス選択のポイント

```mermaid
flowchart TB
    subgraph Selection["選択基準"]
        CPU["vCPU要件"]
        Memory["メモリ要件"]
        Network["ネットワーク要件"]
        Storage["ストレージ要件"]
    end

    CPU --> |"計算集約"| C["Cファミリー"]
    Memory --> |"メモリ集約"| R["Rファミリー"]
    Network --> |"高帯域"| NetworkOpt["拡張ネットワーキング"]
    Storage --> |"高IOPS"| StorageOpt["Nitro/NVMe"]

    style Selection fill:#22c55e,color:#fff
```

## ストレージ選択

### ストレージタイプ比較

```mermaid
flowchart TB
    subgraph Storage["ストレージオプション"]
        S3["S3<br/>オブジェクト"]
        EBS["EBS<br/>ブロック"]
        EFS["EFS<br/>ファイル"]
        FSx["FSx<br/>高性能ファイル"]
        Instance["インスタンスストア<br/>一時ストレージ"]
    end

    style Storage fill:#3b82f6,color:#fff
```

### EBSボリュームタイプ

| タイプ | IOPS | スループット | 用途 |
|--------|------|-------------|------|
| gp3 | 最大16,000 | 最大1,000MB/s | 汎用 |
| io2 | 最大256,000 | 最大4,000MB/s | 高IOPS |
| st1 | - | 最大500MB/s | スループット重視 |
| sc1 | - | 最大250MB/s | コールドデータ |

### ストレージ選択フロー

```mermaid
flowchart TD
    Q1{"アクセスパターンは？"}
    Q2{"高IOPSが必要？"}
    Q3{"共有アクセス？"}

    Q1 -->|ランダム| Q2
    Q1 -->|シーケンシャル| ST1["st1/sc1"]
    Q1 -->|オブジェクト| S3["S3"]

    Q2 -->|Yes| IO2["io2 Block Express"]
    Q2 -->|No| GP3["gp3"]

    Q3 -->|Yes| EFS["EFS/FSx"]
    Q3 -->|No| EBS["EBS"]

    style IO2 fill:#ef4444,color:#fff
    style GP3 fill:#22c55e,color:#fff
```

## データベース選択

### データベースタイプ

```mermaid
flowchart TB
    subgraph Databases["データベースオプション"]
        subgraph Relational["リレーショナル"]
            RDS["RDS"]
            Aurora["Aurora"]
        end

        subgraph NoSQL["NoSQL"]
            DynamoDB["DynamoDB"]
            DocumentDB["DocumentDB"]
            ElastiCache["ElastiCache"]
        end

        subgraph Analytics["分析"]
            Redshift["Redshift"]
            Neptune["Neptune"]
            Timestream["Timestream"]
        end
    end

    style Relational fill:#3b82f6,color:#fff
    style NoSQL fill:#22c55e,color:#fff
    style Analytics fill:#8b5cf6,color:#fff
```

### 選択基準

| 要件 | 推奨DB |
|------|--------|
| ACID、複雑なクエリ | Aurora/RDS |
| 高スケーラビリティ、Key-Value | DynamoDB |
| ドキュメント、MongoDB互換 | DocumentDB |
| キャッシュ、セッション | ElastiCache |
| 分析、OLAP | Redshift |
| グラフデータ | Neptune |
| 時系列データ | Timestream |

### リードレプリカの活用

```mermaid
flowchart TB
    subgraph ReadScale["読み取りスケーリング"]
        Master["マスター<br/>（書き込み）"]
        Replica1["レプリカ1<br/>（読み取り）"]
        Replica2["レプリカ2<br/>（読み取り）"]
    end

    App["アプリケーション"]
    App --> |"書き込み"| Master
    App --> |"読み取り"| Replica1
    App --> |"読み取り"| Replica2

    style Master fill:#3b82f6,color:#fff
    style Replica1 fill:#22c55e,color:#fff
    style Replica2 fill:#22c55e,color:#fff
```

## キャッシング戦略

### キャッシュレイヤー

```mermaid
flowchart LR
    subgraph Caching["キャッシュレイヤー"]
        Client["クライアント<br/>キャッシュ"]
        CDN["CloudFront<br/>エッジキャッシュ"]
        App["ElastiCache<br/>アプリキャッシュ"]
        DB["DAX<br/>DBキャッシュ"]
    end

    User["ユーザー"] --> Client
    Client --> CDN
    CDN --> App
    App --> DB

    style Caching fill:#f59e0b,color:#000
```

### キャッシュパターン

| パターン | 説明 | 用途 |
|---------|------|------|
| Lazy Loading | 読み取り時にキャッシュ | 汎用 |
| Write Through | 書き込み時にキャッシュ更新 | 一貫性重視 |
| TTL | 有効期限でキャッシュ削除 | 汎用 |
| Cache Aside | アプリがキャッシュ管理 | 柔軟性 |

### ElastiCacheの選択

| 機能 | Redis | Memcached |
|------|-------|-----------|
| データ構造 | 豊富 | シンプル |
| レプリケーション | ✅ | ❌ |
| クラスター | ✅ | ✅ |
| 永続化 | ✅ | ❌ |
| Pub/Sub | ✅ | ❌ |

## グローバル配信

### CloudFront

```mermaid
flowchart TB
    subgraph Global["グローバル配信"]
        Users["世界中のユーザー"]
        Edge["エッジロケーション"]
        Origin["オリジン"]
    end

    Users --> |"最寄りエッジ"| Edge
    Edge --> |"キャッシュミス"| Origin

    style Edge fill:#f59e0b,color:#000
```

### Lambda@Edge

| 場所 | 用途 |
|------|------|
| Viewer Request | 認証、URL書き換え |
| Origin Request | オリジン選択 |
| Origin Response | ヘッダー追加 |
| Viewer Response | 最終レスポンス加工 |

## モニタリングと最適化

### パフォーマンスメトリクス

```mermaid
flowchart TB
    subgraph Monitoring["モニタリング"]
        CW["CloudWatch"]
        XRay["X-Ray"]
        Insights["Container Insights"]
    end

    CW --> |"メトリクス"| Analysis["分析"]
    XRay --> |"トレース"| Bottleneck["ボトルネック特定"]
    Insights --> |"コンテナ"| Container["コンテナ分析"]

    style Monitoring fill:#3b82f6,color:#fff
```

### 主要メトリクス

| レイヤー | メトリクス |
|---------|----------|
| コンピュート | CPU使用率、メモリ使用率 |
| ストレージ | IOPS、スループット、レイテンシー |
| データベース | 接続数、クエリ時間、キャッシュヒット率 |
| ネットワーク | 帯域幅、レイテンシー |

## ベストプラクティス

### 設計チェックリスト

```mermaid
flowchart TB
    subgraph Checklist["チェックリスト"]
        C1["適切なインスタンスタイプ選択"]
        C2["ストレージ要件の明確化"]
        C3["キャッシュ戦略の実装"]
        C4["グローバル配信の検討"]
        C5["継続的なモニタリング"]
    end

    style Checklist fill:#22c55e,color:#fff
```

### アンチパターン

| アンチパターン | 推奨 |
|--------------|------|
| オーバープロビジョニング | 適正サイズ化 |
| 単一インスタンス依存 | 分散アーキテクチャ |
| キャッシュなし | 適切なキャッシュレイヤー |
| モニタリング不足 | 継続的な監視と最適化 |

## まとめ

```mermaid
flowchart TB
    subgraph Performance["パフォーマンス設計"]
        Compute["コンピュート選択"]
        Storage["ストレージ選択"]
        Database["データベース選択"]
        Caching["キャッシング"]
        Global["グローバル配信"]
    end

    Compute --> Right["適正サイズ"]
    Storage --> IOPS["要件に合ったタイプ"]
    Database --> Scale["スケーラブルな選択"]
    Caching --> Latency["低レイテンシー"]
    Global --> Edge["エッジ配信"]

    style Performance fill:#3b82f6,color:#fff
```

| カテゴリ | ポイント |
|---------|---------|
| コンピュート | ワークロードに適したファミリー |
| ストレージ | アクセスパターンに合ったタイプ |
| データベース | データモデルに適したエンジン |
| キャッシング | 複数レイヤーでのキャッシュ |
| グローバル | エッジロケーションの活用 |

適切なリソース選択と継続的な最適化により、コスト効率の高いパフォーマンスを実現できます。

## 参考資料

- [AWS Well-Architected Framework - Performance Efficiency](https://docs.aws.amazon.com/wellarchitected/latest/performance-efficiency-pillar/)
- [Amazon EC2 Instance Types](https://aws.amazon.com/ec2/instance-types/)
- [Amazon EBS Volume Types](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ebs-volume-types.html)
