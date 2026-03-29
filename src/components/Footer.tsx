import React from 'react';
import { Link } from 'react-router-dom';
import { SiteSettings } from '../types';

interface FooterProps {
  settings: SiteSettings;
}

export const Footer = ({ settings }: FooterProps) => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              {settings.headerLogoUrl && (
                <img src={settings.headerLogoUrl} alt={settings.headerLogoText} className="h-10 w-auto object-contain" />
              )}
              <span className="text-2xl font-black tracking-tighter text-[#00a884]">{settings.headerLogoText}</span>
            </div>
            <p className="text-gray-500 max-w-sm mb-8">
              {settings.footerAbout}
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4 text-gray-500 text-sm">
              {settings.footerQuickLinks.map(link => (
                <li key={link.id}>
                  {link.href.startsWith('/') ? (
                    <Link to={link.href} className="hover:text-[#00a884]">{link.label}</Link>
                  ) : (
                    <a href={link.href} className="hover:text-[#00a884]">{link.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-6">Legal</h4>
            <ul className="space-y-4 text-gray-500 text-sm">
              {settings.footerLegalLinks.map(link => (
                <li key={link.id}>
                  {link.href.startsWith('/') ? (
                    <Link to={link.href} className="hover:text-[#00a884]">{link.label}</Link>
                  ) : (
                    <a href={link.href} className="hover:text-[#00a884]">{link.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-10 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-400">
          <p>© 2026 {settings.siteTitle}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
