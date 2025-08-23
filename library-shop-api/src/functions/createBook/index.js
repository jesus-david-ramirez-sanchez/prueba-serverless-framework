const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');

// Configuración del cliente DynamoDB
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Esquema de validación con Joi
const bookSchema = Joi.object({
    title: Joi.string().min(1).max(200).required().messages({
        'string.empty': 'El título no puede estar vacío',
        'string.min': 'El título debe tener al menos 1 carácter',
        'string.max': 'El título no puede exceder 200 caracteres',
        'any.required': 'El título es requerido'
    }),
    author: Joi.string().min(1).max(100).required().messages({
        'string.empty': 'El autor no puede estar vacío',
        'string.min': 'El autor debe tener al menos 1 carácter',
        'string.max': 'El autor no puede exceder 100 caracteres',
        'any.required': 'El autor es requerido'
    }),
    isbn: Joi.string().pattern(/^[0-9-]{10,17}$/).required().messages({
        'string.pattern.base': 'El ISBN debe tener entre 10 y 17 caracteres y contener solo números y guiones',
        'any.required': 'El ISBN es requerido'
    }),
    price: Joi.number().positive().precision(2).max(999999.99).required().messages({
        'number.base': 'El precio debe ser un número',
        'number.positive': 'El precio debe ser un número positivo',
        'number.precision': 'El precio no puede tener más de 2 decimales',
        'number.max': 'El precio no puede exceder 999,999.99',
        'any.required': 'El precio es requerido'
    }),
    description: Joi.string().max(1000).optional().messages({
        'string.max': 'La descripción no puede exceder 1000 caracteres'
    }),
    publishedDate: Joi.date().iso().max('now').optional().messages({
        'date.format': 'La fecha de publicación debe estar en formato ISO (YYYY-MM-DD)',
        'date.max': 'La fecha de publicación no puede ser futura'
    })
});

exports.handler = async (event) => {
    try {
        // Obtener variables de entorno
        const tableName = process.env.BOOKS_TABLE_NAME;
        const stage = process.env.STAGE || 'dev';

        if (!tableName) {
            throw new Error('BOOKS_TABLE_NAME environment variable is required');
        }

        // Validar que sea una petición POST
        if (event.httpMethod !== 'POST') {
            return {
                statusCode: 405,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({
                    error: 'Method Not Allowed',
                    message: 'Only POST method is allowed'
                })
            };
        }

        // Parsear el cuerpo de la petición
        if (!event.body) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({
                    error: 'Bad Request',
                    message: 'Request body is required'
                })
            };
        }

        let requestBody;
        try {
            requestBody = JSON.parse(event.body);
        } catch (parseError) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({
                    error: 'Bad Request',
                    message: 'Invalid JSON in request body'
                })
            };
        }

        // Validar con Joi
        const { error, value } = bookSchema.validate(requestBody, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errorDetails = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({
                    error: 'Validation Error',
                    message: 'Los datos proporcionados no son válidos',
                    details: errorDetails
                })
            };
        }

        // Crear el objeto del libro con los datos validados
        const now = new Date().toISOString();
        const book = {
            id: uuidv4(),
            title: value.title,
            author: value.author,
            isbn: value.isbn,
            price: value.price,
            description: value.description,
            publishedDate: value.publishedDate,
            createdAt: now,
            updatedAt: now
        };

        // Guardar en DynamoDB
        const putCommand = new PutCommand({
            TableName: tableName,
            Item: book,
            ConditionExpression: 'attribute_not_exists(id)'
        });

        await docClient.send(putCommand);

        // Respuesta exitosa
        return {
            statusCode: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                message: 'Book created successfully',
                book: book,
                stage: stage
            })
        };

    } catch (error) {
        console.error('Error creating book:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                error: 'Internal Server Error',
                message: 'An error occurred while creating the book'
            })
        };
    }
};
