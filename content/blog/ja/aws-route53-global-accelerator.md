---
title: "Route 53とGlobal Accelerator：グローバルトラフィック管理とフェイルオーバー"
date: "2025-12-13"
excerpt: "AWSのグローバルトラフィック管理を徹底解説 - Route 53のルーティングポリシー、ヘルスチェック、Global Acceleratorによるアクセラレーション、フェイルオーバー設計を紹介します。"
tags: ["AWS", "Route 53", "Global Accelerator", "DNS", "ネットワーク"]
author: "Shunku"
---

Route 53とGlobal Acceleratorは、グローバルなトラフィック管理とフェイルオーバーを実現するサービスです。それぞれ異なるレイヤーで動作し、組み合わせることで高可用性と低レイテンシーを両立できます。

## Route 53の概要

### Route 53の機能

```mermaid
flowchart TB
    subgraph Route53["Route 53の機能"]
        DNS["DNSホスティング"]
        Health["ヘルスチェック"]
        Routing["ルーティングポリシー"]
        Domain["ドメイン登録"]
    end

    DNS --> |"名前解決"| Resolution["IPアドレス返却"]
    Health --> |"監視"| Monitoring["エンドポイント監視"]
    Routing --> |"トラフィック制御"| Traffic["インテリジェントルーティング"]
    Domain --> |"管理"| Registration["ドメイン管理"]

    style Route53 fill:#3b82f6,color:#fff
```

### ホストゾーン

| 種類 | 用途 | アクセス |
|------|------|---------|
| パブリック | インターネット向け | 誰でもクエリ可能 |
| プライベート | VPC内部向け | 関連VPCからのみ |

## ルーティングポリシー

### 7つのルーティングポリシー

```mermaid
flowchart TB
    subgraph Policies["ルーティングポリシー"]
        Simple["シンプル"]
        Weighted["加重"]
        Latency["レイテンシー"]
        Failover["フェイルオーバー"]
        Geolocation["位置情報"]
        Geoproximity["近接性"]
        Multivalue["複数値"]
    end

    style Policies fill:#3b82f6,color:#fff
```

### シンプルルーティング

1つのリソースへのルーティング：

```
example.com → 192.0.2.1
```

### 加重ルーティング

トラフィックを割合で分散：

```mermaid
flowchart LR
    DNS["Route 53"]
    DNS --> |"70%"| Server1["サーバー1"]
    DNS --> |"30%"| Server2["サーバー2"]

    style DNS fill:#3b82f6,color:#fff
```

ユースケース：
- A/Bテスト
- カナリアリリース
- 段階的な移行

### レイテンシールーティング

最も低レイテンシーのリージョンへルーティング：

```mermaid
flowchart TB
    subgraph Users["ユーザー"]
        Japan["日本のユーザー"]
        US["米国のユーザー"]
    end

    subgraph Route53["Route 53"]
        LBR["レイテンシーベース<br/>ルーティング"]
    end

    subgraph Regions["リージョン"]
        Tokyo["東京<br/>ap-northeast-1"]
        Virginia["バージニア<br/>us-east-1"]
    end

    Japan --> LBR
    US --> LBR
    LBR --> |"低レイテンシー"| Tokyo
    LBR --> |"低レイテンシー"| Virginia

    style Route53 fill:#f59e0b,color:#000
```

### フェイルオーバールーティング

プライマリ障害時にセカンダリへ切り替え：

```mermaid
flowchart TB
    DNS["Route 53"]

    subgraph Primary["プライマリ"]
        P["本番サーバー"]
        HC1["ヘルスチェック ✓"]
    end

    subgraph Secondary["セカンダリ"]
        S["DRサーバー"]
    end

    DNS --> |"正常時"| Primary
    DNS -.-> |"障害時"| Secondary

    style Primary fill:#22c55e,color:#fff
    style Secondary fill:#f59e0b,color:#000
```

### 位置情報ルーティング

ユーザーの地理的位置に基づくルーティング：

```mermaid
flowchart TB
    subgraph Locations["ユーザーの位置"]
        JP["日本"]
        EU["ヨーロッパ"]
        Default["その他"]
    end

    subgraph Endpoints["エンドポイント"]
        JPServer["日本サーバー"]
        EUServer["EUサーバー"]
        USServer["USサーバー（デフォルト）"]
    end

    JP --> JPServer
    EU --> EUServer
    Default --> USServer

    style Endpoints fill:#3b82f6,color:#fff
```

ユースケース：
- コンテンツのローカライズ
- 法規制対応（データの地域制限）
- ライセンス制限

### 近接性ルーティング

地理的な近さに基づき、バイアス値で調整可能：

```
東京: バイアス +25（より多くのトラフィック）
シンガポール: バイアス 0
シドニー: バイアス -10（より少ないトラフィック）
```

### 複数値応答ルーティング

複数のIPアドレスを返却（簡易ロードバランシング）：

```
example.com → [192.0.2.1, 192.0.2.2, 192.0.2.3]
（ヘルスチェックに合格したものだけ返却）
```

## ヘルスチェック

### ヘルスチェックの種類

| 種類 | 監視対象 |
|------|---------|
| エンドポイント | URL、IPアドレス |
| 計算済み | 他のヘルスチェックの組み合わせ |
| CloudWatch | CloudWatchアラームの状態 |

### エンドポイントヘルスチェック

```mermaid
flowchart LR
    subgraph HealthCheckers["Route 53 ヘルスチェッカー"]
        HC1["チェッカー1"]
        HC2["チェッカー2"]
        HC3["チェッカー3"]
    end

    subgraph Endpoint["エンドポイント"]
        Server["Webサーバー<br/>/health"]
    end

    HC1 --> |"HTTP 200?"| Server
    HC2 --> |"HTTP 200?"| Server
    HC3 --> |"HTTP 200?"| Server

    style HealthCheckers fill:#3b82f6,color:#fff
```

### 設定パラメータ

| パラメータ | 説明 | デフォルト |
|-----------|------|-----------|
| リクエスト間隔 | チェック頻度 | 30秒 |
| 失敗しきい値 | 異常判定の回数 | 3回 |
| 文字列マッチング | レスポンス内容の確認 | なし |
| レイテンシーグラフ | 応答時間の可視化 | 有効 |

### 計算済みヘルスチェック

複数のヘルスチェックを組み合わせ：

```mermaid
flowchart TB
    subgraph Calculated["計算済みヘルスチェック"]
        Logic["AND / OR / NOT"]
    end

    subgraph Children["子ヘルスチェック"]
        HC1["Web層 ✓"]
        HC2["App層 ✓"]
        HC3["DB層 ✓"]
    end

    HC1 --> Logic
    HC2 --> Logic
    HC3 --> Logic
    Logic --> |"すべて正常なら正常"| Result["結果: 正常"]

    style Calculated fill:#f59e0b,color:#000
```

## Global Accelerator

### 概要

Global Acceleratorは、AWSグローバルネットワークを使用してアプリケーションのパフォーマンスと可用性を向上させます。

```mermaid
flowchart TB
    subgraph Users["ユーザー"]
        User1["東京ユーザー"]
        User2["ロンドンユーザー"]
    end

    subgraph Edge["エッジロケーション"]
        EdgeTokyo["東京エッジ"]
        EdgeLondon["ロンドンエッジ"]
    end

    subgraph Backbone["AWSバックボーン"]
        Network["AWSグローバルネットワーク"]
    end

    subgraph Endpoints["エンドポイント"]
        ALB1["東京 ALB"]
        ALB2["フランクフルト ALB"]
    end

    User1 --> EdgeTokyo
    User2 --> EdgeLondon
    EdgeTokyo --> Network
    EdgeLondon --> Network
    Network --> ALB1
    Network --> ALB2

    style Edge fill:#f59e0b,color:#000
    style Backbone fill:#3b82f6,color:#fff
```

### Route 53 vs Global Accelerator

| 項目 | Route 53 | Global Accelerator |
|------|----------|-------------------|
| レイヤー | DNS（L7） | ネットワーク（L4） |
| IPアドレス | 変動 | 固定（Anycast） |
| キャッシュ | DNSキャッシュあり | なし |
| フェイルオーバー速度 | DNS TTL依存 | 即時（数秒） |
| ユースケース | 一般的なトラフィック管理 | 低レイテンシー要件 |

### Global Acceleratorのコンポーネント

```mermaid
flowchart TB
    subgraph GA["Global Accelerator"]
        Accelerator["アクセラレーター<br/>（固定IP x 2）"]
        Listener["リスナー<br/>（ポート/プロトコル）"]
        EndpointGroup["エンドポイントグループ<br/>（リージョン単位）"]
        Endpoint["エンドポイント<br/>（ALB/NLB/EC2/EIP）"]
    end

    Accelerator --> Listener
    Listener --> EndpointGroup
    EndpointGroup --> Endpoint

    style GA fill:#3b82f6,color:#fff
```

### 設定例

```bash
# アクセラレーターの作成
aws globalaccelerator create-accelerator \
    --name my-accelerator \
    --ip-address-type IPV4 \
    --enabled

# リスナーの作成
aws globalaccelerator create-listener \
    --accelerator-arn arn:aws:globalaccelerator::xxx:accelerator/xxx \
    --port-ranges FromPort=80,ToPort=80 FromPort=443,ToPort=443 \
    --protocol TCP

# エンドポイントグループの作成
aws globalaccelerator create-endpoint-group \
    --listener-arn arn:aws:globalaccelerator::xxx:accelerator/xxx/listener/xxx \
    --endpoint-group-region ap-northeast-1 \
    --endpoint-configurations EndpointId=arn:aws:elasticloadbalancing:ap-northeast-1:xxx:loadbalancer/app/xxx,Weight=100
```

### トラフィックダイヤル

リージョン間でトラフィックを調整：

```mermaid
flowchart LR
    GA["Global Accelerator"]

    subgraph Tokyo["東京"]
        ALB1["ALB"]
        Dial1["トラフィックダイヤル: 70%"]
    end

    subgraph Singapore["シンガポール"]
        ALB2["ALB"]
        Dial2["トラフィックダイヤル: 30%"]
    end

    GA --> |"70%"| Tokyo
    GA --> |"30%"| Singapore

    style GA fill:#f59e0b,color:#000
```

## フェイルオーバー設計

### Route 53によるフェイルオーバー

```mermaid
flowchart TB
    subgraph DNS["Route 53"]
        Failover["フェイルオーバーポリシー"]
        HC["ヘルスチェック"]
    end

    subgraph Primary["プライマリリージョン"]
        ALB1["ALB"]
        App1["アプリ"]
    end

    subgraph DR["DRリージョン"]
        ALB2["ALB"]
        App2["アプリ"]
    end

    Failover --> |"正常時"| Primary
    Failover -.-> |"障害時"| DR
    HC --> |"監視"| Primary

    style DNS fill:#3b82f6,color:#fff
    style Primary fill:#22c55e,color:#fff
    style DR fill:#f59e0b,color:#000
```

### Global Acceleratorによるフェイルオーバー

```mermaid
flowchart TB
    subgraph GA["Global Accelerator"]
        Listener["リスナー"]
        HC["ヘルスチェック"]
    end

    subgraph Primary["プライマリ（Weight: 100）"]
        EP1["エンドポイント"]
    end

    subgraph Secondary["セカンダリ（Weight: 0）"]
        EP2["エンドポイント"]
    end

    Listener --> |"正常時"| Primary
    Listener -.-> |"障害時"| Secondary
    HC --> Primary
    HC --> Secondary

    style GA fill:#f59e0b,color:#000
```

### 組み合わせパターン

```mermaid
flowchart TB
    subgraph Traffic["トラフィックフロー"]
        User["ユーザー"]
        R53["Route 53<br/>（CNAME → GA）"]
        GA["Global Accelerator"]
    end

    subgraph Regions["リージョン"]
        Tokyo["東京 ALB"]
        Singapore["シンガポール ALB"]
    end

    User --> R53
    R53 --> GA
    GA --> Tokyo
    GA --> Singapore

    style Traffic fill:#3b82f6,color:#fff
```

## 料金比較

### Route 53

| 項目 | 料金 |
|------|------|
| ホストゾーン | $0.50/月 |
| クエリ | $0.40/100万クエリ |
| ヘルスチェック | $0.50〜$2.00/月 |

### Global Accelerator

| 項目 | 料金 |
|------|------|
| 固定料金 | $0.025/時間 |
| データ転送 | $0.015〜$0.035/GB |

## ベストプラクティス

### Route 53

```mermaid
flowchart TB
    subgraph Best["ベストプラクティス"]
        B1["低いTTLで迅速なフェイルオーバー"]
        B2["ヘルスチェックを必ず設定"]
        B3["エイリアスレコードを活用"]
        B4["プライベートホストゾーンでVPC内DNS"]
    end

    style Best fill:#22c55e,color:#fff
```

### Global Accelerator

| 項目 | 推奨 |
|------|------|
| ヘルスチェック | カスタムポート/パスを設定 |
| クライアントアフィニティ | 必要な場合のみ有効化 |
| トラフィックダイヤル | 段階的な移行に活用 |

## 選択基準

```mermaid
flowchart TD
    Q1{"固定IPが必要？"}
    Q2{"即時フェイルオーバーが必要？"}
    Q3{"UDP/TCPの<br/>低レイテンシーが必要？"}

    Q1 -->|Yes| GA["Global Accelerator"]
    Q1 -->|No| Q2
    Q2 -->|Yes| GA
    Q2 -->|No| Q3
    Q3 -->|Yes| GA
    Q3 -->|No| R53["Route 53"]

    style GA fill:#f59e0b,color:#000
    style R53 fill:#3b82f6,color:#fff
```

## まとめ

```mermaid
flowchart LR
    subgraph Services["サービス"]
        R53["Route 53"]
        GA["Global Accelerator"]
    end

    R53 --> |"DNS管理"| DNS["ルーティングポリシー"]
    R53 --> |"ヘルスチェック"| Health["可用性監視"]
    GA --> |"固定IP"| IP["Anycast IP"]
    GA --> |"高速化"| Speed["AWSバックボーン"]

    style Services fill:#3b82f6,color:#fff
```

| 機能 | Route 53 | Global Accelerator |
|------|----------|-------------------|
| 主な用途 | DNS管理 | ネットワーク高速化 |
| フェイルオーバー | DNS TTL依存 | 即時 |
| 固定IP | ❌ | ✅ |
| コスト | 低い | 中程度 |

Route 53とGlobal Acceleratorを適切に組み合わせることで、グローバルに分散したアプリケーションの可用性とパフォーマンスを最大化できます。

## 参考資料

- [Amazon Route 53 Developer Guide](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/)
- [AWS Global Accelerator Developer Guide](https://docs.aws.amazon.com/global-accelerator/latest/dg/)
- [Routing Policy Comparison](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html)
