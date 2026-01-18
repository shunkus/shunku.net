---
title: "Docker Compose: Managing Multi-Container Applications"
date: "2025-01-18"
excerpt: "Learn Docker Compose for defining and running multi-container applications. Master docker-compose.yml, services, networks, volumes, and environment management."
tags: ["Docker", "Containers", "DevOps"]
author: "Shunku"
---

Docker Compose is a tool for defining and running multi-container Docker applications. Instead of running multiple `docker run` commands, you define everything in a single YAML file and manage it with simple commands.

## Why Docker Compose?

Without Compose, starting a typical web application might look like this:

```bash
# Create network
docker network create myapp-network

# Start database
docker run -d \
  --name postgres \
  --network myapp-network \
  -e POSTGRES_PASSWORD=secret \
  -v pgdata:/var/lib/postgresql/data \
  postgres:15

# Start Redis
docker run -d \
  --name redis \
  --network myapp-network \
  redis:7

# Start application
docker run -d \
  --name app \
  --network myapp-network \
  -p 3000:3000 \
  -e DATABASE_URL=postgres://postgres:secret@postgres:5432/app \
  myapp:latest
```

With Compose, this becomes a single file:

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://postgres:secret@postgres:5432/app
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7

volumes:
  pgdata:
```

```bash
# Start everything
docker compose up -d
```

## Basic Structure

A `docker-compose.yml` file has these top-level elements:

```yaml
version: "3.9"  # Optional in modern Docker

services:       # Container definitions
  web:
    # service config...
  db:
    # service config...

volumes:        # Named volumes
  data:

networks:       # Custom networks
  backend:

configs:        # Configuration files
  my_config:

secrets:        # Sensitive data
  my_secret:
```

## Essential Commands

```bash
# Start services
docker compose up              # Foreground
docker compose up -d           # Detached (background)

# Stop services
docker compose stop            # Stop without removing
docker compose down            # Stop and remove containers
docker compose down -v         # Also remove volumes

# View status
docker compose ps              # List containers
docker compose logs            # View logs
docker compose logs -f web     # Follow specific service logs

# Build
docker compose build           # Build all services
docker compose build --no-cache # Build without cache

# Execute commands
docker compose exec web bash   # Run command in service
docker compose run web npm test # Run one-off command

# Scale
docker compose up -d --scale web=3  # Run 3 instances
```

## Service Configuration

### Image vs Build

```yaml
services:
  # Use pre-built image
  redis:
    image: redis:7-alpine

  # Build from Dockerfile
  app:
    build: .

  # Build with options
  app-advanced:
    build:
      context: ./app
      dockerfile: Dockerfile.prod
      args:
        NODE_ENV: production
      target: production  # Multi-stage target
```

### Ports

```yaml
services:
  web:
    ports:
      - "3000:3000"           # host:container
      - "8080:80"             # Different ports
      - "127.0.0.1:3000:3000" # Bind to localhost only
      - "3000"                # Random host port
```

### Environment Variables

```yaml
services:
  app:
    # Inline definition
    environment:
      NODE_ENV: production
      DEBUG: "false"
      DATABASE_URL: postgres://user:pass@db:5432/mydb

    # From .env file
    env_file:
      - .env
      - .env.local

    # Pass from host
    environment:
      - API_KEY  # Uses value from host environment
```

### Volumes

```yaml
services:
  app:
    volumes:
      # Named volume
      - data:/var/lib/data

      # Bind mount (host path)
      - ./src:/app/src

      # Read-only bind mount
      - ./config:/app/config:ro

      # Anonymous volume
      - /app/node_modules

volumes:
  data:
    driver: local
```

### Dependencies

```yaml
services:
  app:
    depends_on:
      - db
      - redis

  # With health check conditions
  app:
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started

  db:
    image: postgres:15
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
```

### Networks

```yaml
services:
  frontend:
    networks:
      - frontend

  backend:
    networks:
      - frontend
      - backend

  db:
    networks:
      - backend

networks:
  frontend:
  backend:
    internal: true  # No external access
```

### Resource Limits

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### Restart Policies

```yaml
services:
  app:
    restart: unless-stopped

  # Options: no, always, on-failure, unless-stopped
```

### Health Checks

```yaml
services:
  web:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## Complete Example: Web Application Stack

```yaml
# docker-compose.yml
services:
  # Application
  app:
    build:
      context: .
      target: production
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgres://postgres:${DB_PASSWORD}@db:5432/myapp
      REDIS_URL: redis://redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Database
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # Cache
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped

  # Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

```bash
# .env file
DB_PASSWORD=supersecretpassword
```

## Development vs Production

Use multiple Compose files for different environments:

```yaml
# docker-compose.yml (base)
services:
  app:
    build: .
    environment:
      NODE_ENV: ${NODE_ENV:-development}

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```yaml
# docker-compose.override.yml (development - auto-loaded)
services:
  app:
    build:
      target: development
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "3000:3000"
      - "9229:9229"  # Debug port
    command: npm run dev

  db:
    ports:
      - "5432:5432"  # Expose for local tools
```

```yaml
# docker-compose.prod.yml (production)
services:
  app:
    build:
      target: production
    restart: always
    deploy:
      resources:
        limits:
          memory: 512M

  db:
    restart: always
    # No port exposure in production
```

```bash
# Development (uses override automatically)
docker compose up

# Production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Useful Patterns

### Wait for Dependencies

```yaml
services:
  app:
    depends_on:
      db:
        condition: service_healthy
    # Or use a wait script
    command: sh -c "wait-for-it db:5432 -- npm start"
```

### Init Containers Pattern

```yaml
services:
  migrate:
    build: .
    command: npm run migrate
    depends_on:
      db:
        condition: service_healthy

  app:
    build: .
    depends_on:
      migrate:
        condition: service_completed_successfully
```

### Profiles for Optional Services

```yaml
services:
  app:
    # Always starts
    build: .

  db:
    # Always starts
    image: postgres:15

  debug-tools:
    # Only with debug profile
    profiles: ["debug"]
    image: nicolaka/netshoot

  monitoring:
    # Only with monitoring profile
    profiles: ["monitoring"]
    image: prom/prometheus
```

```bash
# Start without optional services
docker compose up -d

# Start with debug tools
docker compose --profile debug up -d

# Start with multiple profiles
docker compose --profile debug --profile monitoring up -d
```

### Extending Services

```yaml
# docker-compose.yml
services:
  base-app:
    build: .
    environment:
      - LOG_LEVEL=info

  worker:
    extends:
      service: base-app
    command: npm run worker

  scheduler:
    extends:
      service: base-app
    command: npm run scheduler
```

## Environment Variables

### Variable Substitution

```yaml
services:
  app:
    image: myapp:${TAG:-latest}  # Default value
    environment:
      - DB_HOST=${DB_HOST:?DB_HOST is required}  # Required
      - DEBUG=${DEBUG:-false}
```

### .env File

```bash
# .env
COMPOSE_PROJECT_NAME=myproject
TAG=v1.2.3
DB_HOST=db
DB_PASSWORD=secret
```

The `.env` file is automatically loaded by Compose.

## Networking Deep Dive

```yaml
services:
  frontend:
    networks:
      webnet:
        aliases:
          - web
          - frontend-app

  backend:
    networks:
      webnet:
      dbnet:
        ipv4_address: 172.28.0.10

networks:
  webnet:
    driver: bridge
  dbnet:
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16
```

### Service Discovery

Services can reach each other by service name:

```yaml
services:
  app:
    environment:
      DATABASE_URL: postgres://db:5432/mydb  # "db" is the service name
      REDIS_URL: redis://redis:6379
```

## Best Practices

### 1. Use Specific Image Tags

```yaml
# Bad
services:
  db:
    image: postgres

# Good
services:
  db:
    image: postgres:15.4-alpine
```

### 2. Don't Store Secrets in Compose Files

```yaml
# Bad
services:
  db:
    environment:
      POSTGRES_PASSWORD: mysecretpassword

# Good - use .env (not committed)
services:
  db:
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
```

### 3. Use Health Checks

```yaml
services:
  db:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  app:
    depends_on:
      db:
        condition: service_healthy
```

### 4. Name Your Volumes

```yaml
# Bad - anonymous volume
services:
  db:
    volumes:
      - /var/lib/postgresql/data

# Good - named volume
services:
  db:
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Quick Reference

| Command | Description |
|---------|-------------|
| `docker compose up` | Create and start containers |
| `docker compose up -d` | Start in detached mode |
| `docker compose down` | Stop and remove containers |
| `docker compose down -v` | Also remove volumes |
| `docker compose ps` | List containers |
| `docker compose logs` | View output |
| `docker compose logs -f` | Follow output |
| `docker compose exec SERVICE CMD` | Execute command |
| `docker compose build` | Build images |
| `docker compose pull` | Pull images |
| `docker compose restart` | Restart services |

## Key Takeaways

1. **One file to rule them all** - Define entire application stack in one place
2. **Use depends_on with conditions** - Ensure proper startup order
3. **Separate environments** - Use override files for dev/prod differences
4. **Health checks are essential** - For reliable container orchestration
5. **Use .env for configuration** - Keep secrets out of compose files
6. **Named volumes persist data** - Anonymous volumes are lost on removal

## Next Steps

In the next article, we'll dive deep into Docker volumes and data persistence strategies.

## References

- Docker Deep Dive, 5th Edition - Nigel Poulton
- The Ultimate Docker Container Book, 3rd Edition - Dr. Gabriel N. Schenker
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
