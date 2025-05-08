import { Stack, StackProps } from 'aws-cdk-lib';
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from 'constructs';

export class ProductServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // defines an AWS Lambda resource
    const getProductsList = new Function(this, "GetProductsListHandler", {
      runtime: Runtime.NODEJS_22_X,
      code: Code.fromAsset("lambda"), // code loaded from "lambda" directory
      handler: "getProductsList.handler",
    });

  }
}
