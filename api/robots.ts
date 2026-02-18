export const config = {
    runtime: 'edge',
};

export default function handler(request: Request) {
    const robots = `User-agent: *
Allow: /

# Sitemap
Sitemap: https://nunukan.pks.id/sitemap.xml
`;

    return new Response(robots, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 's-maxage=86400',
        }
    });
}
