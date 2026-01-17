---
title: "AWS IAM詳解: ポリシー、ロール、フェデレーション"
date: "2025-11-13"
excerpt: "AWS Identity and Access Managementをマスター - ポリシー構文、条件キー、STS、アイデンティティフェデレーション、セキュリティベストプラクティス。"
tags: ["AWS", "Security", "IAM", "Certification"]
author: "Shunku"
---

AWS Identity and Access Management（IAM）は、AWSリソースへのアクセスを制御する基盤です。IAMを深く理解することは、AWSセキュリティスペシャリティ認定に不可欠です。

## IAMのコアコンセプト

```mermaid
flowchart TD
    subgraph Principals["プリンシパル（誰が）"]
        A[ユーザー]
        B[ロール]
        C[フェデレーションユーザー]
        D[アプリケーション]
    end

    subgraph Policies["ポリシー（何を）"]
        E[アイデンティティベース]
        F[リソースベース]
        G[アクセス許可境界]
        H[SCP]
    end

    subgraph Resources["リソース（どこで）"]
        I[S3バケット]
        J[EC2インスタンス]
        K[Lambda関数]
        L[DynamoDBテーブル]
    end

    Principals --> Policies
    Policies --> Resources

    style Principals fill:#3b82f6,color:#fff
    style Policies fill:#f59e0b,color:#fff
    style Resources fill:#10b981,color:#fff
```

## ポリシー構造

### 基本的なポリシー構文

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowS3Read",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::my-bucket",
        "arn:aws:s3:::my-bucket/*"
      ],
      "Condition": {
        "StringEquals": {
          "aws:PrincipalTag/Department": "Engineering"
        }
      }
    }
  ]
}
```

### ポリシー要素

| 要素 | 説明 | 必須 |
|-----|-----|-----|
| Version | ポリシー言語バージョン（"2012-10-17"を使用） | はい |
| Statement | 許可ステートメントの配列 | はい |
| Sid | ステートメント識別子（オプションだが推奨） | いいえ |
| Effect | AllowまたはDeny | はい |
| Action | 許可/拒否するAPIアクション | はい |
| Resource | リソースのARN | はい* |
| Condition | ポリシーが適用される条件 | いいえ |

## ポリシータイプ

```mermaid
flowchart LR
    subgraph Identity["アイデンティティベースポリシー"]
        A[マネージドポリシー]
        B[インラインポリシー]
    end

    subgraph Resource["リソースベースポリシー"]
        C[バケットポリシー]
        D[キーポリシー]
        E[信頼ポリシー]
    end

    subgraph Boundaries["境界"]
        F[アクセス許可境界]
        G[SCP]
    end

    style Identity fill:#3b82f6,color:#fff
    style Resource fill:#f59e0b,color:#fff
    style Boundaries fill:#10b981,color:#fff
```

### アイデンティティベースポリシー

ユーザー、グループ、ロールにアタッチ：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:Describe*",
        "ec2:StartInstances",
        "ec2:StopInstances"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "ec2:ResourceTag/Environment": "Development"
        }
      }
    }
  ]
}
```

### リソースベースポリシー

リソースに直接アタッチ：

```json
// S3バケットポリシー
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CrossAccountAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::123456789012:root"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-bucket/*"
    }
  ]
}
```

### アクセス許可境界

IAMエンティティの最大権限を制限：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:*",
        "cloudwatch:*",
        "ec2:Describe*"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Deny",
      "Action": [
        "iam:*",
        "organizations:*"
      ],
      "Resource": "*"
    }
  ]
}
```

```python
import boto3

iam = boto3.client('iam')

# ユーザーにアクセス許可境界を適用
iam.put_user_permissions_boundary(
    UserName='developer',
    PermissionsBoundary='arn:aws:iam::123456789012:policy/DeveloperBoundary'
)
```

## 条件キー

### グローバル条件キー

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:*",
      "Resource": "*",
      "Condition": {
        "IpAddress": {
          "aws:SourceIp": ["192.168.1.0/24", "10.0.0.0/8"]
        },
        "Bool": {
          "aws:MultiFactorAuthPresent": "true"
        },
        "DateGreaterThan": {
          "aws:CurrentTime": "2025-01-01T00:00:00Z"
        }
      }
    }
  ]
}
```

### 一般的な条件演算子

| 演算子 | 説明 | 例 |
|-------|-----|---|
| StringEquals | 完全一致 | `"aws:PrincipalTag/Role": "Admin"` |
| StringLike | ワイルドカードパターン | `"s3:prefix": ["home/${aws:username}/*"]` |
| ArnEquals | ARN完全一致 | `"aws:SourceArn": "arn:aws:sns:..."` |
| IpAddress | IP範囲一致 | `"aws:SourceIp": "10.0.0.0/8"` |
| Bool | ブール一致 | `"aws:SecureTransport": "true"` |
| DateGreaterThan | 日付比較 | `"aws:CurrentTime": "2025-01-01"` |

### サービス固有の条件キー

```json
// S3固有の条件
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::my-bucket/*",
      "Condition": {
        "StringEquals": {
          "s3:x-amz-server-side-encryption": "aws:kms",
          "s3:x-amz-acl": "bucket-owner-full-control"
        },
        "StringLike": {
          "s3:prefix": ["uploads/${aws:username}/*"]
        }
      }
    }
  ]
}
```

## IAMロール

### ロール信頼ポリシー

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

### クロスアカウントロール

```json
// クロスアカウントアクセス用信頼ポリシー
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::111122223333:root"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "unique-external-id"
        }
      }
    }
  ]
}
```

```python
import boto3

# 別アカウントからロールを引き受け
sts = boto3.client('sts')

response = sts.assume_role(
    RoleArn='arn:aws:iam::999988887777:role/CrossAccountRole',
    RoleSessionName='cross-account-session',
    ExternalId='unique-external-id'
)

credentials = response['Credentials']

# 引き受けたロールの認証情報を使用
s3 = boto3.client(
    's3',
    aws_access_key_id=credentials['AccessKeyId'],
    aws_secret_access_key=credentials['SecretAccessKey'],
    aws_session_token=credentials['SessionToken']
)
```

## Security Token Service（STS）

```mermaid
flowchart LR
    A[プリンシパル] --> B[STS]
    B --> C[一時的な認証情報]
    C --> D[AWSリソースにアクセス]

    style B fill:#f59e0b,color:#fff
```

### STS API操作

| 操作 | ユースケース |
|-----|------------|
| AssumeRole | IAMロールを引き受け（同一/クロスアカウント） |
| AssumeRoleWithSAML | SAML経由のフェデレーションアクセス |
| AssumeRoleWithWebIdentity | OIDC経由のフェデレーションアクセス |
| GetSessionToken | MFA保護されたAPIアクセス |
| GetFederationToken | フェデレーションユーザーアクセス |

### セッションポリシー

```python
import boto3
import json

sts = boto3.client('sts')

# セッションポリシーでさらに権限を制限してロールを引き受け
session_policy = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::my-bucket/readonly/*"
        }
    ]
}

response = sts.assume_role(
    RoleArn='arn:aws:iam::123456789012:role/DataAccessRole',
    RoleSessionName='restricted-session',
    Policy=json.dumps(session_policy)  # さらに権限を制限
)
```

## アイデンティティフェデレーション

### SAML 2.0フェデレーション

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant IdP as IDプロバイダー
    participant STS as AWS STS
    participant AWS as AWSサービス

    User->>IdP: 1. 認証
    IdP->>User: 2. SAMLアサーション
    User->>STS: 3. AssumeRoleWithSAML
    STS->>User: 4. 一時的な認証情報
    User->>AWS: 5. リソースにアクセス
```

### IAM Identity Center（AWS SSO）

```python
# IAM Identity Centerアクセス許可セットの設定
import boto3

sso_admin = boto3.client('sso-admin')

# アクセス許可セットを作成
response = sso_admin.create_permission_set(
    InstanceArn='arn:aws:sso:::instance/ssoins-xxx',
    Name='DeveloperAccess',
    Description='開発者用アクセス許可セット',
    SessionDuration='PT8H'
)

permission_set_arn = response['PermissionSet']['PermissionSetArn']

# マネージドポリシーをアタッチ
sso_admin.attach_managed_policy_to_permission_set(
    InstanceArn='arn:aws:sso:::instance/ssoins-xxx',
    PermissionSetArn=permission_set_arn,
    ManagedPolicyArn='arn:aws:iam::aws:policy/PowerUserAccess'
)
```

### Webアイデンティティフェデレーション（Cognito）

```python
import boto3

cognito = boto3.client('cognito-identity')

# CognitoからアイデンティティIDを取得
response = cognito.get_id(
    IdentityPoolId='us-east-1:xxx',
    Logins={
        'accounts.google.com': google_token
    }
)

identity_id = response['IdentityId']

# 認証情報を取得
credentials = cognito.get_credentials_for_identity(
    IdentityId=identity_id,
    Logins={
        'accounts.google.com': google_token
    }
)
```

## ポリシー評価ロジック

```mermaid
flowchart TD
    A[リクエスト] --> B{明示的なDeny?}
    B -->|はい| C[DENY]
    B -->|いいえ| D{SCPがAllow?}
    D -->|いいえ| C
    D -->|はい| E{リソースポリシーがAllow?}
    E -->|はい| F[ALLOW]
    E -->|いいえ| G{アイデンティティポリシーがAllow?}
    G -->|いいえ| C
    G -->|はい| H{アクセス許可境界?}
    H -->|Deny| C
    H -->|Allow| I{セッションポリシー?}
    I -->|Deny| C
    I -->|Allow| F

    style C fill:#ef4444,color:#fff
    style F fill:#10b981,color:#fff
```

### 有効な権限

```
有効な権限 =
  アイデンティティポリシー
  ∩ アクセス許可境界
  ∩ SCP
  ∩ セッションポリシー
  ∪ リソースポリシー（クロスアカウントの場合）
```

## ベストプラクティス

### 1. 最小権限の原則

```json
// ❌ 悪い例: 過度に許可的
{
  "Effect": "Allow",
  "Action": "s3:*",
  "Resource": "*"
}

// ✅ 良い例: 具体的な権限
{
  "Effect": "Allow",
  "Action": [
    "s3:GetObject",
    "s3:ListBucket"
  ],
  "Resource": [
    "arn:aws:s3:::my-app-bucket",
    "arn:aws:s3:::my-app-bucket/*"
  ]
}
```

### 2. 長期認証情報の代わりにロールを使用

```python
# ❌ 悪い例: ハードコードされた認証情報
client = boto3.client(
    's3',
    aws_access_key_id='AKIAIOSFODNN7EXAMPLE',
    aws_secret_access_key='wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
)

# ✅ 良い例: IAMロールを使用（EC2/Lambdaでは自動）
client = boto3.client('s3')  # インスタンスプロファイルまたは実行ロールを使用
```

### 3. 機密操作にはMFAを有効化

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:TerminateInstances",
        "rds:DeleteDBInstance"
      ],
      "Resource": "*",
      "Condition": {
        "Bool": {
          "aws:MultiFactorAuthPresent": "true"
        },
        "NumericLessThan": {
          "aws:MultiFactorAuthAge": "3600"
        }
      }
    }
  ]
}
```

### 4. IAM Access Analyzerを使用

```python
import boto3

analyzer = boto3.client('accessanalyzer')

# アナライザーを作成
analyzer.create_analyzer(
    analyzerName='account-analyzer',
    type='ACCOUNT'
)

# 検出結果をリスト
findings = analyzer.list_findings(
    analyzerArn='arn:aws:access-analyzer:region:account:analyzer/account-analyzer'
)

for finding in findings['findings']:
    print(f"リソース: {finding['resource']}")
    print(f"検出内容: {finding['condition']}")
```

### 5. 認証情報を定期的にローテーション

```python
import boto3

iam = boto3.client('iam')

# アクセスキーをリスト
keys = iam.list_access_keys(UserName='my-user')

for key in keys['AccessKeyMetadata']:
    # キーの年齢をチェック
    key_age = (datetime.now(timezone.utc) - key['CreateDate']).days

    if key_age > 90:
        print(f"キー {key['AccessKeyId']} は {key_age} 日経過 - ローテーションが必要!")
```

## IAMのトラブルシューティング

### ポリシーシミュレータ

```python
import boto3

iam = boto3.client('iam')

response = iam.simulate_principal_policy(
    PolicySourceArn='arn:aws:iam::123456789012:user/testuser',
    ActionNames=['s3:GetObject', 's3:PutObject'],
    ResourceArns=['arn:aws:s3:::my-bucket/*']
)

for result in response['EvaluationResults']:
    print(f"アクション: {result['EvalActionName']}")
    print(f"判定: {result['EvalDecision']}")
```

### Access Advisor

```python
# サービス最終アクセスをチェック
response = iam.generate_service_last_accessed_details(
    Arn='arn:aws:iam::123456789012:user/myuser'
)

job_id = response['JobId']

# 結果を取得
details = iam.get_service_last_accessed_details(JobId=job_id)

for service in details['ServicesLastAccessed']:
    print(f"{service['ServiceName']}: {service.get('LastAuthenticated', '未使用')}")
```

## まとめ

| 概念 | 説明 |
|-----|-----|
| ポリシータイプ | アイデンティティベース、リソースベース、アクセス許可境界、SCP |
| 条件キー | グローバル（aws:）、サービス固有（s3:、ec2:） |
| STS | AssumeRoleによる一時的な認証情報 |
| フェデレーション | SAML、OIDC、Cognitoで外部アイデンティティ |
| 評価順序 | 明示的Deny > SCP > リソース > アイデンティティ > 境界 |

重要なポイント：

- すべてのポリシーで最小権限の原則に従う
- 長期アクセスキーの代わりにロールを使用
- 機密操作にはMFAを実装
- 条件キーでコンテキストベースの制限を追加
- IAM Access Analyzerで過度に許可的なポリシーを発見
- トラブルシューティングのためにポリシー評価順序を理解
- アクセス許可境界でIAM管理を安全に委任

IAMの習得は、AWSセキュリティスペシャリティ認定の合格と安全なAWSアーキテクチャの構築に不可欠です。

## 参考文献

- [IAM User Guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/)
- [IAM Policy Reference](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies.html)
- Muñoz, Mauricio, et al. *AWS Certified Security Study Guide, 2nd Edition*. Wiley, 2025.
- Book, Adam, and Stuart Scott. *AWS Certified Security – Specialty (SCS-C02) Exam Guide*. Packt, 2024.
