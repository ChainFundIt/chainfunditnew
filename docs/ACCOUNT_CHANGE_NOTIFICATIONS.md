# Account Change Request Notifications

## 🔔 Overview

When users request to change their verified bank account details, the system now sends comprehensive email notifications to both **admins** and **users**.

---

## 📧 Email Notifications

### **1. Admin Notification Email**

**Purpose:** Alert admins when a user requests to change their locked bank account

**Triggers When:**
- User has a verified and locked bank account
- User submits a change request with a valid reason (minimum 10 characters)
- The request is successfully saved to the database

**Email Contains:**
- 🔐 Security alert badge
- User's full details (name, email, phone, user ID)
- Current account details (account number, bank name, account name)
- Reason for the change request
- Request date and time
- Action items for admin verification
- Link to admin dashboard to review the request

**Example Subject:**
```
🔐 Account Change Request from John Doe
```

**Recipients:**
- All admins with `notifyOnAccountChangeRequest` enabled in their settings
- Admin notification email or default `ADMIN_EMAIL` from environment variables

---

### **2. User Confirmation Email**

**Purpose:** Confirm to the user that their request has been received

**Triggers When:**
- Immediately after the change request is submitted

**Email Contains:**
- ✅ Confirmation badge
- Request details (submission date, reason)
- Next steps explanation
- Contact information for support
- Link back to their payment settings

**Example Subject:**
```
✅ Account Change Request Received - ChainFundit
```

**Recipients:**
- The user who submitted the request (at their registered email)

---

## 🛠️ How It Works

### **Flow Diagram**

```
User Submits Account Change Request
    ↓
Frontend validates reason (min 10 chars)
    ↓
API: PUT /api/account/verify
    ↓
Database: Update account_change_requested = true
    ↓
┌─────────────────────────────────────┐
│  Notification System Triggered      │
└─────────────────────────────────────┘
    ↓
    ├─→ Email to Admin(s)
    │   └─→ Sent via Resend
    │   └─→ Only if notifyOnAccountChangeRequest = true
    │
    ├─→ Email to User
    │   └─→ Confirmation email
    │   └─→ Always sent
    │
    └─→ In-App Notification (for admins)
        └─→ Stored in notifications table
```

---

## 🗄️ Database Changes

### **New Column in `admin_settings` Table**

```sql
ALTER TABLE "admin_settings" 
ADD COLUMN "notify_on_account_change_request" boolean DEFAULT true NOT NULL;
```

**Field:** `notify_on_account_change_request`  
**Type:** Boolean  
**Default:** `true`  
**Description:** Controls whether admin receives email notifications for account change requests

---

## 🎯 Admin Settings

### **Toggle Location**

Navigate to: **Admin Dashboard → Settings → Notifications**

**New Toggle:**
- **Label:** Account Change Requests
- **Description:** Get notified when users request to change their bank account
- **Default:** Enabled
- **Requires:** Email Notifications must be enabled

### **Notification Preferences**

| Setting | Description | Default |
|---------|-------------|---------|
| Email Notifications | Master toggle for all emails | ✅ Enabled |
| Account Change Requests | Alerts when users request account changes | ✅ Enabled |
| Notification Email | Custom admin email (optional) | Uses ADMIN_EMAIL |

---

## 📝 Implementation Details

### **Files Modified/Created**

1. **lib/notifications/account-change-alerts.ts** (NEW)
   - `notifyAdminsOfAccountChangeRequest()` - Sends emails to admins
   - `sendAccountChangeConfirmationToUser()` - Sends confirmation to user
   - `createAdminNotificationForAccountChange()` - Creates in-app notification
   - `notifyAccountChangeRequest()` - Main orchestrator function

2. **lib/schema/admin-settings.ts** (MODIFIED)
   - Added `notifyOnAccountChangeRequest` field

3. **app/api/account/verify/route.ts** (MODIFIED)
   - Imported notification function
   - Calls `notifyAccountChangeRequest()` after successful DB update

4. **app/admin/settings/notifications/page.tsx** (MODIFIED)
   - Added toggle for account change request notifications
   - Updated AdminSettings interface

5. **lib/migrations/0006_add_account_change_notifications.sql** (NEW)
   - Migration to add new column to admin_settings table

---

## 🔧 Configuration

### **Environment Variables Required**

```bash
# Email Service (Resend)
RESEND_API_KEY=re_your_key_here
RESEND_FROM_EMAIL=notifications@chainfundit.com

# Admin Email (fallback if not set in settings)
ADMIN_EMAIL=tolu@chainfundit.org

# App URL (for links in emails)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## 🧪 Testing

### **Test the Feature**

**Step 1: Setup**
1. Ensure you have Resend API key configured
2. Run the database migration: `npm run db:push`
3. Configure admin notification settings

**Step 2: Create a Test Scenario**
1. Login as a user
2. Go to Settings → Payments
3. Verify a bank account (if not already verified)
4. Click "Request Account Change"
5. Enter a reason (minimum 10 characters)
6. Submit the request

**Step 3: Verify Notifications**
1. **Admin Email:** Check admin email inbox
   - Should receive "🔐 Account Change Request from [User Name]"
   - Email should contain user details and reason

2. **User Email:** Check user's email inbox
   - Should receive "✅ Account Change Request Received"
   - Email should confirm submission and explain next steps

3. **In-App Notification:** Check admin dashboard
   - Should see notification badge
   - Notification should appear in notifications list

**Step 4: Check Database**
```sql
SELECT 
  account_change_requested,
  account_change_reason
FROM users
WHERE email = 'test@example.com';
```

---

## 🔍 Email Templates

### **Admin Email Preview**

```
┌─────────────────────────────────┐
│   🔐 Account Change Request     │
│  ⚠️ Requires Admin Review       │
└─────────────────────────────────┘

User Details
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User Name: John Doe
Email: john@example.com
Phone: +234 123 456 7890
User ID: abc123...
Request Date: Jan 15, 2025 at 3:30 PM

Current Account Details
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Account Number: 0123456789
Bank Name: First Bank
Account Name: JOHN DOE

📝 Reason for Change Request:
"I changed my bank account and need to update 
my details to receive my commission payouts."

⚠️ Action Required:
• Review the user's request and reason
• Verify the user's identity if needed
• Contact the user for additional verification
• Approve or deny the request from dashboard
• If approved, unlock their account and notify them

[Review Request in Dashboard →]

Security Tip: Always verify the user's identity 
before approving account changes.
```

### **User Email Preview**

```
┌─────────────────────────────────┐
│      ✅ Request Received        │
└─────────────────────────────────┘

Hello John Doe,

We've received your request to change your bank 
account details. Our admin team will review your 
request and get back to you shortly.

📋 Request Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Submitted: Jan 15, 2025 at 3:30 PM
Reason: I changed my bank account...

What happens next?
• Our admin team will review your request
• They may contact you for additional verification
• Once approved, your account will be unlocked
• You'll receive an email when request is processed

Need to update or cancel your request?
Contact our support team at:
📧 campaigns@chainfundit.com
📞 +44 203 838 0360

[View Your Settings]
```

---

## 🚨 Security Considerations

1. **Identity Verification:** Always verify user identity before approving changes
2. **Phone Verification:** Call the user at their registered phone number
3. **Document Verification:** Request additional ID documents if suspicious
4. **Fraud Detection:** Watch for patterns of suspicious requests
5. **Audit Trail:** All requests are logged with timestamps and reasons

---

## 📊 Admin Actions

### **Reviewing Requests**

**Future Enhancement:** Create dedicated admin page at `/admin/settings/account-requests`

**Current Process:**
1. Admin receives email notification
2. Admin can contact user directly via phone/email
3. Admin manually updates database to approve/deny request
4. Admin uses existing tools to unlock account if approved

**Manual Approval (via database):**
```sql
-- To approve and unlock account
UPDATE users
SET 
  account_locked = false,
  account_change_requested = false,
  account_change_reason = NULL
WHERE id = 'user-id-here';
```

---

## 🎯 Benefits

### **For Users:**
✅ Clear communication about request status  
✅ Transparency in the process  
✅ Professional confirmation email  
✅ Support contact information readily available  

### **For Admins:**
✅ Immediate alerts for security-sensitive changes  
✅ Complete user context for verification  
✅ Streamlined review process  
✅ Audit trail for compliance  
✅ Configurable notification preferences  

---

## 📈 Future Enhancements

1. **Admin Dashboard Page:**
   - Create `/admin/settings/account-requests` page
   - List all pending requests
   - One-click approve/deny buttons
   - Request history and audit log

2. **Auto-approval for Trusted Users:**
   - After certain thresholds (payouts received, time on platform)
   - Auto-unlock with notification

3. **SMS Notifications:**
   - Send SMS to user for additional security
   - Two-factor verification for changes

4. **Document Upload:**
   - Allow users to attach ID documents
   - Bank statement upload for verification

5. **Status Tracking:**
   - User can see request status in dashboard
   - Estimated review time
   - Real-time updates

---

## ✅ Checklist

**To enable this feature:**

- [x] Run database migration for `notify_on_account_change_request` column
- [x] Configure Resend API key in environment variables
- [x] Set `ADMIN_EMAIL` in environment variables
- [x] Configure admin notification preferences in dashboard
- [x] Test with a real account change request
- [ ] (Optional) Create admin dashboard page for managing requests

---

## 🐛 Troubleshooting

### **No Email Received**

**Check:**
1. Resend API key is valid
2. `RESEND_FROM_EMAIL` is from verified domain
3. Admin has `notifyOnAccountChangeRequest` enabled
4. Email notifications are enabled globally
5. Check spam/junk folder
6. Check Resend dashboard for delivery logs

**Fix:**
```bash
# Verify environment variables
echo $RESEND_API_KEY
echo $RESEND_FROM_EMAIL
echo $ADMIN_EMAIL
```

### **User Doesn't Receive Confirmation**

**Possible Causes:**
- Invalid user email in database
- Email service error (non-critical, doesn't break flow)

**Debug:**
Check server logs for:
```
✅ Confirmation email sent to user@example.com
```

### **Database Error**

**If migration fails:**
```bash
# Check current schema
npm run db:studio

# Re-run migration
npm run db:push
```

---

## 📚 Related Documentation

- [Admin Notifications Setup Guide](./ADMIN_NOTIFICATIONS_SETUP.md)
- [Payment Integration](./PAYMENT_INTEGRATION_COMPLETE.md)
- [User Account Management](./USER_ACCOUNT_MANAGEMENT.md)

---

## ✨ Summary

This feature provides:

✅ **Automated email notifications** to admins when users request account changes  
✅ **User confirmation emails** for transparency and professionalism  
✅ **In-app notifications** for admins  
✅ **Configurable preferences** in admin settings  
✅ **Security-focused workflow** with verification steps  
✅ **Complete audit trail** of all requests  

**The account change request feature is now fully connected to email notifications!** 📧

