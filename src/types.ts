import { LucideIcon } from 'lucide-react';

export interface Group {
  id: string;
  title: string;
  link: string;
  category: string;
  country?: string;
  description?: string;
  imageUrl?: string;
  type: 'group' | 'channel';
  authorUid: string;
  authorName?: string;
  authorEmail?: string;
  isFeatured?: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  lastLogin: any;
  groupsCount: number;
}

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  dropdown?: { id: string; label: string; href: string }[];
}

export interface Category {
  id: string;
  name: string;
}

export interface Country {
  id: string;
  name: string;
}

export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  headerLogoText: string;
  headerLogoUrl?: string;
  headerMenus: MenuItem[];
  heroShow: boolean;
  heroTitle: string;
  heroSubtitle: string;
  heroTitleSize: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  autoApproveGroups: boolean;
  footerAbout: string;
  footerQuickLinks: { id: string; label: string; href: string }[];
  footerLegalLinks: { id: string; label: string; href: string }[];
  headScripts: string;
  defaultView: 'grid' | 'list';
  loadMoreEnabled: boolean;
  groupsPerPage: number;
  showSubmittedBy: boolean;
  tipsSectionImageUrl?: string;
  categories: string[];
  countries: string[];
  globalAdsEnabled: boolean;
  adPlacements: AdPlacement[];
}

export interface AdPlacement {
  id: string;
  label: string;
  type: string;
  enabled: boolean;
  script: string;
}

export interface Tip {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  createdAt: string;
  imageUrl: string;
  category: string;
  author: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  siteTitle: 'LinkShare',
  siteDescription: 'The largest WhatsApp Group Links Hub. Discover and promote your active WhatsApp groups and channels.',
  headerLogoText: 'LinkShare',
  headerMenus: [
    { id: '1', label: 'Home', href: '/' },
    { id: '2', label: 'About', href: '/about' },
    { id: '5', label: 'Contact', href: '/contact' },
    { id: '3', label: 'Browse Groups', href: '#groups' },
    { id: '4', label: 'Tools', href: '#tools' },
  ],
  heroShow: true,
  heroTitle: 'Discover and Promote Your WhatsApp Groups',
  heroSubtitle: 'Join thousands of active communities or share your own group with the world. Free, secure, and always updated.',
  heroTitleSize: 'h1',
  autoApproveGroups: false,
  footerAbout: 'The largest WhatsApp Group Links Hub. Discover and promote your active WhatsApp groups and channels. Join thousands of active communities today.',
  footerQuickLinks: [
    { id: '1', label: 'Home', href: '/' },
    { id: '2', label: 'About', href: '/about' },
    { id: '5', label: 'Contact', href: '/contact' },
    { id: '6', label: 'Tips & Tricks', href: '/tips-tricks' },
    { id: '3', label: 'Browse Groups', href: '#groups' },
    { id: '4', label: 'Online Tools', href: '#tools' },
  ],
  footerLegalLinks: [
    { id: '1', label: 'Privacy Policy', href: '/privacy' },
    { id: '2', label: 'Terms of Service', href: '/terms' },
    { id: '3', label: 'Disclaimer', href: '/disclaimer' },
    { id: '4', label: 'Contact Us', href: '/contact' },
  ],
  headScripts: '',
  defaultView: 'grid',
  loadMoreEnabled: true,
  groupsPerPage: 20,
  showSubmittedBy: true,
  tipsSectionImageUrl: 'https://picsum.photos/seed/whatsapp-tips/800/600',
  categories: ['Tech', 'Movies', 'Education', 'Entertainment', 'Business', 'Sports', 'Gaming', 'News', 'Lifestyle', 'Other'],
  countries: ['Global', 'USA', 'Pakistan', 'India', 'UK', 'Canada', 'Australia', 'Germany', 'France', 'Other'],
  globalAdsEnabled: false,
  adPlacements: [
    { id: 'global_top', label: 'Global Top Banner', type: 'Banner 728x90', enabled: false, script: '' },
    { id: 'home_hero_bottom', label: 'Home Below Hero', type: 'Banner 728x90', enabled: false, script: '' },
    { id: 'home_groups_top', label: 'Home Above Groups', type: 'Banner 728x90', enabled: false, script: '' },
    { id: 'home_groups_bottom', label: 'Home Below Groups', type: 'Banner 728x90', enabled: false, script: '' },
    { id: 'detail_top', label: 'Group Detail Top', type: 'Banner 728x90', enabled: false, script: '' },
    { id: 'detail_bottom', label: 'Group Detail Bottom', type: 'Banner 728x90', enabled: false, script: '' },
    { id: 'tips_list_top', label: 'Tips List Top', type: 'Banner 728x90', enabled: false, script: '' },
    { id: 'tips_detail_top', label: 'Tip Detail Top', type: 'Banner 728x90', enabled: false, script: '' },
    { id: 'tips_detail_bottom', label: 'Tip Detail Bottom', type: 'Banner 728x90', enabled: false, script: '' },
    { id: 'sidebar', label: 'Sidebar Ad', type: 'Banner 300x250', enabled: false, script: '' },
    { id: 'popup', label: 'Global Popup Ad', type: 'Popup/Interstitial', enabled: false, script: '' },
    { id: 'social_bar', label: 'Social Bar Ad', type: 'Social Bar', enabled: false, script: '' },
  ],
};
