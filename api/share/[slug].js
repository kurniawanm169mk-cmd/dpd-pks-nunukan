import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const { slug } = req.query;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).send('Server configuration error');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Fetch Site Config for Base URL
    const { data: settings } = await supabase
      .from('site_settings')
      .select('identity')
      .single();

    const baseUrl = settings?.identity?.siteUrl || 'https://dpd-pks-nunukan.vercel.app';

    // 2. Fetch News Item
    const { data: news, error } = await supabase
      .from('news_items')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !news) {
      return res.redirect(307, baseUrl);
    }

    const imageUrl = news.images && news.images.length > 0
      ? news.images[0]
      : news.image_url || `${baseUrl}/default-og-image.jpg`;

    const description = news.content
      ? news.content.substring(0, 160).replace(/<[^>]*>?/gm, '') + '...'
      : 'Berita terbaru.';

    const fullUrl = `${baseUrl}/news/${slug}`;

    const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${news.title} ${settings?.identity?.name ? `- ${settings.identity.name}` : ''}</title>
  
  <meta property="og:title" content="${news.title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:url" content="${fullUrl}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="${settings?.identity?.name || 'Portal Berita'}">
  
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${news.title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
  
  <script>
    var userAgent = navigator.userAgent.toLowerCase();
    var isCrawler = /bot|crawler|spider|whatsapp|telegram|facebook|twitter|linkedin|pinterest|slack/i.test(userAgent);
    
    if (!isCrawler) {
      window.location.href = "${baseUrl}?news=${slug}";
    }
  </script>
  
  <meta http-equiv="refresh" content="2;url=${baseUrl}?news=${slug}">
  
  <style>
    body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f0f2f5; color: #333; text-align: center; padding: 20px; }
    .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 500px; width: 100%; }
    h1 { font-size: 1.25rem; margin-bottom: 1rem; }
    p { color: #666; margin-bottom: 1.5rem; }
    .loader { border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="card">
    <div class="loader"></div>
    <h1>${news.title}</h1>
    <p>Sedang mengalihkan ke artikel lengkap...</p>
    <a href="${baseUrl}?news=${slug}" style="color: #3498db; text-decoration: none; font-size: 0.875rem;">Klik di sini jika tidak otomatis</a>
  </div>
</body>
</html>
        `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate'); // Cache for 1 min
    return res.status(200).send(html);

  } catch (error) {
    console.error('Error:', error);
    return res.redirect(307, 'https://dpd-pks-nunukan.vercel.app');
  }
}
