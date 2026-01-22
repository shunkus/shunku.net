---
title: "Day 8: MCP連携"
order: 8
---

# Day 8: MCP連携

## 今日学ぶこと

- MCPとは何か
- MCPサーバーの設定
- 標準MCPサーバーの活用
- カスタムMCPサーバーの接続

---

## MCPとは

MCP（Model Context Protocol）は、AIモデルが外部ツールやデータソースと通信するためのプロトコルです。Kiroは MCPをネイティブサポートしており、さまざまな外部サービスと連携できます。

```mermaid
flowchart TB
    subgraph Kiro["Kiro IDE"]
        A["AIエージェント"]
    end

    subgraph MCP["MCP サーバー"]
        B["Fetch Server"]
        C["Database Server"]
        D["API Server"]
        E["Custom Server"]
    end

    subgraph External["外部リソース"]
        F["Webページ"]
        G["データベース"]
        H["外部API"]
        I["社内システム"]
    end

    A <--> B
    A <--> C
    A <--> D
    A <--> E

    B --> F
    C --> G
    D --> H
    E --> I

    style Kiro fill:#3b82f6,color:#fff
    style MCP fill:#8b5cf6,color:#fff
    style External fill:#22c55e,color:#fff
```

### MCPでできること

| 機能 | 説明 | 例 |
|------|------|-----|
| **外部データ取得** | Webページやドキュメントを取得 | 最新のドキュメントを参照 |
| **API連携** | 外部APIを呼び出し | GitHub、Jira、Slackとの連携 |
| **データベース操作** | DBクエリの実行 | 開発DBの確認 |
| **カスタムツール** | 独自ツールの追加 | 社内システムとの連携 |

---

## MCPの有効化

### Step 1: 設定を開く

1. `Cmd + ,`（Mac）または `Ctrl + ,`（Windows/Linux）で設定を開く
2. 「MCP」を検索
3. MCP サポートを有効化

### Step 2: Kiroパネルで確認

Kiroパネルの「MCP」タブに、設定されたサーバーの一覧が表示されます。

```
MCP Servers
├── ● fetch (connected)
├── ○ github (disconnected)
└── ○ database (disconnected)
```

---

## MCP設定ファイル

MCPサーバーの設定は `.kiro/settings/mcp.json` に保存されます。

```json
{
  "mcpServers": {
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"],
      "disabled": false
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      },
      "disabled": true
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "${DATABASE_URL}"
      },
      "disabled": true
    }
  }
}
```

### 設定項目の説明

| 項目 | 説明 |
|------|------|
| `command` | サーバーを起動するコマンド |
| `args` | コマンドの引数 |
| `env` | 環境変数（トークンなど） |
| `disabled` | サーバーの有効/無効 |

---

## 標準MCPサーバー

Kiroでよく使われるMCPサーバーを紹介します。

### 1. Fetch Server

Webページのコンテンツを取得します。

```json
{
  "fetch": {
    "command": "uvx",
    "args": ["mcp-server-fetch"],
    "disabled": false
  }
}
```

**使用例**:
```
最新のReact 19のドキュメントを取得して、
新機能を要約してください。

#url:https://react.dev/blog/2024/12/05/react-19
```

### 2. GitHub Server

GitHubリポジトリの操作を行います。

```json
{
  "github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
    }
  }
}
```

**使用例**:
```
GitHubで最新のイシューを確認し、
優先度の高いものをリストアップしてください。
```

### 3. Filesystem Server

ファイルシステムを操作します（Kiroの標準機能を拡張）。

```json
{
  "filesystem": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/dir"]
  }
}
```

### 4. Database Server

データベースクエリを実行します。

```json
{
  "postgres": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-postgres"],
    "env": {
      "DATABASE_URL": "postgresql://user:pass@localhost:5432/mydb"
    }
  }
}
```

**使用例**:
```
usersテーブルの構造を確認し、
最近登録されたユーザー10件を取得してください。
```

---

## MCPサーバーの使用

### チャットでの使用

`#mcp` コンテキストプロバイダーで利用可能なツールを確認できます。

```
#mcp 利用可能なツールを表示してください
```

### ツールの直接呼び出し

MCPサーバーが提供するツールは、Kiroが自動的に使用します。

```
ReactのuseFormStatusフックについて、
公式ドキュメントを取得して説明してください。
```

Kiroはfetch MCPサーバーを使って自動的にドキュメントを取得します。

---

## 環境変数の設定

APIキーなどの機密情報は環境変数で管理します。

### 方法1: シェルの環境変数

```bash
# .bashrc or .zshrc
export GITHUB_TOKEN="ghp_xxxxxxxxxxxx"
export DATABASE_URL="postgresql://..."
```

### 方法2: .envファイル

プロジェクトルートに `.env` ファイルを作成：

```env
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
```

> **注意**: `.env` ファイルは `.gitignore` に追加してください。

### MCP設定での参照

```json
{
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
  }
}
```

`${VARIABLE_NAME}` 形式で環境変数を参照できます。

---

## トラブルシューティング

### MCPログの確認

1. View > Output を開く
2. ドロップダウンから「Kiro - MCP Logs」を選択

```
[MCP] Connecting to fetch server...
[MCP] fetch: Connected successfully
[MCP] github: Connection failed - Invalid token
```

### よくある問題と解決策

| 問題 | 原因 | 解決策 |
|------|------|--------|
| 接続失敗 | 前提条件の不足 | Node.js/Pythonのインストール確認 |
| 認証エラー | トークン無効 | APIキー/トークンの再確認 |
| ツールが反応しない | サーバー無効 | `disabled: false` に設定 |
| 設定が読み込まれない | JSON構文エラー | JSONの構文を確認 |

### 接続テスト

```
#mcp

fetch サーバーに接続できますか？
テストとして https://example.com を取得してください。
```

---

## 実践例

### 例1: ドキュメント参照しながら実装

```
#mcp

Prismaの最新ドキュメントを参照して、
ユーザーテーブルのマイグレーションを作成してください。
公式のベストプラクティスに従ってください。
```

### 例2: GitHubイシューの確認

```
#mcp

GitHubの未解決イシューを確認し、
「bug」ラベルが付いたものをリストアップしてください。
優先度順にソートしてください。
```

### 例3: データベース構造の分析

```
#mcp

データベースのスキーマを取得し、
ERダイアグラムをMermaid形式で生成してください。
```

---

## リモートMCPサーバー

Kiroはリモート（HTTP/SSE）MCPサーバーもサポートしています。

```json
{
  "remote-server": {
    "url": "https://mcp.example.com/sse",
    "headers": {
      "Authorization": "Bearer ${API_TOKEN}"
    }
  }
}
```

### リモートサーバーの利点

- ローカルにインストール不要
- チームで共有可能
- 一元管理されたツール

---

## MCPサーバーの作成

独自のMCPサーバーを作成することもできます。

### 基本構造（TypeScript）

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
  { name: 'my-custom-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// ツールの定義
server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'my_tool',
      description: 'My custom tool description',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The query' }
        },
        required: ['query']
      }
    }
  ]
}));

// ツールの実装
server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'my_tool') {
    const query = request.params.arguments.query;
    // ツールのロジック
    return { content: [{ type: 'text', text: `Result for: ${query}` }] };
  }
});

// サーバー起動
const transport = new StdioServerTransport();
await server.connect(transport);
```

---

## まとめ

| 概念 | 説明 |
|------|------|
| **MCP** | AI が外部ツールと通信するプロトコル |
| **MCPサーバー** | 特定の機能を提供するサーバー |
| **Fetch** | Webコンテンツ取得 |
| **GitHub** | リポジトリ操作 |
| **Database** | DBクエリ実行 |

### 重要ポイント

1. **MCPでKiroの能力を拡張**
2. **環境変数で機密情報を管理**
3. **標準サーバーで多くのユースケースをカバー**
4. **必要に応じてカスタムサーバーを作成**

---

## 練習問題

### 問題1: 基本

Fetch MCPサーバーを有効化し、任意のWebページを取得してその内容を要約してください。

### 問題2: 応用

GitHub MCPサーバーを設定し、以下を実行してください：
1. 個人アクセストークンを環境変数に設定
2. MCP設定でGitHubサーバーを有効化
3. 特定のリポジトリのイシュー一覧を取得

### チャレンジ問題

PostgreSQL MCPサーバーを設定し、以下を実行してください：
1. ローカルのPostgreSQLに接続
2. テーブル一覧を取得
3. 特定のテーブルの構造をMermaid ERダイアグラムで表示

---

## 参考リンク

- [Kiro MCP Documentation](https://kiro.dev/docs/mcp/)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/introduction)
- [MCP Servers Repository](https://github.com/modelcontextprotocol/servers)

---

**次回予告**: Day 9では「Powers活用」を学びます。専門知識をワンクリックで追加するPowersの使い方を習得しましょう。
