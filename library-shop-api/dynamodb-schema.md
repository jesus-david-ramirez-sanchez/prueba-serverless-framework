# Esquema de Base de Datos - DynamoDB

## 📋 Resumen

Este documento describe la estructura de la tabla DynamoDB utilizada en la Library Shop API, incluyendo los atributos, índices y configuraciones.

## 🏗️ Tabla: Books

### **Nombre de la Tabla**
```
library-shop-api-books-{stage}
```
Donde `{stage}` puede ser `dev` o `prod`.

### **Configuración General**

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | AWS::DynamoDB::Table |
| **Modo de Facturación** | PAY_PER_REQUEST |
| **Región** | us-east-1 |
| **Encriptación** | Por defecto (AES-256) |

## 📊 Estructura de Atributos

### **Atributos Principales**

| Atributo | Tipo | Descripción | Requerido |
|----------|------|-------------|-----------|
| `id` | String | Identificador único del libro (UUID) | ✅ |
| `title` | String | Título del libro | ✅ |
| `author` | String | Nombre del autor | ✅ |
| `isbn` | String | Número ISBN del libro | ✅ |
| `price` | Number | Precio del libro (con 2 decimales) | ✅ |
| `description` | String | Descripción del libro | ❌ |
| `publishedDate` | String | Fecha de publicación (ISO 8601) | ❌ |
| `createdAt` | String | Fecha de creación (ISO 8601) | ✅ |
| `updatedAt` | String | Fecha de última actualización (ISO 8601) | ✅ |

### **Clave Primaria**

```
HASH KEY: id (String)
```

## 🔍 Índices

### **Índice Principal (Tabla)**
- **Clave de Partición**: `id`
- **Tipo**: HASH
- **Descripción**: Acceso directo por ID del libro

### **Índice Secundario Global (GSI)**

#### **isbn-index**
- **Nombre**: `isbn-index`
- **Clave de Partición**: `isbn`
- **Tipo de Proyección**: ALL
- **Descripción**: Búsqueda rápida por ISBN

**Configuración:**
```yaml
IndexName: isbn-index
KeySchema:
  - AttributeName: isbn
    KeyType: HASH
Projection:
  ProjectionType: ALL
```

## 📝 Ejemplo de Item

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "El Señor de los Anillos",
  "author": "J.R.R. Tolkien",
  "isbn": "978-84-450-7054-9",
  "price": 29.99,
  "description": "Una épica historia de fantasía que sigue las aventuras de Frodo Bolsón",
  "publishedDate": "1954-07-29",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

## 🔧 Operaciones Soportadas

### **Operaciones CRUD**

| Operación | Método DynamoDB | Función Lambda | Descripción |
|-----------|----------------|----------------|-------------|
| **Crear** | `PutItem` | `createBook` | Crear un nuevo libro |
| **Leer** | `GetItem` | `getBookById` | Obtener libro por ID |
| **Leer Múltiples** | `Scan` | `getBooks` | Obtener libros con filtros |
| **Actualizar** | `UpdateItem` | `updateBook` | Actualizar libro existente |
| **Eliminar** | `DeleteItem` | `deleteBook` | Eliminar libro por ID |

### **Consultas Específicas**

#### **Búsqueda por ID**
```javascript
// Usando GetItem
const command = new GetCommand({
    TableName: tableName,
    Key: { id: bookId }
});
```

#### **Búsqueda por ISBN**
```javascript
// Usando Query con GSI
const command = new QueryCommand({
    TableName: tableName,
    IndexName: 'isbn-index',
    KeyConditionExpression: 'isbn = :isbn',
    ExpressionAttributeValues: {
        ':isbn': isbn
    }
});
```

#### **Búsqueda con Filtros**
```javascript
// Usando Scan con FilterExpression
const command = new ScanCommand({
    TableName: tableName,
    FilterExpression: 'contains(#author, :author)',
    ExpressionAttributeNames: {
        '#author': 'author'
    },
    ExpressionAttributeValues: {
        ':author': author
    }
});
```

## 🛡️ Permisos IAM

### **Política de Permisos**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:*:table/library-shop-api-books-*",
        "arn:aws:dynamodb:us-east-1:*:table/library-shop-api-books-*/index/*"
      ]
    }
  ]
}
```

## 📊 Consideraciones de Diseño

### **Ventajas del Diseño Actual**

1. **Escalabilidad**: PAY_PER_REQUEST permite escalar automáticamente
2. **Rendimiento**: Acceso directo por ID con latencia mínima
3. **Flexibilidad**: GSI para búsquedas por ISBN
4. **Costo**: Solo pagas por lo que usas

### **Limitaciones**

1. **Scan Operations**: Las búsquedas por autor/título usan Scan (menos eficiente)
2. **Índices Limitados**: Solo un GSI (isbn-index)
3. **Tamaño de Item**: Máximo 400KB por item

### **Optimizaciones Futuras**

1. **GSI Adicionales**: Para búsquedas por autor o título
2. **Particionamiento**: Considerar particionamiento por categoría
3. **Caché**: Implementar ElastiCache para consultas frecuentes

## 🔍 Patrones de Consulta

### **Acceso por ID (Más Eficiente)**
```
GET /books?id=550e8400-e29b-41d4-a716-446655440000
```
- **Operación**: GetItem
- **Rendimiento**: O(1)
- **Costo**: Mínimo

### **Búsqueda por ISBN**
```
GET /books?isbn=978-84-450-7054-9
```
- **Operación**: Query (GSI)
- **Rendimiento**: O(log n)
- **Costo**: Bajo

### **Búsqueda por Autor/Título**
```
GET /books?author=Tolkien
GET /books?title=Anillos
```
- **Operación**: Scan con FilterExpression
- **Rendimiento**: O(n)
- **Costo**: Alto (escanea toda la tabla)

### **Paginación**
```
GET /books?limit=10&offset=20
```
- **Operación**: Scan con Limit y ExclusiveStartKey
- **Rendimiento**: O(limit)
- **Costo**: Proporcional al límite

## 📈 Monitoreo y Métricas

### **Métricas Importantes**

1. **ConsumedReadCapacityUnits**: Unidades de lectura consumidas
2. **ConsumedWriteCapacityUnits**: Unidades de escritura consumidas
3. **ThrottledRequests**: Solicitudes limitadas
4. **UserErrors**: Errores de usuario (4xx)
5. **SystemErrors**: Errores del sistema (5xx)

### **Alertas Recomendadas**

- **ThrottledRequests > 0**: Indica necesidad de escalar
- **UserErrors > 5%**: Problemas de validación o datos
- **SystemErrors > 1%**: Problemas de infraestructura

## 🔄 Migración y Versionado

### **Estrategia de Migración**

1. **Backward Compatibility**: Mantener compatibilidad con versiones anteriores
2. **Blue-Green Deployment**: Despliegue sin tiempo de inactividad
3. **Data Migration**: Scripts para migrar datos existentes

### **Versionado de Esquema**

- **v1.0**: Esquema inicial con GSI isbn-index
- **v1.1**: Agregar campos opcionales (description, publishedDate)
- **v2.0**: Agregar GSI adicionales (futuro)

## 🧪 Testing

### **Casos de Prueba**

1. **Creación de Libro**
   - Validar todos los campos requeridos
   - Verificar generación de UUID
   - Confirmar timestamps

2. **Búsqueda por ID**
   - Verificar retorno correcto
   - Manejar ID inexistente
   - Validar formato de respuesta

3. **Búsqueda por ISBN**
   - Verificar uso correcto del GSI
   - Manejar ISBN duplicado
   - Validar rendimiento

4. **Actualización**
   - Verificar actualización parcial
   - Confirmar actualización de updatedAt
   - Manejar campos inexistentes

5. **Eliminación**
   - Verificar eliminación completa
   - Manejar ID inexistente
   - Confirmar limpieza de datos

---

*Este esquema está diseñado para proporcionar un balance óptimo entre rendimiento, escalabilidad y costo para la Library Shop API.*
