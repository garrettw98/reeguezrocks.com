import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'

const { NEWSLETTER_TABLE, NEWSLETTER_BUCKET, NEWSLETTER_KEY } = process.env
const ddb = new DynamoDBClient({})
const s3 = new S3Client({})

function json(body, statusCode=200){
  return { statusCode, headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(body) }
}

export const handler = async (event) => {
  try {
    const method = event.requestContext?.http?.method || 'GET'
    if (method === 'OPTIONS') return { statusCode:204, headers:{} }
    if (method !== 'POST') return json({ error:'method_not_allowed' }, 405)
    const payload = event.body ? JSON.parse(event.body) : {}
    const email = (payload.email||'').trim().toLowerCase()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error:'invalid_email' }, 400)
    const name = (payload.name||'').toString().trim()
    const zip = (payload.zip||'').toString().trim()
    const ts = Date.now()
    await ddb.send(new PutItemCommand({
      TableName: NEWSLETTER_TABLE,
      Item: {
        email:{ S: email },
        createdAt:{ N: String(ts) },
        ...(name? { name:{ S: name } } : {}),
        ...(zip? { zip:{ S: zip } } : {})
      }
    }))

    // Also append to S3 CSV for easy export
    if (NEWSLETTER_BUCKET && NEWSLETTER_KEY){
      const iso = new Date(ts).toISOString()
      const esc = v => '"' + String(v ?? '').replaceAll('"','""') + '"'
      const row = `${esc(email)},${esc(name)},${esc(zip)},${esc(iso)}\n`
      let content = ''
      try {
        const res = await s3.send(new GetObjectCommand({ Bucket: NEWSLETTER_BUCKET, Key: NEWSLETTER_KEY }))
        const body = await res.Body.transformToString()
        content = body + row
      } catch (_e) {
        // Not found or first write: include header
        content = 'email,name,zip,createdAt\n' + row
      }
      await s3.send(new PutObjectCommand({ Bucket: NEWSLETTER_BUCKET, Key: NEWSLETTER_KEY, Body: content, ContentType: 'text/csv' }))
    }
    return json({ ok:true })
  } catch (e) {
    return json({ error:'newsletter_error' }, 500)
  }
}
