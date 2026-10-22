export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Goal = 'bulk' | 'maintain' | 'cut';

export interface MacroProfile {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: Sex;
  activityLevel: ActivityLevel;
  goal: Goal;
  bodyFatPct?: number;
}

export interface MacroTargets {
  bmr: number;
  tdee: number;
  calorieGoal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  formula: 'mifflin' | 'katch';
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

function mifflinBMR(p: MacroProfile): number {
  // Mifflin-St Jeor
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
  return p.sex === 'male' ? base + 5 : base - 161;
}

function katchBMR(p: MacroProfile): number {
  // Katch-McArdle — requires body fat %
  const lbm = p.weightKg * (1 - (p.bodyFatPct! / 100));
  return 370 + 21.6 * lbm;
}

export function calculateMacros(p: MacroProfile): MacroTargets {
  const useKatch = p.bodyFatPct != null && p.bodyFatPct > 0;
  const bmr = Math.round(useKatch ? katchBMR(p) : mifflinBMR(p));
  const tdee = Math.round(bmr * ACTIVITY_MULTIPLIERS[p.activityLevel]);

  let calorieGoal: number;
  let proteinG: number;
  let carbsG: number;
  let fatG: number;

  switch (p.goal) {
    case 'bulk':
      calorieGoal = Math.round(tdee * 1.15);
      proteinG = Math.round(p.weightKg * 2.0);
      fatG = Math.round(p.weightKg * 1.0);
      carbsG = Math.round((calorieGoal - proteinG * 4 - fatG * 9) / 4);
      break;
    case 'cut':
      calorieGoal = Math.round(tdee * 0.80);
      proteinG = Math.round(p.weightKg * 2.2);
      fatG = Math.round(p.weightKg * 0.8);
      carbsG = Math.round((calorieGoal - proteinG * 4 - fatG * 9) / 4);
      break;
    default: // maintain
      calorieGoal = tdee;
      proteinG = Math.round(p.weightKg * 1.8);
      fatG = Math.round(p.weightKg * 0.8);
      carbsG = Math.round((calorieGoal - proteinG * 4 - fatG * 9) / 4);
  }

  return {
    bmr,
    tdee,
    calorieGoal,
    proteinG: Math.max(proteinG, 0),
    carbsG: Math.max(carbsG, 0),
    fatG: Math.max(fatG, 0),
    formula: useKatch ? 'katch' : 'mifflin',
  };
}
