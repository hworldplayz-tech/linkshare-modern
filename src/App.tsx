import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ScrollToTop from './components/ScrollToTop';
import AdPlacement from './components/AdPlacement';
import { auth, db, doc, onSnapshot, setDoc, updateDoc, onAuthStateChanged, trackUserLogin, collection, getDocs } from './firebase';
import { SiteSettings, DEFAULT_SETTINGS } from './types';
import { DEFAULT_BLOGS } from './data/defaultBlogs';
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
import BlogsPage from './components/BlogsPage';
import BlogDetailPage from './components/BlogDetailPage';
import ToolsPage from './components/ToolsPage';
import ToolDetail from './components/ToolDetail';
import RedirectPage from './components/RedirectPage';
import { IranVsIsraelPage } from './components/IranVsIsraelPage';

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
        const needsPollMenuUpdate = !data.headerMenus?.some(m => m.href === '/iran-vs-israel');
        const needsPollBannerUpdate = data.showPollBanner === undefined;
        const needsBlogsMenuUpdate = !data.headerMenus?.some(m => m.href === '/blogs');
        const needsBlogsCountUpdate = data.homepageBlogsCount === undefined;
        const hasFifaMenu = data.headerMenus?.some(m => m.id === 'fifa' || m.href === '/fifa-world-cup-2026-live') ||
                             data.footerQuickLinks?.some(m => m.id === 'fifa' || m.href === '/fifa-world-cup-2026-live');
        
        // Check for duplicate menu keys in header or footer to trigger migration and cleanup
        const hasDuplicateHeaderKeys = data.headerMenus?.some((m, idx) => data.headerMenus.findIndex(x => x.id === m.id) !== idx) || false;
        const hasDuplicateFooterKeys = data.footerQuickLinks?.some((m, idx) => data.footerQuickLinks.findIndex(x => x.id === m.id) !== idx) || false;

        // One-time migration for the new permanent defaults requested by user
        const needsPermanentUpdate = data.siteTitle === 'LinkShare' || 
                                     data.heroTitle === 'Discover and Promote Your WhatsApp Groups' ||
                                     data.heroTitleSize === 'h1' ||
                                     !data.faviconUrl;

        if (needsLegalUpdate || needsQuickUpdate || needsHeaderUpdate || needsAdUpdate || needsGlobalAdUpdate || needsPollMenuUpdate || needsPollBannerUpdate || needsPermanentUpdate || hasFifaMenu || needsBlogsMenuUpdate || hasDuplicateHeaderKeys || hasDuplicateFooterKeys || needsBlogsCountUpdate) {
          const updateData: any = {};
          
          if (needsPermanentUpdate) {
            updateData.siteTitle = DEFAULT_SETTINGS.siteTitle;
            updateData.siteDescription = DEFAULT_SETTINGS.siteDescription;
            updateData.heroTitle = DEFAULT_SETTINGS.heroTitle;
            updateData.heroSubtitle = DEFAULT_SETTINGS.heroSubtitle;
            updateData.heroTitleSize = DEFAULT_SETTINGS.heroTitleSize;
            updateData.footerAbout = DEFAULT_SETTINGS.footerAbout;
            updateData.faviconUrl = DEFAULT_SETTINGS.faviconUrl;
            updateData.headerLogoUrl = DEFAULT_SETTINGS.headerLogoUrl;
          }

          if (needsPollBannerUpdate) {
            updateData.showPollBanner = DEFAULT_SETTINGS.showPollBanner;
            updateData.pollBannerText = DEFAULT_SETTINGS.pollBannerText;
          }

          if (needsBlogsCountUpdate) {
            updateData.homepageBlogsCount = DEFAULT_SETTINGS.homepageBlogsCount;
          }
          
          // Deduplicate by ID helper to prevent React/key errors
          const deduplicateByID = (menus: any[]) => {
            const seenIds = new Set<string>();
            return menus.filter(menu => {
              if (!menu || !menu.id) return false;
              if (seenIds.has(menu.id)) {
                return false;
              }
              seenIds.add(menu.id);
              return true;
            });
          };

          let currentHeaders = deduplicateByID([...(data.headerMenus || [])]).filter(m => m.id !== 'fifa' && m.href !== '/fifa-world-cup-2026-live');
          let currentFooters = deduplicateByID([...(data.footerQuickLinks || [])]).filter(m => m.id !== 'fifa' && m.href !== '/fifa-world-cup-2026-live');
          let menuChanged = hasDuplicateHeaderKeys || hasDuplicateFooterKeys || hasFifaMenu;

          if (needsPollMenuUpdate) {
            if (!currentHeaders.some(m => m.href === '/iran-vs-israel')) {
              currentHeaders.push({ id: 'poll', label: 'Iran vs Israel', href: '/iran-vs-israel' });
            }
            if (!currentFooters.some(m => m.href === '/iran-vs-israel')) {
              currentFooters.push({ id: 'poll', label: 'Iran vs Israel', href: '/iran-vs-israel' });
            }
            menuChanged = true;
          }

          if (needsBlogsMenuUpdate) {
            if (!currentHeaders.some(m => m.href === '/blogs')) {
              currentHeaders.push({ id: 'blogs', label: 'Blogs', href: '/blogs' });
            }
            if (!currentFooters.some(m => m.href === '/blogs')) {
              currentFooters.push({ id: 'blogs', label: 'Blogs', href: '/blogs' });
            }
            menuChanged = true;
          }

          // Force fresh deduplication again on final lists
          currentHeaders = deduplicateByID(currentHeaders);
          currentFooters = deduplicateByID(currentFooters);

          if (menuChanged) {
            updateData.headerMenus = currentHeaders;
            updateData.footerQuickLinks = currentFooters;
          }
          
          if (needsLegalUpdate || needsQuickUpdate || needsHeaderUpdate) {
            updateData.footerLegalLinks = (data.footerLegalLinks || []).map(link => {
              const defaultLink = DEFAULT_SETTINGS.footerLegalLinks.find(d => d.label === link.label);
              if ((link.href === '#' || link.href === '/#groups' || link.href === '#groups' || link.href === '#tools') && defaultLink) {
                return { ...link, href: defaultLink.href };
              }
              return link;
            });

            updateData.footerQuickLinks = (updateData.footerQuickLinks || currentFooters).map(link => {
              const defaultLink = DEFAULT_SETTINGS.footerQuickLinks.find(d => d.label === link.label);
              if ((link.href === '#' || link.href === '/#groups' || link.href === '#groups' || link.href === '#tools') && defaultLink) {
                return { ...link, href: defaultLink.href };
              }
              return link;
            });

            updateData.headerMenus = (updateData.headerMenus || currentHeaders).map(link => {
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

          const isAdmin = auth.currentUser?.email === 'hworldplayz@gmail.com' || localStorage.getItem('adminLoggedIn') === 'true';
          if (isAdmin) {
            updateDoc(doc(db, 'settings', 'main'), updateData).catch((err) => {
              console.warn('Failed to save settings migration to Firestore:', err);
            });
          }
          
          // Merge settings in local React memory state so UI gets the migrated state instantly
          setSettings({ ...data, ...updateData });
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
        setDoc(doc(db, 'settings', 'main'), DEFAULT_SETTINGS).catch((err) => {
          console.warn('Failed to initialize settings in Firestore:', err);
        });
        setSettings(DEFAULT_SETTINGS);
        localStorage.setItem('site_settings', JSON.stringify(DEFAULT_SETTINGS));
      }
    }, (error) => {
      console.warn("Settings snapshot listener warning:", error.message);
    });

    return () => {
      unsubscribeAuth();
      unsubSettings();
    };
  }, []);

  // Auto-seed default blogs if empty on startup
  useEffect(() => {
    const seedBlogs = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'blogs'));
        if (querySnapshot.empty) {
          console.log('Seeding default blogs...');
          for (const blog of DEFAULT_BLOGS) {
            await setDoc(doc(db, 'blogs', blog.id), blog);
          }
          console.log('Default blogs seeded successfully!');
        }
      } catch (err) {
        console.warn('Error auto-seeding default blogs:', err);
      }
    };
    seedBlogs();
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
        {settings.faviconUrl && <link rel="icon" href={settings.faviconUrl} />}
        
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
        <Route path="/blogs" element={<BlogsPage settings={settings} />} />
        <Route path="/blog/:slug" element={<BlogDetailPage settings={settings} />} />
        <Route path="/tools" element={<ToolsPage settings={settings} />} />
        <Route path="/tools/:slug" element={<ToolDetail settings={settings} />} />
        <Route path="/iran-vs-israel" element={<IranVsIsraelPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/invite/:id" element={<InviteDetail settings={settings} />} />
        <Route path="/s/:shortId" element={<RedirectPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
