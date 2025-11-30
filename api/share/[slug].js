import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    const { slug } = req.query;

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return res.status(500).send('Server configuration error');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // Fetch news from Supabase
        const { data: news, error } = await supabase
            .from('news_items')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error || !news) {
            // Redirect to home if news not found
            return res.redirect(307, 'https://dpd-pks-nunukan.vercel.app');
        }

        // Get first image or fallback
        const imageUrl = news.images && news.images.length > 0
            ? news.images[0]
            : news.image_url || 'https://dpd-pks-nunukan.vercel.app/default-og-image.jpg';

        // Truncate description
        const description = news.content
            ? news.content.substring(0, 160) + '...'
            : 'Berita terbaru dari DPD PKS Nunukan';

        // Generate HTML with Open Graph meta tags
        const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${news.title} - DPD PKS Nunukan</title>
  
  <!-- Open Graph Meta Tags for WhatsApp/Facebook -->
  <meta property="og:title" content="${news.title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:url" content="https://dpd-pks-nunukan.vercel.app/api/share/${slug}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="DPD PKS Nunukan">
  
  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${news.title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
  
  <!-- Auto redirect for human users (not crawlers) -->
  <script>
    // Check if user agent is NOT a bot
    var userAgent = navigator.userAgent.toLowerCase();
    var isCrawler = /bot|crawler|spider|whatsapp|telegram|facebook|twitter|linkedin|pinterest|slack/i.test(userAgent);
    
    if (!isCrawler) {
      // Redirect human users to the main Vite app
      window.location.href = "https://dpd-pks-nunukan.vercel.app?news=${slug}";
    }
  </script>
  
  <!-- Fallback meta refresh for users with JavaScript disabled -->
  <meta http-equiv="refresh" content="2;url=https://dpd-pks-nunukan.vercel.app?news=${slug}">
  
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 2rem;
      max-width: 600px;
    }
    h1 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
    .loader {
      border: 4px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top: 4px solid white;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 2rem auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    a {
      color: white;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${news.title}</h1>
    <div class="loader"></div>
    <p>Mohon tunggu, mengalihkan ke berita...</p>
    <p><a href="https://dpd-pks-nunukan.vercel.app?news=${slug}">Klik di sini jika tidak teralihkan</a></p>
  </div>
</body>
</html>
    `;

        // Set proper headers
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');

        return res.status(200).send(html);

    } catch (error) {
        console.error('Error fetching news:', error);
        return res.redirect(307, 'https://dpd-pks-nunukan.vercel.app');
    }
}
