Packaging Lambdas for payments API
==================================

This repo includes Lambda source for two functions:
- `deploy/lambda/checkout/handler.mjs`
- `deploy/lambda/webhook/handler.mjs`

They use AWS SDK v3 clients and native fetch/crypto in Node.js 20. You must include the AWS SDK v3 modules in the zip (Lambda does not bundle them for you).

Build artifacts
---------------
Package each function as a zip at the path your CloudFormation template expects:

- `checkout.zip` containing `handler.mjs` at the root (exported as `handler`)
- `webhook.zip` containing `handler.mjs` at the root (exported as `handler`)

Example packaging commands (with deps)
--------------------------
From the repo root:

```bash
mkdir -p dist

# Checkout function
pushd deploy/lambda/checkout
  rm -rf node_modules package-lock.json
  npm init -y >/dev/null 2>&1
  npm i @aws-sdk/client-dynamodb @aws-sdk/client-ssm >/dev/null 2>&1
  zip -r ../../dist/checkout.zip handler.mjs node_modules package.json package-lock.json
popd

# Webhook function
pushd deploy/lambda/webhook
  rm -rf node_modules package-lock.json
  npm init -y >/dev/null 2>&1
  npm i @aws-sdk/client-dynamodb @aws-sdk/client-ssm >/dev/null 2>&1
  zip -r ../../dist/webhook.zip handler.mjs node_modules package.json package-lock.json
popd

# Inventory function
pushd deploy/lambda/inventory
  rm -rf node_modules package-lock.json
  npm init -y >/dev/null 2>&1
  npm i @aws-sdk/client-dynamodb >/dev/null 2>&1
  zip -r ../../dist/inventory.zip handler.mjs node_modules package.json package-lock.json
popd
```

Upload these to an S3 bucket of your choice, e.g. `my-artifacts-bucket/payments/dist/checkout.zip`, `.../webhook.zip`, and `.../inventory.zip`.

Then deploy `deploy/cloudformation/payments.yaml` with parameters:
- `CodeBucket` = `my-artifacts-bucket`
- `CodeKeyPrefix` = `payments/dist`

Before deploying
---------------
Store your Stripe secrets in SSM Parameter Store (SecureString):
- `STRIPE_SECRET_KEY` (e.g., `/reeguezrocks/stripe/secret`)
- `STRIPE_WEBHOOK_SECRET` (e.g., `/reeguezrocks/stripe/webhook`)

Pass those exact parameter names into the stack inputs `StripeSecretParam` and `StripeWebhookSecretParam`.

Also pass:
- `SiteOrigin`: `https://reeguezrocks.com`
- `SuccessUrl`: `https://reeguezrocks.com/success.html?session_id={CHECKOUT_SESSION_ID}`
- `CancelUrl`: `https://reeguezrocks.com/cancel.html`
- (Optional) `TierConfigJson` to override the default tiers/limits/prices.
