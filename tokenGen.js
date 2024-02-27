import { S3 } from 'aws-sdk';
import jwt from 'jsonwebtoken';
import forge from 'node-forge';

const s3 = new S3();

export async function handler(event) {
    try {
        const userId = event.queryStringParameters.userId;
        const serviceName = event.queryStringParameters.serviceName;
        const keystorePassword = process.env.KEYSTORE_PASSWORD; // Assuming you set this environment variable

        // Retrieve keystore file from S3
        const params = {
            Bucket: 'your-s3-bucket-name',
            Key: 'your-keystore-file-name'
        };
        const data = await s3.getObject(params).promise();
        const keystoreData = data.Body;

        // Load the keystore using forge
        const p12Asn1 = forge.asn1.fromDer(keystoreData.toString('binary'));
        const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, keystorePassword);

        // Get the key and certificate
        const keyData = forge.pki.privateKeyToPem(p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag][0].key);
        const certData = forge.pki.certificateToPem(p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag][0].cert);

        // Generate JWT token
        const token = jwt.sign({ userId, serviceName }, keyData, { algorithm: 'RS256' });

        return {
            statusCode: 200,
            body: JSON.stringify({ token })
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
}
