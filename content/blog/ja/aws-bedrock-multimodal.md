---
title: "Amazon Bedrockマルチモーダル AI：画像と視覚"
date: "2025-01-18"
excerpt: "Amazon Bedrockでマルチモーダル AIアプリケーションを構築。Stable DiffusionとTitanによる画像生成、Claudeによる視覚理解を解説します。"
tags: ["AWS", "Amazon Bedrock", "Generative AI", "Multimodal", "Image Generation"]
author: "Shunku"
---

Amazon Bedrockは、画像生成や視覚理解を含むマルチモーダルAI機能をサポートし、テキストと画像の両方を扱うアプリケーションを可能にします。

## マルチモーダル機能

| 機能 | モデル | ユースケース |
|-----|-------|------------|
| 画像生成 | Stable Diffusion、Titan Image | クリエイティブコンテンツ、マーケティング |
| 視覚理解 | Claude 3 | 画像分析、OCR |
| マルチモーダル埋め込み | Titan Multimodal | 画像検索 |

## Stable Diffusionによる画像生成

### テキストから画像

```python
import boto3
import json
import base64

client = boto3.client('bedrock-runtime')

response = client.invoke_model(
    modelId='stability.stable-diffusion-xl-v1',
    body=json.dumps({
        "text_prompts": [
            {"text": "夕日に照らされた穏やかな山の風景、デジタルアート", "weight": 1.0}
        ],
        "cfg_scale": 7,
        "steps": 50,
        "seed": 42,
        "width": 1024,
        "height": 1024
    })
)

result = json.loads(response['body'].read())
image_data = base64.b64decode(result['artifacts'][0]['base64'])

with open('generated_image.png', 'wb') as f:
    f.write(image_data)
```

### ネガティブプロンプト

```python
body = {
    "text_prompts": [
        {"text": "プロフェッショナルなヘッドショットポートレート、スタジオ照明", "weight": 1.0},
        {"text": "ぼやけた、低品質、歪んだ", "weight": -1.0}
    ],
    "cfg_scale": 10,
    "steps": 50
}
```

### Stable Diffusionパラメータ

| パラメータ | 説明 | 範囲 |
|-----------|------|------|
| cfg_scale | プロンプト忠実度 | 1-35 |
| steps | 生成反復回数 | 10-150 |
| seed | 再現性 | 整数 |
| width/height | 画像サイズ | 512-1024 |

## Titanによる画像生成

### テキストから画像

```python
response = client.invoke_model(
    modelId='amazon.titan-image-generator-v1',
    body=json.dumps({
        "taskType": "TEXT_IMAGE",
        "textToImageParams": {
            "text": "ガラスファサードのモダンなオフィスビル"
        },
        "imageGenerationConfig": {
            "numberOfImages": 1,
            "height": 1024,
            "width": 1024,
            "cfgScale": 8.0
        }
    })
)

result = json.loads(response['body'].read())
image_data = base64.b64decode(result['images'][0])
```

### 画像バリエーション

```python
with open('input_image.png', 'rb') as f:
    input_image = base64.b64encode(f.read()).decode()

response = client.invoke_model(
    modelId='amazon.titan-image-generator-v1',
    body=json.dumps({
        "taskType": "IMAGE_VARIATION",
        "imageVariationParams": {
            "text": "同じシーンを夜に",
            "images": [input_image],
            "similarityStrength": 0.7
        },
        "imageGenerationConfig": {
            "numberOfImages": 3,
            "height": 1024,
            "width": 1024
        }
    })
)
```

### インペインティング

```python
response = client.invoke_model(
    modelId='amazon.titan-image-generator-v1',
    body=json.dumps({
        "taskType": "INPAINTING",
        "inPaintingParams": {
            "text": "赤いスポーツカー",
            "image": input_image,
            "maskImage": mask_image,  # Base64マスク
            "maskPrompt": "車両"  # またはテキストマスクを使用
        }
    })
)
```

## Claudeによる視覚理解

### 画像の分析

```python
with open('document.png', 'rb') as f:
    image_data = base64.b64encode(f.read()).decode()

response = client.converse(
    modelId='anthropic.claude-3-sonnet-20240229-v1:0',
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "image": {
                        "format": "png",
                        "source": {"bytes": base64.b64decode(image_data)}
                    }
                },
                {"text": "この画像に写っているものを説明してください。"}
            ]
        }
    ]
)

print(response['output']['message']['content'][0]['text'])
```

### ドキュメント分析

```python
response = client.converse(
    modelId='anthropic.claude-3-sonnet-20240229-v1:0',
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "image": {
                        "format": "png",
                        "source": {"bytes": document_bytes}
                    }
                },
                {"text": "このドキュメントからすべてのテキストを抽出してJSON形式にしてください。"}
            ]
        }
    ]
)
```

### 複数の画像

```python
response = client.converse(
    modelId='anthropic.claude-3-sonnet-20240229-v1:0',
    messages=[
        {
            "role": "user",
            "content": [
                {"image": {"format": "png", "source": {"bytes": image1_bytes}}},
                {"image": {"format": "png", "source": {"bytes": image2_bytes}}},
                {"text": "これら2つの製品画像を比較して、違いを列挙してください。"}
            ]
        }
    ]
)
```

## マルチモーダル埋め込みによる画像検索

```python
def get_image_embedding(image_path):
    with open(image_path, 'rb') as f:
        image_data = base64.b64encode(f.read()).decode()

    response = client.invoke_model(
        modelId='amazon.titan-embed-image-v1',
        body=json.dumps({
            "inputImage": image_data
        })
    )

    return json.loads(response['body'].read())['embedding']

def get_text_embedding(text):
    response = client.invoke_model(
        modelId='amazon.titan-embed-image-v1',
        body=json.dumps({
            "inputText": text
        })
    )
    return json.loads(response['body'].read())['embedding']

# テキストクエリで画像を検索
query_embedding = get_text_embedding("赤い車")
# データベース内の画像埋め込みと比較
```

## 完全なマルチモーダルアプリケーション

```python
import boto3
import base64
import json

class MultimodalAssistant:
    def __init__(self):
        self.client = boto3.client('bedrock-runtime')

    def generate_image(self, prompt: str, negative_prompt: str = None) -> bytes:
        body = {
            "text_prompts": [{"text": prompt, "weight": 1.0}],
            "cfg_scale": 8,
            "steps": 50,
            "width": 1024,
            "height": 1024
        }
        if negative_prompt:
            body["text_prompts"].append({"text": negative_prompt, "weight": -1.0})

        response = self.client.invoke_model(
            modelId='stability.stable-diffusion-xl-v1',
            body=json.dumps(body)
        )
        result = json.loads(response['body'].read())
        return base64.b64decode(result['artifacts'][0]['base64'])

    def analyze_image(self, image_bytes: bytes, question: str) -> str:
        response = self.client.converse(
            modelId='anthropic.claude-3-sonnet-20240229-v1:0',
            messages=[{
                "role": "user",
                "content": [
                    {"image": {"format": "png", "source": {"bytes": image_bytes}}},
                    {"text": question}
                ]
            }]
        )
        return response['output']['message']['content'][0]['text']

# 使用例
assistant = MultimodalAssistant()
image = assistant.generate_image("居心地の良いカフェの内装、暖かい照明")
analysis = assistant.analyze_image(image, "このインテリアデザインのスタイルは？")
```

## ベストプラクティス

| プラクティス | 推奨事項 |
|-------------|---------|
| プロンプトの明確さ | 具体的で詳細に |
| ネガティブプロンプト | 不要な要素を除外 |
| 画像品質 | 適切な解像度を使用 |
| コスト最適化 | 少ないステップから開始 |
| コンテンツ安全性 | コンテンツフィルタリングを実装 |

## 重要なポイント

1. **複数の生成モデル** - ニーズに応じてStable DiffusionとTitan
2. **Claudeで視覚** - ドキュメント分析、画像比較
3. **マルチモーダル埋め込み** - テキストで画像検索を可能に
4. **機能を組み合わせ** - リッチなマルチモーダルアプリケーションを構築
5. **コンテンツモデレーション** - 安全性のためにGuardrailsを使用

## 参考文献

- [画像生成モデル](https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html)
- [Claude Vision](https://docs.anthropic.com/claude/docs/vision)
- [Titan Image Generator](https://docs.aws.amazon.com/bedrock/latest/userguide/titan-image-models.html)
