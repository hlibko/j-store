#!/bin/bash
set -e

# Build the React application
echo "Building React application..."
npm run build

# Deploy using CDK
echo "Deploying infrastructure with CDK..."
cd infrastructure
npx cdk deploy --require-approval never

echo "Deployment complete!"
