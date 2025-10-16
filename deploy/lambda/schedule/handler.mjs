import { S3Client, GetObjectCommand, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'
const { ARTISTS_BUCKET, SCHEDULE_KEY = 'schedule.json', ADMIN_PASSWORD_PARAM } = process.env
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
try{ await s3.send(new HeadObjectCommand({ Bucket: ARTISTS_BUCKET, Key: SCHEDULE_KEY })); return true }catch{return
false}
}

async function getSchedule(){
if (!(await s3Exists())){
    await s3.send(new PutObjectCommand({ Bucket: ARTISTS_BUCKET, Key: SCHEDULE_KEY, Body: '{}', ContentType:
'application/json' }))
    return {}
}
const res = await s3.send(new GetObjectCommand({ Bucket: ARTISTS_BUCKET, Key: SCHEDULE_KEY }))
const txt = await res.Body.transformToString()
try { return JSON.parse(txt) } catch { return {} }
}

async function putSchedule(obj){
const body = JSON.stringify(obj)
await s3.send(new PutObjectCommand({ Bucket: ARTISTS_BUCKET, Key: SCHEDULE_KEY, Body: body, ContentType:
'application/json' }))
}

function json(statusCode, body){
return { statusCode, headers: { 'Content-Type':'application/json', 'Cache-Control':'no-store, max-age=0' }, body:
JSON.stringify(body) }
}

function unauthorized(){ return { statusCode:401, headers:{ 'WWW-Authenticate': 'Bearer realm="admin"' },
body:'' } }

export const handler = async (event) => {
  try{
    const method = event.requestContext?.http?.method || 'GET'
    if (method === 'OPTIONS') return { statusCode:204, headers:{} }
    const auth = event.headers?.authorization || event.headers?.Authorization || ''
    const token = auth.startsWith('Bearer ')? auth.slice(7): ''
    let expected = null
    try { expected = await getAdminPassword() } catch {}

    if (method === 'GET'){
      const schedule = await getSchedule();
      const isAdmin = token && expected && token === expected
      if (isAdmin){
        return json(200, Object.assign({}, schedule, { admin:true }))
      }
      if (schedule?.meta?.published === true){
        return json(200, schedule)
      }
      return json(200, { published:false })
    }
    if (method === 'PUT'){
      if (!token || !expected || token !== expected) return unauthorized()
      const payload = event.body ? JSON.parse(event.body) : null
      const clean = (payload && typeof payload === 'object') ? payload : {}
      await putSchedule(clean)
      return json(200, { ok:true })
    }
    return json(405, { error:'method_not_allowed' })
  }catch(e){
    return json(500, { error:'schedule_error' })
  }
}
