---
title: "Hoja de Trucos de Docker"
date: "2019-01-15"
updatedDate: "2025-01-15"
excerpt: "Una guía completa de los fundamentos de Docker, contenedorización, gestión de imágenes, redes y orquestación para crear y desplegar aplicaciones."
tags: ["Docker", "Contenedorización", "DevOps", "Despliegue", "Infraestructura", "Hoja de Trucos"]
author: "Shun Kushigami"
---

# Hoja de Trucos de Docker

Una guía completa de los fundamentos de Docker, contenedorización, gestión de imágenes, redes y orquestación para crear y desplegar aplicaciones.

## Comandos Básicos de Docker

```bash
# Verificar versión de Docker
docker --version
docker version

# Mostrar información del sistema
docker info

# Obtener ayuda
docker --help
docker <comando> --help

# Iniciar sesión en Docker Hub
docker login

# Cerrar sesión en Docker Hub
docker logout
```

## Gestión de Imágenes

```bash
# Listar imágenes
docker images
docker image ls

# Buscar imágenes
docker search <nombre_imagen>

# Descargar una imagen
docker pull <nombre_imagen>
docker pull <nombre_imagen>:<etiqueta>

# Construir imagen desde Dockerfile
docker build -t <nombre_imagen> .
docker build -t <nombre_imagen>:<etiqueta> .

# Etiquetar una imagen
docker tag <imagen_origen> <imagen_destino>

# Subir imagen al registro
docker push <nombre_imagen>:<etiqueta>

# Eliminar una imagen
docker rmi <id_imagen>
docker image rm <nombre_imagen>

# Eliminar todas las imágenes no utilizadas
docker image prune

# Mostrar historial de imagen
docker history <nombre_imagen>

# Inspeccionar una imagen
docker inspect <nombre_imagen>
```

## Operaciones de Contenedores

```bash
# Ejecutar un contenedor
docker run <nombre_imagen>
docker run -d <nombre_imagen>                    # Modo separado
docker run -it <nombre_imagen> /bin/bash        # Modo interactivo
docker run -p 8080:80 <nombre_imagen>           # Mapeo de puertos
docker run --name <nombre_contenedor> <imagen>  # Contenedor con nombre

# Listar contenedores en ejecución
docker ps

# Listar todos los contenedores
docker ps -a

# Iniciar un contenedor detenido
docker start <id_contenedor>

# Detener un contenedor en ejecución
docker stop <id_contenedor>

# Reiniciar un contenedor
docker restart <id_contenedor>

# Pausar/despausar un contenedor
docker pause <id_contenedor>
docker unpause <id_contenedor>

# Matar un contenedor
docker kill <id_contenedor>

# Eliminar un contenedor
docker rm <id_contenedor>

# Eliminar todos los contenedores detenidos
docker container prune

# Ejecutar comando en contenedor en ejecución
docker exec -it <id_contenedor> /bin/bash
docker exec <id_contenedor> <comando>

# Copiar archivos entre contenedor y host
docker cp <archivo> <id_contenedor>:/ruta
docker cp <id_contenedor>:/ruta <archivo>

# Mostrar registros del contenedor
docker logs <id_contenedor>
docker logs -f <id_contenedor>               # Seguir registros

# Mostrar procesos del contenedor
docker top <id_contenedor>

# Mostrar uso de recursos del contenedor
docker stats
docker stats <id_contenedor>

# Inspeccionar un contenedor
docker inspect <id_contenedor>
```

## Mejores Prácticas de Dockerfile

```dockerfile
# Usar imágenes base oficiales
FROM node:16-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de paquetes primero (para mejor caché)
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código de aplicación
COPY . .

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Cambiar propiedad
RUN chown -R nextjs:nodejs /app
USER nextjs

# Exponer puerto
EXPOSE 3000

# Verificación de salud
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Comando predeterminado
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

### Comandos de Docker Compose

```bash
# Iniciar servicios
docker-compose up
docker-compose up -d              # Modo separado
docker-compose up --build         # Reconstruir imágenes

# Detener servicios
docker-compose down
docker-compose down -v            # Eliminar volúmenes

# Escalar servicios
docker-compose up -d --scale app=3

# Ver registros
docker-compose logs
docker-compose logs -f app        # Seguir registros de servicio específico

# Ejecutar comandos
docker-compose exec app /bin/bash

# Listar servicios
docker-compose ps

# Reiniciar servicios
docker-compose restart
```

## Redes

```bash
# Listar redes
docker network ls

# Crear una red
docker network create <nombre_red>
docker network create --driver bridge <nombre_red>

# Inspeccionar una red
docker network inspect <nombre_red>

# Conectar contenedor a red
docker network connect <nombre_red> <id_contenedor>

# Desconectar contenedor de red
docker network disconnect <nombre_red> <id_contenedor>

# Eliminar red
docker network rm <nombre_red>

# Eliminar redes no utilizadas
docker network prune
```

## Gestión de Volúmenes

```bash
# Listar volúmenes
docker volume ls

# Crear un volumen
docker volume create <nombre_volumen>

# Inspeccionar un volumen
docker volume inspect <nombre_volumen>

# Eliminar un volumen
docker volume rm <nombre_volumen>

# Eliminar volúmenes no utilizados
docker volume prune

# Montar volumen en contenedor
docker run -v <nombre_volumen>:/ruta/en/contenedor <imagen>
docker run -v /ruta/host:/ruta/contenedor <imagen>  # Montaje de enlace
```

## Limpieza del Sistema

```bash
# Eliminar contenedores detenidos, redes no utilizadas, imágenes y caché
docker system prune

# Eliminar todo incluyendo volúmenes
docker system prune -a --volumes

# Mostrar uso de disco
docker system df

# Eliminar todos los contenedores
docker rm $(docker ps -aq)

# Eliminar todas las imágenes
docker rmi $(docker images -q)

# Eliminar imágenes colgantes
docker image prune

# Eliminar contenedores no utilizados
docker container prune

# Eliminar redes no utilizadas
docker network prune

# Eliminar volúmenes no utilizados
docker volume prune
```

## Registro y Repositorio

```bash
# Iniciar sesión en registro
docker login <url_registro>

# Etiquetar para registro
docker tag <imagen> <registro>/<repositorio>:<etiqueta>

# Subir al registro
docker push <registro>/<repositorio>:<etiqueta>

# Descargar del registro
docker pull <registro>/<repositorio>:<etiqueta>

# Buscar en Docker Hub
docker search <término>
```

## Contexto de Docker

```bash
# Listar contextos
docker context ls

# Crear contexto
docker context create <nombre> --docker host=ssh://usuario@host

# Usar contexto
docker context use <nombre>

# Eliminar contexto
docker context rm <nombre>
```

## Ejemplo de Construcción Multi-etapa

```dockerfile
# Etapa de construcción
FROM node:16-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Etapa de producción
FROM node:16-alpine AS production

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

## Patrones Comunes

### Entorno de Desarrollo
```bash
# Recarga en caliente con montaje de volumen
docker run -it --rm \
  -v $(pwd):/app \
  -v /app/node_modules \
  -p 3000:3000 \
  node:16-alpine \
  sh -c "cd /app && npm run dev"
```

### Variables de Entorno
```bash
# Pasar variables de entorno
docker run -e NODE_ENV=production <imagen>
docker run --env-file .env <imagen>
```

### Verificaciones de Salud
```bash
# Ejecutar con verificación de salud
docker run --health-cmd="curl -f http://localhost:3000 || exit 1" \
           --health-interval=30s \
           --health-timeout=3s \
           --health-start-period=5s \
           --health-retries=3 \
           <imagen>
```

## Solución de Problemas

```bash
# Depurar inicio de contenedor
docker run --rm -it <imagen> /bin/sh

# Verificar código de salida del contenedor
docker ps -a

# Ver información detallada del contenedor
docker inspect <id_contenedor>

# Monitorear uso de recursos
docker stats

# Acceder al sistema de archivos del contenedor
docker exec -it <id_contenedor> /bin/bash

# Exportar contenedor como tar
docker export <id_contenedor> > contenedor.tar

# Importar tar como imagen
docker import contenedor.tar <nombre_imagen>
```

## Mejores Prácticas de Seguridad

- Usar imágenes base oficiales
- Mantener imágenes actualizadas
- No ejecutar como usuario root
- Usar archivo .dockerignore
- Escanear imágenes en busca de vulnerabilidades
- Usar construcciones multi-etapa
- Limitar recursos del contenedor
- Usar gestión de secretos
- Habilitar confianza de contenido
- Usar imágenes base mínimas (alpine)

Esta hoja de trucos cubre los comandos y patrones de Docker más comúnmente utilizados. El ecosistema de Docker es vasto, así que consulte la documentación oficial para características avanzadas y casos de uso específicos.