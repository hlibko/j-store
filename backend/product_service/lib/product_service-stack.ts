import { Stack, StackProps } from 'aws-cdk-lib';
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from 'constructs';
import { RestApi, LambdaIntegration, Cors } from "aws-cdk-lib/aws-apigateway";
import { FRONTEND_URL } from '../config/constants';

export class ProductServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Defines an AWS Lambda resource for getting all products
    const getProductsList = new Function(this, "GetProductsListHandler", {
      runtime: Runtime.NODEJS_22_X,
      code: Code.fromAsset("lambda"), // code loaded from "lambda" directory
      handler: "getProductsList.handler",
    });

    // Defines an AWS Lambda resource for getting a product by ID
    const getProductsById = new Function(this, "GetProductsByIdHandler", {
      runtime: Runtime.NODEJS_22_X,
      code: Code.fromAsset("lambda"), // code loaded from "lambda" directory
      handler: "getProductsById.handler",
    });

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