import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, db, doc, onSnapshot } from '../firebase';
import { Group, SiteSettings } from '../types';
import { 
  ExternalLink, 
  ChevronLeft, 
  Globe, 
  Users, 
  Calendar, 
  Share2, 
  AlertCircle,
  Loader2,
  MessageSquare,
  ShieldCheck,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { User } from 'firebase/auth';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AddGroupModal } from './AddGroupModal';
import AdPlacement from './AdPlacement';
import { Button } from './ui/Button';

export default function InviteDetail({ settings }: { settings: SiteSettings }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  useEffect(() => {
    if (!id) return;

    const unsub = onSnapshot(doc(db, 'groups', id), (docSnap) => {
      if (docSnap.exists()) {
        setGroup({ id: docSnap.id, ...docSnap.data() } as Group);
      } else {
        setError('Group not found or has been removed.');
      }
      setLoading(false);
    }, (err) => {
      console.error('Error fetching group:', err);
      setError('Failed to load group details.');
      setLoading(false);
    });

    return () => unsub();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-[#00a884] animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Fetching group details...</p>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
        <p className="text-gray-500 text-center max-w-md mb-8">{error}</p>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-[#00a884] text-white rounded-full font-bold flex items-center gap-2 hover:bg-[#008f70] transition-all"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Home
        </button>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: group.title,
        text: `Join this WhatsApp ${group.type}: ${group.title}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Navbar 
        user={user}
        settings={settings}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      <AdPlacement id="global_top" settings={settings} />

      <main className="max-w-4xl mx-auto px-4 pt-24 pb-20">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column: Image & Main Info */}
          <div className="md:col-span-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100"
            >
              <AdPlacement id="detail_top" settings={settings} />
              <div className="aspect-video relative bg-gray-100">
                {group.imageUrl ? (
                  <img 
                    src={group.imageUrl} 
                    alt={group.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <MessageSquare className="w-16 h-16 mb-2 opacity-20" />
                    <span className="font-medium">No Preview Available</span>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className="px-4 py-1.5 bg-[#00a884] text-white text-xs font-bold rounded-full shadow-lg uppercase tracking-wider">
                    {group.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6 md:p-8">
                <h1 className="text-3xl font-black text-gray-900 mb-4 leading-tight">
                  {group.title}
                </h1>
                
                <div className="flex flex-wrap gap-4 mb-8">
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                    <Globe className="w-4 h-4 text-[#00a884]" />
                    {group.country || 'Global'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                    <Users className="w-4 h-4 text-[#00a884]" />
                    {group.type === 'group' ? 'WhatsApp Group' : 'WhatsApp Channel'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                    <Calendar className="w-4 h-4 text-[#00a884]" />
                    {group.createdAt?.toDate().toLocaleDateString()}
                  </div>
                </div>

                <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5 text-[#00a884]" /> Description
                  </h3>
                  <p className="whitespace-pre-wrap">
                    {group.description || 'No detailed description provided for this community.'}
                  </p>
                </div>
                <AdPlacement id="detail_bottom" settings={settings} />
              </div>
            </motion.div>

            {/* Safety Tips */}
            <div className="bg-yellow-50 border border-yellow-100 rounded-3xl p-6">
              <h3 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> Safety Guidelines
              </h3>
              <ul className="text-sm text-yellow-700 space-y-2 list-disc pl-5">
                <li>Never share personal financial information in public groups.</li>
                <li>Be respectful to other members and follow group rules.</li>
                <li>Report any suspicious activity to the group administrators.</li>
                <li>LinkShare is not responsible for the content shared within groups.</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Actions & Meta */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24"
            >
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 mb-1">Ready to join?</p>
                <h3 className="font-bold text-gray-900">Click the button below</h3>
              </div>
              
              <a 
                href={group.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-[#00a884] text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-[#008f70] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#00a884]/20 mb-4"
              >
                Join Now <ExternalLink className="w-5 h-5" />
              </a>
              
              <p className="text-[10px] text-gray-400 text-center leading-tight">
                By clicking "Join Now", you will be redirected to WhatsApp. 
                Make sure you have WhatsApp installed on your device.
              </p>

              {settings.showSubmittedBy && (
                <div className="mt-8 pt-8 border-t border-gray-50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                      👤
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Submitted by</p>
                      <p className="text-sm font-bold text-gray-700">{group.authorName || 'Anonymous'}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Status: <span className="text-green-500 font-bold">Verified</span></span>
                    <span>ID: {group.id.slice(0, 8)}</span>
                  </div>
                </div>
              )}
            </motion.div>

            <AdPlacement id="sidebar" settings={settings} />
          </div>
        </div>
      </main>

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
