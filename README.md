# Library Shop API - Serverless Framework

API REST para gestión de libros construida con Serverless Framework, AWS Lambda y DynamoDB.

## 🚀 Características

- ✅ **Arquitectura Serverless** con AWS Lambda
- ✅ **Base de datos NoSQL** con DynamoDB
- ✅ **Validación de datos** con Joi
- ✅ **Funciones independientes** con estructura modular
- ✅ **CORS habilitado** para aplicaciones web
- ✅ **Variables de entorno** por stage (dev/prod)
- ✅ **Documentación OpenAPI** (Swagger)

## 📋 Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/books` | Crear un nuevo libro |
| `GET` | `/books` | Obtener todos los libros (con filtros opcionales) |
| `GET` | `/books/{id}` | Obtener un libro específico por ID |
| `PUT` | `/books/{id}` | Actualizar libro por ID |
| `DELETE` | `/books/{id}` | Eliminar libro por ID |

## 🏗️ Estructura del Proyecto

```
library-shop-api/
├── src/
│   └── functions/
│       ├── createBook/
│       │   ├── index.js           # Handler principal
│       │   ├── validations.js     # Validaciones específicas
│       │   ├── database.js        # Operaciones DynamoDB
│       │   └── responseHandler.js # Manejador de respuestas
│       ├── getAllBooks/
│       │   ├── index.js           # Handler principal
│       │   ├── validations.js     # Validaciones específicas
│       │   ├── database.js        # Operaciones DynamoDB
│       │   └── responseHandler.js # Manejador de respuestas
│       ├── getBookById/
│       │   ├── index.js           # Handler principal
│       │   ├── validations.js     # Validaciones específicas
│       │   ├── database.js        # Operaciones DynamoDB
│       │   └── responseHandler.js # Manejador de respuestas
│       ├── updateBook/
│       │   ├── index.js           # Handler principal
│       │   ├── validations.js     # Validaciones específicas
│       │   ├── database.js        # Operaciones DynamoDB
│       │   └── responseHandler.js # Manejador de respuestas
│       └── deleteBook/
│           ├── index.js           # Handler principal
│           ├── validations.js     # Validaciones específicas
│           ├── database.js        # Operaciones DynamoDB
│           └── responseHandler.js # Manejador de respuestas
├── serverless.yml
├── package.json
├── swagger.yml
├── dynamodb-schema.md
└── README.md
```

## 🏗️ Arquitectura del Proyecto

El proyecto sigue una arquitectura modular donde cada función Lambda es completamente independiente:

### Estructura por Función

Cada función Lambda tiene su propia carpeta con todos los archivos necesarios:

1. **`index.js`** - Handler principal de la función
   - Maneja las peticiones HTTP
   - Coordina la lógica de negocio
   - Retorna respuestas HTTP

2. **`validations.js`** - Validaciones específicas de la función
   - Esquemas de validación con Joi
   - Validación de datos de entrada
   - Mensajes de error en español
   - Funciones de validación específicas

3. **`database.js`** - Operaciones de base de datos específicas
   - Métodos específicos para la función
   - Operaciones DynamoDB necesarias
   - Manejo de errores de base de datos

4. **`responseHandler.js`** - Manejador de respuestas específico
   - Respuestas HTTP estandarizadas
   - Manejo de errores específicos
   - Headers CORS configurados

### Beneficios de la Arquitectura

- ✅ **Funciones completamente independientes**
- ✅ **Fácil mantenimiento y debugging**
- ✅ **Código específico para cada función**
- ✅ **Fácil testing individual**
- ✅ **Escalabilidad por función**
- ✅ **Sin dependencias compartidas**

## 🛠️ Instalación y Configuración

### Prerrequisitos

- Node.js 20.x o superior
- AWS CLI configurado
- Serverless Framework instalado globalmente

```bash
npm install -g serverless
```

### Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd library-shop-api
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar AWS CLI** (si no está configurado)
```bash
aws configure
```

## 🚀 Despliegue

### Despliegue en Desarrollo

```bash
npm run deploy:dev
```

### Despliegue en Producción

```bash
npm run deploy:prod
```

### Variables de Entorno

El proyecto utiliza variables de entorno que se configuran automáticamente:

- `STAGE`: Stage de despliegue (dev/prod)
- `BOOKS_TABLE_NAME`: Nombre de la tabla DynamoDB

## 📖 Uso de la API

Para ejemplos detallados de consumo de la API, consulta la documentación completa en el archivo `swagger.yml` que incluye:

- **Ejemplos de requests** para cada endpoint
- **Esquemas de datos** de entrada y salida
- **Códigos de respuesta** y manejo de errores
- **Parámetros de query** y path parameters
- **Headers requeridos** y opcionales

## 📊 Estructura de Datos

### Libro

```json
{
  "id": "uuid-generado",
  "title": "Título del libro",
  "author": "Nombre del autor",
  "isbn": "978-84-450-7054-9",
  "price": 29.99,
  "description": "Descripción opcional",
  "publishedDate": "1954-07-29",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Parámetros de Búsqueda (GET /books)

- `id`: ID específico del libro
- `author`: Filtrar por autor (búsqueda parcial)
- `title`: Filtrar por título (búsqueda parcial)
- `limit`: Límite de resultados (1-100, default: 10)
- `offset`: Offset para paginación (default: 0)

## 🔧 Scripts Disponibles

### Scripts de Despliegue
```bash
# Despliegue en desarrollo
npm run deploy:dev

# Despliegue en producción
npm run deploy:prod

# Ver logs en tiempo real
npm run logs:dev

# Eliminar despliegue
npm run remove:dev
```

### Scripts de Testing (Bash)

#### Pruebas Unitarias
```bash
# Ejecutar pruebas unitarias
./run-unit-tests.sh
```

#### Desarrollo Local con Docker
```bash
# Ejecutar el proyecto en modo desarrollo
./run-all-tests-docker.sh
```

### Características de los Scripts

#### `run-unit-tests.sh`
- ✅ **Script simple y directo**
- ✅ **Verificación automática de prerrequisitos**
- ✅ **Instalación automática de dependencias**
- ✅ **Ejecución de pruebas unitarias**
- ✅ **Feedback claro de éxito o error**

#### `run-all-tests-docker.sh`
- ✅ **Script simple y directo**
- ✅ **Verificación automática de prerrequisitos**
- ✅ **Entorno Docker completo** con DynamoDB Local
- ✅ **Servidor de desarrollo local** en puerto 3000
- ✅ **Feedback claro de éxito o error**

## 📚 Documentación

### Database Schema
La estructura completa de la tabla DynamoDB está documentada en `dynamodb-schema.md`, incluyendo:
- Esquema de la tabla y índices
- Estructura de datos de los libros
- Configuración de DynamoDB

### Architecture
La arquitectura del proyecto está documentada en `ARCHITECTURE.md`, incluyendo:
- Estructura de capas y responsabilidades
- Patrones de diseño utilizados
- Flujo de datos y desarrollo
- Convenciones de código
- Guías para testing

### API Documentation
La documentación completa de la API está disponible en formato OpenAPI/Swagger en `swagger.yml`.

## 🧪 Testing

Para ejemplos de testing y casos de uso, consulta la documentación Swagger que incluye ejemplos de requests y respuestas para cada endpoint.

## 🔒 Seguridad

- **Validación de entrada**: Todos los datos se validan con Joi
- **CORS configurado**: Para aplicaciones web
- **IAM Roles**: Permisos mínimos necesarios
- **Variables de entorno**: Configuración segura

## 🚨 Manejo de Errores

La API retorna códigos de estado HTTP apropiados:

- `200`: Operación exitosa
- `201`: Recurso creado exitosamente
- `400`: Error de validación
- `404`: Recurso no encontrado
- `405`: Método no permitido
- `500`: Error interno del servidor

### Formato de Error

```json
{
  "error": "Validation Error",
  "message": "Los datos proporcionados no son válidos",
  "details": [
    {
      "field": "title",
      "message": "El título no puede estar vacío"
    }
  ]
}
```

## 📈 Monitoreo

- **CloudWatch Logs**: Logs automáticos de todas las funciones
- **Métricas**: Métricas de rendimiento automáticas
- **Trazabilidad**: Request ID en todas las respuestas

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**Desarrollado con ❤️ usando Serverless Framework y AWS**
