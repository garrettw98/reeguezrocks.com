#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

mkdir -p dist

echo "Packaging checkout lambda..."
pushd deploy/lambda/checkout >/dev/null
  rm -rf node_modules package-lock.json
  npm init -y >/dev/null 2>&1
  npm i @aws-sdk/client-dynamodb @aws-sdk/client-ssm @aws-sdk/client-ses @aws-sdk/client-s3 >/dev/null 2>&1
  zip -r "$ROOT_DIR/dist/checkout.zip" handler.mjs node_modules package.json package-lock.json >/dev/null
popd >/dev/null

echo "Packaging webhook lambda..."
pushd deploy/lambda/webhook >/dev/null
  rm -rf node_modules package-lock.json
  npm init -y >/dev/null 2>&1
  npm i @aws-sdk/client-dynamodb @aws-sdk/client-ssm @aws-sdk/client-ses @aws-sdk/client-s3 >/dev/null 2>&1
  zip -r "$ROOT_DIR/dist/webhook.zip" handler.mjs node_modules package.json package-lock.json >/dev/null
popd >/dev/null

echo "Packaging inventory lambda..."
pushd deploy/lambda/inventory >/dev/null
  rm -rf node_modules package-lock.json
  npm init -y >/dev/null 2>&1
  npm i @aws-sdk/client-dynamodb @aws-sdk/client-s3 >/dev/null 2>&1
  zip -r "$ROOT_DIR/dist/inventory.zip" handler.mjs node_modules package.json package-lock.json >/dev/null
popd >/dev/null

echo "Packaging newsletter lambda..."
pushd deploy/lambda/newsletter >/dev/null
  rm -rf node_modules package-lock.json
  npm init -y >/dev/null 2>&1
  npm i @aws-sdk/client-dynamodb @aws-sdk/client-s3 >/dev/null 2>&1
zip -r "$ROOT_DIR/dist/newsletter.zip" handler.mjs node_modules package.json package-lock.json >/dev/null
popd >/dev/null

echo "Packaging artists lambda..."
pushd deploy/lambda/artists >/dev/null
  rm -rf node_modules package-lock.json
  npm init -y >/dev/null 2>&1
  npm i @aws-sdk/client-s3 @aws-sdk/client-ssm >/dev/null 2>&1
  zip -r "$ROOT_DIR/dist/artists.zip" handler.mjs node_modules package.json package-lock.json >/dev/null
popd >/dev/null

echo "Packaging schedule lambda..."
pushd deploy/lambda/schedule >/dev/null
  rm -rf node_modules package-lock.json
  npm init -y >/dev/null 2>&1
  npm i @aws-sdk/client-s3 @aws-sdk/client-ssm >/dev/null 2>&1
  zip -r "$ROOT_DIR/dist/schedule.zip" handler.mjs node_modules package.json package-lock.json >/dev/null
popd >/dev/null

echo "Packaging tiers lambda..."
pushd deploy/lambda/tiers >/dev/null
  rm -rf node_modules package-lock.json
  npm init -y >/dev/null 2>&1
  npm i @aws-sdk/client-s3 @aws-sdk/client-ssm >/dev/null 2>&1
  zip -r "$ROOT_DIR/dist/tiers.zip" handler.mjs node_modules package.json package-lock.json >/dev/null
popd >/dev/null

echo "Packaging tiers lambda..."
pushd deploy/lambda/tiers >/dev/null
  rm -rf node_modules package-lock.json
  npm init -y >/dev/null 2>&1
  npm i @aws-sdk/client-s3 @aws-sdk/client-ssm >/dev/null 2>&1
  zip -r "$ROOT_DIR/dist/tiers.zip" handler.mjs node_modules package.json package-lock.json >/dev/null
popd >/dev/null

echo "Done. Zips in dist/"
