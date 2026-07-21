import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, 
  X, 
  Loader2, 
  CheckCircle2, 
  Sparkles, 
  Lock, 
  FileText, 
  ShieldCheck,
  Play,
  ArrowRight
} from 'lucide-react';
import { SiteSettings } from '../types';
import AdPlacement from './AdPlacement';

interface DownloadManagerProps {
  url: string;
  delay?: number;
  title?: string;
  settings: SiteSettings;
}

export default function DownloadManager({ url, delay = 5, title = 'Download File', settings }: DownloadManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'countdown' | 'create_link' | 'creating' | 'generate_link' | 'generating' | 'final'>('idle');
  const [countdown, setCountdown] = useState(delay);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const openModal = () => {
    setIsOpen(true);
    resetState();
    startCountdownPhase();
  };

  const closeModal = () => {
    setIsOpen(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const resetState = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('countdown');
    setCountdown(delay);
  };

  const startCountdownPhase = () => {
    setPhase('countdown');
    setCountdown(delay);
    
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setPhase('create_link');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCreateLink = () => {
    setPhase('creating');
    setCountdown(delay);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setPhase('generate_link');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleGenerateLink = () => {
    setPhase('generating');
    setCountdown(delay);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setPhase('final');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Circular progress calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = phase === 'countdown' 
    ? circumference - (circumference * (delay - countdown)) / delay 
    : circumference;

  return (
    <div className="my-8 flex justify-center">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={openModal}
        className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-emerald-500/20 active:scale-95 transition-all duration-300 group cursor-pointer border-none"
      >
        <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
        <span>{title}</span>
      </button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-6 text-center overflow-hidden z-10"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={closeModal}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer border-none bg-transparent"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="mb-6 mt-2">
                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-500" />
                  Preparing Your Download
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 font-medium">
                  Please wait while we establish a high-speed, secure download node.
                </p>
              </div>

              {/* TOP AD BLOCK */}
              <div className="my-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-3 flex flex-col items-center justify-center min-h-[90px]">
                <AdPlacement id="blogs_detail_top" settings={settings} className="my-0 w-full" />
                {!settings.globalAdsEnabled && (
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sponsored Advertisement</span>
                )}
              </div>

              {/* DYNAMIC PROCESS CONTAINER */}
              <div className="py-6 flex flex-col items-center justify-center min-h-[140px]">
                
                {/* Phase 1: Countdown circular spinner */}
                {phase === 'countdown' && (
                  <div className="flex flex-col items-center">
                    <div className="relative w-20 h-20">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle
                          className="text-slate-100"
                          strokeWidth="8"
                          stroke="currentColor"
                          fill="transparent"
                          r={radius}
                          cx="50"
                          cy="50"
                        />
                        <circle
                          className="text-emerald-500 transition-all duration-1000 ease-linear"
                          strokeWidth="8"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r={radius}
                          cx="50"
                          cy="50"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-lg font-black text-slate-800">
                        {countdown}s
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-600 mt-4 animate-pulse flex items-center gap-1.5">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-500" /> Connecting to secure server...
                    </p>
                  </div>
                )}

                {/* Phase 2: Create Link Button */}
                {phase === 'create_link' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full px-4"
                  >
                    <button
                      type="button"
                      onClick={handleCreateLink}
                      className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all cursor-pointer border-none"
                    >
                      <Sparkles className="w-5 h-5 animate-pulse" />
                      <span>Create Link</span>
                    </button>
                    <p className="text-xs text-slate-400 mt-2 font-medium">Click to request secure access token</p>
                  </motion.div>
                )}

                {/* Phase 2 Creating link countdown */}
                {phase === 'creating' && (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                    <div className="mt-4 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-black tracking-wide">
                      Creating secure link... {countdown}s
                    </div>
                  </div>
                )}

                {/* Phase 3: Generate Link Button */}
                {phase === 'generate_link' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full px-4"
                  >
                    <button
                      type="button"
                      onClick={handleGenerateLink}
                      className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer border-none"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Generate Link</span>
                    </button>
                    <p className="text-xs text-slate-400 mt-2 font-medium">Decryption keys ready. Click to finalize.</p>
                  </motion.div>
                )}

                {/* Phase 3 Generating link countdown */}
                {phase === 'generating' && (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                    <div className="mt-4 px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-black tracking-wide">
                      Generating download link... {countdown}s
                    </div>
                  </div>
                )}

                {/* Final Phase: Actual high-speed download link */}
                {phase === 'final' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="w-full px-4"
                  >
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold py-4 rounded-xl shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-95 transition-all text-decoration-none"
                    >
                      <Download className="w-5 h-5 animate-bounce" />
                      <span>Download Now</span>
                    </a>
                    <div className="flex items-center justify-center gap-1.5 mt-3 text-emerald-600 text-[11px] font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Link decrypted successfully & secure.
                    </div>
                  </motion.div>
                )}

              </div>

              {/* BOTTOM AD BLOCK */}
              <div className="my-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-3 flex flex-col items-center justify-center min-h-[90px]">
                <AdPlacement id="blogs_detail_bottom" settings={settings} className="my-0 w-full" />
                {!settings.globalAdsEnabled && (
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sponsored Advertisement</span>
                )}
              </div>

              {/* Footer Credentials */}
              <div className="mt-2 text-[10px] text-slate-400 font-semibold flex items-center justify-center gap-1">
                <FileText className="w-3.5 h-3.5" /> High-Speed Cloud Node Connected
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
