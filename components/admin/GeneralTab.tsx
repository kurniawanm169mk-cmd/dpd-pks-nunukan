import React from 'react';
import { Settings, Palette } from 'lucide-react';
import ImageUpload from '../ImageUpload';
import { SiteConfig } from '../../types';

interface GeneralTabProps {
    localConfig: SiteConfig;
    handleLocalUpdate: (updates: Partial<SiteConfig>) => void;
}

const GeneralTab: React.FC<GeneralTabProps> = ({ localConfig, handleLocalUpdate }) => (
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Domain Website (URL)</label>
                    <input
                        type="text"
                        placeholder="https://..."
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                        value={localConfig.identity.siteUrl || ''}
                        onChange={(e) => handleLocalUpdate({ identity: { ...localConfig.identity, siteUrl: e.target.value } })}
                    />
                    <p className="text-xs text-gray-500 mt-1">Masukkan URL lengkap (contoh: https://partaikita.com)</p>
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
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Google Site Verification ID</label>
                    <input
                        type="text"
                        placeholder="Contoh: vQy... (dari tag HTML Google)"
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        value={localConfig.identity.googleVerificationId || ''}
                        onChange={(e) => handleLocalUpdate({ identity: { ...localConfig.identity, googleVerificationId: e.target.value } })}
                    />
                    <p className="text-xs text-gray-500 mt-1">Masukkan kode dari meta tag Google Search Console.</p>
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
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"> Judul Halaman</h3>
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul Bagian Struktur</label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        value={localConfig.sectionTitles?.structure || 'Struktur Organisasi'}
                        onChange={(e) => handleLocalUpdate({ sectionTitles: { ...localConfig.sectionTitles, structure: e.target.value } })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul Bagian Berita</label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        value={localConfig.sectionTitles?.news || 'Berita & Kegiatan'}
                        onChange={(e) => handleLocalUpdate({ sectionTitles: { ...localConfig.sectionTitles, news: e.target.value } })}
                    />
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

export default GeneralTab;
