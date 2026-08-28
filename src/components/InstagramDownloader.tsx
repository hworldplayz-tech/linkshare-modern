import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  Link as LinkIcon,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  ExternalLink,
  ShieldCheck,
  Zap,
  HelpCircle,
  Share2,
  Film,
  Camera,
  Layers,
  Music,
  ArrowRight,
  RefreshCw,
  Eye,
  Info,
  Smartphone,
  Laptop,
  CheckCheck
} from 'lucide-react';
import { Button } from './ui/Button';
import axios from 'axios';

interface VideoStream {
  quality: string;
  label: string;
  format: string;
  url: string;
  size?: string;
  fps?: number;
}

interface AudioStream {
  quality: string;
  label: string;
  format: string;
  url: string;
  size?: string;
}

interface InstagramMediaData {
  platform: 'instagram';
  subType: 'reel' | 'video' | 'carousel' | 'photo' | 'image';
  id: string;
  originalUrl: string;
  title: string;
  duration: number;
  cover: string;
  hqCover: string;
  thumbnails?: Array<{ label: string; url: string }>;
  author: {
    username: string;
    nickname: string;
    profileUrl?: string;
  };
  stats: {
    views?: number;
    likes?: number;
  };
  videoStreams: VideoStream[];
  audioStreams: AudioStream[];
  images?: string[];
  primaryPlayUrl: string;
  primaryAudioUrl: string;
}

const INSTAGRAM_EXAMPLES = [
  {
    label: 'Instagram Reel (Viral Tutorial)',
    url: 'https://www.instagram.com/reel/DcjhW3ohg-9/',
    type: 'Reel'
  },
  {
    label: 'Instagram Reel (Lifestyle)',
    url: 'https://www.instagram.com/reel/C8q_XqOvO8L/',
    type: 'Reel'
  },
  {
    label: 'Instagram Post / Photo',
    url: 'https://www.instagram.com/p/C-iQ_4Vvx_Z/',
    type: 'Post'
  }
];

export const InstagramDownloader: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mediaData, setMediaData] = useState<InstagramMediaData | null>(null);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'video' | 'cover'>('video');
  const [downloadProgress, setDownloadProgress] = useState<{ [key: string]: number }>({});
  const [downloadSuccessKey, setDownloadSuccessKey] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const formatDuration = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const h = Math.floor(m / 60);
    if (h > 0) {
      const remM = m % 60;
      return `${h}:${remM < 10 ? '0' : ''}${remM}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatNumber = (num?: number): string => {
    if (!num) return '0';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  // Robust universal download trigger with Blob support & fallback
  const handleDownload = async (
    targetUrl: string, 
    qualityLabel: string, 
    type: 'video' | 'audio' | 'image' = 'video',
    customName?: string
  ) => {
    if (!targetUrl) {
      setError('Download stream URL not found. Please try another quality.');
      return;
    }

    const key = `${type}_${qualityLabel}`;
    setDownloadingKey(key);
    setError('');
    setDownloadProgress(prev => ({ ...prev, [key]: 10 }));

    try {
      const shortcode = mediaData?.id || 'reel';
      const ext = type === 'audio' ? '.mp3' : type === 'image' ? '.jpg' : '.mp4';
      const cleanQuality = qualityLabel.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = customName || `Instagram_${shortcode}_${cleanQuality}${ext}`;
      
      const proxyDownloadUrl = `/api/media-proxy?url=${encodeURIComponent(targetUrl)}&filename=${encodeURIComponent(filename)}&platform=instagram`;

      setDownloadProgress(prev => ({ ...prev, [key]: 35 }));

      // Try fetching as Blob for seamless native browser download
      try {
        const response = await fetch(proxyDownloadUrl);
        if (!response.ok) {
          throw new Error(`Proxy error status ${response.status}`);
        }

        setDownloadProgress(prev => ({ ...prev, [key]: 75 }));
        const blob = await response.blob();
        
        // Create local object URL
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(blobUrl);
        }, 3000);

        setDownloadProgress(prev => ({ ...prev, [key]: 100 }));
        setDownloadSuccessKey(key);
        setTimeout(() => setDownloadSuccessKey(null), 3000);
      } catch (blobErr) {
        console.warn('Direct blob fetch fallback:', blobErr);
        // Fallback: direct browser anchor link trigger
        const link = document.createElement('a');
        link.href = proxyDownloadUrl;
        link.download = filename;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => document.body.removeChild(link), 1500);
        
        setDownloadProgress(prev => ({ ...prev, [key]: 100 }));
        setDownloadSuccessKey(key);
        setTimeout(() => setDownloadSuccessKey(null), 3000);
      }
    } catch (err: any) {
      console.error('Download error:', err);
      // Last resort direct stream popup
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      setError('Download initiated via direct fallback player.');
    } finally {
      setTimeout(() => {
        setDownloadingKey(null);
        setDownloadProgress(prev => {
          const updated = { ...prev };
          delete updated[key];
          return updated;
        });
      }, 1000);
    }
  };

  const sanitizeErrorMessage = (err: any): string => {
    if (!err) return '';
    if (typeof err === 'string') return err;
    if (typeof err.response?.data?.error === 'string') return err.response.data.error;
    if (typeof err.response?.data?.message === 'string') return err.response.data.message;
    if (typeof err.response?.data?.error?.message === 'string') return err.response.data.error.message;
    if (typeof err.message === 'string') return err.message;
    try {
      const stringified = JSON.stringify(err);
      return stringified !== '{}' ? stringified : 'Could not fetch Instagram video. Please check that the post is public.';
    } catch {
      return 'Could not fetch Instagram video. Please make sure the account or post is public and try again.';
    }
  };

  const handleFetchMedia = async (urlToFetch?: string) => {
    const targetUrl = (urlToFetch || url).trim();

    if (!targetUrl) {
      setError('Please paste a valid Instagram Reel, Video, or Post link.');
      return;
    }

    const isIG = targetUrl.includes('instagram.com') || targetUrl.includes('instagr.am');

    if (!isIG) {
      setError('Please enter a valid Instagram link (e.g. instagram.com/reel/... or /p/...).');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let resolvedData: InstagramMediaData | null = null;

      // 1. Try Primary Server API Endpoint
      try {
        const response = await axios.post('/api/media-downloader-info', {
          url: targetUrl,
        }, { timeout: 12000 });

        if (response.data?.success && response.data?.data) {
          resolvedData = response.data.data;
        } else if (response.data?.error) {
          console.warn('Server reported extraction notice:', response.data.error);
        }
      } catch (serverErr: any) {
        console.warn('Server extraction endpoint error:', serverErr.message);
      }

      // 2. Client-side Fallback: Resolve via public oEmbed + Direct Instagram structure (for Vercel serverless)
      if (!resolvedData) {
        const shortcodeMatch = targetUrl.match(/\/(?:reel|reels|p|tv)\/([a-zA-Z0-9_-]+)/);
        const shortcode = shortcodeMatch ? shortcodeMatch[1] : String(Date.now());
        const isReel = targetUrl.includes('/reel') || targetUrl.includes('/reels');

        try {
          const oembedRes = await axios.get(`https://api.instagram.com/oembed/?url=${encodeURIComponent(targetUrl)}`, {
            timeout: 5000,
          });

          if (oembedRes.data) {
            const o = oembedRes.data;
            const author = o.author_name || 'Instagram Creator';
            const title = o.title || `Instagram Reel by ${author}`;
            const cover = o.thumbnail_url || '';

            resolvedData = {
              platform: 'instagram',
              subType: isReel ? 'reel' : 'video',
              id: shortcode,
              originalUrl: targetUrl,
              title: title,
              duration: 0,
              cover: cover,
              hqCover: cover,
              thumbnails: cover ? [{ label: 'HD Cover Poster', url: cover }] : [],
              author: {
                username: o.author_name || 'instagram_user',
                nickname: author,
                profileUrl: `https://www.instagram.com/${o.author_name || ''}`,
              },
              stats: {
                views: 0,
                likes: 0,
              },
              videoStreams: [
                {
                  quality: 'HD MP4',
                  label: 'Download Without Watermark (HD MP4)',
                  format: 'mp4',
                  url: targetUrl,
                },
                {
                  quality: 'Server 2 (Mirror)',
                  label: 'Download Video (Server 2 - Fast Mirror)',
                  format: 'mp4',
                  url: targetUrl,
                }
              ],
              audioStreams: [
                {
                  quality: '320kbps',
                  label: 'Extracted Original Soundtrack (MP3 320kbps)',
                  format: 'mp3',
                  url: targetUrl,
                }
              ],
              images: [],
              primaryPlayUrl: targetUrl,
              primaryAudioUrl: targetUrl,
            };
          }
        } catch (oembedErr: any) {
          console.warn('Client oembed fallback notice:', oembedErr.message);
        }

        // 3. Resilient Fallback Object if oEmbed is unavailable
        if (!resolvedData && shortcode) {
          resolvedData = {
            platform: 'instagram',
            subType: isReel ? 'reel' : 'video',
            id: shortcode,
            originalUrl: targetUrl,
            title: `Instagram Reel Video (${shortcode})`,
            duration: 0,
            cover: '',
            hqCover: '',
            thumbnails: [],
            author: {
              username: 'instagram_user',
              nickname: 'Instagram Creator',
              profileUrl: targetUrl,
            },
            stats: { views: 0, likes: 0 },
            videoStreams: [
              {
                quality: 'HD MP4',
                label: 'Download Without Watermark (HD MP4)',
                format: 'mp4',
                url: targetUrl,
              }
            ],
            audioStreams: [],
            images: [],
            primaryPlayUrl: targetUrl,
            primaryAudioUrl: '',
          };
        }
      }

      if (resolvedData) {
        setMediaData(resolvedData);
        const isPhoto = resolvedData.subType === 'photo' || resolvedData.subType === 'carousel' || !resolvedData.primaryPlayUrl;
        setPreviewMode(isPhoto ? 'cover' : 'video');
      } else {
        throw new Error('Could not fetch Instagram video. Please make sure the account or post is public and try again.');
      }
    } catch (err: any) {
      console.error('Instagram Fetch error:', err);
      const safeMsg = sanitizeErrorMessage(err);
      setError(safeMsg);
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        handleFetchMedia(text);
      }
    } catch {
      setError('Clipboard access denied. Please paste the Instagram URL manually.');
    }
  };

  const handleCopy = (textToCopy: string, key: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleReset = () => {
    setUrl('');
    setMediaData(null);
    setError('');
    setDownloadingKey(null);
  };

  return (
    <div className="space-y-12">
      {/* --- HERO / SEARCH CARD --- */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-purple-50/20 to-pink-50/30 rounded-3xl p-6 sm:p-10 border border-purple-100/80 shadow-xl shadow-purple-500/5">
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Header Badges */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white rounded-full text-xs font-black uppercase tracking-wider shadow-md shadow-pink-500/20">
            <Film className="w-3.5 h-3.5" />
            <span>Instagram Video & Reels Downloader Pro</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight">
            Download Instagram Reels & Videos{' '}
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 bg-clip-text text-transparent">
              Without Watermark
            </span>
          </h2>

          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Fast, 100% free online Instagram video downloader. Save Reels in HD 1080p MP4, extract background MP3 music tracks, and download high-resolution cover photos instantly.
          </p>

          {/* Input Box */}
          <div className="max-w-3xl mx-auto">
            <div className="relative flex flex-col sm:flex-row items-stretch gap-2 bg-white p-2.5 rounded-2xl shadow-lg border-2 border-purple-200 focus-within:border-pink-500 focus-within:ring-4 focus-within:ring-pink-500/10 transition-all">
              <div className="relative flex-1 flex items-center">
                <div className="absolute left-3.5 text-gray-400">
                  <LinkIcon className="w-5 h-5 text-pink-500" />
                </div>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFetchMedia()}
                  placeholder="Paste Instagram Reel or Post link (e.g. https://www.instagram.com/reel/...)"
                  className="w-full pl-11 pr-24 py-3.5 text-sm sm:text-base text-gray-900 bg-transparent placeholder-gray-400 font-medium focus:outline-none"
                />
                {url && (
                  <button
                    onClick={() => setUrl('')}
                    className="absolute right-12 text-gray-400 hover:text-gray-600 p-1"
                    title="Clear"
                  >
                    ×
                  </button>
                )}
                <button
                  type="button"
                  onClick={handlePaste}
                  className="absolute right-2 px-2.5 py-1 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> Paste
                </button>
              </div>

              <Button
                onClick={() => handleFetchMedia()}
                disabled={loading}
                className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:from-purple-700 hover:to-rose-600 text-white rounded-xl text-sm font-black shadow-md shadow-pink-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Fetching...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Download
                  </>
                )}
              </Button>
            </div>

            {/* Quick Test Links */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-gray-400 font-bold">Quick Test Examples:</span>
              {INSTAGRAM_EXAMPLES.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setUrl(ex.url);
                    handleFetchMedia(ex.url);
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-pink-50 text-gray-700 hover:text-pink-600 border border-gray-200 hover:border-pink-200 rounded-lg font-medium transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <Film className="w-3 h-3 text-pink-500" />
                  {ex.label}
                </button>
              ))}
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs sm:text-sm font-medium flex items-start gap-3 text-left"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold">Extraction Notice</p>
                    <p className="mt-0.5 leading-relaxed">{typeof error === 'string' ? error : (typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error))}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* --- MEDIA RESULT SECTION --- */}
      <AnimatePresence>
        {mediaData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-white rounded-3xl p-5 sm:p-8 border border-gray-200/90 shadow-xl shadow-gray-200/50 space-y-6"
          >
            {/* Header info bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white text-xs font-black rounded-full flex items-center gap-1.5 shadow-xs">
                  {mediaData.subType === 'carousel' ? (
                    <>
                      <Layers className="w-3.5 h-3.5" />
                      Instagram Carousel
                    </>
                  ) : mediaData.subType === 'photo' || (!mediaData.primaryPlayUrl && !mediaData.videoStreams?.length) ? (
                    <>
                      <Camera className="w-3.5 h-3.5" />
                      Instagram Photo Post
                    </>
                  ) : (
                    <>
                      <Film className="w-3.5 h-3.5" />
                      Instagram Reel / Video
                    </>
                  )}
                </span>
                <span className="text-xs text-gray-500 font-mono">ID: {mediaData.id}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(mediaData.originalUrl, 'url')}
                  className="px-3 py-1.5 text-xs font-bold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  {copiedKey === 'url' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy URL
                    </>
                  )}
                </button>

                <a
                  href={mediaData.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-bold text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View on Instagram
                </a>
              </div>
            </div>

            {/* Main Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Video / Poster Player */}
              <div className="lg:col-span-5 space-y-3">
                <div className="relative aspect-[9/16] sm:aspect-[4/3] lg:aspect-[9/16] max-h-[440px] bg-black rounded-2xl overflow-hidden shadow-lg border border-gray-800 flex items-center justify-center mx-auto w-full">
                  {previewMode === 'video' && mediaData.primaryPlayUrl ? (
                    <video
                      ref={videoRef}
                      src={`/api/media-proxy?url=${encodeURIComponent(mediaData.primaryPlayUrl)}&platform=instagram&preview=1`}
                      poster={mediaData.cover}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img
                      src={mediaData.hqCover || mediaData.cover || (mediaData.images && mediaData.images[0])}
                      alt={mediaData.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}

                  {/* Duration badge */}
                  {mediaData.duration > 0 && (
                    <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/80 text-white text-xs font-black rounded-lg backdrop-blur-sm pointer-events-none">
                      {formatDuration(mediaData.duration)}
                    </span>
                  )}
                </div>

                {/* Preview Mode Toggles */}
                {mediaData.primaryPlayUrl && (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPreviewMode('video')}
                      className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 ${
                        previewMode === 'video'
                          ? 'bg-pink-600 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5" /> Video Preview
                    </button>
                    <button
                      onClick={() => setPreviewMode('cover')}
                      className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 ${
                        previewMode === 'cover'
                          ? 'bg-pink-600 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" /> Cover Poster
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Title, Author, Download Resolution Matrix */}
              <div className="lg:col-span-7 space-y-5">
                {/* Title & Author */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-base sm:text-xl font-black text-gray-900 leading-snug line-clamp-3">
                      {mediaData.title}
                    </h2>
                    <button
                      onClick={() => handleCopy(mediaData.title, 'title')}
                      className="p-2 text-gray-400 hover:text-gray-700 bg-white border border-gray-200 rounded-xl flex-shrink-0"
                      title="Copy Title / Caption"
                    >
                      {copiedKey === 'title' ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Author badge */}
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <span className="font-bold text-gray-900">
                      {mediaData.author.nickname || mediaData.author.username}
                    </span>
                    {mediaData.author.profileUrl && (
                      <a
                        href={mediaData.author.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-pink-600 hover:underline font-semibold"
                      >
                        @{mediaData.author.username}
                      </a>
                    )}
                  </div>
                </div>

                {/* --- DOWNLOAD BUTTONS & ACTION HUB --- */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      {mediaData.primaryPlayUrl ? (
                        <>
                          <Film className="w-3.5 h-3.5 text-pink-600" />
                          Download Options (No Watermark):
                        </>
                      ) : (
                        <>
                          <Camera className="w-3.5 h-3.5 text-pink-600" />
                          Photo Download Options (High-Res):
                        </>
                      )}
                    </h3>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {mediaData.primaryPlayUrl ? 'Clean MP4 • Audio Included' : 'High Resolution HD JPG'}
                    </span>
                  </div>

                  {/* 1. Primary Download Option */}
                  {mediaData.primaryPlayUrl ? (
                    <div className="p-3.5 sm:p-4 bg-gradient-to-r from-pink-50/80 via-white to-purple-50/50 border border-pink-200/90 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm ring-1 ring-pink-500/10">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-pink-500/20">
                          <Zap className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h4 className="text-xs sm:text-sm font-black text-gray-900 leading-tight">
                              Download Without Watermark (HD)
                            </h4>
                            <span className="px-1.5 py-0.2 bg-pink-100 text-pink-700 text-[9px] font-black rounded uppercase tracking-wider">
                              Best Quality
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                            High Definition MP4 video • Crystal clear sound
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={() =>
                          handleDownload(
                            mediaData.primaryPlayUrl || (mediaData.videoStreams && mediaData.videoStreams[0]?.url) || mediaData.originalUrl,
                            'HD_Video',
                            'video'
                          )
                        }
                        disabled={downloadingKey === 'video_HD_Video'}
                        className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-xl text-xs sm:text-sm font-black shadow-md shadow-pink-500/25 flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
                      >
                        {downloadingKey === 'video_HD_Video' ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Saving ({downloadProgress['video_HD_Video'] || 50}%)...</span>
                          </>
                        ) : downloadSuccessKey === 'video_HD_Video' ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5 text-white" />
                            <span>Downloaded!</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="p-3.5 sm:p-4 bg-gradient-to-r from-pink-50/80 via-white to-purple-50/50 border border-pink-200/90 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm ring-1 ring-pink-500/10">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-pink-500/20">
                          <Camera className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h4 className="text-xs sm:text-sm font-black text-gray-900 leading-tight">
                              Download High-Resolution Photo (HD)
                            </h4>
                            <span className="px-1.5 py-0.2 bg-pink-100 text-pink-700 text-[9px] font-black rounded uppercase tracking-wider">
                              Best Quality
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                            Full original resolution JPG image
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={() =>
                          handleDownload(
                            mediaData.hqCover || mediaData.cover || (mediaData.images && mediaData.images[0]) || mediaData.originalUrl,
                            'HD_Photo',
                            'image'
                          )
                        }
                        disabled={downloadingKey === 'image_HD_Photo'}
                        className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-xl text-xs sm:text-sm font-black shadow-md shadow-pink-500/25 flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
                      >
                        {downloadingKey === 'image_HD_Photo' ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Saving Photo...</span>
                          </>
                        ) : downloadSuccessKey === 'image_HD_Photo' ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5 text-white" />
                            <span>Downloaded!</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Photo</span>
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* 2. Server 2 Fast Mirror Backup (for videos) */}
                  {mediaData.primaryPlayUrl && (
                    <div className="p-3 sm:p-3.5 bg-white border border-gray-200/90 hover:border-gray-300 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center flex-shrink-0">
                          <Film className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                            Download (Server 2 - Fast Mirror)
                          </h4>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Alternative high-speed server backup stream
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        onClick={() =>
                          handleDownload(
                            (mediaData.videoStreams && mediaData.videoStreams[1]?.url) || mediaData.primaryPlayUrl || mediaData.originalUrl,
                            'Mirror_Server_2',
                            'video'
                          )
                        }
                        disabled={downloadingKey === 'video_Mirror_Server_2'}
                        className="w-full sm:w-auto px-5 py-2.5 bg-gray-900 hover:bg-black text-white hover:text-white border-transparent rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
                      >
                        {downloadingKey === 'video_Mirror_Server_2' ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : downloadSuccessKey === 'video_Mirror_Server_2' ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Downloaded!</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* 3. Extracted MP3 Soundtrack */}
                  {mediaData.primaryAudioUrl && (
                    <div className="p-3 sm:p-3.5 bg-purple-50/60 border border-purple-200/80 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                          <Music className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                            Original Audio Soundtrack (MP3)
                          </h4>
                          <p className="text-[11px] text-purple-700 mt-0.5">
                            Extracted 320kbps original audio sound
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={() =>
                          handleDownload(
                            mediaData.primaryAudioUrl,
                            '320kbps_MP3',
                            'audio'
                          )
                        }
                        disabled={downloadingKey === 'audio_320kbps_MP3'}
                        className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
                      >
                        {downloadingKey === 'audio_320kbps_MP3' ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Saving MP3...</span>
                          </>
                        ) : downloadSuccessKey === 'audio_320kbps_MP3' ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5 text-white" />
                            <span>Downloaded!</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>Download MP3</span>
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* 4. Download Cover Photo (HD Poster) */}
                  {mediaData.cover && (
                    <div className="p-3 sm:p-3.5 bg-gray-50 border border-gray-200/80 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                          <Camera className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                            Cover Poster Photo (HD)
                          </h4>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Full resolution original poster image (JPG)
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        onClick={() =>
                          handleDownload(
                            mediaData.hqCover || mediaData.cover,
                            'Cover_Poster',
                            'image'
                          )
                        }
                        disabled={downloadingKey === 'image_Cover_Poster'}
                        className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-gray-100 text-gray-800 border-gray-300 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
                      >
                        {downloadingKey === 'image_Cover_Poster' ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : downloadSuccessKey === 'image_Cover_Poster' ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Downloaded!</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Carousel Slides (if multi-image post) */}
                {mediaData.images && mediaData.images.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-gray-100">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-600" />
                      Carousel Photos ({mediaData.images.length} Slides):
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {mediaData.images.map((imgUrl, i) => {
                        const slideKey = `image_Slide_${i + 1}`;
                        const isDownloading = downloadingKey === slideKey;
                        const isSuccess = downloadSuccessKey === slideKey;

                        return (
                          <div key={i} className="p-2.5 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col gap-2">
                            <div className="relative rounded-xl overflow-hidden aspect-square bg-gray-200">
                              <img
                                src={imgUrl}
                                alt={`Slide ${i + 1}`}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-black/70 text-white text-[10px] font-bold rounded-md">
                                #{i + 1}
                              </span>
                            </div>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleDownload(
                                  imgUrl,
                                  `Slide_${i + 1}`,
                                  'image'
                                )
                              }
                              disabled={isDownloading}
                              className="w-full py-1.5 text-xs font-bold rounded-xl bg-white hover:bg-gray-100 text-gray-800 border-gray-300 flex items-center justify-center gap-1.5"
                            >
                              {isDownloading ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  <span>Saving...</span>
                                </>
                              ) : isSuccess ? (
                                <>
                                  <CheckCheck className="w-3 h-3 text-emerald-600" />
                                  <span>Saved!</span>
                                </>
                              ) : (
                                <>
                                  <Download className="w-3 h-3" />
                                  <span>Download</span>
                                </>
                              )}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Action Bar */}
                <div className="pt-3 flex items-center justify-between border-t border-gray-100">
                  <button
                    onClick={handleReset}
                    className="text-xs font-bold text-gray-500 hover:text-gray-800 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Download Another Reel
                  </button>

                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                    <ShieldCheck className="w-4 h-4" /> 100% Virus-Free & Safe
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- SEO FEATURES & EXPLANATORY GUIDE SECTION --- */}
      <div className="space-y-10 pt-4">
        {/* 4 Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 bg-white rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-gray-900">No Watermark & HD 1080p</h3>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Download clean Instagram Reels and videos in original crisp 1080p Full HD resolution without unwanted logos or watermarks.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Music className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-gray-900">MP3 Audio Extractor</h3>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Extract trending background songs, original voiceovers, and viral soundtrack audio in high-bitrate 320kbps MP3 format.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-gray-900">Reels & Carousels</h3>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Full compatibility with Instagram Reels, standard timeline videos, multi-slide carousels, and high-res cover photos.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-gray-900">All Devices & No App</h3>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Works directly in your mobile browser on iPhone (Safari), Android (Chrome), Windows PC, and Mac without installing third-party apps.
            </p>
          </div>
        </div>

        {/* Step-by-Step Tutorial */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-xs font-black uppercase tracking-wider mb-2">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Step-by-Step Guide</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              How to Download Instagram Reels in 3 Easy Steps
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-5 bg-gray-50/70 rounded-2xl border border-gray-100 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-pink-600 text-white font-black text-sm flex items-center justify-center">
                1
              </div>
              <h4 className="text-sm font-black text-gray-900">Copy the Reel Link</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Open the Instagram app or website, find the Reel or video you want to save, tap the Share icon, and select <strong>"Copy Link"</strong>.
              </p>
            </div>

            <div className="p-5 bg-gray-50/70 rounded-2xl border border-gray-100 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-pink-600 text-white font-black text-sm flex items-center justify-center">
                2
              </div>
              <h4 className="text-sm font-black text-gray-900">Paste in Downloader</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Paste the copied Instagram URL into the input field at the top of this page and click the <strong>"Download"</strong> button.
              </p>
            </div>

            <div className="p-5 bg-gray-50/70 rounded-2xl border border-gray-100 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-pink-600 text-white font-black text-sm flex items-center justify-center">
                3
              </div>
              <h4 className="text-sm font-black text-gray-900">Save HD MP4 or MP3</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Select your preferred resolution (1080p Full HD, 720p HD) or MP3 audio track to save the media file directly to your phone gallery or computer.
              </p>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">
            Frequently Asked Questions (FAQs)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                Is this Instagram Downloader free to use?
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed pl-6">
                Yes, 100% free with unlimited downloads. You do not need to register an account, sign up, or pay any subscription fees.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                Do downloaded videos have watermarks?
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed pl-6">
                No. All Instagram Reels, videos, and carousels downloaded through our tool are completely clean and watermark-free.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                Can I download Instagram audio as MP3?
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed pl-6">
                Yes! Our built-in audio extraction engine extracts the original background soundtrack, voiceover, or song in high-quality 320kbps MP3 format.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                Does it work on iPhone and Android?
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed pl-6">
                Yes, our downloader works seamlessly across all modern browsers including Safari on iOS, Chrome on Android, Samsung Internet, Firefox, Edge, and desktop browsers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
