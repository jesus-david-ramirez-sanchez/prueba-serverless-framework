const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { client } = require('../../config/dynamodb');

// Configuración del cliente DynamoDB Document
const docClient = DynamoDBDocumentClient.from(client);

/**
 * Crear un nuevo libro en DynamoDB
 * @param {string} tableName - Nombre de la tabla
 * @param {Object} book - Objeto del libro a crear
 * @returns {Promise<Object>} - Libro creado
 */
async function createBook(tableName, book) {
    const command = new PutCommand({
        TableName: tableName,
        Item: book
    });

    await docClient.send(command);
    return book;
}

module.exports = {
    createBook
};
