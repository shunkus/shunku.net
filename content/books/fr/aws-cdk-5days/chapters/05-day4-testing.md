---
title: Jour 4 - Tests et intégration CI/CD
order: 5
---

# Jour 4 - Tests et intégration CI/CD

## Objectifs du jour

1. Écrire des tests unitaires pour les constructs CDK
2. Implémenter des stratégies de tests d'intégration
3. Configurer un pipeline CI/CD GitHub Actions
4. Configurer des workflows de déploiement automatisés
5. Apprendre les meilleures pratiques de test pour l'Infrastructure en tant que Code

## 1. Fondamentaux des tests CDK

### 1.1 Installation des dépendances de test

D'abord, installez les packages de test nécessaires :

```bash
npm install --save-dev jest @types/jest ts-jest
npm install --save-dev aws-cdk-lib/assertions
```

Mettez à jour votre `package.json` pour inclure les scripts de test :

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

### 1.2 Tests unitaires de base

Créez `test/ma-premiere-app-cdk-stack.test.ts` :

```typescript
import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { MaPremiereAppCdkStack } from '../lib/ma-premiere-app-cdk-stack';

describe('MaPremiereAppCdkStack', () => {
  let app: cdk.App;
  let stack: MaPremiereAppCdkStack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new MaPremiereAppCdkStack(app, 'TestStack');
    template = Template.fromStack(stack);
  });

  test('Crée un bucket S3 avec les bonnes propriétés', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    });
  });

  test('Crée une distribution CloudFront', () => {
    template.hasResource('AWS::CloudFront::Distribution', {
      Properties: Match.objectLike({
        DistributionConfig: Match.objectLike({
          DefaultRootObject: 'index.html',
          Enabled: true,
        }),
      }),
    });
  });

  test('Crée une fonction Lambda avec le bon runtime', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Runtime: 'nodejs18.x',
      Timeout: 30,
    });
  });

  test('Crée API Gateway avec CORS', () => {
    template.hasResource('AWS::ApiGateway::RestApi', {});
    
    // Vérifier la méthode CORS
    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'OPTIONS',
    });
  });

  test('La fonction Lambda a les permissions DynamoDB', () => {
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

  test('Le stack a les sorties requises', () => {
    template.hasOutput('URLSiteWeb', {});
    template.hasOutput('PointTerminaisonApi', {});
  });

  test('Les ressources ont des tags appropriés en production', () => {
    const prodApp = new cdk.App({ context: { environment: 'prod' } });
    const prodStack = new MaPremiereAppCdkStack(prodApp, 'ProdStack', {
      tags: { Environment: 'prod' }
    });
    const prodTemplate = Template.fromStack(prodStack);

    // Vérifier que les ressources sont correctement taguées
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

### 1.3 Test des Constructs personnalisés

Créez `test/web-api-construct.test.ts` :

```typescript
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { WebApiConstruct } from '../lib/web-api-construct';

describe('WebApiConstruct', () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new cdk.Stack(app, 'TestStack');
  });

  test('Crée toutes les ressources requises', () => {
    new WebApiConstruct(stack, 'TestWebApi');
    template = Template.fromStack(stack);

    // Devrait créer une table DynamoDB
    template.resourceCountIs('AWS::DynamoDB::Table', 1);
    
    // Devrait créer une fonction Lambda
    template.resourceCountIs('AWS::Lambda::Function', 1);
    
    // Devrait créer API Gateway
    template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
  });

  test('La table DynamoDB a la bonne structure', () => {
    new WebApiConstruct(stack, 'TestWebApi');
    template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::DynamoDB::Table', {
      KeySchema: [
        { AttributeName: 'pk', KeyType: 'HASH' },
        { AttributeName: 'sk', KeyType: 'RANGE' }
      ],
      BillingMode: 'PAY_PER_REQUEST',
    });
  });

  test('La fonction Lambda a les variables d\'environnement', () => {
    new WebApiConstruct(stack, 'TestWebApi');
    template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::Lambda::Function', {
      Environment: {
        Variables: {
          TABLE_NAME: { Ref: cdk.Match.anyValue() }
        }
      }
    });
  });

  test('API Gateway a CORS configuré', () => {
    new WebApiConstruct(stack, 'TestWebApi');
    template = Template.fromStack(stack);

    // Devrait avoir des méthodes OPTIONS pour CORS
    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'OPTIONS',
      Integration: {
        Type: 'MOCK'
      }
    });
  });

  test('Les propriétés personnalisées sont appliquées correctement', () => {
    new WebApiConstruct(stack, 'TestWebApi', {
      nomTable: 'table-personnalisee',
      tailleMemoire: 512,
      nomApi: 'api-personnalisee'
    });
    template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'table-personnalisee'
    });

    template.hasResourceProperties('AWS::Lambda::Function', {
      MemorySize: 512
    });

    template.hasResourceProperties('AWS::ApiGateway::RestApi', {
      Name: 'api-personnalisee'
    });
  });
});
```

### 1.4 Tests d'intégration

Créez `test/integration/app-integration.test.ts` :

```typescript
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { DatabaseStack } from '../../lib/database-stack';
import { ApplicationStack } from '../../lib/application-stack';

describe('Intégration multi-stacks', () => {
  let app: cdk.App;
  let stackBaseDonnees: DatabaseStack;
  let stackApplication: ApplicationStack;

  beforeEach(() => {
    app = new cdk.App();
    stackBaseDonnees = new DatabaseStack(app, 'TestStackBaseDonnees');
    stackApplication = new ApplicationStack(app, 'TestStackApplication', {
      nomTableUtilisateurs: stackBaseDonnees.tableUtilisateurs.tableName,
      idVpc: stackBaseDonnees.vpc.vpcId,
    });
  });

  test('Le stack application référence correctement les ressources de base de données', () => {
    const templateApp = Template.fromStack(stackApplication);
    const templateDb = Template.fromStack(stackBaseDonnees);

    // Le stack base de données devrait exporter les valeurs
    templateDb.hasOutput('NomTableUtilisateurs', {});
    templateDb.hasOutput('IdVpc', {});

    // Le stack application devrait utiliser le bon nom de table
    templateApp.hasResourceProperties('AWS::Lambda::Function', {
      Environment: {
        Variables: {
          USER_TABLE_NAME: stackBaseDonnees.tableUtilisateurs.tableName
        }
      }
    });
  });

  test('Les stacks ont les bonnes dépendances', () => {
    const dependencies = stackApplication.dependencies;
    expect(dependencies).toContain(stackBaseDonnees);
  });

  test('La configuration VPC est cohérente', () => {
    const templateDb = Template.fromStack(stackBaseDonnees);
    const templateApp = Template.fromStack(stackApplication);

    // Les deux stacks devraient référencer le même VPC
    templateDb.hasResource('AWS::EC2::VPC', {});
    templateApp.hasResourceProperties('AWS::Lambda::Function', {
      VpcConfig: cdk.Match.anyValue()
    });
  });
});
```

### 1.5 Tests snapshot

Créez `test/snapshots/stack-snapshot.test.ts` :

```typescript
import * as cdk from 'aws-cdk-lib';
import { MaPremiereAppCdkStack } from '../../lib/ma-premiere-app-cdk-stack';

describe('Snapshots de Stack', () => {
  test('Le snapshot du stack correspond au template attendu', () => {
    const app = new cdk.App();
    const stack = new MaPremiereAppCdkStack(app, 'TestStack');
    
    expect(app.synth().getStackArtifact(stack.artifactId).template).toMatchSnapshot();
  });

  test('Snapshot du stack de production', () => {
    const app = new cdk.App({ 
      context: { environment: 'prod' } 
    });
    const stack = new MaPremiereAppCdkStack(app, 'ProdStack', {
      tags: { Environment: 'prod' }
    });
    
    expect(app.synth().getStackArtifact(stack.artifactId).template).toMatchSnapshot();
  });
});
```

## 2. Stratégies de test avancées

### 2.1 Tests basés sur les propriétés

Créez `test/property-tests/construct-properties.test.ts` :

```typescript
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { WebApiConstruct } from '../../lib/web-api-construct';

describe('Tests de propriétés WebApiConstruct', () => {
  test.each([
    [128, 'table-petite', 'api-petite'],
    [256, 'table-moyenne', 'api-moyenne'],  
    [512, 'table-grande', 'api-grande'],
  ])('Crée construct avec mémoire: %i, table: %s, api: %s', (memoire, nomTable, nomApi) => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'TestStack');
    
    new WebApiConstruct(stack, 'TestConstruct', {
      tailleMemoire: memoire,
      nomTable: nomTable,
      nomApi: nomApi
    });

    const template = Template.fromStack(stack);
    
    template.hasResourceProperties('AWS::Lambda::Function', {
      MemorySize: memoire
    });
    
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: nomTable
    });
    
    template.hasResourceProperties('AWS::ApiGateway::RestApi', {
      Name: nomApi
    });
  });
});
```

### 2.2 Test des conditions d'erreur

Créez `test/error-conditions/validation.test.ts` :

```typescript
import * as cdk from 'aws-cdk-lib';
import { WebApiConstruct } from '../../lib/web-api-construct';

describe('Tests de conditions d\'erreur', () => {
  let app: cdk.App;
  let stack: cdk.Stack;

  beforeEach(() => {
    app = new cdk.App();
    stack = new cdk.Stack(app, 'TestStack');
  });

  test('Taille mémoire invalide devrait utiliser la valeur par défaut', () => {
    const construct = new WebApiConstruct(stack, 'TestConstruct', {
      tailleMemoire: -1 // Valeur invalide
    });

    const template = Template.fromStack(stack);
    
    // Devrait utiliser la valeur par défaut au lieu de la valeur invalide
    template.hasResourceProperties('AWS::Lambda::Function', {
      MemorySize: 256 // Valeur par défaut
    });
  });

  test('Nom de table vide devrait générer un nom par défaut', () => {
    new WebApiConstruct(stack, 'TestConstruct', {
      nomTable: '' // Nom de table vide
    });

    const template = Template.fromStack(stack);
    
    // Devrait créer une table avec un nom généré
    template.hasResource('AWS::DynamoDB::Table', {
      Properties: {
        TableName: cdk.Match.stringLikeRegexp('TestConstruct.*')
      }
    });
  });
});
```

## 3. Configuration du pipeline CI/CD

### 3.1 Workflow GitHub Actions

Créez `.github/workflows/ci-cd.yml` :

```yaml
name: Pipeline CI/CD CDK

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  AWS_REGION: eu-west-1
  NODE_VERSION: '18'

jobs:
  test:
    name: Exécuter les tests
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout du code
      uses: actions/checkout@v4
      
    - name: Configuration Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Installation des dépendances
      run: npm ci
      
    - name: Exécution du linting
      run: npm run lint
      continue-on-error: true
      
    - name: Exécution des tests unitaires
      run: npm run test
      
    - name: Exécution de la couverture de test
      run: npm run test:coverage
      
    - name: Upload couverture vers Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: cdk-coverage
      continue-on-error: true
      
    - name: CDK Synth
      run: npx cdk synth
      
    - name: Scan de sécurité CDK (cdk-nag)
      run: |
        npm install -g cdk-nag
        npx cdk synth --app "npx ts-node --prefer-ts-exts bin/ma-premiere-app-cdk.ts" 2>&1 | tee synth-output.txt || true
      continue-on-error: true

  deploy-dev:
    name: Déploiement en développement
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/develop'
    environment: development
    
    steps:
    - name: Checkout du code
      uses: actions/checkout@v4
      
    - name: Configuration Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Installation des dépendances
      run: npm ci
      
    - name: Configuration des informations d'identification AWS
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
        
    - name: CDK Bootstrap (si nécessaire)
      run: npx cdk bootstrap --require-approval never
      continue-on-error: true
      
    - name: Déploiement CDK en développement
      run: |
        npx cdk deploy --all --require-approval never \
        --context environment=dev \
        --outputs-file outputs-dev.json
        
    - name: Stocker les sorties de déploiement
      uses: actions/upload-artifact@v3
      with:
        name: dev-outputs
        path: outputs-dev.json
        
    - name: Exécution des tests d'intégration
      run: |
        echo "Exécution des tests d'intégration contre l'environnement de développement"
        # Ajoutez vos commandes de test d'intégration ici
        
  deploy-staging:
    name: Déploiement en staging
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    environment: staging
    
    steps:
    - name: Checkout du code
      uses: actions/checkout@v4
      
    - name: Configuration Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Installation des dépendances
      run: npm ci
      
    - name: Configuration des informations d'identification AWS
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.STAGING_AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.STAGING_AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
        
    - name: Déploiement CDK en staging
      run: |
        npx cdk deploy --all --require-approval never \
        --context environment=staging \
        --outputs-file outputs-staging.json
        
    - name: Stocker les sorties de déploiement
      uses: actions/upload-artifact@v3
      with:
        name: staging-outputs
        path: outputs-staging.json

  deploy-production:
    name: Déploiement en production
    runs-on: ubuntu-latest
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - name: Checkout du code
      uses: actions/checkout@v4
      
    - name: Configuration Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Installation des dépendances
      run: npm ci
      
    - name: Configuration des informations d'identification AWS
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.PROD_AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.PROD_AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
        
    - name: CDK Diff
      run: npx cdk diff --context environment=prod
      continue-on-error: true
      
    - name: Déploiement CDK en production
      run: |
        npx cdk deploy --all --require-approval never \
        --context environment=prod \
        --outputs-file outputs-prod.json
        
    - name: Stocker les sorties de déploiement
      uses: actions/upload-artifact@v3
      with:
        name: prod-outputs
        path: outputs-prod.json
        
    - name: Vérification de santé post-déploiement
      run: |
        echo "Exécution des vérifications de santé post-déploiement"
        # Ajoutez vos commandes de vérification de santé ici
        
    - name: Notification de succès de déploiement
      if: success()
      run: |
        echo "Déploiement en production réussi !"
        # Ajoutez la logique de notification (Slack, email, etc.)

  cleanup-pr:
    name: Nettoyer l'environnement PR
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    
    steps:
    - name: Checkout du code
      uses: actions/checkout@v4
      
    - name: Configuration Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Installation des dépendances
      run: npm ci
      
    - name: Configuration des informations d'identification AWS
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
        
    - name: Détruire l'environnement PR
      run: |
        PR_NUMBER=${{ github.event.number }}
        npx cdk destroy --force \
        --context environment=pr-${PR_NUMBER}
      continue-on-error: true
```

### 3.2 Hooks pre-commit

Créez `.pre-commit-config.yaml` :

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
        name: Vérification TypeScript
        entry: npx tsc --noEmit
        language: system
        files: \.(ts|tsx)$
        
      - id: eslint
        name: ESLint
        entry: npx eslint --fix
        language: system
        files: \.(ts|tsx)$
        
      - id: jest-tests
        name: Exécuter les tests Jest
        entry: npm test
        language: system
        pass_filenames: false
        
      - id: cdk-synth
        name: Vérification CDK Synth
        entry: npx cdk synth
        language: system
        pass_filenames: false
```

### 3.3 Fichiers de configuration de test

Créez `jest.config.js` :

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

Créez `test/setup.ts` :

```typescript
// Configuration globale des tests
import * as aws from 'aws-sdk';

// Mock AWS SDK pour les tests
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

// Définir les variables d'environnement de test
process.env.AWS_REGION = 'eu-west-1';
process.env.AWS_ACCOUNT_ID = '123456789012';
```

## 4. Exécution des tests

### 4.1 Commandes de test

Exécutez différents types de tests :

```bash
# Exécuter tous les tests
npm test

# Exécuter les tests en mode watch
npm run test:watch

# Exécuter les tests avec couverture
npm run test:coverage

# Exécuter un fichier de test spécifique
npm test -- web-api-construct.test.ts

# Exécuter des tests correspondant au motif
npm test -- --testNamePattern="DynamoDB"

# Mettre à jour les snapshots
npm test -- --updateSnapshot
```

### 4.2 Organisation des tests

Organisez vos tests dans une structure claire :

```
test/
├── unit/
│   ├── constructs/
│   │   ├── web-api-construct.test.ts
│   │   └── todo-api-construct.test.ts
│   └── stacks/
│       ├── ma-premiere-app-cdk-stack.test.ts
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

## 5. Exercice : Suite de tests complète

### 5.1 Ajouter des tests de bout en bout

Créez `test/e2e/api-endpoints.test.ts` :

```typescript
import axios from 'axios';

describe('Tests de bout en bout API', () => {
  const urlApi = process.env.API_ENDPOINT || 'https://example.com/api';

  test('GET / retourne les informations API', async () => {
    const response = await axios.get(urlApi);
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('message');
  });

  test('POST /todos crée un nouveau todo', async () => {
    const donnesTodo = {
      text: 'Item todo de test',
    };

    const response = await axios.post(`${urlApi}/todos`, donnesTodo);
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('todo');
    expect(response.data.todo.text).toBe(donnesTodo.text);
  });

  test('GET /todos retourne la liste des todos', async () => {
    const response = await axios.get(`${urlApi}/todos`);
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('todos');
    expect(Array.isArray(response.data.todos)).toBe(true);
  });
});
```

### 5.2 Tests de performance

Créez `test/performance/load-test.ts` :

```typescript
import axios from 'axios';

describe('Tests de performance', () => {
  const urlApi = process.env.API_ENDPOINT || 'https://example.com/api';

  test('L\'API répond dans les limites de temps acceptables', async () => {
    const heureDebut = Date.now();
    const response = await axios.get(urlApi);
    const heureFin = Date.now();
    
    const tempsReponse = heureFin - heureDebut;
    
    expect(response.status).toBe(200);
    expect(tempsReponse).toBeLessThan(2000); // Moins de 2 secondes
  });

  test('L\'API gère les requêtes concurrentes', async () => {
    const requetesConcurrentes = 10;
    const promesses = Array(requetesConcurrentes).fill(null).map(() => 
      axios.get(urlApi)
    );

    const responses = await Promise.all(promesses);
    
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });
  });
});
```

## Résumé

Aujourd'hui vous avez appris :

1. ✅ Écrire des tests unitaires complets pour les constructs CDK
2. ✅ Implémenter des stratégies de tests d'intégration  
3. ✅ Configurer un pipeline CI/CD GitHub Actions
4. ✅ Configurer des workflows de déploiement automatisés
5. ✅ Meilleures pratiques de test pour l'Infrastructure en tant que Code

### Concepts clés couverts

- **Tests unitaires** : Tester les constructs et stacks individuels
- **Tests d'intégration** : Tester les dépendances inter-stacks
- **Tests snapshot** : Assurer la cohérence des templates
- **Pipeline CI/CD** : Tests et déploiement automatisés
- **Organisation des tests** : Structurer les tests pour la maintenabilité

### Pyramide de test pour CDK

```
    Tests E2E (Peu)
      ↑
  Tests d'intégration (Quelques-uns)  
      ↑
    Tests unitaires (Beaucoup)
```

### Prochaines étapes

Demain (Jour 5), nous nous concentrerons sur les meilleures pratiques de production, la sécurité, la surveillance et l'excellence opérationnelle pour vos applications CDK.

---

**Meilleures pratiques de test :**

1. **Structure de test** : Utilisez le modèle AAA (Arrange, Act, Assert)
2. **Couverture de test** : Visez 80%+ de couverture de code
3. **Tests rapides** : Gardez les tests unitaires rapides et déterministes
4. **Intégration CI** : Exécutez les tests à chaque commit
5. **Parité d'environnement** : Testez dans des environnements similaires à la production