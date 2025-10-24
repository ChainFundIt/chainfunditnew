# Admin Notifications Setup Guide

## 🔔 Overview

Admins can receive notifications when charities receive donations through **three channels**:
1. **📧 Email Notifications** - Instant emails via Resend
2. **📱 Push Notifications** - Browser notifications (Coming Soon)
3. **🔔 In-App Notifications** - Dashboard notifications

---

## 📋 What Gets Notified

### **Charity Donations**
When a charity receives a donation, admins get:
- ✅ Immediate email notification
- ✅ In-app notification badge
- ✅ Donation details (amount, charity, donor)
- ✅ Link to admin dashboard

### **Large Donations**
Special alerts for donations above threshold:
- ✅ Priority email with "Large Donation Alert" badge
- ✅ Customizable threshold (default: $1000 USD)
- ✅ Highlighted in email template

### **Campaign Donations**
Your existing campaign system:
- ✅ Similar notifications for campaign donations
- ✅ Can be toggled separately from charity donations

### **Payout Requests**
When charities request payouts:
- ✅ Admin approval notifications
- ✅ Links to payout dashboard

---

## 🚀 Setup Instructions

### Step 1: Configure Resend

Add to your `.env.local`:

```bash
# Resend Email Service
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=notifications@yourdomain.com
ADMIN_EMAIL=tolu@chainfundit.org
```

**Get Resend API Key:**
1. Go to [resend.com](https://resend.com)
2. Create account/login
3. Generate API key
4. Add your verified domain
5. Copy API key to env vars

### Step 2: Run Database Migration

```bash
npm run db:push
```

This creates the `admin_settings` table with fields:
- Email notification preferences
- Notification email override
- Donation alert toggles
- Large donation threshold
- Summary report settings

### Step 3: Configure Admin Settings

1. **Visit Admin Settings:**
   ```
   https://localhost:3002/admin/settings/notifications
   ```

2. **Configure Preferences:**
   - ✅ Enable/disable email notifications
   - ✅ Set notification email (or use default)
   - ✅ Toggle charity donation alerts
   - ✅ Toggle campaign donation alerts
   - ✅ Set large donation threshold
   - ✅ Enable daily/weekly summaries

3. **Save Settings**

---

## 📧 Email Notification Templates

### **Standard Donation Email**

```
Subject: 💰 New Charity Donation: $50 to Save the Children

┌─────────────────────────────────┐
│   💰 New Charity Donation       │
└─────────────────────────────────┘

$50.00

Charity: Save the Children
Donor: John Doe
Email: john@example.com
Amount: $50.00 USD
Donation ID: abc123...

💬 Donor Message:
"Keep up the great work!"

[View in Admin Dashboard →]
```

### **Large Donation Email**

```
Subject: 🎉 Large Donation Alert: $5,000 to UNICEF

┌─────────────────────────────────┐
│  🎉 Large Donation Received!    │
│   ⭐ Large Donation Alert ⭐    │
└─────────────────────────────────┘

$5,000.00

Charity: UNICEF
Donor: Anonymous
Email: Hidden
Amount: $5,000.00 USD
Donation ID: xyz789...

[View in Admin Dashboard →]
```

---

## 🔔 Notification Flow

```
User Donates to Charity
    ↓
Payment Gateway Processes
    ↓
Webhook Received
    ↓
Database Updated
    ↓
┌─────────────────────────────────────┐
│  Notification System Triggered      │
└─────────────────────────────────────┘
    ↓
    ├─→ Email Notification (if enabled)
    │   └─→ Sent via Resend
    │
    ├─→ In-App Notification
    │   └─→ Stored in notifications table
    │
    └─→ Push Notification (coming soon)
        └─→ Browser notification
```

---

## 🎯 Notification Settings

### **Available Options:**

| Setting | Description | Default |
|---------|-------------|---------|
| Email Notifications | Master toggle for emails | ✅ Enabled |
| Notification Email | Custom email address | Admin default |
| Charity Donations | Alert on charity donations | ✅ Enabled |
| Campaign Donations | Alert on campaign donations | ✅ Enabled |
| Large Donations | Special alerts for large amounts | ✅ Enabled |
| Large Threshold | Minimum for "large" alert | $1,000 |
| Payout Requests | Alert when payouts need approval | ✅ Enabled |
| Daily Summary | Daily digest email | ❌ Disabled |
| Weekly Summary | Weekly digest email | ✅ Enabled |
| Summary Time | When to send summaries | 09:00 |

---

## 💻 API Endpoints

### **Get Settings**
```bash
GET /api/admin/settings/notifications
```

**Response:**
```json
{
  "settings": {
    "emailNotificationsEnabled": true,
    "notificationEmail": "admin@example.com",
    "notifyOnCharityDonation": true,
    "notifyOnLargeDonation": true,
    "largeDonationThreshold": "1000",
    ...
  }
}
```

### **Update Settings**
```bash
PATCH /api/admin/settings/notifications
Content-Type: application/json

{
  "emailNotificationsEnabled": true,
  "notifyOnCharityDonation": true,
  "largeDonationThreshold": "5000"
}
```

---

## 🧪 Testing Notifications

### **Test Email Notification:**

1. **Make a test donation:**
   - Go to virtual giving mall
   - Select a charity
   - Make a donation with test card

2. **Trigger webhook manually:**
   ```bash
   stripe trigger payment_intent.succeeded
   ```

3. **Check your email:**
   - Email should arrive within seconds
   - Verify content and links

### **Test Large Donation Alert:**

1. **Lower threshold temporarily:**
   - Set threshold to $10 in admin settings

2. **Make donation above threshold:**
   - Donate $25
   - Should receive "Large Donation Alert" email

3. **Reset threshold** to normal ($1000)

---

## 📊 In-App Notifications

### **View Notifications:**

Admins see notifications in:
- **Dashboard header** - Notification bell icon
- **Notifications page** - Full list
- **Badge count** - Unread count

### **Notification Data:**

Stored in `notifications` table:
```sql
SELECT 
  type,
  title,
  message,
  is_read,
  created_at
FROM notifications
WHERE user_id = 'admin-user-id'
ORDER BY created_at DESC;
```

---

## 🔧 Advanced Configuration

### **Custom Email Templates:**

Edit `/lib/notifications/charity-donation-alerts.ts` to customize:
- Email styling
- Content layout
- Subject lines
- Call-to-action buttons

### **Add More Notification Types:**

```typescript
// Add new notification types
export async function notifyAdminOfPayoutRequest(payoutData) {
  // Similar structure to charity donation
  // Send email, create in-app notification
}
```

### **Multi-Admin Support:**

The system supports multiple admins:
- Each admin has own settings
- Each admin can set different thresholds
- Each admin can use different email addresses

---

## 📱 Push Notifications (Coming Soon)

### **Planned Features:**

- Browser push notifications
- Mobile app notifications (if built)
- Real-time alerts
- Notification sounds
- Custom vibration patterns

### **To Enable Later:**

1. Install web-push package
2. Generate VAPID keys
3. Subscribe admins to push service
4. Store subscription in `admin_settings.push_subscription`
5. Send notifications via Web Push API

---

## 🛠️ Troubleshooting

### **No Emails Received**

**Check:**
1. `RESEND_API_KEY` is set correctly
2. `RESEND_FROM_EMAIL` is from verified domain
3. Admin has email notifications enabled
4. Check spam folder
5. Verify Resend dashboard for delivery status

### **Wrong Email Address**

**Solution:**
1. Go to `/admin/settings/notifications`
2. Update "Notification Email" field
3. Save settings

### **Too Many Emails**

**Solution:**
1. Disable instant notifications
2. Enable only weekly summary
3. Increase large donation threshold
4. Disable campaign donation alerts

### **Notifications Not Triggering**

**Check:**
1. Webhook is configured and receiving events
2. Webhook handler is processing successfully
3. Admin settings exist in database
4. Email notifications are enabled

---

## 📚 File Structure

```
lib/
├── schema/
│   └── admin-settings.ts          # Admin settings schema
├── notifications/
│   └── charity-donation-alerts.ts # Notification service
│
app/api/
├── admin/settings/notifications/  # Settings API
│   └── route.ts
└── webhooks/
    ├── stripe/                    # Stripe webhook (integrated)
    └── paystack/                  # Paystack webhook (integrated)

app/admin/
└── settings/notifications/        # Admin UI
    └── page.tsx
```

---

## ✅ Current Implementation

What's working now:

✅ **Database schema** created  
✅ **Email templates** designed  
✅ **Notification service** implemented  
✅ **Webhook integration** complete  
✅ **Admin settings API** ready  
✅ **Admin settings UI** built  
✅ **Multi-admin support** included  
✅ **Large donation alerts** configured  
✅ **In-app notifications** supported  

---

## 🚀 Quick Start

### **1. Add Environment Variables:**
```bash
RESEND_API_KEY=re_your_key_here
RESEND_FROM_EMAIL=notifications@yourdomain.com
ADMIN_EMAIL=tolu@chainfundit.org
```

### **2. Run Migration:**
```bash
npm run db:push
```

### **3. Configure Settings:**
Visit: `https://localhost:3002/admin/settings/notifications`

### **4. Test:**
Make a test donation and check your email!

---

## 💡 Pro Tips

1. **Use a dedicated email** for notifications (not your personal email)
2. **Set realistic thresholds** for large donations based on your average
3. **Enable weekly summaries** instead of daily to reduce email volume
4. **Create email filters** to organize notifications in your inbox
5. **Test regularly** to ensure notifications are working

---

## 📊 Notification Analytics (Future)

Track notification effectiveness:
- Open rates
- Click-through rates  
- Response times
- Admin engagement

---

## 🎉 You're All Set!

Admins will now be notified when:
- ✅ Charities receive donations
- ✅ Large donations are made
- ✅ Payouts need processing
- ✅ Campaign goals are reached

**Email notifications are production-ready!** 📧

