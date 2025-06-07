import { SQSEvent, SQSHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const client = new DynamoDBClient({ region: process.env.REGION });
const dynamodb = DynamoDBDocumentClient.from(client);
const snsClient = new SNSClient({ region: process.env.REGION });
const PRODUCTS_TABLE_NAME = process.env.PRODUCTS_TABLE_NAME || '';
const STOCKS_TABLE_NAME = process.env.STOCKS_TABLE_NAME || '';
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN || '';

export const handler: SQSHandler = async (event: SQSEvent): Promise<void> => {
  console.log('Processing SQS batch event:', JSON.stringify(event));

  try {
    // Process each message in the batch
    const productPromises = event.Records.map(async (record) => {
      const productData = JSON.parse(record.body);
      console.log('Processing product:', productData);

      // Extract product and stock data
      const { id, title, description, price, count } = productData;

      // Create transaction to ensure both product and stock are created atomically
      const transactionParams = {
        TransactItems: [
          {
            Put: {
              TableName: PRODUCTS_TABLE_NAME,
              Item: {
                id,
                title,
                description,
                price
              }
            }
          },
          {
            Put: {
              TableName: STOCKS_TABLE_NAME,
              Item: {
                product_id: id,
                count
              }
            }
          }
        ]
      };

      // Execute transaction to save both items atomically
      await dynamodb.send(new TransactWriteCommand(transactionParams));
      
      // Send notification to SNS topic
      await snsClient.send(new PublishCommand({
        TopicArn: SNS_TOPIC_ARN,
        Subject: 'Product Created',
        Message: JSON.stringify({
          message: 'Product created successfully',
          product: { id, title, description, price, count }
        })
      }));

      return { id, status: 'created' };
    });

    // Wait for all products to be processed
    const results = await Promise.all(productPromises);
    console.log('Successfully processed batch:', results);

    // SQSHandler should return void, not an API Gateway response
  } catch (error) {
    console.error('Error processing batch:', error);
    throw error;
  }
};