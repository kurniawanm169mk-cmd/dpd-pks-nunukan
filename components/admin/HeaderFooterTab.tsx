import React from 'react';
import { Palette, MousePointerClick, PanelTop, PanelBottom, Globe, Plus, Trash } from 'lucide-react';
import ImageUpload from '../ImageUpload';
import { SiteConfig, SocialLink } from '../../types';

interface HeaderFooterTabProps {
    localConfig: SiteConfig;
    handleLocalUpdate: (updates: Partial<SiteConfig>) => void;
}

const HeaderFooterTab: React.FC<HeaderFooterTabProps> = ({ localConfig, handleLocalUpdate }) => {
    const addSocial = () => {
        const newSocial: SocialLink = {
            id: `new-${Date.now()}`,
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
            < div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100" >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2"><Globe size={18} /> Social Media Links</h3>
                    <button onClick={addSocial} className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-green-200 transition"><Plus size={14} /> Add Link</button>
                </div>

                <div className="space-y-3">
                    {localConfig.socialMedia.map((social) => (
                        <div key={social.id} className="flex flex-col gap-3 p-4 border-2 rounded-xl bg-gray-50 hover:border-primary/30 transition">
                            <div className="flex gap-2 items-center">
                                <select
                                    className="p-2.5 border rounded-lg bg-white text-sm font-semibold w-36 focus:ring-2 focus:ring-primary outline-none"
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
                                    className="flex-1 p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                                    value={social.url}
                                    onChange={(e) => updateSocial(social.id, 'url', e.target.value)}
                                />
                                <button
                                    onClick={() => removeSocial(social.id)}
                                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition hover:text-red-700"
                                >
                                    <Trash size={18} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Custom Icon Upload */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-2">Icon Custom (Opsional)</label>
                                    <ImageUpload
                                        currentImageUrl={social.iconUrl}
                                        onUpload={(url) => updateSocial(social.id, 'iconUrl', url)}
                                        label=""
                                        className="w-full"
                                        layout="vertical"
                                    />
                                </div>

                                {/* Icon Color Picker */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-2">Warna Icon</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
                                            value={social.iconColor || '#1877F2'}
                                            onChange={(e) => updateSocial(social.id, 'iconColor', e.target.value)}
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-gray-700">{social.iconColor || '#1877F2'}</p>
                                            <p className="text-xs text-gray-500">Klik untuk ubah warna</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {localConfig.socialMedia.length === 0 && (
                        <p className="text-sm text-gray-400 italic text-center py-4">Belum ada link social media.</p>
                    )}
                </div>
            </div>
        </div>

    );
};

export default HeaderFooterTab;
