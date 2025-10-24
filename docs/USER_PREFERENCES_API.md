# User Preferences API Setup

## Overview
The User Preferences API allows authenticated users (not admin) to manage their notification preferences, including email notifications, donation alerts, and summary reports. This is for regular users on their dashboard to control notifications about their campaigns and donations.

## Endpoints

### GET `/api/settings/preferences`
Fetches the authenticated user's notification preferences.

**Authentication:** Required (via `auth_token` cookie)

**Response:**
```json
{
  "settings": {
    "id": "uuid",
    "userId": "uuid",
    "emailNotificationsEnabled": true,
    "notificationEmail": "admin@example.com",
    "notifyOnCharityDonation": true,
    "notifyOnCampaignDonation": true,
    "notifyOnPayoutRequest": true,
    "notifyOnLargeDonation": true,
    "largeDonationThreshold": "1000",
    "pushNotificationsEnabled": false,
    "dailySummaryEnabled": false,
    "weeklySummaryEnabled": true,
    "summaryTime": "09:00",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Behavior:**
- If no settings exist for the user, default settings will be automatically created
- Default values:
  - Email notifications: Enabled
  - Charity donation alerts: Disabled (users don't need alerts for their own donations)
  - Campaign donation alerts: Enabled (users want to know when their campaign gets donations)
  - Payout request alerts: Enabled
  - Large donation alerts: Enabled
  - Large donation threshold: $1000
  - Push notifications: Disabled
  - Daily summary: Disabled
  - Weekly summary: Enabled
  - Summary time: 09:00

### PATCH `/api/settings/preferences`
Updates the authenticated user's notification preferences.

**Authentication:** Required (via `auth_token` cookie)

**Request Body:**
```json
{
  "emailNotificationsEnabled": true,
  "notificationEmail": "custom@example.com",
  "notifyOnCharityDonation": true,
  "notifyOnCampaignDonation": true,
  "notifyOnPayoutRequest": true,
  "notifyOnLargeDonation": true,
  "largeDonationThreshold": "5000",
  "pushNotificationsEnabled": false,
  "dailySummaryEnabled": true,
  "weeklySummaryEnabled": true,
  "summaryTime": "10:00"
}
```

**Response:**
```json
{
  "message": "Settings updated successfully",
  "settings": {
    "id": "uuid",
    "userId": "uuid",
    "emailNotificationsEnabled": true,
    "notificationEmail": "custom@example.com",
    ...
  }
}
```

**Behavior:**
- Only fields provided in the request will be updated
- If no settings exist, new settings will be created with the provided values
- Invalid fields will be filtered out automatically

## Database Schema

The preferences are stored in the `user_preferences` table:

```sql
CREATE TABLE "user_preferences" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL UNIQUE,
  "email_notifications_enabled" boolean DEFAULT true NOT NULL,
  "notification_email" varchar(255),
  "notify_on_charity_donation" boolean DEFAULT false NOT NULL,
  "notify_on_campaign_donation" boolean DEFAULT true NOT NULL,
  "notify_on_payout_request" boolean DEFAULT true NOT NULL,
  "notify_on_large_donation" boolean DEFAULT true NOT NULL,
  "large_donation_threshold" varchar(20) DEFAULT '1000',
  "push_notifications_enabled" boolean DEFAULT false NOT NULL,
  "push_subscription" jsonb,
  "daily_summary_enabled" boolean DEFAULT false NOT NULL,
  "weekly_summary_enabled" boolean DEFAULT true NOT NULL,
  "summary_time" varchar(10) DEFAULT '09:00',
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "user_preferences_user_id_unique" UNIQUE("user_id")
);
```

### Schema Details

- **user_id**: Links to the `users` table, enforces unique constraint (one preferences record per user)
- **notify_on_charity_donation**: Disabled by default (users don't need notifications when they donate)
- **notify_on_campaign_donation**: Enabled by default (users want to know when their campaign receives donations)
- **notify_on_large_donation**: Alerts for large donations to their campaigns
- **large_donation_threshold**: Minimum amount (in USD) to trigger large donation alerts

## Frontend Integration

The preferences page is located at:
- **Path:** `app/(dashboard)/settings/preferences.tsx`
- **Route:** `/settings/preferences`

### Usage Example:

```typescript
// Fetch preferences
const response = await fetch('/api/settings/preferences');
const data = await response.json();
console.log(data.settings);

// Update preferences
const response = await fetch('/api/settings/preferences', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    emailNotificationsEnabled: true,
    notifyOnLargeDonation: true,
    largeDonationThreshold: '5000',
  }),
});
const data = await response.json();
console.log(data.message); // "Settings updated successfully"
```

## Authentication Flow

1. The API endpoint reads the `auth_token` cookie from the request
2. The token is verified using `verifyUserJWT()` from `@/lib/auth`
3. The user's email is extracted from the verified token
4. The email is used to look up the user in the database
5. The user's ID is used to query/update the `admin_settings` table

## Error Handling

| Status Code | Error | Description |
|-------------|-------|-------------|
| 401 | Not authenticated | No valid auth token found |
| 404 | User not found | User doesn't exist in database |
| 500 | Failed to fetch/update settings | Server error |

## Security

- All endpoints require authentication
- Only the authenticated user can view/update their own settings
- Field validation prevents unauthorized data modification
- User ID is obtained from the verified JWT token, not from request body

## Testing

You can test the API using curl:

```bash
# Get preferences (requires valid auth_token cookie)
curl -X GET http://localhost:3000/api/settings/preferences \
  -H "Cookie: auth_token=YOUR_TOKEN"

# Update preferences
curl -X PATCH http://localhost:3000/api/settings/preferences \
  -H "Cookie: auth_token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "emailNotificationsEnabled": true,
    "largeDonationThreshold": "5000"
  }'
```

## Migration

The database migration for the `user_preferences` table is located at:
- **File:** `lib/migrations/0005_perpetual_sally_floyd.sql`
- **Schema:** `lib/schema/user-preferences.ts`

To apply the migration:
```bash
npm run db:push
# or with force flag to skip confirmation
npx drizzle-kit push --force
```

The migration has been successfully applied to the database.

## Future Enhancements

- **Push Notifications:** Currently disabled, will be implemented in a future release
- **Custom notification templates:** Allow users to customize email templates
- **Multi-channel notifications:** SMS, WhatsApp, etc.
- **Advanced filtering:** More granular control over which notifications to receive

