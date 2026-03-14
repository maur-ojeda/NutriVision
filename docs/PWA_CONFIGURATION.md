# PWA Configuration - NutriVision

## Overview

NutriVision is now fully configured as a Progressive Web App (PWA), enabling installation on Android, iOS, macOS, and Windows platforms.

## Configuration Files

### 1. vite.config.js
```javascript
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'NutriVision',
    short_name: 'NutriVision',
    description: 'Contador de calorías con IA',
    theme_color: '#16a34a',
    background_color: '#ffffff',
    display: 'standalone',
    orientation: 'portrait',
    // Icons configuration
  },
  workbox: {
    // Caching strategies for fonts
    runtimeCaching: [...]
  }
})
```

### 2. index.html
- Added iOS-specific meta tags
- Added theme color
- Added link to manifest (auto-generated)

### 3. src/main.tsx
- Registers service worker
- Handles update prompts
- Manages offline-ready state

## Icon Requirements

PWA requires multiple icon sizes for different platforms:

```
public/
├── pwa-192x192.png    (192x192) - Android
├── pwa-512x512.png    (512x512) - Android high-res
├── apple-touch-icon.png (180x180) - iOS
├── mask-icon.svg      - Firefox/Safari adaptive icons
└── vite.svg           - Favicon
```

## How It Works

### Installation Detection
```typescript
// src/components/PWAInstallPrompt.tsx
window.addEventListener('beforeinstallprompt', (e) => {
  // Store the event for later use
  deferredPrompt = e;
  // Show install prompt to user
});
```

### Service Worker Registration
```typescript
// src/main.tsx
import { registerSW } from 'virtual:pwa-register';

registerSW({
  onNeedRefresh() { /* Prompt user to update */ },
  onOfflineReady() { /* Inform user offline mode is ready */ }
});
```

### Caching Strategy
- **Pre-caching**: Core assets cached immediately
- **Runtime Caching**: Fonts cached with CacheFirst strategy
- **Navigation**: All routes fallback to index.html (SPA support)

## Platform-Specific Behavior

### Android (Chrome)
- Automatic install prompt appears when conditions are met
- User clicks "Add to Home Screen" in browser menu
- App installs as standalone APK-like experience

### iOS (Safari)
- No automatic install prompt
- User must manually use Share → "Add to Home Screen"
- More restrictive but works well

### Desktop (Chrome/Edge)
- Install button appears in address bar
- Creates desktop shortcut that opens as app window

### macOS (Safari)
- Similar to iOS - manual installation via File menu

## Caching Strategy Details

### Pre-cached Assets
```javascript
[
  'index.html',
  'assets/*.js',
  'assets/*.css',
  'pwa-192x192.png',
  'pwa-512x512.png',
  'apple-touch-icon.png',
  'mask-icon.svg',
  'manifest.webmanifest'
]
```

### Runtime Caching
```javascript
{
  urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
  handler: 'CacheFirst',
  options: {
    cacheName: 'google-fonts-cache',
    expiration: {
      maxEntries: 10,
      maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
    }
  }
}
```

## Update Mechanism

### Auto-Update
```typescript
registerSW({
  onNeedRefresh() {
    // New version available
    // Prompt user to update
  }
});
```

### Service Worker Lifecycle
1. **Install**: New SW downloads and installs
2. **Wait**: Waits for current tabs to close
3. **Activate**: Becomes active when safe
4. **Control**: Takes control of all pages

## Offline Functionality

### What Works Offline
- Previously loaded pages
- Cached CSS/JS bundles
- Cached images
- Cached fonts

### What Requires Connection
- New authentication (Supabase)
- Camera capture (may need permissions)
- AI analysis (Gemini API)
- Real-time data updates

## Testing PWA

### Local Development
```bash
npm run dev
```
- Service Worker won't work properly in HTTP
- Use `npm run preview` after build for testing

### Production Build
```bash
npm run build
npm run preview
```
- Full PWA functionality available
- Service Worker active
- Can test installation

### Chrome DevTools
1. Open DevTools → Application tab
2. Check Service Workers, Manifest, Storage
3. Test offline mode in Network tab

## Browser Support

| Browser | Version | PWA Support | Notes |
|---------|---------|-------------|-------|
| Chrome | 87+ | ✅ Full | Best experience |
| Safari | 11.3+ | ⚠️ Limited | Manual install only |
| Edge | 87+ | ✅ Full | Same as Chrome |
| Firefox | ✅ | ✅ Full | Good support |

## Performance Optimizations

### 1. Code Splitting
```javascript
// Large bundles should be split
{
  manualChunks: {
    'react-vendor': ['react', 'react-dom'],
    'chart-vendor': ['recharts']
  }
}
```

### 2. Asset Optimization
- Images automatically optimized during build
- CSS minified and purged
- JavaScript tree-shaken

### 3. Caching Strategies
- **CacheFirst**: Fonts, images (fast, but may be stale)
- **NetworkFirst**: API calls (fresh data preferred)
- **StaleWhileRevalidate**: CSS/JS (fast load, background update)

## Troubleshooting

### Service Worker Not Registering
- Check HTTPS requirement
- Verify browser support
- Check console for errors
- Clear browser cache

### Install Prompt Not Showing
- Verify PWA criteria met
- Check HTTPS
- Ensure manifest is valid
- Try different browser

### Offline Mode Not Working
- First load app while online
- Check Network tab in DevTools
- Verify service worker is active
- Check IndexedDB for cached assets

## Security Considerations

### HTTPS Required
- PWA only works on HTTPS
- Local development can use localhost
- Production requires valid SSL certificate

### Secure Context
- Service Workers only run in secure contexts
- LocalStorage accessible but IndexedDB preferred
- Cookies must be set with Secure flag

### Permissions
- Camera access handled by browser
- Notifications need user permission
- Geolocation (future feature) needs permission

## Future Enhancements

### Push Notifications
```typescript
// Add push notification support
const registration = await navigator.serviceWorker.ready();
await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: VAPID_PUBLIC_KEY
});
```

### Background Sync
```typescript
// Sync data when back online
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-meals') {
    event.waitUntil(syncMeals());
  }
});
```

### Periodic Background Sync
```javascript
// Periodic updates (requires permission)
const registration = await navigator.serviceWorker.ready;
await registration.periodicSync.register('daily-sync', {
  minInterval: 24 * 60 * 60 * 1000 // 24 hours
});
```

## Maintenance

### Updates
- Service worker updates automatically
- User prompted when new version available
- Graceful degradation during update

### Monitoring
```javascript
// Add analytics
registerSW({
  onInstalled() {
    analytics.track('pwa_installed');
  },
  onUpdateReady() {
    analytics.track('pwa_update_ready');
  }
});
```

---

*Last Updated: March 14, 2026*
*Documentation maintained by development team*