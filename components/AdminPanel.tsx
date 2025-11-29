import React, { useState, useEffect } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import {
  Save, Loader2, Plus, Trash, FileText, Users, Layout,
  Settings, Palette, PanelTop, PanelBottom, MousePointerClick,
  Globe, RefreshCw, LogOut, X
} from 'lucide-react';
import ImageUpload from './ImageUpload';
import { SiteConfig, TeamMember, NewsItem, SocialLink } from '../types';

const AdminPanel: React.FC = () => {
  const { config, updateConfig, resetConfig, logout } = useConfig();
  const [activeTab, setActiveTab] = useState<'general' | 'hero' | 'about' | 'team' | 'news' | 'header_footer'>('general');

  // Local state for manual save
  const [localConfig, setLocalConfig] = useState<SiteConfig>(config);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync local config with global config on mount or when global config changes (external updates)
  // We only sync if we don't have unsaved changes to avoid overwriting user work
  useEffect(() => {
    if (!hasChanges) {
      setLocalConfig(config);
    }
  }, [config, hasChanges]);

  const handleLocalUpdate = (updates: Partial<SiteConfig>) => {
    setLocalConfig(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const saveChanges = async () => {
    setIsSaving(true);
    try {
      await updateConfig(localConfig);
      setHasChanges(false);
      alert("Perubahan berhasil disimpan!");
    } catch (error) {
      console.error("Failed to save changes:", error);
      alert("Gagal menyimpan perubahan.");
    } finally {
      setIsSaving(false);
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
              value={localConfig.identity.name}
              onChange={(e) => handleLocalUpdate({ identity: { ...localConfig.identity, name: e.target.value } })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              value={localConfig.identity.tagline}
              onChange={(e) => handleLocalUpdate({ identity: { ...localConfig.identity, tagline: e.target.value } })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
            <ImageUpload
              currentImageUrl={localConfig.identity.logoUrl}
              onUpload={(url) => handleLocalUpdate({ identity: { ...localConfig.identity, logoUrl: url } })}
              label="Upload Logo"
              bucketName="images"
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
              value={localConfig.theme.fontFamily}
              onChange={(e) => handleLocalUpdate({ theme: { ...localConfig.theme, fontFamily: e.target.value as any } })}
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
              value={localConfig.theme.rounded}
              onChange={(e) => handleLocalUpdate({ theme: { ...localConfig.theme, rounded: e.target.value as any } })}
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
          <input type="text" placeholder="Alamat" className="w-full p-2 border rounded-lg" value={localConfig.contact.address} onChange={(e) => handleLocalUpdate({ contact: { ...localConfig.contact, address: e.target.value } })} />
          <input type="text" placeholder="Email" className="w-full p-2 border rounded-lg" value={localConfig.contact.email} onChange={(e) => handleLocalUpdate({ contact: { ...localConfig.contact, email: e.target.value } })} />
          <input type="text" placeholder="Telepon" className="w-full p-2 border rounded-lg" value={localConfig.contact.phone} onChange={(e) => handleLocalUpdate({ contact: { ...localConfig.contact, phone: e.target.value } })} />
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
      handleLocalUpdate({ socialMedia: [...localConfig.socialMedia, newSocial] });
    };

    const updateSocial = (id: string, field: keyof SocialLink, value: string) => {
      const updated = localConfig.socialMedia.map(s => s.id === id ? { ...s, [field]: value } : s);
      handleLocalUpdate({ socialMedia: updated });
    };

    const removeSocial = (id: string) => {
      handleLocalUpdate({ socialMedia: localConfig.socialMedia.filter(s => s.id !== id) });
    };

    return (
      <div className="space-y-6 animate-fadeIn">

        {/* Global Colors */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Palette size={18} /> Warna Tema Global (Logo & Kontak)</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warna Utama (Primary)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="w-10 h-10 rounded cursor-pointer border-0"
                  value={localConfig.theme.primaryColor}
                  onChange={(e) => handleLocalUpdate({ theme: { ...localConfig.theme, primaryColor: e.target.value } })}
                />
                <span className="text-sm text-gray-500">{localConfig.theme.primaryColor}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warna Sekunder</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="w-10 h-10 rounded cursor-pointer border-0"
                  value={localConfig.theme.secondaryColor}
                  onChange={(e) => handleLocalUpdate({ theme: { ...localConfig.theme, secondaryColor: e.target.value } })}
                />
                <span className="text-sm text-gray-500">{localConfig.theme.secondaryColor}</span>
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
                  value={localConfig.theme.buttonColor || localConfig.theme.primaryColor}
                  onChange={(e) => handleLocalUpdate({ theme: { ...localConfig.theme, buttonColor: e.target.value } })}
                />
                <span className="text-sm text-gray-500">{localConfig.theme.buttonColor}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warna Tombol (Hover)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="w-10 h-10 rounded cursor-pointer border-0"
                  value={localConfig.theme.buttonHoverColor || localConfig.theme.secondaryColor}
                  onChange={(e) => handleLocalUpdate({ theme: { ...localConfig.theme, buttonHoverColor: e.target.value } })}
                />
                <span className="text-sm text-gray-500">{localConfig.theme.buttonHoverColor}</span>
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
                    value={localConfig.header.backgroundColor}
                    onChange={(e) => handleLocalUpdate({ header: { ...localConfig.header, backgroundColor: e.target.value } })}
                  />
                  <span className="text-xs text-gray-500">{localConfig.header.backgroundColor}</span>
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Warna Teks</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="w-10 h-10 rounded cursor-pointer border-0"
                    value={localConfig.header.textColor}
                    onChange={(e) => handleLocalUpdate({ header: { ...localConfig.header, textColor: e.target.value } })}
                  />
                  <span className="text-xs text-gray-500">{localConfig.header.textColor}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="stickyHeader"
                className="w-4 h-4 text-primary rounded"
                checked={localConfig.header.isSticky}
                onChange={(e) => handleLocalUpdate({ header: { ...localConfig.header, isSticky: e.target.checked } })}
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
                    value={localConfig.footer.backgroundColor}
                    onChange={(e) => handleLocalUpdate({ footer: { ...localConfig.footer, backgroundColor: e.target.value } })}
                  />
                  <span className="text-xs text-gray-500">{localConfig.footer.backgroundColor}</span>
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Warna Teks</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="w-10 h-10 rounded cursor-pointer border-0"
                    value={localConfig.footer.textColor}
                    onChange={(e) => handleLocalUpdate({ footer: { ...localConfig.footer, textColor: e.target.value } })}
                  />
                  <span className="text-xs text-gray-500">{localConfig.footer.textColor}</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Footer (Ajak gabung, dll)</label>
              <textarea
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                rows={3}
                value={localConfig.footer.description}
                onChange={(e) => handleLocalUpdate({ footer: { ...localConfig.footer, description: e.target.value } })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teks Copyright</label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                value={localConfig.footer.copyrightText}
                onChange={(e) => handleLocalUpdate({ footer: { ...localConfig.footer, copyrightText: e.target.value } })}
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
                  value={localConfig.registration?.buttonText || "Daftar Sekarang"}
                  onChange={(e) => handleLocalUpdate({ registration: { ...localConfig.registration, buttonText: e.target.value } })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  placeholder="https://... atau #contact"
                  value={localConfig.registration?.url || "#contact"}
                  onChange={(e) => handleLocalUpdate({ registration: { ...localConfig.registration, url: e.target.value } })}
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
                    value={localConfig.registration?.buttonColor || '#2563eb'}
                    onChange={(e) => handleLocalUpdate({ registration: { ...localConfig.registration, buttonColor: e.target.value } })}
                  />
                  <span className="text-xs text-gray-500">{localConfig.registration?.buttonColor}</span>
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Warna Teks Tombol</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="w-10 h-10 rounded cursor-pointer border-0"
                    value={localConfig.registration?.buttonTextColor || '#ffffff'}
                    onChange={(e) => handleLocalUpdate({ registration: { ...localConfig.registration, buttonTextColor: e.target.value } })}
                  />
                  <span className="text-xs text-gray-500">{localConfig.registration?.buttonTextColor}</span>
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
            {localConfig.socialMedia.map((social) => (
              <div key={social.id} className="flex flex-col gap-2 p-3 border rounded-lg bg-gray-50">
                <div className="flex gap-2 items-center">
                  <select
                    className="p-2 border rounded-lg bg-white text-sm w-32"
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
                  <button onClick={() => removeSocial(social.id)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash size={16} /></button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-32">Custom Icon (Optional):</span>
                  <div className="flex-1">
                    <ImageUpload
                      currentImageUrl={social.iconUrl}
                      onUpload={(url) => updateSocial(social.id, 'iconUrl', url)}
                      label=""
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            ))}
            {localConfig.socialMedia.length === 0 && <p className="text-sm text-gray-400 italic">Belum ada link social media.</p>}
          </div>
        </div>
      </div>
    )
  };

  const renderHeroTab = () => {
    const images = localConfig.hero.images || (localConfig.hero.imageUrl ? [localConfig.hero.imageUrl] : []);

    const addHeroImage = (url: string) => {
      if (!url) return;
      const newImages = [...images, url];
      // Limit to 15
      if (newImages.length > 15) {
        alert("Maksimal 15 gambar.");
        return;
      }
      handleLocalUpdate({ hero: { ...localConfig.hero, images: newImages, imageUrl: newImages[0] } });
    };

    const removeHeroImage = (index: number) => {
      const newImages = images.filter((_, i) => i !== index);
      handleLocalUpdate({ hero: { ...localConfig.hero, images: newImages, imageUrl: newImages[0] || '' } });
    };

    return (
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
                    value={localConfig.hero.backgroundColor || '#ffffff'}
                    onChange={(e) => handleLocalUpdate({ hero: { ...localConfig.hero, backgroundColor: e.target.value } })}
                  />
                  <span className="text-xs text-gray-500">{localConfig.hero.backgroundColor || '#ffffff'}</span>
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Warna Teks</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="w-10 h-10 rounded cursor-pointer border-0"
                    value={localConfig.hero.textColor || '#111827'}
                    onChange={(e) => handleLocalUpdate({ hero: { ...localConfig.hero, textColor: e.target.value } })}
                  />
                  <span className="text-xs text-gray-500">{localConfig.hero.textColor || '#111827'}</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul Utama</label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                value={localConfig.hero.title}
                onChange={(e) => handleLocalUpdate({ hero: { ...localConfig.hero, title: e.target.value } })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sub Judul
              </label>
              <textarea
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none h-24"
                value={localConfig.hero.subtitle}
                onChange={(e) => handleLocalUpdate({ hero: { ...localConfig.hero, subtitle: e.target.value } })}
              />
            </div>

            {/* Hero Images Carousel Management */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gambar Hero (Carousel - Max 15)</label>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group aspect-video bg-gray-100 rounded-lg overflow-hidden border">
                    <img src={img} alt={`Hero ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeHeroImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-1 text-center truncate">
                      Slide {idx + 1}
                    </div>
                  </div>
                ))}
                {images.length < 15 && (
                  <div className="aspect-video flex items-center justify-center bg-gray-50 border-2 border-dashed rounded-lg">
                    <ImageUpload
                      onUpload={addHeroImage}
                      label="Tambah Slide"
                      bucketName="images"
                      className="w-full h-full flex items-center justify-center"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teks Tombol CTA</label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                value={localConfig.hero.ctaText}
                onChange={(e) => handleLocalUpdate({ hero: { ...localConfig.hero, ctaText: e.target.value } })}
              />
            </div>
          </div>
        </div>
      </div>
    )
  };

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
                  value={localConfig.about.backgroundColor || '#f9fafb'}
                  onChange={(e) => handleLocalUpdate({ about: { ...localConfig.about, backgroundColor: e.target.value } })}
                />
                <span className="text-xs text-gray-500">{localConfig.about.backgroundColor || '#f9fafb'}</span>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Warna Teks</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="w-10 h-10 rounded cursor-pointer border-0"
                  value={localConfig.about.textColor || '#111827'}
                  onChange={(e) => handleLocalUpdate({ about: { ...localConfig.about, textColor: e.target.value } })}
                />
                <span className="text-xs text-gray-500">{localConfig.about.textColor || '#111827'}</span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Judul Seksi</label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              value={localConfig.about.title}
              onChange={(e) => handleLocalUpdate({ about: { ...localConfig.about, title: e.target.value } })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Konten Deskripsi
            </label>
            <textarea
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none h-40"
              value={localConfig.about.content}
              onChange={(e) => handleLocalUpdate({ about: { ...localConfig.about, content: e.target.value } })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gambar</label>
            <ImageUpload
              currentImageUrl={localConfig.about.imageUrl}
              onUpload={(url) => handleLocalUpdate({ about: { ...localConfig.about, imageUrl: url } })}
              label="Upload Gambar Tentang Kami"
              bucketName="images"
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
      handleLocalUpdate({ team: [...localConfig.team, newMember] });
    };

    const updateMember = (id: string, field: keyof TeamMember, value: string) => {
      const updatedTeam = localConfig.team.map(m => m.id === id ? { ...m, [field]: value } : m);
      handleLocalUpdate({ team: updatedTeam });
    };

    const removeMember = (id: string) => {
      handleLocalUpdate({ team: localConfig.team.filter(m => m.id !== id) });
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
                  value={localConfig.teamBackgroundColor || '#ffffff'}
                  onChange={(e) => handleLocalUpdate({ teamBackgroundColor: e.target.value })}
                />
                <span className="text-xs text-gray-500">{localConfig.teamBackgroundColor || '#ffffff'}</span>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Warna Teks Seksi</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="w-10 h-10 rounded cursor-pointer border-0"
                  value={localConfig.teamTextColor || '#111827'}
                  onChange={(e) => handleLocalUpdate({ teamTextColor: e.target.value })}
                />
                <span className="text-xs text-gray-500">{localConfig.teamTextColor || '#111827'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-4">
          {localConfig.team.map((member) => (
            <div key={member.id} className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col gap-3 relative group">
              <button onClick={() => removeMember(member.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 bg-red-50 rounded opacity-0 group-hover:opacity-100 transition"><Trash size={16} /></button>
              <div className="flex items-start gap-4">
                <div className="w-20">
                  <ImageUpload
                    currentImageUrl={member.photoUrl}
                    onUpload={(url) => updateMember(member.id, 'photoUrl', url)}
                    label=""
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                </div>
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
    )
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
      handleLocalUpdate({ news: [newItem, ...localConfig.news] });
    };

    const updateNews = (id: string, field: keyof NewsItem, value: string) => {
      const updatedNews = localConfig.news.map(n => n.id === id ? { ...n, [field]: value } : n);
      handleLocalUpdate({ news: updatedNews });
    };

    const removeNews = (id: string) => {
      handleLocalUpdate({ news: localConfig.news.filter(n => n.id !== id) });
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
                  value={localConfig.newsBackgroundColor || '#f9fafb'}
                  onChange={(e) => handleLocalUpdate({ newsBackgroundColor: e.target.value })}
                />
                <span className="text-xs text-gray-500">{localConfig.newsBackgroundColor || '#f9fafb'}</span>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Warna Teks Seksi</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="w-10 h-10 rounded cursor-pointer border-0"
                  value={localConfig.newsTextColor || '#111827'}
                  onChange={(e) => handleLocalUpdate({ newsTextColor: e.target.value })}
                />
                <span className="text-xs text-gray-500">{localConfig.newsTextColor || '#111827'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {localConfig.news.map((item) => (
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
                  <ImageUpload
                    currentImageUrl={item.imageUrl}
                    onUpload={(url) => updateNews(item.id, 'imageUrl', url)}
                    label="Upload Gambar Berita"
                    bucketName="images"
                    className="w-full h-32 object-cover rounded-lg"
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
          {hasChanges && (
            <button
              onClick={saveChanges}
              disabled={isSaving}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Simpan Perubahan
            </button>
          )}
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
    </div>
  );
};

export default AdminPanel;