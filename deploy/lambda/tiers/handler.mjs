import { S3Client, GetObjectCommand, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'

const { TIERS_BUCKET, TIERS_KEY = 'tiers.json', ADMIN_PASSWORD_PARAM, TIER_CONFIG } = process.env
const s3 = new S3Client({})
const ssm = new SSMClient({})

let cachedPwd = null
async function getAdminPassword(){
  if (cachedPwd) return cachedPwd
  const r = await ssm.send(new GetParameterCommand({ Name: ADMIN_PASSWORD_PARAM, WithDecryption: true }))
  cachedPwd = r.Parameter?.Value || ''
  return cachedPwd
}

async function s3Exists(){
  try{ await s3.send(new HeadObjectCommand({ Bucket: TIERS_BUCKET, Key: TIERS_KEY })); return true }catch{return false}
}

async function getTiers(){
  try{
    if (await s3Exists()){
      const res = await s3.send(new GetObjectCommand({ Bucket: TIERS_BUCKET, Key: TIERS_KEY }))
      const txt = await res.Body.transformToString()
      const data = JSON.parse(txt)
      if (Array.isArray(data)) return data
      if (Array.isArray(data?.tiers)) return data.tiers
    }
  }catch{}
  try{ return JSON.parse(TIER_CONFIG) }catch{ return [] }
}

async function putTiers(list){
  const body = JSON.stringify(list)
  await s3.send(new PutObjectCommand({ Bucket: TIERS_BUCKET, Key: TIERS_KEY, Body: body, ContentType: 'application/json' }))
}

function json(statusCode, body){
  return { statusCode, headers: { 'Content-Type':'application/json', 'Cache-Control':'no-store, max-age=0' }, body: JSON.stringify(body) }
}

function unauthorized(){ return { statusCode:401, headers:{ 'WWW-Authenticate': 'Bearer realm="admin"' }, body:'' } }

export const handler = async (event) => {
  try{
    const method = event.requestContext?.http?.method || 'GET'
    if (method === 'OPTIONS') return { statusCode:204, headers:{} }
    if (method === 'GET'){
      const tiers = await getTiers()
      return json(200, { tiers })
    }
    if (method === 'PUT'){
      const auth = event.headers?.authorization || event.headers?.Authorization || ''
      const token = auth.startsWith('Bearer ')? auth.slice(7): ''
      const expected = await getAdminPassword()
      if (!token || token !== expected) return unauthorized()
      const payload = event.body ? JSON.parse(event.body) : null
      const list = Array.isArray(payload?.tiers) ? payload.tiers : payload
      if (!Array.isArray(list)) return json(400, { error:'invalid_payload' })
      const clean = list.map(t=> ({
        id: String(t.id||'').trim() || 'tier',
        label: String(t.label||t.id||'').trim(),
        price: Number(t.price||0),
        limit: (typeof t.limit==='number') ? t.limit : (t.limit==null? null : Number(t.limit)||0),
        startAt: t.startAt ? String(t.startAt) : null,
        endAt: t.endAt ? String(t.endAt) : null
      }))
      await putTiers(clean)
      return json(200, { ok:true })
    }
    return json(405, { error:'method_not_allowed' })
  }catch(e){
    return json(500, { error:'tiers_error' })
  }
}
