---
title: "GitHub ActionsのReusable Workflows：CI/CDをDRYに保つ"
date: "2025-01-18"
excerpt: "GitHub Actionsで再利用可能なワークフローを作成・使用して、リポジトリやチーム間の重複を排除する方法を学びます。inputs、secrets、outputsとベストプラクティスを解説します。"
tags: ["GitHub Actions", "Git", "DevOps"]
author: "Shunku"
---

## はじめに

組織が成長するにつれて、多くのリポジトリで似たようなワークフローパターンが繰り返されることに気づくでしょう。Reusable Workflows（再利用可能なワークフロー）を使えば、ワークフローを一度定義して複数の他のワークフローから呼び出すことができ、DRY（Don't Repeat Yourself）原則をCI/CDに適用できます。

この記事では、Reusable Workflowsを効果的に作成・使用する方法を説明します。

## なぜReusable Workflowsなのか？

```mermaid
flowchart TB
    subgraph Before["変更前: 重複したワークフロー"]
        R1["Repo A: ci.yml<br/>(100行)"]
        R2["Repo B: ci.yml<br/>(100行)"]
        R3["Repo C: ci.yml<br/>(100行)"]
    end

    subgraph After["変更後: Reusable Workflow"]
        Central["Central: build.yml<br/>(100行)"]
        C1["Repo A: ci.yml<br/>(10行)"]
        C2["Repo B: ci.yml<br/>(10行)"]
        C3["Repo C: ci.yml<br/>(10行)"]
        Central --> C1
        Central --> C2
        Central --> C3
    end

    style Before fill:#ef4444,color:#fff
    style After fill:#22c55e,color:#fff
```

| メリット | 説明 |
|---------|------|
| **一貫性** | すべてのリポジトリで同じワークフローロジック |
| **保守性** | 一度更新すればすべてに適用 |
| **複雑さの軽減** | 呼び出し側のワークフローがシンプルに |
| **カプセル化** | 実装の詳細を隠蔽 |

## Reusable Workflowの作成

### 基本構造

Reusable Workflowは`workflow_call`トリガーを使用します：

```yaml
# .github/workflows/reusable-build.yml
name: Reusable Build Workflow

on:
  workflow_call:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
```

### inputsの追加

カスタマイズ用の入力を定義します：

```yaml
name: Reusable Build

on:
  workflow_call:
    inputs:
      node-version:
        description: 'Node.jsバージョン'
        required: false
        type: string
        default: '20'

      working-directory:
        description: '作業ディレクトリ'
        required: false
        type: string
        default: '.'

      build-command:
        description: '実行するビルドコマンド'
        required: false
        type: string
        default: 'npm run build'

      environment:
        description: 'デプロイ環境'
        required: false
        type: string

jobs:
  build:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    defaults:
      run:
        working-directory: ${{ inputs.working-directory }}

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
          cache: 'npm'
          cache-dependency-path: ${{ inputs.working-directory }}/package-lock.json

      - run: npm ci
      - run: ${{ inputs.build-command }}
```

### inputの型

| 型 | 説明 | 例 |
|---|------|-----|
| `string` | テキスト値 | `'production'` |
| `boolean` | 真偽値 | `true` |
| `number` | 数値 | `42` |

### secretsの追加

シークレットを安全に渡します：

```yaml
on:
  workflow_call:
    inputs:
      environment:
        type: string
        required: true

    secrets:
      npm-token:
        description: 'NPM認証トークン'
        required: true

      deploy-key:
        description: 'デプロイ用SSHキー'
        required: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup NPM auth
        run: echo "//registry.npmjs.org/:_authToken=${{ secrets.npm-token }}" >> ~/.npmrc

      - name: Deploy
        if: secrets.deploy-key != ''
        run: ./deploy.sh
        env:
          SSH_KEY: ${{ secrets.deploy-key }}
```

### secretsの継承

`secrets: inherit`を使用して呼び出し元のすべてのシークレットを渡します：

```yaml
on:
  workflow_call:
    secrets:
      npm-token:
        required: true
      # または呼び出し時に 'inherit' を使用してすべてのシークレットを渡す
```

### outputsの追加

Reusable Workflowから値を返します：

```yaml
name: Build and Get Version

on:
  workflow_call:
    outputs:
      version:
        description: 'ビルドしたバージョン'
        value: ${{ jobs.build.outputs.version }}

      artifact-name:
        description: 'アップロードしたアーティファクトの名前'
        value: ${{ jobs.build.outputs.artifact-name }}

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.version }}
      artifact-name: build-${{ steps.version.outputs.version }}

    steps:
      - uses: actions/checkout@v4

      - name: Get version
        id: version
        run: echo "version=$(cat package.json | jq -r .version)" >> $GITHUB_OUTPUT

      - run: npm ci
      - run: npm run build

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: build-${{ steps.version.outputs.version }}
          path: dist/
```

## Reusable Workflowの呼び出し

### 基本的な呼び出し

```yaml
name: CI

on:
  push:
    branches: [main]

jobs:
  build:
    uses: ./.github/workflows/reusable-build.yml
```

### inputsとsecretsを使用

```yaml
name: CI

on:
  push:
    branches: [main]

jobs:
  build:
    uses: owner/repo/.github/workflows/reusable-build.yml@main
    with:
      node-version: '20'
      working-directory: './frontend'
      environment: 'production'
    secrets:
      npm-token: ${{ secrets.NPM_TOKEN }}
      deploy-key: ${{ secrets.DEPLOY_KEY }}

  # またはすべてのシークレットを継承
  build-inherit:
    uses: ./.github/workflows/reusable-build.yml
    with:
      node-version: '20'
    secrets: inherit
```

### outputsの使用

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    uses: ./.github/workflows/reusable-build.yml
    with:
      node-version: '20'

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Download artifact
        uses: actions/download-artifact@v4
        with:
          name: ${{ needs.build.outputs.artifact-name }}

      - name: Deploy version
        run: echo "Deploying version ${{ needs.build.outputs.version }}"
```

## 実践例

### 再利用可能なNode.js CIワークフロー

```yaml
# .github/workflows/reusable-node-ci.yml
name: Reusable Node.js CI

on:
  workflow_call:
    inputs:
      node-version:
        type: string
        default: '20'
      run-lint:
        type: boolean
        default: true
      run-tests:
        type: boolean
        default: true
      upload-coverage:
        type: boolean
        default: false

    outputs:
      test-result:
        value: ${{ jobs.test.outputs.result }}

jobs:
  lint:
    if: inputs.run-lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  test:
    if: inputs.run-tests
    runs-on: ubuntu-latest
    outputs:
      result: ${{ steps.test.outputs.result }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
          cache: 'npm'
      - run: npm ci

      - name: Run tests
        id: test
        run: |
          npm test -- --coverage
          echo "result=success" >> $GITHUB_OUTPUT

      - name: Upload coverage
        if: inputs.upload-coverage
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/
```

### 再利用可能なDockerビルド＆プッシュ

```yaml
# .github/workflows/reusable-docker.yml
name: Build and Push Docker Image

on:
  workflow_call:
    inputs:
      image-name:
        type: string
        required: true
      dockerfile:
        type: string
        default: 'Dockerfile'
      context:
        type: string
        default: '.'
      push:
        type: boolean
        default: false
      platforms:
        type: string
        default: 'linux/amd64'

    secrets:
      registry-username:
        required: true
      registry-password:
        required: true

    outputs:
      image-tag:
        value: ${{ jobs.build.outputs.tag }}
      image-digest:
        value: ${{ jobs.build.outputs.digest }}

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      tag: ${{ steps.meta.outputs.tags }}
      digest: ${{ steps.build.outputs.digest }}

    steps:
      - uses: actions/checkout@v4

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Registry
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.registry-username }}
          password: ${{ secrets.registry-password }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ inputs.image-name }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix=
            type=semver,pattern={{version}}

      - name: Build and push
        id: build
        uses: docker/build-push-action@v5
        with:
          context: ${{ inputs.context }}
          file: ${{ inputs.dockerfile }}
          platforms: ${{ inputs.platforms }}
          push: ${{ inputs.push }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### 再利用可能なデプロイワークフロー

```yaml
# .github/workflows/reusable-deploy.yml
name: Deploy to Environment

on:
  workflow_call:
    inputs:
      environment:
        type: string
        required: true
      artifact-name:
        type: string
        required: true
      url:
        type: string
        required: true

    secrets:
      deploy-token:
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: ${{ inputs.environment }}
      url: ${{ inputs.url }}

    steps:
      - name: Download artifact
        uses: actions/download-artifact@v4
        with:
          name: ${{ inputs.artifact-name }}
          path: ./dist

      - name: Deploy
        run: |
          echo "Deploying to ${{ inputs.environment }}"
          # デプロイロジックをここに
        env:
          DEPLOY_TOKEN: ${{ secrets.deploy-token }}

      - name: Verify deployment
        run: curl -f ${{ inputs.url }}/health
```

## Starter Workflows

組織用のテンプレートワークフローを作成：

```
.github/
├── workflow-templates/
│   ├── node-ci.yml
│   ├── node-ci.properties.json
│   ├── docker-build.yml
│   └── docker-build.properties.json
```

**node-ci.properties.json：**

```json
{
  "name": "Node.js CI",
  "description": "組織の標準Node.js CIワークフロー",
  "iconName": "nodejs",
  "categories": ["JavaScript", "Node"]
}
```

**node-ci.yml：**

```yaml
name: Node.js CI

on:
  push:
    branches: [$default-branch]
  pull_request:
    branches: [$default-branch]

jobs:
  build:
    uses: org/.github/.github/workflows/reusable-node-ci.yml@main
    with:
      node-version: '20'
      run-lint: true
      run-tests: true
```

## 制限事項と考慮点

### ネストの深さ

Reusable Workflowsは最大4レベルまでネストできます：

```mermaid
flowchart TB
    A["呼び出し元ワークフロー"] --> B["Reusable 1"]
    B --> C["Reusable 2"]
    C --> D["Reusable 3"]
    D --> E["Reusable 4"]
    E -.->|"許可されない"| F["Reusable 5"]

    style E fill:#f59e0b,color:#fff
    style F fill:#ef4444,color:#fff
```

### その他の制限

| 制限 | 説明 |
|-----|------|
| **最大ネスト** | 4レベルまで |
| **環境変数** | 呼び出し元のジョブレベルでは設定不可 |
| **strategy/matrix** | 呼び出し元のmatrixをreusable内で使用不可 |
| **concurrency** | 各ワークフローレベルで個別 |

### 回避策

matrix値をinputsとして渡す：

```yaml
# 呼び出し元
jobs:
  test:
    strategy:
      matrix:
        node: [18, 20, 22]
    uses: ./.github/workflows/reusable-test.yml
    with:
      node-version: ${{ matrix.node }}
```

## ベストプラクティス

### 1. ワークフローをバージョン管理

```yaml
# セマンティックバージョニングタグを使用
uses: owner/repo/.github/workflows/build.yml@v1.2.0

# または不変性のためにSHA
uses: owner/repo/.github/workflows/build.yml@abc123
```

### 2. 徹底したドキュメント

```yaml
name: Reusable Build

# 詳細な説明を追加
# このワークフローは、異なる環境向けにカスタマイズ可能な
# 設定でNode.jsアプリケーションをビルドします。

on:
  workflow_call:
    inputs:
      node-version:
        description: |
          使用するNode.jsバージョン。サポート：
          - LTSバージョン (18, 20)
          - 現行バージョン (22)
        type: string
        default: '20'
```

### 3. 妥当なデフォルト値を提供

```yaml
inputs:
  node-version:
    default: '20'  # 最も一般的なLTS
  run-tests:
    default: true  # 安全なデフォルト
  deploy:
    default: false  # 危険な操作はデフォルトでオフ
```

### 4. 入力を検証

```yaml
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Validate environment
        if: inputs.environment != 'staging' && inputs.environment != 'production'
        run: |
          echo "Invalid environment: ${{ inputs.environment }}"
          exit 1
```

## まとめ

| 機能 | 説明 |
|-----|------|
| **workflow_call** | Reusable Workflow用のトリガー |
| **inputs** | カスタマイズ可能なパラメータ |
| **secrets** | 安全な資格情報の受け渡し |
| **outputs** | 呼び出し元への戻り値 |
| **secrets: inherit** | 呼び出し元のすべてのシークレットを渡す |

Reusable Workflowsは、組織のCI/CDパイプライン全体で一貫性を維持し、重複を削減するのに役立ちます。

## 参考資料

- O'Reilly - Learning GitHub Actions, Chapter 12
- Packt - GitHub Actions Cookbook, Chapter 5
- GitHub Docs - Reusing Workflows
