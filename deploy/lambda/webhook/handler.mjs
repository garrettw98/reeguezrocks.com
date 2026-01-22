import crypto from 'node:crypto'
import { DynamoDBClient, UpdateItemCommand, PutItemCommand, GetItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'
import { S3Client, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'

const { INVENTORY_TABLE, ORDERS_TABLE, STRIPE_SECRET_PARAM, STRIPE_WEBHOOK_SECRET_PARAM, TIER_CONFIG, NEWSLETTER_TABLE, FROM_EMAIL, SITE_URL, TIERS_BUCKET, TIERS_KEY = 'tiers.json', AFFILIATE_TABLE } = process.env
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

// Credit affiliate for a sale and send notification email
async function creditAffiliate(referralSlug, amountCents, tierLabel, quantity = 1) {
  if (!referralSlug || !AFFILIATE_TABLE) return

  try {
    // Find affiliate by slug
    const result = await ddb.send(new ScanCommand({
      TableName: AFFILIATE_TABLE,
      FilterExpression: 'slug = :slug',
      ExpressionAttributeValues: { ':slug': { S: referralSlug } },
      Limit: 1
    }))

    if (!result.Items || result.Items.length === 0) return

    const affiliate = result.Items[0]
    const affiliateSlug = affiliate.slug.S
    const affiliateEmail = affiliate.email?.S
    const affiliateName = affiliate.name?.S || 'Affiliate'
    const currentEarnings = parseInt(affiliate.earnings?.N || '0', 10)
    const currentTickets = parseInt(affiliate.ticketsSold?.N || '0', 10)

    const commissionCents = 500 * quantity

    // Credit $5 per ticket and increment tickets sold
    await ddb.send(new UpdateItemCommand({
      TableName: AFFILIATE_TABLE,
      Key: { slug: { S: affiliateSlug } },
      UpdateExpression: 'SET ticketsSold = if_not_exists(ticketsSold, :zero) + :qty, earnings = if_not_exists(earnings, :zero) + :comm',
      ExpressionAttributeValues: {
        ':zero': { N: '0' },
        ':qty': { N: String(quantity) },
        ':comm': { N: String(commissionCents) }
      }
    }))

    console.log(`Credited affiliate ${affiliateSlug} for ${quantity} tickets`)

    // Send notification email to affiliate
    if (affiliateEmail && FROM_EMAIL) {
      const newEarnings = currentEarnings + commissionCents
      const newTickets = currentTickets + quantity
      const subject = `You just earned $${(commissionCents / 100).toFixed(0)}! - Reeguez Rocks Affiliate`
      const html = `<!DOCTYPE html><html><body style="background:#0b0b0f;color:#fff;font-family:Arial,sans-serif;padding:20px;">
        <div style="max-width:640px;margin:0 auto;background:#141420;border:1px solid rgba(255,255,255,.12);border-radius:12px;overflow:hidden">
          <div style="padding:20px;text-align:center;background:rgba(247,166,2,0.1)">
            <h1 style="margin:0;color:#f7a602;font-size:24px;">Cha-ching! $${(commissionCents / 100).toFixed(0)} Earned</h1>
          </div>
          <div style="padding:20px;color:#eaeaea">
            <p style="margin:0 0 16px">Hey ${affiliateName}!</p>
            <p style="margin:0 0 16px">Someone just bought ${quantity} ticket(s) using your referral link. You earned <strong style="color:#f7a602">$${(commissionCents / 100).toFixed(2)}</strong>!</p>
            <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:16px;margin:0 0 16px">
              <p style="margin:0 0 8px;color:#9aa1ad;font-size:14px">Ticket Type</p>
              <p style="margin:0;font-weight:600">${tierLabel || 'Festival Pass'}</p>
            </div>
            <div style="display:flex;gap:16px;margin-bottom:16px">
              <div style="flex:1;background:rgba(255,255,255,0.05);border-radius:8px;padding:16px;text-align:center">
                <p style="margin:0;font-size:24px;font-weight:700;color:#f7a602">$${(newEarnings / 100).toFixed(0)}</p>
                <p style="margin:4px 0 0;color:#9aa1ad;font-size:12px">Total Earned</p>
              </div>
              <div style="flex:1;background:rgba(255,255,255,0.05);border-radius:8px;padding:16px;text-align:center">
                <p style="margin:0;font-size:24px;font-weight:700;color:#f7a602">${newTickets}</p>
                <p style="margin:4px 0 0;color:#9aa1ad;font-size:12px">Tickets Sold</p>
              </div>
            </div>
            <p style="margin:0 0 16px;font-size:14px;color:#9aa1ad">Keep sharing your link to earn more! Every ticket = $5 in your pocket.</p>
            <a href="https://reeguezrocks.com/affiliate-dashboard.html" style="display:inline-block;padding:12px 24px;background:#f7a602;color:#0b0b0f;border-radius:6px;text-decoration:none;font-weight:600">View Your Dashboard</a>
          </div>
        </div>
      </body></html>`

      await ses.send(new SendEmailCommand({
        Source: FROM_EMAIL,
        Destination: { ToAddresses: [affiliateEmail] },
        Message: {
          Subject: { Data: subject },
          Body: { Html: { Data: html } }
        }
      })).catch(e => console.error('Failed to send affiliate notification:', e))
    }
  } catch (err) {
    console.error('Failed to credit affiliate:', err)
  }
}

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
  const allTiersStr = data.metadata?.all_tiers || tierId
  const quantitiesStr = data.metadata?.quantities || '1'
  const referralSlug = data.metadata?.referral // Affiliate referral slug
  const paymentStatus = data.payment_status
  if (paymentStatus !== 'paid' || !tierId) return { ok: true }

  // Parse all tiers and quantities
  const allTierIds = allTiersStr.split(',').filter(Boolean)
  const quantities = quantitiesStr.split(',').map(q => parseInt(q, 10) || 1)
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

  // Increment inventory for each tier purchased
  for (let i = 0; i < allTierIds.length; i++) {
    const itemTierId = allTierIds[i]
    const itemQty = quantities[i] || 1
    const itemTier = await findTier(itemTierId) || { id: itemTierId, limit: 0 }
    const limit = typeof itemTier.limit === 'number' ? itemTier.limit : 0

    if (limit > 0) {
      try {
        await ddb.send(new UpdateItemCommand({
          TableName: INVENTORY_TABLE,
          Key: { tier: { S: itemTierId } },
          UpdateExpression: 'SET sold = if_not_exists(sold, :zero) + :qty',
          ConditionExpression: 'attribute_not_exists(sold) OR sold + :qty <= :limit',
          ExpressionAttributeValues: {
            ':qty': { N: String(itemQty) },
            ':zero': { N: '0' },
            ':limit': { N: String(limit) }
          }
        }))
      } catch (err) {
        // If over limit, do not fail email/receipt; just skip increment
      }
    }
  }

  const amountCents = (typeof data.amount_total === 'number') ? data.amount_total : Math.round((tier.price || 0) * 100)
  
  // Calculate Venue and Stripe Fees to find net Crowdfund amount
  // Venue fee: $10 per ticket per day
  const dayMap = { 'ga-4-day': 4, 'ga-3-day': 3, 'ga-2-day': 2, 'ga-1-day': 1 }
  let totalVenueFeeCents = 0
  let totalTicketsSold = 0
  for (let i = 0; i < allTierIds.length; i++) {
    const tid = allTierIds[i]
    const qty = quantities[i] || 1
    const days = dayMap[tid] || 0
    if (days > 0) {
        totalVenueFeeCents += (days * 10 * 100) * qty
        totalTicketsSold += qty
    }
  }

  // Stripe fee: 2.9% + 30c
  const stripeFeeCents = Math.round(amountCents * 0.029) + 30
  
  // Affiliate fee: $5 per ticket if referral was used
  const affiliateCommissionCents = referralSlug ? (totalTicketsSold * 500) : 0

  const netCrowdfundCents = Math.max(0, amountCents - totalVenueFeeCents - stripeFeeCents - affiliateCommissionCents)

  await ddb.send(new PutItemCommand({
    TableName: ORDERS_TABLE,
    Item: {
      sessionId: { S: sessionId },
      tier: { S: tierId },
      allTiers: { S: allTiersStr },
      quantities: { S: quantitiesStr },
      status: { S: 'paid' },
      amount: { N: String(amountCents) },
      netCrowdfund: { N: String(netCrowdfundCents) },
      referral: referralSlug ? { S: referralSlug } : { NULL: true },
      completedAt: { N: String(Date.now()) }
    }
  })).catch(() => {})

  // Update Global Progress
  await ddb.send(new UpdateItemCommand({
    TableName: INVENTORY_TABLE,
    Key: { tier: { S: 'GLOBAL_STATS' } },
    UpdateExpression: 'SET raised = if_not_exists(raised, :zero) + :val, totalBackers = if_not_exists(totalBackers, :zero) + :one',
    ExpressionAttributeValues: {
      ':val': { N: String(Math.floor(netCrowdfundCents / 100)) },
      ':zero': { N: '0' },
      ':one': { N: '1' }
    }
  })).catch((e) => console.error('Global stats update failed:', e))

  // Credit affiliate if this sale came from a referral
  if (referralSlug) {
    await creditAffiliate(referralSlug, amountCents, tier.label, totalTicketsSold)
  }

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
      // Build items list for email
      const itemsHtml = await Promise.all(allTierIds.map(async (tid, idx) => {
        const itemTier = await findTier(tid) || { label: tid }
        const qty = quantities[idx] || 1
        return `<p style="margin:0 0 6px">${itemTier.label}${qty > 1 ? ` x${qty}` : ''}</p>`
      }))
      const subject = `Your Reeguez Rocks 2026 Order Confirmation`
      const html = `<!DOCTYPE html><html><body style="background:#0b0b0f;color:#fff;font-family:Arial,sans-serif;padding:20px;">
        <div style="max-width:640px;margin:0 auto;background:#141420;border:1px solid rgba(255,255,255,.12);border-radius:12px;overflow:hidden">
          <div style="padding:16px 16px 0 16px;text-align:center">
            <img src="${SITE_URL}/RR26Logo.png" alt="Reeguez Rocks 2026" style="max-width:220px;height:auto"/>
            <h1 style="margin:10px 0 0 0;color:#f7a602;font-size:22px;">Order Confirmation</h1>
            <p style="margin:6px 0 0 0;color:#cfd1d6">Thanks for your purchase! See you in the mountains.</p>
          </div>
          <div style="padding:16px;color:#eaeaea">
            <p style="margin:0 0 10px">Order: <strong>${sessionId}</strong></p>
            <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:12px;margin:0 0 10px">
              <p style="margin:0 0 8px;color:#9aa1ad;font-size:12px;text-transform:uppercase">Items Purchased</p>
              ${itemsHtml.join('')}
            </div>
            <p style="margin:0 0 10px">Total: <strong style="color:#f7a602">$${(amountCents/100).toFixed(2)}</strong></p>
            <hr style="border:none;border-top:1px solid rgba(255,255,255,.12);margin:14px 0"/>
            <p style="margin:0 0 6px">Follow us on Instagram: <a href="https://www.instagram.com/reeguez_rocks_festival/" style="color:#E1306C">@reeguez_rocks_festival</a></p>
            <p style="margin:0 0 6px">Event site: <a href="${SITE_URL}" style="color:#f7a602">${SITE_URL}</a></p>
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
