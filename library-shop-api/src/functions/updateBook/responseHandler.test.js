const UpdateBookResponseHandler = require('./responseHandler');

describe('UpdateBookResponseHandler', () => {
    describe('success', () => {
        test('debe retornar respuesta exitosa con datos', () => {
            const data = {
                message: 'Book updated successfully',
                book: { id: 'test-id', title: 'Test Book' }
            };

            const response = UpdateBookResponseHandler.success(data);

            expect(response.statusCode).toBe(200);
            expect(response.headers['Content-Type']).toBe('application/json');
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            
            const body = JSON.parse(response.body);
            expect(body).toEqual(data);
        });

        test('debe retornar respuesta exitosa sin datos', () => {
            const response = UpdateBookResponseHandler.success();

            expect(response.statusCode).toBe(200);
            expect(response.headers['Content-Type']).toBe('application/json');
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            
            const body = JSON.parse(response.body);
            expect(body).toEqual({});
        });
    });

    describe('error', () => {
        test('debe retornar error con todos los parámetros', () => {
            const response = UpdateBookResponseHandler.error(400, 'Bad Request', 'Invalid data', ['field1', 'field2']);

            expect(response.statusCode).toBe(400);
            expect(response.headers['Content-Type']).toBe('application/json');
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            
            const body = JSON.parse(response.body);
            expect(body.error).toBe('Bad Request');
            expect(body.message).toBe('Invalid data');
            expect(body.details).toEqual(['field1', 'field2']);
        });

        test('debe retornar error sin detalles', () => {
            const response = UpdateBookResponseHandler.error(500, 'Internal Error', 'Something went wrong');

            expect(response.statusCode).toBe(500);
            expect(response.headers['Content-Type']).toBe('application/json');
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            
            const body = JSON.parse(response.body);
            expect(body.error).toBe('Internal Error');
            expect(body.message).toBe('Something went wrong');
            expect(body.details).toBeUndefined();
        });

        test('debe retornar error con valores por defecto', () => {
            const response = UpdateBookResponseHandler.error();

            expect(response.statusCode).toBe(500);
            expect(response.headers['Content-Type']).toBe('application/json');
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            
            const body = JSON.parse(response.body);
            expect(body.error).toBe('Internal Server Error');
            expect(body.message).toBe('An error occurred');
        });
    });

    describe('validationError', () => {
        test('debe retornar error de validación con detalles', () => {
            const details = [
                { field: 'title', message: 'Title is required' },
                { field: 'price', message: 'Price must be positive' }
            ];

            const response = UpdateBookResponseHandler.validationError(details);

            expect(response.statusCode).toBe(400);
            expect(response.headers['Content-Type']).toBe('application/json');
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            
            const body = JSON.parse(response.body);
            expect(body.error).toBe('Validation Error');
            expect(body.message).toBe('Los datos proporcionados no son válidos');
            expect(body.details).toEqual(details);
        });

        test('debe retornar error de validación sin detalles', () => {
            const response = UpdateBookResponseHandler.validationError();

            expect(response.statusCode).toBe(400);
            expect(response.headers['Content-Type']).toBe('application/json');
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            
            const body = JSON.parse(response.body);
            expect(body.error).toBe('Validation Error');
            expect(body.message).toBe('Los datos proporcionados no son válidos');
            expect(body.details).toBeUndefined();
        });
    });

    describe('methodNotAllowed', () => {
        test('debe retornar error de método no permitido', () => {
            const response = UpdateBookResponseHandler.methodNotAllowed();

            expect(response.statusCode).toBe(405);
            expect(response.headers['Content-Type']).toBe('application/json');
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            
            const body = JSON.parse(response.body);
            expect(body.error).toBe('Method Not Allowed');
            expect(body.message).toBe('Only PUT method is allowed');
        });
    });

    describe('notFound', () => {
        test('debe retornar error de recurso no encontrado', () => {
            const response = UpdateBookResponseHandler.notFound();

            expect(response.statusCode).toBe(404);
            expect(response.headers['Content-Type']).toBe('application/json');
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            
            const body = JSON.parse(response.body);
            expect(body.error).toBe('Not Found');
            expect(body.message).toBe('Book not found with the provided ID');
        });
    });

    describe('badRequest', () => {
        test('debe retornar error de solicitud incorrecta con mensaje personalizado', () => {
            const response = UpdateBookResponseHandler.badRequest('Custom error message');

            expect(response.statusCode).toBe(400);
            expect(response.headers['Content-Type']).toBe('application/json');
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            
            const body = JSON.parse(response.body);
            expect(body.error).toBe('Bad Request');
            expect(body.message).toBe('Custom error message');
        });

        test('debe retornar error de solicitud incorrecta con mensaje por defecto', () => {
            const response = UpdateBookResponseHandler.badRequest();

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
            const response = UpdateBookResponseHandler.internalServerError('Database connection failed');

            expect(response.statusCode).toBe(500);
            expect(response.headers['Content-Type']).toBe('application/json');
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            
            const body = JSON.parse(response.body);
            expect(body.error).toBe('Internal Server Error');
            expect(body.message).toBe('Database connection failed');
        });

        test('debe retornar error interno del servidor con mensaje por defecto', () => {
            const response = UpdateBookResponseHandler.internalServerError();

            expect(response.statusCode).toBe(500);
            expect(response.headers['Content-Type']).toBe('application/json');
            expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
            
            const body = JSON.parse(response.body);
            expect(body.error).toBe('Internal Server Error');
            expect(body.message).toBe('An error occurred while updating the book');
        });
    });
});
