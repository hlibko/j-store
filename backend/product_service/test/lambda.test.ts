import { handler as getProductsListHandler } from '../lambda/getProductsList';
import { handler as getProductsByIdHandler } from '../lambda/getProductsById';
import { products } from '../lambda/mockData';
import { APIGatewayEvent } from '../lambda/types';

// Mock console.error to prevent test output pollution
console.error = jest.fn();

describe('Lambda Handlers', () => {
  describe('getProductsList', () => {
    it('should return all products with status code 200', async () => {
      const response = await getProductsListHandler();
      
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual(products);
    });

    it('should return 500 when an error occurs', async () => {
      // Mock products to throw an error
      jest.spyOn(JSON, 'stringify').mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      const response = await getProductsListHandler();
      
      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body)).toEqual({ message: 'Internal server error' });
      
      // Restore the original implementation
      jest.restoreAllMocks();
    });
  });

  describe('getProductsById', () => {
    it('should return a product when valid ID is provided', async () => {
      const event = {
        pathParameters: {
          productId: '1'
        }
      } as APIGatewayEvent;

      const response = await getProductsByIdHandler(event);
      
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual(products[0]);
    });

    it('should return 400 when product ID is missing', async () => {
      const event = {
        pathParameters: {}
      } as APIGatewayEvent;

      const response = await getProductsByIdHandler(event);
      
      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body)).toEqual({ message: 'Product ID is required' });
    });

    it('should return 404 when product is not found', async () => {
      const event = {
        pathParameters: {
          productId: 'non-existent-id'
        }
      } as APIGatewayEvent;

      const response = await getProductsByIdHandler(event);
      
      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.body)).toEqual({ message: 'Product not found' });
    });

    it('should return 500 when an error occurs', async () => {
      const event = {
        pathParameters: {
          productId: '1'
        }
      } as APIGatewayEvent;

      // Mock products.find to throw an error
      jest.spyOn(products, 'find').mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      const response = await getProductsByIdHandler(event);
      
      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body)).toEqual({ message: 'Internal server error' });
      
      // Restore the original implementation
      jest.restoreAllMocks();
    });

    it('should handle null pathParameters gracefully', async () => {
      const event = {} as APIGatewayEvent;

      const response = await getProductsByIdHandler(event);
      
      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body)).toEqual({ message: 'Product ID is required' });
    });
  });
});