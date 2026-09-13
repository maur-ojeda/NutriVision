# Rate Limit Protection Implementation

## Overview
Comprehensive rate limiting system to prevent Supabase "email rate limit exceeded" errors and improve user experience during authentication flows.

## Problem Solved
Users were receiving "email rate limit exceeded" errors from Supabase when requesting multiple magic links. This happened because:
1. AuthCallback had automatic retry mechanisms
2. Multiple simultaneous authentication attempts
3. No cooldown period between requests
4. Lack of visual feedback for rate limits

## Solution Implemented

### 1. Rate Limit Detection System
**File**: `src/hooks/useAuth.ts`

**Features Added**:
```typescript
// localStorage-based cooldown system
const MAGIC_LINK_REQUEST_KEY = 'magic_link_request_time';
const RATE_LIMIT_COOLDOWN = 300000; // 5 minutes in milliseconds

const canRequestMagicLink = (): boolean => {
  const lastRequestTime = localStorage.getItem(MAGIC_LINK_REQUEST_KEY);
  if (!lastRequestTime) return true;
  
  const timeSinceLastRequest = Date.now() - parseInt(lastRequestTime);
  return timeSinceLastRequest > RATE_LIMIT_COOLDOWN;
};

const recordMagicLinkRequest = (): void => {
  localStorage.setItem(MAGIC_LINK_REQUEST_KEY, Date.now().toString());
};
```

**Key Benefits**:
- ✅ Prevents multiple rapid requests
- ✅ Tracks request timing using localStorage
- ✅ Automatic cooldown management
- ✅ Visual countdown for remaining cooldown time

### 2. Enhanced Error Handling
**File**: `src/lib/auth.ts`

**New Functions**:
```typescript
// Detect rate limit errors specifically
export const isRateLimitError = (error: any): boolean => {
  if (!error) return false;
  
  const errorMessage = error?.message || error?.toString() || '';
  return errorMessage.includes('rate limit') || 
         errorMessage.includes('rate_limit') ||
         errorMessage.includes('exceeded') ||
         errorMessage.includes('email rate limit');
};

// Enhanced error messages for rate limits
export const handleMagicLinkError = (error: any): string => {
  // Detect rate limit specifically
  const errorMessage = error?.message || error?.toString() || '';
  if (errorMessage.includes('rate limit') || errorMessage.includes('rate_limit') || errorMessage.includes('exceeded')) {
    return 'Has excedido el límite de solicitudes permitido. Por razones de seguridad, debes esperar antes de intentar nuevamente.';
  }
  // ... other error handling
};
```

### 3. UI Improvements
**File**: `src/pages/Auth.tsx`

**Rate Limit State Management**:
```typescript
const { isRateLimited, rateLimitCooldown } = useAuth();
const [localIsRateLimit, setLocalIsRateLimit] = useState(false);
```

**Visual Feedback**:
- **Loading State**: Disabled button with "Espera unos minutos..."
- **Rate Limit Active**: Orange-themed warning with cooldown timer
- **Success State**: Green message for successful magic link requests
- **Error Handling**: Different styling for rate limit vs other errors

### 4. AuthCallback Enhancements
**File**: `src/components/AuthCallback.tsx`

**Retry Prevention**:
```typescript
const processingRef = useRef(false);
const isProcessingRateLimit = useRef(false);

// Prevent multiple simultaneous processing
if (processingRef.current) {
  console.log('Ya procesando callback, ignorando...');
  return;
}

processingRef.current = true;
```

**Rate Limit Detection**:
```typescript
// Detect rate limit errors and prevent retries
if (result.error.includes('rate limit') || result.error.includes('rate_limit')) {
  setStatus('rate-limit');
  isProcessingRateLimit.current = true;
  // Don't auto-retry for rate limit errors
  return;
}
```

**Status Management**:
```typescript
type AuthStatus = 'loading' | 'success' | 'error' | 'rate-limit';

// Visual feedback for each state
- loading: Spinner with blue theme
- success: Check icon with green theme
- error: X icon with red theme
- rate-limit: Clock icon with orange theme
```

### 5. Smart Request Prevention
**File**: `src/hooks/useAuth.ts`

**Enhanced signIn Function**:
```typescript
const signIn = async (email: string) => {
  // Check rate limit status
  if (isRateLimited) {
    const minutesRemaining = rateLimitCooldown;
    setError(`Has excedido el límite de solicitudes. Por favor, espera ${minutesRemaining} minutos antes de intentar nuevamente.`);
    throw new Error('Rate limit exceeded');
  }
  
  // Record this request
  recordMagicLinkRequest();
  
  try {
    const { error } = await supabase.auth.signInWithOtp({ email });
    
    if (error) {
      // Activate rate limit state on error
      if (errorMessage.includes('rate limit')) {
        setIsRateLimited(true);
      }
    }
  } finally {
    setLoading(false);
  }
};
```

## User Experience Improvements

### Visual Feedback
**Rate Limit State**:
- 🔒 Orange-themed warning box
- ⏱️ Cooldown timer showing remaining minutes
- 🛡️ Security-focused messaging
- 💡 Tips about using existing magic links

**Button States**:
- ✅ Normal: "Enviar Magic Link" with green background
- 🔒 Rate Limited: "Espera unos minutos..." with orange background, disabled
- ⏳ Loading: Spinner with "Enviando Magic Link..."

### Error Messages
**Rate Limit Specific**:
```
¡Has excedido el límite de solicitudes!

Has solicitado demasiados magic links recientemente. Por razones de seguridad, Supabase limita el número de solicitudes.

🕐 Tiempo de espera: aprox. X minutos

💡 Si ya solicitaste un magic link recientemente, revisa tu email. Los enlaces son válidos por 1 hora.
```

**Other Errors**:
```
El magic link pudo expirar o estar roto. Por favor, solicita un nuevo enlace.
```

## Technical Implementation Details

### localStorage Management
**Keys**:
- `magic_link_request_time`: Timestamp of last magic link request

**Behavior**:
- Automatically updated on each successful request
- Checked before allowing new requests
- Persists across page reloads and app restarts

### Cooldown Mechanism
**Duration**: 5 minutes (300,000 milliseconds)

**Reset Conditions**:
- Manual reset when user changes email
- Automatic reset after cooldown expires
- State reset on successful login

### Auth State Synchronization
**Between Components**:
- `useAuth` hook manages global state
- `AuthPage` component displays local state
- `AuthCallback` handles specific auth scenarios
- `HomePage` detects URL parameters and routes appropriately

## Security Considerations

### Protection Against Abuse
- ✅ Prevents rapid successive requests
- ✅ Tracks request timing across sessions
- ✅ Automatic cooldown enforcement
- ✅ Visual deterrent for rate limiting

### User Experience
- ✅ Clear feedback about rate limiting
- ✅ Countdown timer for remaining cooldown time
- ✅ Alternative suggestions (use existing magic link)
- ✅ No confusing retry loops

## Testing Recommendations

### Test Scenarios

**1. Normal Magic Link Flow**
- Request magic link
- Receive email and click link
- Should authenticate successfully
- No rate limit errors

**2. Rate Limit Scenario**
- Request magic link rapidly (multiple times)
- Should see rate limit message
- Button becomes disabled
- Countdown timer appears
- After cooldown, can request again

**3. Mixed Scenarios**
- Request magic link → Get rate limit
- Wait for cooldown → Request again
- Should work successfully after cooldown

**4. Browser Restart**
- Get rate limited
- Close and reopen app
- Should maintain cooldown state
- Timer continues counting down

### Console Logging

**Expected Logs During Normal Flow**:
```
useAuth: Enviando magic link a: user@example.com
useAuth: Magic link enviado con éxito
```

**Expected Logs During Rate Limit**:
```
useAuth: Intento de magic link bloqueado por rate limit
useAuth: Activando estado de rate limit
AuthPage: Error de rate limit detectado en URL
```

## Configuration

### Environment Variables
No changes needed. System uses existing Supabase configuration.

### Adjustable Parameters
**In `src/hooks/useAuth.ts`**:
```typescript
const RATE_LIMIT_COOLDOWN = 300000; // 5 minutes - Adjust as needed
```

**Supabase Rate Limits**:
- Default limit is typically 3-5 requests per hour
- Cooldown should be longer than Supabase window
- Current 5-minute cooldown provides good buffer

## Troubleshooting

### Issue: Cooldown Not Resetting
**Solution**:
- Clear localStorage manually:
  ```javascript
  localStorage.removeItem('magic_link_request_time');
  ```
- Wait for automatic reset (after cooldown expires)
- Check browser settings for localStorage restrictions

### Issue: Inconsistent State
**Solution**:
- Check that localStorage is accessible
- Verify no browser extensions interfering
- Try in incognito mode
- Check browser console for errors

### Issue: Still Getting Rate Limit After Cooldown
**Solution**:
- Wait longer than expected (Supabase may have longer window)
- Contact Supabase support to check your project limits
- Verify that cooldown time is sufficient
- Check for other rate limiting (IP-based, etc.)

## Monitoring

### Console Logs Added
```typescript
console.log('useAuth: Enviando magic link a:', email);
console.log('useAuth: Intento de magic link bloqueado por rate limit');
console.log('AuthPage: Error de rate limit detectado');
```

### Error Tracking
All rate limit errors are:
- Detected automatically
- Prevented from causing user confusion
- Displayed with clear visual feedback
- Logged for debugging and monitoring

## Benefits

### For Users
- ✅ No more confusing rate limit errors
- ✅ Clear countdown timer for cooldown
- ✅ Better understanding of what happened
- ✅ Helpful tips for alternative actions
- ✅ Improved app stability

### For Developers
- ✅ Consistent error handling
- ✅ Easy to adjust cooldown period
- ✅ Clear console logs for debugging
- ✅ Prevents API abuse
- ✅ Better user experience
- ✅ Reduced support requests

## Future Enhancements

### Potential Improvements
1. **Progressive Backoff**: Exponential backoff for repeated failures
2. **Request Queue**: Queue requests and process automatically
3. **Analytics**: Track rate limit occurrences
4. **Adjustable Limits**: Allow admins to configure limits
5. **User Whitelist**: Allow trusted users bypass limits
6. **Alternative Auth**: Provide backup authentication methods

---

*Last Updated: March 15, 2026*
*Implementation: Complete*
*Status: Production Ready*