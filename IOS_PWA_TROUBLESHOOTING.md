# iOS PWA Magic Link Troubleshooting

## Problem Specific Report
User installed NutriVision PWA on iOS, requested a magic link, confirmed email received, clicked the link, but was redirected to https://project-dzdkd.vercel.app without being logged into the dashboard.

## Root Cause Analysis

### Potential Issues Identified:

1. **URL Parameter Detection**: Magic link tokens may not be properly detected by the application
2. **Session Processing**: Supabase may not be processing the URL tokens correctly in the PWA context  
3. **Auth State Management**: useAuth hook may not be detecting session changes properly
4. **PWA Context**: iOS PWA may have different URL handling behavior

## Implemented Solutions

### 1. Enhanced AuthCallback Component
**File**: `src/components/AuthCallback.tsx`

**Changes Made**:
- ✅ Added retry mechanism (up to 3 attempts)
- ✅ Enhanced status display (loading/success/error)
- ✅ Better visual feedback with different icons
- ✅ Improved error handling and user messaging
- ✅ Extended timeout periods for session establishment
- ✅ Added detailed console logging for debugging

**Key Improvements**:
```typescript
// Better status management
const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

// Retry mechanism with exponential backoff
const [retryCount, setRetryCount] = useState(0);
// Reintentar hasta 3 veces si hay error temporal

// Extended timeouts for PWA context
setTimeout(() => { window.location.href = '/'; }, 2000); // More time for PWA
```

### 2. Enhanced Session Processing
**File**: `src/lib/supabase.ts`

**Changes Made**:
- ✅ Added processing delay for URL token parsing
- ✅ Enhanced URL parameter detection
- ✅ Better error handling and logging
- ✅ Fallback mechanisms for different scenarios

**Key Improvements**:
```typescript
// Give Supabase time to process URL tokens
await new Promise(resolve => setTimeout(resolve, 2000));

// Check both URL parameters and hash
const urlParams = new URLSearchParams(window.location.search);
const hashParams = new URLSearchParams(window.location.hash);
// Supabase uses hash parameters for auth tokens

// Better error detection
if (accessToken || refreshToken || error || type) {
  setShowCallback(true);
}
```

### 3. Enhanced Auth State Management
**File**: `src/hooks/useAuth.ts`

**Changes Made**:
- ✅ Added detailed console logging for debugging
- ✅ Enhanced auth state change handling
- ✅ Better error message handling
- ✅ Support for TOKEN_REFRESHED and USER_UPDATED events

**Key Improvements**:
```typescript
// Better logging
console.log('useAuth: Auth state changed:', event, session);
console.log('useAuth: Usuario autenticado:', session?.user?.email);

// Enhanced event handling
if (event === 'SIGNED_IN') { /* ... */ }
else if (event === 'TOKEN_REFRESHED') { /* ... */ }
else if (event === 'USER_UPDATED') { /* ... */ }
```

### 4. Enhanced URL Parameter Detection
**File**: `src/pages/Home.tsx`

**Changes Made**:
- ✅ Detect both search parameters AND hash parameters
- ✅ Support for multiple auth parameter types
- ✅ Better console logging for debugging
- ✅ Handle 'signup', 'recovery', and 'reinvite' types

**Key Improvements**:
```typescript
// Check both search and hash parameters
const urlParams = new URLSearchParams(window.location.search);
const hashParams = new URLSearchParams(window.location.hash);

// Supabase uses hash parameters
const accessToken = urlParams.get('access_token') || hashParams.get('access_token');

// Support different auth flows
const type = urlParams.get('type') || hashParams.get('type');
// 'signup' | 'recovery' | 'reinvite'
```

## Debugging Steps for iOS

### Step 1: Enable Console Logging
1. Open iOS PWA
2. Open Safari Developer Tools (Connect to Mac)
3. Go to Console tab
4. Request magic link
5. Click link in email
6. Watch for console messages:
   ```
   HomePage: Detectando parámetros de URL...
   HomePage: Parámetros detectados: { accessToken: "...", ... }
   useAuth: Iniciando detección de sesión...
   useAuth: Auth state changed: SIGNED_IN, session: {...}
   ```

### Step 2: Check URL Structure
When clicking magic link, URL should be:
```
https://project-dzdkd.vercel.app/#access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...&expires_in=3600&refresh_token=...&token_type=bearer
```

**Important**: Parameters should be in **hash (#)**, not search (?)

### Step 3: Verify PWA Installation
1. Check if app is installed correctly
2. Open Settings → General → iPhone Storage
3. Find "NutriVision" in installed apps
4. Verify app size and permissions
5. Check if app opens correctly from home screen

### Step 4: Test Different Scenarios

**Scenario 1: Direct Link Opening**
- Click magic link directly from email
- Should open iOS PWA
- Should automatically log in

**Scenario 2: Safari First, Then PWA**
- Click magic link in Safari
- Then open PWA from home screen
- Check if session persists

**Scenario 3: Different Email Client**
- Test with Gmail, Apple Mail, Outlook
- Check if email formatting affects link clicking

## Common iOS PWA Issues

### Issue 1: Hash Parameters Lost
**Symptoms**: Magic link opens but no parameters are detected
**Solution**: 
- Check that PWA is installed correctly
- Verify app is opened as standalone, not in Safari
- Try reinstalling PWA

### Issue 2: Session Not Persisting
**Symptoms**: User logs in but session is lost on app restart
**Solution**:
- Verify `persistSession: true` in Supabase config
- Check iOS Safari storage settings
- Clear PWA data and reinstall

### Issue 3: Redirect Loop
**Symptoms**: App keeps redirecting to auth page
**Solution**:
- Check `detectSessionInUrl: true` is set
- Verify Redirect URLs in Supabase
- Check for infinite redirect conditions

### Issue 4: CORS Issues
**Symptoms**: Console shows CORS errors
**Solution**:
- Verify Supabase CORS settings
- Ensure production domain is whitelisted
- Check that HTTPS is properly configured

## Testing Checklist

### Pre-Deployment
- [ ] All console logs added for debugging
- [ ] Error handling enhanced
- [ ] Timeout periods extended for PWA
- [ ] URL parameter detection improved
- [ ] Retry mechanisms implemented

### Post-Deployment Testing
- [ ] Test magic link flow on iOS PWA
- [ ] Verify session establishment
- [ ] Check redirect to dashboard works
- [ ] Test from different email clients
- [ ] Verify offline functionality after login
- [ ] Check session persistence across app restarts

### Console Log Verification
**Expected Logs**:
```
HomePage: Detectando parámetros de URL...
HomePage: Parámetros detectados: { accessToken: "...", refreshToken: "...", ... }
HomePage: Mostrando AuthCallback
useAuth: Iniciando detección de sesión...
useAuth: Sesión inicial: { session: {...}, error: null }
useAuth: Usuario autenticado: user@example.com
useAuth: Auth state changed: SIGNED_IN, session: {...}
```

## Fallback Solutions

### If AuthCallback Fails
1. **Manual Session Check**
   - Open app and check if user is logged in
   - If not, try logging in again

2. **Alternative Auth Flow**
   - Try using magic link in Safari instead of PWA
   - Then open PWA to check if session persists

3. **Reinstall PWA**
   - Delete PWA from home screen
   - Clear browser cache
   - Reinstall from production URL
   - Test magic link flow again

### If Issues Persist

1. **Check Supabase Logs**
   - Go to Supabase Dashboard
   - Check Auth logs for errors
   - Look for failed authentication attempts

2. **Network Analysis**
   - Check if there are network issues
   - Verify DNS resolution
   - Check firewall/security settings

3. **Downgrade/Upgrade Supabase Client**
   - Try different version of @supabase/supabase-js
   - Check if issue is version-specific

## Success Indicators

### When It's Working:
- ✅ Console logs show parameter detection
- ✅ AuthCallback shows "success" status
- ✅ User is automatically redirected to dashboard
- ✅ Session is established and user is logged in
- ✅ No console errors
- ✅ PWA functions normally after login

### Expected Flow:
1. User clicks magic link → PWA opens
2. Console: "Parámetros detectados: { accessToken: '...' }"
3. Console: "Auth state changed: SIGNED_IN"
4. AuthCallback: "¡Sesión establecida correctamente!"
5. Auto-redirect to dashboard
6. User sees dashboard logged in

## Support Information

### File Locations:
- **AuthCallback**: `src/components/AuthCallback.tsx`
- **Auth Hook**: `src/hooks/useAuth.ts` 
- **Session Processing**: `src/lib/supabase.ts`
- **URL Detection**: `src/pages/Home.tsx`

### Key Functions:
- `handleMagicLinkCallback()`: Processes session from URL
- `useAuth()`: Manages auth state across app
- `AuthCallback`: Handles magic link processing UI

### Configuration Files:
- **Environment**: `.env` (VITE_APP_URL)
- **Supabase**: Redirect URLs must match exactly
- **Build**: `vite.config.js` (PWA configuration)

---

*Last Updated: March 14, 2026*
*Platform: iOS PWA*
*Environment: Production (Vercel)*