import { handler } from '../lambda/createProduct';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayEvent } from '../lambda/types';

// Mock console.error to prevent test output pollution
console.error = jest.fn();

// Mock randomUUID function
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

  it('should create a product with stock successfully', async () => {
    // Mock DynamoDB transaction response
    ddbMock.on(TransactWriteCommand).resolves({});

    // Create mock event with valid product data
    const event: APIGatewayEvent = {
      body: JSON.stringify({
        title: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        count: 10
      })
    };

    const response = await handler(event);

    // Verify response
    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body).toEqual({
      id: 'test-uuid-123',
      title: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      count: 10
    });

    // Verify DynamoDB transaction was called with correct parameters
    const calls = ddbMock.commandCalls(TransactWriteCommand);
    expect(calls.length).toBe(1);
    
    const transactItems = calls[0].args[0].input.TransactItems;
    expect(transactItems).toBeDefined();
    
    // Add non-null assertion to handle TypeScript null check
    expect(transactItems![0].Put!.TableName).toBe('test-products-table');
    expect(transactItems![0].Put!.Item).toEqual({
      id: 'test-uuid-123',
      title: 'Test Product',
      description: 'Test Description',
      price: 99.99
    });
    
    expect(transactItems![1].Put!.TableName).toBe('test-stocks-table');
    expect(transactItems![1].Put!.Item).toEqual({
      product_id: 'test-uuid-123',
      count: 10
    });
  });

  it('should create a product with default empty description', async () => {
    // Mock DynamoDB transaction response
    ddbMock.on(TransactWriteCommand).resolves({});

    // Create mock event with minimal product data
    const event: APIGatewayEvent = {
      body: JSON.stringify({
        title: 'Minimal Product',
        price: 50,
        count: 5
      })
    };

    const response = await handler(event);

    // Verify response
    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body).toEqual({
      id: 'test-uuid-123',
      title: 'Minimal Product',
      description: '',
      price: 50,
      count: 5
    });

    // Verify product was created with empty description
    const calls = ddbMock.commandCalls(TransactWriteCommand);
    const item = calls[0].args[0].input.TransactItems?.[0].Put?.Item;
    expect(item?.description).toBe('');
  });

  it('should return 400 when title is missing', async () => {
    const event: APIGatewayEvent = {
      body: JSON.stringify({
        description: 'Missing Title',
        price: 10,
        count: 5
      })
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body).toEqual({ message: 'Product title is required' });
    
    // Verify no DynamoDB calls were made
    const calls = ddbMock.commandCalls(TransactWriteCommand);
    expect(calls.length).toBe(0);
  });

  it('should return 400 when price is missing', async () => {
    const event: APIGatewayEvent = {
      body: JSON.stringify({
        title: 'Missing Price',
        description: 'Description',
        count: 5
      })
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body).toEqual({ message: 'Valid product price is required' });
  });

  it('should return 400 when count is missing', async () => {
    const event: APIGatewayEvent = {
      body: JSON.stringify({
        title: 'Missing Count',
        description: 'Description',
        price: 15
      })
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body).toEqual({ message: 'Valid stock count is required' });
  });

  it('should return 400 when request body is missing', async () => {
    const event: APIGatewayEvent = {};

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body).toEqual({ message: 'Request body is required' });
  });

  it('should return 500 when DynamoDB transaction fails', async () => {
    // Mock DynamoDB error
    ddbMock.on(TransactWriteCommand).rejects(new Error('DynamoDB transaction error'));

    const event: APIGatewayEvent = {
      body: JSON.stringify({
        title: 'Error Product',
        description: 'Description',
        price: 25,
        count: 3
      })
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(500);
    const body = JSON.parse(response.body);
    expect(body).toEqual({ message: 'Internal server error' });
  });
});