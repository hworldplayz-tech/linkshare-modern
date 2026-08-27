import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Sparkles, 
  Copy, 
  Check, 
  Play, 
  Music, 
  Image as ImageIcon, 
  ExternalLink, 
  Trash2, 
  Clock, 
  Share2, 
  Heart, 
  MessageCircle, 
  Eye, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  Video, 
  Film, 
  Smartphone, 
  Laptop, 
  ShieldCheck, 
  Zap, 
  FileText,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/Button';

interface TikTokAuthor {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
}

interface TikTokMusic {
  title: string;
  author: string;
  play: string;
  duration: number;
}

interface TikTokStats {
  plays: number;
  likes: number;
  comments: number;
  shares: number;
  downloads: number;
}

interface TikTokData {
  id: string;
  title: string;
  duration: number;
  cover: string;
  originCover: string;
  playUrl: string;
  hdPlayUrl: string;
  wmPlayUrl: string;
  musicUrl: string;
  musicInfo: TikTokMusic;
  author: TikTokAuthor;
  stats: TikTokStats;
  images: string[];
  type: 'video' | 'image';
}

interface DownloadHistoryItem {
  id: string;
  title: string;
  author: string;
  username: string;
  cover: string;
  playUrl: string;
  hdPlayUrl: string;
  musicUrl: string;
  downloadedAt: string;
  type: 'video' | 'image';
}

const SAMPLE_TIKTOK_LINKS = [
  { label: '🔥 Trending Video', url: 'https://www.tiktok.com/@tiktok/video/7106594312292453678' },
  { label: '🎵 Popular Sound', url: 'https://www.tiktok.com/@zachking/video/7212000000000000000' },
  { label: '📱 Viral Clip', url: 'https://vm.tiktok.com/ZM8example/' }
];

export const TikTokDownloader: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [videoData, setVideoData] = useState<TikTokData | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [history, setHistory] = useState<DownloadHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('tiktok_downloader_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'downloader' | 'history' | 'guide'>('downloader');

  useEffect(() => {
    try {
      localStorage.setItem('tiktok_downloader_history', JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save download history:', e);
    }
  }, [history]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        setUrl(clipText.trim());
        setError('');
      }
    } catch {
      setError('Clipboard access denied. Please manually paste your TikTok link.');
    }
  };

  const formatNumber = (num: number): string => {
    if (!num) return '0';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const formatDuration = (seconds: number): string => {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleFetch = async (targetUrl?: string) => {
    const inputUrl = (targetUrl || url).trim();
    if (!inputUrl) {
      setError('Please enter or paste a valid TikTok link.');
      return;
    }

    if (!inputUrl.includes('tiktok.com')) {
      setError('Invalid link. Please provide a link from tiktok.com or vm.tiktok.com');
      return;
    }

    setLoading(true);
    setError('');
    setVideoData(null);

    try {
      let data: TikTokData | null = null;

      // Try Server API first
      try {
        const response = await fetch('/api/tiktok-info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: inputUrl }),
        });

        // Verify if response is valid JSON or an HTML error page
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const json = await response.json();
          if (response.ok && json.success && json.data) {
            data = json.data;
          } else if (json.error) {
            throw new Error(json.error);
          }
        }
      } catch (serverErr: any) {
        console.warn('Server endpoint error, falling back to direct client API:', serverErr.message);
      }

      // Fallback: Direct TikWM public API directly from client if server returned non-JSON/500
      if (!data) {
        const directRes = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(inputUrl)}&hd=1`, {
          method: 'GET',
        });
        const directJson = await directRes.json();
        if (directJson && directJson.data) {
          const d = directJson.data;
          const playRaw = d.play || '';
          const hdPlayRaw = d.hdplay || '';
          const musicRaw = d.music || d.music_info?.play || '';

          const playUrl = playRaw ? (playRaw.startsWith('http') ? playRaw : `https://www.tikwm.com${playRaw}`) : '';
          const hdPlayUrl = hdPlayRaw ? (hdPlayRaw.startsWith('http') ? hdPlayRaw : `https://www.tikwm.com${hdPlayRaw}`) : playUrl;
          const musicUrl = musicRaw ? (musicRaw.startsWith('http') ? musicRaw : `https://www.tikwm.com${musicRaw}`) : '';

          data = {
            id: String(d.id || Date.now()),
            title: d.title || 'TikTok Video',
            duration: Number(d.duration) || 0,
            cover: d.cover ? (d.cover.startsWith('http') ? d.cover : `https://www.tikwm.com${d.cover}`) : '',
            originCover: d.origin_cover ? (d.origin_cover.startsWith('http') ? d.origin_cover : `https://www.tikwm.com${d.origin_cover}`) : '',
            playUrl: playUrl,
            hdPlayUrl: hdPlayUrl,
            wmPlayUrl: d.wmplay ? (d.wmplay.startsWith('http') ? d.wmplay : `https://www.tikwm.com${d.wmplay}`) : '',
            musicUrl: musicUrl,
            musicInfo: {
              title: d.music_info?.title || 'Original Sound',
              author: d.music_info?.author || d.author?.nickname || 'TikTok Creator',
              play: musicUrl,
              duration: Number(d.music_info?.duration || d.duration) || 0,
            },
            author: {
              id: String(d.author?.id || ''),
              username: d.author?.unique_id || 'tiktok_user',
              nickname: d.author?.nickname || 'TikTok Creator',
              avatar: d.author?.avatar ? (d.author.avatar.startsWith('http') ? d.author.avatar : `https://www.tikwm.com${d.author.avatar}`) : '',
            },
            stats: {
              plays: Number(d.play_count) || 0,
              likes: Number(d.digg_count) || 0,
              comments: Number(d.comment_count) || 0,
              shares: Number(d.share_count) || 0,
              downloads: Number(d.download_count) || 0,
            },
            images: Array.isArray(d.images) ? d.images.map((img: string) => img.startsWith('http') ? img : `https://www.tikwm.com${img}`) : [],
            type: (Array.isArray(d.images) && d.images.length > 0) ? 'image' : 'video',
          };
        }
      }

      if (!data) {
        throw new Error('Could not fetch TikTok video. Please ensure the link is public, accessible, and not deleted.');
      }

      setVideoData(data);

      // Add to local history
      const historyItem: DownloadHistoryItem = {
        id: data.id || Date.now().toString(),
        title: data.title || 'TikTok Video',
        author: data.author.nickname || 'TikTok User',
        username: data.author.username || 'user',
        cover: data.cover || data.originCover,
        playUrl: data.hdPlayUrl || data.playUrl,
        hdPlayUrl: data.hdPlayUrl,
        musicUrl: data.musicUrl,
        downloadedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        type: data.type,
      };

      setHistory(prev => {
        const filtered = prev.filter(item => item.id !== historyItem.id);
        return [historyItem, ...filtered].slice(0, 20);
      });
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Unable to download this TikTok video. Please verify the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const triggerDownload = async (mediaUrl: string, filename: string, formatKey: string) => {
    if (!mediaUrl) return;
    setDownloadingFormat(formatKey);

    try {
      // Approach 1: Try fetching as Blob directly (guarantees real binary MP4/MP3 download)
      try {
        const fetchRes = await fetch(mediaUrl, { mode: 'cors' });
        if (fetchRes.ok) {
          const blob = await fetchRes.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
          return;
        }
      } catch (blobErr) {
        console.warn('Direct blob download failed, trying proxy/iframe stream:', blobErr);
      }

      // Approach 2: Use proxy stream endpoint
      const downloadProxy = `/api/tiktok-proxy?url=${encodeURIComponent(mediaUrl)}&filename=${encodeURIComponent(filename)}`;
      const link = document.createElement('a');
      link.href = downloadProxy;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Download trigger error:', e);
      // Fallback direct open in new window
      window.open(mediaUrl, '_blank');
    } finally {
      setTimeout(() => setDownloadingFormat(null), 2000);
    }
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear your download history?')) {
      setHistory([]);
      localStorage.removeItem('tiktok_downloader_history');
    }
  };

  const removeHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-8 sm:space-y-12 max-w-full overflow-hidden">
      {/* --- Main Box --- */}
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-gray-100 p-4 sm:p-6 md:p-10 shadow-sm relative overflow-hidden max-w-full">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00a884]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 sm:gap-2 mb-6 sm:mb-8 border-b border-gray-100 pb-3 sm:pb-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('downloader')}
            className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === 'downloader'
                ? 'bg-[#00a884] text-white shadow-md shadow-[#00a884]/20'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Video Downloader
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === 'history'
                ? 'bg-[#00a884] text-white shadow-md shadow-[#00a884]/20'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            History ({history.length})
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === 'guide'
                ? 'bg-[#00a884] text-white shadow-md shadow-[#00a884]/20'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            How It Works
          </button>
        </div>

        {activeTab === 'downloader' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Input Bar */}
            <div className="relative max-w-full">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 bg-gray-50 p-2 sm:p-3 rounded-2xl sm:rounded-3xl border border-gray-200 focus-within:border-[#00a884] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#00a884]/10 transition-all shadow-inner">
                <div className="flex items-center gap-2 sm:gap-3 w-full pl-2 sm:pl-3 min-w-0">
                  <Video className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 flex-shrink-0" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (error) setError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleFetch();
                    }}
                    placeholder="Paste TikTok video or photo link..."
                    className="w-full min-w-0 bg-transparent text-gray-800 placeholder-gray-400 text-xs sm:text-base outline-none font-medium py-2"
                  />
                  {url && (
                    <button
                      onClick={() => {
                        setUrl('');
                        setVideoData(null);
                        setError('');
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200/60 transition-colors flex-shrink-0"
                      title="Clear"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={handlePaste}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl border border-gray-200 shadow-sm transition-all flex-shrink-0"
                    title="Paste from clipboard"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Paste
                  </button>
                </div>

                <div className="w-full sm:w-auto flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handlePaste}
                    className="sm:hidden flex-1 py-2.5 bg-white text-gray-700 text-xs font-bold rounded-xl border border-gray-200 text-center flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Paste
                  </button>
                  <Button
                    onClick={() => handleFetch()}
                    disabled={loading}
                    className="flex-[2] sm:flex-initial sm:w-auto px-5 sm:px-8 py-2.5 sm:py-4 bg-[#00a884] hover:bg-[#008f6f] text-white font-black text-xs sm:text-base rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg shadow-[#00a884]/25 flex items-center justify-center gap-2 transition-all flex-shrink-0 h-auto"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        <span>Fetching...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Download</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Sample Links helper */}
              <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-gray-500">
                <span className="font-semibold text-gray-400 text-[11px] sm:text-xs">Quick Test Examples:</span>
                {SAMPLE_TIKTOK_LINKS.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setUrl(sample.url);
                      handleFetch(sample.url);
                    }}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all text-[10px] sm:text-[11px]"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3.5 sm:p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 sm:gap-3 text-red-700"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm min-w-0">
                    <p className="font-bold">Download Failed</p>
                    <p className="text-red-600 mt-0.5 break-words">{error}</p>
                    <p className="text-[11px] sm:text-xs text-red-500 mt-1.5">
                      Tip: Ensure the TikTok account is not private and the URL format is correct.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* --- Result Video Display --- */}
            {videoData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-50 border border-gray-200/80 rounded-2xl sm:rounded-[2.5rem] p-3.5 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-full overflow-hidden"
              >
                {/* Author Info & Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-gray-200 w-full">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 w-full sm:w-auto">
                    <div className="relative flex-shrink-0">
                      <img
                        src={videoData.author.avatar || videoData.cover}
                        alt={videoData.author.nickname}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white shadow-md bg-white"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-[#00a884] rounded-full border-2 border-white flex items-center justify-center text-[8px] sm:text-[9px] text-white font-bold">
                        ✓
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <h3 className="font-black text-gray-900 text-base sm:text-xl truncate">
                          {videoData.author.nickname || videoData.author.username}
                        </h3>
                        <span className="px-2 py-0.5 bg-gray-200/80 text-gray-600 rounded-full text-[9px] sm:text-[10px] font-bold">
                          @{videoData.author.username}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                        <span>Duration: {formatDuration(videoData.duration)}</span>
                        <span>•</span>
                        <span>{videoData.type === 'image' ? '📸 Photo Slide' : '🎬 HD Video'}</span>
                      </p>
                    </div>
                  </div>

                  <a
                    href={`https://www.tiktok.com/@${videoData.author.username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#00a884] hover:underline flex-shrink-0 self-end sm:self-center"
                  >
                    View Profile <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Caption / Title */}
                {videoData.title && (
                  <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between gap-3">
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium min-w-0 break-words flex-1">
                      {videoData.title}
                    </p>
                    <button
                      onClick={() => handleCopy(videoData.title, 'caption')}
                      className="p-1.5 sm:p-2 text-gray-400 hover:text-[#00a884] hover:bg-emerald-50 rounded-lg sm:rounded-xl transition-all flex-shrink-0"
                      title="Copy Caption"
                    >
                      {copiedKey === 'caption' ? <Check className="w-4 h-4 text-[#00a884]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                )}

                {/* Video Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  <div className="bg-white p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-gray-100 text-center shadow-sm">
                    <div className="flex items-center justify-center gap-1 text-red-500 mb-0.5 sm:mb-1">
                      <Heart className="w-3.5 h-3.5 fill-red-500" />
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400">Likes</span>
                    </div>
                    <span className="text-sm sm:text-base font-black text-gray-900">{formatNumber(videoData.stats.likes)}</span>
                  </div>
                  <div className="bg-white p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-gray-100 text-center shadow-sm">
                    <div className="flex items-center justify-center gap-1 text-blue-500 mb-0.5 sm:mb-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400">Views</span>
                    </div>
                    <span className="text-sm sm:text-base font-black text-gray-900">{formatNumber(videoData.stats.plays)}</span>
                  </div>
                  <div className="bg-white p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-gray-100 text-center shadow-sm">
                    <div className="flex items-center justify-center gap-1 text-amber-500 mb-0.5 sm:mb-1">
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400">Comments</span>
                    </div>
                    <span className="text-sm sm:text-base font-black text-gray-900">{formatNumber(videoData.stats.comments)}</span>
                  </div>
                  <div className="bg-white p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-gray-100 text-center shadow-sm">
                    <div className="flex items-center justify-center gap-1 text-emerald-500 mb-0.5 sm:mb-1">
                      <Share2 className="w-3.5 h-3.5" />
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400">Shares</span>
                    </div>
                    <span className="text-sm sm:text-base font-black text-gray-900">{formatNumber(videoData.stats.shares)}</span>
                  </div>
                </div>

                {/* Media Preview & Download Action Buttons */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
                  {/* Left: Player / Preview */}
                  <div className="lg:col-span-5 flex flex-col items-center w-full">
                    <div className="w-full max-w-[280px] sm:max-w-sm bg-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl border border-gray-800 relative group aspect-[9/16] flex items-center justify-center mx-auto">
                      {videoData.playUrl || videoData.hdPlayUrl ? (
                        <video
                          src={videoData.hdPlayUrl || videoData.playUrl}
                          poster={videoData.cover || videoData.originCover}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <img
                          src={videoData.cover || videoData.originCover}
                          alt={videoData.title}
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                  </div>

                  {/* Right: Download Action Buttons Hub */}
                  <div className="lg:col-span-7 space-y-4 sm:space-y-5 w-full min-w-0">
                    <div>
                      <h4 className="text-lg sm:text-xl font-black text-gray-900 mb-1">
                        Download Options (No Watermark)
                      </h4>
                      <p className="text-xs text-gray-500">
                        Choose your preferred format. All downloads are free, clean, and processed instantly.
                      </p>
                    </div>

                    {/* Primary HD No-Watermark Button */}
                    <div className="space-y-3 w-full">
                      <button
                        onClick={() =>
                          triggerDownload(
                            videoData.hdPlayUrl || videoData.playUrl,
                            `tiktok_${videoData.author.username}_${videoData.id || 'no_watermark'}_HD.mp4`,
                            'hd'
                          )
                        }
                        disabled={downloadingFormat === 'hd'}
                        className="w-full p-3.5 sm:p-5 bg-gradient-to-r from-[#00a884] to-[#008f6f] hover:from-[#008f6f] hover:to-[#007b5e] text-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-xl shadow-[#00a884]/20 flex items-center justify-between group transition-all"
                      >
                        <div className="flex items-center gap-2.5 sm:gap-3 text-left min-w-0 flex-1">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                            {downloadingFormat === 'hd' ? (
                              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-white" />
                            ) : (
                              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-black text-xs sm:text-base md:text-lg flex flex-wrap items-center gap-1.5">
                              <span className="leading-tight">Download Without Watermark (HD)</span>
                              <span className="px-1.5 py-0.5 bg-white/30 text-white rounded text-[8px] sm:text-[10px] font-extrabold uppercase whitespace-nowrap">
                                Best Quality
                              </span>
                            </div>
                            <p className="text-[10px] sm:text-xs text-emerald-100 mt-0.5 leading-snug break-words">
                              MP4 Format • Crystal Clear HD • Direct Save
                            </p>
                          </div>
                        </div>
                        <Download className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0 ml-2 group-hover:translate-y-0.5 transition-transform" />
                      </button>

                      {/* Server 2 Fast Button */}
                      {videoData.playUrl && (
                        <button
                          onClick={() =>
                            triggerDownload(
                              videoData.playUrl,
                              `tiktok_${videoData.author.username}_${videoData.id || 'video'}.mp4`,
                              'sd'
                            )
                          }
                          disabled={downloadingFormat === 'sd'}
                          className="w-full p-3 sm:p-4 bg-white hover:bg-gray-50 border border-gray-200 sm:border-2 hover:border-[#00a884] text-gray-800 rounded-xl sm:rounded-2xl flex items-center justify-between group transition-all"
                        >
                          <div className="flex items-center gap-2.5 sm:gap-3 text-left min-w-0 flex-1">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#00a884]/10 group-hover:text-[#00a884] transition-colors">
                              {downloadingFormat === 'sd' ? (
                                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-[#00a884]" />
                              ) : (
                                <Film className="w-4 h-4 sm:w-5 sm:h-5" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-xs sm:text-base text-gray-900 leading-tight">
                                Download Without Watermark (Server 2 - Fast)
                              </div>
                              <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 leading-snug">
                                Optimized MP4 stream for fast mobile download
                              </p>
                            </div>
                          </div>
                          <Download className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-[#00a884] transition-colors flex-shrink-0 ml-2" />
                        </button>
                      )}

                      {/* Audio / MP3 Music Button */}
                      {videoData.musicUrl && (
                        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200 space-y-2.5 sm:space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-purple-50 text-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                                <Music className="w-4 h-4 sm:w-5 sm:h-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h5 className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                                  {videoData.musicInfo?.title || 'Original Sound Audio'}
                                </h5>
                                <p className="text-[10px] sm:text-xs text-gray-400 truncate">
                                  by {videoData.musicInfo?.author || videoData.author.nickname}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                triggerDownload(
                                  videoData.musicUrl,
                                  `tiktok_audio_${videoData.author.username}_${videoData.id}.mp3`,
                                  'audio'
                                )
                              }
                              disabled={downloadingFormat === 'audio'}
                              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 shadow-md shadow-purple-600/20 transition-all flex-shrink-0 whitespace-nowrap"
                            >
                              {downloadingFormat === 'audio' ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Download className="w-3.5 h-3.5" />
                              )}
                              <span>Download MP3</span>
                            </button>
                          </div>

                          {/* Audio In-line Player */}
                          <audio
                            src={videoData.musicUrl}
                            controls
                            className="w-full h-8"
                          />
                        </div>
                      )}

                      {/* Thumbnail Cover Download */}
                      {(videoData.originCover || videoData.cover) && (
                        <button
                          onClick={() =>
                            triggerDownload(
                              videoData.originCover || videoData.cover,
                              `tiktok_cover_${videoData.id}.jpg`,
                              'cover'
                            )
                          }
                          disabled={downloadingFormat === 'cover'}
                          className="w-full p-3 sm:p-3.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl sm:rounded-2xl flex items-center justify-between text-xs font-bold transition-all"
                        >
                          <span className="flex items-center gap-2 min-w-0 flex-1 truncate">
                            <ImageIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">Download Video HD Thumbnail (JPG)</span>
                          </span>
                          <Download className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                        </button>
                      )}
                    </div>

                    {/* Image Carousel / Photo Mode Downloads (if TikTok photos) */}
                    {videoData.images && videoData.images.length > 0 && (
                      <div className="pt-3 sm:pt-4 border-t border-gray-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-black text-xs sm:text-sm text-gray-900 flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4 text-[#00a884]" />
                            Photo Slideshow ({videoData.images.length})
                          </h5>
                          <button
                            onClick={() => {
                              videoData.images.forEach((img, idx) => {
                                setTimeout(() => {
                                  triggerDownload(img, `tiktok_photo_${videoData.id}_${idx + 1}.jpg`, `img_${idx}`);
                                }, idx * 500);
                              });
                            }}
                            className="text-[11px] sm:text-xs font-bold text-[#00a884] hover:underline"
                          >
                            Download All Slides
                          </button>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-1">
                          {videoData.images.map((imgUrl, idx) => (
                            <div
                              key={idx}
                              className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-100"
                            >
                              <img
                                src={imgUrl}
                                alt={`Slide ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={() =>
                                  triggerDownload(
                                    imgUrl,
                                    `tiktok_photo_${videoData.id}_${idx + 1}.jpg`,
                                    `img_${idx}`
                                  )
                                }
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-bold text-[10px] sm:text-xs gap-1"
                              >
                                <Download className="w-3.5 h-3.5" /> Save
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* --- History Tab --- */}
        {activeTab === 'history' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-gray-900">Recent Download History</h3>
                <p className="text-xs text-gray-500">
                  Quickly re-download your recent TikTok videos from this device.
                </p>
              </div>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5 flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear History
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-12 sm:py-16 bg-gray-50 rounded-2xl sm:rounded-3xl border border-gray-100">
                <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                <h4 className="font-bold text-gray-800 text-sm sm:text-base">No Download History Yet</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto px-4">
                  Videos you download will appear here so you can easily access them again without re-pasting links.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 hover:bg-gray-100/80 border border-gray-200/80 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between transition-all group"
                  >
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <div className="w-14 h-18 sm:w-16 sm:h-20 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0 relative">
                        {item.cover ? (
                          <img
                            src={item.cover}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Video className="w-6 h-6" />
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/70 text-white rounded text-[8px] font-bold">
                          {item.type === 'image' ? 'IMG' : 'MP4'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-gray-900 line-clamp-2 leading-snug">
                          {item.title || 'TikTok Video'}
                        </h4>
                        <p className="text-[10px] sm:text-[11px] text-gray-500 mt-1 truncate">@{item.username}</p>
                        <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5">{item.downloadedAt}</p>
                      </div>
                      <button
                        onClick={(e) => removeHistoryItem(item.id, e)}
                        className="text-gray-400 hover:text-red-500 p-1 transition-colors flex-shrink-0"
                        title="Delete from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-3 pt-2.5 sm:pt-3 border-t border-gray-200 flex items-center gap-2">
                      <button
                        onClick={() =>
                          triggerDownload(
                            item.hdPlayUrl || item.playUrl,
                            `tiktok_${item.username}_${item.id}.mp4`,
                            `hist_${item.id}`
                          )
                        }
                        className="flex-1 py-1.5 sm:py-2 bg-[#00a884] hover:bg-[#008f6f] text-white rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                      >
                        <Download className="w-3.5 h-3.5" /> Save Video
                      </button>
                      {item.musicUrl && (
                        <button
                          onClick={() =>
                            triggerDownload(
                              item.musicUrl,
                              `tiktok_audio_${item.id}.mp3`,
                              `hist_audio_${item.id}`
                            )
                          }
                          className="p-1.5 sm:p-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg sm:rounded-xl flex-shrink-0"
                          title="Download Audio"
                        >
                          <Music className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- Guide Tab --- */}
        {activeTab === 'guide' && (
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center max-w-2xl mx-auto px-2">
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-1.5 sm:mb-2">
                How to Download TikTok Videos Without Watermark
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Follow these 3 simple steps to save any public TikTok video directly to your smartphone, tablet, or computer.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-gray-50 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 flex flex-col items-center text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#00a884]/10 text-[#00a884] rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-lg sm:text-xl mb-3 sm:mb-4">
                  1
                </div>
                <h4 className="font-bold text-gray-900 mb-1.5 sm:mb-2 text-sm sm:text-base">Copy TikTok Link</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Open the TikTok app or website. Click on the <strong>Share</strong> button on the video and choose <strong>Copy Link</strong>.
                </p>
              </div>

              <div className="bg-gray-50 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 flex flex-col items-center text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#00a884]/10 text-[#00a884] rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-lg sm:text-xl mb-3 sm:mb-4">
                  2
                </div>
                <h4 className="font-bold text-gray-900 mb-1.5 sm:mb-2 text-sm sm:text-base">Paste the Link</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Paste the copied URL into the input field above and click the <strong>Download</strong> button.
                </p>
              </div>

              <div className="bg-gray-50 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 flex flex-col items-center text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#00a884]/10 text-[#00a884] rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-lg sm:text-xl mb-3 sm:mb-4">
                  3
                </div>
                <h4 className="font-bold text-gray-900 mb-1.5 sm:mb-2 text-sm sm:text-base">Save No Watermark MP4</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Select <strong>Download Without Watermark (HD)</strong> or <strong>Download MP3</strong> to save the file immediately.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- Feature Highlights Bento Grid --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm flex flex-col items-start">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 text-[#00a884] rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h4 className="font-black text-gray-900 text-sm sm:text-base mb-1">100% Watermark Free</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            Removes the official TikTok logo and bouncing username watermark from both video and audio.
          </p>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm flex flex-col items-start">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 text-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
            <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h4 className="font-black text-gray-900 text-sm sm:text-base mb-1">Android, iOS & PC</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            Works smoothly on iPhone (Safari/Files), Android (Chrome/Gallery), Windows, and Mac without extra apps.
          </p>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm flex flex-col items-start">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 text-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
            <Music className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h4 className="font-black text-gray-900 text-sm sm:text-base mb-1">Extract MP3 Audio</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            Download the viral background sound or voice track as a separate crystal-clear 320kbps MP3 audio file.
          </p>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm flex flex-col items-start">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 text-amber-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h4 className="font-black text-gray-900 text-sm sm:text-base mb-1">Unlimited & Free</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            No signup, no daily limits, no hidden fees, and zero software downloads required.
          </p>
        </div>
      </div>

      {/* --- Detailed FAQ Section --- */}
      <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-gray-100 p-5 sm:p-8 md:p-12 shadow-sm space-y-5 sm:space-y-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#00a884]/10 text-[#00a884] rounded-xl flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-2xl font-black text-gray-900">Frequently Asked Questions</h3>
            <p className="text-xs text-gray-500">Everything you need to know about downloading TikTok videos without watermark.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100">
            <h4 className="font-bold text-gray-900 text-xs sm:text-sm mb-1.5 sm:mb-2">Do I need to pay or install an app?</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              No. LinkShare's TikTok Downloader is 100% free and operates directly in your web browser. You do not need to register an account or install browser extensions.
            </p>
          </div>

          <div className="bg-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100">
            <h4 className="font-bold text-gray-900 text-xs sm:text-sm mb-1.5 sm:mb-2">Where are downloaded videos saved on iPhone?</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              On iOS devices running iOS 13+, Safari saves videos directly to your <strong>Files &gt; Downloads</strong> folder. You can open the file and tap "Save Video" to transfer it to your Camera Roll / Photos app.
            </p>
          </div>

          <div className="bg-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100">
            <h4 className="font-bold text-gray-900 text-xs sm:text-sm mb-1.5 sm:mb-2">Can I download TikTok photo slideshows?</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Yes! If a creator posted a photo slide carousel on TikTok, our tool detects all high-resolution pictures and allows you to download each slide individually or all at once.
            </p>
          </div>

          <div className="bg-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100">
            <h4 className="font-bold text-gray-900 text-xs sm:text-sm mb-1.5 sm:mb-2">Can I download private TikTok videos?</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              No. For privacy and security reasons, our tool only downloads publicly shared TikTok videos. Private accounts and videos deleted by the author cannot be retrieved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
