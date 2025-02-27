import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import nodeProcess from 'node:process';
import { promises as fsPromises } from 'fs';

const accessKeyId = nodeProcess.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = nodeProcess.env.AWS_SECRET_ACCESS_KEY;
const sessionToken = nodeProcess.env.AWS_SESSION_TOKEN;
const awsCredentialExpiration = nodeProcess.env.AWS_CREDENTIAL_EXPIRATION;

const client = new S3Client({
  credentials: {
    accessKeyId,
    secretAccessKey,
    sessionToken,
    expiration: new Date(awsCredentialExpiration),
  },
  region: 'us-east-1',
  // responseChecksumValidation: 'WHEN_REQUIRED',
});

async function streamToFile(fileName, stream) {
  await fsPromises.rm(fileName, { force: true });
  const fileHandle = await fsPromises.open(fileName, 'w+');
  try {
    const writableStream = new WritableStream({
      async write(chunk) {
        await fileHandle.write(chunk);
      },
    });

    await stream.pipeTo(writableStream);
  } catch (e) {
    console.error(e);
  } finally {
    await fileHandle.close();
  }
}

const result = await client.send(
  new GetObjectCommand({
    Bucket: 'ta-web-dist-prd',
    Key: 'im/4b68cbb2.js.br',
  }),
);

streamToFile('out.br', await result.Body?.transformToWebStream());
