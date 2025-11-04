# Currency Validation Check

## Overview

This document describes the currency validation check script that verifies:
1. Admin location currency matching with payout currencies
2. Currency conversion implementation when money is in other currencies
3. Multi-currency campaign handling

## Script Location

`scripts/check-admin-currency-validation.ts`

## Usage

```bash
npx tsx scripts/check-admin-currency-validation.ts
```

**Note:** Requires `DATABASE_URL` environment variable to be set.

## What It Checks

### 1. Admin Currency Matching
- Retrieves all admin users
- Gets their geolocation/currency based on:
  - Stored `countryCode` in database
  - IP geolocation (fallback)
- Checks if admins can view payouts in their supported currencies
- Flags mismatches where an admin's currency doesn't match payout currency

### 2. Currency Conversion Verification
- Checks all pending/approved payouts
- Verifies that conversions to NGN are being applied
- Calculates conversion rates and converted amounts
- Flags payouts that should have conversions but don't

### 3. Multi-Currency Campaign Detection
- Identifies campaigns with donations in multiple currencies
- Calculates total amounts per currency
- Converts all amounts to NGN for comparison
- Flags campaigns that need conversion handling

### 4. API Route Currency Handling
- Checks if admin payout stats routes handle currency conversion
- Warns if stats are summing amounts from different currencies without conversion

## Issues Found

### Critical Issue: Admin Payout Stats Route

The `/api/admin/payouts/campaigns/stats` route (`app/api/admin/payouts/campaigns/stats/route.ts`) is **summing amounts from different currencies without conversion**.

**Problem:**
```typescript
// Current implementation - WRONG
const [totalAmount] = await db
  .select({
    total: sum(campaignPayouts.requestedAmount), // Summing USD + EUR + GBP without conversion!
  })
  .from(campaignPayouts);
```

**Impact:**
- Stats show incorrect totals when payouts are in different currencies
- Example: $100 USD + €100 EUR = $200 (incorrect - should convert to base currency first)

**Recommended Fix:**
1. Convert all amounts to a base currency (NGN) before summing
2. Or group by currency and return separate totals per currency
3. Display converted totals in admin dashboard

## Recommendations

### For Admin Payout Stats Route

Update `app/api/admin/payouts/campaigns/stats/route.ts` to:

```typescript
import { convertToNaira } from '@/lib/utils/currency-conversion';
import { getCurrencyCode } from '@/lib/utils/currency';

// Instead of summing directly, convert each amount first
const payouts = await db
  .select({
    requestedAmount: campaignPayouts.requestedAmount,
    currency: campaignPayouts.currency,
    netAmount: campaignPayouts.netAmount,
    status: campaignPayouts.status,
  })
  .from(campaignPayouts);

// Convert all amounts to NGN before summing
const totalAmountInNGN = payouts.reduce((sum, payout) => {
  const currency = getCurrencyCode(payout.currency || 'USD');
  const amount = parseFloat(payout.requestedAmount || '0');
  return sum + convertToNaira(amount, currency);
}, 0);

const pendingAmountInNGN = payouts
  .filter(p => p.status === 'pending')
  .reduce((sum, payout) => {
    const currency = getCurrencyCode(payout.currency || 'USD');
    const amount = parseFloat(payout.requestedAmount || '0');
    return sum + convertToNaira(amount, currency);
  }, 0);

// Similar for other statuses...
```

### For Admin Dashboard Display

The admin payouts page (`app/admin/payouts/page.tsx`) already uses `useGeolocationCurrency()` to get the admin's currency, but it should:
1. Display amounts in admin's currency (with conversion if needed)
2. Show both original and converted amounts for clarity
3. Handle multi-currency scenarios properly

## Running the Check

The script will:
1. ✅ Pass if no issues are found
2. ⚠️  Exit with code 1 if issues are found (for CI/CD integration)

## Integration with CI/CD

You can integrate this check into your CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Check Currency Validation
  run: npx tsx scripts/check-admin-currency-validation.ts
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## Next Steps

1. Fix the admin payout stats route to convert currencies before summing
2. Update admin dashboard to show currency conversions properly
3. Add unit tests for currency conversion logic
4. Consider storing converted amounts in database for faster queries
5. Implement currency conversion caching to reduce API calls

