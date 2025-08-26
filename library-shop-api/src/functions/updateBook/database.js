const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { client } = require('../../config/dynamodb');

// Configuración del cliente DynamoDB Document
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
 * Actualizar un libro
 * @param {string} tableName - Nombre de la tabla
 * @param {string} id - ID del libro
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} - Libro actualizado
 */
async function updateBook(tableName, id, updateData) {
    // Preparar la expresión de actualización
    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    // Construir dinámicamente la expresión de actualización
    Object.keys(updateData).forEach(key => {
        const attributeName = `#${key}`;
        const attributeValue = `:${key}`;
        
        updateExpression.push(`${attributeName} = ${attributeValue}`);
        expressionAttributeNames[attributeName] = key;
        expressionAttributeValues[attributeValue] = updateData[key];
    });

    // Agregar updatedAt
    const now = new Date().toISOString();
    updateExpression.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = now;

    const command = new UpdateCommand({
        TableName: tableName,
        Key: { id: id },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
    });

    const result = await docClient.send(command);
    return result.Attributes;
}

module.exports = {
    getBookById,
    updateBook
};
