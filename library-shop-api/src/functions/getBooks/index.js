const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

// Configuración del cliente DynamoDB
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    try {
        // Obtener variables de entorno
        const tableName = process.env.BOOKS_TABLE_NAME;
        const stage = process.env.STAGE || 'dev';

        if (!tableName) {
            throw new Error('BOOKS_TABLE_NAME environment variable is required');
        }

        // Validar que sea una petición GET
        if (event.httpMethod !== 'GET') {
            return {
                statusCode: 405,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({
                    error: 'Method Not Allowed',
                    message: 'Only GET method is allowed'
                })
            };
        }

        // Obtener parámetros de query
        const queryParams = event.queryStringParameters || {};
        const { id, author, title, limit = '10', offset = '0' } = queryParams;

        let books = [];
        let totalCount = 0;

        // Si se proporciona un ID específico, buscar por ID
        if (id) {
            try {
                const getCommand = new GetCommand({
                    TableName: tableName,
                    Key: { id: id }
                });

                const result = await docClient.send(getCommand);
                
                if (result.Item) {
                    books = [result.Item];
                    totalCount = 1;
                } else {
                    return {
                        statusCode: 404,
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*',
                        },
                        body: JSON.stringify({
                            error: 'Not Found',
                            message: 'Book not found with the provided ID'
                        })
                    };
                }
            } catch (error) {
                console.error('Error getting book by ID:', error);
                return {
                    statusCode: 500,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({
                        error: 'Internal Server Error',
                        message: 'An error occurred while retrieving the book'
                    })
                };
            }
        } 
        // Si se proporciona author, buscar por author usando Scan
        else if (author) {
            try {
                const scanCommand = new ScanCommand({
                    TableName: tableName,
                    FilterExpression: 'contains(#author, :author)',
                    ExpressionAttributeNames: {
                        '#author': 'author'
                    },
                    ExpressionAttributeValues: {
                        ':author': author
                    },
                    Limit: parseInt(limit),
                    ExclusiveStartKey: offset !== '0' ? { id: offset } : undefined
                });

                const result = await docClient.send(scanCommand);
                books = result.Items || [];
                totalCount = books.length;
            } catch (error) {
                console.error('Error scanning books by author:', error);
                return {
                    statusCode: 500,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({
                        error: 'Internal Server Error',
                        message: 'An error occurred while searching books by author'
                    })
                };
            }
        } 
        // Si se proporciona title, buscar por title usando Scan
        else if (title) {
            try {
                const scanCommand = new ScanCommand({
                    TableName: tableName,
                    FilterExpression: 'contains(#title, :title)',
                    ExpressionAttributeNames: {
                        '#title': 'title'
                    },
                    ExpressionAttributeValues: {
                        ':title': title
                    },
                    Limit: parseInt(limit),
                    ExclusiveStartKey: offset !== '0' ? { id: offset } : undefined
                });

                const result = await docClient.send(scanCommand);
                books = result.Items || [];
                totalCount = books.length;
            } catch (error) {
                console.error('Error scanning books by title:', error);
                return {
                    statusCode: 500,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({
                        error: 'Internal Server Error',
                        message: 'An error occurred while searching books by title'
                    })
                };
            }
        } 
        // Si no se proporcionan filtros, obtener todos los libros
        else {
            try {
                const scanCommand = new ScanCommand({
                    TableName: tableName,
                    Limit: parseInt(limit),
                    ExclusiveStartKey: offset !== '0' ? { id: offset } : undefined
                });

                const result = await docClient.send(scanCommand);
                books = result.Items || [];
                totalCount = books.length;
            } catch (error) {
                console.error('Error scanning all books:', error);
                return {
                    statusCode: 500,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({
                        error: 'Internal Server Error',
                        message: 'An error occurred while retrieving books'
                    })
                };
            }
        }

        // Respuesta exitosa
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                message: 'Books retrieved successfully',
                books: books,
                totalCount: totalCount,
                filters: {
                    id: id || null,
                    author: author || null,
                    title: title || null
                },
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset)
                },
                stage: stage
            })
        };

    } catch (error) {
        console.error('Error in getBooks handler:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                error: 'Internal Server Error',
                message: 'An error occurred while processing the request'
            })
        };
    }
};
