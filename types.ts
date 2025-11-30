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
  images?: string[]; // Multiple images
  isFeatured?: boolean;
  tags?: string[];
  slug?: string;
}

export interface MediaQuote {
  id: string;
  content: string;
  source: string;
  author?: string;
  date?: string;
  url?: string;
  imageUrl?: string;
}

export interface SocialLink {
  id: string;
  platform: 'Facebook' | 'Twitter' | 'Instagram' | 'Youtube' | 'LinkedIn' | 'TikTok' | 'Website';
  url: string;
  iconUrl?: string; // URL for custom icon
  iconColor?: string;
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
    hoverColor?: string; // Hover color for navigation items
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
    images?: string[]; // Array of image URLs for carousel
    ctaText: string;
    ctaButtonColor?: string;
    ctaButtonTextColor?: string;
    ctaButtonLink?: string;
    secondaryButtonText?: string;
    secondaryButtonColor?: string;
    secondaryButtonTextColor?: string;
    secondaryButtonLink?: string;
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
  teamTitleColor?: string;
  news: NewsItem[];
  newsBackgroundColor: string;
  newsTextColor: string;
  newsTitleColor?: string;
  aboutTitleColor?: string;
  sectionTitles: {
    structure: string;
    news: string;
  };
  mediaQuotes: MediaQuote[];
}

export interface ConfigContextType {
  config: SiteConfig;
  updateConfig: (newConfig: Partial<SiteConfig>) => void;
  resetConfig: () => void;
  isAdmin: boolean;
  toggleAdmin: () => void;
}