// lambda/getProductsList.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { FRONTEND_URL } from './constants';
import { APIGatewayResponse, Product } from './types';

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

/**
 * Lambda handler to retrieve all products with their stock information
 */
export const handler = async (): Promise<APIGatewayResponse> => {
  try {
    // Get all products from DynamoDB
    const productsResult = await docClient.send(new ScanCommand({
      TableName: process.env.PRODUCTS_TABLE_NAME || 'J-Store-Products'
    }));

    const products = productsResult.Items || [];

    // Get all stocks from DynamoDB
    const stocksResult = await docClient.send(new ScanCommand({
      TableName: process.env.STOCKS_TABLE_NAME || 'J-Store-Stocks'
    }));

    const stocks = stocksResult.Items || [];

    // Create a map of product_id to stock count for easier lookup
    const stockMap = stocks.reduce((acc: Record<string, number>, stock: any) => {
      acc[stock.product_id] = stock.count;
      return acc;
    }, {});

    // Combine products with their stock information
    const productsWithStock = products.map((product: any) => ({
      ...product,
      count: stockMap[product.id] || 0
    }));

    return createResponse(200, productsWithStock);
  } catch (error) {
    console.error('Error in getProductsList:', error);
    return createResponse(500, { message: "Internal server error" });
  }
};
