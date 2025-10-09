#!/bin/bash

# Script to fix environment variables in .env.local

echo "🔧 Fixing environment variables..."
echo ""

# Backup the current .env.local
cp .env.local .env.local.backup
echo "✅ Created backup: .env.local.backup"

# Fix NEXT_PUBLIC_APP_URL
if grep -q "NEXT_PUBLIC_APP_URL=.*||" .env.local; then
    # For local development, use localhost:3002 (the port from the terminal output)
    sed -i.bak 's|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=https://localhost:3002|' .env.local
    echo "✅ Fixed NEXT_PUBLIC_APP_URL to https://localhost:3002"
fi

# Add NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY if PAYSTACK_PUBLIC_KEY exists
if grep -q "^PAYSTACK_PUBLIC_KEY=" .env.local && ! grep -q "^NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=" .env.local; then
    PAYSTACK_PK=$(grep "^PAYSTACK_PUBLIC_KEY=" .env.local | cut -d '=' -f2)
    echo "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=$PAYSTACK_PK" >> .env.local
    echo "✅ Added NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY"
fi

# Comment out the incorrect STRIPE_WEBHOOK_SECRET (it's a URL, not a secret)
if grep -q "^STRIPE_WEBHOOK_SECRET=https://" .env.local; then
    sed -i.bak 's|^STRIPE_WEBHOOK_SECRET=https://|# OLD_STRIPE_WEBHOOK_SECRET=https://|' .env.local
    echo "✅ Commented out incorrect STRIPE_WEBHOOK_SECRET"
    echo ""
    echo "⚠️  You need to set the correct STRIPE_WEBHOOK_SECRET"
    echo "   Run: stripe listen --forward-to https://localhost:3002/api/webhooks/stripe"
    echo "   Then copy the webhook secret (whsec_...) to .env.local"
fi

# Clean up backup files
rm -f .env.local.bak

echo ""
echo "🎉 Environment variables fixed!"
echo ""
echo "📋 Next steps:"
echo "1. For Stripe webhooks (local testing):"
echo "   stripe listen --forward-to https://localhost:3002/api/webhooks/stripe"
echo ""
echo "2. Copy the webhook secret and add to .env.local:"
echo "   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here"
echo ""
echo "3. Restart your dev server"
echo ""

