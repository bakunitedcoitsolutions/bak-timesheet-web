# Token Management & Security

## Overview

This application uses **NextAuth.js with JWT (JSON Web Token) strategy** for secure authentication and session management. This document explains how token management works and the security measures in place.

## How JWT Tokens Work

### 1. Token Creation (Login)

When a user successfully logs in:

1. **Credentials Validation**:
   - Email and password are verified
   - Account lockout is checked (rate limiting)
   - User active status is verified
   - Password is compared using bcryptjs

2. **Token Generation**:
   - NextAuth creates a JWT token containing:
     - User ID
     - Email
     - Role and permissions
     - Issued at timestamp (iat)
     - Expiration timestamp (exp)

3. **Token Storage**:
   - Token is stored in an **httpOnly cookie** (not accessible via JavaScript)
   - Cookie is set with `Secure` flag in production (HTTPS only)
   - Cookie uses `SameSite: lax` to prevent CSRF attacks

### 2. Token Validation (Every Request)

On each protected request:

1. **Middleware/Proxy Check** (`src/proxy.ts`):
   - Extracts token from httpOnly cookie
   - Validates token signature using `NEXTAUTH_SECRET`
   - Checks token expiration
   - Verifies session hasn't been invalidated

2. **Session Callback** (`src/lib/auth/config.ts`):
   - Validates user is still active
   - Checks if session was invalidated (e.g., admin deactivated user)
   - Refreshes user data if needed
   - Updates session with latest user information

### 3. Token Expiration

- **Max Age**: 30 days
- **Update Age**: Session data refreshes every 24 hours
- **Automatic Expiration**: Tokens expire after 30 days, requiring re-login

## Security Measures

### 1. **HttpOnly Cookies**

```typescript
cookies: {
  sessionToken: {
    name: `__Secure-next-auth.session-token`,
    options: {
      httpOnly: true,        // Not accessible via JavaScript (XSS protection)
      sameSite: "lax",       // CSRF protection
      secure: true,          // HTTPS only in production
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    },
  },
}
```

**Benefits**:
- Prevents XSS attacks (JavaScript cannot access the token)
- Prevents CSRF attacks (SameSite policy)
- Secure flag ensures HTTPS-only transmission

### 2. **Token Signing**

- Tokens are signed with `NEXTAUTH_SECRET` (strong random key)
- Signature prevents tampering
- Invalid signatures cause immediate rejection

### 3. **Rate Limiting (Login Protection)**

```typescript
MAX_LOGIN_ATTEMPTS: 5
LOGIN_LOCKOUT_DURATION: 15 minutes
```

- Tracks failed login attempts per email
- Locks account after 5 failed attempts
- 15-minute lockout period
- Prevents brute force attacks

### 4. **Session Invalidation**

When admin deactivates a user:

1. User status set to `isActive: false`
2. All database sessions deleted
3. Session invalidation flag set in Redis cache
4. On next request, JWT callback checks invalidation
5. User is immediately logged out

**Implementation**:
```typescript
// Invalidate sessions
await invalidateUserSessions(userId);

// Check in JWT callback
const invalidated = await isSessionInvalidated(token.id);
if (invalidated) {
  throw new Error("Session invalidated");
}
```

### 5. **Password Security**

- Passwords hashed with **bcryptjs** (12 rounds)
- Never stored in plain text
- Secure comparison using constant-time algorithm

### 6. **Token Refresh**

- Session data updates every 24 hours automatically
- User data refreshed on session update
- Ensures permissions/roles are current

## Token Lifecycle

```
┌─────────────┐
│   Login     │
│  (Email +   │
│  Password)  │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Validate Creds  │
│ Check Lockout   │
│ Verify Active   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Generate JWT    │
│ Store in Cookie │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Every Request   │
│ Validate Token  │
│ Check Expiry    │
│ Verify Session  │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Access Granted  │
│ or Redirect     │
└─────────────────┘
```

## Security Best Practices Implemented

✅ **HttpOnly Cookies** - Prevents XSS attacks  
✅ **Secure Flag** - HTTPS only in production  
✅ **SameSite Policy** - CSRF protection  
✅ **Token Signing** - Prevents tampering  
✅ **Token Expiration** - Limits exposure window  
✅ **Rate Limiting** - Prevents brute force  
✅ **Session Invalidation** - Immediate logout on deactivation  
✅ **Password Hashing** - Bcrypt with 12 rounds  
✅ **Active Status Check** - Prevents inactive user access  
✅ **Automatic Refresh** - Keeps permissions current  

## Environment Variables Required

```env
NEXTAUTH_SECRET="your-strong-random-secret-key"
NEXTAUTH_URL="https://yourdomain.com"
```

**Generate Secret**:
```bash
openssl rand -base64 32
```

## Token Invalidation Scenarios

1. **User Deactivated by Admin**:
   - Sessions invalidated immediately
   - User logged out on next request

2. **Password Changed**:
   - Old tokens remain valid (can be enhanced to invalidate)
   - User must re-login to get new token

3. **Role/Permissions Changed**:
   - Token refreshes on next request (24h update cycle)
   - Or can force immediate refresh

4. **Token Expired**:
   - Automatically rejected
   - User redirected to login

## Additional Security Recommendations

### 1. **IP-Based Validation** (Optional)

Add IP address to token and validate on each request:

```typescript
// In JWT callback
token.ip = req.headers.get('x-forwarded-for') || req.ip;
// Validate IP matches on each request
```

### 2. **Device Fingerprinting** (Optional)

Track device/browser to detect suspicious logins:

```typescript
token.deviceId = generateDeviceFingerprint(req);
```

### 3. **Two-Factor Authentication** (Future)

Add 2FA for additional security layer.

### 4. **Token Rotation** (Advanced)

Rotate tokens periodically even before expiration.

## Monitoring & Logging

Consider logging:
- Failed login attempts
- Token validation failures
- Session invalidations
- Suspicious activity patterns

## Summary

The token management system provides:

1. **Secure Storage** - HttpOnly cookies with Secure flag
2. **Tamper Protection** - Signed tokens with secret key
3. **Expiration Control** - 30-day max age with auto-refresh
4. **Immediate Invalidation** - Redis-based session invalidation
5. **Rate Limiting** - Brute force protection
6. **Active Status Check** - Prevents inactive user access

All security measures work together to ensure platform security while maintaining a good user experience.
