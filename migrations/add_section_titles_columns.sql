-- Migration: Tambah kolom section_titles dan section_descriptions ke site_settings
-- Jalankan query ini di Supabase SQL Editor

ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS section_titles jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS section_descriptions jsonb DEFAULT '{}'::jsonb;
