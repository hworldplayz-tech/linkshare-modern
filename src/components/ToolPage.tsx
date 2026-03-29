import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Copy, 
  Check, 
  Sparkles, 
  Type, 
  Trash2,
  Share2,
  Zap,
  Info
} from 'lucide-react';
import { SiteSettings } from '../types';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged } from '../firebase';
import { User } from 'firebase/auth';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AddGroupModal } from './AddGroupModal';
import { Button } from './ui/Button';

interface ToolPageProps {
  settings: SiteSettings;
}

export default function ToolPage({ settings }: ToolPageProps) {
  const { toolId } = useParams();
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Stylish Text Logic
  const styles = [
    { name: 'Normal', transform: (t: string) => t },
    { name: 'Bold Serif', transform: (t: string) => t.split('').map(c => {
      const code = c.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(code + 119743);
      if (code >= 97 && code <= 122) return String.fromCodePoint(code + 119737);
      return c;
    }).join('') },
    { name: 'Italic Serif', transform: (t: string) => t.split('').map(c => {
      const code = c.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(code + 119795);
      if (code >= 97 && code <= 122) return String.fromCodePoint(code + 119789);
      return c;
    }).join('') },
    { name: 'Script', transform: (t: string) => t.split('').map(c => {
      const code = c.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(code + 119951);
      if (code >= 97 && code <= 122) return String.fromCodePoint(code + 119945);
      return c;
    }).join('') },
    { name: 'Double Struck', transform: (t: string) => t.split('').map(c => {
      const code = c.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(code + 120055);
      if (code >= 97 && code <= 122) return String.fromCodePoint(code + 120049);
      return c;
    }).join('') },
    { name: 'Fraktur', transform: (t: string) => t.split('').map(c => {
      const code = c.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(code + 120003);
      if (code >= 97 && code <= 122) return String.fromCodePoint(code + 119997);
      return c;
    }).join('') },
    { name: 'Monospace', transform: (t: string) => t.split('').map(c => {
      const code = c.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(code + 120363);
      if (code >= 97 && code <= 122) return String.fromCodePoint(code + 120357);
      return c;
    }).join('') },
    { name: 'Circled', transform: (t: string) => t.split('').map(c => {
      const code = c.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(code + 9333);
      if (code >= 97 && code <= 122) return String.fromCodePoint(code + 9327);
      return c;
    }).join('') },
  ];

  const blankText = "\u200B"; // Zero Width Space

  if (toolId !== 'stylish-text') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <Zap className="w-10 h-10 text-gray-300" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Tool Coming Soon</h1>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          We're working hard to bring you more powerful tools. 
          Check out our Stylish Text Generator in the meantime!
        </p>
        <Button onClick={() => navigate('/')}>
          <ChevronLeft className="w-5 h-5" /> Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar 
        user={user}
        settings={settings}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      {/* --- Header --- */}
      <header className="pt-40 pb-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#00a884]/10 text-[#00a884] rounded-full text-sm font-bold mb-6"
            >
              <Type className="w-4 h-4" />
              <span>Free Online Tool</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight"
            >
              Stylish <span className="text-[#00a884]">Text Generator</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-500 mb-10 leading-relaxed"
            >
              Generate cool, fancy, and stylish text for your WhatsApp bio, messages, 
              and social media profiles. Stand out from the crowd!
            </motion.p>
          </div>
        </div>
      </header>

      {/* --- Tool Interface --- */}
      <main className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Input Section */}
            <div className="lg:col-span-1">
              <div className="sticky top-32 space-y-8">
                <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Type className="w-5 h-5 text-[#00a884]" />
                      Input Text
                    </h3>
                    <button 
                      onClick={() => setInputText('')}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Clear Text"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <textarea 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your text here..."
                    className="w-full h-40 p-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 transition-all resize-none text-lg"
                  />
                  
                  <div className="mt-8 pt-8 border-t border-gray-50">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#00a884]" />
                      Quick Actions
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleCopy(blankText, 'blank')}
                      >
                        {copiedId === 'blank' ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                        Blank Text
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setInputText('Hello World!')}
                      >
                        Sample Text
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-[#00a884]/5 rounded-[2rem] p-8 border border-[#00a884]/10">
                  <h4 className="font-bold text-[#00a884] mb-4 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    How to use?
                  </h4>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex gap-2">
                      <span className="w-5 h-5 bg-[#00a884] text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">1</span>
                      Type your message in the text box above.
                    </li>
                    <li className="flex gap-2">
                      <span className="w-5 h-5 bg-[#00a884] text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">2</span>
                      Browse the generated styles on the right.
                    </li>
                    <li className="flex gap-2">
                      <span className="w-5 h-5 bg-[#00a884] text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">3</span>
                      Click the copy button on your favorite style.
                    </li>
                    <li className="flex gap-2">
                      <span className="w-5 h-5 bg-[#00a884] text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">4</span>
                      Paste it anywhere on WhatsApp or Social Media!
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 gap-4">
                {styles.map((style, idx) => {
                  const transformedText = inputText ? style.transform(inputText) : style.transform('Preview Text');
                  return (
                    <motion.div
                      key={style.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group bg-white p-6 rounded-2xl border border-gray-100 hover:border-[#00a884]/30 hover:shadow-lg transition-all flex items-center justify-between gap-6"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">
                          {style.name}
                        </span>
                        <div className={`text-xl text-gray-900 truncate ${!inputText && 'opacity-30'}`}>
                          {transformedText}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleCopy(transformedText, style.name)}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                            copiedId === style.name 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-50 text-gray-400 hover:bg-[#00a884] hover:text-white'
                          }`}
                        >
                          {copiedId === style.name ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                        <button className="w-12 h-12 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 flex items-center justify-center transition-all">
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

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
