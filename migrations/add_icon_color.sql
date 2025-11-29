-- Add icon_color column to social_links table
ALTER TABLE public.social_links
ADD COLUMN IF NOT EXISTS icon_color TEXT;

-- Set default color for existing records
UPDATE public.social_links
SET icon_color = '#ffffff'
WHERE icon_color IS NULL;
