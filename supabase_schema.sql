-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Site Settings Table (Singleton)
create table public.site_settings (
  id int primary key default 1 check (id = 1), -- Ensure only one row exists
  identity jsonb not null default '{}'::jsonb,
  header jsonb not null default '{}'::jsonb,
  footer jsonb not null default '{}'::jsonb,
  registration jsonb not null default '{}'::jsonb,
  theme jsonb not null default '{}'::jsonb,
  hero jsonb not null default '{}'::jsonb,
  about jsonb not null default '{}'::jsonb,
  contact jsonb not null default '{}'::jsonb,
  team_background_color text,
  team_text_color text,
  news_background_color text,
  news_text_color text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS for site_settings
alter table public.site_settings enable row level security;

-- Policy: Allow read access to everyone
create policy "Allow public read access" on public.site_settings
  for select using (true);

-- Policy: Allow update access to authenticated users (admins)
-- Assuming you will use Supabase Auth. If not, you might need to adjust this.
create policy "Allow authenticated update access" on public.site_settings
  for update using (auth.role() = 'authenticated');
  
-- Insert default row if not exists
insert into public.site_settings (id) values (1) on conflict do nothing;

-- Team Members Table
create table public.team_members (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  role text not null,
  photo_url text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS for team_members
alter table public.team_members enable row level security;

create policy "Allow public read access" on public.team_members
  for select using (true);

create policy "Allow authenticated insert/update/delete" on public.team_members
  for all using (auth.role() = 'authenticated');

-- News Items Table
create table public.news_items (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  date date not null, -- or timestamp
  content text not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS for news_items
alter table public.news_items enable row level security;

create policy "Allow public read access" on public.news_items
  for select using (true);

create policy "Allow authenticated insert/update/delete" on public.news_items
  for all using (auth.role() = 'authenticated');

-- Social Links Table
create table public.social_links (
  id uuid primary key default uuid_generate_v4(),
  platform text not null,
  url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS for social_links
alter table public.social_links enable row level security;

create policy "Allow public read access" on public.social_links
  for select using (true);

create policy "Allow authenticated insert/update/delete" on public.social_links
  for all using (auth.role() = 'authenticated');

-- Storage Buckets (Optional, for images)
-- You might want to create a bucket named 'images' in the Supabase dashboard.
