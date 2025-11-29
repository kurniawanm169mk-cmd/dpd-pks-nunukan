import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteConfig, ConfigContextType } from '../types';
import { DEFAULT_CONFIG } from '../constants';

interface ExtendedConfigContextType extends ConfigContextType {
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const ConfigContext = createContext<ExtendedConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from local storage or use default
  const [config, setConfigState] = useState<SiteConfig>(() => {
    const saved = localStorage.getItem('siteConfig');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with default to ensure new fields exist if local storage is old
      return { ...DEFAULT_CONFIG, ...parsed };
    }
    return DEFAULT_CONFIG;
  });

  const [isAdmin, setIsAdmin] = useState(false);

  // Sync with LocalStorage and CSS Variables
  useEffect(() => {
    localStorage.setItem('siteConfig', JSON.stringify(config));
    
    // Apply CSS Variables for dynamic coloring
    document.documentElement.style.setProperty('--color-primary', config.theme.primaryColor);
    document.documentElement.style.setProperty('--color-secondary', config.theme.secondaryColor);
    document.documentElement.style.setProperty('--color-btn', config.theme.buttonColor || config.theme.primaryColor);
    document.documentElement.style.setProperty('--color-btn-hover', config.theme.buttonHoverColor || config.theme.secondaryColor);
  }, [config]);

  const updateConfig = (newConfig: Partial<SiteConfig>) => {
    setConfigState((prev) => ({
      ...prev,
      ...newConfig,
    }));
  };

  const resetConfig = () => {
    setConfigState(DEFAULT_CONFIG);
  };

  const toggleAdmin = () => setIsAdmin(!isAdmin);

  const login = (username: string, password: string): boolean => {
    // Simple hardcoded credential check
    if (username === 'admin' && password === 'admin123') {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => {
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