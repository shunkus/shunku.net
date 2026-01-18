---
title: "AWSデータ転送サービス完全ガイド：DataSync、Transfer Family、Snow Family"
date: "2025-12-16"
excerpt: "AWSへのデータ転送サービスを徹底比較 - DataSync、Transfer Family、Snow Family、Storage Gatewayの選択基準と使い分けを解説します。"
tags: ["AWS", "Data Transfer", "DataSync", "Snow Family", "Migration"]
author: "Shunku"
---

オンプレミスからAWSへのデータ移行には、ネットワーク帯域、データ量、セキュリティ要件に応じた適切なサービスの選択が重要です。AWSは多様なデータ転送サービスを提供しています。

## データ転送方法の概要

### オンライン vs オフライン

```mermaid
flowchart TB
    subgraph Online["オンライン転送"]
        DataSync["AWS DataSync"]
        TransferFamily["Transfer Family"]
        StorageGateway["Storage Gateway"]
        S3Transfer["S3 Transfer Acceleration"]
    end

    subgraph Offline["オフライン転送"]
        Snowcone["Snowcone"]
        Snowball["Snowball Edge"]
        Snowmobile["Snowmobile"]
    end

    style Online fill:#3b82f6,color:#fff
    style Offline fill:#22c55e,color:#fff
```

### 選択の目安

| データ量 | ネットワーク | 推奨サービス |
|---------|------------|-------------|
| 〜10TB | 良好 | DataSync |
| 〜10TB | 制限あり | Snowcone |
| 10TB〜80TB | 制限あり | Snowball Edge |
| 80TB〜 | 制限あり | 複数Snowball |
| PB規模 | 制限あり | Snowmobile |

## AWS DataSync

### 概要

オンプレミスとAWS間、またはAWSサービス間でデータを高速に転送します。

```mermaid
flowchart LR
    subgraph OnPrem["オンプレミス"]
        NFS["NFSサーバー"]
        SMB["SMBサーバー"]
        Agent["DataSync Agent"]
    end

    subgraph AWS["AWS"]
        S3["S3"]
        EFS["EFS"]
        FSx["FSx"]
    end

    NFS --> Agent
    SMB --> Agent
    Agent --> |"TLS暗号化<br/>自動圧縮"| S3
    Agent --> EFS
    Agent --> FSx

    style Agent fill:#f59e0b,color:#000
```

### 特徴

| 機能 | 説明 |
|------|------|
| 高速転送 | ネットワーク帯域を最大限活用 |
| 自動検証 | データ整合性を自動チェック |
| スケジューリング | 定期的な同期が可能 |
| 暗号化 | 転送中の暗号化 |
| フィルタリング | パターンマッチで選択転送 |

### 対応ストレージ

**ソース:**
- NFS
- SMB
- HDFS
- オブジェクトストレージ（S3互換）
- AWS（S3、EFS、FSx）

**デスティネーション:**
- Amazon S3（全ストレージクラス）
- Amazon EFS
- Amazon FSx（Windows、Lustre、OpenZFS、NetApp）

### 設定例

```bash
# エージェントの作成（オンプレミスにデプロイ）
aws datasync create-agent \
    --agent-name my-agent \
    --activation-key XXXXX-XXXXX-XXXXX-XXXXX

# ソースロケーションの作成
aws datasync create-location-nfs \
    --server-hostname nfs.example.com \
    --subdirectory /exports/data \
    --on-prem-config AgentArns=arn:aws:datasync:ap-northeast-1:xxx:agent/xxx

# デスティネーションロケーションの作成
aws datasync create-location-s3 \
    --s3-bucket-arn arn:aws:s3:::my-bucket \
    --s3-config BucketAccessRoleArn=arn:aws:iam::xxx:role/DataSyncRole

# タスクの作成と実行
aws datasync create-task \
    --source-location-arn arn:aws:datasync:ap-northeast-1:xxx:location/xxx \
    --destination-location-arn arn:aws:datasync:ap-northeast-1:xxx:location/xxx \
    --options VerifyMode=POINT_IN_TIME_CONSISTENT,TransferMode=ALL
```

## AWS Transfer Family

### 概要

SFTP、FTPS、FTPプロトコルでS3やEFSにファイル転送するマネージドサービスです。

```mermaid
flowchart LR
    subgraph Clients["クライアント"]
        SFTP["SFTPクライアント"]
        FTPS["FTPSクライアント"]
        FTP["FTPクライアント"]
        AS2["AS2"]
    end

    subgraph TransferFamily["Transfer Family"]
        Server["マネージドサーバー"]
    end

    subgraph Storage["ストレージ"]
        S3["S3"]
        EFS["EFS"]
    end

    SFTP --> Server
    FTPS --> Server
    FTP --> Server
    AS2 --> Server
    Server --> S3
    Server --> EFS

    style TransferFamily fill:#f59e0b,color:#000
```

### プロトコル比較

| プロトコル | 暗号化 | ポート | ユースケース |
|-----------|--------|-------|-------------|
| SFTP | SSH | 22 | セキュアな転送（推奨） |
| FTPS | TLS | 21, 990 | レガシーシステム連携 |
| FTP | なし | 21 | 内部ネットワークのみ |
| AS2 | S/MIME | 443 | B2B EDI |

### 認証オプション

| 認証方式 | 説明 |
|---------|------|
| サービス管理 | Transfer Familyで管理 |
| AWS Directory Service | AD認証 |
| カスタム | Lambda + API Gateway |

### 設定例

```bash
# SFTPサーバーの作成
aws transfer create-server \
    --endpoint-type PUBLIC \
    --protocols SFTP \
    --identity-provider-type SERVICE_MANAGED

# ユーザーの作成
aws transfer create-user \
    --server-id s-xxx \
    --user-name myuser \
    --role arn:aws:iam::xxx:role/TransferRole \
    --home-directory /my-bucket/home/myuser \
    --ssh-public-key-body "ssh-rsa AAAA..."
```

## Snow Family

### デバイス比較

```mermaid
flowchart TB
    subgraph SnowFamily["Snow Family"]
        subgraph Snowcone["Snowcone"]
            SC["8TB HDD<br/>または 14TB SSD<br/>ポータブル"]
        end

        subgraph Snowball["Snowball Edge"]
            SBS["Storage Optimized<br/>80TB"]
            SBC["Compute Optimized<br/>42TB + GPU"]
        end

        subgraph Snowmobile["Snowmobile"]
            SM["100PBまで<br/>トラック輸送"]
        end
    end

    style Snowcone fill:#3b82f6,color:#fff
    style Snowball fill:#22c55e,color:#fff
    style Snowmobile fill:#8b5cf6,color:#fff
```

### 詳細比較

| 項目 | Snowcone | Snowball Edge Storage | Snowball Edge Compute |
|------|----------|----------------------|----------------------|
| ストレージ | 8TB HDD / 14TB SSD | 80TB | 42TB |
| コンピュート | なし | EC2互換 | EC2互換 + GPU |
| 重量 | 2.1kg | 22.3kg | 22.3kg |
| 用途 | 小規模/エッジ | 大規模転送 | エッジコンピューティング |
| 配送 | 通常配送 | 専用配送 | 専用配送 |

### ユースケース

```mermaid
flowchart TD
    Q1{"データ量は？"}
    Q2{"エッジコンピュート<br/>が必要？"}
    Q3{"PB規模？"}

    Q1 -->|〜14TB| Snowcone["Snowcone"]
    Q1 -->|〜80TB| Q2
    Q1 -->|80TB+| Q3

    Q2 -->|Yes| Compute["Snowball Edge<br/>Compute"]
    Q2 -->|No| Storage["Snowball Edge<br/>Storage"]

    Q3 -->|Yes| Snowmobile["Snowmobile"]
    Q3 -->|No| Multiple["複数Snowball"]

    style Snowcone fill:#3b82f6,color:#fff
    style Storage fill:#22c55e,color:#fff
    style Compute fill:#f59e0b,color:#000
    style Snowmobile fill:#8b5cf6,color:#fff
```

### Snowball Edgeの使用フロー

```mermaid
flowchart LR
    Order["1. 注文"] --> Ship1["2. 配送"]
    Ship1 --> Connect["3. 接続"]
    Connect --> Transfer["4. データ転送"]
    Transfer --> Ship2["5. 返送"]
    Ship2 --> Import["6. S3インポート"]

    style Order fill:#3b82f6,color:#fff
    style Import fill:#22c55e,color:#fff
```

### コマンド例

```bash
# Snowball Edgeへの接続
snowballEdge configure

# S3バケットとして使用
aws s3 ls --endpoint http://192.168.1.100:8080

# データのコピー
aws s3 cp /local/data s3://my-bucket/ \
    --recursive \
    --endpoint http://192.168.1.100:8080
```

## AWS Storage Gateway

### 概要

オンプレミスからAWSストレージへのハイブリッドアクセスを提供します。

```mermaid
flowchart TB
    subgraph OnPrem["オンプレミス"]
        App["アプリケーション"]
        Gateway["Storage Gateway"]
        Cache["ローカルキャッシュ"]
    end

    subgraph AWS["AWS"]
        S3["S3"]
        Glacier["S3 Glacier"]
        EBS["EBS Snapshot"]
    end

    App --> Gateway
    Gateway --> Cache
    Gateway --> S3
    Gateway --> Glacier
    Gateway --> EBS

    style Gateway fill:#f59e0b,color:#000
```

### ゲートウェイタイプ

| タイプ | プロトコル | バックエンド | ユースケース |
|--------|-----------|-------------|-------------|
| S3 File Gateway | NFS/SMB | S3 | ファイル共有 |
| FSx File Gateway | SMB | FSx for Windows | Windows環境 |
| Volume Gateway | iSCSI | S3 + EBS | ブロックストレージ |
| Tape Gateway | iSCSI VTL | S3 Glacier | バックアップ |

### Volume Gatewayのモード

```mermaid
flowchart TB
    subgraph Cached["キャッシュモード"]
        C1["プライマリ: S3"]
        C2["ローカル: キャッシュのみ"]
    end

    subgraph Stored["保存モード"]
        S1["プライマリ: ローカル"]
        S2["バックアップ: S3"]
    end

    style Cached fill:#3b82f6,color:#fff
    style Stored fill:#22c55e,color:#fff
```

| モード | ローカル | 用途 |
|--------|---------|------|
| キャッシュ | 頻繁にアクセスするデータ | 大容量データ |
| 保存 | 全データ | 低レイテンシー要件 |

## S3 Transfer Acceleration

### 概要

CloudFrontエッジロケーションを使用してS3への転送を高速化します。

```mermaid
flowchart LR
    subgraph Client["クライアント"]
        App["アプリケーション"]
    end

    subgraph Edge["エッジロケーション"]
        CF["CloudFront"]
    end

    subgraph AWS["AWSリージョン"]
        S3["S3バケット"]
    end

    App --> |"最寄りエッジへ"| CF
    CF --> |"AWSバックボーン"| S3

    style Edge fill:#f59e0b,color:#000
```

### 有効化

```bash
# Transfer Accelerationの有効化
aws s3api put-bucket-accelerate-configuration \
    --bucket my-bucket \
    --accelerate-configuration Status=Enabled

# 転送（Accelerateエンドポイント使用）
aws s3 cp large-file.zip s3://my-bucket/ \
    --endpoint-url https://my-bucket.s3-accelerate.amazonaws.com
```

## 選択フローチャート

```mermaid
flowchart TD
    Start["データ転送が必要"]
    Q1{"オンライン転送<br/>可能？"}
    Q2{"ファイル転送<br/>プロトコル？"}
    Q3{"継続的な<br/>同期？"}
    Q4{"データ量は？"}

    Start --> Q1
    Q1 -->|No| Q4
    Q1 -->|Yes| Q2

    Q2 -->|SFTP/FTP| Transfer["Transfer Family"]
    Q2 -->|NFS/SMB| Q3

    Q3 -->|Yes| DataSync["DataSync"]
    Q3 -->|No/ハイブリッド| StorageGW["Storage Gateway"]

    Q4 -->|〜14TB| Snowcone["Snowcone"]
    Q4 -->|〜80TB| Snowball["Snowball Edge"]
    Q4 -->|PB| Snowmobile["Snowmobile"]

    style Transfer fill:#3b82f6,color:#fff
    style DataSync fill:#22c55e,color:#fff
    style StorageGW fill:#f59e0b,color:#000
    style Snowcone fill:#8b5cf6,color:#fff
    style Snowball fill:#8b5cf6,color:#fff
    style Snowmobile fill:#8b5cf6,color:#fff
```

## コスト比較

### オンライン転送

| サービス | 料金体系 |
|---------|---------|
| DataSync | GB単位の転送料金 |
| Transfer Family | 時間 + GB転送 |
| Storage Gateway | 時間 + GB転送 + リクエスト |
| S3 Transfer Acceleration | GB転送（通常より高い） |

### オフライン転送

| デバイス | 料金 |
|---------|------|
| Snowcone | デバイス日額 + データ転送 |
| Snowball Edge | ジョブ単位 + 日額 |
| Snowmobile | 個別見積もり |

## ベストプラクティス

### データ転送の計画

```mermaid
flowchart TB
    subgraph Planning["計画のポイント"]
        P1["データ量の見積もり"]
        P2["ネットワーク帯域の確認"]
        P3["転送時間の計算"]
        P4["コスト比較"]
    end

    style Planning fill:#22c55e,color:#fff
```

### 転送時間の計算

```
転送時間 = データ量 / 実効帯域幅

例: 100TB / 1Gbps (実効80%)
= 100TB / 100MB/s
= 1,000,000秒
≒ 12日
```

## まとめ

```mermaid
flowchart TB
    subgraph Services["データ転送サービス"]
        Online["オンライン"]
        Offline["オフライン"]
    end

    Online --> DataSync["DataSync<br/>（同期）"]
    Online --> Transfer["Transfer Family<br/>（SFTP/FTP）"]
    Online --> Gateway["Storage Gateway<br/>（ハイブリッド）"]
    Offline --> Snow["Snow Family<br/>（大容量）"]

    style Services fill:#3b82f6,color:#fff
```

| サービス | 主なユースケース | 推奨度 |
|---------|----------------|--------|
| DataSync | ストレージ移行/同期 | ★★★ |
| Transfer Family | SFTP/FTP連携 | ★★☆ |
| Storage Gateway | ハイブリッド運用 | ★★☆ |
| Snow Family | 大容量オフライン転送 | ★★★ |

適切なデータ転送サービスの選択により、コストと時間を最適化しながら確実にデータを移行できます。

## 参考資料

- [AWS DataSync User Guide](https://docs.aws.amazon.com/datasync/latest/userguide/)
- [AWS Transfer Family User Guide](https://docs.aws.amazon.com/transfer/latest/userguide/)
- [AWS Snow Family User Guide](https://docs.aws.amazon.com/snowball/latest/ug/)
- [AWS Storage Gateway User Guide](https://docs.aws.amazon.com/storagegateway/latest/userguide/)
