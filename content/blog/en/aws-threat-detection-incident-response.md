---
title: "AWS Threat Detection and Incident Response: GuardDuty, Security Hub, and Detective"
date: "2025-11-05"
excerpt: "Master AWS threat detection and incident response - understand how GuardDuty, Security Hub, and Detective work together, and how to build effective incident response capabilities."
tags: ["AWS", "Security", "GuardDuty", "Incident Response", "Certification"]
author: "Shunku"
---

Prevention is essential, but prevention alone is insufficient. No matter how well you configure your security controls, breaches can still occur—through zero-day vulnerabilities, social engineering, insider threats, or misconfigurations. What separates organizations that recover quickly from those that suffer catastrophic damage is their ability to detect threats rapidly and respond effectively.

## Why Threat Detection Matters

### The Assumption of Breach

Modern security thinking starts from the assumption that you will be breached. This isn't pessimism—it's realism. Given enough time and resources, determined attackers can find a way in. The question isn't whether you'll be breached, but whether you'll know when it happens.

Organizations that assume they're already compromised:
- Focus on detection, not just prevention
- Limit blast radius through segmentation
- Practice incident response before incidents occur
- Maintain forensic capabilities for investigation

### The Detection Window

The time between initial compromise and detection is called the "dwell time." Industry studies consistently show dwell times measured in months. During this period, attackers can:
- Establish persistent access (backdoors, additional accounts)
- Move laterally to more valuable targets
- Exfiltrate data slowly to avoid triggering alerts
- Prepare for more damaging attacks

Reducing dwell time is one of the most impactful security improvements you can make. AWS provides services specifically designed for this purpose.

## Amazon GuardDuty: Intelligent Threat Detection

GuardDuty is AWS's managed threat detection service. It continuously analyzes data from multiple sources to identify suspicious activity.

### What GuardDuty Analyzes

GuardDuty ingests and analyzes:

**CloudTrail Events**: API calls across your AWS accounts. GuardDuty looks for anomalies—unusual API patterns, calls from unexpected locations, or known attack signatures.

**VPC Flow Logs**: Network traffic metadata. GuardDuty identifies reconnaissance activity, communication with known malicious IP addresses, and unusual data transfer patterns.

**DNS Logs**: Domain resolution requests. GuardDuty detects communication with command-and-control domains and cryptocurrency mining pools.

**EKS Audit Logs**: Kubernetes API server logs. GuardDuty identifies suspicious container activity, privilege escalation, and unusual cluster behavior.

**S3 Data Events**: Object-level operations. GuardDuty detects unusual access patterns that might indicate data exfiltration.

### How GuardDuty Detects Threats

GuardDuty uses multiple detection methods:

**Signature-Based Detection**: Matching known attack patterns—communication with IPs associated with malware, cryptocurrency mining activity, or known attack techniques.

**Anomaly Detection**: Machine learning establishes baseline behavior for your environment. When activity deviates significantly from normal, GuardDuty generates findings. This catches novel attacks that don't match known signatures.

**Threat Intelligence**: Integration with AWS threat intelligence and third-party feeds identifies communication with known malicious infrastructure.

### Understanding Finding Severity

GuardDuty categorizes findings by severity:

**Critical (9.0+)**: Immediate action required. Active compromise or data exfiltration in progress. Drop everything and respond.

**High (7.0-8.9)**: Significant threat that needs rapid response. Likely indicates actual malicious activity rather than false positive.

**Medium (4.0-6.9)**: Suspicious activity warranting investigation. May be legitimate activity or early stages of an attack.

**Low (1.0-3.9)**: Potentially concerning but often benign. Monitor for patterns.

### Common Finding Types

Understanding what GuardDuty detects helps you respond appropriately:

**Credential-Related**: Access key usage from unusual locations, console logins from suspicious IPs, root account usage without expected patterns.

**Network-Related**: Port scanning from instances, communication with known malicious IPs, unusual outbound traffic volumes.

**Instance-Related**: Cryptocurrency mining activity, backdoor installation, DNS queries to command-and-control domains.

**S3-Related**: Unusual access patterns, public bucket modifications from unexpected sources, high-volume downloads.

### Managing False Positives

Not every finding represents a real threat. Some legitimate activities trigger GuardDuty:
- Authorized penetration testing
- Internal vulnerability scanners
- Development environments with unusual traffic patterns

GuardDuty provides suppression rules to filter out known benign activity. However, use suppression carefully—over-suppression can cause you to miss real threats.

## AWS Security Hub: Centralized Security Management

Security Hub aggregates security findings from across AWS services and provides a unified view of your security posture.

### Why Aggregation Matters

Without Security Hub, security findings are scattered:
- GuardDuty findings in GuardDuty console
- Config compliance in AWS Config
- Inspector vulnerabilities in Inspector
- IAM Access Analyzer findings in IAM

Security Hub consolidates everything into a single dashboard. More importantly, it normalizes findings into a common format (AWS Security Finding Format), enabling consistent processing regardless of source.

### Security Standards

Security Hub evaluates your environment against industry benchmarks:

**AWS Foundational Security Best Practices**: AWS-curated security controls covering the most important security configurations.

**CIS AWS Foundations Benchmark**: Industry-standard security controls from the Center for Internet Security.

**PCI DSS**: Controls relevant to payment card data processing.

**NIST Cybersecurity Framework**: Controls mapped to NIST guidelines.

Each standard includes dozens of automated checks. Security Hub continuously evaluates your resources and reports compliance status.

### The Security Score

Security Hub calculates a security score—the percentage of passed controls. While imperfect (not all controls are equally important), the score provides:
- A quick health check of your security posture
- Trend tracking over time
- Comparison across accounts (in multi-account setups)

Don't obsess over the score, but do pay attention to failing controls, especially those marked critical or high severity.

### Cross-Account Aggregation

For organizations with multiple AWS accounts, Security Hub's aggregation capabilities are essential. A designated administrator account can:
- View findings from all member accounts
- Apply consistent security standards
- Track organization-wide security posture
- Respond to threats across the organization

This centralized visibility is crucial because attackers don't respect account boundaries—an attack might start in one account and pivot to others.

## Amazon Detective: Security Investigation

When GuardDuty generates a finding, you need to investigate. What happened? How did the attacker get in? What else did they access? Detective is designed to answer these questions.

### What Detective Provides

Detective automatically builds a behavior graph from your CloudTrail, VPC Flow Logs, and GuardDuty findings. This graph enables:

**Relationship Visualization**: See connections between entities—which users accessed which resources, which instances communicated with which IP addresses, how different activities relate.

**Historical Context**: Understand what "normal" looks like for any entity. Is this API call unusual for this user? Has this instance communicated with this IP before?

**Timeline Analysis**: Reconstruct the sequence of events. What happened before the suspicious activity? What happened after?

### When to Use Detective

Detective is most valuable when you need to:
- Investigate a GuardDuty finding to determine if it's a real threat
- Understand the scope of a confirmed breach
- Trace how an attacker moved through your environment
- Identify other resources that may have been compromised

Detective doesn't replace human investigation—it accelerates it by presenting relevant data in a meaningful way.

### The Investigation Workflow

A typical investigation flow:
1. GuardDuty generates a finding
2. Security Hub alerts on-call security analyst
3. Analyst opens Detective to investigate
4. Detective shows related entities and historical behavior
5. Analyst determines if the finding represents real threat
6. If confirmed, analyst initiates incident response

## Building Effective Incident Response

Detection is only valuable if you can respond effectively. Incident response is a practiced discipline, not an improvised reaction.

### The Incident Response Lifecycle

Effective incident response follows a structured approach:

**Preparation**: Before incidents occur, establish response procedures, designate responders, create runbooks, and practice through tabletop exercises.

**Detection and Analysis**: Identify that an incident has occurred and understand its nature and scope.

**Containment**: Stop the incident from spreading. Isolate affected resources while preserving evidence.

**Eradication**: Remove the attacker's presence—compromised accounts, malware, backdoors.

**Recovery**: Restore normal operations with verified clean systems.

**Post-Incident Activity**: Document what happened, identify improvements, update procedures.

### Containment Strategies

When responding to incidents in AWS, common containment actions include:

**Network Isolation**: Replace security groups with isolation groups that block all traffic. The compromised instance can't communicate with anything—neither the attacker nor your legitimate systems.

**Credential Deactivation**: If credentials are compromised, immediately deactivate access keys, delete console passwords, and apply deny-all policies. Don't just rotate—attackers may have created additional credentials.

**Resource Termination**: For easily replaceable resources, termination might be appropriate. But preserve forensic evidence first.

### Forensic Preservation

Before taking any containment action, preserve evidence:

**Snapshot Volumes**: Create EBS snapshots before modifying or terminating instances. These snapshots enable later analysis.

**Export Logs**: Ensure relevant CloudTrail, VPC Flow Logs, and application logs are preserved in a forensic account with restricted access.

**Memory Capture**: If possible, capture instance memory for malware analysis. This requires pre-installed tooling or SSM commands.

**Document Everything**: Record what you observed, what actions you took, and when. This documentation is essential for post-incident review and potential legal proceedings.

### Automation in Incident Response

Manual incident response doesn't scale. When you need to respond quickly to high-severity findings, automation is essential.

AWS enables automated response through:
- **EventBridge Rules**: Trigger Lambda functions when specific findings occur
- **Step Functions**: Orchestrate complex response workflows
- **Systems Manager**: Execute commands on affected instances
- **Lambda**: Custom response logic

A typical automated response might:
1. Receive a high-severity GuardDuty finding via EventBridge
2. Automatically create forensic snapshots
3. Apply isolation security group to affected instance
4. Send notification to security team
5. Create incident ticket in your ITSM system

## The Security Services Ecosystem

AWS security services work together:

**Inspector** scans for vulnerabilities in EC2 instances, container images, and Lambda functions. Findings flow to Security Hub.

**Macie** discovers and classifies sensitive data in S3. When it finds exposed PII or credentials, findings flow to Security Hub.

**IAM Access Analyzer** identifies resources shared outside your account or organization. Unintended external access findings flow to Security Hub.

**Config** continuously evaluates resource configurations against rules. Non-compliant resources generate findings that flow to Security Hub.

**GuardDuty** detects active threats. Findings flow to Security Hub.

Security Hub aggregates everything, providing a single pane of glass. For deep investigation of GuardDuty findings, Detective provides the analytical tools.

## Common Mistakes

### Not Enabling GuardDuty Everywhere

GuardDuty must be enabled in every region and account. Attackers will target regions where you're not watching. Enable GuardDuty organization-wide with delegated administrator for centralized management.

### Ignoring Low-Severity Findings

Low-severity findings often represent reconnaissance or initial access attempts. While individual low-severity findings may not be urgent, patterns of low-severity findings can indicate an ongoing attack.

### No Practiced Incident Response

Having runbooks isn't enough—teams need to practice. Tabletop exercises reveal gaps in procedures, unclear responsibilities, and missing capabilities. Practice before you need to respond for real.

### Over-Automating Without Safeguards

Automation is powerful but dangerous. Automatically terminating instances based on findings might terminate production systems due to false positives. Start with conservative automated responses (notify, isolate) and add more aggressive actions only with confidence.

### Forgetting Post-Incident Review

After an incident is resolved, there's pressure to move on. But post-incident review is where you learn. What could you have detected earlier? What made response slower than it should have been? What process improvements are needed?

## Summary

Threat detection and incident response in AWS requires multiple services working together:

| Service | Purpose | When to Use |
|---------|---------|-------------|
| GuardDuty | Threat detection | Enable everywhere, always |
| Security Hub | Aggregation and posture | Centralize all security findings |
| Detective | Investigation | Deep dive into GuardDuty findings |
| Inspector | Vulnerability scanning | Continuous vulnerability assessment |
| Macie | Data discovery | Identify sensitive data exposure |

Key principles:

- **Assume breach**: Focus on detection, not just prevention
- **Reduce dwell time**: The faster you detect, the less damage attackers can do
- **Centralize visibility**: Aggregate findings in Security Hub
- **Prepare before incidents**: Practice response procedures regularly
- **Preserve evidence**: Forensic snapshots before containment actions
- **Automate wisely**: Start conservative, increase automation with confidence
- **Learn from incidents**: Post-incident review drives continuous improvement

Threat detection is about reducing the time attackers have in your environment. Incident response is about minimizing damage when threats are detected. Both require preparation, practice, and the right tools. AWS provides the tools—building effective detection and response capability is your responsibility.

## References

- [Amazon GuardDuty User Guide](https://docs.aws.amazon.com/guardduty/latest/ug/)
- [AWS Security Hub User Guide](https://docs.aws.amazon.com/securityhub/latest/userguide/)
- [Amazon Detective User Guide](https://docs.aws.amazon.com/detective/latest/userguide/)
- [AWS Security Incident Response Guide](https://docs.aws.amazon.com/whitepapers/latest/aws-security-incident-response-guide/welcome.html)
- Crane, Dylan. *AWS Security*. Manning Publications, 2022.
- Muñoz, Mauricio, et al. *Mastering AWS Security, 2nd Edition*. Packt, 2024.
