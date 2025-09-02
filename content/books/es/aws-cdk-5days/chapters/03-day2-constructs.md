---
title: Día 2 - Entendiendo Constructs Principales y Stacks
order: 3
---

# Día 2 - Entendiendo Constructs Principales y Stacks

## Objetivos de Hoy

1. Entender la estructura jerárquica de Construct, Stack y App
2. Combinar múltiples servicios de AWS
3. Construir la base de una aplicación web serverless
4. Aprender gestión de configuración específica del entorno

## 1. Estructura de Tres Capas de CDK

### 1.1 Entendiendo la Jerarquía de Constructs

CDK proporciona tres niveles de Constructs:

#### Constructs L1 (Recursos CFN)
- Wrappers directos alrededor de recursos CloudFormation
- Con prefijo `Cfn`
- Control más granular posible, pero configuración compleja

```typescript
import * as cdk from 'aws-cdk-lib';

// Ejemplo de Construct L1
const cfnBucket = new cdk.aws_s3.CfnBucket(this, 'BucketL1', {
  bucketName: 'mi-bucket-l1',
  versioningConfiguration: {
    status: 'Enabled'
  }
});
```

#### Constructs L2 (Constructs AWS)
- Wrappers de alto nivel para servicios de AWS
- Proporcionan valores predeterminados sensatos
- Más comúnmente utilizados

```typescript
import * as s3 from 'aws-cdk-lib/aws-s3';

// Ejemplo de Construct L2
const bucket = new s3.Bucket(this, 'BucketL2', {
  versioned: true,
  bucketName: 'mi-bucket-l2'
});
```

#### Constructs L3 (Patrones)
- Patrones que combinan múltiples servicios de AWS
- Incorporan mejores prácticas
- Diseñados para casos de uso específicos

```typescript
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

// Ejemplo de Construct L3
new s3deploy.BucketDeployment(this, 'DesplieguneSitioWeb', {
  sources: [s3deploy.Source.asset('./sitio-web')],
  destinationBucket: bucket
});
```

## 2. Práctica: Construyendo un Sitio Web Estático

Extendamos el proyecto de ayer para construir un sitio web estático usando CloudFront.

### 2.1 Actualizar Implementación del Stack

Actualiza `lib/mi-primera-app-cdk-stack.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

export class MiPrimeraAppCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Bucket S3 para hosting de sitio web estático
    const bucketSitioWeb = new s3.Bucket(this, 'BucketSitioWeb', {
      bucketName: `mi-bucket-sitio-web-${Date.now()}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // Acceso solo vía CloudFront
    });

    // Origin Access Identity para CloudFront
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OAI', {
      comment: 'OAI para mi sitio web'
    });

    // Conceder acceso de CloudFront al bucket S3
    bucketSitioWeb.grantRead(originAccessIdentity);

    // Distribución CloudFront
    const distribucion = new cloudfront.Distribution(this, 'DistribucionSitioWeb', {
      defaultBehavior: {
        origin: new origins.S3Origin(bucketSitioWeb, {
          originAccessIdentity: originAccessIdentity
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 404,
          responsePagePath: '/error.html',
        }
      ]
    });

    // Desplegar contenido del sitio web
    new s3deploy.BucketDeployment(this, 'DespliegeSitioWeb', {
      sources: [s3deploy.Source.asset('./sitio-web')],
      destinationBucket: bucketSitioWeb,
      distribution: distribucion,
      distributionPaths: ['/*'],
    });

    // Salidas
    new cdk.CfnOutput(this, 'URLSitioWeb', {
      value: distribucion.distributionDomainName,
      description: 'URL de Distribución CloudFront',
    });

    new cdk.CfnOutput(this, 'IdDistribucion', {
      value: distribucion.distributionId,
      description: 'ID de Distribución CloudFront',
    });
  }
}
```

### 2.2 Crear Contenido del Sitio Web

Crea un directorio `sitio-web` en la raíz de tu proyecto:

```bash
mkdir sitio-web
```

Crea `sitio-web/index.html`:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Sitio Web CDK</title>
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
        .caracteristica {
            margin: 20px 0;
            padding: 15px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>¡Bienvenido a Mi Sitio Web CDK!</h1>
        <div class="caracteristica">
            <h3>🚀 Desplegado con AWS CDK</h3>
            <p>Este sitio web está desplegado usando Infraestructura como Código con AWS CDK.</p>
        </div>
        <div class="caracteristica">
            <h3>☁️ Impulsado por CloudFront</h3>
            <p>Entrega rápida de contenido global con CDN de AWS CloudFront.</p>
        </div>
        <div class="caracteristica">
            <h3>📦 Almacenado en S3</h3>
            <p>Contenido estático almacenado de forma segura en Amazon S3.</p>
        </div>
        <div class="caracteristica">
            <h3>🔒 Seguro por Defecto</h3>
            <p>Redirección HTTPS y Origin Access Identity para seguridad.</p>
        </div>
    </div>
</body>
</html>
```

Crea `sitio-web/error.html`:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Página No Encontrada</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .contenedor-error {
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 10px;
            backdrop-filter: blur(10px);
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="contenedor-error">
        <h1>404 - Página No Encontrada</h1>
        <p>La página que buscas no existe.</p>
        <a href="/" style="color: white;">Volver al inicio</a>
    </div>
</body>
</html>
```

### 2.3 Desplegar el Sitio Web

```bash
# Sintetizar para verificar el CloudFormation generado
cdk synth

# Desplegar el stack
cdk deploy
```

Después del despliegue, recibirás una URL de CloudFront que puedes visitar para ver tu sitio web.

## 3. Agregando una API Lambda

Ahora agreguemos una API serverless usando Lambda y API Gateway.

### 3.1 Crear Función Lambda

Crea el directorio `lambda` y agrega `hola.js`:

```bash
mkdir lambda
```

Crea `lambda/hola.js`:

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
            mensaje: '¡Hola desde Lambda CDK!',
            timestamp: new Date().toISOString(),
            requestId: event.requestContext?.requestId || 'desconocido'
        }),
    };
    return response;
};
```

### 3.2 Actualizar Stack con Lambda y API Gateway

Agrega lo siguiente a tu stack:

```typescript
// Agrega estos imports al inicio
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

// Agrega esto dentro del constructor de tu stack, después de la configuración de CloudFront

// Función Lambda
const funcionHola = new lambda.Function(this, 'FuncionHola', {
  runtime: lambda.Runtime.NODEJS_18_X,
  handler: 'hola.handler',
  code: lambda.Code.fromAsset('lambda'),
  timeout: cdk.Duration.seconds(30),
});

// API Gateway
const api = new apigateway.RestApi(this, 'ApiHola', {
  restApiName: 'Servicio Hola',
  description: 'Este servicio sirve solicitudes de hola.',
  defaultCorsPreflightOptions: {
    allowOrigins: apigateway.Cors.ALL_ORIGINS,
    allowMethods: apigateway.Cors.ALL_METHODS,
  },
});

const integracionHola = new apigateway.LambdaIntegration(funcionHola);
api.root.addMethod('GET', integracionHola);

const recursoHola = api.root.addResource('hola');
recursoHola.addMethod('GET', integracionHola);

// Agregar URL de API a las salidas
new cdk.CfnOutput(this, 'UrlApi', {
  value: api.url,
  description: 'URL de API Gateway',
});
```

### 3.3 Actualizar Sitio Web para Llamar API

Actualiza `sitio-web/index.html` para incluir integración con API:

```html
<!-- Agrega este botón después de las características existentes -->
<div class="caracteristica">
    <h3>⚡ API Serverless</h3>
    <p>Haz clic en el botón para probar nuestra API Lambda:</p>
    <button onclick="llamarApi()" style="padding: 10px 20px; margin: 10px 0; cursor: pointer;">
        Llamar API Lambda
    </button>
    <div id="respuesta-api" style="margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 5px; display: none;">
    </div>
</div>

<script>
async function llamarApi() {
    const divRespuesta = document.getElementById('respuesta-api');
    const urlApi = 'TU_URL_API_AQUI'; // Reemplazar con URL real de API después del despliegue
    
    try {
        divRespuesta.style.display = 'block';
        divRespuesta.innerHTML = 'Cargando...';
        
        const respuesta = await fetch(urlApi + '/hola');
        const datos = await respuesta.json();
        
        divRespuesta.innerHTML = `
            <h4>Respuesta de la API:</h4>
            <pre>${JSON.stringify(datos, null, 2)}</pre>
        `;
    } catch (error) {
        divRespuesta.innerHTML = `
            <h4>Error:</h4>
            <p>${error.message}</p>
        `;
    }
}
</script>
```

### 3.4 Desplegar y Probar

```bash
cdk deploy
```

Después del despliegue, actualiza `urlApi` en tu HTML con la URL real de API Gateway de la salida, luego vuelve a desplegar:

```bash
cdk deploy
```

## 4. Gestión de Entornos

### 4.1 Configuración Específica del Entorno

Crea diferentes configuraciones para diferentes entornos:

```typescript
export interface ConfigEntorno {
  nombreBucket: string;
  nombreApi: string;
  habilitarLogging: boolean;
}

export const obtenerConfig = (entorno: string): ConfigEntorno => {
  switch (entorno) {
    case 'prod':
      return {
        nombreBucket: 'mi-bucket-sitio-web-prod',
        nombreApi: 'api-produccion',
        habilitarLogging: true,
      };
    case 'staging':
      return {
        nombreBucket: 'mi-bucket-sitio-web-staging',
        nombreApi: 'api-staging',
        habilitarLogging: true,
      };
    default:
      return {
        nombreBucket: 'mi-bucket-sitio-web-dev',
        nombreApi: 'api-dev',
        habilitarLogging: false,
      };
  }
};
```

### 4.2 Usando Variables de Entorno

Actualiza tu punto de entrada de la aplicación:

```typescript
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MiPrimeraAppCdkStack } from '../lib/mi-primera-app-cdk-stack';

const app = new cdk.App();
const entorno = app.node.tryGetContext('environment') || 'dev';

new MiPrimeraAppCdkStack(app, `MiPrimeraAppCdkStack-${entorno}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  tags: {
    Environment: entorno,
    Project: 'mi-primera-app-cdk',
  },
});
```

Despliega a diferentes entornos:

```bash
# Desplegar a dev (predeterminado)
cdk deploy

# Desplegar a staging
cdk deploy --context environment=staging

# Desplegar a producción
cdk deploy --context environment=prod
```

## 5. Ejercicio: Agregar Integración DynamoDB

### 5.1 Agregar Tabla DynamoDB

```typescript
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

// Agregar al constructor de tu stack
const tabla = new dynamodb.Table(this, 'TablaVisitantes', {
  tableName: `visitantes-${entorno}`,
  partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
  removalPolicy: cdk.RemovalPolicy.DESTROY, // Solo para dev/testing
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
});

// Conceder permisos de Lambda para acceder a DynamoDB
tabla.grantReadWriteData(funcionHola);

// Pasar nombre de tabla a Lambda
funcionHola.addEnvironment('TABLE_NAME', tabla.tableName);
```

### 5.2 Actualizar Función Lambda

Actualiza `lambda/hola.js`:

```javascript
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const tableName = process.env.TABLE_NAME;
    const visitorId = event.requestContext?.requestId || 'desconocido';
    
    try {
        // Registrar visitante
        await dynamodb.put({
            TableName: tableName,
            Item: {
                id: visitorId,
                timestamp: new Date().toISOString(),
                userAgent: event.headers?.['User-Agent'] || 'desconocido'
            }
        }).promise();
        
        // Obtener conteo de visitantes
        const resultado = await dynamodb.scan({
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
                mensaje: '¡Hola desde Lambda CDK con DynamoDB!',
                visitorId: visitorId,
                totalVisitantes: resultado.Count,
                timestamp: new Date().toISOString()
            }),
        };
        return response;
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                mensaje: 'Error interno del servidor',
                error: error.message
            }),
        };
    }
};
```

## Resumen

Hoy aprendiste:

1. ✅ Jerarquía de tres capas de Constructs de CDK (L1, L2, L3)
2. ✅ Construir un sitio web estático completo con CloudFront
3. ✅ Crear APIs serverless con Lambda y API Gateway
4. ✅ Gestión de configuración específica del entorno
5. ✅ Integración DynamoDB para persistencia de datos

### Conceptos Clave Cubiertos

- **Niveles de Constructs**: L1 (CFN), L2 (AWS), L3 (Patrones)
- **CloudFront**: CDN global con Origin Access Identity
- **Funciones Lambda**: Computación serverless con API Gateway
- **Gestión de Entornos**: Configuración basada en contexto
- **Integración Entre Servicios**: Permisos Lambda + DynamoDB

### Arquitectura Construida Hoy

```
Internet → CloudFront → S3 (Sitio Web Estático)
              ↓
         API Gateway → Lambda → DynamoDB
```

### Próximos Pasos

Mañana (Día 3), exploraremos patrones avanzados de CDK, constructs personalizados y aprenderemos cómo crear componentes reutilizables que siguen las mejores prácticas de AWS.

---

**Nota**: Recuerda limpiar los recursos cuando termines de practicar para evitar cargos innecesarios:

```bash
cdk destroy
```