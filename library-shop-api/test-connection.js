const { DynamoDBClient, ListTablesCommand } = require('@aws-sdk/client-dynamodb');

async function testConnection() {
    const client = new DynamoDBClient({
        endpoint: 'http://localhost:8000',
        region: 'us-east-1',
        credentials: {
            accessKeyId: 'local',
            secretAccessKey: 'local'
        }
    });

    try {
        const command = new ListTablesCommand({});
        const response = await client.send(command);
        console.log('✅ Conexión a DynamoDB Local exitosa');
        console.log('Tablas existentes:', response.TableNames);
    } catch (error) {
        console.error('❌ Error conectando a DynamoDB Local:', error.message);
    }
}

testConnection();
