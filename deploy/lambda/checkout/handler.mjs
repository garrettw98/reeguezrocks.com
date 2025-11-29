import crypto from 'node:crypto'

const { INVENTORY_TABLE, ORDERS_TABLE, STRIPE_SECRET_PARAM, SUCCESS_URL, CANCEL_URL, TIER_CONFIG, TIERS_BUCKET, TIERS_KEY = 'tiers.json' } = process.env
import { DynamoDBClient, GetItemCommand, PutItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb'
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'
import { S3Client, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'

const ddb = new DynamoDBClient({})
const ssm = new SSMClient({})
const s3 = new S3Client({})

let stripeKeyCache = null
async function getStripeKey() {
  if (stripeKeyCache) return stripeKeyCache
  const resp = await ssm.send(new GetParameterCommand({ Name: STRIPE_SECRET_PARAM, WithDecryption: true }))
  stripeKeyCache = resp.Parameter?.Value
  return stripeKeyCache
}

let tiersCache = { at:0, data:null }
async function exists(){ try{ await s3.send(new HeadObjectCommand({ Bucket: TIERS_BUCKET, Key: TIERS_KEY })); return true }catch{return false} }
async function loadTiers(){
  try{
    if (TIERS_BUCKET && await exists()){
      const res = await s3.send(new GetObjectCommand({ Bucket: TIERS_BUCKET, Key: TIERS_KEY }))
      const txt = await res.Body.transformToString()
      const data = JSON.parse(txt)
      if (Array.isArray(data)) return data
      if (Array.isArray(data?.tiers)) return data.tiers
    }
  }catch{}
  try { return JSON.parse(TIER_CONFIG) } catch { return [] }
}
async function parseTierConfig(){
  const now=Date.now()
  if (tiersCache.data && (now - tiersCache.at) < 60000) return tiersCache.data
  const data = await loadTiers()
  tiersCache = { at: now, data }
  return data
}

function isActiveTier(t, nowMs){
  const start = t.startAt ? Date.parse(t.startAt) : null
  const end = t.endAt ? Date.parse(t.endAt) : null
  const afterStart = (start==null) || (nowMs >= start)
  const beforeEnd = (end==null) || (nowMs < end)
  return afterStart && beforeEnd
}

function tierStartMs(t){
  const val = t.startAt ? Date.parse(t.startAt) : null
  return Number.isFinite(val) ? val : null
}

async function selectTier(requestedTierId){
  const cfg = await parseTierConfig()
  const now = Date.now()
  const isAvailableNow = (tier)=> isActiveTier(tier, now)

  if (requestedTierId){
    const tier = cfg.find(t => t.id === requestedTierId)
    if (!tier) return { error: { statusCode: 404, body: JSON.stringify({ error: 'invalid_tier' }) } }
    if (!isAvailableNow(tier)) return { error: { statusCode: 409, body: JSON.stringify({ error: 'tier_unavailable' }) } }
    return { tier }
  }

  const active = cfg.filter(isAvailableNow)
  if (active.length){
    active.sort((a,b)=>{
      const as = tierStartMs(a) ?? 0
      const bs = tierStartMs(b) ?? 0
      return as - bs
    })
    return { tier: active[0] }
  }

  const future = cfg
    .map(t => ({ tier:t, start: tierStartMs(t) }))
    .filter(x => x.start != null && x.start > now)
    .sort((a,b)=> a.start - b.start)
  if (future.length){
    return { tier: future[0].tier }
  }

  return { error: { statusCode: 400, body: JSON.stringify({ error: 'no_active_tier' }) } }
}

async function getSoldCount(tierId) {
  const r = await ddb.send(new GetItemCommand({ TableName: INVENTORY_TABLE, Key: { tier: { S: tierId } } }))
  return r.Item?.sold?.N ? parseInt(r.Item.sold.N, 10) : 0
}

async function ensureTierRow(tierId) {
  await ddb.send(new PutItemCommand({
    TableName: INVENTORY_TABLE,
    Item: { tier: { S: tierId }, sold: { N: '0' } },
    ConditionExpression: 'attribute_not_exists(tier)'
  })).catch(() => {})
}

async function createCheckoutSession({ tierId, email, referral }) {
  const { tier, error } = await selectTier(tierId)
  if (error) return error

  const effectiveTierId = tier.id

  await ensureTierRow(effectiveTierId)
  const sold = await getSoldCount(effectiveTierId)
  const limit = typeof tier.limit === 'number' ? tier.limit : 0
  if (limit > 0 && sold >= limit) {
    return { statusCode: 409, body: JSON.stringify({ error: 'Tier sold out' }) }
  }

  const stripeKey = await getStripeKey()
  const params = new URLSearchParams()
  params.append('mode', 'payment')
  params.append('success_url', SUCCESS_URL)
  params.append('cancel_url', CANCEL_URL)
  params.append('client_reference_id', effectiveTierId)
  if (email) params.append('customer_email', email)
  params.append('metadata[tier]', effectiveTierId)
  if (tierId && tierId !== effectiveTierId){
    params.append('metadata[requested_tier]', String(tierId))
  }
  // Track referral for affiliate program and apply 5% discount
  if (referral) {
    params.append('metadata[referral]', String(referral))
    // Apply 5% discount using Stripe's automatic discount
    params.append('discounts[0][coupon]', 'AFFILIATE5')
  }
  params.append('line_items[0][quantity]', '1')
  params.append('line_items[0][price_data][currency]', 'usd')
  params.append('line_items[0][price_data][unit_amount]', String(Math.round(tier.price * 100)))
  params.append('line_items[0][price_data][product_data][name]', tier.label)

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  })

  if (!res.ok) {
    const errText = await res.text()
    return { statusCode: 500, body: JSON.stringify({ error: 'Stripe error', detail: errText }) }
  }
  const session = await res.json()

  // Optionally record a pre-order record
  const now = Date.now()
  await ddb.send(new PutItemCommand({
    TableName: ORDERS_TABLE,
    Item: {
      sessionId: { S: session.id },
      tier: { S: effectiveTierId },
      createdAt: { N: String(now) },
      status: { S: 'created' }
    }
  })).catch(() => {})

  return { statusCode: 200, body: JSON.stringify({ url: session.url }) }
}

export const handler = async (event) => {
  try {
    // HTTP API (v2) event
    const method = event.requestContext?.http?.method || 'GET'
    if (method === 'OPTIONS') {
      return cors(200, '')
    }
    const body = event.body ? JSON.parse(event.body) : {}
    const tierId = body.tierId
    const email = body.email
    const referral = body.referral
    const resp = await createCheckoutSession({ tierId, email, referral })
    return cors(resp.statusCode, resp.body)
  } catch (e) {
    return cors(500, JSON.stringify({ error: 'internal_error', detail: String(e) }))
  }
}

function cors(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json'
    },
    body
  }
}
