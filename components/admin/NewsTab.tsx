import React from 'react';
import { FileText, Plus, Trash, Calendar } from 'lucide-react';
import ImageUpload from '../ImageUpload';
import { SiteConfig, NewsItem } from '../../types';

interface NewsTabProps {
    localConfig: SiteConfig;
    handleLocalUpdate: (updates: Partial<SiteConfig>) => void;
}

const NewsTab: React.FC<NewsTabProps> = ({ localConfig, handleLocalUpdate }) => {
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
            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText size={18} /> Berita & Kegiatan
                </h3>
                <button
                    onClick={addNews}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-green-700 transition shadow-md"
                >
                    <Plus size={16} /> Buat Berita
                </button>
            </div>

            {/* Section Colors */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h4 className="text-md font-semibold mb-4">Warna Seksi Berita</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Warna Background</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                className="w-12 h-12 rounded cursor-pointer border-0"
                                value={localConfig.newsBackgroundColor || '#f9fafb'}
                                onChange={(e) => handleLocalUpdate({ newsBackgroundColor: e.target.value })}
                            />
                            <span className="text-sm text-gray-600">{localConfig.newsBackgroundColor || '#f9fafb'}</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Warna Teks</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                className="w-12 h-12 rounded cursor-pointer border-0"
                                value={localConfig.newsTextColor || '#111827'}
                                onChange={(e) => handleLocalUpdate({ newsTextColor: e.target.value })}
                            />
                            <span className="text-sm text-gray-600">{localConfig.newsTextColor || '#111827'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* News Items */}
            <div className="space-y-4">
                {localConfig.news.map((item) => (
                    <div key={item.id} className="bg-white p-5 rounded-2xl border-2 border-gray-200 hover:border-primary/30 transition shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Calendar size={16} />
                                <input
                                    type="date"
                                    className="text-sm border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary outline-none"
                                    value={item.date}
                                    onChange={(e) => updateNews(item.id, 'date', e.target.value)}
                                />
                            </div>
                            <button
                                onClick={() => removeNews(item.id)}
                                className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-lg hover:bg-red-100 transition flex items-center gap-1"
                            >
                                <Trash size={16} />
                                <span className="text-xs font-semibold">Hapus</span>
                            </button>
                        </div>

                        <div className="grid md:grid-cols-[240px,1fr] gap-5">
                            {/* Image Upload */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-2">Gambar Berita</label>
                                <ImageUpload
                                    currentImageUrl={item.imageUrl}
                                    onUpload={(url) => updateNews(item.id, 'imageUrl', url)}
                                    label=""
                                    bucketName="images"
                                />
                            </div>

                            {/* News Content */}
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Judul Berita</label>
                                    <input
                                        type="text"
                                        className="w-full p-2.5 border rounded-lg font-bold text-gray-800 focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="Judul berita..."
                                        value={item.title}
                                        onChange={(e) => updateNews(item.id, 'title', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Konten Berita</label>
                                    <textarea
                                        className="w-full p-2.5 border rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-primary outline-none resize-none"
                                        placeholder="Isi berita..."
                                        rows={4}
                                        value={item.content}
                                        onChange={(e) => updateNews(item.id, 'content', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {localConfig.news.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                        <FileText size={48} className="mx-auto mb-3 opacity-30 text-gray-400" />
                        <p className="text-gray-500 mb-3">Belum ada berita.</p>
                        <button
                            onClick={addNews}
                            className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition"
                        >
                            Buat Berita Pertama
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsTab;
