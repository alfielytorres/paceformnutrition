-- Paceform Fuel MVP — Supabase SQL Schema
-- Run this in your Supabase SQL editor to set up the database.

-- ─────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  daily_calorie_target integer default 2200,
  protein_target numeric default 0,
  carbs_target numeric default 0,
  fat_target numeric default 0,
  weight_goal numeric,
  activity_level text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────
-- FOODS
-- ─────────────────────────────────────────────
create table if not exists foods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text,
  barcode text,
  source text default 'global',
  serving_size numeric default 1,
  serving_unit text default 'serving',
  calories integer not null,
  protein_g numeric default 0,
  carbs_g numeric default 0,
  fat_g numeric default 0,
  fibre_g numeric default 0,
  sugar_g numeric default 0,
  sodium_mg numeric default 0,
  created_by_user_id uuid references auth.users(id),
  is_verified boolean default false,
  is_public boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists foods_name_idx on foods using gin(to_tsvector('english', name));
create index if not exists foods_barcode_idx on foods(barcode) where barcode is not null;
create index if not exists foods_brand_idx on foods(brand) where brand is not null;

-- ─────────────────────────────────────────────
-- FOOD LOGS
-- ─────────────────────────────────────────────
create table if not exists food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  food_id uuid references foods(id) on delete set null,
  food_name text, -- denormalised for display even if food is deleted
  date date not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snacks')),
  quantity numeric default 1,
  serving_unit text,
  calories integer not null,
  protein_g numeric default 0,
  carbs_g numeric default 0,
  fat_g numeric default 0,
  fibre_g numeric default 0,
  sugar_g numeric default 0,
  sodium_mg numeric default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists food_logs_user_date_idx on food_logs(user_id, date);
create index if not exists food_logs_user_meal_idx on food_logs(user_id, meal_type);

-- ─────────────────────────────────────────────
-- FAVOURITE FOODS
-- ─────────────────────────────────────────────
create table if not exists favourite_foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  food_id uuid not null references foods(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(user_id, food_id)
);

-- ─────────────────────────────────────────────
-- COMPLETED DAYS
-- ─────────────────────────────────────────────
create table if not exists completed_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  is_complete boolean default true,
  created_at timestamp with time zone default now(),
  unique(user_id, date)
);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
alter table profiles enable row level security;
alter table food_logs enable row level security;
alter table favourite_foods enable row level security;
alter table completed_days enable row level security;
alter table foods enable row level security;

-- Profiles: users can only read/update their own
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Food logs: users can only access their own
create policy "Users can view own logs" on food_logs for select using (auth.uid() = user_id);
create policy "Users can insert own logs" on food_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own logs" on food_logs for update using (auth.uid() = user_id);
create policy "Users can delete own logs" on food_logs for delete using (auth.uid() = user_id);

-- Favourite foods: users can only access their own
create policy "Users can view own favourites" on favourite_foods for select using (auth.uid() = user_id);
create policy "Users can insert own favourites" on favourite_foods for insert with check (auth.uid() = user_id);
create policy "Users can delete own favourites" on favourite_foods for delete using (auth.uid() = user_id);

-- Completed days: users can only access their own
create policy "Users can view own completed days" on completed_days for select using (auth.uid() = user_id);
create policy "Users can upsert own completed days" on completed_days for insert with check (auth.uid() = user_id);
create policy "Users can update own completed days" on completed_days for update using (auth.uid() = user_id);

-- Foods: global foods readable by all; custom foods only by creator
create policy "Anyone can read public foods" on foods for select using (is_public = true or auth.uid() = created_by_user_id);
create policy "Users can create foods" on foods for insert with check (auth.uid() = created_by_user_id);
create policy "Users can update own foods" on foods for update using (auth.uid() = created_by_user_id);

-- ─────────────────────────────────────────────
-- SEED DATA
-- ─────────────────────────────────────────────
insert into foods (name, brand, barcode, source, serving_size, serving_unit, calories, protein_g, carbs_g, fat_g, fibre_g, sugar_g, sodium_mg, is_verified, is_public) values
  ('Breakfast burrito chipotle bacon', 'Guzman y Gomez', '9300601234567', 'global', 1, 'serving', 538, 29, 47, 25, 3, 4, 980, true, true),
  ('Protein bowl', 'KFC', '9300601234568', 'global', 1, 'serving', 552, 35, 45, 24, 4, 5, 1100, true, true),
  ('Brioche bread', 'Generic', null, 'global', 30, 'g', 113, 3, 18, 4, 1, 5, 160, true, true),
  ('Banana', 'Generic', null, 'global', 1, 'medium banana', 105, 1, 27, 0, 3, 14, 1, true, true),
  ('Chicken breast', 'Generic', null, 'global', 100, 'g', 165, 31, 0, 4, 0, 0, 74, true, true),
  ('White rice', 'Generic', null, 'global', 100, 'g', 130, 3, 28, 0, 0, 0, 1, true, true),
  ('Whey protein scoop', 'Generic', null, 'global', 1, 'scoop', 120, 24, 3, 2, 0, 2, 80, true, true),
  ('Egg', 'Generic', null, 'global', 1, 'egg', 70, 6, 0, 5, 0, 0, 65, true, true),
  ('Greek yoghurt', 'Generic', null, 'global', 100, 'g', 100, 10, 4, 5, 0, 4, 36, true, true)
on conflict do nothing;
