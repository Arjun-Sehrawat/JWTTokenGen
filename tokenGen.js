import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync, writeFileSync } from 'fs';

// Create an S3 client
const s3Client = new S3Client({ region: 'your-region' }); // Replace 'your-region' with your AWS region

exports.handler = async (event, context) => {
    // S3 bucket and key where the JKS file is stored
    const bucketName = 'your-s3-bucket-name';
    const key = 'path/to/your/jks/file.jks';

    // Temporary file to store the downloaded JKS file
    const tempJksFile = '/tmp/file.jks';

    try {
        // Download the JKS file from S3
        const getObjectParams = {
            Bucket: bucketName,
            Key: key
        };
        const { Body } = await s3Client.send(new GetObjectCommand(getObjectParams));

        // Write the downloaded JKS file to a temporary file
        writeFileSync(tempJksFile, Body);

        // Now you can use tempJksFile for whatever purpose you need in your Lambda function
        // For example, you might want to read it synchronously

        // Read the JKS file synchronously with the provided password
        const jksFileContent = readFileSync(tempJksFile, 'utf8'); // Change 'utf8' to the appropriate encoding
        const password = 'your-keystore-password'; // Replace with your keystore password

        // Perform operations with the JKS file content

        // Don't forget to clean up the temporary file when done
        // fs.unlinkSync(tempJksFile); // If you're not using Node.js 16.x or later

        return {
            statusCode: 200,
            body: 'JKS file downloaded successfully and processed.'
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: `Error: ${error.message}`
        };
    }
};
