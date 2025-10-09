# Charity API Quick Start Guide

This guide will help you get the Charity API system up and running quickly.

## Prerequisites

- Cheerio is already installed ✅
- PostgreSQL database (Neon) configured
- Next.js 15+ project

## Quick Setup (5 Steps)

### Step 1: Run Database Migration

Generate and run the migration to create charity tables:

```bash
npm run db:generate
npm run db:push
```

Or if you prefer migrations:

```bash
npm run db:migrate
```

### Step 2: Seed Sample Charities

Populate the database with 10 verified charities:

```bash
npm run seed-charities
```

This creates sample charities including:
- Save the Children
- Doctors Without Borders
- World Wildlife Fund
- Feeding America
- UNICEF
- American Red Cross
- And more...

### Step 3: Configure Environment Variables

Add to your `.env.local`:

```bash
# Minimum payout amount in USD
MIN_CHARITY_PAYOUT_AMOUNT=100

# Secret for protecting cron endpoints
CRON_SECRET=your-random-secret-here

# Optional: Payment gateway keys (if integrating with Stripe/Paystack)
# STRIPE_SECRET_KEY=sk_...
# PAYSTACK_SECRET_KEY=sk_...
```

### Step 4: Start the Development Server

```bash
npm run dev
```

### Step 5: Access the Charity Pages

Open your browser and navigate to:

- **Charity Listing:** http://localhost:3000/charities
- **Individual Charity:** http://localhost:3000/charities/save-the-children
- **Admin Payouts:** http://localhost:3000/admin/charity-payouts

## Testing the System

### 1. View Charities

Visit `/charities` to see all verified charities with:
- Search functionality
- Category filtering
- Donation buttons

### 2. Make a Test Donation

1. Click on any charity
2. Select a donation amount
3. Fill in donor information
4. Submit the form

Note: Payment processing requires Stripe/Paystack integration (see full docs)

### 3. Test API Endpoints

#### Get All Charities
```bash
curl http://localhost:3000/api/charities
```

#### Get Charity by Slug
```bash
curl http://localhost:3000/api/charities/save-the-children
```

#### Get Categories
```bash
curl http://localhost:3000/api/charities/categories
```

#### Create a Donation (POST)
```bash
curl -X POST http://localhost:3000/api/charities/CHARITY_ID/donate \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "currency": "USD",
    "donorEmail": "test@example.com",
    "donorName": "Test Donor",
    "paymentMethod": "stripe"
  }'
```

## Scraping More Charities

### Option 1: Use the Scraper Script

Edit `scripts/scrape-charities.ts` to configure your scraper:

```typescript
factory.addScraper(new GenericCharityScraper({
  name: 'Your Charity Directory',
  baseUrl: 'https://example.org',
  urls: ['https://example.org/charities'],
  selectors: {
    container: '.charity-item',
    name: '.charity-name',
    description: '.charity-description',
    website: 'a.website',
  }
}));
```

Then run:
```bash
npm run scrape-charities
```

### Option 2: Manual Entry

You can also add charities manually via the API:

```bash
curl -X POST http://localhost:3000/api/charities \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Charity",
    "description": "...",
    "category": "Education",
    "email": "contact@charity.org",
    "website": "https://charity.org",
    "country": "USA",
    "isVerified": true
  }'
```

## Managing Payouts

### View Pending Payouts

Navigate to `/admin/charity-payouts` to see:
- All payouts (pending, processing, completed, failed)
- Statistics dashboard
- Payout details and actions

### Process Payouts Manually

1. Go to `/admin/charity-payouts`
2. Find a pending payout
3. Click "Mark as Completed" or "Mark as Failed"

### Automated Payouts

Set up a cron job to automatically create payouts for eligible charities:

**Vercel Setup:**
1. Go to Project Settings > Cron Jobs
2. Add cron job:
   - Schedule: `0 0 * * 1` (Every Monday)
   - URL: `/api/cron/process-charity-payouts`
   - Method: GET

## Project Structure

```
chainfunditnew/
├── app/
│   ├── api/
│   │   └── charities/
│   │       ├── route.ts              # List/create charities
│   │       ├── [id]/
│   │       │   ├── route.ts          # Get/update/delete charity
│   │       │   └── donate/
│   │       │       └── route.ts      # Create/list donations
│   │       ├── categories/
│   │       │   └── route.ts          # Get categories
│   │       └── payouts/
│   │           ├── route.ts          # List/create payouts
│   │           └── [id]/
│   │               └── route.ts      # Get/update payout
│   ├── charities/
│   │   ├── page.tsx                  # Charity listing page
│   │   └── [slug]/
│   │       └── page.tsx              # Individual charity page
│   └── admin/
│       └── charity-payouts/
│           └── page.tsx              # Payout management
├── lib/
│   ├── schema/
│   │   └── charities.ts              # Database schema
│   ├── scrapers/
│   │   └── charity-scraper.ts        # Web scraper
│   └── payments/
│       └── charity-payouts.ts        # Payout service
├── hooks/
│   └── use-charities.ts              # React hooks
├── scripts/
│   ├── seed-charities.ts             # Seed script
│   └── scrape-charities.ts           # Scraper runner
└── docs/
    ├── CHARITY_API_SETUP.md          # Full documentation
    └── CHARITY_QUICKSTART.md         # This file
```

## Common Tasks

### Add a New Charity

```typescript
const charity = {
  name: "New Charity",
  slug: "new-charity",
  description: "Description here",
  category: "Health",
  email: "info@newcharity.org",
  website: "https://newcharity.org",
  country: "United States",
  isVerified: true,
  // Banking info for payouts
  bankName: "Chase Bank",
  accountNumber: "1234567890",
  accountName: "New Charity Inc",
};

// POST to /api/charities
```

### Update Charity Banking Info

```typescript
// PATCH to /api/charities/[id]
{
  "bankName": "Wells Fargo",
  "accountNumber": "0987654321",
  "accountName": "Charity Account",
  "bankCode": "WFBIUS6S"
}
```

### Create a Manual Payout

```typescript
// POST to /api/charities/payouts
{
  "charityId": "uuid-here",
  "amount": 1000,
  "currency": "USD",
  "donationIds": ["donation-id-1", "donation-id-2"]
}
```

## Next Steps

1. **Integrate Payment Gateway:** Connect Stripe or Paystack for real donations
2. **Customize UI:** Modify the charity pages to match your brand
3. **Add Authentication:** Protect admin routes with proper auth
4. **Set Up Cron Jobs:** Automate payout processing
5. **Configure Email:** Send donation receipts and notifications

## Troubleshooting

### Database Connection Issues
```bash
# Check DATABASE_URL in .env.local
echo $DATABASE_URL

# Test connection
npm run test-db
```

### Migration Errors
```bash
# Reset and regenerate
npm run db:generate
npm run db:push
```

### Seeding Fails
Make sure the database tables exist before running seed:
```bash
npm run db:push
npm run seed-charities
```

### API Returns Empty Results
Check that charities are marked as `isActive: true` and `isVerified: true`:
```sql
SELECT * FROM charities WHERE is_active = true AND is_verified = true;
```

## Support & Documentation

- **Full Documentation:** See `docs/CHARITY_API_SETUP.md`
- **Schema Details:** Check `lib/schema/charities.ts`
- **API Examples:** Review `docs/CHARITY_API_SETUP.md` for all endpoints

## Key Features Summary

✅ **Web Scraping** - Import charities from directories  
✅ **Database Schema** - Complete charity/donation/payout tables  
✅ **RESTful API** - Full CRUD operations  
✅ **Donation Pages** - Beautiful UI for donations  
✅ **Payment Distribution** - Automated payout system  
✅ **Admin Interface** - Manage payouts and charities  
✅ **Hooks** - React hooks for easy integration  
✅ **Automation** - Cron job support  

Happy fundraising! 🎉

