import { handler } from '../lambda/getProductsById';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayEvent } from '../lambda/types';

// Mock console.error to prevent test output pollution
console.error = jest.fn();

// Mock the DynamoDB Document Client
const ddbMock = mockClient(DynamoDBDocumentClient);

describe('getProductsById Lambda', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        ddbMock.reset();
        process.env.PRODUCTS_TABLE_NAME = 'test-products-table';
        process.env.STOCKS_TABLE_NAME = 'test-stocks-table';
        process.env.REGION = 'us-east-1';
    });

    it('should return a product with stock when valid ID is provided', async () => {
        // Mock DynamoDB responses
        ddbMock.on(GetCommand, {
            TableName: 'test-products-table',
            Key: { id: '1' }
        }).resolves({
            Item: { id: '1', title: 'Product 1', description: 'Description 1', price: 100 }
        });

        ddbMock.on(GetCommand, {
            TableName: 'test-stocks-table',
            Key: { product_id: '1' }
        }).resolves({
            Item: { product_id: '1', count: 10 }
        });

        const event = {
            pathParameters: {
                productId: '1'
            }
        } as APIGatewayEvent;

        const response = await handler(event);

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body).toEqual({
            id: '1',
            title: 'Product 1',
            description: 'Description 1',
            price: 100,
            count: 10
        });
    });

    it('should return a product with count 0 when no stock exists', async () => {
        // Mock DynamoDB responses
        ddbMock.on(GetCommand, {
            TableName: 'test-products-table',
            Key: { id: '1' }
        }).resolves({
            Item: { id: '1', title: 'Product 1', description: 'Description 1', price: 100 }
        });

        ddbMock.on(GetCommand, {
            TableName: 'test-stocks-table',
            Key: { product_id: '1' }
        }).resolves({});

        const event = {
            pathParameters: {
                productId: '1'
            }
        } as APIGatewayEvent;

        const response = await handler(event);

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body).toEqual({
            id: '1',
            title: 'Product 1',
            description: 'Description 1',
            price: 100,
            count: 0
        });
    });

    it('should return 400 when product ID is missing', async () => {
        const event = {
            pathParameters: {}
        } as APIGatewayEvent;

        const response = await handler(event);

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body)).toEqual({ message: 'Product ID is required' });
    });

    it('should return 404 when product is not found', async () => {
        // Mock DynamoDB responses
        ddbMock.on(GetCommand, {
            TableName: 'test-products-table',
            Key: { id: 'non-existent-id' }
        }).resolves({});

        const event = {
            pathParameters: {
                productId: 'non-existent-id'
            }
        } as APIGatewayEvent;

        const response = await handler(event);

        expect(response.statusCode).toBe(404);
        expect(JSON.parse(response.body)).toEqual({ message: 'Product not found' });
    });

    it('should return 500 when DynamoDB operation fails', async () => {
        // Mock DynamoDB error
        ddbMock.on(GetCommand).rejects(new Error('DynamoDB error'));

        const event = {
            pathParameters: {
                productId: '1'
            }
        } as APIGatewayEvent;

        const response = await handler(event);

        expect(response.statusCode).toBe(500);
        expect(JSON.parse(response.body)).toEqual({ message: 'Internal server error' });
    });

    it('should handle null pathParameters gracefully', async () => {
        const event = {} as APIGatewayEvent;

        const response = await handler(event);

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body)).toEqual({ message: 'Product ID is required' });
    });
});
