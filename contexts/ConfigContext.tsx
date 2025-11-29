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
              iconUrl: s.icon_url,
              iconColor: s.icon_color
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
        // Separate new items from existing items
        const newItems = newConfig.team.filter(t => !t.id.includes('-'));
        const existingItems = newConfig.team.filter(t => t.id.includes('-'));

        let allTeamData = [...existingItems];

        // Insert new items (without ID, let DB generate UUID)
        if (newItems.length > 0) {
          const newTeamData = newItems.map(t => ({
            name: t.name,
            role: t.role,
            photo_url: t.photoUrl,
            description: t.description
          }));

          const { data, error } = await supabase.from('team_members').insert(newTeamData).select();
          if (error) {
            console.error('Error inserting team:', error);
          } else if (data) {
            allTeamData = [...allTeamData, ...data.map(t => ({
              id: t.id,
              name: t.name,
              role: t.role,
              photoUrl: t.photo_url,
              description: t.description
            }))];
          }
        }

        // Update existing items
        for (const item of existingItems) {
          const { error } = await supabase
            .from('team_members')
            .update({
              name: item.name,
              role: item.role,
              photo_url: item.photoUrl,
              description: item.description
            })
            .eq('id', item.id);

          if (error) console.error('Error updating team member:', error);
        }

        // Update local state with all team data
        setConfigState(prev => ({ ...prev, team: allTeamData }));

        // Handle deletions - fetch all current DB team members and delete those not in allTeamData
        const { data: dbTeamMembers } = await supabase.from('team_members').select('id');
        if (dbTeamMembers) {
          const currentIds = allTeamData.map(m => m.id);
          const idsToDelete = dbTeamMembers
            .map(dbMember => dbMember.id)
            .filter(dbId => !currentIds.includes(dbId));

          // Delete each removed member
          for (const idToDelete of idsToDelete) {
            const { error } = await supabase.from('team_members').delete().eq('id', idToDelete);
            if (error) console.error('Error deleting team member:', idToDelete, error);
          }
        }
      }

      if (newConfig.news) {
        const newItems = newConfig.news.filter(n => !n.id.includes('-'));
        const existingItems = newConfig.news.filter(n => n.id.includes('-'));

        let allNewsData = [...existingItems];

        // Insert new items
        if (newItems.length > 0) {
          const newNewsData = newItems.map(n => ({
            title: n.title,
            date: n.date,
            content: n.content,
            image_url: n.imageUrl
          }));

          const { data, error } = await supabase.from('news_items').insert(newNewsData).select();
          if (error) {
            console.error('Error inserting news:', error);
          } else if (data) {
            allNewsData = [...allNewsData, ...data.map(n => ({
              id: n.id,
              title: n.title,
              date: n.date,
              content: n.content,
              imageUrl: n.image_url
            }))];
          }
        }

        // Update existing items
        for (const item of existingItems) {
          const { error } = await supabase
            .from('news_items')
            .update({
              title: item.title,
              date: item.date,
              content: item.content,
              image_url: item.imageUrl
            })
            .eq('id', item.id);

          if (error) console.error('Error updating news:', error);
        }

        setConfigState(prev => ({ ...prev, news: allNewsData }));

        // Handle deletions - fetch all current DB news items and delete those not in allNewsData
        const { data: dbNewsItems } = await supabase.from('news_items').select('id');
        if (dbNewsItems) {
          const currentIds = allNewsData.map(n => n.id);
          const idsToDelete = dbNewsItems
            .map(dbNews => dbNews.id)
            .filter(dbId => !currentIds.includes(dbId));

          // Delete each removed news item
          for (const idToDelete of idsToDelete) {
            const { error } = await supabase.from('news_items').delete().eq('id', idToDelete);
            if (error) console.error('Error deleting news item:', idToDelete, error);
          }
        }
      }

      if (newConfig.socialMedia) {
        const newItems = newConfig.socialMedia.filter(s => !s.id.includes('-'));
        const existingItems = newConfig.socialMedia.filter(s => s.id.includes('-'));

        let allSocialData = [...existingItems];

        // Insert new items
        if (newItems.length > 0) {
          const newSocialData = newItems.map(s => ({
            platform: s.platform,
            url: s.url,
            icon_url: s.iconUrl,
            icon_color: s.iconColor
          }));

          const { data, error } = await supabase.from('social_links').insert(newSocialData).select();
          if (error) {
            console.error('Error inserting social:', error);
          } else if (data) {
            allSocialData = [...allSocialData, ...data.map(s => ({
              id: s.id,
              platform: s.platform,
              url: s.url,
              iconUrl: s.icon_url,
              iconColor: s.icon_color
            }))];
          }
        }

        // Update existing items
        for (const item of existingItems) {
          const { error } = await supabase
            .from('social_links')
            .update({
              platform: item.platform,
              url: item.url,
              icon_url: item.iconUrl,
              icon_color: item.iconColor
            })
            .eq('id', item.id);

          if (error) console.error('Error updating social:', error);
        }

        setConfigState(prev => ({ ...prev, socialMedia: allSocialData }));

        // Handle deletions - fetch all current DB social links and delete those not in allSocialData
        const { data: dbSocialLinks } = await supabase.from('social_links').select('id');
        if (dbSocialLinks) {
          const currentIds = allSocialData.map(s => s.id);
          const idsToDelete = dbSocialLinks
            .map(dbSocial => dbSocial.id)
            .filter(dbId => !currentIds.includes(dbId));

          // Delete each removed social link
          for (const idToDelete of idsToDelete) {
            const { error } = await supabase.from('social_links').delete().eq('id', idToDelete);
            if (error) console.error('Error deleting social link:', idToDelete, error);
          }
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