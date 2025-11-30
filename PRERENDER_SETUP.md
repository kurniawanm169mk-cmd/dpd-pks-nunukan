# Prerender.io Setup Guide

## Langkah-langkah Setup Prerender.io

### 1. Daftar di Prerender.io
1. Kunjungi: https://prerender.io
2. Sign up (gratis untuk 250 halaman/bulan)
3. Setelah login, copy **Prerender Token** Anda

### 2. Setup di Vercel
1. Login ke Vercel dashboard
2. Pilih project Anda
3. Go to **Settings** → **Environment Variables**
4. Tambahkan:
   - **Key**: `PRERENDER_TOKEN`
   - **Value**: [paste token dari Prerender.io]

### 3. Update vercel.json
File `vercel.json` sudah dibuat dengan konfigurasi:
- Mendeteksi crawler (WhatsApp, Telegram, Facebook, dll)
- Redirect ke Prerender.io untuk render JavaScript
- Return HTML lengkap dengan meta tags ke crawler

### 4. Deploy
```bash
# Commit changes
git add vercel.json components/PublicPage.tsx
git commit -m "Add Prerender.io support for social media preview"
git push origin main

# Deploy akan otomatis di Vercel
```

### 5. Test Preview
Setelah deploy, test preview dengan:
- **WhatsApp**: Share link berita
- **Facebook**: https://developers.facebook.com/tools/debug/
- **Twitter**: https://cards-dev.twitter.com/validator
- **LinkedIn**: https://www.linkedin.com/post-inspector/

### 6. Troubleshooting
Jika preview tidak muncul:
1. Pastikan URL yang di-share adalah production URL (bukan localhost)
2. Check Prerender dashboard untuk melihat apakah request masuk
3. Clear cache di social media platform

### Biaya
- **Free tier**: 250 halaman/bulan
- Jika traffic lebih tinggi, upgrade plan di Prerender.io

## Alternatif Jika Tidak Deploy di Vercel

Jika deploy di hosting lain, gunakan **Prerender middleware** langsung di server.

Contoh untuk **Nginx**:
```nginx
location / {
    if ($http_user_agent ~* "bot|crawler|spider|whatsapp|telegram") {
        rewrite ^(.*)$ https://service.prerender.io/https://kabarnunukan.com$1 break;
    }
    try_files $uri $uri/ /index.html;
}
```
