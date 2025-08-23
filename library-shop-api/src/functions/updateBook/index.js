const { validateUpdateBookData, validateBookId } = require('./validations');
const { getBookById, updateBook } = require('./database');
const UpdateBookResponseHandler = require('./responseHandler');
const { processDateFields } = require('../../utils/dateUtils');

exports.handler = async (event) => {
    try {
        // Obtener variables de entorno
        const tableName = process.env.BOOKS_TABLE_NAME;
        const stage = process.env.STAGE || 'dev';

        if (!tableName) {
            throw new Error('BOOKS_TABLE_NAME environment variable is required');
        }

        // Validar que sea una petición PUT
        if (event.httpMethod !== 'PUT') {
            return UpdateBookResponseHandler.methodNotAllowed();
        }

        // Obtener y validar el ID del libro desde los path parameters
        const bookId = event.pathParameters?.id;
        if (!bookId) {
            return UpdateBookResponseHandler.badRequest('Book ID is required in the URL path');
        }

        try {
            validateBookId(bookId);
        } catch (validationError) {
            return UpdateBookResponseHandler.validationError(validationError.details);
        }

        // Parsear el cuerpo de la petición
        if (!event.body) {
            return UpdateBookResponseHandler.badRequest('Request body is required');
        }

        let requestBody;
        try {
            requestBody = JSON.parse(event.body);
        } catch (parseError) {
            return UpdateBookResponseHandler.badRequest('Invalid JSON in request body');
        }

        // Validar datos de entrada
        let validatedData;
        try {
            validatedData = validateUpdateBookData(requestBody);
        } catch (validationError) {
            return UpdateBookResponseHandler.validationError(validationError.details);
        }

        // Procesar las fechas antes de enviar a la base de datos
        const processedData = processDateFields(validatedData);

        // Verificar que el libro existe antes de actualizar
        try {
            const existingBook = await getBookById(tableName, bookId);
            
            if (!existingBook) {
                return UpdateBookResponseHandler.notFound();
            }
        } catch (error) {
            console.error('Error checking if book exists:', error);
            return UpdateBookResponseHandler.internalServerError('An error occurred while checking if the book exists');
        }

        // Actualizar en la base de datos
        let updatedBook;
        try {
            updatedBook = await updateBook(tableName, bookId, processedData);
        } catch (error) {
            console.error('Error updating book:', error);
            return UpdateBookResponseHandler.internalServerError();
        }

        // Respuesta exitosa
        return UpdateBookResponseHandler.success({
            message: 'Book updated successfully',
            book: updatedBook,
            updatedFields: Object.keys(validatedData),
            stage: stage
        });

    } catch (error) {
        console.error('Error in updateBook handler:', error);
        return UpdateBookResponseHandler.internalServerError();
    }
};
