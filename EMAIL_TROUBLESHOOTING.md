# Email Troubleshooting Guide

## Issue: Donation Emails Not Sending

If donation emails (to donors and campaign creators) are not being sent, check the following:

### 1. Check Resend Configuration

**Required Environment Variables:**
- `RESEND_API_KEY` - Your Resend API key
- `RESEND_FROM_EMAIL` - Email address from your verified domain (e.g., `notifications@yourdomain.com`)
- `NEXT_PUBLIC_APP_URL` - Your app's base URL

**To verify in Netlify:**
1. Go to Site settings → Environment variables
2. Check that all three variables are set
3. Verify `RESEND_FROM_EMAIL` is from a domain verified in Resend

### 2. Verify Resend Domain Setup

1. **Go to Resend Dashboard:**
   - Navigate to https://resend.com/domains
   - Check if your domain is verified

2. **Check DNS Records:**
   - SPF record should be set
   - DKIM records should be set
   - DMARC record (optional but recommended)

3. **Verify Sender Email:**
   - `RESEND_FROM_EMAIL` must be from a verified domain
   - Example: If domain is `chainfundit.com`, use `notifications@chainfundit.com`

### 3. Check Server Logs

Look for these log messages in your server logs:

**Success messages:**
- `✅ Donor confirmation email sent to [email]`
- `✅ Campaign donation email sent to creator`

**Error messages:**
- `RESEND_API_KEY is not configured`
- `RESEND_FROM_EMAIL is not configured`
- `Error sending donor confirmation email: [error]`
- `Error sending campaign donation email: [error]`

### 4. Common Issues

#### Issue: "RESEND_API_KEY is not configured"
**Solution:** Set `RESEND_API_KEY` in Netlify environment variables

#### Issue: "RESEND_FROM_EMAIL is not configured"
**Solution:** Set `RESEND_FROM_EMAIL` in Netlify environment variables

#### Issue: "Invalid or guest email"
**Solution:** This is expected for guest/anonymous donations. Emails are only sent to logged-in users with valid email addresses.

#### Issue: "Campaign donation notifications are disabled"
**Solution:** Check user preferences - the campaign creator may have disabled email notifications in their settings.

### 5. Test Email Sending

**Check Resend Dashboard:**
1. Go to https://resend.com/emails
2. Look for recent email attempts
3. Check for failed deliveries
4. Review error messages

**Test with a real donation:**
1. Make a test donation (logged in as a real user)
2. Check server logs for email sending attempts
3. Check Resend dashboard for email status
4. Verify email was delivered (check spam folder)

### 6. Email Preferences

**Campaign Creators:**
- Emails are sent based on user preferences
- Check: Settings → Preferences → "Notify on Campaign Donation"
- If disabled, no email will be sent (only in-app notification)

**Donors:**
- Emails are always sent (if valid email exists)
- Guest donations (without real email) are skipped

### 7. Debugging Steps

1. **Check Environment Variables:**
   ```bash
   # In your local .env.local or Netlify dashboard
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   RESEND_FROM_EMAIL=notifications@yourdomain.com
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

2. **Check Resend API Key:**
   - Go to Resend Dashboard → API Keys
   - Verify the key is active
   - Check if you've exceeded rate limits

3. **Check Domain Verification:**
   - Resend Dashboard → Domains
   - Verify domain status is "Verified"
   - Check DNS records are correct

4. **Check Email Logs:**
   - Resend Dashboard → Emails
   - Look for recent sends
   - Check delivery status
   - Review any error messages

### 8. What Was Fixed

✅ **Campaign Creator Emails:**
- Added `sendCampaignDonationEmailById` function
- Integrated into all payment success handlers
- Sends email when campaign receives donation

✅ **Donor Confirmation Emails:**
- Already implemented
- Added better error checking for Resend configuration
- Improved logging

✅ **Error Handling:**
- Added checks for missing Resend configuration
- Better error messages in logs
- Email failures don't break payment flow

### 9. Next Steps

1. **Verify Environment Variables** are set in Netlify
2. **Check Resend Dashboard** for email delivery status
3. **Test with a real donation** and check logs
4. **Review user preferences** - ensure notifications are enabled

### 10. Still Not Working?

If emails still aren't sending after checking all above:

1. **Check Resend Account:**
   - Verify account is active
   - Check if you've exceeded monthly limits
   - Verify billing is set up (if required)

2. **Check Email Addresses:**
   - Ensure donor email is valid
   - Ensure campaign creator email is valid
   - Check for typos in email addresses

3. **Check Spam Folder:**
   - Emails might be going to spam
   - Check spam/junk folders
   - Add sender to contacts

4. **Contact Support:**
   - Check Resend support documentation
   - Review Resend status page
   - Contact Resend support if needed

