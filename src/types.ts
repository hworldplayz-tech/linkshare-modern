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

export interface Tool {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  category: string;
  enabled: boolean;
}

export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  headerLogoText: string;
  headerLogoUrl?: string;
  faviconUrl?: string;
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
  showPollBanner: boolean;
  pollBannerText: string;
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
  siteTitle: 'LinkShare - WhatsApp Group Links and Tools Hub. Discover tools and promote your active WhatsApp groups and channels. Join thousands of active communities today.',
  siteDescription: 'The largest WhatsApp Group Links Hub. Discover tools and promote your active WhatsApp groups and channels. Join thousands of active communities today.',
  headerLogoText: 'LinkShare',
  headerLogoUrl: '/favicon.png',
  faviconUrl: '/favicon.png',
  headerMenus: [
    { id: '1', label: 'Home', href: '/' },
    { id: 'poll', label: 'Iran vs Israel', href: '/iran-vs-israel' },
    { id: '2', label: 'About', href: '/about' },
    { id: '5', label: 'Contact', href: '/contact' },
    { id: '3', label: 'Browse Groups', href: '#groups' },
    { id: '4', label: 'Tools', href: '/tools' },
  ],
  heroShow: true,
  heroTitle: 'Discover Tools and Promote Your WhatsApp Groups',
  heroSubtitle: 'Join thousands of active communities or share your own group with the world. Free, secure, and always updated.',
  heroTitleSize: 'h2',
  autoApproveGroups: true,
  footerAbout: 'The largest WhatsApp Group Links Hub. Discover tools and promote your active WhatsApp groups and channels. Join thousands of active communities today.',
  footerQuickLinks: [
    { id: '1', label: 'Home', href: '/' },
    { id: 'poll', label: 'Iran vs Israel', href: '/iran-vs-israel' },
    { id: '2', label: 'About', href: '/about' },
    { id: '5', label: 'Contact', href: '/contact' },
    { id: '6', label: 'Tips & Tricks', href: '/tips-tricks' },
    { id: '3', label: 'Browse Groups', href: '#groups' },
    { id: '4', label: 'Online Tools', href: '/tools' },
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
  showPollBanner: true,
  pollBannerText: 'Iran vs Israel Live Voting: Where do you stand? Vote for your favorite country!',
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
    { id: 'tools_list_top', label: 'Tools List Top', type: 'Banner 728x90', enabled: false, script: '' },
    { id: 'tool_detail_top', label: 'Tool Detail Top', type: 'Banner 728x90', enabled: false, script: '' },
    { id: 'tool_detail_bottom', label: 'Tool Detail Bottom', type: 'Banner 728x90', enabled: false, script: '' },
  ],
};

export const TOOLS: Tool[] = [
  {
    id: 'ai-detector',
    title: 'AI Content Detector',
    slug: 'ai-detector',
    description: 'Analyze text to determine if it was written by a human or generated by an AI like ChatGPT.',
    icon: 'Cpu',
    category: 'AI Tools',
    enabled: true
  },
  {
    id: 'plagiarism-checker',
    title: 'Plagiarism Checker',
    slug: 'plagiarism-checker',
    description: 'Check your content for originality and detect potential plagiarism with our advanced analysis tool.',
    icon: 'Search',
    category: 'Content',
    enabled: true
  },
  {
    id: 'qr-code-generator',
    title: 'QR Code Generator',
    slug: 'qr-code-generator',
    description: 'Create custom QR codes for URLs, text, Wi-Fi, and more in seconds.',
    icon: 'QrCode',
    category: 'Utility',
    enabled: true
  },
  {
    id: 'word-counter',
    title: 'Word Counter',
    slug: 'word-counter',
    description: 'Count words, characters, and sentences in your text instantly.',
    icon: 'Type',
    category: 'Content',
    enabled: true
  },
  {
    id: 'short-url-generator',
    title: 'Short URL Generator',
    slug: 'short-url-generator',
    description: 'Transform long, messy links into clean, short URLs.',
    icon: 'Link',
    category: 'Utility',
    enabled: true
  },
  {
    id: 'stylish-text',
    title: 'Stylish Text Generator',
    slug: 'stylish-text-generator',
    description: 'Convert normal text into cool, stylish fonts for WhatsApp and social media.',
    icon: 'Sparkles',
    category: 'Social',
    enabled: true
  },
  {
    id: 'text-repeater',
    title: 'Text Repeater',
    slug: 'text-repeater',
    description: 'Repeat any text thousands of times with a single click.',
    icon: 'RefreshCw',
    category: 'Social',
    enabled: true
  },
  {
    id: 'qr-scanner',
    title: 'QR Code Scanner',
    slug: 'qr-code-scanner',
    description: 'Scan QR codes instantly using your camera or by uploading an image.',
    icon: 'Camera',
    category: 'Utility',
    enabled: true
  },
  {
    id: 'pdf-editor',
    title: 'PDF Editor Online',
    slug: 'pdf-editor',
    description: 'Edit PDF pages in-browser: add text, insert images, draw, and export high-quality PDFs.',
    icon: 'FileEdit',
    category: 'Document',
    enabled: true
  },
  {
    id: 'fake-whatsapp-screenshot',
    title: 'Fake WhatsApp Screenshot Generator',
    slug: 'fake-whatsapp-screenshot',
    description: 'Generate realistic fake WhatsApp conversation screenshots for pranks and social media.',
    icon: 'MessageSquare',
    category: 'Social',
    enabled: true
  },
  {
    id: 'whatsapp-read-more',
    title: 'WhatsApp "Read More" Prank Generator',
    slug: 'whatsapp-read-more',
    description: 'Create prank messages with a "Read More" button to hide funny punchlines in WhatsApp chats.',
    icon: 'MessageCircle',
    category: 'Social',
    enabled: true
  },
  {
    id: 'whatsapp-link-generator',
    title: 'WhatsApp Link Generator + QR Code',
    slug: 'whatsapp-link-generator',
    description: 'Create direct WhatsApp chat links with pre-filled messages and custom QR codes.',
    icon: 'Link',
    category: 'Social',
    enabled: true
  },
  {
    id: 'whatsapp-dp-border',
    title: 'WhatsApp DP Border Maker',
    slug: 'whatsapp-dp-border',
    description: 'Create professional-looking profile picture borders to make your WhatsApp DP stand out.',
    icon: 'Circle',
    category: 'Social',
    enabled: true
  },
  {
    id: 'whatsapp-group-name-generator',
    title: 'WhatsApp Group Name Generator',
    slug: 'whatsapp-group-name-generator',
    description: 'Generate creative, funny, and professional names for your WhatsApp groups based on categories.',
    icon: 'Type',
    category: 'Social',
    enabled: true
  },
  {
    id: 'whatsapp-status-formatter',
    title: 'WhatsApp Status Text Formatter',
    slug: 'whatsapp-status-formatter',
    description: 'Format your WhatsApp status with bold, italic, strikethrough, and stylish fonts.',
    icon: 'Type',
    category: 'Social',
    enabled: true
  },
  {
    id: 'image-pdf-merger',
    title: 'Image to PDF & PDF Merger',
    slug: 'image-pdf-merger',
    description: 'Convert multiple images to a single PDF or merge multiple PDF files into one. Drag and drop to reorder.',
    icon: 'FileStack',
    category: 'Document',
    enabled: true
  },
  {
    id: 'm3u-playlist-viewer',
    title: 'M3U Playlist Viewer & Reader',
    slug: 'm3u-playlist-viewer',
    description: 'Analyze, filter and extract channels from M3U/M3U8 playlists. Find channels by country, group, or name.',
    icon: 'ListMusic',
    category: 'Utility',
    enabled: true
  },
  {
    id: 'image-editor',
    title: 'Image Editor Online',
    slug: 'image-editor',
    description: 'Edit your images online with ease. Add text, draw, crop, and apply filters directly in your browser.',
    icon: 'Palette',
    category: 'Utility',
    enabled: true
  }
];
