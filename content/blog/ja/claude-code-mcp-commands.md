---
title: "Claude Codeを拡張する: カスタムコマンドとMCP連携"
date: "2025-11-23"
excerpt: "カスタムスラッシュコマンドとModel Context Protocol（MCP）連携でClaude Codeを強化 - データベース、API、外部ツールに接続して開発ワークフローを拡張する方法を解説します。"
tags: ["Claude Code", "AI", "MCP", "Extensibility", "Integration"]
author: "Shunku"
---

そのままでもClaude Codeは強力ですが、カスタムコマンドと外部ツール連携で拡張すると、真の可能性が開花します。カスタムスラッシュコマンドは再利用可能なプロンプトを作成し、MCP（Model Context Protocol）はClaude Codeをデータベース、API、サードパーティサービスに接続します。

## カスタムスラッシュコマンド

スラッシュコマンドは、一般的なタスクを標準化する再利用可能なプロンプトテンプレートです。同じ複雑な指示を繰り返し入力する代わりに、一度コマンドを作成し、シンプルな`/command`で呼び出します。

### カスタムコマンドの作成

コマンドは`.claude/commands/`ディレクトリに保存されるMarkdownファイルです：

```
.claude/
└── commands/
    ├── review.md
    ├── test.md
    └── document.md
```

**例: コードレビューコマンド**

`.claude/commands/review.md`:
```markdown
$ARGUMENTS のコードを以下の観点でレビューして：

## セキュリティ
- 入力バリデーションの脆弱性
- SQLインジェクションやXSSのリスク
- ハードコードされたシークレットや認証情報
- 認証/認可の問題

## パフォーマンス
- N+1クエリ問題
- 不要な再レンダリング（React）
- メモリリーク
- 非効率なアルゴリズム

## 保守性
- コードの重複
- 過度に複雑な関数
- エラーハンドリングの欠如
- 不明瞭な命名

見つかった各問題について、具体的な行番号と改善提案を提供して。
```

使用方法:
```
/review src/lib/auth.ts
```

`$ARGUMENTS`キーワードはコマンド名の後のすべてをキャプチャします。

### コマンドの整理

目的別にコマンドを構造化：

```
.claude/commands/
├── code/
│   ├── review.md
│   ├── refactor.md
│   └── optimize.md
├── docs/
│   ├── readme.md
│   ├── api-docs.md
│   └── changelog.md
├── git/
│   ├── commit.md
│   └── pr.md
└── test/
    ├── unit.md
    └── e2e.md
```

### 個人用 vs. チーム用コマンド

| 場所 | スコープ | 共有？ |
|------|---------|--------|
| `.claude/commands/` | プロジェクト | はい（コミット） |
| `~/.claude/commands/` | 全プロジェクト | いいえ（個人用） |

チームコマンドはバージョン管理にコミットすべきです。個人コマンドはホームディレクトリに配置します。

### 実践的なコマンド例

**テスト生成**
`.claude/commands/test.md`:
```markdown
$ARGUMENTS の包括的なテストを生成して：

1. まずファイルを読んで機能を理解
2. すべてのパブリック関数とメソッドを特定
3. 各関数について、以下をカバーするテストを作成：
   - ハッピーパスシナリオ
   - エッジケース（空の入力、null値、境界値）
   - エラー条件
4. プロジェクトの既存のテストパターンを使用
5. 適切な__tests__ディレクトリにテストを配置
```

**ドキュメント作成**
`.claude/commands/document.md`:
```markdown
$ARGUMENTS のドキュメントを作成して：

1. コードを読んで目的を理解
2. すべてのexportにJSDoc/TSDocコメントを生成
3. モジュールにREADMEがなければ作成
4. 以下を含める：
   - 目的と概要
   - インストール/セットアップ（該当する場合）
   - 使用例
   - APIリファレンス
   - よくある落とし穴
```

**コミット準備**
`.claude/commands/commit.md`:
```markdown
現在の変更をコミットする準備をして：

1. `git diff --staged`でステージされた変更を確認
2. `git diff`でステージされていない変更を確認
3. 含める価値のあるステージされていない変更があればステージ
4. Conventional Commitsに従ってコミットメッセージを作成：
   - type(scope): description
   - Types: feat, fix, docs, style, refactor, test, chore
5. 最初の行は50文字以内に
6. 本文では何をしたかではなく、なぜしたかを説明
```

## Model Context Protocol（MCP）

MCPは、Claude Codeを外部ツールやデータソースに接続するオープンスタンダードです。MCPサーバーを通じて、Claudeは会話内でデータベースのクエリ、APIへのアクセス、ファイル管理、サービスとのやり取りができます。

### MCPの仕組み

```mermaid
flowchart LR
    subgraph Claude["Claude Code"]
        CC["Claude Code"]
    end

    subgraph MCP["MCPサーバー"]
        DB["データベース<br/>サーバー"]
        GH["GitHub<br/>サーバー"]
        FS["ファイルシステム<br/>サーバー"]
        API["カスタムAPI<br/>サーバー"]
    end

    subgraph External["外部サービス"]
        PG["PostgreSQL"]
        GHA["GitHub API"]
        Files["ローカルファイル"]
        Svc["あなたのサービス"]
    end

    CC <--> DB
    CC <--> GH
    CC <--> FS
    CC <--> API

    DB <--> PG
    GH <--> GHA
    FS <--> Files
    API <--> Svc

    style Claude fill:#3b82f6,color:#fff
    style MCP fill:#8b5cf6,color:#fff
    style External fill:#22c55e,color:#fff
```

Claude CodeはMCPサーバーと通信し、MCPサーバーが外部サービスとやり取りします。このアーキテクチャにより、あらゆるサービスに対する直接的な統合コードを必要とせず、Claude Codeを拡張可能に保ちます。

### MCPサーバーのインストール

**リモートHTTPサーバー**（クラウドサービス向け推奨）:
```bash
claude mcp add --transport http github https://api.githubcopilot.com/mcp/
```

**ローカルStdioサーバー**（ローカルツール向け）:
```bash
claude mcp add --transport stdio airtable -- npx -y airtable-mcp-server
```

**環境変数付き**:
```bash
claude mcp add --transport stdio db \
  --env DATABASE_URL=postgresql://localhost:5432/mydb \
  -- npx -y @bytebase/dbhub
```

### MCPサーバーの管理

```bash
# 設定されているサーバー一覧
claude mcp list

# サーバーの詳細を取得
claude mcp get github

# サーバーを削除
claude mcp remove github

# Claude Code内でステータス確認
/mcp
```

### MCPスコープ

| スコープ | ストレージ | ユースケース |
|----------|-----------|-------------|
| **Local**（デフォルト） | プロジェクトごとの`~/.claude.json` | 個人開発サーバー |
| **Project** | リポジトリ内の`.mcp.json` | チーム共有サーバー |
| **User** | グローバルな`~/.claude.json` | クロスプロジェクトツール |

**Projectスコープ**はチームコラボレーションに最適：

```bash
claude mcp add --transport http sentry --scope project https://mcp.sentry.dev/mcp
```

これによりコミット可能な`.mcp.json`が作成されます：

```json
{
  "mcpServers": {
    "sentry": {
      "type": "http",
      "url": "https://mcp.sentry.dev/mcp"
    }
  }
}
```

### 人気のMCP連携

**GitHub**
```bash
claude mcp add --transport http github https://api.githubcopilot.com/mcp/
```

ユースケース：
- 「PR #456をレビューして改善を提案」
- 「見つかったバグのissueを作成」
- 「自分にアサインされたオープンPRをすべて表示」

**PostgreSQLデータベース**
```bash
claude mcp add --transport stdio db -- npx -y @bytebase/dbhub \
  --dsn "postgresql://user:pass@localhost:5432/mydb"
```

ユースケース：
- 「今月の総売上は？」
- 「usersテーブルのスキーマを表示」
- 「90日間注文していない顧客を見つけて」

**Sentryエラーモニタリング**
```bash
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp
```

ユースケース：
- 「今日最も多いエラーは？」
- 「エラーABC123のスタックトレースを表示」
- 「どのデプロイがこの新しいエラーを導入した？」

**ファイルシステム**
```bash
claude mcp add --transport stdio filesystem -- npx -y @modelcontextprotocol/server-filesystem
```

ユースケース：
- 「srcディレクトリの変更を監視」
- 「今日変更されたすべてのTypeScriptファイルをリスト」

### 認証

多くのMCPサーバーは認証を必要とします。サーバー追加後：

```
/mcp
```

サーバーを選択し、必要に応じてブラウザベースのOAuthフローに従います。

APIキー認証の場合：
```bash
claude mcp add --transport http api https://api.example.com/mcp \
  --header "Authorization: Bearer YOUR_API_KEY"
```

### MCP設定での環境変数

`.mcp.json`ファイルは環境変数の展開をサポート：

```json
{
  "mcpServers": {
    "database": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@bytebase/dbhub", "--dsn", "${DATABASE_URL}"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

`${VAR}`または`${VAR:-default}`構文を使用。

### MCPリソース

MCPサーバーは`@`メンションで参照できるリソースを公開できます：

```
@github:issue://123 を分析して、@postgres:schema://users テーブル構造に
基づいて修正を提案して。
```

フォーマット: `@server:protocol://resource/path`

## コマンドとMCPの組み合わせ

カスタムコマンドがMCP連携を活用すると、真の力が発揮されます。

**Issue分析コマンド**
`.claude/commands/analyze-issue.md`:
```markdown
GitHub issue #$ARGUMENTS を分析して：

1. GitHub MCPを使用してissueの詳細を取得
2. issueで言及されている関連コードファイルを読む
3. Sentryで関連エラーをチェック
4. 影響を受けるユーザー数をデータベースでクエリ
5. 以下を含む修正を提案：
   - 根本原因の分析
   - 実装アプローチ
   - テスト戦略
   - ロールバック計画
```

**データベースマイグレーションコマンド**
`.claude/commands/migrate.md`:
```markdown
以下のためのデータベースマイグレーションを作成: $ARGUMENTS

1. データベースMCPを使用して現在のスキーマをクエリ
2. マイグレーション（upとdown）を設計
3. マイグレーションファイルを作成
4. マイグレーションのテストを生成
5. 必要なデータ変換を文書化
```

## ベストプラクティス

### コマンド設計

- **具体的に**: 曖昧なコマンドは曖昧な結果を生む
- **構造を含める**: 番号付きステップがClaudeの作業をガイド
- **出力形式を指定**: 何が欲しいか正確に伝える
- **コンテキストを参照**: `$ARGUMENTS`を効果的に使用

### MCPセキュリティ

- 認証情報には**環境変数を使用**
- 必要なものだけに**スコープを制限**
- 定期的に**サーバーアクセスを監査**
- 可能な限り**読み取り専用接続を使用**

### チームコラボレーション

- 共有MCP設定のために**`.mcp.json`をコミット**
- チームwikiで**カスタムコマンドを文書化**
- チーム全体で**命名を標準化**
- プロジェクトスコープに追加する前に**パーミッションをレビュー**

## まとめ

Claude Codeを拡張することで、カスタマイズされた開発環境が作成されます：

| 拡張 | 目的 | 場所 |
|------|------|------|
| **カスタムコマンド** | 再利用可能なプロンプトテンプレート | `.claude/commands/` |
| **MCPサーバー** | 外部ツール連携 | `claude mcp add` |
| **MCPリソース** | 外部データ参照 | `@server:resource` |

主要な原則：

- **繰り返しを自動化**: 頻繁なタスク用にコマンドを作成
- **スタックに接続**: データベース、API、サービスを統合
- **チームと共有**: プロジェクトスコープの設定をコミット
- **セキュアに保つ**: 認証情報には環境変数を使用
- **コマンドを反復改善**: 何が機能するかに基づいて改善

Claude Codeの拡張性により、あらゆる開発ワークフローに適応できます。カスタムコマンドとMCP連携は、汎用アシスタントをプロジェクト固有のニーズに合わせた専門ツールに変えます。

## 参考資料

- [Claude Code MCP Documentation](https://code.claude.com/docs/en/mcp)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [Claude Code Settings Documentation](https://code.claude.com/docs/en/settings)
