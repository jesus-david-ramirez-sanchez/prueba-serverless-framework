const { handler } = require('./index');
const { validateSearchParams } = require('./validations');
const { getAllBooks } = require('./database');
const GetAllBooksResponseHandler = require('./responseHandler');

// Mock de las dependencias
jest.mock('./validations');
jest.mock('./database');
jest.mock('./responseHandler');

describe('getAllBooks handler', () => {
    let mockEvent;
    let mockProcessEnv;

    beforeEach(() => {
        // Configurar mocks
        mockEvent = {
            httpMethod: 'GET',
            queryStringParameters: {
                limit: '10',
                offset: 'test-offset'
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
            GetAllBooksResponseHandler.methodNotAllowed.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(GetAllBooksResponseHandler.methodNotAllowed).toHaveBeenCalled();
            expect(result).toBe(mockResponse);
        });
    });

    describe('validación de variables de entorno', () => {
        test('debe retornar error cuando falta BOOKS_TABLE_NAME', async () => {
            delete mockProcessEnv.BOOKS_TABLE_NAME;
            const mockResponse = { statusCode: 500 };
            GetAllBooksResponseHandler.internalServerError.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(GetAllBooksResponseHandler.internalServerError).toHaveBeenCalled();
            expect(result).toBe(mockResponse);
        });
    });

    describe('validación de parámetros', () => {
        test('debe retornar error de validación cuando los parámetros son inválidos', async () => {
            const validationError = {
                type: 'VALIDATION_ERROR',
                details: [{ field: 'limit', message: 'Limit must be a number' }]
            };
            validateSearchParams.mockImplementation(() => {
                throw validationError;
            });

            const mockResponse = { statusCode: 400 };
            GetAllBooksResponseHandler.validationError.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(validateSearchParams).toHaveBeenCalledWith(mockEvent.queryStringParameters);
            expect(GetAllBooksResponseHandler.validationError).toHaveBeenCalledWith(validationError.details);
            expect(result).toBe(mockResponse);
        });

        test('debe manejar queryStringParameters null', async () => {
            mockEvent.queryStringParameters = null;
            const validatedParams = { limit: 10, offset: undefined };
            validateSearchParams.mockReturnValue(validatedParams);

            const mockResult = {
                items: [],
                count: 0,
                lastEvaluatedKey: null
            };
            getAllBooks.mockResolvedValue(mockResult);

            const mockResponse = { statusCode: 200 };
            GetAllBooksResponseHandler.success.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(validateSearchParams).toHaveBeenCalledWith({});
            expect(result).toBe(mockResponse);
        });
    });

    describe('obtención exitosa de libros', () => {
        test('debe obtener libros exitosamente con parámetros', async () => {
            const validatedParams = {
                limit: 10,
                offset: 'test-offset',
                author: 'Test Author'
            };

            const mockResult = {
                items: [
                    { id: '1', title: 'Book 1', author: 'Test Author' },
                    { id: '2', title: 'Book 2', author: 'Test Author' }
                ],
                count: 2,
                lastEvaluatedKey: { id: '2' }
            };

            validateSearchParams.mockReturnValue(validatedParams);
            getAllBooks.mockResolvedValue(mockResult);

            const mockResponse = { statusCode: 200 };
            GetAllBooksResponseHandler.success.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            // Verificar que se llamaron las funciones correctas
            expect(validateSearchParams).toHaveBeenCalledWith(mockEvent.queryStringParameters);
            expect(getAllBooks).toHaveBeenCalledWith('test-books-table', {
                limit: 10,
                exclusiveStartKey: { id: 'test-offset' },
                author: 'Test Author'
            });
            expect(GetAllBooksResponseHandler.success).toHaveBeenCalledWith({
                message: 'Books retrieved successfully',
                books: mockResult.items,
                totalCount: mockResult.count,
                limit: 10,
                offset: 'test-offset',
                hasMore: true,
                stage: 'test'
            });
            expect(result).toBe(mockResponse);
        });

        test('debe obtener libros sin parámetros de búsqueda', async () => {
            const validatedParams = {
                limit: 10,
                offset: undefined
            };

            const mockResult = {
                items: [
                    { id: '1', title: 'Book 1' },
                    { id: '2', title: 'Book 2' }
                ],
                count: 2,
                lastEvaluatedKey: null
            };

            validateSearchParams.mockReturnValue(validatedParams);
            getAllBooks.mockResolvedValue(mockResult);

            const mockResponse = { statusCode: 200 };
            GetAllBooksResponseHandler.success.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(getAllBooks).toHaveBeenCalledWith('test-books-table', {
                limit: 10,
                exclusiveStartKey: undefined
            });
            expect(GetAllBooksResponseHandler.success).toHaveBeenCalledWith({
                message: 'Books retrieved successfully',
                books: mockResult.items,
                totalCount: mockResult.count,
                limit: 10,
                offset: undefined,
                hasMore: false,
                stage: 'test'
            });
            expect(result).toBe(mockResponse);
        });

        test('debe manejar errores de base de datos', async () => {
            const validatedParams = {
                limit: 10,
                offset: undefined
            };

            validateSearchParams.mockReturnValue(validatedParams);
            getAllBooks.mockRejectedValue(new Error('Database error'));

            const mockResponse = { statusCode: 500 };
            GetAllBooksResponseHandler.internalServerError.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(getAllBooks).toHaveBeenCalled();
            expect(GetAllBooksResponseHandler.internalServerError).toHaveBeenCalled();
            expect(result).toBe(mockResponse);
        });
    });

    describe('filtros de búsqueda', () => {
        test('debe aplicar filtro por autor', async () => {
            const validatedParams = {
                limit: 10,
                offset: undefined,
                author: 'Test Author'
            };

            const mockResult = { items: [], count: 0, lastEvaluatedKey: null };
            validateSearchParams.mockReturnValue(validatedParams);
            getAllBooks.mockResolvedValue(mockResult);

            const mockResponse = { statusCode: 200 };
            GetAllBooksResponseHandler.success.mockReturnValue(mockResponse);

            await handler(mockEvent);

            expect(getAllBooks).toHaveBeenCalledWith('test-books-table', {
                limit: 10,
                exclusiveStartKey: undefined,
                author: 'Test Author'
            });
        });

        test('debe aplicar filtro por título cuando no hay autor', async () => {
            const validatedParams = {
                limit: 10,
                offset: undefined,
                title: 'Test Title'
            };

            const mockResult = { items: [], count: 0, lastEvaluatedKey: null };
            validateSearchParams.mockReturnValue(validatedParams);
            getAllBooks.mockResolvedValue(mockResult);

            const mockResponse = { statusCode: 200 };
            GetAllBooksResponseHandler.success.mockReturnValue(mockResponse);

            await handler(mockEvent);

            expect(getAllBooks).toHaveBeenCalledWith('test-books-table', {
                limit: 10,
                exclusiveStartKey: undefined,
                title: 'Test Title'
            });
        });

        test('debe priorizar autor sobre título', async () => {
            const validatedParams = {
                limit: 10,
                offset: undefined,
                author: 'Test Author',
                title: 'Test Title'
            };

            const mockResult = { items: [], count: 0, lastEvaluatedKey: null };
            validateSearchParams.mockReturnValue(validatedParams);
            getAllBooks.mockResolvedValue(mockResult);

            const mockResponse = { statusCode: 200 };
            GetAllBooksResponseHandler.success.mockReturnValue(mockResponse);

            await handler(mockEvent);

            expect(getAllBooks).toHaveBeenCalledWith('test-books-table', {
                limit: 10,
                exclusiveStartKey: undefined,
                author: 'Test Author'
            });
        });
    });

    describe('manejo de errores generales', () => {
        test('debe manejar errores inesperados', async () => {
            // Simular un error en la validación de variables de entorno
            delete mockProcessEnv.BOOKS_TABLE_NAME;
            
            const mockResponse = { statusCode: 500 };
            GetAllBooksResponseHandler.internalServerError.mockReturnValue(mockResponse);

            const result = await handler(mockEvent);

            expect(GetAllBooksResponseHandler.internalServerError).toHaveBeenCalled();
            expect(result).toBe(mockResponse);
        });
    });

    describe('configuración de stage', () => {
        test('debe usar stage por defecto cuando no está definido', async () => {
            delete mockProcessEnv.STAGE;
            
            const validatedParams = { limit: 10, offset: undefined };
            validateSearchParams.mockReturnValue(validatedParams);

            const mockResult = { items: [], count: 0, lastEvaluatedKey: null };
            getAllBooks.mockResolvedValue(mockResult);

            const mockResponse = { statusCode: 200 };
            GetAllBooksResponseHandler.success.mockReturnValue(mockResponse);

            await handler(mockEvent);

            expect(GetAllBooksResponseHandler.success).toHaveBeenCalledWith(
                expect.objectContaining({
                    stage: 'dev'
                })
            );
        });
    });
});
