import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Zap, 
  Shield, 
  CheckCircle2, 
  Globe, 
  MessageSquare, 
  Search, 
  LayoutGrid, 
  Plus,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SiteSettings } from '../types';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged } from '../firebase';
import { User } from 'firebase/auth';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AddGroupModal } from './AddGroupModal';
import { Button } from './ui/Button';

interface AboutPageProps {
  settings: SiteSettings;
}

export default function AboutPage({ settings }: AboutPageProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-800 font-sans selection:bg-[#00a884] selection:text-white">
      <Navbar 
        user={user}
        settings={settings}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      {/* --- Hero Section --- */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#00a884]/10 to-transparent rounded-full blur-3xl opacity-50" />
        </div>

        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 mb-8 leading-[0.9]">
              About <span className="text-[#00a884]">LinkShare</span>
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed mb-12">
              Your premier destination for discovering and sharing WhatsApp groups links and essential tech tools.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- Content Section --- */}
      <section className="pb-32">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-[40px] p-8 md:p-16 shadow-xl shadow-gray-200/50 border border-gray-100">
            <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
              <p className="mb-8">
                Welcome to <strong>LinkShare</strong>, your premier destination for discovering and sharing WhatsApp groups links and high-quality tech tools. I'm an individual, the founder and developer of the LinkShare project. I've created this platform for those who want to gather their audience and expand their business by creating or joining WhatsApp groups, while also providing essential tools for the modern tech landscape.
              </p>
              <p className="mb-12">
                I've created a safe, user-friendly platform that connects people with shared interests through WhatsApp groups and provides a suite of tech tools, making it easier than ever to find communities and resources that matter to you.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                    <Zap className="w-6 h-6 text-[#00a884]" /> Our Mission
                  </h2>
                  <p>
                    At LinkShare, we believe in the power of community and accessibility. Our mission is to create the most trusted and user-friendly platform for finding WhatsApp groups and useful tech tools, ensuring quality content while maintaining user privacy and security.
                  </p>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-[#00a884]" /> What Sets Us Apart
                  </h2>
                  <ul className="space-y-3 list-none p-0">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#00a884] shrink-0 mt-1" />
                      <span>Curated group listings ensuring quality content</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#00a884] shrink-0 mt-1" />
                      <span>Powerful tech tools for daily productivity</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#00a884] shrink-0 mt-1" />
                      <span>Easy-to-use interface for finding and sharing</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#00a884] shrink-0 mt-1" />
                      <span>Strong focus on user privacy and security</span>
                    </li>
                  </ul>
                </div>
              </div>

              <h2 className="text-3xl font-black text-gray-900 mb-8">Key Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
                {[
                  { icon: Plus, title: 'Simple Submission', desc: 'Easy process to share your groups and tools.' },
                  { icon: Search, title: 'Advanced Search', desc: 'Find exactly what you need with powerful filters.' },
                  { icon: LayoutGrid, title: 'Organized Categories', desc: 'Everything is neatly categorized for easy browsing.' },
                  { icon: Zap, title: 'Real-time Updates', desc: 'Stay up to date with the latest links and tools.' },
                  { icon: Globe, title: 'Mobile Friendly', desc: 'Access LinkShare perfectly on any device.' },
                  { icon: Shield, title: 'Active Moderation', desc: 'We keep the community safe and high-quality.' },
                ].map((feature, i) => (
                  <div key={i} className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                    <feature.icon className="w-8 h-8 text-[#00a884] mb-4" />
                    <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-500">{feature.desc}</p>
                  </div>
                ))}
              </div>

              <h2 className="text-3xl font-black text-gray-900 mb-8">Community Guidelines</h2>
              <p className="mb-6">To maintain a high-quality platform, we ask all users to follow these guidelines:</p>
              <ul className="space-y-4 mb-16">
                {[
                  'Share only legitimate and active WhatsApp groups',
                  'Respect other users\' privacy and rights',
                  'Provide accurate group and tool descriptions',
                  'Follow WhatsApp\'s terms of service',
                  'Report any inappropriate content immediately'
                ].map((guide, i) => (
                  <li key={i} className="flex items-center gap-4 p-4 bg-[#00a884]/5 rounded-2xl border border-[#00a884]/10">
                    <div className="w-8 h-8 bg-[#00a884] text-white rounded-full flex items-center justify-center font-bold shrink-0">
                      {i + 1}
                    </div>
                    <span className="font-medium text-gray-700">{guide}</span>
                  </li>
                ))}
              </ul>

              <div className="text-center bg-[#00a884] rounded-[32px] p-12 text-white">
                <h2 className="text-3xl font-black mb-4">Join Our Community</h2>
                <p className="text-white/80 mb-8 max-w-xl mx-auto">
                  Whether you're looking to join existing groups, share your own, or use our powerful tech tools, LinkShare provides the perfect platform to connect with like-minded individuals worldwide.
                </p>
                <Button variant="blank" size="lg" className="bg-white text-[#00a884] hover:bg-gray-100 mx-auto border-none" onClick={() => navigate('/')}>
                  Start Exploring Today
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <Footer settings={settings} />

      <AddGroupModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        user={user}
        settings={settings}
        onLogin={handleLogin}
      />
    </div>
  );
}
