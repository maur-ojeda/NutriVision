import express from 'express';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(express.json());

// CORS — only allow NutriVision origin
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://nutrivision.mojeda.site';
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// VAPID setup
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Supabase client with service role (to read any user's subscriptions)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET /vapid-public-key — returns public key so the browser can subscribe
app.get('/vapid-public-key', (_req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// POST /subscribe — save browser push subscription linked to user
app.post('/subscribe', async (req, res) => {
  const { userId, subscription } = req.body;
  if (!userId || !subscription?.endpoint) {
    return res.status(400).json({ error: 'Missing userId or subscription' });
  }

  const { error } = await supabase.from('push_subscriptions').upsert({
    user_id: userId,
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
  }, { onConflict: 'endpoint' });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// DELETE /subscribe — remove subscription by endpoint
app.delete('/subscribe', async (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) return res.status(400).json({ error: 'Missing endpoint' });

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', endpoint);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// POST /notify/:userId — send push to all subscriptions of a user
app.post('/notify/:userId', async (req, res) => {
  const { userId } = req.params;
  const { title, body, icon } = req.body;

  // Internal auth: shared secret between NutriVision app and push server
  const authHeader = req.headers['x-push-secret'];
  if (authHeader !== process.env.PUSH_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', userId);

  if (error) return res.status(500).json({ error: error.message });
  if (!subs?.length) return res.json({ sent: 0 });

  const payload = JSON.stringify({ title, body, icon: icon || '/pwa-192x192.png' });

  const results = await Promise.allSettled(
    subs.map(sub =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      )
    )
  );

  // Remove expired/invalid subscriptions (410 Gone)
  const expiredEndpoints = subs
    .filter((_, i) => results[i].status === 'rejected' && results[i].reason?.statusCode === 410)
    .map(s => s.endpoint);

  if (expiredEndpoints.length) {
    await supabase.from('push_subscriptions').delete().in('endpoint', expiredEndpoints);
  }

  const sent = results.filter(r => r.status === 'fulfilled').length;
  res.json({ sent, total: subs.length });
});

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Push server running on port ${PORT}`));
