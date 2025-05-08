import { Stack, StackProps } from 'aws-cdk-lib';
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from 'constructs';
import { RestApi, LambdaIntegration, Cors } from "aws-cdk-lib/aws-apigateway";

export class ProductServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Defines an AWS Lambda resource
    const getProductsList = new Function(this, "GetProductsListHandler", {
      runtime: Runtime.NODEJS_22_X,
      code: Code.fromAsset("lambda"), // code loaded from "lambda" directory
      handler: "getProductsList.handler",
    });

    // Create API Gateway REST API
    const api = new RestApi(this, "ProductsApi", {
      restApiName: "Products Service",
      description: "This service serves product information",
      defaultCorsPreflightOptions: {
        allowOrigins: ['https://d1y74wccw6evhw.cloudfront.net'],
        allowMethods: ['GET', 'OPTIONS'],
        allowHeaders: Cors.DEFAULT_HEADERS,
        allowCredentials: true,
      }
    });

    // Create a resource for /products
    const productsResource = api.root.addResource('products');

    // Add GET method to /products resource
    productsResource.addMethod('GET', new LambdaIntegration(getProductsList));

  }
}
