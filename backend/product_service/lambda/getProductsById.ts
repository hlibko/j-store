// lambda/getProductsById.ts
import { products } from './mockData';
import { FRONTEND_URL } from './constants';
import { APIGatewayEvent, APIGatewayResponse } from './types';

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

        // Find the product with the matching ID
        const product = products.find(p => p.id === productId);

        if (!product) {
            return createResponse(404, { message: "Product not found" });
        }

        return createResponse(200, product);
    } catch (error) {
        console.error('Error in getProductsById:', error);
        return createResponse(500, { message: "Internal server error" });
    }
};
