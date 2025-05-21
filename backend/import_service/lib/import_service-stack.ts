import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

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
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For development only, use RETAIN for production
      autoDeleteObjects: true, // For development only, remove for production
    });

    // Create 'uploaded' folder in the bucket
    new s3deploy.BucketDeployment(this, 'DeployUploadedFolder', {
      sources: [s3deploy.Source.data('uploaded/.keep', '')], // Create an empty .keep file in the uploaded folder
      destinationBucket: this.importBucket,
    });

    // Output the bucket name
    new cdk.CfnOutput(this, 'ImportBucketName', {
      value: this.importBucket.bucketName,
      description: 'The name of the S3 bucket for import service',
      exportName: 'ImportBucketName',
    });
  }
}
