---
title: "Docker Compose：マルチコンテナアプリケーションの管理"
date: "2025-01-18"
excerpt: "Docker Composeでマルチコンテナアプリケーションを定義・実行する方法を学びます。docker-compose.yml、サービス、ネットワーク、ボリューム、環境管理をマスターしましょう。"
tags: ["Docker", "Containers", "DevOps"]
author: "Shunku"
---

Docker Composeは、マルチコンテナDockerアプリケーションを定義・実行するためのツールです。複数の`docker run`コマンドを実行する代わりに、すべてを単一のYAMLファイルで定義し、シンプルなコマンドで管理できます。

## なぜDocker Composeか？

Composeなしでは、一般的なWebアプリケーションの起動は次のようになります：

```bash
# ネットワークを作成
docker network create myapp-network

# データベースを起動
docker run -d \
  --name postgres \
  --network myapp-network \
  -e POSTGRES_PASSWORD=secret \
  -v pgdata:/var/lib/postgresql/data \
  postgres:15

# Redisを起動
docker run -d \
  --name redis \
  --network myapp-network \
  redis:7

# アプリケーションを起動
docker run -d \
  --name app \
  --network myapp-network \
  -p 3000:3000 \
  -e DATABASE_URL=postgres://postgres:secret@postgres:5432/app \
  myapp:latest
```

Composeを使えば、これが単一のファイルになります：

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://postgres:secret@postgres:5432/app
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7

volumes:
  pgdata:
```

```bash
# すべてを起動
docker compose up -d
```

## 基本構造

`docker-compose.yml`ファイルには以下のトップレベル要素があります：

```yaml
version: "3.9"  # 最新のDockerでは省略可能

services:       # コンテナ定義
  web:
    # サービス設定...
  db:
    # サービス設定...

volumes:        # 名前付きボリューム
  data:

networks:       # カスタムネットワーク
  backend:

configs:        # 設定ファイル
  my_config:

secrets:        # 機密データ
  my_secret:
```

## 基本コマンド

```bash
# サービスを起動
docker compose up              # フォアグラウンド
docker compose up -d           # デタッチ（バックグラウンド）

# サービスを停止
docker compose stop            # 削除せずに停止
docker compose down            # 停止してコンテナを削除
docker compose down -v         # ボリュームも削除

# ステータス確認
docker compose ps              # コンテナを一覧
docker compose logs            # ログを表示
docker compose logs -f web     # 特定サービスのログを追跡

# ビルド
docker compose build           # 全サービスをビルド
docker compose build --no-cache # キャッシュなしでビルド

# コマンド実行
docker compose exec web bash   # サービス内でコマンド実行
docker compose run web npm test # 一回限りのコマンドを実行

# スケール
docker compose up -d --scale web=3  # 3インスタンスを実行
```

## サービス設定

### Image vs Build

```yaml
services:
  # ビルド済みイメージを使用
  redis:
    image: redis:7-alpine

  # Dockerfileからビルド
  app:
    build: .

  # オプション付きでビルド
  app-advanced:
    build:
      context: ./app
      dockerfile: Dockerfile.prod
      args:
        NODE_ENV: production
      target: production  # マルチステージターゲット
```

### ポート

```yaml
services:
  web:
    ports:
      - "3000:3000"           # ホスト:コンテナ
      - "8080:80"             # 異なるポート
      - "127.0.0.1:3000:3000" # localhostのみにバインド
      - "3000"                # ランダムなホストポート
```

### 環境変数

```yaml
services:
  app:
    # インライン定義
    environment:
      NODE_ENV: production
      DEBUG: "false"
      DATABASE_URL: postgres://user:pass@db:5432/mydb

    # .envファイルから
    env_file:
      - .env
      - .env.local

    # ホストから渡す
    environment:
      - API_KEY  # ホスト環境の値を使用
```

### ボリューム

```yaml
services:
  app:
    volumes:
      # 名前付きボリューム
      - data:/var/lib/data

      # バインドマウント（ホストパス）
      - ./src:/app/src

      # 読み取り専用バインドマウント
      - ./config:/app/config:ro

      # 匿名ボリューム
      - /app/node_modules

volumes:
  data:
    driver: local
```

### 依存関係

```yaml
services:
  app:
    depends_on:
      - db
      - redis

  # ヘルスチェック条件付き
  app:
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started

  db:
    image: postgres:15
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
```

### ネットワーク

```yaml
services:
  frontend:
    networks:
      - frontend

  backend:
    networks:
      - frontend
      - backend

  db:
    networks:
      - backend

networks:
  frontend:
  backend:
    internal: true  # 外部アクセスなし
```

### リソース制限

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### 再起動ポリシー

```yaml
services:
  app:
    restart: unless-stopped

  # オプション: no, always, on-failure, unless-stopped
```

### ヘルスチェック

```yaml
services:
  web:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## 完全な例：Webアプリケーションスタック

```yaml
# docker-compose.yml
services:
  # アプリケーション
  app:
    build:
      context: .
      target: production
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgres://postgres:${DB_PASSWORD}@db:5432/myapp
      REDIS_URL: redis://redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # データベース
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # キャッシュ
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped

  # リバースプロキシ
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

```bash
# .envファイル
DB_PASSWORD=supersecretpassword
```

## 開発 vs 本番

異なる環境には複数のComposeファイルを使用：

```yaml
# docker-compose.yml（ベース）
services:
  app:
    build: .
    environment:
      NODE_ENV: ${NODE_ENV:-development}

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```yaml
# docker-compose.override.yml（開発 - 自動読み込み）
services:
  app:
    build:
      target: development
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "3000:3000"
      - "9229:9229"  # デバッグポート
    command: npm run dev

  db:
    ports:
      - "5432:5432"  # ローカルツール用に公開
```

```yaml
# docker-compose.prod.yml（本番）
services:
  app:
    build:
      target: production
    restart: always
    deploy:
      resources:
        limits:
          memory: 512M

  db:
    restart: always
    # 本番ではポートを公開しない
```

```bash
# 開発（overrideは自動的に使用）
docker compose up

# 本番
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 便利なパターン

### 依存関係を待つ

```yaml
services:
  app:
    depends_on:
      db:
        condition: service_healthy
    # または待機スクリプトを使用
    command: sh -c "wait-for-it db:5432 -- npm start"
```

### Initコンテナパターン

```yaml
services:
  migrate:
    build: .
    command: npm run migrate
    depends_on:
      db:
        condition: service_healthy

  app:
    build: .
    depends_on:
      migrate:
        condition: service_completed_successfully
```

### オプションサービス用プロファイル

```yaml
services:
  app:
    # 常に起動
    build: .

  db:
    # 常に起動
    image: postgres:15

  debug-tools:
    # debugプロファイルのみ
    profiles: ["debug"]
    image: nicolaka/netshoot

  monitoring:
    # monitoringプロファイルのみ
    profiles: ["monitoring"]
    image: prom/prometheus
```

```bash
# オプションサービスなしで起動
docker compose up -d

# デバッグツール付きで起動
docker compose --profile debug up -d

# 複数プロファイルで起動
docker compose --profile debug --profile monitoring up -d
```

### サービスの拡張

```yaml
# docker-compose.yml
services:
  base-app:
    build: .
    environment:
      - LOG_LEVEL=info

  worker:
    extends:
      service: base-app
    command: npm run worker

  scheduler:
    extends:
      service: base-app
    command: npm run scheduler
```

## 環境変数

### 変数の置換

```yaml
services:
  app:
    image: myapp:${TAG:-latest}  # デフォルト値
    environment:
      - DB_HOST=${DB_HOST:?DB_HOST is required}  # 必須
      - DEBUG=${DEBUG:-false}
```

### .envファイル

```bash
# .env
COMPOSE_PROJECT_NAME=myproject
TAG=v1.2.3
DB_HOST=db
DB_PASSWORD=secret
```

`.env`ファイルはComposeによって自動的に読み込まれます。

## ネットワーキング詳細

```yaml
services:
  frontend:
    networks:
      webnet:
        aliases:
          - web
          - frontend-app

  backend:
    networks:
      webnet:
      dbnet:
        ipv4_address: 172.28.0.10

networks:
  webnet:
    driver: bridge
  dbnet:
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16
```

### サービスディスカバリ

サービスはサービス名で相互にアクセスできます：

```yaml
services:
  app:
    environment:
      DATABASE_URL: postgres://db:5432/mydb  # "db"はサービス名
      REDIS_URL: redis://redis:6379
```

## ベストプラクティス

### 1. 特定のイメージタグを使用

```yaml
# 悪い例
services:
  db:
    image: postgres

# 良い例
services:
  db:
    image: postgres:15.4-alpine
```

### 2. シークレットをComposeファイルに保存しない

```yaml
# 悪い例
services:
  db:
    environment:
      POSTGRES_PASSWORD: mysecretpassword

# 良い例 - .envを使用（コミットしない）
services:
  db:
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
```

### 3. ヘルスチェックを使用

```yaml
services:
  db:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  app:
    depends_on:
      db:
        condition: service_healthy
```

### 4. ボリュームに名前を付ける

```yaml
# 悪い例 - 匿名ボリューム
services:
  db:
    volumes:
      - /var/lib/postgresql/data

# 良い例 - 名前付きボリューム
services:
  db:
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## クイックリファレンス

| コマンド | 説明 |
|---------|------|
| `docker compose up` | コンテナを作成して起動 |
| `docker compose up -d` | デタッチモードで起動 |
| `docker compose down` | 停止してコンテナを削除 |
| `docker compose down -v` | ボリュームも削除 |
| `docker compose ps` | コンテナを一覧 |
| `docker compose logs` | 出力を表示 |
| `docker compose logs -f` | 出力を追跡 |
| `docker compose exec SERVICE CMD` | コマンドを実行 |
| `docker compose build` | イメージをビルド |
| `docker compose pull` | イメージをプル |
| `docker compose restart` | サービスを再起動 |

## 重要なポイント

1. **一つのファイルですべてを管理** - アプリケーションスタック全体を一箇所で定義
2. **depends_onは条件付きで** - 適切な起動順序を確保
3. **環境を分離** - 開発/本番の違いにはoverrideファイルを使用
4. **ヘルスチェックは必須** - 信頼性の高いコンテナオーケストレーションのために
5. **設定には.envを使用** - composeファイルからシークレットを除外
6. **名前付きボリュームでデータを永続化** - 匿名ボリュームは削除時に失われる

## 次のステップ

次の記事では、Dockerボリュームとデータ永続化戦略について詳しく解説します。

## 参考文献

- Docker Deep Dive, 5th Edition - Nigel Poulton
- The Ultimate Docker Container Book, 3rd Edition - Dr. Gabriel N. Schenker
- [Docker Composeリファレンス](https://docs.docker.com/compose/compose-file/)
