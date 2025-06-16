import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';

export class CartStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create Lambda function from bundled NestJS app
    const cartLambda = new lambda.Function(this, 'CartServiceLambda', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'lambda-bundle.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist')),
      memorySize: 1024,
      timeout: cdk.Duration.seconds(30),
      environment: {
        NODE_ENV: 'production',
      },
    });

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'CartServiceApi', {
      restApiName: 'Cart Service API',
      description: 'API for Cart Service',
      deployOptions: {
        stageName: 'prod',
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // Connect API Gateway to Lambda
    const cartIntegration = new apigateway.LambdaIntegration(cartLambda);

    // Add proxy resource to handle all routes
    const proxyResource = api.root.addResource('{proxy+}');
    proxyResource.addMethod('ANY', cartIntegration);

    // Also add methods to the root resource
    api.root.addMethod('ANY', cartIntegration);

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'URL of the Cart Service API',
    });
  }
}