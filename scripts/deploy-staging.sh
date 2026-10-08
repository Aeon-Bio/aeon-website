#!/usr/bin/env bash
# Build this checkout and publish it to the staging Pages project.
# Production (aeon.science) deploys from the Git-integrated `aeon-website` project on push to main;
# staging (staging.aeon.science / aeon-website-staging.pages.dev) is a direct upload from here.
# Needs a .env in this checkout: $env/static/private resolves at build time.
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f .env ] || { echo "no .env in $(pwd); copy one from the main checkout" >&2; exit 1; }
npm run build
CLOUDFLARE_ACCOUNT_ID=019d1184e655db74b7589794a2a2a533 \
  npx wrangler pages deploy .svelte-kit/cloudflare \
    --project-name aeon-website-staging --branch staging --commit-dirty=true
