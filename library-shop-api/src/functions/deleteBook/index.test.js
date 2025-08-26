const { handler } = require('./index');
const { validateBookId } = require('./validations');
const { getBookById, deleteBook } = require('./database');
const DeleteBookResponseHandler = require('./responseHandler');

// Mock de las dependencias
jest.mock('./validations');
jest.mock('./database');
jest.mock('./responseHandler');

describe('deleteBook handler', () => {
    let mockEvent;
    let mockProcessEnv;

    beforeEach(() => {
        // Configurar mocks
        mockEvent = {
            httpMethod: 'DELETE',
            pathParameters: {
                id: 'test-book-id'
            }
        };

        mockProcessEnv = {
            BOOKS_TABLE_NAME: 'test-books-table',
            STAGE: 'test'
        };

        // Mock de process.env
        Object.defineProperty(process, 'env', {
            value: mockProcessEnv,
            writable: true
        });

        // Mock de console.error para evitar logs en las pruebas
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
        console.error.mockRestore();
    });

    describe('validación de método HTTP', () => {
        test('debe retornar error cuando no es método DELETE', async () => {
            mockEvent.httpMethod = 'POST';
            const mockResponse = { statusCode: 405 };
            DeleteBookResponseHandler.methodNotAllowed.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(DeleteBookResponseHandler.methodNotAllowed).toHaveBeenCalled();
            expect(result).toBe(mockResponse);
        });
    });

    describe('validación de variables de entorno', () => {
        test('debe retornar error cuando falta BOOKS_TABLE_NAME', async () => {
            delete mockProcessEnv.BOOKS_TABLE_NAME;
            const mockResponse = { statusCode: 500 };
            DeleteBookResponseHandler.internalServerError.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(DeleteBookResponseHandler.internalServerError).toHaveBeenCalled();
            expect(result).toBe(mockResponse);
        });
    });

    describe('validación del ID del libro', () => {
        test('debe retornar error cuando no hay ID en pathParameters', async () => {
            delete mockEvent.pathParameters;
            const mockResponse = { statusCode: 400 };
            DeleteBookResponseHandler.badRequest.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(DeleteBookResponseHandler.badRequest).toHaveBeenCalledWith('Book ID is required in the URL path');
            expect(result).toBe(mockResponse);
        });

        test('debe retornar error cuando el ID es inválido', async () => {
            const validationError = {
                type: 'VALIDATION_ERROR',
                details: [{ field: 'id', message: 'Invalid book ID format' }]
            };
            validateBookId.mockImplementation(() => {
                throw validationError;
            });

            const mockResponse = { statusCode: 400 };
            DeleteBookResponseHandler.validationError.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(validateBookId).toHaveBeenCalledWith('test-book-id');
            expect(DeleteBookResponseHandler.validationError).toHaveBeenCalledWith(validationError.details);
            expect(result).toBe(mockResponse);
        });
    });

    describe('verificación de existencia del libro', () => {
        test('debe retornar 404 cuando el libro no existe', async () => {
            validateBookId.mockReturnValue(true);
            getBookById.mockResolvedValue(null);

            const mockResponse = { statusCode: 404 };
            DeleteBookResponseHandler.notFound.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(getBookById).toHaveBeenCalledWith('test-books-table', 'test-book-id');
            expect(DeleteBookResponseHandler.notFound).toHaveBeenCalled();
            expect(result).toBe(mockResponse);
        });

        test('debe manejar errores al verificar existencia del libro', async () => {
            validateBookId.mockReturnValue(true);
            getBookById.mockRejectedValue(new Error('Database error'));

            const mockResponse = { statusCode: 500 };
            DeleteBookResponseHandler.internalServerError.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(getBookById).toHaveBeenCalled();
            expect(DeleteBookResponseHandler.internalServerError).toHaveBeenCalledWith('An error occurred while checking if the book exists');
            expect(result).toBe(mockResponse);
        });
    });

    describe('eliminación exitosa del libro', () => {
        test('debe eliminar un libro exitosamente', async () => {
            const existingBook = {
                id: 'test-book-id',
                title: 'Test Book',
                author: 'Test Author',
                isbn: '1234567890',
                price: 29.99
            };

            // Mock de las funciones
            validateBookId.mockReturnValue(true);
            getBookById.mockResolvedValue(existingBook);
            deleteBook.mockResolvedValue();

            const mockResponse = { statusCode: 200 };
            DeleteBookResponseHandler.success.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            // Verificar que se llamaron las funciones correctas
            expect(validateBookId).toHaveBeenCalledWith('test-book-id');
            expect(getBookById).toHaveBeenCalledWith('test-books-table', 'test-book-id');
            expect(deleteBook).toHaveBeenCalledWith('test-books-table', 'test-book-id');
            expect(DeleteBookResponseHandler.success).toHaveBeenCalledWith({
                message: 'Book deleted successfully',
                deletedBookId: 'test-book-id',
                stage: 'test'
            });
            expect(result).toBe(mockResponse);
        });

        test('debe manejar errores de base de datos durante la eliminación', async () => {
            const existingBook = { id: 'test-book-id' };

            validateBookId.mockReturnValue(true);
            getBookById.mockResolvedValue(existingBook);
            deleteBook.mockRejectedValue(new Error('Database error'));

            const mockResponse = { statusCode: 500 };
            DeleteBookResponseHandler.internalServerError.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(deleteBook).toHaveBeenCalled();
            expect(DeleteBookResponseHandler.internalServerError).toHaveBeenCalled();
            expect(result).toBe(mockResponse);
        });
    });

    describe('manejo de errores generales', () => {
        test('debe manejar errores inesperados', async () => {
            // Simular un error en la validación de variables de entorno
            delete mockProcessEnv.BOOKS_TABLE_NAME;
            
            const mockResponse = { statusCode: 500 };
            DeleteBookResponseHandler.internalServerError.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(DeleteBookResponseHandler.internalServerError).toHaveBeenCalled();
            expect(result).toBe(mockResponse);
        });
    });

    describe('configuración de stage', () => {
        test('debe usar stage por defecto cuando no está definido', async () => {
            delete mockProcessEnv.STAGE;
            
            const existingBook = { id: 'test-book-id' };

            validateBookId.mockReturnValue(true);
            getBookById.mockResolvedValue(existingBook);
            deleteBook.mockResolvedValue();

            const mockResponse = { statusCode: 200 };
            DeleteBookResponseHandler.success.mockReturnValue(mockResponse);

            await handler(mockEvent);

            expect(DeleteBookResponseHandler.success).toHaveBeenCalledWith(
                expect.objectContaining({
                    stage: 'dev'
                })
            );
        });
    });
});
