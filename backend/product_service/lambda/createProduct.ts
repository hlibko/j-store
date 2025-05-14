// lambda/createProduct.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { FRONTEND_URL } from './constants';
import { APIGatewayEvent, APIGatewayResponse, Product } from './types';
import { randomUUID } from 'crypto';

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: process.env.REGION });
const docClient = DynamoDBDocumentClient.from(client);

// Common headers for all responses
const commonHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': FRONTEND_URL,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST,OPTIONS'
};

/**
 * Helper function to create API responses with consistent format
 */
const createResponse = (statusCode: number, body: any): APIGatewayResponse => ({
    statusCode,
    headers: commonHeaders,
    body: JSON.stringify(body)
});

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayResponse> => {
    try {
        // Parse request body
        if (!event.body) {
            return createResponse(400, { message: "Request body is required" });
        }

        const productData = JSON.parse(event.body);

        // Validate required fields
        if (!productData.title) {
            return createResponse(400, { message: "Product title is required" });
        }

        if (productData.price === undefined || isNaN(Number(productData.price))) {
            return createResponse(400, { message: "Valid product price is required" });
        }

        // Generate a UUID for the new product
        const productId = randomUUID();

        // Create the product object
        const product: Product = {
            id: productId,
            title: productData.title,
            description: productData.description || '',
            price: Number(productData.price)
        };

        // Save to DynamoDB Products table
        await docClient.send(new PutCommand({
            TableName: process.env.PRODUCTS_TABLE_NAME || 'J-Store-Products',
            Item: product
        }));

        // If stock count is provided, save to Stocks table
        if (productData.count !== undefined) {
            await docClient.send(new PutCommand({
                TableName: process.env.STOCKS_TABLE_NAME || 'J-Store-Stocks',
                Item: {
                    product_id: productId,
                    count: Number(productData.count)
                }
            }));
        }

        return createResponse(201, {
            ...product,
            count: productData.count !== undefined ? Number(productData.count) : 0
        });
    } catch (error) {
        console.error('Error in createProduct:', error);
        return createResponse(500, { message: "Internal server error" });
    }
};
