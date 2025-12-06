#!/bin/bash

# Payment Gateway Environment Setup Script
# This script helps you configure your environment variables for Stripe and Paystack

echo "🔧 Payment Gateway Environment Setup"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ .env.local not found!${NC}"
    echo "Creating .env.local..."
    touch .env.local
fi

echo -e "${GREEN}✅ Found .env.local${NC}"
echo ""

# Function to check if a variable exists and is valid
check_env_var() {
    local var_name=$1
    local var_value=$(grep "^${var_name}=" .env.local | cut -d '=' -f2-)
    
    if [ -z "$var_value" ]; then
        echo -e "${RED}❌ ${var_name} not set${NC}"
        return 1
    else
        # Check if it's a valid format (not a URL for webhook secret, etc.)
        if [[ "$var_name" == "STRIPE_WEBHOOK_SECRET" && "$var_value" =~ ^https?:// ]]; then
            echo -e "${YELLOW}⚠️  ${var_name} appears to be a URL (should be whsec_...)${NC}"
            return 1
        elif [[ "$var_name" == "NEXT_PUBLIC_APP_URL" && "$var_value" =~ \|\| ]]; then
            echo -e "${YELLOW}⚠️  ${var_name} has invalid format${NC}"
            return 1
        else
            echo -e "${GREEN}✅ ${var_name} set${NC}"
            return 0
        fi
    fi
}

echo "Checking current configuration..."
echo ""

# Check all required variables
check_env_var "NEXT_PUBLIC_APP_URL"
check_env_var "STRIPE_SECRET_KEY"
check_env_var "STRIPE_PUBLISHABLE_KEY"
check_env_var "STRIPE_WEBHOOK_SECRET"
check_env_var "PAYSTACK_SECRET_KEY"
check_env_var "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY"

echo ""
echo "===================================="
echo ""
echo -e "${YELLOW}📝 SETUP INSTRUCTIONS:${NC}"
echo ""
echo "1. Fix NEXT_PUBLIC_APP_URL:"
echo "   For local development:"
echo "   NEXT_PUBLIC_APP_URL=https://localhost:3002"
echo ""
echo "2. Set up Stripe Webhook Secret:"
echo "   a. Run: stripe listen --forward-to https://localhost:3002/api/webhooks/stripe"
echo "   b. Copy the webhook signing secret (starts with whsec_)"
echo "   c. Add to .env.local: STRIPE_WEBHOOK_SECRET=whsec_..."
echo ""
echo "3. Verify Paystack Public Key:"
echo "   Make sure you have: NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_..."
echo ""
echo "4. Restart your development server after changes"
echo ""
echo -e "${GREEN}📚 For detailed setup instructions, see:${NC}"
echo "   docs/PAYMENT_GATEWAY_SETUP.md"
echo ""

