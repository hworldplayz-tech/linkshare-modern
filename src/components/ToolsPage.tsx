import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Search, 
  ArrowRight,
  Wrench,
  QrCode,
  Type,
  Link as LinkIcon,
  Sparkles,
  Cpu,
  RefreshCw,
  Camera,
  FileEdit,
  MessageSquare,
  MessageCircle,
  Circle,
  ListMusic,
  FileStack,
  Palette
} from 'lucide-react';
import { SiteSettings, TOOLS } from '../types';
import { auth, onAuthStateChanged, googleProvider, signInWithPopup, signOut } from '../firebase';
import { User } from 'firebase/auth';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AddGroupModal } from './AddGroupModal';
import AdPlacement from './AdPlacement';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { getToolVisual } from '../lib/toolVisuals';
import { SEOHead } from './SEOHead';
import { SEOBacklinkHub } from './SEOBacklinkHub';
import { getCurrentDateInfo } from '../lib/seoHelper';

interface ToolsPageProps {
  settings: SiteSettings;
}

const iconMap: Record<string, any> = {
  Search,
  QrCode,
  Type,
  Link: LinkIcon,
  Sparkles,
  Cpu,
  RefreshCw,
  Camera,
  FileEdit,
  MessageSquare,
  MessageCircle,
  Circle,
  ListMusic,
  FileStack,
  Palette
};

export default function ToolsPage({ settings }: ToolsPageProps) {
  const [user, setUser] = React.useState<User | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
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

  const filteredTools = TOOLS.filter(tool => 
    tool.enabled && (
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const dateInfo = getCurrentDateInfo();

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title={`All 20+ Free Online Tech Tools & Utilities Suite`}
        description={`Explore all 20+ fast, 100% free online tech tools, AI content detectors, QR code generators, PDF editors, and developers utilities updated daily for ${dateInfo.formattedMonthYear}.`}
        keywords="free online tools, developer utilities, pdf editor, qr code generator, ai content checker, text repeater, latest web tools 2026"
      />
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

      {/* --- Hero Section --- */}
      <section className="pt-40 pb-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <AdPlacement id="tools_list_top" settings={settings} />
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#00a884]/10 text-[#00a884] rounded-full text-sm font-bold mb-6"
            >
              <Wrench className="w-4 h-4" />
              <span>Free Online Tools</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight"
            >
              Powerful <span className="text-[#00a884]">Online Tools</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-500 mb-10 leading-relaxed"
            >
              Enhance your productivity with our suite of free online tools. 
              From content analysis to utility generators, we have everything you need.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative max-w-xl"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text"
                placeholder="Search for a tool..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 transition-all"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- Tools Grid --- */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 md:gap-5">
              {filteredTools.map((tool, idx) => {
                const visual = getToolVisual(tool.id);
                const ToolIcon = visual.icon;

                return (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                  >
                    <Link
                      to={`/tools/${tool.slug}`}
                      className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-5 md:p-6 flex flex-col items-center justify-center text-center cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-[#00a884]/40 transition-all duration-300 group min-h-[140px] sm:min-h-[160px] md:min-h-[180px] h-full"
                    >
                      <div className={cn(
                        "w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 transition-transform duration-300 group-hover:scale-110",
                        visual.bgClass
                      )}>
                        <ToolIcon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                      </div>
                      <h3 className="font-bold text-xs sm:text-sm md:text-base text-gray-800 group-hover:text-[#00a884] transition-colors leading-snug line-clamp-2 px-1">
                        {tool.title}
                      </h3>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No tools found</h3>
              <p className="text-gray-500">Try searching for something else or browse all categories.</p>
              <Button 
                variant="outline" 
                className="mt-8 mx-auto"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gray-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00a884] rounded-full blur-[100px]" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00a884] rounded-full blur-[100px]" />
            </div>
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <Sparkles className="w-12 h-12 text-[#00a884] mx-auto mb-8" />
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
                Need a Custom Tool?
              </h2>
              <p className="text-gray-400 text-lg mb-10">
                We're always looking to expand our suite of tools. If you have a suggestion for a tool that would be helpful, let us know!
              </p>
              <Link to="/contact">
                <Button className="bg-[#00a884] text-white hover:bg-[#008f6f] px-10 py-4 font-bold rounded-2xl h-auto">
                  Suggest a Tool
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- SEO Authority Backlinks & 50+ Hashtag Hub --- */}
      <SEOBacklinkHub showFullHub={true} />

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
