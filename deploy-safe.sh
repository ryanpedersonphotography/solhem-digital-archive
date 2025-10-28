#!/bin/bash
# Safe deployment script for Solhem Digital Archive
# Prevents accidental deployment to wrong Netlify sites

set -e

EXPECTED_SITE="solhem-digital-archive"
EXPECTED_SITE_ID="70806f78-16cc-4bc5-a823-f76e8965e869"

echo "🔍 Checking deployment safety..."

# Check if netlify CLI is available
if ! command -v netlify &> /dev/null; then
    echo "❌ ERROR: Netlify CLI not found. Install with: npm install -g netlify-cli"
    exit 1
fi

# Get current site info
CURRENT_SITE=$(netlify status --json 2>/dev/null | jq -r '.siteInfo.name // "unknown"' 2>/dev/null || echo "unknown")
CURRENT_SITE_ID=$(netlify status --json 2>/dev/null | jq -r '.siteInfo.id // "unknown"' 2>/dev/null || echo "unknown")

echo "📍 Current linked site: $CURRENT_SITE ($CURRENT_SITE_ID)"
echo "🎯 Expected site: $EXPECTED_SITE ($EXPECTED_SITE_ID)"

# Verify correct site
if [ "$CURRENT_SITE" != "$EXPECTED_SITE" ] || [ "$CURRENT_SITE_ID" != "$EXPECTED_SITE_ID" ]; then
    echo ""
    echo "❌ ERROR: Wrong Netlify site!"
    echo "   Current: $CURRENT_SITE ($CURRENT_SITE_ID)"
    echo "   Expected: $EXPECTED_SITE ($EXPECTED_SITE_ID)"
    echo ""
    echo "🔧 To fix this, run:"
    echo "   netlify unlink"
    echo "   netlify link --id $EXPECTED_SITE_ID"
    echo ""
    exit 1
fi

# Verify we're in the right directory
if [ ! -f "package.json" ] || ! grep -q "solhem-digital-archive" package.json 2>/dev/null; then
    echo "❌ ERROR: Not in the Solhem Digital Archive project directory!"
    echo "   Expected package.json with 'solhem-digital-archive' name"
    exit 1
fi

# Verify GitHub repo
GIT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "none")
EXPECTED_REMOTE="https://github.com/ryanpedersonphotography/solhem-digital-archive.git"

if [ "$GIT_REMOTE" != "$EXPECTED_REMOTE" ]; then
    echo "⚠️  WARNING: Git remote doesn't match expected repo"
    echo "   Current: $GIT_REMOTE"
    echo "   Expected: $EXPECTED_REMOTE"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ Safety checks passed!"
echo ""

# Determine deployment type
if [ "$1" == "--prod" ] || [ "$1" == "-p" ]; then
    echo "🚀 Deploying to PRODUCTION..."
    echo "   This will update: https://solhem-digital-archive.netlify.app"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 0
    fi
    
    echo "📦 Building project..."
    npm run build
    
    echo "🚀 Deploying to production..."
    netlify deploy --prod --dir=dist
else
    echo "🧪 Deploying to PREVIEW..."
    echo "📦 Building project..."
    npm run build
    
    echo "🚀 Deploying preview..."
    netlify deploy --dir=dist
fi

echo ""
echo "🎉 Deployment complete!"
echo "📊 Function logs: https://app.netlify.com/projects/solhem-digital-archive/logs/functions"