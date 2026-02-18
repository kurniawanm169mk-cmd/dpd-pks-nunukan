// Standard Web API Response is used, no Next.js dependency needed


// Hardcoded fallback credentials to ensure immediate functionality
// In production, these should be environment variables.
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://hyzlxuitqpbfhgapovhd.supabase.co";
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5emx4dWl0cXBiZmhnYXBvdmhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzOTc4MjQsImV4cCI6MjA3OTk3MzgyNH0.Zv9Su84S7jTUSsXUoD54FE0o4gD9Zmeial2BS8poxYc";

export default async function middleware(request: Request) {
    const url = new URL(request.url);
    const userAgent = request.headers.get('user-agent') || '';

    // 1. Identify Bots (Facebook, WhatsApp, Twitter, etc.)
    const isBot = /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|whatsapp|twitterbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest\/0\.|developers.google.com\/\+\/web\/snippet|slackbot|vkShare|W3C_Validator|redditbot|Applebot|flipboard|tumblr|bitlybot|SkypeUriPreview|nuzzel|Discordbot|Google Page Speed|Qwantify|pinterest|wordpress|x-bufferbot/i.test(userAgent);

    // 2. Check if it's a News Detail URL
    // Pattern: /news/:slug
    const newsMatch = url.pathname.match(/^\/news\/([^\/]+)$/);

    if (isBot && newsMatch) {
        const slug = newsMatch[1];

        try {
            // 3. Fetch News Data from Supabase directly
            // Using direct fetch to avoid heavy client library in middleware
            // FIX: Query only by slug to avoid UUID vs Text type mismatch in 'or' filter
            let queryUrl = `${SUPABASE_URL}/rest/v1/news_items?slug=eq.${slug}&select=title,content,image_url,meta_description&limit=1`;

            // If slug looks like a UUID, we could optionally query by ID, but for social sharing it's 99% slugs.
            // keeping it simple to prevent 500 errors.

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
                    // Use meta_description if available, otherwise truncate content
                    const rawDescription = news.meta_description || news.content || '';
                    const description = rawDescription.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...';
                    const image = news.image_url ? encodeURI(news.image_url) : 'https://dpd-pks-nunukan.vercel.app/og-default.jpg';
                    const pageUrl = url.toString();

                    // 4. Construct Minimal HTML with Meta Tags
                    const html = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    
    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="DPD PKS Nunukan">
    <meta property="og:url" content="${pageUrl}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${pageUrl}">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${image}">
    
    <!-- Redirect to actual page for humans who might see this -->
    <script>window.location.href = "${pageUrl}";</script>
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
                            'Cache-Control': 'public, max-age=60', // Cache short time
                            'X-Middleware-Injected': 'true' // Debug header
                        }
                    });
                }
            } else {
                console.error("Supabase Fetch Error:", apiRes.status, apiRes.statusText);
            }
        } catch (error) {
            console.error("Middleware Error:", error);
        }
    }

    // 5. Fallback: Serve the application normally (Client-Side Rendering)
    // For bots that are NOT news pages, or if fetch fails, or for normal users
    return fetch(request);
}

export const config = {
    matcher: [
        // Match all paths except static files and APIs
        '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|assets).*)',
    ],
};
