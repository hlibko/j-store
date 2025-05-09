import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as ProductService from '../lib/product_service-stack';
import { FRONTEND_URL } from '../lambda/constants';

describe('ProductServiceStack', () => {
  let app: cdk.App;
  let stack: ProductService.ProductServiceStack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new ProductService.ProductServiceStack(app, 'MyTestStack');
    template = Template.fromStack(stack);
  });

  test('Lambda Functions are created', () => {
    // Verify that two Lambda functions are created
    template.resourceCountIs('AWS::Lambda::Function', 2);
    
    // Verify the GetProductsListHandler Lambda function
    template.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'getProductsList.handler',
      Runtime: 'nodejs22.x',
    });
    
    // Verify the GetProductsByIdHandler Lambda function
    template.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'getProductsById.handler',
      Runtime: 'nodejs22.x',
    });
  });

  test('API Gateway is created with correct configuration', () => {
    // Verify that an API Gateway REST API is created
    template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
    
    // Verify the API Gateway properties
    template.hasResourceProperties('AWS::ApiGateway::RestApi', {
      Name: 'Products Service',
      Description: 'This service serves product information',
    });
  });

  test('API Gateway has CORS configuration', () => {
    // Verify CORS configuration on the OPTIONS method
    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'OPTIONS',
      Integration: {
        IntegrationResponses: [
          {
            ResponseParameters: {
              'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
              'method.response.header.Access-Control-Allow-Origin': `'${FRONTEND_URL}'`,
              'method.response.header.Access-Control-Allow-Methods': "'GET,OPTIONS'",
              'method.response.header.Access-Control-Allow-Credentials': "'true'"
            }
          }
        ]
      }
    });
  });

  test('API Gateway resources and methods are created', () => {
    // Verify that API Gateway resources are created
    template.resourceCountIs('AWS::ApiGateway::Resource', 2);
    
    // Verify that API Gateway methods are created
    // Count all methods (GET and OPTIONS)
    const allMethods = template.findResources('AWS::ApiGateway::Method', {});
    
    // We should have at least 2 GET methods and their corresponding OPTIONS methods
    expect(Object.keys(allMethods).length).toBeGreaterThanOrEqual(4);
    
    // Verify that we have methods with GET HttpMethod
    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'GET'
    });
  });

  test('Lambda integrations are configured for API Gateway methods', () => {
    // Verify that Lambda integrations are configured for API Gateway methods
    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'GET',
      Integration: {
        Type: 'AWS_PROXY',
        IntegrationHttpMethod: 'POST'
      }
    });
  });
});