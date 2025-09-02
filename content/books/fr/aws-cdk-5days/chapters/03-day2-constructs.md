---
title: Jour 2 - Comprendre les Constructs de base et les Stacks
order: 3
---

# Jour 2 - Comprendre les Constructs de base et les Stacks

## Objectifs du jour

1. Comprendre la structure hiérarchique des Construct, Stack et App
2. Combiner plusieurs services AWS
3. Construire les fondations d'une application web serverless
4. Apprendre la gestion de configuration spécifique à l'environnement

## 1. Structure à trois couches de CDK

### 1.1 Comprendre la hiérarchie des Constructs

CDK fournit trois niveaux de Constructs :

#### Constructs L1 (Ressources CFN)
- Wrappers directs autour des ressources CloudFormation
- Préfixés avec `Cfn`
- Contrôle le plus granulaire possible, mais configuration complexe

```typescript
import * as cdk from 'aws-cdk-lib';

// Exemple de Construct L1
const cfnBucket = new cdk.aws_s3.CfnBucket(this, 'L1Bucket', {
  bucketName: 'mon-bucket-l1',
  versioningConfiguration: {
    status: 'Enabled'
  }
});
```

#### Constructs L2 (Constructs AWS)
- Wrappers de haut niveau pour les services AWS
- Fournissent des valeurs par défaut sensées
- Les plus couramment utilisés

```typescript
import * as s3 from 'aws-cdk-lib/aws-s3';

// Exemple de Construct L2
const bucket = new s3.Bucket(this, 'L2Bucket', {
  versioned: true,
  bucketName: 'mon-bucket-l2'
});
```

#### Constructs L3 (Modèles)
- Modèles combinant plusieurs services AWS
- Incorporent les meilleures pratiques
- Conçus pour des cas d'usage spécifiques

```typescript
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

// Exemple de Construct L3
new s3deploy.BucketDeployment(this, 'DeployerSiteWeb', {
  sources: [s3deploy.Source.asset('./site-web')],
  destinationBucket: bucket
});
```

## 2. Pratique : Construire un site web statique

Étendons le projet d'hier pour construire un site web statique en utilisant CloudFront.

### 2.1 Mise à jour de l'implémentation du Stack

Mettez à jour `lib/ma-premiere-app-cdk-stack.ts` :

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

export class MaPremiereAppCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Bucket S3 pour hébergement de site web statique
    const bucketSiteWeb = new s3.Bucket(this, 'BucketSiteWeb', {
      bucketName: `mon-site-web-bucket-${Date.now()}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // Accès uniquement via CloudFront
    });

    // Origin Access Identity pour CloudFront
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OAI', {
      comment: 'OAI pour mon site web'
    });

    // Accorder l'accès CloudFront au bucket S3
    bucketSiteWeb.grantRead(originAccessIdentity);

    // Distribution CloudFront
    const distribution = new cloudfront.Distribution(this, 'DistributionSiteWeb', {
      defaultBehavior: {
        origin: new origins.S3Origin(bucketSiteWeb, {
          originAccessIdentity: originAccessIdentity
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 404,
          responsePagePath: '/erreur.html',
        }
      ]
    });

    // Déployer le contenu du site web
    new s3deploy.BucketDeployment(this, 'DeployerSiteWeb', {
      sources: [s3deploy.Source.asset('./site-web')],
      destinationBucket: bucketSiteWeb,
      distribution,
      distributionPaths: ['/*'],
    });

    // Sorties
    new cdk.CfnOutput(this, 'URLSiteWeb', {
      value: distribution.distributionDomainName,
      description: 'URL de distribution CloudFront',
    });

    new cdk.CfnOutput(this, 'IdDistribution', {
      value: distribution.distributionId,
      description: 'ID de distribution CloudFront',
    });
  }
}
```

### 2.2 Créer le contenu du site web

Créez un répertoire `site-web` à la racine de votre projet :

```bash
mkdir site-web
```

Créez `site-web/index.html` :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mon Site Web CDK</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        h1 {
            text-align: center;
            margin-bottom: 30px;
        }
        .fonctionnalite {
            margin: 20px 0;
            padding: 15px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Bienvenue sur mon site web CDK !</h1>
        <div class="fonctionnalite">
            <h3>🚀 Déployé avec AWS CDK</h3>
            <p>Ce site web est déployé en utilisant l'Infrastructure en tant que Code avec AWS CDK.</p>
        </div>
        <div class="fonctionnalite">
            <h3>☁️ Alimenté par CloudFront</h3>
            <p>Livraison de contenu globale rapide avec le CDN AWS CloudFront.</p>
        </div>
        <div class="fonctionnalite">
            <h3>📦 Stocké dans S3</h3>
            <p>Contenu statique stocké en sécurité dans Amazon S3.</p>
        </div>
        <div class="fonctionnalite">
            <h3>🔒 Sécurisé par défaut</h3>
            <p>Redirection HTTPS et Origin Access Identity pour la sécurité.</p>
        </div>
    </div>
</body>
</html>
```

Créez `site-web/erreur.html` :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page non trouvée</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container-erreur {
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 10px;
            backdrop-filter: blur(10px);
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="container-erreur">
        <h1>404 - Page non trouvée</h1>
        <p>La page que vous cherchez n'existe pas.</p>
        <a href="/" style="color: white;">Retourner à l'accueil</a>
    </div>
</body>
</html>
```

### 2.3 Déployer le site web

```bash
# Synthétiser pour vérifier le CloudFormation généré
cdk synth

# Déployer le stack
cdk deploy
```

Après le déploiement, vous recevrez une URL CloudFront que vous pourrez visiter pour voir votre site web.

## 3. Ajouter une API Lambda

Maintenant ajoutons une API serverless en utilisant Lambda et API Gateway.

### 3.1 Créer la fonction Lambda

Créez le répertoire `lambda` et ajoutez `bonjour.js` :

```bash
mkdir lambda
```

Créez `lambda/bonjour.js` :

```javascript
exports.handler = async (event) => {
    const response = {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        },
        body: JSON.stringify({
            message: 'Bonjour depuis Lambda CDK !',
            timestamp: new Date().toISOString(),
            requestId: event.requestContext?.requestId || 'inconnu'
        }),
    };
    return response;
};
```

### 3.2 Mettre à jour le Stack avec Lambda et API Gateway

Ajoutez ce qui suit à votre stack :

```typescript
// Ajoutez ces imports en haut
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

// Ajoutez ceci dans votre constructeur de stack, après la configuration CloudFront

// Fonction Lambda
const fonctionBonjour = new lambda.Function(this, 'FonctionBonjour', {
  runtime: lambda.Runtime.NODEJS_18_X,
  handler: 'bonjour.handler',
  code: lambda.Code.fromAsset('lambda'),
  timeout: cdk.Duration.seconds(30),
});

// API Gateway
const api = new apigateway.RestApi(this, 'ApiBonjour', {
  restApiName: 'Service Bonjour',
  description: 'Ce service traite les requêtes de bonjour.',
  defaultCorsPreflightOptions: {
    allowOrigins: apigateway.Cors.ALL_ORIGINS,
    allowMethods: apigateway.Cors.ALL_METHODS,
  },
});

const integrationBonjour = new apigateway.LambdaIntegration(fonctionBonjour);
api.root.addMethod('GET', integrationBonjour);

const ressourceBonjour = api.root.addResource('bonjour');
ressourceBonjour.addMethod('GET', integrationBonjour);

// Ajouter l'URL de l'API aux sorties
new cdk.CfnOutput(this, 'UrlApi', {
  value: api.url,
  description: 'URL d\'API Gateway',
});
```

### 3.3 Mettre à jour le site web pour appeler l'API

Mettez à jour `site-web/index.html` pour inclure l'intégration API :

```html
<!-- Ajoutez ce bouton après les fonctionnalités existantes -->
<div class="fonctionnalite">
    <h3>⚡ API Serverless</h3>
    <p>Cliquez sur le bouton pour tester notre API Lambda :</p>
    <button onclick="appellerApi()" style="padding: 10px 20px; margin: 10px 0; cursor: pointer;">
        Appeler l'API Lambda
    </button>
    <div id="reponse-api" style="margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 5px; display: none;">
    </div>
</div>

<script>
async function appellerApi() {
    const divReponse = document.getElementById('reponse-api');
    const urlApi = 'VOTRE_URL_API_ICI'; // Remplacez par l'URL API réelle après déploiement
    
    try {
        divReponse.style.display = 'block';
        divReponse.innerHTML = 'Chargement...';
        
        const response = await fetch(urlApi + '/bonjour');
        const data = await response.json();
        
        divReponse.innerHTML = `
            <h4>Réponse de l'API :</h4>
            <pre>${JSON.stringify(data, null, 2)}</pre>
        `;
    } catch (error) {
        divReponse.innerHTML = `
            <h4>Erreur :</h4>
            <p>${error.message}</p>
        `;
    }
}
</script>
```

### 3.4 Déployer et tester

```bash
cdk deploy
```

Après le déploiement, mettez à jour l'`urlApi` dans votre HTML avec l'URL API Gateway réelle de la sortie, puis redéployez :

```bash
cdk deploy
```

## 4. Gestion d'environnement

### 4.1 Configuration spécifique à l'environnement

Créez différentes configurations pour différents environnements :

```typescript
export interface ConfigEnvironnement {
  nomBucket: string;
  nomApi: string;
  activerLogging: boolean;
}

export const obtenirConfig = (environnement: string): ConfigEnvironnement => {
  switch (environnement) {
    case 'prod':
      return {
        nomBucket: 'mon-site-web-bucket-prod',
        nomApi: 'api-production',
        activerLogging: true,
      };
    case 'staging':
      return {
        nomBucket: 'mon-site-web-bucket-staging',
        nomApi: 'api-staging',
        activerLogging: true,
      };
    default:
      return {
        nomBucket: 'mon-site-web-bucket-dev',
        nomApi: 'api-dev',
        activerLogging: false,
      };
  }
};
```

### 4.2 Utiliser les variables d'environnement

Mettez à jour votre point d'entrée d'app :

```typescript
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MaPremiereAppCdkStack } from '../lib/ma-premiere-app-cdk-stack';

const app = new cdk.App();
const environnement = app.node.tryGetContext('environment') || 'dev';

new MaPremiereAppCdkStack(app, `MaPremiereAppCdkStack-${environnement}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  tags: {
    Environment: environnement,
    Project: 'ma-premiere-app-cdk',
  },
});
```

Déployer vers différents environnements :

```bash
# Déployer vers dev (par défaut)
cdk deploy

# Déployer vers staging
cdk deploy --context environment=staging

# Déployer vers production
cdk deploy --context environment=prod
```

## 5. Exercice : Ajouter l'intégration DynamoDB

### 5.1 Ajouter une table DynamoDB

```typescript
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

// Ajouter à votre constructeur de stack
const table = new dynamodb.Table(this, 'TableVisiteurs', {
  tableName: `visiteurs-${environnement}`,
  partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
  removalPolicy: cdk.RemovalPolicy.DESTROY, // Seulement pour dev/test
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
});

// Accorder à Lambda la permission d'accéder à DynamoDB
table.grantReadWriteData(fonctionBonjour);

// Passer le nom de table à Lambda
fonctionBonjour.addEnvironment('TABLE_NAME', table.tableName);
```

### 5.2 Mettre à jour la fonction Lambda

Mettez à jour `lambda/bonjour.js` :

```javascript
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const tableName = process.env.TABLE_NAME;
    const visitorId = event.requestContext?.requestId || 'inconnu';
    
    try {
        // Enregistrer le visiteur
        await dynamodb.put({
            TableName: tableName,
            Item: {
                id: visitorId,
                timestamp: new Date().toISOString(),
                userAgent: event.headers?.['User-Agent'] || 'inconnu'
            }
        }).promise();
        
        // Obtenir le nombre de visiteurs
        const result = await dynamodb.scan({
            TableName: tableName,
            Select: 'COUNT'
        }).promise();
        
        const response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            body: JSON.stringify({
                message: 'Bonjour depuis Lambda CDK avec DynamoDB !',
                visitorId: visitorId,
                totalVisitors: result.Count,
                timestamp: new Date().toISOString()
            }),
        };
        return response;
    } catch (error) {
        console.error('Erreur:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                message: 'Erreur interne du serveur',
                error: error.message
            }),
        };
    }
};
```

## Résumé

Aujourd'hui vous avez appris :

1. ✅ Hiérarchie à trois couches des Constructs CDK (L1, L2, L3)
2. ✅ Construction d'un site web statique complet avec CloudFront
3. ✅ Création d'APIs serverless avec Lambda et API Gateway
4. ✅ Gestion de configuration spécifique à l'environnement
5. ✅ Intégration DynamoDB pour la persistance des données

### Concepts clés couverts

- **Niveaux de Construct** : L1 (CFN), L2 (AWS), L3 (Modèles)
- **CloudFront** : CDN global avec Origin Access Identity
- **Fonctions Lambda** : Calcul serverless avec API Gateway
- **Gestion d'environnement** : Configuration basée sur le contexte
- **Intégration inter-services** : Permissions Lambda + DynamoDB

### Architecture construite aujourd'hui

```
Internet → CloudFront → S3 (Site Web Statique)
              ↓
         API Gateway → Lambda → DynamoDB
```

### Prochaines étapes

Demain (Jour 3), nous explorerons les modèles CDK avancés, les constructs personnalisés, et apprendrons à créer des composants réutilisables qui suivent les meilleures pratiques AWS.

---

**Note** : N'oubliez pas de nettoyer les ressources une fois la pratique terminée pour éviter des frais inutiles :

```bash
cdk destroy
```