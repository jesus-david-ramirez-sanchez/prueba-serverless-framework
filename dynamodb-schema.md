# Estructura de la Tabla DynamoDB - Library Shop API

## 📋 Información General

**Nombre de la tabla:** `library-shop-api-books-{stage}`  
**Billing Mode:** PAY_PER_REQUEST  
**Región:** us-east-1  

## 🏗️ Estructura de la Tabla

### Attribute Definitions
```json
{
  "AttributeDefinitions": [
    {
      "AttributeName": "id",
      "AttributeType": "S"
    },
    {
      "AttributeName": "isbn", 
      "AttributeType": "S"
    }
  ]
}
```

### Key Schema (Primary Key)
```json
{
  "KeySchema": [
    {
      "AttributeName": "id",
      "KeyType": "HASH"
    }
  ]
}
```

### Global Secondary Indexes
```json
{
  "GlobalSecondaryIndexes": [
    {
      "IndexName": "isbn-index",
      "KeySchema": [
        {
          "AttributeName": "isbn",
          "KeyType": "HASH"
        }
      ],
      "Projection": {
        "ProjectionType": "ALL"
      }
    }
  ]
}
```

## 📊 Esquema de Datos

### Estructura de un Item (Libro)

```json
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
```

### Descripción de Campos

| Campo | Tipo | Requerido | Descripción | Ejemplo |
|-------|------|-----------|-------------|---------|
| `id` | String | ✅ | UUID único del libro | `"550e8400-e29b-41d4-a716-446655440000"` |
| `title` | String | ✅ | Título del libro | `"El Señor de los Anillos"` |
| `author` | String | ✅ | Autor del libro | `"J.R.R. Tolkien"` |
| `isbn` | String | ✅ | ISBN del libro | `"978-84-450-7054-9"` |
| `price` | Number | ✅ | Precio del libro | `29.99` |
| `description` | String | ❌ | Descripción opcional | `"Una épica historia de fantasía"` |
| `publishedDate` | String | ❌ | Fecha de publicación (ISO) | `"1954-07-29"` |
| `createdAt` | String | ✅ | Timestamp de creación | `"2024-01-15T10:30:00.000Z"` |
| `updatedAt` | String | ✅ | Timestamp de última actualización | `"2024-01-15T10:30:00.000Z"` |

## 🔍 Índices y Consultas

### Primary Key (id)
- **Tipo:** HASH
- **Uso:** Búsqueda directa por ID del libro
- **Operación:** GetItem
- **Ejemplo:** `GetItem({Key: {id: "uuid-del-libro"}})`

### Global Secondary Index (isbn-index)
- **Nombre:** `isbn-index`
- **Clave:** `isbn` (HASH)
- **Proyección:** ALL (todos los campos)
- **Uso:** Búsqueda por ISBN
- **Operación:** Query
- **Ejemplo:** `Query({IndexName: "isbn-index", KeyConditionExpression: "isbn = :isbn"})`

## 🚀 Operaciones Soportadas

### Operaciones de Escritura
- ✅ **PutItem** - Crear/actualizar libro
- ✅ **UpdateItem** - Actualizar campos específicos
- ✅ **DeleteItem** - Eliminar libro

### Operaciones de Lectura
- ✅ **GetItem** - Obtener libro por ID
- ✅ **Query** - Consultar por ISBN usando GSI
- ✅ **Scan** - Escanear todos los libros (con filtros)

### Filtros Disponibles
- **Por autor:** `contains(#author, :author)`
- **Por título:** `contains(#title, :title)`
- **Paginación:** `Limit` y `ExclusiveStartKey`

## 🔐 Permisos IAM

La tabla requiere los siguientes permisos:

```json
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
    "arn:aws:dynamodb:us-east-1:*:table/library-shop-api-books-{stage}",
    "arn:aws:dynamodb:us-east-1:*:table/library-shop-api-books-{stage}/index/*"
  ]
}
```

## 📈 Consideraciones de Rendimiento

### Ventajas del Diseño Actual
- ✅ **Escalabilidad:** PAY_PER_REQUEST se adapta automáticamente
- ✅ **Búsqueda rápida por ID:** Acceso directo O(1)
- ✅ **Búsqueda por ISBN:** GSI optimizado
- ✅ **Flexibilidad:** Scan con filtros para búsquedas complejas

### Limitaciones
- ⚠️ **Scan costoso:** Para búsquedas por autor/título
- ⚠️ **Sin ordenamiento:** Los resultados no están ordenados
- ⚠️ **Sin búsqueda full-text:** No hay búsqueda de texto completo

### Optimizaciones Futuras
- 🔮 **GSI adicional:** Para búsquedas por autor
- 🔮 **GSI compuesto:** Para ordenamiento por fecha/precio
- 🔮 **DynamoDB Streams:** Para sincronización con Elasticsearch

## 🛠️ Comandos AWS CLI

### Crear tabla manualmente
```bash
aws dynamodb create-table \
  --table-name library-shop-api-books-dev \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=isbn,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=isbn-index,KeySchema=[{AttributeName=isbn,KeyType=HASH}],Projection={ProjectionType=ALL} \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### Consultar tabla
```bash
# Obtener todos los items
aws dynamodb scan \
  --table-name library-shop-api-books-dev \
  --region us-east-1

# Obtener item por ID
aws dynamodb get-item \
  --table-name library-shop-api-books-dev \
  --key '{"id":{"S":"550e8400-e29b-41d4-a716-446655440000"}}' \
  --region us-east-1

# Consultar por ISBN
aws dynamodb query \
  --table-name library-shop-api-books-dev \
  --index-name isbn-index \
  --key-condition-expression "isbn = :isbn" \
  --expression-attribute-values '{":isbn":{"S":"978-84-450-7054-9"}}' \
  --region us-east-1
```

## 📝 Notas de Implementación

- **UUIDs:** Se generan automáticamente usando la librería `uuid`
- **Timestamps:** Se usan fechas ISO 8601
- **Validación:** Los datos se validan con Joi antes de guardar
- **CORS:** Habilitado para todas las operaciones
- **Error Handling:** Manejo robusto de errores con códigos HTTP apropiados

---

*Última actualización: 2024-01-15*
*Versión del esquema: 1.0*
