import React, { useState } from 'react';
import { useConfig } from '../../contexts/ConfigContext';
import { MediaQuote } from '../../types';
import { Plus, Trash2, Edit2, Quote, Save, X } from 'lucide-react';
import ImageUpload from '../ImageUpload';

const MediaQuotesTab: React.FC = () => {
    const { config, updateConfig } = useConfig();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [tempQuote, setTempQuote] = useState<Partial<MediaQuote>>({});

    const handleAdd = () => {
        const newId = `new-${Date.now()}`;
        setEditingId(newId);
        setTempQuote({
            id: newId,
            content: '',
            source: '',
            author: '',
            date: new Date().toISOString().split('T')[0],
            url: ''
        });
    };

    const handleEdit = (quote: MediaQuote) => {
        setEditingId(quote.id);
        setTempQuote({ ...quote });
    };

    const handleSave = () => {
        if (!tempQuote.content || !tempQuote.source) {
            alert('Kutipan dan Sumber harus diisi');
            return;
        }

        const newQuotes = [...(config.mediaQuotes || [])];
        const index = newQuotes.findIndex(q => q.id === editingId);

        if (index >= 0) {
            newQuotes[index] = tempQuote as MediaQuote;
        } else {
            newQuotes.push(tempQuote as MediaQuote);
        }

        updateConfig({ mediaQuotes: newQuotes });
        setEditingId(null);
        setTempQuote({});
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus kutipan ini?')) {
            const newQuotes = config.mediaQuotes.filter(q => q.id !== id);
            updateConfig({ mediaQuotes: newQuotes });
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setTempQuote({});
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Kutipan Media</h2>
                    <p className="text-gray-500">Kelola kutipan dari tokoh atau media yang akan ditampilkan.</p>
                </div>
                <button
                    onClick={handleAdd}
                    disabled={!!editingId}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
                >
                    <Plus size={20} /> Tambah Kutipan
                </button>
            </div>

            {editingId && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-primary/20 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        {editingId.startsWith('new-') ? 'Tambah Kutipan Baru' : 'Edit Kutipan'}
                    </h3>
                    <div className="grid gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Isi Kutipan *</label>
                            <textarea
                                value={tempQuote.content || ''}
                                onChange={e => setTempQuote({ ...tempQuote, content: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[100px]"
                                placeholder="Masukkan isi kutipan..."
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sumber Media *</label>
                                <input
                                    type="text"
                                    value={tempQuote.source || ''}
                                    onChange={e => setTempQuote({ ...tempQuote, source: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="Contoh: Kompas, Detik, dll"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Tokoh (Opsional)</label>
                                <input
                                    type="text"
                                    value={tempQuote.author || ''}
                                    onChange={e => setTempQuote({ ...tempQuote, author: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="Nama tokoh yang dikutip"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal (Opsional)</label>
                                <input
                                    type="date"
                                    value={tempQuote.date || ''}
                                    onChange={e => setTempQuote({ ...tempQuote, date: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Link Sumber (Opsional)</label>
                                <input
                                    type="url"
                                    value={tempQuote.url || ''}
                                    onChange={e => setTempQuote({ ...tempQuote, url: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gambar (Opsional)</label>
                            <ImageUpload
                                currentImageUrl={tempQuote.imageUrl}
                                onUpload={(url) => setTempQuote({ ...tempQuote, imageUrl: url })}
                                label="Upload Gambar"
                                bucketName="images"
                                layout="vertical"
                            />
                            <p className="text-xs text-gray-500 mt-1">Gambar akan ditampilkan di sebelah kiri kutipan</p>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                            >
                                <Save size={18} /> Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid gap-4">
                {config.mediaQuotes?.map((quote) => (
                    <div key={quote.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start group hover:shadow-md transition">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                                <Quote size={20} />
                            </div>
                            <div>
                                <p className="text-gray-800 font-medium text-lg italic mb-2">"{quote.content}"</p>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span className="font-semibold text-primary">{quote.source}</span>
                                    {quote.author && <span>• {quote.author}</span>}
                                    {quote.date && <span>• {new Date(quote.date).toLocaleDateString('id-ID')}</span>}
                                </div>
                                {quote.url && (
                                    <a href={quote.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline mt-1 block">
                                        Lihat Sumber
                                    </a>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                            <button
                                onClick={() => handleEdit(quote)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Edit"
                            >
                                <Edit2 size={18} />
                            </button>
                            <button
                                onClick={() => handleDelete(quote.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Hapus"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {(!config.mediaQuotes || config.mediaQuotes.length === 0) && !editingId && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <Quote className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-gray-500">Belum ada kutipan media.</p>
                        <button onClick={handleAdd} className="text-primary font-medium hover:underline mt-2">
                            Tambah Kutipan Pertama
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MediaQuotesTab;
