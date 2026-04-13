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
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTools.map((tool, idx) => {
                const Icon = iconMap[tool.icon] || Wrench;
                return (
                  <motion.article
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="group bg-white rounded-[2.5rem] border border-gray-100 p-8 hover:shadow-2xl hover:shadow-[#00a884]/10 transition-all duration-500 flex flex-col h-full relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#00a884]/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                    
                    <div className="w-16 h-16 bg-[#00a884]/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 relative z-10">
                      <Icon className="w-8 h-8 text-[#00a884]" />
                    </div>

                    <div className="relative z-10 flex-1">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          {tool.category}
                        </span>
                      </div>
                      
                      <Link to={`/tools/${tool.slug}`}>
                        <h3 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-[#00a884] transition-colors leading-tight">
                          {tool.title}
                        </h3>
                      </Link>
                      
                      <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                    
                    <Link 
                      to={`/tools/${tool.slug}`}
                      className="inline-flex items-center gap-2 text-[#00a884] font-bold text-sm group/btn relative z-10"
                    >
                      Open Tool
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </motion.article>
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
