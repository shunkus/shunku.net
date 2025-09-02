---
title: Día 3 - Constructs Avanzados y Patrones
order: 4
---

# Día 3 - Constructs Avanzados y Patrones

## Objetivos de Hoy

1. Crear constructs personalizados reutilizables
2. Aprender patrones avanzados de CDK y mejores prácticas
3. Implementar compartir recursos entre stacks
4. Construir una arquitectura de aplicación de múltiples capas
5. Entender CDK Aspects para gobernanza

## 1. Constructs Personalizados

### 1.1 Creando un Construct Web API Reutilizable

Crea un nuevo archivo `lib/web-api-construct.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export interface PropsWebApi {
  nombreTabla?: string;
  memoriaLambda?: number;
  nombreApi?: string;
}

export class ConstructWebApi extends Construct {
  public readonly api: apigateway.RestApi;
  public readonly tabla: dynamodb.Table;
  public readonly funcionLambda: lambda.Function;

  constructor(scope: Construct, id: string, props?: PropsWebApi) {
    super(scope, id);

    // Tabla DynamoDB
    this.tabla = new dynamodb.Table(this, 'TablaApi', {
      tableName: props?.nombreTabla || `${id}-tabla`,
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Función Lambda
    this.funcionLambda = new lambda.Function(this, 'FuncionApi', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const AWS = require('aws-sdk');
        const dynamodb = new AWS.DynamoDB.DocumentClient();
        
        exports.handler = async (event) => {
          const metodo = event.httpMethod;
          const ruta = event.path;
          const nombreTabla = process.env.TABLE_NAME;
          
          console.log('Solicitud:', { metodo, ruta, nombreTabla });
          
          try {
            let respuesta;
            
            switch (metodo) {
              case 'GET':
                if (ruta === '/items') {
                  const resultado = await dynamodb.scan({
                    TableName: nombreTabla,
                    Limit: 50
                  }).promise();
                  respuesta = { items: resultado.Items || [] };
                } else {
                  respuesta = { mensaje: '¡Hola desde Web API!', ruta, metodo };
                }
                break;
                
              case 'POST':
                if (ruta === '/items') {
                  const cuerpo = JSON.parse(event.body || '{}');
                  const item = {
                    pk: 'ITEM',
                    sk: Date.now().toString(),
                    ...cuerpo,
                    fechaCreacion: new Date().toISOString()
                  };
                  
                  await dynamodb.put({
                    TableName: nombreTabla,
                    Item: item
                  }).promise();
                  
                  respuesta = { mensaje: 'Item creado', item };
                } else {
                  respuesta = { mensaje: 'Endpoint POST', ruta };
                }
                break;
                
              default:
                respuesta = { mensaje: 'Método no soportado', metodo };
            }
            
            return {
              statusCode: 200,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(respuesta)
            };
            
          } catch (error) {
            console.error('Error:', error);
            return {
              statusCode: 500,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                error: 'Error interno del servidor',
                mensaje: error.message
              })
            };
          }
        };
      `),
      memorySize: props?.memoriaLambda || 256,
      timeout: cdk.Duration.seconds(30),
      environment: {
        TABLE_NAME: this.tabla.tableName,
      },
    });

    // Conceder permisos de Lambda a DynamoDB
    this.tabla.grantReadWriteData(this.funcionLambda);

    // API Gateway
    this.api = new apigateway.RestApi(this, 'Api', {
      restApiName: props?.nombreApi || `${id}-api`,
      description: 'Web API con Lambda y DynamoDB',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // Integración Lambda
    const integracionLambda = new apigateway.LambdaIntegration(this.funcionLambda);

    // Rutas de API
    this.api.root.addMethod('GET', integracionLambda);
    
    const recursoItems = this.api.root.addResource('items');
    recursoItems.addMethod('GET', integracionLambda);
    recursoItems.addMethod('POST', integracionLambda);
  }

  // Método auxiliar para agregar rutas personalizadas
  public agregarRuta(ruta: string, metodo: string): apigateway.Resource {
    const recurso = this.api.root.addResource(ruta);
    const integracion = new apigateway.LambdaIntegration(this.funcionLambda);
    recurso.addMethod(metodo, integracion);
    return recurso;
  }
}
```

### 1.2 Usando el Construct Personalizado

Actualiza tu stack principal para usar el construct personalizado:

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ConstructWebApi } from './web-api-construct';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

export class MiPrimeraAppCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const entorno = this.node.tryGetContext('environment') || 'dev';

    // Sitio Web Estático (del Día 2)
    const bucketSitioWeb = new s3.Bucket(this, 'BucketSitioWeb', {
      bucketName: `mi-bucket-sitio-web-${entorno}-${Date.now()}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OAI');
    bucketSitioWeb.grantRead(originAccessIdentity);

    const distribucion = new cloudfront.Distribution(this, 'DistribucionSitioWeb', {
      defaultBehavior: {
        origin: new origins.S3Origin(bucketSitioWeb, { originAccessIdentity }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
    });

    // NUEVO: Usar nuestro construct Web API personalizado
    const webApi = new ConstructWebApi(this, 'WebApi', {
      nombreTabla: `tabla-web-api-${entorno}`,
      memoriaLambda: entorno === 'prod' ? 512 : 256,
      nombreApi: `web-api-${entorno}`,
    });

    // Agregar rutas personalizadas a la API
    webApi.agregarRuta('salud', 'GET');
    webApi.agregarRuta('usuarios', 'GET');

    // Desplegar contenido del sitio web
    new s3deploy.BucketDeployment(this, 'DespliegeSitioWeb', {
      sources: [s3deploy.Source.asset('./sitio-web')],
      destinationBucket: bucketSitioWeb,
      distribution: distribucion,
      distributionPaths: ['/*'],
    });

    // Salidas
    new cdk.CfnOutput(this, 'URLSitioWeb', {
      value: `https://${distribucion.distributionDomainName}`,
      description: 'URL del Sitio Web CloudFront',
    });

    new cdk.CfnOutput(this, 'EndpointApi', {
      value: webApi.api.url,
      description: 'Endpoint de API Gateway',
    });

    new cdk.CfnOutput(this, 'NombreTablaDynamoDB', {
      value: webApi.tabla.tableName,
      description: 'Nombre de la Tabla DynamoDB',
    });
  }
}
```

## 2. Patrones Avanzados

### 2.1 Referencias Entre Stacks

Crea stacks separados para diferentes responsabilidades:

Crea `lib/database-stack.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class DatabaseStack extends cdk.Stack {
  public readonly tablaUsuarios: dynamodb.Table;
  public readonly baseDatos: rds.DatabaseInstance;
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC para RDS
    this.vpc = new ec2.Vpc(this, 'AppVpc', {
      maxAzs: 2,
      natGateways: 1,
    });

    // DynamoDB para sesiones de usuario
    this.tablaUsuarios = new dynamodb.Table(this, 'TablaUsuarios', {
      tableName: `usuarios-${this.stackName}`,
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // RDS para datos de aplicación (opcional - para demostración)
    this.baseDatos = new rds.DatabaseInstance(this, 'BaseDatosApp', {
      engine: rds.DatabaseInstanceEngine.mysql({
        version: rds.MysqlEngineVersion.VER_8_0_35,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MICRO),
      credentials: rds.Credentials.fromGeneratedSecret('admin'),
      vpc: this.vpc,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      deletionProtection: false,
    });

    // Exportar valores para referencia entre stacks
    new cdk.CfnOutput(this, 'NombreTablaUsuarios', {
      value: this.tablaUsuarios.tableName,
      exportName: `${this.stackName}-NombreTablaUsuarios`,
    });

    new cdk.CfnOutput(this, 'IdVpc', {
      value: this.vpc.vpcId,
      exportName: `${this.stackName}-IdVpc`,
    });
  }
}
```

Crea `lib/application-stack.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export interface PropsApplicationStack extends cdk.StackProps {
  nombreTablaUsuarios: string;
  idVpc: string;
}

export class ApplicationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PropsApplicationStack) {
    super(scope, id, props);

    // Importar VPC del Stack de Base de Datos
    const vpc = ec2.Vpc.fromLookup(this, 'VpcImportado', {
      vpcId: props.idVpc,
    });

    // Función Lambda que usa la tabla de usuarios compartida
    const servicioUsuarios = new lambda.Function(this, 'ServicioUsuarios', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const AWS = require('aws-sdk');
        const dynamodb = new AWS.DynamoDB.DocumentClient();
        
        exports.handler = async (event) => {
          const nombreTabla = process.env.USER_TABLE_NAME;
          
          try {
            const resultado = await dynamodb.scan({
              TableName: nombreTabla,
              Limit: 10
            }).promise();
            
            return {
              statusCode: 200,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                usuarios: resultado.Items || [],
                cuenta: resultado.Count || 0
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
        USER_TABLE_NAME: props.nombreTablaUsuarios,
      },
      vpc: vpc, // Desplegar Lambda en VPC
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'ApiUsuarios', {
      restApiName: 'API de Servicio de Usuarios',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const integracionUsuarios = new apigateway.LambdaIntegration(servicioUsuarios);
    api.root.addResource('usuarios').addMethod('GET', integracionUsuarios);

    new cdk.CfnOutput(this, 'UrlApiUsuarios', {
      value: api.url,
      description: 'URL de API de Servicio de Usuarios',
    });
  }
}
```

Actualiza tu punto de entrada de la aplicación para usar múltiples stacks:

```typescript
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DatabaseStack } from '../lib/database-stack';
import { ApplicationStack } from '../lib/application-stack';

const app = new cdk.App();
const entorno = app.node.tryGetContext('environment') || 'dev';

const stackBaseDatos = new DatabaseStack(app, `DatabaseStack-${entorno}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

const stackAplicacion = new ApplicationStack(app, `ApplicationStack-${entorno}`, {
  nombreTablaUsuarios: stackBaseDatos.tablaUsuarios.tableName,
  idVpc: stackBaseDatos.vpc.vpcId,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

// Asegurar orden de despliegue apropiado
stackAplicacion.addDependency(stackBaseDatos);
```

## 3. CDK Aspects para Gobernanza

### 3.1 Aspect de Seguridad

Crea `lib/security-aspect.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { IConstruct } from 'constructs';

export class AspectSeguridad implements cdk.IAspect {
  visit(nodo: IConstruct): void {
    // Asegurar que todos los buckets S3 tengan encriptación
    if (nodo instanceof s3.CfnBucket) {
      if (!nodo.bucketEncryption) {
        cdk.Annotations.of(nodo).addError(
          'El bucket S3 debe tener encriptación habilitada'
        );
      }
    }

    // Asegurar que las funciones Lambda tengan timeouts razonables
    if (nodo instanceof lambda.CfnFunction) {
      if (!nodo.timeout || nodo.timeout > 300) {
        cdk.Annotations.of(nodo).addWarning(
          'El timeout de Lambda debería ser menor a 5 minutos'
        );
      }
    }

    // Verificar valores hardcodeados que deberían ser parametrizados
    if (nodo instanceof cdk.CfnResource) {
      const plantilla = JSON.stringify(nodo._toCloudFormation());
      if (plantilla.includes('password') || plantilla.includes('secret')) {
        cdk.Annotations.of(nodo).addWarning(
          'Posibles credenciales hardcodeadas detectadas'
        );
      }
    }
  }
}
```

### 3.2 Aspect de Optimización de Costos

Crea `lib/cost-aspect.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { IConstruct } from 'constructs';

export class AspectOptimizacionCostos implements cdk.IAspect {
  constructor(private entorno: string) {}

  visit(nodo: IConstruct): void {
    // En entornos no-producción, sugerir tipos de instancia más pequeños
    if (this.entorno !== 'prod') {
      if (nodo instanceof ec2.CfnInstance) {
        if (nodo.instanceType && !nodo.instanceType.includes('micro') && !nodo.instanceType.includes('small')) {
          cdk.Annotations.of(nodo).addWarning(
            `Considera usar un tipo de instancia más pequeño en entorno ${this.entorno}`
          );
        }
      }

      if (nodo instanceof rds.CfnDBInstance) {
        if (nodo.dbInstanceClass && !nodo.dbInstanceClass.includes('micro')) {
          cdk.Annotations.of(nodo).addWarning(
            `Considera usar db.t3.micro en entorno ${this.entorno}`
          );
        }
      }
    }

    // Verificar NAT Gateways en desarrollo
    if (this.entorno === 'dev' && nodo instanceof ec2.CfnNatGateway) {
      cdk.Annotations.of(nodo).addWarning(
        'NAT Gateway genera cargos. Considera usar NAT Instance para desarrollo'
      );
    }
  }
}
```

### 3.3 Aplicar Aspects a tu Stack

Actualiza tu stack para usar Aspects:

```typescript
import { AspectSeguridad } from './security-aspect';
import { AspectOptimizacionCostos } from './cost-aspect';

export class MiPrimeraAppCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const entorno = this.node.tryGetContext('environment') || 'dev';

    // ... tus recursos existentes ...

    // Aplicar aspects de gobernanza
    cdk.Aspects.of(this).add(new AspectSeguridad());
    cdk.Aspects.of(this).add(new AspectOptimizacionCostos(entorno));
  }
}
```

## 4. Ejercicio: Construir una Aplicación Completa

### 4.1 Requisitos

Construye una aplicación de todos con:
- Frontend hospedado en CloudFront + S3
- API Gateway + Lambda para backend
- DynamoDB para almacenamiento de datos
- Seguridad y monitoreo apropiados

### 4.2 Estructura de la Solución

```
lib/
├── todo-app-stack.ts          # Stack de aplicación principal
├── constructs/
│   ├── todo-api.ts            # Construct de API Todo
│   ├── todo-frontend.ts       # Construct de hosting frontend
│   └── todo-database.ts       # Construct de base de datos
└── aspects/
    ├── security-aspect.ts     # Gobernanza de seguridad
    └── monitoring-aspect.ts   # Gobernanza de monitoreo
```

### 4.3 Construct de API Todo

Crea `lib/constructs/todo-api.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export interface PropsTodoApi {
  tabla: dynamodb.Table;
}

export class ConstructTodoApi extends Construct {
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: PropsTodoApi) {
    super(scope, id);

    // Función Lambda para operaciones Todo
    const funcionTodo = new lambda.Function(this, 'FuncionTodo', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const AWS = require('aws-sdk');
        const dynamodb = new AWS.DynamoDB.DocumentClient();
        const { v4: uuidv4 } = require('uuid');
        
        exports.handler = async (event) => {
          const metodo = event.httpMethod;
          const ruta = event.path;
          const nombreTabla = process.env.TABLE_NAME;
          
          console.log('Solicitud:', { metodo, ruta, cuerpo: event.body });
          
          try {
            let respuesta;
            
            switch (metodo) {
              case 'GET':
                if (ruta === '/todos') {
                  const resultado = await dynamodb.scan({
                    TableName: nombreTabla,
                  }).promise();
                  respuesta = { todos: resultado.Items || [] };
                } else {
                  respuesta = { mensaje: 'API Todo', version: '1.0.0' };
                }
                break;
                
              case 'POST':
                if (ruta === '/todos') {
                  const cuerpo = JSON.parse(event.body || '{}');
                  const todo = {
                    id: uuidv4(),
                    texto: cuerpo.texto || '',
                    completado: false,
                    fechaCreacion: new Date().toISOString(),
                  };
                  
                  await dynamodb.put({
                    TableName: nombreTabla,
                    Item: todo,
                  }).promise();
                  
                  respuesta = { mensaje: 'Todo creado', todo };
                }
                break;
                
              case 'PUT':
                if (ruta.startsWith('/todos/')) {
                  const id = ruta.split('/')[2];
                  const cuerpo = JSON.parse(event.body || '{}');
                  
                  await dynamodb.update({
                    TableName: nombreTabla,
                    Key: { id },
                    UpdateExpression: 'SET completado = :completado, fechaActualizacion = :fechaActualizacion',
                    ExpressionAttributeValues: {
                      ':completado': cuerpo.completado || false,
                      ':fechaActualizacion': new Date().toISOString(),
                    },
                  }).promise();
                  
                  respuesta = { mensaje: 'Todo actualizado' };
                }
                break;
                
              case 'DELETE':
                if (ruta.startsWith('/todos/')) {
                  const id = ruta.split('/')[2];
                  
                  await dynamodb.delete({
                    TableName: nombreTabla,
                    Key: { id },
                  }).promise();
                  
                  respuesta = { mensaje: 'Todo eliminado' };
                }
                break;
                
              default:
                respuesta = { mensaje: 'Método no permitido' };
            }
            
            return {
              statusCode: 200,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(respuesta),
            };
            
          } catch (error) {
            console.error('Error:', error);
            return {
              statusCode: 500,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                error: 'Error interno del servidor',
                mensaje: error.message,
              }),
            };
          }
        };
      `),
      environment: {
        TABLE_NAME: props.tabla.tableName,
      },
      timeout: cdk.Duration.seconds(30),
    });

    // Conceder permisos
    props.tabla.grantReadWriteData(funcionTodo);

    // API Gateway
    this.api = new apigateway.RestApi(this, 'TodoApi', {
      restApiName: 'API Todo',
      description: 'API de aplicación Todo',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const integracionLambda = new apigateway.LambdaIntegration(funcionTodo);

    // Rutas
    this.api.root.addMethod('GET', integracionLambda);
    
    const recursoTodos = this.api.root.addResource('todos');
    recursoTodos.addMethod('GET', integracionLambda);
    recursoTodos.addMethod('POST', integracionLambda);
    
    const recursoTodo = recursoTodos.addResource('{id}');
    recursoTodo.addMethod('PUT', integracionLambda);
    recursoTodo.addMethod('DELETE', integracionLambda);
  }
}
```

## Resumen

Hoy aprendiste:

1. ✅ Crear constructs personalizados reutilizables
2. ✅ Patrones avanzados de CDK y mejores prácticas  
3. ✅ Compartir recursos entre stacks y dependencias
4. ✅ CDK Aspects para gobernanza y cumplimiento
5. ✅ Construir aplicaciones complejas de múltiples capas

### Conceptos Clave Cubiertos

- **Constructs Personalizados**: Encapsular múltiples recursos en componentes reutilizables
- **Referencias Entre Stacks**: Compartir recursos entre diferentes stacks
- **CDK Aspects**: Implementar verificaciones de gobernanza y cumplimiento
- **Arquitectura de Múltiples Capas**: Separar responsabilidades en diferentes stacks

### Patrón de Arquitectura Construido

```
Stack Frontend    →  Stack Aplicación  →  Stack Base de Datos
(S3 + CloudFront) →  (Lambda + API GW)   →  (DynamoDB + RDS)
```

### Próximos Pasos

Mañana (Día 4), nos enfocaremos en probar tus aplicaciones CDK, configurar pipelines CI/CD y asegurar la calidad del código a través de estrategias de testing automatizado.

---

**Consejos de Mejores Prácticas del Día 3:**

1. **Diseño de Constructs**: Hace los constructs configurables y reutilizables
2. **Separación de Stacks**: Separa responsabilidades por ciclo de vida (base de datos vs aplicación)
3. **Gobernanza**: Usa Aspects para hacer cumplir estándares organizacionales
4. **Nomenclatura de Recursos**: Usa nomenclatura consistente y consciente del entorno
5. **Referencias Cruzadas**: Minimiza el acoplamiento fuerte entre stacks