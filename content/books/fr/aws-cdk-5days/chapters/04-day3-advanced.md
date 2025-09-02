---
title: Jour 3 - Constructs avancés et modèles
order: 4
---

# Jour 3 - Constructs avancés et modèles

## Objectifs du jour

1. Créer des Constructs personnalisés réutilisables
2. Apprendre les modèles CDK avancés et les meilleures pratiques
3. Implémenter le partage de ressources inter-stacks
4. Construire une architecture d'application multi-niveaux
5. Comprendre les Aspects CDK pour la gouvernance

## 1. Constructs personnalisés

### 1.1 Création d'un Construct d'API Web réutilisable

Créez un nouveau fichier `lib/web-api-construct.ts` :

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export interface WebApiProps {
  nomTable?: string;
  tailleMemoire?: number;
  nomApi?: string;
}

export class WebApiConstruct extends Construct {
  public readonly api: apigateway.RestApi;
  public readonly table: dynamodb.Table;
  public readonly fonctionLambda: lambda.Function;

  constructor(scope: Construct, id: string, props?: WebApiProps) {
    super(scope, id);

    // Table DynamoDB
    this.table = new dynamodb.Table(this, 'TableApi', {
      tableName: props?.nomTable || `${id}-table`,
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Fonction Lambda
    this.fonctionLambda = new lambda.Function(this, 'FonctionApi', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const AWS = require('aws-sdk');
        const dynamodb = new AWS.DynamoDB.DocumentClient();
        
        exports.handler = async (event) => {
          const method = event.httpMethod;
          const path = event.path;
          const tableName = process.env.TABLE_NAME;
          
          console.log('Requête:', { method, path, tableName });
          
          try {
            let response;
            
            switch (method) {
              case 'GET':
                if (path === '/items') {
                  const result = await dynamodb.scan({
                    TableName: tableName,
                    Limit: 50
                  }).promise();
                  response = { items: result.Items || [] };
                } else {
                  response = { message: 'Bonjour depuis l\'API Web !', path, method };
                }
                break;
                
              case 'POST':
                if (path === '/items') {
                  const body = JSON.parse(event.body || '{}');
                  const item = {
                    pk: 'ITEM',
                    sk: Date.now().toString(),
                    ...body,
                    createdAt: new Date().toISOString()
                  };
                  
                  await dynamodb.put({
                    TableName: tableName,
                    Item: item
                  }).promise();
                  
                  response = { message: 'Item créé', item };
                } else {
                  response = { message: 'Point de terminaison POST', path };
                }
                break;
                
              default:
                response = { message: 'Méthode non supportée', method };
            }
            
            return {
              statusCode: 200,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(response)
            };
            
          } catch (error) {
            console.error('Erreur:', error);
            return {
              statusCode: 500,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                error: 'Erreur interne du serveur',
                message: error.message
              })
            };
          }
        };
      `),
      memorySize: props?.tailleMemoire || 256,
      timeout: cdk.Duration.seconds(30),
      environment: {
        TABLE_NAME: this.table.tableName,
      },
    });

    // Accorder les permissions Lambda à DynamoDB
    this.table.grantReadWriteData(this.fonctionLambda);

    // API Gateway
    this.api = new apigateway.RestApi(this, 'Api', {
      restApiName: props?.nomApi || `${id}-api`,
      description: 'API Web avec Lambda et DynamoDB',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // Intégration Lambda
    const integrationLambda = new apigateway.LambdaIntegration(this.fonctionLambda);

    // Routes API
    this.api.root.addMethod('GET', integrationLambda);
    
    const ressourceItems = this.api.root.addResource('items');
    ressourceItems.addMethod('GET', integrationLambda);
    ressourceItems.addMethod('POST', integrationLambda);
  }

  // Méthode d'aide pour ajouter des routes personnalisées
  public ajouterRoute(chemin: string, methode: string): apigateway.Resource {
    const ressource = this.api.root.addResource(chemin);
    const integration = new apigateway.LambdaIntegration(this.fonctionLambda);
    ressource.addMethod(methode, integration);
    return ressource;
  }
}
```

### 1.2 Utilisation du Construct personnalisé

Mettez à jour votre stack principal pour utiliser le construct personnalisé :

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { WebApiConstruct } from './web-api-construct';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

export class MaPremiereAppCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const environnement = this.node.tryGetContext('environment') || 'dev';

    // Site web statique (du Jour 2)
    const bucketSiteWeb = new s3.Bucket(this, 'BucketSiteWeb', {
      bucketName: `mon-site-web-bucket-${environnement}-${Date.now()}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OAI');
    bucketSiteWeb.grantRead(originAccessIdentity);

    const distribution = new cloudfront.Distribution(this, 'DistributionSiteWeb', {
      defaultBehavior: {
        origin: new origins.S3Origin(bucketSiteWeb, { originAccessIdentity }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
    });

    // NOUVEAU : Utiliser notre construct d'API Web personnalisé
    const webApi = new WebApiConstruct(this, 'WebApi', {
      nomTable: `table-api-web-${environnement}`,
      tailleMemoire: environnement === 'prod' ? 512 : 256,
      nomApi: `api-web-${environnement}`,
    });

    // Ajouter des routes personnalisées à l'API
    webApi.ajouterRoute('health', 'GET');
    webApi.ajouterRoute('users', 'GET');

    // Déployer le contenu du site web
    new s3deploy.BucketDeployment(this, 'DeployerSiteWeb', {
      sources: [s3deploy.Source.asset('./site-web')],
      destinationBucket: bucketSiteWeb,
      distribution,
      distributionPaths: ['/*'],
    });

    // Sorties
    new cdk.CfnOutput(this, 'URLSiteWeb', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'URL du site web CloudFront',
    });

    new cdk.CfnOutput(this, 'PointTerminaisonApi', {
      value: webApi.api.url,
      description: 'Point de terminaison API Gateway',
    });

    new cdk.CfnOutput(this, 'NomTableDynamoDB', {
      value: webApi.table.tableName,
      description: 'Nom de la table DynamoDB',
    });
  }
}
```

## 2. Modèles avancés

### 2.1 Références inter-stacks

Créez des stacks séparés pour différentes préoccupations :

Créez `lib/database-stack.ts` :

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class DatabaseStack extends cdk.Stack {
  public readonly tableUtilisateurs: dynamodb.Table;
  public readonly baseDonnees: rds.DatabaseInstance;
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC pour RDS
    this.vpc = new ec2.Vpc(this, 'VpcApp', {
      maxAzs: 2,
      natGateways: 1,
    });

    // DynamoDB pour les sessions utilisateur
    this.tableUtilisateurs = new dynamodb.Table(this, 'TableUtilisateurs', {
      tableName: `utilisateurs-${this.stackName}`,
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // RDS pour les données d'application (optionnel - pour démonstration)
    this.baseDonnees = new rds.DatabaseInstance(this, 'BaseDonneesApp', {
      engine: rds.DatabaseInstanceEngine.mysql({
        version: rds.MysqlEngineVersion.VER_8_0_35,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MICRO),
      credentials: rds.Credentials.fromGeneratedSecret('admin'),
      vpc: this.vpc,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      deletionProtection: false,
    });

    // Exporter les valeurs pour référence inter-stacks
    new cdk.CfnOutput(this, 'NomTableUtilisateurs', {
      value: this.tableUtilisateurs.tableName,
      exportName: `${this.stackName}-NomTableUtilisateurs`,
    });

    new cdk.CfnOutput(this, 'IdVpc', {
      value: this.vpc.vpcId,
      exportName: `${this.stackName}-IdVpc`,
    });
  }
}
```

Créez `lib/application-stack.ts` :

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export interface ApplicationStackProps extends cdk.StackProps {
  nomTableUtilisateurs: string;
  idVpc: string;
}

export class ApplicationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApplicationStackProps) {
    super(scope, id, props);

    // Importer VPC du Stack Database
    const vpc = ec2.Vpc.fromLookup(this, 'VpcImporte', {
      vpcId: props.idVpc,
    });

    // Fonction Lambda qui utilise la table utilisateur partagée
    const serviceUtilisateurs = new lambda.Function(this, 'ServiceUtilisateurs', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const AWS = require('aws-sdk');
        const dynamodb = new AWS.DynamoDB.DocumentClient();
        
        exports.handler = async (event) => {
          const tableName = process.env.USER_TABLE_NAME;
          
          try {
            const result = await dynamodb.scan({
              TableName: tableName,
              Limit: 10
            }).promise();
            
            return {
              statusCode: 200,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                users: result.Items || [],
                count: result.Count || 0
              })
            };
          } catch (error) {
            return {
              statusCode: 500,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                error: error.message
              })
            };
          }
        };
      `),
      environment: {
        USER_TABLE_NAME: props.nomTableUtilisateurs,
      },
      vpc: vpc, // Déployer Lambda dans le VPC
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'ApiUtilisateurs', {
      restApiName: 'API Service Utilisateurs',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const integrationUtilisateurs = new apigateway.LambdaIntegration(serviceUtilisateurs);
    api.root.addResource('users').addMethod('GET', integrationUtilisateurs);

    new cdk.CfnOutput(this, 'UrlApiUtilisateurs', {
      value: api.url,
      description: 'URL API Service Utilisateurs',
    });
  }
}
```

Mettez à jour votre point d'entrée d'app pour utiliser plusieurs stacks :

```typescript
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DatabaseStack } from '../lib/database-stack';
import { ApplicationStack } from '../lib/application-stack';

const app = new cdk.App();
const environnement = app.node.tryGetContext('environment') || 'dev';

const stackBaseDonnees = new DatabaseStack(app, `StackBaseDonnees-${environnement}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

const stackApplication = new ApplicationStack(app, `StackApplication-${environnement}`, {
  nomTableUtilisateurs: stackBaseDonnees.tableUtilisateurs.tableName,
  idVpc: stackBaseDonnees.vpc.vpcId,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

// Assurer l'ordre de déploiement approprié
stackApplication.addDependency(stackBaseDonnees);
```

## 3. Aspects CDK pour la gouvernance

### 3.1 Aspect de sécurité

Créez `lib/security-aspect.ts` :

```typescript
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { IConstruct } from 'constructs';

export class SecurityAspect implements cdk.IAspect {
  visit(node: IConstruct): void {
    // S'assurer que tous les buckets S3 ont le chiffrement
    if (node instanceof s3.CfnBucket) {
      if (!node.bucketEncryption) {
        cdk.Annotations.of(node).addError(
          'Le bucket S3 doit avoir le chiffrement activé'
        );
      }
    }

    // S'assurer que les fonctions Lambda ont des timeouts raisonnables
    if (node instanceof lambda.CfnFunction) {
      if (!node.timeout || node.timeout > 300) {
        cdk.Annotations.of(node).addWarning(
          'Le timeout Lambda devrait être inférieur à 5 minutes'
        );
      }
    }

    // Vérifier les valeurs codées en dur qui devraient être paramétrées
    if (node instanceof cdk.CfnResource) {
      const template = JSON.stringify(node._toCloudFormation());
      if (template.includes('password') || template.includes('secret')) {
        cdk.Annotations.of(node).addWarning(
          'Informations d\'identification potentiellement codées en dur détectées'
        );
      }
    }
  }
}
```

### 3.2 Aspect d'optimisation des coûts

Créez `lib/cost-aspect.ts` :

```typescript
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { IConstruct } from 'constructs';

export class CostOptimizationAspect implements cdk.IAspect {
  constructor(private environnement: string) {}

  visit(node: IConstruct): void {
    // Dans les environnements non-production, suggérer des types d'instance plus petits
    if (this.environnement !== 'prod') {
      if (node instanceof ec2.CfnInstance) {
        if (node.instanceType && !node.instanceType.includes('micro') && !node.instanceType.includes('small')) {
          cdk.Annotations.of(node).addWarning(
            `Considérez utiliser un type d'instance plus petit dans l'environnement ${this.environnement}`
          );
        }
      }

      if (node instanceof rds.CfnDBInstance) {
        if (node.dbInstanceClass && !node.dbInstanceClass.includes('micro')) {
          cdk.Annotations.of(node).addWarning(
            `Considérez utiliser db.t3.micro dans l'environnement ${this.environnement}`
          );
        }
      }
    }

    // Vérifier les NAT Gateways en développement
    if (this.environnement === 'dev' && node instanceof ec2.CfnNatGateway) {
      cdk.Annotations.of(node).addWarning(
        'La NAT Gateway entraîne des coûts. Considérez utiliser une instance NAT pour le développement'
      );
    }
  }
}
```

### 3.3 Appliquer les Aspects à votre Stack

Mettez à jour votre stack pour utiliser les Aspects :

```typescript
import { SecurityAspect } from './security-aspect';
import { CostOptimizationAspect } from './cost-aspect';

export class MaPremiereAppCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const environnement = this.node.tryGetContext('environment') || 'dev';

    // ... vos ressources existantes ...

    // Appliquer les aspects de gouvernance
    cdk.Aspects.of(this).add(new SecurityAspect());
    cdk.Aspects.of(this).add(new CostOptimizationAspect(environnement));
  }
}
```

## 4. Exercice : Construire une application complète

### 4.1 Exigences

Construire une application todo avec :
- Frontend hébergé sur CloudFront + S3
- API Gateway + Lambda pour le backend
- DynamoDB pour le stockage de données
- Sécurité et surveillance appropriées

### 4.2 Structure de la solution

```
lib/
├── todo-app-stack.ts          # Stack d'application principal
├── constructs/
│   ├── todo-api.ts            # Construct API Todo
│   ├── todo-frontend.ts       # Construct hébergement frontend
│   └── todo-database.ts       # Construct base de données
└── aspects/
    ├── security-aspect.ts     # Gouvernance sécurité
    └── monitoring-aspect.ts   # Gouvernance surveillance
```

### 4.3 Construct API Todo

Créez `lib/constructs/todo-api.ts` :

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export interface TodoApiProps {
  table: dynamodb.Table;
}

export class TodoApiConstruct extends Construct {
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: TodoApiProps) {
    super(scope, id);

    // Fonction Lambda pour les opérations Todo
    const fonctionTodo = new lambda.Function(this, 'FonctionTodo', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const AWS = require('aws-sdk');
        const dynamodb = new AWS.DynamoDB.DocumentClient();
        const { v4: uuidv4 } = require('uuid');
        
        exports.handler = async (event) => {
          const method = event.httpMethod;
          const path = event.path;
          const tableName = process.env.TABLE_NAME;
          
          console.log('Requête:', { method, path, body: event.body });
          
          try {
            let response;
            
            switch (method) {
              case 'GET':
                if (path === '/todos') {
                  const result = await dynamodb.scan({
                    TableName: tableName,
                  }).promise();
                  response = { todos: result.Items || [] };
                } else {
                  response = { message: 'API Todo', version: '1.0.0' };
                }
                break;
                
              case 'POST':
                if (path === '/todos') {
                  const body = JSON.parse(event.body || '{}');
                  const todo = {
                    id: uuidv4(),
                    text: body.text || '',
                    completed: false,
                    createdAt: new Date().toISOString(),
                  };
                  
                  await dynamodb.put({
                    TableName: tableName,
                    Item: todo,
                  }).promise();
                  
                  response = { message: 'Todo créé', todo };
                }
                break;
                
              case 'PUT':
                if (path.startsWith('/todos/')) {
                  const id = path.split('/')[2];
                  const body = JSON.parse(event.body || '{}');
                  
                  await dynamodb.update({
                    TableName: tableName,
                    Key: { id },
                    UpdateExpression: 'SET completed = :completed, updatedAt = :updatedAt',
                    ExpressionAttributeValues: {
                      ':completed': body.completed || false,
                      ':updatedAt': new Date().toISOString(),
                    },
                  }).promise();
                  
                  response = { message: 'Todo mis à jour' };
                }
                break;
                
              case 'DELETE':
                if (path.startsWith('/todos/')) {
                  const id = path.split('/')[2];
                  
                  await dynamodb.delete({
                    TableName: tableName,
                    Key: { id },
                  }).promise();
                  
                  response = { message: 'Todo supprimé' };
                }
                break;
                
              default:
                response = { message: 'Méthode non autorisée' };
            }
            
            return {
              statusCode: 200,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(response),
            };
            
          } catch (error) {
            console.error('Erreur:', error);
            return {
              statusCode: 500,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                error: 'Erreur interne du serveur',
                message: error.message,
              }),
            };
          }
        };
      `),
      environment: {
        TABLE_NAME: props.table.tableName,
      },
      timeout: cdk.Duration.seconds(30),
    });

    // Accorder les permissions
    props.table.grantReadWriteData(fonctionTodo);

    // API Gateway
    this.api = new apigateway.RestApi(this, 'TodoApi', {
      restApiName: 'API Todo',
      description: 'API application Todo',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const integrationLambda = new apigateway.LambdaIntegration(fonctionTodo);

    // Routes
    this.api.root.addMethod('GET', integrationLambda);
    
    const ressourceTodos = this.api.root.addResource('todos');
    ressourceTodos.addMethod('GET', integrationLambda);
    ressourceTodos.addMethod('POST', integrationLambda);
    
    const ressourceTodo = ressourceTodos.addResource('{id}');
    ressourceTodo.addMethod('PUT', integrationLambda);
    ressourceTodo.addMethod('DELETE', integrationLambda);
  }
}
```

## Résumé

Aujourd'hui vous avez appris :

1. ✅ Créer des Constructs personnalisés et réutilisables
2. ✅ Modèles CDK avancés et meilleures pratiques  
3. ✅ Partage de ressources et dépendances inter-stacks
4. ✅ Aspects CDK pour la gouvernance et la conformité
5. ✅ Construire des applications complexes multi-niveaux

### Concepts clés couverts

- **Constructs personnalisés** : Encapsuler plusieurs ressources en composants réutilisables
- **Références inter-stacks** : Partager des ressources entre différents stacks
- **Aspects CDK** : Implémenter des vérifications de gouvernance et conformité
- **Architecture multi-niveaux** : Séparer les préoccupations entre différents stacks

### Modèle d'architecture construit

```
Stack Frontend    →  Stack Application  →  Stack Base de données
(S3 + CloudFront) →  (Lambda + API GW)   →  (DynamoDB + RDS)
```

### Prochaines étapes

Demain (Jour 4), nous nous concentrerons sur les tests de vos applications CDK, la mise en place de pipelines CI/CD, et l'assurance qualité du code à travers des stratégies de tests automatisés.

---

**Conseils de meilleures pratiques du Jour 3 :**

1. **Conception de Construct** : Rendez les constructs configurables et réutilisables
2. **Séparation des stacks** : Séparez les préoccupations par cycle de vie (base de données vs application)
3. **Gouvernance** : Utilisez les Aspects pour appliquer les standards organisationnels
4. **Nommage des ressources** : Utilisez un nommage cohérent et sensible à l'environnement
5. **Références croisées** : Minimisez le couplage étroit entre stacks