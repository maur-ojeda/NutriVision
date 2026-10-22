-- user_profiles: stores macro goals and body data per user
create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  weight_kg numeric(5,1) not null,
  height_cm numeric(5,1) not null,
  age integer not null,
  sex text not null check (sex in ('male', 'female')),
  activity_level text not null check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  goal text not null check (goal in ('bulk', 'maintain', 'cut')),
  body_fat_pct numeric(4,1),
  -- calculated fields (stored for display, recalculated on update)
  bmr numeric(7,1),
  tdee numeric(7,1),
  calorie_goal integer,
  protein_goal_g integer,
  carbs_goal_g integer,
  fat_goal_g integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_profiles_user_id_key unique (user_id)
);

alter table public.user_profiles enable row level security;

create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = user_id);

create policy "Users can delete own profile"
  on public.user_profiles for delete
  using (auth.uid() = user_id);

-- push_subscriptions: Web Push API subscriptions per user/device
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  constraint push_subscriptions_endpoint_key unique (endpoint)
);

alter table public.push_subscriptions enable row level security;

create policy "Users can view own subscriptions"
  on public.push_subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert own subscriptions"
  on public.push_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own subscriptions"
  on public.push_subscriptions for delete
  using (auth.uid() = user_id);

-- push server needs service role to read all subscriptions for a user
-- (granted via SUPABASE_SERVICE_ROLE_KEY in push-server env)

create index if not exists user_profiles_user_id_idx on public.user_profiles(user_id);
create index if not exists push_subscriptions_user_id_idx on public.push_subscriptions(user_id);
