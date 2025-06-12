import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import { Construct } from 'constructs';

export class AuthorizationServiceStack extends cdk.Stack {
  public readonly basicAuthorizerLambda: lambda.Function;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create the basicAuthorizer Lambda function
    this.basicAuthorizerLambda = new lambda.Function(this, 'BasicAuthorizerFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'basicAuthorizer.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      environment: {
        // Environment variable will be set during deployment from .env file
        // Format: hlibko=TEST_PASSWORD
        'hlibko': 'TEST_PASSWORD',
      },
      timeout: cdk.Duration.seconds(10),
      description: 'Lambda function for Basic Authorization',
    });

    // Output the Lambda ARN for reference
    new cdk.CfnOutput(this, 'BasicAuthorizerLambdaArn', {
      value: this.basicAuthorizerLambda.functionArn,
      description: 'ARN of the Basic Authorizer Lambda function',
      exportName: 'BasicAuthorizerLambdaArn',
    });
  }
}