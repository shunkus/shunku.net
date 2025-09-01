---
title: はじめに - AWS CDKの世界へようこそ
order: 1
---

# はじめに - AWS CDKの世界へようこそ

## 本書について

この本は、5日間でAWS Cloud Development Kit（AWS CDK）を学び、実践的なインフラストラクチャ管理スキルを身につけることを目的としています。

### 対象読者

- AWSの基本的な知識がある方
- プログラミング経験（特にTypeScript/JavaScript）がある方
- Infrastructure as Code（IaC）に興味がある方
- 手動でのインフラ管理から脱却したい方

### 学習目標

本書を読み終えることで、以下ができるようになります：

1. AWS CDKの基本概念を理解し、環境をセットアップできる
2. CDKを使って基本的なAWSリソースを作成・管理できる
3. 再利用可能なコンポーネント（Construct）を作成できる
4. テストやCI/CDパイプラインと統合できる
5. 本番環境に安全にデプロイできる

## AWS CDKとは？

AWS Cloud Development Kit（AWS CDK）は、クラウドアプリケーションリソースをプログラミング言語で定義するためのオープンソースフレームワークです。

### 従来の方法との違い

#### 従来のCloudFormation
```yaml
Resources:
  MyBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: my-app-bucket-12345
      VersioningConfiguration:
        Status: Enabled
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true
```

#### AWS CDK（TypeScript）
```typescript
import * as s3 from 'aws-cdk-lib/aws-s3';

const bucket = new s3.Bucket(this, 'MyBucket', {
  bucketName: 'my-app-bucket-12345',
  versioned: true,
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL
});
```

### AWS CDKの特徴

1. **プログラミング言語の力を活用**
   - 条件分岐、ループ、関数などが使用可能
   - IDEの補完機能やリファクタリング機能を活用
   - 既存のプログラミングスキルを活用

2. **再利用性とモジュール化**
   - カスタムConstructを作成して再利用
   - npmパッケージとして共有可能
   - 組織内でのベストプラクティスを標準化

3. **型安全性**
   - コンパイル時にエラーを検出
   - プロパティの補完と検証
   - ドキュメント化された API

4. **CloudFormationとの互換性**
   - 最終的にCloudFormationテンプレートを生成
   - 既存のCloudFormationリソースとも統合可能
   - CloudFormationのすべての機能を利用可能

## 学習の進め方

### 5日間の学習スケジュール

| 日 | テーマ | 内容 |
|---|------|-----|
| 1日目 | 基礎とセットアップ | CDKの基本概念、環境構築、初回デプロイ |
| 2日目 | コアConstructとStack | 基本的なAWSリソースの作成、Stackの管理 |
| 3日目 | 高度なConstructとパターン | カスタムConstruct、デザインパターン |
| 4日目 | テストとCI/CD | ユニットテスト、統合テスト、CI/CDパイプライン |
| 5日目 | ベストプラクティスと本番デプロイ | セキュリティ、監視、本番運用 |

### 前提知識の確認

開始前に、以下の知識があることを確認してください：

#### AWS基礎知識
- EC2、S3、Lambda、RDSなどの基本サービス
- IAMの基本概念（ロール、ポリシー）
- VPCとネットワーキングの基礎

#### プログラミング知識
- TypeScript/JavaScriptの基本文法
- npm/yarnの使用経験
- 基本的なGitの操作

#### 開発環境
- Node.js 18.x以上
- 任意のIDEまたはエディタ（VS Code推奨）
- AWS CLI
- Git

## 本書の構成

各章は以下の構成になっています：

1. **概要** - その日に学ぶ内容の概要
2. **理論** - 基本概念と理論的背景
3. **実践** - 実際にコードを書いて学習
4. **演習** - 理解を深めるための課題
5. **まとめ** - その日の学習内容の振り返り

## サンプルプロジェクトについて

本書では、以下のような段階的にWebアプリケーションを構築していきます：

1. **Day 1**: 静的ウェブサイト（S3 + CloudFront）
2. **Day 2**: サーバーレスAPI（Lambda + API Gateway）
3. **Day 3**: データベース統合（DynamoDB）
4. **Day 4**: CI/CDパイプライン
5. **Day 5**: 監視とアラート

### 完成予想図

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CloudFront    │────│   API Gateway    │────│     Lambda      │
│  (Static Web)   │    │   (REST API)     │    │  (Business      │
└─────────────────┘    └──────────────────┘    │   Logic)        │
                                               └─────────────────┘
                                                        │
                                               ┌─────────────────┐
                                               │    DynamoDB     │
                                               │   (Database)    │
                                               └─────────────────┘
```

## 次のステップ

準備ができたら、1日目の「AWS CDK環境構築とはじめの一歩」に進みましょう。

実際にコードを書きながら学習することで、AWS CDKの強力さと便利さを実感できるはずです。

---

**注意**: 本書のサンプルコードを実行する際は、AWSの利用料金が発生する可能性があります。AWS無料枠の範囲内で実践することをお勧めします。また、不要になったリソースは必ず削除してください。