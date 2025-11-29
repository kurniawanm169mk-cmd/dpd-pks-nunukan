export interface TeamMember {
  id: string;
  name: string;
  role: string;
  photoUrl: string;
  description?: string; // Added for detail view
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  content: string;
  imageUrl: string;
}

export interface SocialLink {
  id: string;
  platform: 'Facebook' | 'Twitter' | 'Instagram' | 'Youtube' | 'LinkedIn' | 'TikTok' | 'Website';
  url: string;
}

export interface SiteConfig {
  identity: {
    name: string;
    logoUrl: string; // URL or Base64
    tagline: string;
  };
  header: {
    backgroundColor: string; // Hex or rgba
    textColor: string;
    isSticky: boolean;
  };
  footer: {
    backgroundColor: string;
    textColor: string;
    description: string;
    copyrightText: string;
  };
  registration: {
    enabled: boolean;
    buttonText: string;
    url: string;
    buttonColor: string;
    buttonTextColor: string;
  };
  theme: {
    primaryColor: string; // Hex code
    secondaryColor: string; // Hex code
    buttonColor: string;
    buttonHoverColor: string;
    fontFamily: 'Inter' | 'Poppins' | 'Roboto' | 'Playfair Display';
    rounded: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  };
  hero: {
    title: string;
    subtitle: string;
    imageUrl: string;
    ctaText: string;
    backgroundColor: string;
    textColor: string;
  };
  about: {
    title: string;
    content: string;
    imageUrl: string;
    backgroundColor: string;
    textColor: string;
  };
  contact: {
    address: string;
    email: string;
    phone: string;
  };
  socialMedia: SocialLink[];
  team: TeamMember[];
  teamBackgroundColor: string;
  teamTextColor: string;
  news: NewsItem[];
  newsBackgroundColor: string;
  newsTextColor: string;
}

export interface ConfigContextType {
  config: SiteConfig;
  updateConfig: (newConfig: Partial<SiteConfig>) => void;
  resetConfig: () => void;
  isAdmin: boolean;
  toggleAdmin: () => void;
}