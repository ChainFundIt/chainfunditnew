# Token Refresh System Documentation

## Overview

Your authentication system has been upgraded from a simple 2-day token system to a sophisticated **token refresh mechanism** that provides better security while maintaining an excellent user experience.

## What Changed

### Before
- **Single JWT token** valid for 2 days
- Users stayed logged in for 48 hours regardless of activity
- No automatic token rotation
- Session timeout only worked client-side

### After
- **Access tokens** (short-lived, 30 minutes)
- **Refresh tokens** (long-lived, 30 days)
- **Automatic token refresh** before expiration
- **Token rotation** for enhanced security
- **Database-backed token management** for revocation

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                      User Login Flow                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   User Logs In   │
                    └──────────────────┘
                              │
                              ▼
           ┌──────────────────────────────────┐
           │  Server Generates:               │
           │  • Access Token (30 min)         │
           │  • Refresh Token (30 days)       │
           │  • Stores refresh token in DB    │
           └──────────────────────────────────┘
                              │
                              ▼
           ┌──────────────────────────────────┐
           │  Cookies Set:                    │
           │  • auth_token (access)           │
           │  • refresh_token (refresh)       │
           └──────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Active Session                            │
│                                                               │
│  ┌─────────────────────────────────────────────┐            │
│  │  Every 25 minutes (client-side):            │            │
│  │  • Automatically refresh access token       │            │
│  │  • Get new access token + refresh token     │            │
│  │  • Old refresh token is revoked             │            │
│  └─────────────────────────────────────────────┘            │
│                                                               │
│  ┌─────────────────────────────────────────────┐            │
│  │  On Each Request (middleware):              │            │
│  │  • Check access token validity              │            │
│  │  • If expired, use refresh token            │            │
│  │  • Seamlessly continue the request          │            │
│  └─────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

## Security Features

### 1. Token Rotation
Every time a refresh token is used, it's replaced with a new one and the old one is revoked. This prevents token reuse attacks.

### 2. Database Tracking
All refresh tokens are stored in the database with:
- User agent (browser info)
- IP address
- Last used timestamp
- Revocation status

### 3. Automatic Revocation
Refresh tokens are automatically revoked when:
- User logs out
- Token is used for refresh (with rotation)
- Token expires (30 days)

### 4. Short-lived Access Tokens
Access tokens expire after 30 minutes, limiting the window of vulnerability if compromised.

## Implementation Details

### Database Schema

**Table: `refresh_tokens`**
```sql
CREATE TABLE "refresh_tokens" (
  "id" uuid PRIMARY KEY,
  "user_id" text NOT NULL,
  "token" text UNIQUE NOT NULL,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "last_used_at" timestamp,
  "user_agent" text,
  "ip_address" text,
  "is_revoked" timestamp
);
```

### API Endpoints

#### POST `/api/auth/refresh`
Refreshes an expired access token using a valid refresh token.

**Request:**
- Requires `refresh_token` cookie

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully"
}
```

**Cookies Set:**
- `auth_token` (new access token)
- `refresh_token` (new refresh token, if rotation is enabled)

#### POST `/api/auth/logout`
Logs out the user and revokes all their refresh tokens.

**Request:**
- Requires `auth_token` cookie

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Client-Side Integration

The `TokenRefreshProvider` component automatically handles token refresh:

```tsx
import { TokenRefreshProvider } from '@/hooks/use-token-refresh';

function Layout({ children }) {
  return (
    <TokenRefreshProvider>
      {children}
    </TokenRefreshProvider>
  );
}
```

**Features:**
- Automatically refreshes token every 25 minutes
- Handles token refresh on page load
- Logs out user if refresh fails

### Middleware Integration

The middleware automatically handles expired access tokens:

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // Check if access token is valid
  const userPayload = verifyUserJWT(token.value);
  
  if (!userPayload) {
    // Access token expired - try refresh
    if (refreshToken) {
      const result = await refreshAccessToken(refreshToken.value, request);
      
      if (result) {
        // Set new tokens and continue
        response.cookies.set('auth_token', result.accessToken);
        response.cookies.set('refresh_token', result.refreshToken);
        return response;
      }
    }
    
    // Refresh failed - redirect to login
    return NextResponse.redirect('/signin');
  }
}
```

## Configuration

Token expiry times can be configured in `lib/auth.ts`:

```typescript
export const TOKEN_CONFIG = {
  ACCESS_TOKEN_EXPIRY: "30m",      // 30 minutes
  REFRESH_TOKEN_EXPIRY_DAYS: 30,   // 30 days
  REFRESH_TOKEN_ROTATION: true,    // Enable token rotation
};
```

## Migration Steps

### 1. Apply Database Migration
```bash
npx drizzle-kit push
```

### 2. Log Out and Log Back In
**Important:** You must log out and log back in for the new token system to take effect. Your current session uses the old 2-day token.

```bash
# In your app:
1. Click logout
2. Sign in again
3. New access + refresh tokens will be issued
```

### 3. Verify Migration
After logging back in, you can verify the system is working:

1. **Check cookies in DevTools:**
   - `auth_token` should have a 30-minute expiry
   - `refresh_token` should have a 30-day expiry

2. **Check database:**
   ```sql
   SELECT * FROM refresh_tokens WHERE user_id = 'your-user-id';
   ```

3. **Test token refresh:**
   - Wait 25 minutes while active in the app
   - Check browser console for "Token refreshed successfully" message

## Troubleshooting

### Issue: "Authentication required" after 30 minutes
**Cause:** Refresh token is not being sent or is invalid.

**Solution:**
1. Check that cookies are enabled
2. Clear cookies and log in again
3. Verify `refresh_token` cookie exists in browser

### Issue: User gets logged out unexpectedly
**Cause:** Refresh token has expired or been revoked.

**Solution:**
1. Check refresh token expiry in database
2. Verify token hasn't been revoked (`is_revoked IS NULL`)
3. User needs to log in again

### Issue: Multiple refresh token records per user
**Cause:** This is normal! Each login session creates a new refresh token.

**Solution:** No action needed. Old tokens are automatically revoked on logout or after 30 days.

## Best Practices

### 1. Session Timeout vs Token Expiry
The system now has two timeout mechanisms:

**Client-side session timeout (2 hours):**
- Warns user after 105 minutes of inactivity
- Logs out after 120 minutes of inactivity

**Token expiry (30 minutes access, 30 days refresh):**
- Access token refreshed every 25 minutes automatically
- Refresh token valid for 30 days of continuous use

**Recommendation:** Keep both! Session timeout protects against leaving browser open, while token refresh provides seamless UX during active use.

### 2. Handling Multiple Devices
Users can be logged in on multiple devices. Each device gets its own refresh token tracked in the database.

### 3. Security Monitoring
Monitor the `refresh_tokens` table for:
- Unusual device patterns (user_agent)
- Geographic anomalies (ip_address)
- Tokens used after revocation (potential attack)

### 4. Cleanup Old Tokens
Consider adding a cron job to clean up expired/revoked tokens:

```typescript
// Clean up tokens older than 60 days
await db
  .delete(refreshTokens)
  .where(lt(refreshTokens.expiresAt, new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)));
```

## Benefits

### For Users
✅ Stay logged in during active use  
✅ No interruptions from expired tokens  
✅ Automatically logged out after inactivity  
✅ Seamless experience across page navigations

### For Security
✅ Short-lived access tokens (30 min)  
✅ Token rotation prevents reuse  
✅ Database tracking for audit trail  
✅ Immediate revocation on logout  
✅ Device and IP tracking

### For Developers
✅ Automatic token management  
✅ Middleware handles refresh transparently  
✅ Client-side hook for manual refresh  
✅ Easy to configure and monitor

## Testing

### Test Token Refresh
```typescript
// In browser console
setTimeout(async () => {
  const res = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include'
  });
  console.log('Refresh result:', await res.json());
}, 26 * 60 * 1000); // Test after 26 minutes
```

### Test Token Rotation
```sql
-- Before logout
SELECT token, created_at, is_revoked FROM refresh_tokens WHERE user_id = 'your-user-id';

-- After logout
SELECT token, created_at, is_revoked FROM refresh_tokens WHERE user_id = 'your-user-id';
-- All tokens should have is_revoked timestamp
```

### Test Middleware Auto-Refresh
1. Manually set access token to expire in browser DevTools
2. Navigate to a protected route
3. Should automatically refresh and continue

## Summary

The token refresh system provides enterprise-grade security while maintaining excellent user experience. Users stay logged in during active use, tokens are automatically refreshed, and security is enhanced through short-lived tokens and automatic rotation.

**Next Steps:**
1. Run database migration
2. Log out and back in
3. Monitor token refresh in console
4. Enjoy secure, seamless authentication! 🎉

