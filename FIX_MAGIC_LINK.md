# Fix Magic Link Redirect Configuration

## Problem
The magic link is redirecting to `localhost:3000/` but the application is not properly processing the authentication token.

## Solution
You need to configure Redirect URLs in your Supabase project.

## Step-by-Step Fix

### 1. Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Select your project: `fizakpelecbudzbjjnvx`
3. Go to **Authentication** → **URL Configuration**

### 2. Configure Site URL

#### For Development:
Set up **Site URL** to:
```
http://localhost:3000
```

#### For Production (Vercel):
Set up **Site URL** to:
```
https://project-dzdkd.vercel.app
```
http://localhost:3000
```

### 3. Configure Redirect URLs
Add these exact URLs to the **Redirect URLs** section:

#### For Development:
```
http://localhost:3000/**
http://localhost:3000/auth/callback
http://localhost:3000
```

#### For Production (Vercel):
```
https://project-dzdkd.vercel.app/**
https://project-dzdkd.vercel.app/auth/callback
https://project-dzdkd.vercel.app
```

### 4. Save Changes
Click **Save** to apply the configuration.

### 5. Update Environment Variables for Production

**In your `.env` file:**

1. Uncomment the production line:
```env
# Development Configuration
VITE_APP_URL=http://localhost:3000

# Production Configuration (uncomment for production deploy)
VITE_APP_URL=https://project-dzdkd.vercel.app
```

2. Or set in Vercel environment variables:
```
VITE_APP_URL = https://project-dzdkd.vercel.app
```

## Important Notes

### URL Matching
- The redirect URLs must **exactly match** the URL where your app is running
- Including the `/**` pattern allows any path after the domain
- For production, use HTTPS, not HTTP

### Development vs Production
When you deploy to production:
1. Update the Redirect URLs to your production domain
2. Update `VITE_APP_URL` in your `.env` file
3. Rebuild and deploy your application

## Application Changes Made

The application has been updated to better handle magic link callbacks:

### New Component: AuthCallback
- Detects authentication tokens in the URL
- Processes the session automatically
- Provides feedback to the user during processing
- Handles errors gracefully

### Enhanced URL Parameter Detection
- `HomePage.tsx` now detects auth parameters (`access_token`, `refresh_token`, `error`)
- Shows `AuthCallback` component when auth parameters are present
- Cleans up URL parameters after processing

### Error Handling
- Errors from magic links are now displayed in the auth page
- URL error parameters are captured and shown to users
- Better user feedback for failed authentication

## Testing the Fix

### 1. After Configuring Supabase
1. Clear your browser cache and cookies
2. Restart your development server: `npm run dev`
3. Go to `http://localhost:3000`
4. Enter your email to receive a magic link
5. Click the magic link in your email
6. You should be redirected and logged in automatically

### 2. Verify URL Parameters
When you click the magic link, the URL should look like:
```
http://localhost:3000/#access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...&expires_in=3600&refresh_token=...&token_type=bearer
```

The application will automatically detect and process these parameters.

## Troubleshooting

### Issue: Still seeing error page
**Solution:**
- Clear browser cache and cookies
- Check that Supabase Redirect URLs are exactly `http://localhost:3000/**`
- Restart the development server
- Try in incognito/private window

### Issue: Access denied error
**Solution:**
- Check that your email is verified in Supabase
- Ensure magic link hasn't expired (1 hour)
- Try requesting a new magic link
- Check Supabase logs for detailed error messages

### Issue: Redirect loop
**Solution:**
- Check that `detectSessionInUrl: true` is set in supabase client config
- Ensure `AuthCallback` component is working correctly
- Look for console errors in browser DevTools

## Common URL Patterns

### Success Flow
1. User enters email → Magic link sent
2. User clicks link → Redirected to `http://localhost:3000/#access_token=...`
3. App detects parameters → Shows `AuthCallback`
4. Session established → Redirected to Dashboard

### Error Flow
1. User clicks expired link → Redirected to `http://localhost:3000/#error=otp_expired`
2. App detects error → Shows error message in Auth page
3. User can request new magic link

## Production Deployment Checklist (Vercel)

When deploying to production with `vercel --prod`:

- [ ] Update `VITE_APP_URL` in `.env` to production URL (`https://project-dzdkd.vercel.app`)
- [ ] Add production URLs to Supabase Redirect URLs (`https://project-dzdkd.vercel.app/**`)
- [ ] Update Site URL in Supabase to production URL (`https://project-dzdkd.vercel.app`)
- [ ] Ensure HTTPS is working (required for magic links) ✅ (Vercel provides HTTPS automatically)
- [ ] Test magic link flow in production
- [ ] Verify PWA manifest URLs are correct
- [ ] Set `VITE_APP_URL` in Vercel environment variables (optional, but recommended)

## Related Files

- `src/lib/supabase.ts` - Supabase client configuration
- `src/hooks/useAuth.ts` - Auth state management
- `src/components/AuthCallback.tsx` - Magic link callback handler
- `src/pages/Home.tsx` - Auth parameter detection
- `src/pages/Auth.tsx` - Enhanced error handling
- `.env` - Environment configuration

## Support

If you continue to have issues:
1. Check Supabase Auth logs in the dashboard
2. Look at browser console for errors
3. Verify all Redirect URLs match exactly
4. Ensure the application is running on the configured URL

---

*Last Updated: March 14, 2026*