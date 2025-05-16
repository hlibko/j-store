import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { ProductServiceStack } from '../lib/product_service-stack';

describe('ProductServiceStack', () => {
  const app = new App();
  const stack = new ProductServiceStack(app, 'TestProductServiceStack');
  const template = Template.fromStack(stack);

  test('DynamoDB tables are referenced correctly', () => {
    // Verify that the DynamoDB tables are referenced with the correct names
    template.hasResourceProperties('AWS::Lambda::Function', {
      Environment: {
        Variables: {
          PRODUCTS_TABLE_NAME: 'J-Store-Products',
          STOCKS_TABLE_NAME: 'J-Store-Stocks',
        },
      },
    });
  });

  test('Lambda functions are created with correct runtime and handlers', () => {
    // Check that we have 3 Lambda functions with Node.js 22.x runtime
    template.resourceCountIs('AWS::Lambda::Function', 3);
    
    // Verify getProductsList Lambda
    template.hasResourceProperties('AWS::Lambda::Function', {
      Runtime: 'nodejs22.x',
      Handler: 'getProductsList.handler',
    });
    
    // Verify getProductsById Lambda
    template.hasResourceProperties('AWS::Lambda::Function', {
      Runtime: 'nodejs22.x',
      Handler: 'getProductsById.handler',
    });
    
    // Verify createProduct Lambda
    template.hasResourceProperties('AWS::Lambda::Function', {
      Runtime: 'nodejs22.x',
      Handler: 'createProduct.handler',
    });
  });

  test('API Gateway is configured correctly', () => {
    // Check that API Gateway is created
    template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
    
    // Verify API Gateway name and description
    template.hasResourceProperties('AWS::ApiGateway::RestApi', {
      Name: 'Products Service',
      Description: 'This service serves product information',
    });
    
    // Verify CORS configuration is enabled
    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'OPTIONS',
      Integration: {
        Type: 'MOCK'
      }
    });
  });

  test('API Gateway resources and methods are configured correctly', () => {
    // Check that we have GET method for /products
    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'GET',
      ResourceId: {
        Ref: stack.getLogicalId(stack.node.findChild('ProductsApi').node.findChild('Default').node.findChild('products').node.defaultChild as any),
      },
    });
    
    // Check that we have GET method for /products/{productId}
    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'GET',
      ResourceId: {
        Ref: stack.getLogicalId(stack.node.findChild('ProductsApi').node.findChild('Default').node.findChild('products').node.findChild('{productId}').node.defaultChild as any),
      },
    });
    
    // Check that we have POST method for /products
    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'POST',
      ResourceId: {
        Ref: stack.getLogicalId(stack.node.findChild('ProductsApi').node.findChild('Default').node.findChild('products').node.defaultChild as any),
      },
    });
  });

  test('Lambda functions have correct permissions to DynamoDB tables', () => {
    // Verify that policies exist for DynamoDB access
    const policies = template.findResources('AWS::IAM::Policy');
    expect(Object.keys(policies).length).toBeGreaterThanOrEqual(3);
    
    // Check that at least one policy has read permissions (Scan)
    const policyValues = Object.values(policies);
    const readPolicy = policyValues.find(policy => 
      JSON.stringify(policy).includes('dynamodb:Scan')
    );
    expect(readPolicy).toBeDefined();
    
    // Check that at least one policy has write permissions (PutItem)
    const writePolicy = policyValues.find(policy => 
      JSON.stringify(policy).includes('dynamodb:PutItem')
    );
    expect(writePolicy).toBeDefined();
  });
});