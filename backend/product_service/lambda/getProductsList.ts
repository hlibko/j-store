// lambda/getProductsList.ts
import { products } from './mockData';
import { FRONTEND_URL } from './constants';
import { APIGatewayResponse } from './types';

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

/**
 * Lambda handler to retrieve all products
 */
export const handler = async (): Promise<APIGatewayResponse> => {
  try {
    return createResponse(200, products);
  } catch (error) {
    console.error('Error in getProductsList:', error);
    return createResponse(500, { message: "Internal server error" });
  }
};
