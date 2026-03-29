import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  ShieldAlert, 
  ExternalLink, 
  Info,
  Scale
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SiteSettings } from '../types';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged } from '../firebase';
import { User } from 'firebase/auth';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AddGroupModal } from './AddGroupModal';
import { Button } from './ui/Button';

interface DisclaimerPageProps {
  settings: SiteSettings;
}

export default function DisclaimerPage({ settings }: DisclaimerPageProps) {
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
              Legal <span className="text-[#00a884]">Disclaimer</span>
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed mb-12">
              Important information about the content and services provided by LinkShare.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- Content Section --- */}
      <section className="pb-32">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-[40px] p-8 md:p-16 shadow-xl shadow-gray-200/50 border border-gray-100">
            <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
              <div className="flex items-center gap-4 mb-12 p-6 bg-amber-50 rounded-3xl border border-amber-100">
                <AlertTriangle className="w-10 h-10 text-amber-500 shrink-0" />
                <div>
                  <h2 className="text-xl font-black text-gray-900 m-0">General Disclaimer</h2>
                  <p className="text-sm text-gray-500 m-0">The information provided on LinkShare is for general informational purposes only. All information on the site is provided in good faith, however we make no representation or warranty of any kind.</p>
                </div>
              </div>

              <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <ShieldAlert className="w-8 h-8 text-[#00a884]" /> 1. No Endorsement
              </h2>
              <p className="mb-12">
                LinkShare is a directory of WhatsApp group links and tech tools. We do not own, manage, or moderate the WhatsApp groups listed on our platform. Inclusion of any group link does not imply endorsement or recommendation by LinkShare. Users join groups at their own risk.
              </p>

              <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <ExternalLink className="w-8 h-8 text-[#00a884]" /> 2. External Links
              </h2>
              <p className="mb-8">
                Our platform contains links to external websites and WhatsApp groups that are not provided or maintained by or in any way affiliated with LinkShare. Please note that LinkShare does not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites or groups.
              </p>

              <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <Scale className="w-8 h-8 text-[#00a884]" /> 3. Limitation of Liability
              </h2>
              <p className="mb-8">
                In no event shall LinkShare be liable for any special, direct, indirect, consequential, or incidental damages or any damages whatsoever, whether in an action of contract, negligence or other tort, arising out of or in connection with the use of the Service or the contents of the Service.
              </p>

              <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <Info className="w-8 h-8 text-[#00a884]" /> 4. "Use at Your Own Risk"
              </h2>
              <p className="mb-12">
                All information in the Service is provided "as is", with no guarantee of completeness, accuracy, timeliness or of the results obtained from the use of this information, and without warranty of any kind, express or implied.
              </p>

              <div className="text-center bg-[#00a884] rounded-[32px] p-12 text-white">
                <h2 className="text-3xl font-black mb-4">Still Have Questions?</h2>
                <p className="text-white/80 mb-8 max-w-xl mx-auto">
                  If you require any more information or have any questions about our site's disclaimer, please feel free to contact us.
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
