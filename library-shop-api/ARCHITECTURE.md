# Arquitectura del Proyecto - Library Shop API

## 📋 Resumen

Este proyecto implementa una arquitectura modular donde cada función Lambda es completamente independiente. Cada función tiene su propia carpeta con todos los archivos necesarios para su funcionamiento, incluyendo validaciones, operaciones de base de datos y manejo de respuestas.

## 🏗️ Estructura de Directorios

```
src/
└── functions/         # Funciones Lambda independientes
    ├── createBook/    # Función para crear libros
    │   ├── index.js           # Handler principal
    │   ├── validations.js     # Validaciones específicas
    │   ├── database.js        # Operaciones DynamoDB
    │   └── responseHandler.js # Manejador de respuestas
    ├── getAllBooks/   # Función para obtener todos los libros
    │   ├── index.js           # Handler principal
    │   ├── validations.js     # Validaciones específicas
    │   ├── database.js        # Operaciones DynamoDB
    │   └── responseHandler.js # Manejador de respuestas
    ├── getBookById/   # Función para obtener un libro por ID
    │   ├── index.js           # Handler principal
    │   ├── validations.js     # Validaciones específicas
    │   ├── database.js        # Operaciones DynamoDB
    │   └── responseHandler.js # Manejador de respuestas
    ├── updateBook/    # Función para actualizar libros
    │   ├── index.js           # Handler principal
    │   ├── validations.js     # Validaciones específicas
    │   ├── database.js        # Operaciones DynamoDB
    │   └── responseHandler.js # Manejador de respuestas
    └── deleteBook/    # Función para eliminar libros
        ├── index.js           # Handler principal
        ├── validations.js     # Validaciones específicas
        ├── database.js        # Operaciones DynamoDB
        └── responseHandler.js # Manejador de respuestas
```

## 🔄 Flujo de Datos por Función

```
HTTP Request → Lambda Handler → Validation → Database → Response
     ↓              ↓              ↓           ↓         ↓
  API Gateway   index.js      validations.js database.js responseHandler.js
```

## 📚 Estructura de Cada Función

### 1. **`index.js`** - Handler Principal

**Responsabilidades:**
- Manejo de peticiones HTTP
- Coordinación de la lógica de negocio
- Retorno de respuestas HTTP
- Manejo de errores generales

**Características:**
- Punto de entrada de la función Lambda
- Importa y usa los otros módulos de la función
- Manejo consistente de errores
- Validación de método HTTP

**Ejemplo de uso:**
```javascript
const { validateCreateBookData } = require('./validations');
const { createBook } = require('./database');
const CreateBookResponseHandler = require('./responseHandler');

exports.handler = async (event) => {
    // Validar entrada
    const validatedData = validateCreateBookData(requestBody);
    
    // Operación de base de datos
    const result = await createBook(tableName, book);
    
    // Respuesta
    return CreateBookResponseHandler.success({ message: 'Success', book: result });
};
```

### 2. **`validations.js`** - Validaciones Específicas

**Responsabilidades:**
- Validación de datos de entrada específicos de la función
- Esquemas de validación con Joi
- Mensajes de error en español
- Funciones de validación específicas

**Características:**
- Esquemas específicos para cada función
- Validación estricta de tipos
- Mensajes de error personalizados
- Funciones de validación reutilizables

**Ejemplo de uso:**
```javascript
const Joi = require('joi');

const createBookSchema = Joi.object({
    title: Joi.string().min(1).max(200).required(),
    author: Joi.string().min(1).max(100).required(),
    // ... más validaciones
});

function validateCreateBookData(data) {
    const { error, value } = createBookSchema.validate(data, {
        abortEarly: false,
        stripUnknown: true
    });
    
    if (error) {
        throw {
            type: 'VALIDATION_ERROR',
            details: error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }))
        };
    }
    
    return value;
}
```

### 3. **`database.js`** - Operaciones de Base de Datos

**Responsabilidades:**
- Operaciones DynamoDB específicas de la función
- Abstracción de la lógica de base de datos
- Manejo de errores de base de datos
- Optimización de consultas

**Características:**
- Métodos específicos para cada función
- Configuración automática del cliente DynamoDB
- Manejo de transacciones
- Documentación JSDoc

**Ejemplo de uso:**
```javascript
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

async function createBook(tableName, book) {
    const command = new PutCommand({
        TableName: tableName,
        Item: book
    });

    await docClient.send(command);
    return book;
}
```

### 4. **`responseHandler.js`** - Manejador de Respuestas

**Responsabilidades:**
- Manejo centralizado de respuestas HTTP
- Formato consistente de respuestas
- Headers CORS configurados
- Manejo estandarizado de errores

**Características:**
- Clase estática con métodos específicos
- Headers CORS preconfigurados
- Formato JSON consistente
- Mensajes de error específicos de la función

**Ejemplo de uso:**
```javascript
class CreateBookResponseHandler {
    static success(data = {}) {
        return {
            statusCode: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(data)
        };
    }

    static validationError(details) {
        return this.error(400, 'Validation Error', 'Los datos proporcionados no son válidos', details);
    }
}
```

## 🔧 Beneficios de la Arquitectura

### 1. **Funciones Completamente Independientes**
- Cada función tiene todo lo que necesita
- No hay dependencias compartidas
- Fácil despliegue individual

### 2. **Fácil Mantenimiento y Debugging**
- Código específico para cada función
- Fácil localizar problemas
- Testing individual simplificado

### 3. **Escalabilidad por Función**
- Cada función puede escalar independientemente
- Optimización específica por función
- Recursos dedicados por función

### 4. **Sin Dependencias Compartidas**
- No hay conflictos entre funciones
- Fácil actualización individual
- Menor acoplamiento

### 5. **Testing Simplificado**
- Testing unitario por función
- Fácil mock de dependencias
- Testing de integración específico

## 🚀 Patrones de Diseño Utilizados

### 1. **Module Pattern**
- Cada archivo es un módulo independiente
- Exports claros y específicos
- Encapsulación de funcionalidad

### 2. **Factory Pattern**
- ResponseHandler crea respuestas estandarizadas
- Configuración automática de headers

### 3. **Validation Pattern**
- Esquemas de validación específicos
- Funciones de validación reutilizables

### 4. **Repository Pattern**
- Métodos específicos para cada operación
- Interfaz consistente para acceso a datos

## 📝 Convenciones de Código

### 1. **Nomenclatura**
- Archivos: `camelCase.js`
- Clases: `PascalCase`
- Métodos: `camelCase`
- Constantes: `UPPER_SNAKE_CASE`

### 2. **Estructura de archivos**
- Un archivo por responsabilidad
- Importaciones organizadas
- Exports claros

### 3. **Manejo de errores**
- Try-catch en operaciones críticas
- Logging de errores
- Respuestas de error consistentes

### 4. **Documentación**
- JSDoc para métodos públicos
- Comentarios explicativos
- README actualizado

## 🔄 Flujo de Desarrollo

1. **Nueva función Lambda:**
   - Crear carpeta en `src/functions/`
   - Crear los 4 archivos necesarios
   - Implementar lógica específica
   - Testing individual

2. **Nueva validación:**
   - Agregar esquema en `validations.js`
   - Crear función de validación
   - Documentar reglas

3. **Nueva operación de base de datos:**
   - Agregar método en `database.js`
   - Documentar parámetros y retorno
   - Manejar errores apropiadamente

4. **Nueva respuesta:**
   - Agregar método en `responseHandler.js`
   - Mantener consistencia
   - Documentar uso

## 🧪 Testing

La arquitectura facilita el testing individual:

```javascript
// Test de validación
const { validateCreateBookData } = require('./validations');
const result = validateCreateBookData(testData);

// Test de base de datos (mock)
const { createBook } = require('./database');
jest.mock('./database');

// Test de respuesta
const CreateBookResponseHandler = require('./responseHandler');
const response = CreateBookResponseHandler.success({ data: 'test' });
```

## 📊 Comparación de Arquitecturas

| Aspecto | Arquitectura Centralizada | Arquitectura Independiente |
|---------|---------------------------|----------------------------|
| **Dependencias** | Compartidas | Independientes |
| **Mantenimiento** | Complejo | Simple |
| **Testing** | Complejo | Simple |
| **Escalabilidad** | Limitada | Individual |
| **Debugging** | Difícil | Fácil |
| **Despliegue** | Todo junto | Individual |

## 🔍 Detalles por Función

### **createBook**
- **Endpoint**: `POST /books`
- **Validaciones**: Campos requeridos (title, author, isbn, price)
- **Operaciones DB**: `createBook()`
- **Respuestas**: 201 (creado), 400 (validación), 405 (método)

### **getAllBooks**
- **Endpoint**: `GET /books`
- **Validaciones**: Parámetros de query (author, title, limit, offset)
- **Operaciones DB**: `getAllBooks()`
- **Respuestas**: 200 (éxito), 400 (validación), 405 (método)

### **getBookById**
- **Endpoint**: `GET /books/{id}`
- **Validaciones**: ID en path parameters
- **Operaciones DB**: `getBookById()`
- **Respuestas**: 200 (éxito), 404 (no encontrado), 405 (método)

### **updateBook**
- **Endpoint**: `PUT /books/{id}`
- **Validaciones**: ID en path, campos opcionales en body
- **Operaciones DB**: `getBookById()`, `updateBook()`
- **Respuestas**: 200 (actualizado), 404 (no encontrado), 405 (método)

### **deleteBook**
- **Endpoint**: `DELETE /books/{id}`
- **Validaciones**: ID en path
- **Operaciones DB**: `getBookById()`, `deleteBook()`
- **Respuestas**: 200 (eliminado), 404 (no encontrado), 405 (método)

## 🛡️ Seguridad y Validación

### **Validaciones Implementadas**
- **Campos requeridos**: Validación de presencia
- **Tipos de datos**: Validación de tipos
- **Longitudes**: Validación de límites
- **Formatos**: Validación de patrones (ISBN, fechas)
- **Rangos**: Validación de valores numéricos

### **Manejo de Errores**
- **Validación**: 400 con detalles específicos
- **No encontrado**: 404 con mensaje claro
- **Método no permitido**: 405 con método correcto
- **Error interno**: 500 con logging

---

*Esta arquitectura proporciona máxima independencia y facilidad de mantenimiento, siguiendo el principio de responsabilidad única y facilitando el desarrollo y testing de cada función por separado.*
