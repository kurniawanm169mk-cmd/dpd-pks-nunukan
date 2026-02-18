import https from 'https';

const url = "https://nunukan.pks.id/api/bot-news?news=tingkatkan-kualitas-dakwah-bkap-dan-bipeka-pks-nunukan-gelar-workshop-penguatan-kompetensi-dai-dan-daiyah";

console.log(`Fetching ${url}...`);

const req = https.get(url, (res) => {
    console.log('StatusCode:', res.statusCode);
    console.log('Headers:', JSON.stringify(res.headers, null, 2));

    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log('Body:', data);
    });
});

req.on('error', (e) => {
    console.error('Error:', e);
});
