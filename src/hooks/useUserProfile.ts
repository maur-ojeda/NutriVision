import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { calculateMacros, MacroProfile, MacroTargets } from '@/lib/macros';

export interface UserProfile extends MacroProfile {
  id: string;
  userId: string;
  targets: MacroTargets;
}

export function useUserProfile(user: User | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const { data, error: err } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (err) { setError(err.message); setLoading(false); return; }

    if (data) {
      const p: MacroProfile = {
        weightKg: Number(data.weight_kg),
        heightCm: Number(data.height_cm),
        age: data.age,
        sex: data.sex,
        activityLevel: data.activity_level,
        goal: data.goal,
        bodyFatPct: data.body_fat_pct ? Number(data.body_fat_pct) : undefined,
      };
      setProfile({ id: data.id, userId: data.user_id, ...p, targets: calculateMacros(p) });
    } else {
      setProfile(null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const saveProfile = useCallback(async (p: MacroProfile) => {
    if (!user) return null;
    const targets = calculateMacros(p);
    const row = {
      user_id: user.id,
      weight_kg: p.weightKg,
      height_cm: p.heightCm,
      age: p.age,
      sex: p.sex,
      activity_level: p.activityLevel,
      goal: p.goal,
      body_fat_pct: p.bodyFatPct ?? null,
      bmr: targets.bmr,
      tdee: targets.tdee,
      calorie_goal: targets.calorieGoal,
      protein_goal_g: targets.proteinG,
      carbs_goal_g: targets.carbsG,
      fat_goal_g: targets.fatG,
      updated_at: new Date().toISOString(),
    };

    const { data, error: err } = await supabase
      .from('user_profiles')
      .upsert(row, { onConflict: 'user_id' })
      .select()
      .single();

    if (err) { setError(err.message); return null; }
    setProfile({ id: data.id, userId: data.user_id, ...p, targets });
    return targets;
  }, [user]);

  return { profile, loading, error, saveProfile, refetch: fetchProfile };
}
