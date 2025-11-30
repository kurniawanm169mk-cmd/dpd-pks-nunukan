import React from 'react';
import { Users, Plus, Trash } from 'lucide-react';
import ImageUpload from '../ImageUpload';
import { SiteConfig, TeamMember } from '../../types';

interface TeamTabProps {
    localConfig: SiteConfig;
    handleLocalUpdate: (updates: Partial<SiteConfig>) => void;
}

const TeamTab: React.FC<TeamTabProps> = ({ localConfig, handleLocalUpdate }) => {
    const addMember = () => {
        const newMember: TeamMember = {
            id: `new-${Date.now()}`,
            name: "Nama Anggota",
            role: "Jabatan",
            photoUrl: "https://placehold.co/150",
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
            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Users size={18} /> Struktur Organisasi
                </h3>
                <button
                    onClick={addMember}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-green-700 transition shadow-md"
                >
                    <Plus size={16} /> Tambah Anggota
                </button>
            </div>

            {/* Section Colors */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h4 className="text-md font-semibold mb-4">Warna Seksi Tim</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Warna Background</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                className="w-12 h-12 rounded cursor-pointer border-0"
                                value={localConfig.teamBackgroundColor || '#ffffff'}
                                onChange={(e) => handleLocalUpdate({ teamBackgroundColor: e.target.value })}
                            />
                            <span className="text-sm text-gray-600">{localConfig.teamBackgroundColor || '#ffffff'}</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Warna Teks</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                className="w-12 h-12 rounded cursor-pointer border-0"
                                value={localConfig.teamTextColor || '#111827'}
                                onChange={(e) => handleLocalUpdate({ teamTextColor: e.target.value })}
                            />
                            <span className="text-sm text-gray-600">{localConfig.teamTextColor || '#111827'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Team Members */}
            <div className="space-y-4">
                {localConfig.team.map((member) => (
                    <div key={member.id} className="bg-white p-5 rounded-2xl border-2 border-gray-200 hover:border-primary/30 transition shadow-sm">
                        <div className="flex justify-end mb-3">
                            <button
                                onClick={() => removeMember(member.id)}
                                className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-lg hover:bg-red-100 transition flex items-center gap-1"
                            >
                                <Trash size={16} />
                                <span className="text-xs font-semibold">Hapus</span>
                            </button>
                        </div>

                        <div className="grid md:grid-cols-[180px,1fr] gap-5">
                            {/* Photo Upload */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-2">Foto Anggota</label>
                                <ImageUpload
                                    currentImageUrl={member.photoUrl}
                                    onUpload={(url) => updateMember(member.id, 'photoUrl', url)}
                                    label=""
                                    bucketName="images"
                                    layout="vertical"
                                />
                            </div>

                            {/* Member Info */}
                            <div className="space-y-3">
                                <div className="grid md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Nama Lengkap</label>
                                        <input
                                            type="text"
                                            placeholder="Nama Anggota"
                                            className="w-full p-2.5 border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-primary outline-none"
                                            value={member.name}
                                            onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Jabatan</label>
                                        <input
                                            type="text"
                                            placeholder="Jabatan"
                                            className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                                            value={member.role}
                                            onChange={(e) => updateMember(member.id, 'role', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Deskripsi/Bio</label>
                                    <textarea
                                        placeholder="Deskripsi singkat tentang anggota..."
                                        className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                                        rows={3}
                                        value={member.description || ''}
                                        onChange={(e) => updateMember(member.id, 'description', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {localConfig.team.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                        <Users size={48} className="mx-auto mb-3 opacity-30 text-gray-400" />
                        <p className="text-gray-500 mb-3">Belum ada anggota tim.</p>
                        <button
                            onClick={addMember}
                            className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition"
                        >
                            Tambah Anggota Pertama
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamTab;
