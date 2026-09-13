# Production Deployment Guide - Vercel

## Overview
Deploy NutriVision PWA to Vercel with proper Supabase configuration for magic links.

## Prerequisites

- [ ] Supabase project configured (`fizakpelecbudzbjjnvx`)
- [ ] Vercel account created
- [ ] Git repository initialized
- [ ] Local environment configured correctly
- [ ] Application builds successfully (`npm run build`)

## Step 1: Prepare for Production

### Update Environment Variables

**In `.env` file:**
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://fizakpelecbudzbjjnvx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xlWiAIvpzl58PdE26UiqoQ_9MsVlcis

# Production Configuration (UNCOMMENT THIS FOR PRODUCTION)
VITE_APP_URL=https://project-dzdkd.vercel.app
```

**Important:** Remove the `#` from the production line and comment out the development line.

### Verify Build Works
```bash
npm run build
```

Should complete without errors and generate `dist/` folder with all PWA files.

## Step 2: Configure Supabase for Production

### Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Select project: `fizakpelecbudzbjjnvx`
3. Navigate to: **Authentication** → **URL Configuration**

### Update Site URL
```
https://project-dzdkd.vercel.app
```

### Update Redirect URLs
Add these exact URLs:

```
https://project-dzdkd.vercel.app/**
https://project-dzdkd.vercel.app/auth/callback
https://project-dzdkd.vercel.app
```

### Save Changes
Click **Save** to apply the configuration.

## Step 3: Configure Vercel

### Option A: Via Vercel CLI (Recommended)

#### Install Vercel CLI
```bash
npm install -g vercel
```

#### Login to Vercel
```bash
vercel login
```

#### Deploy to Production
```bash
vercel --prod
```

This will:
- Deploy to production environment
- Use your `.env` file for environment variables
- Provide HTTPS automatically
- Set up custom domain (if configured)

### Option B: Via Vercel Dashboard

#### 1. Import Project
1. Go to https://vercel.com/dashboard
2. Click **Add New Project**
3. Import your Git repository
4. Vercel will detect it's a Vite project

#### 2. Configure Build Settings
Vercel will automatically detect:
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

#### 3. Set Environment Variables
In project settings → Environment Variables:
```
VITE_SUPABASE_URL=https://fizakpelecbudzbjjnvx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xlWiAIvpzl58PdE26UiqoQ_9MsVlcis
VITE_APP_URL=https://project-dzdkd.vercel.app
```

#### 4. Deploy
Click **Deploy** to start the deployment.

## Step 4: Verify Deployment

### Check Application URL
Visit: https://project-dzdkd.vercel.app

- [ ] Application loads correctly
- [ ] No console errors
- [ ] PWA manifest loads (`/manifest.webmanifest`)
- [ ] Service Worker registers
- [ ] Authentication works

### Test Magic Link Flow
1. Go to https://project-dzdkd.vercel.app
2. Enter your email to receive a magic link
3. Click the magic link in your email
4. Verify it redirects to production URL
5. Confirm you're logged in and see the dashboard

### Test PWA Installation
- [ ] Android: Install prompt appears
- [ ] iOS: Share → Add to Home Screen works
- [ ] Desktop: Install button in address bar
- [ ] Offline functionality works after installation

## Step 5: Troubleshooting

### Issue: Magic links don't work in production
**Solution:**
- Verify Supabase Redirect URLs are exactly `https://project-dzdkd.vercel.app/**`
- Check that `VITE_APP_URL` is set in Vercel environment variables
- Ensure Site URL in Supabase is `https://project-dzdkd.vercel.app`
- Check browser console for authentication errors

### Issue: PWA doesn't install
**Solution:**
- Verify HTTPS is working (required for PWA)
- Check that manifest is accessible at `https://project-dzdkd.vercel.app/manifest.webmanifest`
- Ensure all icons are present in the deployed version
- Clear browser cache and try again

### Issue: CORS errors with Supabase
**Solution:**
- Check Supabase Auth settings for CORS configuration
- Ensure your production domain is whitelisted
- Verify `VITE_SUPABASE_URL` is correct in production

### Issue: Build fails in Vercel
**Solution:**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript compilation succeeds locally
- Check for missing environment variables

## Step 6: Post-Deployment

### Monitor Performance
- Use Vercel Analytics to monitor performance
- Check Supabase logs for authentication issues
- Monitor PWA installation rates

### Update Documentation
- Update any hardcoded URLs to production URL
- Update API documentation if needed
- Update user documentation with production URLs

### Set Up Monitoring (Optional)
- Configure error tracking (Sentry, LogRocket, etc.)
- Set up uptime monitoring
- Configure analytics (Google Analytics, etc.)

## Environment Variables Reference

### Required Variables
```
VITE_SUPABASE_URL=Your Supabase project URL
VITE_SUPABASE_ANON_KEY=Your Supabase anon key
VITE_APP_URL=Your application URL (production)
```

### How to Set in Vercel CLI
```bash
vercel env add VITE_APP_URL https://project-dzdkd.vercel.app --prod
vercel env add VITE_SUPABASE_URL https://fizakpelecbudzbjjnvx.supabase.co --prod
vercel env add VITE_SUPABASE_ANON_KEY sb_publishable_xlWiAIvpzl58PdE26UiqoQ_9MsVlcis --prod
```

## Deployment Commands

### Local Development
```bash
npm run dev
```
URL: http://localhost:3000

### Production Deployment
```bash
vercel --prod
```
URL: https://project-dzdkd.vercel.app

### Preview Deployment
```bash
vercel
```
URL: https://project-dzdkd.vercel.app (preview branch)

## Common Issues and Solutions

### Issue: Environment variables not loading
**Solution:**
- Vite requires variables to start with `VITE_` prefix
- Verify variable names match exactly
- Check Vercel dashboard for variable values
- Restart deployment after adding variables

### Issue: Magic link redirects to wrong URL
**Solution:**
- Check that `VITE_APP_URL` is set correctly
- Verify Supabase Redirect URLs match exactly
- Ensure HTTPS is used (not HTTP)
- Clear browser cache and try again

### Issue: PWA manifest not loading
**Solution:**
- Verify manifest file is in `dist/` folder after build
- Check that `manifest.webmanifest` is linked in `index.html`
- Ensure Vite PWA plugin is configured correctly
- Check browser console for manifest loading errors

## Security Checklist

### Before Going Live
- [ ] HTTPS is enabled (Vercel provides this)
- [ ] Environment variables are set correctly
- [ ] Supabase RLS policies are configured
- [ ] No hardcoded credentials in code
- [ ] Error handling doesn't expose sensitive information
- [ ] CORS is properly configured
- [ ] Rate limiting is configured in Supabase

## Performance Checklist

### Optimization Steps
- [ ] Images are optimized
- [ ] Code splitting is implemented
- [ ] Caching strategies are effective
- [ ] Service Worker is caching correctly
- [ ] Bundle size is acceptable (currently ~780KB)

## Support and Maintenance

### Monitoring
- Check Vercel dashboard for deployment status
- Monitor Supabase logs for authentication issues
- Track PWA installation rates
- Monitor error rates in production

### Updates
- Deploy updates with `vercel --prod`
- Test in preview environment first
- Roll back if needed (Vercel provides this)
- Communicate changes to users

---

*Last Updated: March 14, 2026*
*Deployment Target: Vercel Production*