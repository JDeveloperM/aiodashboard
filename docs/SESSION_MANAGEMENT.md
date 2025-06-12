# Session Management System

This document explains the new time-sensitive cookie-based authentication system that prevents frequent disconnections.

## Overview

The session management system provides:
- **7-day persistent sessions** using secure cookies
- **Automatic session refresh** when users are active
- **Expiration warnings** before sessions expire
- **Graceful fallback** to localStorage for compatibility
- **Real-time session monitoring** and activity tracking

## Key Features

### 🍪 Time-Sensitive Cookies
- Sessions are stored in secure HTTP cookies
- Default 7-day expiration with automatic refresh
- Secure settings for production environments
- Fallback to localStorage for compatibility

### 🔄 Automatic Refresh
- Sessions refresh automatically when users are active
- Activity tracking monitors user interactions
- Smart refresh logic prevents unnecessary updates
- Configurable refresh thresholds

### ⚠️ Expiration Warnings
- Users receive warnings 10 minutes before expiry
- Toast notifications for session status changes
- Visual indicators in the UI for session health
- Automatic logout when sessions expire

### 📱 Cross-Tab Synchronization
- Sessions work across multiple browser tabs
- Real-time updates when sessions change
- Consistent authentication state everywhere

## Implementation

### Core Files

1. **`lib/auth-cookies.ts`** - Cookie utilities and session storage
2. **`lib/auth-session.ts`** - Session lifecycle management
3. **`hooks/use-session.ts`** - React hooks for session management
4. **`components/session-status.tsx`** - UI component for session display

### Updated Components

1. **`components/zklogin-provider.tsx`** - Added cookie persistence
2. **`contexts/sui-auth-context.tsx`** - Integrated session management
3. **`components/top-nav.tsx`** - Added session status display

## Usage

### Basic Session Hook

```tsx
import { useSession } from '@/hooks/use-session'

function MyComponent() {
  const {
    isAuthenticated,
    user,
    timeUntilExpiry,
    needsRefresh,
    isExpiringSoon,
    refresh,
    getTimeRemaining
  } = useSession()

  return (
    <div>
      {isAuthenticated && (
        <p>Session expires in: {getTimeRemaining()}</p>
      )}
    </div>
  )
}
```

### Session Status Component

```tsx
import { SessionStatus } from '@/components/session-status'

// Compact badge (used in header)
<SessionStatus />

// Detailed card (used in settings)
<SessionStatus showDetails={true} />
```

### Session Warnings

```tsx
import { useSessionWarnings } from '@/hooks/use-session'

function MyApp() {
  useSessionWarnings({
    onWarning: (minutes) => {
      toast.warning(`Session expires in ${minutes} minutes`)
    },
    onExpiringSoon: () => {
      toast.error('Session expiring soon!')
    },
    onLogout: (reason) => {
      toast.error('Session expired')
      // Redirect to login
    }
  })

  return <div>...</div>
}
```

### Manual Session Management

```tsx
import { 
  saveAuthSession, 
  getAuthSession, 
  clearAuthSession,
  refreshSession 
} from '@/lib/auth-cookies'

// Save session
saveAuthSession({
  address: '0x123...',
  connectionType: 'wallet',
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString()
})

// Get current session
const session = getAuthSession()

// Refresh session
const success = refreshSession()

// Clear session
clearAuthSession()
```

## Configuration

### Cookie Settings

```typescript
const COOKIE_CONFIG = {
  MAX_AGE: 7 * 24 * 60 * 60, // 7 days in seconds
  REFRESH_THRESHOLD: 24 * 60 * 60, // Refresh if expires within 24 hours
  SECURE: process.env.NODE_ENV === 'production',
  SAME_SITE: 'lax' as const,
}
```

### Session Activity

```typescript
const SESSION_CONFIG = {
  ACTIVITY_INTERVAL: 5 * 60 * 1000, // Check activity every 5 minutes
  ACTIVITY_THRESHOLD: 30 * 60 * 1000, // Update session if active within 30 minutes
  WARNING_THRESHOLD: 10 * 60 * 1000, // Show warning 10 minutes before expiry
}
```

## Benefits

### For Users
- ✅ **No more frequent disconnections**
- ✅ **Seamless experience across browser sessions**
- ✅ **Clear warnings before session expiry**
- ✅ **Automatic session extension when active**

### For Developers
- ✅ **Reliable authentication state**
- ✅ **Easy-to-use React hooks**
- ✅ **Comprehensive session monitoring**
- ✅ **Backward compatibility with existing code**

## Migration

The new system is backward compatible. Existing localStorage-based sessions will be automatically migrated to cookies on first load.

### Automatic Migration
1. System checks for existing localStorage sessions
2. Migrates data to secure cookies
3. Maintains user authentication state
4. Cleans up old localStorage entries

## Security

### Cookie Security
- **Secure flag** enabled in production
- **SameSite=Lax** for CSRF protection
- **HttpOnly** for sensitive data (future enhancement)
- **Path restriction** to application routes

### Session Validation
- **Expiration checking** on every access
- **Automatic cleanup** of expired sessions
- **Activity-based refresh** prevents stale sessions
- **Force logout** on security events

## Troubleshooting

### Common Issues

1. **Session not persisting**
   - Check if cookies are enabled in browser
   - Verify domain settings in production
   - Check for third-party cookie blockers

2. **Frequent expiration warnings**
   - User may have low activity
   - Check activity tracking configuration
   - Verify refresh threshold settings

3. **Cross-tab issues**
   - Ensure cookie domain is set correctly
   - Check for localStorage conflicts
   - Verify event listeners are working

### Debug Mode

Enable debug logging by setting:
```typescript
localStorage.setItem('debug-session', 'true')
```

This will log session activities to the browser console.

## Demo

Visit `/settings/session` to see the session management interface with:
- Real-time session status
- Manual refresh controls
- Security feature overview
- Session configuration details
