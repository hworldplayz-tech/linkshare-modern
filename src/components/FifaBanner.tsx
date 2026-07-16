import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Tv, ChevronRight, Trophy } from 'lucide-react';
import { SiteSettings } from '../types';

interface FifaBannerProps {
  settings: SiteSettings;
}

export const FifaBanner = ({ settings }: FifaBannerProps) => {
  const navigate = useNavigate();

  if (!settings.fifaBannerEnabled) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 mb-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        onClick={() => navigate('/fifa-world-cup-2026-live')}
        className="relative h-[110px] md:h-[120px] bg-gradient-to-r from-orange-500 via-amber-600 to-amber-700 rounded-3xl overflow-hidden shadow-2xl cursor-pointer group border border-amber-400/20"
      >
        {/* Animated Background Stadium Light Glows */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-amber-300/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(251,191,36,0.15),rgba(0,0,0,0))]" />
        </div>

        <div className="relative h-full flex items-center justify-between px-6 md:px-10">
          <div className="flex items-center gap-4 md:gap-8">
            {/* Soccer / FIFA icon Section */}
            <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg shrink-0 rotate-[-4deg] group-hover:rotate-0 transition-all duration-300">
              <Trophy className="w-8 h-8 text-white animate-bounce" />
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] md:text-xs font-black text-white/80 bg-white/15 px-2.5 py-0.5 rounded-full w-fit mb-1.5 uppercase tracking-widest border border-white/5 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                LIVE BROADCAST GUIDE 2026
              </span>
              
              <h3 className="text-white font-black text-sm md:text-2xl tracking-tight leading-tight group-hover:text-amber-100 transition-colors">
                {settings.fifaBannerText || 'FIFA World Cup 2026 Live: Watch Free Matches Worldwide!'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-white text-orange-600 rounded-xl text-xs font-black uppercase tracking-wider group-hover:bg-amber-50 shadow-md transition-all">
              <Tv className="w-4 h-4 text-orange-600" />
              Watch Live
            </div>
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white group-hover:bg-white group-hover:text-orange-600 group-hover:translate-x-1 border border-white/10 transition-all duration-300">
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
