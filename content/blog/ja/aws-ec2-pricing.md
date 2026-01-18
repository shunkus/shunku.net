---
title: "EC2購入オプション完全ガイド：On-Demand、Reserved、Savings Plans、Spot"
date: "2025-12-18"
excerpt: "EC2の購入オプションを徹底比較 - On-Demand、Reserved Instances、Savings Plans、Spot Instancesの特徴と使い分け、コスト最適化戦略を解説します。"
tags: ["AWS", "EC2", "Cost Optimization", "Reserved Instances", "Spot"]
author: "Shunku"
---

EC2のコストを最適化するには、ワークロードの特性に応じた購入オプションの選択が重要です。AWSは4つの主要な購入オプションを提供しており、適切に組み合わせることで大幅なコスト削減が可能です。

## 購入オプションの概要

```mermaid
flowchart TB
    subgraph Options["EC2購入オプション"]
        OnDemand["On-Demand<br/>従量課金"]
        Reserved["Reserved Instances<br/>予約"]
        Savings["Savings Plans<br/>コミットメント"]
        Spot["Spot Instances<br/>余剰キャパシティ"]
    end

    OnDemand --> |"柔軟性最大"| Flex["柔軟なワークロード"]
    Reserved --> |"最大72%割引"| Steady["安定したワークロード"]
    Savings --> |"最大72%割引"| Commit["コミット可能"]
    Spot --> |"最大90%割引"| Fault["中断耐性あり"]

    style OnDemand fill:#3b82f6,color:#fff
    style Reserved fill:#22c55e,color:#fff
    style Savings fill:#f59e0b,color:#000
    style Spot fill:#8b5cf6,color:#fff
```

### 比較表

| 項目 | On-Demand | Reserved | Savings Plans | Spot |
|------|-----------|----------|---------------|------|
| 割引率 | 0% | 最大72% | 最大72% | 最大90% |
| コミットメント | なし | 1年/3年 | 1年/3年 | なし |
| 柔軟性 | 最高 | 低 | 中〜高 | 中断あり |
| 用途 | 不定期利用 | 安定利用 | コミット可能 | 中断耐性 |

## On-Demand Instances

### 特徴

```mermaid
flowchart LR
    subgraph OnDemand["On-Demand"]
        O1["秒単位課金"]
        O2["コミットメントなし"]
        O3["即座に起動"]
        O4["いつでも停止"]
    end

    style OnDemand fill:#3b82f6,color:#fff
```

### 適したユースケース

| ユースケース | 理由 |
|-------------|------|
| 開発/テスト | 予測困難、短期利用 |
| 突発的な負荷 | Auto Scalingでの追加 |
| 新規ワークロード | 使用量が未知 |
| 短期プロジェクト | コミット不要 |

## Reserved Instances (RI)

### タイプと支払いオプション

```mermaid
flowchart TB
    subgraph RI["Reserved Instances"]
        subgraph Types["タイプ"]
            Standard["Standard RI<br/>変更制限あり"]
            Convertible["Convertible RI<br/>変更可能"]
        end

        subgraph Payment["支払いオプション"]
            AllUpfront["全額前払い<br/>最大割引"]
            PartialUpfront["一部前払い<br/>中程度割引"]
            NoUpfront["前払いなし<br/>最小割引"]
        end
    end

    style Standard fill:#22c55e,color:#fff
    style Convertible fill:#3b82f6,color:#fff
```

### 割引率（3年、Linux）

| タイプ | 全額前払い | 一部前払い | 前払いなし |
|--------|----------|-----------|-----------|
| Standard | 〜62% | 〜60% | 〜56% |
| Convertible | 〜54% | 〜52% | 〜48% |

### Standard vs Convertible

| 項目 | Standard | Convertible |
|------|----------|-------------|
| インスタンスファミリー変更 | ❌ | ✅ |
| OS変更 | ❌ | ✅ |
| テナンシー変更 | ❌ | ✅ |
| マーケットプレイス売却 | ✅ | ❌ |
| 割引率 | 高い | 低い |

### リージョナル vs ゾーン

| 項目 | リージョナルRI | ゾーンRI |
|------|---------------|----------|
| キャパシティ予約 | なし | あり |
| AZの柔軟性 | あり | 特定AZのみ |
| インスタンスサイズ | 柔軟（同ファミリー内） | 固定 |

## Savings Plans

### タイプ

```mermaid
flowchart TB
    subgraph SavingsPlans["Savings Plans"]
        Compute["Compute Savings Plans<br/>最大66%割引"]
        EC2["EC2 Instance Savings Plans<br/>最大72%割引"]
        SageMaker["SageMaker Savings Plans"]
    end

    Compute --> |"EC2, Fargate, Lambda"| Flexible["最も柔軟"]
    EC2 --> |"特定ファミリー"| Discount["最大割引"]

    style Compute fill:#f59e0b,color:#000
    style EC2 fill:#22c55e,color:#fff
```

### Compute vs EC2 Instance Savings Plans

| 項目 | Compute SP | EC2 Instance SP |
|------|------------|-----------------|
| リージョン変更 | ✅ | ❌ |
| ファミリー変更 | ✅ | ❌ |
| OS変更 | ✅ | ✅ |
| テナンシー変更 | ✅ | ✅ |
| 対象サービス | EC2, Fargate, Lambda | EC2のみ |
| 割引率 | 中程度 | 最大 |

### RI vs Savings Plans

```mermaid
flowchart TD
    Q1{"柔軟性を重視？"}
    Q2{"サービス横断？"}
    Q3{"最大割引を重視？"}

    Q1 -->|Yes| Q2
    Q1 -->|No| RI["Reserved Instances"]

    Q2 -->|Yes| ComputeSP["Compute Savings Plans"]
    Q2 -->|No| Q3

    Q3 -->|Yes| EC2SP["EC2 Instance SP"]
    Q3 -->|No| ComputeSP

    style RI fill:#22c55e,color:#fff
    style ComputeSP fill:#f59e0b,color:#000
    style EC2SP fill:#3b82f6,color:#fff
```

## Spot Instances

### 概要

AWSの余剰キャパシティを最大90%割引で利用できます。ただし、2分前の通知で中断される可能性があります。

```mermaid
flowchart TB
    subgraph Spot["Spot Instances"]
        Request["Spotリクエスト"]
        Pool["Spotプール"]
        Interrupt["中断通知"]
    end

    Request --> |"入札価格"| Pool
    Pool --> |"キャパシティ不足時"| Interrupt
    Interrupt --> |"2分前通知"| Terminate["終了"]

    style Interrupt fill:#ef4444,color:#fff
```

### 中断対策

| 戦略 | 説明 |
|------|------|
| 複数AZ/ファミリー | キャパシティプールの分散 |
| Spot Fleet | 複数プールから調達 |
| 中断ハンドリング | 通知を検知して処理 |
| チェックポイント | 進捗を定期保存 |

### 中断通知の検知

```bash
# EC2メタデータから中断通知を確認
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" \
    -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

curl -H "X-aws-ec2-metadata-token: $TOKEN" \
    http://169.254.169.254/latest/meta-data/spot/instance-action
```

### Spot Fleet

```json
{
  "SpotFleetRequestConfig": {
    "IamFleetRole": "arn:aws:iam::xxx:role/SpotFleetRole",
    "TargetCapacity": 10,
    "SpotPrice": "0.05",
    "AllocationStrategy": "capacityOptimized",
    "LaunchTemplateConfigs": [
      {
        "LaunchTemplateSpecification": {
          "LaunchTemplateId": "lt-xxx",
          "Version": "1"
        },
        "Overrides": [
          {"InstanceType": "m5.large", "AvailabilityZone": "ap-northeast-1a"},
          {"InstanceType": "m5.xlarge", "AvailabilityZone": "ap-northeast-1a"},
          {"InstanceType": "m4.large", "AvailabilityZone": "ap-northeast-1c"}
        ]
      }
    ]
  }
}
```

### 適したユースケース

```mermaid
flowchart TB
    subgraph SpotUseCases["Spotに適したワークロード"]
        Batch["バッチ処理"]
        CI["CI/CDパイプライン"]
        ML["機械学習トレーニング"]
        HPC["HPCクラスター"]
        Analytics["ビッグデータ分析"]
    end

    style SpotUseCases fill:#8b5cf6,color:#fff
```

## 購入オプションの組み合わせ

### ベースライン + 変動対応

```mermaid
flowchart TB
    subgraph Baseline["ベースライン（予測可能）"]
        RI["Reserved / Savings Plans"]
    end

    subgraph Variable["変動部分"]
        Spot["Spot<br/>（中断耐性あり）"]
        OnDemand["On-Demand<br/>（中断耐性なし）"]
    end

    subgraph Total["総キャパシティ"]
        Mix["RI/SP 60% + Spot 30% + OD 10%"]
    end

    Baseline --> Mix
    Variable --> Mix

    style Baseline fill:#22c55e,color:#fff
    style Variable fill:#f59e0b,color:#000
```

### Auto Scaling Groupでの混合

```json
{
  "MixedInstancesPolicy": {
    "InstancesDistribution": {
      "OnDemandBaseCapacity": 2,
      "OnDemandPercentageAboveBaseCapacity": 20,
      "SpotAllocationStrategy": "capacity-optimized"
    },
    "LaunchTemplate": {
      "LaunchTemplateSpecification": {
        "LaunchTemplateId": "lt-xxx",
        "Version": "$Latest"
      },
      "Overrides": [
        {"InstanceType": "m5.large"},
        {"InstanceType": "m5.xlarge"},
        {"InstanceType": "m4.large"}
      ]
    }
  }
}
```

## コスト最適化のフレームワーク

### 選択フローチャート

```mermaid
flowchart TD
    Start["ワークロードの特性は？"]
    Q1{"24/7稼働<br/>安定利用？"}
    Q2{"中断に<br/>耐えられる？"}
    Q3{"サービス横断<br/>の柔軟性？"}

    Start --> Q1
    Q1 -->|Yes| Q3
    Q1 -->|No| Q2

    Q2 -->|Yes| Spot["Spot Instances"]
    Q2 -->|No| OnDemand["On-Demand"]

    Q3 -->|Yes| ComputeSP["Compute SP"]
    Q3 -->|No| EC2SP["EC2 Instance SP / RI"]

    style Spot fill:#8b5cf6,color:#fff
    style OnDemand fill:#3b82f6,color:#fff
    style ComputeSP fill:#f59e0b,color:#000
    style EC2SP fill:#22c55e,color:#fff
```

### 推奨割合

| ワークロードタイプ | RI/SP | Spot | On-Demand |
|------------------|-------|------|-----------|
| 本番Webサーバー | 70% | 0% | 30% |
| バッチ処理 | 20% | 70% | 10% |
| 開発/テスト | 0% | 50% | 50% |
| CI/CD | 0% | 80% | 20% |

## まとめ

```mermaid
flowchart TB
    subgraph Options["購入オプション"]
        OD["On-Demand"]
        RI["Reserved Instances"]
        SP["Savings Plans"]
        Spot["Spot"]
    end

    OD --> |"柔軟性"| Flexible["不定期利用"]
    RI --> |"最大割引"| Stable["安定利用"]
    SP --> |"バランス"| Commitment["コミット可能"]
    Spot --> |"最安"| Interruptible["中断耐性"]

    style Options fill:#3b82f6,color:#fff
```

| オプション | 主なユースケース | 割引率 |
|-----------|----------------|--------|
| On-Demand | 不定期/テスト | 0% |
| Reserved | 安定した本番 | 〜72% |
| Savings Plans | 柔軟なコミット | 〜72% |
| Spot | バッチ/CI/CD | 〜90% |

適切な購入オプションの組み合わせにより、パフォーマンスを維持しながらEC2コストを大幅に削減できます。

## 参考資料

- [EC2 Pricing](https://aws.amazon.com/ec2/pricing/)
- [Reserved Instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-reserved-instances.html)
- [Savings Plans](https://docs.aws.amazon.com/savingsplans/latest/userguide/)
- [Spot Instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-spot-instances.html)
