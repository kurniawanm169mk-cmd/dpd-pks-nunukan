import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    const { slug } = req.query;

    // Initialize Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch news item
    let newsItem = null;

    // Try fetching by slug first
    let { data } = await supabase
        .from('news_items')
        .select('*')
        .eq('slug', slug)
        .single();

    newsItem = data;

    // If not found by slug, try by ID (fallback for old links)
    if (!newsItem) {
        const { data: byId } = await supabase
            .from('news_items')
            .select('*')
            .eq('id', slug)
            .single();
        newsItem = byId;
    }

    if (!newsItem) {
        return res.redirect('/');
    }

    // Prepare metadata
    const title = newsItem.title;
    const description = newsItem.content.substring(0, 160) + '...';
    const imageUrl = newsItem.imageUrl || (newsItem.images && newsItem.images[0]) || 'https://dpd-pks-nunukan.vercel.app/og-default.jpg';
    const url = `https://dpd-pks-nunukan.vercel.app/news/${slug}`;

    // Return HTML with meta tags
    const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <meta name="description" content="${description}">
      
      <!-- Open Graph / Facebook / WhatsApp -->
      <meta property="og:type" content="article">
      <meta property="og:title" content="${title}">
      <meta property="og:description" content="${description}">
      <meta property="og:image" content="${imageUrl}">
      <meta property="og:url" content="${url}">
      <meta property="og:site_name" content="DPD PKS Nunukan">
      
      <!-- Twitter -->
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:title" content="${title}">
      <meta name="twitter:description" content="${description}">
      <meta name="twitter:image" content="${imageUrl}">
      
      <!-- Redirect to actual app -->
      <script>
        window.location.href = "/?news=${newsItem.slug || newsItem.id}";
      </script>
    </head>
    <body>
      <h1>${title}</h1>
      <p>${description}</p>
      <img src="${imageUrl}" alt="${title}" style="max-width: 100%;">
      <p>Redirecting to full article...</p>
    </body>
    </html>
  `;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
}
