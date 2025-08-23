const { v4: uuidv4 } = require('uuid');
const { validateCreateBookData } = require('./validations');
const { createBook } = require('./database');
const CreateBookResponseHandler = require('./responseHandler');

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
            return CreateBookResponseHandler.methodNotAllowed();
        }

        // Parsear el cuerpo de la petición
        if (!event.body) {
            return CreateBookResponseHandler.badRequest('Request body is required');
        }

        let requestBody;
        try {
            requestBody = JSON.parse(event.body);
        } catch (parseError) {
            return CreateBookResponseHandler.badRequest('Invalid JSON in request body');
        }

        // Validar datos de entrada
        let validatedData;
        try {
            validatedData = validateCreateBookData(requestBody);
        } catch (validationError) {
            return CreateBookResponseHandler.validationError(validationError.details);
        }

        // Preparar el objeto del libro
        const now = new Date().toISOString();
        const book = {
            id: uuidv4(),
            publishedDate: new Date(validatedData.publishedDate).toISOString(),
            ...validatedData,
            createdAt: now,
            updatedAt: now
        };

        // Guardar en la base de datos
        try {
            await createBook(tableName, book);
        } catch (dbError) {
            console.error('Error creating book in database:', dbError);
            return CreateBookResponseHandler.internalServerError();
        }

        // Respuesta exitosa
        return CreateBookResponseHandler.success({
            message: 'Book created successfully',
            book: book,
            stage: stage
        });

    } catch (error) {
        console.error('Error in createBook handler:', error);
        return CreateBookResponseHandler.internalServerError();
    }
};
