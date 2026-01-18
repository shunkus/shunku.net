---
title: "AWS Transit Gateway：大規模VPCネットワークのハブ&スポーク設計"
date: "2025-12-10"
excerpt: "AWS Transit Gatewayによる大規模ネットワーク設計を徹底解説 - ルートテーブル、アタッチメント、マルチリージョン接続、Network Managerの活用方法を紹介します。"
tags: ["AWS", "Transit Gateway", "Networking", "VPC", "Hybrid Cloud"]
author: "Shunku"
---

AWS Transit Gatewayは、複数のVPCとオンプレミスネットワークを一元的に接続するリージョナルネットワークハブです。従来のVPCピアリングの複雑さを解消し、スケーラブルなネットワークアーキテクチャを実現します。

## なぜTransit Gatewayが必要か

### VPCピアリングの限界

```mermaid
flowchart TB
    subgraph Peering["VPCピアリング（フルメッシュ）"]
        VP1["VPC 1"] <--> VP2["VPC 2"]
        VP2 <--> VP3["VPC 3"]
        VP3 <--> VP4["VPC 4"]
        VP4 <--> VP1
        VP1 <--> VP3
        VP2 <--> VP4
    end

    subgraph TGW["Transit Gateway（ハブ&スポーク）"]
        TG["Transit Gateway"]
        V1["VPC 1"] --> TG
        V2["VPC 2"] --> TG
        V3["VPC 3"] --> TG
        V4["VPC 4"] --> TG
    end

    style Peering fill:#ef4444,color:#fff
    style TGW fill:#22c55e,color:#fff
```

### 接続数の比較

| VPC数 | ピアリング接続数 | TGWアタッチメント数 |
|-------|----------------|-------------------|
| 4 | 6 | 4 |
| 10 | 45 | 10 |
| 50 | 1,225 | 50 |
| 100 | 4,950 | 100 |

n個のVPCをフルメッシュで接続するには n×(n-1)/2 の接続が必要ですが、Transit Gatewayならn個のアタッチメントで済みます。

## Transit Gatewayの基本概念

### コンポーネント

```mermaid
flowchart TB
    subgraph TGW["Transit Gateway"]
        RT1["ルートテーブル1"]
        RT2["ルートテーブル2"]
    end

    subgraph Attachments["アタッチメント"]
        VPC1["VPCアタッチメント"]
        VPC2["VPCアタッチメント"]
        VPN["VPNアタッチメント"]
        DX["Direct Connect<br/>アタッチメント"]
        Peer["ピアリング<br/>アタッチメント"]
    end

    VPC1 --> RT1
    VPC2 --> RT1
    VPN --> RT2
    DX --> RT2
    Peer --> RT2

    style TGW fill:#3b82f6,color:#fff
    style Attachments fill:#22c55e,color:#fff
```

### 用語の整理

| コンポーネント | 説明 |
|--------------|------|
| **Transit Gateway** | リージョナルなネットワークハブ |
| **アタッチメント** | TGWへの接続（VPC、VPN、DX、ピアリング） |
| **ルートテーブル** | トラフィックのルーティングを制御 |
| **関連付け** | アタッチメントとルートテーブルの紐付け |
| **伝播** | アタッチメントからルートを自動追加 |

## アタッチメントの種類

### VPCアタッチメント

```mermaid
flowchart TB
    subgraph VPC["VPC"]
        subgraph AZ1["AZ-a"]
            Subnet1["サブネット1"]
        end
        subgraph AZ2["AZ-b"]
            Subnet2["サブネット2"]
        end
    end

    subgraph TGW["Transit Gateway"]
        ENI1["ENI"]
        ENI2["ENI"]
    end

    Subnet1 --> ENI1
    Subnet2 --> ENI2

    style VPC fill:#3b82f6,color:#fff
    style TGW fill:#22c55e,color:#fff
```

**重要**: 各AZにサブネットを指定する必要があります。高可用性のために複数AZを使用してください。

### VPNアタッチメント

Site-to-Site VPN接続をTransit Gatewayに直接終端：

```bash
# VPNアタッチメントの作成
aws ec2 create-vpn-connection \
    --type ipsec.1 \
    --customer-gateway-id cgw-xxx \
    --transit-gateway-id tgw-xxx \
    --options TunnelOptions=[{PreSharedKey=xxx}]
```

### Direct Connectアタッチメント

Direct Connect Gateway経由でTransit Gatewayに接続：

```mermaid
flowchart LR
    OnPrem["オンプレミス"] --> DX["Direct Connect"]
    DX --> DXGW["DX Gateway"]
    DXGW --> TGW["Transit Gateway"]
    TGW --> VPC1["VPC 1"]
    TGW --> VPC2["VPC 2"]

    style DXGW fill:#f59e0b,color:#000
    style TGW fill:#3b82f6,color:#fff
```

### ピアリングアタッチメント

異なるリージョンのTransit Gateway同士を接続：

```mermaid
flowchart LR
    subgraph Tokyo["東京リージョン"]
        TGW1["TGW Tokyo"]
        VPC1["VPC 1"]
        VPC2["VPC 2"]
    end

    subgraph Singapore["シンガポール"]
        TGW2["TGW Singapore"]
        VPC3["VPC 3"]
    end

    VPC1 --> TGW1
    VPC2 --> TGW1
    TGW1 <--> |"ピアリング"| TGW2
    TGW2 --> VPC3

    style Tokyo fill:#3b82f6,color:#fff
    style Singapore fill:#22c55e,color:#fff
```

## ルーティング

### ルートテーブルの概念

```mermaid
flowchart TB
    subgraph TGW["Transit Gateway"]
        subgraph RT["ルートテーブル"]
            Route1["10.1.0.0/16 → VPC1"]
            Route2["10.2.0.0/16 → VPC2"]
            Route3["192.168.0.0/16 → VPN"]
            Route4["0.0.0.0/0 → Firewall VPC"]
        end
    end

    Attach1["VPC1アタッチメント"] --> |"関連付け"| RT
    Attach2["VPC2アタッチメント"] --> |"関連付け"| RT

    style TGW fill:#3b82f6,color:#fff
```

### 関連付けと伝播

| 機能 | 説明 |
|------|------|
| **関連付け（Association）** | アタッチメントのトラフィックがどのルートテーブルを使用するか |
| **伝播（Propagation）** | アタッチメントのCIDRを自動的にルートテーブルに追加 |

### ルーティング設計パターン

#### パターン1: フラットルーティング

すべてのVPCが相互に通信可能：

```mermaid
flowchart TB
    subgraph TGW["Transit Gateway"]
        RT["単一ルートテーブル"]
    end

    VPC1["VPC 1"] --> RT
    VPC2["VPC 2"] --> RT
    VPC3["VPC 3"] --> RT

    RT --> |"伝播"| VPC1
    RT --> |"伝播"| VPC2
    RT --> |"伝播"| VPC3

    style TGW fill:#3b82f6,color:#fff
```

#### パターン2: セグメント化

環境ごとにルートテーブルを分離：

```mermaid
flowchart TB
    subgraph TGW["Transit Gateway"]
        RTprod["本番ルートテーブル"]
        RTdev["開発ルートテーブル"]
        RTshared["共有サービスRT"]
    end

    Prod1["本番VPC1"] --> RTprod
    Prod2["本番VPC2"] --> RTprod
    Dev1["開発VPC"] --> RTdev
    Shared["共有VPC"] --> RTshared

    RTprod --> Shared
    RTdev --> Shared

    style TGW fill:#3b82f6,color:#fff
```

#### パターン3: Inspection VPC

すべてのトラフィックをファイアウォール経由：

```mermaid
flowchart TB
    subgraph TGW["Transit Gateway"]
        RTspoke["スポークRT"]
        RTinspection["検査RT"]
    end

    VPC1["VPC 1"] --> RTspoke
    VPC2["VPC 2"] --> RTspoke

    subgraph Inspection["Inspection VPC"]
        FW["Firewall<br/>(GWLB)"]
    end

    RTspoke --> |"0.0.0.0/0"| Inspection
    Inspection --> RTinspection
    RTinspection --> |"各CIDR"| VPC1
    RTinspection --> |"各CIDR"| VPC2

    style Inspection fill:#ef4444,color:#fff
    style TGW fill:#3b82f6,color:#fff
```

## マルチリージョン設計

### Inter-Region Peering

```mermaid
flowchart TB
    subgraph Region1["ap-northeast-1"]
        TGW1["TGW"]
        VPC1["VPC 10.1.0.0/16"]
        VPC2["VPC 10.2.0.0/16"]
    end

    subgraph Region2["us-east-1"]
        TGW2["TGW"]
        VPC3["VPC 10.3.0.0/16"]
    end

    subgraph Region3["eu-west-1"]
        TGW3["TGW"]
        VPC4["VPC 10.4.0.0/16"]
    end

    VPC1 --> TGW1
    VPC2 --> TGW1
    VPC3 --> TGW2
    VPC4 --> TGW3

    TGW1 <--> TGW2
    TGW2 <--> TGW3
    TGW1 <--> TGW3

    style Region1 fill:#3b82f6,color:#fff
    style Region2 fill:#22c55e,color:#fff
    style Region3 fill:#8b5cf6,color:#fff
```

### ルーティング設定

各リージョンのルートテーブルに他リージョンへのルートを追加：

```bash
# 東京リージョンのルートテーブルに追加
aws ec2 create-transit-gateway-route \
    --transit-gateway-route-table-id tgw-rtb-tokyo \
    --destination-cidr-block 10.3.0.0/16 \
    --transit-gateway-attachment-id tgw-attach-peering-us
```

## Network Manager

### 概要

AWS Network Managerは、グローバルネットワークを可視化・監視するサービスです。

```mermaid
flowchart TB
    subgraph NetworkManager["Network Manager"]
        Global["グローバルネットワーク"]
        Topology["トポロジー可視化"]
        Events["イベント監視"]
        Insights["Route Analyzer"]
    end

    TGW1["TGW Tokyo"] --> Global
    TGW2["TGW Singapore"] --> Global
    SD["SD-WAN"] --> Global

    style NetworkManager fill:#f59e0b,color:#000
```

### 主要機能

| 機能 | 説明 |
|------|------|
| **トポロジーマップ** | ネットワーク構成を視覚化 |
| **イベントダッシュボード** | 接続状態の変化を監視 |
| **Route Analyzer** | ルーティングの分析・検証 |
| **CloudWatch統合** | メトリクスとアラーム |

## RAM（Resource Access Manager）との連携

### マルチアカウントでのTGW共有

```mermaid
flowchart TB
    subgraph NetworkAccount["ネットワークアカウント"]
        TGW["Transit Gateway"]
    end

    subgraph RAM["RAM"]
        Share["リソース共有"]
    end

    subgraph Account1["アカウント1"]
        VPC1["VPC 1"]
    end

    subgraph Account2["アカウント2"]
        VPC2["VPC 2"]
    end

    TGW --> Share
    Share --> Account1
    Share --> Account2
    VPC1 --> |"アタッチ"| TGW
    VPC2 --> |"アタッチ"| TGW

    style NetworkAccount fill:#3b82f6,color:#fff
    style Account1 fill:#22c55e,color:#fff
    style Account2 fill:#22c55e,color:#fff
```

### 設定手順

```bash
# 1. ネットワークアカウントでRAM共有を作成
aws ram create-resource-share \
    --name "transit-gateway-share" \
    --resource-arns arn:aws:ec2:ap-northeast-1:111111111111:transit-gateway/tgw-xxx \
    --principals arn:aws:organizations::111111111111:organization/o-xxx

# 2. 各アカウントからアタッチメントを作成
aws ec2 create-transit-gateway-vpc-attachment \
    --transit-gateway-id tgw-xxx \
    --vpc-id vpc-xxx \
    --subnet-ids subnet-xxx subnet-yyy
```

## 料金

### 料金体系

| 項目 | 料金（東京リージョン） |
|------|----------------------|
| アタッチメント時間 | $0.07/時間 |
| データ処理 | $0.02/GB |
| ピアリングアタッチメント | $0.07/時間 |
| ピアリングデータ転送 | リージョン間転送料金 |

### コスト最適化のポイント

- 不要なアタッチメントは削除
- 大量データ転送はDirect Connect検討
- 同一AZ内通信を優先（データ転送料金削減）

## ベストプラクティス

### 設計チェックリスト

```mermaid
flowchart TB
    subgraph Design["設計ポイント"]
        D1["CIDRの重複を避ける"]
        D2["複数AZでアタッチメント"]
        D3["ルートテーブル設計を事前に"]
        D4["将来の拡張を考慮"]
    end

    subgraph Security["Security"]
        S1["セグメント化を検討"]
        S2["Inspection VPCの導入"]
        S3["フローログの有効化"]
    end

    subgraph Operations["Operations"]
        O1["Network Managerで監視"]
        O2["タグ付けの統一"]
        O3["ドキュメント化"]
    end

    style Design fill:#3b82f6,color:#fff
    style Security fill:#ef4444,color:#fff
    style Operations fill:#22c55e,color:#fff
```

### よくある間違い

| 間違い | 正しい対応 |
|--------|----------|
| 単一AZのアタッチメント | 複数AZで冗長化 |
| CIDRの重複 | 事前にIP計画を策定 |
| 過度に複雑なルーティング | シンプルな設計を優先 |
| 監視の欠如 | VPCフローログとNetwork Manager |

## まとめ

```mermaid
flowchart TB
    subgraph TGW["Transit Gateway"]
        Attach["アタッチメント"]
        Route["ルートテーブル"]
        Peer["ピアリング"]
    end

    Attach --> |"VPC/VPN/DX"| Connect["接続"]
    Route --> |"関連付け/伝播"| Control["制御"]
    Peer --> |"マルチリージョン"| Global["グローバル"]

    style TGW fill:#3b82f6,color:#fff
```

| コンポーネント | 用途 | 重要度 |
|--------------|------|--------|
| VPCアタッチメント | VPC接続 | ★★★ |
| ルートテーブル | トラフィック制御 | ★★★ |
| ピアリング | マルチリージョン | ★★☆ |
| Network Manager | 監視・可視化 | ★★☆ |

Transit Gatewayは、大規模なマルチVPC環境に不可欠なコンポーネントです。適切なルーティング設計により、スケーラブルで管理しやすいネットワークを実現できます。

## 参考資料

- [AWS Transit Gateway Guide](https://docs.aws.amazon.com/vpc/latest/tgw/)
- [Transit Gateway Design Best Practices](https://docs.aws.amazon.com/vpc/latest/tgw/tgw-best-design-practices.html)
- [Network Manager User Guide](https://docs.aws.amazon.com/network-manager/latest/userguide/)
