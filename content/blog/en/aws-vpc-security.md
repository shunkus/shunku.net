---
title: "AWS VPC Security: Security Groups, NACLs, and Network Protection"
date: "2025-11-11"
excerpt: "Master AWS VPC security - understand Security Groups vs NACLs, VPC Endpoints, Network Firewall, and defense-in-depth strategies."
tags: ["AWS", "Security", "VPC", "Networking", "Certification"]
author: "Shunku"
---

AWS Virtual Private Cloud (VPC) is your private network within AWS. Understanding VPC security is critical because the network layer is often your first line of defense against threats—and your last line of defense when other controls fail.

## Why VPC Security Matters

In a traditional data center, physical network boundaries provide implicit security. Servers on different network segments cannot communicate unless explicitly connected. The network perimeter—firewalls, routers, switches—provides a natural chokepoint for security controls.

In the cloud, these physical boundaries don't exist in the same way. All of AWS shares the same underlying infrastructure. Your VPC creates a logical boundary, but you must explicitly configure that boundary's security. Without proper VPC security:

- Resources in your VPC could be accessible from the internet when they shouldn't be
- Internal resources could communicate with each other without restriction
- Compromised instances could pivot to attack other resources
- Data could leave your network without detection

VPC security is about creating and enforcing the network boundaries that protect your workloads.

## Understanding VPCs: Your Private Network

A VPC is a logically isolated section of AWS where you launch resources. Think of it as your own private data center in the cloud, but with complete control over:

- **IP Address Range**: You define the CIDR block (e.g., 10.0.0.0/16)
- **Subnets**: Divide your VPC into segments, each in a specific Availability Zone
- **Routing**: Control how traffic flows between subnets and to/from the internet
- **Gateways**: Define entry and exit points for internet, VPN, and peered VPC traffic

### Public vs. Private Subnets

The fundamental network security design pattern in AWS is separating public and private subnets:

**Public Subnets** have a route to an Internet Gateway. Resources here can receive traffic directly from the internet (if security groups allow). Use public subnets for:
- Load balancers that receive user traffic
- Bastion hosts for administrative access
- NAT Gateways (to provide outbound internet access for private subnets)

**Private Subnets** have no direct route to the internet. Resources here are protected from direct internet access. Use private subnets for:
- Application servers
- Databases
- Internal services
- Any resource that doesn't need to receive traffic from the internet

This design ensures that even if someone knows the private IP of your database server, they cannot reach it from the internet—there's simply no route.

## Security Groups: Your Instance-Level Firewall

Security Groups are virtual firewalls that control traffic at the instance (ENI) level. They're the most commonly used network security control in AWS.

### Key Characteristics

**Stateful**: If you allow traffic in one direction, the response is automatically allowed in the other direction. If you create an inbound rule allowing HTTPS, the response traffic is permitted without an explicit outbound rule.

**Allow-Only**: Security groups can only allow traffic—they cannot explicitly deny. If traffic doesn't match any allow rule, it's denied.

**All Rules Evaluated**: Unlike NACLs, all security group rules are evaluated before deciding. If any rule allows the traffic, it's permitted.

**Instance-Level**: Each instance can have multiple security groups. The effective rules are the union of all attached security groups.

### Why Stateful Matters

The stateful nature of security groups dramatically simplifies configuration. Consider a web server:

- **Inbound rule**: Allow TCP 443 from anywhere
- **Outbound rule**: (Default allows all)

When a client connects on port 443, the server responds from an ephemeral port (e.g., 49152). Because security groups are stateful, this response is automatically allowed—you don't need to explicitly allow outbound traffic on ephemeral ports.

### Security Group Referencing

One of the most powerful security group features is referencing other security groups instead of IP ranges. This enables patterns like:

- Allow database access only from application servers (not by IP, but by security group membership)
- Allow load balancer health checks only from the load balancer's security group

This approach:
- **Scales automatically**: Add a new app server, it immediately has database access
- **Is more secure**: You can't accidentally allow the wrong IP
- **Survives IP changes**: Auto-scaling, instance replacement—no rule updates needed

### Common Security Group Mistakes

**Opening 0.0.0.0/0 for SSH/RDP**: This allows administrative access from anywhere on the internet. Attackers constantly scan for these open ports. Instead, use Systems Manager Session Manager, bastion hosts with restricted access, or VPN.

**Using "-1" Protocol (All Traffic)**: This allows all protocols and ports. It's rarely what you actually need and dramatically increases attack surface.

**Not Using Security Group References**: Hardcoding IP addresses means manual updates when infrastructure changes and potential security gaps during transitions.

## Network ACLs: Your Subnet-Level Firewall

Network Access Control Lists (NACLs) operate at the subnet level, filtering traffic entering and leaving subnets.

### Key Characteristics

**Stateless**: Unlike security groups, NACLs don't track connections. You must explicitly allow both inbound and outbound traffic—including response traffic.

**Allow and Deny**: NACLs can explicitly deny traffic, which security groups cannot.

**Ordered Rule Evaluation**: Rules are evaluated in order (lowest rule number first). The first matching rule is applied, and evaluation stops.

**Subnet-Level**: All traffic entering or leaving the subnet passes through the NACL.

### Why Stateless Matters

Because NACLs are stateless, you must account for response traffic. For a web server allowing HTTPS:

**Inbound rules needed**:
- Allow TCP 443 from anywhere (client requests)
- Allow TCP 1024-65535 from anywhere (responses to outbound requests)

**Outbound rules needed**:
- Allow TCP 1024-65535 to anywhere (responses to inbound requests)
- Allow TCP 443 to anywhere (outbound HTTPS requests)

The ephemeral port range (1024-65535) is necessary because responses use high-numbered ports. This is more complex than security groups but provides additional control.

### When to Use NACLs

NACLs shine when you need capabilities security groups lack:

**Explicit Deny Rules**: Block known bad IP addresses at the subnet boundary, even if a security group would allow them.

**Subnet-Level Control**: Apply consistent rules to all resources in a subnet, regardless of their individual security group configurations.

**Defense in Depth**: Provide an additional layer of protection. Even if a security group is misconfigured, the NACL can provide a safety net.

**Compliance Requirements**: Some compliance frameworks require explicit deny capabilities or subnet-level logging.

### Security Groups vs. NACLs

| Aspect | Security Group | NACL |
|--------|---------------|------|
| Level | Instance/ENI | Subnet |
| State | Stateful | Stateless |
| Rules | Allow only | Allow and Deny |
| Evaluation | All rules, union | Ordered, first match |
| Default | Deny all inbound, allow all outbound | Allow all |
| Common Use | Primary access control | Additional blocking, compliance |

In practice, most organizations use security groups as their primary control and NACLs for additional defense-in-depth or specific blocking requirements.

## VPC Endpoints: Keeping AWS Traffic Private

When resources in your VPC access AWS services (S3, DynamoDB, Secrets Manager), by default that traffic goes over the internet. VPC Endpoints keep this traffic entirely within the AWS network.

### Why This Matters

**Security**: Traffic that never leaves the AWS network cannot be intercepted on the public internet.

**Compliance**: Some compliance frameworks require data to stay within private networks.

**Cost**: Data transfer through VPC endpoints can be cheaper than internet egress.

**Reliability**: You're not dependent on internet connectivity to reach AWS services.

### Gateway Endpoints vs. Interface Endpoints

**Gateway Endpoints** (S3 and DynamoDB only):
- Appear as route table entries
- No per-hour charge
- Limited to S3 and DynamoDB
- Use endpoint policies for access control

**Interface Endpoints** (most other AWS services):
- Create ENIs in your subnets
- Hourly charge + data processing
- Support most AWS services and third-party PrivateLink services
- Use security groups + endpoint policies for access control
- Support private DNS (service endpoints resolve to private IPs)

### Endpoint Policies

Both endpoint types support policies that restrict what can be accessed through the endpoint:

- Restrict to specific S3 buckets
- Allow only certain API actions
- Require conditions (source VPC, IAM principal)

This enables patterns like: "Resources in this VPC can only access our company's S3 buckets, not any arbitrary bucket."

## AWS Network Firewall: Deep Packet Inspection

Network Firewall provides stateful inspection, intrusion detection and prevention, and domain filtering at the VPC level.

### When You Need Network Firewall

- **Compliance requirements** mandate IDS/IPS capabilities
- You need to **inspect encrypted traffic** (with TLS inspection)
- You want to **filter by domain name** (allow only *.amazonaws.com)
- You need **centralized network security** across multiple VPCs
- You require **Suricata-compatible rules** for custom detection

### How It Works

Network Firewall deploys managed endpoints in your subnets. You route traffic through these endpoints using route tables. The firewall inspects traffic and applies rules:

**Stateless Rules**: Simple packet filtering (source/destination IP and port). Evaluated first, can pass traffic to stateful rules or drop/forward immediately.

**Stateful Rules**: Connection-aware inspection. Can use domain lists, Suricata rules, or standard 5-tuple rules.

**Domain Filtering**: Allow or block traffic based on HTTP Host header or TLS SNI (Server Name Indication).

### Network Firewall vs. Security Groups/NACLs

Network Firewall provides capabilities that security groups and NACLs cannot:

- **Domain-based filtering**: Allow traffic to *.amazonaws.com but not arbitrary domains
- **IDS/IPS**: Detect and block known attack patterns
- **Centralized management**: Apply consistent rules across multiple VPCs
- **Detailed logging**: Log full traffic details, not just accept/reject

The cost is significant ($0.395/hour per endpoint plus data processing), so it's typically used for compliance requirements or high-security environments rather than general use.

## AWS WAF: Application Layer Protection

Web Application Firewall (WAF) operates at layer 7 (HTTP/HTTPS), protecting web applications from common exploits.

### What WAF Protects Against

- **SQL Injection**: Malicious SQL in request parameters
- **Cross-Site Scripting (XSS)**: Script injection attacks
- **Common Exploits**: Known vulnerabilities in common software
- **Bot Traffic**: Automated attacks and scraping
- **Rate-Based Attacks**: Too many requests from single sources

### AWS Managed Rules

AWS provides managed rule sets maintained by AWS security researchers:

- **Core Rule Set (CRS)**: General protection against common threats
- **SQL Injection Rules**: Detect SQLi patterns
- **Known Bad Inputs**: Block requests with known malicious patterns
- **Admin Protection**: Protect administrative endpoints
- **Bot Control**: Identify and manage bot traffic

These rules are updated by AWS as new threats emerge—you don't need to maintain them yourself.

### Where WAF Applies

WAF protects:
- CloudFront distributions
- Application Load Balancers
- API Gateway REST APIs
- AppSync GraphQL APIs
- Cognito User Pools

WAF doesn't protect resources directly—it protects the entry points through which traffic reaches your resources.

## AWS Shield: DDoS Protection

Shield protects against Distributed Denial of Service (DDoS) attacks that attempt to overwhelm your resources with traffic.

### Shield Standard (Free)

All AWS customers automatically receive Shield Standard protection:
- Protects against common layer 3/4 attacks
- Always-on detection and automatic mitigation
- No action required—it's automatic

### Shield Advanced ($3,000/month + data transfer)

For applications requiring stronger protection:
- Enhanced detection and mitigation for larger, more sophisticated attacks
- Protection for Elastic IPs, CloudFront, Route 53, Global Accelerator, ALB, NLB
- 24/7 access to the DDoS Response Team (DRT)
- Cost protection (AWS credits for scaling costs during attacks)
- AWS WAF at no additional cost for protected resources
- Detailed attack visibility and post-attack analysis

Shield Advanced makes sense for business-critical applications where downtime costs exceed the Shield Advanced subscription.

## VPC Flow Logs: Network Visibility

Flow Logs capture metadata about network traffic in your VPC—essential for security monitoring, troubleshooting, and compliance.

### What Flow Logs Capture

For each network flow, logs record:
- Source and destination IP addresses
- Source and destination ports
- Protocol
- Packet and byte counts
- Action (ACCEPT or REJECT)
- Interface, subnet, and VPC identifiers

### What Flow Logs Don't Capture

- Packet payloads (only metadata)
- DNS queries to Route 53 Resolver
- Traffic to/from instance metadata service
- DHCP traffic
- Traffic to the reserved IP addresses in a subnet

### Using Flow Logs for Security

**Detect Anomalies**: Identify unexpected traffic patterns, connections to known bad IPs, or unusual port usage.

**Investigate Incidents**: When a security event occurs, flow logs show what communications happened.

**Verify Segmentation**: Confirm that traffic between subnets matches your expected patterns.

**Compliance Evidence**: Demonstrate that network controls are working as designed.

Flow logs can be sent to CloudWatch Logs (for real-time analysis) or S3 (for long-term storage and Athena queries).

## Defense in Depth: Layered Security

Effective VPC security uses multiple layers of controls. Each layer provides protection if another fails:

```
Layer 1: Edge (Internet-Facing)
├── AWS Shield (DDoS protection)
├── AWS WAF (Application protection)
└── CloudFront (CDN with security features)
         │
         ▼
Layer 2: VPC Perimeter
├── Internet Gateway (entry point)
├── Network Firewall (deep inspection)
└── VPC Endpoints (private AWS access)
         │
         ▼
Layer 3: Subnet
├── Network ACLs (stateless filtering)
└── Route Tables (traffic control)
         │
         ▼
Layer 4: Instance
├── Security Groups (stateful filtering)
└── Host-based controls (OS firewalls)
         │
         ▼
Layer 5: Data
├── Encryption in transit
└── Application-level controls
```

### Why Layers Matter

**No Single Point of Failure**: If a security group is misconfigured, NACLs might still block the traffic.

**Different Capabilities**: Each layer provides capabilities others lack (e.g., NACLs can deny, WAF understands HTTP).

**Defense Against Different Threats**: DDoS protection at the edge, SQL injection protection at the application layer.

**Compliance Requirements**: Many frameworks require multiple layers of network controls.

## Summary

VPC security is about creating and enforcing network boundaries:

| Control | Level | Purpose |
|---------|-------|---------|
| Security Groups | Instance | Primary access control (stateful, allow-only) |
| NACLs | Subnet | Additional control (stateless, allow/deny) |
| VPC Endpoints | VPC | Private AWS service access |
| Network Firewall | VPC | Deep inspection, IDS/IPS |
| WAF | Application | HTTP/HTTPS protection |
| Shield | Edge | DDoS protection |
| Flow Logs | VPC | Network visibility and audit |

Key principles:
- **Least Privilege**: Only allow traffic that's explicitly needed
- **Private by Default**: Use private subnets, VPC endpoints
- **Defense in Depth**: Multiple layers of controls
- **Visibility**: Enable flow logs, monitor traffic patterns
- **Segmentation**: Separate tiers (web, app, database) into different subnets/security groups

Network security is often invisible when working—and catastrophically visible when failing. Investing in proper VPC security design prevents incidents before they happen.

## References

- [VPC Security](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Security.html)
- [Security Groups](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html)
- [Network ACLs](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html)
- [AWS Network Firewall](https://docs.aws.amazon.com/network-firewall/)
- Crane, Dylan. *AWS Security*. Manning Publications, 2022.
- Muñoz, Mauricio, et al. *Mastering AWS Security, 2nd Edition*. Packt, 2024.
