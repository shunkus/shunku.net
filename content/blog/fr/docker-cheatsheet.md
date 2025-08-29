---
title: "Aide-mémoire Docker"
date: "2019-01-15"
updatedDate: "2025-01-15"
excerpt: "Un guide complet des fondamentaux Docker, de la conteneurisation, de la gestion d'images, du réseau et de l'orchestration pour construire et déployer des applications."
tags: ["Docker", "Conteneurisation", "DevOps", "Déploiement", "Infrastructure", "Aide-mémoire"]
author: "Shun Kushigami"
---

# Aide-mémoire Docker

Un guide complet des fondamentaux Docker, de la conteneurisation, de la gestion d'images, du réseau et de l'orchestration pour construire et déployer des applications.

## Commandes Docker de Base

```bash
# Vérifier la version de Docker
docker --version
docker version

# Afficher les informations système
docker info

# Obtenir de l'aide
docker --help
docker <commande> --help

# Se connecter à Docker Hub
docker login

# Se déconnecter de Docker Hub
docker logout
```

## Gestion des Images

```bash
# Lister les images
docker images
docker image ls

# Rechercher des images
docker search <nom_image>

# Télécharger une image
docker pull <nom_image>
docker pull <nom_image>:<tag>

# Construire une image depuis un Dockerfile
docker build -t <nom_image> .
docker build -t <nom_image>:<tag> .

# Étiqueter une image
docker tag <image_source> <image_cible>

# Pousser une image vers le registre
docker push <nom_image>:<tag>

# Supprimer une image
docker rmi <id_image>
docker image rm <nom_image>

# Supprimer toutes les images inutilisées
docker image prune

# Afficher l'historique d'une image
docker history <nom_image>

# Inspecter une image
docker inspect <nom_image>
```

## Opérations sur les Conteneurs

```bash
# Exécuter un conteneur
docker run <nom_image>
docker run -d <nom_image>                    # Mode détaché
docker run -it <nom_image> /bin/bash        # Mode interactif
docker run -p 8080:80 <nom_image>           # Mappage de ports
docker run --name <nom_conteneur> <image>   # Conteneur nommé

# Lister les conteneurs en cours d'exécution
docker ps

# Lister tous les conteneurs
docker ps -a

# Démarrer un conteneur arrêté
docker start <id_conteneur>

# Arrêter un conteneur en cours d'exécution
docker stop <id_conteneur>

# Redémarrer un conteneur
docker restart <id_conteneur>

# Mettre en pause/reprendre un conteneur
docker pause <id_conteneur>
docker unpause <id_conteneur>

# Tuer un conteneur
docker kill <id_conteneur>

# Supprimer un conteneur
docker rm <id_conteneur>

# Supprimer tous les conteneurs arrêtés
docker container prune

# Exécuter une commande dans un conteneur en cours
docker exec -it <id_conteneur> /bin/bash
docker exec <id_conteneur> <commande>

# Copier des fichiers entre conteneur et hôte
docker cp <fichier> <id_conteneur>:/chemin
docker cp <id_conteneur>:/chemin <fichier>

# Afficher les journaux du conteneur
docker logs <id_conteneur>
docker logs -f <id_conteneur>               # Suivre les journaux

# Afficher les processus du conteneur
docker top <id_conteneur>

# Afficher l'utilisation des ressources
docker stats
docker stats <id_conteneur>

# Inspecter un conteneur
docker inspect <id_conteneur>
```

## Meilleures Pratiques Dockerfile

```dockerfile
# Utiliser des images de base officielles
FROM node:16-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de package en premier (pour un meilleur cache)
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code de l'application
COPY . .

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Changer la propriété
RUN chown -R nextjs:nodejs /app
USER nextjs

# Exposer le port
EXPOSE 3000

# Vérification de santé
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Commande par défaut
CMD ["npm", "start"]
```

## Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - db
    volumes:
      - ./src:/app/src
    networks:
      - app-network

  db:
    image: postgres:13
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

### Commandes Docker Compose

```bash
# Démarrer les services
docker-compose up
docker-compose up -d              # Mode détaché
docker-compose up --build         # Reconstruire les images

# Arrêter les services
docker-compose down
docker-compose down -v            # Supprimer les volumes

# Mettre à l'échelle les services
docker-compose up -d --scale app=3

# Voir les journaux
docker-compose logs
docker-compose logs -f app        # Suivre les journaux d'un service spécifique

# Exécuter des commandes
docker-compose exec app /bin/bash

# Lister les services
docker-compose ps

# Redémarrer les services
docker-compose restart
```

## Réseau

```bash
# Lister les réseaux
docker network ls

# Créer un réseau
docker network create <nom_réseau>
docker network create --driver bridge <nom_réseau>

# Inspecter un réseau
docker network inspect <nom_réseau>

# Connecter un conteneur au réseau
docker network connect <nom_réseau> <id_conteneur>

# Déconnecter un conteneur du réseau
docker network disconnect <nom_réseau> <id_conteneur>

# Supprimer un réseau
docker network rm <nom_réseau>

# Supprimer les réseaux inutilisés
docker network prune
```

## Gestion des Volumes

```bash
# Lister les volumes
docker volume ls

# Créer un volume
docker volume create <nom_volume>

# Inspecter un volume
docker volume inspect <nom_volume>

# Supprimer un volume
docker volume rm <nom_volume>

# Supprimer les volumes inutilisés
docker volume prune

# Monter un volume dans un conteneur
docker run -v <nom_volume>:/chemin/dans/conteneur <image>
docker run -v /chemin/hôte:/chemin/conteneur <image>  # Montage de liaison
```

## Nettoyage du Système

```bash
# Supprimer conteneurs arrêtés, réseaux inutilisés, images et cache
docker system prune

# Supprimer tout y compris les volumes
docker system prune -a --volumes

# Afficher l'utilisation du disque
docker system df

# Supprimer tous les conteneurs
docker rm $(docker ps -aq)

# Supprimer toutes les images
docker rmi $(docker images -q)

# Supprimer les images pendantes
docker image prune

# Supprimer les conteneurs inutilisés
docker container prune

# Supprimer les réseaux inutilisés
docker network prune

# Supprimer les volumes inutilisés
docker volume prune
```

## Registre et Dépôt

```bash
# Se connecter au registre
docker login <url_registre>

# Étiqueter pour le registre
docker tag <image> <registre>/<dépôt>:<tag>

# Pousser vers le registre
docker push <registre>/<dépôt>:<tag>

# Tirer du registre
docker pull <registre>/<dépôt>:<tag>

# Rechercher dans Docker Hub
docker search <terme>
```

## Contexte Docker

```bash
# Lister les contextes
docker context ls

# Créer un contexte
docker context create <nom> --docker host=ssh://utilisateur@hôte

# Utiliser un contexte
docker context use <nom>

# Supprimer un contexte
docker context rm <nom>
```

## Exemple de Construction Multi-étapes

```dockerfile
# Étape de construction
FROM node:16-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Étape de production
FROM node:16-alpine AS production

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

## Modèles Courants

### Environnement de Développement
```bash
# Rechargement à chaud avec montage de volume
docker run -it --rm \
  -v $(pwd):/app \
  -v /app/node_modules \
  -p 3000:3000 \
  node:16-alpine \
  sh -c "cd /app && npm run dev"
```

### Variables d'Environnement
```bash
# Passer des variables d'environnement
docker run -e NODE_ENV=production <image>
docker run --env-file .env <image>
```

### Vérifications de Santé
```bash
# Exécuter avec vérification de santé
docker run --health-cmd="curl -f http://localhost:3000 || exit 1" \
           --health-interval=30s \
           --health-timeout=3s \
           --health-start-period=5s \
           --health-retries=3 \
           <image>
```

## Dépannage

```bash
# Déboguer le démarrage du conteneur
docker run --rm -it <image> /bin/sh

# Vérifier le code de sortie du conteneur
docker ps -a

# Voir les informations détaillées du conteneur
docker inspect <id_conteneur>

# Surveiller l'utilisation des ressources
docker stats

# Accéder au système de fichiers du conteneur
docker exec -it <id_conteneur> /bin/bash

# Exporter le conteneur en tant que tar
docker export <id_conteneur> > conteneur.tar

# Importer tar en tant qu'image
docker import conteneur.tar <nom_image>
```

## Meilleures Pratiques de Sécurité

- Utiliser des images de base officielles
- Maintenir les images à jour
- Ne pas exécuter en tant qu'utilisateur root
- Utiliser le fichier .dockerignore
- Scanner les images pour les vulnérabilités
- Utiliser des constructions multi-étapes
- Limiter les ressources des conteneurs
- Utiliser la gestion des secrets
- Activer la confiance du contenu
- Utiliser des images de base minimales (alpine)

Cet aide-mémoire couvre les commandes et modèles Docker les plus couramment utilisés. L'écosystème Docker est vaste, donc consultez la documentation officielle pour les fonctionnalités avancées et les cas d'usage spécifiques.