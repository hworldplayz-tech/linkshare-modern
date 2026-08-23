import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  Calendar, 
  User as UserIcon, 
  Tag, 
  Share2,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Clock
} from 'lucide-react';
import { SiteSettings, Tip } from '../types';
import { db, auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged } from '../firebase';
import { collection, query, where, getDocs, limit, onSnapshot } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AddGroupModal } from './AddGroupModal';
import AdPlacement from './AdPlacement';
import { Button } from './ui/Button';

interface TipDetailPageProps {
  settings: SiteSettings;
}

export default function TipDetailPage({ settings }: TipDetailPageProps) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [tip, setTip] = React.useState<Tip | null>(null);
  const [relatedTips, setRelatedTips] = React.useState<Tip[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<User | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [authLoading, setAuthLoading] = React.useState(false);
  const [authError, setAuthError] = React.useState('');

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user as User | null);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (authLoading) return;
    setAuthLoading(true);
    setAuthError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/popup-blocked') {
        setAuthError('Popup blocked! Please allow popups for this site to sign in.');
      } else {
        setAuthError('An error occurred during login. Please try again.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  React.useEffect(() => {
    if (!slug) return;

    const q = query(collection(db, 'tips'), where('slug', '==', slug), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const tipData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Tip;
        setTip(tipData);
        
        // Fetch related tips
        const relatedQ = query(collection(db, 'tips'), limit(4));
        getDocs(relatedQ).then(relatedSnapshot => {
          const relatedData = relatedSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Tip))
            .filter(t => t.slug !== slug)
            .slice(0, 3);
          setRelatedTips(relatedData);
        });
      } else {
        setTip(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [slug]);

  React.useEffect(() => {
    if (!tip || !contentRef.current) return;

    const runEmbeddedScripts = async () => {
      if (!contentRef.current) return;
      const scripts = Array.from(contentRef.current.querySelectorAll('script')) as HTMLScriptElement[];

      const origWrite = document.write;
      const origWriteln = document.writeln;

      // 1. Separate inline scripts and external scripts
      const inlineScripts: HTMLScriptElement[] = [];
      const externalScripts: HTMLScriptElement[] = [];

      for (const s of scripts) {
        if (s.dataset.executed === 'true') continue;
        s.dataset.executed = 'true';
        if (s.getAttribute('src')) {
          externalScripts.push(s);
        } else {
          inlineScripts.push(s);
        }
      }

      // 2. Run ALL INLINE SCRIPTS FIRST immediately (non-blocking)
      for (const oldScript of inlineScripts) {
        const scriptCode = oldScript.textContent || '';
        if (scriptCode.trim()) {
          // Attach function declarations to window so inline onclick="funcName()" works
          const fnMatches = Array.from(scriptCode.matchAll(/function\s+([a-zA-Z0-9_$]+)\s*\(/g));
          let windowAttachCode = '';
          for (const match of fnMatches) {
            const fnName = match[1];
            if (fnName && !scriptCode.includes(`window.${fnName}`)) {
              windowAttachCode += `\ntry { window.${fnName} = ${fnName}; } catch(e){}`;
            }
          }

          const fullScript = scriptCode + windowAttachCode;

          // Create new script tag for global window context execution
          const newScript = document.createElement('script');
          (Array.from(oldScript.attributes) as Attr[]).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
          });
          newScript.textContent = fullScript;
          
          if (oldScript.parentNode) {
            oldScript.parentNode.insertBefore(newScript, oldScript);
            oldScript.remove();
          } else {
            document.body.appendChild(newScript);
            oldScript.remove();
          }

          // Evaluate in global scope immediately as fail-safe
          try {
            (0, eval)(fullScript);
          } catch(e) {}
        }
      }

      // 3. Process EXTERNAL SCRIPTS (Ad networks, etc.) with timeout so bad network script never hangs the page
      for (const oldScript of externalScripts) {
        const parent = oldScript.parentNode || contentRef.current;
        const adContainer = document.createElement('div');
        adContainer.className = 'ad-script-output my-3 flex justify-center max-w-full overflow-x-auto';
        parent.insertBefore(adContainer, oldScript);

        const handleWrite = (...args: any[]) => {
          const html = args.join('');
          if (!html) return;
          try {
            const temp = document.createElement('div');
            temp.innerHTML = html;
            while (temp.firstChild) {
              const child = temp.firstChild;
              if (child.nodeName === 'SCRIPT') {
                const sEl = child as HTMLScriptElement;
                const newS = document.createElement('script');
                if (sEl.src) {
                  newS.src = sEl.src.startsWith('//') ? 'https:' + sEl.src : sEl.src;
                } else {
                  newS.textContent = sEl.textContent;
                }
                newS.onerror = (e: any) => {
                  if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
                };
                adContainer.appendChild(newS);
                temp.removeChild(child);
              } else {
                adContainer.appendChild(child);
              }
            }
          } catch (e) {
            console.error('Error in tip ad script write:', e);
          }
        };

        document.write = handleWrite;
        document.writeln = handleWrite;

        const src = oldScript.getAttribute('src');
        if (src) {
          const finalSrc = src.startsWith('//') ? 'https:' + src : src;
          await new Promise<void>((resolve) => {
            const newScript = document.createElement('script');
            (Array.from(oldScript.attributes) as Attr[]).forEach(attr => {
              if (attr.name !== 'src') {
                newScript.setAttribute(attr.name, attr.value);
              }
            });
            newScript.src = finalSrc;

            const timer = setTimeout(() => resolve(), 1500);

            newScript.onload = () => { clearTimeout(timer); resolve(); };
            newScript.onerror = () => { clearTimeout(timer); resolve(); };
            parent.insertBefore(newScript, oldScript);
            oldScript.remove();
          });
        }

        document.write = origWrite;
        document.writeln = origWriteln;
      }

      document.write = origWrite;
      document.writeln = origWriteln;
    };

    runEmbeddedScripts();
  }, [tip]);

  React.useEffect(() => {
    // Universal fail-safe click listener for Blogger / WordPress / custom download buttons (e.g. lsx9GenerateBtn)
    const handleCustomButtonClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // 1. Check if user clicked a start button like .lsx9-main-btn
      const mainBtn = target.closest('.lsx9-main-btn, [onclick*="lsx9StartArea"]') as HTMLElement | null;
      if (mainBtn) {
        if (typeof (window as any).lsx9StartArea === 'function') {
          try { (window as any).lsx9StartArea(); } catch(err) {}
        } else {
          mainBtn.style.display = 'none';
          const genArea = document.getElementById('lsx9GenerateArea');
          if (genArea) genArea.style.display = 'block';
        }
      }

      // 2. Check if user clicked a generate button like #lsx9GenerateBtn or .lsx9-action-btn
      const genBtn = target.closest('#lsx9GenerateBtn, .lsx9-action-btn, .generate-download-btn, [data-action="generate"]') as HTMLElement | null;
      if (genBtn && genBtn.id === 'lsx9GenerateBtn') {
        const loader = document.getElementById('lsx9Loader');
        const timerSpan = document.getElementById('lsx9Timer');
        const redirectMsg = document.getElementById('redirect-id');
        const realBtn = document.getElementById('lsx9DownloadReal') as HTMLAnchorElement | null;

        // If loader is already visible or real button is already visible, don't restart
        if (loader && loader.style.display === 'block') return;
        if (realBtn && realBtn.style.display === 'block') return;

        // Perform the generation sequence
        genBtn.style.display = 'none';
        if (loader) loader.style.display = 'block';
        if (redirectMsg) redirectMsg.style.display = 'block';

        let count = 5;
        if (timerSpan) timerSpan.innerText = String(count);

        const interval = setInterval(() => {
          count--;
          if (timerSpan) timerSpan.innerText = String(count);
          if (count <= 0) {
            clearInterval(interval);
            if (loader) loader.style.display = 'none';
            if (realBtn) {
              realBtn.style.display = 'block';
              const downloadUrl = realBtn.getAttribute('href') || realBtn.href;
              if (
                downloadUrl &&
                downloadUrl !== '#' &&
                !downloadUrl.startsWith('javascript:') &&
                !downloadUrl.includes('YOUR_DOWNLOAD_LINK_HERE')
              ) {
                try {
                  window.open(downloadUrl, '_blank');
                } catch(err) {}
              }
            }
          }
        }, 1000);
      }
    };

    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor) {
        const rawHref = anchor.getAttribute('href') || '';
        if (
          !rawHref ||
          rawHref === '#' ||
          rawHref.startsWith('#') ||
          rawHref.startsWith('javascript:') ||
          rawHref.startsWith('http://') ||
          rawHref.startsWith('https://') ||
          rawHref.includes('YOUR_DOWNLOAD_LINK_HERE') ||
          anchor.hasAttribute('download') ||
          anchor.hasAttribute('onclick') ||
          anchor.getAttribute('target') === '_blank' ||
          anchor.id === 'lsx9DownloadReal' ||
          anchor.classList.contains('lsx9-action-btn') ||
          anchor.hasAttribute('data-url') ||
          anchor.hasAttribute('data-link')
        ) {
          return;
        }

        if (anchor.href.startsWith(window.location.origin)) {
          const path = anchor.href.replace(window.location.origin, '');
          if (path.startsWith('/') && !path.startsWith('/#')) {
            e.preventDefault();
            navigate(path);
          }
        }
      }
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('click', handleCustomButtonClick);
      contentElement.addEventListener('click', handleLinkClick);
    }

    return () => {
      if (contentElement) {
        contentElement.removeEventListener('click', handleCustomButtonClick);
        contentElement.removeEventListener('click', handleLinkClick);
      }
    };
  }, [navigate]);

  if (!tip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <Sparkles className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Tutorial Not Found</h1>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          The tutorial you're looking for might have been moved or deleted. 
          Check out our other tips and tricks!
        </p>
        <Button onClick={() => navigate('/tips-tricks')}>
          <ChevronLeft className="w-5 h-5" /> Back to Tips & Tricks
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar 
        settings={settings}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onAddClick={() => setIsAddModalOpen(true)}
        authError={authError}
        authLoading={authLoading}
      />

      <AdPlacement id="global_top" settings={settings} />

      {/* --- Article Header --- */}
      <header className="pt-40 pb-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-[#00a884] font-bold text-sm mb-6"
          >
            <Link to="/tips-tricks" className="hover:underline">Tips & Tricks</Link>
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <span className="text-gray-400 font-medium">{tip.category}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-8 tracking-tight leading-tight"
          >
            {tip.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center gap-6 text-sm text-gray-500"
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#00a884]/10 rounded-full flex items-center justify-center text-[#00a884]">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-gray-900">{tip.author}</div>
                <div className="text-xs">Author</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(tip.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              5 min read
            </div>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              {tip.category}
            </div>
          </motion.div>
        </div>
      </header>

      {/* --- Article Content --- */}
      <main className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-[21/9] rounded-[3rem] overflow-hidden mb-16 shadow-2xl shadow-gray-200"
          >
            <img 
              src={tip.imageUrl} 
              alt={tip.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Sidebar */}
            <div className="lg:col-span-1 hidden lg:block">
              <div className="sticky top-32 flex flex-col gap-4">
                <button className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#00a884] hover:border-[#00a884] hover:bg-[#00a884]/5 transition-all">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#00a884] hover:border-[#00a884] hover:bg-[#00a884]/5 transition-all">
                  <MessageCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-11">
              <AdPlacement id="tips_detail_top" settings={settings} />
              <div 
                ref={contentRef}
                className="prose prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-gray-600 prose-a:text-[#00a884] prose-strong:text-gray-900 prose-img:rounded-[2rem]"
                dangerouslySetInnerHTML={{ __html: tip.content }}
              />
              <AdPlacement id="tips_detail_bottom" settings={settings} />

              {/* Share Section */}
              <div className="mt-20 pt-10 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-gray-900">Share this tutorial:</span>
                  <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center hover:scale-110 transition-transform">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button className="w-10 h-10 rounded-xl bg-green-500 text-white flex items-center justify-center hover:scale-110 transition-transform">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  {['WhatsApp', 'Tutorial', 'Secrets'].map(tag => (
                    <span key={tag} className="px-4 py-1.5 bg-gray-50 text-gray-500 rounded-full text-xs font-bold">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- Related Tutorials --- */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Related Tutorials</h2>
            <Link to="/tips-tricks" className="text-[#00a884] font-bold flex items-center gap-2 hover:underline">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedTips.map((related, idx) => (
              <motion.article
                key={related.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-500"
              >
                <Link to={`/tips-tricks/${related.slug}`} className="block relative aspect-[16/10] overflow-hidden">
                  <img 
                    src={related.imageUrl} 
                    alt={related.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </Link>
                <div className="p-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#00a884] mb-2 block">
                    {related.category}
                  </span>
                  <Link to={`/tips-tricks/${related.slug}`}>
                    <h3 className="text-lg font-black text-gray-900 mb-3 group-hover:text-[#00a884] transition-colors leading-tight">
                      {related.title}
                    </h3>
                  </Link>
                  <p className="text-gray-500 text-xs line-clamp-2 mb-4">
                    {related.excerpt}
                  </p>
                  <Link 
                    to={`/tips-tricks/${related.slug}`}
                    className="inline-flex items-center gap-1.5 text-[#00a884] font-bold text-xs group/btn"
                  >
                    Read More
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <Footer settings={settings} />

      <AddGroupModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        user={user}
        settings={settings}
        onLogin={handleLogin}
        authLoading={authLoading}
        authError={authError}
      />
    </div>
  );
}
