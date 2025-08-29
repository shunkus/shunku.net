---
title: "Docker 速查表"
date: "2019-01-15"
updatedDate: "2025-01-15"
excerpt: "用于构建和部署应用程序的Docker基础、容器化、镜像管理、网络和编排的综合指南。"
tags: ["Docker", "容器化", "DevOps", "部署", "基础设施", "速查表"]
author: "Shun Kushigami"
---

# Docker 速查表

用于构建和部署应用程序的Docker基础、容器化、镜像管理、网络和编排的综合指南。

## 基本 Docker 命令

```bash
# 检查 Docker 版本
docker --version
docker version

# 显示系统信息
docker info

# 获取帮助
docker --help
docker <command> --help

# 登录 Docker Hub
docker login

# 登出 Docker Hub
docker logout
```

## 镜像管理

```bash
# 列出镜像
docker images
docker image ls

# 搜索镜像
docker search <镜像名称>

# 拉取镜像
docker pull <镜像名称>
docker pull <镜像名称>:<标签>

# 从 Dockerfile 构建镜像
docker build -t <镜像名称> .
docker build -t <镜像名称>:<标签> .

# 给镜像打标签
docker tag <源镜像> <目标镜像>

# 推送镜像到注册表
docker push <镜像名称>:<标签>

# 删除镜像
docker rmi <镜像ID>
docker image rm <镜像名称>

# 删除所有未使用的镜像
docker image prune

# 显示镜像历史
docker history <镜像名称>

# 检查镜像
docker inspect <镜像名称>
```

## 容器操作

```bash
# 运行容器
docker run <镜像名称>
docker run -d <镜像名称>                    # 分离模式
docker run -it <镜像名称> /bin/bash        # 交互模式
docker run -p 8080:80 <镜像名称>           # 端口映射
docker run --name <容器名称> <镜像>         # 命名容器

# 列出运行中的容器
docker ps

# 列出所有容器
docker ps -a

# 启动已停止的容器
docker start <容器ID>

# 停止运行中的容器
docker stop <容器ID>

# 重启容器
docker restart <容器ID>

# 暂停/取消暂停容器
docker pause <容器ID>
docker unpause <容器ID>

# 杀死容器
docker kill <容器ID>

# 删除容器
docker rm <容器ID>

# 删除所有已停止的容器
docker container prune

# 在运行中的容器中执行命令
docker exec -it <容器ID> /bin/bash
docker exec <容器ID> <命令>

# 在容器和主机之间复制文件
docker cp <文件> <容器ID>:/路径
docker cp <容器ID>:/路径 <文件>

# 显示容器日志
docker logs <容器ID>
docker logs -f <容器ID>               # 跟随日志

# 显示容器进程
docker top <容器ID>

# 显示容器资源使用情况
docker stats
docker stats <容器ID>

# 检查容器
docker inspect <容器ID>
```

## Dockerfile 最佳实践

```dockerfile
# 使用官方基础镜像
FROM node:16-alpine

# 设置工作目录
WORKDIR /app

# 先复制包文件（为了更好的缓存）
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制应用代码
COPY . .

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 更改所有权
RUN chown -R nextjs:nodejs /app
USER nextjs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# 默认命令
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

### Docker Compose 命令

```bash
# 启动服务
docker-compose up
docker-compose up -d              # 分离模式
docker-compose up --build         # 重新构建镜像

# 停止服务
docker-compose down
docker-compose down -v            # 删除卷

# 缩放服务
docker-compose up -d --scale app=3

# 查看日志
docker-compose logs
docker-compose logs -f app        # 跟随特定服务的日志

# 执行命令
docker-compose exec app /bin/bash

# 列出服务
docker-compose ps

# 重启服务
docker-compose restart
```

## 网络

```bash
# 列出网络
docker network ls

# 创建网络
docker network create <网络名称>
docker network create --driver bridge <网络名称>

# 检查网络
docker network inspect <网络名称>

# 连接容器到网络
docker network connect <网络名称> <容器ID>

# 断开容器与网络的连接
docker network disconnect <网络名称> <容器ID>

# 删除网络
docker network rm <网络名称>

# 删除未使用的网络
docker network prune
```

## 卷管理

```bash
# 列出卷
docker volume ls

# 创建卷
docker volume create <卷名称>

# 检查卷
docker volume inspect <卷名称>

# 删除卷
docker volume rm <卷名称>

# 删除未使用的卷
docker volume prune

# 将卷挂载到容器
docker run -v <卷名称>:/容器内路径 <镜像>
docker run -v /主机路径:/容器路径 <镜像>  # 绑定挂载
```

## 系统清理

```bash
# 删除已停止的容器、未使用的网络、镜像和缓存
docker system prune

# 删除所有内容包括卷
docker system prune -a --volumes

# 显示磁盘使用情况
docker system df

# 删除所有容器
docker rm $(docker ps -aq)

# 删除所有镜像
docker rmi $(docker images -q)

# 删除悬挂镜像
docker image prune

# 删除未使用的容器
docker container prune

# 删除未使用的网络
docker network prune

# 删除未使用的卷
docker volume prune
```

## 注册表和仓库

```bash
# 登录到注册表
docker login <注册表URL>

# 为注册表打标签
docker tag <镜像> <注册表>/<仓库>:<标签>

# 推送到注册表
docker push <注册表>/<仓库>:<标签>

# 从注册表拉取
docker pull <注册表>/<仓库>:<标签>

# 在 Docker Hub 中搜索
docker search <搜索词>
```

## Docker 上下文

```bash
# 列出上下文
docker context ls

# 创建上下文
docker context create <名称> --docker host=ssh://用户@主机

# 使用上下文
docker context use <名称>

# 删除上下文
docker context rm <名称>
```

## 多阶段构建示例

```dockerfile
# 构建阶段
FROM node:16-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 生产阶段
FROM node:16-alpine AS production

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

## 常见模式

### 开发环境
```bash
# 使用卷挂载的热重载
docker run -it --rm \
  -v $(pwd):/app \
  -v /app/node_modules \
  -p 3000:3000 \
  node:16-alpine \
  sh -c "cd /app && npm run dev"
```

### 环境变量
```bash
# 传递环境变量
docker run -e NODE_ENV=production <镜像>
docker run --env-file .env <镜像>
```

### 健康检查
```bash
# 运行时进行健康检查
docker run --health-cmd="curl -f http://localhost:3000 || exit 1" \
           --health-interval=30s \
           --health-timeout=3s \
           --health-start-period=5s \
           --health-retries=3 \
           <镜像>
```

## 故障排除

```bash
# 调试容器启动
docker run --rm -it <镜像> /bin/sh

# 检查容器退出代码
docker ps -a

# 查看详细的容器信息
docker inspect <容器ID>

# 监控资源使用情况
docker stats

# 访问容器文件系统
docker exec -it <容器ID> /bin/bash

# 将容器导出为tar
docker export <容器ID> > container.tar

# 将tar导入为镜像
docker import container.tar <镜像名称>
```

## 安全最佳实践

- 使用官方基础镜像
- 保持镜像更新
- 不以root用户运行
- 使用.dockerignore文件
- 扫描镜像漏洞
- 使用多阶段构建
- 限制容器资源
- 使用密钥管理
- 启用内容信任
- 使用最小基础镜像（alpine）

这个速查表涵盖了最常用的Docker命令和模式。Docker生态系统庞大，对于高级功能和特定用例，请参考官方文档。