#!/usr/bin/env bash
set -euo pipefail

# Build project and create a zip package to upload to cPanel
npm run build
rm -f deploy_package.tar.gz
# include dist, package.json, package-lock.json, data (empty in production), .env.production (if present)
tar -czf deploy_package.tar.gz dist package.json package-lock.json data .env.production 2>/dev/null || tar -czf deploy_package.tar.gz dist package.json package-lock.json data

echo "Created deploy_package.tar.gz - upload this to cPanel and extract in your Node.js app directory"

echo "On cPanel:"
echo "1. Upload and extract the archive"
echo "2. In cPanel Node.js app UI, set the app's document root to the extracted directory and environment variables"
echo "3. Run: npm install --production"
echo "4. Start the app with: node dist/boot.js"
