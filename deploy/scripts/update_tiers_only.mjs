#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const REGION = process.env.AWS_REGION || 'us-east-1';

function getApiBase(){
  const cfgPath = join(ROOT, 'config.js');
  const txt = readFileSync(cfgPath, 'utf8');
  const m = txt.match(/PAYMENTS_API_BASE\s*=\s*"([^"]+)"/);
  if (!m) throw new Error('Could not find PAYMENTS_API_BASE in config.js');
  return m[1];
}

async function getAdminPassword(){
  const ssm = new SSMClient({ region: REGION });
  const r = await ssm.send(new GetParameterCommand({ Name: '/reeguezrocks/admin/password', WithDecryption: true }));
  return r.Parameter?.Value;
}

(async function(){
  try{
    const apiBase = getApiBase();
    const token = await getAdminPassword();
    if (!token) throw new Error('Admin password not found in SSM');
    const tiers = JSON.parse(readFileSync(join(ROOT, 'deploy/tiers.json'), 'utf8'));
    const res = await fetch(`${apiBase}/tiers`, {
      method: 'PUT', headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ tiers })
    });
    if (!res.ok){ throw new Error(await res.text()); }
    console.log('Tiers updated.');
  }catch(e){ console.error('Error:', e); process.exit(1); }
})();
