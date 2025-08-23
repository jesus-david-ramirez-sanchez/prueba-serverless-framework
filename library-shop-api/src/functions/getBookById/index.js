const { validateBookId } = require('./validations');
const { getBookById } = require('./database');
const GetBookByIdResponseHandler = require('./responseHandler');

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
            return GetBookByIdResponseHandler.methodNotAllowed();
        }

        // Obtener y validar el ID del libro desde los path parameters
        const bookId = event.pathParameters?.id;
        if (!bookId) {
            return GetBookByIdResponseHandler.badRequest('Book ID is required in the URL path');
        }

        try {
            validateBookId(bookId);
        } catch (validationError) {
            return GetBookByIdResponseHandler.validationError(validationError.details);
        }

        // Obtener el libro de la base de datos
        try {
            const book = await getBookById(tableName, bookId);
            
            if (!book) {
                return GetBookByIdResponseHandler.notFound();
            }

            // Respuesta exitosa
            return GetBookByIdResponseHandler.success({
                message: 'Book retrieved successfully',
                book: book,
                stage: stage
            });
        } catch (error) {
            console.error('Error getting book by ID:', error);
            return GetBookByIdResponseHandler.internalServerError('An error occurred while retrieving the book');
        }

    } catch (error) {
        console.error('Error in getBookById handler:', error);
        return GetBookByIdResponseHandler.internalServerError();
    }
};
