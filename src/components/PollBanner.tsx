import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Vote, ChevronRight } from 'lucide-react';
import { SiteSettings } from '../types';
import { db, doc, onSnapshot } from '../firebase';

interface PollBannerProps {
  settings: SiteSettings;
}

export const PollBanner = ({ settings }: PollBannerProps) => {
  const navigate = useNavigate();
  const [poll, setPoll] = useState<any>(null);

  useEffect(() => {
    const pollRef = doc(db, 'polls', 'iran-vs-israel');
    const unsubscribe = onSnapshot(pollRef, (snapshot) => {
      if (snapshot.exists()) {
        setPoll(snapshot.data());
      }
    });
    return () => unsubscribe();
  }, []);

  if (!settings.showPollBanner) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 mb-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        onClick={() => navigate('/iran-vs-israel')}
        className="relative h-[80px] md:h-[100px] bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-3xl overflow-hidden shadow-xl cursor-pointer group border border-white/10"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-32 h-full bg-blue-500/10 skew-x-12 blur-2xl animate-pulse" />
          <div className="absolute top-0 right-1/4 w-32 h-full bg-green-500/10 -skew-x-12 blur-2xl animate-pulse delay-700" />
        </div>

        <div className="relative h-full flex items-center justify-between px-6 md:px-10">
          <div className="flex items-center gap-4 md:gap-8">
            {/* Flags Section */}
            <div className="flex items-center -space-x-4">
              <div className="w-12 h-8 md:w-16 md:h-10 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg z-10 rotate-[-5deg] group-hover:rotate-0 transition-transform">
                <img 
                  src={poll?.israelFlagUrl || "https://flagcdn.com/w160/il.png"} 
                  alt="Israel" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="w-12 h-8 md:w-16 md:h-10 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg z-20 rotate-[5deg] group-hover:rotate-0 transition-transform">
                <img 
                  src={poll?.iranFlagUrl || "https://flagcdn.com/w160/ir.png"} 
                  alt="Iran" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <h3 className="text-white font-black text-sm md:text-xl tracking-tight leading-tight">
                {settings.pollBannerText || 'Iran vs Israel Live Voting: Where do you stand?'}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-[10px] md:text-xs font-black text-red-500 uppercase tracking-widest">Live Global Poll</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-white text-xs font-black uppercase tracking-widest group-hover:bg-[#00a884] transition-colors">
              <Vote className="w-4 h-4" />
              Vote Now
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-white/10 rounded-full flex items-center justify-center text-white group-hover:bg-[#00a884] group-hover:translate-x-1 transition-all">
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
