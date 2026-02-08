import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch Site Config
    const { data: settings } = await supabase
        .from('site_settings')
        .select('identity')
        .single();

    // Use configured siteUrl or fallback
    const baseUrl = settings?.identity?.siteUrl || 'https://dpd-pks-nunukan.vercel.app';

    // 2. Fetch all news slugs
    const { data: newsItems } = await supabase
        .from('news_items')
        .select('slug, updated_at')
        .eq('status', 'published');

    const staticPages = [
        '',
        '/about',
        '/team'
    ]; // 'news' page is usually just the hashtag section

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static pages
    staticPages.forEach(page => {
        sitemap += `
  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    // Add news pages
    if (newsItems) {
        newsItems.forEach(item => {
            const lastMod = item.updated_at ? new Date(item.updated_at).toISOString() : new Date().toISOString();
            sitemap += `
  <url>
    <loc>${baseUrl}/news/${item.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
        });
    }

    sitemap += `
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).send(sitemap);
}
