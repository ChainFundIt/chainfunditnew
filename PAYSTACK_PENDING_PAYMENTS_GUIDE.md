# Resolving Pending Paystack Payments

## Why Payments Get Stuck in Pending Status

Paystack payments can remain in "pending" status for several reasons:

### 1. **Webhook Not Received**
- Paystack sends webhooks to notify your server when payment status changes
- If the webhook URL is not configured correctly in Paystack dashboard
- If the webhook fails verification (invalid signature)
- If your server was down when the webhook was sent
- If network issues prevented webhook delivery

### 2. **User Didn't Complete Payment**
- User was redirected to Paystack payment page but didn't complete the transaction
- User closed the browser before completing payment
- Payment was abandoned

### 3. **Callback Not Triggered**
- User completed payment but didn't get redirected back to your site
- Browser was closed before redirect
- Network issues during redirect
- Callback URL misconfiguration

### 4. **Payment Method Delays**
- Some payment methods (like bank transfers) can take time to clear
- Payment might be pending on Paystack's side

### 5. **Missing Payment Reference**
- Payment was initialized but reference wasn't stored in database
- Database transaction failed after payment initialization

## How to Resolve Pending Payments

### Option 1: Use the Admin API Endpoint (Recommended)

#### Bulk Verify All Pending Paystack Payments

```bash
# Verify all pending Paystack payments
curl -X POST https://your-domain.com/api/admin/process-pending-payments \
  -H "Content-Type: application/json" \
  -d '{
    "bulk": true,
    "paymentMethod": "paystack",
    "action": "verify"
  }'
```

#### Get List of Pending Payments

```bash
# Get all pending payments
curl https://your-domain.com/api/admin/process-pending-payments
```

#### Process Single Payment

```bash
# Verify a specific payment
curl -X POST https://your-domain.com/api/admin/process-pending-payments \
  -H "Content-Type: application/json" \
  -d '{
    "donationId": "donation-id-here",
    "action": "verify"
  }'
```

### Option 2: Use the Script (For Local/Development)

```bash
# Dry run (see what would be processed without making changes)
npx tsx scripts/resolve-pending-paystack-payments.ts --dry-run

# Process all pending payments
npx tsx scripts/resolve-pending-paystack-payments.ts

# Process with limit (useful for testing)
npx tsx scripts/resolve-pending-paystack-payments.ts --limit 10
```

### Option 3: Manual Verification via Paystack Dashboard

1. Go to Paystack Dashboard → Transactions
2. Find the transaction by reference
3. Check the actual status on Paystack
4. If successful, manually update in your database or use the admin endpoint

## Prevention: Setting Up Webhooks Correctly

### 1. Configure Webhook URL in Paystack Dashboard

1. Log in to [Paystack Dashboard](https://dashboard.paystack.com)
2. Go to **Settings** → **Webhooks**
3. Add webhook URL: `https://your-domain.com/api/payments/paystack/webhook`
4. Select events to listen for:
   - `charge.success`
   - `charge.failed`
   - `charge.pending`

### 2. Verify Webhook Secret

Ensure your `PAYSTACK_SECRET_KEY` environment variable is set correctly. The webhook handler uses this to verify webhook signatures.

### 3. Test Webhook Delivery

Paystack provides a webhook testing tool in the dashboard. Use it to verify your webhook endpoint is working.

## Monitoring Pending Payments

### Automated Verification (Recommended)

A cron job is available to automatically verify pending Paystack payments. This runs every 15 minutes and verifies payments older than 5 minutes.

#### Vercel Deployment

If deployed on Vercel, the cron job is automatically configured in `vercel.json`:
- **Schedule**: Every 15 minutes (`*/15 * * * *`)
- **Endpoint**: `/api/cron/verify-pending-paystack`
- **Authentication**: Uses `CRON_SECRET` environment variable

#### Manual Setup (Other Platforms)

For other platforms, set up a cron job to call the endpoint:

```bash
# Every 15 minutes
*/15 * * * * curl -X POST https://your-domain.com/api/cron/verify-pending-paystack \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

#### Environment Variable

Make sure to set `CRON_SECRET` in your environment variables:
```bash
CRON_SECRET=your-secret-key-here
```

#### GitHub Actions

You can also set up a GitHub Actions workflow:

```yaml
name: Verify Pending Paystack Payments
on:
  schedule:
    - cron: '*/15 * * * *'  # Every 15 minutes
  workflow_dispatch:  # Allow manual trigger

jobs:
  verify-payments:
    runs-on: ubuntu-latest
    steps:
      - name: Verify Pending Payments
        run: |
          curl -X POST https://your-domain.com/api/cron/verify-pending-paystack \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json"
```

### Check Pending Payments Manually

You can also manually trigger verification:

```bash
# Via API
curl -X POST https://your-domain.com/api/admin/process-pending-payments \
  -H "Content-Type: application/json" \
  -d '{"bulk":true,"paymentMethod":"paystack","action":"verify"}'
```

### Automated Cleanup

The existing cleanup endpoint (`/api/cron/cleanup-pending-donations`) automatically marks payments as failed if they've been pending for more than 1 hour without any response. However, the new verification cron job will verify payments before they reach that point.

## Common Issues and Solutions

### Issue: "Invalid key" error when verifying

**Solution**: Check that `PAYSTACK_SECRET_KEY` is set correctly in your environment variables. It should start with `sk_test_` (test) or `sk_live_` (live).

### Issue: Payments verified but campaign amount not updated

**Solution**: The script automatically updates campaign amounts. If this fails, check:
- Campaign exists in database
- Database connection is working
- No errors in logs

### Issue: Too many API calls to Paystack

**Solution**: The script includes rate limiting delays (200ms between requests). If you have many payments, process in batches using the `--limit` option.

## API Response Format

### Bulk Processing Response

```json
{
  "success": true,
  "message": "Processed 15 pending payments",
  "processed": 15,
  "completed": 10,
  "failed": 3,
  "errors": 2,
  "details": [
    {
      "donationId": "donation-123",
      "status": "completed"
    },
    {
      "donationId": "donation-456",
      "status": "failed",
      "error": "Payment verification failed"
    }
  ]
}
```

## Best Practices

1. **Regular Monitoring**: Check for pending payments daily
2. **Webhook Setup**: Ensure webhooks are properly configured
3. **Error Logging**: Monitor logs for webhook failures
4. **User Communication**: Notify users if payment is pending for extended periods
5. **Automated Cleanup**: Use cron jobs to automatically verify pending payments

## Support

If you continue to experience issues with pending payments:

1. Check Paystack Dashboard for transaction status
2. Review server logs for webhook errors
3. Verify webhook URL is accessible
4. Ensure `PAYSTACK_SECRET_KEY` is correct
5. Contact Paystack support if payments are successful on their end but not updating in your system

