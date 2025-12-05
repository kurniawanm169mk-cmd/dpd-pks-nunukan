export default async function middleware(request: Request) {
    const url = new URL(request.url);

    // Skip static files and API routes (Manual Matcher)
    if (url.pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|json)$/) || url.pathname.startsWith('/api') || url.pathname.startsWith('/assets')) {
        return fetch(request);
    }

    const userAgent = request.headers.get('user-agent') || '';
    const isBot = /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit|whatsapp|twitterbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest\/0\.|developers.google.com\/\+\/web\/snippet|slackbot|vkShare|W3C_Validator|redditbot|Applebot|flipboard|tumblr|bitlybot|SkypeUriPreview|nuzzel|Discordbot|Google Page Speed|Qwantify|pinterest|wordpress|x-bufferbot/i.test(userAgent);
    const isHtml = request.headers.get('accept')?.includes('text/html');

    // Only intercept HTML requests from bots
    if (isBot && isHtml) {
        const prerenderToken = process.env.PRERENDER_TOKEN;

        if (!prerenderToken) {
            console.warn('PRERENDER_TOKEN is not set');
            return fetch(request);
        }

        const prerenderUrl = `https://service.prerender.io/${url.toString()}`;

        try {
            const prerenderResponse = await fetch(prerenderUrl, {
                headers: {
                    'X-Prerender-Token': prerenderToken,
                },
            });

            return prerenderResponse;
        } catch (error) {
            console.error('Error fetching from Prerender.io:', error);
            return fetch(request);
        }
    }

    // For non-bots or non-HTML requests, continue as normal
    const response = await fetch(request);
    const newHeaders = new Headers(response.headers);
    newHeaders.set('X-Middleware-Active', 'true');

    if (isBot) {
        newHeaders.set('X-Is-Bot', 'true');
    }

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
    });
}
