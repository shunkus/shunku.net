---
title: Día 5 - Mejores Prácticas de Producción y Excelencia Operacional
order: 6
---

# Día 5 - Mejores Prácticas de Producción y Excelencia Operacional

## Objetivos de Hoy

1. Implementar mejores prácticas de seguridad para producción
2. Configurar monitoreo y alertas comprehensivos
3. Configurar backup y recuperación ante desastres
4. Establecer prácticas de excelencia operacional
5. Crear estrategias de despliegue listas para producción

## 1. Mejores Prácticas de Seguridad

### 1.1 Construct de Fundamentos de Seguridad

Crea `lib/security/security-foundation.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface PropsFundamentosSeguridad {
  entorno: string;
  nombreAplicacion: string;
  habilitarRotacionClave?: boolean;
  habilitarCloudTrail?: boolean;
}

export class FundamentosSeguridad extends Construct {
  public readonly claveKms: kms.Key;
  public readonly rolEjecucion: iam.Role;
  public readonly bucketSeguridad: s3.Bucket;

  constructor(scope: Construct, id: string, props: PropsFundamentosSeguridad) {
    super(scope, id);

    // Clave KMS para encriptación de datos
    this.claveKms = new kms.Key(this, 'ClaveApp', {
      description: `Clave de encriptación ${props.nombreAplicacion} para ${props.entorno}`,
      enableKeyRotation: props.habilitarRotacionClave ?? true,
      removalPolicy: props.entorno === 'prod' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
    });

    // Alias de Clave KMS
    this.claveKms.addAlias(`alias/${props.nombreAplicacion}-${props.entorno}`);

    // Bucket S3 para logs de seguridad
    this.bucketSeguridad = new s3.Bucket(this, 'BucketSeguridad', {
      bucketName: `${props.nombreAplicacion}-${props.entorno}-logs-seguridad-${cdk.Stack.of(this).account}`,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: this.claveKms,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      lifecycleRules: [
        {
          id: 'CicloVidaLogsSeguridad',
          enabled: true,
          expiration: cdk.Duration.days(2555), // Retención 7 años
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
      removalPolicy: props.entorno === 'prod' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY
    });

    // Rol de ejecución Lambda con principio de menor privilegio
    this.rolEjecucion = new iam.Role(this, 'RolEjecucionLambda', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      roleName: `${props.nombreAplicacion}-${props.entorno}-lambda-role`,
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // Permisos CloudWatch Logs con acceso granular
    this.rolEjecucion.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents'
      ],
      resources: [
        `arn:aws:logs:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:log-group:/aws/lambda/${props.nombreAplicacion}-${props.entorno}-*`
      ]
    }));

    // Permisos de trazado X-Ray
    this.rolEjecucion.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'xray:PutTraceSegments',
        'xray:PutTelemetryRecords'
      ],
      resources: ['*']
    }));

    // Permisos de uso de clave KMS
    this.claveKms.grantDecrypt(this.rolEjecucion);

    // Validación de políticas de seguridad
    this.agregarValidacionSeguridad();

    // Salidas
    new cdk.CfnOutput(this, 'IdClaveKMS', {
      value: this.claveKms.keyId,
      description: 'ID de Clave KMS para encriptación',
    });

    new cdk.CfnOutput(this, 'NombreBucketSeguridad', {
      value: this.bucketSeguridad.bucketName,
      description: 'Nombre del bucket de logs de seguridad',
    });
  }

  // Conceder acceso a clave KMS
  public concederAccesoClave(beneficiario: iam.IGrantable, ...acciones: string[]) {
    return iam.Grant.addToPrincipalOrResource({
      grantee: beneficiario,
      actions: acciones,
      resourceArns: [this.claveKms.keyArn],
      resource: this.claveKms
    });
  }

  // Conceder acceso de escritura al bucket de seguridad
  public concederEscrituraLogsSeguridad(beneficiario: iam.IGrantable) {
    return this.bucketSeguridad.grantWrite(beneficiario);
  }

  // Validación de políticas de seguridad usando Aspects
  private agregarValidacionSeguridad() {
    cdk.Aspects.of(this).add({
      visit: (nodo: any) => {
        // Verificación de encriptación de bucket S3
        if (nodo.node && nodo.node.id && nodo.node.id.includes('Bucket') && nodo instanceof cdk.aws_s3.CfnBucket) {
          if (!nodo.bucketEncryption) {
            cdk.Annotations.of(nodo).addError('Bucket S3 debe tener encriptación habilitada');
          }
        }
        
        // Verificación de encriptación de variables de entorno de función Lambda
        if (nodo instanceof cdk.aws_lambda.CfnFunction) {
          const environment = nodo.environment as any;
          if (!nodo.kmsKeyArn && environment?.Variables) {
            cdk.Annotations.of(nodo).addWarning('Función Lambda debería usar encriptación KMS para variables de entorno');
          }
        }
        
        // Verificación de política de confianza de rol IAM
        if (nodo instanceof cdk.aws_iam.CfnRole) {
          const trustPolicy = nodo.assumeRolePolicyDocument as any;
          if (trustPolicy && trustPolicy.Statement) {
            for (const statement of trustPolicy.Statement) {
              if (statement.Principal === '*' || (statement.Principal && statement.Principal.AWS === '*')) {
                cdk.Annotations.of(nodo).addError('Rol IAM no debería permitir asumir por cualquier principal (*)');
              }
            }
          }
        }
      }
    });
  }
}
```

### 1.2 Función Lambda Segura

Crea `lib/constructs/secure-lambda.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { FundamentosSeguridad } from '../security/security-foundation';

export interface PropsLambdaSegura {
  nombreFuncion: string;
  handler: string;
  codigo: lambda.Code;
  entorno?: { [key: string]: string };
  fundamentosSeguridad: FundamentosSeguridad;
  tamañoMemoria?: number;
  timeout?: cdk.Duration;
}

export class LambdaSegura extends Construct {
  public readonly funcion: lambda.Function;
  public readonly grupoLog: logs.LogGroup;

  constructor(scope: Construct, id: string, props: PropsLambdaSegura) {
    super(scope, id);

    // Grupo de logs personalizado para mejor control
    this.grupoLog = new logs.LogGroup(this, 'GrupoLog', {
      logGroupName: `/aws/lambda/${props.nombreFuncion}`,
      retention: logs.RetentionDays.ONE_MONTH,
      encryptionKey: props.fundamentosSeguridad.claveKms,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Función Lambda con mejores prácticas de seguridad
    this.funcion = new lambda.Function(this, 'Funcion', {
      functionName: props.nombreFuncion,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: props.handler,
      code: props.codigo,
      role: props.fundamentosSeguridad.rolEjecucion,
      environment: {
        ...props.entorno,
        KMS_KEY_ID: props.fundamentosSeguridad.claveKms.keyId,
      },
      environmentEncryption: props.fundamentosSeguridad.claveKms,
      memorySize: props.tamañoMemoria ?? 256,
      timeout: props.timeout ?? cdk.Duration.seconds(30),
      tracing: lambda.Tracing.ACTIVE,
      logGroup: this.grupoLog,
      reservedConcurrentExecutions: 10, // Prevenir costos descontrolados
      deadLetterQueueEnabled: true,
      retryAttempts: 2,
    });

    // Políticas de seguridad
    this.agregarPoliticasSeguridad();
  }

  private agregarPoliticasSeguridad() {
    // Denegar acceso a acciones sensibles
    this.funcion.addToRolePolicy(new iam.PolicyStatement({
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

    // Permitir solo operaciones KMS necesarias
    this.funcion.addToRolePolicy(new iam.PolicyStatement({
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

  // Conceder permisos específicos de DynamoDB
  public concederAccesoDynamoDB(arnTabla: string, acciones: string[]) {
    this.funcion.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: acciones,
      resources: [arnTabla, `${arnTabla}/index/*`]
    }));
  }

  // Conceder permisos específicos de S3
  public concederAccesoS3(arnBucket: string, acciones: string[]) {
    this.funcion.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: acciones,
      resources: [arnBucket, `${arnBucket}/*`]
    }));
  }
}
```

## 2. Monitoreo y Observabilidad

### 2.1 Monitoreo Comprehensivo

Crea `lib/monitoring/monitoring-construct.ts`:

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

export interface PropsMonitoreo {
  emailNotificacion?: string;
  entorno: string;
}

export class ConstructMonitoreo extends Construct {
  public readonly tablero: cloudwatch.Dashboard;
  public readonly topicoAlertas: sns.Topic;

  constructor(scope: Construct, id: string, props: PropsMonitoreo) {
    super(scope, id);

    // Tópico SNS para alertas
    this.topicoAlertas = new sns.Topic(this, 'TopicoAlertas', {
      topicName: `${props.entorno}-alertas`,
      displayName: `Alertas Entorno ${props.entorno}`,
    });

    if (props.emailNotificacion) {
      this.topicoAlertas.addSubscription(
        new subscriptions.EmailSubscription(props.emailNotificacion)
      );
    }

    // Tablero CloudWatch
    this.tablero = new cloudwatch.Dashboard(this, 'TableroMonitoreo', {
      dashboardName: `${props.entorno}-tablero-monitoreo`,
      defaultInterval: cdk.Duration.hours(1),
    });

    // Agregar widgets comunes
    this.agregarWidgetsComunes();
  }

  private agregarWidgetsComunes() {
    // Widget de salud del sistema
    this.tablero.addWidgets(
      new cloudwatch.TextWidget({
        markdown: `# Monitoreo Entorno ${this.node.tryGetContext('environment')}\n\nÚltima actualización: ${new Date().toISOString()}`,
        width: 24,
        height: 2,
      })
    );
  }

  // Agregar monitoreo de función Lambda
  public agregarMonitoreoLambda(
    func: lambda.Function, 
    opciones?: {
      umbralTasaError?: number;
      umbralDuracion?: number;
    }
  ) {
    const umbralTasaError = opciones?.umbralTasaError ?? 5;
    const umbralDuracion = opciones?.umbralDuracion ?? 10000;

    // Alarma de tasa de error
    const alarmaError = new cloudwatch.Alarm(this, `${func.functionName}AlarmaError`, {
      alarmName: `${func.functionName}-tasa-error-alta`,
      metric: func.metricErrors({
        period: cdk.Duration.minutes(5),
        statistic: 'Sum'
      }),
      threshold: umbralTasaError,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      alarmDescription: `Tasa de error alta detectada en ${func.functionName}`,
    });
    
    alarmaError.addAlarmAction(new actions.SnsAction(this.topicoAlertas));

    // Alarma de duración
    const alarmaDuracion = new cloudwatch.Alarm(this, `${func.functionName}AlarmaDuracion`, {
      alarmName: `${func.functionName}-duracion-alta`,
      metric: func.metricDuration({
        period: cdk.Duration.minutes(5),
        statistic: 'Average'
      }),
      threshold: umbralDuracion,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      alarmDescription: `Duración alta detectada en ${func.functionName}`,
    });
    
    alarmaDuracion.addAlarmAction(new actions.SnsAction(this.topicoAlertas));

    // Agregar widgets Lambda al tablero
    this.tablero.addWidgets(
      new cloudwatch.GraphWidget({
        title: `Métricas ${func.functionName}`,
        left: [
          func.metricInvocations({ label: 'Invocaciones' }),
          func.metricErrors({ label: 'Errores' }),
        ],
        right: [
          func.metricDuration({ label: 'Duración' }),
        ],
        width: 12,
        height: 6,
      }),
      new cloudwatch.LogQueryWidget({
        title: `Logs de Error ${func.functionName}`,
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

  // Agregar monitoreo API Gateway
  public agregarMonitoreoApiGateway(api: apigateway.RestApi) {
    // Alarmas de errores 4XX y 5XX
    const alarmaErrorCliente = new cloudwatch.Alarm(this, `${api.restApiName}AlarmaErrorCliente`, {
      alarmName: `${api.restApiName}-errores-4xx-altos`,
      metric: api.metricClientError({
        period: cdk.Duration.minutes(5),
        statistic: 'Sum'
      }),
      threshold: 10,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    });
    
    alarmaErrorCliente.addAlarmAction(new actions.SnsAction(this.topicoAlertas));

    const alarmaErrorServidor = new cloudwatch.Alarm(this, `${api.restApiName}AlarmaErrorServidor`, {
      alarmName: `${api.restApiName}-errores-5xx-altos`,
      metric: api.metricServerError({
        period: cdk.Duration.minutes(5),
        statistic: 'Sum'
      }),
      threshold: 5,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    });
    
    alarmaErrorServidor.addAlarmAction(new actions.SnsAction(this.topicoAlertas));

    // Agregar widgets API Gateway
    this.tablero.addWidgets(
      new cloudwatch.GraphWidget({
        title: `Métricas API ${api.restApiName}`,
        left: [
          api.metricCount({ label: 'Solicitudes' }),
          api.metricClientError({ label: 'Errores 4XX' }),
          api.metricServerError({ label: 'Errores 5XX' }),
        ],
        right: [
          api.metricLatency({ label: 'Latencia' }),
        ],
        width: 24,
        height: 6,
      })
    );
  }

  // Agregar monitoreo DynamoDB
  public agregarMonitoreoDynamoDB(tabla: dynamodb.Table) {
    // Alarma de throttling
    const alarmaThrottle = new cloudwatch.Alarm(this, `${tabla.tableName}AlarmaThrottle`, {
      alarmName: `${tabla.tableName}-throttling`,
      metric: tabla.metricThrottledRequestsForOperations({
        operations: [dynamodb.Operation.PUT_ITEM, dynamodb.Operation.GET_ITEM],
        period: cdk.Duration.minutes(5),
        statistic: 'Sum'
      }),
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    });
    
    alarmaThrottle.addAlarmAction(new actions.SnsAction(this.topicoAlertas));

    // Agregar widgets DynamoDB
    this.tablero.addWidgets(
      new cloudwatch.GraphWidget({
        title: `Métricas DynamoDB ${tabla.tableName}`,
        left: [
          tabla.metricConsumedReadCapacityUnits({ label: 'Capacidad Lectura' }),
          tabla.metricConsumedWriteCapacityUnits({ label: 'Capacidad Escritura' }),
        ],
        right: [
          tabla.metricSuccessfulRequestLatency({
            operations: [dynamodb.Operation.GET_ITEM],
            label: 'Latencia Get'
          }),
          tabla.metricSuccessfulRequestLatency({
            operations: [dynamodb.Operation.PUT_ITEM],
            label: 'Latencia Put'
          }),
        ],
        width: 24,
        height: 6,
      })
    );
  }

  // Agregar métrica personalizada
  public agregarMetricaPersonalizada(nombreMetrica: string, namespace: string, umbral: number) {
    const metricaPersonalizada = new cloudwatch.Metric({
      metricName: nombreMetrica,
      namespace,
      statistic: 'Average',
      period: cdk.Duration.minutes(5),
    });

    const alarmaPersonalizada = new cloudwatch.Alarm(this, `${nombreMetrica}Alarma`, {
      alarmName: `alarma-${nombreMetrica}-personalizada`,
      metric: metricaPersonalizada,
      threshold: umbral,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    });
    
    alarmaPersonalizada.addAlarmAction(new actions.SnsAction(this.topicoAlertas));

    this.tablero.addWidgets(
      new cloudwatch.GraphWidget({
        title: `Métrica Personalizada: ${nombreMetrica}`,
        left: [metricaPersonalizada],
        width: 12,
        height: 6,
      })
    );
  }

  // Agregar notificación por email
  public agregarNotificacionEmail(email: string) {
    this.topicoAlertas.addSubscription(new subscriptions.EmailSubscription(email));
  }
}
```

## 3. Stack Listo para Producción

### 3.1 Stack de Producción

Crea `lib/production-stack.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { FundamentosSeguridad } from './security/security-foundation';
import { ConstructMonitoreo } from './monitoring/monitoring-construct';
import { ConstructS3Bucket } from './s3-construct';
import { ConstructApiLambda } from './lambda-api-construct';
import { ConstructTodoApi } from './todo-api-construct';

export interface PropsStackProduccion extends cdk.StackProps {
  entorno: 'staging' | 'production';
  nombreAplicacion: string;
  emailNotificacion?: string;
}

export class StackProduccion extends cdk.Stack {
  public readonly seguridad: FundamentosSeguridad;
  public readonly monitoreo: ConstructMonitoreo;

  constructor(scope: Construct, id: string, props: PropsStackProduccion) {
    super(scope, id, {
      ...props,
      description: `Stack CDK listo para producción para ${props.nombreAplicacion} - ${props.entorno}`,
      tags: {
        Environment: props.entorno,
        Application: props.nombreAplicacion,
        CreatedBy: 'AWS CDK',
        CostCenter: props.entorno === 'production' ? 'produccion' : 'desarrollo'
      }
    });

    // Fundamentos de seguridad
    this.seguridad = new FundamentosSeguridad(this, 'Seguridad', {
      entorno: props.entorno,
      nombreAplicacion: props.nombreAplicacion,
      habilitarRotacionClave: props.entorno === 'production',
      habilitarCloudTrail: props.entorno === 'production'
    });

    // Bucket S3 grado producción
    const almacenamientoSeguro = new ConstructS3Bucket(this, 'AlmacenamientoSeguro', {
      versioned: true,
      publicReadAccess: false,
      bucketName: `${props.nombreAplicacion}-${props.entorno}-almacenamiento-seguro-${this.account}`
    });

    // API Lambda grado producción
    const apiProd = new ConstructApiLambda(this, 'ApiProd', {
      nombreFuncion: `${props.nombreAplicacion}-${props.entorno}-api`,
      nombreApi: `${props.nombreAplicacion}-${props.entorno}-api`,
      tamañoMemoria: props.entorno === 'production' ? 1024 : 512,
      timeout: cdk.Duration.seconds(props.entorno === 'production' ? 30 : 60)
    });

    // API Todo grado producción
    const todoApi = new ConstructTodoApi(this, 'ApiTodoProd');

    // Monitoreo comprehensivo
    this.monitoreo = new ConstructMonitoreo(this, 'Monitoreo', {
      entorno: props.entorno,
      emailNotificacion: props.emailNotificacion
    });
    
    // Monitorear componentes clave
    this.monitoreo.agregarMonitoreoLambda(apiProd.funcion, {
      umbralTasaError: props.entorno === 'production' ? 1 : 5,
      umbralDuracion: props.entorno === 'production' ? 5000 : 10000
    });
    
    this.monitoreo.agregarMonitoreoApiGateway(apiProd.api);
    this.monitoreo.agregarMonitoreoApiGateway(todoApi.api);
    this.monitoreo.agregarMonitoreoDynamoDB(todoApi.tabla);

    // Notificaciones por email para producción
    if (props.entorno === 'production' && props.emailNotificacion) {
      this.monitoreo.agregarNotificacionEmail(props.emailNotificacion);
    }

    // Configuraciones específicas de producción
    if (props.entorno === 'production') {
      this.agregarConfiguracionesEspecificasProduccion();
    }

    // Salidas del stack
    new cdk.CfnOutput(this, 'Entorno', {
      value: props.entorno,
      description: 'Entorno de despliegue'
    });

    new cdk.CfnOutput(this, 'EndpointApi', {
      value: apiProd.api.url,
      description: 'URL del endpoint API principal'
    });

    new cdk.CfnOutput(this, 'EndpointApiTodo', {
      value: todoApi.api.url,
      description: 'URL del endpoint API Todo'
    });

    new cdk.CfnOutput(this, 'TableroMonitoreo', {
      value: `https://console.aws.amazon.com/cloudwatch/home?region=${this.region}#dashboards:name=${this.monitoreo.tablero.dashboardName}`,
      description: 'URL del tablero de monitoreo CloudWatch'
    });
  }

  private agregarConfiguracionesEspecificasProduccion() {
    // Protección del stack de producción
    this.templateOptions.metadata = {
      'AWS::CloudFormation::Interface': {
        ParameterGroups: [
          {
            Label: { default: 'Configuración de Producción' },
            Parameters: []
          }
        ]
      }
    };

    // Protección contra terminación del stack
    const cfnStack = this.node.defaultChild as cdk.CfnStack;
    cfnStack.addPropertyOverride('EnableTerminationProtection', true);

    // Tags de recursos de producción
    cdk.Tags.of(this).add('BackupRequired', 'true');
    cdk.Tags.of(this).add('ComplianceLevel', 'high');
    cdk.Tags.of(this).add('DataClassification', 'confidential');

    // Detección de drift de CloudFormation
    new cdk.CfnOutput(this, 'ComandoDeteccionDrift', {
      value: `aws cloudformation detect-stack-drift --stack-name ${this.stackName}`,
      description: 'Comando para detectar drift de configuración'
    });

    // Verificaciones de salud de producción
    this.agregarVerificacionesSaludProduccion();
  }

  private agregarVerificacionesSaludProduccion() {
    // Recurso personalizado para verificaciones de salud
    new cdk.CustomResource(this, 'VerificacionSalud', {
      serviceToken: new cdk.aws_lambda.Function(this, 'FuncionVerificacionSalud', {
        runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        handler: 'index.handler',
        code: cdk.aws_lambda.Code.fromInline(`
          const AWS = require('aws-sdk');
          const response = require('cfn-response');

          exports.handler = async (event, context) => {
            console.log('Verificación de salud activada:', JSON.stringify(event));
            
            try {
              // Verificaciones básicas de salud
              const verificaciones = {
                timestamp: new Date().toISOString(),
                region: process.env.AWS_REGION,
                stackName: event.StackId?.split('/')[1] || 'desconocido'
              };
              
              console.log('Resultados verificación de salud:', verificaciones);
              
              // Enviar respuesta de éxito a CloudFormation
              await response.send(event, context, response.SUCCESS, verificaciones);
            } catch (error) {
              console.error('Verificación de salud falló:', error);
              await response.send(event, context, response.FAILED, {
                error: error.message
              });
            }
          };
        `),
        role: this.seguridad.rolEjecucion,
        timeout: cdk.Duration.minutes(1)
      }).functionArn
    });
  }
}
```

### 3.2 App Multi-Entorno

Actualiza tu punto de entrada de la aplicación `bin/mi-primera-app-cdk.ts`:

```typescript
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MiPrimeraAppCdkStack } from '../lib/mi-primera-app-cdk-stack';
import { StackProduccion } from '../lib/production-stack';

const app = new cdk.App();

// Configuración de entorno
const entorno = app.node.tryGetContext('environment') || 'development';
const nombreAplicacion = 'mi-app-cdk';

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
};

// Stack de desarrollo (stack de aprendizaje comprehensivo)
if (entorno === 'development') {
  new MiPrimeraAppCdkStack(app, 'MiPrimeraAppCdkStack', {
    env,
    description: 'Stack de desarrollo con todos los ejercicios del tutorial CDK',
    tags: {
      Environment: 'development',
      Application: nombreAplicacion,
      Purpose: 'learning'
    }
  });
}

// Entorno staging
if (entorno === 'staging') {
  new StackProduccion(app, `${nombreAplicacion}-staging`, {
    env,
    entorno: 'staging',
    nombreAplicacion,
    emailNotificacion: process.env.NOTIFICATION_EMAIL,
    description: 'Entorno staging para aplicación tutorial CDK',
    tags: {
      Environment: 'staging',
      Application: nombreAplicacion,
      CostCenter: 'development'
    }
  });
}

// Entorno producción
if (entorno === 'production') {
  new StackProduccion(app, `${nombreAplicacion}-production`, {
    env,
    entorno: 'production',
    nombreAplicacion,
    emailNotificacion: process.env.NOTIFICATION_EMAIL,
    description: 'Entorno producción para aplicación tutorial CDK',
    tags: {
      Environment: 'production',
      Application: nombreAplicacion,
      CostCenter: 'production',
      BackupRequired: 'true',
      ComplianceLevel: 'high'
    }
  });
}
```

## 4. Backup y Recuperación ante Desastres

### 4.1 Estrategia de Backup Automatizada

Crea `lib/backup/backup-construct.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import * as backup from 'aws-cdk-lib/aws-backup';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface PropsConstructBackup {
  entorno: string;
  diasRetencion: number;
}

export class ConstructBackup extends Construct {
  public readonly vaultBackup: backup.BackupVault;
  public readonly planBackup: backup.BackupPlan;

  constructor(scope: Construct, id: string, props: PropsConstructBackup) {
    super(scope, id);

    // Vault de backup con encriptación
    this.vaultBackup = new backup.BackupVault(this, 'VaultBackup', {
      backupVaultName: `${props.entorno}-vault-backup`,
      encryptionKey: cdk.aws_kms.Alias.fromAliasName(this, 'ClaveBackup', 'alias/aws/backup'),
      removalPolicy: props.entorno === 'production' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
    });

    // Plan de backup
    this.planBackup = backup.BackupPlan.dailyWeeklyMonthly5YearRetention(this, 'PlanBackup', {
      backupPlanName: `${props.entorno}-plan-backup`,
      backupVault: this.vaultBackup,
    });

    // Regla de backup adicional para datos críticos
    if (props.entorno === 'production') {
      this.planBackup.addRule(backup.BackupPlanRule.fromProps({
        ruleName: 'BackupDatosCriticos',
        scheduleExpression: backup.ScheduleExpression.cron({
          hour: '2',
          minute: '0'
        }),
        deleteAfter: cdk.Duration.days(props.diasRetencion),
        moveToColdStorageAfter: cdk.Duration.days(30),
        copyActions: [{
          destinationBackupVault: this.vaultBackup,
          deleteAfter: cdk.Duration.days(props.diasRetencion * 2),
        }],
      }));
    }
  }

  // Agregar tabla DynamoDB al backup
  public agregarTablaDynamoDB(tabla: dynamodb.Table) {
    this.planBackup.addSelection('BackupDynamoDB', {
      resources: [
        backup.BackupResource.fromDynamoDbTable(tabla)
      ],
      allowRestores: true,
    });
  }

  // Agregar bucket S3 al backup (vía política de ciclo de vida)
  public agregarBackupBucketS3(bucket: s3.Bucket) {
    bucket.addLifecycleRule({
      id: 'CicloVidaBackup',
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

## 5. Excelencia Operacional

### 5.1 Tablero Operacional

Crea un tablero operacional comprehensivo:

```typescript
// Agregar a tu construct de monitoreo
public crearTableroOperacional() {
  const tableroOperacional = new cloudwatch.Dashboard(this, 'TableroOperacional', {
    dashboardName: `${this.entorno}-tablero-operacional`,
    defaultInterval: cdk.Duration.hours(24),
  });

  // Widget de seguimiento de costos
  tableroOperacional.addWidgets(
    new cloudwatch.LogQueryWidget({
      title: 'Análisis de Costos',
      logGroups: [],
      queryLines: [
        'fields @timestamp, @message',
        'filter @message like /BILLING/',
        'stats count() by bin(5m)'
      ],
      width: 12,
      height: 6,
    }),
    
    // Resumen de rendimiento
    new cloudwatch.GraphWidget({
      title: 'Resumen de Rendimiento',
      left: [
        new cloudwatch.Metric({
          metricName: 'Invocations',
          namespace: 'AWS/Lambda',
          statistic: 'Sum'
        }),
      ],
      width: 12,
      height: 6,
    }),

    // Resumen de errores en todos los servicios
    new cloudwatch.GraphWidget({
      title: 'Resumen de Errores',
      left: [
        new cloudwatch.Metric({
          metricName: 'Errors',
          namespace: 'AWS/Lambda',
          statistic: 'Sum'
        }),
        new cloudwatch.Metric({
          metricName: '5XXError',
          namespace: 'AWS/ApiGateway',
          statistic: 'Sum'
        }),
      ],
      width: 24,
      height: 6,
    })
  );

  return tableroOperacional;
}
```

### 5.2 Remediación Automatizada

Crea `lib/automation/auto-remediation.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';

export class ConstructAutoRemediacion extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Lambda de auto-remediación
    const funcionRemediacion = new lambda.Function(this, 'FuncionRemediacion', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const AWS = require('aws-sdk');
        const cloudwatch = new AWS.CloudWatch();
        const lambda = new AWS.Lambda();

        exports.handler = async (event) => {
          console.log('Alarma recibida:', JSON.stringify(event, null, 2));
          
          const detalle = event.detail;
          const nombreAlarma = detalle.alarmName;
          const estado = detalle.state.value;
          
          if (estado === 'ALARM') {
            try {
              if (nombreAlarma.includes('tasa-error-alta')) {
                // Reiniciar función Lambda (limpiar conexiones en caché)
                const nombreFuncion = nombreAlarma.split('-')[0];
                await lambda.updateFunctionConfiguration({
                  FunctionName: nombreFuncion,
                  Environment: {
                    Variables: {
                      ...process.env,
                      RESTART_TIMESTAMP: Date.now().toString()
                    }
                  }
                }).promise();
                
                console.log(\`Reinicio activado para función: \${nombreFuncion}\`);
              }
              
              if (nombreAlarma.includes('duracion-alta')) {
                // Escalar memoria para alarmas de duración alta
                const nombreFuncion = nombreAlarma.split('-')[0];
                const config = await lambda.getFunctionConfiguration({
                  FunctionName: nombreFuncion
                }).promise();
                
                const nuevaMemoria = Math.min(config.MemorySize * 1.5, 3008);
                
                await lambda.updateFunctionConfiguration({
                  FunctionName: nombreFuncion,
                  MemorySize: nuevaMemoria
                }).promise();
                
                console.log(\`Memoria aumentada para \${nombreFuncion} a \${nuevaMemoria}MB\`);
              }
              
            } catch (error) {
              console.error('Remediación falló:', error);
              throw error;
            }
          }
          
          return { statusCode: 200, body: 'Remediación completada' };
        };
      `),
      timeout: cdk.Duration.seconds(60),
    });

    // Regla CloudWatch Events para cambios de estado de alarma
    const reglaAlarma = new events.Rule(this, 'ReglaAlarma', {
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

    reglaAlarma.addTarget(new targets.LambdaFunction(funcionRemediacion));

    // Conceder permisos necesarios
    funcionRemediacion.addToRolePolicy(new cdk.aws_iam.PolicyStatement({
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

## 6. Resumen y Mejores Prácticas

### 6.1 Lista de Verificación de Despliegue de Producción

✅ **Seguridad**
- Encriptación KMS para todos los datos en reposo
- Roles IAM con principio de menor privilegio
- Grupos de seguridad con acceso mínimo requerido
- Logging de CloudTrail habilitado

✅ **Monitoreo y Alertas**
- Tableros CloudWatch para métricas clave
- Alarmas para tasas de error, latencia y costos
- Notificaciones SNS para alertas críticas
- Agregación y análisis de logs

✅ **Backup y Recuperación**
- Estrategias de backup automatizadas
- Backup entre regiones para datos críticos
- Procedimientos de recuperación ante desastres documentados
- Testing de recuperación realizado regularmente

✅ **Excelencia Operacional**
- Infraestructura como Código para todos los recursos
- Pipelines de despliegue automatizado
- Detección de drift de configuración
- Remediación automatizada donde sea posible

✅ **Rendimiento y Costos**
- Dimensionamiento correcto de recursos
- Capacidad reservada donde sea apropiado
- Monitoreo y alertas de costos
- Optimización de rendimiento basada en métricas

### 6.2 Comandos de Operaciones Diarias

```bash
# Desplegar a diferentes entornos
cdk deploy --context environment=dev
cdk deploy --context environment=staging
cdk deploy --context environment=production

# Monitorear drift del stack
aws cloudformation detect-stack-drift --stack-name MiStack

# Ver tablero de monitoreo
aws cloudwatch get-dashboard --dashboard-name prod-tablero-monitoreo

# Verificar estado de backup
aws backup list-backup-jobs --by-backup-vault-name prod-vault-backup

# Ver alarmas recientes
aws cloudwatch describe-alarms --state-value ALARM --max-records 10
```

### 6.3 Guía de Solución de Problemas

**Tasas de Error Altas**
1. Verificar CloudWatch Logs para patrones de error
2. Revisar despliegues recientes
3. Verificar dependencias externas
4. Escalar recursos si es necesario

**Latencia Alta**
1. Verificar pooling de conexiones de base de datos
2. Revisar asignación de memoria Lambda
3. Analizar impactos de arranque en frío
4. Verificar caché de API Gateway

**Picos de Costo**
1. Revisar métricas de costo de CloudWatch
2. Verificar funciones descontroladas
3. Revisar costos de transferencia de datos
4. Validar dimensionamiento correcto de recursos

## Ejercicio Final: Aplicación de Producción Completa

Despliega una aplicación completamente lista para producción con:

1. **Soporte multi-entorno** (dev/staging/prod)
2. **Seguridad comprehensiva** (KMS, IAM, grupos de seguridad)
3. **Monitoreo completo** (tableros, alarmas, logs)
4. **Backups automatizados** (DynamoDB, S3)
5. **Pipeline CI/CD** (GitHub Actions)
6. **Auto-remediación** (auto-sanación básica)

```bash
# Desplegar la solución completa
export NOTIFICATION_EMAIL=tu-email@dominio.com
cdk deploy --context environment=production
```

## ¡Felicidades! 🎉

Has completado exitosamente el viaje de 5 días con AWS CDK! Ahora tienes:

1. ✅ **Base Sólida de CDK** - Entendimiento de constructs, stacks y apps
2. ✅ **Experiencia Práctica** - Construiste aplicaciones reales con servicios de AWS
3. ✅ **Patrones Avanzados** - Constructs personalizados y referencias entre stacks
4. ✅ **Conocimiento de Testing** - Pruebas unitarias, de integración y end-to-end
5. ✅ **Habilidades de Producción** - Seguridad, monitoreo y excelencia operacional

### Próximos Pasos

- **Explorar Patrones CDK** - Aprende más patrones de diseño de AWS
- **Contribuir a CDK** - Únete a la comunidad de código abierto
- **Construir tus Propios Constructs** - Crea componentes reutilizables para tu organización
- **Temas Avanzados** - Despliegues multi-región, CDK Pipelines, Recursos Personalizados

### Recursos para Aprendizaje Continuo

- [Documentación AWS CDK](https://docs.aws.amazon.com/cdk/)
- [Patrones CDK](https://cdkpatterns.com/)
- [Ejemplos AWS CDK](https://github.com/aws-samples/aws-cdk-examples)
- [Taller CDK](https://cdkworkshop.com/)

¡Sigue construyendo, sigue aprendiendo, y bienvenido a la revolución de Infraestructura como Código! 🚀