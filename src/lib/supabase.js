import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Supabase is optional — the app works fully offline with localStorage.
// To enable cloud sync, copy .env.example to .env and fill in your credentials.
//
// Required table (run in Supabase SQL editor):
//
// create table game_state (
//   user_id  text primary key,
//   coins    integer default 0,
//   total_coins integer default 0,
//   completed_tasks jsonb default '[]',
//   water_glasses integer default 0,
//   streak   integer default 0,
//   total_tasks integer default 0,
//   name     text default '',
//   avatar   text default '😎',
//   last_day text default '',
//   goal_settings jsonb default '{}',
//   parent_pin text default '1234',
//   updated_at timestamptz default now()
// );
//
// alter table game_state enable row level security;
// create policy "public read/write by device" on game_state
//   for all using (true) with check (true);

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null
