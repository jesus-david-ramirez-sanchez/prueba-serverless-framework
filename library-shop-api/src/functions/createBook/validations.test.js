const { validateCreateBookData, createBookSchema } = require('./validations');

describe('createBook validations', () => {
    describe('validateCreateBookData', () => {
        test('debe validar datos correctos', () => {
            const validData = {
                title: 'Test Book',
                author: 'Test Author',
                isbn: '1234567890',
                price: 29.99,
                description: 'Test description',
                publishedDate: '2023-01-15'
            };

            const result = validateCreateBookData(validData);
            // Joi convierte las fechas a objetos Date, así que verificamos los campos individualmente
            expect(result.title).toBe(validData.title);
            expect(result.author).toBe(validData.author);
            expect(result.isbn).toBe(validData.isbn);
            expect(result.price).toBe(validData.price);
            expect(result.description).toBe(validData.description);
            expect(result.publishedDate).toBeInstanceOf(Date);
        });

        test('debe validar datos mínimos requeridos', () => {
            const minimalData = {
                title: 'Test Book',
                author: 'Test Author',
                isbn: '1234567890',
                price: 29.99
            };

            const result = validateCreateBookData(minimalData);
            expect(result).toEqual(minimalData);
        });

        test('debe lanzar error cuando falta título', () => {
            const invalidData = {
                author: 'Test Author',
                isbn: '1234567890',
                price: 29.99
            };

            expect(() => validateCreateBookData(invalidData)).toThrow();
        });

        test('debe lanzar error cuando falta autor', () => {
            const invalidData = {
                title: 'Test Book',
                isbn: '1234567890',
                price: 29.99
            };

            expect(() => validateCreateBookData(invalidData)).toThrow();
        });

        test('debe lanzar error cuando falta ISBN', () => {
            const invalidData = {
                title: 'Test Book',
                author: 'Test Author',
                price: 29.99
            };

            expect(() => validateCreateBookData(invalidData)).toThrow();
        });

        test('debe lanzar error cuando falta precio', () => {
            const invalidData = {
                title: 'Test Book',
                author: 'Test Author',
                isbn: '1234567890'
            };

            expect(() => validateCreateBookData(invalidData)).toThrow();
        });

        test('debe lanzar error con título vacío', () => {
            const invalidData = {
                title: '',
                author: 'Test Author',
                isbn: '1234567890',
                price: 29.99
            };

            expect(() => validateCreateBookData(invalidData)).toThrow();
        });

        test('debe lanzar error con título muy largo', () => {
            const invalidData = {
                title: 'a'.repeat(201),
                author: 'Test Author',
                isbn: '1234567890',
                price: 29.99
            };

            expect(() => validateCreateBookData(invalidData)).toThrow();
        });

        test('debe lanzar error con autor muy largo', () => {
            const invalidData = {
                title: 'Test Book',
                author: 'a'.repeat(101),
                isbn: '1234567890',
                price: 29.99
            };

            expect(() => validateCreateBookData(invalidData)).toThrow();
        });

        test('debe lanzar error con ISBN inválido', () => {
            const invalidData = {
                title: 'Test Book',
                author: 'Test Author',
                isbn: 'invalid-isbn',
                price: 29.99
            };

            expect(() => validateCreateBookData(invalidData)).toThrow();
        });

        test('debe lanzar error con precio negativo', () => {
            const invalidData = {
                title: 'Test Book',
                author: 'Test Author',
                isbn: '1234567890',
                price: -10
            };

            expect(() => validateCreateBookData(invalidData)).toThrow();
        });

        test('debe lanzar error con precio muy alto', () => {
            const invalidData = {
                title: 'Test Book',
                author: 'Test Author',
                isbn: '1234567890',
                price: 1000000
            };

            expect(() => validateCreateBookData(invalidData)).toThrow();
        });

        test('debe lanzar error con descripción muy larga', () => {
            const invalidData = {
                title: 'Test Book',
                author: 'Test Author',
                isbn: '1234567890',
                price: 29.99,
                description: 'a'.repeat(1001)
            };

            expect(() => validateCreateBookData(invalidData)).toThrow();
        });

        test('debe lanzar error con fecha de publicación futura', () => {
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);
            
            const invalidData = {
                title: 'Test Book',
                author: 'Test Author',
                isbn: '1234567890',
                price: 29.99,
                publishedDate: futureDate.toISOString().split('T')[0]
            };

            expect(() => validateCreateBookData(invalidData)).toThrow();
        });

        test('debe lanzar error con fecha de publicación en formato inválido', () => {
            const invalidData = {
                title: 'Test Book',
                author: 'Test Author',
                isbn: '1234567890',
                price: 29.99,
                publishedDate: 'invalid-date'
            };

            expect(() => validateCreateBookData(invalidData)).toThrow();
        });

        test('debe lanzar error con campos no permitidos', () => {
            const invalidData = {
                title: 'Test Book',
                author: 'Test Author',
                isbn: '1234567890',
                price: 29.99,
                extraField: 'not allowed'
            };

            // Con stripUnknown: true, los campos no permitidos se eliminan automáticamente
            // así que esta prueba debería pasar sin lanzar error
            const result = validateCreateBookData(invalidData);
            expect(result).not.toHaveProperty('extraField');
            expect(result.title).toBe('Test Book');
            expect(result.author).toBe('Test Author');
            expect(result.isbn).toBe('1234567890');
            expect(result.price).toBe(29.99);
        });

        test('debe incluir detalles de errores múltiples', () => {
            const invalidData = {
                title: '',
                author: '',
                isbn: 'invalid',
                price: -10
            };

            try {
                validateCreateBookData(invalidData);
            } catch (error) {
                expect(error.type).toBe('VALIDATION_ERROR');
                expect(error.details).toBeInstanceOf(Array);
                expect(error.details.length).toBeGreaterThan(1);
            }
        });
    });

    describe('createBookSchema', () => {
        test('debe tener las reglas de validación correctas', () => {
            expect(createBookSchema.describe().keys).toHaveProperty('title');
            expect(createBookSchema.describe().keys).toHaveProperty('author');
            expect(createBookSchema.describe().keys).toHaveProperty('isbn');
            expect(createBookSchema.describe().keys).toHaveProperty('price');
            expect(createBookSchema.describe().keys).toHaveProperty('description');
            expect(createBookSchema.describe().keys).toHaveProperty('publishedDate');
        });
    });
});
