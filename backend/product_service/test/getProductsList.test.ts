import { handler } from '../lambda/getProductsList';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

// Mock console.error to prevent test output pollution
console.error = jest.fn();

// Mock the DynamoDB Document Client
const ddbMock = mockClient(DynamoDBDocumentClient);

describe('getProductsList Lambda', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        ddbMock.reset();
        process.env.PRODUCTS_TABLE_NAME = 'test-products-table';
        process.env.STOCKS_TABLE_NAME = 'test-stocks-table';
        process.env.REGION = 'us-east-1';
    });

    it('should return products with stock information', async () => {
        // Mock DynamoDB responses
        ddbMock.on(ScanCommand, { TableName: 'test-products-table' }).resolves({
            Items: [
                { id: '1', title: 'Product 1', description: 'Description 1', price: 100 },
                { id: '2', title: 'Product 2', description: 'Description 2', price: 200 }
            ]
        });

        ddbMock.on(ScanCommand, { TableName: 'test-stocks-table' }).resolves({
            Items: [
                { product_id: '1', count: 10 },
                { product_id: '2', count: 20 }
            ]
        });

        const response = await handler();

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body).toEqual([
            { id: '1', title: 'Product 1', description: 'Description 1', price: 100, count: 10 },
            { id: '2', title: 'Product 2', description: 'Description 2', price: 200, count: 20 }
        ]);
    });

    it('should handle products with no stock information', async () => {
        // Mock DynamoDB responses
        ddbMock.on(ScanCommand, { TableName: 'test-products-table' }).resolves({
            Items: [
                { id: '1', title: 'Product 1', description: 'Description 1', price: 100 }
            ]
        });

        ddbMock.on(ScanCommand, { TableName: 'test-stocks-table' }).resolves({
            Items: []
        });

        const response = await handler();

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body).toEqual([
            { id: '1', title: 'Product 1', description: 'Description 1', price: 100, count: 0 }
        ]);
    });

    it('should return empty array when no products exist', async () => {
        // Mock DynamoDB responses
        ddbMock.on(ScanCommand, { TableName: 'test-products-table' }).resolves({
            Items: []
        });

        ddbMock.on(ScanCommand, { TableName: 'test-stocks-table' }).resolves({
            Items: []
        });

        const response = await handler();

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body).toEqual([]);
    });

    it('should return 500 when DynamoDB operation fails', async () => {
        // Mock DynamoDB error
        ddbMock.on(ScanCommand).rejects(new Error('DynamoDB error'));

        const response = await handler();

        expect(response.statusCode).toBe(500);
        const body = JSON.parse(response.body);
        expect(body).toEqual({ message: 'Internal server error' });
    });
});
