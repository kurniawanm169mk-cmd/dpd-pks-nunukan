import React from 'react';
import { Layout, X, Image as ImageIcon } from 'lucide-react';
import ImageUpload from '../ImageUpload';
import { SiteConfig } from '../../types';

interface HeroTabProps {
    localConfig: SiteConfig;
    handleLocalUpdate: (updates: Partial<SiteConfig>) => void;
}

const HeroTab: React.FC<HeroTabProps> = ({ localConfig, handleLocalUpdate }) => {
    const images = localConfig.hero.images || (localConfig.hero.imageUrl ? [localConfig.hero.imageUrl] : []);

    const addHeroImage = (url: string) => {
        if (!url) return;
        const newImages = [...images, url];
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
            {/* Colors */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Layout size={18} /> Warna Hero Section
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Warna Background</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                className="w-12 h-12 rounded cursor-pointer border-0"
                                value={localConfig.hero.backgroundColor || '#ffffff'}
                                onChange={(e) => handleLocalUpdate({ hero: { ...localConfig.hero, backgroundColor: e.target.value } })}
                            />
                            <span className="text-sm text-gray-600">{localConfig.hero.backgroundColor || '#ffffff'}</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Warna Teks</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                className="w-12 h-12 rounded cursor-pointer border-0"
                                value={localConfig.hero.textColor || '#111827'}
                                onChange={(e) => handleLocalUpdate({ hero: { ...localConfig.hero, textColor: e.target.value } })}
                            />
                            <span className="text-sm text-gray-600">{localConfig.hero.textColor || '#111827'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Text Content */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Konten Hero</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Judul Utama</label>
                        <input
                            type="text"
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            value={localConfig.hero.title}
                            onChange={(e) => handleLocalUpdate({ hero: { ...localConfig.hero, title: e.target.value } })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sub Judul</label>
                        <textarea
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
                            rows={3}
                            value={localConfig.hero.subtitle}
                            onChange={(e) => handleLocalUpdate({ hero: { ...localConfig.hero, subtitle: e.target.value } })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Teks Tombol CTA</label>
                        <input
                            type="text"
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            value={localConfig.hero.ctaText}
                            onChange={(e) => handleLocalUpdate({ hero: { ...localConfig.hero, ctaText: e.target.value } })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Link Tombol CTA (Opsional)</label>
                        <input
                            type="text"
                            placeholder="#contact atau https://..."
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            value={localConfig.hero.ctaButtonLink || ''}
                            onChange={(e) => handleLocalUpdate({ hero: { ...localConfig.hero, ctaButtonLink: e.target.value } })}
                        />
                    </div>
                </div>
            </div>

            {/* Hero Carousel Images */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <ImageIcon size={18} /> Gambar Carousel (Max 15)
                    </h3>
                    <span className="text-sm text-gray-500">{images.length} / 15</span>
                </div>

                {/* Add New Image */}
                {images.length < 15 && (
                    <div className="mb-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <ImageUpload
                            onUpload={addHeroImage}
                            label="Tambah Gambar Baru ke Carousel"
                            bucketName="images"
                        />
                    </div>
                )}

                {/* Existing Images Grid */}
                {images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {images.map((img, idx) => (
                            <div key={idx} className="relative group bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary/50 transition">
                                <div className="aspect-video">
                                    <img src={img} alt={`Hero ${idx + 1}`} className="w-full h-full object-cover" />
                                </div>
                                {/* Overlay on Hover */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        onClick={() => removeHeroImage(idx)}
                                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-1 text-sm font-semibold"
                                    >
                                        <X size={16} />
                                        Hapus
                                    </button>
                                </div>
                                {/* Slide Number */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                    <p className="text-white text-xs font-bold">Slide {idx + 1}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {images.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                        <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Belum ada gambar. Tambahkan gambar untuk carousel.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HeroTab;
