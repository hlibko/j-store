# Product Service

This service provides product information through a REST API.

## Project Structure

- `bin/` - CDK app entry point
- `lib/` - CDK infrastructure code
- `lambda/` - Lambda function code
  - `constants.js` - Shared constants for Lambda functions
- `config/` - Configuration for CDK infrastructure
  - `constants.ts` - Shared constants for infrastructure code

## Constants Management

The application uses two separate constants files:

1. `lambda/constants.js` - Used by Lambda functions at runtime
2. `config/constants.ts` - Used by CDK infrastructure code during deployment

This separation is necessary because Lambda functions are packaged and deployed separately from the CDK code.

## Development

To add a new constant:
1. Add it to both files if it's needed in both contexts
2. Add it only to the relevant file if it's specific to either Lambda or CDK

## Deployment

```
npm run build
cdk deploy
```