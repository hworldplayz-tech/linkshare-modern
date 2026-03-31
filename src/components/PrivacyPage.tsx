import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  Lock, 
  Eye, 
  UserCheck,
  Mail,
  CheckCircle2,
  Plus,
  Info,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SiteSettings } from '../types';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged } from '../firebase';
import { User } from 'firebase/auth';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AddGroupModal } from './AddGroupModal';
import { Button } from './ui/Button';

interface PrivacyPageProps {
  settings: SiteSettings;
}

export default function PrivacyPage({ settings }: PrivacyPageProps) {
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
              Privacy <span className="text-[#00a884]">Policy</span>
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed mb-12">
              Learn how we protect your data and maintain security while sharing WhatsApp groups.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- Content Section --- */}
      <section className="pb-32">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-[40px] p-8 md:p-16 shadow-xl shadow-gray-200/50 border border-gray-100">
            <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
              <div className="flex items-center gap-4 mb-12 p-6 bg-[#00a884]/5 rounded-3xl border border-[#00a884]/10">
                <Shield className="w-10 h-10 text-[#00a884] shrink-0" />
                <div>
                  <h2 className="text-xl font-black text-gray-900 m-0">Our Commitment</h2>
                  <p className="text-sm text-gray-500 m-0">Your privacy is our top priority. We are committed to protecting your personal information and maintaining the highest standards of security.</p>
                </div>
              </div>

              <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <Info className="w-8 h-8 text-[#00a884]" /> Information We Collect
              </h2>
              <p className="mb-6">We collect information that you provide directly to us when using LinkShare:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                {[
                  { icon: UserCheck, title: 'Account Information', desc: 'Name, email address, and profile picture when you sign in with Google.' },
                  { icon: Plus, title: 'Group Information', desc: 'Titles, descriptions, and links of the WhatsApp groups you share.' },
                  { icon: Mail, title: 'Communication', desc: 'Information you provide when you contact us for support or feedback.' },
                  { icon: Eye, title: 'Usage Data', desc: 'Information about how you interact with our platform to help us improve.' },
                ].map((item, i) => (
                  <div key={i} className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                    <item.icon className="w-8 h-8 text-[#00a884] mb-4" />
                    <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                ))}
              </div>

              <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <Zap className="w-8 h-8 text-[#00a884]" /> How We Use Your Information
              </h2>
              <p className="mb-8">We use the collected information to provide, maintain, and improve our services:</p>
              <ul className="space-y-4 mb-16">
                {[
                  'Provide and maintain our WhatsApp group directory',
                  'Process and moderate your group submissions',
                  'Send you important updates about your account or our services',
                  'Improve our platform and develop new features',
                  'Monitor and prevent fraudulent or unauthorized activity',
                  'Comply with legal obligations'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <CheckCircle2 className="w-6 h-6 text-[#00a884] shrink-0 mt-1" />
                    <span className="font-medium text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>

              <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <Lock className="w-8 h-8 text-[#00a884]" /> Data Protection
              </h2>
              <p className="mb-8">We implement appropriate technical and organizational security measures to protect your information:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
                {[
                  'Encryption of sensitive data in transit and at rest',
                  'Regular security assessments and monitoring',
                  'Secure data storage using industry-standard providers',
                  'Strict access controls for our internal systems',
                  'Regular backups to ensure data availability'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <div className="w-2 h-2 bg-[#00a884] rounded-full" />
                    <span className="text-sm font-medium text-gray-700">{item}</span>
                  </div>
                ))}
              </div>

              <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <UserCheck className="w-8 h-8 text-[#00a884]" /> Your Rights
              </h2>
              <p className="mb-8">You have certain rights regarding your personal data:</p>
              <div className="space-y-4 mb-16">
                {[
                  { title: 'Access', desc: 'You can request a copy of the personal data we hold about you.' },
                  { title: 'Correction', desc: 'You can request that we correct any inaccurate or incomplete data.' },
                  { title: 'Deletion', desc: 'You can request that we delete your personal data from our systems.' },
                  { title: 'Opt-out', desc: 'You can opt-out of receiving promotional communications from us.' },
                ].map((right, i) => (
                  <div key={i} className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-2">{right.title}</h3>
                    <p className="text-sm text-gray-500">{right.desc}</p>
                  </div>
                ))}
              </div>

              <div className="text-center bg-[#00a884] rounded-[32px] p-12 text-white">
                <h2 className="text-3xl font-black mb-4">Questions About Privacy?</h2>
                <p className="text-white/80 mb-8 max-w-xl mx-auto">
                  If you have any questions or concerns about our privacy practices, please don't hesitate to contact us.
                </p>
                <Button variant="blank" size="lg" onClick={() => navigate('/contact')} className="bg-white text-[#00a884] hover:bg-gray-100 mx-auto border-none">
                  Contact Support
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
