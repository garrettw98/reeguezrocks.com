#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CloudFormationClient, DescribeStacksCommand } from '@aws-sdk/client-cloudformation';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const REGION = process.env.AWS_REGION || 'us-east-1';
const STACK = process.env.SITE_STACK || 'reeguezrocks-site';

async function getSiteOutputs(){
  const cf = new CloudFormationClient({ region: REGION });
  const r = await cf.send(new DescribeStacksCommand({ StackName: STACK }));
  const s = r.Stacks?.[0];
  if (!s) throw new Error(`Stack not found: ${STACK}`);
  const out = Object.fromEntries((s.Outputs||[]).map(o=>[o.OutputKey,o.OutputValue]));
  const bucket = out.BucketNameOut;
  const distId = out.DistributionId;
  if (!bucket || !distId) throw new Error('Missing outputs BucketNameOut or DistributionId');
  return { bucket, distId };
}

function contentTypeFor(key){
  if (key.endsWith('.html')) return 'text/html; charset=utf-8';
  if (key.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (key.endsWith('.css')) return 'text/css; charset=utf-8';
  if (key.endsWith('.json')) return 'application/json; charset=utf-8';
  if (key.endsWith('.svg')) return 'image/svg+xml';
  if (key.endsWith('.png')) return 'image/png';
  if (key.endsWith('.jpg')||key.endsWith('.jpeg')) return 'image/jpeg';
  if (key.endsWith('.webp')) return 'image/webp';
  return 'application/octet-stream';
}

async function upload(bucket, key){
  const s3 = new S3Client({ region: REGION });
  const body = readFileSync(join(ROOT, key));
  const ContentType = contentTypeFor(key);
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType }));
  console.log(`Uploaded s3://${bucket}/${key}`);
}

async function invalidate(distId){
  const cf = new CloudFrontClient({ region: REGION });
  const ref = 'deploy-'+Date.now();
  await cf.send(new CreateInvalidationCommand({ DistributionId: distId, InvalidationBatch: { CallerReference: ref, Paths: { Quantity: 1, Items: ['/*'] } } }));
  console.log('Invalidation created');
}

(async function(){
  try{
    const { bucket, distId } = await getSiteOutputs();
    await upload(bucket, 'index.html');
    await upload(bucket, 'config.js');
    await upload(bucket, 'assets/main.js');
    await invalidate(distId);
    console.log('Static site updated.');
  }catch(e){ console.error('Error:', e); process.exit(1); }
})();
