const { validateBookId } = require('./validations');
const { getBookById, deleteBook } = require('./database');
const DeleteBookResponseHandler = require('./responseHandler');

exports.handler = async (event) => {
    try {
        // Obtener variables de entorno
        const tableName = process.env.BOOKS_TABLE_NAME;
        const stage = process.env.STAGE || 'dev';

        if (!tableName) {
            throw new Error('BOOKS_TABLE_NAME environment variable is required');
        }

        // Validar que sea una petición DELETE
        if (event.httpMethod !== 'DELETE') {
            return DeleteBookResponseHandler.methodNotAllowed();
        }

        // Obtener y validar el ID del libro desde los path parameters
        const bookId = event.pathParameters?.id;
        if (!bookId) {
            return DeleteBookResponseHandler.badRequest('Book ID is required in the URL path');
        }

        try {
            validateBookId(bookId);
        } catch (validationError) {
            return DeleteBookResponseHandler.validationError(validationError.details);
        }

        // Verificar que el libro existe antes de eliminar
        try {
            const existingBook = await getBookById(tableName, bookId);
            
            if (!existingBook) {
                return DeleteBookResponseHandler.notFound();
            }
        } catch (error) {
            console.error('Error checking if book exists:', error);
            return DeleteBookResponseHandler.internalServerError('An error occurred while checking if the book exists');
        }

        // Eliminar de la base de datos
        try {
            await deleteBook(tableName, bookId);
        } catch (error) {
            console.error('Error deleting book:', error);
            return DeleteBookResponseHandler.internalServerError();
        }

        // Respuesta exitosa
        return DeleteBookResponseHandler.success({
            message: 'Book deleted successfully',
            deletedBookId: bookId,
            stage: stage
        });

    } catch (error) {
        console.error('Error in deleteBook handler:', error);
        return DeleteBookResponseHandler.internalServerError();
    }
};
