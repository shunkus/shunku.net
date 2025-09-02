---
title: Día 1 - Configuración del Entorno AWS CDK y Primeros Pasos
order: 2
---

# Día 1 - Configuración del Entorno AWS CDK y Primeros Pasos

## Objetivos de Hoy

1. Configurar el entorno de desarrollo AWS CDK
2. Crear tu primer proyecto CDK
3. Desplegar un bucket S3 simple
4. Entender los comandos básicos de CDK

## 1. Configuración del Entorno

### 1.1 Verificación de la Instalación de Node.js

AWS CDK se ejecuta en Node.js. Primero, vamos a verificar la versión actual.

```bash
node --version
npm --version
```

Se requiere Node.js 18.x o superior. Si no está instalado, descárgalo desde el [sitio oficial de Node.js](https://nodejs.org/).

### 1.2 Configuración de AWS CLI

AWS CDK usa AWS CLI para comunicarse con tu cuenta de AWS.

```bash
# Verificar la versión de AWS CLI
aws --version

# Configurar credenciales de AWS
aws configure
```

Ingresa la siguiente información:
- AWS Access Key ID
- AWS Secret Access Key  
- Nombre de región predeterminada (ej. us-east-1)
- Formato de salida predeterminado (se recomienda json)

### 1.3 Instalación de AWS CDK

Instala AWS CDK globalmente.

```bash
npm install -g aws-cdk
```

Después de la instalación, verifica la versión.

```bash
cdk --version
```

### 1.4 Bootstrap de CDK

Antes de usar CDK, necesitas ejecutar bootstrap para tu cuenta de AWS y región.

```bash
cdk bootstrap
```

Esto crea recursos que CDK usa, como buckets S3 y roles IAM.

## 2. Creando tu Primer Proyecto

### 2.1 Crear Directorio del Proyecto

```bash
mkdir mi-primera-app-cdk
cd mi-primera-app-cdk
```

### 2.2 Inicializar Aplicación CDK

Inicializa una nueva aplicación CDK usando la plantilla TypeScript:

```bash
cdk init app --language typescript
```

Esto crea la siguiente estructura de proyecto:

```
mi-primera-app-cdk/
├── bin/
│   └── mi-primera-app-cdk.ts     # Punto de entrada de la app
├── lib/
│   └── mi-primera-app-cdk-stack.ts # Definición del stack
├── test/
│   └── mi-primera-app-cdk.test.ts  # Pruebas unitarias
├── cdk.json                     # Configuración de CDK
├── package.json                 # Dependencias npm
└── tsconfig.json               # Configuración TypeScript
```

### 2.3 Instalar Dependencias

```bash
npm install
```

## 3. Entendiendo la Estructura Básica

### 3.1 Punto de Entrada de la App (bin/mi-primera-app-cdk.ts)

```typescript
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MiPrimeraAppCdkStack } from '../lib/mi-primera-app-cdk-stack';

const app = new cdk.App();
new MiPrimeraAppCdkStack(app, 'MiPrimeraAppCdkStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
```

### 3.2 Definición del Stack (lib/mi-primera-app-cdk-stack.ts)

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class MiPrimeraAppCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Tus recursos se definirán aquí
  }
}
```

## 4. Creando tu Primer Bucket S3

### 4.1 Modificar Stack para Agregar Bucket S3

Edita `lib/mi-primera-app-cdk-stack.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class MiPrimeraAppCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Crear un bucket S3
    const bucket = new s3.Bucket(this, 'MiPrimerBucket', {
      bucketName: 'mi-primer-bucket-cdk-' + Math.random().toString(36).substring(7),
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // Salida del nombre del bucket
    new cdk.CfnOutput(this, 'NombreBucket', {
      value: bucket.bucketName,
      description: 'El nombre del bucket S3',
    });
  }
}
```

### 4.2 Explicación de Propiedades Clave

- **bucketName**: Nombre único del bucket (con sufijo aleatorio)
- **versioned**: Habilitar versionado de objetos
- **removalPolicy**: Qué hacer cuando se elimina el stack (DESTROY permite eliminación)
- **blockPublicAccess**: Configuración de seguridad para bloquear todo acceso público

## 5. Comandos de CDK

### 5.1 Sintetizar Plantilla CloudFormation

```bash
cdk synth
```

Esto genera la plantilla CloudFormation y la muestra. Puedes ver cómo se traduce tu código CDK a CloudFormation.

### 5.2 Comparar Cambios

```bash
cdk diff
```

Muestra las diferencias entre tu stack actual y el stack desplegado.

### 5.3 Desplegar el Stack

```bash
cdk deploy
```

Esto despliega tu stack a AWS. Se te pedirá confirmar los cambios antes del despliegue.

### 5.4 Listar Todos los Stacks

```bash
cdk list
```

Muestra todos los stacks en tu aplicación CDK.

### 5.5 Destruir el Stack

```bash
cdk destroy
```

Elimina el stack y todos sus recursos de AWS.

## 6. Ejercicio: Crear Múltiples Recursos

Prueba agregando más recursos a tu stack:

### 6.1 Agregar Otro Bucket S3 con Hosting de Sitio Web

```typescript
// Agregar a tu stack
const bucketSitioWeb = new s3.Bucket(this, 'BucketSitioWeb', {
  bucketName: 'mi-bucket-sitio-web-' + Math.random().toString(36).substring(7),
  websiteIndexDocument: 'index.html',
  websiteErrorDocument: 'error.html',
  publicReadAccess: true,
  removalPolicy: cdk.RemovalPolicy.DESTROY,
});

new cdk.CfnOutput(this, 'URLSitioWeb', {
  value: bucketSitioWeb.bucketWebsiteUrl,
  description: 'URL del Sitio Web',
});
```

### 6.2 Desplegar y Probar

```bash
# Ver qué se creará
cdk diff

# Desplegar los cambios
cdk deploy
```

Revisa la Consola de AWS para ver tus recursos creados.

## 7. Mejores Prácticas para el Día 1

### 7.1 Convenciones de Nomenclatura

- Usa nombres descriptivos para los constructs
- Incluye entorno o propósito en nombres de recursos
- Usa patrones de nomenclatura consistentes

### 7.2 Gestión de Recursos

- Siempre establece `removalPolicy` para recursos de desarrollo
- Usa `blockPublicAccess` para buckets S3 a menos que se necesite acceso público
- Agrega salidas significativas para propiedades importantes de recursos

### 7.3 Organización del Código

- Mantén los archivos de stack enfocados y no demasiado grandes
- Usa comentarios para explicar configuraciones complejas
- Sigue las mejores prácticas de TypeScript

## 8. Solución de Problemas Comunes

### 8.1 Problemas de Bootstrap

Si bootstrap falla:
```bash
# Verificar credenciales de AWS
aws sts get-caller-identity

# Intentar bootstrap con región explícita
cdk bootstrap aws://NUMERO-CUENTA/REGION
```

### 8.2 Conflictos de Nombres de Bucket

Los nombres de bucket S3 deben ser únicos globalmente. Si el despliegue falla:
- Usa sufijos aleatorios como se muestra en los ejemplos
- Incluye timestamp o ID de cuenta en nombres de bucket

### 8.3 Problemas de Permisos

Asegúrate de que tu usuario de AWS tenga permisos suficientes:
- Acceso completo a CloudFormation
- Permisos IAM para crear roles
- Permisos para servicios que estás usando (S3, Lambda, etc.)

## Resumen

Hoy aprendiste:

1. ✅ Configurar entorno de desarrollo AWS CDK
2. ✅ Crear tu primer proyecto CDK
3. ✅ Desplegar un bucket S3 usando CDK
4. ✅ Entender comandos y flujo básico de CDK

### Conceptos Clave Cubiertos

- **CDK Bootstrap**: Configuración única para CDK en tu cuenta de AWS
- **Constructs**: Bloques de construcción de aplicaciones CDK
- **Stacks**: Unidades de despliegue en CDK
- **Síntesis**: Conversión de código CDK a plantillas CloudFormation

### Próximos Pasos

Mañana (Día 2), profundizaremos en constructs de CDK y exploraremos más servicios de AWS como Lambda y API Gateway.

---

**Solución del Ejercicio:**

Stack completo con múltiples recursos:

```typescript
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class MiPrimeraAppCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Bucket privado para almacenamiento de datos
    const bucketDatos = new s3.Bucket(this, 'BucketDatos', {
      bucketName: 'mi-bucket-datos-' + Math.random().toString(36).substring(7),
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // Bucket público para hosting de sitio web
    const bucketSitioWeb = new s3.Bucket(this, 'BucketSitioWeb', {
      bucketName: 'mi-bucket-sitio-web-' + Math.random().toString(36).substring(7),
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'error.html',
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Salidas
    new cdk.CfnOutput(this, 'NombreBucketDatos', {
      value: bucketDatos.bucketName,
      description: 'Nombre del bucket de datos privado',
    });

    new cdk.CfnOutput(this, 'URLSitioWeb', {
      value: bucketSitioWeb.bucketWebsiteUrl,
      description: 'URL del Sitio Web',
    });
  }
}
```