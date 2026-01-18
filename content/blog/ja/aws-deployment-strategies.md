---
title: "AWSデプロイ戦略：Blue/Green、Canary、Rolling、CodeDeploy"
date: "2025-12-21"
excerpt: "AWSでのデプロイ戦略を徹底解説 - Blue/Green、Canary、Rollingデプロイメント、CodeDeploy、ECS/EKSでのデプロイベストプラクティスを紹介します。"
tags: ["AWS", "Deployment", "CI/CD", "CodeDeploy", "DevOps"]
author: "Shunku"
---

安全で効率的なデプロイは、継続的デリバリーの成功に不可欠です。AWSは複数のデプロイ戦略とサービスを提供しており、ワークロードに応じて適切な方法を選択できます。

## デプロイ戦略の概要

```mermaid
flowchart TB
    subgraph Strategies["デプロイ戦略"]
        AllAtOnce["All at Once<br/>一括"]
        Rolling["Rolling<br/>ローリング"]
        BlueGreen["Blue/Green<br/>切り替え"]
        Canary["Canary<br/>段階的"]
    end

    AllAtOnce --> |"最速/最リスク"| Fast["高速デプロイ"]
    Rolling --> |"段階的/低リスク"| Gradual["段階的更新"]
    BlueGreen --> |"即時切替/ロールバック"| Safe["安全なデプロイ"]
    Canary --> |"検証/最小リスク"| Test["テスト的デプロイ"]

    style AllAtOnce fill:#ef4444,color:#fff
    style Rolling fill:#f59e0b,color:#000
    style BlueGreen fill:#22c55e,color:#fff
    style Canary fill:#3b82f6,color:#fff
```

### 比較表

| 戦略 | ダウンタイム | ロールバック | コスト | 複雑さ |
|------|------------|-------------|--------|--------|
| All at Once | あり | 遅い | 最低 | 低 |
| Rolling | なし | 中程度 | 低 | 中 |
| Blue/Green | なし | 即時 | 高（2倍） | 中 |
| Canary | なし | 即時 | 中程度 | 高 |

## All at Once（一括デプロイ）

### 概要

すべてのインスタンスを同時に更新します。

```mermaid
flowchart TB
    subgraph Before["更新前"]
        V1_1["v1"]
        V1_2["v1"]
        V1_3["v1"]
    end

    subgraph After["更新後"]
        V2_1["v2"]
        V2_2["v2"]
        V2_3["v2"]
    end

    Before --> |"一括更新"| After

    style Before fill:#3b82f6,color:#fff
    style After fill:#22c55e,color:#fff
```

### 適したケース

- 開発/テスト環境
- ダウンタイムが許容される場合
- 迅速なデプロイが必要な場合

## Rolling（ローリングデプロイ）

### 概要

インスタンスを順次更新します。

```mermaid
flowchart TB
    subgraph Phase1["フェーズ1"]
        P1_1["v2 ✓"]
        P1_2["v1"]
        P1_3["v1"]
        P1_4["v1"]
    end

    subgraph Phase2["フェーズ2"]
        P2_1["v2 ✓"]
        P2_2["v2 ✓"]
        P2_3["v1"]
        P2_4["v1"]
    end

    subgraph Phase3["完了"]
        P3_1["v2 ✓"]
        P3_2["v2 ✓"]
        P3_3["v2 ✓"]
        P3_4["v2 ✓"]
    end

    Phase1 --> Phase2 --> Phase3

    style Phase1 fill:#f59e0b,color:#000
    style Phase2 fill:#f59e0b,color:#000
    style Phase3 fill:#22c55e,color:#fff
```

### バリエーション

| タイプ | 説明 |
|--------|------|
| Rolling | 1つずつ更新 |
| Rolling with Additional Batch | 追加インスタンスで更新 |
| Immutable | 新規インスタンスグループ作成 |

## Blue/Green デプロイ

### 概要

2つの同一環境を用意し、トラフィックを切り替えます。

```mermaid
flowchart TB
    subgraph LoadBalancer["ロードバランサー"]
        ALB["ALB"]
    end

    subgraph Blue["Blue環境（現行）"]
        B1["v1"]
        B2["v1"]
    end

    subgraph Green["Green環境（新規）"]
        G1["v2"]
        G2["v2"]
    end

    ALB --> |"100%"| Blue
    ALB -.-> |"切り替え後"| Green

    style Blue fill:#3b82f6,color:#fff
    style Green fill:#22c55e,color:#fff
```

### 実装方法

| サービス | 実装方法 |
|---------|---------|
| EC2 | Auto Scaling Group の切り替え |
| ECS | CodeDeploy Blue/Green |
| Lambda | バージョン/エイリアス |
| RDS | Blue/Green Deployments |

### Route 53での切り替え

```bash
# 加重ルーティングで段階的に切り替え
aws route53 change-resource-record-sets \
    --hosted-zone-id Z1234 \
    --change-batch '{
        "Changes": [{
            "Action": "UPSERT",
            "ResourceRecordSet": {
                "Name": "app.example.com",
                "Type": "A",
                "SetIdentifier": "green",
                "Weight": 100,
                "AliasTarget": {
                    "HostedZoneId": "Z5678",
                    "DNSName": "green-alb.example.com",
                    "EvaluateTargetHealth": true
                }
            }
        }]
    }'
```

## Canary デプロイ

### 概要

新バージョンを少数のインスタンスにデプロイし、段階的に拡大します。

```mermaid
flowchart TB
    subgraph Phase1["フェーズ1: 10%"]
        C1_1["v2"]
        C1_2["v1"]
        C1_3["v1"]
        C1_4["v1"]
    end

    subgraph Phase2["フェーズ2: 50%"]
        C2_1["v2"]
        C2_2["v2"]
        C2_3["v1"]
        C2_4["v1"]
    end

    subgraph Phase3["フェーズ3: 100%"]
        C3_1["v2"]
        C3_2["v2"]
        C3_3["v2"]
        C3_4["v2"]
    end

    Phase1 --> |"検証OK"| Phase2
    Phase2 --> |"検証OK"| Phase3

    style Phase1 fill:#3b82f6,color:#fff
    style Phase2 fill:#f59e0b,color:#000
    style Phase3 fill:#22c55e,color:#fff
```

### CodeDeployの設定

```yaml
# CodeDeploy Canary設定
version: 0.0
Resources:
  - TargetService:
      Type: AWS::ECS::Service
      Properties:
        TaskDefinition: "arn:aws:ecs:..."
        LoadBalancerInfo:
          ContainerName: "app"
          ContainerPort: 80
        PlatformVersion: "LATEST"
Hooks:
  - BeforeAllowTraffic: "LambdaFunctionForValidation"
  - AfterAllowTraffic: "LambdaFunctionForSmokeTest"
```

## AWS CodeDeploy

### デプロイタイプ

```mermaid
flowchart TB
    subgraph CodeDeploy["CodeDeploy"]
        EC2["EC2/オンプレミス"]
        ECS["Amazon ECS"]
        Lambda["Lambda"]
    end

    EC2 --> |"In-place/Blue-Green"| EC2Deploy["EC2デプロイ"]
    ECS --> |"Blue-Green"| ECSDeploy["ECSデプロイ"]
    Lambda --> |"Canary/Linear"| LambdaDeploy["Lambdaデプロイ"]

    style CodeDeploy fill:#f59e0b,color:#000
```

### デプロイ設定

| 設定 | 説明 |
|------|------|
| CodeDeployDefault.AllAtOnce | すべて同時 |
| CodeDeployDefault.HalfAtATime | 半分ずつ |
| CodeDeployDefault.OneAtATime | 1つずつ |
| CodeDeployDefault.LambdaCanary10Percent5Minutes | 10%→5分後に残り |
| CodeDeployDefault.LambdaLinear10PercentEvery1Minute | 毎分10%ずつ |

### appspec.yml（EC2）

```yaml
version: 0.0
os: linux
files:
  - source: /
    destination: /var/www/html
hooks:
  BeforeInstall:
    - location: scripts/stop_server.sh
      timeout: 300
  AfterInstall:
    - location: scripts/install_dependencies.sh
      timeout: 300
  ApplicationStart:
    - location: scripts/start_server.sh
      timeout: 300
  ValidateService:
    - location: scripts/validate_service.sh
      timeout: 300
```

## ECSデプロイ戦略

### デプロイタイプ

```mermaid
flowchart TB
    subgraph ECSDeployment["ECSデプロイ"]
        Rolling["ローリング更新"]
        BlueGreen["Blue/Green<br/>（CodeDeploy）"]
        External["外部デプロイ"]
    end

    Rolling --> |"デフォルト"| Simple["シンプル"]
    BlueGreen --> |"安全"| Safe["本番推奨"]
    External --> |"カスタム"| Custom["高度な制御"]

    style BlueGreen fill:#22c55e,color:#fff
```

### ローリング更新設定

```json
{
  "deploymentConfiguration": {
    "maximumPercent": 200,
    "minimumHealthyPercent": 100
  }
}
```

### Blue/Green（CodeDeploy）

```mermaid
flowchart TB
    subgraph ALB["Application Load Balancer"]
        Listener["リスナー"]
        TG1["ターゲットグループ1<br/>（Blue）"]
        TG2["ターゲットグループ2<br/>（Green）"]
    end

    subgraph ECS["ECS Service"]
        Tasks1["現行タスク"]
        Tasks2["新タスク"]
    end

    Listener --> TG1
    TG1 --> Tasks1
    TG2 --> Tasks2

    style TG1 fill:#3b82f6,color:#fff
    style TG2 fill:#22c55e,color:#fff
```

## Lambdaデプロイ戦略

### バージョンとエイリアス

```mermaid
flowchart LR
    subgraph Lambda["Lambda関数"]
        V1["バージョン1"]
        V2["バージョン2"]
        Alias["エイリアス: prod"]
    end

    Alias --> |"90%"| V1
    Alias --> |"10%"| V2

    style Alias fill:#f59e0b,color:#000
```

### SAMでのCanary設定

```yaml
Resources:
  MyFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: my-function
      AutoPublishAlias: live
      DeploymentPreference:
        Type: Canary10Percent5Minutes
        Alarms:
          - !Ref ErrorAlarm
        Hooks:
          PreTraffic: !Ref PreTrafficHook
          PostTraffic: !Ref PostTrafficHook
```

## ロールバック戦略

### 自動ロールバック

```mermaid
flowchart TB
    subgraph Triggers["ロールバックトリガー"]
        Alarm["CloudWatchアラーム"]
        Health["ヘルスチェック失敗"]
        Manual["手動トリガー"]
    end

    subgraph Actions["アクション"]
        Revert["前バージョンに戻す"]
        Notify["通知"]
        Log["ログ記録"]
    end

    Triggers --> Actions

    style Triggers fill:#ef4444,color:#fff
    style Actions fill:#22c55e,color:#fff
```

### CodeDeployロールバック設定

```json
{
  "autoRollbackConfiguration": {
    "enabled": true,
    "events": [
      "DEPLOYMENT_FAILURE",
      "DEPLOYMENT_STOP_ON_ALARM",
      "DEPLOYMENT_STOP_ON_REQUEST"
    ]
  },
  "alarmConfiguration": {
    "enabled": true,
    "alarms": [
      {"name": "HighErrorRate"},
      {"name": "HighLatency"}
    ]
  }
}
```

## ベストプラクティス

### デプロイ戦略の選択

```mermaid
flowchart TD
    Q1{"本番環境？"}
    Q2{"ダウンタイム許容？"}
    Q3{"迅速なロールバック必要？"}
    Q4{"段階的検証必要？"}

    Q1 -->|No| AllAtOnce["All at Once"]
    Q1 -->|Yes| Q2

    Q2 -->|Yes| Rolling["Rolling"]
    Q2 -->|No| Q3

    Q3 -->|Yes| Q4
    Q3 -->|No| Rolling

    Q4 -->|Yes| Canary["Canary"]
    Q4 -->|No| BlueGreen["Blue/Green"]

    style AllAtOnce fill:#6b7280,color:#fff
    style Rolling fill:#f59e0b,color:#000
    style BlueGreen fill:#22c55e,color:#fff
    style Canary fill:#3b82f6,color:#fff
```

### チェックリスト

| フェーズ | チェック項目 |
|---------|-------------|
| 事前 | ヘルスチェック設定 |
| 事前 | ロールバック手順確認 |
| 事前 | モニタリング設定 |
| デプロイ中 | メトリクス監視 |
| デプロイ中 | エラーログ確認 |
| 事後 | 動作検証 |
| 事後 | パフォーマンス確認 |

## まとめ

```mermaid
flowchart TB
    subgraph Deployment["デプロイ戦略"]
        Strategy["戦略選択"]
        Tool["ツール選択"]
        Monitor["監視"]
        Rollback["ロールバック"]
    end

    Strategy --> |"リスク許容度"| Risk["リスク評価"]
    Tool --> |"CodeDeploy/ECS/Lambda"| Service["サービス選択"]
    Monitor --> |"CloudWatch"| Metrics["メトリクス"]
    Rollback --> |"Automation"| Safety["安全性"]

    style Deployment fill:#3b82f6,color:#fff
```

| 戦略 | 推奨環境 | リスク |
|------|---------|--------|
| All at Once | 開発/テスト | 高 |
| Rolling | ステージング | 中 |
| Blue/Green | 本番 | 低 |
| Canary | 本番（重要） | 最低 |

適切なデプロイ戦略の選択により、安全で効率的なリリースを実現できます。

## 参考資料

- [AWS CodeDeploy User Guide](https://docs.aws.amazon.com/codedeploy/latest/userguide/)
- [Amazon ECS Deployment Types](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/deployment-types.html)
- [Lambda Deployment Preferences](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/automating-updates-to-serverless-apps.html)
