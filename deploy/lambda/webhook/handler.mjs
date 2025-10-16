import crypto from 'node:crypto'
import { DynamoDBClient, UpdateItemCommand, PutItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'
import { S3Client, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'

const { INVENTORY_TABLE, ORDERS_TABLE, STRIPE_SECRET_PARAM, STRIPE_WEBHOOK_SECRET_PARAM, TIER_CONFIG, NEWSLETTER_TABLE, FROM_EMAIL, SITE_URL, TIERS_BUCKET, TIERS_KEY = 'tiers.json' } = process.env
const ddb = new DynamoDBClient({})
const ses = new SESClient({})
const ssm = new SSMClient({})
const s3 = new S3Client({})

let stripeKeyCache = null
let webhookSecretCache = null
async function getStripeKey() {
  if (stripeKeyCache) return stripeKeyCache
  const resp = await ssm.send(new GetParameterCommand({ Name: STRIPE_SECRET_PARAM, WithDecryption: true }))
  stripeKeyCache = resp.Parameter?.Value
  return stripeKeyCache
}
async function getWebhookSecret() {
  if (webhookSecretCache) return webhookSecretCache
  const resp = await ssm.send(new GetParameterCommand({ Name: STRIPE_WEBHOOK_SECRET_PARAM, WithDecryption: true }))
  webhookSecretCache = resp.Parameter?.Value
  return webhookSecretCache
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
async function parseTierConfig(){ const now=Date.now(); if (tiersCache.data && (now - tiersCache.at) < 60000) return tiersCache.data; const data=await loadTiers(); tiersCache={at:now,data}; return data }
async function findTier(tierId){ const cfg=await parseTierConfig(); return cfg.find(t=> t.id===tierId) }

function verifyStripeSignature(rawBody, sigHeader, secret) {
  // Stripe sends: t=timestamp,v1=signature
  const parts = Object.fromEntries(sigHeader.split(',').map(p => p.split('=')))
  const signedPayload = `${parts.t}.${rawBody}`
  const expected = crypto.createHmac('sha256', secret).update(signedPayload, 'utf8').digest('hex')
  return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(parts.v1, 'hex'))
}

async function handleCheckoutCompleted(eventObj) {
  const data = eventObj.data?.object || {}
  const sessionId = data.id
  const tierId = data.metadata?.tier || data.client_reference_id
  const paymentStatus = data.payment_status
  if (paymentStatus !== 'paid' || !tierId) return { ok: true }

  const tier = await findTier(tierId) || { id: tierId, label: tierId, price: null }

  // Idempotency: if already marked paid, skip increment
  try {
    const existing = await ddb.send(new GetItemCommand({
      TableName: ORDERS_TABLE,
      Key: { sessionId: { S: sessionId } },
      ProjectionExpression: '#s',
      ExpressionAttributeNames: { '#s': 'status' }
    }))
    if (existing.Item?.status?.S === 'paid') return { ok: true }
  } catch {}

  const limit = typeof tier.limit === 'number' ? tier.limit : 0
  if (limit > 0) {
    try {
      await ddb.send(new UpdateItemCommand({
        TableName: INVENTORY_TABLE,
        Key: { tier: { S: tierId } },
        UpdateExpression: 'SET sold = if_not_exists(sold, :zero) + :one',
        ConditionExpression: 'attribute_not_exists(sold) OR sold < :limit',
        ExpressionAttributeValues: {
          ':one': { N: '1' },
          ':zero': { N: '0' },
          ':limit': { N: String(limit) }
        }
      }))
    } catch (err) {
      // If over limit, do not fail email/receipt; just skip increment
    }
  }

  const amountCents = (typeof data.amount_total === 'number') ? data.amount_total : Math.round((tier.price || 0) * 100)
  await ddb.send(new PutItemCommand({
    TableName: ORDERS_TABLE,
    Item: {
      sessionId: { S: sessionId },
      tier: { S: tierId },
      status: { S: 'paid' },
      amount: { N: String(amountCents) },
      completedAt: { N: String(Date.now()) }
    }
  })).catch(() => {})

  // De-duplicate newsletter: insert if not exists
  try {
    const email = data.customer_details?.email || data.customer_email
    if (email && NEWSLETTER_TABLE){
      await ddb.send(new PutItemCommand({
        TableName: NEWSLETTER_TABLE,
        Item: { email: { S: email.toLowerCase() }, createdAt: { N: String(Date.now()) } },
        ConditionExpression: 'attribute_not_exists(email)'
      })).catch(()=>{})
    }
  } catch {}

  // Send confirmation email via SES
  try {
    const to = data.customer_details?.email || data.customer_email
    if (to && FROM_EMAIL){
      const subject = `Your Reeguez Rocks 2025 Order Confirmation`
      const html = `<!DOCTYPE html><html><body style="background:#0b0b0f;color:#fff;font-family:Arial,sans-serif;padding:20px;">
        <div style="max-width:640px;margin:0 auto;background:#141420;border:1px solid rgba(255,255,255,.12);border-radius:12px;overflow:hidden">
          <div style="padding:16px 16px 0 16px;text-align:center">
            <img src="${SITE_URL}/RR25Patch.png" alt="Reeguez Rocks 2025" style="max-width:220px;height:auto"/>
            <h1 style="margin:10px 0 0 0;color:#f7a602;font-size:22px;">Order Confirmation</h1>
            <p style="margin:6px 0 0 0;color:#cfd1d6">Thanks for your purchase! See you in the Mojave.</p>
          </div>
          <div style="padding:16px;color:#eaeaea">
            <p style="margin:0 0 10px">Order: <strong>${sessionId}</strong></p>
            <p style="margin:0 0 10px">Tier: <strong>${tier.label || tierId}</strong></p>
            <p style="margin:0 0 10px">Amount: <strong>$${(amountCents/100).toFixed(2)}</strong></p>
            <hr style="border:none;border-top:1px solid rgba(255,255,255,.12);margin:14px 0"/>
            <p style="margin:0 0 6px">Join the Discord: <a href="https://discord.gg/kyfR6vXwgG" style="color:#8A2BE2">discord.gg/kyfR6vXwgG</a></p>
            <p style="margin:0 0 6px">Event site: <a href="${SITE_URL}" style="color:#8A2BE2">${SITE_URL}</a></p>
            <p style="margin:10px 0 0;color:#9aa1ad;font-size:12px">From: ${FROM_EMAIL}</p>
          </div>
        </div>
      </body></html>`
      const params = new SendEmailCommand({
        Source: FROM_EMAIL,
        Destination: { ToAddresses: [to] },
        Message: {
          Subject: { Data: subject },
          Body: { Html: { Data: html } }
        }
      })
      await ses.send(params).catch(()=>{})
    }
  } catch {}

  return { ok: true }
}

export const handler = async (event) => {
  // Must use raw body for signature verification
  const raw = event.body || ''
  const isBase64 = event.isBase64Encoded
  const bodyRaw = isBase64 ? Buffer.from(raw, 'base64').toString('utf8') : raw
  const sig = event.headers?.['stripe-signature'] || event.headers?.['Stripe-Signature']
  if (!sig) return { statusCode: 400, body: 'missing signature' }

  const secret = await getWebhookSecret()
  const valid = verifyStripeSignature(bodyRaw, sig, secret)
  if (!valid) return { statusCode: 400, body: 'invalid signature' }

  const evt = JSON.parse(bodyRaw)
  if (evt.type === 'checkout.session.completed') {
    await handleCheckoutCompleted(evt)
  }
  return { statusCode: 200, body: 'ok' }
}
