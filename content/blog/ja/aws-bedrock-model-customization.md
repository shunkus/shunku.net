---
title: "Amazon Bedrockモデルカスタマイズとファインチューニング"
date: "2025-01-18"
excerpt: "Amazon Bedrockで基盤モデルをドメインに合わせてカスタマイズ。継続事前学習、ファインチューニング、データ準備、評価技術を解説します。"
tags: ["AWS", "Amazon Bedrock", "Generative AI", "Fine-Tuning", "Model Customization"]
author: "Shunku"
---

Amazon Bedrockでは、自社データで基盤モデルをカスタマイズでき、モデルをゼロから構築せずにドメイン固有タスクの性能を向上できます。

## カスタマイズ方法

| 方法 | 目的 | 必要なデータ |
|-----|------|------------|
| 継続事前学習 | ドメイン言語への適応 | ラベルなしテキスト |
| ファインチューニング | タスク性能の向上 | ラベル付き例 |

```mermaid
flowchart LR
    A["ベースモデル"] --> B["継続事前学習"]
    B --> C["ドメイン適応モデル"]
    C --> D["ファインチューニング"]
    D --> E["タスク最適化モデル"]

    style B fill:#3b82f6,color:#fff
    style D fill:#8b5cf6,color:#fff
```

## サポートされるモデル

| モデル | ファインチューニング | 継続事前学習 |
|-------|-------------------|-------------|
| Amazon Titan Text | 可能 | 可能 |
| Cohere Command | 可能 | 不可 |
| Meta Llama 2/3 | 可能 | 不可 |

## データ準備

### ファインチューニング形式（JSONL）

```jsonl
{"prompt": "このドキュメントを要約してください:", "completion": "このドキュメントは...について述べています"}
{"prompt": "フランス語に翻訳:", "completion": "Bonjour, comment allez-vous?"}
{"prompt": "感情を分類:", "completion": "ポジティブ"}
```

### 継続事前学習形式

```jsonl
{"input": "ドメイン固有のテキストコンテンツ。これはモデルがドメイン用語とパターンを学習するのに役立ちます。"}
{"input": "ドメイン知識を含む別のドキュメント..."}
```

### データ要件

| 観点 | ファインチューニング | 継続事前学習 |
|-----|-------------------|-------------|
| 最小サンプル数 | 1000以上 | 100,000トークン以上 |
| 形式 | プロンプト-補完ペア | 生テキスト |
| 品質 | クリーン、多様 | 代表的 |

## ファインチューニングジョブの作成

### S3データの準備

```python
import boto3
import json

s3 = boto3.client('s3')

# トレーニングデータをアップロード
training_data = [
    {"prompt": "お客様: 製品が壊れています\nエージェント:", "completion": "申し訳ございません。交換の手配をいたします。"},
    {"prompt": "お客様: 注文はいつ届きますか？\nエージェント:", "completion": "注文状況を確認いたします。注文番号を教えていただけますか？"},
    # 例を追加...
]

with open('/tmp/training.jsonl', 'w') as f:
    for item in training_data:
        f.write(json.dumps(item, ensure_ascii=False) + '\n')

s3.upload_file('/tmp/training.jsonl', 'my-bucket', 'training/train.jsonl')
```

### カスタマイズジョブの作成

```python
client = boto3.client('bedrock')

response = client.create_model_customization_job(
    jobName='customer-service-ft',
    customModelName='customer-service-titan',
    roleArn='arn:aws:iam::123456789012:role/BedrockCustomizationRole',
    baseModelIdentifier='amazon.titan-text-express-v1',
    customizationType='FINE_TUNING',
    trainingDataConfig={
        's3Uri': 's3://my-bucket/training/train.jsonl'
    },
    validationDataConfig={
        's3Uri': 's3://my-bucket/training/validation.jsonl'
    },
    outputDataConfig={
        's3Uri': 's3://my-bucket/output/'
    },
    hyperParameters={
        'epochCount': '3',
        'batchSize': '8',
        'learningRate': '0.00001'
    }
)

job_arn = response['jobArn']
```

### ジョブステータスの監視

```python
response = client.get_model_customization_job(jobIdentifier=job_arn)
print(f"ステータス: {response['status']}")
print(f"トレーニングメトリクス: {response.get('trainingMetrics', {})}")
```

## ハイパーパラメータ

| パラメータ | 説明 | 一般的な範囲 |
|-----------|------|------------|
| epochCount | トレーニングパス数 | 1-5 |
| batchSize | バッチあたりのサンプル数 | 4-32 |
| learningRate | 更新ステップサイズ | 1e-6 to 1e-4 |
| learningRateWarmupSteps | ウォームアップ期間 | 0-100 |

## カスタムモデルの使用

### Provisioned Throughputの作成

カスタムモデルにはProvisioned Throughputが必要です：

```python
response = client.create_provisioned_model_throughput(
    modelUnits=1,
    provisionedModelName='customer-service-pt',
    modelId='arn:aws:bedrock:us-east-1:123456789012:custom-model/customer-service-titan'
)

provisioned_arn = response['provisionedModelArn']
```

### カスタムモデルの呼び出し

```python
runtime = boto3.client('bedrock-runtime')

response = runtime.invoke_model(
    modelId=provisioned_arn,
    body=json.dumps({
        "inputText": "お客様: 荷物が破損しています\nエージェント:",
        "textGenerationConfig": {
            "maxTokenCount": 256,
            "temperature": 0.7
        }
    })
)

result = json.loads(response['body'].read())
print(result['results'][0]['outputText'])
```

## 評価

### 組み込みメトリクス

| メトリクス | 説明 |
|----------|------|
| Training Loss | トレーニングデータへのモデル適合度 |
| Validation Loss | 汎化能力 |
| Perplexity | 予測の確信度 |

### カスタム評価

```python
def evaluate_model(model_id, test_data):
    runtime = boto3.client('bedrock-runtime')
    results = []

    for item in test_data:
        response = runtime.invoke_model(
            modelId=model_id,
            body=json.dumps({
                "inputText": item['prompt'],
                "textGenerationConfig": {"maxTokenCount": 256}
            })
        )
        output = json.loads(response['body'].read())
        predicted = output['results'][0]['outputText']

        results.append({
            'expected': item['completion'],
            'predicted': predicted,
            'match': item['completion'].lower() in predicted.lower()
        })

    accuracy = sum(1 for r in results if r['match']) / len(results)
    return accuracy, results
```

## ベストプラクティス

| プラクティス | 推奨事項 |
|-------------|---------|
| データ品質 | クリーン、多様、代表的 |
| 小さく始める | まずサブセットでテスト |
| ロスを監視 | 過学習に注意 |
| 検証 | ホールドアウトテストセットを使用 |
| バージョン管理 | データとモデルのバージョンを追跡 |

## コスト考慮事項

| コンポーネント | 課金要素 |
|--------------|---------|
| トレーニング | 処理トークン単位 |
| ストレージ | カスタムモデル保存 |
| 推論 | Provisioned Throughput |

## 重要なポイント

1. **2つのカスタマイズタイプ** - ドメイン用の事前学習、タスク用のファインチューニング
2. **データ品質が重要** - クリーンで多様な例が結果を改善
3. **Provisioned Throughputが必要** - カスタムモデル推論に
4. **トレーニングメトリクスを監視** - 過学習を防止
5. **ベースラインから開始** - ベースモデルと比較

## 参考文献

- [モデルカスタマイズ](https://docs.aws.amazon.com/bedrock/latest/userguide/custom-models.html)
- [ファインチューニングガイド](https://docs.aws.amazon.com/bedrock/latest/userguide/model-customization-prepare.html)
