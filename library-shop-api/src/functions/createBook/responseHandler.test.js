const CreateBookResponseHandler = require('./responseHandler');

describe('CreateBookResponseHandler', () => {
    describe('success', () => {
        test('debe retornar respuesta exitosa con datos', () => {
            const data = { message: 'Book created', book: { id: '123' } };
            const response = CreateBookResponseHandler.success(data);

            expect(response.statusCode).toBe(201);
            expect(response.headers['Content-Type']).toBe('application/json');
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            expect(JSON.parse(response.body)).toEqual(data);
        });

        test('debe retornar respuesta exitosa sin datos', () => {
            const response = CreateBookResponseHandler.success();

            expect(response.statusCode).toBe(201);
            expect(response.headers['Content-Type']).toBe('application/json');
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            expect(JSON.parse(response.body)).toEqual({});
        });
    });

    describe('error', () => {
        test('debe retornar error con parámetros personalizados', () => {
            const response = CreateBookResponseHandler.error(400, 'Bad Request', 'Invalid data', ['detail1', 'detail2']);

            expect(response.statusCode).toBe(400);
            expect(response.headers['Content-Type']).toBe('application/json');
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            
            const body = JSON.parse(response.body);
            expect(body.error).toBe('Bad Request');
            expect(body.message).toBe('Invalid data');
            expect(body.details).toEqual(['detail1', 'detail2']);
        });

        test('debe retornar error con valores por defecto', () => {
            const response = CreateBookResponseHandler.error();

            expect(response.statusCode).toBe(500);
            expect(response.headers['Content-Type']).toBe('application/json');
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            
            const body = JSON.parse(response.body);
            expect(body.error).toBe('Internal Server Error');
            expect(body.message).toBe('An error occurred');
            expect(body.details).toBeUndefined();
        });

        test('debe retornar error sin detalles', () => {
            const response = CreateBookResponseHandler.error(404, 'Not Found', 'Resource not found');

            expect(response.statusCode).toBe(404);
            
            const body = JSON.parse(response.body);
            expect(body.error).toBe('Not Found');
            expect(body.message).toBe('Resource not found');
            expect(body.details).toBeUndefined();
        });
    });

    describe('validationError', () => {
        test('debe retornar error de validación', () => {
            const details = [
                { field: 'title', message: 'Title is required' },
                { field: 'price', message: 'Price must be positive' }
            ];
            
            const response = CreateBookResponseHandler.validationError(details);

            expect(response.statusCode).toBe(400);
            expect(response.headers['Content-Type']).toBe('application/json');
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            
            const body = JSON.parse(response.body);
            expect(body.error).toBe('Validation Error');
            expect(body.message).toBe('Los datos proporcionados no son válidos');
            expect(body.details).toEqual(details);
        });
    });

    describe('methodNotAllowed', () => {
        test('debe retornar error de método no permitido', () => {
            const response = CreateBookResponseHandler.methodNotAllowed();

            expect(response.statusCode).toBe(405);
            expect(response.headers['Content-Type']).toBe('application/json');
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            
            const body = JSON.parse(response.body);
            expect(body.error).toBe('Method Not Allowed');
            expect(body.message).toBe('Only POST method is allowed');
        });
    });

    describe('badRequest', () => {
        test('debe retornar error de solicitud incorrecta con mensaje personalizado', () => {
            const response = CreateBookResponseHandler.badRequest('Custom error message');

            expect(response.statusCode).toBe(400);
            expect(response.headers['Content-Type']).toBe('application/json');
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            
            const body = JSON.parse(response.body);
            expect(body.error).toBe('Bad Request');
            expect(body.message).toBe('Custom error message');
        });

        test('debe retornar error de solicitud incorrecta con mensaje por defecto', () => {
            const response = CreateBookResponseHandler.badRequest();

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
            const response = CreateBookResponseHandler.internalServerError('Database connection failed');

            expect(response.statusCode).toBe(500);
            expect(response.headers['Content-Type']).toBe('application/json');
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            
            const body = JSON.parse(response.body);
            expect(body.error).toBe('Internal Server Error');
            expect(body.message).toBe('Database connection failed');
        });

        test('debe retornar error interno del servidor con mensaje por defecto', () => {
            const response = CreateBookResponseHandler.internalServerError();

            expect(response.statusCode).toBe(500);
            expect(response.headers['Content-Type']).toBe('application/json');
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            
            const body = JSON.parse(response.body);
            expect(body.error).toBe('Internal Server Error');
            expect(body.message).toBe('An error occurred while creating the book');
        });
    });

    describe('headers consistency', () => {
        test('todas las respuestas deben tener headers consistentes', () => {
            const methods = [
                () => CreateBookResponseHandler.success(),
                () => CreateBookResponseHandler.error(),
                () => CreateBookResponseHandler.validationError([]),
                () => CreateBookResponseHandler.methodNotAllowed(),
                () => CreateBookResponseHandler.badRequest(),
                () => CreateBookResponseHandler.internalServerError()
            ];

            methods.forEach(method => {
                const response = method();
                expect(response.headers['Content-Type']).toBe('application/json');
                expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            });
        });
    });
});
