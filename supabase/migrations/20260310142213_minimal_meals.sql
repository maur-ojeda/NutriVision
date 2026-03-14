CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  food_name TEXT NOT NULL,
  calories INTEGER NOT NULL CHECK (calories >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  macros JSONB NOT NULL
);
