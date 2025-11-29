import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteConfig, ConfigContextType } from '../types';
import { DEFAULT_CONFIG } from '../constants';

interface ExtendedConfigContextType extends ConfigContextType {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const ConfigContext = createContext<ExtendedConfigContextType | undefined>(undefined);

import { supabase } from '../services/supabaseClient';

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfigState] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAdmin(true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Initial Load from Supabase
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .single();

        if (error) {
          console.error('Error loading config from Supabase:', error);
          // Fallback to local storage if Supabase fails (e.g. offline)
          const saved = localStorage.getItem('siteConfig');
          if (saved) {
            setConfigState({ ...DEFAULT_CONFIG, ...JSON.parse(saved) });
          }
        } else if (data) {
          // Merge Supabase data with default config to ensure type safety
          const mergedConfig: SiteConfig = {
            ...DEFAULT_CONFIG,
            identity: { ...DEFAULT_CONFIG.identity, ...data.identity },
            header: { ...DEFAULT_CONFIG.header, ...data.header },
            footer: { ...DEFAULT_CONFIG.footer, ...data.footer },
            registration: { ...DEFAULT_CONFIG.registration, ...data.registration },
            theme: { ...DEFAULT_CONFIG.theme, ...data.theme },
            hero: { ...DEFAULT_CONFIG.hero, ...data.hero },
            about: { ...DEFAULT_CONFIG.about, ...data.about },
            contact: { ...DEFAULT_CONFIG.contact, ...data.contact },
            // Handle flat fields
            teamBackgroundColor: data.team_background_color || DEFAULT_CONFIG.teamBackgroundColor,
            teamTextColor: data.team_text_color || DEFAULT_CONFIG.teamTextColor,
            newsBackgroundColor: data.news_background_color || DEFAULT_CONFIG.newsBackgroundColor,
            newsTextColor: data.news_text_color || DEFAULT_CONFIG.newsTextColor,
            // Arrays need separate fetching usually, but for now let's assume they are NOT in site_settings JSONB
            // Wait, schema says site_settings has JSONB fields.
            // But Team and News are separate tables in schema!
            // We need to fetch them separately.
          };

          // Fetch Team
          const { data: teamData } = await supabase.from('team_members').select('*');
          if (teamData) {
            mergedConfig.team = teamData.map(t => ({
              id: t.id,
              name: t.name,
              role: t.role,
              photoUrl: t.photo_url,
              description: t.description
            }));
          }

          // Fetch News
          const { data: newsData } = await supabase.from('news_items').select('*');
          if (newsData) {
            mergedConfig.news = newsData.map(n => ({
              id: n.id,
              title: n.title,
              date: n.date,
              content: n.content,
              imageUrl: n.image_url
            }));
          }

          // Fetch Socials
          const { data: socialData } = await supabase.from('social_links').select('*');
          if (socialData) {
            mergedConfig.socialMedia = socialData.map(s => ({
              id: s.id,
              platform: s.platform,
              url: s.url,
              iconUrl: s.icon_url
            }));
          }

          setConfigState(mergedConfig);
        }
      } catch (err) {
        console.error('Unexpected error loading config:', err);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  // Sync CSS Variables
  useEffect(() => {
    if (!loading) {
      document.documentElement.style.setProperty('--color-primary', config.theme.primaryColor);
      document.documentElement.style.setProperty('--color-secondary', config.theme.secondaryColor);
      document.documentElement.style.setProperty('--color-btn', config.theme.buttonColor || config.theme.primaryColor);
      document.documentElement.style.setProperty('--color-btn-hover', config.theme.buttonHoverColor || config.theme.secondaryColor);
    }
  }, [config, loading]);

  const updateConfig = async (newConfig: Partial<SiteConfig>) => {
    // Optimistic update
    setConfigState((prev) => {
      const updated = { ...prev, ...newConfig };
      // Save to local storage as backup
      localStorage.setItem('siteConfig', JSON.stringify(updated));
      return updated;
    });

    // Save to Supabase
    try {
      // 1. Update site_settings (Singleton)
      const settingsUpdate: any = {};
      if (newConfig.identity) settingsUpdate.identity = newConfig.identity;
      if (newConfig.header) settingsUpdate.header = newConfig.header;
      if (newConfig.footer) settingsUpdate.footer = newConfig.footer;
      if (newConfig.registration) settingsUpdate.registration = newConfig.registration;
      if (newConfig.theme) settingsUpdate.theme = newConfig.theme;
      if (newConfig.hero) settingsUpdate.hero = newConfig.hero;
      if (newConfig.about) settingsUpdate.about = newConfig.about;
      if (newConfig.contact) settingsUpdate.contact = newConfig.contact;
      if (newConfig.teamBackgroundColor) settingsUpdate.team_background_color = newConfig.teamBackgroundColor;
      if (newConfig.teamTextColor) settingsUpdate.team_text_color = newConfig.teamTextColor;
      if (newConfig.newsBackgroundColor) settingsUpdate.news_background_color = newConfig.newsBackgroundColor;
      if (newConfig.newsTextColor) settingsUpdate.news_text_color = newConfig.newsTextColor;

      if (Object.keys(settingsUpdate).length > 0) {
        await supabase.from('site_settings').update(settingsUpdate).eq('id', 1);
      }

      // 2. Handle Arrays (Team, News, Socials) - This is tricky with Partial<SiteConfig>
      // A better approach for a real app is separate methods (addTeamMember, updateTeamMember),
      // but to keep API compatible with existing code, we'll check if array references changed.

      // NOTE: This is a simplified sync. For production, you'd want granular updates.
      // Here we are just detecting if the array is in the newConfig and if so, we might need to sync.
      // However, the current AdminPanel passes the ENTIRE array.

      if (newConfig.team) {
        // Map to database format
        const teamToSave = newConfig.team.map(t => {
          const item: any = {
            name: t.name,
            role: t.role,
            photo_url: t.photoUrl,
            description: t.description
          };
          // Only include ID if it looks like a UUID (has dashes)
          // New items from AdminPanel have numeric IDs, let Supabase generate UUID
          if (t.id.includes('-')) {
            item.id = t.id;
          }
          return item;
        });

        const { data, error } = await supabase.from('team_members').upsert(teamToSave, { onConflict: 'id' }).select();
        if (error) {
          console.error('Error syncing team:', error);
        } else if (data) {
          // Update local state with server-generated IDs
          setConfigState(prev => ({
            ...prev,
            team: data.map(t => ({
              id: t.id,
              name: t.name,
              role: t.role,
              photoUrl: t.photo_url,
              description: t.description
            }))
          }));
        }

        // Handle deletions - only delete items with valid UUIDs
        const uuidIds = newConfig.team.filter(m => m.id.includes('-')).map(m => m.id);
        if (uuidIds.length > 0) {
          await supabase.from('team_members').delete().not('id', 'in', `(${uuidIds.map(id => `'${id}'`).join(',')})`);
        } else {
          await supabase.from('team_members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        }
      }

      if (newConfig.news) {
        // Map to database format
        const newsToSave = newConfig.news.map(n => {
          const item: any = {
            title: n.title,
            date: n.date,
            content: n.content,
            image_url: n.imageUrl
          };
          // Only include ID if it looks like a UUID
          if (n.id.includes('-')) {
            item.id = n.id;
          }
          return item;
        });

        const { data, error } = await supabase.from('news_items').upsert(newsToSave, { onConflict: 'id' }).select();
        if (error) {
          console.error('Error syncing news:', error);
        } else if (data) {
          // Update local state with server-generated IDs
          setConfigState(prev => ({
            ...prev,
            news: data.map(n => ({
              id: n.id,
              title: n.title,
              date: n.date,
              content: n.content,
              imageUrl: n.image_url
            }))
          }));
        }

        const uuidIds = newConfig.news.filter(n => n.id.includes('-')).map(n => n.id);
        if (uuidIds.length > 0) {
          await supabase.from('news_items').delete().not('id', 'in', `(${uuidIds.map(id => `'${id}'`).join(',')})`);
        } else {
          await supabase.from('news_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        }
      }

      if (newConfig.socialMedia) {
        // Map to database format
        const socialToSave = newConfig.socialMedia.map(s => {
          const item: any = {
            platform: s.platform,
            url: s.url,
            icon_url: s.iconUrl
          };
          // Only include ID if it looks like a UUID
          if (s.id.includes('-')) {
            item.id = s.id;
          }
          return item;
        });

        const { data, error } = await supabase.from('social_links').upsert(socialToSave, { onConflict: 'id' }).select();
        if (error) {
          console.error('Error syncing social:', error);
        } else if (data) {
          // Update local state with server-generated IDs
          setConfigState(prev => ({
            ...prev,
            socialMedia: data.map(s => ({
              id: s.id,
              platform: s.platform,
              url: s.url,
              iconUrl: s.icon_url
            }))
          }));
        }

        const uuidIds = newConfig.socialMedia.filter(s => s.id.includes('-')).map(s => s.id);
        if (uuidIds.length > 0) {
          await supabase.from('social_links').delete().not('id', 'in', `(${uuidIds.map(id => `'${id}'`).join(',')})`);
        } else {
          await supabase.from('social_links').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        }
      }

    } catch (err) {
      console.error('Error saving to Supabase:', err);
    }
  };

  const resetConfig = () => {
    setConfigState(DEFAULT_CONFIG);
    // Reset Supabase? Maybe not safe to wipe DB on one click.
    // Let's just reset local state for now, or warn user.
    alert("Resetting to defaults locally. Save to persist.");
  };

  const toggleAdmin = () => setIsAdmin(!isAdmin);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password: password,
      });

      if (error) {
        console.error('Login error:', error.message);
        // Fallback for legacy local admin (optional, but good for transition)
        if (username === 'admin' && password === 'admin123') {
          setIsAdmin(true);
          return true;
        }
        return false;
      }

      if (data.user) {
        setIsAdmin(true);
        return true;
      }

      return false;
    } catch (e) {
      console.error('Login exception:', e);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <ConfigContext.Provider value={{ config, updateConfig, resetConfig, isAdmin, toggleAdmin, login, logout }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};