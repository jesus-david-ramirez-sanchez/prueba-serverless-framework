// Mock de AWS SDK antes de importar el módulo
jest.mock('@aws-sdk/client-dynamodb', () => ({
    DynamoDBClient: jest.fn().mockImplementation(() => ({}))
}));

jest.mock('@aws-sdk/lib-dynamodb', () => ({
    DynamoDBDocumentClient: {
        from: jest.fn().mockReturnValue({
            send: jest.fn()
        })
    },
    GetCommand: jest.fn(),
    UpdateCommand: jest.fn()
}));

const { getBookById, updateBook } = require('./database');

describe('updateBook database functions', () => {
    let mockDocClient;
    let mockGetCommand;
    let mockUpdateCommand;

    beforeEach(() => {
        // Limpiar todos los mocks
        jest.clearAllMocks();
        
        // Obtener las instancias mockeadas
        const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
        mockDocClient = DynamoDBDocumentClient.from();
        mockGetCommand = GetCommand;
        mockUpdateCommand = UpdateCommand;
    });

    describe('getBookById', () => {
        test('debe obtener un libro existente correctamente', async () => {
            const mockBook = {
                id: 'test-id',
                title: 'Test Book',
                author: 'Test Author'
            };

            mockGetCommand.mockImplementation((params) => {
                expect(params).toEqual({
                    TableName: 'test-table',
                    Key: { id: 'test-id' }
                });
                return { command: 'get' };
            });

            mockDocClient.send.mockResolvedValue({
                Item: mockBook
            });

            const result = await getBookById('test-table', 'test-id');

            expect(mockGetCommand).toHaveBeenCalledWith({
                TableName: 'test-table',
                Key: { id: 'test-id' }
            });
            expect(mockDocClient.send).toHaveBeenCalledWith({ command: 'get' });
            expect(result).toEqual(mockBook);
        });

        test('debe retornar null cuando el libro no existe', async () => {
            mockGetCommand.mockReturnValue({ command: 'get' });
            mockDocClient.send.mockResolvedValue({
                Item: null
            });

            const result = await getBookById('test-table', 'non-existent-id');

            expect(result).toBeNull();
        });

        test('debe manejar errores de DynamoDB', async () => {
            const dbError = new Error('DynamoDB error');
            mockGetCommand.mockReturnValue({ command: 'get' });
            mockDocClient.send.mockRejectedValue(dbError);

            await expect(getBookById('test-table', 'test-id')).rejects.toThrow('DynamoDB error');
        });
    });

    describe('updateBook', () => {
        test('debe actualizar un libro correctamente con múltiples campos', async () => {
            const updateData = {
                title: 'Updated Title',
                price: 29.99,
                description: 'Updated description'
            };

            const updatedBook = {
                id: 'test-id',
                ...updateData,
                updatedAt: '2023-01-15T10:30:00.000Z'
            };

            mockUpdateCommand.mockImplementation((params) => {
                expect(params.TableName).toBe('test-table');
                expect(params.Key).toEqual({ id: 'test-id' });
                expect(params.UpdateExpression).toContain('#title = :title');
                expect(params.UpdateExpression).toContain('#price = :price');
                expect(params.UpdateExpression).toContain('#description = :description');
                expect(params.UpdateExpression).toContain('#updatedAt = :updatedAt');
                expect(params.ReturnValues).toBe('ALL_NEW');
                return { command: 'update' };
            });

            mockDocClient.send.mockResolvedValue({
                Attributes: updatedBook
            });

            const result = await updateBook('test-table', 'test-id', updateData);

            expect(mockUpdateCommand).toHaveBeenCalled();
            expect(mockDocClient.send).toHaveBeenCalledWith({ command: 'update' });
            expect(result).toEqual(updatedBook);
        });

        test('debe actualizar un libro con un solo campo', async () => {
            const updateData = {
                title: 'Single Field Update'
            };

            const updatedBook = {
                id: 'test-id',
                title: 'Single Field Update',
                updatedAt: '2023-01-15T10:30:00.000Z'
            };

            mockUpdateCommand.mockReturnValue({ command: 'update' });
            mockDocClient.send.mockResolvedValue({
                Attributes: updatedBook
            });

            const result = await updateBook('test-table', 'test-id', updateData);

            expect(mockUpdateCommand).toHaveBeenCalledWith(
                expect.objectContaining({
                    TableName: 'test-table',
                    Key: { id: 'test-id' },
                    UpdateExpression: expect.stringContaining('#title = :title'),
                    ReturnValues: 'ALL_NEW'
                })
            );
            expect(result).toEqual(updatedBook);
        });

        test('debe manejar errores de DynamoDB durante la actualización', async () => {
            const updateData = { title: 'Test' };
            const dbError = new Error('Update failed');

            mockUpdateCommand.mockReturnValue({ command: 'update' });
            mockDocClient.send.mockRejectedValue(dbError);

            await expect(updateBook('test-table', 'test-id', updateData)).rejects.toThrow('Update failed');
        });

        test('debe construir correctamente la expresión de actualización con campos especiales', async () => {
            const updateData = {
                'specialField': 'special value',
                'anotherField': 123
            };

            mockUpdateCommand.mockImplementation((params) => {
                expect(params.UpdateExpression).toContain('#specialField = :specialField');
                expect(params.UpdateExpression).toContain('#anotherField = :anotherField');
                expect(params.ExpressionAttributeNames['#specialField']).toBe('specialField');
                expect(params.ExpressionAttributeNames['#anotherField']).toBe('anotherField');
                expect(params.ExpressionAttributeValues[':specialField']).toBe('special value');
                expect(params.ExpressionAttributeValues[':anotherField']).toBe(123);
                return { command: 'update' };
            });

            mockDocClient.send.mockResolvedValue({
                Attributes: { id: 'test-id', ...updateData }
            });

            await updateBook('test-table', 'test-id', updateData);

            expect(mockUpdateCommand).toHaveBeenCalled();
        });
    });
});
