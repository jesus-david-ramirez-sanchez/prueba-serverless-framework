#!/bin/bash

echo "🚀 Iniciando Library Shop API con Docker Compose (versión corregida)..."

# Verificar que Docker esté funcionando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker no está funcionando. Por favor, inicia Docker Desktop."
    exit 1
fi

# Verificar que Docker Compose esté disponible
if ! docker compose version > /dev/null 2>&1; then
    echo "❌ Error: Docker Compose no está disponible."
    exit 1
fi

echo "✅ Docker y Docker Compose funcionando correctamente"

# Detener contenedores existentes si los hay
echo "🛑 Deteniendo contenedores existentes..."
docker compose down --remove-orphans

# Limpiar imágenes si es necesario
echo "🧹 Limpiando imágenes anteriores..."
docker compose build --no-cache

# Iniciar servicios
echo "🚀 Iniciando servicios..."
docker compose --profile dev up --build

# Verificar el estado de los contenedores
echo "📊 Estado de los contenedores:"
docker compose ps

echo "✅ Proyecto iniciado correctamente!"
echo "🌐 API disponible en: http://localhost:3000"
echo "🗄️  DynamoDB Local disponible en: http://localhost:8000"
