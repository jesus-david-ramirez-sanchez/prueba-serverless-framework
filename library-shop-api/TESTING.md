# Pruebas Unitarias - Library Shop API

Este documento describe las pruebas unitarias implementadas para la API de gestión de libros.

## Estructura de Pruebas

Las pruebas están organizadas de la siguiente manera:

```
src/
├── utils/
│   ├── dateUtils.js
│   └── dateUtils.test.js
└── functions/
    ├── createBook/
    │   ├── index.js
    │   ├── index.test.js
    │   ├── validations.js
    │   ├── validations.test.js
    │   ├── responseHandler.js
    │   └── responseHandler.test.js
    ├── getAllBooks/
    │   ├── index.js
    │   └── index.test.js
    ├── getBookById/
    │   ├── index.js
    │   └── index.test.js
    ├── updateBook/
    │   ├── index.js
    │   └── index.test.js
    └── deleteBook/
        ├── index.js
        └── index.test.js
```

## Comandos de Pruebas

### Ejecutar todas las pruebas
```bash
npm test
```

### Ejecutar pruebas en modo watch
```bash
npm run test:watch
```

### Ejecutar pruebas con cobertura
```bash
npm run test:coverage
```

## Cobertura de Pruebas

Las pruebas cubren los siguientes aspectos:

### 1. Utilidades (dateUtils)
- ✅ Conversión de fechas a formato ISO
- ✅ Procesamiento de campos de fecha en objetos
- ✅ Manejo de valores null/undefined
- ✅ Validación de formatos de fecha

### 2. Validaciones (validations)
- ✅ Validación de esquemas Joi
- ✅ Validación de datos de entrada
- ✅ Manejo de errores de validación
- ✅ Validación de IDs de libros
- ✅ Validación de parámetros de búsqueda

### 3. Manejadores de Respuesta (responseHandler)
- ✅ Respuestas exitosas
- ✅ Respuestas de error
- ✅ Respuestas de validación
- ✅ Respuestas de método no permitido
- ✅ Respuestas de solicitud incorrecta
- ✅ Respuestas de error interno del servidor
- ✅ Consistencia de headers

### 4. Funciones Lambda (handlers)
- ✅ Validación de método HTTP
- ✅ Validación de variables de entorno
- ✅ Validación de parámetros de entrada
- ✅ Validación del cuerpo de la petición
- ✅ Manejo de errores de base de datos
- ✅ Manejo de errores generales
- ✅ Configuración de stage
- ✅ Flujos exitosos de operaciones CRUD

## Casos de Prueba por Función

### createBook
- ✅ Creación exitosa de libro
- ✅ Validación de datos requeridos
- ✅ Validación de formato de ISBN
- ✅ Validación de precio positivo
- ✅ Manejo de fechas de publicación
- ✅ Generación de UUID
- ✅ Manejo de errores de base de datos

### getAllBooks
- ✅ Obtención de todos los libros
- ✅ Filtrado por autor
- ✅ Filtrado por título
- ✅ Paginación con limit y offset
- ✅ Validación de parámetros de búsqueda
- ✅ Manejo de queryStringParameters null

### getBookById
- ✅ Obtención de libro por ID
- ✅ Validación de ID de libro
- ✅ Manejo de libro no encontrado (404)
- ✅ Validación de pathParameters

### updateBook
- ✅ Actualización exitosa de libro
- ✅ Validación de existencia del libro
- ✅ Validación de datos de actualización
- ✅ Procesamiento de fechas
- ✅ Manejo de campos actualizados

### deleteBook
- ✅ Eliminación exitosa de libro
- ✅ Validación de existencia del libro
- ✅ Validación de ID de libro
- ✅ Manejo de errores de eliminación

## Configuración de Jest

La configuración de Jest incluye:

```json
{
  "testEnvironment": "node",
  "collectCoverageFrom": [
    "src/**/*.js",
    "!src/**/*.test.js"
  ],
  "coverageDirectory": "coverage",
  "coverageReporters": ["text", "lcov", "html"]
}
```

## Mocks Utilizados

### Dependencias Externas
- `uuid`: Mock para generar IDs consistentes en pruebas
- `@aws-sdk/client-dynamodb`: Mock para operaciones de base de datos
- `@aws-sdk/lib-dynamodb`: Mock para operaciones de DynamoDB

### Módulos Internos
- Funciones de validación
- Funciones de base de datos
- Manejadores de respuesta
- Utilidades de fechas

## Workflow de CI/CD

El workflow de GitHub Actions (`test.yml`) incluye:

1. **Ejecución en múltiples versiones de Node.js** (18.x, 20.x)
2. **Cache de dependencias** para optimizar tiempos de ejecución
3. **Generación de reportes de cobertura**
4. **Integración con Codecov** para seguimiento de cobertura
5. **Comentarios automáticos en PRs** con resultados de cobertura
6. **Verificación de umbral de cobertura** (mínimo 80%)

## Métricas de Calidad

### Cobertura Mínima
- **Líneas de código**: 80%
- **Funciones**: 80%
- **Ramas**: 80%

### Tiempo de Ejecución
- **Pruebas unitarias**: < 30 segundos
- **Con cobertura**: < 60 segundos

## Mejores Prácticas Implementadas

1. **Aislamiento**: Cada prueba es independiente
2. **Mocks apropiados**: Uso de mocks para dependencias externas
3. **Nombres descriptivos**: Nombres de pruebas que describen el comportamiento
4. **Organización**: Pruebas agrupadas por funcionalidad
5. **Cobertura completa**: Pruebas para casos exitosos y de error
6. **Validación de edge cases**: Pruebas para casos límite

## Ejecución Local

Para ejecutar las pruebas en tu entorno local:

```bash
# Instalar dependencias
npm install

# Ejecutar pruebas
npm test

# Ejecutar con cobertura
npm run test:coverage

# Ejecutar en modo watch (desarrollo)
npm run test:watch
```

## Troubleshooting

### Problemas Comunes

1. **Error de módulos no encontrados**: Asegúrate de ejecutar `npm install`
2. **Errores de mocks**: Verifica que los mocks estén correctamente configurados
3. **Problemas de cobertura**: Asegúrate de que todos los archivos estén incluidos en `collectCoverageFrom`

### Debugging

Para debuggear pruebas específicas:

```bash
# Ejecutar una prueba específica
npm test -- --testNamePattern="debe crear un libro exitosamente"

# Ejecutar pruebas de un archivo específico
npm test -- dateUtils.test.js

# Ejecutar con más información de debug
npm test -- --verbose
```
