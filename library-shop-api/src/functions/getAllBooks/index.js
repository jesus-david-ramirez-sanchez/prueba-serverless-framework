const { validateSearchParams } = require('./validations');
const { getAllBooks } = require('./database');
const GetAllBooksResponseHandler = require('./responseHandler');

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
            return GetAllBooksResponseHandler.methodNotAllowed();
        }

        // Obtener parámetros de query
        const queryParams = event.queryStringParameters || {};

        // Validar parámetros de entrada
        let validatedParams;
        try {
            validatedParams = validateSearchParams(queryParams);
        } catch (validationError) {
            return GetAllBooksResponseHandler.validationError(validationError.details);
        }

        const { author, title, limit, offset } = validatedParams;

        // Preparar filtros para la búsqueda
        const filters = {
            limit: limit,
            exclusiveStartKey: offset ? { id: offset } : undefined
        };

        // Agregar filtros de búsqueda si se proporcionan
        if (author) {
            filters.author = author;
        } else if (title) {
            filters.title = title;
        }

        // Obtener libros de la base de datos
        try {
            const result = await getAllBooks(tableName, filters);
            
            // Respuesta exitosa
            return GetAllBooksResponseHandler.success({
                message: 'Books retrieved successfully',
                books: result.items,
                totalCount: result.count,
                limit: limit,
                offset: offset,
                hasMore: !!result.lastEvaluatedKey,
                stage: stage
            });
        } catch (error) {
            console.error('Error getting books:', error);
            return GetAllBooksResponseHandler.internalServerError();
        }

    } catch (error) {
        console.error('Error in getAllBooks handler:', error);
        return GetAllBooksResponseHandler.internalServerError();
    }
};
