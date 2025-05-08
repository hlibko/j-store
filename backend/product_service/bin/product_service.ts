#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ProductServiceStack } from '../lib/product_service-stack';

const app = new cdk.App();
new ProductServiceStack(app, 'ProductServiceStack', {
    env: { account: '442042536878', region: 'eu-north-1' },
});
