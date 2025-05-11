import { Stack, StackProps } from 'aws-cdk-lib';
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from 'constructs';
import { RestApi, LambdaIntegration, Cors } from "aws-cdk-lib/aws-apigateway";
import { FRONTEND_URL } from '../lambda/constants';
import { Table } from 'aws-cdk-lib/aws-dynamodb';

export class ProductServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Reference existing DynamoDB tables
    const productsTable = Table.fromTableName(this, 'ProductsTable', 'J-Store-Products');
    const stocksTable = Table.fromTableName(this, 'StocksTable', 'J-Store-Stocks');

    // Defines an AWS Lambda resource for getting all products
    const getProductsList = new Function(this, "GetProductsListHandler", {
      runtime: Runtime.NODEJS_22_X,
      code: Code.fromAsset("lambda"), // code loaded from "lambda" directory
      handler: "getProductsList.handler",
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
        STOCKS_TABLE_NAME: stocksTable.tableName,
        REGION: this.region,
      }
    });

    // Defines an AWS Lambda resource for getting a product by ID
    const getProductsById = new Function(this, "GetProductsByIdHandler", {
      runtime: Runtime.NODEJS_22_X,
      code: Code.fromAsset("lambda"), // code loaded from "lambda" directory
      handler: "getProductsById.handler",
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
        STOCKS_TABLE_NAME: stocksTable.tableName,
        REGION: this.region,
      }
    });

    // Grant permissions to Lambda functions to access DynamoDB tables
    productsTable.grantReadData(getProductsList);
    productsTable.grantReadData(getProductsById);
    stocksTable.grantReadData(getProductsList);
    stocksTable.grantReadData(getProductsById);

    // Create API Gateway REST API
    const api = new RestApi(this, "ProductsApi", {
      restApiName: "Products Service",
      description: "This service serves product information",
      defaultCorsPreflightOptions: {
        allowOrigins: [FRONTEND_URL],
        allowMethods: ['GET', 'OPTIONS'],
        allowHeaders: Cors.DEFAULT_HEADERS,
        allowCredentials: true,
      }
    });

    // Create a resource for /products
    const productsResource = api.root.addResource('products');

    // Add GET method to /products resource
    productsResource.addMethod('GET', new LambdaIntegration(getProductsList));

    // Create a resource for /products/{productId}
    const productResource = productsResource.addResource('{productId}');

    // Add GET method to /products/{productId} resource
    productResource.addMethod('GET', new LambdaIntegration(getProductsById));
  }
}
