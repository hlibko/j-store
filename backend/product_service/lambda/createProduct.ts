import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    TransactWriteCommand,
    TransactWriteCommandInput
} from '@aws-sdk/lib-dynamodb';
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

/**
 * Lambda handler for creating a product with stock in a single transaction
 * If either the product or stock creation fails, the entire transaction is rolled back
 */
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

        if (productData.count === undefined || isNaN(Number(productData.count))) {
            return createResponse(400, { message: "Valid stock count is required" });
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

        // Create a transaction that includes both product and stock creation
        const transactionParams: TransactWriteCommandInput = {
            TransactItems: [
                {
                    // Add item to Products table
                    Put: {
                        TableName: process.env.PRODUCTS_TABLE_NAME || 'J-Store-Products',
                        Item: product
                    }
                },
                {
                    // Add item to Stocks table
                    Put: {
                        TableName: process.env.STOCKS_TABLE_NAME || 'J-Store-Stocks',
                        Item: {
                            product_id: productId,
                            count: Number(productData.count)
                        }
                    }
                }
            ]
        };

        // Execute the transaction
        await docClient.send(new TransactWriteCommand(transactionParams));

        // Return the created product with stock count
        return createResponse(201, {
            ...product,
            count: Number(productData.count)
        });
    } catch (error) {
        console.error('Error in createProductTransaction:', error);
        return createResponse(500, { message: "Internal server error" });
    }
};
