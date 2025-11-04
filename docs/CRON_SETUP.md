# Cron Job Setup Guide for Payout Processing

This guide explains how to set up automated cron jobs for payout processing, including retrying failed payouts and processing automated charity payouts.

## 📋 Table of Contents

1. [Generate CRON_SECRET](#1-generate-cron_secret)
2. [Set Environment Variable](#2-set-environment-variable)
3. [Configure Cron Job](#3-configure-cron-job)
   - [Option A: Vercel Cron](#option-a-vercel-cron-recommended)
   - [Option B: GitHub Actions](#option-b-github-actions)
   - [Option C: External Cron Service](#option-c-external-cron-service)
   - [Option D: Manual Testing](#option-d-manual-testing)
4. [Testing the Cron Endpoint](#4-testing-the-cron-endpoint)

---

## 1. Generate CRON_SECRET

The `CRON_SECRET` is a secure random string used to authenticate cron job requests. Here are several ways to generate one:

### Method 1: Using OpenSSL (Recommended)
```bash
openssl rand -hex 32
```

### Method 2: Using Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Method 3: Using Online Generator
Visit: https://randomkeygen.com/ and use a "Fort Knox Password" (256-bit key)

### Method 4: Using Python
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

**Example output:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

**⚠️ Important:** Keep this secret secure and never commit it to version control!

---

## 2. Set Environment Variable

### For Local Development

Add to your `.env.local` file:

```env
CRON_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### For Production (Vercel)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Click **Add New**
4. Set:
   - **Name:** `CRON_SECRET`
   - **Value:** Your generated secret
   - **Environment:** Production, Preview, Development (select all)
5. Click **Save**
6. **Redeploy** your application for changes to take effect

### For Production (Other Platforms)

Add the environment variable through your hosting platform's dashboard or CLI:

**Railway:**
```bash
railway variables set CRON_SECRET=your-secret-here
```

**Render:**
Add via Dashboard → Environment → Environment Variables

**DigitalOcean App Platform:**
Add via App Settings → App-Level Environment Variables

---

## 3. Configure Cron Job

Choose one of the following options based on your hosting platform:

### Option A: Vercel Cron (Recommended)

Vercel Cron is built-in and free for Vercel deployments.

#### Step 1: Create `vercel.json`

Create or update `vercel.json` in your project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/payouts",
      "schedule": "0 * * * *"
    }
  ]
}
```

**Schedule Formats:**
- `0 * * * *` - Every hour at minute 0
- `0 */2 * * *` - Every 2 hours
- `0 9 * * *` - Daily at 9 AM
- `*/30 * * * *` - Every 30 minutes
- `0 0 * * 0` - Weekly on Sunday at midnight

#### Step 2: Deploy to Vercel

```bash
vercel --prod
```

Vercel will automatically set up the cron job and call your endpoint with the `x-vercel-signature` header. Update the cron endpoint to accept Vercel's signature:

```typescript
// For Vercel Cron, you can also verify the signature
const signature = request.headers.get('x-vercel-signature');
// Vercel automatically signs requests, so CRON_SECRET check is still valid
```

#### Step 3: Monitor Cron Jobs

View cron job execution in:
- Vercel Dashboard → Your Project → **Crons** tab
- Check logs in **Deployments** → Click deployment → **Functions** → `/api/cron/payouts`

---

### Option B: GitHub Actions

Use GitHub Actions for free cron jobs (public repos) or paid plans.

#### Step 1: Create Workflow File

Create `.github/workflows/payout-cron.yml`:

```yaml
name: Payout Cron Job

on:
  schedule:
    # Run every hour at minute 0
    - cron: '0 * * * *'
  workflow_dispatch: # Allow manual triggering

jobs:
  payout-cron:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Payout Cron
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json" \
            https://your-domain.com/api/cron/payouts
```

#### Step 2: Add Secret to GitHub

1. Go to your repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `CRON_SECRET`
4. Value: Your generated secret
5. Click **Add secret**

#### Step 3: Commit and Push

```bash
git add .github/workflows/payout-cron.yml
git commit -m "Add payout cron job"
git push
```

---

### Option C: External Cron Service

Use free/paid external services for cron jobs.

#### Option C1: cron-job.org (Free)

1. Sign up at https://cron-job.org (free tier available)
2. Create a new cron job:
   - **Title:** Payout Processing
   - **Address:** `https://your-domain.com/api/cron/payouts`
   - **Schedule:** Every hour
   - **Request Method:** POST
   - **Request Headers:** 
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     Content-Type: application/json
     ```
3. Save and activate

#### Option C2: EasyCron

1. Sign up at https://www.easycron.com
2. Create cron job:
   - **URL:** `https://your-domain.com/api/cron/payouts`
   - **HTTP Method:** POST
   - **HTTP Headers:** 
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     ```
   - **Schedule:** Hourly
3. Save

#### Option C3: Zapier / Make.com

1. Create a new Zap/Scenario
2. Trigger: Schedule (hourly)
3. Action: Webhook (POST)
   - **URL:** `https://your-domain.com/api/cron/payouts`
   - **Headers:**
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     ```

---

### Option D: Manual Testing

For testing purposes, you can manually trigger the cron job:

```bash
# Using curl
curl -X POST \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  https://your-domain.com/api/cron/payouts

# Using httpie
http POST https://your-domain.com/api/cron/payouts \
  Authorization:"Bearer YOUR_CRON_SECRET"

# Using wget
wget --method=POST \
  --header="Authorization: Bearer YOUR_CRON_SECRET" \
  --header="Content-Type: application/json" \
  https://your-domain.com/api/cron/payouts
```

---

## 4. Testing the Cron Endpoint

### Health Check (No Auth Required)

```bash
curl https://your-domain.com/api/cron/payouts
```

Expected response:
```json
{
  "status": "ok",
  "service": "payout-cron",
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

### Full Cron Execution (Requires Auth)

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  https://your-domain.com/api/cron/payouts
```

Expected response:
```json
{
  "success": true,
  "timestamp": "2024-01-15T10:00:00.000Z",
  "results": {
    "retry": {
      "success": true,
      "results": {
        "campaign": { "attempted": 0, "succeeded": 0, "failed": 0 },
        "commission": { "attempted": 0, "succeeded": 0, "failed": 0 }
      },
      "summary": {
        "totalAttempted": 0,
        "totalSucceeded": 0,
        "totalFailed": 0
      }
    },
    "charityPayouts": {
      "success": true,
      "results": {
        "checked": 10,
        "created": 2,
        "processed": 0,
        "failed": 0,
        "errors": []
      }
    }
  }
}
```

### Testing Locally

For local testing, you can temporarily disable the secret check:

```typescript
// In app/api/cron/payouts/route.ts (temporary for testing)
if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
  // Comment out for local testing
  // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

Or set `CRON_SECRET` in your `.env.local` and use it:

```bash
curl -X POST \
  -H "Authorization: Bearer $(grep CRON_SECRET .env.local | cut -d '=' -f2)" \
  http://localhost:3000/api/cron/payouts
```

---

## 📊 Monitoring & Logs

### Check Cron Execution

1. **Vercel:** Dashboard → Project → Deployments → Functions → `/api/cron/payouts` → Logs
2. **GitHub Actions:** Repository → Actions → Workflow runs
3. **External Services:** Check their dashboard logs

### Expected Behavior

The cron job will:
1. ✅ Retry failed payouts (campaign & commission) that failed more than 1 hour ago
2. ✅ Create automated charity payouts for charities with pending donations ≥ $100
3. ✅ Log all results and errors

### Recommended Schedule

- **Development:** Every 30 minutes (`*/30 * * * *`)
- **Production:** Every hour (`0 * * * *`)
- **High Volume:** Every 15 minutes (`*/15 * * * *`)

---

## 🔒 Security Best Practices

1. ✅ **Never commit CRON_SECRET to version control**
2. ✅ **Use a strong, randomly generated secret (32+ characters)**
3. ✅ **Rotate the secret periodically** (every 90 days)
4. ✅ **Monitor cron job logs for unauthorized access attempts**
5. ✅ **Use HTTPS only** for production endpoints
6. ✅ **Consider IP whitelisting** if using external cron services

---

## 🐛 Troubleshooting

### Cron Job Not Running

1. **Check environment variable:**
   ```bash
   # Verify it's set
   echo $CRON_SECRET
   ```

2. **Check endpoint logs:**
   - Look for 401 Unauthorized errors
   - Verify the Authorization header is being sent correctly

3. **Test manually:**
   ```bash
   curl -X POST -H "Authorization: Bearer YOUR_SECRET" https://your-domain.com/api/cron/payouts
   ```

### 401 Unauthorized Error

- Verify `CRON_SECRET` is set correctly
- Check that the Authorization header format is: `Bearer YOUR_SECRET`
- Ensure there are no extra spaces in the header value

### Cron Job Running But Not Processing

- Check application logs for errors
- Verify database connection
- Check that payout records exist in the database
- Review the cron response JSON for error messages

---

## 📝 Summary

1. ✅ Generate a secure `CRON_SECRET` (32+ character random string)
2. ✅ Add `CRON_SECRET` to environment variables (`.env.local` for dev, platform dashboard for prod)
3. ✅ Choose a cron solution (Vercel Cron recommended for Vercel deployments)
4. ✅ Configure the schedule (hourly recommended)
5. ✅ Test the endpoint manually first
6. ✅ Monitor logs and adjust schedule as needed

Your cron job is now ready to automatically process payouts! 🎉

