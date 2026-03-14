-- ============================================
-- NutriVision PWA - Meals Table Migration (Simplified)
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create meals table
CREATE TABLE IF NOT EXISTS public.meals (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign key to Supabase Auth users
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- URL of food image
  image_url TEXT NOT NULL,

  -- Name of food/meal
  food_name TEXT NOT NULL,

  -- Total calories
  calories INTEGER NOT NULL CHECK (calories >= 0),

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Macros as JSONB
  macros JSONB NOT NULL
);

-- Enable RLS
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

-- Policies for RLS
DROP POLICY IF EXISTS "Users can view own meals";
CREATE POLICY "Users can view own meals"
ON public.meals
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own meals";
CREATE POLICY "Users can insert own meals"
ON public.meals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own meals";
CREATE POLICY "Users can update own meals"
ON public.meals
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own meals";
CREATE POLICY "Users can delete own meals"
ON public.meals
FOR DELETE
USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX meals_user_id_idx ON public.meals(user_id);
CREATE INDEX meals_created_at_idx ON public.meals(created_at DESC);
