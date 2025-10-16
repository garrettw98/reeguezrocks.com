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
: "${ALT_DOMAIN:?Set ALT_DOMAIN in .env}"
: "${SITE_STACK:?Set SITE_STACK in .env}"
: "${SITE_BUCKET:?Set SITE_BUCKET in .env}"
: "${HOSTED_ZONE_ID:?Set HOSTED_ZONE_ID in .env}"
: "${CERT_ARN:?Set CERT_ARN in .env}"

echo "Deploying static site stack $SITE_STACK in $AWS_REGION..."
aws cloudformation deploy \
  --region "$AWS_REGION" \
  --stack-name "$SITE_STACK" \
  --template-file deploy/cloudformation/website.yaml \
  --parameter-overrides \
    BucketName="$SITE_BUCKET" \
    DomainName="$DOMAIN" \
    AlternateDomainNames="$ALT_DOMAIN" \
    CertificateArn="$CERT_ARN" \
    PriceClass=PriceClass_100 \
    EnableLogging=false \
    CreateDNS=true \
    HostedZoneId="$HOSTED_ZONE_ID"

CF_DOMAIN=$(aws cloudformation describe-stacks --stack-name "$SITE_STACK" --query "Stacks[0].Outputs[?OutputKey=='DistributionDomainName'].OutputValue" --output text --region "$AWS_REGION")
CF_ID=$(aws cloudformation describe-stacks --stack-name "$SITE_STACK" --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" --output text --region "$AWS_REGION")
echo "CF_DOMAIN=$CF_DOMAIN"
echo "CF_ID=$CF_ID"

echo "Syncing site to S3..."
aws s3 sync . "s3://$SITE_BUCKET" --delete --exclude ".git/*" --exclude ".github/*" --exclude "deploy/*"

echo "Invalidating CloudFront..."
aws cloudfront create-invalidation --distribution-id "$CF_ID" --paths "/*"

echo "Site deployed."
