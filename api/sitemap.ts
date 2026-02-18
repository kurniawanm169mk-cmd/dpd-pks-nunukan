export const config = {
    runtime: 'edge',
};

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://hyzlxuitqpbfhgapovhd.supabase.co";
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5emx4dWl0cXBiZmhnYXBvdmhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzOTc4MjQsImV4cCI6MjA3OTk3MzgyNH0.Zv9Su84S7jTUSsXUoD54FE0o4gD9Zmeial2BS8poxYc";
const BASE_URL = "https://nunukan.pks.id";

export default async function handler(request: Request) {
    try {
        // Fetch all news - include image_url for image sitemap
        const queryUrl = `${SUPABASE_URL}/rest/v1/news_items?select=slug,created_at,title,image_url&order=created_at.desc`;

        const apiRes = await fetch(queryUrl, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });

        let newsItems: Array<{ slug: string; created_at: string; title: string; image_url: string }> = [];
        if (apiRes.ok) {
            newsItems = await apiRes.json();
        }

        const staticPages = [
            { url: '/', priority: '1.0', changefreq: 'daily' },
            { url: '/#berita', priority: '0.9', changefreq: 'daily' },
            { url: '/#tentang', priority: '0.7', changefreq: 'monthly' },
            { url: '/#tim', priority: '0.6', changefreq: 'monthly' },
            { url: '/#kontak', priority: '0.6', changefreq: 'monthly' },
        ];

        // Use image sitemap namespace so Google can index images
        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

        // Static pages
        staticPages.forEach(page => {
            sitemap += `
  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
        });

        // News pages with image sitemap entries
        newsItems.forEach(item => {
            if (!item.slug) return;
            const lastMod = item.created_at
                ? new Date(item.created_at).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0];
            const imageUrl = item.image_url ? encodeURI(item.image_url) : '';
            const imageTitle = (item.title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

            sitemap += `
  <url>
    <loc>${BASE_URL}/news/${item.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${imageUrl ? `
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title>${imageTitle}</image:title>
    </image:image>` : ''}
  </url>`;
        });

        sitemap += `
</urlset>`;

        return new Response(sitemap, {
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 's-maxage=3600, stale-while-revalidate',
            }
        });

    } catch (error: any) {
        return new Response(`Error generating sitemap: ${error.message}`, { status: 500 });
    }
}
