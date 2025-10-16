#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

if [ ! -f deploy/scripts/.env ]; then
  echo "Missing deploy/scripts/.env. Copy from .env.example and fill in values."
  exit 1
fi
set -a
source deploy/scripts/.env
set +a

echo "=== Deploying static site ==="
bash deploy/scripts/deploy_site.sh

echo "=== Deploying payments API ==="
bash deploy/scripts/deploy_payments.sh

echo "=== Final site sync after config.js change ==="
CF_ID=$(aws cloudformation describe-stacks --stack-name "$SITE_STACK" --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" --output text --region "$AWS_REGION")
aws s3 sync . s3://"$SITE_BUCKET" --delete --exclude ".git/*" --exclude ".github/*" --exclude "deploy/*"
aws cloudfront create-invalidation --distribution-id "$CF_ID" --paths "/*"

echo "All done. Visit https://$DOMAIN and set Stripe webhook to: $(grep -o 'https://.*execute-api[^"\;]*' config.js)/webhook"
