# Paystack Apple Pay Setup Guide

Since you're using Paystack, Apple Pay will appear on Paystack's hosted checkout page (checkout.paystack.com) automatically once everything is configured.

## Step-by-Step Setup

### Step 1: Enable Apple Pay in Paystack Dashboard

1. Log in to your [Paystack Dashboard](https://dashboard.paystack.com)
2. Go to **Settings** → **Preferences**
3. Make sure **International Payments** is enabled (required for Apple Pay)
4. Under **Accept payments via**, check the **Apple Pay** option
5. Accept the **Apple Pay Platform Web Merchant Terms and Conditions**
6. Click **Save**

### Step 2: Register and Verify Your Domain

1. In Paystack Dashboard, go to **Settings** → **Apple Pay** tab
2. Click **Add new domain**
3. Enter your domain name (e.g., `yourdomain.com`)
   - **Important**: Include subdomains if needed (e.g., `www.yourdomain.com` is different from `yourdomain.com`)
4. Download the domain verification file provided by Paystack
5. Place the file in your project at:
   ```
   public/.well-known/apple-developer-merchantid-domain-association
   ```
6. Deploy your site so the file is accessible at:
   ```
   https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association
   ```
7. Return to Paystack Dashboard
8. Click **Verify Domain** next to your domain
9. Wait for verification (usually instant, but can take a few minutes)

### Step 3: Verify File Accessibility

Test that the file is accessible:

```bash
curl -I https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association
```

You should see:
- Status: `200 OK`
- Content-Type: `application/text` or `text/plain`

### Step 4: Test Apple Pay

1. Make a donation on your site
2. You'll be redirected to Paystack's checkout page (checkout.paystack.com)
3. On the left sidebar, you should see **Apple Pay** as a payment option
4. Click it to complete the payment with Apple Pay

## Troubleshooting

### Apple Pay Not Showing on Paystack Checkout

**Check 1: Domain Verification**
- Go to Paystack Dashboard → Settings → Apple Pay
- Make sure your domain shows as **Verified** (green checkmark)
- If not verified, click "Verify Domain" again

**Check 2: Apple Pay Enabled**
- Go to Paystack Dashboard → Settings → Preferences
- Make sure **Apple Pay** is checked under "Accept payments via"
- Make sure **International Payments** is enabled

**Check 3: File Accessibility**
- Visit: `https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association`
- You should see the file content (not a 404 error)
- Check the Content-Type header (should be `application/text`)

**Check 4: Browser and Device**
- Must use **Safari** browser (not Chrome, Firefox, etc.)
- Must be on **macOS Sierra+** or **iOS 10+**
- Must have **Apple Pay set up** on your device
- Go to System Settings → Wallet & Apple Pay to add a card

**Check 5: HTTPS**
- Your site must be served over **HTTPS** (or localhost for development)
- Paystack's checkout page is always HTTPS, so this should be fine

### Common Issues

**Issue: "Domain verification failed"**
- Make sure the file is at `public/.well-known/apple-developer-merchantid-domain-association`
- Make sure the file content matches exactly what Paystack provided
- Make sure the file is accessible without authentication
- Check that Content-Type is correct

**Issue: "Apple Pay option not showing on checkout"**
- Domain must be verified in Paystack Dashboard
- Apple Pay must be enabled in Preferences
- Must be using Safari browser
- Must have Apple Pay set up on device

**Issue: "File returns 404"**
- Make sure file is in `public/` directory (not `app/`)
- Make sure file is deployed to production
- Check file path is exactly `.well-known/apple-developer-merchantid-domain-association`

## Testing Checklist

- [ ] Apple Pay enabled in Paystack Dashboard → Settings → Preferences
- [ ] International Payments enabled in Paystack Dashboard
- [ ] Domain added in Paystack Dashboard → Settings → Apple Pay
- [ ] Domain shows as "Verified" in Paystack Dashboard
- [ ] Verification file accessible at `https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association`
- [ ] Using Safari browser
- [ ] Apple Pay set up on device (System Settings → Wallet & Apple Pay)
- [ ] Site served over HTTPS (or localhost)

## Need Help?

If Apple Pay still doesn't appear after completing all steps:

1. Check Paystack Dashboard for any error messages
2. Contact Paystack support with:
   - Your domain name
   - Screenshot of domain verification status
   - Browser console errors (if any)

## References

- [Paystack Apple Pay Documentation](https://paystack.com/docs/payments/apple-pay/)
- [Paystack Support](https://support.paystack.com)
