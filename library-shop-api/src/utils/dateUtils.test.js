const { toISOString, processDateFields } = require('./dateUtils');

describe('dateUtils', () => {
    describe('toISOString', () => {
        test('debe convertir una fecha válida a string ISO', () => {
            const date = new Date('2023-01-15T10:30:00Z');
            const result = toISOString(date);
            expect(result).toBe('2023-01-15T10:30:00.000Z');
        });

        test('debe convertir un string de fecha a ISO', () => {
            const dateString = '2023-01-15T10:30:00Z';
            const result = toISOString(dateString);
            expect(result).toBe('2023-01-15T10:30:00.000Z');
        });

        test('debe retornar undefined para valores null', () => {
            const result = toISOString(null);
            expect(result).toBeUndefined();
        });

        test('debe retornar undefined para valores undefined', () => {
            const result = toISOString(undefined);
            expect(result).toBeUndefined();
        });

        test('debe retornar undefined para strings vacíos', () => {
            const result = toISOString('');
            expect(result).toBeUndefined();
        });
    });

    describe('processDateFields', () => {
        test('debe procesar campos de fecha correctamente', () => {
            const data = {
                title: 'Test Book',
                publishedDate: '2023-01-15T10:30:00Z',
                otherField: 'value'
            };
            
            const result = processDateFields(data);
            
            expect(result.title).toBe('Test Book');
            expect(result.publishedDate).toBe('2023-01-15T10:30:00.000Z');
            expect(result.otherField).toBe('value');
        });

        test('debe procesar múltiples campos de fecha', () => {
            const data = {
                title: 'Test Book',
                publishedDate: '2023-01-15T10:30:00Z',
                releaseDate: '2023-02-20T15:45:00Z'
            };
            
            const result = processDateFields(data, ['publishedDate', 'releaseDate']);
            
            expect(result.publishedDate).toBe('2023-01-15T10:30:00.000Z');
            expect(result.releaseDate).toBe('2023-02-20T15:45:00.000Z');
        });

        test('debe ignorar campos que no son fechas', () => {
            const data = {
                title: 'Test Book',
                price: 29.99,
                publishedDate: '2023-01-15T10:30:00Z'
            };
            
            const result = processDateFields(data);
            
            expect(result.title).toBe('Test Book');
            expect(result.price).toBe(29.99);
            expect(result.publishedDate).toBe('2023-01-15T10:30:00.000Z');
        });

        test('debe manejar objetos sin campos de fecha', () => {
            const data = {
                title: 'Test Book',
                author: 'Test Author',
                price: 29.99
            };
            
            const result = processDateFields(data);
            
            expect(result).toEqual(data);
        });

        test('debe manejar campos de fecha con valores null o undefined', () => {
            const data = {
                title: 'Test Book',
                publishedDate: null,
                releaseDate: undefined
            };
            
            const result = processDateFields(data, ['publishedDate', 'releaseDate']);
            
            expect(result.publishedDate).toBeNull();
            expect(result.releaseDate).toBeUndefined();
        });

        test('debe crear una copia del objeto original', () => {
            const data = {
                title: 'Test Book',
                publishedDate: '2023-01-15T10:30:00Z'
            };
            
            const result = processDateFields(data);
            
            expect(result).not.toBe(data);
            expect(result.title).toBe(data.title);
        });
    });
});
