import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://hyzlxuitqpbfhgapovhd.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5emx4dWl0cXBiZmhnYXBvdmhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzOTc4MjQsImV4cCI6MjA3OTk3MzgyNH0.Zv9Su84S7jTUSsXUoD54FE0o4gD9Zmeial2BS8poxYc";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
