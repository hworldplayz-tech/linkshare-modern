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
  Clock,
  BookOpen
} from 'lucide-react';
import { SiteSettings, Blog } from '../types';
import { db, auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged } from '../firebase';
import { collection, query, where, getDocs, limit, onSnapshot } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AddGroupModal } from './AddGroupModal';
import AdPlacement from './AdPlacement';
import { Button } from './ui/Button';

interface BlogDetailPageProps {
  settings: SiteSettings;
}

export default function BlogDetailPage({ settings }: BlogDetailPageProps) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [blog, setBlog] = React.useState<Blog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = React.useState<Blog[]>([]);
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

    setLoading(true);
    const q = query(collection(db, 'blogs'), where('slug', '==', slug), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const blogData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Blog;
        setBlog(blogData);
        
        // Fetch related blogs
        const relatedQ = query(collection(db, 'blogs'), limit(4));
        getDocs(relatedQ).then(relatedSnapshot => {
          const relatedData = relatedSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Blog))
            .filter(b => b.slug !== slug)
            .slice(0, 3);
          setRelatedBlogs(relatedData);
        });
      } else {
        setBlog(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error loading blog details:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [slug]);

  React.useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && anchor.href.startsWith(window.location.origin)) {
        const path = anchor.href.replace(window.location.origin, '');
        if (path.startsWith('/')) {
          e.preventDefault();
          navigate(path);
        }
      }
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('click', handleLinkClick);
    }

    return () => {
      if (contentElement) {
        contentElement.removeEventListener('click', handleLinkClick);
      }
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
        <div className="w-12 h-12 border-4 border-t-[#00a884] border-gray-100 rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-bold">Loading article...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <Sparkles className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Article Not Found</h1>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          The article you're looking for might have been moved, deleted, or is temporarily unavailable.
        </p>
        <Button onClick={() => navigate('/blogs')}>
          <ChevronLeft className="w-5 h-5" /> Back to Tech Blog
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
            <Link to="/blogs" className="hover:underline">Tech Blog</Link>
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <span className="text-gray-400 font-medium">{blog.category}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-8 tracking-tight leading-tight"
          >
            {blog.title}
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
                <div className="font-bold text-gray-900">{blog.author}</div>
                <div className="text-xs">Author</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(blog.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              5 min read
            </div>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              {blog.category}
            </div>
          </motion.div>
        </div>
      </header>

      {/* --- Article Content --- */}
      <main className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          {blog.imageUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-[21/9] rounded-[3rem] overflow-hidden mb-16 shadow-2xl shadow-gray-200 bg-gray-50"
            >
              <img 
                src={blog.imageUrl} 
                alt={blog.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          )}

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
              <AdPlacement id="blogs_detail_top" settings={settings} />
              
              {/* Core Blog Body Rendering */}
              <div 
                ref={contentRef}
                className="prose prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-gray-600 prose-a:text-[#00a884] prose-strong:text-gray-900 prose-img:rounded-[2rem] prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-6 prose-pre:rounded-2xl"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
              
              <AdPlacement id="blogs_detail_bottom" settings={settings} />

              {/* Share Section */}
              <div className="mt-20 pt-10 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-gray-900">Share this article:</span>
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
                  {['TechTools', 'Guides', 'Creative'].map(tag => (
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

      {/* --- Related Articles --- */}
      {relatedBlogs.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Related Articles</h2>
              <Link to="/blogs" className="text-[#00a884] font-bold flex items-center gap-2 hover:underline">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedBlogs.map((related, idx) => (
                <motion.article
                  key={related.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-500"
                >
                  <Link to={`/blog/${related.slug}`} className="block relative aspect-[16/10] overflow-hidden bg-gray-50">
                    {related.imageUrl ? (
                      <img 
                        src={related.imageUrl} 
                        alt={related.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <BookOpen className="w-12 h-12" />
                      </div>
                    )}
                  </Link>
                  <div className="p-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#00a884] mb-2 block">
                      {related.category}
                    </span>
                    <Link to={`/blog/${related.slug}`}>
                      <h3 className="text-lg font-black text-gray-900 mb-3 group-hover:text-[#00a884] transition-colors leading-tight line-clamp-2">
                        {related.title}
                      </h3>
                    </Link>
                    <p className="text-gray-500 text-xs line-clamp-2 mb-4">
                      {related.excerpt}
                    </p>
                    <Link 
                      to={`/blog/${related.slug}`}
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
      )}

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
