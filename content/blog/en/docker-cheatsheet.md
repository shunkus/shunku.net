---
title: "Docker Cheatsheet"
date: "2019-01-15"
updatedDate: "2025-01-15"
excerpt: "A comprehensive guide to Docker fundamentals, containerization, image management, networking, and orchestration for building and deploying applications."
tags: ["Docker", "Containerization", "DevOps", "Deployment", "Infrastructure", "Cheatsheet"]
author: "Shun Kushigami"
---

# Docker Cheatsheet

A comprehensive guide to Docker fundamentals, containerization, image management, networking, and orchestration for building and deploying applications.

## Basic Docker Commands

```bash
# Check Docker version
docker --version
docker version

# Show system information
docker info

# Get help
docker --help
docker <command> --help

# Login to Docker Hub
docker login

# Logout from Docker Hub
docker logout
```

## Image Management

```bash
# List images
docker images
docker image ls

# Search for images
docker search <image_name>

# Pull an image
docker pull <image_name>
docker pull <image_name>:<tag>

# Build an image from Dockerfile
docker build -t <image_name> .
docker build -t <image_name>:<tag> .

# Tag an image
docker tag <source_image> <target_image>

# Push an image to registry
docker push <image_name>:<tag>

# Remove an image
docker rmi <image_id>
docker image rm <image_name>

# Remove all unused images
docker image prune

# Show image history
docker history <image_name>

# Inspect an image
docker inspect <image_name>
```

## Container Operations

```bash
# Run a container
docker run <image_name>
docker run -d <image_name>                    # Detached mode
docker run -it <image_name> /bin/bash        # Interactive mode
docker run -p 8080:80 <image_name>           # Port mapping
docker run --name <container_name> <image>   # Named container

# List running containers
docker ps

# List all containers
docker ps -a

# Start a stopped container
docker start <container_id>

# Stop a running container
docker stop <container_id>

# Restart a container
docker restart <container_id>

# Pause/unpause a container
docker pause <container_id>
docker unpause <container_id>

# Kill a container
docker kill <container_id>

# Remove a container
docker rm <container_id>

# Remove all stopped containers
docker container prune

# Execute command in running container
docker exec -it <container_id> /bin/bash
docker exec <container_id> <command>

# Copy files between container and host
docker cp <file> <container_id>:/path
docker cp <container_id>:/path <file>

# Show container logs
docker logs <container_id>
docker logs -f <container_id>               # Follow logs

# Show container processes
docker top <container_id>

# Show container resource usage
docker stats
docker stats <container_id>

# Inspect a container
docker inspect <container_id>
```

## Dockerfile Best Practices

```dockerfile
# Use official base images
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Default command
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

### Docker Compose Commands

```bash
# Start services
docker-compose up
docker-compose up -d              # Detached mode
docker-compose up --build         # Rebuild images

# Stop services
docker-compose down
docker-compose down -v            # Remove volumes

# Scale services
docker-compose up -d --scale app=3

# View logs
docker-compose logs
docker-compose logs -f app        # Follow logs for specific service

# Execute commands
docker-compose exec app /bin/bash

# List services
docker-compose ps

# Restart services
docker-compose restart
```

## Networking

```bash
# List networks
docker network ls

# Create a network
docker network create <network_name>
docker network create --driver bridge <network_name>

# Inspect a network
docker network inspect <network_name>

# Connect container to network
docker network connect <network_name> <container_id>

# Disconnect container from network
docker network disconnect <network_name> <container_id>

# Remove network
docker network rm <network_name>

# Remove unused networks
docker network prune
```

## Volume Management

```bash
# List volumes
docker volume ls

# Create a volume
docker volume create <volume_name>

# Inspect a volume
docker volume inspect <volume_name>

# Remove a volume
docker volume rm <volume_name>

# Remove unused volumes
docker volume prune

# Mount volume to container
docker run -v <volume_name>:/path/in/container <image>
docker run -v /host/path:/container/path <image>  # Bind mount
```

## System Cleanup

```bash
# Remove stopped containers, unused networks, images and cache
docker system prune

# Remove everything including volumes
docker system prune -a --volumes

# Show disk usage
docker system df

# Remove all containers
docker rm $(docker ps -aq)

# Remove all images
docker rmi $(docker images -q)

# Remove dangling images
docker image prune

# Remove unused containers
docker container prune

# Remove unused networks
docker network prune

# Remove unused volumes
docker volume prune
```

## Registry and Repository

```bash
# Login to registry
docker login <registry_url>

# Tag for registry
docker tag <image> <registry>/<repository>:<tag>

# Push to registry
docker push <registry>/<repository>:<tag>

# Pull from registry
docker pull <registry>/<repository>:<tag>

# Search in Docker Hub
docker search <term>
```

## Docker Context

```bash
# List contexts
docker context ls

# Create context
docker context create <name> --docker host=ssh://user@host

# Use context
docker context use <name>

# Remove context
docker context rm <name>
```

## Multi-stage Build Example

```dockerfile
# Build stage
FROM node:16-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:16-alpine AS production

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

## Common Patterns

### Development Environment
```bash
# Hot reload with volume mounting
docker run -it --rm \
  -v $(pwd):/app \
  -v /app/node_modules \
  -p 3000:3000 \
  node:16-alpine \
  sh -c "cd /app && npm run dev"
```

### Environment Variables
```bash
# Pass environment variables
docker run -e NODE_ENV=production <image>
docker run --env-file .env <image>
```

### Health Checks
```bash
# Run with health check
docker run --health-cmd="curl -f http://localhost:3000 || exit 1" \
           --health-interval=30s \
           --health-timeout=3s \
           --health-start-period=5s \
           --health-retries=3 \
           <image>
```

## Troubleshooting

```bash
# Debug container startup
docker run --rm -it <image> /bin/sh

# Check container exit code
docker ps -a

# View detailed container information
docker inspect <container_id>

# Monitor resource usage
docker stats

# Access container filesystem
docker exec -it <container_id> /bin/bash

# Export container as tar
docker export <container_id> > container.tar

# Import tar as image
docker import container.tar <image_name>
```

## Security Best Practices

- Use official base images
- Keep images updated
- Don't run as root user
- Use .dockerignore file
- Scan images for vulnerabilities
- Use multi-stage builds
- Limit container resources
- Use secrets management
- Enable content trust
- Use minimal base images (alpine)

This cheatsheet covers the most commonly used Docker commands and patterns. Docker's ecosystem is vast, so refer to the official documentation for advanced features and specific use cases.