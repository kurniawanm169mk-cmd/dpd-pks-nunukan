-- STORAGE BUCKET SETUP FOR IMAGES
-- Run this SQL in your Supabase SQL Editor

-- First, create the storage bucket (if you haven't created it manually)
-- Note: You can also create this in the Supabase Dashboard -> Storage
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- Policy 1: Allow public read access to all images
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'images' );

-- Policy 2: Allow authenticated users to upload images
create policy "Authenticated users can upload images"
on storage.objects for insert
with check ( bucket_id = 'images' AND auth.role() = 'authenticated' );

-- Policy 3: Allow authenticated users to update their uploads
create policy "Authenticated users can update images"
on storage.objects for update
using ( bucket_id = 'images' AND auth.role() = 'authenticated' );

-- Policy 4: Allow authenticated users to delete images
create policy "Authenticated users can delete images"
on storage.objects for delete
using ( bucket_id = 'images' AND auth.role() = 'authenticated' );
