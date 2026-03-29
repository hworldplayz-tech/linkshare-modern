import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Globe, 
  MessageSquare, 
  Users, 
  ChevronRight, 
  ChevronLeft,
  ArrowRight,
  LayoutGrid,
  Zap,
  BookOpen,
  HelpCircle,
  Menu,
  X,
  Filter,
  AlertCircle,
  Loader2,
  ExternalLink,
  QrCode,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Youtube,
  Type,
  Calculator,
  Scan,
  Scissors,
  FileJson,
  Music,
  Download,
  Eye,
  Sparkles,
  List,
  Share2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  User,
  doc
} from '../firebase';
import { Group, SiteSettings, DEFAULT_SETTINGS, Tip } from '../types';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AddGroupModal } from './AddGroupModal';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';

// --- Components ---

const Card = ({ children, className, ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <div className={cn('bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden', className)} {...props}>
    {children}
  </div>
);

const TOOLS = [
  { id: 'plagiarism', name: 'Plagiarism Checker', icon: Zap, desc: 'Ensure your content is 100% original.' },
  { id: 'ai-detector', name: 'AI Detector', icon: Zap, desc: 'Detect AI-generated content easily.' },
  { id: 'word-counter', name: 'Word Counter', icon: FileText, desc: 'Count words, characters, and more.' },
  { id: 'cv-maker', name: 'CV Maker', icon: LayoutGrid, desc: 'Create professional resumes in minutes.' },
  { id: 'image-to-pdf', name: 'Image to PDF', icon: ImageIcon, desc: 'Convert images to high-quality PDF.' },
  { id: 'pdf-merger', name: 'PDF Merger', icon: FileJson, desc: 'Combine multiple PDF files into one.' },
  { id: 'pdf-editor', name: 'PDF Editor', icon: Scissors, desc: 'Edit, annotate, and sign PDF documents.' },
  { id: 'image-editor', name: 'Image Editor', icon: Sparkles, desc: 'Crop, resize, and enhance your photos.' },
  { id: 'fake-chat', name: 'Fake Chat Screenshot', icon: MessageSquare, desc: 'Create realistic-looking fake chats.' },
  { id: 'stylish-text', name: 'Stylish Text Generator', icon: Type, desc: 'Generate cool, fancy text styles.' },
  { id: 'qr-generator', name: 'QR Code Generator', icon: QrCode, desc: 'Create custom QR codes for URLs.' },
  { id: 'qr-scanner', name: 'QR Code Scanner', icon: Scan, desc: 'Scan and read QR codes instantly.' },
  { id: 'short-url', name: 'Short URL Generator', icon: LinkIcon, desc: 'Shorten messy URLs into clean links.' },
  { id: 'doc-converter', name: 'Document Converter', icon: FileText, desc: 'Convert documents between formats.' },
  { id: 'm3u-player', name: 'M3U Playlist Viewer', icon: Music, desc: 'Stream and read M3U IPTV playlists.' },
  { id: 'math-solver', name: 'Math Problem Solver', icon: Calculator, desc: 'Get step-by-step solutions to math.' },
  { id: 'yt-downloader', name: 'YouTube Thumbnail', icon: Youtube, desc: 'Download high-quality thumbnails.' },
  { id: 'text-repeater', name: 'Text Repeater', icon: Type, desc: 'Repeat text or emojis up to 10k times.' },
];

export default function PublicSite({ settings }: { settings: SiteSettings }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedType, setSelectedType] = useState<'all' | 'group' | 'channel'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(settings.defaultView || 'grid');
  const [visibleCount, setVisibleCount] = useState(settings.groupsPerPage || 20);

  useEffect(() => {
    const unsubCats = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const cats = snapshot.docs.map(doc => doc.data().name as string);
      setCategories(cats.length > 0 ? cats : ['Tech', 'Movies', 'Education', 'Entertainment', 'Business', 'Sports', 'Gaming', 'News', 'Lifestyle', 'Other']);
    });
    const unsubCountries = onSnapshot(collection(db, 'countries'), (snapshot) => {
      const counts = snapshot.docs.map(doc => doc.data().name as string);
      setCountries(counts.length > 0 ? counts : ['Global', 'USA', 'Pakistan', 'India', 'UK', 'Canada', 'Australia', 'Germany', 'France', 'Other']);
    });
    return () => {
      unsubCats();
      unsubCountries();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, 'groups'),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const groupsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Group[];
      setGroups(groupsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching groups:', error);
      setLoading(false);
    });

    const tipsQ = query(collection(db, 'tips'), orderBy('createdAt', 'desc'));
    const unsubTips = onSnapshot(tipsQ, (snapshot) => {
      const tipsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Tip[];
      setTips(tipsData);
    });

    return () => {
      unsubscribe();
      unsubTips();
    };
  }, []);

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

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
      } else if (error.code === 'auth/cancelled-popup-request') {
        setAuthError('Login request was cancelled. Please try again.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        setAuthError('Login window was closed before completion.');
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

  const filteredGroups = useMemo(() => {
    return groups.filter(g => {
      const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           g.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || g.category === selectedCategory;
      const matchesCountry = selectedCountry === 'All' || g.country === selectedCountry;
      const matchesType = selectedType === 'all' || g.type === selectedType;
      return matchesSearch && matchesCategory && matchesCountry && matchesType;
    });
  }, [groups, searchQuery, selectedCategory, selectedCountry, selectedType]);

  const displayedGroups = useMemo(() => {
    if (!settings.loadMoreEnabled) return filteredGroups;
    return filteredGroups.slice(0, visibleCount);
  }, [filteredGroups, visibleCount, settings.loadMoreEnabled]);

  const featuredGroups = useMemo(() => groups.filter(g => g.isFeatured), [groups]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-800 font-sans selection:bg-[#00a884] selection:text-white">
      <Navbar 
        settings={settings}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onAddClick={() => setIsAddModalOpen(true)}
        authError={authError}
        authLoading={authLoading}
      />

      {/* --- Hero Section --- */}
      {settings.heroShow && (
        <header className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#00a884]/5 blur-[120px] rounded-full" />
          </div>
          
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`${
                settings.heroTitleSize === 'h1' ? 'text-5xl md:text-7xl' :
                settings.heroTitleSize === 'h2' ? 'text-4xl md:text-6xl' :
                settings.heroTitleSize === 'h3' ? 'text-3xl md:text-5xl' :
                settings.heroTitleSize === 'h4' ? 'text-2xl md:text-4xl' :
                settings.heroTitleSize === 'h5' ? 'text-xl md:text-3xl' :
                'text-lg md:text-2xl'
              } font-black tracking-tight text-gray-900 mb-6 leading-[1.1]`}
            >
              {settings.heroTitle}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
            >
              {settings.heroSubtitle}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Button size="lg" onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-5 h-5" /> Promote Your Group
              </Button>
              <Button variant="outline" size="lg" onClick={() => document.getElementById('groups')?.scrollIntoView({ behavior: 'smooth' })}>
                <Search className="w-5 h-5" /> Explore Groups
              </Button>
            </motion.div>
          </div>
        </header>
      )}

      {/* --- Featured Groups --- */}
      {featuredGroups.length > 0 && (
        <section className="py-12 bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Zap className="text-yellow-500 w-6 h-6" /> Featured Groups
              </h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredGroups.map((group) => (
                <Card key={group.id} className="group hover:border-[#00a884] transition-all duration-300">
                  <div className="p-3 sm:p-5 flex flex-col items-center text-center">
                    <div className="w-full flex items-start justify-between mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl overflow-hidden">
                        {group.imageUrl ? (
                          <img src={group.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          group.type === 'group' ? '👥' : '📢'
                        )}
                      </div>
                      <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-[#00a884]/10 text-[#00a884] text-[10px] sm:text-xs font-bold rounded-full uppercase tracking-wider">
                        {group.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm sm:text-lg mb-1 sm:mb-2 line-clamp-1 w-full">{group.title}</h3>
                    <p className="text-[11px] sm:text-sm text-gray-500 line-clamp-2 mb-3 sm:mb-4 h-8 sm:h-10 w-full">
                      {group.description || 'No description provided.'}
                    </p>
                    <div className="flex items-center justify-between w-full mt-auto">
                      <span className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1">
                        <Globe className="w-3 h-3" /> {group.country || 'Global'}
                      </span>
                      <button 
                        onClick={() => navigate(`/invite/${group.id}`)}
                        className="text-[#00a884] font-bold text-[11px] sm:text-sm flex items-center gap-1 hover:underline"
                      >
                        Join Now <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- Tools Grid --- */}
      <section id="tools" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Discover Powerful Tools</h2>
            <p className="text-gray-600">Free online tools to boost your productivity and enhance your content.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TOOLS.map((tool) => (
              <Card 
                key={tool.id} 
                className="p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(`/tools/${tool.id}`)}
              >
                <div className="flex gap-4">
                  <div className="w-14 h-14 bg-[#00a884]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#00a884] transition-colors">
                    <tool.icon className="w-7 h-7 text-[#00a884] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{tool.name}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{tool.desc}</p>
                    <button className="mt-4 text-[#00a884] text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                      Try Now <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* --- Browse Groups --- */}
      <section id="groups" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-12 text-center xl:text-left">
            <div className="flex flex-col items-center xl:items-start">
              <h2 className="text-4xl font-black mb-2 flex items-center gap-3">
                <Users className="text-[#00a884]" /> Browse Groups
              </h2>
              <p className="text-gray-600">Find the perfect community for your interests.</p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center xl:justify-end gap-3">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search groups..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 focus:border-[#00a884] w-full sm:w-64"
                />
              </div>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 w-full sm:w-auto"
              >
                <option value="All">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select 
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 w-full sm:w-auto"
              >
                <option value="All">All Countries</option>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="flex bg-white border border-gray-200 rounded-full p-1">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={cn("p-2 rounded-full transition-all", viewMode === 'grid' ? "bg-[#00a884] text-white" : "text-gray-400 hover:bg-gray-100")}
                ><LayoutGrid className="w-4 h-4" /></button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={cn("p-2 rounded-full transition-all", viewMode === 'list' ? "bg-[#00a884] text-white" : "text-gray-400 hover:bg-gray-100")}
                ><List className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-[#00a884] animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Loading groups...</p>
            </div>
          ) : displayedGroups.length > 0 ? (
            <div className="space-y-12">
              <div className={cn(
                viewMode === 'grid' 
                  ? "grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6" 
                  : "flex flex-col gap-4"
              )}>
                {displayedGroups.map((group) => (
                  <Card key={group.id} className={cn(
                    "group hover:border-[#00a884] transition-all duration-300",
                    viewMode === 'list' && "flex items-center p-4"
                  )}>
                    {viewMode === 'grid' ? (
                      <div className="p-3 sm:p-5 flex flex-col items-center text-center">
                        <div className="w-full flex items-start justify-between mb-3 sm:mb-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl overflow-hidden">
                            {group.imageUrl ? (
                              <img src={group.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              group.type === 'group' ? <Users className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" /> : <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                              group.type === 'group' ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                            )}>
                              {group.type}
                            </span>
                          </div>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 text-sm sm:text-base">{group.title}</h3>
                        <p className="text-xs text-gray-500 mb-3 sm:mb-4 line-clamp-2 min-h-[2.5rem]">{group.description || 'No description provided.'}</p>
                        <div className="flex items-center gap-2 mb-4 flex-wrap justify-center">
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">{group.category}</span>
                          {group.country && <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium flex items-center gap-1"><Globe className="w-2.5 h-2.5" /> {group.country}</span>}
                        </div>
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="w-full text-xs sm:text-sm h-9 sm:h-10"
                          onClick={() => navigate(`/invite/${group.id}`)}
                        >
                          Join Now <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl mr-4 flex-shrink-0 overflow-hidden">
                          {group.imageUrl ? (
                            <img src={group.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            group.type === 'group' ? <Users className="w-6 h-6 text-gray-400" /> : <Zap className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900 truncate">{group.title}</h3>
                            <span className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                              group.type === 'group' ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                            )}>
                              {group.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-1">{group.description || 'No description provided.'}</p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 mx-4">
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">{group.category}</span>
                          {group.country && <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium flex items-center gap-1"><Globe className="w-2.5 h-2.5" /> {group.country}</span>}
                        </div>
                        <Button 
                          variant="primary" 
                          size="sm" 
                          onClick={() => navigate(`/invite/${group.id}`)}
                          className="flex-shrink-0"
                        >
                          Join <ExternalLink className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </Card>
                ))}
              </div>

              {settings.loadMoreEnabled && filteredGroups.length > visibleCount && (
                <div className="flex justify-center pt-8">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="px-12 border-2"
                      onClick={() => setVisibleCount(prev => prev + settings.groupsPerPage)}
                    >
                      Load More Groups
                    </Button>
                  </motion.div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No groups found</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">We couldn't find any groups matching your search or filters. Try adjusting your criteria or add a new group!</p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-5 h-5" /> Add Your Group
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* --- Tips & Tricks --- */}
      <section id="tips" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-[#00a884] rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-white/10 blur-[100px] rounded-full" />
            
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">WhatsApp Tips & Tricks</h2>
                <p className="text-white/80 text-lg mb-8">Master WhatsApp with our curated collection of guides and hidden features.</p>
                
                <div className="space-y-4 mb-10">
                  {tips.slice(0, 6).map((tip, i) => (
                    <Link 
                      key={tip.id} 
                      to={`/tips-tricks/${tip.slug}`}
                      className="flex items-center gap-3 p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors cursor-pointer group"
                    >
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold text-sm">
                        {i + 1}
                      </div>
                      <span className="font-medium group-hover:translate-x-1 transition-transform">{tip.title}</span>
                      <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                    </Link>
                  ))}
                </div>

                <Button 
                  variant="blank" 
                  onClick={() => navigate('/tips-tricks')}
                  className="bg-white text-[#00a884] hover:bg-gray-100 px-8 py-4 font-bold rounded-2xl w-full sm:w-auto"
                >
                  View All Tutorials <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
              
              <div className="hidden md:block">
                <div className="relative">
                  <div className="absolute -inset-4 bg-white/10 blur-2xl rounded-full" />
                  <img 
                    src={settings.tipsSectionImageUrl || "https://picsum.photos/seed/whatsapp/800/1000"} 
                    alt="WhatsApp Guide" 
                    className="relative rounded-[2rem] shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>
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

      {/* --- Floating Action Button (Mobile & Tablet) --- */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 xl:hidden z-40 w-full px-4 flex justify-center">
        <Button size="lg" className="shadow-2xl h-14 px-8 rounded-2xl whitespace-nowrap max-w-[90vw]" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-6 h-6 flex-shrink-0" /> <span className="truncate">Add Group</span>
        </Button>
      </div>
    </div>
  );
}
