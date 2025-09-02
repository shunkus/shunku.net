---
title: Día 4 - Testing e Integración CI/CD
order: 5
---

# Día 4 - Testing e Integración CI/CD

## Objetivos de Hoy

1. Escribir pruebas unitarias para constructs de CDK
2. Implementar estrategias de testing de integración
3. Configurar pipeline CI/CD con GitHub Actions
4. Configurar flujos de trabajo de despliegue automatizado
5. Aprender mejores prácticas de testing para Infraestructura como Código

## 1. Fundamentos de Testing con CDK

### 1.1 Instalar Dependencias de Testing

Primero, instala los paquetes de testing necesarios:

```bash
npm install --save-dev jest @types/jest ts-jest
npm install --save-dev aws-cdk-lib/assertions
```

Actualiza tu `package.json` para incluir scripts de testing:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "preset": "ts-jest",
    "testEnvironment": "node",
    "testMatch": ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
    "collectCoverageFrom": [
      "lib/**/*.ts",
      "!lib/**/*.d.ts"
    ]
  }
}
```

### 1.2 Pruebas Unitarias Básicas

Crea `test/mi-primera-app-cdk-stack.test.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { MiPrimeraAppCdkStack } from '../lib/mi-primera-app-cdk-stack';

describe('MiPrimeraAppCdkStack', () => {
  let app: cdk.App;
  let stack: MiPrimeraAppCdkStack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new MiPrimeraAppCdkStack(app, 'TestStack');
    template = Template.fromStack(stack);
  });

  test('Crea bucket S3 con propiedades correctas', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    });
  });

  test('Crea distribución CloudFront', () => {
    template.hasResource('AWS::CloudFront::Distribution', {
      Properties: Match.objectLike({
        DistributionConfig: Match.objectLike({
          DefaultRootObject: 'index.html',
          Enabled: true,
        }),
      }),
    });
  });

  test('Crea función Lambda con runtime correcto', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Runtime: 'nodejs18.x',
      Timeout: 30,
    });
  });

  test('Crea API Gateway con CORS', () => {
    template.hasResource('AWS::ApiGateway::RestApi', {});
    
    // Verificar método CORS
    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'OPTIONS',
    });
  });

  test('Función Lambda tiene permisos DynamoDB', () => {
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Effect: 'Allow',
            Action: Match.arrayWith([
              'dynamodb:BatchGetItem',
              'dynamodb:GetRecords',
              'dynamodb:Query',
              'dynamodb:BatchWriteItem',
              'dynamodb:PutItem',
              'dynamodb:UpdateItem',
              'dynamodb:DeleteItem',
            ]),
          }),
        ]),
      },
    });
  });

  test('Stack tiene salidas requeridas', () => {
    template.hasOutput('URLSitioWeb', {});
    template.hasOutput('EndpointApi', {});
  });

  test('Recursos tienen tags apropiados en producción', () => {
    const prodApp = new cdk.App({ context: { environment: 'prod' } });
    const prodStack = new MiPrimeraAppCdkStack(prodApp, 'ProdStack', {
      tags: { Environment: 'prod' }
    });
    const prodTemplate = Template.fromStack(prodStack);

    // Verificar que los recursos están apropiadamente etiquetados
    prodTemplate.hasResource('AWS::S3::Bucket', {
      Properties: Match.objectLike({
        Tags: Match.arrayWith([
          { Key: 'Environment', Value: 'prod' }
        ])
      })
    });
  });
});
```

### 1.3 Testing de Constructs Personalizados

Crea `test/web-api-construct.test.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { ConstructWebApi } from '../lib/web-api-construct';

describe('ConstructWebApi', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new cdk.Stack(app, 'TestStack');
  });

  test('Crea todos los recursos requeridos', () => {
    new ConstructWebApi(stack, 'TestWebApi');
    template = Template.fromStack(stack);

    // Debería crear tabla DynamoDB
    template.resourceCountIs('AWS::DynamoDB::Table', 1);
    
    // Debería crear función Lambda
    template.resourceCountIs('AWS::Lambda::Function', 1);
    
    // Debería crear API Gateway
    template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
  });

  test('Tabla DynamoDB tiene estructura correcta', () => {
    new ConstructWebApi(stack, 'TestWebApi');
    template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::DynamoDB::Table', {
      KeySchema: [
        { AttributeName: 'pk', KeyType: 'HASH' },
        { AttributeName: 'sk', KeyType: 'RANGE' }
      ],
      BillingMode: 'PAY_PER_REQUEST',
    });
  });

  test('Función Lambda tiene variables de entorno', () => {
    new ConstructWebApi(stack, 'TestWebApi');
    template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::Lambda::Function', {
      Environment: {
        Variables: {
          TABLE_NAME: { Ref: cdk.Match.anyValue() }
        }
      }
    });
  });

  test('API Gateway tiene CORS configurado', () => {
    new ConstructWebApi(stack, 'TestWebApi');
    template = Template.fromStack(stack);

    // Debería tener métodos OPTIONS para CORS
    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'OPTIONS',
      Integration: {
        Type: 'MOCK'
      }
    });
  });

  test('Propiedades personalizadas se aplican correctamente', () => {
    new ConstructWebApi(stack, 'TestWebApi', {
      nombreTabla: 'tabla-personalizada',
      memoriaLambda: 512,
      nombreApi: 'api-personalizada'
    });
    template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'tabla-personalizada'
    });

    template.hasResourceProperties('AWS::Lambda::Function', {
      MemorySize: 512
    });

    template.hasResourceProperties('AWS::ApiGateway::RestApi', {
      Name: 'api-personalizada'
    });
  });
});
```

### 1.4 Pruebas de Integración

Crea `test/integration/app-integration.test.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { DatabaseStack } from '../../lib/database-stack';
import { ApplicationStack } from '../../lib/application-stack';

describe('Integración Multi-Stack', () => {
  let app: cdk.App;
  let databaseStack: DatabaseStack;
  let applicationStack: ApplicationStack;

  beforeEach(() => {
    app = new cdk.App();
    databaseStack = new DatabaseStack(app, 'TestDatabaseStack');
    applicationStack = new ApplicationStack(app, 'TestApplicationStack', {
      nombreTablaUsuarios: databaseStack.tablaUsuarios.tableName,
      idVpc: databaseStack.vpc.vpcId,
    });
  });

  test('Stack de aplicación referencia recursos de base de datos correctamente', () => {
    const appTemplate = Template.fromStack(applicationStack);
    const dbTemplate = Template.fromStack(databaseStack);

    // Stack de base de datos debería exportar valores
    dbTemplate.hasOutput('NombreTablaUsuarios', {});
    dbTemplate.hasOutput('IdVpc', {});

    // Stack de aplicación debería usar el nombre correcto de tabla
    appTemplate.hasResourceProperties('AWS::Lambda::Function', {
      Environment: {
        Variables: {
          USER_TABLE_NAME: databaseStack.tablaUsuarios.tableName
        }
      }
    });
  });

  test('Stacks tienen dependencias correctas', () => {
    const dependencias = applicationStack.dependencies;
    expect(dependencias).toContain(databaseStack);
  });

  test('Configuración VPC es consistente', () => {
    const dbTemplate = Template.fromStack(databaseStack);
    const appTemplate = Template.fromStack(applicationStack);

    // Ambos stacks deberían referenciar el mismo VPC
    dbTemplate.hasResource('AWS::EC2::VPC', {});
    appTemplate.hasResourceProperties('AWS::Lambda::Function', {
      VpcConfig: cdk.Match.anyValue()
    });
  });
});
```

### 1.5 Testing de Snapshots

Crea `test/snapshots/stack-snapshot.test.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import { MiPrimeraAppCdkStack } from '../../lib/mi-primera-app-cdk-stack';

describe('Snapshots de Stack', () => {
  test('Snapshot del stack coincide con plantilla esperada', () => {
    const app = new cdk.App();
    const stack = new MiPrimeraAppCdkStack(app, 'TestStack');
    
    expect(app.synth().getStackArtifact(stack.artifactId).template).toMatchSnapshot();
  });

  test('Snapshot de stack de producción', () => {
    const app = new cdk.App({ 
      context: { environment: 'prod' } 
    });
    const stack = new MiPrimeraAppCdkStack(app, 'ProdStack', {
      tags: { Environment: 'prod' }
    });
    
    expect(app.synth().getStackArtifact(stack.artifactId).template).toMatchSnapshot();
  });
});
```

## 2. Estrategias de Testing Avanzadas

### 2.1 Testing Basado en Propiedades

Crea `test/property-tests/construct-properties.test.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { ConstructWebApi } from '../../lib/web-api-construct';

describe('Pruebas de Propiedades ConstructWebApi', () => {
  test.each([
    [128, 'tabla-pequeña', 'api-pequeña'],
    [256, 'tabla-mediana', 'api-mediana'],  
    [512, 'tabla-grande', 'api-grande'],
  ])('Crea construct con memoria: %i, tabla: %s, api: %s', (memoria, nombreTabla, nombreApi) => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'TestStack');
    
    new ConstructWebApi(stack, 'TestConstruct', {
      memoriaLambda: memoria,
      nombreTabla: nombreTabla,
      nombreApi: nombreApi
    });

    const template = Template.fromStack(stack);
    
    template.hasResourceProperties('AWS::Lambda::Function', {
      MemorySize: memoria
    });
    
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: nombreTabla
    });
    
    template.hasResourceProperties('AWS::ApiGateway::RestApi', {
      Name: nombreApi
    });
  });
});
```

### 2.2 Testing de Condiciones de Error

Crea `test/error-conditions/validation.test.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import { ConstructWebApi } from '../../lib/web-api-construct';

describe('Pruebas de Condiciones de Error', () => {
  let app: cdk.App;
  let stack: cdk.Stack;

  beforeEach(() => {
    app = new cdk.App();
    stack = new cdk.Stack(app, 'TestStack');
  });

  test('Tamaño de memoria inválido debería usar predeterminado', () => {
    const construct = new ConstructWebApi(stack, 'TestConstruct', {
      memoriaLambda: -1 // Valor inválido
    });

    const template = Template.fromStack(stack);
    
    // Debería usar valor predeterminado en lugar del inválido
    template.hasResourceProperties('AWS::Lambda::Function', {
      MemorySize: 256 // Valor predeterminado
    });
  });

  test('Nombre de tabla vacío debería generar predeterminado', () => {
    new ConstructWebApi(stack, 'TestConstruct', {
      nombreTabla: '' // Nombre de tabla vacío
    });

    const template = Template.fromStack(stack);
    
    // Debería crear tabla con nombre generado
    template.hasResource('AWS::DynamoDB::Table', {
      Properties: {
        TableName: cdk.Match.stringLikeRegexp('TestConstruct.*')
      }
    });
  });
});
```

## 3. Configuración de Pipeline CI/CD

### 3.1 Flujo de Trabajo GitHub Actions

Crea `.github/workflows/ci-cd.yml`:

```yaml
name: Pipeline CI/CD CDK

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  AWS_REGION: us-east-1
  NODE_VERSION: '18'

jobs:
  test:
    name: Ejecutar Pruebas
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout código
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Instalar dependencias
      run: npm ci
      
    - name: Ejecutar linting
      run: npm run lint
      continue-on-error: true
      
    - name: Ejecutar pruebas unitarias
      run: npm run test
      
    - name: Ejecutar cobertura de pruebas
      run: npm run test:coverage
      
    - name: Subir cobertura a Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: cdk-coverage
      continue-on-error: true
      
    - name: CDK Synth
      run: npx cdk synth
      
    - name: Escaneo de Seguridad CDK (cdk-nag)
      run: |
        npm install -g cdk-nag
        npx cdk synth --app "npx ts-node --prefer-ts-exts bin/mi-primera-app-cdk.ts" 2>&1 | tee synth-output.txt || true
      continue-on-error: true

  deploy-dev:
    name: Desplegar a Desarrollo
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/develop'
    environment: development
    
    steps:
    - name: Checkout código
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Instalar dependencias
      run: npm ci
      
    - name: Configurar credenciales AWS
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
        
    - name: CDK Bootstrap (si es necesario)
      run: npx cdk bootstrap --require-approval never
      continue-on-error: true
      
    - name: CDK Deploy a Desarrollo
      run: |
        npx cdk deploy --all --require-approval never \
        --context environment=dev \
        --outputs-file outputs-dev.json
        
    - name: Almacenar salidas de despliegue
      uses: actions/upload-artifact@v3
      with:
        name: dev-outputs
        path: outputs-dev.json
        
    - name: Ejecutar pruebas de integración
      run: |
        echo "Ejecutando pruebas de integración contra entorno de desarrollo"
        # Agregar comandos de pruebas de integración aquí
        
  deploy-staging:
    name: Desplegar a Staging
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    environment: staging
    
    steps:
    - name: Checkout código
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Instalar dependencias
      run: npm ci
      
    - name: Configurar credenciales AWS
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.STAGING_AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.STAGING_AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
        
    - name: CDK Deploy a Staging
      run: |
        npx cdk deploy --all --require-approval never \
        --context environment=staging \
        --outputs-file outputs-staging.json
        
    - name: Almacenar salidas de despliegue
      uses: actions/upload-artifact@v3
      with:
        name: staging-outputs
        path: outputs-staging.json

  deploy-production:
    name: Desplegar a Producción
    runs-on: ubuntu-latest
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - name: Checkout código
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Instalar dependencias
      run: npm ci
      
    - name: Configurar credenciales AWS
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.PROD_AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.PROD_AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
        
    - name: CDK Diff
      run: npx cdk diff --context environment=prod
      continue-on-error: true
      
    - name: CDK Deploy a Producción
      run: |
        npx cdk deploy --all --require-approval never \
        --context environment=prod \
        --outputs-file outputs-prod.json
        
    - name: Almacenar salidas de despliegue
      uses: actions/upload-artifact@v3
      with:
        name: prod-outputs
        path: outputs-prod.json
        
    - name: Verificación de salud post-despliegue
      run: |
        echo "Ejecutando verificaciones de salud post-despliegue"
        # Agregar comandos de verificación de salud aquí
        
    - name: Notificar éxito de despliegue
      if: success()
      run: |
        echo "¡Despliegue de producción exitoso!"
        # Agregar lógica de notificación (Slack, email, etc.)

  cleanup-pr:
    name: Limpiar Entorno PR
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    
    steps:
    - name: Checkout código
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Instalar dependencias
      run: npm ci
      
    - name: Configurar credenciales AWS
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
        
    - name: Destruir entorno PR
      run: |
        PR_NUMBER=${{ github.event.number }}
        npx cdk destroy --force \
        --context environment=pr-${PR_NUMBER}
      continue-on-error: true
```

### 3.2 Pre-commit Hooks

Crea `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-json
      - id: check-yaml
      - id: check-merge-conflict
      
  - repo: local
    hooks:
      - id: typescript-check
        name: Verificación TypeScript
        entry: npx tsc --noEmit
        language: system
        files: \.(ts|tsx)$
        
      - id: eslint
        name: ESLint
        entry: npx eslint --fix
        language: system
        files: \.(ts|tsx)$
        
      - id: jest-tests
        name: Ejecutar Pruebas Jest
        entry: npm test
        language: system
        pass_filenames: false
        
      - id: cdk-synth
        name: Verificación CDK Synth
        entry: npx cdk synth
        language: system
        pass_filenames: false
```

### 3.3 Archivos de Configuración de Testing

Crea `jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test', '<rootDir>/lib'],
  testMatch: ['**/__tests__/**/*.ts', '**/*.(test|spec).ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  collectCoverageFrom: [
    'lib/**/*.ts',
    '!lib/**/*.d.ts',
    '!lib/**/*.test.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts']
};
```

Crea `test/setup.ts`:

```typescript
// Configuración global de testing
import * as aws from 'aws-sdk';

// Mock AWS SDK para pruebas
jest.mock('aws-sdk', () => ({
  DynamoDB: {
    DocumentClient: jest.fn().mockImplementation(() => ({
      put: jest.fn().mockReturnValue({ promise: jest.fn() }),
      get: jest.fn().mockReturnValue({ promise: jest.fn() }),
      scan: jest.fn().mockReturnValue({ promise: jest.fn() }),
      update: jest.fn().mockReturnValue({ promise: jest.fn() }),
      delete: jest.fn().mockReturnValue({ promise: jest.fn() }),
    })),
  },
  S3: jest.fn().mockImplementation(() => ({
    putObject: jest.fn().mockReturnValue({ promise: jest.fn() }),
    getObject: jest.fn().mockReturnValue({ promise: jest.fn() }),
  })),
}));

// Establecer variables de entorno de testing
process.env.AWS_REGION = 'us-east-1';
process.env.AWS_ACCOUNT_ID = '123456789012';
```

## 4. Ejecutando Pruebas

### 4.1 Comandos de Testing

Ejecuta diferentes tipos de pruebas:

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm run test:watch

# Ejecutar pruebas con cobertura
npm run test:coverage

# Ejecutar archivo de prueba específico
npm test -- web-api-construct.test.ts

# Ejecutar pruebas que coincidan con patrón
npm test -- --testNamePattern="DynamoDB"

# Actualizar snapshots
npm test -- --updateSnapshot
```

### 4.2 Organización de Pruebas

Organiza tus pruebas en una estructura clara:

```
test/
├── unit/
│   ├── constructs/
│   │   ├── web-api-construct.test.ts
│   │   └── todo-api-construct.test.ts
│   └── stacks/
│       ├── mi-primera-app-cdk-stack.test.ts
│       └── database-stack.test.ts
├── integration/
│   ├── app-integration.test.ts
│   └── cross-stack.test.ts
├── snapshots/
│   ├── stack-snapshot.test.ts
│   └── __snapshots__/
├── property-tests/
│   └── construct-properties.test.ts
└── setup.ts
```

## 5. Ejercicio: Suite de Testing Completa

### 5.1 Agregar Pruebas End-to-End

Crea `test/e2e/api-endpoints.test.ts`:

```typescript
import axios from 'axios';

describe('Pruebas End-to-End de API', () => {
  const apiUrl = process.env.API_ENDPOINT || 'https://ejemplo.com/api';

  test('GET / devuelve información de API', async () => {
    const respuesta = await axios.get(apiUrl);
    
    expect(respuesta.status).toBe(200);
    expect(respuesta.data).toHaveProperty('mensaje');
  });

  test('POST /todos crea un nuevo todo', async () => {
    const datosTodo = {
      texto: 'Item de todo de prueba',
    };

    const respuesta = await axios.post(`${apiUrl}/todos`, datosTodo);
    
    expect(respuesta.status).toBe(200);
    expect(respuesta.data).toHaveProperty('todo');
    expect(respuesta.data.todo.texto).toBe(datosTodo.texto);
  });

  test('GET /todos devuelve lista de todos', async () => {
    const respuesta = await axios.get(`${apiUrl}/todos`);
    
    expect(respuesta.status).toBe(200);
    expect(respuesta.data).toHaveProperty('todos');
    expect(Array.isArray(respuesta.data.todos)).toBe(true);
  });
});
```

### 5.2 Pruebas de Performance

Crea `test/performance/load-test.ts`:

```typescript
import axios from 'axios';

describe('Pruebas de Performance', () => {
  const apiUrl = process.env.API_ENDPOINT || 'https://ejemplo.com/api';

  test('API responde dentro de límites de tiempo aceptables', async () => {
    const tiempoInicio = Date.now();
    const respuesta = await axios.get(apiUrl);
    const tiempoFin = Date.now();
    
    const tiempoRespuesta = tiempoFin - tiempoInicio;
    
    expect(respuesta.status).toBe(200);
    expect(tiempoRespuesta).toBeLessThan(2000); // Menos de 2 segundos
  });

  test('API maneja solicitudes concurrentes', async () => {
    const solicitudesConcurrentes = 10;
    const promesas = Array(solicitudesConcurrentes).fill(null).map(() => 
      axios.get(apiUrl)
    );

    const respuestas = await Promise.all(promesas);
    
    respuestas.forEach(respuesta => {
      expect(respuesta.status).toBe(200);
    });
  });
});
```

## Resumen

Hoy aprendiste:

1. ✅ Escribir pruebas unitarias integrales para constructs de CDK
2. ✅ Implementar estrategias de testing de integración  
3. ✅ Configurar pipeline CI/CD con GitHub Actions
4. ✅ Configurar flujos de trabajo de despliegue automatizado
5. ✅ Mejores prácticas de testing para Infraestructura como Código

### Conceptos Clave Cubiertos

- **Pruebas Unitarias**: Testing de constructs y stacks individuales
- **Pruebas de Integración**: Testing de dependencias entre stacks
- **Pruebas de Snapshot**: Asegurar consistencia de plantillas
- **Pipeline CI/CD**: Testing y despliegue automatizado
- **Organización de Pruebas**: Estructurar pruebas para mantenibilidad

### Pirámide de Testing para CDK

```
    Pruebas E2E (Pocas)
         ↑
  Pruebas Integración (Algunas)  
         ↑
  Pruebas Unitarias (Muchas)
```

### Próximos Pasos

Mañana (Día 5), nos enfocaremos en mejores prácticas de producción, seguridad, monitoreo y excelencia operacional para tus aplicaciones CDK.

---

**Mejores Prácticas de Testing:**

1. **Estructura de Pruebas**: Usa patrón AAA (Arrange, Act, Assert)
2. **Cobertura de Pruebas**: Apunta a 80%+ cobertura de código
3. **Pruebas Rápidas**: Mantén las pruebas unitarias rápidas y deterministas
4. **Integración CI**: Ejecuta pruebas en cada commit
5. **Paridad de Entornos**: Prueba en entornos similares a producción