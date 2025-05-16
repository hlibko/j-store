// lambda/getProductsById.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { FRONTEND_URL } from './constants';
import { APIGatewayEvent, APIGatewayResponse } from './types';

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: process.env.REGION });
const docClient = DynamoDBDocumentClient.from(client);

// Common headers for all responses
const commonHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': FRONTEND_URL,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,OPTIONS'
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
        // Extract productId from path parameters
        const productId = event.pathParameters?.productId;

        if (!productId) {
            return createResponse(400, { message: "Product ID is required" });
        }

        // Get product from DynamoDB
        const productResult = await docClient.send(new GetCommand({
            TableName: process.env.PRODUCTS_TABLE_NAME || 'J-Store-Products',
            Key: { id: productId }
        }));

        const product = productResult.Item;

        if (!product) {
            return createResponse(404, { message: "Product not found" });
        }

        // Get stock information for this product
        const stockResult = await docClient.send(new GetCommand({
            TableName: process.env.STOCKS_TABLE_NAME || 'J-Store-Stocks',
            Key: { product_id: productId }
        }));

        const stock = stockResult.Item;

        // Combine product with stock information
        const productWithStock = {
            ...product,
            count: stock ? stock.count : 0
        };

        return createResponse(200, productWithStock);
    } catch (error) {
        console.error('Error in getProductsById:', error);
        return createResponse(500, { message: "Internal server error" });
    }
};
