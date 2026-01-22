import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb'
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'

const region = process.env.AWS_REGION || 'us-east-1'
const ddb = new DynamoDBClient({ region })
const ssm = new SSMClient({ region })

let adminPwdCache = null

export const handler = async (event) => {
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' } }
  }

  try {
    const body = JSON.parse(event.body || '{}')
    const { code, gatePassword } = body

    if (!code || !gatePassword) {
        return { statusCode: 400, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ valid: false, message: 'Missing code or password' }) }
    }

    // 1. Verify Password
    if (!adminPwdCache) {
        const param = await ssm.send(new GetParameterCommand({ Name: process.env.ADMIN_PASSWORD_PARAM, WithDecryption: true }))
        adminPwdCache = param.Parameter?.Value
    }

    if (gatePassword !== adminPwdCache) {
        return { statusCode: 401, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ valid: false, message: 'Invalid Gate Password' }) }
    }

    // 2. Check Ticket
    const ticketRes = await ddb.send(new GetItemCommand({
        TableName: process.env.TICKETS_TABLE,
        Key: { code: { S: code } }
    }))

    if (!ticketRes.Item) {
        return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ valid: false, message: 'Ticket Not Found' }) }
    }

    const ticket = ticketRes.Item
    const status = ticket.status?.S || 'valid'
    const tierLabel = ticket.tierLabel?.S || 'Unknown Ticket'

    if (status === 'scanned') {
        const scannedAtMs = parseInt(ticket.scannedAt.N)
        const scannedAt = new Date(scannedAtMs).toLocaleString('en-US', { 
            timeZone: 'America/Los_Angeles',
            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
        })
        
        return { 
            statusCode: 200, 
            headers: { 'Access-Control-Allow-Origin': '*' }, 
            body: JSON.stringify({ 
                valid: false, 
                status: 'already_scanned', 
                tierLabel, 
                code, 
                message: `Already Scanned: ${scannedAt}` 
            }) 
        }
    }

    // 3. Mark as Scanned
    await ddb.send(new UpdateItemCommand({
        TableName: process.env.TICKETS_TABLE,
        Key: { code: { S: code } },
        UpdateExpression: 'SET #s = :scanned, scannedAt = :now',
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: {
            ':scanned': { S: 'scanned' },
            ':now': { N: String(Date.now()) }
        }
    }))

    return { 
        statusCode: 200, 
        headers: { 'Access-Control-Allow-Origin': '*' }, 
        body: JSON.stringify({ 
            valid: true, 
            tierLabel, 
            code,
            message: 'Welcome to Reeguez Rocks!' 
        }) 
    }

  } catch (err) {
    console.error(err)
    return { statusCode: 500, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ valid: false, message: 'Server Error' }) }
  }
}