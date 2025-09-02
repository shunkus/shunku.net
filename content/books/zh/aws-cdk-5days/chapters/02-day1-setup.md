---
title: 第1天 - AWS CDK环境搭建与初步实践
order: 2
---

# 第1天 - AWS CDK环境搭建与初步实践

## 今日目标

1. 搭建AWS CDK开发环境
2. 创建您的第一个CDK项目
3. 部署一个简单的S3存储桶
4. 掌握基本CDK命令

## 1. 环境搭建

### 1.1 Node.js安装检查

AWS CDK基于Node.js运行。首先，让我们检查当前版本。

```bash
node --version
npm --version
```

需要Node.js 18.x或更高版本。如果未安装，请从[Node.js官网](https://nodejs.org/)下载。

### 1.2 AWS CLI设置

AWS CDK使用AWS CLI与您的AWS账户进行通信。

```bash
# 检查AWS CLI版本
aws --version

# 配置AWS凭证
aws configure
```

输入以下信息：
- AWS Access Key ID（AWS访问密钥ID）
- AWS Secret Access Key（AWS秘密访问密钥）  
- Default region name（默认区域名称，例如：ap-northeast-1）
- Default output format（默认输出格式，推荐json）

### 1.3 AWS CDK安装

全局安装AWS CDK。

```bash
npm install -g aws-cdk
```

安装完成后，检查版本。

```bash
cdk --version
```

### 1.4 CDK Bootstrap引导

在使用CDK之前，需要对您的AWS账户和区域运行bootstrap引导。

```bash
cdk bootstrap
```

这会创建CDK所需的资源，如S3存储桶和IAM角色。

## 2. 创建您的第一个项目

### 2.1 创建项目目录

```bash
mkdir my-first-cdk-app
cd my-first-cdk-app
```

### 2.2 初始化CDK应用程序

使用TypeScript模板初始化新的CDK应用：

```bash
cdk init app --language typescript
```

这会创建以下项目结构：

```
my-first-cdk-app/
├── bin/
│   └── my-first-cdk-app.ts     # 应用程序入口点
├── lib/
│   └── my-first-cdk-app-stack.ts # 堆栈定义
├── test/
│   └── my-first-cdk-app.test.ts  # 单元测试
├── cdk.json                     # CDK配置
├── package.json                 # npm依赖
└── tsconfig.json               # TypeScript配置
```

### 2.3 安装依赖

```bash
npm install
```

## 3. 理解基本结构

### 3.1 应用入口点（bin/my-first-cdk-app.ts）

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

### 3.2 堆栈定义（lib/my-first-cdk-app-stack.ts）

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class MyFirstCdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 您的资源将在这里定义
  }
}
```

## 4. 创建您的第一个S3存储桶

### 4.1 修改堆栈以添加S3存储桶

编辑`lib/my-first-cdk-app-stack.ts`：

```typescript
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class MyFirstCdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 创建S3存储桶
    const bucket = new s3.Bucket(this, 'MyFirstBucket', {
      bucketName: 'my-first-cdk-bucket-' + Math.random().toString(36).substring(7),
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // 输出存储桶名称
    new cdk.CfnOutput(this, 'BucketName', {
      value: bucket.bucketName,
      description: 'S3存储桶的名称',
    });
  }
}
```

### 4.2 关键属性说明

- **bucketName**: 唯一的存储桶名称（带随机后缀）
- **versioned**: 启用对象版本控制
- **removalPolicy**: 堆栈删除时的处理方式（DESTROY允许删除）
- **blockPublicAccess**: 安全设置，阻止所有公共访问

## 5. CDK命令

### 5.1 合成CloudFormation模板

```bash
cdk synth
```

这会生成CloudFormation模板并显示它。您可以看到CDK代码如何转换为CloudFormation。

### 5.2 比较更改

```bash
cdk diff
```

显示当前堆栈与已部署堆栈之间的差异。

### 5.3 部署堆栈

```bash
cdk deploy
```

这会将您的堆栈部署到AWS。部署前会提示您确认更改。

### 5.4 列出所有堆栈

```bash
cdk list
```

显示CDK应用中的所有堆栈。

### 5.5 销毁堆栈

```bash
cdk destroy
```

从AWS删除堆栈及其所有资源。

## 6. 练习：创建多个资源

尝试向您的堆栈添加更多资源：

### 6.1 添加另一个S3存储桶用于网站托管

```typescript
// 添加到您的堆栈中
const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
  bucketName: 'my-website-bucket-' + Math.random().toString(36).substring(7),
  websiteIndexDocument: 'index.html',
  websiteErrorDocument: 'error.html',
  publicReadAccess: true,
  removalPolicy: cdk.RemovalPolicy.DESTROY,
});

new cdk.CfnOutput(this, 'WebsiteURL', {
  value: websiteBucket.bucketWebsiteUrl,
  description: '网站URL',
});
```

### 6.2 部署和测试

```bash
# 查看将要创建的内容
cdk diff

# 部署更改
cdk deploy
```

检查AWS控制台以查看您创建的资源。

## 7. 第1天的最佳实践

### 7.1 命名约定

- 为构造使用描述性名称
- 在资源名称中包含环境或用途
- 使用一致的命名模式

### 7.2 资源管理

- 始终为开发资源设置`removalPolicy`
- 除非需要公共访问，否则对S3存储桶使用`blockPublicAccess`
- 为重要资源属性添加有意义的输出

### 7.3 代码组织

- 保持堆栈文件专注且不要太大
- 使用注释解释复杂配置
- 遵循TypeScript最佳实践

## 8. 常见问题故障排除

### 8.1 Bootstrap问题

如果bootstrap失败：
```bash
# 检查AWS凭证
aws sts get-caller-identity

# 尝试使用明确区域进行bootstrap
cdk bootstrap aws://ACCOUNT-NUMBER/REGION
```

### 8.2 存储桶名称冲突

S3存储桶名称必须全局唯一。如果部署失败：
- 如示例中所示使用随机后缀
- 在存储桶名称中包含时间戳或账户ID

### 8.3 权限问题

确保您的AWS用户具有足够的权限：
- CloudFormation完全访问权限
- 创建角色的IAM权限
- 您正在使用的服务的权限（S3、Lambda等）

## 总结

今天您学到了：

1. ✅ 搭建AWS CDK开发环境
2. ✅ 创建了您的第一个CDK项目
3. ✅ 使用CDK部署了S3存储桶
4. ✅ 了解了基本CDK命令和工作流

### 涵盖的关键概念

- **CDK Bootstrap**: 在AWS账户中进行CDK一次性设置
- **构造（Constructs）**: CDK应用程序的构建块
- **堆栈（Stacks）**: CDK中的部署单元
- **合成（Synthesis）**: 将CDK代码转换为CloudFormation模板

### 下一步

明天（第2天），我们将深入了解CDK构造，探索更多AWS服务，如Lambda和API Gateway。

---

**练习解决方案：**

包含多个资源的完整堆栈：

```typescript
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class MyFirstCdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 用于数据存储的私有存储桶
    const dataBucket = new s3.Bucket(this, 'DataBucket', {
      bucketName: 'my-data-bucket-' + Math.random().toString(36).substring(7),
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // 用于网站托管的公共存储桶
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: 'my-website-bucket-' + Math.random().toString(36).substring(7),
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'error.html',
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // 输出
    new cdk.CfnOutput(this, 'DataBucketName', {
      value: dataBucket.bucketName,
      description: '私有数据存储桶的名称',
    });

    new cdk.CfnOutput(this, 'WebsiteURL', {
      value: websiteBucket.bucketWebsiteUrl,
      description: '网站URL',
    });
  }
}
```