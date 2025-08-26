const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');

// Configuración del cliente DynamoDB
const dynamoConfig = {};

// Si estamos en desarrollo local, usar DynamoDB Local
if (process.env.NODE_ENV === 'development' || process.env.DYNAMODB_ENDPOINT) {
    dynamoConfig.endpoint = process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000';
    dynamoConfig.region = 'us-east-1';
    dynamoConfig.credentials = {
        accessKeyId: 'local',
        secretAccessKey: 'local'
    };
}

const client = new DynamoDBClient(dynamoConfig);

module.exports = { client };
