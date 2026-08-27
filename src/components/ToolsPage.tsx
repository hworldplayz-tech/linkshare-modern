import React, { useState } from 'react';
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
  Palette,
  Video,
  Layers,
  Code
} from 'lucide-react';
import { SiteSettings, TOOLS, Tool } from '../types';
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

export const TOOL_CATEGORIES = [
  { id: 'all', label: 'All Tools', icon: Wrench, description: 'All online tools & utilities' },
  { id: 'social', label: 'Social & Video Tools', icon: Video, description: 'TikTok, WhatsApp & social utilities' },
  { id: 'pdf', label: 'PDF & Document Tools', icon: FileStack, description: 'PDF editor, merger & converters' },
  { id: 'ai', label: 'AI Tools', icon: Sparkles, description: 'AI detector, caption generator & analyzers' },
  { id: 'dev', label: 'Dev & Web Tools', icon: Code, description: 'iFrame generator, source code viewer & link tools' },
  { id: 'utility', label: 'Utility & Media Tools', icon: QrCode, description: 'QR generator, scanner, image editor & viewer' },
];

export const matchToolCategory = (tool: Tool, catId: string): boolean => {
  if (catId === 'all') return true;
  if (catId === 'social') {
    return tool.category === 'Social' || 
           ['tiktok-downloader', 'stylish-text', 'text-repeater', 'fake-whatsapp-screenshot', 
            'whatsapp-read-more', 'whatsapp-link-generator', 'whatsapp-dp-border', 
            'whatsapp-group-name-generator', 'whatsapp-status-formatter'].includes(tool.id);
  }
  if (catId === 'pdf') {
    return tool.category === 'Document' || ['pdf-editor', 'image-pdf-merger', 'image-compressor'].includes(tool.id);
  }
  if (catId === 'ai') {
    return tool.category === 'AI Tools' || ['ai-detector', 'whatsapp-caption-generator', 'plagiarism-checker'].includes(tool.id);
  }
  if (catId === 'dev') {
    return tool.category === 'Dev Tools' || ['iframe-generator', 'source-code-viewer', 'short-url-generator'].includes(tool.id);
  }
  if (catId === 'utility') {
    return tool.category === 'Utility' || tool.category === 'Content' || 
           ['qr-code-generator', 'qr-scanner', 'image-editor', 'image-compressor', 'm3u-playlist-viewer', 'word-counter', 'plagiarism-checker'].includes(tool.id);
  }
  return true;
};

export default function ToolsPage({ settings }: ToolsPageProps) {
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

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

  const filteredTools = TOOLS.filter(tool => {
    if (!tool.enabled) return false;
    const matchesCategory = matchToolCategory(tool, selectedCategory);
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      tool.title.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.category.toLowerCase().includes(q)
    );
    return matchesCategory && matchesSearch;
  });

  const getCategoryCount = (catId: string) => {
    return TOOLS.filter(t => t.enabled && matchToolCategory(t, catId)).length;
  };

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
      <section className="pt-36 pb-14 bg-gradient-to-b from-gray-50 via-white to-gray-50/50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <AdPlacement id="tools_list_top" settings={settings} />
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#00a884]/10 text-[#00a884] rounded-full text-sm font-bold mb-6"
            >
              <Wrench className="w-4 h-4" />
              <span>Free Online Tools & Utilities Suite</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-5 tracking-tight"
            >
              Powerful <span className="text-[#00a884]">Online Tools</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed"
            >
              Boost your productivity with our suite of {TOOLS.length}+ fast, 100% free browser tools. 
              From TikTok video downloads and PDF editors to AI analyzers and developer utilities.
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
                placeholder="Search tools by name, keyword, or function..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 focus:border-[#00a884] transition-all text-sm sm:text-base"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600 px-2 py-1 bg-gray-100 rounded-lg"
                >
                  Clear
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- Categorized Tools Tabs & Grid Section --- */}
      <section className="py-12 md:py-16 bg-white min-h-[600px]">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* CATEGORY TABS BAR ABOVE TOOLS */}
          <div className="mb-10">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#00a884]" />
                  <span>Browse by Category</span>
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Select a category to filter the {TOOLS.filter(t => t.enabled).length} available tools
                </p>
              </div>
              
              <div className="hidden sm:block text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                Showing {filteredTools.length} {filteredTools.length === 1 ? 'Tool' : 'Tools'}
              </div>
            </div>

            {/* Scrollable / Responsive Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
              {TOOL_CATEGORIES.map((cat) => {
                const CatIcon = cat.icon;
                const count = getCategoryCount(cat.id);
                const isActive = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "group flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer shrink-0 border",
                      isActive
                        ? "bg-[#00a884] text-white border-[#00a884] shadow-md shadow-[#00a884]/20 scale-[1.02]"
                        : "bg-white text-gray-700 border-gray-200 hover:border-[#00a884]/40 hover:bg-gray-50/80"
                    )}
                  >
                    <CatIcon className={cn("w-4 h-4 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-[#00a884]")} />
                    <span>{cat.label}</span>
                    <span className={cn(
                      "text-[11px] font-black px-2 py-0.5 rounded-full",
                      isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600 group-hover:bg-[#00a884]/10 group-hover:text-[#00a884]"
                    )}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TOOLS GRID */}
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 md:gap-5">
              {filteredTools.map((tool, idx) => {
                const visual = getToolVisual(tool.id);
                const ToolIcon = visual.icon;

                return (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.02, 0.25) }}
                  >
                    <Link
                      to={`/tools/${tool.slug}`}
                      className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-5 md:p-6 flex flex-col items-center justify-center text-center cursor-pointer shadow-xs hover:shadow-xl hover:-translate-y-1.5 hover:border-[#00a884]/40 transition-all duration-300 group min-h-[150px] sm:min-h-[170px] md:min-h-[190px] h-full relative overflow-hidden"
                    >
                      {/* Category mini badge */}
                      <span className="absolute top-2.5 right-2.5 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 group-hover:bg-[#00a884]/10 group-hover:text-[#00a884] transition-colors">
                        {tool.category}
                      </span>

                      <div className={cn(
                        "w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 transition-transform duration-300 group-hover:scale-110 shadow-xs",
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
            <div className="text-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No tools found</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                No tools matched your search "{searchQuery}" in the selected category.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                >
                  Reset All Filters
                </Button>
              </div>
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
