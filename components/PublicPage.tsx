import React, { useState, useEffect } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { Menu, X, Facebook, Twitter, Instagram, Mail, MapPin, Phone, ArrowRight, ChevronRight, Lock, LogIn, Youtube, Linkedin, Globe, Link as LinkIcon, Music, ArrowLeft, Calendar } from 'lucide-react';
import { NewsItem, TeamMember } from '../types';

type ViewState = 'home' | 'news-detail' | 'team-detail';

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

  // Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Dynamic browser tab branding - update title and favicon
  useEffect(() => {
    // Update document title
    if (config.identity.name) {
      document.title = config.identity.name;
    }

    // Update favicon
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

  // Hero Auto-slide Effect
  useEffect(() => {
    const images = config.hero.images || (config.hero.imageUrl ? [config.hero.imageUrl] : []);
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [config.hero.images, config.hero.imageUrl]);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToNews = (item: NewsItem) => {
    setSelectedNews(item);
    setView('news-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToTeam = (member: TeamMember) => {
    setSelectedMember(member);
    setView('team-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Icon mapping for dynamic social media
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

  return (
    <div style={fontStyle} className="min-h-screen flex flex-col relative text-gray-800">

      {/* Custom Styles for Buttons */}
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
            <button
              onClick={() => setIsLoginOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <div className="text-center mb-6">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-primary">
                <Lock size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Login</h3>
            </div>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                />
                {loginError && <p className="text-red-500 text-xs mt-1">Username atau Password salah.</p>}
              </div>
              <button
                type="submit"
                className={`w-full py-3 btn-custom font-semibold transition shadow-lg flex items-center justify-center gap-2 ${roundedClass}`}
              >
                <LogIn size={18} /> Masuk
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav
        className={`${config.header?.isSticky ? 'sticky top-0 z-30 shadow-md backdrop-blur-md' : 'relative border-b'} transition-all duration-300`}
        style={{ backgroundColor: config.header?.backgroundColor || '#ffffff', color: config.header?.textColor || '#111827' }}
      >
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={navigateToHome}>
            {config.identity.logoUrl && (
              <img src={config.identity.logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
            )}
            <div>
              <h1 className="text-xl font-bold leading-tight">{config.identity.name}</h1>
              {config.identity.tagline && <p className="text-xs opacity-80 font-medium">{config.identity.tagline}</p>}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button onClick={navigateToHome} className="hover:text-primary transition">Beranda</button>
            <button onClick={() => { navigateToHome(); setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 100) }} className="hover:text-primary transition">Tentang</button>
            <button onClick={() => { navigateToHome(); setTimeout(() => document.getElementById('news')?.scrollIntoView({ behavior: 'smooth' }), 100) }} className="hover:text-primary transition">Kegiatan</button>
            <button onClick={() => { navigateToHome(); setTimeout(() => document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' }), 100) }} className="hover:text-primary transition">Struktur</button>
            <a href="#contact" className="px-5 py-2.5 btn-custom rounded-full transition shadow-lg">
              {config.contact.phone ? "Hubungi Kami" : "Bergabung"}
            </a>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 opacity-80 hover:opacity-100">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white text-gray-900 border-t p-6 space-y-4 shadow-xl absolute w-full z-40">
            <button className="block w-full text-left py-2 hover:text-primary" onClick={() => { setMobileMenuOpen(false); navigateToHome(); }}>Beranda</button>
            <button className="block w-full text-left py-2 hover:text-primary" onClick={() => { setMobileMenuOpen(false); navigateToHome(); setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 100) }}>Tentang</button>
            <button className="block w-full text-left py-2 hover:text-primary" onClick={() => { setMobileMenuOpen(false); navigateToHome(); setTimeout(() => document.getElementById('news')?.scrollIntoView({ behavior: 'smooth' }), 100) }}>Kegiatan</button>
            <button className="block w-full text-left py-2 hover:text-primary" onClick={() => { setMobileMenuOpen(false); navigateToHome(); setTimeout(() => document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' }), 100) }}>Struktur</button>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      {view === 'home' && (
        <>
          {/* Hero Section */}
          <section
            id="home"
            className="relative pt-20 pb-32 overflow-hidden transition-colors"
            style={{ backgroundColor: config.hero.backgroundColor || '#ffffff', color: config.hero.textColor || '#111827' }}
          >
            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 animate-fadeIn relative z-10">
                <h2 className="text-5xl md:text-6xl font-extrabold leading-tight">
                  {config.hero.title}
                </h2>
                <p className="text-xl opacity-90 leading-relaxed">
                  {config.hero.subtitle}
                </p>
                <div className="flex gap-4">
                  <a href={config.hero.ctaButtonLink || '#contact'} className={`px-8 py-4 btn-custom font-semibold shadow-xl transition flex items-center gap-2 ${roundedClass}`}>
                    {config.hero.ctaText} <ArrowRight size={20} />
                  </a>
                  <button className={`px-8 py-4 bg-transparent border-2 border-current font-semibold hover:bg-black/5 transition ${roundedClass}`}>
                    Pelajari Lebih Lanjut
                  </button>
                </div>
              </div>
              <div className="relative">
                <div className={`absolute inset-0 bg-primary/10 -rotate-6 scale-95 ${roundedClass}`}></div>

                {/* Carousel / Image Display */}
                <div className={`relative z-10 w-full aspect-[4/3] overflow-hidden shadow-2xl ${roundedClass}`}>
                  {(() => {
                    const images = config.hero.images && config.hero.images.length > 0
                      ? config.hero.images
                      : (config.hero.imageUrl ? [config.hero.imageUrl] : []);

                    if (images.length === 0) {
                      return <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>;
                    }

                    return (
                      <>
                        {images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`Hero ${idx + 1}`}
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                          />
                        ))}

                        {/* Carousel Indicators */}
                        {images.length > 1 && (
                          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                            {images.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setCurrentSlide(idx)}
                                className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'}`}
                              />
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
          <section
            id="about"
            className="py-20 transition-colors"
            style={{ backgroundColor: config.about.backgroundColor || '#f9fafb', color: config.about.textColor || '#111827' }}
          >
            <div className="container mx-auto px-6">
              <div className={`bg-white p-8 md:p-12 shadow-sm ${roundedClass}`} style={{ color: '#111827' }}>
                {/* Note: About card always has white background, so force dark text inside for readability unless customized otherwise later */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  {config.about.imageUrl && (
                    <img
                      src={config.about.imageUrl}
                      alt="About"
                      className={`w-full h-96 object-cover ${roundedClass}`}
                    />
                  )}
                  <div className="space-y-6">
                    <span className="text-primary font-bold tracking-wider text-sm uppercase">Tentang Kami</span>
                    <h3 className="text-3xl font-bold">{config.about.title}</h3>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {config.about.content}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Team/Structure Section */}
          <section
            id="team"
            className="py-20 transition-colors"
            style={{ backgroundColor: config.teamBackgroundColor || '#ffffff', color: config.teamTextColor || '#111827' }}
          >
            <div className="container mx-auto px-6">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <h3 className="text-3xl font-bold mb-4">{config.sectionTitles?.structure || 'Struktur Organisasi'}</h3>
                <p className="opacity-80">Para pemimpin yang berdedikasi untuk membawa perubahan positif.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {config.team.map((member) => (
                  <div key={member.id} className="group text-center cursor-pointer" onClick={() => navigateToTeam(member)}>
                    <div className={`relative overflow-hidden mb-4 bg-gray-100 aspect-square ${roundedClass}`}>
                      {member.photoUrl && (
                        <img
                          src={member.photoUrl}
                          alt={member.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-medium">
                        Lihat Profil
                      </div>
                    </div>
                    <h4 className="text-lg font-bold">{member.name}</h4>
                    <p className="font-medium text-sm opacity-80">{member.role}</p>
                  </div>
                ))}
                {config.team.length === 0 && (
                  <div className="col-span-full text-center opacity-50 py-10">Belum ada anggota tim.</div>
                )}
              </div>
            </div>
          </section>

          {/* News Section */}
          <section
            id="news"
            className="py-20 transition-colors"
            style={{ backgroundColor: config.newsBackgroundColor || '#f9fafb', color: config.newsTextColor || '#111827' }}
          >
            <div className="container mx-auto px-6">
              <div className="flex justify-between items-end mb-12">
                <div>
                  <h3 className="text-3xl font-bold mb-2">{config.sectionTitles?.news || 'Berita & Kegiatan'}</h3>
                  <p className="opacity-80">Update terbaru dari pergerakan kami.</p>
                </div>
                <button className="hidden md:flex items-center gap-1 text-primary font-semibold hover:gap-2 transition-all">Lihat Semua <ChevronRight size={18} /></button>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {config.news.map((item) => (
                  <article
                    key={item.id}
                    className={`bg-white text-gray-800 hover:-translate-y-1 transition duration-300 shadow-sm hover:shadow-xl ${roundedClass} overflow-hidden flex flex-col cursor-pointer`}
                    onClick={() => navigateToNews(item)}
                  >
                    <div className="h-56 overflow-hidden">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="text-xs text-gray-500 mb-2 font-medium flex items-center gap-2"><Calendar size={12} /> {item.date}</div>
                      <h4 className="text-xl font-bold mb-3 line-clamp-2 hover:text-primary transition">{item.title}</h4>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
                        {item.content}
                      </p>
                      <span className="text-primary font-semibold text-sm mt-auto inline-flex items-center gap-1">Baca Selengkapnya <ArrowRight size={14} /></span>
                    </div>
                  </article>
                ))}
                {config.news.length === 0 && (
                  <div className="col-span-full text-center opacity-50 py-10">Belum ada berita.</div>
                )}
              </div>
            </div>
          </section>
        </>
      )}

      {/* News Detail View */}
      {view === 'news-detail' && selectedNews && (
        <div className="py-12 bg-gray-50 flex-1">
          <div className="container mx-auto px-6">
            <button onClick={navigateToHome} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-primary font-medium transition">
              <ArrowLeft size={20} /> Kembali ke Beranda
            </button>
            <article className={`bg-white p-8 md:p-12 shadow-md ${roundedClass}`}>
              <div className="mb-6">
                <span className="text-sm font-semibold text-primary mb-2 block">{selectedNews.date}</span>
                <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">{selectedNews.title}</h1>
                <img src={selectedNews.imageUrl} alt={selectedNews.title} className={`w-full h-[400px] object-cover mb-8 ${roundedClass}`} />
                <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedNews.content}
                </div>
              </div>
            </article>
          </div>
        </div>
      )}

      {/* Team Detail View */}
      {view === 'team-detail' && selectedMember && (
        <div className="py-12 bg-gray-50 flex-1">
          <div className="container mx-auto px-6">
            <button onClick={navigateToHome} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-primary font-medium transition">
              <ArrowLeft size={20} /> Kembali ke Beranda
            </button>
            <div className={`bg-white p-8 md:p-12 shadow-md ${roundedClass}`}>
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <img
                  src={selectedMember.photoUrl}
                  alt={selectedMember.name}
                  className={`w-full md:w-80 h-80 object-cover bg-gray-100 ${roundedClass}`}
                />
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{selectedMember.name}</h1>
                  <p className="text-xl text-primary font-medium mb-6">{selectedMember.role}</p>

                  <h3 className="text-lg font-bold border-b pb-2 mb-4">Profil Singkat</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                    {selectedMember.description || "Belum ada deskripsi profil untuk anggota ini."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Footer */}
      <footer
        id="contact"
        className="pt-20 pb-10 transition-colors duration-300"
        style={{ backgroundColor: config.footer?.backgroundColor || '#111827', color: config.footer?.textColor || '#ffffff' }}
      >
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                {config.identity.logoUrl && (
                  <img src={config.identity.logoUrl} alt="Logo White" className="h-10 w-auto object-contain brightness-0 invert" />
                )}
                <span className="text-2xl font-bold">{config.identity.name}</span>
              </div>
              <p className="opacity-70 leading-relaxed">
                {config.identity.tagline || "Membangun masa depan yang lebih baik bersama-sama."}
              </p>
              <div className="flex gap-4">
                {config.socialMedia && config.socialMedia.map((social) => (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-white/10 rounded-full hover:bg-primary hover:text-white transition flex items-center justify-center"
                    title={social.platform}
                    style={{ color: social.iconColor || 'white' }}
                  >
                    {social.iconUrl ? (
                      <img src={social.iconUrl || undefined} alt={social.platform} className="w-5 h-5 object-contain" style={{ filter: social.iconColor ? 'none' : 'invert(1)' }} />
                    ) : (
                      getSocialIcon(social.platform)
                    )}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-lg font-bold mb-6">Kontak</h5>
              <div className="space-y-4 opacity-70">
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-primary shrink-0" />
                  <span>{config.contact.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-primary shrink-0" />
                  <span>{config.contact.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={20} className="text-primary shrink-0" />
                  <span>{config.contact.phone}</span>
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-lg font-bold mb-6">Bergabung</h5>
              <p className="opacity-70 mb-4">{config.footer?.description || "Jadilah bagian dari perubahan."}</p>
              {/* Customizable Registration Button */}
              <a
                href={config.registration?.url || "#contact"}
                className={`block w-full text-center py-3 font-bold transition ${roundedClass}`}
                style={{
                  backgroundColor: config.registration?.buttonColor || '#2563eb',
                  color: config.registration?.buttonTextColor || '#ffffff'
                }}
              >
                {config.registration?.buttonText || "Daftar Sekarang"}
              </a>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm opacity-60">
            <div>
              &copy; {new Date().getFullYear()} {config.identity.name}. {config.footer?.copyrightText || "All rights reserved."}
            </div>
            {/* Admin Login Trigger in Footer */}
            <div className="mt-4 md:mt-0">
              {!isAdmin ? (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="flex items-center gap-2 hover:text-white transition cursor-pointer"
                >
                  <Lock size={14} /> Admin
                </button>
              ) : (
                <span className="text-green-400 font-semibold flex items-center gap-2">
                  <Lock size={14} /> Logged in
                </span>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicPage;