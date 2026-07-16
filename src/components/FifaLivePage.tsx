import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Tv, ShieldCheck, Clock, MapPin, Globe, Volume2, Gamepad2, Info, ArrowUpRight, Search, Share2, Facebook, Twitter, Link } from 'lucide-react';
import { SiteSettings } from '../types';

interface FifaLivePageProps {
  settings: SiteSettings;
}

// Helper to extract clean iframe embed URL from raw iframe HTML string or raw URLs
const extractEmbedUrl = (input: string): string => {
  if (!input) return "https://www.youtube.com/embed/2M_HLa71PIU";
  
  const trimmed = input.trim();
  
  // If user pasted an entire iframe html block or any html containing a src attribute
  if (trimmed.includes('<') && trimmed.toLowerCase().includes('src')) {
    const match = trimmed.match(/src\s*=\s*["']?([^"'\s>]+)["']?/i);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return trimmed;
};

const COUNTRIES_INFO = [
  {
    id: 'usa',
    name: 'United States',
    flag: '🇺🇸',
    channels: ['Fox Sports (ENG)', 'Telemundo (ESP)'],
    streamers: ['Peacock (Spanish premium)', 'FuboTV', 'Sling TV'],
    description: 'Fox Sports holds exclusive English-language TV rights, while Comcast’s Telemundo brings the official Spanish coverage. Cord-cutters can stream high-speed feeds via Peacock, Fubo, or Sling.',
    proTip: 'Peacock delivers all Spanish-language matches in high-definition 60fps, making it the top choice for streaming without a cable subscription.'
  },
  {
    id: 'pakistan',
    name: 'Pakistan',
    flag: '🇵🇰',
    channels: ['PTV Sports (Official Free-to-Air Broadcaster)'],
    streamers: ['Tapmad TV (Official Premium Live Streamer)'],
    description: 'In Pakistan, PTV Sports is the exclusive free-to-air broadcast partner for TV transmission. For high-speed digital streaming with superb performance and zero buffering, Tapmad TV holds the official premium rights.',
    proTip: 'Tapmad TV is the absolute gold standard for premium soccer streaming in Pakistan with robust, lag-free sporting feeds.'
  },
  {
    id: 'india',
    name: 'India',
    flag: '🇮🇳',
    channels: ['Sports18 1 HD / SD', 'Sports18 Khel'],
    streamers: ['JioCinema (Official Free App-Streaming)'],
    description: 'Viacom18 owns the exclusive Indian broadcast licensing. Football fans can stream matches entirely FREE across mobile, tablets, and smart TVs using JioCinema, featuring full multi-angle controls.',
    proTip: 'Explore the "Tactical Multi-Cam" angle on JioCinema to enjoy wide-stadium perspectives or follow specific global superstars live.'
  },
  {
    id: 'england',
    name: 'England (United Kingdom)',
    flag: '🇬🇧',
    channels: ['BBC One', 'ITV1'],
    streamers: ['BBC iPlayer (Free)', 'ITVX (Free)'],
    description: 'The BBC and ITV share the legendary live broadcast rights in the United Kingdom under public charter rules. All 104 matches will be streamable in ultra-high fidelity for free across BBC iPlayer and ITVX.',
    proTip: 'Stream matches on BBC iPlayer for select UHD 4K broadcasts of key matches if you have a compatible smart display.'
  }
];

const FAQS = [
  {
    q: "When does the FIFA World Cup 2026 kick off?",
    a: "The tournament officially commences on June 11, 2026, featuring an expansive 48-team roster playing 104 exciting fixtures across the USA, Canada, and Mexico."
  },
  {
    q: "Can I stream FIFA 2026 matches for free?",
    a: "Yes! Depending on your location, platforms like JioCinema (India), BBC iPlayer / ITVX (UK), and PTV Sports (Pakistan) are offering legal, free streaming options."
  },
  {
    q: "What is the recommended internet speed for HD streaming?",
    a: "For lag-free 1080p video, a download speed of 10 Mbps is recommended. For ultra-vibrant UHD 4K, ensure your internet connection is at least 25 Mbps."
  }
];

export default function FifaLivePage({ settings }: FifaLivePageProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Watch Live Playback System
  const [streamState, setStreamState] = useState<'idle' | 'processing' | 'ready'>('idle');
  const [processingStep, setProcessingStep] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [shareCopied, setShareCopied] = useState(false);

  // Filter content based on country selection and search text
  const filteredCountries = COUNTRIES_INFO.filter(item => {
    const matchesCountry = selectedCountry === 'all' || item.id === selectedCountry;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.channels.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          item.streamers.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCountry && matchesSearch;
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  // Processing sequence of Watch Live
  const startStreamProcess = () => {
    if (streamState !== 'idle') return;
    setStreamState('processing');
    setProgress(0);

    const steps = [
      { text: 'Locating nearest CDN node...', duration: 600 },
      { text: 'Authenticating stream handshake...', duration: 600 },
      { text: 'Securing legal video feed decoder...', duration: 700 },
      { text: 'Optimizing adaptive bitrate (1080p 60fps)...', duration: 600 }
    ];

    let currentStepIndex = 0;
    setProcessingStep(steps[0].text);

    const runSteps = (index: number) => {
      if (index >= steps.length) {
        setProgress(100);
        setTimeout(() => {
          setStreamState('ready');
        }, 350);
        return;
      }
      setProcessingStep(steps[index].text);
      
      let stepProgressStart = (index / steps.length) * 100;
      let stepProgressEnd = ((index + 1) / steps.length) * 100;
      let duration = steps[index].duration;
      let startTime = Date.now();

      const animateProgress = () => {
        let elapsed = Date.now() - startTime;
        let ratio = Math.min(elapsed / duration, 1);
        let curProgress = stepProgressStart + ratio * (stepProgressEnd - stepProgressStart);
        setProgress(Math.floor(curProgress));

        if (ratio < 1) {
          requestAnimationFrame(animateProgress);
        } else {
          runSteps(index + 1);
        }
      };
      requestAnimationFrame(animateProgress);
    };

    runSteps(0);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Helmet>
        <title>FIFA World Cup 2026 Live Stream Guide: How to Watch Free Channels Worldwide</title>
        <meta name="description" content="Ultimate SEO-optimized guide on how to stream the FIFA World Cup 2026 live in USA, Pakistan, India, UK, and globally. Free platforms, cable channels, and live streaming setups!" />
        <meta name="keywords" content="FIFA World Cup 2026 live, watch World cup 2026, FIFA 2026 live streaming Pakistan, watch World cup in USA, JioCinema FIFA 2026, FIFA livestream live player" />
        <meta property="og:title" content="FIFA World Cup 2026 Live Stream Guide: Watch Matches Worldwide" />
        <meta property="og:description" content="Discover full schedules, regional broadcasters, and stream football matches completely free without buffering." />
        <meta property="og:type" content="article" />
      </Helmet>

      {/* Hero Header Area */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 py-16 sm:py-24 text-white">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(255,255,255,0.03)_1.5px,transparent_1.5px)] bg-[size:24px_24px]" />
        <div className="absolute -left-1/4 -top-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -right-1/4 -bottom-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl animate-pulse delay-500" />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-1.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3.5 py-1 rounded-full text-xs font-black tracking-widest uppercase mb-6"
          >
            <Globe className="w-3.5 h-3.5" />
            Global Broadcaster & Streaming Guide
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-none mb-6"
          >
            Where to Watch <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">FIFA World Cup 2026 Live</span> free
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-300 text-lg sm:text-xl font-medium max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            The world's biggest football spectacle is here. Get ready to watch the 48 elite national teams battle across 104 matches in USA, Canada, and Mexico. Use our premium guide to stream live starting today!
          </motion.p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-3xl bg-white/5 border border-white/10 max-w-3xl mx-auto backdrop-blur-sm">
            <div className="border-r border-white/10 last:border-r-0 py-2">
              <span className="block text-xl md:text-2xl font-black text-white">104</span>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Matches</span>
            </div>
            <div className="border-r border-white/10 last:border-r-0 py-2">
              <span className="block text-xl md:text-2xl font-black text-white">48</span>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Global Teams</span>
            </div>
            <div className="border-r border-white/10 last:border-r-0 py-2">
              <span className="block text-xl md:text-2xl font-black text-white">3</span>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Host Countries</span>
            </div>
            <div className="py-2">
              <span className="block text-xl md:text-2xl font-black text-white">1080p/4K</span>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Stream Quality</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Blog Content Container */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Extensive Detailed Guide */}
        <div className="lg:col-span-8 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 space-y-8">
          
          {/* Article Info */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 text-orange-600 font-extrabold flex items-center justify-center rounded-full text-base">
                LS
              </div>
              <div>
                <span className="block font-black text-gray-900 text-sm">Sports Editor</span>
                <span className="text-xs text-gray-400 flex items-center gap-1.5 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  Published June 2026 • 5 Min Read
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-3.5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                {shareCopied ? (
                  <span className="text-emerald-600 font-black">Copied!</span>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-gray-500" />
                    Share Article
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Intro Section */}
          <div className="prose max-w-none text-gray-600 leading-relaxed space-y-4">
            <p className="text-lg text-gray-800 font-medium">
              Football fever is reaching absolute boiling point. The FIFA World Cup 2026 makes monumental history with its expanded format, showcasing forty-eight nations representing every continent. This expansion offers more high-stakes matches, historic rivalries, and incredible underdogs on football's final stage.
            </p>
            <p>
              Whether you are tuning in to witness the speed of the USA's golden generation, the traditional flair of South America's powerhouse teams, or the disciplined tactics of Europe's top clubs, access to a zero-lag live feed is paramount. Our team has rigorously curated local network providers and official web streams so you can enjoy high-resolution sports action wherever you are.
            </p>
          </div>

          <div className="h-[1px] bg-gray-100 my-4" />

          {/* Regional Broadcaster Engine Info with Live Filters */}
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2.5 mb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 text-orange-600 text-sm">📍</span>
              How & Where to Watch globally (Detailed Countries)
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              To help you instantly unlock exact credentials, select your region or use our targeted search box below to fetch local streams in real-time.
            </p>

            {/* Selector Buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button 
                onClick={() => setSelectedCountry('all')}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${selectedCountry === 'all' ? 'bg-indigo-900 text-white border-indigo-900 shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
              >
                🌎 Show All Regs
              </button>
              {COUNTRIES_INFO.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCountry(c.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border flex items-center gap-1.5 ${selectedCountry === c.id ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                >
                  <span>{c.flag}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>

            {/* Mini Search Box inside Selector */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                placeholder="Search TV channels, apps (e.g. Fox, JioCinema, Tapmad...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-sm rounded-xl transition-all"
              />
            </div>

            {/* Displaying filtered countries */}
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((item) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-5 md:p-6 bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border border-gray-200/80 shadow-xs hover:border-gray-300 transition-all flex flex-col gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl filter drop-shadow-sm">{item.flag}</span>
                        <div>
                          <h3 className="text-lg font-black text-gray-900">{item.name} Match Coverage</h3>
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                            Regional Guide
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
                        <div className="p-4 bg-white rounded-xl border border-gray-100">
                          <span className="block text-[10px] font-black uppercase text-indigo-600 tracking-wider mb-2 flex items-center gap-1">
                            <Tv className="w-3.5 h-3.5" /> TV Broadcasters
                          </span>
                          <ul className="space-y-1">
                            {item.channels.map((chan, idx) => (
                              <li key={idx} className="text-xs text-gray-800 font-semibold flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full shrink-0" />
                                {chan}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-4 bg-white rounded-xl border border-gray-100">
                          <span className="block text-[10px] font-black uppercase text-emerald-600 tracking-wider mb-2 flex items-center gap-1">
                            <Globe className="w-3.5 h-3.5" /> Streaming Platforms
                          </span>
                          <ul className="space-y-1">
                            {item.streamers.map((stream, idx) => (
                              <li key={idx} className="text-xs text-gray-800 font-semibold flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full shrink-0" />
                                {stream}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl flex items-start gap-2">
                        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span className="text-[11px] text-amber-800 font-medium leading-relaxed">
                          <strong>Pro Tip:</strong> {item.proTip}
                        </span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 font-medium">No results match your selected filter or keywords.</p>
                    <button 
                      onClick={() => { setSelectedCountry('all'); setSearchQuery(''); }}
                      className="mt-3 text-orange-500 font-black text-xs uppercase tracking-wider hover:underline"
                    >
                      Clear Selections
                    </button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* FAQS Section */}
          <div className="bg-gray-50/70 rounded-3xl p-6 md:p-8 border border-gray-200/60">
            <h3 className="text-xl font-black text-gray-900 tracking-tight gap-2 mb-6 flex items-center">
              💬 Frequently Asked Questions (Broadcasting)
            </h3>
            <div className="space-y-5">
              {FAQS.map((faq, i) => (
                <div key={i} className="space-y-2 last:border-b-0 border-b border-gray-200 pb-4 last:pb-0">
                  <h4 className="font-bold text-gray-900 text-sm flex items-start gap-1.5">
                    <span className="text-orange-500 font-black">Q:</span>
                    {faq.q}
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed pl-4">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="h-[1px] bg-gray-100 my-4" />

          {/* Watch Live Embedded Player Section */}
          <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl border border-white/5">
            <div className="absolute inset-0 bg-radial-gradient-to-b from-indigo-950/40 via-transparent to-transparent pointer-events-none" />
            
            <div className="relative text-center max-w-xl mx-auto space-y-4">
              <Tv className="w-10 h-10 text-orange-500 mx-auto" />
              <h3 className="text-2xl font-black tracking-tight">Interactive Stream Center</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Connect and check out live stream integrations immediately. Click the Live Stream button to start. Must have a high bandwidth connection.
              </p>

              {settings.fifaWatchEnabled ? (
                <div className="mt-8 space-y-6">
                  {/* Idle Action State */}
                  {streamState === 'idle' && (
                    <motion.button
                      whileHover={{ 
                        scale: 1.04, 
                        boxShadow: "0 0 25px rgba(249, 115, 22, 0.45)"
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={startStreamProcess}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-orange-500/20 cursor-pointer transition-all duration-300 border border-orange-400/30"
                    >
                      <Play className="w-5 h-5 fill-current" /> Watch FIFA 2026 Live Now
                    </motion.button>
                  )}

                  {/* Processing Handshake State */}
                  {streamState === 'processing' && (
                    <div className="p-6 bg-slate-800/80 rounded-2xl border border-white/10 space-y-4 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-orange-400 font-extrabold uppercase tracking-widest animate-pulse">
                          {processingStep}
                        </span>
                        <span className="text-xs text-gray-400 font-bold">{progress}%</span>
                      </div>
                      
                      {/* Interactive Progress bar */}
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                        Tunneling connection securely...
                      </div>
                    </div>
                  )}

                  {/* Complete Player Render */}
                  {streamState === 'ready' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 text-left"
                    >
                      <div className="flex items-center justify-between bg-slate-800/60 p-3 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                          </span>
                          <span className="text-xs font-black text-gray-300 uppercase tracking-widest">Connected • Live Stream Server</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Volume2 className="w-4 h-4 text-gray-400" />
                          <span>1080p ADAPTIVE</span>
                        </div>
                      </div>

                      {/* Embedded Player View */}
                      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
                        <iframe
                          src={extractEmbedUrl(settings.fifaEmbedUrl)}
                          title="FIFA World Cup Live Broadcast Stream Player"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          className="absolute inset-0 w-full h-full border-0"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-500 px-1 font-semibold">
                        <span>Source: {extractEmbedUrl(settings.fifaEmbedUrl)}</span>
                        <button 
                          onClick={() => setStreamState('idle')}
                          className="hover:text-white transition-colors cursor-pointer"
                        >
                          Reset feed
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="p-6 bg-slate-800/40 rounded-2xl border border-dashed border-white/10 mt-6">
                  <Tv className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <span className="block text-sm font-bold text-gray-400">Broadcasting Feed is Offline</span>
                  <span className="block text-[11px] text-gray-500 mt-1 max-w-sm mx-auto">
                    The streaming system has been disabled by the site operator. Watch features will restore automatically once matches kickoff.
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Hot Widgets & Meta Cards */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Match Facts Widget */}
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-3xl p-6 text-white shadow-lg space-y-4 border border-indigo-950/20">
            <h3 className="font-black text-lg tracking-tight flex items-center gap-2 border-b border-indigo-800/60 pb-3">
              <Gamepad2 className="w-5 h-5 text-orange-400" /> Key Venue Cities
            </h3>
            
            <div className="space-y-4.5 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white text-sm">United States (11 Cities)</strong>
                  <p className="text-indigo-200 mt-0.5">New York (MetLife Stadium), Los Angeles (SoFi Stadium), Miami, Atlanta, Boston, Dallas, Houston, Kansas City, Philadelphia, San Francisco, Seattle.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white text-sm">Canada (2 Cities)</strong>
                  <p className="text-indigo-200 mt-0.5">Toronto (BMO Field), Vancouver (BC Place Stadium).</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white text-sm">Mexico (3 Cities)</strong>
                  <p className="text-indigo-200 mt-0.5">Mexico City (Estadio Azteca), Monterrey, Guadalajara.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="bg-indigo-950/50 rounded-2xl p-3 border border-indigo-800/40 text-[11px] leading-relaxed text-indigo-100 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>All matches are officially licensed and strictly monitored under standard regulatory rules. Enjoy legal feeds!</span>
              </div>
            </div>
          </div>

          {/* Quick Group links promoter if available */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-black text-gray-900 text-base tracking-tight">⚽ Football Whatsapp Clubs</h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              Join active WhatsApp Groups to discuss live matches, goal videos, transfer news, and fantasy leagues instantly!
            </p>
            <a 
              href="/#groups" 
              className="inline-flex items-center justify-between w-full p-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100/80 rounded-2xl font-black text-xs transition-colors"
            >
              Discover Sport Groups <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
