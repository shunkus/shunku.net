---
title: "AWSハイブリッドVPN設計：Site-to-Site VPN、CloudHub、冗長構成"
date: "2025-12-11"
excerpt: "AWS Site-to-Site VPNによるハイブリッド接続を徹底解説 - VPN CloudHub、Accelerated VPN、Direct Connectとの併用、冗長構成のベストプラクティスを紹介します。"
tags: ["AWS", "VPN", "ネットワーク", "ハイブリッドクラウド", "セキュリティ"]
author: "Shunku"
---

AWS Site-to-Site VPNは、オンプレミス環境とAWS VPCをインターネット経由で安全に接続するサービスです。Direct Connectと比較して導入が容易で、バックアップ接続としても活用されます。

## Site-to-Site VPNの概要

### 基本アーキテクチャ

```mermaid
flowchart LR
    subgraph OnPrem["オンプレミス"]
        Router["カスタマー<br/>ゲートウェイ"]
    end

    subgraph Internet["インターネット"]
        Tunnel1["IPsecトンネル1"]
        Tunnel2["IPsecトンネル2"]
    end

    subgraph AWS["AWS"]
        VGW["仮想プライベート<br/>ゲートウェイ"]
        VPC["VPC"]
    end

    Router --> Tunnel1
    Router --> Tunnel2
    Tunnel1 --> VGW
    Tunnel2 --> VGW
    VGW --> VPC

    style OnPrem fill:#6b7280,color:#fff
    style Internet fill:#f59e0b,color:#000
    style AWS fill:#3b82f6,color:#fff
```

### コンポーネント

| コンポーネント | 説明 |
|--------------|------|
| **カスタマーゲートウェイ（CGW）** | オンプレミス側のVPNデバイス情報 |
| **仮想プライベートゲートウェイ（VGW）** | VPC側のVPNエンドポイント |
| **Transit Gateway** | 複数VPCへの接続時に使用 |
| **VPN接続** | CGWとVGW/TGW間のIPsecトンネル |

## VPN接続オプション

### VGW接続 vs TGW接続

```mermaid
flowchart TB
    subgraph VGWOption["VGW接続"]
        CGW1["CGW"] --> VGW1["VGW"]
        VGW1 --> VPC1["VPC"]
    end

    subgraph TGWOption["TGW接続"]
        CGW2["CGW"] --> TGW["Transit Gateway"]
        TGW --> VPC2["VPC 1"]
        TGW --> VPC3["VPC 2"]
        TGW --> VPC4["VPC 3"]
    end

    style VGWOption fill:#3b82f6,color:#fff
    style TGWOption fill:#22c55e,color:#fff
```

### 比較

| 機能 | VGW接続 | TGW接続 |
|------|--------|---------|
| 接続先VPC数 | 1 | 複数 |
| ECMP | ❌ | ✅ |
| 帯域幅 | 最大1.25Gbps | 最大50Gbps（ECMP時） |
| ルーティング | シンプル | 柔軟 |
| コスト | 低い | 高い |

## IPsecトンネルの詳細

### トンネル構成

各VPN接続は2つのIPsecトンネルで構成されます：

```mermaid
flowchart TB
    subgraph OnPrem["オンプレミス"]
        CGW["CGW<br/>1つのパブリックIP"]
    end

    subgraph AWS["AWS（異なるAZ）"]
        EP1["エンドポイント1<br/>AZ-a"]
        EP2["エンドポイント2<br/>AZ-b"]
    end

    CGW --> |"トンネル1"| EP1
    CGW --> |"トンネル2"| EP2

    style AWS fill:#3b82f6,color:#fff
```

**重要**: 2つのトンネルを両方設定して冗長性を確保してください。AWSのメンテナンス時に片方のトンネルが使用不可になることがあります。

### トンネルオプション

| オプション | 説明 |
|----------|------|
| **事前共有キー** | 認証用のシークレット |
| **トンネル内CIDR** | /30のIPアドレス範囲 |
| **IKEバージョン** | IKEv1またはIKEv2 |
| **Phase 1/2暗号化** | AES128、AES256等 |
| **Phase 1/2 DH** | Diffie-Hellmanグループ |
| **Dead Peer Detection** | 接続断の検出 |

### 設定例

```bash
# カスタマーゲートウェイの作成
aws ec2 create-customer-gateway \
    --type ipsec.1 \
    --public-ip 203.0.113.1 \
    --bgp-asn 65000

# VPN接続の作成（VGW）
aws ec2 create-vpn-connection \
    --type ipsec.1 \
    --customer-gateway-id cgw-xxx \
    --vpn-gateway-id vgw-xxx \
    --options "{\"TunnelOptions\":[
        {\"PreSharedKey\":\"secretkey1\",\"TunnelInsideCidr\":\"169.254.10.0/30\"},
        {\"PreSharedKey\":\"secretkey2\",\"TunnelInsideCidr\":\"169.254.11.0/30\"}
    ]}"
```

## ルーティング

### 静的ルーティング vs BGP

```mermaid
flowchart TB
    subgraph Static["静的ルーティング"]
        S1["手動でルート設定"]
        S2["フェイルオーバーは手動"]
        S3["小規模環境向け"]
    end

    subgraph BGP["動的ルーティング（BGP）"]
        B1["自動でルート交換"]
        B2["自動フェイルオーバー"]
        B3["大規模環境向け"]
    end

    style Static fill:#f59e0b,color:#000
    style BGP fill:#22c55e,color:#fff
```

### BGP設定のポイント

| 設定 | 推奨値 |
|------|--------|
| Hold Timer | 30秒（デフォルト） |
| Keepalive | 10秒 |
| BGP ASN | プライベートASN（64512-65534） |
| AS Path Prepend | フェイルオーバー制御に使用 |

## AWS VPN CloudHub

### 概要

VPN CloudHubは、複数のオンプレミス拠点をAWS経由で相互接続するアーキテクチャです。

```mermaid
flowchart TB
    subgraph Sites["オンプレミス拠点"]
        Site1["拠点1<br/>10.1.0.0/16"]
        Site2["拠点2<br/>10.2.0.0/16"]
        Site3["拠点3<br/>10.3.0.0/16"]
    end

    subgraph AWS["AWS"]
        VGW["VGW"]
        VPC["VPC<br/>（オプション）"]
    end

    Site1 --> |"VPN 1"| VGW
    Site2 --> |"VPN 2"| VGW
    Site3 --> |"VPN 3"| VGW

    Site1 <-.-> |"拠点間通信"| Site2
    Site2 <-.-> |"拠点間通信"| Site3

    style Sites fill:#6b7280,color:#fff
    style AWS fill:#3b82f6,color:#fff
```

### 特徴

| 特徴 | 詳細 |
|------|------|
| ハブ&スポーク | VGWがハブとして機能 |
| 拠点間通信 | AWS経由でルーティング |
| BGP必須 | 動的ルーティングが必要 |
| VPCオプション | VPCなしでも使用可能 |

### 設定のポイント

```
拠点1 → VGW: 10.1.0.0/16を広報
拠点2 → VGW: 10.2.0.0/16を広報
拠点3 → VGW: 10.3.0.0/16を広報

VGW → 各拠点: 他拠点のルートを広報
```

## Accelerated Site-to-Site VPN

### 概要

AWS Global Acceleratorを使用してVPN接続を高速化：

```mermaid
flowchart LR
    subgraph OnPrem["オンプレミス"]
        CGW["CGW"]
    end

    subgraph Edge["AWSエッジロケーション"]
        GA["Global Accelerator"]
    end

    subgraph AWS["AWSリージョン"]
        VGW["VGW/TGW"]
        VPC["VPC"]
    end

    CGW --> |"最寄りエッジへ"| GA
    GA --> |"AWSバックボーン"| VGW
    VGW --> VPC

    style Edge fill:#f59e0b,color:#000
    style AWS fill:#3b82f6,color:#fff
```

### メリット

| 項目 | 通常のVPN | Accelerated VPN |
|------|----------|-----------------|
| 経路 | インターネット全区間 | エッジ以降はAWSバックボーン |
| レイテンシー | 変動あり | 安定・低減 |
| ジッター | 大きい | 小さい |
| 追加コスト | なし | あり |

### 有効化

```bash
# Accelerated VPNを有効にして作成
aws ec2 create-vpn-connection \
    --type ipsec.1 \
    --customer-gateway-id cgw-xxx \
    --transit-gateway-id tgw-xxx \
    --options EnableAcceleration=true
```

## 冗長構成

### パターン1: デュアルトンネル（基本）

```mermaid
flowchart TB
    subgraph OnPrem["オンプレミス"]
        Router["ルーター"]
    end

    subgraph AWS["AWS"]
        Tunnel1["トンネル1<br/>AZ-a"]
        Tunnel2["トンネル2<br/>AZ-b"]
        VGW["VGW"]
    end

    Router --> Tunnel1
    Router --> Tunnel2
    Tunnel1 --> VGW
    Tunnel2 --> VGW

    style AWS fill:#3b82f6,color:#fff
```

### パターン2: デュアルCGW

```mermaid
flowchart TB
    subgraph OnPrem["オンプレミス"]
        Router1["ルーター1"]
        Router2["ルーター2"]
    end

    subgraph AWS["AWS"]
        VPN1["VPN接続1"]
        VPN2["VPN接続2"]
        VGW["VGW"]
    end

    Router1 --> VPN1
    Router2 --> VPN2
    VPN1 --> VGW
    VPN2 --> VGW

    style AWS fill:#3b82f6,color:#fff
```

### パターン3: Direct Connect + VPNバックアップ

```mermaid
flowchart TB
    subgraph OnPrem["オンプレミス"]
        Router["ルーター"]
    end

    subgraph Primary["プライマリ"]
        DX["Direct Connect"]
    end

    subgraph Backup["バックアップ"]
        VPN["Site-to-Site VPN"]
    end

    subgraph AWS["AWS"]
        VGW["VGW"]
        VPC["VPC"]
    end

    Router --> |"優先"| DX
    Router -.-> |"フェイルオーバー"| VPN
    DX --> VGW
    VPN --> VGW
    VGW --> VPC

    style Primary fill:#22c55e,color:#fff
    style Backup fill:#f59e0b,color:#000
```

### BGPでの優先度制御

| 手法 | 説明 | 用途 |
|------|------|------|
| AS Path Prepend | パスを長くして優先度を下げる | バックアップ経路 |
| Local Preference | 高い値を優先 | プライマリ経路 |
| MED | 低い値を優先 | 経路選択 |

```
# VPNをバックアップにする例
Direct Connect: AS Path = 65000
VPN: AS Path = 65000 65000 65000（Prepend）
```

## Private IP VPN

### 概要

Transit Gateway経由でプライベートIPアドレスでVPN接続：

```mermaid
flowchart LR
    subgraph OnPrem["オンプレミス"]
        CGW["CGW<br/>プライベートIP"]
    end

    subgraph DX["Direct Connect"]
        Connection["専用線"]
    end

    subgraph AWS["AWS"]
        DXGW["DX Gateway"]
        TGW["Transit Gateway"]
        VPC["VPC"]
    end

    CGW --> |"プライベートIP VPN"| Connection
    Connection --> DXGW
    DXGW --> TGW
    TGW --> VPC

    style DX fill:#f59e0b,color:#000
    style AWS fill:#3b82f6,color:#fff
```

### ユースケース

- パブリックIPを使用したくない場合
- Direct Connect上でVPNの暗号化が必要な場合
- コンプライアンス要件

## モニタリング

### CloudWatchメトリクス

| メトリクス | 説明 |
|-----------|------|
| TunnelState | トンネルの状態（0=DOWN、1=UP） |
| TunnelDataIn | 受信バイト数 |
| TunnelDataOut | 送信バイト数 |

### アラーム設定例

```bash
# トンネルダウンアラーム
aws cloudwatch put-metric-alarm \
    --alarm-name "VPN-Tunnel-Down" \
    --metric-name TunnelState \
    --namespace AWS/VPN \
    --statistic Maximum \
    --period 60 \
    --threshold 1 \
    --comparison-operator LessThanThreshold \
    --dimensions Name=VpnId,Value=vpn-xxx Name=TunnelIpAddress,Value=x.x.x.x \
    --evaluation-periods 2 \
    --alarm-actions arn:aws:sns:ap-northeast-1:xxx:alerts
```

## ベストプラクティス

### チェックリスト

```mermaid
flowchart TB
    subgraph Design["設計"]
        D1["両方のトンネルを使用"]
        D2["BGPを使用"]
        D3["冗長CGWを検討"]
    end

    subgraph Security["セキュリティ"]
        S1["強力な事前共有キー"]
        S2["IKEv2を使用"]
        S3["AES-256暗号化"]
    end

    subgraph Operations["運用"]
        O1["CloudWatch監視"]
        O2["フェイルオーバーテスト"]
        O3["設定のバックアップ"]
    end

    style Design fill:#3b82f6,color:#fff
    style Security fill:#ef4444,color:#fff
    style Operations fill:#22c55e,color:#fff
```

### よくある問題

| 問題 | 原因 | 対策 |
|------|------|------|
| トンネルが確立しない | Phase 1/2パラメータ不一致 | 設定を確認 |
| 片方のトンネルのみ | ルーティング設定不備 | 両トンネルへルート |
| 間欠的な切断 | DPDタイムアウト | タイマー調整 |
| 帯域不足 | 1.25Gbps制限 | TGW+ECMPまたはDX |

## まとめ

```mermaid
flowchart TB
    subgraph VPN["Site-to-Site VPN"]
        Basic["基本VPN"]
        CloudHub["VPN CloudHub"]
        Accelerated["Accelerated VPN"]
    end

    Basic --> |"単一VPC接続"| Simple["シンプルな構成"]
    CloudHub --> |"拠点間接続"| Multi["マルチサイト"]
    Accelerated --> |"高速化"| Performance["パフォーマンス"]

    style VPN fill:#3b82f6,color:#fff
```

| 構成 | ユースケース | 帯域幅 |
|------|------------|--------|
| VGW + VPN | 単一VPC、小規模 | 最大1.25Gbps |
| TGW + VPN | 複数VPC、ECMP | 最大50Gbps |
| VPN CloudHub | 拠点間接続 | 1.25Gbps/接続 |
| Accelerated VPN | 低レイテンシー要件 | 同上 |

Site-to-Site VPNは、迅速なハイブリッド接続の確立や、Direct Connectのバックアップとして重要な役割を果たします。

## 参考資料

- [AWS Site-to-Site VPN User Guide](https://docs.aws.amazon.com/vpn/latest/s2svpn/)
- [VPN CloudHub](https://docs.aws.amazon.com/vpn/latest/s2svpn/VPN_CloudHub.html)
- [Accelerated Site-to-Site VPN](https://docs.aws.amazon.com/vpn/latest/s2svpn/accelerated-vpn.html)
