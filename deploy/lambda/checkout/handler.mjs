import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb'
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

const region = process.env.AWS_REGION || 'us-east-1'
const ssm = new SSMClient({ region })
const s3 = new S3Client({ region })
const ddb = new DynamoDBClient({ region })

let stripeKey = null
let tiers = null

export const handler = async (event) => {
  console.log('Event received:', JSON.stringify(event))
  
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return { 
      statusCode: 200, 
      headers: { 
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'Content-Type' 
      } 
    }
  }

  try {
    // 1. Fetch Configs (if not cached)
    if (!stripeKey) {
      const paramName = process.env.STRIPE_SECRET_PARAM || '/reeguezrocks/stripe/secret'
      const ssmRes = await ssm.send(new GetParameterCommand({ Name: paramName, WithDecryption: true }))
      stripeKey = ssmRes.Parameter.Value
    }

    if (!tiers) {
      const bucket = process.env.TIERS_BUCKET
      const key = process.env.TIERS_KEY || 'tiers.json'
      try {
        const s3Res = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
        const body = await s3Res.Body.transformToString()
        const parsed = JSON.parse(body)
        tiers = Array.isArray(parsed) ? parsed : (parsed.tiers || [])
      } catch (e) {
        console.warn('S3 Load failed, using fallback:', e.message)
        tiers = JSON.parse(process.env.TIER_CONFIG || '[]')
      }
    }

    // 2. Parse Request
    const body = JSON.parse(event.body || '{}')
    const { tierId, quantity = 1, addons = [], referral, email } = body

    const mainTier = tiers.find(t => t.id === tierId)
    if (!mainTier) {
      return { statusCode: 400, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'Invalid tier' }) }
    }

    // 3. Build Line Items
    const lineItems = []
    
    // Main Ticket
    lineItems.push({
      price_data: {
        currency: 'usd',
        unit_amount: Math.round((mainTier.basePrice || mainTier.price) * 100),
        product_data: { name: mainTier.label }
      },
      quantity: Math.max(1, parseInt(quantity, 10) || 1)
    })

    // Add-ons
    for (const ad of (addons || [])) {
      const adTier = tiers.find(t => t.id === ad.tierId)
      if (adTier) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            unit_amount: Math.round((adTier.price || adTier.basePrice) * 100),
            product_data: { name: adTier.label }
          },
          quantity: Math.max(1, parseInt(ad.quantity, 10) || 1)
        })
      }
    }

    // 4. Create Stripe Session
    const params = new URLSearchParams()
    params.append('mode', 'payment')
    params.append('success_url', process.env.SUCCESS_URL)
    params.append('cancel_url', process.env.CANCEL_URL)
    if (email) params.append('customer_email', email)
    
    lineItems.forEach((item, i) => {
      params.append(`line_items[${i}][quantity]`, item.quantity)
      params.append(`line_items[${i}][price_data][currency]`, 'usd')
      params.append(`line_items[${i}][price_data][unit_amount]`, item.price_data.unit_amount)
      params.append(`line_items[${i}][price_data][product_data][name]`, item.price_data.product_data.name)
    })

    if (referral) {
      params.append('metadata[referral]', referral)
      params.append('discounts[0][coupon]', 'AFFILIATE5')
    }

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    })

    const session = await stripeRes.json()
    if (!stripeRes.ok) {
      return { statusCode: 500, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(session) }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ url: session.url })
    }

  } catch (err) {
    console.error('FATAL:', err)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'internal_error', message: err.message })
    }
  }
}