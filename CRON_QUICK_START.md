# Quick Start: Cron Job Setup

## 🚀 3-Step Setup

### Step 1: Generate CRON_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -hex 32
```

Or use Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 2: Add to Environment Variables

**Local (.env.local):**
```env
CRON_SECRET=your-generated-secret-here
```

**Vercel (Production):**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `CRON_SECRET` with your generated secret
3. Redeploy

### Step 3: Configure Cron (Choose One)

#### Option A: Vercel Cron (Easiest) ✅

If you're using Vercel, the `vercel.json` file is already created. Just:

1. Deploy to Vercel: `vercel --prod`
2. Done! Vercel will automatically run the cron job hourly

#### Option B: External Service

Use a free service like [cron-job.org](https://cron-job.org):

1. Sign up and create a new cron job
2. URL: `https://your-domain.com/api/cron/payouts`
3. Method: POST
4. Headers: `Authorization: Bearer YOUR_CRON_SECRET`
5. Schedule: Every hour

#### Option C: Manual Testing

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-domain.com/api/cron/payouts
```

## ✅ Verify It Works

1. Check the health endpoint (no auth needed):
   ```bash
   curl https://your-domain.com/api/cron/payouts
   ```
   Should return: `{"status":"ok","service":"payout-cron",...}`

2. Test the full cron (requires auth):
   ```bash
   curl -X POST \
     -H "Authorization: Bearer YOUR_CRON_SECRET" \
     https://your-domain.com/api/cron/payouts
   ```

## 📚 Full Documentation

See `docs/CRON_SETUP.md` for detailed instructions and troubleshooting.

