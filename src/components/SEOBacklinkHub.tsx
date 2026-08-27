import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Hash, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Copy, 
  Check, 
  ArrowUpRight,
  TrendingUp,
  Compass,
  Layers,
  Search
} from 'lucide-react';
import { SEO_HASHTAGS, getCurrentDateInfo } from '../lib/seoHelper';
import { TOOLS } from '../types';

interface SEOBacklinkHubProps {
  currentSlug?: string;
  showFullHub?: boolean;
}

export const SEOBacklinkHub: React.FC<SEOBacklinkHubProps> = ({ 
  currentSlug, 
  showFullHub = true 
}) => {
  const navigate = useNavigate();
  const dateInfo = getCurrentDateInfo();
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'tools' | 'groups' | 'blogs'>('all');
  const [tagSearch, setTagSearch] = useState('');

  const filteredHashtags = SEO_HASHTAGS.filter(item => {
    const matchesTab = activeTab === 'all' || item.category === activeTab;
    const matchesSearch = item.tag.toLowerCase().includes(tagSearch.toLowerCase()) || 
                          item.label.toLowerCase().includes(tagSearch.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleCopyTag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1500);
  };

  const handleTagClick = (tagItem: typeof SEO_HASHTAGS[0]) => {
    if (tagItem.category === 'tools') {
      navigate('/tools');
    } else if (tagItem.category === 'groups') {
      navigate('/#groups');
    } else if (tagItem.category === 'blogs') {
      navigate('/blogs');
    } else {
      navigate('/');
    }
  };

  // High authority backlink clusters
  const BACKLINK_COLUMNS = [
    {
      category: 'Text & AI Utilities',
      links: [
        { label: 'Free AI Content Detector Online', url: '/tools/ai-detector', tag: 'High Accuracy' },
        { label: 'Online Plagiarism & Originality Checker', url: '/tools/plagiarism-checker', tag: 'Web Scan' },
        { label: 'Real-Time Word & Character Density Counter', url: '/tools/word-counter', tag: 'Instant' },
        { label: '100+ Fancy Stylish Text Generator', url: '/tools/stylish-text', tag: 'Unicode' },
        { label: 'Fast Online Text Repeater (10k Times)', url: '/tools/text-repeater', tag: '1-Click' },
        { label: 'WhatsApp Status Text Formatter (Bold/Italic)', url: '/tools/whatsapp-status-formatter', tag: 'Markdown' }
      ]
    },
    {
      category: 'Media, PDF & QR Codes',
      links: [
        { label: 'Image Compressor & Resizer Pro with Split Slider', url: '/tools/image-compressor', tag: 'Batch ZIP' },
        { label: 'TikTok Video Downloader Without Watermark HD', url: '/tools/tiktok-downloader', tag: 'Fast MP4/MP3' },
        { label: 'Custom Colored QR Code Generator with Logo', url: '/tools/qr-code-generator', tag: 'HD PNG' },
        { label: 'Instant Camera & Image QR Code Scanner', url: '/tools/qr-scanner', tag: 'Browser' },
        { label: 'Free Online PDF Editor & Signature Annotator', url: '/tools/pdf-editor', tag: 'No Watermark' },
        { label: 'Image to PDF Converter & Multi-PDF Merger', url: '/tools/image-pdf-merger', tag: 'Drag & Drop' },
        { label: 'In-Browser Image Editor, Crop & Filters', url: '/tools/image-editor', tag: 'Photo Studio' },
        { label: 'M3U & M3U8 IPTV Stream Playlist Reader', url: '/tools/m3u-playlist-viewer', tag: 'Live Sorter' }
      ]
    },
    {
      category: 'WhatsApp & Social Marketing',
      links: [
        { label: 'WhatsApp Direct Chat Link & QR Generator', url: '/tools/whatsapp-link-generator', tag: 'wa.me' },
        { label: 'WhatsApp DP Border Maker & Gradient Rings', url: '/tools/whatsapp-dp-border', tag: 'Profile' },
        { label: 'WhatsApp Group Names Generator (5,000+ Ideas)', url: '/tools/whatsapp-group-name-generator', tag: 'Ideas' },
        { label: 'Fake WhatsApp Conversation Screenshot Maker', url: '/tools/fake-whatsapp-screenshot', tag: 'Prank Mockup' },
        { label: 'WhatsApp Read More Hidden Text Generator', url: '/tools/whatsapp-read-more', tag: 'Spoiler' },
        { label: 'AI Viral WhatsApp Status Caption Quotes', url: '/tools/whatsapp-caption-generator', tag: 'AI Bio' }
      ]
    },
    {
      category: 'Tech Tutorials & Group Hubs',
      links: [
        { label: 'Verified WhatsApp Groups Directory 2026', url: '/#groups', tag: '5,000+ Links' },
        { label: 'Latest Tech Tutorials & Step-by-Step Guides', url: '/blogs', tag: 'Updated' },
        { label: 'Website HTML/CSS/JS Source Code Viewer', url: '/tools/source-code-viewer', tag: 'Dev Inspector' },
        { label: 'HTML iFrame Code Generator & Preview', url: '/tools/iframe-generator', tag: 'Embed Maker' },
        { label: 'Fast Clean URL Shortener with Analytics', url: '/tools/short-url-generator', tag: 'Tiny URL' },
        { label: 'WhatsApp Group Growth Strategies & Tips', url: '/tips-tricks', tag: 'Best Guides' },
        { label: 'Iran vs Israel Live Public Opinion Tracker', url: '/iran-vs-israel', tag: 'Live Votes' }
      ]
    }
  ];

  return (
    <section className="py-14 bg-gradient-to-b from-gray-50/80 via-white to-gray-50/50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header with Dynamic Date & Authority Signal */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-[#00a884] border border-emerald-100 rounded-full text-xs font-black uppercase tracking-wider mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>SEO Tag Cloud • Updated {dateInfo.formattedDayMonthYear}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Trending Search Keywords & Online Utilities Hub
            </h2>
            <p className="text-gray-500 text-sm mt-1 max-w-2xl">
              Explore 50+ verified search tags and instant internal links across all high-performance tools, WhatsApp group directories, and technical tutorials.
            </p>
          </div>

          {/* Quick Tag Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {(['all', 'tools', 'groups', 'blogs'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                  activeTab === tab 
                    ? 'bg-[#00a884] text-white border-[#00a884] shadow-sm' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {tab === 'all' ? 'All Tags (50+)' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* 50+ Hashtags Cloud */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-xs mb-10">
          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <Hash className="w-4 h-4 text-[#00a884]" />
              <span>Click to explore or copy trending hashtag</span>
            </div>
            <div className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              {filteredHashtags.length} Search Tags Available
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-2.5 max-h-[320px] overflow-y-auto pr-1">
            {filteredHashtags.map((item, idx) => {
              const isCopied = copiedTag === item.tag;
              return (
                <div
                  key={idx}
                  className="group inline-flex items-center gap-1.5 bg-gray-50 hover:bg-emerald-50/80 border border-gray-200/80 hover:border-emerald-200 rounded-xl px-2.5 py-1.5 text-xs transition-all duration-200"
                >
                  <button
                    onClick={() => handleTagClick(item)}
                    className="font-bold text-gray-700 group-hover:text-[#00a884] transition-colors cursor-pointer text-left"
                    title={`Explore ${item.label}`}
                  >
                    {item.tag}
                  </button>

                  <button
                    onClick={() => handleCopyTag(item.tag)}
                    className="p-1 text-gray-400 hover:text-emerald-600 rounded transition-colors cursor-pointer"
                    title="Copy hashtag"
                  >
                    {isCopied ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Full Authority Backlink Network Matrix */}
        {showFullHub && (
          <div className="space-y-8">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#00a884]" />
                Internal Backlink Index: High-Demand Tools & Guides
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Fast-track direct access with deep keyword integration and zero-latency browser execution.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {BACKLINK_COLUMNS.map((col, colIdx) => (
                <div 
                  key={colIdx} 
                  className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs hover:border-gray-200 transition-all flex flex-col justify-between"
                >
                  <div>
                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                      <span>{col.category}</span>
                      <Layers className="w-3.5 h-3.5 text-[#00a884]" />
                    </h4>
                    <ul className="space-y-2.5">
                      {col.links.map((link, linkIdx) => (
                        <li key={linkIdx}>
                          <Link
                            to={link.url}
                            className="group flex items-start justify-between gap-2 text-xs text-gray-600 hover:text-[#00a884] font-medium transition-colors py-1"
                          >
                            <span className="leading-snug group-hover:underline">{link.label}</span>
                            <span className="shrink-0 text-[9px] font-black uppercase tracking-wider bg-gray-100 group-hover:bg-emerald-100 text-gray-500 group-hover:text-emerald-700 px-1.5 py-0.5 rounded">
                              {link.tag}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Authority Feature Highlights (No AI fluff, pure facts) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00a884] flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Latest Tools & Instant Performance</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    All utilities execute client-side inside your browser for millisecond speeds with zero server wait times.
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">100% Free & No Sign-Up Needed</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Use full features with zero limits, zero paywalls, and zero forced account registrations.
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Daily Verified Links & Tools</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    All group invites and algorithms are tested and audited continuously for safety and freshness.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
};

export default SEOBacklinkHub;
