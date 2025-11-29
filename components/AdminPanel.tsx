import React, { useState, useRef } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { generateText } from '../services/geminiService';
import { Save, RefreshCw, Plus, Trash, Upload, X, Wand2, Type, Layout, Users, FileText, Settings, Palette, Globe, Facebook, Twitter, Instagram, LogOut, PanelTop, PanelBottom, Link as LinkIcon, MousePointerClick } from 'lucide-react';
import { TeamMember, NewsItem, SocialLink } from '../types';
import ImageUpload from './ImageUpload';

const AdminPanel: React.FC = () => {
  const { config, updateConfig, resetConfig, logout } = useConfig();
  const [activeTab, setActiveTab] = useState<'general' | 'hero' | 'about' | 'team' | 'news' | 'header_footer'>('general');
  const [isGenerating, setIsGenerating] = useState(false);

  // AI Generation Handler
  const handleAIGenerate = async (prompt: string, field: string, type: 'hero' | 'about' | 'news') => {
    setIsGenerating(true);
    try {
      const result = await generateText(prompt, type);
      if (type === 'hero' && field === 'subtitle') {
        updateConfig({ hero: { ...config.hero, subtitle: result } });
      } else if (type === 'about' && field === 'content') {
        updateConfig({ about: { ...config.about, content: result } });
      } else if (type === 'news') {
        alert("AI Generated Text:\n\n" + result);
      }
    } catch (e) {
      alert("Gagal menggunakan AI. Pastikan API KEY dikonfigurasi.");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Render Functions for Tabs ---

  const renderGeneralTab = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Settings size={18} /> Identitas Organisasi</h3>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Organisasi</label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              value={config.identity.name}
              onChange={(e) => updateConfig({ identity: { ...config.identity, name: e.target.value } })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              value={config.identity.tagline}
              onChange={(e) => updateConfig({ identity: { ...config.identity, tagline: e.target.value } })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
            <ImageUpload
              currentImageUrl={config.identity.logoUrl}
              onUpload={(url) => updateConfig({ identity: { ...config.identity, logoUrl: url } })}
              label="Upload Logo"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Palette size={18} /> Tampilan Umum</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
            <select
              className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-primary outline-none"
              value={config.theme.fontFamily}
              onChange={(e) => updateConfig({ theme: { ...config.theme, fontFamily: e.target.value as any } })}
            >
              <option value="Inter">Inter (Clean)</option>
              <option value="Poppins">Poppins (Modern)</option>
              <option value="Roboto">Roboto (Standard)</option>
              <option value="Playfair Display">Playfair Display (Serif/Elegant)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rounded Corner</label>
            <select
              className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-primary outline-none"
              value={config.theme.rounded}
              onChange={(e) => updateConfig({ theme: { ...config.theme, rounded: e.target.value as any } })}
            >
              <option value="none">Square (None)</option>
              <option value="md">Small (MD)</option>
              <option value="xl">Medium (XL)</option>
              <option value="2xl">Large (2XL)</option>
              <option value="3xl">Extra Large (3XL)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"> Kontak Utama</h3>
        <div className="grid gap-4">
          <input type="text" placeholder="Alamat" className="w-full p-2 border rounded-lg" value={config.contact.address} onChange={(e) => updateConfig({ contact: { ...config.contact, address: e.target.value } })} />
          <input type="text" placeholder="Email" className="w-full p-2 border rounded-lg" value={config.contact.email} onChange={(e) => updateConfig({ contact: { ...config.contact, email: e.target.value } })} />
          <input type="text" placeholder="Telepon" className="w-full p-2 border rounded-lg" value={config.contact.phone} onChange={(e) => updateConfig({ contact: { ...config.contact, phone: e.target.value } })} />
        </div>
      </div>
    </div>
  );

  const renderHeaderFooterTab = () => {
    const addSocial = () => {
      const newSocial: SocialLink = {
        id: Date.now().toString(),
        platform: 'Website',
        url: 'https://'
      };
      updateConfig({ socialMedia: [...config.socialMedia, newSocial] });
    };

    const updateSocial = (id: string, field: keyof SocialLink, value: string) => {
      const updated = config.socialMedia.map(s => s.id === id ? { ...s, [field]: value } : s);
      updateConfig({ socialMedia: updated });
    };

    const removeSocial = (id: string) => {
      updateConfig({ socialMedia: config.socialMedia.filter(s => s.id !== id) });
    };

    return (
      <div className="space-y-6 animate-fadeIn">

        {/* Global Colors (Moved here) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Palette size={18} /> Warna Tema Global (Logo & Kontak)</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warna Utama (Primary)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="w-10 h-10 rounded cursor-pointer border-0"
                  value={config.theme.primaryColor}
                  onChange={(e) => updateConfig({ theme: { ...config.theme, primaryColor: e.target.value } })}
                />
                <span className="text-sm text-gray-500">{config.theme.primaryColor}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warna Sekunder</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="w-10 h-10 rounded cursor-pointer border-0"
                  value={config.theme.secondaryColor}
                  onChange={(e) => updateConfig({ theme: { ...config.theme, secondaryColor: e.target.value } })}
                />
                <span className="text-sm text-gray-500">{config.theme.secondaryColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Button Colors */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><MousePointerClick size={18} /> Warna Tombol Global</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warna Tombol (Normal)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="w-10 h-10 rounded cursor-pointer border-0"
                  value={config.theme.buttonColor || config.theme.primaryColor}
                  onChange={(e) => updateConfig({ theme: { ...config.theme, buttonColor: e.target.value } })}
                />
                <span className="text-sm text-gray-500">{config.theme.buttonColor}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warna Tombol (Hover)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="w-10 h-10 rounded cursor-pointer border-0"
                  value={config.theme.buttonHoverColor || config.theme.secondaryColor}
                  onChange={(e) => updateConfig({ theme: { ...config.theme, buttonHoverColor: e.target.value } })}
                />
                <span className="text-sm text-gray-500">{config.theme.buttonHoverColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Header Config */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><PanelTop size={18} /> Pengaturan Header (Navbar)</h3>
          <div className="grid gap-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Warna Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="w-10 h-10 rounded cursor-pointer border-0"
                    value={config.header.backgroundColor}
                    onChange={(e) => updateConfig({ header: { ...config.header, backgroundColor: e.target.value } })}
                  />
                  <span className="text-xs text-gray-500">{config.header.backgroundColor}</span>
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Warna Teks</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="w-10 h-10 rounded cursor-pointer border-0"
                    checked={config.header.isSticky}
                    onChange={(e) => updateConfig({ header: { ...config.header, isSticky: e.target.checked } })}
                  />
                  <label htmlFor="stickyHeader" className="text-sm font-medium text-gray-700">Sticky Header (Melayang saat scroll)</label>
                </div>
              </div>
            </div>

            {/* Footer Config */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><PanelBottom size={18} /> Pengaturan Footer</h3>
              <div className="grid gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warna Background</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="w-10 h-10 rounded cursor-pointer border-0"
                        value={config.footer.backgroundColor}
                        onChange={(e) => updateConfig({ footer: { ...config.footer, backgroundColor: e.target.value } })}
                      />
                      <span className="text-xs text-gray-500">{config.footer.backgroundColor}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warna Teks</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="w-10 h-10 rounded cursor-pointer border-0"
                        value={config.footer.textColor}
                        onChange={(e) => updateConfig({ footer: { ...config.footer, textColor: e.target.value } })}
                      />
                      <span className="text-xs text-gray-500">{config.footer.textColor}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Footer (Ajak gabung, dll)</label>
                  <textarea
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    rows={3}
                    value={config.footer.description}
                    onChange={(e) => updateConfig({ footer: { ...config.footer, description: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teks Copyright</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    value={config.footer.copyrightText}
                    onChange={(e) => updateConfig({ footer: { ...config.footer, copyrightText: e.target.value } })}
                  />
                </div>
              </div>
            </div>

            {/* Footer Registration Button Config */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><MousePointerClick size={18} /> Tombol Daftar (Footer)</h3>
              <div className="grid gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teks Tombol</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg"
                      value={config.registration?.buttonText || "Daftar Sekarang"}
                      onChange={(e) => updateConfig({ registration: { ...config.registration, buttonText: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg"
                      placeholder="https://... atau #contact"
                      value={config.registration?.url || "#contact"}
                      onChange={(e) => updateConfig({ registration: { ...config.registration, url: e.target.value } })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warna Tombol</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="w-10 h-10 rounded cursor-pointer border-0"
                        value={config.registration?.buttonColor || '#2563eb'}
                        onChange={(e) => updateConfig({ registration: { ...config.registration, buttonColor: e.target.value } })}
                      />
                      <span className="text-xs text-gray-500">{config.registration?.buttonColor}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warna Teks Tombol</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="w-10 h-10 rounded cursor-pointer border-0"
                        value={config.registration?.buttonTextColor || '#ffffff'}
                        onChange={(e) => updateConfig({ registration: { ...config.registration, buttonTextColor: e.target.value } })}
                      />
                      <span className="text-xs text-gray-500">{config.registration?.buttonTextColor}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media Config */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2"><Globe size={18} /> Social Media Links</h3>
                <button onClick={addSocial} className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-green-200 transition"><Plus size={14} /> Add Link</button>
              </div>

              <div className="space-y-3">
                {config.socialMedia.map((social) => (
                  <div key={social.id} className="flex gap-2 items-center">
                    <select
                      className="p-2 border rounded-lg bg-gray-50 text-sm w-32"
                      value={social.platform}
                      onChange={(e) => updateSocial(social.id, 'platform', e.target.value as any)}
                    >
                      <option value="Facebook">Facebook</option>
                      <option value="Twitter">Twitter/X</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Youtube">Youtube</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="TikTok">TikTok</option>
                      <option value="Website">Website</option>
                    </select>
                    <input
                      type="text"
                      placeholder="https://..."
                      className="flex-1 p-2 border rounded-lg text-sm"
                      value={social.url}
                      onChange={(e) => updateSocial(social.id, 'url', e.target.value)}
                    />
                    <div className="w-10">
                      <ImageUpload
                        currentImageUrl={social.iconUrl}
                        onUpload={(url) => updateSocial(social.id, 'iconUrl', url)}
                        label=""
                        className="w-10 h-10"
                        bucketName="images"
                      />
                    </div>
                    <button onClick={() => removeSocial(social.id)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash size={16} /></button>
                  </div>
                ))}
                {config.socialMedia.length === 0 && <p className="text-sm text-gray-400 italic">Belum ada link social media.</p>}
              </div>
            </div>
          </div>
          )
  };

  const renderHeroTab = () => (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Layout size={18} /> Hero Section</h3>
              <div className="grid gap-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warna Background</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="w-10 h-10 rounded cursor-pointer border-0"
                        value={config.hero.backgroundColor || '#ffffff'}
                        onChange={(e) => updateConfig({ hero: { ...config.hero, backgroundColor: e.target.value } })}
                      />
                      <span className="text-xs text-gray-500">{config.hero.backgroundColor || '#ffffff'}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warna Teks</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="w-10 h-10 rounded cursor-pointer border-0"
                        value={config.hero.textColor || '#111827'}
                        onChange={(e) => updateConfig({ hero: { ...config.hero, textColor: e.target.value } })}
                      />
                      <span className="text-xs text-gray-500">{config.hero.textColor || '#111827'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul Utama</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    value={config.hero.title}
                    onChange={(e) => updateConfig({ hero: { ...config.hero, title: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                    Sub Judul
                    <button onClick={() => handleAIGenerate(`Buatkan subjudul website partai/organisasi yang inspiratif tentang: ${config.hero.title}`, 'subtitle', 'hero')} className="text-xs text-primary flex items-center gap-1 hover:underline">
                      <Wand2 size={12} /> AI Rewrite
                    </button>
                  </label>
                  <textarea
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none h-24"
                    value={config.hero.subtitle}
                    onChange={(e) => updateConfig({ hero: { ...config.hero, subtitle: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Hero</label>
                  <ImageUpload
                    currentImageUrl={config.hero.imageUrl}
                    onUpload={(url) => updateConfig({ hero: { ...config.hero, imageUrl: url } })}
                    label="Upload Hero Image"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teks Tombol CTA</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    value={config.hero.ctaText}
                    onChange={(e) => updateConfig({ hero: { ...config.hero, ctaText: e.target.value } })}
                  />
                </div>
              </div>
            </div>
          </div>
          );

  const renderAboutTab = () => (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FileText size={18} /> Tentang Kami</h3>
              <div className="grid gap-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warna Background</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="w-10 h-10 rounded cursor-pointer border-0"
                        value={config.about.backgroundColor || '#f9fafb'}
                        onChange={(e) => updateConfig({ about: { ...config.about, backgroundColor: e.target.value } })}
                      />
                      <span className="text-xs text-gray-500">{config.about.backgroundColor || '#f9fafb'}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warna Teks</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="w-10 h-10 rounded cursor-pointer border-0"
                        value={config.about.textColor || '#111827'}
                        onChange={(e) => updateConfig({ about: { ...config.about, textColor: e.target.value } })}
                      />
                      <span className="text-xs text-gray-500">{config.about.textColor || '#111827'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul Seksi</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    value={config.about.title}
                    onChange={(e) => updateConfig({ about: { ...config.about, title: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                    Konten Deskripsi
                    <button onClick={() => handleAIGenerate(`Buatkan deskripsi 'Tentang Kami' untuk organisasi bernama ${config.identity.name}. Visi: modern dan solid.`, 'content', 'about')} className="text-xs text-primary flex items-center gap-1 hover:underline">
                      <Wand2 size={12} /> AI Generate
                    </button>
                  </label>
                  <textarea
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none h-40"
                    value={config.about.content}
                    onChange={(e) => updateConfig({ about: { ...config.about, content: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Tentang Kami</label>
                  <ImageUpload
                    currentImageUrl={config.about.imageUrl}
                    onUpload={(url) => updateConfig({ about: { ...config.about, imageUrl: url } })}
                    label="Upload About Image"
                  />
                </div>
              </div>
            </div>
          </div>
          );

  const renderTeamTab = () => {
    const addMember = () => {
      const newMember: TeamMember = {
            id: Date.now().toString(),
          name: "Nama Anggota",
          role: "Jabatan",
          photoUrl: "https://via.placeholder.com/150",
          description: "Deskripsi singkat tentang anggota ini..."
      };
          updateConfig({team: [...config.team, newMember] });
    };

    const updateMember = (id: string, field: keyof TeamMember, value: string) => {
      const updatedTeam = config.team.map(m => m.id === id ? {...m, [field]: value } : m);
          updateConfig({team: updatedTeam });
    };

    const removeMember = (id: string) => {
            updateConfig({ team: config.team.filter(m => m.id !== id) });
    };

          return (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center gap-2"><Users size={18} /> Struktur Organisasi</h3>
              <button onClick={addMember} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 hover:bg-green-700 transition"><Plus size={16} /> Tambah</button>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 mb-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warna Background Seksi</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      className="w-10 h-10 rounded cursor-pointer border-0"
                      value={config.teamBackgroundColor || '#ffffff'}
                      onChange={(e) => updateConfig({ teamBackgroundColor: e.target.value })}
                    />
                    <span className="text-xs text-gray-500">{config.teamBackgroundColor || '#ffffff'}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warna Teks Seksi</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      className="w-10 h-10 rounded cursor-pointer border-0"
                      value={config.teamTextColor || '#111827'}
                      onChange={(e) => updateConfig({ teamTextColor: e.target.value })}
                    />
                    <span className="text-xs text-gray-500">{config.teamTextColor || '#111827'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid gap-4">
              {config.team.map((member) => (
                <div key={member.id} className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col gap-3 relative group">
                  <button onClick={() => removeMember(member.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 bg-red-50 rounded opacity-0 group-hover:opacity-100 transition"><Trash size={16} /></button>
                  <div className="flex items-start gap-4">
                    <img src={member.photoUrl} alt="prev" className="w-20 h-20 rounded-lg object-cover border" />
                    <div className="flex-1 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Nama"
                          className="w-full p-1.5 border rounded text-sm font-semibold"
                          value={member.name}
                          onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Jabatan"
                          className="w-full p-1.5 border rounded text-sm text-gray-600"
                          value={member.role}
                          onChange={(e) => updateMember(member.id, 'role', e.target.value)}
                        />
                      </div>
                      <ImageUpload
                        currentImageUrl={member.photoUrl}
                        onUpload={(url) => updateMember(member.id, 'photoUrl', url)}
                        label="Foto Anggota"
                        className="w-full"
                      />
                      <textarea
                        placeholder="Deskripsi/Bio Singkat"
                        className="w-full p-1.5 border rounded text-sm text-gray-600 h-16"
                        value={member.description || ''}
                        onChange={(e) => updateMember(member.id, 'description', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          );
  };

  const renderNewsTab = () => {
    const addNews = () => {
      const newItem: NewsItem = {
            id: Date.now().toString(),
          title: "Judul Berita Baru",
          date: new Date().toISOString().split('T')[0],
          content: "Isi berita...",
          imageUrl: "https://via.placeholder.com/600x400"
      };
          updateConfig({news: [newItem, ...config.news] });
    };

    const updateNews = (id: string, field: keyof NewsItem, value: string) => {
      const updatedNews = config.news.map(n => n.id === id ? {...n, [field]: value } : n);
          updateConfig({news: updatedNews });
    };

    const removeNews = (id: string) => {
            updateConfig({ news: config.news.filter(n => n.id !== id) });
    };

          return (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center gap-2"><FileText size={18} /> Berita & Kegiatan</h3>
              <button onClick={addNews} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 hover:bg-green-700 transition"><Plus size={16} /> Buat Berita</button>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 mb-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warna Background Seksi</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      className="w-10 h-10 rounded cursor-pointer border-0"
                      value={config.newsBackgroundColor || '#f9fafb'}
                      onChange={(e) => updateConfig({ newsBackgroundColor: e.target.value })}
                    />
                    <span className="text-xs text-gray-500">{config.newsBackgroundColor || '#f9fafb'}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warna Teks Seksi</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      className="w-10 h-10 rounded cursor-pointer border-0"
                      value={config.newsTextColor || '#111827'}
                      onChange={(e) => updateConfig({ newsTextColor: e.target.value })}
                    />
                    <span className="text-xs text-gray-500">{config.newsTextColor || '#111827'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {config.news.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-200 gap-4">
                  <div className="flex justify-between mb-2">
                    <input
                      type="date"
                      className="text-xs text-gray-500 border rounded p-1"
                      value={item.date}
                      onChange={(e) => updateNews(item.id, 'date', e.target.value)}
                    />
                    <button onClick={() => removeNews(item.id)} className="text-red-500 hover:text-red-700"><Trash size={16} /></button>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                      <img src={item.imageUrl} className="w-full h-32 object-cover rounded-lg mb-2 bg-gray-100" />
                      <ImageUpload
                        currentImageUrl={item.imageUrl}
                        onUpload={(url) => updateNews(item.id, 'imageUrl', url)}
                        label="Gambar Berita"
                        className="mb-2"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <input
                        type="text"
                        className="w-full p-2 border rounded font-bold text-gray-800"
                        value={item.title}
                        onChange={(e) => updateNews(item.id, 'title', e.target.value)}
                      />
                      <textarea
                        className="w-full p-2 border rounded text-sm text-gray-600 h-24"
                        value={item.content}
                        onChange={(e) => updateNews(item.id, 'content', e.target.value)}
                      />
                      <div className="flex justify-end">
                        <button onClick={() => handleAIGenerate(`Buatkan berita kegiatan fiktif dengan judul: ${item.title}`, item.id, 'news')} className="text-xs text-primary flex items-center gap-1 hover:underline">
                          <Wand2 size={12} /> AI Generate Content
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          );
  };

          return (
          <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-gray-50 shadow-2xl z-50 overflow-y-auto transform transition-transform duration-300 border-l border-gray-200 animate-fadeIn">
            <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
              <div className="flex gap-2">
                <button
                  onClick={resetConfig}
                  className="p-2 text-gray-500 hover:text-red-600 transition rounded-full hover:bg-gray-100"
                  title="Reset to Defaults"
                >
                  <RefreshCw size={20} />
                </button>
                <button onClick={logout} className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50" title="Logout">
                  <LogOut size={20} />
                </button>
              </div>
            </div>

            <div className="px-6 py-2 bg-white border-b overflow-x-auto">
              <div className="flex space-x-2">
                {['general', 'header_footer', 'hero', 'about', 'team', 'news'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {tab === 'header_footer' ? 'Header & Footer' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 pb-20">
              {activeTab === 'general' && renderGeneralTab()}
              {activeTab === 'header_footer' && renderHeaderFooterTab()}
              {activeTab === 'hero' && renderHeroTab()}
              {activeTab === 'about' && renderAboutTab()}
              {activeTab === 'team' && renderTeamTab()}
              {activeTab === 'news' && renderNewsTab()}
            </div>

            {isGenerating && (
              <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 backdrop-blur-sm">
                <div className="bg-white p-4 rounded-xl shadow-xl flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  <span className="font-medium text-sm">Sedang menulis dengan AI...</span>
                </div>
              </div>
            )}
          </div>
          );
};

          export default AdminPanel;