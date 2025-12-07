-- Add section_descriptions column to site_settings table
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS section_descriptions JSONB DEFAULT '{"structure": "Para pemimpin yang berdedikasi untuk membawa perubahan positif."}'::jsonb;
