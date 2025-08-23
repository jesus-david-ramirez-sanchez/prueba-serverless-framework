# Library Shop API

API para gestión de libros construida con Serverless Framework y AWS Lambda.

## Características

- ✅ Creación de libros con validación robusta usando Joi
- ✅ Almacenamiento en DynamoDB
- ✅ Variables de entorno por stage (dev/prod)
- ✅ JavaScript (Node.js)
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

## Ejecutar con Docker

### Opción 1: Solo la Lambda
```bash
# Construir la imagen
npm run docker:build

# Ejecutar el contenedor
npm run docker:run
```

### Opción 2: Con DynamoDB local
```bash
# Ejecutar todo el stack (Lambda + DynamoDB local)
npm run docker:compose

# Detener los servicios
npm run docker:compose:down
```

La Lambda estará disponible en `http://localhost:9000` y DynamoDB en `http://localhost:8000`

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

### Obtener Libros

**GET** `/books`

**Parámetros de query (opcionales):**
- `id`: ID específico del libro (UUID)
- `author`: Filtrar por autor (búsqueda parcial)
- `title`: Filtrar por título (búsqueda parcial)
- `limit`: Número máximo de resultados (por defecto 10, máximo 100)
- `offset`: Offset para paginación (por defecto 0)

**Ejemplos de uso:**

```bash
# Obtener todos los libros
GET /books

# Obtener un libro específico por ID
GET /books?id=550e8400-e29b-41d4-a716-446655440000

# Filtrar por autor
GET /books?author=Tolkien

# Filtrar por título
GET /books?title=Señor

# Con paginación
GET /books?limit=5&offset=10
```

**Respuesta exitosa (200):**
```json
{
  "message": "Books retrieved successfully",
  "books": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "El Señor de los Anillos",
      "author": "J.R.R. Tolkien",
      "isbn": "978-84-450-7054-9",
      "price": 29.99,
      "description": "Una épica historia de fantasía",
      "publishedDate": "1954-07-29",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "totalCount": 1,
  "filters": {
    "id": null,
    "author": "Tolkien",
    "title": null
  },
  "pagination": {
    "limit": 10,
    "offset": 0
  },
  "stage": "dev"
}
```

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
│       ├── createBook/
│       │   └── index.js
│       └── getBooks/
│           └── index.js
├── serverless.yml
├── package.json
├── swagger.yml
└── README.md
```

## Comandos Útiles


- `npm run deploy`: Desplegar a AWS
- `npm run deploy:dev`: Desplegar a desarrollo
- `npm run deploy:prod`: Desplegar a producción
- `npm run remove`: Eliminar recursos de AWS
- `npm run logs`: Ver logs de la función createBook
- `npm run logs:get`: Ver logs de la función getBooks
- `npm run docker:build`: Construir imagen Docker
- `npm run docker:run`: Ejecutar contenedor Docker
- `npm run docker:compose`: Ejecutar stack completo con Docker Compose


## Recursos Creados

Al desplegar, se crearán los siguientes recursos en AWS:

- **Lambda Functions**: `createBook`, `getBooks`
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
