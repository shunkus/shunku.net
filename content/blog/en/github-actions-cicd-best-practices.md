---
title: "GitHub Actions CI/CD Best Practices: From Build to Deploy"
date: "2025-01-18"
excerpt: "Master CI/CD with GitHub Actions. Learn about environments, OIDC authentication, deployment strategies like Blue-Green and Canary, and production-ready workflows."
tags: ["GitHub Actions", "Git", "DevOps"]
author: "Shunku"
---

## Introduction

Continuous Integration and Continuous Deployment (CI/CD) automates the process of building, testing, and deploying your code. GitHub Actions provides powerful features for implementing production-grade CI/CD pipelines.

This article covers best practices for building robust CI/CD workflows.

## CI/CD Pipeline Overview

```mermaid
flowchart LR
    subgraph CI["Continuous Integration"]
        A["Commit"] --> B["Build"]
        B --> C["Test"]
        C --> D["Analyze"]
    end

    subgraph CD["Continuous Deployment"]
        E["Stage"] --> F["Approve"]
        F --> G["Deploy"]
        G --> H["Verify"]
    end

    CI --> CD

    style CI fill:#3b82f6,color:#fff
    style CD fill:#22c55e,color:#fff
```

## Continuous Integration Best Practices

### 1. Fast Feedback Loop

Keep CI fast to maintain developer productivity:

```yaml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  # Quick checks first
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  # Unit tests in parallel
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test

  # Build only if lint and test pass
  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
```

### 2. Efficient Caching

Cache dependencies to speed up builds:

```yaml
- name: Cache dependencies
  uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-

- name: Cache build output
  uses: actions/cache@v4
  with:
    path: .next/cache
    key: ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-${{ hashFiles('**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx') }}
    restore-keys: |
      ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-
```

### 3. Path Filtering

Only run workflows when relevant files change:

```yaml
on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'package.json'
      - 'package-lock.json'
      - '.github/workflows/ci.yml'
    paths-ignore:
      - '**.md'
      - 'docs/**'
```

### 4. Artifact Management

Upload build artifacts for later stages:

```yaml
- name: Build
  run: npm run build

- name: Upload artifact
  uses: actions/upload-artifact@v4
  with:
    name: build-${{ github.sha }}
    path: dist/
    retention-days: 7
    if-no-files-found: error
```

## Environments and Approvals

### Setting Up Environments

Environments provide protection rules and secrets:

```yaml
jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.example.com

    steps:
      - name: Deploy to staging
        run: ./deploy.sh
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://example.com

    steps:
      - name: Deploy to production
        run: ./deploy.sh
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```

### Environment Protection Rules

Configure in GitHub Settings > Environments:

| Rule | Purpose |
|------|---------|
| **Required reviewers** | Manual approval before deployment |
| **Wait timer** | Delay deployment by N minutes |
| **Deployment branches** | Limit which branches can deploy |
| **Environment secrets** | Secrets specific to environment |

## OIDC Authentication

### Why OIDC?

OpenID Connect eliminates the need for long-lived credentials:

```mermaid
flowchart LR
    subgraph Traditional["Traditional (Risky)"]
        A["Store credentials<br/>as secrets"] --> B["Rotate manually"]
        B --> C["Risk of exposure"]
    end

    subgraph OIDC["OIDC (Secure)"]
        D["Request token"] --> E["Short-lived token"]
        E --> F["Auto-expires"]
    end

    style Traditional fill:#ef4444,color:#fff
    style OIDC fill:#22c55e,color:#fff
```

### AWS OIDC Configuration

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read

    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/GitHubActions
          aws-region: us-east-1

      - name: Deploy to S3
        run: aws s3 sync ./dist s3://my-bucket
```

### Azure OIDC Configuration

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read

    steps:
      - uses: actions/checkout@v4

      - name: Azure Login
        uses: azure/login@v1
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Deploy to Azure
        run: az webapp deploy --name myapp --src-path ./dist
```

### Google Cloud OIDC Configuration

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read

    steps:
      - uses: actions/checkout@v4

      - name: Authenticate to GCP
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: 'projects/123/locations/global/workloadIdentityPools/pool/providers/github'
          service_account: 'deploy@project.iam.gserviceaccount.com'

      - name: Deploy to Cloud Run
        run: gcloud run deploy myservice --source .
```

## Deployment Strategies

### Blue-Green Deployment

Zero-downtime deployment by switching between environments:

```mermaid
flowchart TB
    subgraph Before["Before Switch"]
        LB1["Load Balancer"] --> Blue1["Blue (v1.0)"]
        Green1["Green (v1.1)"]
    end

    subgraph After["After Switch"]
        LB2["Load Balancer"] --> Green2["Green (v1.1)"]
        Blue2["Blue (v1.0)"]
    end

    Before --> |"Switch traffic"| After

    style Blue1 fill:#3b82f6,color:#fff
    style Green1 fill:#22c55e,color:#fff
    style Green2 fill:#22c55e,color:#fff
    style Blue2 fill:#6b7280,color:#fff
```

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to inactive environment
        run: |
          INACTIVE=$(./get-inactive-env.sh)
          ./deploy.sh $INACTIVE

      - name: Run smoke tests
        run: ./smoke-test.sh $INACTIVE_URL

      - name: Switch traffic
        if: success()
        run: ./switch-traffic.sh

      - name: Rollback on failure
        if: failure()
        run: ./rollback.sh
```

### Canary Deployment

Gradually roll out to a subset of users:

```yaml
jobs:
  deploy-canary:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy canary (10% traffic)
        run: ./deploy-canary.sh --percentage 10

      - name: Monitor for 5 minutes
        run: |
          sleep 300
          ./check-metrics.sh --threshold error_rate=0.01

      - name: Increase to 50%
        run: ./deploy-canary.sh --percentage 50

      - name: Monitor for 5 minutes
        run: |
          sleep 300
          ./check-metrics.sh --threshold error_rate=0.01

      - name: Full rollout
        run: ./deploy-canary.sh --percentage 100
```

### Rolling Deployment

Update instances one by one:

```yaml
jobs:
  rolling-deploy:
    runs-on: ubuntu-latest
    strategy:
      max-parallel: 1
      matrix:
        instance: [1, 2, 3, 4]

    steps:
      - name: Deploy to instance ${{ matrix.instance }}
        run: ./deploy-instance.sh ${{ matrix.instance }}

      - name: Health check
        run: ./health-check.sh ${{ matrix.instance }}

      - name: Wait before next
        run: sleep 60
```

## Complete CI/CD Workflow

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'

jobs:
  # CI Stage
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/

  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build
          path: dist/

  # CD Stage - Only on main branch
  deploy-staging:
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.example.com
    permissions:
      id-token: write
      contents: read

    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build
          path: dist/

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: us-east-1

      - name: Deploy to staging
        run: aws s3 sync dist/ s3://staging-bucket

      - name: Run E2E tests
        run: npm run test:e2e -- --url https://staging.example.com

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://example.com
    permissions:
      id-token: write
      contents: read

    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build
          path: dist/

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: us-east-1

      - name: Deploy to production
        run: aws s3 sync dist/ s3://production-bucket

      - name: Verify deployment
        run: curl -f https://example.com/health
```

## Monitoring and Observability

### Deployment Tracking

```yaml
- name: Notify deployment start
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "🚀 Deploying ${{ github.sha }} to ${{ inputs.environment }}"
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}

- name: Deploy
  run: ./deploy.sh

- name: Notify deployment complete
  if: success()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "✅ Deployment successful"
      }
```

### Health Checks

```yaml
- name: Verify deployment
  run: |
    for i in {1..10}; do
      if curl -f https://example.com/health; then
        echo "Health check passed"
        exit 0
      fi
      echo "Attempt $i failed, retrying..."
      sleep 30
    done
    echo "Health check failed after 10 attempts"
    exit 1
```

## Summary

| Practice | Benefit |
|----------|---------|
| **Fast feedback** | Quick lint/test before heavy builds |
| **Caching** | Reduce build times significantly |
| **Path filtering** | Skip unnecessary runs |
| **Environments** | Protection and approval gates |
| **OIDC** | Secure, credential-less authentication |
| **Blue-Green** | Zero-downtime deployments |
| **Canary** | Gradual, safe rollouts |
| **Monitoring** | Visibility into deployment status |

These practices help build reliable, secure, and efficient CI/CD pipelines with GitHub Actions.

## References

- Manning - GitHub Actions in Action, Chapters 8-9
- Packt - DevOps Unleashed with Git and GitHub, Chapter 5
- GitHub Docs - Deploying with GitHub Actions
