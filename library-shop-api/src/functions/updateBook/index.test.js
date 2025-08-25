const { handler } = require('./index');
const { validateUpdateBookData, validateBookId } = require('./validations');
const { getBookById, updateBook } = require('./database');
const UpdateBookResponseHandler = require('./responseHandler');
const { processDateFields } = require('../../utils/dateUtils');

// Mock de las dependencias
jest.mock('./validations');
jest.mock('./database');
jest.mock('./responseHandler');
jest.mock('../../utils/dateUtils');

describe('updateBook handler', () => {
    let mockEvent;
    let mockProcessEnv;

    beforeEach(() => {
        // Configurar mocks
        mockEvent = {
            httpMethod: 'PUT',
            pathParameters: {
                id: 'test-book-id'
            },
            body: JSON.stringify({
                title: 'Updated Book',
                price: 39.99
            })
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
        test('debe retornar error cuando no es método PUT', async () => {
            mockEvent.httpMethod = 'POST';
            const mockResponse = { statusCode: 405 };
            UpdateBookResponseHandler.methodNotAllowed.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(UpdateBookResponseHandler.methodNotAllowed).toHaveBeenCalled();
            expect(result).toBe(mockResponse);
        });
    });

    describe('validación de variables de entorno', () => {
        test('debe retornar error cuando falta BOOKS_TABLE_NAME', async () => {
            delete mockProcessEnv.BOOKS_TABLE_NAME;
            const mockResponse = { statusCode: 500 };
            UpdateBookResponseHandler.internalServerError.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(UpdateBookResponseHandler.internalServerError).toHaveBeenCalled();
            expect(result).toBe(mockResponse);
        });
    });

    describe('validación del ID del libro', () => {
        test('debe retornar error cuando no hay ID en pathParameters', async () => {
            delete mockEvent.pathParameters;
            const mockResponse = { statusCode: 400 };
            UpdateBookResponseHandler.badRequest.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(UpdateBookResponseHandler.badRequest).toHaveBeenCalledWith('Book ID is required in the URL path');
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
            UpdateBookResponseHandler.validationError.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(validateBookId).toHaveBeenCalledWith('test-book-id');
            expect(UpdateBookResponseHandler.validationError).toHaveBeenCalledWith(validationError.details);
            expect(result).toBe(mockResponse);
        });
    });

    describe('validación del cuerpo de la petición', () => {
        test('debe retornar error cuando no hay body', async () => {
            delete mockEvent.body;
            validateBookId.mockReturnValue(true);
            
            const mockResponse = { statusCode: 400 };
            UpdateBookResponseHandler.badRequest.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(UpdateBookResponseHandler.badRequest).toHaveBeenCalledWith('Request body is required');
            expect(result).toBe(mockResponse);
        });

        test('debe retornar error cuando el JSON es inválido', async () => {
            mockEvent.body = 'invalid json';
            validateBookId.mockReturnValue(true);
            
            const mockResponse = { statusCode: 400 };
            UpdateBookResponseHandler.badRequest.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(UpdateBookResponseHandler.badRequest).toHaveBeenCalledWith('Invalid JSON in request body');
            expect(result).toBe(mockResponse);
        });
    });

    describe('validación de datos de actualización', () => {
        test('debe retornar error de validación cuando los datos son inválidos', async () => {
            validateBookId.mockReturnValue(true);
            
            const validationError = {
                type: 'VALIDATION_ERROR',
                details: [{ field: 'price', message: 'Price must be positive' }]
            };
            validateUpdateBookData.mockImplementation(() => {
                throw validationError;
            });

            const mockResponse = { statusCode: 400 };
            UpdateBookResponseHandler.validationError.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(validateUpdateBookData).toHaveBeenCalledWith(JSON.parse(mockEvent.body));
            expect(UpdateBookResponseHandler.validationError).toHaveBeenCalledWith(validationError.details);
            expect(result).toBe(mockResponse);
        });
    });

    describe('verificación de existencia del libro', () => {
        test('debe retornar 404 cuando el libro no existe', async () => {
            validateBookId.mockReturnValue(true);
            validateUpdateBookData.mockReturnValue({ title: 'Updated Book' });
            getBookById.mockResolvedValue(null);

            const mockResponse = { statusCode: 404 };
            UpdateBookResponseHandler.notFound.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(getBookById).toHaveBeenCalledWith('test-books-table', 'test-book-id');
            expect(UpdateBookResponseHandler.notFound).toHaveBeenCalled();
            expect(result).toBe(mockResponse);
        });

        test('debe manejar errores al verificar existencia del libro', async () => {
            validateBookId.mockReturnValue(true);
            validateUpdateBookData.mockReturnValue({ title: 'Updated Book' });
            getBookById.mockRejectedValue(new Error('Database error'));

            const mockResponse = { statusCode: 500 };
            UpdateBookResponseHandler.internalServerError.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(getBookById).toHaveBeenCalled();
            expect(UpdateBookResponseHandler.internalServerError).toHaveBeenCalledWith('An error occurred while checking if the book exists');
            expect(result).toBe(mockResponse);
        });
    });

    describe('actualización exitosa del libro', () => {
        test('debe actualizar un libro exitosamente', async () => {
            const existingBook = {
                id: 'test-book-id',
                title: 'Original Book',
                author: 'Test Author',
                isbn: '1234567890',
                price: 29.99
            };

            const validatedData = {
                title: 'Updated Book',
                price: 39.99
            };

            const processedData = { ...validatedData };
            const updatedBook = {
                ...existingBook,
                ...processedData,
                updatedAt: '2023-01-15T10:30:00.000Z'
            };

            // Mock de las funciones
            validateBookId.mockReturnValue(true);
            validateUpdateBookData.mockReturnValue(validatedData);
            processDateFields.mockReturnValue(processedData);
            getBookById.mockResolvedValue(existingBook);
            updateBook.mockResolvedValue(updatedBook);

            // Mock de Date.toISOString
            const mockDate = new Date('2023-01-15T10:30:00.000Z');
            jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

            const mockResponse = { statusCode: 200 };
            UpdateBookResponseHandler.success.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            // Verificar que se llamaron las funciones correctas
            expect(validateBookId).toHaveBeenCalledWith('test-book-id');
            expect(validateUpdateBookData).toHaveBeenCalledWith(JSON.parse(mockEvent.body));
            expect(processDateFields).toHaveBeenCalledWith(validatedData);
            expect(getBookById).toHaveBeenCalledWith('test-books-table', 'test-book-id');
            expect(updateBook).toHaveBeenCalledWith('test-books-table', 'test-book-id', processedData);
            expect(UpdateBookResponseHandler.success).toHaveBeenCalledWith({
                message: 'Book updated successfully',
                book: updatedBook,
                updatedFields: ['title', 'price'],
                stage: 'test'
            });
            expect(result).toBe(mockResponse);

            // Restaurar Date
            global.Date.mockRestore();
        });

        test('debe manejar errores de base de datos durante la actualización', async () => {
            const existingBook = { id: 'test-book-id' };
            const validatedData = { title: 'Updated Book' };
            const processedData = { ...validatedData };

            validateBookId.mockReturnValue(true);
            validateUpdateBookData.mockReturnValue(validatedData);
            processDateFields.mockReturnValue(processedData);
            getBookById.mockResolvedValue(existingBook);
            updateBook.mockRejectedValue(new Error('Database error'));

            const mockResponse = { statusCode: 500 };
            UpdateBookResponseHandler.internalServerError.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(updateBook).toHaveBeenCalled();
            expect(UpdateBookResponseHandler.internalServerError).toHaveBeenCalled();
            expect(result).toBe(mockResponse);
        });
    });

    describe('manejo de errores generales', () => {
        test('debe manejar errores inesperados', async () => {
            // Simular un error en la validación de variables de entorno
            delete mockProcessEnv.BOOKS_TABLE_NAME;
            
            const mockResponse = { statusCode: 500 };
            UpdateBookResponseHandler.internalServerError.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(UpdateBookResponseHandler.internalServerError).toHaveBeenCalled();
            expect(result).toBe(mockResponse);
        });
    });

    describe('configuración de stage', () => {
        test('debe usar stage por defecto cuando no está definido', async () => {
            delete mockProcessEnv.STAGE;
            
            const existingBook = { id: 'test-book-id' };
            const validatedData = { title: 'Updated Book' };
            const processedData = { ...validatedData };

            validateBookId.mockReturnValue(true);
            validateUpdateBookData.mockReturnValue(validatedData);
            processDateFields.mockReturnValue(processedData);
            getBookById.mockResolvedValue(existingBook);
            updateBook.mockResolvedValue({ ...existingBook, ...processedData });

            const mockResponse = { statusCode: 200 };
            UpdateBookResponseHandler.success.mockReturnValue(mockResponse);

            await handler(mockEvent);

            expect(UpdateBookResponseHandler.success).toHaveBeenCalledWith(
                expect.objectContaining({
                    stage: 'dev'
                })
            );
        });
    });
});
