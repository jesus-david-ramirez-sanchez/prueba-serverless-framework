const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

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
 * Eliminar un libro por ID
 * @param {string} tableName - Nombre de la tabla
 * @param {string} id - ID del libro a eliminar
 * @returns {Promise<boolean>} - true si se eliminó correctamente
 */
async function deleteBook(tableName, id) {
    const command = new DeleteCommand({
        TableName: tableName,
        Key: { id: id }
    });

    await docClient.send(command);
    return true;
}

module.exports = {
    getBookById,
    deleteBook
};
