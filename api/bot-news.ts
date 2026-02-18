export const config = {
    runtime: 'edge',
};

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://hyzlxuitqpbfhgapovhd.supabase.co";
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5emx4dWl0cXBiZmhnYXBvdmhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzOTc4MjQsImV4cCI6MjA3OTk3MzgyNH0.Zv9Su84S7jTUSsXUoD54FE0o4gD9Zmeial2BS8poxYc";

export default async function handler(request: Request) {
    const url = new URL(request.url);
    const slug = url.searchParams.get('news') || url.pathname.split('/').pop();

    if (!slug || slug === 'bot-news') {
        return new Response('No news slug provided', { status: 400 });
    }

    try {
        // Fetch news - include date for structured data
        const queryUrl = `${SUPABASE_URL}/rest/v1/news_items?slug=eq.${encodeURIComponent(slug)}&select=title,content,image_url,date,created_at&limit=1`;

        const apiRes = await fetch(queryUrl, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });

        if (!apiRes.ok) {
            const errText = await apiRes.text();
            return new Response(`Database error: ${apiRes.status} - ${errText}`, { status: 500 });
        }

        const data = await apiRes.json();

        if (!data || data.length === 0) {
            return new Response('News not found', { status: 404 });
        }

        const news = data[0];
        const title = (news.title || 'DPD PKS Nunukan').replace(/"/g, '&quot;');
        const rawDescription = news.content || '';
        const description = rawDescription.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...';
        const descriptionEscaped = description.replace(/"/g, '&quot;');
        const image = news.image_url ? encodeURI(news.image_url) : 'https://nunukan.pks.id/og-default.jpg';
        const originalUrl = `https://nunukan.pks.id/news/${slug}`;
        const publishDate = news.date || news.created_at || new Date().toISOString();

        // JSON-LD Structured Data for Google Rich Results (NewsArticle schema)
        const jsonLd = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": news.title || 'DPD PKS Nunukan',
            "description": rawDescription.replace(/<[^>]*>?/gm, '').substring(0, 160),
            "image": [image],
            "datePublished": publishDate,
            "dateModified": publishDate,
            "author": {
                "@type": "Organization",
                "name": "DPD PKS Nunukan",
                "url": "https://nunukan.pks.id"
            },
            "publisher": {
                "@type": "Organization",
                "name": "DPD PKS Nunukan",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://nunukan.pks.id/og-default.jpg"
                }
            },
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": originalUrl
            },
            "url": originalUrl
        });

        const html = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${descriptionEscaped}">
    <link rel="canonical" href="${originalUrl}">

    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="DPD PKS Nunukan">
    <meta property="og:url" content="${originalUrl}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${descriptionEscaped}">
    <meta property="og:image" content="${image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${originalUrl}">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${descriptionEscaped}">
    <meta name="twitter:image" content="${image}">

    <!-- JSON-LD Structured Data for Google Rich Results -->
    <script type="application/ld+json">${jsonLd}</script>

    <!-- Redirect humans to the actual SPA page -->
    <script>window.location.href = "${originalUrl}";</script>
</head>
<body>
    <article>
        <h1>${title}</h1>
        <img src="${image}" alt="${title}" style="max-width:100%;" />
        <p>${description}</p>
    </article>
</body>
</html>`;

        return new Response(html, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 's-maxage=60, stale-while-revalidate',
                'X-Bot-Handler': 'true'
            }
        });

    } catch (error: any) {
        return new Response(`Error: ${error.message}`, { status: 500 });
    }
}
