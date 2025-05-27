const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const csvParser = require('csv-parser');
const { Readable } = require('stream');

const s3Client = new S3Client({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
  try {
    console.log('Event: ', JSON.stringify(event));
    
    // Get bucket and key from the S3 event
    const record = event.Records[0];
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
    
    console.log(`Processing file ${key} from bucket ${bucket}`);
    
    // Get the object from S3
    const { Body } = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
    
    // Process the CSV file
    return new Promise((resolve, reject) => {
      const stream = Readable.from(Body);
      
      stream
        .pipe(csvParser())
        .on('data', (data) => {
          console.log('Parsed record:', JSON.stringify(data));
        })
        .on('end', () => {
          console.log('CSV parsing completed');
          resolve({
            statusCode: 200,
            body: JSON.stringify({ message: 'CSV parsing completed' }),
          });
        })
        .on('error', (error) => {
          console.error('Error parsing CSV:', error);
          reject(error);
        });
    });
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error processing the file' }),
    };
  }
};