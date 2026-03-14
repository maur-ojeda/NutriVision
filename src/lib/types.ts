// Re-export Supabase types to use directly
export type { User, Session } from '@supabase/supabase-js';

export interface Macros {
  protein: number;  // grams
  carbs: number;    // grams
  fat: number;      // grams
}

export interface Meal {
  id: string;
  user_id: string;
  image_url: string;
  food_name: string;
  calories: number;
  macros: Macros;
  created_at: string;
}

export type MealInput = Omit<Meal, 'id' | 'created_at'>;
