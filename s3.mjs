import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { promises as fsPromises } from 'fs';

const client = new S3Client({
  region: 'us-east-1',
  // Make unauthenticated S3 requests
  credentials: { accessKeyId: "", secretAccessKey: "" },
  signer: { sign: async req => req },

  // Uncomment this to skip checksum validation
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
    // The checksum validation error is thrown as part of the streaming process, so log it here
    console.error(e);
  } finally {
    await fileHandle.close();
  }
}

// This file was previously uploaded to S3 with Checksum algorithm CRC32, content-type = 'text/plain', and
// content-encoding = 'br'
const result = await client.send(
  new GetObjectCommand({
    Bucket: 's3-compression-checksum-reproduction',
    Key: 'uncompressed.txt.br',
  }),
);

// You have to actually stream the output in order to trigger the checksum validation
streamToFile('out.br', await result.Body?.transformToWebStream());
