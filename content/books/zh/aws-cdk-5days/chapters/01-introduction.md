---
title: 开始 - 欢迎来到AWS CDK的世界
order: 1
---

# 开始 - 欢迎来到AWS CDK的世界

## 关于本书

本书旨在通过5天时间学习AWS Cloud Development Kit (AWS CDK)，并掌握实用的基础设施管理技能。

### 目标读者

- 具备AWS基础知识的人员
- 有编程经验（特别是TypeScript/JavaScript）的人员
- 对基础设施即代码(IaC)感兴趣的人员
- 希望摆脱手动基础设施管理的人员

### 学习目标

完成本书学习后，您将能够：

1. 理解AWS CDK的基本概念并设置环境
2. 使用CDK创建和管理基本的AWS资源
3. 创建可重用的组件(Construct)
4. 与测试和CI/CD管道集成
5. 安全地部署到生产环境

## 什么是AWS CDK？

AWS Cloud Development Kit (AWS CDK) 是一个开源框架，用于使用编程语言定义云应用程序资源。

### 与传统方法的区别

#### 传统CloudFormation
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

#### AWS CDK (TypeScript)
```typescript
import * as s3 from 'aws-cdk-lib/aws-s3';

const bucket = new s3.Bucket(this, 'MyBucket', {
  bucketName: 'my-app-bucket-12345',
  versioned: true,
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL
});
```

### AWS CDK的特点

1. **利用编程语言的强大功能**
   - 可以使用条件语句、循环、函数等
   - 利用IDE的自动完成和重构功能
   - 应用现有的编程技能

2. **可重用性和模块化**
   - 创建和重用自定义Construct
   - 可作为npm包共享
   - 在组织内标准化最佳实践

3. **类型安全**
   - 在编译时检测错误
   - 属性自动完成和验证
   - 文档化的API

4. **与CloudFormation的兼容性**
   - 最终生成CloudFormation模板
   - 可与现有CloudFormation资源集成
   - 可使用CloudFormation的所有功能

## 学习进度安排

### 5天学习计划

| 天数 | 主题 | 内容 |
|------|------|------|
| 第1天 | 基础和设置 | CDK基本概念、环境构建、初次部署 |
| 第2天 | 核心Construct和Stack | 创建基本AWS资源、Stack管理 |
| 第3天 | 高级Construct和模式 | 自定义Construct、设计模式 |
| 第4天 | 测试和CI/CD | 单元测试、集成测试、CI/CD管道 |
| 第5天 | 最佳实践和生产部署 | 安全、监控、生产运营 |

### 先决知识检查

开始之前，请确认您具备以下知识：

#### AWS基础知识
- EC2、S3、Lambda、RDS等基本服务
- IAM基本概念（角色、策略）
- VPC和网络基础

#### 编程知识
- TypeScript/JavaScript基本语法
- npm/yarn使用经验
- 基本Git操作

#### 开发环境
- Node.js 18.x以上
- 任意IDE或编辑器（推荐VS Code）
- AWS CLI
- Git

## 本书结构

每章结构如下：

1. **概述** - 当天学习内容的概述
2. **理论** - 基本概念和理论背景
3. **实践** - 通过编写实际代码学习
4. **练习** - 加深理解的任务
5. **总结** - 当天学习内容的回顾

## 关于示例项目

本书将逐步构建Web应用程序，如下所示：

1. **第1天**：静态网站 (S3 + CloudFront)
2. **第2天**：无服务器API (Lambda + API Gateway)
3. **第3天**：数据库集成 (DynamoDB)
4. **第4天**：CI/CD管道
5. **第5天**：监控和警报

### 架构预览

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

## 下一步

准备好后，请进入第1天"AWS CDK环境搭建和第一步"。

通过编写实际代码学习，您将体验到AWS CDK的强大和便利。

---

**注意**：运行本书示例代码时可能产生AWS使用费用。建议在AWS免费套餐范围内进行实践。另外，请务必删除不再需要的资源。