#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

if [ -f deploy/scripts/.env ]; then
  set -a
  source deploy/scripts/.env
  set +a
fi

: "${AWS_REGION:?Set AWS_REGION in .env}"
: "${DOMAIN:?Set DOMAIN in .env}"
: "${PAY_STACK:?Set PAY_STACK in .env}"
: "${ARTIFACTS_BUCKET:?Set ARTIFACTS_BUCKET in .env}"

echo "Ensuring artifacts bucket exists..."
aws s3 mb "s3://$ARTIFACTS_BUCKET" --region "$AWS_REGION" || true

if [ -n "${STRIPE_SECRET:-}" ]; then
  echo "Storing Stripe secret in SSM..."
  aws ssm put-parameter --region "$AWS_REGION" --name /reeguezrocks/stripe/secret --type SecureString --overwrite --value "$STRIPE_SECRET"
fi
if [ -n "${STRIPE_WEBHOOK:-}" ]; then
  echo "Storing Stripe webhook secret in SSM..."
  aws ssm put-parameter --region "$AWS_REGION" --name /reeguezrocks/stripe/webhook --type SecureString --overwrite --value "$STRIPE_WEBHOOK"
fi

echo "Packaging lambdas..."
bash deploy/scripts/package_lambdas.sh

echo "Uploading artifacts..."
aws s3 cp dist/checkout.zip "s3://$ARTIFACTS_BUCKET/payments/dist/checkout.zip"
aws s3 cp dist/webhook.zip  "s3://$ARTIFACTS_BUCKET/payments/dist/webhook.zip"
aws s3 cp dist/inventory.zip  "s3://$ARTIFACTS_BUCKET/payments/dist/inventory.zip"
aws s3 cp dist/newsletter.zip  "s3://$ARTIFACTS_BUCKET/payments/dist/newsletter.zip"
aws s3 cp dist/artists.zip    "s3://$ARTIFACTS_BUCKET/payments/dist/artists.zip"
aws s3 cp dist/schedule.zip   "s3://$ARTIFACTS_BUCKET/payments/dist/schedule.zip"
aws s3 cp dist/tiers.zip      "s3://$ARTIFACTS_BUCKET/payments/dist/tiers.zip"
aws s3 cp dist/tiers.zip      "s3://$ARTIFACTS_BUCKET/payments/dist/tiers.zip"

echo "Deploying payments stack $PAY_STACK..."
aws cloudformation deploy \
  --region "$AWS_REGION" \
  --stack-name "$PAY_STACK" \
  --template-file deploy/cloudformation/payments.yaml \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    ApiName="$PAY_STACK" \
    SiteOrigin="https://$DOMAIN" \
    DomainName="$DOMAIN" \
    CodeBucket="$ARTIFACTS_BUCKET" \
    CodeKeyPrefix=payments/dist \
    StripeSecretParam=/reeguezrocks/stripe/secret \
    StripeWebhookSecretParam=/reeguezrocks/stripe/webhook \
    AdminPasswordParam=/reeguezrocks/admin/password \
    SuccessUrl="https://$DOMAIN/success.html?session_id={CHECKOUT_SESSION_ID}" \
    CancelUrl="https://$DOMAIN/cancel.html" \
    "$(
      if [ -f deploy/tiers.json ]; then 
        printf 'TierConfigJson=%s' "$(tr -d '\n' < deploy/tiers.json)"; 
      fi
    )"

API_BASE=$(aws cloudformation describe-stacks --stack-name "$PAY_STACK" --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" --output text --region "$AWS_REGION")
echo "API_BASE=$API_BASE"

echo "Updating config.js API base..."
cp -n config.example.js config.js || true
if [[ "$(uname)" == "Darwin" ]]; then
  sed -i '' "s|https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com|$API_BASE|g" config.js
else
  sed -i "s|https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com|$API_BASE|g" config.js
fi

echo "Payments deployed. Remember to set Stripe webhook to: $API_BASE/webhook"
