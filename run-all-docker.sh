#!/bin/bash

echo "Iniciando Library Shop API con Docker Compose..."

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker no está instalado"
    exit 1
fi

# Verificar si Docker está ejecutándose
if ! docker info &> /dev/null; then
    echo "ERROR: Docker no está ejecutándose"
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "ERROR: Docker Compose no está instalado"
    exit 1
fi

# Verificar si los archivos necesarios existen
if [ ! -f "docker-compose.yml" ]; then
    echo "ERROR: docker-compose.yml no encontrado"
    exit 1
fi

if [ ! -f "library-shop-api/Dockerfile.dev" ]; then
    echo "ERROR: Dockerfile.dev no encontrado"
    exit 1
fi

echo "Verificando archivos de configuración..."
echo "Docker y Docker Compose funcionando correctamente"

# Ejecutar docker-compose con el perfil de desarrollo
echo "Iniciando servicios..."
docker-compose --profile dev up --build

if [ $? -eq 0 ]; then
    echo "SUCCESS: Proyecto iniciado exitosamente"
    echo "API disponible en: http://localhost:3000"
    echo "DynamoDB disponible en: http://localhost:8000"
else
    echo "ERROR: Fallo al iniciar el proyecto"
    exit 1
fi
