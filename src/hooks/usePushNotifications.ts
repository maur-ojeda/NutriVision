import { useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';

const PUSH_SERVER = import.meta.env.VITE_PUSH_SERVER_URL || 'https://pushnutrivision.mojeda.site';
const PUSH_SECRET = import.meta.env.VITE_PUSH_SECRET || '';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

export function usePushNotifications(user: User | null) {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const subscribe = useCallback(async () => {
    if (!user || !('serviceWorker' in navigator) || !('PushManager' in window)) return false;
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;

      // Get VAPID public key from push server
      const res = await fetch(`${PUSH_SERVER}/vapid-public-key`);
      const { publicKey } = await res.json();

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      await fetch(`${PUSH_SERVER}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, subscription: sub.toJSON() }),
      });

      setSubscribed(true);
      return true;
    } catch (e) {
      console.error('Push subscribe error:', e);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const sendCalorieAlert = useCallback(async (
    consumed: number,
    goal: number,
  ) => {
    if (!user) return;
    const pct = consumed / goal;
    if (pct < 0.95) return;

    const remaining = goal - consumed;
    const title = pct >= 1
      ? '🔴 Objetivo superado'
      : '🟡 Casi en tu límite';
    const body = pct >= 1
      ? `Consumiste ${consumed} kcal — ${Math.abs(remaining)} kcal sobre tu objetivo`
      : `Te quedan ${remaining} kcal para hoy (${Math.round(pct * 100)}%)`;

    await fetch(`${PUSH_SERVER}/notify/${user.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-push-secret': PUSH_SECRET,
      },
      body: JSON.stringify({ title, body }),
    });
  }, [user]);

  return { subscribed, loading, subscribe, sendCalorieAlert };
}
