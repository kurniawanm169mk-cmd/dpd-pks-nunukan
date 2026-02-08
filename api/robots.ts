export default function handler(req, res) {
    const robots = `User-agent: *
Allow: /

Sitemap: https://dpd-pks-nunukan.vercel.app/sitemap.xml
`;

    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(robots);
}
