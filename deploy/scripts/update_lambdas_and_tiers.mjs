#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LambdaClient, UpdateFunctionCodeCommand, ListFunctionsCommand } from '@aws-sdk/client-lambda';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const DIST = join(ROOT, 'dist');
const REGION = process.env.AWS_REGION || 'us-east-1';

function getApiBase(){
  const cfgPath = join(ROOT, 'config.js');
  const txt = readFileSync(cfgPath, 'utf8');
  const m = txt.match(/PAYMENTS_API_BASE\s*=\s*"([^"]+)"/);
  if (!m) throw new Error('Could not find PAYMENTS_API_BASE in config.js');
  return m[1];
}

async function findFunctionNames(){
  const lambda = new LambdaClient({ region: REGION });
  const names = { checkout:null, webhook:null, inventory:null, tiers:null };
  let Marker;
  do{
    const res = await lambda.send(new ListFunctionsCommand({ Marker }));
    for (const fn of res.Functions||[]){
      const n = fn.FunctionName || '';
      if (/checkout$/.test(n)) names.checkout = n;
      if (/webhook$/.test(n)) names.webhook = n;
      if (/inventory$/.test(n)) names.inventory = n;
      if (/tiers$/.test(n)) names.tiers = n;
    }
    Marker = res.NextMarker;
  }while(Marker);
  if (!names.checkout || !names.webhook || !names.inventory || !names.tiers){
    throw new Error('Could not locate one or more Lambda function names (checkout/webhook/inventory/tiers).');
  }
  return names;
}

async function updateLambdas(){
  const lambda = new LambdaClient({ region: REGION });
  const names = await findFunctionNames();
  const artifacts = {
    checkout: readFileSync(join(DIST, 'checkout.zip')),
    webhook:  readFileSync(join(DIST, 'webhook.zip')),
    inventory: readFileSync(join(DIST, 'inventory.zip')),
    tiers: readFileSync(join(DIST, 'tiers.zip')),
  };
  for (const [k,zip] of Object.entries(artifacts)){
    const fnName = names[k];
    process.stdout.write(`Updating ${fnName}... `);
    await lambda.send(new UpdateFunctionCodeCommand({ FunctionName: fnName, ZipFile: zip }));
    console.log('done');
  }
}

async function getAdminPassword(){
  const ssm = new SSMClient({ region: REGION });
  const r = await ssm.send(new GetParameterCommand({ Name: '/reeguezrocks/admin/password', WithDecryption: true }));
  return r.Parameter?.Value;
}

async function updateTiers(){
  const apiBase = getApiBase();
  const token = await getAdminPassword();
  if (!token) throw new Error('Admin password not found in SSM');
  const tiersTxt = readFileSync(join(ROOT, 'deploy/tiers.json'), 'utf8');
  const tiers = JSON.parse(tiersTxt);
  const res = await fetch(`${apiBase}/tiers`, {
    method: 'PUT',
    headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ tiers })
  });
  if (!res.ok){
    const t = await res.text();
    throw new Error(`PUT /tiers failed: ${res.status} ${t}`);
  }
  console.log('Tiers updated in S3 via admin endpoint.');
}

(async function(){
  try{
    console.log('Updating Lambda functions (checkout, webhook, inventory)...');
    await updateLambdas();
    console.log('Updating tiers via admin endpoint...');
    await updateTiers();
    console.log('All done.');
  }catch(e){
    console.error('Error:', e);
    process.exit(1);
  }
})();
