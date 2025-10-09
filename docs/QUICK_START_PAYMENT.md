# 🚀 Quick Start: Payment Integration

## ✅ Environment Variables Status

Your payment gateway environment variables have been configured!

### Current Setup:
- ✅ `NEXT_PUBLIC_APP_URL` → `https://localhost:3002`
- ✅ `STRIPE_SECRET_KEY` → Configured
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → Configured
- ✅ `PAYSTACK_SECRET_KEY` → Configured
- ✅ `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` → Configured
- ⚠️  `STRIPE_WEBHOOK_SECRET` → Not set (optional for initial testing)

---

## 🎯 Ready to Test!

You can now test payments **without** the webhook secret. The webhook secret is only needed for:
- Receiving real-time payment confirmations
- Production deployments
- Advanced testing

### Basic Testing (No Webhook):
1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Go to virtual giving mall:**
   ```
   https://localhost:3002/virtual-giving-mall
   ```

3. **Make a test donation:**
   - Select any charity
   - Fill in donation form
   - Use test cards:
     - **Stripe**: `4242 4242 4242 4242` (any future expiry, any CVV)
     - **Paystack**: `5399 8383 8383 8381` (any future expiry, any CVV)

---

## 🔧 Advanced: Set Up Stripe Webhooks (Optional)

For full webhook testing, you'll need the Stripe CLI.

### Install Stripe CLI:

**Mac (Homebrew):**
```bash
brew install stripe/stripe-cli/stripe
```

**Windows (Scoop):**
```bash
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**Linux:**
```bash
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_x86_64.tar.gz
tar -xvf stripe_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin
```

### Set Up Webhooks:

1. **Login to Stripe:**
   ```bash
   stripe login
   ```

2. **Start webhook forwarding:**
   ```bash
   stripe listen --forward-to https://localhost:3002/api/webhooks/stripe
   ```

3. **Copy the webhook secret** (starts with `whsec_`)

4. **Add to `.env.local`:**
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

5. **Restart dev server**

---

## 🧪 Testing Payment Flow

### Test Stripe Payment (International):

1. Visit charity page
2. Enter donation amount (e.g., $25)
3. Location will be detected → Uses Stripe for non-NGN
4. Enter email
5. Click "Donate"
6. Enter test card: `4242 4242 4242 4242`
7. Complete payment
8. See success page with confetti! 🎉

### Test Paystack Payment (Nigerian):

1. Visit charity page
2. Enter donation amount (e.g., ₦5000)
3. System detects NGN → Uses Paystack
4. Enter email
5. Click "Donate"
6. Enter test card: `5399 8383 8383 8381`
7. Enter PIN: `1234`
8. Enter OTP: `123456`
9. See success page! 🎉

---

## 📊 Verify Database Updates

After a successful payment, check the database:

```sql
-- View recent donations
SELECT 
  id,
  amount,
  currency,
  payment_status,
  donor_email,
  created_at
FROM charity_donations
ORDER BY created_at DESC
LIMIT 10;

-- View charity totals
SELECT 
  name,
  total_received,
  pending_amount
FROM charities
WHERE total_received > 0;
```

---

## 🎨 What You'll See

### 1. **Donation Form**
- Currency auto-detected based on location
- Preset amounts in local currency
- Custom amount option
- Anonymous donation option

### 2. **Payment Page**
- **Stripe**: Embedded payment form (for international)
- **Paystack**: Redirect to Paystack page (for NGN)

### 3. **Success Page**
- Confetti animation 🎉
- Donation receipt
- Social sharing
- Print option

---

## ⚙️ Environment Variables Reference

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=https://localhost:3002

# Stripe (International Payments)
STRIPE_SECRET_KEY=sk_test_...                           # From Stripe Dashboard
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...         # From Stripe Dashboard
STRIPE_WEBHOOK_SECRET=whsec_...                         # From stripe listen command

# Paystack (Nigerian Payments)
PAYSTACK_SECRET_KEY=sk_test_...                         # From Paystack Dashboard
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...            # From Paystack Dashboard
```

---

## 🐛 Troubleshooting

### Issue: Payment succeeds but donation not recorded

**Without Webhooks:**
- This is expected! Webhooks update the database
- You can manually verify payment in Stripe/Paystack dashboard
- For testing, you can manually update the database

**With Webhooks:**
- Check webhook is forwarding: `stripe listen ...`
- Verify webhook secret is correct
- Check terminal for webhook events

### Issue: Cannot access checkout page

**Solution:**
- Ensure `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Check browser console for errors
- Verify dev server is running on correct port

### Issue: Paystack payment fails

**Solution:**
- Use correct test card: `5399 8383 8383 8381`
- Enter PIN when prompted: `1234`
- Enter OTP when prompted: `123456`

---

## 🚀 Production Deployment

When ready for production:

1. **Get Live API Keys:**
   - Stripe: Switch to live keys in dashboard
   - Paystack: Complete business verification

2. **Update Environment Variables:**
   ```bash
   STRIPE_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   PAYSTACK_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_...
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   ```

3. **Configure Production Webhooks:**
   - Stripe: `https://your-domain.com/api/webhooks/stripe`
   - Paystack: `https://your-domain.com/api/webhooks/paystack`

4. **Test with Real Money:**
   - Make small test donation
   - Verify webhook delivery
   - Check database updates

---

## 📚 Additional Resources

- [Full Payment Gateway Setup](./PAYMENT_GATEWAY_SETUP.md)
- [Payment Integration Overview](./PAYMENT_INTEGRATION_COMPLETE.md)
- [Charity API Documentation](./CHARITY_API_SETUP.md)

---

## ✅ Checklist

- [x] Environment variables configured
- [x] Payment gateways connected
- [x] Test cards ready
- [ ] Stripe CLI installed (optional)
- [ ] Webhook secret set (optional)
- [ ] Test donation completed
- [ ] Database verified
- [ ] Production keys ready (when going live)

---

## 🎉 You're Ready!

Your payment system is configured and ready to accept donations! 

**Next Step:** Make a test donation and see it work! 🚀

