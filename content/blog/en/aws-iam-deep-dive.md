---
title: "AWS IAM Deep Dive: Policies, Roles, and Federation"
date: "2025-11-13"
excerpt: "Master AWS Identity and Access Management - understand identity types, policy evaluation, least privilege, and security best practices."
tags: ["AWS", "Security", "IAM", "Certification"]
author: "Shunku"
---

AWS Identity and Access Management (IAM) is the foundation for controlling access to AWS resources. It handles two fundamental security questions: Who are you? (Authentication) and What can you do? (Authorization). Understanding IAM deeply is essential not just for certification, but for building secure AWS architectures.

## Why IAM Matters

Consider the challenge: you have hundreds of AWS resources—S3 buckets containing customer data, EC2 instances running your applications, databases with sensitive information. You also have dozens or hundreds of people and applications that need varying levels of access to these resources.

Without IAM, you would face an impossible choice: either give everyone full access (catastrophic security risk) or manually manage individual credentials for each person and resource (unscalable and error-prone).

IAM solves this by providing a unified framework for:
- **Identity Management**: Creating and managing users, groups, and roles
- **Access Control**: Defining who can access what resources and under what conditions
- **Federation**: Integrating with external identity providers
- **Audit Trail**: Recording who did what and when

## The Fundamental Challenge: Least Privilege

The principle of least privilege states that every identity should have only the permissions needed to perform its function—nothing more. This sounds simple but is surprisingly difficult in practice.

### Why Least Privilege is Hard

**The Discovery Problem**: How do you know what permissions an application actually needs? Developers often don't know the complete list of AWS API calls their application makes, especially when using SDKs or frameworks that make calls internally.

**The Evolution Problem**: Application requirements change over time. A permission that wasn't needed at launch might be needed later, or vice versa. Keeping policies in sync with actual requirements requires continuous effort.

**The Convenience Trade-off**: Overly restrictive permissions cause application failures. When deadlines loom, teams often grant broad permissions "temporarily" and never revisit them. The easiest path is usually the most permissive one.

**The Blast Radius Reality**: When permissions are too broad, a compromised credential can cause widespread damage. When an EC2 instance with `s3:*` permission is compromised, every S3 bucket in the account is at risk.

### Strategies for Least Privilege

**Start Broad, Then Narrow**: Begin development with broader permissions, use IAM Access Analyzer to identify what's actually being used, then create policies based on actual usage patterns.

**Use AWS Managed Policies as Starting Points**: AWS provides managed policies for common use cases. Review them, understand what they grant, and create custom policies that are more restrictive for your specific needs.

**Leverage Service-Linked Roles**: When AWS services need to access resources on your behalf, use service-linked roles instead of creating custom roles. AWS maintains these with minimal required permissions.

## Understanding Identity Types

IAM provides several identity types, each serving different use cases. Choosing the right identity type is a critical security decision.

### IAM Users: For Humans Who Need Long-Term Access

IAM users have permanent credentials (passwords and/or access keys). They're appropriate when:
- Someone needs AWS Management Console access
- You cannot implement federation with an external identity provider
- Specific compliance requirements mandate IAM user management

However, IAM users present security challenges:
- **Credential Management Burden**: Passwords need rotation, access keys need lifecycle management
- **Credential Exposure Risk**: Long-lived credentials can be stolen and misused
- **Scale Limitations**: Managing hundreds of IAM users becomes administratively complex

**Best Practice**: Minimize IAM user creation. Prefer federation with an identity provider (like Okta, Azure AD, or IAM Identity Center) for human access.

### IAM Roles: For Temporary, Assumption-Based Access

Roles don't have permanent credentials. Instead, when a principal (user, application, or service) "assumes" a role, AWS provides temporary credentials that automatically expire.

Roles are appropriate for:
- **AWS Services**: EC2 instances, Lambda functions, and other services that need to access AWS resources
- **Cross-Account Access**: Granting access to users or services in other AWS accounts
- **Federation**: Providing AWS access to identities from external systems
- **Privileged Operations**: Requiring explicit role assumption for sensitive actions

The security advantages of roles are significant:
- **No Long-Term Secrets**: Temporary credentials expire automatically (default: 1 hour, configurable up to 12 hours)
- **Auditable Assumptions**: Every role assumption is logged in CloudTrail
- **Revocable Access**: Revoking the role immediately cuts off access
- **Separation of Identity and Permission**: The same identity can assume different roles for different purposes

### Service-Linked Roles: AWS-Managed Permissions for Services

Some AWS services require specific permissions to function. Service-linked roles are created and managed by AWS, with permissions scoped precisely to what the service needs.

You cannot modify service-linked role permissions, which is actually a security benefit—it prevents accidental over-permissioning of AWS service access.

### Groups: For Managing Human Users at Scale

Groups don't have credentials—they're containers for IAM users that simplify permission management. Instead of attaching policies to individual users, attach them to groups.

This approach provides:
- **Consistency**: All users in a group have the same permissions
- **Easier Management**: Adding a user to a group grants all the group's permissions
- **Clear Organization**: Groups can represent teams, job functions, or access levels

## How Policies Work

Policies are JSON documents that define permissions. Understanding their structure and evaluation is essential for security.

### Policy Structure

Every policy contains one or more statements, each defining a permission:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::my-bucket", "arn:aws:s3:::my-bucket/*"],
      "Condition": {
        "IpAddress": {"aws:SourceIp": "192.168.1.0/24"}
      }
    }
  ]
}
```

**Effect**: Allow or Deny. Explicit denies always override allows.

**Action**: The AWS API actions the statement applies to. Can use wildcards (`s3:Get*`) but be careful—wildcards often grant more than intended.

**Resource**: The specific AWS resources the statement applies to. Always be as specific as possible. `"*"` means "all resources" and should be avoided in production policies.

**Condition**: Optional context requirements. Conditions enable sophisticated access controls like IP restrictions, MFA requirements, and time-based access.

### Identity-Based vs. Resource-Based Policies

**Identity-Based Policies** attach to principals (users, groups, roles) and define what that principal can do:
- "This role can read objects from S3 bucket X"
- "This user can start EC2 instances with tag Environment=Development"

**Resource-Based Policies** attach to resources and define who can access them:
- "This S3 bucket allows read access from account 123456789012"
- "This KMS key can be used by role X in account Y"

Resource-based policies are essential for cross-account access. They enable access without requiring the accessing account to have any pre-existing trust relationship.

### Permissions Boundaries: Guardrails for Delegated Administration

Permissions boundaries define the maximum permissions an IAM entity can have. They don't grant permissions themselves—they limit what identity-based policies can grant.

Use permissions boundaries when:
- Delegating IAM administration to teams who shouldn't grant themselves arbitrary permissions
- Creating service accounts that should never exceed certain permissions
- Implementing self-service IAM within guardrails

For example, you might let developers create IAM roles for their applications, but apply a permissions boundary that prevents those roles from having IAM or Organizations permissions.

### Service Control Policies: Organization-Wide Guardrails

Service Control Policies (SCPs) apply to entire AWS accounts within an organization. They set maximum permissions for all identities in an account.

SCPs are powerful for:
- Preventing production accounts from being able to delete CloudTrail logs
- Restricting which regions can be used
- Enforcing encryption requirements across all services

Important: SCPs don't grant permissions. Even if an SCP allows an action, identity-based policies must still explicitly allow it.

## Policy Evaluation: How AWS Decides Allow or Deny

When a principal requests an action, AWS evaluates all applicable policies:

1. **Explicit Deny Check**: If any policy explicitly denies the action, the request is denied. Explicit denies are absolute.

2. **Organization SCPs**: If the account is in an Organization, SCPs must allow the action. No SCP permission = implicit deny.

3. **Resource-Based Policy**: If a resource-based policy explicitly allows the action (and the principal is in the same account or the resource policy allows cross-account access), the request may be allowed.

4. **Identity-Based Policy**: The principal's attached policies must allow the action.

5. **Permissions Boundary**: If the principal has a permissions boundary, it must allow the action.

6. **Session Policy**: If the credentials came from assuming a role with a session policy, the session policy must allow the action.

The effective permissions are the intersection of all these policies. Think of it as: you need permission at every layer, and any layer can deny.

### Why This Matters for Security

This evaluation model enables defense in depth:
- SCPs prevent entire categories of dangerous actions organization-wide
- Permissions boundaries limit delegated IAM permissions
- Identity-based policies grant specific permissions
- Resource-based policies can require additional conditions for access

If any layer fails to allow the action, access is denied. This makes it difficult for a single misconfiguration to create a security vulnerability.

## Temporary Credentials and AWS STS

AWS Security Token Service (STS) provides temporary credentials that automatically expire. This is fundamental to AWS security because it eliminates the problem of long-lived credentials.

### When STS Gets Involved

**Role Assumption**: When any principal assumes a role, STS provides temporary credentials. This happens behind the scenes for:
- EC2 instance profiles (instances assuming their role)
- Lambda execution roles (functions assuming their role)
- Cross-account access (users assuming roles in other accounts)

**Federation**: When external identities access AWS through SAML, OIDC, or Cognito, STS provides temporary credentials.

**Session Policies**: When assuming a role, you can attach a session policy that further restricts the role's permissions for that specific session.

### The Security Model

Temporary credentials have three components:
- Access Key ID (identifies the credential)
- Secret Access Key (used to sign requests)
- Session Token (proves the credential is temporary and valid)

The session token includes the credential's expiration time and the assumed role. After expiration, the credentials stop working automatically—no revocation required.

## Identity Federation: Trusting External Identity Providers

Federation allows identities managed outside AWS to access AWS resources. This is critical for enterprises that don't want to duplicate their identity management in IAM.

### SAML 2.0 Federation

SAML federation works with enterprise identity providers like Active Directory Federation Services (AD FS), Okta, and Azure AD.

The flow:
1. User authenticates with the identity provider
2. Identity provider generates a SAML assertion (signed proof of identity and attributes)
3. User exchanges the SAML assertion for AWS temporary credentials
4. User accesses AWS with those credentials

SAML federation eliminates IAM user management for human access. The enterprise identity provider handles authentication, password policies, and MFA.

### OIDC Federation (Web Identity)

OpenID Connect (OIDC) federation works with OAuth 2.0 providers like Google, Facebook, and Amazon. It's commonly used for:
- Mobile applications where users sign in with social identities
- Web applications that need to access AWS resources on behalf of users

AWS Cognito simplifies OIDC federation by handling the token exchange and providing a unified identity pool across multiple providers.

### IAM Identity Center (AWS SSO)

IAM Identity Center provides centralized access management for multiple AWS accounts. It can use its own identity store or federate with external providers.

Benefits:
- **Single Sign-On**: One login for all AWS accounts and applications
- **Permission Sets**: Define permissions once, apply to multiple accounts
- **Centralized Audit**: All access events in one place

For organizations with multiple AWS accounts, IAM Identity Center is the recommended approach for human access management.

## Common Security Mistakes

### Over-Reliance on IAM Users

Creating IAM users for every employee doesn't scale and creates credential management overhead. Prefer federation or IAM Identity Center for human access.

### Using Access Keys When Roles Suffice

Applications running on AWS compute services (EC2, Lambda, ECS) should use IAM roles, not access keys. Instance profiles and execution roles provide automatic credential rotation.

### Wildcard Actions and Resources

Policies with `"Action": "*"` or `"Resource": "*"` grant far more access than typically needed. These shortcuts in development become security vulnerabilities in production.

### Ignoring Cross-Account Trust

When creating roles that can be assumed from other accounts, consider:
- Do you trust everyone in that account?
- Should you require an external ID to prevent confused deputy attacks?
- Should you require MFA?

### Not Using Conditions

Conditions enable powerful restrictions:
- Require MFA for sensitive actions
- Restrict access to specific IP ranges
- Limit access to specific VPCs
- Require encryption for data storage

Policies without conditions are usually more permissive than necessary.

## Security Monitoring and Analysis

### IAM Access Analyzer

Access Analyzer identifies resources shared outside your account or organization. It continuously monitors and generates findings when:
- S3 buckets allow public access
- IAM roles can be assumed by external entities
- KMS keys can be used by external principals

Enable Access Analyzer in every account to catch unintended external access.

### CloudTrail for IAM Events

CloudTrail logs all IAM API calls, including:
- Who created or modified users, roles, and policies
- When credentials were used and from what IP
- Which roles were assumed and by whom

Monitoring these events is essential for detecting credential compromise and policy changes.

### Credential Reports and Access Advisor

IAM provides tools to identify unused and potentially over-permissioned entities:
- **Credential Report**: CSV with all users and credential status
- **Access Advisor**: Shows which services an entity has accessed and when

Use these to identify credentials that should be rotated or permissions that can be removed.

## Summary

IAM is the security foundation for AWS. Key concepts:

| Concept | Purpose |
|---------|---------|
| Users | Permanent identities for humans (prefer federation instead) |
| Roles | Temporary, assumption-based identities for services and cross-account access |
| Policies | JSON documents defining permissions |
| Permissions Boundaries | Maximum permissions an entity can have |
| SCPs | Maximum permissions for entire accounts |
| Federation | External identity provider integration |
| STS | Temporary credential generation |

Security principles:
- **Least Privilege**: Grant only required permissions
- **Temporary Credentials**: Use roles instead of access keys
- **Defense in Depth**: Layer SCPs, boundaries, and policies
- **Conditions**: Add context requirements to policies
- **Monitoring**: Enable Access Analyzer and review CloudTrail

Mastering IAM requires understanding not just how to write policies, but why the security model works the way it does. Every IAM decision should ask: "What's the minimum permission needed? What happens if this credential is compromised?"

## References

- [IAM User Guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/)
- [IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [Policy Evaluation Logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html)
- Crane, Dylan. *AWS Security*. Manning Publications, 2022.
- Muñoz, Mauricio, et al. *Mastering AWS Security, 2nd Edition*. Packt, 2024.
