import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb'
import { S3Client, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'

const { INVENTORY_TABLE, TIER_CONFIG, TIERS_BUCKET, TIERS_KEY = 'tiers.json' } = process.env
const ddb = new DynamoDBClient({})
const s3 = new S3Client({})

async function exists(){ try{ await s3.send(new HeadObjectCommand({ Bucket: TIERS_BUCKET, Key: TIERS_KEY })); return true }catch{return false} }
async function fetchOverride(){
  try{
    if (TIERS_BUCKET && await exists()){
      const res = await s3.send(new GetObjectCommand({ Bucket: TIERS_BUCKET, Key: TIERS_KEY }))
      const txt = await res.Body.transformToString()
      const data = JSON.parse(txt)
      if (Array.isArray(data)) return data
      if (Array.isArray(data?.tiers)) return data.tiers
    }
  }catch{}
  return null
}
async function parseConfig(){
  const o = await fetchOverride()
  if (o) return o
  try { return JSON.parse(TIER_CONFIG) } catch { return [] }
}

async function getSold(tierId){
  const r = await ddb.send(new GetItemCommand({ TableName: INVENTORY_TABLE, Key: { tier: { S: tierId } } }))
  return r.Item?.sold?.N ? parseInt(r.Item.sold.N,10) : 0
}

export const handler = async () => {
  try {
    const tiers = await parseConfig()
    const out = []
    for (const t of tiers){
      const sold = await getSold(t.id)
      const limit = typeof t.limit === 'number' ? t.limit : null
      const available = limit != null ? Math.max(0, limit - sold) : null
      const startAt = t.startAt || null
      const endAt = t.endAt || null
      const startAtMs = startAt ? Date.parse(startAt) : null
      const endAtMs = endAt ? Date.parse(endAt) : null
      out.push({ id:t.id, label:t.label, price:t.price, basePrice:t.basePrice, limit, sold, available, startAt, endAt, startAtMs, endAtMs })
    }
    return {
      statusCode: 200,
      headers: { 'Content-Type':'application/json', 'Cache-Control':'no-store, max-age=0' },
      body: JSON.stringify({ tiers: out })
    }
  } catch (e) {
    return { statusCode: 500, headers:{ 'Cache-Control':'no-store, max-age=0' }, body: JSON.stringify({ error:'inventory_error' }) }
  }
}
