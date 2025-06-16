#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CartStack } from '../lib/cart-stack';

const app = new cdk.App();
new CartStack(app, 'CartServiceStack', {
  description: 'Cart Service API deployed as Lambda function',
});