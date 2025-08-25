const GetAllBooksResponseHandler = require('./responseHandler');

describe('GetAllBooksResponseHandler', () => {
    describe('success', () => {
        test('debe retornar respuesta exitosa con datos', () => {
            const data = {
                message: 'Books retrieved successfully',
                books: [
                    { id: '1', title: 'Book 1' },
                    { id: '2', title: 'Book 2' }
                ],
                totalCount: 2,
                limit: 10,
                offset: undefined,
                hasMore: false,
                stage: 'test'
            };
            const response = GetAllBooksResponseHandler.success(data);

            expect(response.statusCode).toBe(200);
            expect(response.headers['Content-Type']).toBe('application/json');
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            expect(JSON.parse(response.body)).toEqual(data);
        });

        test('debe retornar respuesta exitosa sin datos', () => {
            const response = GetAllBooksResponseHandler.success();

            expect(response.statusCode).toBe(200);
            expect(response.headers['Content-Type']).toBe('application/json');
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            expect(JSON.parse(response.body)).toEqual({});
        });

        test('debe retornar respuesta exitosa con paginación', () => {
            const data = {
                message: 'Books retrieved successfully',
                books: [{ id: '1', title: 'Book 1' }],
                totalCount: 1,
                limit: 1,
                offset: 'test-offset',
                hasMore: true,
                stage: 'test'
            };
            const response = GetAllBooksResponseHandler.success(data);

            expect(response.statusCode).toBe(200);
            expect(JSON.parse(response.body)).toEqual(data);
        });
    });

    describe('error', () => {
        test('debe retornar error con parámetros personalizados', () => {
            const response = GetAllBooksResponseHandler.error(400, 'Bad Request', 'Invalid parameters', ['detail1', 'detail2']);

            expect(response.statusCode).toBe(400);
            expect(response.headers['Content-Type']).toBe('application/json');
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            
            const body = JSON.parse(response.body);
            expect(body.error).toBe('Bad Request');
            expect(body.message).toBe('Invalid parameters');
            expect(body.details).toEqual(['detail1', 'detail2']);
        });

        test('debe retornar error con valores por defecto', () => {
            const response = GetAllBooksResponseHandler.error();

            expect(response.statusCode).toBe(500);
            expect(response.headers['Content-Type']).toBe('application/json');
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            
            const body = JSON.parse(response.body);
            expect(body.error).toBe('Internal Server Error');
            expect(body.message).toBe('An error occurred');
            expect(body.details).toBeUndefined();
        });

        test('debe retornar error sin detalles', () => {
            const response = GetAllBooksResponseHandler.error(404, 'Not Found', 'No books found');

            expect(response.statusCode).toBe(404);
            
            const body = JSON.parse(response.body);
            expect(body.error).toBe('Not Found');
            expect(body.message).toBe('No books found');
            expect(body.details).toBeUndefined();
        });
    });

    describe('validationError', () => {
        test('debe retornar error de validación', () => {
            const details = [
                { field: 'limit', message: 'Limit must be a number' },
                { field: 'offset', message: 'Invalid offset format' }
            ];
            
            const response = GetAllBooksResponseHandler.validationError(details);

            expect(response.statusCode).toBe(400);
            expect(response.headers['Content-Type']).toBe('application/json');
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            
            const body = JSON.parse(response.body);
            expect(body.error).toBe('Validation Error');
            expect(body.message).toBe('Los parámetros de búsqueda no son válidos');
            expect(body.details).toEqual(details);
        });

        test('debe retornar error de validación sin detalles', () => {
            const response = GetAllBooksResponseHandler.validationError();

            expect(response.statusCode).toBe(400);
            
            const body = JSON.parse(response.body);
            expect(body.error).toBe('Validation Error');
            expect(body.message).toBe('Los parámetros de búsqueda no son válidos');
            expect(body.details).toBeUndefined();
        });
    });

    describe('methodNotAllowed', () => {
        test('debe retornar error de método no permitido', () => {
            const response = GetAllBooksResponseHandler.methodNotAllowed();

            expect(response.statusCode).toBe(405);
            expect(response.headers['Content-Type']).toBe('application/json');
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            
            const body = JSON.parse(response.body);
            expect(body.error).toBe('Method Not Allowed');
            expect(body.message).toBe('Only GET method is allowed');
        });
    });

    describe('error method', () => {
        test('debe retornar error de solicitud incorrecta con mensaje personalizado', () => {
            const response = GetAllBooksResponseHandler.error(400, 'Bad Request', 'Custom error message');

            expect(response.statusCode).toBe(400);
            expect(response.headers['Content-Type']).toBe('application/json');
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            
            const body = JSON.parse(response.body);
            expect(body.error).toBe('Bad Request');
            expect(body.message).toBe('Custom error message');
        });

        test('debe retornar error de solicitud incorrecta con mensaje por defecto', () => {
            const response = GetAllBooksResponseHandler.error(400, 'Bad Request', 'Bad Request');

            expect(response.statusCode).toBe(400);
            expect(response.headers['Content-Type']).toBe('application/json');
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            
            const body = JSON.parse(response.body);
            expect(body.error).toBe('Bad Request');
            expect(body.message).toBe('Bad Request');
        });
    });

    describe('internalServerError', () => {
        test('debe retornar error interno del servidor con mensaje personalizado', () => {
            const response = GetAllBooksResponseHandler.internalServerError('Database connection failed');

            expect(response.statusCode).toBe(500);
            expect(response.headers['Content-Type']).toBe('application/json');
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            
            const body = JSON.parse(response.body);
            expect(body.error).toBe('Internal Server Error');
            expect(body.message).toBe('Database connection failed');
        });

        test('debe retornar error interno del servidor con mensaje por defecto', () => {
            const response = GetAllBooksResponseHandler.internalServerError();

            expect(response.statusCode).toBe(500);
            expect(response.headers['Content-Type']).toBe('application/json');
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            
            const body = JSON.parse(response.body);
            expect(body.error).toBe('Internal Server Error');
            expect(body.message).toBe('An error occurred while retrieving books');
        });
    });

    describe('headers consistency', () => {
        test('todas las respuestas deben tener headers consistentes', () => {
            const methods = [
                () => GetAllBooksResponseHandler.success(),
                () => GetAllBooksResponseHandler.error(),
                () => GetAllBooksResponseHandler.validationError([]),
                () => GetAllBooksResponseHandler.methodNotAllowed(),
                () => GetAllBooksResponseHandler.error(400, 'Bad Request'),
                () => GetAllBooksResponseHandler.internalServerError()
            ];

            methods.forEach(method => {
                const response = method();
                expect(response.headers['Content-Type']).toBe('application/json');
                expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            });
        });
    });

    describe('edge cases', () => {
        test('debe manejar datos con caracteres especiales', () => {
            const data = {
                message: 'Books retrieved successfully',
                books: [
                    { id: '1', title: 'Book with "quotes" and \'apostrophes\'' },
                    { id: '2', title: 'Book with émojis 🚀' }
                ],
                totalCount: 2
            };
            const response = GetAllBooksResponseHandler.success(data);

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.books[0].title).toBe('Book with "quotes" and \'apostrophes\'');
            expect(body.books[1].title).toBe('Book with émojis 🚀');
        });

        test('debe manejar arrays vacíos', () => {
            const data = {
                message: 'Books retrieved successfully',
                books: [],
                totalCount: 0,
                hasMore: false
            };
            const response = GetAllBooksResponseHandler.success(data);

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.books).toEqual([]);
            expect(body.totalCount).toBe(0);
            expect(body.hasMore).toBe(false);
        });

        test('debe manejar números grandes', () => {
            const data = {
                message: 'Books retrieved successfully',
                books: [{ id: '1', title: 'Book 1' }],
                totalCount: 999999999,
                limit: 1000000
            };
            const response = GetAllBooksResponseHandler.success(data);

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.body);
            expect(body.totalCount).toBe(999999999);
            expect(body.limit).toBe(1000000);
        });
    });
});
