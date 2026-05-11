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

# Clean up backup files
rm -f .env.local.bak

echo ""
echo "🎉 Environment variables fixed!"
echo ""
echo "📋 Next steps:"
echo "1. Verify Paystack and PayPal env vars are set (see scripts/setup-payment-env.sh)"
echo "2. Restart your dev server"
echo ""
