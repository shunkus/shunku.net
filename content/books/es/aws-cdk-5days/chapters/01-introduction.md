---
title: Introducción - Bienvenido al Mundo de AWS CDK
order: 1
---

# Introducción - Bienvenido al Mundo de AWS CDK

## Acerca de este Libro

Este libro tiene como objetivo ayudarte a aprender AWS Cloud Development Kit (AWS CDK) en 5 días y adquirir habilidades prácticas de gestión de infraestructura.

### Audiencia Objetivo

- Aquellos con conocimientos básicos de AWS
- Aquellos con experiencia en programación (especialmente TypeScript/JavaScript)
- Aquellos interesados en Infraestructura como Código (IaC)
- Aquellos que quieren alejarse de la gestión manual de infraestructura

### Objetivos de Aprendizaje

Al final de este libro, serás capaz de:

1. Entender los conceptos básicos de AWS CDK y configurar el entorno
2. Crear y gestionar recursos básicos de AWS usando CDK
3. Crear componentes reutilizables (Constructs)
4. Integrar con pipelines de testing y CI/CD
5. Desplegar de forma segura en entornos de producción

## ¿Qué es AWS CDK?

AWS Cloud Development Kit (AWS CDK) es un framework de código abierto para definir recursos de aplicaciones en la nube usando lenguajes de programación.

### Diferencias con Métodos Tradicionales

#### CloudFormation Tradicional
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

### Características de AWS CDK

1. **Aprovecha el Poder de los Lenguajes de Programación**
   - Usa sentencias condicionales, bucles, funciones, etc.
   - Utiliza características de autocompletado y refactorización del IDE
   - Aplica habilidades de programación existentes

2. **Reutilización y Modularización**
   - Crea y reutiliza Constructs personalizados
   - Comparte como paquetes npm
   - Estandariza mejores prácticas dentro de las organizaciones

3. **Seguridad de Tipos**
   - Detecta errores en tiempo de compilación
   - Autocompletado de propiedades y validación
   - APIs documentadas

4. **Compatibilidad con CloudFormation**
   - Genera plantillas de CloudFormation en última instancia
   - Integrable con recursos existentes de CloudFormation
   - Acceso a todas las características de CloudFormation

## Cómo Proceder con el Aprendizaje

### Cronograma de Aprendizaje de 5 Días

| Día | Tema | Contenido |
|-----|------|-----------|
| Día 1 | Fundamentos y Configuración | Conceptos básicos de CDK, configuración del entorno, despliegue inicial |
| Día 2 | Constructs Principales y Stack | Creación de recursos básicos de AWS, gestión de Stack |
| Día 3 | Constructs Avanzados y Patrones | Constructs personalizados, patrones de diseño |
| Día 4 | Testing y CI/CD | Pruebas unitarias, pruebas de integración, pipelines CI/CD |
| Día 5 | Mejores Prácticas y Despliegue en Producción | Seguridad, monitoreo, operaciones de producción |

### Verificación de Prerrequisitos

Antes de comenzar, por favor confirma que tienes los siguientes conocimientos:

#### Conocimientos Básicos de AWS
- Servicios básicos como EC2, S3, Lambda, RDS
- Conceptos básicos de IAM (roles, políticas)
- Fundamentos de VPC y redes

#### Conocimientos de Programación
- Sintaxis básica de TypeScript/JavaScript
- Experiencia con npm/yarn
- Operaciones básicas de Git

#### Entorno de Desarrollo
- Node.js 18.x o superior
- Cualquier IDE o editor (se recomienda VS Code)
- AWS CLI
- Git

## Estructura del Libro

Cada capítulo está estructurado de la siguiente manera:

1. **Vista General** - Resumen del contenido a aprender ese día
2. **Teoría** - Conceptos básicos y trasfondo teórico
3. **Práctica** - Aprendizaje práctico escribiendo código real
4. **Ejercicios** - Tareas para profundizar la comprensión
5. **Resumen** - Revisión del contenido de aprendizaje de ese día

## Acerca del Proyecto de Ejemplo

En este libro, construiremos progresivamente una aplicación web como sigue:

1. **Día 1**: Sitio web estático (S3 + CloudFront)
2. **Día 2**: API serverless (Lambda + API Gateway)
3. **Día 3**: Integración con base de datos (DynamoDB)
4. **Día 4**: Pipeline CI/CD
5. **Día 5**: Monitoreo y alertas

### Vista General de la Arquitectura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CloudFront    │────│   API Gateway    │────│     Lambda      │
│  (Web Estático) │    │   (REST API)     │    │  (Lógica de     │
└─────────────────┘    └──────────────────┘    │   Negocio)      │
                                               └─────────────────┘
                                                        │
                                               ┌─────────────────┐
                                               │    DynamoDB     │
                                               │   (Base de      │
                                               │    Datos)       │
                                               └─────────────────┘
```

## Próximos Pasos

Cuando estés listo, procede al Día 1: "Configuración del Entorno AWS CDK y Primeros Pasos".

Al aprender escribiendo código real, deberías experimentar el poder y la conveniencia de AWS CDK.

---

**Nota**: Ejecutar el código de ejemplo de este libro puede generar cargos de AWS. Recomendamos practicar dentro de los límites del nivel gratuito de AWS. Asegúrate de eliminar los recursos innecesarios cuando hayas terminado.