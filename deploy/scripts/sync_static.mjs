#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CloudFormationClient, DescribeStacksCommand } from '@aws-sdk/client-cloudformation';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';

// --- Configuration ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '../..'); // 2026 folder
const ENV_PATH = join(ROOT, 'deploy/scripts/.env');

// Load .env manually
try {
  const envContent = readFileSync(ENV_PATH, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^['"]|['"]$/g, ''); // Remove quotes
      if (!process.env[key]) process.env[key] = val;
    }
  });
} catch (e) {
  console.log('No .env file found or unable to read it. Using existing env vars.');
}

const REGION = process.env.AWS_REGION || 'us-east-1';
const STACK = process.env.SITE_STACK || 'reeguezrocks-site';

// --- Helpers ---
async function getSiteOutputs() {
  console.log(`Fetching outputs for stack: ${STACK} in ${REGION}...`);
  try {
    const cf = new CloudFormationClient({ region: REGION });
    const r = await cf.send(new DescribeStacksCommand({ StackName: STACK }));
    const s = r.Stacks?.[0];
    if (!s) throw new Error(`Stack not found: ${STACK}`);
    const out = Object.fromEntries((s.Outputs || []).map(o => [o.OutputKey, o.OutputValue]));
    
    const bucket = out.BucketName || out.BucketNameOut || out.SiteBucket;
    const distId = out.DistributionId || out.CloudFrontDistributionId;
    
    if (bucket && distId) return { bucket, distId };
  } catch (e) {
    console.warn(`Stack lookup failed (${e.message}). using fallback values.`);
  }

  // Fallback / Hardcoded found values
  return {
    bucket: process.env.SITE_BUCKET || 'reeguezrocks-2026-site',
    distId: 'E2ES0HQCB0HRVJ'
  };
}

function contentTypeFor(key) {
  if (key.endsWith('.html')) return 'text/html; charset=utf-8';
  if (key.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (key.endsWith('.css')) return 'text/css; charset=utf-8';
  if (key.endsWith('.json')) return 'application/json; charset=utf-8';
  if (key.endsWith('.svg')) return 'image/svg+xml';
  if (key.endsWith('.png')) return 'image/png';
  if (key.endsWith('.jpg') || key.endsWith('.jpeg')) return 'image/jpeg';
  if (key.endsWith('.webp')) return 'image/webp';
  return 'application/octet-stream';
}

function getAllFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== '.git' && file !== '.github' && file !== 'node_modules' && file !== 'deploy' && file !== 'dist' && file !== 'archive') {
        getAllFiles(filePath, fileList);
      }
    } else {
      if (!file.startsWith('.') && file !== 'package.json' && file !== 'package-lock.json' && !file.endsWith('.py') && !file.endsWith('.md')) {
         fileList.push(filePath);
      }
    }
  });
  return fileList;
}

async function upload(bucket, filePath) {
  const s3 = new S3Client({ region: REGION });
  const key = relative(ROOT, filePath).replace(/\\/g, '/'); // Ensure forward slashes for S3 keys
  const body = readFileSync(filePath);
  const ContentType = contentTypeFor(key);
  
  console.log(`Uploading: ${key} (${ContentType})`);
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType }));
}

async function invalidate(distId) {
  console.log(`Invalidating CloudFront Distribution: ${distId}`);
  const cf = new CloudFrontClient({ region: REGION });
  const ref = 'deploy-' + Date.now();
  await cf.send(new CreateInvalidationCommand({ DistributionId: distId, InvalidationBatch: { CallerReference: ref, Paths: { Quantity: 1, Items: ['/*'] } } }));
  console.log('Invalidation created.');
}

// --- Main ---
(async function () {
  try {
    const { bucket, distId } = await getSiteOutputs();
    console.log(`Target Bucket: ${bucket}`);
    
    const files = getAllFiles(ROOT);
    console.log(`Found ${files.length} files to sync.`);
    
    // Upload in parallel (chunks of 10)
    const CHUNK_SIZE = 10;
    for (let i = 0; i < files.length; i += CHUNK_SIZE) {
        const chunk = files.slice(i, i + CHUNK_SIZE);
        await Promise.all(chunk.map(f => upload(bucket, f)));
    }
    
    await invalidate(distId);
    console.log('Static site deployment complete.');
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
})();
