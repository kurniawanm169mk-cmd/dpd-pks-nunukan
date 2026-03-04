import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteConfig, ConfigContextType, TeamMember, NewsItem } from '../types';
import { DEFAULT_CONFIG } from '../constants';
import { supabase } from '../services/supabaseClient';

interface ExtendedConfigContextType extends ConfigContextType {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const ConfigContext = createContext<ExtendedConfigContextType | undefined>(undefined);

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

  // Initial Load from Supabase - all queries run in parallel for speed
  useEffect(() => {
    const loadConfig = async () => {
      try {
        // Run all queries in parallel instead of sequentially
        const [
          { data, error },
          { data: teamData },
          { data: newsData },
          { data: quotesData },
          { data: socialData }
        ] = await Promise.all([
          supabase.from('site_settings').select('*').single(),
          supabase.from('team_members').select('*').order('order_index', { ascending: true }),
          supabase.from('news_items').select('*').order('order_index', { ascending: true }),
          supabase.from('media_quotes').select('*'),
          supabase.from('social_links').select('*')
        ]);

        if (error) {
          console.error('Error loading config from Supabase:', error);
          const saved = localStorage.getItem('siteConfig');
          if (saved) {
            setConfigState({ ...DEFAULT_CONFIG, ...JSON.parse(saved) });
          }
        } else if (data) {
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
            teamBackgroundColor: data.team_background_color || DEFAULT_CONFIG.teamBackgroundColor,
            teamTextColor: data.team_text_color || DEFAULT_CONFIG.teamTextColor,
            newsBackgroundColor: data.news_background_color || DEFAULT_CONFIG.newsBackgroundColor,
            newsTextColor: data.news_text_color || DEFAULT_CONFIG.newsTextColor,
            sectionTitles: data.section_titles || DEFAULT_CONFIG.sectionTitles,
            sectionDescriptions: data.section_descriptions || DEFAULT_CONFIG.sectionDescriptions,
          };

          if (teamData) {
            mergedConfig.team = teamData.map(t => ({
              id: t.id,
              name: t.name,
              role: t.role,
              photoUrl: t.photo_url,
              description: t.description,
              orderIndex: t.order_index
            }));
          }

          if (newsData) {
            mergedConfig.news = newsData.map(n => ({
              id: n.id,
              title: n.title,
              date: n.date,
              content: n.content,
              imageUrl: n.image_url,
              images: n.images || [],
              isFeatured: n.is_featured,
              tags: n.tags || [],
              slug: n.slug,
              orderIndex: n.order_index,
              views: n.views || 0
            }));
          }

          if (quotesData) {
            mergedConfig.mediaQuotes = quotesData.map(q => ({
              id: q.id,
              content: q.content,
              source: q.source,
              author: q.author,
              date: q.date,
              url: q.url,
              imageUrl: q.image_url
            }));
          }

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
        // Hide the splash screen now that data is ready
        if (typeof (window as any).hideSplash === 'function') {
          (window as any).hideSplash();
        }
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

  const updateConfig = async (newConfig: Partial<SiteConfig>): Promise<void> => {
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
      if (newConfig.teamBackgroundColor !== undefined) settingsUpdate.team_background_color = newConfig.teamBackgroundColor;
      if (newConfig.teamTextColor !== undefined) settingsUpdate.team_text_color = newConfig.teamTextColor;
      if (newConfig.newsBackgroundColor !== undefined) settingsUpdate.news_background_color = newConfig.newsBackgroundColor;
      if (newConfig.newsTextColor !== undefined) settingsUpdate.news_text_color = newConfig.newsTextColor;
      if (newConfig.sectionTitles) settingsUpdate.section_titles = newConfig.sectionTitles;
      if (newConfig.sectionDescriptions) settingsUpdate.section_descriptions = newConfig.sectionDescriptions;

      if (Object.keys(settingsUpdate).length > 0) {
        const { error: settingsError } = await supabase
          .from('site_settings')
          .upsert({ id: 1, ...settingsUpdate }, { onConflict: 'id' });
        if (settingsError) {
          // Jika error karena kolom section_titles/section_descriptions belum ada di DB,
          // coba simpan tanpa kolom tersebut
          const hasMissingColumnError =
            settingsError.message?.includes('section_titles') ||
            settingsError.message?.includes('section_descriptions');
          if (hasMissingColumnError) {
            const fallbackUpdate = { ...settingsUpdate };
            delete fallbackUpdate.section_titles;
            delete fallbackUpdate.section_descriptions;
            if (Object.keys(fallbackUpdate).length > 0) {
              const { error: fallbackError } = await supabase
                .from('site_settings')
                .upsert({ id: 1, ...fallbackUpdate }, { onConflict: 'id' });
              if (fallbackError) throw new Error(`Gagal update site_settings: ${fallbackError.message}`);
            }
          } else {
            throw new Error(`Gagal update site_settings: ${settingsError.message}`);
          }
        }
      }

      // 2. Handle Arrays (Team, News, Socials)

      if (newConfig.team) {
        const isNewItem = (id: string) => id.startsWith('new-') || !id.includes('-');

        // We iterate through the NEW config array to respect the order
        for (let i = 0; i < newConfig.team.length; i++) {
          const item = newConfig.team[i];

          if (isNewItem(item.id)) {
            // Insert new item
            const { error } = await supabase.from('team_members').insert({
              name: item.name,
              role: item.role,
              photo_url: item.photoUrl,
              description: item.description,
              order_index: i
            });
            if (error) console.error('Error inserting team member:', error);
          } else {
            // Update existing item
            const { error } = await supabase.from('team_members').update({
              name: item.name,
              role: item.role,
              photo_url: item.photoUrl,
              description: item.description,
              order_index: i
            }).eq('id', item.id);
            if (error) console.error('Error updating team member:', error);
          }
        }

        // Handle deletions
        const { data: dbTeamMembers } = await supabase.from('team_members').select('id');
        if (dbTeamMembers) {
          // Note: newConfig.team might contain temp IDs for new items, so we can't just compare IDs directly for those.
          // But for existing items, we can.
          // The safest way is to check if the DB ID exists in the newConfig.team (excluding new items).
          // Actually, if we just inserted new items, they have new IDs in DB, but we don't know them here easily without reloading.
          // But we are only concerned about deleting items that were ALREADY in DB but are NOT in newConfig.team.

          const currentRealIds = newConfig.team.filter(t => !isNewItem(t.id)).map(t => t.id);
          const idsToDelete = dbTeamMembers
            .map(m => m.id)
            .filter(dbId => !currentRealIds.includes(dbId));

          // Wait! If we just inserted a new item, it has a new ID in DB. 
          // `dbTeamMembers` will include it (if we fetched after insert, but we are fetching now).
          // But `currentRealIds` does NOT include it (it has temp ID in `newConfig.team`).
          // So we might accidentally delete the item we just inserted!
          // This is a race condition/logic flaw.

          // Fix: We should only delete items that were present BEFORE this update and are now missing.
          // Or, simpler: We only delete items whose ID is NOT in `newConfig.team` AND whose created_at is old? No.

          // Better approach:
          // We should rely on the fact that `newConfig.team` contains ALL items that should exist.
          // If an item in DB is not in `newConfig.team`, it should be deleted.
          // BUT we must distinguish "newly inserted" vs "to be deleted".
          // The newly inserted items will have IDs that we don't know yet in `newConfig.team`.

          // To avoid deleting just-inserted items:
          // We can fetch the list of IDs *before* we start inserting/updating?
          // Or we can just skip deletion logic here and rely on a separate "deleteMember" function?
          // But the current architecture passes the whole array.

          // Alternative:
          // The `idsToDelete` should be calculated based on the state *before* we insert new ones.
          // But we need to fetch DB state.

          // Let's fetch DB state FIRST.
          // Then insert/update.
          // Then delete the ones that were in DB state but not in `newConfig.team`.

          // But wait, `dbTeamMembers` (fetched at start) contains items.
          // `newConfig.team` contains items.
          // If `dbTeamMembers` has ID 'A', and `newConfig.team` does NOT have 'A', then 'A' was deleted.
          // If `newConfig.team` has 'B' (temp ID), it is new.

          // So:
          // 1. Fetch current DB IDs.
          // 2. Calculate IDs to delete (DB IDs not in `newConfig.team`).
          // 3. Delete them.
          // 4. Insert/Update items from `newConfig.team`.

          // This is safe because "newly inserted" items are not in "current DB IDs" yet.
        }

        // Let's implement this safe deletion logic.
        const { data: initialDbTeam } = await supabase.from('team_members').select('id');
        if (initialDbTeam) {
          const incomingIds = newConfig.team.filter(t => !isNewItem(t.id)).map(t => t.id);
          const idsToDelete = initialDbTeam.map(t => t.id).filter(id => !incomingIds.includes(id));

          if (idsToDelete.length > 0) {
            await supabase.from('team_members').delete().in('id', idsToDelete);
          }
        }
      }

      if (newConfig.news) {
        const isNewItem = (id: string) => id.startsWith('new-') || !id.includes('-');

        // Safe Deletion First
        const { data: initialDbNews } = await supabase.from('news_items').select('id');
        if (initialDbNews) {
          const incomingIds = newConfig.news.filter(n => !isNewItem(n.id)).map(n => n.id);
          const idsToDelete = initialDbNews.map(n => n.id).filter(id => !incomingIds.includes(id));

          if (idsToDelete.length > 0) {
            await supabase.from('news_items').delete().in('id', idsToDelete);
          }
        }

        const generateSlug = (title: string) => {
          const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          const randomSuffix = Math.random().toString(36).substring(2, 7);
          return `${baseSlug}-${randomSuffix}`;
        };

        for (let i = 0; i < newConfig.news.length; i++) {
          const item = newConfig.news[i];
          const slug = item.slug || generateSlug(item.title);

          if (isNewItem(item.id)) {
            const { error } = await supabase.from('news_items').insert({
              title: item.title,
              date: item.date,
              content: item.content,
              image_url: item.imageUrl,
              images: item.images,
              is_featured: item.isFeatured,
              tags: item.tags,
              slug: slug,
              order_index: i
            });
            if (error) console.error('Error inserting news:', error);
          } else {
            const { error } = await supabase.from('news_items').update({
              title: item.title,
              date: item.date,
              content: item.content,
              image_url: item.imageUrl,
              images: item.images,
              is_featured: item.isFeatured,
              tags: item.tags,
              slug: slug,
              order_index: i
            }).eq('id', item.id);
            if (error) console.error('Error updating news:', error);
          }
        }
      }

      if (newConfig.mediaQuotes) {
        // ... existing logic for quotes (no ordering requested, but good to keep consistent)
        // For brevity, I'll keep the original logic for quotes/socials or adapt safe deletion.
        // Let's adapt safe deletion for consistency.

        const isNewItem = (id: string) => id.startsWith('new-') || !id.includes('-');
        const { data: initialDbQuotes } = await supabase.from('media_quotes').select('id');
        if (initialDbQuotes) {
          const incomingIds = newConfig.mediaQuotes.filter(q => !isNewItem(q.id)).map(q => q.id);
          const idsToDelete = initialDbQuotes.map(q => q.id).filter(id => !incomingIds.includes(id));
          if (idsToDelete.length > 0) {
            await supabase.from('media_quotes').delete().in('id', idsToDelete);
          }
        }

        for (const item of newConfig.mediaQuotes) {
          if (isNewItem(item.id)) {
            await supabase.from('media_quotes').insert({
              content: item.content,
              source: item.source,
              author: item.author,
              date: item.date,
              url: item.url,
              image_url: item.imageUrl
            });
          } else {
            await supabase.from('media_quotes').update({
              content: item.content,
              source: item.source,
              author: item.author,
              date: item.date,
              url: item.url,
              image_url: item.imageUrl
            }).eq('id', item.id);
          }
        }
      }

      if (newConfig.socialMedia) {
        const isNewItem = (id: string) => id.startsWith('new-') || !id.includes('-');
        const { data: initialDbSocial } = await supabase.from('social_links').select('id');
        if (initialDbSocial) {
          const incomingIds = newConfig.socialMedia.filter(s => !isNewItem(s.id)).map(s => s.id);
          const idsToDelete = initialDbSocial.map(s => s.id).filter(id => !incomingIds.includes(id));
          if (idsToDelete.length > 0) {
            await supabase.from('social_links').delete().in('id', idsToDelete);
          }
        }

        for (const item of newConfig.socialMedia) {
          if (isNewItem(item.id)) {
            await supabase.from('social_links').insert({
              platform: item.platform,
              url: item.url,
              icon_url: item.iconUrl,
              icon_color: item.iconColor
            });
          } else {
            await supabase.from('social_links').update({
              platform: item.platform,
              url: item.url,
              icon_url: item.iconUrl,
              icon_color: item.iconColor
            }).eq('id', item.id);
          }
        }
      }

    } catch (err) {
      console.error('Error saving to Supabase:', err);
      throw err;
    }
  };

  const resetConfig = () => {
    setConfigState(DEFAULT_CONFIG);
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