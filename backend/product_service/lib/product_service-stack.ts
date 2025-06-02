import { Stack, StackProps } from 'aws-cdk-lib';
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from 'constructs';
import { RestApi, LambdaIntegration, Cors } from "aws-cdk-lib/aws-apigateway";
import { FRONTEND_URL } from '../lambda/constants';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

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

    // Defines an AWS Lambda resource for creating a product
    const createProduct = new Function(this, "CreateProductHandler", {
      runtime: Runtime.NODEJS_22_X,
      code: Code.fromAsset("lambda"),
      handler: "createProduct.handler",
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
        STOCKS_TABLE_NAME: stocksTable.tableName,
        REGION: this.region,
      }
    });

    // Create SQS queue for catalog items
    const catalogItemsQueue = new Queue(this, 'CatalogItemsQueue', {
      queueName: 'catalogItemsQueue'
    });

    // Create Lambda function for processing batch items from SQS
    const catalogBatchProcess = new Function(this, "CatalogBatchProcessHandler", {
      runtime: Runtime.NODEJS_22_X,
      code: Code.fromAsset("lambda"),
      handler: "catalogBatchProcess.handler",
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
        STOCKS_TABLE_NAME: stocksTable.tableName,
        REGION: this.region,
      }
    });

    // Configure SQS to trigger Lambda with batch size of 5
    catalogBatchProcess.addEventSource(new SqsEventSource(catalogItemsQueue, {
      batchSize: 5
    }));

    // Grant permissions to Lambda functions to access DynamoDB tables
    productsTable.grantReadData(getProductsList);
    stocksTable.grantReadData(getProductsList);

    productsTable.grantReadData(getProductsById);
    stocksTable.grantReadData(getProductsById);

    productsTable.grantWriteData(createProduct);
    stocksTable.grantWriteData(createProduct);

    // Grant permissions for catalogBatchProcess to write to DynamoDB
    productsTable.grantWriteData(catalogBatchProcess);
    stocksTable.grantWriteData(catalogBatchProcess);

    // Create API Gateway REST API
    const api = new RestApi(this, "ProductsApi", {
      restApiName: "Products Service",
      description: "This service serves product information",
      defaultCorsPreflightOptions: {
        allowOrigins: [FRONTEND_URL],
        allowMethods: ['GET', 'POST', 'OPTIONS'],
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

    // Add POST method to /products resource
    productsResource.addMethod('POST', new LambdaIntegration(createProduct));
  }
}
