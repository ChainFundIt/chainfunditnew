# Vercel Deployment Guide

## Installing Vercel CLI

### Option 1: Using npm (Recommended)

```bash
npm install -g vercel
```

### Option 2: Using pnpm

```bash
pnpm add -g vercel
```

### Option 3: Using yarn

```bash
yarn global add vercel
```

### Option 4: Using Homebrew (Mac)

```bash
brew install vercel-cli
```

### Option 5: Using npx (No Installation Required)

You can use Vercel CLI without installing it globally:

```bash
npx vercel --prod
```

## Deploying to Vercel

### First Time Setup

1. **Login to Vercel:**
   ```bash
   vercel login
   ```

2. **Link your project:**
   ```bash
   vercel link
   ```
   This will ask you to:
   - Select or create a Vercel project
   - Link to existing project or create new one

3. **Deploy:**
   ```bash
   vercel --prod
   ```

### Subsequent Deployments

Once linked, you can simply run:
```bash
vercel --prod
```

Or use npx (no global installation needed):
```bash
npx vercel --prod
```

## Alternative: Deploy via GitHub

If you don't want to use the CLI, you can:

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Add cron job configuration"
   git push
   ```

2. **Connect GitHub to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will automatically deploy on every push

3. **Set Environment Variables:**
   - Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add `CRON_SECRET` and other required variables

## Setting Up Cron Job on Vercel

After deploying, the cron job will be automatically configured if you have `vercel.json` in your project root.

### Verify Cron Job is Set Up

1. Go to Vercel Dashboard → Your Project
2. Click on the **Crons** tab
3. You should see `/api/cron/payouts` listed with schedule `0 * * * *`

### Manual Verification

You can also test the cron endpoint manually:

```bash
# Health check (no auth needed)
curl https://your-domain.vercel.app/api/cron/payouts

# Full cron execution (requires CRON_SECRET)
curl -X POST \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-domain.vercel.app/api/cron/payouts
```

## Troubleshooting

### "command not found: vercel"

**Solution 1:** Install globally:
```bash
npm install -g vercel
```

**Solution 2:** Use npx (no installation):
```bash
npx vercel --prod
```

**Solution 3:** Use Homebrew (Mac):
```bash
brew install vercel-cli
```

### "Not authorized" error

Make sure you're logged in:
```bash
vercel login
```

### Cron job not showing in Vercel Dashboard

1. Make sure `vercel.json` is in the project root
2. Redeploy the application
3. Check that the cron path matches your API route: `/api/cron/payouts`

### Environment Variables Not Working

1. Add variables in Vercel Dashboard → Settings → Environment Variables
2. Make sure to select all environments (Production, Preview, Development)
3. **Redeploy** after adding new variables

## Quick Commands Reference

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project (first time)
vercel link

# Deploy to production
vercel --prod

# Deploy to preview
vercel

# View deployments
vercel ls

# View logs
vercel logs

# Remove project link
vercel unlink
```

