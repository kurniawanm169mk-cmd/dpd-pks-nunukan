import React from 'react';
import { FileText } from 'lucide-react';
import ImageUpload from '../ImageUpload';
import { SiteConfig } from '../../types';

interface AboutTabProps {
    localConfig: SiteConfig;
    handleLocalUpdate: (updates: Partial<SiteConfig>) => void;
}

const AboutTab: React.FC<AboutTabProps> = ({ localConfig, handleLocalUpdate }) => (
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
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul Overlay Gambar</label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        placeholder="Contoh: Visi Kami"
                        value={localConfig.about.imageOverlayTitle || ''}
                        onChange={(e) => handleLocalUpdate({ about: { ...localConfig.about, imageOverlayTitle: e.target.value } })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subjudul Overlay Gambar</label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        placeholder="Contoh: Mewujudkan masyarakat yang adil dan makmur."
                        value={localConfig.about.imageOverlaySubtitle || ''}
                        onChange={(e) => handleLocalUpdate({ about: { ...localConfig.about, imageOverlaySubtitle: e.target.value } })}
                    />
                </div>
            </div>
        </div>
    </div>
);

export default AboutTab;
