export const config = {
    runtime: 'edge',
};

// Hardcoded fallback credentials (same as before)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://hyzlxuitqpbfhgapovhd.supabase.co";
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5emx4dWl0cXBiZmhnYXBvdmhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzOTc4MjQsImV4cCI6MjA3OTk3MzgyNH0.Zv9Su84S7jTUSsXUoD54FE0o4gD9Zmeial2BS8poxYc";

export default async function handler(request: Request) {
    const url = new URL(request.url);
    const slug = url.searchParams.get('news') || url.pathname.split('/').pop();

    if (!slug) {
        return new Response('No news slug provided', { status: 400 });
    }

    try {
        let queryUrl = `${SUPABASE_URL}/rest/v1/news_items?slug=eq.${slug}&select=title,content,image_url,meta_description&limit=1`;

        const apiRes = await fetch(queryUrl, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });

        if (apiRes.ok) {
            const data = await apiRes.json();

            if (data && data.length > 0) {
                const news = data[0];
                const title = news.title || 'DPD PKS Nunukan';
                const rawDescription = news.meta_description || news.content || '';
                const description = rawDescription.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...';
                const image = news.image_url ? encodeURI(news.image_url) : 'https://dpd-pks-nunukan.vercel.app/og-default.jpg';

                // Original URL (simulate the actual news page)
                // We construct it manually since the request comes to /api/bot-news
                const originalUrl = `https://nunukan.pks.id/news/${slug}`;

                const html = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="DPD PKS Nunukan">
    <meta property="og:url" content="${originalUrl}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${originalUrl}">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${image}">
    
    <!-- Redirect to actual page for humans who might see this -->
    <script>window.location.href = "${originalUrl}";</script>
</head>
<body>
    <h1>${title}</h1>
    <img src="${image}" alt="${title}" style="max-width:100%;" />
    <p>${description}</p>
</body>
</html>`;

                return new Response(html, {
                    headers: {
                        'Content-Type': 'text/html; charset=utf-8',
                        'Cache-Control': 's-maxage=60, stale-while-revalidate',
                        'X-Bot-Handler': 'true'
                    }
                });
            } else {
                return new Response('News not found', { status: 404 });
            }
        } else {
            return new Response(`Database error: ${apiRes.status} ${apiRes.statusText}`, { status: 500 });
        }
    } catch (error: any) {
        return new Response(`Error: ${error.message}`, { status: 500 });
    }
}
