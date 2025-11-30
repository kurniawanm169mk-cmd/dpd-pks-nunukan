-- Add new columns to news_items table
ALTER TABLE public.news_items
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create unique index on slug (optional but good for performance)
CREATE UNIQUE INDEX IF NOT EXISTS idx_news_items_slug ON public.news_items (slug);

-- Create Media Quotes table
CREATE TABLE IF NOT EXISTS public.media_quotes (
  id uuid primary key default uuid_generate_v4(),
  content text not null,
  source text not null, -- e.g. "Kompas", "Detik"
  author text, -- e.g. "John Doe"
  date date,
  url text, -- Link to original article
  image_url text, -- Image to display with quote
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS for media_quotes
ALTER TABLE public.media_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.media_quotes
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert/update/delete" ON public.media_quotes
  FOR ALL USING (auth.role() = 'authenticated');
