# Scripts Bash - Library Shop API

Este documento describe los scripts bash disponibles para automatizar el desarrollo y testing del proyecto.

## 📋 Scripts Disponibles

### 1. `run-unit-tests.sh` - Pruebas Unitarias

Script para ejecutar pruebas unitarias del proyecto con verificación de prerrequisitos y manejo de dependencias.

#### Características
- ✅ Script simple y directo
- ✅ Verificación automática de prerrequisitos (Node.js, npm)
- ✅ Instalación automática de dependencias
- ✅ Ejecución de pruebas unitarias
- ✅ Feedback claro de éxito o error

#### Uso
```bash
# Ejecutar pruebas unitarias
./run-unit-tests.sh
```

#### Funcionalidad
- Verificación automática de Node.js y npm
- Verificación del directorio del proyecto
- Instalación automática de dependencias si es necesario
- Ejecución directa de pruebas unitarias
- Feedback claro de éxito o error

#### Flujo de Ejecución
1. **Verificación de prerrequisitos**
   - Node.js instalado
   - npm instalado
   - Directorio `library-shop-api` presente

2. **Instalación de dependencias**
   - Instalación automática si `node_modules` no existe
   - Ejecución de `npm install`

3. **Ejecución de pruebas**
   - Pruebas unitarias con `npm run test:unit`
   - Feedback de éxito o error

### 2. `run-all-tests-docker.sh` - Desarrollo Local con Docker

Script para ejecutar el proyecto en modo desarrollo local con Docker y DynamoDB Local.

#### Características
- ✅ Script simple y directo
- ✅ Verificación automática de prerrequisitos
- ✅ Entorno Docker completo con DynamoDB Local
- ✅ Servidor de desarrollo local en puerto 3000
- ✅ Feedback claro de éxito o error

#### Uso
```bash
# Ejecutar el proyecto en modo desarrollo
./run-all-docker.sh
```

#### Funcionalidad
- Verificación automática de Docker y Docker Compose
- Verificación de archivos de configuración
- Ejecución directa del entorno de desarrollo
- Feedback claro de éxito o error

#### Servicios Docker

##### DynamoDB Local
- **Imagen**: `amazon/dynamodb-local:latest`
- **Puerto**: `8000`
- **Persistencia**: Volumen Docker
- **Configuración**: Modo compartido con datos persistentes

##### Servicios de Desarrollo
- **dev-server**: Servidor de desarrollo local

#### Archivos Generados Automáticamente

##### `docker-compose.yml`
```yaml
version: '3.8'
services:
  dynamodb-local:
    image: amazon/dynamodb-local:latest
    ports:
      - "8000:8000"
    # ... configuración completa

  unit-tests:
    build:
      context: ./library-shop-api
      dockerfile: Dockerfile.test
    # ... configuración completa
```

##### `library-shop-api/Dockerfile.dev`
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
USER node
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

##### `library-shop-api/.dockerignore`
```
node_modules
coverage
*.log
.git
```

#### Flujo de Ejecución
1. **Verificación de prerrequisitos**
   - Docker instalado y ejecutándose
   - Docker Compose instalado
   - Archivos de configuración presentes

2. **Ejecución del proyecto**
   - Inicio de DynamoDB Local
   - Inicio del servidor de desarrollo
   - Servicios disponibles en puertos configurados

3. **Feedback**
   - Mensaje de éxito con URLs disponibles
   - O mensaje de error si algo falla

## 🛠️ Configuración del Entorno

### Prerrequisitos

#### Para `run-unit-tests.sh`
- Node.js 18.x o superior
- npm
- Acceso al directorio `library-shop-api`

#### Para `run-all-tests-docker.sh`
- Docker Desktop
- Docker Compose
- Archivos de configuración Docker

### Variables de Entorno

Los scripts configuran automáticamente las siguientes variables de entorno para las pruebas:

```bash
# Para pruebas unitarias
NODE_ENV=test

# Para pruebas con Docker
AWS_ACCESS_KEY_ID=local
AWS_SECRET_ACCESS_KEY=local
AWS_DEFAULT_REGION=us-east-1
DYNAMODB_ENDPOINT=http://dynamodb-local:8000
NODE_ENV=test
```

## 📊 Reportes y Logs

### Servicios Disponibles
- **API Local**: `http://localhost:3000`
- **DynamoDB Local**: `http://localhost:8000`

### Logs de Servicios
```bash
# Logs de DynamoDB Local
docker-compose logs dynamodb-local

# Logs de la aplicación
docker-compose logs dev-server

# Logs de todos los servicios
docker-compose logs
```

## 🔧 Troubleshooting

### Problemas Comunes

#### Error: "Docker no está ejecutándose"
```bash
# Iniciar Docker Desktop
# En Windows/macOS: Abrir Docker Desktop
# En Linux: sudo systemctl start docker
```

#### Error: "Node.js no está instalado"
```bash
# Instalar Node.js desde https://nodejs.org/
# Verificar instalación: node --version
```

#### Error: "Permisos denegados"
```bash
# Hacer scripts ejecutables
chmod +x run-unit-tests.sh run-all-tests-docker.sh
```

#### Error: "Puerto 8000 en uso"
```bash
# Detener servicios Docker
./run-all-tests-docker.sh -d

# O cambiar puerto en docker-compose.yml
```

### Comandos de Limpieza

```bash
# Limpiar contenedores Docker
docker-compose down --volumes --remove-orphans

# Limpiar imágenes no utilizadas
docker image prune -f

# Limpiar volúmenes no utilizados
docker volume prune -f

# Limpiar todo
docker system prune -a --volumes
```

## 📈 Métricas y Monitoreo

### Tiempos de Ejecución Típicos
- **Inicio de DynamoDB**: 10-30 segundos
- **Construcción de imagen**: 1-3 minutos
- **Inicio de aplicación**: 30-60 segundos

### Uso de Recursos
- **DynamoDB Local**: ~100MB RAM
- **Servidor de desarrollo**: ~200MB RAM
- **Volumen de datos**: ~50MB

## 🤝 Contribución

Para agregar nuevos scripts o modificar los existentes:

1. Mantener la estructura de colores y mensajes
2. Agregar verificación de prerrequisitos
3. Incluir manejo de errores robusto
4. Documentar opciones de línea de comandos
5. Actualizar este documento

## 📄 Licencia

Los scripts están bajo la misma licencia que el proyecto principal.
