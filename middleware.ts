export default async function middleware(request: Request) {
    const url = new URL(request.url);

    // Serve robots.txt
    if (url.pathname === '/robots.txt') {
        return fetch(new URL('/api/robots', request.url));
    }

    // Serve sitemap.xml
    if (url.pathname === '/sitemap.xml') {
        return fetch(new URL('/api/sitemap', request.url));
    }

    // Skip static files and API routes (Manual Matcher)
    if (url.pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|json)$/) || url.pathname.startsWith('/api') || url.pathname.startsWith('/assets')) {
        return fetch(request);
    }

    const userAgent = request.headers.get('user-agent') || '';
    const isBot = /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|whatsapp|twitterbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest\/0\.|developers.google.com\/\+\/web\/snippet|slackbot|vkShare|W3C_Validator|redditbot|Applebot|flipboard|tumblr|bitlybot|SkypeUriPreview|nuzzel|Discordbot|Google Page Speed|Qwantify|pinterest|wordpress|x-bufferbot/i.test(userAgent);

    // Check if it's a news URL
    // Format: /news/:slug or /?news=:slug
    const isNewsUrl = url.pathname.startsWith('/news/');
    const newsSlug = isNewsUrl ? url.pathname.split('/')[2] : url.searchParams.get('news');

    // Intercept bot requests for news pages to serve OG tags
    if (isBot && newsSlug) {
        // Rewrite to API to generate HTML with meta tags
        const shareUrl = new URL(`/api/share/${newsSlug}`, request.url);
        return fetch(shareUrl);
    }

    return fetch(request);
}
