const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

// Configuración del cliente DynamoDB
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

/**
 * Obtener un libro por ID
 * @param {string} tableName - Nombre de la tabla
 * @param {string} id - ID del libro
 * @returns {Promise<Object|null>} - Libro encontrado o null
 */
async function getBookById(tableName, id) {
    const command = new GetCommand({
        TableName: tableName,
        Key: { id: id }
    });

    const result = await docClient.send(command);
    return result.Item || null;
}

/**
 * Obtener libros con filtros
 * @param {string} tableName - Nombre de la tabla
 * @param {Object} filters - Filtros de búsqueda
 * @param {string} filters.author - Filtrar por autor
 * @param {string} filters.title - Filtrar por título
 * @param {number} filters.limit - Límite de resultados
 * @param {Object} filters.exclusiveStartKey - Clave para paginación
 * @returns {Promise<Object>} - Resultados de la búsqueda
 */
async function getBooks(tableName, filters = {}) {
    const { author, title, limit = 10, exclusiveStartKey } = filters;

    let scanParams = {
        TableName: tableName,
        Limit: limit
    };

    // Agregar filtros si se proporcionan
    if (author) {
        scanParams.FilterExpression = 'contains(#author, :author)';
        scanParams.ExpressionAttributeNames = {
            '#author': 'author'
        };
        scanParams.ExpressionAttributeValues = {
            ':author': author
        };
    } else if (title) {
        scanParams.FilterExpression = 'contains(#title, :title)';
        scanParams.ExpressionAttributeNames = {
            '#title': 'title'
        };
        scanParams.ExpressionAttributeValues = {
            ':title': title
        };
    }

    // Agregar paginación si se proporciona
    if (exclusiveStartKey) {
        scanParams.ExclusiveStartKey = exclusiveStartKey;
    }

    const command = new ScanCommand(scanParams);
    const result = await docClient.send(command);

    return {
        items: result.Items || [],
        count: result.Count || 0,
        lastEvaluatedKey: result.LastEvaluatedKey
    };
}

module.exports = {
    getBookById,
    getBooks
};
