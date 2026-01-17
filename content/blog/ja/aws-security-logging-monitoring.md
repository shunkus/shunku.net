---
title: "AWSセキュリティログとモニタリング: CloudTrail、CloudWatch、Config"
date: "2025-11-07"
excerpt: "AWSセキュリティモニタリングをマスター - API監査のCloudTrail、メトリクスとログのCloudWatch、コンプライアンスのAWS Config、ネットワーク可視化のVPC Flow Logs。"
tags: ["AWS", "Security", "Logging", "Monitoring", "Certification"]
author: "Shunku"
---

セキュリティログとモニタリングは、AWSセキュリティスペシャリティ認定の重要なドメインです。セキュリティイベントの収集、分析、対応方法を理解することは、AWS環境を保護するために不可欠です。

## ログとモニタリングの概要

```mermaid
flowchart TB
    subgraph Collection["データ収集"]
        A[CloudTrail]
        B[VPC Flow Logs]
        C[CloudWatch Logs]
        D[S3アクセスログ]
    end

    subgraph Analysis["分析"]
        E[CloudWatchメトリクス]
        F[CloudWatch Insights]
        G[Athena]
        H[OpenSearch]
    end

    subgraph Response["対応"]
        I[CloudWatchアラーム]
        J[EventBridge]
        K[Lambda]
        L[SNS]
    end

    Collection --> Analysis --> Response

    style Collection fill:#3b82f6,color:#fff
    style Analysis fill:#f59e0b,color:#fff
    style Response fill:#10b981,color:#fff
```

## AWS CloudTrail

### 証跡の設定

```python
import boto3

cloudtrail = boto3.client('cloudtrail')

# すべての機能を持つマルチリージョン証跡を作成
response = cloudtrail.create_trail(
    Name='security-audit-trail',
    S3BucketName='my-cloudtrail-logs',
    S3KeyPrefix='cloudtrail/',
    IncludeGlobalServiceEvents=True,
    IsMultiRegionTrail=True,
    EnableLogFileValidation=True,
    KMSKeyId='arn:aws:kms:us-east-1:123456789012:key/xxx',
    IsOrganizationTrail=True
)

# ログ記録を開始
cloudtrail.start_logging(Name='security-audit-trail')

# S3とLambdaのデータイベントを有効化
cloudtrail.put_event_selectors(
    TrailName='security-audit-trail',
    EventSelectors=[
        {
            'ReadWriteType': 'All',
            'IncludeManagementEvents': True,
            'DataResources': [
                {
                    'Type': 'AWS::S3::Object',
                    'Values': ['arn:aws:s3:::sensitive-bucket/']
                },
                {
                    'Type': 'AWS::Lambda::Function',
                    'Values': ['arn:aws:lambda']
                }
            ]
        }
    ]
)
```

### CloudTrailログの分析

```python
import boto3
import json
import gzip

s3 = boto3.client('s3')

def analyze_cloudtrail_logs(bucket, prefix):
    """CloudTrailログのセキュリティイベントを分析"""

    # ログファイルを一覧
    response = s3.list_objects_v2(Bucket=bucket, Prefix=prefix)

    security_events = []

    for obj in response.get('Contents', []):
        # ログファイルをダウンロードして解凍
        log_file = s3.get_object(Bucket=bucket, Key=obj['Key'])
        content = gzip.decompress(log_file['Body'].read())
        logs = json.loads(content)

        for record in logs.get('Records', []):
            # セキュリティ関連イベントをチェック
            if is_security_event(record):
                security_events.append(record)

    return security_events


def is_security_event(record):
    """セキュリティ関連イベントを識別"""

    high_risk_events = [
        'ConsoleLogin',
        'CreateUser',
        'DeleteUser',
        'CreateAccessKey',
        'PutUserPolicy',
        'AttachUserPolicy',
        'CreateRole',
        'UpdateAssumeRolePolicy',
        'StopLogging',
        'DeleteTrail',
        'PutBucketPolicy',
        'PutBucketAcl'
    ]

    # イベント名をチェック
    if record.get('eventName') in high_risk_events:
        return True

    # 失敗したイベントをチェック
    if record.get('errorCode'):
        return True

    # ルートアカウントの使用をチェック
    if record.get('userIdentity', {}).get('type') == 'Root':
        return True

    return False
```

### CloudTrail Insights

```python
# 異常検出のためにCloudTrail Insightsを有効化
cloudtrail.put_insight_selectors(
    TrailName='security-audit-trail',
    InsightSelectors=[
        {'InsightType': 'ApiCallRateInsight'},
        {'InsightType': 'ApiErrorRateInsight'}
    ]
)

# CloudTrail Lakeでinsightsをクエリ
cloudtrail_lake = boto3.client('cloudtrail')

# イベントデータストアを作成
response = cloudtrail_lake.create_event_data_store(
    Name='security-events',
    RetentionPeriod=365,
    TerminationProtectionEnabled=True
)

# クエリを実行
query_response = cloudtrail_lake.start_query(
    QueryStatement='''
        SELECT eventName, COUNT(*) as count
        FROM security-events
        WHERE eventTime > '2025-01-01'
        AND errorCode IS NOT NULL
        GROUP BY eventName
        ORDER BY count DESC
        LIMIT 10
    '''
)
```

## CloudWatch Logs

### ロググループの設定

```python
import boto3

logs = boto3.client('logs')

# 暗号化と保持期間付きでロググループを作成
logs.create_log_group(
    logGroupName='/aws/security/application',
    kmsKeyId='arn:aws:kms:us-east-1:123456789012:key/xxx',
    tags={
        'Environment': 'Production',
        'Security': 'High'
    }
)

# 保持ポリシーを設定
logs.put_retention_policy(
    logGroupName='/aws/security/application',
    retentionInDays=365
)

# リアルタイム処理のためのサブスクリプションフィルターを作成
logs.put_subscription_filter(
    logGroupName='/aws/security/application',
    filterName='security-events',
    filterPattern='[ERROR, WARN, CRITICAL]',
    destinationArn='arn:aws:lambda:us-east-1:123456789012:function:process-logs'
)
```

### メトリクスフィルター

```python
# ログイン失敗のメトリクスフィルターを作成
logs.put_metric_filter(
    logGroupName='/aws/security/auth',
    filterName='FailedLogins',
    filterPattern='{ $.status = "FAILED" && $.eventType = "LOGIN" }',
    metricTransformations=[
        {
            'metricName': 'FailedLoginCount',
            'metricNamespace': 'Security/Authentication',
            'metricValue': '1',
            'defaultValue': 0,
            'dimensions': {
                'SourceIP': '$.sourceIP'
            }
        }
    ]
)

# ログイン失敗のアラームを作成
cloudwatch = boto3.client('cloudwatch')

cloudwatch.put_metric_alarm(
    AlarmName='HighFailedLogins',
    MetricName='FailedLoginCount',
    Namespace='Security/Authentication',
    Statistic='Sum',
    Period=300,
    EvaluationPeriods=1,
    Threshold=10,
    ComparisonOperator='GreaterThanThreshold',
    AlarmActions=[
        'arn:aws:sns:us-east-1:123456789012:security-alerts'
    ]
)
```

### CloudWatch Logs Insights

```python
# セキュリティ分析のためにログをクエリ
logs = boto3.client('logs')

response = logs.start_query(
    logGroupName='/aws/cloudtrail/logs',
    startTime=int((datetime.now() - timedelta(days=7)).timestamp()),
    endTime=int(datetime.now().timestamp()),
    queryString='''
        fields @timestamp, eventName, userIdentity.arn, sourceIPAddress
        | filter errorCode like /Unauthorized|AccessDenied/
        | stats count(*) as failedAttempts by userIdentity.arn
        | sort failedAttempts desc
        | limit 10
    '''
)

query_id = response['queryId']

# 結果を待機
import time
while True:
    result = logs.get_query_results(queryId=query_id)
    if result['status'] == 'Complete':
        break
    time.sleep(1)

for row in result['results']:
    print(row)
```

## AWS Config

### Configルール

```python
import boto3

config = boto3.client('config')

# AWS Configを有効化
config.put_configuration_recorder(
    ConfigurationRecorder={
        'name': 'default',
        'roleARN': 'arn:aws:iam::123456789012:role/config-role',
        'recordingGroup': {
            'allSupported': True,
            'includeGlobalResourceTypes': True
        }
    }
)

# 記録を開始
config.start_configuration_recorder(
    ConfigurationRecorderName='default'
)

# マネージドルールを追加
managed_rules = [
    {
        'name': 's3-bucket-server-side-encryption-enabled',
        'source': 'S3_BUCKET_SERVER_SIDE_ENCRYPTION_ENABLED'
    },
    {
        'name': 'ec2-instance-no-public-ip',
        'source': 'EC2_INSTANCE_NO_PUBLIC_IP'
    },
    {
        'name': 'iam-password-policy',
        'source': 'IAM_PASSWORD_POLICY'
    },
    {
        'name': 'root-account-mfa-enabled',
        'source': 'ROOT_ACCOUNT_MFA_ENABLED'
    },
    {
        'name': 'cloudtrail-enabled',
        'source': 'CLOUD_TRAIL_ENABLED'
    }
]

for rule in managed_rules:
    config.put_config_rule(
        ConfigRule={
            'ConfigRuleName': rule['name'],
            'Source': {
                'Owner': 'AWS',
                'SourceIdentifier': rule['source']
            }
        }
    )
```

### カスタムConfigルール

```python
# Lambdaを使用したカスタムConfigルールを作成
config.put_config_rule(
    ConfigRule={
        'ConfigRuleName': 'custom-s3-bucket-policy-check',
        'Description': 'S3バケットポリシーのパブリックアクセスをチェック',
        'Source': {
            'Owner': 'CUSTOM_LAMBDA',
            'SourceIdentifier': 'arn:aws:lambda:us-east-1:123456789012:function:config-rule-s3',
            'SourceDetails': [
                {
                    'EventSource': 'aws.config',
                    'MessageType': 'ConfigurationItemChangeNotification'
                }
            ]
        },
        'Scope': {
            'ComplianceResourceTypes': ['AWS::S3::Bucket']
        }
    }
)
```

### カスタムルール用Lambda

```python
import boto3
import json

def lambda_handler(event, context):
    config = boto3.client('config')

    # 呼び出しイベントを解析
    invoking_event = json.loads(event['invokingEvent'])
    configuration_item = invoking_event['configurationItem']

    # コンプライアンスを評価
    compliance_type = evaluate_compliance(configuration_item)

    # コンプライアンスを報告
    config.put_evaluations(
        Evaluations=[
            {
                'ComplianceResourceType': configuration_item['resourceType'],
                'ComplianceResourceId': configuration_item['resourceId'],
                'ComplianceType': compliance_type,
                'OrderingTimestamp': configuration_item['configurationItemCaptureTime']
            }
        ],
        ResultToken=event['resultToken']
    )


def evaluate_compliance(configuration_item):
    """S3バケットポリシーがパブリックアクセスを許可しているか評価"""

    if configuration_item['resourceType'] != 'AWS::S3::Bucket':
        return 'NOT_APPLICABLE'

    bucket_policy = configuration_item.get('supplementaryConfiguration', {}).get('BucketPolicy')

    if not bucket_policy:
        return 'COMPLIANT'

    policy = json.loads(bucket_policy.get('policyText', '{}'))

    for statement in policy.get('Statement', []):
        principal = statement.get('Principal', '')
        if principal == '*' or principal == {'AWS': '*'}:
            if statement.get('Effect') == 'Allow':
                return 'NON_COMPLIANT'

    return 'COMPLIANT'
```

### 修復アクション

```python
# 自動修復を追加
config.put_remediation_configurations(
    RemediationConfigurations=[
        {
            'ConfigRuleName': 's3-bucket-server-side-encryption-enabled',
            'TargetType': 'SSM_DOCUMENT',
            'TargetId': 'AWS-EnableS3BucketEncryption',
            'Parameters': {
                'BucketName': {
                    'ResourceValue': {
                        'Value': 'RESOURCE_ID'
                    }
                },
                'SSEAlgorithm': {
                    'StaticValue': {
                        'Values': ['AES256']
                    }
                }
            },
            'Automatic': True,
            'MaximumAutomaticAttempts': 3,
            'RetryAttemptSeconds': 60
        }
    ]
)
```

## VPC Flow Logs

### フローログを有効化

```python
import boto3

ec2 = boto3.client('ec2')

# CloudWatchへのフローログを作成
ec2.create_flow_logs(
    ResourceIds=['vpc-12345678'],
    ResourceType='VPC',
    TrafficType='ALL',
    LogDestinationType='cloud-watch-logs',
    LogGroupName='/aws/vpc/flow-logs',
    DeliverLogsPermissionArn='arn:aws:iam::123456789012:role/flow-logs-role',
    LogFormat='${version} ${account-id} ${interface-id} ${srcaddr} ${dstaddr} ${srcport} ${dstport} ${protocol} ${packets} ${bytes} ${start} ${end} ${action} ${log-status}',
    MaxAggregationInterval=60
)

# カスタムフォーマットでS3へのフローログを作成
ec2.create_flow_logs(
    ResourceIds=['vpc-12345678'],
    ResourceType='VPC',
    TrafficType='REJECT',
    LogDestinationType='s3',
    LogDestination='arn:aws:s3:::flow-logs-bucket/vpc-logs/',
    LogFormat='${version} ${vpc-id} ${subnet-id} ${instance-id} ${interface-id} ${account-id} ${type} ${srcaddr} ${dstaddr} ${srcport} ${dstport} ${pkt-srcaddr} ${pkt-dstaddr} ${protocol} ${bytes} ${packets} ${start} ${end} ${action} ${tcp-flags} ${log-status}'
)
```

### Athenaでフローログを分析

```sql
-- VPC Flow Logs用テーブルを作成
CREATE EXTERNAL TABLE vpc_flow_logs (
    version INT,
    account_id STRING,
    interface_id STRING,
    srcaddr STRING,
    dstaddr STRING,
    srcport INT,
    dstport INT,
    protocol INT,
    packets BIGINT,
    bytes BIGINT,
    start_time BIGINT,
    end_time BIGINT,
    action STRING,
    log_status STRING
)
PARTITIONED BY (dt STRING)
ROW FORMAT DELIMITED FIELDS TERMINATED BY ' '
LOCATION 's3://flow-logs-bucket/vpc-logs/';

-- 拒否された接続のトップを検索
SELECT srcaddr, dstaddr, dstport, action, COUNT(*) as count
FROM vpc_flow_logs
WHERE action = 'REJECT'
AND dt >= '2025/01/01'
GROUP BY srcaddr, dstaddr, dstport, action
ORDER BY count DESC
LIMIT 20;

-- ポートスキャナーを特定
SELECT srcaddr, COUNT(DISTINCT dstport) as ports_scanned
FROM vpc_flow_logs
WHERE action = 'REJECT'
GROUP BY srcaddr
HAVING COUNT(DISTINCT dstport) > 100
ORDER BY ports_scanned DESC;

-- 異常なアウトバウンドトラフィックを検索
SELECT dstaddr, SUM(bytes) as total_bytes
FROM vpc_flow_logs
WHERE action = 'ACCEPT'
AND srcaddr LIKE '10.%'
AND dstaddr NOT LIKE '10.%'
GROUP BY dstaddr
ORDER BY total_bytes DESC
LIMIT 20;
```

## セキュリティ自動化のためのEventBridge

```python
import boto3
import json

events = boto3.client('events')

# IAM変更のルールを作成
events.put_rule(
    Name='iam-changes',
    EventPattern=json.dumps({
        'source': ['aws.iam'],
        'detail-type': ['AWS API Call via CloudTrail'],
        'detail': {
            'eventSource': ['iam.amazonaws.com'],
            'eventName': [
                'CreateUser',
                'DeleteUser',
                'CreateAccessKey',
                'DeleteAccessKey',
                'AttachUserPolicy',
                'PutUserPolicy'
            ]
        }
    }),
    State='ENABLED'
)

# Lambdaターゲットを追加
events.put_targets(
    Rule='iam-changes',
    Targets=[
        {
            'Id': 'iam-change-handler',
            'Arn': 'arn:aws:lambda:us-east-1:123456789012:function:iam-change-handler'
        }
    ]
)

# ルートアカウントアクティビティのルールを作成
events.put_rule(
    Name='root-account-activity',
    EventPattern=json.dumps({
        'source': ['aws.signin'],
        'detail-type': ['AWS Console Sign In via CloudTrail'],
        'detail': {
            'userIdentity': {
                'type': ['Root']
            }
        }
    }),
    State='ENABLED'
)

# 即時通知のためにSNSターゲットを追加
events.put_targets(
    Rule='root-account-activity',
    Targets=[
        {
            'Id': 'root-activity-alert',
            'Arn': 'arn:aws:sns:us-east-1:123456789012:security-critical'
        }
    ]
)
```

## セキュリティダッシュボード

```python
import boto3

cloudwatch = boto3.client('cloudwatch')

# ダッシュボードを作成
dashboard_body = {
    'widgets': [
        {
            'type': 'metric',
            'properties': {
                'title': 'ログイン失敗回数',
                'metrics': [
                    ['Security/Authentication', 'FailedLoginCount']
                ],
                'period': 300,
                'stat': 'Sum'
            }
        },
        {
            'type': 'metric',
            'properties': {
                'title': 'APIエラー率',
                'metrics': [
                    ['AWS/CloudTrail', 'APIErrorRate']
                ],
                'period': 300
            }
        },
        {
            'type': 'log',
            'properties': {
                'title': '最近のセキュリティイベント',
                'query': '''
                    SOURCE '/aws/cloudtrail/logs'
                    | fields @timestamp, eventName, userIdentity.arn
                    | filter errorCode like /Unauthorized|AccessDenied/
                    | sort @timestamp desc
                    | limit 20
                ''',
                'region': 'us-east-1'
            }
        }
    ]
}

cloudwatch.put_dashboard(
    DashboardName='SecurityOverview',
    DashboardBody=json.dumps(dashboard_body)
)
```

## まとめ

| サービス | 目的 | 主な機能 |
|---------|-----|---------|
| CloudTrail | APIログ | 管理/データイベント、insights |
| CloudWatch Logs | ログ集約 | 保持、暗号化、insights |
| AWS Config | コンプライアンス | ルール、修復、タイムライン |
| VPC Flow Logs | ネットワーク可視性 | トラフィック分析、フォレンジック |
| EventBridge | イベントルーティング | ルール、ターゲット、自動化 |

重要なポイント：

- ログファイル検証付きですべてのリージョンでCloudTrailを有効化
- アドホックログ分析にはCloudWatch Logs Insightsを使用
- 継続的なコンプライアンスにはAWS Configルールを実装
- ネットワークセキュリティ可視性のためにVPC Flow Logsを有効化
- リアルタイムセキュリティ自動化にはEventBridgeを使用
- 重要なセキュリティメトリクスにはCloudWatchアラームを作成
- 長期保存には暗号化付きでS3にログを保存
- 大規模なログ分析にはコスト効率の良いAthenaを使用

セキュリティログとモニタリングは、AWSセキュリティスペシャリティ認定とAWS環境の可視性維持に不可欠です。

## 参考文献

- [AWS CloudTrail User Guide](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/)
- [Amazon CloudWatch Logs User Guide](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/)
- [AWS Config Developer Guide](https://docs.aws.amazon.com/config/latest/developerguide/)
- Muñoz, Mauricio, et al. *AWS Certified Security Study Guide, 2nd Edition*. Wiley, 2025.
- Book, Adam, and Stuart Scott. *AWS Certified Security – Specialty (SCS-C02) Exam Guide*. Packt, 2024.
