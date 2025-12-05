import React, { useState } from 'react';
import { FileText, Plus, Trash, Calendar, Star, Tag, Image as ImageIcon, X, Globe, Eye, EyeOff, GripVertical } from 'lucide-react';
import ImageUpload from '../ImageUpload';
import { SiteConfig, NewsItem } from '../../types';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface NewsTabProps {
    localConfig: SiteConfig;
    handleLocalUpdate: (updates: Partial<SiteConfig>) => void;
}

// Sortable News Item Component
const SortableNewsItem = ({
    item,
    updateNews,
    removeNews,
    handleTagChange,
    handleAddImage,
    handleRemoveImage,
    modules
}: {
    item: NewsItem,
    updateNews: any,
    removeNews: any,
    handleTagChange: any,
    handleAddImage: any,
    handleRemoveImage: any,
    modules: any
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className={`bg-white p-6 rounded-2xl border-2 transition shadow-sm overflow-hidden relative group ${item.isFeatured ? 'border-yellow-400 ring-1 ring-yellow-400' : 'border-gray-200 hover:border-primary/30'}`}>
            <div className="absolute top-6 left-6 cursor-grab active:cursor-grabbing text-gray-400 hover:text-primary z-10" {...attributes} {...(listeners || {})}>
                <GripVertical size={20} />
            </div>

            <div className="pl-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 sm:gap-4 flex-wrap w-full sm:w-auto">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Calendar size={16} />
                            <input
                                type="date"
                                className="text-sm border rounded-lg px-2 sm:px-3 py-1.5 focus:ring-2 focus:ring-primary outline-none"
                                value={item.date}
                                onChange={(e) => updateNews(item.id, 'date', e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={item.status || 'draft'}
                                onChange={(e) => updateNews(item.id, 'status', e.target.value)}
                                className={`text-xs sm:text-sm border rounded-lg px-2 sm:px-3 py-1.5 focus:ring-2 focus:ring-primary outline-none font-medium ${item.status === 'published' ? 'text-green-600 bg-green-50 border-green-200' : 'text-gray-500 bg-gray-50 border-gray-200'}`}
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={item.isFeatured || false}
                                onChange={(e) => updateNews(item.id, 'isFeatured', e.target.checked)}
                                className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-500"
                            />
                            <span className={`text-xs sm:text-sm font-medium flex items-center gap-1 ${item.isFeatured ? 'text-yellow-600' : 'text-gray-500'}`}>
                                <Star size={14} fill={item.isFeatured ? "currentColor" : "none"} />
                                <span className="hidden sm:inline">Berita Pilihan</span>
                            </span>
                        </label>
                    </div>
                    <button
                        onClick={() => removeNews(item.id)}
                        className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-lg hover:bg-red-100 transition flex items-center gap-1 w-full sm:w-auto justify-center"
                    >
                        <Trash size={16} />
                        <span className="text-xs font-semibold">Hapus</span>
                    </button>
                </div>

                <div className="grid md:grid-cols-[300px,1fr] gap-6">
                    {/* Image Management */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-2">Gambar Utama</label>
                            <ImageUpload
                                currentImageUrl={item.imageUrl}
                                onUpload={(url) => updateNews(item.id, 'imageUrl', url)}
                                label="Ganti Cover"
                                bucketName="images"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-2 flex justify-between">
                                <span>Galeri ({item.images?.length || 0}/10)</span>
                            </label>
                            <div className="grid grid-cols-3 gap-2 mb-2">
                                {item.images?.map((img, idx) => (
                                    <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                                        <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => handleRemoveImage(item.id, idx, item.images || [])}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition transform hover:scale-110"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                ))}
                                {(item.images?.length || 0) < 10 && (
                                    <div className="aspect-square">
                                        <ImageUpload
                                            currentImageUrl=""
                                            onUpload={(url) => handleAddImage(item.id, url, item.images)}
                                            label="+"
                                            bucketName="images"
                                            layout="vertical"
                                        />
                                    </div>
                                )}
                            </div>
                            <p className="text-[10px] text-gray-400">Upload gambar tambahan untuk carousel.</p>
                        </div>
                    </div>

                    {/* News Content */}
                    <div className="space-y-4 min-w-0">
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
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs font-medium text-gray-600">Slug URL (Link Berita)</label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const slug = item.title
                                            .toLowerCase()
                                            .replace(/[^a-z0-9]+/g, '-')
                                            .replace(/(^-|-$)+/g, '');
                                        updateNews(item.id, 'slug', slug);
                                    }}
                                    className="text-xs text-primary hover:underline"
                                >
                                    Auto-generate
                                </button>
                            </div>
                            <input
                                type="text"
                                className="w-full p-2.5 border rounded-lg text-sm font-mono text-gray-700 focus:ring-2 focus:ring-primary outline-none"
                                placeholder="judul-berita-seperti-ini"
                                value={item.slug || ''}
                                onChange={(e) => {
                                    const slug = e.target.value
                                        .toLowerCase()
                                        .replace(/[^a-z0-9-]/g, '');
                                    updateNews(item.id, 'slug', slug);
                                }}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                                <Tag size={12} /> Tagar (pisahkan dengan koma)
                            </label>
                            <input
                                type="text"
                                className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                                placeholder="Contoh: politik, pemilu, kegiatan"
                                value={item.tags?.join(', ') || ''}
                                onChange={(e) => handleTagChange(item.id, e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Konten Berita</label>
                            <div className="bg-white rounded-lg border overflow-hidden">
                                <ReactQuill
                                    theme="snow"
                                    value={item.content}
                                    onChange={(content) => updateNews(item.id, 'content', content)}
                                    modules={modules}
                                    className="h-64 mb-12"
                                />
                            </div>
                        </div>

                        {/* SEO Fields */}
                        <div className="pt-4 border-t mt-4">
                            <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Globe size={14} /> SEO & Meta Data
                            </h5>
                            <div className="grid gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Meta Description</label>
                                    <textarea
                                        className="w-full p-2.5 border rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-primary outline-none resize-none"
                                        placeholder="Deskripsi singkat untuk mesin pencari (maks 160 karakter)..."
                                        rows={2}
                                        maxLength={160}
                                        value={item.metaDescription || ''}
                                        onChange={(e) => updateNews(item.id, 'metaDescription', e.target.value)}
                                    />
                                    <p className="text-[10px] text-gray-400 text-right">{(item.metaDescription || '').length}/160</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Meta Keywords</label>
                                    <input
                                        type="text"
                                        className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="keyword1, keyword2, keyword3"
                                        value={item.metaKeywords || ''}
                                        onChange={(e) => updateNews(item.id, 'metaKeywords', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NewsTab: React.FC<NewsTabProps> = ({ localConfig, handleLocalUpdate }) => {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'clean']
        ],
    };

    const addNews = () => {
        const newNews: NewsItem = {
            id: `new-${Date.now()}`,
            title: "Judul Berita Baru",
            date: new Date().toISOString().split('T')[0],
            content: "Tulis konten berita di sini...",
            imageUrl: "https://placehold.co/600x400",
            images: [],
            isFeatured: false,
            tags: [],
            status: 'draft',
            orderIndex: localConfig.news.length // Add to end
        };
        handleLocalUpdate({ news: [...localConfig.news, newNews] });
    };

    const updateNews = (id: string, field: keyof NewsItem, value: any) => {
        const updatedNews = localConfig.news.map(n => n.id === id ? { ...n, [field]: value } : n);
        handleLocalUpdate({ news: updatedNews });
    };

    const removeNews = (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus berita ini?')) {
            handleLocalUpdate({ news: localConfig.news.filter(n => n.id !== id) });
        }
    };

    const handleTagChange = (id: string, tagsString: string) => {
        const tags = tagsString.split(',').map(t => t.trim()).filter(t => t);
        updateNews(id, 'tags', tags);
    };

    const handleAddImage = (id: string, url: string, currentImages: string[] = []) => {
        updateNews(id, 'images', [...currentImages, url]);
    };

    const handleRemoveImage = (id: string, indexToRemove: number, currentImages: string[]) => {
        const newImages = currentImages.filter((_, idx) => idx !== indexToRemove);
        updateNews(id, 'images', newImages);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = localConfig.news.findIndex((item) => item.id === active.id);
            const newIndex = localConfig.news.findIndex((item) => item.id === over.id);

            const newNews = arrayMove(localConfig.news, oldIndex, newIndex);

            // Update orderIndex for all items
            const reorderedNews = newNews.map((item, index) => ({
                ...item,
                orderIndex: index
            }));

            handleLocalUpdate({ news: reorderedNews });
        }
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

            {/* Section Title & Description */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h4 className="text-md font-semibold mb-4">Judul & Deskripsi Seksi</h4>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Judul Seksi</label>
                        <input
                            type="text"
                            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            placeholder="Berita & Kegiatan"
                            value={localConfig.sectionTitles?.news || 'Berita & Kegiatan'}
                            onChange={(e) => handleLocalUpdate({
                                sectionTitles: {
                                    ...localConfig.sectionTitles,
                                    news: e.target.value
                                }
                            })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Seksi</label>
                        <textarea
                            className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                            placeholder="Deskripsi singkat untuk seksi berita..."
                            rows={2}
                            value={localConfig.sectionDescriptions?.news || ''}
                            onChange={(e) => handleLocalUpdate({
                                sectionDescriptions: {
                                    ...localConfig.sectionDescriptions,
                                    news: e.target.value,
                                    structure: localConfig.sectionDescriptions?.structure || ''
                                }
                            })}
                        />
                    </div>
                </div>
            </div>

            {/* News Items */}
            <div className="space-y-4">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={localConfig.news.map(n => n.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {localConfig.news.map((item) => (
                            <SortableNewsItem
                                key={item.id}
                                item={item}
                                updateNews={updateNews}
                                removeNews={removeNews}
                                handleTagChange={handleTagChange}
                                handleAddImage={handleAddImage}
                                handleRemoveImage={handleRemoveImage}
                                modules={modules}
                            />
                        ))}
                    </SortableContext>
                </DndContext>

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
