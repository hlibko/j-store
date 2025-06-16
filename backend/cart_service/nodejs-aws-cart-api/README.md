# Cart Service API - AWS Lambda Deployment

This project is a NestJS application configured to run as an AWS Lambda function using AWS CDK for deployment.

## Project Structure

- `src/` - NestJS application source code
- `src/lambda.ts` - Lambda handler for the NestJS application
- `infrastructure/` - AWS CDK code for deploying the application
- `dist/` - Build output directory

## Setup and Deployment

### Prerequisites

- Node.js (v14 or later)
- AWS CLI configured with appropriate credentials
- AWS CDK installed globally (`npm install -g aws-cdk`)

### Installation

1. Install dependencies for the NestJS application:

```bash
cd /path/to/nodejs-aws-cart-api
npm install
```

2. Install dependencies for the CDK infrastructure:

```bash
cd /path/to/nodejs-aws-cart-api/infrastructure
npm install
```

### Building and Deploying

1. Build the NestJS application and bundle it for Lambda:

```bash
cd /path/to/nodejs-aws-cart-api
npm run build:lambda
```

This will:
- Build the NestJS application
- Bundle it using webpack into a single file

2. Deploy using AWS CDK:

```bash
cd /path/to/nodejs-aws-cart-api/infrastructure
npm run deploy
```

## How It Works

1. The NestJS application is wrapped with a Lambda handler in `src/lambda.ts`
2. The application is built and bundled into a single JavaScript file
3. AWS CDK creates:
   - A Lambda function using the bundled application
   - An API Gateway to expose the Lambda function
   - Necessary IAM roles and permissions

## Local Development

For local development, you can still use the standard NestJS commands:

```bash
npm run start:dev
```

## Testing

```bash
npm test
```

## Cleanup

To remove all deployed resources:

```bash
cd /path/to/nodejs-aws-cart-api/infrastructure
npm run destroy
```