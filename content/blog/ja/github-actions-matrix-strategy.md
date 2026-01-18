---
title: "GitHub Actions Matrix戦略：並列ビルドを効率化する"
date: "2025-01-18"
excerpt: "GitHub ActionsのMatrix戦略を使って、複数のOS、言語バージョン、設定にまたがる並列ビルドを効率的に実行する方法を解説します。"
tags: ["GitHub Actions", "Git", "DevOps"]
author: "Shunku"
---

## はじめに

複数の環境（異なるNode.jsバージョン、OS、設定など）で動作するソフトウェアを構築する場合、各組み合わせを手動でテストするのは非常に面倒です。GitHub ActionsのMatrix戦略は、単一のジョブ定義から複数のジョブインスタンスを自動生成することで、この問題を解決します。

この記事では、効率的な並列テストのためにMatrixビルドを活用する方法を説明します。

## Matrix戦略とは

Matrixは、定義した変数を組み合わせて複数のジョブ実行を作成します：

```mermaid
flowchart TB
    subgraph Matrix["Matrix定義"]
        M["node: [18, 20, 22]<br/>os: [ubuntu, windows]"]
    end

    subgraph Jobs["生成されるジョブ (6個)"]
        J1["ubuntu + node 18"]
        J2["ubuntu + node 20"]
        J3["ubuntu + node 22"]
        J4["windows + node 18"]
        J5["windows + node 20"]
        J6["windows + node 22"]
    end

    Matrix --> Jobs

    style Matrix fill:#3b82f6,color:#fff
    style Jobs fill:#22c55e,color:#fff
```

## 基本的なMatrix構文

### 1次元のMatrix

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      - run: npm ci
      - run: npm test
```

これにより、各Node.jsバージョンに対して3つの並列ジョブが作成されます。

### 多次元のMatrix

```yaml
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [18, 20, 22]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }} on ${{ matrix.os }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      - run: npm ci
      - run: npm test
```

これにより9つのジョブ（3 OS × 3 Nodeバージョン）が作成されます。

## Matrix設定オプション

### include: 追加の組み合わせ

`include`を使用して、Matrixパターンに適合しない特定の設定を追加します：

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest]
    node-version: [18, 20]
    include:
      # 実験的なNode 22をUbuntuのみに追加
      - os: ubuntu-latest
        node-version: 22
        experimental: true

      # 特定の組み合わせに追加の環境変数を設定
      - os: windows-latest
        node-version: 20
        npm-cache: 'C:\npm-cache'
```

### exclude: 組み合わせの除外

`exclude`を使用して、特定の組み合わせをスキップします：

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node-version: [16, 18, 20]
    exclude:
      # macOSでNode 16をスキップ（サポート対象外）
      - os: macos-latest
        node-version: 16

      # WindowsでNode 16をスキップ
      - os: windows-latest
        node-version: 16
```

### includeとexcludeの組み合わせ

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest]
    node-version: [18, 20, 22]
    exclude:
      - os: windows-latest
        node-version: 22
    include:
      - os: ubuntu-latest
        node-version: 22
        coverage: true
```

## 失敗時の処理

### fail-fast（デフォルト: true）

デフォルトでは、いずれかのMatrixジョブが失敗すると、他のすべてのジョブがキャンセルされます：

```yaml
strategy:
  fail-fast: true  # デフォルトの動作
  matrix:
    node-version: [18, 20, 22]
```

### 失敗しても継続

`fail-fast: false`を設定すると、失敗に関係なくすべてのジョブを完了させます：

```yaml
strategy:
  fail-fast: false
  matrix:
    node-version: [18, 20, 22]
```

これは、すべての失敗する設定を確認したい場合に便利です。

### 実験的ビルドのcontinue-on-error

特定のジョブを失敗を許容するものとしてマークします：

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    continue-on-error: ${{ matrix.experimental }}
    strategy:
      fail-fast: false
      matrix:
        node-version: [18, 20]
        experimental: [false]
        include:
          - node-version: 23
            experimental: true
```

## 並列数の制御

### max-parallel

リソースを圧迫しないように同時実行ジョブ数を制限します：

```yaml
strategy:
  max-parallel: 2
  matrix:
    node-version: [18, 20, 22]
    os: [ubuntu-latest, windows-latest]
```

```mermaid
flowchart LR
    subgraph Wave1["Wave 1"]
        J1["Job 1"]
        J2["Job 2"]
    end

    subgraph Wave2["Wave 2"]
        J3["Job 3"]
        J4["Job 4"]
    end

    subgraph Wave3["Wave 3"]
        J5["Job 5"]
        J6["Job 6"]
    end

    Wave1 --> Wave2 --> Wave3

    style Wave1 fill:#3b82f6,color:#fff
    style Wave2 fill:#8b5cf6,color:#fff
    style Wave3 fill:#22c55e,color:#fff
```

## 実践例

### クロスプラットフォームライブラリのテスト

```yaml
name: Cross-Platform Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [18, 20, 22]
        exclude:
          - os: macos-latest
            node-version: 18

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - run: npm ci
      - run: npm test

      - name: Upload coverage
        if: matrix.os == 'ubuntu-latest' && matrix.node-version == 20
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/
```

### データベースバージョンのテスト

```yaml
name: Database Compatibility

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        database:
          - postgres:14
          - postgres:15
          - postgres:16
          - mysql:8.0

    services:
      db:
        image: ${{ matrix.database }}
        env:
          POSTGRES_PASSWORD: postgres
          MYSQL_ROOT_PASSWORD: mysql
        ports:
          - 5432:5432
          - 3306:3306
        options: >-
          --health-cmd="pg_isready || mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=5

    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:integration
        env:
          DATABASE_URL: ${{ contains(matrix.database, 'postgres') && 'postgres://postgres:postgres@localhost:5432/test' || 'mysql://root:mysql@localhost:3306/test' }}
```

### ビルド設定のMatrix

```yaml
name: Build Variants

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        include:
          - target: web
            build-cmd: npm run build:web
            output-dir: dist/web

          - target: electron
            build-cmd: npm run build:electron
            output-dir: dist/electron

          - target: mobile
            build-cmd: npm run build:mobile
            output-dir: dist/mobile

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci
      - run: ${{ matrix.build-cmd }}

      - name: Upload ${{ matrix.target }} build
        uses: actions/upload-artifact@v4
        with:
          name: build-${{ matrix.target }}
          path: ${{ matrix.output-dir }}
```

### JSONによる動的Matrix

Matrix値を動的に生成します：

```yaml
name: Dynamic Matrix

on: [push]

jobs:
  prepare:
    runs-on: ubuntu-latest
    outputs:
      matrix: ${{ steps.set-matrix.outputs.matrix }}
    steps:
      - uses: actions/checkout@v4

      - id: set-matrix
        run: |
          # package.jsonや他のソースからMatrixを生成
          PACKAGES=$(ls packages | jq -R . | jq -s -c .)
          echo "matrix={\"package\":$PACKAGES}" >> $GITHUB_OUTPUT

  build:
    needs: prepare
    runs-on: ubuntu-latest
    strategy:
      matrix: ${{ fromJson(needs.prepare.outputs.matrix) }}
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build --workspace=${{ matrix.package }}
```

## Matrix値の使用

### ステップ名での使用

```yaml
steps:
  - name: Test on Node ${{ matrix.node-version }} / ${{ matrix.os }}
    run: npm test
```

### 条件分岐での使用

```yaml
steps:
  - name: Windows固有のセットアップ
    if: matrix.os == 'windows-latest'
    run: choco install some-package

  - name: デプロイ（最新Nodeのみ）
    if: matrix.node-version == 22
    run: npm run deploy
```

### アーティファクト名での使用

```yaml
- name: Upload artifacts
  uses: actions/upload-artifact@v4
  with:
    name: build-${{ matrix.os }}-node${{ matrix.node-version }}
    path: dist/
```

## ベストプラクティス

### 1. 小さく始めて徐々に拡張

```yaml
# 必須の組み合わせから開始
matrix:
  node-version: [18, 20]  # LTSバージョンのみ
  os: [ubuntu-latest]      # 主要プラットフォームから

# 後で完全なMatrixに拡張
matrix:
  node-version: [18, 20, 22]
  os: [ubuntu-latest, windows-latest, macos-latest]
```

### 2. fail-fastを戦略的に使用

| シナリオ | fail-fast設定 |
|---------|--------------|
| 開発中の素早いフィードバック | `true`（デフォルト） |
| 完全な互換性レポート | `false` |
| リリースビルド | `false` |

### 3. コストと速度を最適化

```yaml
strategy:
  # セルフホストランナーでは並列ジョブを制限
  max-parallel: 4

  matrix:
    os: [ubuntu-latest]  # Linuxが最速で最安
    node-version: [20]   # PRでは主要バージョンのみテスト

# mainブランチでのみ完全なMatrix
on:
  push:
    branches: [main]
```

### 4. Matrix設定ごとにキャッシュ

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ matrix.node-version }}-${{ hashFiles('**/package-lock.json') }}
```

## まとめ

| 機能 | 目的 |
|-----|------|
| **基本Matrix** | 複数のバージョン/設定でテスト |
| **include** | 追加のプロパティを持つ特定の組み合わせを追加 |
| **exclude** | 不要な組み合わせを除外 |
| **fail-fast** | 最初の失敗でキャンセルするかを制御 |
| **max-parallel** | 同時実行ジョブ数を制限 |
| **continue-on-error** | 実験的ビルドの失敗を許容 |

Matrix戦略は、各組み合わせに対して別々のワークフローファイルを維持することなく、すべてのターゲット環境でコードが動作することを確認するために不可欠です。

## 参考資料

- O'Reilly - Learning GitHub Actions, Chapter 13
- Packt - GitHub Actions Cookbook, Chapter 6
- GitHub Docs - Using a matrix for your jobs
