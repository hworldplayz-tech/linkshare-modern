import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { auth, db, doc, onSnapshot, setDoc, updateDoc, onAuthStateChanged, trackUserLogin } from './firebase';
import { SiteSettings, DEFAULT_SETTINGS } from './types';
import PublicSite from './components/PublicSite';
import AdminPanel from './components/AdminPanel';
import InviteDetail from './components/InviteDetail';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import PrivacyPage from './components/PrivacyPage';
import TermsPage from './components/TermsPage';
import DisclaimerPage from './components/DisclaimerPage';
import TipsPage from './components/TipsPage';
import TipDetailPage from './components/TipDetailPage';
import ToolPage from './components/ToolPage';

export default function App() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        trackUserLogin(user).catch(console.error);
      }
    });

    const unsubSettings = onSnapshot(doc(db, 'settings', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as SiteSettings;
        setSettings(data);
        
        // Update document metadata
        document.title = data.siteTitle || DEFAULT_SETTINGS.siteTitle;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute('content', data.siteDescription || DEFAULT_SETTINGS.siteDescription);
        }

        // Migration: Ensure legal links are correct if they are placeholders
        const needsLegalUpdate = data.footerLegalLinks?.some(link => link.href === '#');
        const needsQuickUpdate = data.footerQuickLinks?.some(link => link.href === '#');
        const needsHeaderUpdate = data.headerMenus?.some(link => link.href === '#');

        if (needsLegalUpdate || needsQuickUpdate || needsHeaderUpdate) {
          const updatedLegalLinks = (data.footerLegalLinks || []).map(link => {
            const defaultLink = DEFAULT_SETTINGS.footerLegalLinks.find(d => d.label === link.label);
            if (link.href === '#' && defaultLink) {
              return { ...link, href: defaultLink.href };
            }
            return link;
          });

          const updatedQuickLinks = (data.footerQuickLinks || []).map(link => {
            const defaultLink = DEFAULT_SETTINGS.footerQuickLinks.find(d => d.label === link.label);
            if (link.href === '#' && defaultLink) {
              return { ...link, href: defaultLink.href };
            }
            return link;
          });

          const updatedHeaderMenus = (data.headerMenus || []).map(link => {
            const defaultLink = DEFAULT_SETTINGS.headerMenus.find(d => d.label === link.label);
            if (link.href === '#' && defaultLink) {
              return { ...link, href: defaultLink.href };
            }
            return link;
          });

          updateDoc(doc(db, 'settings', 'main'), { 
            footerLegalLinks: updatedLegalLinks,
            footerQuickLinks: updatedQuickLinks,
            headerMenus: updatedHeaderMenus
          });
        }

        // Inject head scripts
        if (data.headScripts) {
          const scriptId = 'custom-head-scripts';
          let scriptEl = document.getElementById(scriptId);
          if (!scriptEl) {
            scriptEl = document.createElement('div');
            scriptEl.id = scriptId;
            document.head.appendChild(scriptEl);
          }
          scriptEl.innerHTML = data.headScripts;
          
          // Execute scripts manually if they were added via innerHTML
          const scripts = scriptEl.getElementsByTagName('script');
          for (let i = 0; i < scripts.length; i++) {
            const s = document.createElement('script');
            if (scripts[i].src) {
              s.src = scripts[i].src;
            } else {
              s.textContent = scripts[i].textContent;
            }
            document.head.appendChild(s);
          }
        }
      } else {
        // Initialize settings if they don't exist
        setDoc(doc(db, 'settings', 'main'), DEFAULT_SETTINGS);
        setSettings(DEFAULT_SETTINGS);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubSettings();
    };
  }, []);

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a884]"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<PublicSite settings={settings} />} />
      <Route path="/about" element={<AboutPage settings={settings} />} />
      <Route path="/contact" element={<ContactPage settings={settings} />} />
      <Route path="/privacy" element={<PrivacyPage settings={settings} />} />
      <Route path="/terms" element={<TermsPage settings={settings} />} />
      <Route path="/disclaimer" element={<DisclaimerPage settings={settings} />} />
      <Route path="/tips-tricks" element={<TipsPage settings={settings} />} />
      <Route path="/tips-tricks/:slug" element={<TipDetailPage settings={settings} />} />
      <Route path="/tools/:toolId" element={<ToolPage settings={settings} />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/invite/:id" element={<InviteDetail settings={settings} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
