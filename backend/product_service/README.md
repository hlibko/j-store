# Product Service

This service provides product information through a REST API.

## API Documentation

The API is documented using the OpenAPI specification. You can view the documentation in two ways:

1. **YAML format**: [openapi.yaml](./openapi.yaml)
2. **JSON format**: [openapi.json](./openapi.json)

To visualize the API documentation, you can:

1. Copy the content of either file
2. Go to [Swagger Editor](https://editor.swagger.io/)
3. Paste the content to see the interactive documentation

## Project Structure

- `bin/` - CDK app entry point
- `lib/` - CDK infrastructure code
- `lambda/` - Lambda function code
  - `constants.js` - Shared constants for Lambda functions

## Available Endpoints

- `GET /products` - Get a list of all products
- `GET /products/{productId}` - Get a specific product by ID

## Deployment

```
npm run build
cdk deploy
```