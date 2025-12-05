export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - assets (static assets)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
    ],
};

export default async function middleware(request: Request) {
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

        const url = new URL(request.url);
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
    return fetch(request);
}
