const { validateUpdateBookData, validateBookId, updateBookSchema, bookIdSchema } = require('./validations');

describe('updateBook validations', () => {
    describe('validateBookId', () => {
        test('debe validar ID válido', () => {
            const validId = 'test-book-id-123';
            const result = validateBookId(validId);
            expect(result).toBe(validId);
        });

        test('debe lanzar error con ID vacío', () => {
            expect(() => validateBookId('')).toThrow();
        });

        test('debe lanzar error con ID undefined', () => {
            expect(() => validateBookId(undefined)).toThrow();
        });

        test('debe lanzar error con ID null', () => {
            expect(() => validateBookId(null)).toThrow();
        });

        test('debe lanzar error con ID que no es string', () => {
            expect(() => validateBookId(123)).toThrow();
        });
    });

    describe('validateUpdateBookData', () => {
        test('debe validar datos correctos con todos los campos', () => {
            const validData = {
                title: 'Updated Book Title',
                author: 'Updated Author',
                isbn: '1234567890',
                price: 29.99,
                description: 'Updated description',
                publishedDate: '2023-01-15'
            };

            const result = validateUpdateBookData(validData);

            expect(result.title).toBe('Updated Book Title');
            expect(result.author).toBe('Updated Author');
            expect(result.isbn).toBe('1234567890');
            expect(result.price).toBe(29.99);
            expect(result.description).toBe('Updated description');
            expect(result.publishedDate).toBeInstanceOf(Date);
        });

        test('debe validar datos con solo algunos campos', () => {
            const partialData = {
                title: 'Updated Title',
                price: 39.99
            };

            const result = validateUpdateBookData(partialData);

            expect(result.title).toBe('Updated Title');
            expect(result.price).toBe(39.99);
            expect(result.author).toBeUndefined();
            expect(result.isbn).toBeUndefined();
        });

        test('debe lanzar error con objeto vacío', () => {
            expect(() => validateUpdateBookData({})).toThrow();
        });

        test('debe lanzar error con título vacío', () => {
            const invalidData = { title: '' };
            expect(() => validateUpdateBookData(invalidData)).toThrow();
        });

        test('debe lanzar error con título muy largo', () => {
            const invalidData = { title: 'a'.repeat(201) };
            expect(() => validateUpdateBookData(invalidData)).toThrow();
        });

        test('debe lanzar error con autor vacío', () => {
            const invalidData = { author: '' };
            expect(() => validateUpdateBookData(invalidData)).toThrow();
        });

        test('debe lanzar error con autor muy largo', () => {
            const invalidData = { author: 'a'.repeat(101) };
            expect(() => validateUpdateBookData(invalidData)).toThrow();
        });

        test('debe lanzar error con ISBN inválido', () => {
            const invalidData = { isbn: 'invalid-isbn' };
            expect(() => validateUpdateBookData(invalidData)).toThrow();
        });

        test('debe lanzar error con ISBN muy corto', () => {
            const invalidData = { isbn: '123' };
            expect(() => validateUpdateBookData(invalidData)).toThrow();
        });

        test('debe lanzar error con ISBN muy largo', () => {
            const invalidData = { isbn: '123456789012345678' };
            expect(() => validateUpdateBookData(invalidData)).toThrow();
        });

        test('debe lanzar error con precio negativo', () => {
            const invalidData = { price: -10 };
            expect(() => validateUpdateBookData(invalidData)).toThrow();
        });

        test('debe lanzar error con precio cero', () => {
            const invalidData = { price: 0 };
            expect(() => validateUpdateBookData(invalidData)).toThrow();
        });

        test('debe lanzar error con precio muy alto', () => {
            const invalidData = { price: 1000000 };
            expect(() => validateUpdateBookData(invalidData)).toThrow();
        });

        test('debe validar precio con exactamente 2 decimales', () => {
            const validData = { price: 29.99 };
            const result = validateUpdateBookData(validData);
            expect(result.price).toBe(29.99);
        });

        test('debe lanzar error con descripción muy larga', () => {
            const invalidData = { description: 'a'.repeat(1001) };
            expect(() => validateUpdateBookData(invalidData)).toThrow();
        });

        test('debe lanzar error con fecha futura', () => {
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);
            const invalidData = { publishedDate: futureDate.toISOString().split('T')[0] };
            expect(() => validateUpdateBookData(invalidData)).toThrow();
        });

        test('debe lanzar error con fecha inválida', () => {
            const invalidData = { publishedDate: 'invalid-date' };
            expect(() => validateUpdateBookData(invalidData)).toThrow();
        });

        test('debe lanzar error con múltiples campos inválidos', () => {
            const invalidData = {
                title: '',
                price: -10,
                isbn: 'invalid'
            };
            
            expect(() => validateUpdateBookData(invalidData)).toThrow();
        });

        test('debe validar ISBN con guiones', () => {
            const validData = { isbn: '123-456-789-0' };
            const result = validateUpdateBookData(validData);
            expect(result.isbn).toBe('123-456-789-0');
        });

        test('debe validar precio con exactamente 2 decimales', () => {
            const validData = { price: 29.99 };
            const result = validateUpdateBookData(validData);
            expect(result.price).toBe(29.99);
        });

        test('debe validar fecha en formato ISO', () => {
            const validData = { publishedDate: '2023-01-15' };
            const result = validateUpdateBookData(validData);
            expect(result.publishedDate).toBeInstanceOf(Date);
        });

        test('debe validar descripción opcional', () => {
            const validData = { title: 'Test Book', description: 'Test description' };
            const result = validateUpdateBookData(validData);
            expect(result.description).toBe('Test description');
        });

        test('debe validar campos opcionales como undefined', () => {
            const validData = { title: 'Test Book' };
            const result = validateUpdateBookData(validData);
            expect(result.author).toBeUndefined();
            expect(result.isbn).toBeUndefined();
            expect(result.price).toBeUndefined();
            expect(result.description).toBeUndefined();
            expect(result.publishedDate).toBeUndefined();
        });
    });

    describe('updateBookSchema', () => {
        test('debe validar esquema con campos opcionales', () => {
            const { error, value } = updateBookSchema.validate({
                title: 'Test Book',
                author: 'Test Author'
            });

            expect(error).toBeUndefined();
            expect(value.title).toBe('Test Book');
            expect(value.author).toBe('Test Author');
        });

        test('debe validar esquema con al menos un campo', () => {
            const { error, value } = updateBookSchema.validate({
                title: 'Test Book'
            });

            expect(error).toBeUndefined();
            expect(value.title).toBe('Test Book');
        });

        test('debe rechazar esquema sin campos', () => {
            const { error } = updateBookSchema.validate({});

            expect(error).toBeDefined();
            expect(error.details[0].message).toContain('Debe proporcionar al menos un campo');
        });

        test('debe validar campos con stripUnknown', () => {
            const { error, value } = updateBookSchema.validate({
                title: 'Test Book',
                unknownField: 'should be stripped'
            }, { stripUnknown: true });

            expect(error).toBeUndefined();
            expect(value.title).toBe('Test Book');
            expect(value.unknownField).toBeUndefined();
        });
    });

    describe('bookIdSchema', () => {
        test('debe validar ID válido', () => {
            const { error, value } = bookIdSchema.validate('test-id-123');
            expect(error).toBeUndefined();
            expect(value).toBe('test-id-123');
        });

        test('debe rechazar ID vacío', () => {
            const { error } = bookIdSchema.validate('');
            expect(error).toBeDefined();
            expect(error.details[0].message).toBe('El ID del libro es requerido');
        });

        test('debe rechazar ID undefined', () => {
            const { error } = bookIdSchema.validate(undefined);
            expect(error).toBeDefined();
            expect(error.details[0].message).toBe('El ID del libro es requerido');
        });
    });
});
