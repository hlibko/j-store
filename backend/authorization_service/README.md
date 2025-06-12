# Authorization Service

This service provides a Lambda function for Basic Authorization in API Gateway.

## Basic Authorizer Lambda

The `basicAuthorizer` Lambda function:
- Takes a Basic Authorization token
- Decodes it and checks credentials against environment variables
- Returns appropriate IAM policy and status codes:
  - 403 for invalid credentials
  - 401 if Authorization header is missing
  - 200 with Allow policy for successful authorization

## Environment Variables

The Lambda uses environment variables to store credentials in the format:
```
username=password
```

## Deployment

1. Install dependencies:
```
npm install
cd lambda
npm install
```

2. Create a `.env` file in the `lambda` directory with your credentials:
```
github_account_login=TEST_PASSWORD
```

3. Build the Lambda function:
```
cd lambda
npm run build
```

4. Deploy the stack:
```
cd ..
npm run cdk deploy
```

## Security Note

The `.env` file is included in `.gitignore` to prevent credentials from being committed to the repository.