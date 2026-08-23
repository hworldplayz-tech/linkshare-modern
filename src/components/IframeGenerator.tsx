import React, { useState, useEffect, useMemo } from 'react';
import { 
  AppWindow, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  RotateCcw, 
  Sparkles, 
  Sliders, 
  Eye, 
  Code, 
  Trash2, 
  Maximize2, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Info, 
  Layers, 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle,
  Play
} from 'lucide-react';
import { Button } from './ui/Button';
import { motion, AnimatePresence } from 'motion/react';

interface SavedIframe {
  id: string;
  url: string;
  title: string;
  width: string;
  height: string;
  scrollbar: 'no' | 'yes' | 'auto';
  hasBorder: 'no' | 'yes';
  borderSize: string;
  borderColor: string;
  borderStyle: string;
  allowFullscreen: 'yes' | 'no';
  borderRadius: string;
  loading: 'lazy' | 'eager';
  savedAt: string;
}

const PRESET_URLS = [
  { label: 'Sample Video Player', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
  { label: 'YouTube Embed', url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ' },
  { label: 'OpenStreetMap', url: 'https://www.openstreetmap.org/export/embed.html?bbox=-0.15%2C51.50%2C-0.10%2C51.53&layer=mapnik' },
  { label: 'Wikipedia Article', url: 'https://en.m.wikipedia.org/wiki/World_Wide_Web' },
  { label: 'Codepen Demo', url: 'https://codepen.io' }
];

export const IframeGenerator: React.FC = () => {
  // Form States (matching screenshot precisely + modern enhancements)
  const [url, setUrl] = useState<string>('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
  const [title, setTitle] = useState<string>('iFrame');
  const [width, setWidth] = useState<string>('100%');
  const [height, setHeight] = useState<string>('600px');
  const [scrollbar, setScrollbar] = useState<'no' | 'yes' | 'auto'>('no');
  const [hasBorder, setHasBorder] = useState<'no' | 'yes'>('no');
  const [borderSize, setBorderSize] = useState<string>('1px');
  const [borderColor, setBorderColor] = useState<string>('#FFFFFF');
  const [borderStyle, setBorderStyle] = useState<string>('none');
  const [allowFullscreen, setAllowFullscreen] = useState<'yes' | 'no'>('yes');
  
  // Advanced Settings
  const [loading, setLoading] = useState<'lazy' | 'eager'>('lazy');
  const [borderRadius, setBorderRadius] = useState<string>('0px');
  const [isResponsiveWrapper, setIsResponsiveWrapper] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<'16/9' | '4/3' | '1/1'>('16/9');
  const [enableSandbox, setEnableSandbox] = useState<boolean>(false);
  const [sandboxPermissions, setSandboxPermissions] = useState<string[]>([
    'allow-scripts',
    'allow-same-origin',
    'allow-popups',
    'allow-forms'
  ]);
  const [featurePermissions, setFeaturePermissions] = useState<string[]>([
    'fullscreen',
    'autoplay',
    'clipboard-write',
    'encrypted-media',
    'picture-in-picture'
  ]);

  // UI States
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedWrapper, setCopiedWrapper] = useState<boolean>(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewKey, setPreviewKey] = useState<number>(0);
  const [history, setHistory] = useState<SavedIframe[]>([]);
  const [activeCodeTab, setActiveCodeTab] = useState<'standard' | 'responsive'>('standard');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load Saved History on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('iframe_generator_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Generate CSS Style string
  const styleString = useMemo(() => {
    const styles: string[] = [];
    
    if (hasBorder === 'yes' && borderStyle !== 'none') {
      styles.push(`border:${borderSize} ${borderColor} ${borderStyle}`);
    } else {
      styles.push(`border:${borderSize} ${borderColor} none`);
    }

    if (borderRadius && borderRadius !== '0px') {
      styles.push(`border-radius:${borderRadius}`);
      styles.push('overflow:hidden');
    }

    return styles.join('; ');
  }, [hasBorder, borderSize, borderColor, borderStyle, borderRadius]);

  // Generate Standard HTML Iframe Code
  const generatedIframeCode = useMemo(() => {
    const trimmedUrl = url.trim() || 'https://example.com';
    const borderAttr = hasBorder === 'no' ? 'frameborder="no"' : 'frameborder="1"';
    const scrollAttr = `scrolling="${scrollbar}"`;
    const fullscreenAttr = allowFullscreen === 'yes' ? 'allow="fullscreen"' : '';
    const loadingAttr = loading === 'lazy' ? 'loading="lazy"' : '';
    
    const allowAttr = featurePermissions.length > 0 ? `allow="${featurePermissions.join('; ')}"` : '';
    const sandboxAttr = enableSandbox && sandboxPermissions.length > 0 ? `sandbox="${sandboxPermissions.join(' ')}"` : '';

    const attrs = [
      `style="${styleString}"`,
      `src="${trimmedUrl}"`,
      `title="${title || 'iFrame'}"`,
      `width="${width}"`,
      `height="${height}"`,
      scrollAttr,
      borderAttr,
      fullscreenAttr || allowAttr,
      loadingAttr,
      sandboxAttr
    ].filter(Boolean).join(' ');

    return `<iframe ${attrs}></iframe>`;
  }, [url, title, width, height, scrollbar, hasBorder, styleString, allowFullscreen, loading, enableSandbox, sandboxPermissions, featurePermissions]);

  // Generate Responsive CSS Wrapper Code (for mobile-friendly embeds)
  const generatedResponsiveCode = useMemo(() => {
    const trimmedUrl = url.trim() || 'https://example.com';
    const paddingMap = {
      '16/9': '56.25%',
      '4/3': '75%',
      '1/1': '100%'
    };
    const paddingTop = paddingMap[aspectRatio];

    const iframeAttrs = [
      `src="${trimmedUrl}"`,
      `title="${title || 'iFrame'}"`,
      `style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; ${hasBorder === 'yes' ? `border: ${borderSize} ${borderColor} ${borderStyle};` : 'border: none;'}${borderRadius !== '0px' ? ` border-radius: ${borderRadius};` : ''}"`,
      `frameborder="${hasBorder === 'yes' ? '1' : '0'}"`,
      `scrolling="${scrollbar}"`,
      allowFullscreen === 'yes' ? 'allow="fullscreen"' : '',
      loading === 'lazy' ? 'loading="lazy"' : ''
    ].filter(Boolean).join(' ');

    return `<div style="position: relative; width: 100%; height: 0; padding-top: ${paddingTop}; overflow: hidden;${borderRadius !== '0px' ? ` border-radius: ${borderRadius};` : ''}">\n  <iframe ${iframeAttrs}></iframe>\n</div>`;
  }, [url, title, aspectRatio, hasBorder, borderSize, borderColor, borderStyle, borderRadius, scrollbar, allowFullscreen, loading]);

  // Handle Save to Local History
  const saveToHistory = () => {
    const newItem: SavedIframe = {
      id: Date.now().toString(),
      url,
      title,
      width,
      height,
      scrollbar,
      hasBorder,
      borderSize,
      borderColor,
      borderStyle,
      allowFullscreen,
      borderRadius,
      loading,
      savedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    const updated = [newItem, ...history.filter(h => h.url !== url)].slice(0, 12);
    setHistory(updated);
    try {
      localStorage.setItem('iframe_generator_history', JSON.stringify(updated));
      showToast('Saved to recent history!');
    } catch (e) {
      console.error(e);
    }
  };

  const loadFromHistory = (item: SavedIframe) => {
    setUrl(item.url);
    setTitle(item.title);
    setWidth(item.width);
    setHeight(item.height);
    setScrollbar(item.scrollbar);
    setHasBorder(item.hasBorder);
    setBorderSize(item.borderSize);
    setBorderColor(item.borderColor);
    setBorderStyle(item.borderStyle);
    setAllowFullscreen(item.allowFullscreen);
    if (item.borderRadius) setBorderRadius(item.borderRadius);
    if (item.loading) setLoading(item.loading);
    setPreviewKey(prev => prev + 1);
    showToast('Loaded configuration!');
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    try {
      localStorage.setItem('iframe_generator_history', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('iframe_generator_history');
      showToast('History cleared');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = (text: string, isWrapper: boolean = false) => {
    navigator.clipboard.writeText(text);
    if (isWrapper) {
      setCopiedWrapper(true);
      setTimeout(() => setCopiedWrapper(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    showToast('Code copied to clipboard!');
    saveToHistory();
  };

  const handleDownload = () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'iFrame Embed'}</title>
  <style>
    body { margin: 0; padding: 20px; font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f8fafc; }
    .embed-wrapper { max-width: 100%; width: ${width}; }
  </style>
</head>
<body>
  <div class="embed-wrapper">
    ${activeCodeTab === 'responsive' ? generatedResponsiveCode : generatedIframeCode}
  </div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `iframe-${(title || 'embed').toLowerCase().replace(/[^a-z0-9]/g, '-')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
    showToast('HTML file downloaded!');
  };

  const resetDefaults = () => {
    setUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
    setTitle('iFrame');
    setWidth('100%');
    setHeight('600px');
    setScrollbar('no');
    setHasBorder('no');
    setBorderSize('1px');
    setBorderColor('#FFFFFF');
    setBorderStyle('none');
    setAllowFullscreen('yes');
    setBorderRadius('0px');
    setLoading('lazy');
    setPreviewKey(prev => prev + 1);
    showToast('Reset to defaults');
  };

  // Check if URL might be blocked by X-Frame-Options
  const isLikelyXFrameBlocked = useMemo(() => {
    const lower = url.toLowerCase();
    return (
      lower.includes('google.com') && !lower.includes('/maps') ||
      lower.includes('facebook.com') ||
      lower.includes('twitter.com') ||
      lower.includes('x.com') ||
      lower.includes('instagram.com') ||
      lower.includes('github.com') && !lower.includes('github.io')
    );
  }, [url]);

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 z-50 bg-gray-900 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-gray-800"
          >
            <CheckCircle2 className="w-4 h-4 text-[#00a884]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Generator Configuration Card */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-6 sm:p-8 md:p-10 shadow-sm">
        
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-gray-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-[#00a884] rounded-full text-xs font-black uppercase tracking-wider mb-2">
              <AppWindow className="w-3.5 h-3.5" />
              <span>HTML5 iFrame Maker</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Iframe Generator & Customizer
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Configure parameters, customize border styles, adjust viewport dimensions, and copy ready-to-embed HTML.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetDefaults}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-500 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
                showAdvanced ? 'bg-[#00a884] text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showAdvanced ? 'Hide Advanced' : 'Pro Controls'}</span>
            </button>
          </div>
        </div>

        {/* Input Form Fields */}
        <div className="space-y-6">
          
          {/* Row 1: URL Input + Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                <span>URL (Embed Source Link)</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-gray-400">
                <span>Quick Samples:</span>
                {PRESET_URLS.slice(0, 3).map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setUrl(p.url);
                      setPreviewKey(prev => prev + 1);
                    }}
                    className="text-[#00a884] hover:underline font-bold"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/embed"
                className="w-full px-4 py-3.5 bg-gray-50/80 border border-gray-200 rounded-2xl text-gray-900 text-sm font-mono focus:bg-white focus:border-[#00a884] focus:ring-4 focus:ring-[#00a884]/10 outline-none transition-all"
              />
            </div>

            {/* Mobile Presets Scroll */}
            <div className="flex sm:hidden items-center gap-2 mt-2 overflow-x-auto pb-1 text-xs">
              <span className="text-gray-400 text-[10px] whitespace-nowrap">Presets:</span>
              {PRESET_URLS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setUrl(p.url);
                    setPreviewKey(prev => prev + 1);
                  }}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-emerald-50 hover:text-[#00a884] text-gray-600 rounded-lg whitespace-nowrap text-[11px] font-medium transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Title, Width, Height, Scrollbar (matching layout in screenshot) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            
            {/* TITLE */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-2">
                TITLE
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="iFrame"
                className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-gray-900 text-sm focus:bg-white focus:border-[#00a884] focus:ring-4 focus:ring-[#00a884]/10 outline-none transition-all"
              />
            </div>

            {/* WIDTH */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black uppercase tracking-wider text-gray-600">
                  WIDTH
                </label>
                <div className="flex items-center gap-1">
                  <button 
                    type="button"
                    onClick={() => setWidth('100%')} 
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${width === '100%' ? 'bg-emerald-100 text-[#00a884]' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    100%
                  </button>
                  <button 
                    type="button"
                    onClick={() => setWidth('800px')} 
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${width === '800px' ? 'bg-emerald-100 text-[#00a884]' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    800px
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="100% or 600px"
                className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-gray-900 text-sm font-mono focus:bg-white focus:border-[#00a884] focus:ring-4 focus:ring-[#00a884]/10 outline-none transition-all"
              />
            </div>

            {/* HEIGHT */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black uppercase tracking-wider text-gray-600">
                  HEIGHT
                </label>
                <div className="flex items-center gap-1">
                  <button 
                    type="button"
                    onClick={() => setHeight('600px')} 
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${height === '600px' ? 'bg-emerald-100 text-[#00a884]' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    600px
                  </button>
                  <button 
                    type="button"
                    onClick={() => setHeight('450px')} 
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${height === '450px' ? 'bg-emerald-100 text-[#00a884]' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    450px
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="600px or 100vh"
                className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-gray-900 text-sm font-mono focus:bg-white focus:border-[#00a884] focus:ring-4 focus:ring-[#00a884]/10 outline-none transition-all"
              />
            </div>

            {/* SCROLLBAR */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-2">
                SCROLLBAR
              </label>
              <div className="relative">
                <select
                  value={scrollbar}
                  onChange={(e) => setScrollbar(e.target.value as any)}
                  className="w-full appearance-none px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-gray-900 text-sm focus:bg-white focus:border-[#00a884] focus:ring-4 focus:ring-[#00a884]/10 outline-none transition-all cursor-pointer font-medium"
                >
                  <option value="no">no (Disable scrolling)</option>
                  <option value="yes">yes (Always visible)</option>
                  <option value="auto">auto (When needed)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  ▼
                </div>
              </div>
            </div>

          </div>

          {/* Row 3: Border, Border Size, Border Color, Border Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            
            {/* BORDER (yes/no) */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-2">
                BORDER
              </label>
              <div className="relative">
                <select
                  value={hasBorder}
                  onChange={(e) => {
                    const val = e.target.value as 'no' | 'yes';
                    setHasBorder(val);
                    if (val === 'yes' && borderStyle === 'none') {
                      setBorderStyle('solid');
                    }
                  }}
                  className="w-full appearance-none px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-gray-900 text-sm focus:bg-white focus:border-[#00a884] focus:ring-4 focus:ring-[#00a884]/10 outline-none transition-all cursor-pointer font-medium"
                >
                  <option value="no">no (None / Clean)</option>
                  <option value="yes">yes (Show Border)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  ▼
                </div>
              </div>
            </div>

            {/* BORDER TYPE / SIZE (1px, 2px, etc) */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-2">
                BORDER SIZE
              </label>
              <div className="relative">
                <select
                  value={borderSize}
                  onChange={(e) => setBorderSize(e.target.value)}
                  className="w-full appearance-none px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-gray-900 text-sm focus:bg-white focus:border-[#00a884] focus:ring-4 focus:ring-[#00a884]/10 outline-none transition-all cursor-pointer font-medium"
                >
                  <option value="0px">0px</option>
                  <option value="1px">1px</option>
                  <option value="2px">2px</option>
                  <option value="3px">3px</option>
                  <option value="4px">4px</option>
                  <option value="5px">5px</option>
                  <option value="8px">8px</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  ▼
                </div>
              </div>
            </div>

            {/* BorderColor */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-2">
                BorderColor
              </label>
              <div className="flex items-center gap-2 bg-gray-50/80 border border-gray-200 rounded-2xl px-3 py-1.5 focus-within:bg-white focus-within:border-[#00a884] focus-within:ring-4 focus-within:ring-[#00a884]/10 transition-all">
                <input
                  type="color"
                  value={borderColor.startsWith('#') ? borderColor : '#FFFFFF'}
                  onChange={(e) => setBorderColor(e.target.value.toUpperCase())}
                  className="w-7 h-7 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={borderColor}
                  onChange={(e) => setBorderColor(e.target.value)}
                  placeholder="#FFFFFF"
                  className="w-full bg-transparent text-sm font-mono text-gray-800 outline-none uppercase font-bold"
                />
              </div>
            </div>

            {/* BORDER TYPE / STYLE (none, solid, dashed, etc) */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-2">
                BORDER TYPE
              </label>
              <div className="relative">
                <select
                  value={borderStyle}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBorderStyle(val);
                    if (val !== 'none') setHasBorder('yes');
                  }}
                  className="w-full appearance-none px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-gray-900 text-sm focus:bg-white focus:border-[#00a884] focus:ring-4 focus:ring-[#00a884]/10 outline-none transition-all cursor-pointer font-medium"
                >
                  <option value="none">none</option>
                  <option value="solid">solid</option>
                  <option value="dashed">dashed</option>
                  <option value="dotted">dotted</option>
                  <option value="double">double</option>
                  <option value="groove">groove</option>
                  <option value="ridge">ridge</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  ▼
                </div>
              </div>
            </div>

          </div>

          {/* Row 4: Allow Full Screen + Border Radius */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            
            {/* ALLOW FULL SCREEN */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-2">
                ALLOW FULL SCREEN
              </label>
              <div className="relative">
                <select
                  value={allowFullscreen}
                  onChange={(e) => setAllowFullscreen(e.target.value as any)}
                  className="w-full appearance-none px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-gray-900 text-sm focus:bg-white focus:border-[#00a884] focus:ring-4 focus:ring-[#00a884]/10 outline-none transition-all cursor-pointer font-medium"
                >
                  <option value="yes">yes (Allow Fullscreen)</option>
                  <option value="no">no (Disallow Fullscreen)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  ▼
                </div>
              </div>
            </div>

            {/* BORDER RADIUS (Rounded Corners) */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-2">
                CORNER RADIUS
              </label>
              <div className="relative">
                <select
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(e.target.value)}
                  className="w-full appearance-none px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-gray-900 text-sm focus:bg-white focus:border-[#00a884] focus:ring-4 focus:ring-[#00a884]/10 outline-none transition-all cursor-pointer font-medium"
                >
                  <option value="0px">0px (Square)</option>
                  <option value="8px">8px (Subtle Rounded)</option>
                  <option value="12px">12px (Modern Card)</option>
                  <option value="16px">16px (Smooth Rounded)</option>
                  <option value="24px">24px (Pill Rounded)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  ▼
                </div>
              </div>
            </div>

            {/* LOADING ATTRIBUTE */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-2">
                LOADING STRATEGY
              </label>
              <div className="relative">
                <select
                  value={loading}
                  onChange={(e) => setLoading(e.target.value as any)}
                  className="w-full appearance-none px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-gray-900 text-sm focus:bg-white focus:border-[#00a884] focus:ring-4 focus:ring-[#00a884]/10 outline-none transition-all cursor-pointer font-medium"
                >
                  <option value="lazy">lazy (Boost Page Speed)</option>
                  <option value="eager">eager (Immediate Load)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  ▼
                </div>
              </div>
            </div>

            {/* RESPONSIVE ASPECT RATIO PRESET */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-2">
                RESPONSIVE RATIO
              </label>
              <div className="relative">
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as any)}
                  className="w-full appearance-none px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-gray-900 text-sm focus:bg-white focus:border-[#00a884] focus:ring-4 focus:ring-[#00a884]/10 outline-none transition-all cursor-pointer font-medium"
                >
                  <option value="16/9">16:9 Widescreen (Video)</option>
                  <option value="4/3">4:3 Standard</option>
                  <option value="1/1">1:1 Square</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  ▼
                </div>
              </div>
            </div>

          </div>

          {/* Expandable Pro Security & Sandbox Settings */}
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden pt-4 border-t border-gray-100"
              >
                <div className="bg-gray-50/70 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#00a884]" />
                      <span>Security Sandbox & Permissions Policy</span>
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                      <input
                        type="checkbox"
                        checked={enableSandbox}
                        onChange={(e) => setEnableSandbox(e.target.checked)}
                        className="rounded text-[#00a884] focus:ring-[#00a884] w-4 h-4"
                      />
                      <span>Enable sandbox="..."</span>
                    </label>
                  </div>

                  {enableSandbox && (
                    <div>
                      <span className="text-[11px] font-bold text-gray-500 block mb-2">Sandbox Flags:</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {['allow-scripts', 'allow-same-origin', 'allow-popups', 'allow-forms', 'allow-modals'].map((flag) => (
                          <label key={flag} className="flex items-center gap-2 text-xs text-gray-600 bg-white px-3 py-1.5 rounded-xl border border-gray-200 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={sandboxPermissions.includes(flag)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSandboxPermissions([...sandboxPermissions, flag]);
                                } else {
                                  setSandboxPermissions(sandboxPermissions.filter(f => f !== flag));
                                }
                              }}
                              className="rounded text-[#00a884] focus:ring-[#00a884]"
                            />
                            <span className="font-mono text-[11px]">{flag}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="text-[11px] font-bold text-gray-500 block mb-2">Browser Feature Allow Policy:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['autoplay', 'camera', 'microphone', 'geolocation', 'encrypted-media', 'picture-in-picture', 'clipboard-write'].map((feat) => (
                        <label key={feat} className="flex items-center gap-2 text-xs text-gray-600 bg-white px-3 py-1.5 rounded-xl border border-gray-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={featurePermissions.includes(feat)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFeaturePermissions([...featurePermissions, feat]);
                              } else {
                                setFeaturePermissions(featurePermissions.filter(f => f !== feat));
                              }
                            }}
                            className="rounded text-[#00a884] focus:ring-[#00a884]"
                          />
                          <span className="font-mono text-[11px]">{feat}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Central Generate Button matching screenshot */}
          <div className="text-center pt-2">
            <Button
              onClick={() => {
                setPreviewKey(prev => prev + 1);
                saveToHistory();
                showToast('iFrame generated & refreshed!');
              }}
              className="bg-[#182635] hover:bg-[#0f172a] text-white px-10 py-4 font-black rounded-xl text-sm transition-all shadow-lg hover:shadow-xl transform active:scale-95"
            >
              <Sparkles className="w-4 h-4 mr-2 text-[#00a884]" />
              Generate
            </Button>
          </div>

        </div>

      </div>

      {/* Generated Code Display Box matching screenshot */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-6 sm:p-8 md:p-10 shadow-sm space-y-4">
        
        {/* Code Tabs Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveCodeTab('standard')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${
                activeCodeTab === 'standard'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Standard &lt;iframe&gt; Code
            </button>
            <button
              onClick={() => setActiveCodeTab('responsive')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${
                activeCodeTab === 'responsive'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Responsive Mobile CSS Container ({aspectRatio})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(activeCodeTab === 'responsive' ? generatedResponsiveCode : generatedIframeCode)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00a884] text-white hover:bg-[#008f6f] text-xs font-black rounded-xl transition-all shadow-md shadow-[#00a884]/20"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all"
              title="Download standalone HTML file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.HTML</span>
            </button>
          </div>
        </div>

        {/* Textarea Code Snippet */}
        <div className="relative">
          <textarea
            readOnly
            value={activeCodeTab === 'responsive' ? generatedResponsiveCode : generatedIframeCode}
            rows={activeCodeTab === 'responsive' ? 4 : 3}
            className="w-full p-4 sm:p-5 bg-gray-50/90 border border-gray-200 rounded-2xl text-gray-800 font-mono text-xs sm:text-sm leading-relaxed outline-none select-all focus:bg-white focus:border-[#00a884]/30"
          />
        </div>
      </div>

      {/* Live Preview Section matching screenshot */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-6 sm:p-8 md:p-10 shadow-sm space-y-6">
        
        {/* Preview Header & Device Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#00a884]" />
            <h3 className="text-xl sm:text-2xl font-black text-gray-900">Preview:</h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Device Width Switches */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  previewDevice === 'desktop' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice('tablet')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  previewDevice === 'tablet' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Tablet View (768px)"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  previewDevice === 'mobile' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Mobile View (375px)"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setPreviewKey(prev => prev + 1)}
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-bold transition-all"
              title="Reload Preview Frame"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all"
              title="Open Target URL in New Tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Test URL</span>
            </a>
          </div>
        </div>

        {/* X-Frame Options Warning Notice (if applicable) */}
        {isLikelyXFrameBlocked && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-800">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Notice regarding browser X-Frame-Options:</p>
              <p>
                Major platforms like Google, Facebook, and X (Twitter) restrict direct in-page embedding via <code className="bg-amber-100 px-1 rounded">X-Frame-Options: SAMEORIGIN</code> security headers. If the frame below displays a connection error, use embed-ready endpoints (like YouTube <code className="bg-amber-100 px-1 rounded">/embed/</code>, Google Maps Embed API, or OpenStreetMap).
              </p>
            </div>
          </div>
        )}

        {/* The Live Rendered Frame Container */}
        <div className="flex justify-center bg-gray-50/50 p-4 sm:p-6 rounded-3xl border border-dashed border-gray-200 overflow-x-auto min-h-[400px]">
          <div
            style={{
              width: previewDevice === 'mobile' ? '375px' : previewDevice === 'tablet' ? '768px' : '100%',
              maxWidth: '100%',
              transition: 'width 0.3s ease'
            }}
          >
            {activeCodeTab === 'responsive' ? (
              <div 
                style={{
                  position: 'relative',
                  width: '100%',
                  height: 0,
                  paddingTop: aspectRatio === '16/9' ? '56.25%' : aspectRatio === '4/3' ? '75%' : '100%',
                  overflow: 'hidden',
                  borderRadius: borderRadius
                }}
              >
                <iframe
                  key={previewKey}
                  src={url}
                  title={title || 'iFrame Preview'}
                  scrolling={scrollbar}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: hasBorder === 'yes' ? `${borderSize} ${borderColor} ${borderStyle}` : 'none',
                    borderRadius: borderRadius,
                    backgroundColor: '#ffffff'
                  }}
                  allow={allowFullscreen === 'yes' ? 'fullscreen' : undefined}
                  loading={loading}
                />
              </div>
            ) : (
              <iframe
                key={previewKey}
                src={url}
                title={title || 'iFrame Preview'}
                width="100%"
                height={height}
                scrolling={scrollbar}
                style={{
                  border: hasBorder === 'yes' && borderStyle !== 'none' ? `${borderSize} ${borderColor} ${borderStyle}` : `0px solid ${borderColor}`,
                  borderRadius: borderRadius,
                  backgroundColor: '#ffffff',
                  display: 'block'
                }}
                allow={allowFullscreen === 'yes' ? 'fullscreen' : undefined}
                loading={loading}
              />
            )}
          </div>
        </div>

      </div>

      {/* Recently Saved History */}
      {history.length > 0 && (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-6 sm:p-8 md:p-10 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#00a884]" />
              <h3 className="text-xl font-black text-gray-900">Recently Generated iFrames</h3>
            </div>
            <button
              onClick={clearHistory}
              className="text-xs font-bold text-red-500 hover:text-red-600 hover:underline"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => loadFromHistory(item)}
                className="p-4 bg-gray-50 hover:bg-emerald-50/40 border border-gray-200 hover:border-[#00a884]/40 rounded-2xl cursor-pointer transition-all group relative"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00a884]" />
                    <h4 className="font-bold text-xs text-gray-900 group-hover:text-[#00a884] transition-colors truncate max-w-[180px]">
                      {item.title || 'Untitled iFrame'}
                    </h4>
                  </div>
                  <button
                    onClick={(e) => deleteHistoryItem(item.id, e)}
                    className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-[11px] font-mono text-gray-500 truncate mb-3">
                  {item.url}
                </p>

                <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
                  <span>{item.width} × {item.height}</span>
                  <span>{item.savedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guide & Knowledge Base */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-6 sm:p-8 md:p-10 shadow-sm space-y-8">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mb-2">
            How to Use the HTML iFrame Generator
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            An <code>&lt;iframe&gt;</code> (Inline Frame) tag is an HTML element used to embed an external web document, video player, interactive map, or widget into any web page.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 bg-gray-50 rounded-2xl space-y-2 border border-gray-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#00a884] font-black flex items-center justify-center text-sm">
              1
            </div>
            <h4 className="font-bold text-sm text-gray-900">Enter Target URL</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Paste the exact URL of the media, map, or webpage you want to embed. Ensure the target protocol uses HTTPS.
            </p>
          </div>

          <div className="p-5 bg-gray-50 rounded-2xl space-y-2 border border-gray-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#00a884] font-black flex items-center justify-center text-sm">
              2
            </div>
            <h4 className="font-bold text-sm text-gray-900">Customize Styles</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Adjust width, height, custom border thickness, border colors, corner radii, and scrollbar behavior.
            </p>
          </div>

          <div className="p-5 bg-gray-50 rounded-2xl space-y-2 border border-gray-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#00a884] font-black flex items-center justify-center text-sm">
              3
            </div>
            <h4 className="font-bold text-sm text-gray-900">Copy & Embed</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Click "Copy Code" to paste into WordPress, Shopify, Webflow, React, or any raw HTML website template.
            </p>
          </div>
        </div>

        {/* Detailed FAQ */}
        <div className="border-t border-gray-100 pt-6 space-y-4">
          <h4 className="font-bold text-base text-gray-900">Frequently Asked Questions</h4>
          <div className="space-y-3 text-xs sm:text-sm text-gray-600">
            <details className="bg-gray-50 p-4 rounded-xl cursor-pointer">
              <summary className="font-bold text-gray-900">How do I make my iFrame 100% responsive on mobile devices?</summary>
              <p className="mt-2 text-gray-500 text-xs leading-relaxed">
                Use the <strong>Responsive Mobile CSS Container</strong> tab generated above. It wraps the iframe in a container with a percentage-based <code>padding-top</code> (e.g. 56.25% for 16:9 widescreen) and absolute positioning, guaranteeing crisp scaling on smartphones, tablets, and desktop displays.
              </p>
            </details>
            <details className="bg-gray-50 p-4 rounded-xl cursor-pointer">
              <summary className="font-bold text-gray-900">Why does my preview say "Refused to connect" or 404?</summary>
              <p className="mt-2 text-gray-500 text-xs leading-relaxed">
                Some websites send an <code>X-Frame-Options: SAMEORIGIN</code> or <code>Content-Security-Policy: frame-ancestors 'self'</code> HTTP header preventing other domains from embedding them inside an iframe to prevent clickjacking attacks. For YouTube, always use the <code>/embed/VIDEO_ID</code> link instead of the watch URL.
              </p>
            </details>
            <details className="bg-gray-50 p-4 rounded-xl cursor-pointer">
              <summary className="font-bold text-gray-900">What does loading="lazy" do?</summary>
              <p className="mt-2 text-gray-500 text-xs leading-relaxed">
                The <code>loading="lazy"</code> attribute defers the loading of off-screen iframes until the user scrolls near them. This drastically speeds up initial page load times and saves user mobile bandwidth.
              </p>
            </details>
          </div>
        </div>

      </div>

    </div>
  );
};

export default IframeGenerator;
