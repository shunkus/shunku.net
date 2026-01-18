---
title: "AWS Direct Connect完全ガイド：専用線接続と冗長性設計"
date: "2025-12-09"
excerpt: "AWS Direct Connectによるオンプレミス接続を徹底解説 - 専用接続、ホスト接続、VIF、Direct Connect Gateway、冗長性設計のベストプラクティスを紹介します。"
tags: ["AWS", "Direct Connect", "Networking", "Hybrid Cloud", "Dedicated Line"]
author: "Shunku"
---

AWS Direct Connectは、オンプレミス環境とAWSを専用線で接続するサービスです。インターネット経由のVPN接続と比較して、一貫した低レイテンシーと高帯域幅を提供します。

## なぜDirect Connectが必要か

### VPN vs Direct Connect

```mermaid
flowchart TB
    subgraph VPN["VPN接続"]
        V1["インターネット経由"]
        V2["帯域幅が変動"]
        V3["レイテンシーが不安定"]
        V4["低コスト"]
    end

    subgraph DX["Direct Connect"]
        D1["専用線経由"]
        D2["一貫した帯域幅"]
        D3["安定したレイテンシー"]
        D4["高コスト"]
    end

    style VPN fill:#f59e0b,color:#000
    style DX fill:#3b82f6,color:#fff
```

### 選択基準

| 要件 | VPN | Direct Connect |
|------|-----|----------------|
| 大量データ転送 | △ | ◎ |
| リアルタイム処理 | △ | ◎ |
| コスト優先 | ◎ | △ |
| 導入スピード | ◎ | △ |
| SLA要件 | △ | ◎ |

## Direct Connectの接続タイプ

### 3つの接続オプション

```mermaid
flowchart TB
    subgraph Types["接続タイプ"]
        Dedicated["専用接続<br/>Dedicated Connection"]
        Hosted["ホスト接続<br/>Hosted Connection"]
        HostedVIF["ホストVIF<br/>Hosted VIF"]
    end

    Dedicated --> |"1Gbps / 10Gbps / 100Gbps"| Customer1["顧客が直接契約"]
    Hosted --> |"50Mbps〜10Gbps"| Partner1["パートナー経由"]
    HostedVIF --> |"パートナーのVIF"| Partner2["パートナー経由"]

    style Dedicated fill:#3b82f6,color:#fff
    style Hosted fill:#22c55e,color:#fff
    style HostedVIF fill:#8b5cf6,color:#fff
```

### 専用接続（Dedicated Connection）

| 特徴 | 詳細 |
|------|------|
| 帯域幅 | 1Gbps、10Gbps、100Gbps |
| 契約 | 顧客がAWSと直接契約 |
| 物理ポート | 専用ポートを占有 |
| VIF数 | 最大50 VIF（プライベート/パブリック/トランジット） |

### ホスト接続（Hosted Connection）

| 特徴 | 詳細 |
|------|------|
| 帯域幅 | 50Mbps〜10Gbps |
| 契約 | APNパートナー経由 |
| 物理ポート | パートナーと共有 |
| VIF数 | 1接続につき1 VIF |

### 比較表

| 項目 | 専用接続 | ホスト接続 |
|------|---------|-----------|
| 最小帯域 | 1Gbps | 50Mbps |
| 導入期間 | 長い（数週間〜） | 短い |
| コスト | 高い | 柔軟 |
| VIF制限 | 50 VIF | 1 VIF |
| 推奨用途 | 大規模利用 | 小〜中規模 |

## VIF（Virtual Interface）

### VIFの種類

```mermaid
flowchart LR
    subgraph VIFs["VIFの種類"]
        Private["プライベートVIF"]
        Public["パブリックVIF"]
        Transit["トランジットVIF"]
    end

    Private --> VPC["VPCへの接続"]
    Public --> AWSServices["AWSパブリックサービス<br/>（S3、DynamoDB等）"]
    Transit --> TGW["Transit Gateway経由<br/>複数VPC"]

    style Private fill:#3b82f6,color:#fff
    style Public fill:#22c55e,color:#fff
    style Transit fill:#8b5cf6,color:#fff
```

### プライベートVIF

VPCのプライベートリソースにアクセス：

```
用途: EC2、RDS、ELB等へのプライベートアクセス
接続先: VGW（Virtual Private Gateway）または Direct Connect Gateway
BGP ASN: カスタムASN使用可能
```

### パブリックVIF

AWSパブリックエンドポイントにアクセス：

```
用途: S3、DynamoDB、EC2パブリックIP等へのアクセス
接続先: AWSリージョン
BGP ASN: パブリックASNまたはAWS提供のASN
広報される経路: AWSのパブリックIPプレフィックス
```

### トランジットVIF

Transit Gateway経由で複数VPCに接続：

```
用途: 複数VPC、複数リージョンへのアクセス
接続先: Direct Connect Gateway → Transit Gateway
BGP ASN: カスタムASN使用可能
最大スループット: VIF接続速度と同等
```

## Direct Connect Gateway

### 概要

Direct Connect Gatewayは、1つのDirect Connect接続から複数のVPCやリージョンにアクセスするためのグローバルリソースです。

```mermaid
flowchart TB
    subgraph OnPrem["オンプレミス"]
        Router["ルーター"]
    end

    subgraph DXLocation["DXロケーション"]
        DX["Direct Connect"]
    end

    subgraph DXGW["Direct Connect Gateway"]
        Gateway["DXGW<br/>（グローバル）"]
    end

    subgraph Region1["東京リージョン"]
        VPC1["VPC 1"]
        VPC2["VPC 2"]
    end

    subgraph Region2["シンガポール"]
        VPC3["VPC 3"]
    end

    Router --> DX
    DX --> Gateway
    Gateway --> VPC1
    Gateway --> VPC2
    Gateway --> VPC3

    style DXGW fill:#f59e0b,color:#000
    style Region1 fill:#3b82f6,color:#fff
    style Region2 fill:#22c55e,color:#fff
```

### Direct Connect Gateway vs VGW直接接続

| 機能 | VGW直接接続 | Direct Connect Gateway |
|------|------------|----------------------|
| 接続VPC数 | 1 | 複数 |
| クロスリージョン | ❌ | ✅ |
| クロスアカウント | ❌ | ✅ |
| Transit Gateway連携 | ❌ | ✅ |

### 設定例

```bash
# Direct Connect Gatewayの作成
aws directconnect create-direct-connect-gateway \
    --direct-connect-gateway-name my-dxgw \
    --amazon-side-asn 64512

# VGWとの関連付け
aws directconnect create-direct-connect-gateway-association \
    --direct-connect-gateway-id dxgw-xxx \
    --gateway-id vgw-xxx \
    --add-allowed-prefixes-to-direct-connect-gateway cidrBlocks=10.0.0.0/16
```

## 冗長性設計

### 冗長性レベル

```mermaid
flowchart TB
    subgraph Level1["レベル1: 開発/テスト"]
        L1["単一DX接続"]
    end

    subgraph Level2["レベル2: 本番（基本）"]
        L2["2つのDX接続<br/>同一ロケーション"]
    end

    subgraph Level3["レベル3: 本番（高可用性）"]
        L3["2つのDX接続<br/>異なるロケーション"]
    end

    subgraph Level4["レベル4: ミッションクリティカル"]
        L4["4つのDX接続<br/>異なるロケーション<br/>+ VPNバックアップ"]
    end

    style Level1 fill:#6b7280,color:#fff
    style Level2 fill:#f59e0b,color:#000
    style Level3 fill:#3b82f6,color:#fff
    style Level4 fill:#22c55e,color:#fff
```

### 推奨アーキテクチャ

#### 最大回復性（Maximum Resiliency）

```mermaid
flowchart TB
    subgraph OnPrem["オンプレミス"]
        Router1["ルーター1"]
        Router2["ルーター2"]
    end

    subgraph Location1["DXロケーション1"]
        DX1["DX接続1"]
        DX2["DX接続2"]
    end

    subgraph Location2["DXロケーション2"]
        DX3["DX接続3"]
        DX4["DX接続4"]
    end

    subgraph AWS["AWS"]
        VPC["VPC"]
    end

    Router1 --> DX1
    Router1 --> DX3
    Router2 --> DX2
    Router2 --> DX4

    DX1 --> VPC
    DX2 --> VPC
    DX3 --> VPC
    DX4 --> VPC

    style Location1 fill:#3b82f6,color:#fff
    style Location2 fill:#22c55e,color:#fff
```

#### 高回復性（High Resiliency）

```mermaid
flowchart TB
    subgraph OnPrem["オンプレミス"]
        Router["ルーター"]
    end

    subgraph Location1["DXロケーション1"]
        DX1["DX接続1"]
    end

    subgraph Location2["DXロケーション2"]
        DX2["DX接続2"]
    end

    subgraph AWS["AWS"]
        VPC["VPC"]
    end

    Router --> DX1
    Router --> DX2
    DX1 --> VPC
    DX2 --> VPC

    style Location1 fill:#3b82f6,color:#fff
    style Location2 fill:#22c55e,color:#fff
```

### VPNバックアップ

Direct Connect障害時のバックアップとしてVPNを設定：

```mermaid
flowchart LR
    subgraph OnPrem["オンプレミス"]
        Router["ルーター"]
    end

    subgraph Primary["プライマリ"]
        DX["Direct Connect"]
    end

    subgraph Backup["Backup"]
        VPN["Site-to-Site VPN"]
    end

    subgraph AWS["AWS"]
        VPC["VPC"]
    end

    Router --> DX
    Router -.-> |"フェイルオーバー"| VPN
    DX --> VPC
    VPN --> VPC

    style Primary fill:#22c55e,color:#fff
    style Backup fill:#f59e0b,color:#000
```

BGP設定でDirect Connectを優先：

| 設定 | Direct Connect | VPN |
|------|---------------|-----|
| AS Path長 | 短い | 長い（AS Prepend） |
| Local Preference | 高い | 低い |
| MED | 低い | 高い |

## LAG（Link Aggregation Group）

### LAGとは

複数のDirect Connect接続を1つの論理接続として束ねる機能：

```mermaid
flowchart LR
    subgraph OnPrem["オンプレミス"]
        Router["ルーター"]
    end

    subgraph LAG["LAG"]
        Port1["ポート1<br/>10Gbps"]
        Port2["ポート2<br/>10Gbps"]
        Port3["ポート3<br/>10Gbps"]
        Port4["ポート4<br/>10Gbps"]
    end

    subgraph AWS["AWS"]
        VPC["VPC<br/>合計40Gbps"]
    end

    Router --> LAG
    LAG --> VPC

    style LAG fill:#3b82f6,color:#fff
```

### LAGの要件

| 要件 | 詳細 |
|------|------|
| 最大ポート数 | 4 |
| ポート速度 | すべて同一（1G/10G/100G） |
| 最小アクティブ | 設定可能（0〜4） |

## MACsec

### MACsecとは

Direct Connect接続を暗号化するレイヤー2セキュリティ：

```mermaid
flowchart LR
    subgraph OnPrem["オンプレミス"]
        Router["MACsec対応<br/>ルーター"]
    end

    subgraph Encrypted["暗号化区間"]
        DX["Direct Connect<br/>MACsec暗号化"]
    end

    subgraph AWS["AWS"]
        Endpoint["AWSエンドポイント"]
    end

    Router --> |"暗号化"| DX
    DX --> |"暗号化"| Endpoint

    style Encrypted fill:#22c55e,color:#fff
```

### MACsecの要件

| 要件 | 詳細 |
|------|------|
| 対応速度 | 10Gbps、100Gbps |
| 暗号スイート | AES-256-GCM、AES-128-GCM |
| 鍵管理 | CKN/CAKペア |

## コスト構造

### 料金要素

| 要素 | 説明 |
|------|------|
| **ポート時間料金** | 接続速度に応じた時間課金 |
| **データ転送料金** | AWS→オンプレミスの転送量 |
| **パートナー料金** | ホスト接続の場合 |
| **クロスコネクト** | データセンター内の接続料金 |

### 料金例（東京リージョン）

| 接続速度 | ポート時間料金（月額概算） |
|---------|------------------------|
| 1Gbps | 約$220 |
| 10Gbps | 約$2,200 |
| 100Gbps | 約$22,000 |

データ転送料金：$0.041/GB（AWS→オンプレミス）

## ベストプラクティス

### 設計時のチェックリスト

```mermaid
flowchart TB
    subgraph Planning["計画フェーズ"]
        P1["帯域幅要件の見積もり"]
        P2["冗長性レベルの決定"]
        P3["DXロケーションの選定"]
        P4["BGP設計"]
    end

    subgraph Implementation["実装フェーズ"]
        I1["接続のプロビジョニング"]
        I2["VIFの作成"]
        I3["BGPピアリング設定"]
        I4["ルーティングテスト"]
    end

    subgraph Operations["運用フェーズ"]
        O1["CloudWatch監視"]
        O2["フェイルオーバーテスト"]
        O3["定期的なレビュー"]
    end

    Planning --> Implementation
    Implementation --> Operations

    style Planning fill:#3b82f6,color:#fff
    style Implementation fill:#22c55e,color:#fff
    style Operations fill:#8b5cf6,color:#fff
```

### よくある間違い

| 間違い | 正しい対応 |
|--------|----------|
| 単一ロケーションのみ | 異なるロケーションで冗長化 |
| VPNバックアップなし | VPNをバックアップとして設定 |
| BGP設定の不備 | AS PathやMEDで優先度制御 |
| 監視の欠如 | CloudWatchでメトリクス監視 |

## まとめ

```mermaid
flowchart TB
    subgraph DirectConnect["Direct Connect"]
        Connection["接続タイプ"]
        VIF["VIF"]
        DXGW["DX Gateway"]
        Redundancy["冗長性"]
    end

    Connection --> |"専用/ホスト"| Speed["帯域幅選択"]
    VIF --> |"Private/Public/Transit"| Access["アクセスタイプ"]
    DXGW --> |"マルチVPC/リージョン"| Scale["スケール"]
    Redundancy --> |"複数ロケーション"| HA["High Availability"]

    style DirectConnect fill:#3b82f6,color:#fff
```

| コンポーネント | 用途 | 重要度 |
|--------------|------|--------|
| 専用接続 | 大規模利用 | ★★★ |
| ホスト接続 | 小〜中規模 | ★★☆ |
| DX Gateway | マルチVPC | ★★★ |
| LAG | 帯域幅集約 | ★★☆ |
| MACsec | 暗号化 | ★★☆ |

Direct Connectは、一貫したパフォーマンスが必要なハイブリッドアーキテクチャの基盤です。適切な冗長性設計により、高可用性を実現できます。

## 参考資料

- [AWS Direct Connect User Guide](https://docs.aws.amazon.com/directconnect/latest/UserGuide/)
- [Direct Connect Resiliency Recommendations](https://docs.aws.amazon.com/directconnect/latest/UserGuide/resilency_toolkit.html)
- [Direct Connect Gateway](https://docs.aws.amazon.com/directconnect/latest/UserGuide/direct-connect-gateways.html)
