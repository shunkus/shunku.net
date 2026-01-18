---
title: "Docker CI/CD Pipeline with GitHub Actions"
date: "2025-01-18"
excerpt: "Build automated CI/CD pipelines for Docker applications using GitHub Actions. Learn image building, testing, security scanning, and deployment strategies."
tags: ["Docker", "Containers", "DevOps", "CICD"]
author: "Shunku"
---

Automating Docker builds and deployments through CI/CD pipelines ensures consistent, reliable releases. This article covers building production-ready pipelines with GitHub Actions.

## CI/CD Pipeline Overview

A typical Docker CI/CD pipeline:

```mermaid
flowchart LR
    subgraph CI["Continuous Integration"]
        Code["Code Push"] --> Build["Build Image"]
        Build --> Test["Run Tests"]
        Test --> Scan["Security Scan"]
        Scan --> Push["Push to Registry"]
    end

    subgraph CD["Continuous Deployment"]
        Push --> Stage["Deploy to Staging"]
        Stage --> Approval["Manual Approval"]
        Approval --> Prod["Deploy to Production"]
    end

    style Code fill:#3b82f6,color:#fff
    style Push fill:#22c55e,color:#fff
    style Prod fill:#8b5cf6,color:#fff
```

## Basic Docker Build Workflow

### Simple Build and Push

```yaml
# .github/workflows/docker-build.yml
name: Docker Build and Push

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        if: github.event_name != 'pull_request'
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix=
            type=semver,pattern={{version}}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

## Multi-Architecture Builds

Build images for multiple CPU architectures:

```yaml
name: Multi-Architecture Build

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          platforms: linux/amd64,linux/arm64,linux/arm/v7
          push: true
          tags: |
            ${{ secrets.DOCKERHUB_USERNAME }}/myapp:latest
            ${{ secrets.DOCKERHUB_USERNAME }}/myapp:${{ github.sha }}
```

## Testing in CI

### Running Tests in Containers

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build test image
        run: docker build --target test -t myapp:test .

      - name: Run unit tests
        run: |
          docker run --rm myapp:test npm test

      - name: Run integration tests
        run: |
          docker compose -f docker-compose.test.yml up --abort-on-container-exit
          docker compose -f docker-compose.test.yml down -v
```

### Docker Compose for Testing

```yaml
# docker-compose.test.yml
version: "3.8"

services:
  app:
    build:
      context: .
      target: test
    environment:
      - DATABASE_URL=postgres://test:test@db:5432/test
      - REDIS_URL=redis://redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    command: npm run test:integration

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
      POSTGRES_DB: test
    healthcheck:
      test: pg_isready -U test
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
```

### Multi-Stage Dockerfile for Testing

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Test stage
FROM builder AS test
RUN npm ci --include=dev
CMD ["npm", "test"]

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
USER node
CMD ["node", "dist/index.js"]
```

## Security Scanning

### Trivy Security Scanner

```yaml
name: Security Scan

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 0 * * *'  # Daily scan

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Build image
        run: docker build -t myapp:${{ github.sha }} .

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'myapp:${{ github.sha }}'
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: 'trivy-results.sarif'
```

### Docker Scout

```yaml
name: Docker Scout

on:
  push:
    branches: [main]

jobs:
  scout:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build image
        run: docker build -t myapp:${{ github.sha }} .

      - name: Docker Scout CVE scan
        uses: docker/scout-action@v1
        with:
          command: cves
          image: myapp:${{ github.sha }}
          only-severities: critical,high
          exit-code: true

      - name: Docker Scout recommendations
        uses: docker/scout-action@v1
        with:
          command: recommendations
          image: myapp:${{ github.sha }}
```

## Complete CI/CD Pipeline

A production-ready pipeline with all stages:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
    tags: ['v*']
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # Lint and static analysis
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Lint Dockerfile
        uses: hadolint/hadolint-action@v3.1.0
        with:
          dockerfile: Dockerfile

      - name: Run linters
        run: |
          docker run --rm -v $(pwd):/app -w /app node:20-alpine npm run lint

  # Run tests
  test:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4

      - name: Build test image
        run: docker build --target test -t ${{ env.IMAGE_NAME }}:test .

      - name: Run tests
        run: |
          docker run --rm \
            -v $(pwd)/coverage:/app/coverage \
            ${{ env.IMAGE_NAME }}:test \
            npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  # Build and push image
  build:
    runs-on: ubuntu-latest
    needs: test
    permissions:
      contents: read
      packages: write
      security-events: write
    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}
      image-digest: ${{ steps.build.outputs.digest }}

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=sha,prefix=
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}

      - name: Build and push
        id: build
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          provenance: true
          sbom: true

      - name: Run Trivy scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload scan results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

  # Deploy to staging
  deploy-staging:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment:
      name: staging
      url: https://staging.example.com
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to staging
        run: |
          # Example: Deploy to Kubernetes
          kubectl set image deployment/myapp \
            myapp=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}@${{ needs.build.outputs.image-digest }} \
            --namespace staging

      - name: Run smoke tests
        run: |
          curl -f https://staging.example.com/health || exit 1

  # Deploy to production
  deploy-production:
    runs-on: ubuntu-latest
    needs: [build, deploy-staging]
    if: startsWith(github.ref, 'refs/tags/v')
    environment:
      name: production
      url: https://example.com
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to production
        run: |
          kubectl set image deployment/myapp \
            myapp=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}@${{ needs.build.outputs.image-digest }} \
            --namespace production

      - name: Verify deployment
        run: |
          kubectl rollout status deployment/myapp --namespace production
```

## Deployment Strategies

### Rolling Update

```yaml
# kubernetes/deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
        - name: myapp
          image: ghcr.io/org/myapp:latest
          ports:
            - containerPort: 3000
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
```

### Blue-Green Deployment

```yaml
deploy-blue-green:
  runs-on: ubuntu-latest
  steps:
    - name: Deploy new version (green)
      run: |
        kubectl apply -f k8s/deployment-green.yml
        kubectl wait --for=condition=ready pod -l version=green --timeout=300s

    - name: Run tests against green
      run: |
        GREEN_URL=$(kubectl get svc myapp-green -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
        curl -f http://$GREEN_URL/health

    - name: Switch traffic to green
      run: |
        kubectl patch svc myapp -p '{"spec":{"selector":{"version":"green"}}}'

    - name: Remove blue deployment
      run: |
        kubectl delete -f k8s/deployment-blue.yml
```

### Canary Deployment

```yaml
deploy-canary:
  runs-on: ubuntu-latest
  steps:
    - name: Deploy canary (10% traffic)
      run: |
        kubectl apply -f k8s/deployment-canary.yml
        kubectl scale deployment myapp-canary --replicas=1
        kubectl scale deployment myapp-stable --replicas=9

    - name: Monitor canary metrics
      run: |
        # Check error rate for 10 minutes
        sleep 600
        ERROR_RATE=$(curl -s prometheus/api/v1/query?query=rate(http_errors_total[5m]))
        if [ "$ERROR_RATE" -gt "0.01" ]; then
          echo "High error rate, rolling back"
          kubectl scale deployment myapp-canary --replicas=0
          exit 1
        fi

    - name: Promote canary to stable
      run: |
        kubectl set image deployment/myapp-stable myapp=${{ env.NEW_IMAGE }}
        kubectl scale deployment myapp-canary --replicas=0
```

## Registry Management

### Multiple Registries

```yaml
push-multiple-registries:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: Login to Docker Hub
      uses: docker/login-action@v3
      with:
        username: ${{ secrets.DOCKERHUB_USERNAME }}
        password: ${{ secrets.DOCKERHUB_TOKEN }}

    - name: Login to GHCR
      uses: docker/login-action@v3
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Login to AWS ECR
      uses: docker/login-action@v3
      with:
        registry: ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ secrets.AWS_REGION }}.amazonaws.com
        username: ${{ secrets.AWS_ACCESS_KEY_ID }}
        password: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

    - name: Build and push to all registries
      uses: docker/build-push-action@v5
      with:
        push: true
        tags: |
          docker.io/myorg/myapp:${{ github.sha }}
          ghcr.io/myorg/myapp:${{ github.sha }}
          ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ secrets.AWS_REGION }}.amazonaws.com/myapp:${{ github.sha }}
```

## Image Tagging Strategy

| Tag Pattern | Use Case |
|-------------|----------|
| `latest` | Most recent build from main |
| `v1.2.3` | Semantic version releases |
| `sha-abc123` | Specific commit builds |
| `main-20250118` | Date-based builds |
| `pr-42` | Pull request builds |

```yaml
- name: Generate tags
  id: meta
  uses: docker/metadata-action@v5
  with:
    images: ghcr.io/${{ github.repository }}
    tags: |
      type=raw,value=latest,enable=${{ github.ref == 'refs/heads/main' }}
      type=semver,pattern={{version}}
      type=semver,pattern={{major}}.{{minor}}
      type=sha,prefix=sha-
      type=ref,event=pr,prefix=pr-
```

## Caching Strategies

### GitHub Actions Cache

```yaml
- name: Build with cache
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: myapp:latest
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

### Registry Cache

```yaml
- name: Build with registry cache
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: myapp:latest
    cache-from: type=registry,ref=ghcr.io/myorg/myapp:buildcache
    cache-to: type=registry,ref=ghcr.io/myorg/myapp:buildcache,mode=max
```

## Secrets Management

```yaml
- name: Build with secrets
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: myapp:latest
    secrets: |
      npm_token=${{ secrets.NPM_TOKEN }}
      github_token=${{ secrets.GITHUB_TOKEN }}
```

```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app

# Use secret during build
RUN --mount=type=secret,id=npm_token \
    NPM_TOKEN=$(cat /run/secrets/npm_token) \
    npm ci
```

## Key Takeaways

| Practice | Benefit |
|----------|---------|
| Multi-stage builds | Smaller images, faster CI |
| Build caching | Faster builds |
| Security scanning | Catch vulnerabilities early |
| Multi-arch builds | Support diverse environments |
| Automated testing | Reliable releases |
| Gradual rollouts | Safe deployments |

## Best Practices

1. **Pin versions** - Use specific image tags, not `latest`
2. **Scan images** - Run security scans on every build
3. **Use build cache** - Speed up CI with layer caching
4. **Sign images** - Verify image authenticity
5. **Automate everything** - Manual steps cause errors
6. **Monitor deployments** - Watch metrics after releases

## References

- Docker Deep Dive, 5th Edition - Nigel Poulton
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [Trivy Scanner](https://aquasecurity.github.io/trivy/)
