-- Add section_titles column to site_settings table
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS section_titles JSONB DEFAULT '{"structure": "Struktur Organisasi", "news": "Berita dan Kegiatan"}'::jsonb;
