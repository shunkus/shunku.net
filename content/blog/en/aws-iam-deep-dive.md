---
title: "AWS IAM Deep Dive: Policies, Roles, and Federation"
date: "2025-11-13"
excerpt: "Master AWS Identity and Access Management - policy syntax, condition keys, STS, identity federation, and security best practices."
tags: ["AWS", "Security", "IAM", "Certification"]
author: "Shunku"
---

AWS Identity and Access Management (IAM) is the foundation for controlling access to AWS resources. Understanding IAM deeply is essential for the AWS Security Specialty certification.

## IAM Core Concepts

```mermaid
flowchart TD
    subgraph Principals["Principals (Who)"]
        A[Users]
        B[Roles]
        C[Federated Users]
        D[Applications]
    end

    subgraph Policies["Policies (What)"]
        E[Identity-Based]
        F[Resource-Based]
        G[Permissions Boundary]
        H[SCPs]
    end

    subgraph Resources["Resources (Where)"]
        I[S3 Buckets]
        J[EC2 Instances]
        K[Lambda Functions]
        L[DynamoDB Tables]
    end

    Principals --> Policies
    Policies --> Resources

    style Principals fill:#3b82f6,color:#fff
    style Policies fill:#f59e0b,color:#fff
    style Resources fill:#10b981,color:#fff
```

## Policy Structure

### Basic Policy Syntax

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

### Policy Elements

| Element | Description | Required |
|---------|-------------|----------|
| Version | Policy language version (use "2012-10-17") | Yes |
| Statement | Array of permission statements | Yes |
| Sid | Statement identifier (optional but recommended) | No |
| Effect | Allow or Deny | Yes |
| Action | API actions to allow/deny | Yes |
| Resource | ARNs of resources | Yes* |
| Condition | Conditions for when policy applies | No |

## Policy Types

```mermaid
flowchart LR
    subgraph Identity["Identity-Based Policies"]
        A[Managed Policies]
        B[Inline Policies]
    end

    subgraph Resource["Resource-Based Policies"]
        C[Bucket Policies]
        D[Key Policies]
        E[Trust Policies]
    end

    subgraph Boundaries["Boundaries"]
        F[Permissions Boundary]
        G[SCPs]
    end

    style Identity fill:#3b82f6,color:#fff
    style Resource fill:#f59e0b,color:#fff
    style Boundaries fill:#10b981,color:#fff
```

### Identity-Based Policies

Attached to users, groups, or roles:

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

### Resource-Based Policies

Attached directly to resources:

```json
// S3 Bucket Policy
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

### Permissions Boundaries

Limit maximum permissions for IAM entities:

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

# Apply permissions boundary to a user
iam.put_user_permissions_boundary(
    UserName='developer',
    PermissionsBoundary='arn:aws:iam::123456789012:policy/DeveloperBoundary'
)
```

## Condition Keys

### Global Condition Keys

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

### Common Condition Operators

| Operator | Description | Example |
|----------|-------------|---------|
| StringEquals | Exact string match | `"aws:PrincipalTag/Role": "Admin"` |
| StringLike | Pattern match with wildcards | `"s3:prefix": ["home/${aws:username}/*"]` |
| ArnEquals | Exact ARN match | `"aws:SourceArn": "arn:aws:sns:..."` |
| IpAddress | IP range match | `"aws:SourceIp": "10.0.0.0/8"` |
| Bool | Boolean match | `"aws:SecureTransport": "true"` |
| DateGreaterThan | Date comparison | `"aws:CurrentTime": "2025-01-01"` |

### Service-Specific Condition Keys

```json
// S3 specific conditions
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

## IAM Roles

### Role Trust Policy

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

### Cross-Account Role

```json
// Trust policy for cross-account access
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

# Assume role from another account
sts = boto3.client('sts')

response = sts.assume_role(
    RoleArn='arn:aws:iam::999988887777:role/CrossAccountRole',
    RoleSessionName='cross-account-session',
    ExternalId='unique-external-id'
)

credentials = response['Credentials']

# Use assumed role credentials
s3 = boto3.client(
    's3',
    aws_access_key_id=credentials['AccessKeyId'],
    aws_secret_access_key=credentials['SecretAccessKey'],
    aws_session_token=credentials['SessionToken']
)
```

## Security Token Service (STS)

```mermaid
flowchart LR
    A[Principal] --> B[STS]
    B --> C[Temporary Credentials]
    C --> D[Access AWS Resources]

    style B fill:#f59e0b,color:#fff
```

### STS API Operations

| Operation | Use Case |
|-----------|----------|
| AssumeRole | Assume IAM role (same or cross-account) |
| AssumeRoleWithSAML | Federated access via SAML |
| AssumeRoleWithWebIdentity | Federated access via OIDC |
| GetSessionToken | MFA-protected API access |
| GetFederationToken | Federated user access |

### Session Policies

```python
import boto3
import json

sts = boto3.client('sts')

# Assume role with session policy to further restrict permissions
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
    Policy=json.dumps(session_policy)  # Further restricts permissions
)
```

## Identity Federation

### SAML 2.0 Federation

```mermaid
sequenceDiagram
    participant User
    participant IdP as Identity Provider
    participant STS as AWS STS
    participant AWS as AWS Services

    User->>IdP: 1. Authenticate
    IdP->>User: 2. SAML Assertion
    User->>STS: 3. AssumeRoleWithSAML
    STS->>User: 4. Temporary Credentials
    User->>AWS: 5. Access Resources
```

### IAM Identity Center (AWS SSO)

```python
# Configure IAM Identity Center permission set
import boto3

sso_admin = boto3.client('sso-admin')

# Create permission set
response = sso_admin.create_permission_set(
    InstanceArn='arn:aws:sso:::instance/ssoins-xxx',
    Name='DeveloperAccess',
    Description='Permission set for developers',
    SessionDuration='PT8H'
)

permission_set_arn = response['PermissionSet']['PermissionSetArn']

# Attach managed policy
sso_admin.attach_managed_policy_to_permission_set(
    InstanceArn='arn:aws:sso:::instance/ssoins-xxx',
    PermissionSetArn=permission_set_arn,
    ManagedPolicyArn='arn:aws:iam::aws:policy/PowerUserAccess'
)
```

### Web Identity Federation (Cognito)

```python
import boto3

cognito = boto3.client('cognito-identity')

# Get identity ID from Cognito
response = cognito.get_id(
    IdentityPoolId='us-east-1:xxx',
    Logins={
        'accounts.google.com': google_token
    }
)

identity_id = response['IdentityId']

# Get credentials
credentials = cognito.get_credentials_for_identity(
    IdentityId=identity_id,
    Logins={
        'accounts.google.com': google_token
    }
)
```

## Policy Evaluation Logic

```mermaid
flowchart TD
    A[Request] --> B{Explicit Deny?}
    B -->|Yes| C[DENY]
    B -->|No| D{SCP Allow?}
    D -->|No| C
    D -->|Yes| E{Resource Policy Allow?}
    E -->|Yes| F[ALLOW]
    E -->|No| G{Identity Policy Allow?}
    G -->|No| C
    G -->|Yes| H{Permissions Boundary?}
    H -->|Denies| C
    H -->|Allows| I{Session Policy?}
    I -->|Denies| C
    I -->|Allows| F

    style C fill:#ef4444,color:#fff
    style F fill:#10b981,color:#fff
```

### Effective Permissions

```
Effective Permissions =
  Identity Policies
  ∩ Permissions Boundaries
  ∩ SCPs
  ∩ Session Policies
  ∪ Resource Policies (for cross-account)
```

## Best Practices

### 1. Least Privilege

```json
// ❌ Bad: Overly permissive
{
  "Effect": "Allow",
  "Action": "s3:*",
  "Resource": "*"
}

// ✅ Good: Specific permissions
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

### 2. Use Roles Instead of Long-Term Credentials

```python
# ❌ Bad: Hard-coded credentials
client = boto3.client(
    's3',
    aws_access_key_id='AKIAIOSFODNN7EXAMPLE',
    aws_secret_access_key='wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
)

# ✅ Good: Use IAM role (automatic with EC2/Lambda)
client = boto3.client('s3')  # Uses instance profile or execution role
```

### 3. Enable MFA for Sensitive Operations

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

### 4. Use IAM Access Analyzer

```python
import boto3

analyzer = boto3.client('accessanalyzer')

# Create analyzer
analyzer.create_analyzer(
    analyzerName='account-analyzer',
    type='ACCOUNT'
)

# List findings
findings = analyzer.list_findings(
    analyzerArn='arn:aws:access-analyzer:region:account:analyzer/account-analyzer'
)

for finding in findings['findings']:
    print(f"Resource: {finding['resource']}")
    print(f"Finding: {finding['condition']}")
```

### 5. Rotate Credentials Regularly

```python
import boto3

iam = boto3.client('iam')

# List access keys
keys = iam.list_access_keys(UserName='my-user')

for key in keys['AccessKeyMetadata']:
    # Check key age
    key_age = (datetime.now(timezone.utc) - key['CreateDate']).days

    if key_age > 90:
        print(f"Key {key['AccessKeyId']} is {key_age} days old - rotate!")
```

## Troubleshooting IAM

### Policy Simulator

```python
import boto3

iam = boto3.client('iam')

response = iam.simulate_principal_policy(
    PolicySourceArn='arn:aws:iam::123456789012:user/testuser',
    ActionNames=['s3:GetObject', 's3:PutObject'],
    ResourceArns=['arn:aws:s3:::my-bucket/*']
)

for result in response['EvaluationResults']:
    print(f"Action: {result['EvalActionName']}")
    print(f"Decision: {result['EvalDecision']}")
```

### Access Advisor

```python
# Check service last accessed
response = iam.generate_service_last_accessed_details(
    Arn='arn:aws:iam::123456789012:user/myuser'
)

job_id = response['JobId']

# Get results
details = iam.get_service_last_accessed_details(JobId=job_id)

for service in details['ServicesLastAccessed']:
    print(f"{service['ServiceName']}: {service.get('LastAuthenticated', 'Never')}")
```

## Summary

| Concept | Description |
|---------|-------------|
| Policy Types | Identity-based, Resource-based, Permissions Boundary, SCPs |
| Condition Keys | Global (aws:), Service-specific (s3:, ec2:) |
| STS | Temporary credentials via AssumeRole |
| Federation | SAML, OIDC, Cognito for external identities |
| Evaluation | Explicit Deny > SCPs > Resource > Identity > Boundary |

Key takeaways:

- Follow least privilege principle in all policies
- Use roles instead of long-term access keys
- Implement MFA for sensitive operations
- Use condition keys to add context-based restrictions
- Leverage IAM Access Analyzer to find overly permissive policies
- Understand policy evaluation order for troubleshooting
- Use permissions boundaries to delegate IAM administration safely

IAM mastery is crucial for passing the AWS Security Specialty certification and building secure AWS architectures.

## References

- [IAM User Guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/)
- [IAM Policy Reference](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies.html)
- Muñoz, Mauricio, et al. *AWS Certified Security Study Guide, 2nd Edition*. Wiley, 2025.
- Book, Adam, and Stuart Scott. *AWS Certified Security – Specialty (SCS-C02) Exam Guide*. Packt, 2024.
