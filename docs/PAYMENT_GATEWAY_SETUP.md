# Payment Gateway Setup Guide

## 🎯 Overview

This guide will help you set up Stripe (for international payments) and Paystack (for Nigerian payments) for your charity donation platform.

---

## 📋 Prerequisites

- A Stripe account ([stripe.com](https://stripe.com))
- A Paystack account ([paystack.com](https://paystack.com))
- Access to your `.env.local` file

---

## 🔧 Environment Variables Setup

Add the following variables to your `.env.local` file:

```bash
# App URL (important for payment redirects)
NEXT_PUBLIC_APP_URL=https://localhost:3002

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
```

---

## 1️⃣ Stripe Setup

### Get Your API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Developers** → **API keys**
3. Copy your keys:
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`

### Set Up Webhooks

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter webhook URL:
   ```
   https://your-domain.com/api/webhooks/stripe
   ```
   For local testing:
   ```
   https://localhost:3002/api/webhooks/stripe
   ```

4. Select events to listen to:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `payment_intent.canceled`
   - ✅ `charge.refunded`

5. Click **Add endpoint**
6. Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### Local Testing with Stripe CLI

For local development, use the Stripe CLI:

```bash
# Install Stripe CLI
# Mac:
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to https://localhost:3002/api/webhooks/stripe

# The CLI will give you a webhook signing secret - copy it to .env.local
```

---

## 2️⃣ Paystack Setup

### Get Your API Keys

1. Go to [Paystack Dashboard](https://dashboard.paystack.com)
2. Click **Settings** → **API Keys & Webhooks**
3. Copy your keys:
   - **Public key** → `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
   - **Secret key** → `PAYSTACK_SECRET_KEY`

### Set Up Webhooks

1. In **Settings** → **API Keys & Webhooks**
2. Scroll to **Webhook URL**
3. Enter:
   ```
   https://your-domain.com/api/webhooks/paystack
   ```
   For local testing (you'll need ngrok or similar):
   ```
   https://your-ngrok-url.ngrok.io/api/webhooks/paystack
   ```

4. Click **Save**

5. Events automatically sent by Paystack:
   - `charge.success`
   - `charge.failed`
   - `transfer.success`
   - `transfer.failed`
   - `transfer.reversed`

### Local Testing with Ngrok

Paystack webhooks need a public URL, so use ngrok for local testing:

```bash
# Install ngrok
# Mac:
brew install ngrok

# Start ngrok
ngrok http https://localhost:3002

# Use the ngrok URL in Paystack webhook settings
# Example: https://abc123.ngrok.io/api/webhooks/paystack
```

---

## 🧪 Testing Payments

### Test Cards

#### Stripe Test Cards
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155

Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

#### Paystack Test Cards
```
Success: 5399 8383 8383 8381
Insufficient funds: 5060 6666 6666 6666 666
Invalid PIN: 5078 5078 5078 5078 12

Expiry: Any future date
CVV: Any 3 digits
PIN: 1234 (for test cards that require PIN)
OTP: 123456 (for test transactions)
```

### Test Payment Flow

1. **Start Local Server**
   ```bash
   npm run dev
   ```

2. **Start Stripe Webhook Forwarding** (in another terminal)
   ```bash
   stripe listen --forward-to https://localhost:3002/api/webhooks/stripe
   ```

3. **Start Ngrok** (in another terminal, for Paystack)
   ```bash
   ngrok http https://localhost:3002
   ```

4. **Make a Test Donation**
   - Go to `https://localhost:3002/virtual-giving-mall`
   - Select a charity
   - Make a donation
   - Use test card numbers above

---

## 💳 Payment Flow

### For International Payments (Stripe)

1. User fills donation form
2. System creates payment intent via Stripe API
3. User redirected to Stripe checkout page
4. User enters card details
5. Stripe processes payment
6. Webhook confirms payment success
7. Database updated: `payment_status = 'completed'`
8. User redirected to success page

### For Nigerian Payments (Paystack)

1. User fills donation form
2. System initializes transaction via Paystack API
3. User redirected to Paystack payment page
4. User enters card details and completes 3D Secure
5. Paystack processes payment
6. User redirected back to callback page
7. System verifies payment with Paystack
8. Webhook confirms payment (backup)
9. Database updated: `payment_status = 'completed'`
10. User redirected to success page

---

## 🔒 Security Best Practices

### Environment Variables
- ✅ Never commit `.env.local` to git
- ✅ Use different keys for test/production
- ✅ Rotate keys periodically
- ✅ Use webhook secrets to verify authenticity

### Webhook Security
- ✅ Always verify webhook signatures
- ✅ Use HTTPS in production
- ✅ Implement rate limiting
- ✅ Log all webhook events

### Payment Security
- ✅ Never store card details
- ✅ Use payment gateway SDKs
- ✅ Implement idempotency keys
- ✅ Validate amounts server-side

---

## 🚀 Production Deployment

### Before Going Live

1. **Switch to Live Keys**
   ```bash
   # Stripe
   STRIPE_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   
   # Paystack
   PAYSTACK_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_...
   ```

2. **Update Webhook URLs**
   - Stripe: `https://your-domain.com/api/webhooks/stripe`
   - Paystack: `https://your-domain.com/api/webhooks/paystack`

3. **Update App URL**
   ```bash
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   ```

4. **Enable HTTPS**
   - Ensure SSL certificate is valid
   - Force HTTPS redirects

5. **Test in Production**
   - Make small test donation
   - Verify webhooks working
   - Check database updates
   - Test refund flow

---

## 📊 Monitoring

### Stripe Dashboard
- Monitor payments in real-time
- View failed payments
- Check webhook delivery status
- Analyze payment trends

### Paystack Dashboard
- Track transactions
- Monitor settlement status
- View webhook logs
- Check dispute/chargeback status

---

## 🆘 Troubleshooting

### Webhooks Not Working

**Problem**: Payments succeed but database not updating

**Solutions**:
1. Check webhook URL is correct
2. Verify webhook secret matches
3. Check server logs for errors
4. Ensure webhook signature validation is working
5. Test with Stripe CLI or ngrok

### Payment Fails Immediately

**Problem**: Payment fails before reaching gateway

**Solutions**:
1. Check API keys are correct
2. Verify amount is valid (> 0)
3. Check currency is supported
4. Ensure charity is active
5. Review server logs

### Redirect Issues

**Problem**: User not redirected after payment

**Solutions**:
1. Check `NEXT_PUBLIC_APP_URL` is correct
2. Verify return URLs in payment intent
3. Check for JavaScript errors
4. Ensure routes exist (`/payment-success`, `/payment-callback`)

---

## 📚 Additional Resources

### Stripe
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Webhook Events](https://stripe.com/docs/webhooks)
- [Testing](https://stripe.com/docs/testing)

### Paystack
- [Paystack Documentation](https://paystack.com/docs)
- [Paystack API Reference](https://paystack.com/docs/api)
- [Webhooks](https://paystack.com/docs/payments/webhooks)
- [Test Cards](https://paystack.com/docs/payments/test-payments)

---

## ✅ Checklist

Before launching:

- [ ] Stripe account created and verified
- [ ] Paystack account created and verified
- [ ] All environment variables set
- [ ] Webhooks configured for both gateways
- [ ] Webhook secrets added to `.env.local`
- [ ] Test payments successful (Stripe)
- [ ] Test payments successful (Paystack)
- [ ] Webhooks receiving events
- [ ] Database updating correctly
- [ ] Email confirmations working (TODO)
- [ ] Success page displaying correctly
- [ ] Error handling tested
- [ ] Production keys ready
- [ ] Monitoring set up

---

## 🎉 You're Ready!

Your payment integration is complete! Users can now make donations using:
- **Stripe** - For USD, GBP, EUR, and other international currencies
- **Paystack** - For NGN (Nigerian Naira)

The system automatically routes payments to the appropriate gateway based on the user's currency.

