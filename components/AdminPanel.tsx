import React, { useState, useEffect } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { Save, Loader2, LogOut } from 'lucide-react';
import GeneralTab from './admin/GeneralTab';
import HeaderFooterTab from './admin/HeaderFooterTab';
import HeroTab from './admin/HeroTab';
import AboutTab from './admin/AboutTab';
import TeamTab from './admin/TeamTab';
import NewsTab from './admin/NewsTab';
import MediaQuotesTab from './admin/MediaQuotesTab';

import { SiteConfig } from '../types';

const AdminPanel: React.FC = () => {
  const { config, updateConfig, logout } = useConfig();
  const [activeTab, setActiveTab] = useState<'general' | 'hero' | 'about' | 'team' | 'news' | 'media_quotes' | 'header_footer'>('general');

  // Local state for manual save
  const [localConfig, setLocalConfig] = useState<SiteConfig>(config);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync local config with global config
  useEffect(() => {
    if (!hasChanges) {
      setLocalConfig(config);
    }
  }, [config, hasChanges]);

  // Update browser tab title and favicon dynamically
  useEffect(() => {
    if (localConfig.identity.name) {
      document.title = localConfig.identity.name;
    }

    if (localConfig.identity.logoUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = localConfig.identity.logoUrl;
    }
  }, [localConfig.identity.name, localConfig.identity.logoUrl]);

  const handleLocalUpdate = (updates: Partial<SiteConfig>) => {
    setLocalConfig(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const saveChanges = async () => {
    setIsSaving(true);
    try {
      await updateConfig(localConfig);
      setHasChanges(false);
      alert("✅ Perubahan berhasil disimpan!");
    } catch (error) {
      console.error("Failed to save changes:", error);
      alert("❌ Gagal menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-gray-50 shadow-2xl z-50 overflow-y-auto border-l-2 border-primary/30">
      {/* Header with Prominent Save Button */}
      <div className="sticky top-0 bg-gradient-to-r from-white via-blue-50 to-white z-20 px-6 py-4 border-b-2 border-primary/30 shadow-lg">
        <div className="flex justify-between items-center gap-4">
          <div className="flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
            {hasChanges ? (
              <p className="text-xs text-orange-600 mt-1 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                Belum disimpan
              </p>
            ) : (
              <p className="text-xs text-green-600 mt-1 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Tersimpan
              </p>
            )}
          </div>

          <div className="flex gap-2 items-center">
            {hasChanges && (
              <button
                onClick={saveChanges}
                disabled={isSaving}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    SIMPAN
                  </>
                )}
              </button>
            )}
            <button
              onClick={logout}
              className="p-2.5 text-red-600 hover:text-red-800 rounded-lg hover:bg-red-50"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-6 py-3 bg-white border-b overflow-x-auto sticky top-[88px] z-10">
        <div className="flex space-x-2">
          {['general', 'header_footer', 'hero', 'about', 'team', 'news', 'media_quotes'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${activeTab === tab
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {tab === 'header_footer' ? 'Header & Footer' : tab === 'media_quotes' ? 'Kutipan Media' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6 pb-24">
        {activeTab === 'general' && <GeneralTab localConfig={localConfig} handleLocalUpdate={handleLocalUpdate} />}
        {activeTab === 'header_footer' && <HeaderFooterTab localConfig={localConfig} handleLocalUpdate={handleLocalUpdate} />}
        {activeTab === 'hero' && <HeroTab localConfig={localConfig} handleLocalUpdate={handleLocalUpdate} />}
        {activeTab === 'about' && <AboutTab localConfig={localConfig} handleLocalUpdate={handleLocalUpdate} />}
        {activeTab === 'team' && <TeamTab localConfig={localConfig} handleLocalUpdate={handleLocalUpdate} />}
        {activeTab === 'news' && <NewsTab localConfig={localConfig} handleLocalUpdate={handleLocalUpdate} />}
        {activeTab === 'media_quotes' && <MediaQuotesTab localConfig={localConfig} handleLocalUpdate={handleLocalUpdate} />}
      </div>
    </div>
  );
};

export default AdminPanel;