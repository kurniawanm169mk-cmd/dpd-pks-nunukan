-- Add views column to news_items
ALTER TABLE public.news_items ADD COLUMN IF NOT EXISTS views INT DEFAULT 0;

-- Function to safely increment view count
CREATE OR REPLACE FUNCTION increment_news_view(news_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.news_items
  SET views = views + 1
  WHERE id = news_id;
END;
$$;
