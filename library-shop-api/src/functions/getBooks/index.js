const { validateSearchParams, validateBookId } = require('./validations');
const { getBookById, getBooks } = require('./database');
const GetBooksResponseHandler = require('./responseHandler');

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
            return GetBooksResponseHandler.methodNotAllowed();
        }

        // Obtener y validar parámetros de query
        const queryParams = event.queryStringParameters || {};
        let validatedParams;
        try {
            validatedParams = validateSearchParams(queryParams);
        } catch (validationError) {
            return GetBooksResponseHandler.validationError(validationError.details);
        }

        const { id, author, title, limit, offset } = validatedParams;

        let books = [];
        let totalCount = 0;

        // Si se proporciona un ID específico, buscar por ID
        if (id) {
            try {
                // Validar formato del ID
                validateBookId(id);
                
                const book = await getBookById(tableName, id);
                
                if (book) {
                    books = [book];
                    totalCount = 1;
                } else {
                    return GetBooksResponseHandler.notFound();
                }
            } catch (error) {
                console.error('Error getting book by ID:', error);
                return GetBooksResponseHandler.internalServerError('An error occurred while retrieving the book');
            }
        } else {
            // Buscar libros con filtros
            try {
                const filters = {
                    author,
                    title,
                    limit: parseInt(limit),
                    exclusiveStartKey: offset !== 0 ? { id: offset.toString() } : undefined
                };

                const result = await getBooks(tableName, filters);
                books = result.items;
                totalCount = result.count;
            } catch (error) {
                console.error('Error getting books:', error);
                return GetBooksResponseHandler.internalServerError();
            }
        }

        // Respuesta exitosa
        return GetBooksResponseHandler.success({
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
        });

    } catch (error) {
        console.error('Error in getBooks handler:', error);
        return GetBooksResponseHandler.internalServerError();
    }
};
