# Charity API & Donation System Setup

This document explains the complete Charity API and donation management system that allows you to scrape charity directories, manage NGO data, accept donations, and distribute proceeds to charities.

## Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Web Scraping](#web-scraping)
4. [API Endpoints](#api-endpoints)
5. [Donations Page](#donations-page)
6. [Payment Distribution](#payment-distribution)
7. [Admin Interface](#admin-interface)
8. [Automation](#automation)
9. [Configuration](#configuration)

## Overview

The Charity API system provides:

- **Web scraping** tools to import charity data from directories
- **Database schema** to store charity/NGO information
- **RESTful API** for managing charities and donations
- **Donation pages** for accepting contributions to verified NGOs
- **Payment distribution** system to send proceeds to charities
- **Admin interface** for managing payouts

## Database Schema

### Tables Created

#### 1. `charities`
Stores charity/NGO information:
- Basic info (name, slug, description, mission)
- Contact details (email, phone, website, address)
- Registration details (registration number, tax ID)
- Banking information (for payouts)
- Financial tracking (total received, paid out, pending)
- Verification status
- Scraping metadata

#### 2. `charity_donations`
Tracks donations to charities:
- Donor information
- Payment details
- Donation amount and currency
- Payout status tracking
- Anonymous donation support

#### 3. `charity_payouts`
Manages payouts to charities:
- Batch payout tracking
- Banking details used
- Related donations
- Status and error tracking

### Running Migrations

```bash
# Generate migration
npm run db:generate

# Run migration
npm run db:migrate

# Or push directly to database
npm run db:push
```

## Web Scraping

### Scraper Architecture

The scraping system uses a base class `CharityDirectoryScraper` that can be extended for different charity directories.

#### Using the Generic Scraper

```typescript
import { GenericCharityScraper } from '@/lib/scrapers/charity-scraper';

const scraper = new GenericCharityScraper({
  name: 'My Charity Directory',
  baseUrl: 'https://example-charity-directory.org',
  urls: [
    'https://example-charity-directory.org/charities/page/1',
    'https://example-charity-directory.org/charities/page/2',
  ],
  selectors: {
    container: '.charity-item',
    name: '.charity-name',
    description: '.charity-description',
    website: 'a.website',
    category: '.category',
  }
});

await scraper.scrape();
await scraper.saveToDatabase(charities);
```

#### Creating Custom Scrapers

```typescript
export class CustomCharityScraper extends CharityDirectoryScraper {
  name = 'My Directory';
  baseUrl = 'https://example.org';

  async getUrlsToScrape(): Promise<string[]> {
    // Return array of URLs to scrape
    return ['https://example.org/charities'];
  }

  parseCharityData($: cheerio.CheerioAPI, url: string): ScrapedCharityData[] {
    const charities = [];
    // Parse HTML and extract charity data
    return charities;
  }
}
```

### Running Scrapers

```bash
# Run the scraper script
npm run scrape-charities
```

### Manual Seeding

To quickly populate the database with sample charities:

```bash
npm run seed-charities
```

This seeds 10 well-known charities (Save the Children, WWF, Red Cross, etc.)

## API Endpoints

### Charities

#### GET `/api/charities`
Get all charities with filtering and pagination

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Search by name or description
- `category` - Filter by category
- `country` - Filter by country
- `verified` - Filter verified charities (true/false)
- `active` - Filter active charities (true/false)
- `sortBy` - Sort field (name, created, donations)
- `sortOrder` - Sort direction (asc, desc)

**Response:**
```json
{
  "charities": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalCount": 100,
    "totalPages": 5,
    "hasMore": true
  }
}
```

#### POST `/api/charities`
Create a new charity

**Body:**
```json
{
  "name": "Example Charity",
  "description": "...",
  "category": "Education",
  "email": "contact@example.org",
  "country": "USA",
  ...
}
```

#### GET `/api/charities/[id]`
Get a specific charity by ID or slug

**Response:**
```json
{
  "charity": {...},
  "stats": {
    "totalDonations": 150,
    "totalAmount": 50000,
    "successfulDonations": 145
  }
}
```

#### PATCH `/api/charities/[id]`
Update a charity

#### DELETE `/api/charities/[id]`
Delete a charity

### Donations

#### POST `/api/charities/[id]/donate`
Create a donation to a charity

**Body:**
```json
{
  "amount": 100,
  "currency": "USD",
  "donorName": "John Doe",
  "donorEmail": "john@example.com",
  "message": "Keep up the great work!",
  "isAnonymous": false,
  "paymentMethod": "stripe"
}
```

#### GET `/api/charities/[id]/donate`
Get donations for a charity

### Categories

#### GET `/api/charities/categories`
Get all charity categories with counts

**Response:**
```json
{
  "categories": [
    { "category": "Education", "count": 25 },
    { "category": "Health", "count": 18 },
    ...
  ]
}
```

### Payouts

#### GET `/api/charities/payouts`
Get all charity payouts (admin)

**Query Parameters:**
- `page`, `limit` - Pagination
- `status` - Filter by status (pending, processing, completed, failed)
- `charityId` - Filter by charity

#### POST `/api/charities/payouts`
Create a payout for a charity

**Body:**
```json
{
  "charityId": "uuid",
  "amount": 1000,
  "currency": "USD",
  "donationIds": ["id1", "id2", ...],
  "paymentMethod": "bank_transfer"
}
```

#### GET `/api/charities/payouts/[id]`
Get a specific payout

#### PATCH `/api/charities/payouts/[id]`
Update payout status

**Body:**
```json
{
  "status": "completed",
  "failureReason": "..." // optional, for failed status
}
```

## Donations Page

### Public Charity Listing

Navigate to `/charities` to see all verified charities.

Features:
- Search by name/description
- Filter by category
- Pagination
- Charity cards with key info
- Direct donation links

### Individual Charity Page

Navigate to `/charities/[slug]` for a specific charity.

Features:
- Detailed charity information
- Mission and focus areas
- Contact information
- Donation form with:
  - Preset amounts
  - Custom amount option
  - Donor information
  - Anonymous donation option
  - Payment method selection
  - Secure payment indication

## Payment Distribution

### Payout Service

The payout system (`lib/payments/charity-payouts.ts`) provides:

#### Calculate Pending Payouts

```typescript
import { calculatePendingPayout } from '@/lib/payments/charity-payouts';

const pendingAmount = await calculatePendingPayout(charityId);
```

#### Create Charity Payout

```typescript
import { createCharityPayout } from '@/lib/payments/charity-payouts';

const result = await createCharityPayout({
  charityId: 'uuid',
  minAmount: 100, // minimum $100 to trigger payout
});

if (result.success) {
  console.log(`Payout created: ${result.payoutId}`);
  console.log(`Amount: ${result.amount}`);
  console.log(`Donations: ${result.donationCount}`);
}
```

#### Process Payout

```typescript
import { processCharityPayout } from '@/lib/payments/charity-payouts';

// Mark as completed
await processCharityPayout(payoutId, 'completed');

// Mark as failed
await processCharityPayout(payoutId, 'failed', 'Bank rejected transfer');
```

#### Get Eligible Charities

```typescript
import { getCharitiesEligibleForPayout } from '@/lib/payments/charity-payouts';

const eligible = await getCharitiesEligibleForPayout(100); // min $100

eligible.forEach(({ charity, pendingAmount, donationCount }) => {
  console.log(`${charity.name}: $${pendingAmount} (${donationCount} donations)`);
});
```

#### Batch Processing

```typescript
import { processBatchPayouts } from '@/lib/payments/charity-payouts';

const results = await processBatchPayouts(100); // min $100

results.forEach(result => {
  console.log(`${result.charityName}: ${result.success ? 'Success' : 'Failed'}`);
});
```

## Admin Interface

### Charity Payouts Dashboard

Navigate to `/admin/charity-payouts` to manage payouts.

Features:
- Overview statistics
- Filter by status
- View payout details
- Mark payouts as completed/failed
- Bank account information display
- Failure reason tracking

### Required Setup

Ensure admin users have appropriate permissions to access `/admin/*` routes.

## Automation

### Automated Payout Processing

A cron job endpoint processes payouts automatically:

**Endpoint:** `GET /api/cron/process-charity-payouts`

#### Setup with Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings > Cron Jobs
3. Add a new cron job:
   - **Schedule:** `0 0 * * 1` (Every Monday at midnight)
   - **URL:** `/api/cron/process-charity-payouts`
   - **Method:** GET

#### Manual Trigger

```bash
curl https://yourdomain.com/api/cron/process-charity-payouts \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

#### Configuration

The cron job will:
1. Find all charities with pending donations ≥ minimum amount
2. Create payout records
3. Update donation statuses to "processing"
4. Return a summary of processed payouts

## Configuration

### Environment Variables

Add these to your `.env.local`:

```bash
# Charity Payout Settings
MIN_CHARITY_PAYOUT_AMOUNT=100  # Minimum amount to trigger payout (USD)
CRON_SECRET=your-secret-key    # Secret for protecting cron endpoints

# Payment Gateway (if using Stripe/Paystack for charity donations)
STRIPE_SECRET_KEY=sk_...
PAYSTACK_SECRET_KEY=sk_...
```

### Charity Verification

Before a charity can receive payouts:

1. Set `isVerified: true` in the database
2. Ensure banking information is complete:
   - `bankName`
   - `accountNumber`
   - `accountName`
   - `bankCode` (for some regions)

### Payout Flow

1. **Donation received** → Payment processed → Donation marked as `completed`
2. **Payout eligibility** → Pending donations ≥ minimum amount
3. **Payout created** → Donations marked as `processing`
4. **Admin review** → Verify banking details
5. **Transfer executed** → Mark payout as `completed`
6. **Completion** → Donations marked as `paid_out`, charity totals updated

## React Hooks

### useCharities

```typescript
import { useCharities } from '@/hooks/use-charities';

function Component() {
  const { charities, pagination, loading, error, refetch } = useCharities({
    search: 'education',
    category: 'Education',
    verified: true,
    page: 1,
    limit: 12,
  });

  // ...
}
```

### useCharity

```typescript
import { useCharity } from '@/hooks/use-charities';

function Component() {
  const { charity, stats, loading, error, refetch } = useCharity('charity-slug');

  // ...
}
```

### useCharityCategories

```typescript
import { useCharityCategories } from '@/hooks/use-charities';

function Component() {
  const { categories, loading, error } = useCharityCategories();

  // ...
}
```

## Security Considerations

1. **Admin Routes:** Protect `/admin/*` routes with authentication
2. **Payout Verification:** Manually verify payouts before marking as completed
3. **Banking Information:** Encrypt sensitive banking data
4. **Cron Protection:** Use `CRON_SECRET` to protect automated endpoints
5. **Rate Limiting:** Implement rate limiting on donation endpoints
6. **Fraud Detection:** Monitor for suspicious donation patterns

## Testing

### Test Charity Creation

```typescript
// Create test charity
const response = await fetch('/api/charities', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test Charity',
    description: 'Test description',
    category: 'Education',
    email: 'test@charity.org',
    isVerified: true,
    bankName: 'Test Bank',
    accountNumber: '1234567890',
    accountName: 'Test Charity Account',
  }),
});
```

### Test Donation

```typescript
// Create test donation
const response = await fetch(`/api/charities/${charityId}/donate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 100,
    currency: 'USD',
    donorEmail: 'donor@example.com',
    donorName: 'John Doe',
    paymentMethod: 'stripe',
  }),
});
```

## Support

For issues or questions:
1. Check the API response errors for detailed messages
2. Review server logs for backend errors
3. Ensure all environment variables are set correctly
4. Verify database migrations have been run

## Future Enhancements

- [ ] Stripe/Paystack integration for actual payment processing
- [ ] Email notifications for donation receipts
- [ ] Automated bank transfer integration
- [ ] Charity dashboard for self-service payout requests
- [ ] Donation analytics and reporting
- [ ] Tax receipt generation
- [ ] Recurring donation support
- [ ] Multi-currency support

