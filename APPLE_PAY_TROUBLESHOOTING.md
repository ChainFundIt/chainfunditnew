# Apple Pay Troubleshooting Guide

If you can't see the Apple Pay option in Safari on your MacBook, follow these steps:

## Paystack vs Stripe

**If you're using Paystack:**
- Apple Pay appears on Paystack's hosted checkout page (checkout.paystack.com)
- You need to verify your domain in **Paystack Dashboard** (not Stripe)
- The verification file must be accessible at your domain root

**If you're using Stripe:**
- Apple Pay appears in PaymentElement or custom buttons
- You need to verify your domain in **Stripe Dashboard**

## Quick Checklist for Paystack

1. ✅ **Enable Apple Pay in Paystack Dashboard** (MOST IMPORTANT)
   - Go to [Paystack Dashboard](https://dashboard.paystack.com) → Settings → Preferences
   - Make sure **International Payments** is enabled
   - Check the **Apple Pay** option
   - Accept the Apple Pay Platform Web Merchant Terms and Conditions

2. ✅ **Domain Verification in Paystack** (REQUIRED)
   - Go to [Paystack Dashboard](https://dashboard.paystack.com) → Settings → Apple Pay tab
   - Click **Add new domain**
   - Enter your domain name (e.g., `yourdomain.com`)
   - Download the domain verification file
   - Place it at: `public/.well-known/apple-developer-merchantid-domain-association`
   - The file must be accessible at: `https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association`
   - Return to Paystack Dashboard and click **Verify Domain**
   - Wait for verification to complete (should show as verified)

2. ✅ **HTTPS Required**
   - Apple Pay only works over HTTPS (or localhost for development)
   - Make sure you're using `https://` in production

3. ✅ **Safari Browser**
   - Apple Pay only works in Safari (not Chrome, Firefox, etc.)
   - Make sure you're using Safari on macOS Sierra or later

4. ✅ **Apple Pay Setup**
   - Make sure Apple Pay is set up on your MacBook
   - Go to System Settings → Wallet & Apple Pay
   - Add a card if you haven't already

5. ✅ **Check Browser Console**
   - Open Safari Developer Tools (Cmd+Option+I)
   - Go to Console tab
   - Look for messages starting with `[Apple Pay]` or `[Checkout]`
   - Check for any errors

## Debugging Steps

### Step 1: Check Domain Verification File

Visit this URL in your browser:
```
https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association
```

You should see the verification file content. If you get a 404, the file isn't in the right place.

**Fix:** Make sure the file is at `public/.well-known/apple-developer-merchantid-domain-association`

### Step 2: Verify Domain in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Settings** → **Payment methods** → **Apple Pay**
3. Find your domain in the list
4. Click **Verify** next to your domain
5. Wait for verification to complete (usually instant)

### Step 3: Check Browser Console

1. Open Safari
2. Press `Cmd+Option+I` to open Developer Tools
3. Go to the Console tab
4. Look for messages like:
   - `[Apple Pay] Apple Pay is available!` ✅
   - `[Apple Pay] Apple Pay not available` ❌
   - `[Checkout] Apple Pay is available` ✅
   - `[Checkout] Apple Pay not available` ❌

### Step 4: Test PaymentElement

The `PaymentElement` component should automatically show Apple Pay if:
- Domain is verified
- You're on Safari
- Apple Pay is set up on your device
- You're on HTTPS (or localhost)

If you see the debug info in development mode, it will show:
- Whether Apple Pay is detected
- Whether Stripe is loaded
- The protocol being used
- Browser detection

## Common Issues and Solutions

### Issue: "Apple Pay not available" in console

**Possible causes:**
1. Domain not verified in Stripe Dashboard
2. Verification file not accessible
3. Not using Safari
4. Apple Pay not set up on device

**Solution:**
- Verify domain in Stripe Dashboard
- Check verification file is accessible
- Use Safari browser
- Set up Apple Pay in System Settings

### Issue: PaymentElement doesn't show Apple Pay button

**Possible causes:**
1. Domain not verified
2. Using wrong browser
3. PaymentElement configuration issue

**Solution:**
- PaymentElement automatically includes Apple Pay if available
- Make sure domain is verified
- Use Safari browser
- Check browser console for errors

### Issue: Custom Apple Pay button doesn't appear

**Possible causes:**
1. `canMakePayment()` returns false
2. Domain not verified
3. Stripe not loaded

**Solution:**
- Check browser console for `[Apple Pay]` messages
- Verify domain in Stripe Dashboard
- Make sure Stripe is loaded (check `stripe` object exists)

## Testing on Localhost

For local development:
1. Apple Pay works on `localhost` (no HTTPS needed)
2. Make sure you're using Safari
3. Domain verification is still required (use your production domain)
4. Check console for availability messages

## Still Not Working?

1. Check browser console for errors
2. Verify domain in Stripe Dashboard
3. Make sure verification file is accessible
4. Test with a different device/browser
5. Contact Stripe support if domain verification fails

## Debug Information

When in development mode, you'll see a debug panel showing:
- Apple Pay availability status
- Stripe loading status
- Protocol (http/https)
- Browser detection

This helps identify why Apple Pay might not be showing.
