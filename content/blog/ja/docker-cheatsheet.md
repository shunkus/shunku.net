---
title: "Docker チートシート"
date: "2019-01-15"
updatedDate: "2025-01-15"
excerpt: "アプリケーションの構築とデプロイのためのDockerの基礎、コンテナ化、イメージ管理、ネットワーク、オーケストレーションの包括的なガイドです。"
tags: ["Docker", "コンテナ化", "DevOps", "デプロイメント", "インフラ", "チートシート"]
author: "串上俊"
---

# Docker チートシート

アプリケーションの構築とデプロイのためのDockerの基礎、コンテナ化、イメージ管理、ネットワーク、オーケストレーションの包括的なガイドです。

## 基本的なDockerコマンド

```bash
# Dockerのバージョンを確認
docker --version
docker version

# システム情報を表示
docker info

# ヘルプを取得
docker --help
docker <command> --help

# Docker Hubにログイン
docker login

# Docker Hubからログアウト
docker logout
```

## イメージ管理

```bash
# イメージ一覧表示
docker images
docker image ls

# イメージを検索
docker search <image_name>

# イメージをプル
docker pull <image_name>
docker pull <image_name>:<tag>

# Dockerfileからイメージをビルド
docker build -t <image_name> .
docker build -t <image_name>:<tag> .

# イメージにタグを付ける
docker tag <source_image> <target_image>

# イメージをレジストリにプッシュ
docker push <image_name>:<tag>

# イメージを削除
docker rmi <image_id>
docker image rm <image_name>

# 未使用のイメージをすべて削除
docker image prune

# イメージの履歴を表示
docker history <image_name>

# イメージを詳細表示
docker inspect <image_name>
```

## コンテナ操作

```bash
# コンテナを実行
docker run <image_name>
docker run -d <image_name>                    # デタッチモード
docker run -it <image_name> /bin/bash        # インタラクティブモード
docker run -p 8080:80 <image_name>           # ポートマッピング
docker run --name <container_name> <image>   # 名前付きコンテナ

# 実行中のコンテナ一覧
docker ps

# すべてのコンテナ一覧
docker ps -a

# 停止中のコンテナを開始
docker start <container_id>

# 実行中のコンテナを停止
docker stop <container_id>

# コンテナを再起動
docker restart <container_id>

# コンテナを一時停止/再開
docker pause <container_id>
docker unpause <container_id>

# コンテナを強制終了
docker kill <container_id>

# コンテナを削除
docker rm <container_id>

# 停止中のコンテナをすべて削除
docker container prune

# 実行中のコンテナでコマンドを実行
docker exec -it <container_id> /bin/bash
docker exec <container_id> <command>

# コンテナとホスト間でファイルをコピー
docker cp <file> <container_id>:/path
docker cp <container_id>:/path <file>

# コンテナのログを表示
docker logs <container_id>
docker logs -f <container_id>               # ログを監視

# コンテナのプロセスを表示
docker top <container_id>

# コンテナのリソース使用状況を表示
docker stats
docker stats <container_id>

# コンテナを詳細表示
docker inspect <container_id>
```

## Dockerfileのベストプラクティス

```dockerfile
# 公式ベースイメージを使用
FROM node:16-alpine

# 作業ディレクトリを設定
WORKDIR /app

# パッケージファイルを先にコピー（キャッシュ効率化のため）
COPY package*.json ./

# 依存関係をインストール
RUN npm ci --only=production

# アプリケーションコードをコピー
COPY . .

# 非rootユーザーを作成
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 所有権を変更
RUN chown -R nextjs:nodejs /app
USER nextjs

# ポートを公開
EXPOSE 3000

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# デフォルトコマンド
CMD ["npm", "start"]
```

## Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - db
    volumes:
      - ./src:/app/src
    networks:
      - app-network

  db:
    image: postgres:13
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

### Docker Composeコマンド

```bash
# サービスを開始
docker-compose up
docker-compose up -d              # デタッチモード
docker-compose up --build         # イメージを再ビルド

# サービスを停止
docker-compose down
docker-compose down -v            # ボリュームも削除

# サービスをスケール
docker-compose up -d --scale app=3

# ログを表示
docker-compose logs
docker-compose logs -f app        # 特定のサービスのログを監視

# コマンドを実行
docker-compose exec app /bin/bash

# サービス一覧
docker-compose ps

# サービスを再起動
docker-compose restart
```

## ネットワーク

```bash
# ネットワーク一覧
docker network ls

# ネットワークを作成
docker network create <network_name>
docker network create --driver bridge <network_name>

# ネットワークを詳細表示
docker network inspect <network_name>

# コンテナをネットワークに接続
docker network connect <network_name> <container_id>

# コンテナをネットワークから切断
docker network disconnect <network_name> <container_id>

# ネットワークを削除
docker network rm <network_name>

# 未使用のネットワークを削除
docker network prune
```

## ボリューム管理

```bash
# ボリューム一覧
docker volume ls

# ボリュームを作成
docker volume create <volume_name>

# ボリュームを詳細表示
docker volume inspect <volume_name>

# ボリュームを削除
docker volume rm <volume_name>

# 未使用のボリュームを削除
docker volume prune

# ボリュームをコンテナにマウント
docker run -v <volume_name>:/path/in/container <image>
docker run -v /host/path:/container/path <image>  # バインドマウント
```

## システムクリーンアップ

```bash
# 停止コンテナ、未使用ネットワーク、イメージ、キャッシュを削除
docker system prune

# ボリュームを含めすべて削除
docker system prune -a --volumes

# ディスク使用量を表示
docker system df

# すべてのコンテナを削除
docker rm $(docker ps -aq)

# すべてのイメージを削除
docker rmi $(docker images -q)

# ダングリングイメージを削除
docker image prune

# 未使用のコンテナを削除
docker container prune

# 未使用のネットワークを削除
docker network prune

# 未使用のボリュームを削除
docker volume prune
```

## レジストリとリポジトリ

```bash
# レジストリにログイン
docker login <registry_url>

# レジストリ用にタグ付け
docker tag <image> <registry>/<repository>:<tag>

# レジストリにプッシュ
docker push <registry>/<repository>:<tag>

# レジストリからプル
docker pull <registry>/<repository>:<tag>

# Docker Hubで検索
docker search <term>
```

## Dockerコンテキスト

```bash
# コンテキスト一覧
docker context ls

# コンテキストを作成
docker context create <name> --docker host=ssh://user@host

# コンテキストを使用
docker context use <name>

# コンテキストを削除
docker context rm <name>
```

## マルチステージビルドの例

```dockerfile
# ビルドステージ
FROM node:16-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 本番ステージ
FROM node:16-alpine AS production

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

## よくあるパターン

### 開発環境
```bash
# ボリュームマウントでホットリロード
docker run -it --rm \
  -v $(pwd):/app \
  -v /app/node_modules \
  -p 3000:3000 \
  node:16-alpine \
  sh -c "cd /app && npm run dev"
```

### 環境変数
```bash
# 環境変数を渡す
docker run -e NODE_ENV=production <image>
docker run --env-file .env <image>
```

### ヘルスチェック
```bash
# ヘルスチェック付きで実行
docker run --health-cmd="curl -f http://localhost:3000 || exit 1" \
           --health-interval=30s \
           --health-timeout=3s \
           --health-start-period=5s \
           --health-retries=3 \
           <image>
```

## トラブルシューティング

```bash
# コンテナ起動をデバッグ
docker run --rm -it <image> /bin/sh

# コンテナの終了コードを確認
docker ps -a

# コンテナの詳細情報を表示
docker inspect <container_id>

# リソース使用量を監視
docker stats

# コンテナファイルシステムにアクセス
docker exec -it <container_id> /bin/bash

# コンテナをtarとしてエクスポート
docker export <container_id> > container.tar

# tarをイメージとしてインポート
docker import container.tar <image_name>
```

## セキュリティのベストプラクティス

- 公式ベースイメージを使用
- イメージを最新に保つ
- rootユーザーで実行しない
- .dockerignoreファイルを使用
- イメージの脆弱性をスキャン
- マルチステージビルドを使用
- コンテナリソースを制限
- シークレット管理を使用
- コンテンツ信頼を有効化
- 最小限のベースイメージ（alpine）を使用

このチートシートは、最もよく使用されるDockerコマンドとパターンをカバーしています。Dockerのエコシステムは広大なので、高度な機能や特定のユースケースについては公式ドキュメントを参照してください。