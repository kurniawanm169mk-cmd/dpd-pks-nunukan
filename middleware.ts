import { NextResponse } from 'next/server';

// Standard Web API Response is used, no Next.js dependency needed but typical Vercel examples use NextResponse. 
// However, in a pure Vite/Vercel Output setup, standard Response is safer.
// Let's stick to standard Response to avoid import errors.

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
    // Pattern A: /news/:slug
    // Pattern B: /?news=:slug (Query Param)
    const newsMatch = url.pathname.match(/^\/news\/([^\/]+)$/);
    const newsQuery = url.searchParams.get('news');

    const slug = newsMatch ? newsMatch[1] : newsQuery;

    // DEBUG: Inject headers to see why it might be skipping
    // specific header for bot detection
    const debugHeaders = {
        'X-Mw-Bot': isBot.toString(),
        'X-Mw-Path': url.pathname,
        'X-Mw-Slug': slug || 'null'
    };

    if (isBot && slug) {
        try {
            // 3. Fetch News Data from Supabase directly
            // Using direct fetch to avoid heavy client library in middleware
            // Query only by slug to avoid UUID vs Text type mismatch in 'or' filter
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
                            'X-Middleware-Injected': 'true', // Debug header
                            'X-Mw-Bot': isBot.toString(),
                            'X-Mw-Slug': slug || 'null'
                        }
                    });
                } else {
                    // Data empty
                    const res = await fetch(request);
                    const newRes = new Response(res.body, res);
                    newRes.headers.set('X-Mw-Error', 'No Data Found');
                    newRes.headers.set('X-Mw-Bot', isBot.toString());
                    return newRes;
                }
            } else {
                console.error("Supabase Fetch Error:", apiRes.status, apiRes.statusText);
                const res = await fetch(request);
                const newRes = new Response(res.body, res);
                newRes.headers.set('X-Mw-Error', `Supabase ${apiRes.status}`);
                newRes.headers.set('X-Mw-Bot', isBot.toString());
                return newRes;
            }
        } catch (error: any) {
            console.error("Middleware Error:", error);
            const res = await fetch(request);
            const newRes = new Response(res.body, res);
            newRes.headers.set('X-Mw-Error', `Exception: ${error.message}`);
            newRes.headers.set('X-Mw-Bot', isBot.toString());
            return newRes;
        }
    }

    // 5. Fallback: Serve the application normally (Client-Side Rendering)
    // For bots that are NOT news pages, or if fetch fails, or for normal users

    // Add debug headers to normal response too for tracing
    const response = await fetch(request);
    const newRes = new Response(response.body, response);

    // Clean headers for production, but kept here for debugging this issue
    newRes.headers.set('X-Mw-Bot', isBot.toString());
    if (slug) newRes.headers.set('X-Mw-Slug', slug);

    return newRes;
}

export const config = {
    matcher: [
        // Match all paths except static files and APIs
        '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|assets).*)',
    ],
};
