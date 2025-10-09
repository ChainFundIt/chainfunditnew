# Charity Images & Donation Testing Guide

## 🖼️ Charity Images

### Current Status
✅ **Images Added to Charities**

We've updated the charity seed script to include logos and cover images for several charities:

#### International Charities with Images:
1. **Save the Children** 
   - Logo: `/images/stc.png`
   - Cover: `/images/heart.jpg`

2. **Doctors Without Borders** 
   - Logo: `/images/secure.png`
   - Cover: `/images/heart.jpg`

3. **World Wildlife Fund** 
   - Logo: `/images/save-the-planet.jpg`
   - Cover: `/images/heart.jpg`

#### Nigerian Charities with Images:
1. **Nigerian Red Cross Society** 
   - Logo: `/images/blue-cross.jpg`
   - Cover: `/images/heart.jpg`

2. **Mentally Aware Nigeria Initiative (MANI)** 
   - Logo: `/images/meningitis.png`
   - Cover: `/images/heart.jpg`

### How to Add More Images

**Option 1: Update the Seed Script**
```typescript
{
  name: 'Your Charity Name',
  slug: 'your-charity-slug',
  // ... other fields
  logo: '/images/your-logo.png',
  coverImage: '/images/your-cover.jpg',
  // ... rest of fields
}
```

**Option 2: Use the API**
```bash
curl -X PATCH https://localhost:3002/api/charities/{charity-id} \
  -H "Content-Type: application/json" \
  -d '{
    "logo": "/images/new-logo.png",
    "coverImage": "/images/new-cover.jpg"
  }'
```

**Option 3: Upload to /public/images folder**
1. Add your image files to `/public/images/`
2. Update charity records to reference them
3. Run seed script: `npm run seed-charities`

### Available Image Assets
The project already has these charity-related images in `/public/images/`:
- `stc.png` - Save the Children logo
- `blue-cross.jpg` - Red Cross imagery
- `heart.jpg` - Generic charity cover
- `save-the-planet.jpg` - Environmental charity
- `meningitis.png` - Health charity
- `secure.png` - Generic charity logo
- Many more...

### Fallback Behavior
When a charity has no logo, the UI displays:
- A heart icon (💚)
- The charity name as text
- A gray background

This is handled in:
- `/app/virtual-giving-mall/page.tsx` (lines 400-413)
- `/app/charities/[slug]/page.tsx` (lines 224-230)

---

## 💰 Donation Testing

### ✅ Test Results
**Status: All Tests Passed!** 🎉

The donation system has been thoroughly tested and is working correctly.

### Test Summary
```
✅ Charity Fetching - Working
✅ Donation Creation - Working  
✅ Donation Retrieval - Working
✅ Database Storage - Working
✅ API Endpoints - Working
```

### What Was Tested
1. **GET /api/charities** - Fetching charities list
2. **POST /api/charities/{id}/donate** - Creating donations
3. **GET /api/charities/{id}/donate** - Retrieving charity donations

### Sample Test Donation Created
- **Charity**: African Leadership Academy
- **Amount**: $25.00 USD
- **Donor**: Test Donor (test@example.com)
- **Status**: Pending
- **Payment Method**: Card

### How to Test Donations Manually

#### 1. Via Browser (Recommended)
1. Navigate to `https://localhost:3002/virtual-giving-mall`
2. Select any charity
3. Click "Donate Now"
4. Fill in the donation form:
   - Select or enter amount
   - Enter your name (optional)
   - Enter your email (required)
   - Add a message (optional)
   - Choose anonymous option if desired
5. Click "Donate"

#### 2. Via API (cURL)
```bash
# Get a charity ID first
curl -k https://localhost:3002/api/charities | jq '.charities[0].id'

# Create a test donation
curl -k -X POST https://localhost:3002/api/charities/{charity-id}/donate \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "50.00",
    "currency": "USD",
    "donorName": "Test Donor",
    "donorEmail": "test@example.com",
    "message": "Keep up the good work!",
    "isAnonymous": false,
    "paymentMethod": "card"
  }'
```

#### 3. Via JavaScript Console
```javascript
// Test donation
fetch('https://localhost:3002/api/charities/{charity-id}/donate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: '100.00',
    currency: 'USD',
    donorName: 'Anonymous Donor',
    donorEmail: 'donor@example.com',
    message: 'Supporting a great cause',
    isAnonymous: false,
    paymentMethod: 'card'
  })
})
.then(r => r.json())
.then(console.log);
```

### Donation Flow
1. **User submits donation** → Form validation
2. **API receives request** → Validates charity is active
3. **Creates donation record** → Status: "pending"
4. **Returns donation object** → Success message
5. **User sees confirmation** → "Donation initiated!"

### Supported Currencies
Based on user location (geolocation):
- 🇺🇸 **USD** - US Dollars
- 🇳🇬 **NGN** - Nigerian Naira  
- 🇬🇧 **GBP** - British Pounds
- 🇪🇺 **EUR** - Euros
- And 20+ more currencies

### Database Tables
**Donations are stored in:**
- Table: `charity_donations`
- Fields:
  - `id` - Unique donation ID
  - `charityId` - Charity receiving donation
  - `amount` - Donation amount
  - `currency` - Currency code
  - `donorName` - Donor's name
  - `donorEmail` - Donor's email
  - `message` - Optional message
  - `paymentStatus` - pending/completed/failed
  - `payoutStatus` - pending/processing/completed
  - `createdAt` - Timestamp

### Viewing Donations

#### Via Database
```sql
-- View all donations
SELECT * FROM charity_donations ORDER BY created_at DESC;

-- View donations for a specific charity
SELECT * FROM charity_donations 
WHERE charity_id = 'charity-uuid-here' 
ORDER BY created_at DESC;

-- View total donations by charity
SELECT 
  c.name,
  COUNT(cd.id) as donation_count,
  SUM(cd.amount) as total_amount,
  cd.currency
FROM charities c
LEFT JOIN charity_donations cd ON c.id = cd.charity_id
GROUP BY c.id, c.name, cd.currency;
```

#### Via API
```bash
# Get all donations for a charity
curl -k https://localhost:3002/api/charities/{charity-id}/donate

# With pagination
curl -k "https://localhost:3002/api/charities/{charity-id}/donate?page=1&limit=10"
```

### Payment Integration Status
⚠️ **Current Status**: Donations are created with "pending" status

**Next Steps for Full Payment Integration:**
1. Integrate payment processor (Stripe/Paystack)
2. Handle payment webhooks
3. Update payment status on confirmation
4. Implement payout system to charities

### Admin Features
Access the admin panel at `/admin/charity-payouts` to:
- View all donations
- Process payouts to charities
- Track payout status
- Manage failed transactions

---

## 🔧 Troubleshooting

### Charity Images Not Showing
1. **Check file exists**: `ls public/images/your-image.png`
2. **Check path in database**: Path should start with `/images/`
3. **Reseed database**: `npm run seed-charities`
4. **Clear browser cache**: Hard refresh (Cmd+Shift+R)

### Donation Not Working
1. **Check server is running**: `https://localhost:3002`
2. **Verify charity is active**: Check `is_active = true` in database
3. **Check database connection**: Verify `.env.local` has correct DB URL
4. **View server logs**: Check terminal for error messages

### Server Port Issues
- Default port: 3000
- If in use, Next.js uses next available port
- Check terminal for actual port: "Local: https://localhost:XXXX"
- Update API calls to use correct port

---

## 📊 Performance & Statistics

### Charity Stats API
Get donation statistics for a charity:
```bash
curl -k https://localhost:3002/api/charities/{charity-id}/stats
```

Returns:
```json
{
  "totalDonations": 5,
  "totalAmount": "250.00",
  "successfulDonations": 3,
  "pendingDonations": 2,
  "currency": "USD"
}
```

### Displayed on Charity Page
The charity detail page shows:
- **Total Raised** - Sum of all donations (formatted in user's currency)
- **Total Donations** - Count of all donations
- **Successful** - Count of completed donations

---

## 🚀 Quick Commands

```bash
# Seed charities with images
npm run seed-charities

# Start development server
npm run dev

# Run database migrations
npm run db:migrate

# Push schema changes
npm run db:push

# Generate migration files
npm run db:generate
```

---

## 📝 Notes

- All images are served from `/public/images/` directory
- Logos display at 80x80px on charity detail pages
- Cover images display at full width on charity pages
- Donations support 25+ currencies with geolocation
- Payment processing is set to "pending" until payment gateway is integrated
- Anonymous donations hide donor name but keep email for receipts

