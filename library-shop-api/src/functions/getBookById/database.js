const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');
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

module.exports = {
    getBookById
};
