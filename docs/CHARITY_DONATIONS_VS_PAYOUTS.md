# Charity Donations vs Payouts

## 📊 Understanding the Difference

### **Charity Donations** (Individual Transactions)
**Location:** `/admin/charity-donations`

These are **individual donations** from donors to charities:
- Each donation is a separate transaction
- Created when a donor completes payment
- Tracked individually in `charity_donations` table

**Example:**
```
Donation #1: $25 to Save the Children
Donation #2: ₦5,000 to FATE Foundation
Donation #3: £40 to UNICEF
```

### **Charity Payouts** (Batched Transfers)
**Location:** `/admin/charity-payouts`

These are **batched transfers** from you to the charities:
- Groups multiple donations together
- Created when you process payouts
- One payout can include many donations
- Tracked in `charity_payouts` table

**Example:**
```
Payout #1 to Save the Children:
  - Includes donations: #1, #5, #12
  - Total: $250
  - Status: Pending approval

Payout #2 to UNICEF:
  - Includes donations: #3, #7
  - Total: £120
  - Status: Completed
```

---

## 🔄 The Flow

```
1. DONATIONS RECEIVED
   User donates $50 → Donation created
   User donates $30 → Donation created
   User donates $70 → Donation created
   
   Status: All marked as "completed"
   Payout Status: All marked as "pending"

2. DONATIONS ACCUMULATE
   Charity has 3 donations totaling $150
   All are "pending payout"

3. PAYOUT CREATED
   Admin creates payout batch:
   - Includes all 3 donations
   - Total: $150
   - Status: "pending"
   
4. PAYOUT PROCESSED
   Admin approves and transfers funds
   - Payout: "completed"
   - Donations: "completed payout"
   - Charity receives $150
```

---

## 🎯 Where to Find Your Test Donations

### **View Individual Donations:**
```
https://localhost:3002/admin/charity-donations
```

**You'll see:**
- ✅ All 5 of your test donations
- ✅ Donor information
- ✅ Payment status (completed)
- ✅ Payout status (pending)
- ✅ Amounts and currencies

### **View Payouts (Empty for Now):**
```
https://localhost:3002/admin/charity-payouts
```

**You won't see anything here yet because:**
- No payout batches have been created
- Donations are still in "pending payout" status
- You need to create payouts from the donations

---

## 💰 How to Create Payouts

### **Option 1: Via API**

```bash
curl -X POST https://localhost:3002/api/charities/payouts \
  -H "Content-Type: application/json" \
  -d '{
    "charityId": "charity-uuid-here",
    "amount": 150,
    "currency": "USD",
    "donationIds": ["donation-1", "donation-2", "donation-3"]
  }'
```

### **Option 2: Programmatic (Recommended)**

Use the payout service:

```typescript
import { createCharityPayout } from '@/lib/payments/charity-payouts';

// Create payout for a charity
const result = await createCharityPayout({
  charityId: 'charity-uuid',
  minAmount: 50, // Minimum $50 to trigger payout
});

if (result.success) {
  console.log(`Payout created: ${result.payoutId}`);
  console.log(`Amount: $${result.amount}`);
  console.log(`Donations: ${result.donationCount}`);
}
```

### **Option 3: Batch All Eligible Charities**

```typescript
import { processBatchPayouts } from '@/lib/payments/charity-payouts';

// Process all charities with enough donations
const results = await processBatchPayouts(100); // min $100

results.forEach(result => {
  console.log(`${result.charityName}: ${result.success ? 'Success' : 'Failed'}`);
});
```

---

## 📋 Quick Reference

| Page | URL | Shows | Purpose |
|------|-----|-------|---------|
| **Charity Donations** | `/admin/charity-donations` | Individual donations | View all donations |
| **Charity Payouts** | `/admin/charity-payouts` | Payout batches | Manage transfers to charities |

---

## 🎯 Your Current Status

✅ **5 Test Donations Created**
- All marked as "completed"
- Payout status: "pending"
- Total: ₦80,000 + £40 + $25

❌ **No Payouts Yet**
- Need to create payout batches
- Then charities can receive funds

---

## 🚀 Next Step

**View your donations:**
```
Visit: https://localhost:3002/admin/charity-donations
```

You'll see all 5 of your test donations! 🎉

