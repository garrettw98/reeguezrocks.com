import crypto from 'node:crypto'
import { DynamoDBClient, GetItemCommand, UpdateItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb'
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'

const { AFFILIATE_TABLE, STRIPE_SECRET_PARAM, SITE_URL = 'https://reeguezrocks.com' } = process.env
const ddb = new DynamoDBClient({})
const ssm = new SSMClient({})

let stripeKeyCache = null
async function getStripeKey() {
  if (stripeKeyCache) return stripeKeyCache
  const resp = await ssm.send(new GetParameterCommand({ Name: STRIPE_SECRET_PARAM, WithDecryption: true }))
  stripeKeyCache = resp.Parameter?.Value
  return stripeKeyCache
}

function json(body, statusCode = 200) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
    body: JSON.stringify(body)
  }
}

// Verify auth token from affiliate
async function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)

  // Token format: slug:hash
  const [slug, hash] = token.split(':')
  if (!slug || !hash) return null

  // Look up affiliate
  const result = await ddb.send(new GetItemCommand({
    TableName: AFFILIATE_TABLE,
    Key: { slug: { S: slug } }
  }))

  if (!result.Item) return null

  // Verify hash matches stored authToken
  const storedToken = result.Item.authToken?.S
  if (!storedToken || storedToken !== hash) return null

  return result.Item
}

// Create Stripe Connect Express account
async function createConnectAccount(affiliate) {
  const stripeKey = await getStripeKey()
  const slug = affiliate.slug.S
  const email = affiliate.email?.S
  const name = affiliate.name?.S || ''

  // Check if already has Stripe account
  if (affiliate.stripeAccountId?.S) {
    return { accountId: affiliate.stripeAccountId.S, existing: true }
  }

  // Create Express account
  const params = new URLSearchParams()
  params.append('type', 'express')
  params.append('country', 'US')
  params.append('email', email)
  params.append('capabilities[transfers][requested]', 'true')
  params.append('business_type', 'individual')
  params.append('metadata[affiliate_slug]', slug)

  const res = await fetch('https://api.stripe.com/v1/accounts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  })

  const account = await res.json()
  if (account.error) {
    console.error('Stripe account creation failed:', account.error)
    return { error: account.error.message }
  }

  // Store Stripe account ID
  await ddb.send(new UpdateItemCommand({
    TableName: AFFILIATE_TABLE,
    Key: { slug: { S: slug } },
    UpdateExpression: 'SET stripeAccountId = :acct',
    ExpressionAttributeValues: {
      ':acct': { S: account.id }
    }
  }))

  return { accountId: account.id, existing: false }
}

// Create Stripe Connect onboarding link
async function createOnboardingLink(accountId, affiliateSlug) {
  const stripeKey = await getStripeKey()

  const params = new URLSearchParams()
  params.append('account', accountId)
  params.append('refresh_url', `${SITE_URL}/affiliate-dashboard.html?onboard=refresh`)
  params.append('return_url', `${SITE_URL}/affiliate-dashboard.html?onboard=complete`)
  params.append('type', 'account_onboarding')

  const res = await fetch('https://api.stripe.com/v1/account_links', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  })

  const link = await res.json()
  if (link.error) {
    console.error('Failed to create onboarding link:', link.error)
    return { error: link.error.message }
  }

  return { url: link.url }
}

// Get Stripe Connect account status
async function getAccountStatus(accountId) {
  const stripeKey = await getStripeKey()

  const res = await fetch(`https://api.stripe.com/v1/accounts/${accountId}`, {
    headers: { 'Authorization': `Bearer ${stripeKey}` }
  })

  const account = await res.json()
  if (account.error) return { error: account.error.message }

  return {
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
    requirements: account.requirements?.currently_due || []
  }
}

// Create Stripe Express Dashboard login link
async function createDashboardLink(accountId) {
  const stripeKey = await getStripeKey()

  const res = await fetch(`https://api.stripe.com/v1/accounts/${accountId}/login_links`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${stripeKey}` }
  })

  const link = await res.json()
  if (link.error) return { error: link.error.message }

  return { url: link.url }
}

export const handler = async (event) => {
  try {
    const method = event.requestContext?.http?.method || 'GET'
    const path = event.requestContext?.http?.path || event.rawPath || ''

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return { statusCode: 204, headers: json({}).headers, body: '' }
    }

    const authHeader = event.headers?.authorization || event.headers?.Authorization

    // POST /affiliate-payout/auth - Authenticate with email and password
    if (path.includes('/auth') && method === 'POST') {
      const payload = event.body ? JSON.parse(event.body) : {}
      const email = (payload.email || '').trim().toLowerCase()
      const password = payload.password || ''

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

      const affiliate = result.Items[0]
      const slug = affiliate.slug.S

      // Check if password is set
      const storedPassword = affiliate.password?.S
      if (!storedPassword) {
        // Password not set - must use setup link from email
        return json({ error: 'Password not set. Check your welcome email for the setup link.' }, 403)
      }

      // Verify password
      if (!password) {
        return json({ error: 'Password required' }, 400)
      }

      const hashedInput = crypto.createHash('sha256').update(password).digest('hex')
      if (hashedInput !== storedPassword) {
        return json({ error: 'Incorrect password' }, 401)
      }

      // Return auth token
      const authToken = affiliate.authToken?.S
      if (!authToken) {
        return json({ error: 'Account not set up properly' }, 500)
      }

      return json({
        ok: true,
        token: `${slug}:${authToken}`
      })
    }

    // POST /affiliate-payout/verify-setup - Verify setup token from email link
    if (path.includes('/verify-setup') && method === 'POST') {
      const payload = event.body ? JSON.parse(event.body) : {}
      const setupToken = payload.token || ''

      if (!setupToken) return json({ error: 'Setup token required' }, 400)

      // Token format: slug:authToken
      const [slug, hash] = setupToken.split(':')
      if (!slug || !hash) return json({ error: 'Invalid setup token' }, 400)

      // Look up affiliate
      const result = await ddb.send(new GetItemCommand({
        TableName: AFFILIATE_TABLE,
        Key: { slug: { S: slug } }
      }))

      if (!result.Item) {
        return json({ error: 'Invalid setup token' }, 404)
      }

      // Verify token matches
      const storedToken = result.Item.authToken?.S
      if (!storedToken || storedToken !== hash) {
        return json({ error: 'Invalid or expired setup token' }, 401)
      }

      // Check if password already set
      const hasPassword = !!result.Item.password?.S

      return json({
        ok: true,
        token: setupToken,
        name: result.Item.name?.S || '',
        hasPassword
      })
    }

    // POST /affiliate-payout/set-password - Set password for dashboard
    if (path.includes('/set-password') && method === 'POST') {
      const affiliate = await verifyToken(authHeader)
      if (!affiliate) return json({ error: 'Unauthorized' }, 401)

      const payload = event.body ? JSON.parse(event.body) : {}
      const password = payload.password || ''

      if (password.length < 8) {
        return json({ error: 'Password must be at least 8 characters' }, 400)
      }

      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex')
      const newAuthToken = crypto.randomBytes(32).toString('hex')

      await ddb.send(new UpdateItemCommand({
        TableName: AFFILIATE_TABLE,
        Key: { slug: { S: affiliate.slug.S } },
        UpdateExpression: 'SET password = :pwd, authToken = :token',
        ExpressionAttributeValues: {
          ':pwd': { S: hashedPassword },
          ':token': { S: newAuthToken }
        }
      }))

      return json({
        ok: true,
        token: `${affiliate.slug.S}:${newAuthToken}`
      })
    }

    // GET /affiliate-payout/status - Get payout status and Stripe account
    if (path.includes('/status') && method === 'GET') {
      const affiliate = await verifyToken(authHeader)
      if (!affiliate) return json({ error: 'Unauthorized' }, 401)

      const earnings = parseInt(affiliate.earnings?.N || '0', 10)
      const paidOut = parseInt(affiliate.paidOut?.N || '0', 10)
      const balance = earnings - paidOut

      let stripeStatus = null
      if (affiliate.stripeAccountId?.S) {
        stripeStatus = await getAccountStatus(affiliate.stripeAccountId.S)
      }

      return json({
        ok: true,
        earnings,
        paidOut,
        balance,
        stripeAccountId: affiliate.stripeAccountId?.S || null,
        stripeStatus
      })
    }

    // POST /affiliate-payout/connect - Create Stripe Connect account
    if (path.includes('/connect') && method === 'POST') {
      const affiliate = await verifyToken(authHeader)
      if (!affiliate) return json({ error: 'Unauthorized' }, 401)

      const result = await createConnectAccount(affiliate)
      if (result.error) {
        return json({ error: result.error }, 500)
      }

      // Create onboarding link
      const linkResult = await createOnboardingLink(result.accountId, affiliate.slug.S)
      if (linkResult.error) {
        return json({ error: linkResult.error }, 500)
      }

      return json({
        ok: true,
        accountId: result.accountId,
        onboardingUrl: linkResult.url,
        existing: result.existing
      })
    }

    // GET /affiliate-payout/onboarding - Get fresh onboarding link
    if (path.includes('/onboarding') && method === 'GET') {
      const affiliate = await verifyToken(authHeader)
      if (!affiliate) return json({ error: 'Unauthorized' }, 401)

      if (!affiliate.stripeAccountId?.S) {
        return json({ error: 'No Stripe account found. Please connect first.' }, 400)
      }

      const linkResult = await createOnboardingLink(affiliate.stripeAccountId.S, affiliate.slug.S)
      if (linkResult.error) {
        return json({ error: linkResult.error }, 500)
      }

      return json({ ok: true, url: linkResult.url })
    }

    // GET /affiliate-payout/dashboard-link - Get Stripe Express dashboard link
    if (path.includes('/dashboard-link') && method === 'GET') {
      const affiliate = await verifyToken(authHeader)
      if (!affiliate) return json({ error: 'Unauthorized' }, 401)

      if (!affiliate.stripeAccountId?.S) {
        return json({ error: 'No Stripe account found' }, 400)
      }

      const linkResult = await createDashboardLink(affiliate.stripeAccountId.S)
      if (linkResult.error) {
        return json({ error: linkResult.error }, 500)
      }

      return json({ ok: true, url: linkResult.url })
    }

    return json({ error: 'Not found' }, 404)
  } catch (e) {
    console.error('Affiliate payout error:', e)
    return json({ error: 'Internal error', details: e.message }, 500)
  }
}
