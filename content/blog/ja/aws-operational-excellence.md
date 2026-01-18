---
title: "AWSオペレーショナルエクセレンス：Observability、自動化、Runbooks"
date: "2025-12-23"
excerpt: "AWSにおけるオペレーショナルエクセレンスを徹底解説 - Observability、自動化、Runbooks、インシデント管理のベストプラクティスを紹介します。"
tags: ["AWS", "運用", "Observability", "自動化", "Well-Architected"]
author: "Shunku"
---

オペレーショナルエクセレンスは、AWS Well-Architected Frameworkの柱の1つです。システムを効果的に運用し、継続的に改善するための設計原則とベストプラクティスを提供します。

## オペレーショナルエクセレンスの原則

```mermaid
flowchart TB
    subgraph Principles["設計原則"]
        P1["運用をコードとして実行"]
        P2["頻繁で小さな可逆的な変更"]
        P3["運用手順の定期的な改善"]
        P4["障害を予測"]
        P5["すべての運用イベントから学ぶ"]
    end

    style Principles fill:#3b82f6,color:#fff
```

## Observability（可観測性）

### 3つの柱

```mermaid
flowchart TB
    subgraph Observability["Observability"]
        Metrics["メトリクス<br/>数値データ"]
        Logs["ログ<br/>イベント記録"]
        Traces["トレース<br/>リクエスト追跡"]
    end

    Metrics --> CloudWatch["CloudWatch Metrics"]
    Logs --> CWLogs["CloudWatch Logs"]
    Traces --> XRay["X-Ray"]

    style Observability fill:#22c55e,color:#fff
```

### CloudWatch

```mermaid
flowchart TB
    subgraph CloudWatch["Amazon CloudWatch"]
        Metrics["Metrics"]
        Logs["Logs"]
        Alarms["Alarms"]
        Dashboards["Dashboards"]
        Insights["Logs Insights"]
        Anomaly["Anomaly Detection"]
    end

    style CloudWatch fill:#f59e0b,color:#000
```

#### メトリクス

| メトリクスタイプ | 説明 | 例 |
|----------------|------|-----|
| 標準メトリクス | 自動収集 | CPUUtilization |
| カスタムメトリクス | 手動送信 | アプリ固有の値 |
| 高解像度メトリクス | 1秒間隔 | リアルタイム監視 |
| 埋め込みメトリクス | ログから抽出 | EMF形式 |

```bash
# カスタムメトリクスの送信
aws cloudwatch put-metric-data \
    --namespace "MyApp" \
    --metric-name "OrderCount" \
    --value 100 \
    --unit "Count" \
    --dimensions "Environment=prod"
```

#### CloudWatch Logs

```mermaid
flowchart LR
    subgraph Sources["ログソース"]
        EC2["EC2"]
        Lambda["Lambda"]
        ECS["ECS"]
        API["API Gateway"]
    end

    subgraph CWLogs["CloudWatch Logs"]
        LogGroup["ロググループ"]
        LogStream["ログストリーム"]
        Insights["Logs Insights"]
        Sub["サブスクリプション"]
    end

    subgraph Destinations["送信先"]
        S3["S3"]
        ES["OpenSearch"]
        Lambda2["Lambda"]
        Kinesis["Kinesis"]
    end

    Sources --> CWLogs
    CWLogs --> |"エクスポート"| Destinations

    style CWLogs fill:#f59e0b,color:#000
```

#### Logs Insightsクエリ

```sql
-- エラーログの検索
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 100

-- レイテンシー分析
fields @timestamp, @duration
| stats avg(@duration), max(@duration), min(@duration)
  by bin(5m)

-- 特定パターンの集計
fields @message
| parse @message /user=(?<user>\S+)/
| stats count(*) by user
| sort count desc
```

#### アラーム

```yaml
# CloudFormationでのアラーム定義
Resources:
  HighCPUAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: HighCPUUtilization
      AlarmDescription: CPU utilization exceeded 80%
      MetricName: CPUUtilization
      Namespace: AWS/EC2
      Statistic: Average
      Period: 300
      EvaluationPeriods: 2
      Threshold: 80
      ComparisonOperator: GreaterThanThreshold
      Dimensions:
        - Name: InstanceId
          Value: !Ref MyInstance
      AlarmActions:
        - !Ref AlertSNSTopic
```

### AWS X-Ray

```mermaid
flowchart TB
    subgraph XRay["X-Ray"]
        Trace["トレース"]
        Segment["セグメント"]
        Subsegment["サブセグメント"]
        ServiceMap["サービスマップ"]
    end

    Client["クライアント"] --> API["API Gateway"]
    API --> Lambda["Lambda"]
    Lambda --> DynamoDB["DynamoDB"]
    Lambda --> S3["S3"]

    XRay --> |"可視化"| ServiceMap

    style XRay fill:#8b5cf6,color:#fff
```

#### X-Rayの概念

| 概念 | 説明 |
|------|------|
| トレース | 1リクエストの全体フロー |
| セグメント | 1サービスの処理単位 |
| サブセグメント | セグメント内の詳細 |
| アノテーション | 検索可能なメタデータ |
| メタデータ | 追加情報（検索不可） |

```python
# Lambda関数でのX-Ray
from aws_xray_sdk.core import xray_recorder

@xray_recorder.capture('process_order')
def process_order(order_id):
    # アノテーションを追加
    xray_recorder.put_annotation('order_id', order_id)

    # サブセグメント
    with xray_recorder.in_subsegment('validate'):
        validate_order(order_id)

    with xray_recorder.in_subsegment('save'):
        save_order(order_id)
```

### CloudWatch Application Insights

```mermaid
flowchart TB
    subgraph AppInsights["Application Insights"]
        Auto["自動検出"]
        ML["機械学習分析"]
        Problems["問題検出"]
    end

    Apps["アプリケーション"] --> Auto
    Auto --> ML
    ML --> Problems
    Problems --> |"通知"| Ops["運用チーム"]

    style AppInsights fill:#22c55e,color:#fff
```

## 自動化

### AWS Systems Manager

```mermaid
flowchart TB
    subgraph SSM["Systems Manager"]
        subgraph Automation["自動化"]
            RunCommand["Run Command"]
            Automation2["Automation"]
            StateManager["State Manager"]
        end

        subgraph Operations["運用"]
            PatchManager["Patch Manager"]
            Maintenance["Maintenance Windows"]
            OpsCenter["OpsCenter"]
        end

        subgraph Inventory["インベントリ"]
            InventoryCol["Inventory"]
            CompConfig["Compliance"]
        end
    end

    style SSM fill:#f59e0b,color:#000
```

### Run Command

```bash
# パッチ適用
aws ssm send-command \
    --document-name "AWS-RunPatchBaseline" \
    --targets "Key=tag:Environment,Values=prod" \
    --parameters "Operation=Install"

# スクリプト実行
aws ssm send-command \
    --document-name "AWS-RunShellScript" \
    --targets "Key=InstanceIds,Values=i-1234567890abcdef0" \
    --parameters '{"commands":["echo Hello World"]}'
```

### Automation Runbook

```yaml
# SSM Automationドキュメント
schemaVersion: '0.3'
description: 'Remediate unencrypted S3 bucket'
assumeRole: '{{AutomationAssumeRole}}'
parameters:
  BucketName:
    type: String
    description: 'S3 Bucket Name'
  AutomationAssumeRole:
    type: String

mainSteps:
  - name: EnableEncryption
    action: aws:executeAwsApi
    inputs:
      Service: s3
      Api: PutBucketEncryption
      Bucket: '{{BucketName}}'
      ServerSideEncryptionConfiguration:
        Rules:
          - ApplyServerSideEncryptionByDefault:
              SSEAlgorithm: AES256

  - name: VerifyEncryption
    action: aws:executeAwsApi
    inputs:
      Service: s3
      Api: GetBucketEncryption
      Bucket: '{{BucketName}}'
```

### EventBridge

```mermaid
flowchart LR
    subgraph Sources["イベントソース"]
        AWS["AWSサービス"]
        Custom["カスタム"]
        SaaS["SaaS"]
    end

    subgraph EventBridge["EventBridge"]
        Rules["ルール"]
        Bus["イベントバス"]
    end

    subgraph Targets["ターゲット"]
        Lambda["Lambda"]
        SSM["SSM Automation"]
        SNS["SNS"]
        SQS["SQS"]
    end

    Sources --> Bus
    Bus --> Rules
    Rules --> Targets

    style EventBridge fill:#3b82f6,color:#fff
```

#### イベントパターン

```json
{
  "source": ["aws.ec2"],
  "detail-type": ["EC2 Instance State-change Notification"],
  "detail": {
    "state": ["stopped", "terminated"]
  }
}
```

#### スケジュール

```json
{
  "schedule": "rate(5 minutes)"
}

{
  "schedule": "cron(0 9 * * ? *)"
}
```

### Step Functions

```mermaid
flowchart TB
    subgraph StepFunctions["Step Functions"]
        Start["開始"]
        Task1["タスク1"]
        Choice["分岐"]
        Task2A["タスク2A"]
        Task2B["タスク2B"]
        Parallel["並列処理"]
        End["終了"]
    end

    Start --> Task1
    Task1 --> Choice
    Choice --> |"条件A"| Task2A
    Choice --> |"条件B"| Task2B
    Task2A --> Parallel
    Task2B --> Parallel
    Parallel --> End

    style StepFunctions fill:#8b5cf6,color:#fff
```

#### 状態タイプ

| タイプ | 説明 |
|--------|------|
| Task | Lambda、ECS等の実行 |
| Choice | 条件分岐 |
| Parallel | 並列実行 |
| Wait | 待機 |
| Pass | パススルー |
| Succeed/Fail | 終了状態 |
| Map | 配列の反復処理 |

```json
{
  "StartAt": "ProcessOrder",
  "States": {
    "ProcessOrder": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:...:ProcessOrder",
      "Next": "CheckInventory"
    },
    "CheckInventory": {
      "Type": "Choice",
      "Choices": [
        {
          "Variable": "$.inStock",
          "BooleanEquals": true,
          "Next": "ShipOrder"
        }
      ],
      "Default": "BackOrder"
    },
    "ShipOrder": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:...:ShipOrder",
      "End": true
    },
    "BackOrder": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:...:BackOrder",
      "End": true
    }
  }
}
```

## インシデント管理

### AWS Incident Manager

```mermaid
flowchart TB
    subgraph IncidentManager["Incident Manager"]
        Detection["検出"]
        Response["対応"]
        Analysis["分析"]
    end

    subgraph Components["構成要素"]
        ResponsePlan["対応計画"]
        Contacts["連絡先"]
        Escalation["エスカレーション"]
        Runbooks["Runbooks"]
    end

    Detection --> ResponsePlan
    ResponsePlan --> Contacts
    ResponsePlan --> Runbooks
    Contacts --> Escalation

    style IncidentManager fill:#ef4444,color:#fff
```

### 対応計画

```yaml
# 対応計画の構成要素
ResponsePlan:
  - DisplayName: "Production Incident"
  - IncidentTemplate:
      Title: "Production Service Degradation"
      Impact: 2  # 1-5
      Summary: "Production service experiencing issues"
  - Engagements:
      - ContactId: oncall-team
  - Actions:
      - SSMAutomation:
          DocumentName: "CollectDiagnostics"
          RoleArn: "arn:aws:iam::xxx:role/IncidentRole"
```

### OpsCenter

```mermaid
flowchart LR
    subgraph Sources["ソース"]
        CloudWatch["CloudWatch"]
        Config["Config"]
        SecurityHub["Security Hub"]
        Manual["手動"]
    end

    subgraph OpsCenter["OpsCenter"]
        OpsItems["OpsItems"]
        Runbooks["関連Runbooks"]
        Resources["関連リソース"]
    end

    Sources --> OpsItems
    OpsItems --> |"解決"| Runbooks

    style OpsCenter fill:#f59e0b,color:#000
```

## 変更管理

### AWS Config

```mermaid
flowchart TB
    subgraph Config["AWS Config"]
        Recorder["Configuration Recorder"]
        Rules["Config Rules"]
        Remediation["自動修復"]
    end

    Resources["AWSリソース"] --> Recorder
    Recorder --> |"変更検出"| Rules
    Rules --> |"非準拠"| Remediation

    style Config fill:#22c55e,color:#fff
```

### Config Rules

```yaml
# カスタムConfig Rule
Resources:
  S3BucketPublicReadProhibited:
    Type: AWS::Config::ConfigRule
    Properties:
      ConfigRuleName: s3-bucket-public-read-prohibited
      Source:
        Owner: AWS
        SourceIdentifier: S3_BUCKET_PUBLIC_READ_PROHIBITED
      Scope:
        ComplianceResourceTypes:
          - AWS::S3::Bucket

  # 自動修復
  RemediationConfiguration:
    Type: AWS::Config::RemediationConfiguration
    Properties:
      ConfigRuleName: !Ref S3BucketPublicReadProhibited
      Automatic: true
      TargetId: AWS-DisableS3BucketPublicReadWrite
      TargetType: SSM_DOCUMENT
      Parameters:
        S3BucketName:
          ResourceValue:
            Value: RESOURCE_ID
```

### CloudTrail

```mermaid
flowchart TB
    subgraph CloudTrail["CloudTrail"]
        Management["管理イベント"]
        Data["データイベント"]
        Insights["Insights"]
    end

    subgraph Storage["保存"]
        S3["S3"]
        CWLogs["CloudWatch Logs"]
    end

    CloudTrail --> S3
    CloudTrail --> CWLogs

    style CloudTrail fill:#3b82f6,color:#fff
```

## ベストプラクティス

### 運用の成熟度モデル

```mermaid
flowchart TB
    subgraph Maturity["成熟度レベル"]
        L1["レベル1: 手動"]
        L2["レベル2: 部分自動化"]
        L3["レベル3: 完全自動化"]
        L4["レベル4: 予測的"]
    end

    L1 --> L2
    L2 --> L3
    L3 --> L4

    style L4 fill:#22c55e,color:#fff
```

### チェックリスト

| 領域 | チェック項目 |
|------|-------------|
| Observability | メトリクス、ログ、トレース設定 |
| アラート | 適切なしきい値、通知経路 |
| 自動化 | Runbook整備、自動修復 |
| 変更管理 | 変更追跡、コンプライアンス |
| インシデント | 対応計画、エスカレーション |

### ダッシュボード設計

```mermaid
flowchart TB
    subgraph Dashboard["ダッシュボード"]
        Exec["エグゼクティブ<br/>（KPI）"]
        Ops["運用<br/>（詳細メトリクス）"]
        Dev["開発<br/>（デバッグ情報）"]
    end

    Exec --> |"ドリルダウン"| Ops
    Ops --> |"ドリルダウン"| Dev

    style Dashboard fill:#3b82f6,color:#fff
```

## まとめ

```mermaid
flowchart TB
    subgraph OpEx["オペレーショナルエクセレンス"]
        Observe["Observability<br/>監視・可視化"]
        Automate["Automation<br/>自動化"]
        Respond["Incident Response<br/>インシデント対応"]
        Improve["Continuous Improvement<br/>継続的改善"]
    end

    Observe --> Automate
    Automate --> Respond
    Respond --> Improve
    Improve --> Observe

    style OpEx fill:#3b82f6,color:#fff
```

| 領域 | 主要サービス |
|------|-------------|
| モニタリング | CloudWatch, X-Ray |
| 自動化 | Systems Manager, EventBridge, Step Functions |
| インシデント管理 | Incident Manager, OpsCenter |
| 変更管理 | Config, CloudTrail |

効果的な運用を実現するには、適切な可観測性の確保、自動化の推進、インシデント対応の体制整備が不可欠です。継続的な改善により、運用の成熟度を高めていきましょう。

## 参考資料

- [AWS Well-Architected Framework - Operational Excellence](https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/)
- [Amazon CloudWatch User Guide](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/)
- [AWS Systems Manager User Guide](https://docs.aws.amazon.com/systems-manager/latest/userguide/)
- [AWS X-Ray Developer Guide](https://docs.aws.amazon.com/xray/latest/devguide/)
