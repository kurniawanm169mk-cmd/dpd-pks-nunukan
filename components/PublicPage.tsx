import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useConfig } from '../contexts/ConfigContext';
import { Menu, X, Facebook, Twitter, Instagram, Mail, MapPin, Phone, ArrowRight, ChevronRight, Lock, LogIn, Youtube, Linkedin, Globe, Link as LinkIcon, Music, ArrowLeft, Calendar, Search, Star, Share2, Quote, ChevronLeft } from 'lucide-react';
import { NewsItem, TeamMember } from '../types';

type ViewState = 'home' | 'news-detail' | 'team-detail' | 'news-list';

const PublicPage: React.FC = () => {
  const { config, isAdmin, toggleAdmin, login } = useConfig();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Login Modal State
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Routing State
  const [view, setView] = useState<ViewState>('home');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NewsItem[]>([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [newsImageSlide, setNewsImageSlide] = useState(0);

  // Dynamic browser tab branding - update title and favicon
  useEffect(() => {
    if (config.identity.name) {
      document.title = config.identity.name;
    }

    if (config.identity.logoUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = config.identity.logoUrl;
    }
  }, [config.identity.name, config.identity.logoUrl]);

  // Handle URL Params for Deep Linking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const newsSlug = params.get('news');
    if (newsSlug && config.news.length > 0) {
      const newsItem = config.news.find(n => n.slug === newsSlug || n.id === newsSlug);
      if (newsItem) {
        navigateToNews(newsItem);
      }
    }
  }, [config.news]);

  // Search Logic
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }
    const lowerQuery = searchQuery.toLowerCase();
    const results = config.news.filter(item =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.content.toLowerCase().includes(lowerQuery) ||
      item.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
    setSearchResults(results);
  }, [searchQuery, config.news]);

  // Hero Auto-slide Effect
  useEffect(() => {
    const images = config.hero.images || (config.hero.imageUrl ? [config.hero.imageUrl] : []);
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [config.hero.images, config.hero.imageUrl]);

  // Helper function to update meta tags for social media preview
  const updateMetaTag = (property: string, content: string) => {
    let tag = document.querySelector(`meta[property="${property}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('property', property);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  };

  // Update meta tags when news detail is viewed (for Prerender.io/social media crawlers)
  useEffect(() => {
    if (view === 'news-detail' && selectedNews) {
      // Update page title
      document.title = `${selectedNews.title} - ${config.identity.name}`;

      // Update Open Graph meta tags for social media preview
      updateMetaTag('og:title', selectedNews.title);
      updateMetaTag('og:description', selectedNews.content.substring(0, 160) + '...');
      updateMetaTag('og:image', selectedNews.imageUrl);
      updateMetaTag('og:url', window.location.href);
      updateMetaTag('og:type', 'article');

      // Twitter Card tags
      updateMetaTag('twitter:card', 'summary_large_image');
      updateMetaTag('twitter:title', selectedNews.title);
      updateMetaTag('twitter:description', selectedNews.content.substring(0, 160) + '...');
      updateMetaTag('twitter:image', selectedNews.imageUrl);
    } else if (view === 'home') {
      // Reset to default meta tags when returning home
      document.title = config.identity.name;
      updateMetaTag('og:title', config.identity.name);
      updateMetaTag('og:description', config.identity.tagline || 'Dewan Pimpinan Daerah');
      updateMetaTag('og:image', config.identity.logoUrl || '');
      updateMetaTag('og:url', window.location.origin);
      updateMetaTag('og:type', 'website');
    }
  }, [view, selectedNews, config.identity.name, config.identity.tagline, config.identity.logoUrl]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(usernameInput, passwordInput);
    if (success) {
      setIsLoginOpen(false);
      setUsernameInput('');
      setPasswordInput('');
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const navigateToHome = () => {
    setView('home');
    setSelectedNews(null);
    setSelectedMember(null);
    setSearchQuery('');
    // Clear URL param
    window.history.pushState({}, '', window.location.pathname);

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTop = 0;
    }, 0);
  };

  const navigateToNews = (item: NewsItem) => {
    setSelectedNews(item);
    setView('news-detail');
    setNewsImageSlide(0);
    // Update URL with slug
    const slug = item.slug || item.id;
    const newUrl = `${window.location.pathname}?news=${slug}`;
    window.history.pushState({ path: newUrl }, '', newUrl);

    setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 0);
  };

  const navigateToNewsList = () => {
    setView('news-list');
    setCurrentPage(1);
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 0);
  };

  const navigateToTeam = (member: TeamMember) => {
    setSelectedMember(member);
    setView('team-detail');
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 0);
  };

  const copyNewsLink = () => {
    if (selectedNews) {
      const slug = selectedNews.slug || selectedNews.id;
      // Use the new /news/slug format for sharing
      const url = `${window.location.origin}/news/${slug}`;
      navigator.clipboard.writeText(url).then(() => {
        alert('Link berita berhasil disalin!');
      });
    }
  };

  // Dynamic Styles derived from config
  const roundedClass = {
    'none': 'rounded-none',
    'sm': 'rounded-sm',
    'md': 'rounded-md',
    'lg': 'rounded-lg',
    'xl': 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
  }[config.theme.rounded];

  const fontStyle = { fontFamily: config.theme.fontFamily };

  // Icon mapping
  const getSocialIcon = (platform: string, size: number = 20) => {
    switch (platform) {
      case 'Facebook': return <Facebook size={size} />;
      case 'Twitter': return <Twitter size={size} />;
      case 'Instagram': return <Instagram size={size} />;
      case 'Youtube': return <Youtube size={size} />;
      case 'LinkedIn': return <Linkedin size={size} />;
      case 'TikTok': return <Music size={size} />;
      default: return <LinkIcon size={size} />;
    }
  };

  // Filtered News Logic
  const featuredNews = config.news.filter(n => n.isFeatured);
  const regularNews = config.news.filter(n => !n.isFeatured).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const homeNews = regularNews.slice(0, 4);

  // Pagination Logic
  const totalPages = Math.ceil(regularNews.length / ITEMS_PER_PAGE);
  const paginatedNews = regularNews.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div style={fontStyle} className="min-h-screen flex flex-col relative text-gray-800">
      <style>{`
        .btn-custom {
            background-color: var(--color-btn) !important;
            color: white !important;
        }
        .btn-custom:hover {
            background-color: var(--color-btn-hover) !important;
        }
      `}</style>

      {/* Login Modal */}
      {isLoginOpen && !isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`bg-white p-8 w-full max-w-sm shadow-2xl relative ${roundedClass}`}>
            <button onClick={() => setIsLoginOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
            <div className="text-center mb-6">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-primary"><Lock size={24} /></div>
              <h3 className="text-xl font-bold text-gray-800">Login</h3>
            </div>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <input type="text" placeholder="Username" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} autoFocus />
              <input type="password" placeholder="Password" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
              {loginError && <p className="text-red-500 text-xs mt-1">Username atau Password salah.</p>}
              <button type="submit" className={`w-full py-3 btn-custom font-semibold transition shadow-lg flex items-center justify-center gap-2 ${roundedClass}`}><LogIn size={18} /> Masuk</button>
            </form>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className={`${config.header?.isSticky ? 'sticky top-0 z-30 shadow-md backdrop-blur-md' : 'relative border-b'} transition-all duration-300`} style={{ backgroundColor: config.header?.backgroundColor || '#ffffff', color: config.header?.textColor || '#111827' }}>
        <div className="container mx-auto px-6 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer flex-shrink-0" onClick={navigateToHome}>
            {config.identity.logoUrl && <img src={config.identity.logoUrl} alt="Logo" className="h-10 w-auto object-contain" />}
            <div>
              <h1 className="text-base sm:text-xl font-bold leading-tight">{config.identity.name}</h1>
              {config.identity.tagline && <p className="text-[10px] sm:text-xs opacity-80 font-medium">{config.identity.tagline}</p>}
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden md:block relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari berita, tagar..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/50 outline-none transition text-sm text-gray-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            {/* Search Results Dropdown */}
            {searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-80 overflow-y-auto z-50">
                {searchResults.length > 0 ? (
                  searchResults.map(result => (
                    <div key={result.id} onClick={() => { navigateToNews(result); setSearchQuery(''); }} className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-0">
                      <h4 className="font-bold text-sm text-gray-800">{result.title}</h4>
                      <p className="text-xs text-gray-500 line-clamp-1">{result.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">Tidak ada hasil ditemukan.</div>
                )}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button onClick={navigateToHome} className="hover:text-primary transition">Beranda</button>
            <button onClick={() => { navigateToHome(); setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 100) }} className="hover:text-primary transition">Tentang</button>
            <button onClick={() => { navigateToHome(); setTimeout(() => document.getElementById('news')?.scrollIntoView({ behavior: 'smooth' }), 100) }} className="hover:text-primary transition">Kegiatan</button>
            <button onClick={() => { navigateToHome(); setTimeout(() => document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' }), 100) }} className="hover:text-primary transition">Struktur</button>
            <a href="#contact" className="px-5 py-2.5 btn-custom rounded-full transition shadow-lg">{config.contact.phone ? "Hubungi Kami" : "Bergabung"}</a>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 opacity-80 hover:opacity-100">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white text-gray-900 border-t p-6 space-y-4 shadow-xl absolute w-full z-40">
            <input type="text" placeholder="Cari..." className="w-full p-2 border rounded-lg mb-4" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            {/* Mobile Search Results */}
            {searchQuery && searchResults.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-2 mb-4 max-h-40 overflow-y-auto">
                {searchResults.map(result => (
                  <div key={result.id} onClick={() => { navigateToNews(result); setSearchQuery(''); setMobileMenuOpen(false); }} className="p-2 border-b last:border-0 text-sm">
                    {result.title}
                  </div>
                ))}
              </div>
            )}
            <button className="block w-full text-left py-2 hover:text-primary" onClick={() => { setMobileMenuOpen(false); navigateToHome(); }}>Beranda</button>
            <button className="block w-full text-left py-2 hover:text-primary" onClick={() => { setMobileMenuOpen(false); navigateToHome(); setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 100) }}>Tentang</button>
            <button className="block w-full text-left py-2 hover:text-primary" onClick={() => { setMobileMenuOpen(false); navigateToHome(); setTimeout(() => document.getElementById('news')?.scrollIntoView({ behavior: 'smooth' }), 100) }}>Kegiatan</button>
            <button className="block w-full text-left py-2 hover:text-primary" onClick={() => { setMobileMenuOpen(false); navigateToHome(); setTimeout(() => document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' }), 100) }}>Struktur</button>
          </div>
        )}
      </nav>

      {/* Main Content */}
      {view === 'home' && (
        <>
          {/* Hero Section */}
          <section id="home" className="relative pt-20 pb-32 overflow-hidden transition-colors" style={{ backgroundColor: config.hero.backgroundColor || '#ffffff', color: config.hero.textColor || '#111827' }}>
            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 animate-fadeIn relative z-10">
                <h2 className="text-5xl md:text-6xl font-extrabold leading-tight">{config.hero.title}</h2>
                <p className="text-xl opacity-90 leading-relaxed">{config.hero.subtitle}</p>
                <div className="flex gap-4">
                  <a href={config.hero.ctaButtonLink || '#contact'} className={`px-8 py-4 btn-custom font-semibold shadow-xl transition flex items-center gap-2 ${roundedClass}`}>{config.hero.ctaText} <ArrowRight size={20} /></a>
                  <button className={`px-8 py-4 bg-transparent border-2 border-current font-semibold hover:bg-black/5 transition ${roundedClass}`}>Pelajari Lebih Lanjut</button>
                </div>
              </div>
              <div className="relative">
                <div className={`absolute inset-0 bg-primary/10 -rotate-6 scale-95 ${roundedClass}`}></div>
                <div className={`relative z-10 w-full aspect-[4/3] overflow-hidden shadow-2xl ${roundedClass}`}>
                  {(() => {
                    const images = config.hero.images && config.hero.images.length > 0 ? config.hero.images : (config.hero.imageUrl ? [config.hero.imageUrl] : []);
                    if (images.length === 0) return <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>;
                    return (
                      <>
                        {images.map((img, idx) => (
                          <img key={idx} src={img} alt={`Hero ${idx + 1}`} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`} />
                        ))}
                        {images.length > 1 && (
                          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                            {images.map((_, idx) => (
                              <button key={idx} onClick={() => setCurrentSlide(idx)} className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'}`} />
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </section>

          {/* About Section */}
          <section id="about" className="py-20 transition-colors" style={{ backgroundColor: config.about.backgroundColor || '#f9fafb', color: config.about.textColor || '#111827' }}>
            <div className="container mx-auto px-6">
              <div className={`bg-white p-8 md:p-12 shadow-sm ${roundedClass}`} style={{ color: '#111827' }}>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  {config.about.imageUrl && <img src={config.about.imageUrl} alt="About" className={`w-full h-96 object-cover ${roundedClass}`} />}
                  <div className="space-y-6">
                    <span className="text-primary font-bold tracking-wider text-sm uppercase">Tentang Kami</span>
                    <h3 className="text-3xl font-bold">{config.about.title}</h3>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{config.about.content}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* News Section */}
          <section id="news" className="py-20 transition-colors" style={{ backgroundColor: config.newsBackgroundColor || '#f9fafb', color: config.newsTextColor || '#111827' }}>
            <div className="container mx-auto px-6">
              <div className="flex justify-between items-end mb-12">
                <div>
                  <h3 className="text-3xl font-bold mb-2">{config.sectionTitles?.news || 'Berita & Kegiatan'}</h3>
                  <p className="opacity-80">Update terbaru dari pergerakan kami.</p>
                </div>
                <button onClick={navigateToNewsList} className="hidden md:flex items-center gap-1 text-primary font-semibold hover:gap-2 transition-all">Lihat Semua <ChevronRight size={18} /></button>
              </div>

              {/* Featured News */}
              {featuredNews.length > 0 && (
                <div className="mb-12">
                  <h4 className="text-xl font-bold mb-6 flex items-center gap-2 text-yellow-600"><Star fill="currentColor" size={20} /> Berita Pilihan</h4>
                  <div className="grid md:grid-cols-2 gap-8">
                    {featuredNews.map(item => (
                      <article key={item.id} className={`bg-white text-gray-800 shadow-lg hover:shadow-xl transition duration-300 ${roundedClass} overflow-hidden flex flex-col cursor-pointer border-2 border-yellow-400/30`} onClick={() => navigateToNews(item)}>
                        <div className="h-64 overflow-hidden relative">
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition duration-700" />
                          <div className="absolute top-4 left-4 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><Star size={10} fill="currentColor" /> FEATURED</div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                          <div className="text-xs text-gray-500 mb-2 font-medium flex items-center gap-2"><Calendar size={12} /> {item.date}</div>
                          <h4 className="text-2xl font-bold mb-3 hover:text-primary transition">{item.title}</h4>
                          <p className="text-gray-600 line-clamp-2 mb-4">{item.content}</p>
                          <span className="text-primary font-semibold text-sm mt-auto inline-flex items-center gap-1">Baca Selengkapnya <ArrowRight size={14} /></span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {/* Regular News Grid (Limit 4) */}
              <div className="grid md:grid-cols-4 gap-6">
                {homeNews.map((item) => (
                  <article key={item.id} className={`bg-white text-gray-800 hover:-translate-y-1 transition duration-300 shadow-sm hover:shadow-xl ${roundedClass} overflow-hidden flex flex-col cursor-pointer`} onClick={() => navigateToNews(item)}>
                    <div className="h-48 overflow-hidden">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="text-xs text-gray-500 mb-2 font-medium flex items-center gap-2"><Calendar size={12} /> {item.date}</div>
                      <h4 className="text-lg font-bold mb-2 line-clamp-2 hover:text-primary transition">{item.title}</h4>
                      <p className="text-gray-600 text-xs line-clamp-3 mb-3 flex-1">{item.content}</p>
                      <span className="text-primary font-semibold text-xs mt-auto inline-flex items-center gap-1">Baca <ArrowRight size={12} /></span>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-8 text-center md:hidden">
                <button onClick={navigateToNewsList} className="btn-custom px-6 py-3 rounded-full font-semibold shadow-md w-full">Lihat Semua Berita</button>
              </div>
            </div>
          </section>

          {/* Media Quotes Section */}
          {config.mediaQuotes && config.mediaQuotes.length > 0 && (
            <section className="py-16 bg-white">
              <div className="container mx-auto px-6">
                <h3 className="text-2xl font-bold mb-8 text-center">Kutipan Media</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {config.mediaQuotes.map(quote => (
                    <div key={quote.id} className="bg-gray-50 p-6 rounded-xl border border-gray-100 relative flex flex-col">
                      <Quote className="text-primary/20 absolute top-4 right-4" size={40} />

                      {/* Image if provided */}
                      {quote.imageUrl && (
                        <div className="mb-4">
                          <img
                            src={quote.imageUrl}
                            alt={quote.source}
                            className="w-full h-40 object-cover rounded-lg"
                          />
                        </div>
                      )}

                      <p className="text-gray-700 italic mb-4 relative z-10">"{quote.content}"</p>
                      <div className="flex items-center gap-3 mt-auto">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs">
                          {quote.source.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900">{quote.source}</p>
                          {quote.author && <p className="text-xs text-gray-500">{quote.author}</p>}
                        </div>
                      </div>
                      {quote.url && (
                        <a href={quote.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline mt-3 block">Baca Sumber &rarr;</a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Team/Structure Section (Moved Below News) */}
          <section id="team" className="py-20 transition-colors" style={{ backgroundColor: config.teamBackgroundColor || '#ffffff', color: config.teamTextColor || '#111827' }}>
            <div className="container mx-auto px-6">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <h3 className="text-3xl font-bold mb-4">{config.sectionTitles?.structure || 'Struktur Organisasi'}</h3>
                <p className="opacity-80">Para pemimpin yang berdedikasi untuk membawa perubahan positif.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {config.team.map((member) => (
                  <div key={member.id} className="group text-center cursor-pointer" onClick={() => navigateToTeam(member)}>
                    <div className={`relative overflow-hidden mb-4 bg-gray-100 aspect-square ${roundedClass}`}>
                      {member.photoUrl && <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-medium">Lihat Profil</div>
                    </div>
                    <h4 className="text-lg font-bold" style={{ color: config.teamTextColor || 'inherit' }}>{member.name}</h4>
                    <p className="font-medium text-sm opacity-80" style={{ color: config.teamTextColor || 'inherit' }}>{member.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* News List View (Pagination) */}
      {view === 'news-list' && (
        <div className="py-12 bg-gray-50 flex-1">
          <div className="container mx-auto px-6">
            <button onClick={navigateToHome} className="mb-8 flex items-center gap-2 text-gray-600 hover:text-primary font-medium transition"><ArrowLeft size={20} /> Kembali ke Beranda</button>
            <h2 className="text-3xl font-bold mb-8">Semua Berita & Kegiatan</h2>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {paginatedNews.map((item) => (
                <article key={item.id} className={`bg-white text-gray-800 hover:-translate-y-1 transition duration-300 shadow-sm hover:shadow-xl ${roundedClass} overflow-hidden flex flex-col cursor-pointer`} onClick={() => navigateToNews(item)}>
                  <div className="h-56 overflow-hidden">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="text-xs text-gray-500 mb-2 font-medium flex items-center gap-2"><Calendar size={12} /> {item.date}</div>
                    <h4 className="text-xl font-bold mb-3 line-clamp-2 hover:text-primary transition">{item.title}</h4>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">{item.content}</p>
                    <span className="text-primary font-semibold text-sm mt-auto inline-flex items-center gap-1">Baca Selengkapnya <ArrowRight size={14} /></span>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronLeft size={20} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-bold transition ${currentPage === page ? 'bg-primary text-white' : 'bg-white border hover:bg-gray-50'}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* News Detail View */}
      {view === 'news-detail' && selectedNews && (
        <div className="py-12 bg-gray-50 flex-1">
          {/* Dynamic Meta Tags for Social Sharing */}
          <Helmet>
            <title>{selectedNews.title} - DPD PKS Nunukan</title>
            <meta name="description" content={selectedNews.content.substring(0, 160) + '...'} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="article" />
            <meta property="og:title" content={selectedNews.title} />
            <meta property="og:description" content={selectedNews.content.substring(0, 200)} />
            <meta property="og:image" content={selectedNews.imageUrl || (selectedNews.images && selectedNews.images[0]) || ''} />
            <meta property="og:url" content={`${window.location.origin}${window.location.pathname}?news=${selectedNews.slug || selectedNews.id}`} />
            <meta property="og:site_name" content="DPD PKS Nunukan" />
            <meta property="article:published_time" content={selectedNews.date} />
            {selectedNews.tags && selectedNews.tags.map(tag => (
              <meta key={tag} property="article:tag" content={tag} />
            ))}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={selectedNews.title} />
            <meta name="twitter:description" content={selectedNews.content.substring(0, 200)} />
            <meta name="twitter:image" content={selectedNews.imageUrl || (selectedNews.images && selectedNews.images[0]) || ''} />
          </Helmet>

          <div className="container mx-auto px-6">
            <button onClick={navigateToHome} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-primary font-medium transition"><ArrowLeft size={20} /> Kembali ke Beranda</button>
            <article className={`bg-white p-8 md:p-12 shadow-md ${roundedClass}`}>
              <div className="mb-8">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-semibold text-primary block">{selectedNews.date}</span>
                  <button onClick={copyNewsLink} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition border px-3 py-1 rounded-full">
                    <Share2 size={14} /> Salin Link
                  </button>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">{selectedNews.title}</h1>

                {/* Image Carousel */}
                <div className="mb-8 relative group">
                  {(() => {
                    const allImages = [selectedNews.imageUrl, ...(selectedNews.images || [])].filter(Boolean);
                    return (
                      <div className="relative overflow-hidden rounded-xl bg-gray-100">
                        <div className="aspect-video relative">
                          <img src={allImages[newsImageSlide]} alt="News Detail" className="w-full h-full object-contain bg-black/5" />
                        </div>

                        {allImages.length > 1 && (
                          <>
                            <button onClick={() => setNewsImageSlide(prev => (prev === 0 ? allImages.length - 1 : prev - 1))} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white shadow-lg"><ChevronLeft size={24} /></button>
                            <button onClick={() => setNewsImageSlide(prev => (prev + 1) % allImages.length)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white shadow-lg"><ChevronRight size={24} /></button>
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                              {allImages.map((_, idx) => (
                                <button key={idx} onClick={() => setNewsImageSlide(idx)} className={`w-2 h-2 rounded-full transition-all ${idx === newsImageSlide ? 'bg-primary w-6' : 'bg-gray-300'}`} />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedNews.content}
                </div>

                {selectedNews.tags && selectedNews.tags.length > 0 && (
                  <div className="mt-8 pt-6 border-t flex gap-2 flex-wrap">
                    {selectedNews.tags.map((tag, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          </div>
        </div>
      )}

      {/* Team Detail View */}
      {view === 'team-detail' && selectedMember && (
        <div className="py-12 bg-gray-50 flex-1">
          <div className="container mx-auto px-6">
            <button onClick={navigateToHome} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-primary font-medium transition"><ArrowLeft size={20} /> Kembali ke Beranda</button>
            <div className={`bg-white p-8 md:p-12 shadow-md ${roundedClass}`}>
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <img src={selectedMember.photoUrl} alt={selectedMember.name} className={`w-full md:w-80 h-80 object-cover bg-gray-100 ${roundedClass}`} />
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{selectedMember.name}</h1>
                  <p className="text-xl text-primary font-medium mb-6">{selectedMember.role}</p>
                  <h3 className="text-lg font-bold border-b pb-2 mb-4">Profil Singkat</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">{selectedMember.description || "Belum ada deskripsi profil untuk anggota ini."}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer id="contact" className="pt-20 pb-10 transition-colors duration-300" style={{ backgroundColor: config.footer?.backgroundColor || '#111827', color: config.footer?.textColor || '#ffffff' }}>
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                {config.identity.logoUrl && <img src={config.identity.logoUrl} alt="Logo White" className="h-10 w-auto object-contain brightness-0 invert" />}
                <span className="text-2xl font-bold">{config.identity.name}</span>
              </div>
              <p className="opacity-70 leading-relaxed">{config.identity.tagline || "Membangun masa depan yang lebih baik bersama-sama."}</p>
              <div className="flex gap-4">
                {config.socialMedia && config.socialMedia.map((social) => (
                  <a key={social.id} href={social.url} target="_blank" rel="noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-primary hover:text-white transition flex items-center justify-center" title={social.platform} style={{ color: social.iconColor || 'white' }}>
                    {social.iconUrl ? <img src={social.iconUrl || undefined} alt={social.platform} className="w-5 h-5 object-contain" style={{ filter: social.iconColor ? 'none' : 'invert(1)' }} /> : getSocialIcon(social.platform)}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h5 className="text-lg font-bold mb-6">Kontak</h5>
              <div className="space-y-4 opacity-70">
                <div className="flex items-start gap-3"><MapPin size={20} className="text-primary shrink-0" /><span>{config.contact.address}</span></div>
                <div className="flex items-center gap-3"><Mail size={20} className="text-primary shrink-0" /><span>{config.contact.email}</span></div>
                <div className="flex items-center gap-3"><Phone size={20} className="text-primary shrink-0" /><span>{config.contact.phone}</span></div>
              </div>
            </div>
            <div>
              <h5 className="text-lg font-bold mb-6">Bergabung</h5>
              <p className="opacity-70 mb-4">{config.footer?.description || "Jadilah bagian dari perubahan."}</p>
              <a href={config.registration?.url || "#contact"} className={`block w-full text-center py-3 font-bold transition ${roundedClass}`} style={{ backgroundColor: config.registration?.buttonColor || '#2563eb', color: config.registration?.buttonTextColor || '#ffffff' }}>{config.registration?.buttonText || "Daftar Sekarang"}</a>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm opacity-60">
            <div>&copy; {new Date().getFullYear()} {config.identity.name}. {config.footer?.copyrightText || "All rights reserved."}</div>
            <div className="mt-4 md:mt-0">
              {!isAdmin ? (
                <button onClick={() => setIsLoginOpen(true)} className="flex items-center gap-2 hover:text-white transition cursor-pointer"><Lock size={14} /> Admin</button>
              ) : (
                <span className="text-green-400 font-semibold flex items-center gap-2"><Lock size={14} /> Logged in</span>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicPage;