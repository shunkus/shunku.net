---
title: "Amazon Bedrock Multimodal AI: Images and Vision"
date: "2025-01-18"
excerpt: "Build multimodal AI applications with Amazon Bedrock. Learn image generation with Stable Diffusion and Titan, and vision understanding with Claude."
tags: ["AWS", "Amazon Bedrock", "Generative AI", "Multimodal", "Image Generation"]
author: "Shunku"
---

Amazon Bedrock supports multimodal AI capabilities including image generation and vision understanding, enabling applications that work with both text and images.

## Multimodal Capabilities

| Capability | Models | Use Cases |
|------------|--------|-----------|
| Image Generation | Stable Diffusion, Titan Image | Creative content, marketing |
| Vision Understanding | Claude 3 | Image analysis, OCR |
| Multimodal Embeddings | Titan Multimodal | Image search |

## Image Generation with Stable Diffusion

### Text-to-Image

```python
import boto3
import json
import base64

client = boto3.client('bedrock-runtime')

response = client.invoke_model(
    modelId='stability.stable-diffusion-xl-v1',
    body=json.dumps({
        "text_prompts": [
            {"text": "A serene mountain landscape at sunset, digital art", "weight": 1.0}
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

### Negative Prompts

```python
body = {
    "text_prompts": [
        {"text": "Professional headshot portrait, studio lighting", "weight": 1.0},
        {"text": "blurry, low quality, distorted", "weight": -1.0}
    ],
    "cfg_scale": 10,
    "steps": 50
}
```

### Stable Diffusion Parameters

| Parameter | Description | Range |
|-----------|-------------|-------|
| cfg_scale | Prompt adherence | 1-35 |
| steps | Generation iterations | 10-150 |
| seed | Reproducibility | Integer |
| width/height | Image dimensions | 512-1024 |

## Image Generation with Titan

### Text-to-Image

```python
response = client.invoke_model(
    modelId='amazon.titan-image-generator-v1',
    body=json.dumps({
        "taskType": "TEXT_IMAGE",
        "textToImageParams": {
            "text": "A modern office building with glass facade"
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

### Image Variation

```python
with open('input_image.png', 'rb') as f:
    input_image = base64.b64encode(f.read()).decode()

response = client.invoke_model(
    modelId='amazon.titan-image-generator-v1',
    body=json.dumps({
        "taskType": "IMAGE_VARIATION",
        "imageVariationParams": {
            "text": "Same scene but at night",
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

### Inpainting

```python
response = client.invoke_model(
    modelId='amazon.titan-image-generator-v1',
    body=json.dumps({
        "taskType": "INPAINTING",
        "inPaintingParams": {
            "text": "A red sports car",
            "image": input_image,
            "maskImage": mask_image,  # Base64 mask
            "maskPrompt": "the vehicle"  # Or use text mask
        }
    })
)
```

## Vision Understanding with Claude

### Analyze Images

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
                {"text": "Describe what you see in this image."}
            ]
        }
    ]
)

print(response['output']['message']['content'][0]['text'])
```

### Document Analysis

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
                {"text": "Extract all text from this document and format as JSON."}
            ]
        }
    ]
)
```

### Multiple Images

```python
response = client.converse(
    modelId='anthropic.claude-3-sonnet-20240229-v1:0',
    messages=[
        {
            "role": "user",
            "content": [
                {"image": {"format": "png", "source": {"bytes": image1_bytes}}},
                {"image": {"format": "png", "source": {"bytes": image2_bytes}}},
                {"text": "Compare these two product images and list the differences."}
            ]
        }
    ]
)
```

## Image Search with Multimodal Embeddings

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

# Search images with text query
query_embedding = get_text_embedding("red car")
# Compare with image embeddings in your database
```

## Complete Multimodal Application

```python
import boto3
import base64
import json
from pathlib import Path

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

    def describe_and_recreate(self, image_path: str) -> tuple:
        with open(image_path, 'rb') as f:
            image_bytes = f.read()

        description = self.analyze_image(
            image_bytes,
            "Describe this image in detail for recreation."
        )

        new_image = self.generate_image(description)
        return description, new_image

# Usage
assistant = MultimodalAssistant()
image = assistant.generate_image("A cozy coffee shop interior, warm lighting")
analysis = assistant.analyze_image(image, "What style is this interior design?")
```

## Best Practices

| Practice | Recommendation |
|----------|----------------|
| Prompt clarity | Be specific and detailed |
| Negative prompts | Exclude unwanted elements |
| Image quality | Use appropriate resolution |
| Cost optimization | Start with fewer steps |
| Content safety | Implement content filtering |

## Key Takeaways

1. **Multiple generation models** - Stable Diffusion and Titan for different needs
2. **Vision with Claude** - Analyze documents, compare images
3. **Multimodal embeddings** - Enable image search with text
4. **Combine capabilities** - Build rich multimodal applications
5. **Content moderation** - Use Guardrails for safety

## References

- [Image Generation Models](https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html)
- [Claude Vision](https://docs.anthropic.com/claude/docs/vision)
- [Titan Image Generator](https://docs.aws.amazon.com/bedrock/latest/userguide/titan-image-models.html)
