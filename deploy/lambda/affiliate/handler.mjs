import crypto from 'node:crypto'
import { DynamoDBClient, PutItemCommand, GetItemCommand, ScanCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

const { AFFILIATE_TABLE, FROM_EMAIL, SITE_URL = 'https://reeguezrocks.com' } = process.env
const ddb = new DynamoDBClient({})
const ses = new SESClient({})

function json(body, statusCode = 200) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    },
    body: JSON.stringify(body)
  }
}

// Generate a slug from name (e.g., "John Smith" -> "johnsmith")
function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

// Generate promo code from name (e.g., "Garrett Williams" -> "GarrettW")
function generateCode(name) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return ''
  const firstName = parts[0]
  // Capitalize first letter, lowercase rest
  const formattedFirst = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()
  if (parts.length === 1) {
    return formattedFirst
  }
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase()
  return formattedFirst + lastInitial
}

export const handler = async (event) => {
  try {
    const method = event.requestContext?.http?.method || 'GET'
    const path = event.requestContext?.http?.path || event.rawPath || ''

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return { statusCode: 204, headers: json({}).headers, body: '' }
    }

    // POST /affiliate - Create new affiliate
    if (method === 'POST') {
      const payload = event.body ? JSON.parse(event.body) : {}
      const name = (payload.name || '').toString().trim()
      const email = (payload.email || '').toString().trim().toLowerCase()

      if (!name || name.length < 2) {
        return json({ error: 'Name is required' }, 400)
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json({ error: 'Valid email is required' }, 400)
      }

      const slug = generateSlug(name)
      const code = generateCode(name)
      const ts = Date.now()

      // Check if affiliate already exists by email
      const existing = await ddb.send(new ScanCommand({
        TableName: AFFILIATE_TABLE,
        FilterExpression: 'email = :email',
        ExpressionAttributeValues: { ':email': { S: email } },
        Limit: 1
      }))

      if (existing.Items && existing.Items.length > 0) {
        // Return existing affiliate info
        const item = existing.Items[0]
        return json({
          ok: true,
          link: `${SITE_URL}/?ref=${item.slug.S}`,
          code: item.code.S,
          existing: true
        })
      }

      // Check if slug already exists, add number if needed
      let finalSlug = slug
      let counter = 1
      while (true) {
        const check = await ddb.send(new GetItemCommand({
          TableName: AFFILIATE_TABLE,
          Key: { slug: { S: finalSlug } }
        }))
        if (!check.Item) break
        finalSlug = `${slug}${counter}`
        counter++
      }

      // Same for code
      let finalCode = code
      counter = 1
      const allItems = await ddb.send(new ScanCommand({ TableName: AFFILIATE_TABLE }))
      const existingCodes = new Set((allItems.Items || []).map(i => i.code?.S))
      while (existingCodes.has(finalCode)) {
        finalCode = `${code}${counter}`
        counter++
      }

      // Generate auth token for dashboard access
      const authToken = crypto.randomBytes(32).toString('hex')

      // Create affiliate
      await ddb.send(new PutItemCommand({
        TableName: AFFILIATE_TABLE,
        Item: {
          slug: { S: finalSlug },
          code: { S: finalCode },
          name: { S: name },
          email: { S: email },
          ticketsSold: { N: '0' },
          earnings: { N: '0' },
          clicks: { N: '0' },
          paidOut: { N: '0' },
          authToken: { S: authToken },
          createdAt: { N: String(ts) }
        }
      }))

      // Send welcome email with dashboard setup instructions
      if (FROM_EMAIL) {
        // Create secure setup link with token
        const setupToken = `${finalSlug}:${authToken}`
        const dashboardUrl = `${SITE_URL}/affiliate-dashboard.html?setup=${encodeURIComponent(setupToken)}`
        const affiliateLink = `${SITE_URL}/?ref=${finalSlug}`

        const html = `<!DOCTYPE html><html><body style="background:#0b0b0f;color:#fff;font-family:Arial,sans-serif;padding:20px;">
          <div style="max-width:640px;margin:0 auto;background:#141420;border:1px solid rgba(255,255,255,.12);border-radius:12px;overflow:hidden">
            <div style="padding:20px;text-align:center;background:rgba(247,166,2,0.1)">
              <h1 style="margin:0;color:#f7a602;font-size:24px;">Welcome to the Reeguez Rocks Affiliate Program!</h1>
            </div>
            <div style="padding:20px;color:#eaeaea">
              <p style="margin:0 0 16px">Hey ${name}!</p>
              <p style="margin:0 0 16px">You're officially an affiliate! Here's everything you need to start earning:</p>

              <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:16px;margin:0 0 16px">
                <p style="margin:0 0 8px;color:#9aa1ad;font-size:14px">Your Affiliate Link</p>
                <p style="margin:0;font-weight:600;color:#f7a602;word-break:break-all">${affiliateLink}</p>
              </div>

              <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:16px;margin:0 0 16px">
                <p style="margin:0 0 8px;color:#9aa1ad;font-size:14px">Your Promo Code</p>
                <p style="margin:0;font-weight:600;color:#f7a602;font-size:20px">${finalCode}</p>
              </div>

              <div style="background:rgba(247,166,2,0.1);border:1px solid rgba(247,166,2,0.3);border-radius:8px;padding:16px;margin:0 0 16px">
                <p style="margin:0 0 8px;font-weight:600;color:#f7a602">How it works:</p>
                <ul style="margin:0;padding-left:20px;color:#eaeaea;font-size:14px">
                  <li style="margin-bottom:8px">Share your link with friends</li>
                  <li style="margin-bottom:8px">They get <strong>5% off</strong> their ticket</li>
                  <li style="margin-bottom:8px">You earn <strong>$5 per ticket</strong> sold</li>
                  <li>Payouts processed after the event</li>
                </ul>
              </div>

              <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:16px;margin:0 0 16px">
                <p style="margin:0 0 8px;font-weight:600;color:#fff">Set Up Your Dashboard Password</p>
                <p style="margin:0 0 12px;color:#9aa1ad;font-size:14px">Click the button below to set up your password and access your affiliate dashboard. You'll need this to track your earnings and set up your payout account.</p>
                <a href="${dashboardUrl}" style="display:inline-block;padding:12px 24px;background:#f7a602;color:#0b0b0f;border-radius:6px;text-decoration:none;font-weight:600">Set Up My Dashboard</a>
                <p style="margin:12px 0 0;font-size:12px;color:#9aa1ad">This link is unique to you — don't share it with anyone.</p>
              </div>

              <p style="margin:16px 0 0;font-size:14px;color:#9aa1ad">Questions? Reply to this email or reach out at reeguezrocks@gmail.com</p>
            </div>
          </div>
        </body></html>`

        await ses.send(new SendEmailCommand({
          Source: FROM_EMAIL,
          Destination: { ToAddresses: [email] },
          Message: {
            Subject: { Data: `Welcome to Reeguez Rocks Affiliates - Your link is ready!` },
            Body: { Html: { Data: html } }
          }
        })).catch(e => console.error('Failed to send welcome email:', e))
      }

      return json({
        ok: true,
        link: `${SITE_URL}/?ref=${finalSlug}`,
        code: finalCode
      })
    }

    // GET /affiliate - Get leaderboard
    if (method === 'GET' && !path.includes('/click')) {
      const result = await ddb.send(new ScanCommand({
        TableName: AFFILIATE_TABLE
      }))

      const affiliates = (result.Items || []).map(item => ({
        name: item.name?.S || '',
        ticketsSold: parseInt(item.ticketsSold?.N || '0', 10),
        earnings: parseInt(item.earnings?.N || '0', 10),
        clicks: parseInt(item.clicks?.N || '0', 10)
      }))

      // Sort by tickets sold descending
      affiliates.sort((a, b) => b.ticketsSold - a.ticketsSold)

      return json({
        ok: true,
        affiliates,
        totalAffiliates: affiliates.length,
        totalTicketsSold: affiliates.reduce((sum, a) => sum + a.ticketsSold, 0)
      })
    }

    // POST /affiliate/click - Track a referral click
    if (path.includes('/click')) {
      const qs = event.queryStringParameters || {}
      const ref = qs.ref
      if (!ref) return json({ ok: true }) // Silently ignore missing ref

      try {
        // Increment click count for this affiliate
        await ddb.send(new UpdateItemCommand({
          TableName: AFFILIATE_TABLE,
          Key: { slug: { S: ref } },
          UpdateExpression: 'SET clicks = if_not_exists(clicks, :zero) + :one',
          ExpressionAttributeValues: {
            ':zero': { N: '0' },
            ':one': { N: '1' }
          },
          ConditionExpression: 'attribute_exists(slug)'
        }))
      } catch (e) {
        // Affiliate doesn't exist, silently ignore
      }

      return json({ ok: true })
    }

    // GET /affiliate/dashboard - Get personal dashboard by email
    if (path.includes('/dashboard') && method === 'GET') {
      const qs = event.queryStringParameters || {}
      const email = qs.email?.toLowerCase()
      if (!email) return json({ error: 'Email required' }, 400)

      // Find affiliate by email
      const result = await ddb.send(new ScanCommand({
        TableName: AFFILIATE_TABLE,
        FilterExpression: 'email = :email',
        ExpressionAttributeValues: { ':email': { S: email } },
        Limit: 1
      }))

      if (!result.Items || result.Items.length === 0) {
        return json({ error: 'No affiliate found with that email' }, 404)
      }

      const item = result.Items[0]
      return json({
        ok: true,
        affiliate: {
          name: item.name?.S || '',
          email: item.email?.S || '',
          slug: item.slug?.S || '',
          code: item.code?.S || '',
          link: `${SITE_URL}/?ref=${item.slug?.S || ''}`,
          ticketsSold: parseInt(item.ticketsSold?.N || '0', 10),
          earnings: parseInt(item.earnings?.N || '0', 10),
          clicks: parseInt(item.clicks?.N || '0', 10),
          paidOut: parseInt(item.paidOut?.N || '0', 10),
          createdAt: parseInt(item.createdAt?.N || '0', 10)
        }
      })
    }

    return json({ error: 'method_not_allowed' }, 405)
  } catch (e) {
    console.error('Affiliate error:', e)
    return json({ error: 'affiliate_error', details: e.message }, 500)
  }
}
