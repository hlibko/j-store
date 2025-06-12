import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as sqs from 'aws-cdk-lib/aws-sqs';

export class ImportServiceStack extends cdk.Stack {
  public readonly importBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create S3 bucket for import service
    this.importBucket = new s3.Bucket(this, 'ImportBucket', {
      bucketName: `j-store-import-service-bucket-${this.account}-${this.region}`,
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.POST,
            s3.HttpMethods.PUT,
          ],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Create 'uploaded' folder in the bucket
    new s3deploy.BucketDeployment(this, 'DeployUploadedFolder', {
      sources: [s3deploy.Source.data('uploaded/.keep', '')],
      destinationBucket: this.importBucket,
      retainOnDelete: true,
    });

    // Create 'parsed' folder in the bucket
    new s3deploy.BucketDeployment(this, 'DeployParsedFolder', {
      sources: [s3deploy.Source.data('parsed/.keep', '')],
      destinationBucket: this.importBucket,
      retainOnDelete: true,
    });

    // Output the bucket name
    new cdk.CfnOutput(this, 'ImportBucketName', {
      value: this.importBucket.bucketName,
      description: 'The name of the S3 bucket for import service',
      exportName: 'ImportBucketName',
    });

    // Create importProductsFile Lambda function
    const importProductsFileLambda = new lambda.Function(this, 'ImportProductsFileHandler', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'importProductsFile.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        BUCKET_NAME: this.importBucket.bucketName,
      },
    });

    // Grant S3 permissions to the Lambda function
    const s3PolicyImportProductsFile = new iam.PolicyStatement({
      actions: ['s3:PutObject'],
      resources: [`${this.importBucket.bucketArn}/uploaded/*`],
    });
    importProductsFileLambda.addToRolePolicy(s3PolicyImportProductsFile);

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'ImportServiceApi', {
      restApiName: 'Import Service API',
      description: 'API for import service',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token', 'X-Amz-User-Agent'],
        allowCredentials: true,
      },
    });

    // Import the basicAuthorizer Lambda from Authorization Service
    const basicAuthorizerArn = cdk.Fn.importValue('BasicAuthorizerLambdaArn');
    const basicAuthorizer = new apigateway.TokenAuthorizer(this, 'BasicAuthorizer', {
      handler: lambda.Function.fromFunctionAttributes(this, 'ImportedBasicAuthorizer', {
        functionArn: basicAuthorizerArn,
        sameEnvironment: true, // Specify that the function is in the same environment
      }),
      identitySource: 'method.request.header.Authorization',
    });

    // Create /import resource
    const importResource = api.root.addResource('import');

    // Add GET method with name query parameter and basicAuthorizer
    importResource.addMethod('GET',
      new apigateway.LambdaIntegration(importProductsFileLambda, {
        proxy: true,
      }), {
        authorizer: basicAuthorizer,
        authorizationType: apigateway.AuthorizationType.CUSTOM,
        requestParameters: {
          'method.request.querystring.name': true,
        },
        methodResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Access-Control-Allow-Origin': true,
              'method.response.header.Access-Control-Allow-Headers': true,
              'method.response.header.Access-Control-Allow-Methods': true,
              'method.response.header.Access-Control-Allow-Credentials': true,
            },
          },
          {
            statusCode: '400',
            responseParameters: {
              'method.response.header.Access-Control-Allow-Origin': true,
              'method.response.header.Access-Control-Allow-Headers': true,
              'method.response.header.Access-Control-Allow-Methods': true,
              'method.response.header.Access-Control-Allow-Credentials': true,
            },
          },
          {
            statusCode: '500',
            responseParameters: {
              'method.response.header.Access-Control-Allow-Origin': true,
              'method.response.header.Access-Control-Allow-Headers': true,
              'method.response.header.Access-Control-Allow-Methods': true,
              'method.response.header.Access-Control-Allow-Credentials': true,
            },
          },
        ],
      }
    );

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'The URL of the Import Service API',
      exportName: 'ImportServiceApiUrl',
    });

    // Reference the SQS queue from Product Service
    const catalogItemsQueue = sqs.Queue.fromQueueArn(
      this,
      'CatalogItemsQueue',
      `arn:aws:sqs:${this.region}:${this.account}:catalogItemsQueue`
    );

    // Create importFileParser Lambda function
    const importFileParserLambda = new lambda.Function(this, 'ImportFileParserHandler', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'importFileParser.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      environment: {
        BUCKET_NAME: this.importBucket.bucketName,
        SQS_URL: catalogItemsQueue.queueUrl,
      },
    });

    // Grant S3 permissions to the Lambda function
    const s3PolicyImportFileParserLambda = new iam.PolicyStatement({
      actions: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject'],
      resources: [
        `${this.importBucket.bucketArn}/uploaded/*`,
        `${this.importBucket.bucketArn}/parsed/*`
      ],
    });
    importFileParserLambda.addToRolePolicy(s3PolicyImportFileParserLambda);

    // Grant SQS permissions to the Lambda function
    catalogItemsQueue.grantSendMessages(importFileParserLambda);

    // Add S3 event notification for the uploaded folder
    this.importBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(importFileParserLambda),
      { prefix: 'uploaded/' }
    );
  }
}