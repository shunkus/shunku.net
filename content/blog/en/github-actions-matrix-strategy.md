---
title: "GitHub Actions Matrix Strategy: Parallel Builds Made Easy"
date: "2025-01-18"
excerpt: "Learn how to use matrix strategy in GitHub Actions to run parallel builds across multiple OS versions, language versions, and configurations efficiently."
tags: ["GitHub Actions", "Git", "DevOps"]
author: "Shunku"
---

## Introduction

When building software that needs to work across multiple environments—different Node.js versions, operating systems, or configurations—testing each combination manually would be tedious. GitHub Actions' matrix strategy solves this by automatically generating multiple job instances from a single job definition.

This article explains how to leverage matrix builds for efficient parallel testing.

## What Is Matrix Strategy?

A matrix creates multiple job runs by combining variables you define:

```mermaid
flowchart TB
    subgraph Matrix["Matrix Definition"]
        M["node: [18, 20, 22]<br/>os: [ubuntu, windows]"]
    end

    subgraph Jobs["Generated Jobs (6 total)"]
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

## Basic Matrix Syntax

### Single Dimension Matrix

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

This creates 3 parallel jobs, one for each Node.js version.

### Multi-Dimensional Matrix

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

This creates 9 jobs (3 OS × 3 Node versions).

## Matrix Configuration Options

### Include: Adding Extra Combinations

Use `include` to add specific configurations that don't fit the matrix pattern:

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest]
    node-version: [18, 20]
    include:
      # Add experimental Node 22 only on Ubuntu
      - os: ubuntu-latest
        node-version: 22
        experimental: true

      # Add extra environment variable for specific combo
      - os: windows-latest
        node-version: 20
        npm-cache: 'C:\npm-cache'
```

### Exclude: Removing Combinations

Use `exclude` to skip specific combinations:

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node-version: [16, 18, 20]
    exclude:
      # Skip Node 16 on macOS (not supported)
      - os: macos-latest
        node-version: 16

      # Skip Node 16 on Windows
      - os: windows-latest
        node-version: 16
```

### Combining Include and Exclude

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

## Failure Handling

### fail-fast (Default: true)

By default, if any matrix job fails, all other jobs are cancelled:

```yaml
strategy:
  fail-fast: true  # Default behavior
  matrix:
    node-version: [18, 20, 22]
```

### Continue on Failure

Set `fail-fast: false` to let all jobs complete regardless of failures:

```yaml
strategy:
  fail-fast: false
  matrix:
    node-version: [18, 20, 22]
```

This is useful when you want to see all failing configurations.

### continue-on-error for Experimental Builds

Mark specific jobs as allowed to fail:

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

## Controlling Parallelism

### max-parallel

Limit concurrent jobs to avoid overwhelming resources:

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

## Practical Examples

### Cross-Platform Library Testing

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

### Database Version Testing

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

### Build Configuration Matrix

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

### Dynamic Matrix with JSON

Generate matrix values dynamically:

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
          # Generate matrix from package.json or other source
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

## Using Matrix Values

### In Step Names

```yaml
steps:
  - name: Test on Node ${{ matrix.node-version }} / ${{ matrix.os }}
    run: npm test
```

### In Conditionals

```yaml
steps:
  - name: Windows-specific setup
    if: matrix.os == 'windows-latest'
    run: choco install some-package

  - name: Deploy (only on latest Node)
    if: matrix.node-version == 22
    run: npm run deploy
```

### In Artifact Names

```yaml
- name: Upload artifacts
  uses: actions/upload-artifact@v4
  with:
    name: build-${{ matrix.os }}-node${{ matrix.node-version }}
    path: dist/
```

## Best Practices

### 1. Start Small, Expand Gradually

```yaml
# Start with essential combinations
matrix:
  node-version: [18, 20]  # LTS versions only
  os: [ubuntu-latest]      # Primary platform first

# Later expand to full matrix
matrix:
  node-version: [18, 20, 22]
  os: [ubuntu-latest, windows-latest, macos-latest]
```

### 2. Use fail-fast Strategically

| Scenario | fail-fast Setting |
|----------|-------------------|
| Quick feedback during development | `true` (default) |
| Full compatibility report | `false` |
| Release builds | `false` |

### 3. Optimize for Cost and Speed

```yaml
strategy:
  # Limit parallel jobs on self-hosted runners
  max-parallel: 4

  matrix:
    os: [ubuntu-latest]  # Linux is fastest and cheapest
    node-version: [20]   # Test primary version in PR

# Full matrix only on main branch
on:
  push:
    branches: [main]
```

### 4. Cache Per Matrix Configuration

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ matrix.node-version }}-${{ hashFiles('**/package-lock.json') }}
```

## Summary

| Feature | Purpose |
|---------|---------|
| **Basic matrix** | Test across multiple versions/configurations |
| **include** | Add specific combinations with extra properties |
| **exclude** | Remove unwanted combinations |
| **fail-fast** | Control whether to cancel on first failure |
| **max-parallel** | Limit concurrent job execution |
| **continue-on-error** | Allow experimental builds to fail |

Matrix strategy is essential for ensuring your code works across all target environments without maintaining separate workflow files for each combination.

## References

- O'Reilly - Learning GitHub Actions, Chapter 13
- Packt - GitHub Actions Cookbook, Chapter 6
- GitHub Docs - Using a matrix for your jobs
