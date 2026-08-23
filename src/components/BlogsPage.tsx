import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ChevronRight, 
  Search, 
  Calendar, 
  User as UserIcon, 
  Tag, 
  ArrowRight,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { SiteSettings, Blog } from '../types';
import { db, auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AddGroupModal } from './AddGroupModal';
import AdPlacement from './AdPlacement';
import { Button } from './ui/Button';
import { SEOHead } from './SEOHead';
import { SEOBacklinkHub } from './SEOBacklinkHub';
import { getCurrentDateInfo } from '../lib/seoHelper';

interface BlogsPageProps {
  settings: SiteSettings;
}

export default function BlogsPage({ settings }: BlogsPageProps) {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<User | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [blogs, setBlogs] = React.useState<Blog[]>([]);
  const [loading, setLoading] = React.useState(true);
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
    const unsubscribe = onSnapshot(collection(db, 'blogs'), (snapshot) => {
      const blogsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Blog[];
      blogsData.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      setBlogs(blogsData);
      setLoading(false);
    }, (error) => {
      console.error("Error loading blogs:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredBlogs = blogs.filter(blog => 
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dateInfo = getCurrentDateInfo();

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title={`Tech Articles, Guides & Latest WhatsApp Tutorials`}
        description={`Read the latest tech news, practical guides, tool tutorials, and online growth strategies updated for ${dateInfo.formattedMonthYear}.`}
        keywords="tech articles, whatsapp guides, developer tutorials, online tool guides, tech blog 2026"
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
          <AdPlacement id="blogs_list_top" settings={settings} />
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#00a884]/10 text-[#00a884] rounded-full text-sm font-bold mb-6"
            >
              <BookOpen className="w-4 h-4" />
              <span>Our Blog & Updates</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight"
            >
              Official <span className="text-[#00a884]">Tech Blog</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-500 mb-10 leading-relaxed"
            >
              Discover awesome secrets about high-end tech tools, custom generator walkthroughs, 
              stylish text hacks, and professional tips to level up your online presence.
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
                placeholder="Search for an article..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 transition-all"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- Blogs Grid --- */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 border-4 border-t-[#00a884] border-gray-100 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500 font-bold">Loading blogs...</p>
            </div>
          ) : filteredBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((blog, idx) => (
                <motion.article
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-[#00a884]/10 transition-all duration-500 flex flex-col h-full"
                >
                  <Link to={`/blog/${blog.slug}`} className="block relative aspect-[16/10] overflow-hidden bg-gray-50">
                    {blog.imageUrl ? (
                      <img 
                        src={blog.imageUrl} 
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <BookOpen className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-[#00a884] shadow-sm">
                        {blog.category}
                      </span>
                    </div>
                  </Link>
                  
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5" />
                        {blog.author}
                      </div>
                    </div>
                    
                    <Link to={`/blog/${blog.slug}`}>
                      <h3 className="text-xl font-black text-gray-900 mb-4 group-hover:text-[#00a884] transition-colors leading-tight line-clamp-2">
                        {blog.title}
                      </h3>
                    </Link>
                    
                    <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-1">
                      {blog.excerpt}
                    </p>
                    
                    <Link 
                      to={`/blog/${blog.slug}`}
                      className="inline-flex items-center gap-2 text-[#00a884] font-bold text-sm group/btn"
                    >
                      Read Full Post
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No blogs found</h3>
              <p className="text-gray-500">Try searching for something else or browse all posts.</p>
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
          <div className="bg-[#00a884] rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-[#00a884]/20">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-[100px]" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-[100px]" />
            </div>
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
                Get Tech Tool Updates & Tips
              </h2>
              <p className="text-white/80 text-lg mb-10">
                Be the first to hear about our newest tool launches, secret tricks, and generator styling tips.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-white/50 focus:outline-none focus:bg-white/20 transition-all"
                />
                <Button variant="blank" className="bg-white text-[#00a884] hover:bg-gray-100 px-8 py-4 font-bold rounded-2xl">
                  Subscribe
                </Button>
              </div>
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
