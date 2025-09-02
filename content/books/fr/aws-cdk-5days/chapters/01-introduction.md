---
title: Introduction - Bienvenue dans l'univers d'AWS CDK
order: 1
---

# Introduction - Bienvenue dans l'univers d'AWS CDK

## À propos de ce livre

Ce livre vise à vous aider à apprendre AWS Cloud Development Kit (AWS CDK) en 5 jours et à acquérir des compétences pratiques de gestion d'infrastructure.

### Public cible

- Personnes ayant des connaissances de base d'AWS
- Personnes ayant une expérience de programmation (particulièrement TypeScript/JavaScript)
- Personnes intéressées par l'Infrastructure en tant que Code (IaC)
- Personnes qui souhaitent s'éloigner de la gestion manuelle d'infrastructure

### Objectifs d'apprentissage

À la fin de ce livre, vous serez capable de :

1. Comprendre les concepts de base d'AWS CDK et configurer l'environnement
2. Créer et gérer des ressources AWS de base avec CDK
3. Créer des composants réutilisables (Constructs)
4. Intégrer avec des pipelines de tests et CI/CD
5. Déployer en sécurité vers des environnements de production

## Qu'est-ce qu'AWS CDK ?

AWS Cloud Development Kit (AWS CDK) est un framework open source pour définir des ressources d'application cloud en utilisant des langages de programmation.

### Différences par rapport aux méthodes traditionnelles

#### CloudFormation traditionnel
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

// Création d'un bucket S3 avec versioning et blocage d'accès public
const bucket = new s3.Bucket(this, 'MyBucket', {
  bucketName: 'my-app-bucket-12345',
  versioned: true,
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL
});
```

### Fonctionnalités d'AWS CDK

1. **Exploiter la puissance des langages de programmation**
   - Utiliser des instructions conditionnelles, des boucles, des fonctions, etc.
   - Utiliser les fonctionnalités d'autocomplétion et de refactoring de l'IDE
   - Appliquer les compétences de programmation existantes

2. **Réutilisabilité et modularisation**
   - Créer et réutiliser des Constructs personnalisés
   - Partager sous forme de packages npm
   - Standardiser les meilleures pratiques au sein des organisations

3. **Sécurité de type**
   - Détecter les erreurs au moment de la compilation
   - Autocomplétion et validation des propriétés
   - APIs documentées

4. **Compatibilité CloudFormation**
   - Génère finalement des templates CloudFormation
   - Intégrable avec les ressources CloudFormation existantes
   - Accès à toutes les fonctionnalités CloudFormation

## Comment procéder à l'apprentissage

### Programme d'apprentissage de 5 jours

| Jour | Thème | Contenu |
|------|-------|---------|
| Jour 1 | Bases et configuration | Concepts de base CDK, configuration de l'environnement, premier déploiement |
| Jour 2 | Constructs et Stack de base | Création de ressources AWS de base, gestion des Stacks |
| Jour 3 | Constructs avancés et modèles | Constructs personnalisés, modèles de conception |
| Jour 4 | Tests et CI/CD | Tests unitaires, tests d'intégration, pipelines CI/CD |
| Jour 5 | Meilleures pratiques et déploiement en production | Sécurité, monitoring, opérations de production |

### Vérification des prérequis

Avant de commencer, veuillez confirmer que vous avez les connaissances suivantes :

#### Connaissances AWS de base
- Services de base comme EC2, S3, Lambda, RDS
- Concepts IAM de base (rôles, politiques)
- Bases des VPC et du réseau

#### Connaissances de programmation
- Syntaxe de base TypeScript/JavaScript
- Expérience avec npm/yarn
- Opérations Git de base

#### Environnement de développement
- Node.js 18.x ou supérieur
- N'importe quel IDE ou éditeur (VS Code recommandé)
- AWS CLI
- Git

## Structure du livre

Chaque chapitre est structuré comme suit :

1. **Vue d'ensemble** - Résumé du contenu à apprendre ce jour-là
2. **Théorie** - Concepts de base et contexte théorique
3. **Pratique** - Apprentissage pratique en écrivant du code réel
4. **Exercices** - Tâches pour approfondir la compréhension
5. **Résumé** - Révision du contenu d'apprentissage de ce jour

## À propos du projet exemple

Dans ce livre, nous construirons progressivement une application web comme suit :

1. **Jour 1** : Site web statique (S3 + CloudFront)
2. **Jour 2** : API serverless (Lambda + API Gateway)
3. **Jour 3** : Intégration de base de données (DynamoDB)
4. **Jour 4** : Pipeline CI/CD
5. **Jour 5** : Monitoring et alertes

### Vue d'ensemble de l'architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CloudFront    │────│   API Gateway    │────│     Lambda      │
│  (Web statique) │    │   (API REST)     │    │  (Logique       │
└─────────────────┘    └──────────────────┘    │   métier)       │
                                               └─────────────────┘
                                                        │
                                               ┌─────────────────┐
                                               │    DynamoDB     │
                                               │ (Base de données│
                                               └─────────────────┘
```

## Prochaines étapes

Lorsque vous êtes prêt, procédez au Jour 1 : "Configuration de l'environnement AWS CDK et premiers pas".

En apprenant à travers l'écriture de code réel, vous devriez expérimenter la puissance et la commodité d'AWS CDK.

---

**Note** : L'exécution du code d'exemple dans ce livre peut entraîner des frais AWS. Nous recommandons de pratiquer dans les limites du niveau gratuit AWS. Assurez-vous de supprimer les ressources inutiles une fois terminé.