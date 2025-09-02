---
title: Jour 5 - Bonnes pratiques de production et excellence opérationnelle
order: 6
---

# Jour 5 - Bonnes pratiques de production et excellence opérationnelle

## Objectifs du jour

1. Implémenter les meilleures pratiques de sécurité pour la production
2. Configurer une surveillance et des alertes complètes
3. Configurer la sauvegarde et la récupération d'urgence
4. Établir des pratiques d'excellence opérationnelle
5. Créer des stratégies de déploiement prêtes pour la production

## 1. Meilleures pratiques de sécurité

### 1.1 Construct de fondation sécuritaire

Créez `lib/security/security-foundation.ts` :

```typescript
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface SecurityFoundationProps {
  environnement: string;
  nomApplication: string;
  activerRotationCle?: boolean;
  activerCloudTrail?: boolean;
}

export class SecurityFoundation extends Construct {
  public readonly cleKms: kms.Key;
  public readonly roleExecution: iam.Role;
  public readonly bucketSecurite: s3.Bucket;

  constructor(scope: Construct, id: string, props: SecurityFoundationProps) {
    super(scope, id);

    // Clé KMS pour le chiffrement des données
    this.cleKms = new kms.Key(this, 'CleApp', {
      description: `Clé de chiffrement ${props.nomApplication} pour ${props.environnement}`,
      enableKeyRotation: props.activerRotationCle ?? true,
      removalPolicy: props.environnement === 'prod' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
    });

    // Alias de clé KMS
    this.cleKms.addAlias(`alias/${props.nomApplication}-${props.environnement}`);

    // Bucket S3 pour les logs de sécurité
    this.bucketSecurite = new s3.Bucket(this, 'BucketSecurite', {
      bucketName: `${props.nomApplication}-${props.environnement}-logs-securite-${cdk.Stack.of(this).account}`,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: this.cleKms,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      lifecycleRules: [
        {
          id: 'CycleVieLogsSecurite',
          enabled: true,
          expiration: cdk.Duration.days(2555), // Rétention de 7 ans
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(90)
            },
            {
              storageClass: s3.StorageClass.GLACIER,
              transitionAfter: cdk.Duration.days(365)
            },
            {
              storageClass: s3.StorageClass.DEEP_ARCHIVE,
              transitionAfter: cdk.Duration.days(730)
            }
          ]
        }
      ],
      removalPolicy: props.environnement === 'prod' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY
    });

    // Rôle d'exécution Lambda avec privilège minimum
    this.roleExecution = new iam.Role(this, 'RoleExecutionLambda', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      roleName: `${props.nomApplication}-${props.environnement}-lambda-role`,
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // Permissions CloudWatch Logs avec accès granulaire
    this.roleExecution.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents'
      ],
      resources: [
        `arn:aws:logs:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:log-group:/aws/lambda/${props.nomApplication}-${props.environnement}-*`
      ]
    }));

    // Permissions de traçage X-Ray
    this.roleExecution.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'xray:PutTraceSegments',
        'xray:PutTelemetryRecords'
      ],
      resources: ['*']
    }));

    // Permissions d'utilisation de la clé KMS
    this.cleKms.grantDecrypt(this.roleExecution);

    // Validation de politique de sécurité
    this.ajouterValidationSecurite();

    // Sorties
    new cdk.CfnOutput(this, 'IdCleKMS', {
      value: this.cleKms.keyId,
      description: 'ID de clé KMS pour le chiffrement',
    });

    new cdk.CfnOutput(this, 'NomBucketSecurite', {
      value: this.bucketSecurite.bucketName,
      description: 'Nom du bucket de logs de sécurité',
    });
  }

  // Accorder l'accès à la clé KMS
  public accorderAccesCle(beneficiaire: iam.IGrantable, ...actions: string[]) {
    return iam.Grant.addToPrincipalOrResource({
      grantee: beneficiaire,
      actions,
      resourceArns: [this.cleKms.keyArn],
      resource: this.cleKms
    });
  }

  // Accorder l'accès en écriture au bucket de sécurité
  public accorderEcritureLogsSecurite(beneficiaire: iam.IGrantable) {
    return this.bucketSecurite.grantWrite(beneficiaire);
  }

  // Validation des politiques de sécurité utilisant les Aspects
  private ajouterValidationSecurite() {
    cdk.Aspects.of(this).add({
      visit: (node: any) => {
        // Vérification du chiffrement des buckets S3
        if (node.node && node.node.id && node.node.id.includes('Bucket') && node instanceof cdk.aws_s3.CfnBucket) {
          if (!node.bucketEncryption) {
            cdk.Annotations.of(node).addError('Le bucket S3 doit avoir le chiffrement activé');
          }
        }
        
        // Vérification du chiffrement des variables d'environnement Lambda
        if (node instanceof cdk.aws_lambda.CfnFunction) {
          const environment = node.environment as any;
          if (!node.kmsKeyArn && environment?.Variables) {
            cdk.Annotations.of(node).addWarning('La fonction Lambda devrait utiliser le chiffrement KMS pour les variables d\'environnement');
          }
        }
        
        // Vérification de la politique de confiance des rôles IAM
        if (node instanceof cdk.aws_iam.CfnRole) {
          const trustPolicy = node.assumeRolePolicyDocument as any;
          if (trustPolicy && trustPolicy.Statement) {
            for (const statement of trustPolicy.Statement) {
              if (statement.Principal === '*' || (statement.Principal && statement.Principal.AWS === '*')) {
                cdk.Annotations.of(node).addError('Le rôle IAM ne devrait pas permettre l\'assumption par n\'importe quel principal (*)');
              }
            }
          }
        }
      }
    });
  }
}
```

### 1.2 Fonction Lambda sécurisée

Créez `lib/constructs/secure-lambda.ts` :

```typescript
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { SecurityFoundation } from '../security/security-foundation';

export interface SecureLambdaProps {
  nomFonction: string;
  handler: string;
  code: lambda.Code;
  environment?: { [key: string]: string };
  fondationSecurite: SecurityFoundation;
  tailleMemoire?: number;
  timeout?: cdk.Duration;
}

export class SecureLambda extends Construct {
  public readonly fonction: lambda.Function;
  public readonly groupeLogs: logs.LogGroup;

  constructor(scope: Construct, id: string, props: SecureLambdaProps) {
    super(scope, id);

    // Groupe de logs personnalisé pour un meilleur contrôle
    this.groupeLogs = new logs.LogGroup(this, 'GroupeLogs', {
      logGroupName: `/aws/lambda/${props.nomFonction}`,
      retention: logs.RetentionDays.ONE_MONTH,
      encryptionKey: props.fondationSecurite.cleKms,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Fonction Lambda avec meilleures pratiques de sécurité
    this.fonction = new lambda.Function(this, 'Fonction', {
      functionName: props.nomFonction,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: props.handler,
      code: props.code,
      role: props.fondationSecurite.roleExecution,
      environment: {
        ...props.environment,
        KMS_KEY_ID: props.fondationSecurite.cleKms.keyId,
      },
      environmentEncryption: props.fondationSecurite.cleKms,
      memorySize: props.tailleMemoire ?? 256,
      timeout: props.timeout ?? cdk.Duration.seconds(30),
      tracing: lambda.Tracing.ACTIVE,
      logGroup: this.groupeLogs,
      reservedConcurrentExecutions: 10, // Prévenir les coûts excessifs
      deadLetterQueueEnabled: true,
      retryAttempts: 2,
    });

    // Politiques de sécurité
    this.ajouterPolitiquesSecurite();
  }

  private ajouterPolitiquesSecurite() {
    // Refuser l'accès aux actions sensibles
    this.fonction.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.DENY,
      actions: [
        'iam:*',
        'sts:AssumeRole',
        'kms:Decrypt',
        's3:GetObject',
        'dynamodb:*'
      ],
      resources: ['*'],
      conditions: {
        StringNotEquals: {
          'aws:RequestedRegion': cdk.Stack.of(this).region
        }
      }
    }));

    // Autoriser seulement les opérations KMS nécessaires
    this.fonction.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'kms:Decrypt',
        'kms:DescribeKey'
      ],
      resources: [cdk.Stack.of(this).formatArn({
        service: 'kms',
        resource: 'key',
        resourceName: '*'
      })],
      conditions: {
        StringEquals: {
          'kms:ViaService': [
            `s3.${cdk.Stack.of(this).region}.amazonaws.com`,
            `dynamodb.${cdk.Stack.of(this).region}.amazonaws.com`
          ]
        }
      }
    }));
  }

  // Accorder des permissions DynamoDB spécifiques
  public accorderAccesDynamoDB(arnTable: string, actions: string[]) {
    this.fonction.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions,
      resources: [arnTable, `${arnTable}/index/*`]
    }));
  }

  // Accorder des permissions S3 spécifiques
  public accorderAccesS3(arnBucket: string, actions: string[]) {
    this.fonction.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions,
      resources: [arnBucket, `${arnBucket}/*`]
    }));
  }
}
```

## 2. Surveillance et observabilité

### 2.1 Surveillance complète

Créez `lib/monitoring/monitoring-construct.ts` :

```typescript
import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import { Construct } from 'constructs';

export interface MonitoringProps {
  emailNotification?: string;
  environnement: string;
}

export class MonitoringConstruct extends Construct {
  public readonly tableauBord: cloudwatch.Dashboard;
  public readonly sujetAlertes: sns.Topic;

  constructor(scope: Construct, id: string, props: MonitoringProps) {
    super(scope, id);

    // Sujet SNS pour les alertes
    this.sujetAlertes = new sns.Topic(this, 'SujetAlertes', {
      topicName: `${props.environnement}-alertes`,
      displayName: `Alertes environnement ${props.environnement}`,
    });

    if (props.emailNotification) {
      this.sujetAlertes.addSubscription(
        new subscriptions.EmailSubscription(props.emailNotification)
      );
    }

    // Tableau de bord CloudWatch
    this.tableauBord = new cloudwatch.Dashboard(this, 'TableauBordSurveillance', {
      dashboardName: `${props.environnement}-tableau-bord-surveillance`,
      defaultInterval: cdk.Duration.hours(1),
    });

    // Ajouter des widgets communs
    this.ajouterWidgetsCommuns();
  }

  private ajouterWidgetsCommuns() {
    // Widget de santé système
    this.tableauBord.addWidgets(
      new cloudwatch.TextWidget({
        markdown: `# Surveillance environnement ${this.node.tryGetContext('environment')}\n\nDernière mise à jour : ${new Date().toISOString()}`,
        width: 24,
        height: 2,
      })
    );
  }

  // Ajouter surveillance des fonctions Lambda
  public ajouterSurveillanceLambda(
    func: lambda.Function, 
    options?: {
      seuilTauxErreur?: number;
      seuilDuree?: number;
    }
  ) {
    const seuilTauxErreur = options?.seuilTauxErreur ?? 5;
    const seuilDuree = options?.seuilDuree ?? 10000;

    // Alarme taux d'erreur
    const alarmeErreur = new cloudwatch.Alarm(this, `${func.functionName}AlarmeErreur`, {
      alarmName: `${func.functionName}-taux-erreur-eleve`,
      metric: func.metricErrors({
        period: cdk.Duration.minutes(5),
        statistic: 'Sum'
      }),
      threshold: seuilTauxErreur,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      alarmDescription: `Taux d'erreur élevé détecté dans ${func.functionName}`,
    });
    
    alarmeErreur.addAlarmAction(new actions.SnsAction(this.sujetAlertes));

    // Alarme durée
    const alarmeDuree = new cloudwatch.Alarm(this, `${func.functionName}AlarmeDuree`, {
      alarmName: `${func.functionName}-duree-elevee`,
      metric: func.metricDuration({
        period: cdk.Duration.minutes(5),
        statistic: 'Average'
      }),
      threshold: seuilDuree,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      alarmDescription: `Durée élevée détectée dans ${func.functionName}`,
    });
    
    alarmeDuree.addAlarmAction(new actions.SnsAction(this.sujetAlertes));

    // Ajouter widgets Lambda au tableau de bord
    this.tableauBord.addWidgets(
      new cloudwatch.GraphWidget({
        title: `Métriques ${func.functionName}`,
        left: [
          func.metricInvocations({ label: 'Invocations' }),
          func.metricErrors({ label: 'Erreurs' }),
        ],
        right: [
          func.metricDuration({ label: 'Durée' }),
        ],
        width: 12,
        height: 6,
      }),
      new cloudwatch.LogQueryWidget({
        title: `Logs d'erreur ${func.functionName}`,
        logGroups: [func.logGroup!],
        queryLines: [
          'fields @timestamp, @message',
          'filter @message like /ERROR/',
          'sort @timestamp desc',
          'limit 20'
        ],
        width: 12,
        height: 6,
      })
    );
  }

  // Ajouter surveillance API Gateway
  public ajouterSurveillanceApiGateway(api: apigateway.RestApi) {
    // Alarmes d'erreur 4XX et 5XX
    const alarmeErreurClient = new cloudwatch.Alarm(this, `${api.restApiName}AlarmeErreurClient`, {
      alarmName: `${api.restApiName}-erreurs-4xx-elevees`,
      metric: api.metricClientError({
        period: cdk.Duration.minutes(5),
        statistic: 'Sum'
      }),
      threshold: 10,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    });
    
    alarmeErreurClient.addAlarmAction(new actions.SnsAction(this.sujetAlertes));

    const alarmeErreurServeur = new cloudwatch.Alarm(this, `${api.restApiName}AlarmeErreurServeur`, {
      alarmName: `${api.restApiName}-erreurs-5xx-elevees`,
      metric: api.metricServerError({
        period: cdk.Duration.minutes(5),
        statistic: 'Sum'
      }),
      threshold: 5,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    });
    
    alarmeErreurServeur.addAlarmAction(new actions.SnsAction(this.sujetAlertes));

    // Ajouter widgets API Gateway
    this.tableauBord.addWidgets(
      new cloudwatch.GraphWidget({
        title: `Métriques API ${api.restApiName}`,
        left: [
          api.metricCount({ label: 'Requêtes' }),
          api.metricClientError({ label: 'Erreurs 4XX' }),
          api.metricServerError({ label: 'Erreurs 5XX' }),
        ],
        right: [
          api.metricLatency({ label: 'Latence' }),
        ],
        width: 24,
        height: 6,
      })
    );
  }

  // Ajouter surveillance DynamoDB
  public ajouterSurveillanceDynamoDB(table: dynamodb.Table) {
    // Alarme d'étranglement
    const alarmeEtranglement = new cloudwatch.Alarm(this, `${table.tableName}AlarmeEtranglement`, {
      alarmName: `${table.tableName}-etranglement`,
      metric: table.metricThrottledRequestsForOperations({
        operations: [dynamodb.Operation.PUT_ITEM, dynamodb.Operation.GET_ITEM],
        period: cdk.Duration.minutes(5),
        statistic: 'Sum'
      }),
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    });
    
    alarmeEtranglement.addAlarmAction(new actions.SnsAction(this.sujetAlertes));

    // Ajouter widgets DynamoDB
    this.tableauBord.addWidgets(
      new cloudwatch.GraphWidget({
        title: `Métriques DynamoDB ${table.tableName}`,
        left: [
          table.metricConsumedReadCapacityUnits({ label: 'Capacité lecture' }),
          table.metricConsumedWriteCapacityUnits({ label: 'Capacité écriture' }),
        ],
        right: [
          table.metricSuccessfulRequestLatency({
            operations: [dynamodb.Operation.GET_ITEM],
            label: 'Latence lecture'
          }),
          table.metricSuccessfulRequestLatency({
            operations: [dynamodb.Operation.PUT_ITEM],
            label: 'Latence écriture'
          }),
        ],
        width: 24,
        height: 6,
      })
    );
  }

  // Ajouter notification email
  public ajouterNotificationEmail(email: string) {
    this.sujetAlertes.addSubscription(new subscriptions.EmailSubscription(email));
  }
}
```

## 3. Stack prêt pour la production

### 3.1 Stack de production

Créez `lib/production-stack.ts` :

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SecurityFoundation } from './security/security-foundation';
import { MonitoringConstruct } from './monitoring/monitoring-construct';

export interface ProductionStackProps extends cdk.StackProps {
  environnement: 'staging' | 'production';
  nomApplication: string;
  emailNotification?: string;
}

export class ProductionStack extends cdk.Stack {
  public readonly securite: SecurityFoundation;
  public readonly surveillance: MonitoringConstruct;

  constructor(scope: Construct, id: string, props: ProductionStackProps) {
    super(scope, id, {
      ...props,
      description: `Stack CDK prêt pour la production pour ${props.nomApplication} - ${props.environnement}`,
      tags: {
        Environment: props.environnement,
        Application: props.nomApplication,
        CreatedBy: 'AWS CDK',
        CostCenter: props.environnement === 'production' ? 'production' : 'development'
      }
    });

    // Fondation sécuritaire
    this.securite = new SecurityFoundation(this, 'Securite', {
      environnement: props.environnement,
      nomApplication: props.nomApplication,
      activerRotationCle: props.environnement === 'production',
      activerCloudTrail: props.environnement === 'production'
    });

    // Surveillance complète
    this.surveillance = new MonitoringConstruct(this, 'Surveillance', {
      environnement: props.environnement,
      emailNotification: props.emailNotification
    });

    // Configurations spécifiques à la production
    if (props.environnement === 'production') {
      this.ajouterConfigurationsProduction();
    }

    // Sorties du stack
    new cdk.CfnOutput(this, 'Environnement', {
      value: props.environnement,
      description: 'Environnement de déploiement'
    });

    new cdk.CfnOutput(this, 'TableauBordSurveillance', {
      value: `https://console.aws.amazon.com/cloudwatch/home?region=${this.region}#dashboards:name=${this.surveillance.tableauBord.dashboardName}`,
      description: 'URL du tableau de bord de surveillance CloudWatch'
    });
  }

  private ajouterConfigurationsProduction() {
    // Protection du stack de production
    this.templateOptions.metadata = {
      'AWS::CloudFormation::Interface': {
        ParameterGroups: [
          {
            Label: { default: 'Configuration de production' },
            Parameters: []
          }
        ]
      }
    };

    // Protection contre la suppression du stack
    const cfnStack = this.node.defaultChild as cdk.CfnStack;
    cfnStack.addPropertyOverride('EnableTerminationProtection', true);

    // Tags de ressources de production
    cdk.Tags.of(this).add('BackupRequired', 'true');
    cdk.Tags.of(this).add('ComplianceLevel', 'high');
    cdk.Tags.of(this).add('DataClassification', 'confidential');

    // Détection de dérive CloudFormation
    new cdk.CfnOutput(this, 'CommandeDetectionDerive', {
      value: `aws cloudformation detect-stack-drift --stack-name ${this.stackName}`,
      description: 'Commande pour détecter la dérive de configuration'
    });

    // Vérifications de santé de production
    this.ajouterVerificationsSanteProduction();
  }

  private ajouterVerificationsSanteProduction() {
    // Ressource personnalisée pour les vérifications de santé
    new cdk.CustomResource(this, 'VerificationSante', {
      serviceToken: new cdk.aws_lambda.Function(this, 'FonctionVerificationSante', {
        runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        handler: 'index.handler',
        code: cdk.aws_lambda.Code.fromInline(`
          const AWS = require('aws-sdk');
          const response = require('cfn-response');

          exports.handler = async (event, context) => {
            console.log('Vérification de santé déclenchée:', JSON.stringify(event));
            
            try {
              // Vérifications de santé de base
              const checks = {
                timestamp: new Date().toISOString(),
                region: process.env.AWS_REGION,
                stackName: event.StackId?.split('/')[1] || 'inconnu'
              };
              
              console.log('Résultats de vérification de santé:', checks);
              
              // Envoyer réponse de succès à CloudFormation
              await response.send(event, context, response.SUCCESS, checks);
            } catch (error) {
              console.error('Échec de vérification de santé:', error);
              await response.send(event, context, response.FAILED, {
                error: error.message
              });
            }
          };
        `),
        role: this.securite.roleExecution,
        timeout: cdk.Duration.minutes(1)
      }).functionArn
    });
  }
}
```

## 4. Sauvegarde et récupération d'urgence

### 4.1 Stratégie de sauvegarde automatisée

Créez `lib/backup/backup-construct.ts` :

```typescript
import * as cdk from 'aws-cdk-lib';
import * as backup from 'aws-cdk-lib/aws-backup';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface BackupConstructProps {
  environnement: string;
  joursRetention: number;
}

export class BackupConstruct extends Construct {
  public readonly coffreSauvegarde: backup.BackupVault;
  public readonly planSauvegarde: backup.BackupPlan;

  constructor(scope: Construct, id: string, props: BackupConstructProps) {
    super(scope, id);

    // Coffre de sauvegarde avec chiffrement
    this.coffreSauvegarde = new backup.BackupVault(this, 'CoffreSauvegarde', {
      backupVaultName: `${props.environnement}-coffre-sauvegarde`,
      encryptionKey: cdk.aws_kms.Alias.fromAliasName(this, 'CleSauvegarde', 'alias/aws/backup'),
      removalPolicy: props.environnement === 'production' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
    });

    // Plan de sauvegarde
    this.planSauvegarde = backup.BackupPlan.dailyWeeklyMonthly5YearRetention(this, 'PlanSauvegarde', {
      backupPlanName: `${props.environnement}-plan-sauvegarde`,
      backupVault: this.coffreSauvegarde,
    });

    // Règle de sauvegarde supplémentaire pour données critiques
    if (props.environnement === 'production') {
      this.planSauvegarde.addRule(backup.BackupPlanRule.fromProps({
        ruleName: 'SauvegardesDonneesCritiques',
        scheduleExpression: backup.ScheduleExpression.cron({
          hour: '2',
          minute: '0'
        }),
        deleteAfter: cdk.Duration.days(props.joursRetention),
        moveToColdStorageAfter: cdk.Duration.days(30),
        copyActions: [{
          destinationBackupVault: this.coffreSauvegarde,
          deleteAfter: cdk.Duration.days(props.joursRetention * 2),
        }],
      }));
    }
  }

  // Ajouter table DynamoDB à la sauvegarde
  public ajouterTableDynamoDB(table: dynamodb.Table) {
    this.planSauvegarde.addSelection('SauvegardeDynamoDB', {
      resources: [
        backup.BackupResource.fromDynamoDbTable(table)
      ],
      allowRestores: true,
    });
  }

  // Ajouter bucket S3 à la sauvegarde (via politique de cycle de vie)
  public ajouterSauvegardeBucketS3(bucket: s3.Bucket) {
    bucket.addLifecycleRule({
      id: 'CycleVieSauvegarde',
      enabled: true,
      transitions: [
        {
          storageClass: s3.StorageClass.INFREQUENT_ACCESS,
          transitionAfter: cdk.Duration.days(30),
        },
        {
          storageClass: s3.StorageClass.GLACIER,
          transitionAfter: cdk.Duration.days(90),
        },
        {
          storageClass: s3.StorageClass.DEEP_ARCHIVE,
          transitionAfter: cdk.Duration.days(180),
        },
      ],
    });
  }
}
```

## 5. Excellence opérationnelle

### 5.1 Remédiation automatisée

Créez `lib/automation/auto-remediation.ts` :

```typescript
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * * events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';

export class AutoRemediationConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Lambda de remédiation automatique
    const fonctionRemediation = new lambda.Function(this, 'FonctionRemediation', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const AWS = require('aws-sdk');
        const cloudwatch = new AWS.CloudWatch();
        const lambda = new AWS.Lambda();

        exports.handler = async (event) => {
          console.log('Alarme reçue:', JSON.stringify(event, null, 2));
          
          const detail = event.detail;
          const alarmName = detail.alarmName;
          const state = detail.state.value;
          
          if (state === 'ALARM') {
            try {
              if (alarmName.includes('taux-erreur-eleve')) {
                // Redémarrer fonction Lambda (nettoyer connexions en cache)
                const functionName = alarmName.split('-')[0];
                await lambda.updateFunctionConfiguration({
                  FunctionName: functionName,
                  Environment: {
                    Variables: {
                      ...process.env,
                      RESTART_TIMESTAMP: Date.now().toString()
                    }
                  }
                }).promise();
                
                console.log(\`Redémarrage déclenché pour la fonction: \${functionName}\`);
              }
              
              if (alarmName.includes('duree-elevee')) {
                // Augmenter la mémoire pour les alarmes de durée élevée
                const functionName = alarmName.split('-')[0];
                const config = await lambda.getFunctionConfiguration({
                  FunctionName: functionName
                }).promise();
                
                const nouvelleMemoire = Math.min(config.MemorySize * 1.5, 3008);
                
                await lambda.updateFunctionConfiguration({
                  FunctionName: functionName,
                  MemorySize: nouvelleMemoire
                }).promise();
                
                console.log(\`Mémoire augmentée pour \${functionName} à \${nouvelleMemoire}MB\`);
              }
              
            } catch (error) {
              console.error('Échec de remédiation:', error);
              throw error;
            }
          }
          
          return { statusCode: 200, body: 'Remédiation terminée' };
        };
      `),
      timeout: cdk.Duration.seconds(60),
    });

    // Règle CloudWatch Events pour changements d'état d'alarme
    const regleAlarme = new events.Rule(this, 'RegleAlarme', {
      eventPattern: {
        source: ['aws.cloudwatch'],
        detailType: ['CloudWatch Alarm State Change'],
        detail: {
          state: {
            value: ['ALARM']
          }
        }
      }
    });

    regleAlarme.addTarget(new targets.LambdaFunction(fonctionRemediation));

    // Accorder les permissions nécessaires
    fonctionRemediation.addToRolePolicy(new cdk.aws_iam.PolicyStatement({
      effect: cdk.aws_iam.Effect.ALLOW,
      actions: [
        'lambda:UpdateFunctionConfiguration',
        'lambda:GetFunctionConfiguration'
      ],
      resources: ['*']
    }));
  }
}
```

## 6. Résumé et meilleures pratiques

### 6.1 Liste de vérification de déploiement en production

✅ **Sécurité**
- Chiffrement KMS pour toutes les données au repos
- Rôles IAM avec principe du privilège minimum
- Groupes de sécurité avec accès minimal requis
- Journalisation CloudTrail activée

✅ **Surveillance et alertes**
- Tableaux de bord CloudWatch pour les métriques clés
- Alarmes pour taux d'erreur, latence et coûts
- Notifications SNS pour alertes critiques
- Agrégation et analyse des logs

✅ **Sauvegarde et récupération**
- Stratégies de sauvegarde automatisées
- Sauvegarde inter-régions pour données critiques
- Procédures de récupération d'urgence documentées
- Tests de récupération effectués régulièrement

✅ **Excellence opérationnelle**
- Infrastructure en tant que Code pour toutes les ressources
- Pipelines de déploiement automatisés
- Détection de dérive de configuration
- Remédiation automatisée si possible

✅ **Performance et coût**
- Dimensionnement approprié des ressources
- Capacité réservée si approprié
- Surveillance et alertes de coût
- Optimisation des performances basée sur les métriques

### 6.2 Commandes d'opérations quotidiennes

```bash
# Déployer vers différents environnements
cdk deploy --context environment=dev
cdk deploy --context environment=staging
cdk deploy --context environment=production

# Surveiller la dérive du stack
aws cloudformation detect-stack-drift --stack-name MonStack

# Voir le tableau de bord de surveillance
aws cloudwatch get-dashboard --dashboard-name prod-tableau-bord-surveillance

# Vérifier l'état des sauvegardes
aws backup list-backup-jobs --by-backup-vault-name prod-coffre-sauvegarde

# Voir les alarmes récentes
aws cloudwatch describe-alarms --state-value ALARM --max-records 10
```

### 6.3 Guide de dépannage

**Taux d'erreur élevé**
1. Vérifier les logs CloudWatch pour motifs d'erreur
2. Examiner les déploiements récents
3. Vérifier les dépendances externes
4. Dimensionner les ressources si nécessaire

**Latence élevée**
1. Vérifier le pooling de connexions base de données
2. Examiner l'allocation mémoire Lambda
3. Analyser les impacts de démarrage à froid
4. Vérifier la mise en cache API Gateway

**Pics de coût**
1. Examiner les métriques de coût CloudWatch
2. Vérifier les fonctions en boucle infinie
3. Examiner les coûts de transfert de données
4. Valider le dimensionnement des ressources

## Exercice final : Application de production complète

Déployez une application entièrement prête pour la production avec :

1. **Support multi-environnements** (dev/staging/prod)
2. **Sécurité complète** (KMS, IAM, groupes de sécurité)
3. **Surveillance complète** (tableaux de bord, alarmes, logs)
4. **Sauvegardes automatisées** (DynamoDB, S3)
5. **Pipeline CI/CD** (GitHub Actions)
6. **Remédiation automatique** (auto-guérison de base)

```bash
# Déployer la solution complète
export NOTIFICATION_EMAIL=votre-email@domaine.com
cdk deploy --context environment=production
```

## Félicitations ! 🎉

Vous avez terminé avec succès le parcours AWS CDK de 5 jours ! Vous avez maintenant :

1. ✅ **Fondation CDK solide** - Compréhension des constructs, stacks et apps
2. ✅ **Expérience pratique** - Applications réelles construites avec les services AWS
3. ✅ **Modèles avancés** - Constructs personnalisés et références inter-stacks
4. ✅ **Connaissances en tests** - Tests unitaires, d'intégration et de bout en bout
5. ✅ **Compétences de production** - Sécurité, surveillance et excellence opérationnelle

### Prochaines étapes

- **Explorer les modèles CDK** - Apprendre plus de modèles de conception d'AWS
- **Contribuer à CDK** - Rejoindre la communauté open source
- **Construire vos propres Constructs** - Créer des composants réutilisables pour votre organisation
- **Sujets avancés** - Déploiements multi-régions, pipelines CDK, ressources personnalisées

### Ressources pour continuer l'apprentissage

- [Documentation AWS CDK](https://docs.aws.amazon.com/cdk/)
- [Modèles CDK](https://cdkpatterns.com/)
- [Exemples AWS CDK](https://github.com/aws-samples/aws-cdk-examples)
- [Atelier CDK](https://cdkworkshop.com/)

Continuez à construire, continuez à apprendre, et bienvenue dans la révolution Infrastructure en tant que Code ! 🚀