# Library Shop API

API para gestión de libros construida con Serverless Framework y AWS Lambda.

## Características

- ✅ Creación de libros con validación robusta usando Joi
- ✅ Almacenamiento en DynamoDB
- ✅ Variables de entorno por stage (dev/prod)
- ✅ TypeScript
- ✅ CORS habilitado
- ✅ Validación de datos de entrada con mensajes en español
- ✅ Documentación completa con Swagger/OpenAPI (YAML)

## Prerrequisitos

1. **Node.js** (versión 18 o superior)
2. **AWS CLI** configurado con credenciales
3. **Serverless Framework** instalado globalmente

```bash
npm install -g serverless
```

## Instalación

1. Clona el repositorio
2. Instala las dependencias:

```bash
cd library-shop-api
npm install
```

## Configuración de AWS

Asegúrate de tener configurado AWS CLI con un perfil:

```bash
aws configure --profile default
```

O si ya tienes un perfil configurado, actualiza el `serverless.yml` con el nombre de tu perfil.

## Variables de Entorno

El proyecto utiliza las siguientes variables de entorno que se configuran automáticamente:

- `STAGE`: El stage actual (dev/prod)
- `BOOKS_TABLE_NAME`: Nombre de la tabla DynamoDB (se genera automáticamente)

## Desarrollo Local

Para ejecutar la API localmente:

```bash
npm run dev
```

Esto iniciará el servidor en `http://localhost:3000`

## Documentación de la API

La documentación de la API está disponible en el archivo `swagger.yml` en formato OpenAPI 3.0.3.

Esta documentación incluye:
- Esquemas completos de request/response
- Ejemplos de uso para casos válidos e inválidos
- Códigos de error detallados con ejemplos
- Validaciones que coinciden con las reglas de Joi
- Especificación completa de la API

Puedes usar esta documentación con:
- Herramientas de generación de código
- Validadores de API
- Herramientas de testing
- Cualquier cliente que soporte OpenAPI

## Despliegue

### Despliegue a Desarrollo

```bash
npm run deploy:dev
```

### Despliegue a Producción

```bash
npm run deploy:prod
```

### Despliegue General

```bash
npm run deploy
```

## Endpoints

### Crear Libro

**POST** `/books`

**Body:**
```json
{
  "title": "El Señor de los Anillos",
  "author": "J.R.R. Tolkien",
  "isbn": "978-84-450-7054-9",
  "price": 29.99,
  "description": "Una épica historia de fantasía",
  "publishedDate": "1954-07-29"
}
```

**Respuesta exitosa (201):**
```json
{
  "message": "Book created successfully",
  "book": {
    "id": "uuid-generado",
    "title": "El Señor de los Anillos",
    "author": "J.R.R. Tolkien",
    "isbn": "978-84-450-7054-9",
    "price": 29.99,
    "description": "Una épica historia de fantasía",
    "publishedDate": "1954-07-29",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "stage": "dev"
}
```



## Estructura del Proyecto

```
library-shop-api/
├── src/
│   └── functions/
│       └── createBook/
│           └── index.ts
├── serverless.yml
├── package.json
├── tsconfig.json
├── webpack.config.js
├── swagger.yml
└── README.md
```

## Comandos Útiles

- `npm run build`: Compilar TypeScript
- `npm run deploy`: Desplegar a AWS
- `npm run deploy:dev`: Desplegar a desarrollo
- `npm run deploy:prod`: Desplegar a producción
- `npm run remove`: Eliminar recursos de AWS
- `npm run logs`: Ver logs de la función createBook


## Recursos Creados

Al desplegar, se crearán los siguientes recursos en AWS:

- **Lambda Functions**: `createBook`
- **API Gateway**: Endpoints REST
- **DynamoDB Table**: `library-shop-api-books-{stage}`
- **IAM Roles**: Permisos necesarios para DynamoDB

## Troubleshooting

### Error de permisos AWS
Asegúrate de que tu usuario AWS tenga permisos para:
- Lambda
- API Gateway
- DynamoDB
- IAM (para crear roles)

### Error de compilación TypeScript
Ejecuta `npm run build` para verificar que no hay errores de compilación.

### Error de conexión a DynamoDB
Verifica que la región en `serverless.yml` coincida con tu configuración de AWS.

## Costos

- **Lambda**: Pay per request (muy económico para desarrollo)
- **DynamoDB**: Pay per request (gratis hasta 25GB)
- **API Gateway**: $3.50 por millón de requests

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request
