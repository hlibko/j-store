const { S3Client, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
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
    
    // Skip processing of .keep files
    if (key.endsWith('.keep')) {
      console.log('Skipping .keep file');
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Skipped .keep file' }),
      };
    }
    
    console.log(`Processing file ${key} from bucket ${bucket}`);
    
    // Get the object from S3
    const { Body } = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
    
    // Process the CSV file
    await new Promise((resolve, reject) => {
      const stream = Readable.from(Body);
      
      stream
        .pipe(csvParser())
        .on('data', (data) => {
          console.log('Parsed record:', JSON.stringify(data));
        })
        .on('end', () => {
          console.log('CSV parsing completed');
          resolve();
        })
        .on('error', (error) => {
          console.error('Error parsing CSV:', error);
          reject(error);
        });
    });
    
    // Get the file name from the key
    const fileName = key.split('/').pop();
    const parsedKey = `parsed/${fileName}`;
    
    // Copy the file to the parsed folder
    console.log(`Copying file from ${key} to ${parsedKey}`);
    await s3Client.send(
      new CopyObjectCommand({
        Bucket: bucket,
        CopySource: `${bucket}/${key}`,
        Key: parsedKey,
      })
    );
    
    // Delete the file from the uploaded folder
    console.log(`Deleting file ${key}`);
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
    
    // Ensure the uploaded folder still exists by recreating the .keep file if needed
    console.log('Ensuring uploaded folder exists');
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: 'uploaded/.keep',
        Body: '',
      })
    );
    
    console.log('File successfully moved to parsed folder');
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'File processed and moved successfully' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error processing the file' }),
    };
  }
};