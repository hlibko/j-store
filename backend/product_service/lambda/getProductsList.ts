// lambda/getProductsList.ts
import { products } from './mockData';
import { FRONTEND_URL } from './constants';
import { APIGatewayResponse } from './types';

export const handler = async (): Promise<APIGatewayResponse> => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': FRONTEND_URL,
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,OPTIONS'
    },
    body: JSON.stringify(products),
  };
};
