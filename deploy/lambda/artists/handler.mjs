import { S3Client, GetObjectCommand, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'

const { ARTISTS_BUCKET, ARTISTS_KEY, ADMIN_PASSWORD_PARAM } = process.env
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
  try{ await s3.send(new HeadObjectCommand({ Bucket: ARTISTS_BUCKET, Key: ARTISTS_KEY })); return true }catch{return false}
}

async function getArtists(){
  if (!(await s3Exists())){
    await s3.send(new PutObjectCommand({ Bucket: ARTISTS_BUCKET, Key: ARTISTS_KEY, Body: '[]', ContentType: 'application/json' }))
    return []
  }
  const res = await s3.send(new GetObjectCommand({ Bucket: ARTISTS_BUCKET, Key: ARTISTS_KEY }))
  const txt = await res.Body.transformToString()
  try { return JSON.parse(txt) } catch { return [] }
}

async function getLastModified(){
  try{
    const head = await s3.send(new HeadObjectCommand({ Bucket: ARTISTS_BUCKET, Key: ARTISTS_KEY }))
    return head.LastModified ? new Date(head.LastModified).toISOString() : null
  }catch{ return null }
}

async function putArtists(list){
  const body = JSON.stringify(list)
  await s3.send(new PutObjectCommand({ Bucket: ARTISTS_BUCKET, Key: ARTISTS_KEY, Body: body, ContentType: 'application/json' }))
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
      const [artists, updatedAt] = await Promise.all([ getArtists(), getLastModified() ])
      return json(200, { artists, updatedAt })
    }
    if (method === 'PUT'){
      const auth = event.headers?.authorization || event.headers?.Authorization || ''
      const token = auth.startsWith('Bearer ')? auth.slice(7): ''
      const expected = await getAdminPassword()
      if (!token || token !== expected) return unauthorized()
      const payload = event.body ? JSON.parse(event.body) : null
      const list = Array.isArray(payload?.artists) ? payload.artists : payload
      if (!Array.isArray(list)) return json(400, { error:'invalid_payload' })
      const clean = list.map(a=> ({
        name: String(a.name||'').trim(),
        soundcloud: a.soundcloud ? String(a.soundcloud) : undefined,
        instagram: a.instagram ? String(a.instagram) : undefined,
        image: a.image ? String(a.image) : undefined,
        imageSource: a.imageSource ? String(a.imageSource) : undefined,
        order: typeof a.order === 'number' ? a.order : undefined,
      }))
      await putArtists(clean)
      return json(200, { ok:true })
    }
    return json(405, { error:'method_not_allowed' })
  }catch(e){
    return json(500, { error:'artists_error' })
  }
}
