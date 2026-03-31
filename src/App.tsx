import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ScrollToTop from './components/ScrollToTop';
import AdPlacement from './components/AdPlacement';
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
import ToolsPage from './components/ToolsPage';
import ToolDetail from './components/ToolDetail';

export default function App() {
  // Load initial settings from localStorage if available for instant feel
  const [settings, setSettings] = useState<SiteSettings | null>(() => {
    const cached = localStorage.getItem('site_settings');
    return cached ? JSON.parse(cached) : null;
  });

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
        
        // Cache settings for next visit
        localStorage.setItem('site_settings', JSON.stringify(data));
        
        // Migration: Ensure legal links are correct if they are placeholders
        const needsLegalUpdate = data.footerLegalLinks?.some(link => link.href === '#' || link.href === '/#groups' || link.href === '#groups' || link.href === '#tools');
        const needsQuickUpdate = data.footerQuickLinks?.some(link => link.href === '#' || link.href === '/#groups' || link.href === '#groups' || link.href === '#tools');
        const needsHeaderUpdate = data.headerMenus?.some(link => link.href === '#' || link.href === '/#groups' || link.href === '#groups' || link.href === '#tools');

        // Migration: Ensure ad placements exist
        const needsAdUpdate = !data.adPlacements || data.adPlacements.length < DEFAULT_SETTINGS.adPlacements.length;
        const needsGlobalAdUpdate = data.globalAdsEnabled === undefined;

        if (needsLegalUpdate || needsQuickUpdate || needsHeaderUpdate || needsAdUpdate || needsGlobalAdUpdate) {
          const updateData: any = {};
          
          if (needsLegalUpdate || needsQuickUpdate || needsHeaderUpdate) {
            updateData.footerLegalLinks = (data.footerLegalLinks || []).map(link => {
              const defaultLink = DEFAULT_SETTINGS.footerLegalLinks.find(d => d.label === link.label);
              if ((link.href === '#' || link.href === '/#groups' || link.href === '#groups' || link.href === '#tools') && defaultLink) {
                return { ...link, href: defaultLink.href };
              }
              return link;
            });

            updateData.footerQuickLinks = (data.footerQuickLinks || []).map(link => {
              const defaultLink = DEFAULT_SETTINGS.footerQuickLinks.find(d => d.label === link.label);
              if ((link.href === '#' || link.href === '/#groups' || link.href === '#groups' || link.href === '#tools') && defaultLink) {
                return { ...link, href: defaultLink.href };
              }
              return link;
            });

            updateData.headerMenus = (data.headerMenus || []).map(link => {
              const defaultLink = DEFAULT_SETTINGS.headerMenus.find(d => d.label === link.label);
              if ((link.href === '#' || link.href === '/#groups' || link.href === '#groups' || link.href === '#tools') && defaultLink) {
                return { ...link, href: defaultLink.href };
              }
              return link;
            });
          }

          if (needsAdUpdate) {
            updateData.adPlacements = DEFAULT_SETTINGS.adPlacements;
          }
          if (needsGlobalAdUpdate) {
            updateData.globalAdsEnabled = DEFAULT_SETTINGS.globalAdsEnabled;
          }

          updateDoc(doc(db, 'settings', 'main'), updateData);
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
        localStorage.setItem('site_settings', JSON.stringify(DEFAULT_SETTINGS));
      }
    });

    return () => {
      unsubscribeAuth();
      unsubSettings();
    };
  }, []);

  // If no settings and no cache, show a minimal loading state
  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentTitle = settings.siteTitle || DEFAULT_SETTINGS.siteTitle;
  const currentDesc = settings.siteDescription || DEFAULT_SETTINGS.siteDescription;

  return (
    <>
      <Helmet>
        <title>{currentTitle}</title>
        <meta name="description" content={currentDesc} />
        
        {/* OpenGraph */}
        <meta property="og:title" content={currentTitle} />
        <meta property="og:description" content={currentDesc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.origin} />
        {settings.headerLogoUrl && <meta property="og:image" content={settings.headerLogoUrl} />}
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={currentTitle} />
        <meta name="twitter:description" content={currentDesc} />
        {settings.headerLogoUrl && <meta name="twitter:image" content={settings.headerLogoUrl} />}
        
        {/* Canonical */}
        <link rel="canonical" href={window.location.origin + window.location.pathname} />
      </Helmet>

      <ScrollToTop />

      <AdPlacement id="popup" settings={settings} />
      <AdPlacement id="social_bar" settings={settings} className="fixed bottom-0 left-0 right-0 z-50" />

      <Routes>
        <Route path="/" element={<PublicSite settings={settings} />} />
        <Route path="/about" element={<AboutPage settings={settings} />} />
        <Route path="/contact" element={<ContactPage settings={settings} />} />
        <Route path="/privacy" element={<PrivacyPage settings={settings} />} />
        <Route path="/terms" element={<TermsPage settings={settings} />} />
        <Route path="/disclaimer" element={<DisclaimerPage settings={settings} />} />
        <Route path="/tips-tricks" element={<TipsPage settings={settings} />} />
        <Route path="/tips-tricks/:slug" element={<TipDetailPage settings={settings} />} />
        <Route path="/tools" element={<ToolsPage settings={settings} />} />
        <Route path="/tools/:slug" element={<ToolDetail settings={settings} />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/invite/:id" element={<InviteDetail settings={settings} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
