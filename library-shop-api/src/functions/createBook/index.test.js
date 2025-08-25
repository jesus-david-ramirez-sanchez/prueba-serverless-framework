const { handler } = require('./index');
const { validateCreateBookData } = require('./validations');
const { createBook } = require('./database');
const CreateBookResponseHandler = require('./responseHandler');
const { processDateFields } = require('../../utils/dateUtils');

// Mock de las dependencias
jest.mock('./validations');
jest.mock('./database');
jest.mock('./responseHandler');
jest.mock('../../utils/dateUtils');
jest.mock('uuid', () => ({
    v4: jest.fn(() => 'test-uuid-123')
}));

describe('createBook handler', () => {
    let mockEvent;
    let mockProcessEnv;

    beforeEach(() => {
        // Configurar mocks
        mockEvent = {
            httpMethod: 'POST',
            body: JSON.stringify({
                title: 'Test Book',
                author: 'Test Author',
                isbn: '1234567890',
                price: 29.99
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
        test('debe retornar error cuando no es método POST', async () => {
            mockEvent.httpMethod = 'GET';
            const mockResponse = { statusCode: 405 };
            CreateBookResponseHandler.methodNotAllowed.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(CreateBookResponseHandler.methodNotAllowed).toHaveBeenCalled();
            expect(result).toBe(mockResponse);
        });
    });

    describe('validación de variables de entorno', () => {
        test('debe retornar error cuando falta BOOKS_TABLE_NAME', async () => {
            delete mockProcessEnv.BOOKS_TABLE_NAME;
            const mockResponse = { statusCode: 500 };
            CreateBookResponseHandler.internalServerError.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(CreateBookResponseHandler.internalServerError).toHaveBeenCalled();
            expect(result).toBe(mockResponse);
        });
    });

    describe('validación del cuerpo de la petición', () => {
        test('debe retornar error cuando no hay body', async () => {
            delete mockEvent.body;
            const mockResponse = { statusCode: 400 };
            CreateBookResponseHandler.badRequest.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(CreateBookResponseHandler.badRequest).toHaveBeenCalledWith('Request body is required');
            expect(result).toBe(mockResponse);
        });

        test('debe retornar error cuando el JSON es inválido', async () => {
            mockEvent.body = 'invalid json';
            const mockResponse = { statusCode: 400 };
            CreateBookResponseHandler.badRequest.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(CreateBookResponseHandler.badRequest).toHaveBeenCalledWith('Invalid JSON in request body');
            expect(result).toBe(mockResponse);
        });
    });

    describe('validación de datos', () => {
        test('debe retornar error de validación cuando los datos son inválidos', async () => {
            const validationError = {
                type: 'VALIDATION_ERROR',
                details: [{ field: 'title', message: 'Title is required' }]
            };
            validateCreateBookData.mockImplementation(() => {
                throw validationError;
            });

            const mockResponse = { statusCode: 400 };
            CreateBookResponseHandler.validationError.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(validateCreateBookData).toHaveBeenCalledWith(JSON.parse(mockEvent.body));
            expect(CreateBookResponseHandler.validationError).toHaveBeenCalledWith(validationError.details);
            expect(result).toBe(mockResponse);
        });
    });

    describe('creación exitosa del libro', () => {
        test('debe crear un libro exitosamente', async () => {
            const validatedData = {
                title: 'Test Book',
                author: 'Test Author',
                isbn: '1234567890',
                price: 29.99
            };

            const processedData = { ...validatedData };
            const expectedBook = {
                id: 'test-uuid-123',
                ...processedData,
                createdAt: '2023-01-15T10:30:00.000Z',
                updatedAt: '2023-01-15T10:30:00.000Z'
            };

            // Mock de las funciones
            validateCreateBookData.mockReturnValue(validatedData);
            processDateFields.mockReturnValue(processedData);
            createBook.mockResolvedValue(expectedBook);

            // Mock de Date.toISOString
            const mockDate = new Date('2023-01-15T10:30:00.000Z');
            jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

            const mockResponse = { statusCode: 201 };
            CreateBookResponseHandler.success.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            // Verificar que se llamaron las funciones correctas
            expect(validateCreateBookData).toHaveBeenCalledWith(JSON.parse(mockEvent.body));
            expect(processDateFields).toHaveBeenCalledWith(validatedData);
            expect(createBook).toHaveBeenCalledWith('test-books-table', expectedBook);
            expect(CreateBookResponseHandler.success).toHaveBeenCalledWith({
                message: 'Book created successfully',
                book: expectedBook,
                stage: 'test'
            });
            expect(result).toBe(mockResponse);

            // Restaurar Date
            global.Date.mockRestore();
        });

        test('debe manejar errores de base de datos', async () => {
            const validatedData = {
                title: 'Test Book',
                author: 'Test Author',
                isbn: '1234567890',
                price: 29.99
            };

            validateCreateBookData.mockReturnValue(validatedData);
            processDateFields.mockReturnValue(validatedData);
            createBook.mockRejectedValue(new Error('Database error'));

            const mockResponse = { statusCode: 500 };
            CreateBookResponseHandler.internalServerError.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(createBook).toHaveBeenCalled();
            expect(CreateBookResponseHandler.internalServerError).toHaveBeenCalled();
            expect(result).toBe(mockResponse);
        });
    });

    describe('manejo de errores generales', () => {
        test('debe manejar errores inesperados', async () => {
            // Simular un error en la validación de variables de entorno
            delete mockProcessEnv.BOOKS_TABLE_NAME;
            
            const mockResponse = { statusCode: 500 };
            CreateBookResponseHandler.internalServerError.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(CreateBookResponseHandler.internalServerError).toHaveBeenCalled();
            expect(result).toBe(mockResponse);
        });
    });

    describe('configuración de stage', () => {
        test('debe usar stage por defecto cuando no está definido', async () => {
            delete mockProcessEnv.STAGE;
            
            const validatedData = {
                title: 'Test Book',
                author: 'Test Author',
                isbn: '1234567890',
                price: 29.99
            };

            validateCreateBookData.mockReturnValue(validatedData);
            processDateFields.mockReturnValue(validatedData);
            createBook.mockResolvedValue({});

            const mockResponse = { statusCode: 201 };
            CreateBookResponseHandler.success.mockReturnValue(mockResponse);

            await handler(mockEvent);

            expect(CreateBookResponseHandler.success).toHaveBeenCalledWith(
                expect.objectContaining({
                    stage: 'dev'
                })
            );
        });
    });
});
