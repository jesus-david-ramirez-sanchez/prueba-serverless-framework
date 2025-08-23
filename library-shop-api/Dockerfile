# Dockerfile para Library Shop API
FROM public.ecr.aws/lambda/nodejs:20

# Copiar archivos de configuración
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY src/ ./src/

# Configurar variables de entorno por defecto
ENV STAGE=dev
ENV BOOKS_TABLE_NAME=library-shop-api-books-dev
ENV AWS_REGION=us-east-1

# Exponer puerto para desarrollo local
EXPOSE 9000

# Comando para ejecutar la Lambda
CMD ["src/functions/createBook/index.handler"]
