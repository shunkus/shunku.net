---
title: Jour 1 - Configuration de l'environnement AWS CDK et premiers pas
order: 2
---

# Jour 1 - Configuration de l'environnement AWS CDK et premiers pas

## Objectifs du jour

1. Configurer l'environnement de développement AWS CDK
2. Créer votre premier projet CDK
3. Déployer un simple bucket S3
4. Comprendre les commandes de base CDK

## 1. Configuration de l'environnement

### 1.1 Vérification de l'installation Node.js

AWS CDK fonctionne sur Node.js. Vérifions d'abord la version actuelle.

```bash
node --version
npm --version
```

Node.js 18.x ou supérieur est requis. Si ce n'est pas installé, téléchargez depuis le [site officiel Node.js](https://nodejs.org/).

### 1.2 Configuration d'AWS CLI

AWS CDK utilise AWS CLI pour communiquer avec votre compte AWS.

```bash
# Vérifier la version d'AWS CLI
aws --version

# Configurer les informations d'identification AWS
aws configure
```

Entrez les informations suivantes :
- AWS Access Key ID
- AWS Secret Access Key  
- Nom de région par défaut (ex: eu-west-1)
- Format de sortie par défaut (json recommandé)

### 1.3 Installation d'AWS CDK

Installez AWS CDK globalement.

```bash
npm install -g aws-cdk
```

Après l'installation, vérifiez la version.

```bash
cdk --version
```

### 1.4 Bootstrap CDK

Avant d'utiliser CDK, vous devez exécuter bootstrap pour votre compte AWS et région.

```bash
cdk bootstrap
```

Ceci crée les ressources que CDK utilise, comme les buckets S3 et les rôles IAM.

## 2. Création de votre premier projet

### 2.1 Créer le répertoire du projet

```bash
mkdir ma-premiere-app-cdk
cd ma-premiere-app-cdk
```

### 2.2 Initialiser l'application CDK

Initialisez une nouvelle application CDK en utilisant le template TypeScript :

```bash
cdk init app --language typescript
```

Ceci crée la structure de projet suivante :

```
ma-premiere-app-cdk/
├── bin/
│   └── ma-premiere-app-cdk.ts     # Point d'entrée de l'app
├── lib/
│   └── ma-premiere-app-cdk-stack.ts # Définition du Stack
├── test/
│   └── ma-premiere-app-cdk.test.ts  # Tests unitaires
├── cdk.json                        # Configuration CDK
├── package.json                    # Dépendances npm
└── tsconfig.json                   # Configuration TypeScript
```

### 2.3 Installer les dépendances

```bash
npm install
```

## 3. Comprendre la structure de base

### 3.1 Point d'entrée de l'app (bin/ma-premiere-app-cdk.ts)

```typescript
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MaPremiereAppCdkStack } from '../lib/ma-premiere-app-cdk-stack';

const app = new cdk.App();
new MaPremiereAppCdkStack(app, 'MaPremiereAppCdkStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
```

### 3.2 Définition du Stack (lib/ma-premiere-app-cdk-stack.ts)

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class MaPremiereAppCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Vos ressources seront définies ici
  }
}
```

## 4. Création de votre premier bucket S3

### 4.1 Modifier le Stack pour ajouter un bucket S3

Modifiez `lib/ma-premiere-app-cdk-stack.ts` :

```typescript
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class MaPremiereAppCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Créer un bucket S3
    const bucket = new s3.Bucket(this, 'MonPremierBucket', {
      bucketName: 'mon-premier-bucket-cdk-' + Math.random().toString(36).substring(7),
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // Sortie du nom du bucket
    new cdk.CfnOutput(this, 'NomDuBucket', {
      value: bucket.bucketName,
      description: 'Le nom du bucket S3',
    });
  }
}
```

### 4.2 Explication des propriétés clés

- **bucketName** : Nom unique du bucket (avec suffixe aléatoire)
- **versioned** : Activer le versioning des objets
- **removalPolicy** : Que faire quand le stack est supprimé (DESTROY permet la suppression)
- **blockPublicAccess** : Paramètre de sécurité pour bloquer tout accès public

## 5. Commandes CDK

### 5.1 Synthétiser le template CloudFormation

```bash
cdk synth
```

Ceci génère le template CloudFormation et l'affiche. Vous pouvez voir comment votre code CDK se traduit en CloudFormation.

### 5.2 Comparer les changements

```bash
cdk diff
```

Affiche les différences entre votre stack actuel et le stack déployé.

### 5.3 Déployer le Stack

```bash
cdk deploy
```

Ceci déploie votre stack sur AWS. Vous serez invité à confirmer les changements avant le déploiement.

### 5.4 Lister tous les Stacks

```bash
cdk list
```

Affiche tous les stacks dans votre application CDK.

### 5.5 Détruire le Stack

```bash
cdk destroy
```

Supprime le stack et toutes ses ressources d'AWS.

## 6. Exercice : Créer plusieurs ressources

Essayez d'ajouter plus de ressources à votre stack :

### 6.1 Ajouter un autre bucket S3 avec hébergement web

```typescript
// Ajouter à votre stack
const bucketSiteWeb = new s3.Bucket(this, 'BucketSiteWeb', {
  bucketName: 'mon-site-web-bucket-' + Math.random().toString(36).substring(7),
  websiteIndexDocument: 'index.html',
  websiteErrorDocument: 'error.html',
  publicReadAccess: true,
  removalPolicy: cdk.RemovalPolicy.DESTROY,
});

new cdk.CfnOutput(this, 'URLSiteWeb', {
  value: bucketSiteWeb.bucketWebsiteUrl,
  description: 'URL du site web',
});
```

### 6.2 Déployer et tester

```bash
# Voir ce qui va être créé
cdk diff

# Déployer les changements
cdk deploy
```

Vérifiez la Console AWS pour voir vos ressources créées.

## 7. Meilleures pratiques pour le Jour 1

### 7.1 Conventions de nommage

- Utilisez des noms descriptifs pour les constructs
- Incluez l'environnement ou le but dans les noms de ressources
- Utilisez des modèles de nommage cohérents

### 7.2 Gestion des ressources

- Définissez toujours `removalPolicy` pour les ressources de développement
- Utilisez `blockPublicAccess` pour les buckets S3 sauf si l'accès public est nécessaire
- Ajoutez des sorties significatives pour les propriétés importantes des ressources

### 7.3 Organisation du code

- Gardez les fichiers de stack focalisés et pas trop volumineux
- Utilisez des commentaires pour expliquer les configurations complexes
- Suivez les meilleures pratiques TypeScript

## 8. Résolution des problèmes courants

### 8.1 Problèmes de Bootstrap

Si bootstrap échoue :
```bash
# Vérifier les informations d'identification AWS
aws sts get-caller-identity

# Essayer bootstrap avec région explicite
cdk bootstrap aws://NUMERO-COMPTE/REGION
```

### 8.2 Conflits de nom de bucket

Les noms de bucket S3 doivent être globalement uniques. Si le déploiement échoue :
- Utilisez des suffixes aléatoires comme montré dans les exemples
- Incluez un horodatage ou un ID de compte dans les noms de bucket

### 8.3 Problèmes de permissions

Assurez-vous que votre utilisateur AWS a les permissions suffisantes :
- Accès complet CloudFormation
- Permissions IAM pour créer des rôles
- Permissions pour les services que vous utilisez (S3, Lambda, etc.)

## Résumé

Aujourd'hui vous avez appris :

1. ✅ Configurer l'environnement de développement AWS CDK
2. ✅ Créé votre premier projet CDK
3. ✅ Déployé un bucket S3 en utilisant CDK
4. ✅ Compris les commandes de base CDK et le workflow

### Concepts clés couverts

- **CDK Bootstrap** : Configuration unique pour CDK dans votre compte AWS
- **Constructs** : Blocs de construction des applications CDK
- **Stacks** : Unités de déploiement dans CDK
- **Synthesis** : Conversion du code CDK en templates CloudFormation

### Prochaines étapes

Demain (Jour 2), nous approfondirons les constructs CDK et explorerons plus de services AWS comme Lambda et API Gateway.

---

**Solution de l'exercice :**

Stack complet avec plusieurs ressources :

```typescript
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class MaPremiereAppCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Bucket privé pour stockage de données
    const bucketDonnees = new s3.Bucket(this, 'BucketDonnees', {
      bucketName: 'mes-donnees-bucket-' + Math.random().toString(36).substring(7),
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // Bucket public pour hébergement de site web
    const bucketSiteWeb = new s3.Bucket(this, 'BucketSiteWeb', {
      bucketName: 'mon-site-web-bucket-' + Math.random().toString(36).substring(7),
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'error.html',
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Sorties
    new cdk.CfnOutput(this, 'NomBucketDonnees', {
      value: bucketDonnees.bucketName,
      description: 'Nom du bucket de données privé',
    });

    new cdk.CfnOutput(this, 'URLSiteWeb', {
      value: bucketSiteWeb.bucketWebsiteUrl,
      description: 'URL du site web',
    });
  }
}
```