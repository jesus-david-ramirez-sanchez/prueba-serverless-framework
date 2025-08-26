const { handler: createBookHandler } = require('../functions/createBook/index');
const { handler: getAllBooksHandler } = require('../functions/getAllBooks/index');
const { handler: getBookByIdHandler } = require('../functions/getBookById/index');
const { handler: updateBookHandler } = require('../functions/updateBook/index');
const { handler: deleteBookHandler } = require('../functions/deleteBook/index');

// Mock de las dependencias de base de datos
jest.mock('../functions/createBook/database', () => ({
    createBook: jest.fn()
}));

jest.mock('../functions/getAllBooks/database', () => ({
    getAllBooks: jest.fn()
}));

jest.mock('../functions/getBookById/database', () => ({
    getBookById: jest.fn()
}));

jest.mock('../functions/updateBook/database', () => ({
    updateBook: jest.fn(),
    getBookById: jest.fn()
}));

jest.mock('../functions/deleteBook/database', () => ({
    deleteBook: jest.fn(),
    getBookById: jest.fn()
}));

// Mock de las variables de entorno
const originalEnv = process.env;

describe('Books API Integration Tests (Mocked)', () => {
    beforeEach(() => {
        // Configurar variables de entorno para las pruebas
        process.env = {
            ...originalEnv,
            BOOKS_TABLE_NAME: 'test-books-table-integration',
            STAGE: 'test'
        };
    });

    afterEach(() => {
        // Restaurar variables de entorno originales
        process.env = originalEnv;
        jest.clearAllMocks();
    });

    describe('CRUD Operations Flow', () => {
        test('debe completar un flujo completo de CRUD', async () => {
            const mockBookId = 'test-uuid-123';
            const mockBook = {
                id: mockBookId,
                title: 'Integration Test Book',
                author: 'Integration Test Author',
                isbn: '1234567890123',
                price: 29.99,
                description: 'A book for integration testing',
                publishedDate: '2023-01-15',
                createdAt: '2023-01-15T10:30:00.000Z',
                updatedAt: '2023-01-15T10:30:00.000Z'
            };

            // Mock de createBook
            const { createBook } = require('../functions/createBook/database');
            createBook.mockResolvedValue(mockBook);

            // 1. Crear un libro
            const createEvent = {
                httpMethod: 'POST',
                body: JSON.stringify({
                    title: 'Integration Test Book',
                    author: 'Integration Test Author',
                    isbn: '1234567890123',
                    price: 29.99,
                    description: 'A book for integration testing',
                    publishedDate: '2023-01-15'
                })
            };

            const createResponse = await createBookHandler(createEvent);
            expect(createResponse.statusCode).toBe(201);

            const createdBook = JSON.parse(createResponse.body);
            expect(createdBook.book).toBeDefined();
            expect(createdBook.book.title).toBe('Integration Test Book');
            expect(createdBook.book.id).toBeDefined();

            // Mock de getBookById
            const { getBookById: getBookByIdDB } = require('../functions/getBookById/database');
            getBookByIdDB.mockResolvedValue(mockBook);

            // 2. Obtener el libro por ID
            const getByIdEvent = {
                httpMethod: 'GET',
                pathParameters: { id: mockBookId }
            };

            const getByIdResponse = await getBookByIdHandler(getByIdEvent);
            expect(getByIdResponse.statusCode).toBe(200);

            const retrievedBook = JSON.parse(getByIdResponse.body);
            expect(retrievedBook.book.id).toBe(mockBookId);
            expect(retrievedBook.book.title).toBe('Integration Test Book');

            // Mock de updateBook
            const { updateBook } = require('../functions/updateBook/database');
            const { getBookById: getBookByIdForUpdate } = require('../functions/updateBook/database');
            const updatedMockBook = { ...mockBook, title: 'Updated Integration Test Book', price: 39.99 };
            
            getBookByIdForUpdate.mockResolvedValue(mockBook);
            updateBook.mockResolvedValue(updatedMockBook);

            // 3. Actualizar el libro
            const updateEvent = {
                httpMethod: 'PUT',
                pathParameters: { id: mockBookId },
                body: JSON.stringify({
                    title: 'Updated Integration Test Book',
                    price: 39.99
                })
            };

            const updateResponse = await updateBookHandler(updateEvent);
            expect(updateResponse.statusCode).toBe(200);

            const updatedBook = JSON.parse(updateResponse.body);
            expect(updatedBook.book.title).toBe('Updated Integration Test Book');
            expect(updatedBook.book.price).toBe(39.99);

            // Mock de getAllBooks
            const { getAllBooks } = require('../functions/getAllBooks/database');
            getAllBooks.mockResolvedValue({
                items: [updatedMockBook],
                count: 1,
                lastEvaluatedKey: null
            });

            // 4. Obtener todos los libros (debe incluir el libro actualizado)
            const getAllEvent = {
                httpMethod: 'GET',
                queryStringParameters: {
                    limit: '10',
                    author: 'Integration Test Author'
                }
            };

            const getAllResponse = await getAllBooksHandler(getAllEvent);
            expect(getAllResponse.statusCode).toBe(200);

            const allBooks = JSON.parse(getAllResponse.body);
            expect(allBooks.books).toBeInstanceOf(Array);
            expect(allBooks.books.length).toBeGreaterThan(0);

            const foundBook = allBooks.books.find(book => book.id === mockBookId);
            expect(foundBook).toBeDefined();
            expect(foundBook.title).toBe('Updated Integration Test Book');

            // Mock de deleteBook
            const { deleteBook } = require('../functions/deleteBook/database');
            const { getBookById: getBookByIdForDelete } = require('../functions/deleteBook/database');
            
            getBookByIdForDelete.mockResolvedValue(updatedMockBook);
            deleteBook.mockResolvedValue(mockBookId);

            // 5. Eliminar el libro
            const deleteEvent = {
                httpMethod: 'DELETE',
                pathParameters: { id: mockBookId }
            };

            const deleteResponse = await deleteBookHandler(deleteEvent);
            expect(deleteResponse.statusCode).toBe(200);

            const deleteResult = JSON.parse(deleteResponse.body);
            expect(deleteResult.deletedBookId).toBe(mockBookId);

            // Mock de getBookById para libro no encontrado
            getBookByIdDB.mockResolvedValue(null);

            // 6. Verificar que el libro ya no existe
            const getDeletedEvent = {
                httpMethod: 'GET',
                pathParameters: { id: mockBookId }
            };

            const getDeletedResponse = await getBookByIdHandler(getDeletedEvent);
            expect(getDeletedResponse.statusCode).toBe(404);
        });
    });

    describe('Error Handling Integration', () => {
        test('debe manejar errores de validación en creación', async () => {
            const invalidEvent = {
                httpMethod: 'POST',
                body: JSON.stringify({
                    // Datos inválidos - falta título
                    author: 'Test Author',
                    isbn: '1234567890123',
                    price: 29.99
                })
            };

            const response = await createBookHandler(invalidEvent);
            expect(response.statusCode).toBe(400);

            const errorBody = JSON.parse(response.body);
            expect(errorBody.error).toBe('Validation Error');
            expect(errorBody.details).toBeInstanceOf(Array);
        });

        test('debe manejar errores de método no permitido', async () => {
            const invalidMethodEvent = {
                httpMethod: 'PATCH', // Método no soportado
                body: JSON.stringify({ title: 'Test Book' })
            };

            const response = await createBookHandler(invalidMethodEvent);
            expect(response.statusCode).toBe(405);

            const errorBody = JSON.parse(response.body);
            expect(errorBody.error).toBe('Method Not Allowed');
        });

        test('debe manejar errores de JSON inválido', async () => {
            const invalidJsonEvent = {
                httpMethod: 'POST',
                body: 'invalid json string'
            };

            const response = await createBookHandler(invalidJsonEvent);
            expect(response.statusCode).toBe(400);

            const errorBody = JSON.parse(response.body);
            expect(errorBody.error).toBe('Bad Request');
        });

        test('debe manejar errores de libro no encontrado', async () => {
            const { getBookById } = require('../functions/getBookById/database');
            getBookById.mockResolvedValue(null);

            const nonExistentId = 'non-existent-id';
            const event = {
                httpMethod: 'GET',
                pathParameters: { id: nonExistentId }
            };

            const response = await getBookByIdHandler(event);
            expect(response.statusCode).toBe(404);

            const errorBody = JSON.parse(response.body);
            expect(errorBody.error).toBe('Not Found');
        });

        test('debe manejar errores de actualización de libro inexistente', async () => {
            const { getBookById } = require('../functions/updateBook/database');
            getBookById.mockResolvedValue(null);

            const nonExistentId = 'non-existent-id';
            const event = {
                httpMethod: 'PUT',
                pathParameters: { id: nonExistentId },
                body: JSON.stringify({
                    title: 'Updated Title'
                })
            };

            const response = await updateBookHandler(event);
            expect(response.statusCode).toBe(404);

            const errorBody = JSON.parse(response.body);
            expect(errorBody.error).toBe('Not Found');
        });

        test('debe manejar errores de eliminación de libro inexistente', async () => {
            const { getBookById } = require('../functions/deleteBook/database');
            getBookById.mockResolvedValue(null);

            const nonExistentId = 'non-existent-id';
            const event = {
                httpMethod: 'DELETE',
                pathParameters: { id: nonExistentId }
            };

            const response = await deleteBookHandler(event);
            expect(response.statusCode).toBe(404);

            const errorBody = JSON.parse(response.body);
            expect(errorBody.error).toBe('Not Found');
        });
    });

    describe('Search and Filtering Integration', () => {
        let testBookId;

        beforeAll(async () => {
            testBookId = 'search-test-book-id';
        });

        test('debe filtrar libros por autor', async () => {
            const mockBooks = [
                {
                    id: testBookId,
                    title: 'Search Test Book',
                    author: 'Search Test Author',
                    isbn: '9876543210987',
                    price: 25.99
                }
            ];

            const { getAllBooks } = require('../functions/getAllBooks/database');
            getAllBooks.mockResolvedValue({
                items: mockBooks,
                count: 1,
                lastEvaluatedKey: null
            });

            const event = {
                httpMethod: 'GET',
                queryStringParameters: {
                    author: 'Search Test Author'
                }
            };

            const response = await getAllBooksHandler(event);
            expect(response.statusCode).toBe(200);

            const result = JSON.parse(response.body);
            expect(result.books).toBeInstanceOf(Array);
            expect(result.books.length).toBeGreaterThan(0);
            expect(result.books.every(book => book.author === 'Search Test Author')).toBe(true);
        });

        test('debe filtrar libros por título', async () => {
            const mockBooks = [
                {
                    id: testBookId,
                    title: 'Search Test Book',
                    author: 'Search Test Author',
                    isbn: '9876543210987',
                    price: 25.99
                }
            ];

            const { getAllBooks } = require('../functions/getAllBooks/database');
            getAllBooks.mockResolvedValue({
                items: mockBooks,
                count: 1,
                lastEvaluatedKey: null
            });

            const event = {
                httpMethod: 'GET',
                queryStringParameters: {
                    title: 'Search Test'
                }
            };

            const response = await getAllBooksHandler(event);
            expect(response.statusCode).toBe(200);

            const result = JSON.parse(response.body);
            expect(result.books).toBeInstanceOf(Array);
            expect(result.books.length).toBeGreaterThan(0);
            expect(result.books.every(book => book.title.includes('Search Test'))).toBe(true);
        });

        test('debe paginar resultados', async () => {
            const mockBooks = [
                {
                    id: testBookId,
                    title: 'Search Test Book',
                    author: 'Search Test Author',
                    isbn: '9876543210987',
                    price: 25.99
                }
            ];

            const { getAllBooks } = require('../functions/getAllBooks/database');
            getAllBooks.mockResolvedValue({
                items: mockBooks,
                count: 1,
                lastEvaluatedKey: null
            });

            const event = {
                httpMethod: 'GET',
                queryStringParameters: {
                    limit: '1'
                }
            };

            const response = await getAllBooksHandler(event);
            expect(response.statusCode).toBe(200);

            const result = JSON.parse(response.body);
            expect(result.books.length).toBeLessThanOrEqual(1);
            expect(result.limit).toBe(1);
        });

        test('debe manejar parámetros de búsqueda inválidos', async () => {
            const event = {
                httpMethod: 'GET',
                queryStringParameters: {
                    limit: 'invalid'
                }
            };

            const response = await getAllBooksHandler(event);
            expect(response.statusCode).toBe(400);

            const errorBody = JSON.parse(response.body);
            expect(errorBody.error).toBe('Validation Error');
        });
    });

    describe('Data Validation Integration', () => {
        test('debe validar formato de ISBN', async () => {
            const event = {
                httpMethod: 'POST',
                body: JSON.stringify({
                    title: 'Test Book',
                    author: 'Test Author',
                    isbn: 'invalid-isbn',
                    price: 29.99
                })
            };

            const response = await createBookHandler(event);
            expect(response.statusCode).toBe(400);

            const errorBody = JSON.parse(response.body);
            expect(errorBody.error).toBe('Validation Error');
        });

        test('debe validar precio positivo', async () => {
            const event = {
                httpMethod: 'POST',
                body: JSON.stringify({
                    title: 'Test Book',
                    author: 'Test Author',
                    isbn: '1234567890123',
                    price: -10
                })
            };

            const response = await createBookHandler(event);
            expect(response.statusCode).toBe(400);

            const errorBody = JSON.parse(response.body);
            expect(errorBody.error).toBe('Validation Error');
        });

        test('debe validar fecha de publicación', async () => {
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);

            const event = {
                httpMethod: 'POST',
                body: JSON.stringify({
                    title: 'Test Book',
                    author: 'Test Author',
                    isbn: '1234567890123',
                    price: 29.99,
                    publishedDate: futureDate.toISOString().split('T')[0]
                })
            };

            const response = await createBookHandler(event);
            expect(response.statusCode).toBe(400);

            const errorBody = JSON.parse(response.body);
            expect(errorBody.error).toBe('Validation Error');
        });
    });

    describe('Response Format Integration', () => {
        test('debe mantener formato consistente en todas las respuestas', async () => {
            const mockBooks = [
                {
                    id: 'test-id',
                    title: 'Test Book',
                    author: 'Test Author',
                    isbn: '1234567890123',
                    price: 29.99
                }
            ];

            const { getAllBooks } = require('../functions/getAllBooks/database');
            getAllBooks.mockResolvedValue({
                items: mockBooks,
                count: 1,
                lastEvaluatedKey: null
            });

            const event = {
                httpMethod: 'GET',
                queryStringParameters: {}
            };

            const response = await getAllBooksHandler(event);
            
            // Verificar headers consistentes
            expect(response.headers['Content-Type']).toBe('application/json');
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');

            // Verificar estructura de respuesta
            const body = JSON.parse(response.body);
            expect(body).toHaveProperty('message');
            expect(body).toHaveProperty('books');
            expect(body).toHaveProperty('totalCount');
            expect(body).toHaveProperty('stage');
        });

        test('debe incluir información de paginación', async () => {
            const mockBooks = [
                {
                    id: 'test-id',
                    title: 'Test Book',
                    author: 'Test Author',
                    isbn: '1234567890123',
                    price: 29.99
                }
            ];

            const { getAllBooks } = require('../functions/getAllBooks/database');
            getAllBooks.mockResolvedValue({
                items: mockBooks,
                count: 1,
                lastEvaluatedKey: null
            });

            const event = {
                httpMethod: 'GET',
                queryStringParameters: {
                    limit: '5'
                }
            };

            const response = await getAllBooksHandler(event);
            const body = JSON.parse(response.body);

            expect(body).toHaveProperty('limit');
            expect(body).toHaveProperty('hasMore');
            expect(typeof body.limit).toBe('number');
            expect(typeof body.hasMore).toBe('boolean');
        });
    });
});
