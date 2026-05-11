#!/bin/bash

# Payment Gateway Environment Setup Script
# This script helps you configure your environment variables for Paystack and PayPal

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
        if [[ "$var_name" == "NEXT_PUBLIC_APP_URL" && "$var_value" =~ \|\| ]]; then
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
check_env_var "PAYSTACK_SECRET_KEY"
check_env_var "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY"
check_env_var "PAYPAL_CLIENT_ID"
check_env_var "PAYPAL_CLIENT_SECRET"
check_env_var "NEXT_PUBLIC_PAYPAL_CLIENT_ID"

echo ""
echo "===================================="
echo ""
echo -e "${YELLOW}📝 SETUP INSTRUCTIONS:${NC}"
echo ""
echo "1. Fix NEXT_PUBLIC_APP_URL:"
echo "   For local development:"
echo "   NEXT_PUBLIC_APP_URL=https://localhost:3002"
echo ""
echo "2. Verify Paystack keys:"
echo "   PAYSTACK_SECRET_KEY=sk_test_..."
echo "   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_..."
echo ""
echo "3. Verify PayPal keys:"
echo "   PAYPAL_CLIENT_ID=..."
echo "   PAYPAL_CLIENT_SECRET=..."
echo "   NEXT_PUBLIC_PAYPAL_CLIENT_ID=..."
echo ""
echo "4. Restart your development server after changes"
echo ""
echo -e "${GREEN}📚 For detailed setup instructions, see:${NC}"
echo "   docs/PAYMENT_GATEWAY_SETUP.md"
echo ""
