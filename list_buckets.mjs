import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
const s3 = new S3Client({ region: 'us-east-1' });
try {
  const r = await s3.send(new ListBucketsCommand({}));
  console.log('Buckets:');
  console.log(r.Buckets.map(b => b.Name).join('\n'));
} catch (e) {
  console.error(e);
}