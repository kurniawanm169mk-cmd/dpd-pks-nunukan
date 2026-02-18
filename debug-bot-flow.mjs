import https from 'https';

const url = "https://nunukan.pks.id/news/tingkatkan-kualitas-dakwah-bkap-dan-bipeka-pks-nunukan-gelar-workshop-penguatan-kompetensi-dai-dan-daiyah";

console.log(`Testing bot rewrite for: ${url}`);

const options = {
    headers: {
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
    }
};

const req = https.get(url, options, (res) => {
    console.log('StatusCode:', res.statusCode);
    console.log('X-Bot-Handler:', res.headers['x-bot-handler'] || 'NOT SET');
    console.log('Content-Type:', res.headers['content-type']);

    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        // Check for og:title
        const ogTitle = data.match(/<meta property="og:title" content="([^"]+)"/);
        const ogImage = data.match(/<meta property="og:image" content="([^"]+)"/);
        const ogDesc = data.match(/<meta property="og:description" content="([^"]+)"/);

        console.log('\n=== OG Tags Found ===');
        console.log('og:title:', ogTitle ? ogTitle[1] : 'NOT FOUND');
        console.log('og:image:', ogImage ? ogImage[1].substring(0, 80) + '...' : 'NOT FOUND');
        console.log('og:description:', ogDesc ? ogDesc[1].substring(0, 80) + '...' : 'NOT FOUND');
    });
});

req.on('error', (e) => {
    console.error('Error:', e);
});
