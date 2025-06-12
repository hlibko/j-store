import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
import * as dotenv from 'dotenv';

dotenv.config();

export const handler = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  console.log('Event: ', JSON.stringify(event));

  // Check if Authorization header is present
  if (!event.authorizationToken) {
    return generatePolicy('Unauthorized', 'Deny', event.methodArn, 401);
  }

  try {
    // Extract token from the Authorization header
    // The format is "Basic base64(username:password)"
    const token = event.authorizationToken.split(' ')[1];
    const credentials = Buffer.from(token, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');

    console.log(`Attempting to authorize user: ${username}`);

    // Check if the credentials match the environment variable
    const storedPassword = process.env[username];
    
    if (storedPassword && storedPassword === password) {
      console.log('Authorization successful');
      return generatePolicy(username, 'Allow', event.methodArn);
    } else {
      console.log('Authorization failed: Invalid credentials');
      return generatePolicy('Unauthorized', 'Deny', event.methodArn, 403);
    }
  } catch (error) {
    console.error('Error during authorization:', error);
    return generatePolicy('Unauthorized', 'Deny', event.methodArn, 403);
  }
};

// Helper function to generate IAM policy
const generatePolicy = (
  principalId: string, 
  effect: 'Allow' | 'Deny', 
  resource: string,
  statusCode?: number
): APIGatewayAuthorizerResult => {
  const authResponse: APIGatewayAuthorizerResult = {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource
        }
      ]
    }
  };

  // Add context for status code if provided
  if (statusCode) {
    authResponse.context = {
      statusCode: statusCode.toString()
    };
  }

  return authResponse;
};