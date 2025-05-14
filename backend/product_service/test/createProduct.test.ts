import { handler } from '../lambda/createProduct';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

// Mock the UUID generation to return a predictable value
jest.mock('crypto', () => ({
    randomUUID: jest.fn().mockReturnValue('test-uuid-123')
}));

// Mock the DynamoDB Document Client
const ddbMock = mockClient(DynamoDBDocumentClient);

describe('createProduct Lambda', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        ddbMock.reset();
        process.env.PRODUCTS_TABLE_NAME = 'test-products-table';
        process.env.STOCKS_TABLE_NAME = 'test-stocks-table';
        process.env.REGION = 'us-east-1';
    });

    it('should create a product with all fields', async () => {
        // Mock successful DynamoDB put operations
        ddbMock.on(PutCommand).resolves({});

        // Create test event with all fields
        const event = {
            body: JSON.stringify({
                title: 'Test Product',
                description: 'This is a test product',
                price: 1999,
                count: 10
            })
        };

        // Call the handler
        const response = await handler(event as any);

        // Verify response
        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.body);
        expect(body).toEqual({
            id: 'test-uuid-123',
            title: 'Test Product',
            description: 'This is a test product',
            price: 1999,
            count: 10
        });

        // Verify DynamoDB calls
        expect(ddbMock.calls()).toHaveLength(2);

        // Verify Products table call
        const productCall = ddbMock.calls()[0];
        expect(productCall.args[0].input).toEqual({
            TableName: 'test-products-table',
            Item: {
                id: 'test-uuid-123',
                title: 'Test Product',
                description: 'This is a test product',
                price: 1999
            }
        });

        // Verify Stocks table call
        const stockCall = ddbMock.calls()[1];
        expect(stockCall.args[0].input).toEqual({
            TableName: 'test-stocks-table',
            Item: {
                product_id: 'test-uuid-123',
                count: 10
            }
        });
    });

    it('should create a product with minimal required fields', async () => {
        // Mock successful DynamoDB put operation
        ddbMock.on(PutCommand).resolves({});

        // Create test event with only required fields
        const event = {
            body: JSON.stringify({
                title: 'Minimal Product',
                price: 999
            })
        };

        // Call the handler
        const response = await handler(event as any);

        // Verify response
        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.body);
        expect(body).toEqual({
            id: 'test-uuid-123',
            title: 'Minimal Product',
            description: '',
            price: 999,
            count: 0
        });

        // Verify only one DynamoDB call (to Products table)
        expect(ddbMock.calls()).toHaveLength(1);
    });

    it('should return 400 when title is missing', async () => {
        const event = {
            body: JSON.stringify({
                price: 999
            })
        };

        const response = await handler(event as any);

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body.message).toContain('title');
    });

    it('should return 400 when price is missing', async () => {
        const event = {
            body: JSON.stringify({
                title: 'No Price Product'
            })
        };

        const response = await handler(event as any);

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body.message).toContain('price');
    });

    it('should return 400 when price is not a number', async () => {
        const event = {
            body: JSON.stringify({
                title: 'Invalid Price Product',
                price: 'not-a-number'
            })
        };

        const response = await handler(event as any);

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body.message).toContain('price');
    });

    it('should return 400 when body is missing', async () => {
        const event = {};

        const response = await handler(event as any);

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body.message).toContain('body');
    });

    it('should return 500 when DynamoDB operation fails', async () => {
        // Mock DynamoDB error
        ddbMock.on(PutCommand).rejects(new Error('DynamoDB error'));
        
        // Temporarily silence console.error for this test
        const originalConsoleError = console.error;
        console.error = jest.fn();
        
        const event = {
            body: JSON.stringify({
                title: 'Error Product',
                price: 1499
            })
        };

        const response = await handler(event as any);
        
        // Restore console.error
        console.error = originalConsoleError;

        expect(response.statusCode).toBe(500);
        const body = JSON.parse(response.body);
        expect(body.message).toContain('Internal server error');
    });
});
