import React from 'react';
import { Link } from 'react-router-dom';
import { SiteSettings } from '../types';
import { getCurrentDateInfo } from '../lib/seoHelper';
import { ShieldCheck, Zap, Heart, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  settings: SiteSettings;
}

export const Footer = ({ settings }: FooterProps) => {
  const dateInfo = getCurrentDateInfo();

  const POPULAR_TOOLS_LINKS = [
    { label: 'Free AI Content Detector', url: '/tools/ai-detector' },
    { label: 'Online Plagiarism Checker', url: '/tools/plagiarism-checker' },
    { label: 'Custom QR Code Generator', url: '/tools/qr-code-generator' },
    { label: 'Word & Character Counter', url: '/tools/word-counter' },
    { label: 'Fast Short URL Generator', url: '/tools/short-url-generator' },
    { label: '100+ Stylish Text Generator', url: '/tools/stylish-text' },
    { label: 'Text Repeater (10k Times)', url: '/tools/text-repeater' },
    { label: 'Online PDF Editor Studio', url: '/tools/pdf-editor' }
  ];

  const WHATSAPP_TOOLS_LINKS = [
    { label: 'WhatsApp Direct Chat Link', url: '/tools/whatsapp-link-generator' },
    { label: 'WhatsApp DP Border Maker', url: '/tools/whatsapp-dp-border' },
    { label: 'WhatsApp Group Names Ideas', url: '/tools/whatsapp-group-name-generator' },
    { label: 'Fake WhatsApp Chat Mockup', url: '/tools/fake-whatsapp-screenshot' },
    { label: 'WhatsApp Read More Prank', url: '/tools/whatsapp-read-more' },
    { label: 'AI Status Caption Quotes', url: '/tools/whatsapp-caption-generator' },
    { label: 'Status Bold Text Formatter', url: '/tools/whatsapp-status-formatter' },
    { label: 'Verified WhatsApp Groups', url: '/#groups' }
  ];

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              {settings.headerLogoUrl && (
                <img src={settings.headerLogoUrl} alt={settings.headerLogoText} className="h-9 w-auto object-contain" />
              )}
              <span className="text-2xl font-black tracking-tighter text-[#00a884]">{settings.headerLogoText || 'LinkShare'}</span>
            </div>
            <p className="text-gray-500 text-sm max-w-sm mb-6 leading-relaxed">
              {settings.footerAbout || 'Free online developer utilities, AI text checkers, generators, and 5,000+ verified active WhatsApp communities updated daily.'}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-[#00a884] rounded-xl text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Free • Verified Safe • No Sign-Up</span>
            </div>
          </div>
          
          {/* Popular Tools Backlinks */}
          <div>
            <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">
              Top Online Tools
            </h4>
            <ul className="space-y-2.5 text-gray-500 text-xs">
              {POPULAR_TOOLS_LINKS.map((tool, idx) => (
                <li key={idx}>
                  <Link to={tool.url} className="hover:text-[#00a884] transition-colors leading-relaxed">
                    {tool.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* WhatsApp Utilities Backlinks */}
          <div>
            <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">
              WhatsApp Hub
            </h4>
            <ul className="space-y-2.5 text-gray-500 text-xs">
              {WHATSAPP_TOOLS_LINKS.map((item, idx) => (
                <li key={idx}>
                  <Link to={item.url} className="hover:text-[#00a884] transition-colors leading-relaxed">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Quick & Legal Links */}
          <div>
            <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">
              Quick & Legal
            </h4>
            <ul className="space-y-2.5 text-gray-500 text-xs">
              <li><Link to="/" className="hover:text-[#00a884]">Home Directory</Link></li>
              <li><Link to="/tools" className="hover:text-[#00a884]">All 20+ Free Tools</Link></li>
              <li><Link to="/blogs" className="hover:text-[#00a884]">Tech Blog & Guides</Link></li>
              <li><Link to="/tips-tricks" className="hover:text-[#00a884]">WhatsApp Tutorials</Link></li>
              <li><Link to="/privacy" className="hover:text-[#00a884]">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-[#00a884]">Terms of Service</Link></li>
              <li><Link to="/contact" className="hover:text-[#00a884]">Contact & Support</Link></li>
            </ul>
          </div>

        </div>
        
        {/* Bottom Bar with Dynamic Real-Time Date */}
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© {dateInfo.year} {settings.siteTitle || 'LinkShare'}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Last Database Audit: {dateInfo.formattedDayMonthYear}</span>
            <span>•</span>
            <span className="text-[#00a884] font-medium">100% Client-Side Fast Delivery</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
