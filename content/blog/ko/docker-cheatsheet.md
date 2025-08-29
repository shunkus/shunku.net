---
title: "Docker 치트시트"
date: "2019-01-15"
updatedDate: "2025-01-15"
excerpt: "애플리케이션 구축 및 배포를 위한 Docker 기초, 컨테이너화, 이미지 관리, 네트워킹, 오케스트레이션의 포괄적인 가이드입니다."
tags: ["Docker", "컨테이너화", "DevOps", "배포", "인프라", "치트시트"]
author: "Shun Kushigami"
---

# Docker 치트시트

애플리케이션 구축 및 배포를 위한 Docker 기초, 컨테이너화, 이미지 관리, 네트워킹, 오케스트레이션의 포괄적인 가이드입니다.

## 기본 Docker 명령어

```bash
# Docker 버전 확인
docker --version
docker version

# 시스템 정보 표시
docker info

# 도움말 보기
docker --help
docker <명령어> --help

# Docker Hub 로그인
docker login

# Docker Hub 로그아웃
docker logout
```

## 이미지 관리

```bash
# 이미지 목록
docker images
docker image ls

# 이미지 검색
docker search <이미지_이름>

# 이미지 다운로드
docker pull <이미지_이름>
docker pull <이미지_이름>:<태그>

# Dockerfile에서 이미지 빌드
docker build -t <이미지_이름> .
docker build -t <이미지_이름>:<태그> .

# 이미지 태그 지정
docker tag <소스_이미지> <타겟_이미지>

# 이미지를 레지스트리에 푸시
docker push <이미지_이름>:<태그>

# 이미지 삭제
docker rmi <이미지_ID>
docker image rm <이미지_이름>

# 사용되지 않는 이미지 모두 삭제
docker image prune

# 이미지 히스토리 표시
docker history <이미지_이름>

# 이미지 상세 정보
docker inspect <이미지_이름>
```

## 컨테이너 작업

```bash
# 컨테이너 실행
docker run <이미지_이름>
docker run -d <이미지_이름>                    # 분리 모드
docker run -it <이미지_이름> /bin/bash        # 대화형 모드
docker run -p 8080:80 <이미지_이름>           # 포트 매핑
docker run --name <컨테이너_이름> <이미지>     # 이름 지정 컨테이너

# 실행 중인 컨테이너 목록
docker ps

# 모든 컨테이너 목록
docker ps -a

# 중지된 컨테이너 시작
docker start <컨테이너_ID>

# 실행 중인 컨테이너 중지
docker stop <컨테이너_ID>

# 컨테이너 재시작
docker restart <컨테이너_ID>

# 컨테이너 일시정지/재개
docker pause <컨테이너_ID>
docker unpause <컨테이너_ID>

# 컨테이너 강제 종료
docker kill <컨테이너_ID>

# 컨테이너 삭제
docker rm <컨테이너_ID>

# 중지된 컨테이너 모두 삭제
docker container prune

# 실행 중인 컨테이너에서 명령 실행
docker exec -it <컨테이너_ID> /bin/bash
docker exec <컨테이너_ID> <명령어>

# 컨테이너와 호스트 간 파일 복사
docker cp <파일> <컨테이너_ID>:/경로
docker cp <컨테이너_ID>:/경로 <파일>

# 컨테이너 로그 표시
docker logs <컨테이너_ID>
docker logs -f <컨테이너_ID>               # 로그 모니터링

# 컨테이너 프로세스 표시
docker top <컨테이너_ID>

# 컨테이너 리소스 사용량 표시
docker stats
docker stats <컨테이너_ID>

# 컨테이너 상세 정보
docker inspect <컨테이너_ID>
```

## Dockerfile 모범 사례

```dockerfile
# 공식 베이스 이미지 사용
FROM node:16-alpine

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일을 먼저 복사 (더 나은 캐싱을 위해)
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production

# 애플리케이션 코드 복사
COPY . .

# 비root 사용자 생성
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 소유권 변경
RUN chown -R nextjs:nodejs /app
USER nextjs

# 포트 노출
EXPOSE 3000

# 헬스 체크
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# 기본 명령
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

### Docker Compose 명령어

```bash
# 서비스 시작
docker-compose up
docker-compose up -d              # 분리 모드
docker-compose up --build         # 이미지 재빌드

# 서비스 중지
docker-compose down
docker-compose down -v            # 볼륨도 삭제

# 서비스 스케일링
docker-compose up -d --scale app=3

# 로그 보기
docker-compose logs
docker-compose logs -f app        # 특정 서비스 로그 모니터링

# 명령 실행
docker-compose exec app /bin/bash

# 서비스 목록
docker-compose ps

# 서비스 재시작
docker-compose restart
```

## 네트워킹

```bash
# 네트워크 목록
docker network ls

# 네트워크 생성
docker network create <네트워크_이름>
docker network create --driver bridge <네트워크_이름>

# 네트워크 상세 정보
docker network inspect <네트워크_이름>

# 컨테이너를 네트워크에 연결
docker network connect <네트워크_이름> <컨테이너_ID>

# 컨테이너를 네트워크에서 연결 해제
docker network disconnect <네트워크_이름> <컨테이너_ID>

# 네트워크 삭제
docker network rm <네트워크_이름>

# 사용되지 않는 네트워크 삭제
docker network prune
```

## 볼륨 관리

```bash
# 볼륨 목록
docker volume ls

# 볼륨 생성
docker volume create <볼륨_이름>

# 볼륨 상세 정보
docker volume inspect <볼륨_이름>

# 볼륨 삭제
docker volume rm <볼륨_이름>

# 사용되지 않는 볼륨 삭제
docker volume prune

# 컨테이너에 볼륨 마운트
docker run -v <볼륨_이름>:/컨테이너/경로 <이미지>
docker run -v /호스트/경로:/컨테이너/경로 <이미지>  # 바인드 마운트
```

## 시스템 정리

```bash
# 중지된 컨테이너, 사용되지 않는 네트워크, 이미지, 캐시 삭제
docker system prune

# 볼륨을 포함한 모든 것 삭제
docker system prune -a --volumes

# 디스크 사용량 표시
docker system df

# 모든 컨테이너 삭제
docker rm $(docker ps -aq)

# 모든 이미지 삭제
docker rmi $(docker images -q)

# 댕글링 이미지 삭제
docker image prune

# 사용되지 않는 컨테이너 삭제
docker container prune

# 사용되지 않는 네트워크 삭제
docker network prune

# 사용되지 않는 볼륨 삭제
docker volume prune
```

## 레지스트리와 저장소

```bash
# 레지스트리 로그인
docker login <레지스트리_URL>

# 레지스트리용 태그 지정
docker tag <이미지> <레지스트리>/<저장소>:<태그>

# 레지스트리에 푸시
docker push <레지스트리>/<저장소>:<태그>

# 레지스트리에서 풀
docker pull <레지스트리>/<저장소>:<태그>

# Docker Hub에서 검색
docker search <검색어>
```

## Docker 컨텍스트

```bash
# 컨텍스트 목록
docker context ls

# 컨텍스트 생성
docker context create <이름> --docker host=ssh://사용자@호스트

# 컨텍스트 사용
docker context use <이름>

# 컨텍스트 삭제
docker context rm <이름>
```

## 멀티스테이지 빌드 예제

```dockerfile
# 빌드 스테이지
FROM node:16-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 프로덕션 스테이지
FROM node:16-alpine AS production

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

## 일반적인 패턴

### 개발 환경
```bash
# 볼륨 마운트로 핫 리로드
docker run -it --rm \
  -v $(pwd):/app \
  -v /app/node_modules \
  -p 3000:3000 \
  node:16-alpine \
  sh -c "cd /app && npm run dev"
```

### 환경 변수
```bash
# 환경 변수 전달
docker run -e NODE_ENV=production <이미지>
docker run --env-file .env <이미지>
```

### 헬스 체크
```bash
# 헬스 체크와 함께 실행
docker run --health-cmd="curl -f http://localhost:3000 || exit 1" \
           --health-interval=30s \
           --health-timeout=3s \
           --health-start-period=5s \
           --health-retries=3 \
           <이미지>
```

## 문제 해결

```bash
# 컨테이너 시작 디버그
docker run --rm -it <이미지> /bin/sh

# 컨테이너 종료 코드 확인
docker ps -a

# 컨테이너 상세 정보 보기
docker inspect <컨테이너_ID>

# 리소스 사용량 모니터링
docker stats

# 컨테이너 파일시스템 접근
docker exec -it <컨테이너_ID> /bin/bash

# 컨테이너를 tar로 내보내기
docker export <컨테이너_ID> > container.tar

# tar를 이미지로 가져오기
docker import container.tar <이미지_이름>
```

## 보안 모범 사례

- 공식 베이스 이미지 사용
- 이미지를 최신 상태로 유지
- root 사용자로 실행하지 않기
- .dockerignore 파일 사용
- 이미지 취약점 스캔
- 멀티스테이지 빌드 사용
- 컨테이너 리소스 제한
- 시크릿 관리 사용
- 콘텐츠 신뢰 활성화
- 최소 베이스 이미지 사용 (alpine)

이 치트시트는 가장 일반적으로 사용되는 Docker 명령어와 패턴을 다룹니다. Docker 생태계는 방대하므로 고급 기능과 특정 사용 사례에 대해서는 공식 문서를 참조하세요.