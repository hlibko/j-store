#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AuthorizationServiceStack } from '../lib/authorization_service-stack';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: './lambda/.env' });

const app = new cdk.App();
new AuthorizationServiceStack(app, 'AuthorizationServiceStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
  },
});