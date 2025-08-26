const { handler } = require('./index');
const { validateBookId } = require('./validations');
const { getBookById } = require('./database');
const GetBookByIdResponseHandler = require('./responseHandler');

// Mock de las dependencias
jest.mock('./validations');
jest.mock('./database');
jest.mock('./responseHandler');

describe('getBookById handler', () => {
    let mockEvent;
    let mockProcessEnv;

    beforeEach(() => {
        // Configurar mocks
        mockEvent = {
            httpMethod: 'GET',
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
        test('debe retornar error cuando no es método GET', async () => {
            mockEvent.httpMethod = 'POST';
            const mockResponse = { statusCode: 405 };
            GetBookByIdResponseHandler.methodNotAllowed.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(GetBookByIdResponseHandler.methodNotAllowed).toHaveBeenCalled();
            expect(result).toBe(mockResponse);
        });
    });

    describe('validación de variables de entorno', () => {
        test('debe retornar error cuando falta BOOKS_TABLE_NAME', async () => {
            delete mockProcessEnv.BOOKS_TABLE_NAME;
            const mockResponse = { statusCode: 500 };
            GetBookByIdResponseHandler.internalServerError.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(GetBookByIdResponseHandler.internalServerError).toHaveBeenCalled();
            expect(result).toBe(mockResponse);
        });
    });

    describe('validación del ID del libro', () => {
        test('debe retornar error cuando no hay ID en pathParameters', async () => {
            delete mockEvent.pathParameters;
            const mockResponse = { statusCode: 400 };
            GetBookByIdResponseHandler.badRequest.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(GetBookByIdResponseHandler.badRequest).toHaveBeenCalledWith('Book ID is required in the URL path');
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
            GetBookByIdResponseHandler.validationError.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(validateBookId).toHaveBeenCalledWith('test-book-id');
            expect(GetBookByIdResponseHandler.validationError).toHaveBeenCalledWith(validationError.details);
            expect(result).toBe(mockResponse);
        });
    });

    describe('obtención exitosa del libro', () => {
        test('debe obtener un libro exitosamente', async () => {
            const mockBook = {
                id: 'test-book-id',
                title: 'Test Book',
                author: 'Test Author',
                isbn: '1234567890',
                price: 29.99
            };

            validateBookId.mockReturnValue(true);
            getBookById.mockResolvedValue(mockBook);

            const mockResponse = { statusCode: 200 };
            GetBookByIdResponseHandler.success.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            // Verificar que se llamaron las funciones correctas
            expect(validateBookId).toHaveBeenCalledWith('test-book-id');
            expect(getBookById).toHaveBeenCalledWith('test-books-table', 'test-book-id');
            expect(GetBookByIdResponseHandler.success).toHaveBeenCalledWith({
                message: 'Book retrieved successfully',
                book: mockBook,
                stage: 'test'
            });
            expect(result).toBe(mockResponse);
        });

        test('debe retornar 404 cuando el libro no existe', async () => {
            validateBookId.mockReturnValue(true);
            getBookById.mockResolvedValue(null);

            const mockResponse = { statusCode: 404 };
            GetBookByIdResponseHandler.notFound.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(getBookById).toHaveBeenCalledWith('test-books-table', 'test-book-id');
            expect(GetBookByIdResponseHandler.notFound).toHaveBeenCalled();
            expect(result).toBe(mockResponse);
        });

        test('debe manejar errores de base de datos', async () => {
            validateBookId.mockReturnValue(true);
            getBookById.mockRejectedValue(new Error('Database error'));

            const mockResponse = { statusCode: 500 };
            GetBookByIdResponseHandler.internalServerError.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(getBookById).toHaveBeenCalled();
            expect(GetBookByIdResponseHandler.internalServerError).toHaveBeenCalledWith('An error occurred while retrieving the book');
            expect(result).toBe(mockResponse);
        });
    });

    describe('manejo de errores generales', () => {
        test('debe manejar errores inesperados', async () => {
            // Simular un error en la validación de variables de entorno
            delete mockProcessEnv.BOOKS_TABLE_NAME;
            
            const mockResponse = { statusCode: 500 };
            GetBookByIdResponseHandler.internalServerError.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(GetBookByIdResponseHandler.internalServerError).toHaveBeenCalled();
            expect(result).toBe(mockResponse);
        });
    });

    describe('configuración de stage', () => {
        test('debe usar stage por defecto cuando no está definido', async () => {
            delete mockProcessEnv.STAGE;
            
            validateBookId.mockReturnValue(true);
            getBookById.mockResolvedValue({ id: 'test-book-id' });

            const mockResponse = { statusCode: 200 };
            GetBookByIdResponseHandler.success.mockReturnValue(mockResponse);

            await handler(mockEvent);

            expect(GetBookByIdResponseHandler.success).toHaveBeenCalledWith(
                expect.objectContaining({
                    stage: 'dev'
                })
            );
        });
    });
});
