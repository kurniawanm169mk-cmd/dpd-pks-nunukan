-- Fix RLS Policy for site_settings to allow UPSERT (Insert + Update)
-- Run this in Supabase SQL Editor

-- 1. Drop existing update policy (optional, but good practice if we want to replace it)
DROP POLICY IF EXISTS "Allow authenticated update access" ON public.site_settings;

-- 2. Create a new policy that allows BOTH insert and update for authenticated users
CREATE POLICY "Allow authenticated insert and update access" 
ON public.site_settings
FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
