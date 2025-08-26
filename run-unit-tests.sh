#!/bin/bash

echo "Ejecutando pruebas unitarias..."

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js no está instalado"
    exit 1
fi

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm no está instalado"
    exit 1
fi

# Verificar si el directorio existe
if [ ! -d "library-shop-api" ]; then
    echo "ERROR: Directorio library-shop-api no encontrado"
    exit 1
fi

# Cambiar al directorio del proyecto
cd library-shop-api

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias..."
    npm install
fi

# Ejecutar pruebas unitarias
echo "Ejecutando pruebas..."
npm run test:unit

if [ $? -eq 0 ]; then
    echo "SUCCESS: Pruebas unitarias completadas exitosamente"
else
    echo "ERROR: Fallo en las pruebas unitarias"
    exit 1
fi
