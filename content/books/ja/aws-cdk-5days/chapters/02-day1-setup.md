---
title: 1日目 - AWS CDK環境構築とはじめの一歩
order: 2
---

# 1日目 - AWS CDK環境構築とはじめの一歩

## 今日の目標

1. AWS CDKの開発環境をセットアップする
2. 初回のCDKプロジェクトを作成する
3. 簡単なS3バケットをデプロイする
4. CDKの基本的なコマンドを理解する

## 1. 環境構築

### 1.1 Node.jsのインストール確認

AWS CDKはNode.js上で動作します。まず現在のバージョンを確認しましょう。

```bash
node --version
npm --version
```

Node.js 18.x以上が必要です。インストールされていない場合は、[Node.js公式サイト](https://nodejs.org/)からダウンロードしてください。

### 1.2 AWS CLIのセットアップ

AWS CDKはAWS CLIを使用してAWSアカウントと通信します。

```bash
# AWS CLIのバージョン確認
aws --version

# AWS認証情報の設定
aws configure
```

以下の情報を入力してください：
- AWS Access Key ID
- AWS Secret Access Key  
- Default region name（例：ap-northeast-1）
- Default output format（json推奨）

### 1.3 AWS CDKのインストール

グローバルにAWS CDKをインストールします。

```bash
npm install -g aws-cdk
```

インストールが完了したら、バージョンを確認します。

```bash
cdk --version
```

### 1.4 CDK Bootstrap

CDKを使用する前に、AWSアカウントとリージョンでブートストラップを実行する必要があります。

```bash
cdk bootstrap
```

これにより、CDKが使用するS3バケットやIAMロールなどのリソースが作成されます。

## 2. 初回プロジェクトの作成

### 2.1 プロジェクトディレクトリの作成

```bash
mkdir my-first-cdk-app
cd my-first-cdk-app
```

### 2.2 CDKアプリケーションの初期化

TypeScriptテンプレートを使用してCDKアプリケーションを初期化します。

```bash
cdk init app --language typescript
```

このコマンドにより、以下のファイル構造が生成されます：

```
my-first-cdk-app/
├── bin/
│   └── my-first-cdk-app.ts      # アプリケーションのエントリーポイント
├── lib/
│   └── my-first-cdk-app-stack.ts # メインのStackクラス
├── test/
│   └── my-first-cdk-app.test.ts  # テストファイル
├── cdk.json                      # CDK設定ファイル
├── package.json                  # Node.jsパッケージ設定
├── tsconfig.json                 # TypeScript設定
└── README.md
```

### 2.3 依存関係のインストール

```bash
npm install
```

## 3. 最初のリソース作成

### 3.1 S3バケットの追加

`lib/my-first-cdk-app-stack.ts`を編集して、S3バケットを追加します。

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class MyFirstCdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3バケットを作成
    const bucket = new s3.Bucket(this, 'MyFirstBucket', {
      bucketName: `my-first-cdk-bucket-${Date.now()}`,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // バケット名を出力
    new cdk.CfnOutput(this, 'BucketName', {
      value: bucket.bucketName,
      description: 'Name of the S3 bucket',
    });
  }
}
```

### 3.2 コードの説明

- `import * as s3 from 'aws-cdk-lib/aws-s3'`: S3関連のConstructsをインポート
- `new s3.Bucket()`: 新しいS3バケットを作成
- `bucketName`: バケット名を指定（ユニークにするためタイムスタンプを追加）
- `versioned: true`: オブジェクトのバージョニングを有効化
- `removalPolicy`: Stackを削除する際の動作を指定
- `autoDeleteObjects: true`: Stack削除時にオブジェクトも自動削除
- `CfnOutput`: デプロイ後に出力される値を定義

## 4. デプロイの実行

### 4.1 差分の確認

実際にデプロイする前に、どのようなリソースが作成されるかを確認します。

```bash
cdk diff
```

出力例：
```
Stack MyFirstCdkAppStack
Resources
[+] AWS::S3::Bucket MyFirstBucket MyFirstBucket12345678

Outputs
[+] Output MyFirstCdkAppStack/BucketName BucketName: {"Value":{"Ref":"MyFirstBucket12345678"}}
```

### 4.2 デプロイの実行

```bash
cdk deploy
```

確認メッセージが表示されたら `y` を入力してEnterを押します。

デプロイが完了すると、以下のような出力が表示されます：

```
 ✅  MyFirstCdkAppStack

✨  Deployment time: 45.67s

Outputs:
MyFirstCdkAppStack.BucketName = my-first-cdk-bucket-1234567890

Stack ARN:
arn:aws:cloudformation:ap-northeast-1:123456789012:stack/MyFirstCdkAppStack/...
```

### 4.3 作成されたリソースの確認

AWS Management Consoleで以下を確認してみましょう：

1. **CloudFormation**: 作成されたStackを確認
2. **S3**: 新しく作成されたバケットを確認

## 5. CDKの基本コマンド

### 5.1 よく使用するコマンド

```bash
# プロジェクトの初期化
cdk init app --language typescript

# CloudFormationテンプレートの生成
cdk synth

# 差分の確認
cdk diff

# デプロイ
cdk deploy

# リソースの削除
cdk destroy

# 利用可能なStackの一覧表示
cdk list

# CDKのバージョン確認
cdk --version

# ヘルプの表示
cdk --help
```

### 5.2 CloudFormationテンプレートの確認

CDKが生成するCloudFormationテンプレートを確認してみましょう。

```bash
cdk synth
```

`cdk.out`ディレクトリに生成されたテンプレートファイルを確認できます。

## 6. プロジェクトの構造理解

### 6.1 重要なファイルの役割

#### `cdk.json`
CDKアプリケーションの設定ファイル。アプリケーションの実行方法や各種設定を定義します。

```json
{
  "app": "npx ts-node --prefer-ts-exts bin/my-first-cdk-app.ts",
  "watch": {
    "include": [
      "**"
    ],
    "exclude": [
      "README.md",
      "cdk*.json",
      "**/*.d.ts",
      "**/*.js",
      "tsconfig.json",
      "package*.json",
      "yarn.lock",
      "node_modules",
      "test"
    ]
  },
  "context": {
    "@aws-cdk/aws-apigateway:usagePlanKeyOrderInsensitiveId": true,
    "@aws-cdk/core:stackRelativeExports": true
  }
}
```

#### `bin/my-first-cdk-app.ts`
アプリケーションのエントリーポイント。Stackをインスタンス化します。

```typescript
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MyFirstCdkAppStack } from '../lib/my-first-cdk-app-stack';

const app = new cdk.App();
new MyFirstCdkAppStack(app, 'MyFirstCdkAppStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
```

#### `lib/my-first-cdk-app-stack.ts`
メインのStack定義。実際のAWSリソースを定義します。

## 7. トラブルシューティング

### 7.1 よくある問題と解決方法

#### 問題: `cdk bootstrap`でエラーが発生する
```bash
Error: Need to perform AWS calls for account 123456789012, but no credentials found.
```

**解決方法**: AWS認証情報が正しく設定されていません。
```bash
aws configure
# または
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
export AWS_DEFAULT_REGION=ap-northeast-1
```

#### 問題: バケット名が重複している
```bash
Error: my-first-cdk-bucket already exists
```

**解決方法**: バケット名にユニークな値を追加します。
```typescript
bucketName: `my-first-cdk-bucket-${Math.random().toString(36).substr(2, 9)}`,
```

#### 問題: デプロイ中にタイムアウトが発生する
**解決方法**: 
- ネットワーク接続を確認
- AWS認証情報の有効性を確認
- 別のリージョンを試してみる

## 8. 演習問題

### 演習 1: 基本的なS3設定
現在のS3バケットに以下の設定を追加してください：

1. パブリックアクセスを完全にブロック
2. サーバーサイド暗号化を有効化
3. ライフサイクルポリシーを設定（30日後に削除）

<details>
<summary>解答例</summary>

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class MyFirstCdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'MyFirstBucket', {
      bucketName: `my-first-cdk-bucket-${Date.now()}`,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      
      // 1. パブリックアクセスを完全にブロック
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      
      // 2. サーバーサイド暗号化を有効化
      encryption: s3.BucketEncryption.S3_MANAGED,
      
      // 3. ライフサイクルポリシーを設定（30日後に削除）
      lifecycleRules: [{
        id: 'DeleteOldObjects',
        enabled: true,
        expiration: cdk.Duration.days(30),
      }],
    });

    // バケット名を出力
    new cdk.CfnOutput(this, 'BucketName', {
      value: bucket.bucketName,
      description: 'Name of the S3 bucket with security settings',
    });
  }
}
```
</details>

### 演習 2: 複数のバケット作成
異なる目的の3つのS3バケットを作成してください：

1. ログ保存用バケット
2. 静的ウェブサイト用バケット  
3. バックアップ用バケット

それぞれに適切な設定を追加してください。

<details>
<summary>解答例</summary>

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class MultipleBucketsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. ログ保存用バケット
    const logBucket = new s3.Bucket(this, 'LogBucket', {
      bucketName: `my-log-bucket-${Date.now()}`,
      versioned: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      lifecycleRules: [{
        id: 'DeleteOldLogs',
        enabled: true,
        expiration: cdk.Duration.days(90), // ログは90日間保持
        transitions: [{
          storageClass: s3.StorageClass.INFREQUENT_ACCESS,
          transitionAfter: cdk.Duration.days(30), // 30日後にIA移行
        }],
      }],
    });

    // 2. 静的ウェブサイト用バケット
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `my-website-bucket-${Date.now()}`,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // CloudFront経由でのみアクセス
      encryption: s3.BucketEncryption.S3_MANAGED,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'error.html',
    });

    // 3. バックアップ用バケット
    const backupBucket = new s3.Bucket(this, 'BackupBucket', {
      bucketName: `my-backup-bucket-${Date.now()}`,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN, // バックアップは削除しない
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.KMS_MANAGED, // より強力な暗号化
      lifecycleRules: [{
        id: 'TransitionToGlacier',
        enabled: true,
        transitions: [
          {
            storageClass: s3.StorageClass.INFREQUENT_ACCESS,
            transitionAfter: cdk.Duration.days(30),
          },
          {
            storageClass: s3.StorageClass.GLACIER,
            transitionAfter: cdk.Duration.days(90),
          },
          {
            storageClass: s3.StorageClass.DEEP_ARCHIVE,
            transitionAfter: cdk.Duration.days(365),
          },
        ],
      }],
    });

    // 出力
    new cdk.CfnOutput(this, 'LogBucketName', {
      value: logBucket.bucketName,
      description: 'Name of the log bucket',
    });

    new cdk.CfnOutput(this, 'WebsiteBucketName', {
      value: websiteBucket.bucketName,
      description: 'Name of the website bucket',
    });

    new cdk.CfnOutput(this, 'BackupBucketName', {
      value: backupBucket.bucketName,
      description: 'Name of the backup bucket',
    });
  }
}
```

**各バケットの設定理由：**

- **ログバケット**: 
  - 90日後に自動削除（コスト最適化）
  - 30日後にInfrequent Accessへ移行
  - バージョニング不要（ログは追記のみ）

- **ウェブサイトバケット**:
  - バージョニング有効（変更履歴を保持）
  - 静的ウェブサイトホスティング設定
  - CloudFront経由でのアクセスを想定

- **バックアップバケット**:
  - RETAIN設定（誤削除防止）
  - KMS暗号化（より強力なセキュリティ）
  - 段階的にGlacier、Deep Archiveへ移行（コスト最適化）
</details>

## 9. 今日のまとめ

### 学習したこと
- AWS CDKの環境構築方法
- CDKプロジェクトの基本構造
- S3バケットの作成とデプロイ
- CDKの基本コマンドの使用方法
- CloudFormationとの関係

### 重要なポイント
1. **Infrastructure as Code**: インフラをコードで管理する利点
2. **型安全性**: TypeScriptによる型チェックの恩恵
3. **再現性**: 同じ構成を何度でも作成可能
4. **バージョン管理**: インフラの変更履歴を管理

### 次回の準備
明日は、より多くのAWSサービスを組み合わせて、実用的なアプリケーションを構築していきます。

今日作成したプロジェクトは削除せずに、明日も継続して使用します。

---

**リソースのクリーンアップ**
学習が完了したら、不要な課金を避けるためにリソースを削除してください：

```bash
cdk destroy
```