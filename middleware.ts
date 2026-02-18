export default async function middleware(request: Request) {
    const url = new URL(request.url);
    const userAgent = request.headers.get('user-agent') || '';
    const isBot = /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|whatsapp|twitterbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest\/0\.|developers.google.com\/\+\/web\/snippet|slackbot|vkShare|W3C_Validator|redditbot|Applebot|flipboard|tumblr|bitlybot|SkypeUriPreview|nuzzel|Discordbot|Google Page Speed|Qwantify|pinterest|wordpress|x-bufferbot/i.test(userAgent);

    // Prerender.io Token (from environment or hardcoded as fallback for this user)
    // Note: Env vars in Vercel Edge Middleware are accessed via process.env
    const PRERENDER_TOKEN = process.env.PRERENDER_TOKEN || 'XCQfQeip7VmDmRP7FfHl';

    if (isBot) {
        // Construct the URL to forward to Prerender.io
        // request.url is the full URL including query params
        const prerenderUrl = `https://service.prerender.io/${request.url}`;

        try {
            const response = await fetch(prerenderUrl, {
                headers: {
                    'X-Prerender-Token': PRERENDER_TOKEN,
                    'User-Agent': userAgent // Forward the original UA
                }
            });

            if (response.ok) {
                const html = await response.text();
                // Ensure we don't return empty HTML (Prerender failure)
                if (html && html.length > 500) {
                    return new Response(html, {
                        headers: {
                            'Content-Type': 'text/html; charset=utf-8',
                            'Cache-Control': 'public, max-age=600' // Cache for 10 mins
                        }
                    });
                }
            }
        } catch (e) {
            console.error('Prerender error:', e);
            // Fallback to normal rendering if Prerender fails
        }
    }

    // Allow request to continue (return undefined or fetch(request) depending on runtime, 
    // but for Vercel Middleware simply returning nothing or fetching original passes it through)
    // However, Vercel Edge Middleware expects a Response object or check Vercel docs.
    // Standard pattern: return fetch(request)
    return fetch(request);
}

export const config = {
    matcher: [
        // Match all paths except static files and APIs
        '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|assets).*)',
    ],
};
