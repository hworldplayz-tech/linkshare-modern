import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  User,
  Info,
  Scale,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SiteSettings } from '../types';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged } from '../firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AddGroupModal } from './AddGroupModal';
import { Button } from './ui/Button';

interface TermsPageProps {
  settings: SiteSettings;
}

export default function TermsPage({ settings }: TermsPageProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<FirebaseUser | null>(null);
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
              Terms of <span className="text-[#00a884]">Service</span>
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed mb-12">
              Please read these terms carefully before using LinkShare.
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
                <Scale className="w-10 h-10 text-[#00a884] shrink-0" />
                <div>
                  <h2 className="text-xl font-black text-gray-900 m-0">Legal Agreement</h2>
                  <p className="text-sm text-gray-500 m-0">By accessing and using LinkShare, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our service.</p>
                </div>
              </div>

              <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-[#00a884]" /> 1. Acceptance of Terms
              </h2>
              <p className="mb-12">
                LinkShare provides a platform for discovering and sharing WhatsApp group links and essential tech tools. By using our platform, you acknowledge that you have read, understood, and agree to be bound by these terms, as well as our Privacy Policy.
              </p>

              <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-[#00a884]" /> 2. Use License
              </h2>
              <p className="mb-6">Permission is granted to temporarily access LinkShare for personal, non-commercial use only. This license does not include:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
                {[
                  'Modifying or copying our materials',
                  'Using materials for commercial purposes',
                  'Attempting to decompile or reverse engineer our software',
                  'Removing any copyright or proprietary notations',
                  'Transferring materials to another person or mirroring them'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                    <div className="w-2 h-2 bg-[#00a884] rounded-full" />
                    <span className="text-sm font-medium text-gray-700">{item}</span>
                  </div>
                ))}
              </div>

              <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <User className="w-8 h-8 text-[#00a884]" /> 3. User Responsibilities
              </h2>
              <p className="mb-8">As a user of LinkShare, you agree to:</p>
              <ul className="space-y-4 mb-16">
                {[
                  'Provide accurate and complete information when submitting groups or tools',
                  'Maintain the security of your account and credentials',
                  'Not share inappropriate, illegal, or harmful content',
                  'Respect other users\' privacy and intellectual property rights',
                  'Not use the service for any illegal or unauthorized purpose'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <CheckCircle2 className="w-6 h-6 text-[#00a884] shrink-0 mt-1" />
                    <span className="font-medium text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>

              <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <Info className="w-8 h-8 text-[#00a884]" /> 4. Content Guidelines
              </h2>
              <p className="mb-8">When submitting content to LinkShare:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                {[
                  { title: 'Legality', desc: 'Ensure all content is appropriate and complies with local and international laws.' },
                  { title: 'No Spam', desc: 'Do not submit spam, malicious links, or deceptive content.' },
                  { title: 'IP Rights', desc: 'Respect intellectual property rights and only share content you have the right to share.' },
                  { title: 'WhatsApp Terms', desc: 'All group links must follow WhatsApp\'s official terms of service.' },
                ].map((item, i) => (
                  <div key={i} className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                ))}
              </div>

              <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-red-500" /> 5. Disclaimer
              </h2>
              <p className="mb-8">LinkShare is provided "as is" without any warranties. We are not responsible for:</p>
              <ul className="space-y-4 mb-16">
                {[
                  'Content posted by users (groups, descriptions, tools)',
                  'Third-party websites or groups linked from our platform',
                  'Service interruptions, errors, or technical issues',
                  'Loss of data or privacy breaches resulting from third-party actions'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <X className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                    <span className="font-medium text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="text-center bg-[#00a884] rounded-[32px] p-12 text-white">
                <h2 className="text-3xl font-black mb-4">Have Questions?</h2>
                <p className="text-white/80 mb-8 max-w-xl mx-auto">
                  If you have any questions about these terms, please contact our support team.
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
