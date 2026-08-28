import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';
import axios from 'axios';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Use process.env.PORT for production compatibility with various hosting providers
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Add a specific error handler for JSON parsing errors
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  next();
});

// API endpoint to fetch metadata from a URL
app.post('/api/fetch-metadata', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const apiKey = process.env.LINKPREVIEW_API_KEY || '63ee164025a62be2f2b7f469140dc96e';

  try {
    const response = await axios.get(`https://api.linkpreview.net/?key=${apiKey}&q=${encodeURIComponent(url)}`);
    
    const metadata = {
      title: response.data.title || '',
      description: response.data.description || '',
      image: response.data.image || '',
    };

    res.json(metadata);
  } catch (error: any) {
    if (error.response?.status === 423) {
      console.log('LinkPreview API is locked (423). Falling back to basic scraping...');
    } else {
      console.error('Error fetching metadata from LinkPreview:', error.message);
    }
    
    // Fallback to basic scraping if LinkPreview fails
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        timeout: 5000,
      });

      const $ = cheerio.load(response.data);
      const metadata = {
        title: $('meta[property="og:title"]').attr('content') || $('title').text() || '',
        description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '',
        image: $('meta[property="og:image"]').attr('content') || '',
      };

      res.json(metadata);
    } catch (fallbackError: any) {
      console.error('Fallback metadata fetching failed:', fallbackError.message);
      res.status(500).json({ error: 'Failed to fetch metadata' });
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check requested at:', new Date().toISOString());
  res.json({ status: 'live', time: new Date().toISOString() });
});

// API endpoint to fetch raw source code from a URL
app.post('/api/fetch-source', async (req, res) => {
  const { url } = req.body;
  console.log(`[API] Fetch source requested for: ${url}`);
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      transformResponse: [(data) => data],
      timeout: 12000,
      maxRedirects: 5,
      validateStatus: (status) => status < 500, // Handle 4xx as successful fetch so we can see the source
    });

    res.json({ source: response.data || '' });
  } catch (error: any) {
    console.error(`[Fetch Error] ${url}:`, error.message);
    
    let status = 500;
    let message = 'An error occurred while fetching the website.';

    if (error.response) {
      status = error.response.status;
      message = `The website returned an error (${status}). This often happens with bot protection.`;
      if (status === 403) message = "Access Forbidden (403). Automated access is blocked by this website.";
    } else if (error.code === 'ECONNABORTED') {
      status = 504;
      message = "Timeout: The website took too long to respond.";
    } else if (error.message.includes('ENOTFOUND')) {
      status = 404;
      message = "The website URL could not be found. Please check the spelling.";
    } else {
      message = error.message;
    }

    res.status(status).json({ error: message });
  }
});

// API endpoint to fetch TikTok video info without watermark
app.post('/api/tiktok-info', async (req, res) => {
  let { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Please provide a valid TikTok video URL' });
  }

  url = url.trim();

  // Validate TikTok URL format
  if (!url.includes('tiktok.com')) {
    return res.status(400).json({ error: 'Please enter a valid TikTok link (e.g. tiktok.com/@user/video/... or vm.tiktok.com/...)' });
  }

  console.log(`[TikTok API] Fetching info for: ${url}`);

  // Provider 1: TikWM (Primary API)
  try {
    const response = await axios.post(
      'https://www.tikwm.com/api/',
      new URLSearchParams({ url, hd: '1' }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'Referer': 'https://www.tikwm.com/',
        },
        timeout: 12000,
      }
    );

    if (response.data && (response.data.code === 0 || response.data.data)) {
      const data = response.data.data;
      const playRaw = data.play || '';
      const hdPlayRaw = data.hdplay || '';
      const wmPlayRaw = data.wmplay || '';
      const musicRaw = data.music || data.music_info?.play || '';

      const playUrl = playRaw ? (playRaw.startsWith('http') ? playRaw : `https://www.tikwm.com${playRaw}`) : '';
      const hdPlayUrl = hdPlayRaw ? (hdPlayRaw.startsWith('http') ? hdPlayRaw : `https://www.tikwm.com${hdPlayRaw}`) : playUrl;
      const wmPlayUrl = wmPlayRaw ? (wmPlayRaw.startsWith('http') ? wmPlayRaw : `https://www.tikwm.com${wmPlayRaw}`) : '';
      const musicUrl = musicRaw ? (musicRaw.startsWith('http') ? musicRaw : `https://www.tikwm.com${musicRaw}`) : '';

      const result = {
        id: String(data.id || Date.now()),
        title: data.title || 'TikTok Video',
        duration: Number(data.duration) || 0,
        cover: data.cover ? (data.cover.startsWith('http') ? data.cover : `https://www.tikwm.com${data.cover}`) : '',
        originCover: data.origin_cover ? (data.origin_cover.startsWith('http') ? data.origin_cover : `https://www.tikwm.com${data.origin_cover}`) : '',
        // Clean video URLs (MP4)
        playUrl: playUrl,
        hdPlayUrl: hdPlayUrl,
        wmPlayUrl: wmPlayUrl,
        // Audio (MP3)
        musicUrl: musicUrl,
        musicInfo: {
          title: data.music_info?.title || 'Original Sound',
          author: data.music_info?.author || data.author?.nickname || 'TikTok Creator',
          play: musicUrl,
          duration: Number(data.music_info?.duration || data.duration) || 0,
        },
        // Author info
        author: {
          id: String(data.author?.id || ''),
          username: data.author?.unique_id || 'tiktok_user',
          nickname: data.author?.nickname || 'TikTok Creator',
          avatar: data.author?.avatar ? (data.author.avatar.startsWith('http') ? data.author.avatar : `https://www.tikwm.com${data.author.avatar}`) : '',
        },
        // Stats
        stats: {
          plays: Number(data.play_count) || 0,
          likes: Number(data.digg_count) || 0,
          comments: Number(data.comment_count) || 0,
          shares: Number(data.share_count) || 0,
          downloads: Number(data.download_count) || 0,
        },
        // Images / Slides
        images: Array.isArray(data.images) ? data.images.map((img: string) => img.startsWith('http') ? img : `https://www.tikwm.com${img}`) : [],
        type: (Array.isArray(data.images) && data.images.length > 0) ? 'image' : 'video',
      };

      return res.json({ success: true, data: result });
    }
  } catch (err: any) {
    console.warn('[TikTok API] TikWM Post failed, trying fallback endpoints:', err.message);
  }

  // Provider 2: TikWM GET Endpoint Fallback
  try {
    const getRes = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://www.tikwm.com/',
      },
      timeout: 10000,
    });

    if (getRes.data && getRes.data.data) {
      const data = getRes.data.data;
      const playRaw = data.play || '';
      const hdPlayRaw = data.hdplay || '';
      const musicRaw = data.music || data.music_info?.play || '';

      const playUrl = playRaw ? (playRaw.startsWith('http') ? playRaw : `https://www.tikwm.com${playRaw}`) : '';
      const hdPlayUrl = hdPlayRaw ? (hdPlayRaw.startsWith('http') ? hdPlayRaw : `https://www.tikwm.com${hdPlayRaw}`) : playUrl;
      const musicUrl = musicRaw ? (musicRaw.startsWith('http') ? musicRaw : `https://www.tikwm.com${musicRaw}`) : '';

      const result = {
        id: String(data.id || Date.now()),
        title: data.title || 'TikTok Video',
        duration: Number(data.duration) || 0,
        cover: data.cover ? (data.cover.startsWith('http') ? data.cover : `https://www.tikwm.com${data.cover}`) : '',
        originCover: data.origin_cover ? (data.origin_cover.startsWith('http') ? data.origin_cover : `https://www.tikwm.com${data.origin_cover}`) : '',
        playUrl: playUrl,
        hdPlayUrl: hdPlayUrl,
        wmPlayUrl: data.wmplay ? (data.wmplay.startsWith('http') ? data.wmplay : `https://www.tikwm.com${data.wmplay}`) : '',
        musicUrl: musicUrl,
        musicInfo: {
          title: data.music_info?.title || 'Original Sound',
          author: data.music_info?.author || data.author?.nickname || 'TikTok Creator',
          play: musicUrl,
          duration: Number(data.music_info?.duration || data.duration) || 0,
        },
        author: {
          id: String(data.author?.id || ''),
          username: data.author?.unique_id || 'tiktok_user',
          nickname: data.author?.nickname || 'TikTok Creator',
          avatar: data.author?.avatar ? (data.author.avatar.startsWith('http') ? data.author.avatar : `https://www.tikwm.com${data.author.avatar}`) : '',
        },
        stats: {
          plays: Number(data.play_count) || 0,
          likes: Number(data.digg_count) || 0,
          comments: Number(data.comment_count) || 0,
          shares: Number(data.share_count) || 0,
          downloads: Number(data.download_count) || 0,
        },
        images: Array.isArray(data.images) ? data.images.map((img: string) => img.startsWith('http') ? img : `https://www.tikwm.com${img}`) : [],
        type: (Array.isArray(data.images) && data.images.length > 0) ? 'image' : 'video',
      };
      return res.json({ success: true, data: result });
    }
  } catch (err: any) {
    console.warn('[TikTok API] TikWM GET fallback failed:', err.message);
  }

  // Provider 3: SSSTik Public API Fallback
  try {
    const sssRes = await axios.post(
      'https://ssstik.io/abc?url=dl',
      new URLSearchParams({ id: url, locale: 'en', tt: '0' }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Referer': 'https://ssstik.io/en',
        },
        timeout: 10000,
      }
    );

    if (sssRes.data && typeof sssRes.data === 'string') {
      const $ = cheerio.load(sssRes.data);
      const playUrl = $('a.download_link.without_watermark').attr('href') || $('a.without_watermark').attr('href') || '';
      const hdPlayUrl = $('a.download_link.without_watermark_direct').attr('href') || playUrl;
      const musicUrl = $('a.download_link.music').attr('href') || '';
      const title = $('p.maintext').text().trim() || 'TikTok Video';
      const avatar = $('img.result_author').attr('src') || '';
      const nickname = $('h2').text().trim() || 'TikTok Creator';

      if (playUrl) {
        const result = {
          id: String(Date.now()),
          title: title,
          duration: 0,
          cover: avatar,
          originCover: avatar,
          playUrl: playUrl,
          hdPlayUrl: hdPlayUrl || playUrl,
          wmPlayUrl: '',
          musicUrl: musicUrl,
          musicInfo: {
            title: 'Original Sound',
            author: nickname,
            play: musicUrl,
            duration: 0,
          },
          author: {
            id: '',
            username: 'tiktok_user',
            nickname: nickname,
            avatar: avatar,
          },
          stats: { plays: 0, likes: 0, comments: 0, shares: 0, downloads: 0 },
          images: [],
          type: 'video',
        };
        return res.json({ success: true, data: result });
      }
    }
  } catch (err: any) {
    console.warn('[TikTok API] SSSTik fallback failed:', err.message);
  }

  return res.status(404).json({
    error: 'Could not fetch video. Please make sure the TikTok link is public, accessible, and not deleted.',
  });
});

// Proxy streaming download endpoint with robust header handling
app.get('/api/tiktok-proxy', async (req, res) => {
  const mediaUrl = req.query.url as string;
  let filename = (req.query.filename as string) || 'tiktok_no_watermark.mp4';

  if (!mediaUrl) {
    return res.status(400).send('Missing media url parameter');
  }

  // Clean filename for safety and ensure correct extension
  filename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const isAudio = filename.toLowerCase().endsWith('.mp3');
  const isImage = filename.toLowerCase().endsWith('.jpg') || filename.toLowerCase().endsWith('.jpeg') || filename.toLowerCase().endsWith('.png');
  const isVideo = !isAudio && !isImage;

  if (isVideo && !filename.toLowerCase().endsWith('.mp4')) {
    filename += '.mp4';
  }

  try {
    const response = await axios({
      method: 'GET',
      url: mediaUrl,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://www.tikwm.com/',
        'Accept': '*/*',
      },
      timeout: 30000,
    });

    const contentType = isAudio 
      ? 'audio/mpeg' 
      : isImage 
      ? 'image/jpeg' 
      : 'video/mp4';
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-cache');
    
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }

    response.data.pipe(res);
  } catch (err: any) {
    console.error('[TikTok Proxy Error]:', err.message);
    // If proxy stream fails, redirect directly to media URL
    res.redirect(mediaUrl);
  }
});

// Helper function to run yt-dlp safely for Instagram extraction
function runYtDlp(targetUrl: string, extraArgs: string[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    const binPath = path.join(process.cwd(), 'yt-dlp');
    if (!fs.existsSync(binPath) && !fs.existsSync('./yt-dlp')) {
      return reject(new Error('yt-dlp binary not available in environment'));
    }
    const executable = fs.existsSync(binPath) ? binPath : './yt-dlp';
    const args = ['-j', '--no-warnings', '--skip-download', ...extraArgs, targetUrl];
    execFile(executable, args, { timeout: 15000, maxBuffer: 15 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        return reject(new Error(stderr || err.message));
      }
      try {
        const lines = stdout.trim().split('\n').filter(Boolean);
        if (lines.length === 0) return reject(new Error('Empty output from extractor'));
        const parsed = JSON.parse(lines[0]);
        resolve(parsed);
      } catch (parseErr) {
        reject(parseErr);
      }
    });
  });
}

// API endpoint for Instagram Video & Reels Downloader Pro
app.post('/api/media-downloader-info', async (req, res) => {
  try {
    let { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(200).json({ success: false, error: 'Please provide a valid Instagram Reel or Video URL' });
    }

    url = url.trim();
    console.log(`[Instagram Downloader API] Fetching info for: ${url}`);

    const isInstagram = url.includes('instagram.com') || url.includes('instagr.am');

    if (!isInstagram) {
      return res.status(200).json({
        success: false,
        error: 'Please enter a valid Instagram link (e.g. instagram.com/reel/... or /p/...).',
      });
    }

    // ==================== INSTAGRAM EXTRACTION ENGINE ====================
    // Extract shortcode for unique ID
    const shortcodeMatch = url.match(/\/(?:reel|reels|p|tv)\/([a-zA-Z0-9_-]+)/);
    const shortcode = shortcodeMatch ? shortcodeMatch[1] : String(Date.now());
    const isReel = url.includes('/reel') || url.includes('/reels');

    let title = 'Instagram Reel Video';
    let authorName = 'Instagram Creator';
    let authorUsername = 'instagram_user';
    let cover = '';
    let playUrl = '';
    let audioUrl = '';
    let duration = 0;
    let likes = 0;
    let images: string[] = [];
    const videoStreams: Array<{ quality: string; label: string; format: string; url: string; size?: string; fps?: number }> = [];
    const audioStreams: Array<{ quality: string; label: string; format: string; url: string; size?: string }> = [];

    // Method 1: Primary Engine -> yt-dlp (when available)
    try {
      console.log(`[Instagram] Running yt-dlp for shortcode: ${shortcode}`);
      const igData = await runYtDlp(url);

      if (igData) {
        title = igData.title || igData.description || title;
        authorUsername = igData.uploader_id || igData.uploader || authorUsername;
        authorName = igData.uploader || authorUsername;
        cover = igData.thumbnail || cover;
        duration = Number(igData.duration) || duration;
        likes = Number(igData.like_count) || likes;

        // Check if carousel or multi-entries
        if (Array.isArray(igData.entries) && igData.entries.length > 0) {
          images = igData.entries.map((e: any) => e.thumbnail || e.url).filter(Boolean);
        }

        if (Array.isArray(igData.formats) && igData.formats.length > 0) {
          const availableFormats = igData.formats.filter((f: any) => f && f.url);

          // Filter for progressive formats containing BOTH crystal-clear video AND full audio
          const progressiveFormats = availableFormats.filter((f: any) => {
            const isVideoOnly = f.acodec === 'none' || (typeof f.format_id === 'string' && f.format_id.startsWith('dash-') && f.format_id.endsWith('v'));
            const isAudioOnly = f.vcodec === 'none' || (typeof f.format_id === 'string' && f.format_id.startsWith('dash-') && f.format_id.endsWith('a'));
            return !isVideoOnly && !isAudioOnly;
          });

          // Set primary playable stream with guaranteed sound
          if (progressiveFormats.length > 0) {
            playUrl = progressiveFormats[0].url;
          } else if (availableFormats.length > 0) {
            playUrl = availableFormats[0].url;
          }

          // Primary No-Watermark HD Stream (Full Video + Audio)
          const primaryStream = progressiveFormats[0] || availableFormats[0];
          if (primaryStream) {
            videoStreams.push({
              quality: 'HD MP4',
              label: 'Download Without Watermark (HD MP4)',
              format: 'mp4',
              url: primaryStream.url,
              size: primaryStream.filesize ? `${(primaryStream.filesize / (1024 * 1024)).toFixed(1)} MB` : undefined,
              fps: primaryStream.fps || 30
            });
          }

          // Secondary / Mirror Server Stream (Server 2)
          const mirrorStream = progressiveFormats.length > 1 
            ? progressiveFormats[1] 
            : (progressiveFormats[0] || availableFormats[1] || availableFormats[0]);
          if (mirrorStream && mirrorStream.url) {
            videoStreams.push({
              quality: 'Server 2 (Mirror)',
              label: 'Download Video (Server 2 - Fast Mirror)',
              format: 'mp4',
              url: mirrorStream.url,
              size: mirrorStream.filesize ? `${(mirrorStream.filesize / (1024 * 1024)).toFixed(1)} MB` : undefined,
              fps: mirrorStream.fps || 30
            });
          }

          // Audio Stream (Extracted MP3 / M4A)
          const audioFormat = availableFormats.find((f: any) => 
            (f.acodec && f.acodec !== 'none') || f.ext === 'm4a' || f.ext === 'mp3' || (typeof f.format_id === 'string' && f.format_id.endsWith('a'))
          ) || progressiveFormats[0] || availableFormats[0];

          if (audioFormat) {
            audioUrl = audioFormat.url;
            audioStreams.push({
              quality: '320kbps',
              label: 'Extracted Original Soundtrack (MP3 320kbps)',
              format: 'mp3',
              url: audioFormat.url,
              size: audioFormat.filesize ? `${(audioFormat.filesize / (1024 * 1024)).toFixed(1)} MB` : undefined
            });
          }
        }
      }
    } catch (ytErr: any) {
      // If yt-dlp says "There is no video in this post", it is a photo post or image carousel
      console.log('[Instagram Notice]:', ytErr.message);
    }

    // Method 2: High-Performance OpenGraph / Crawler Scraper (Handles Photos, Carousels & Fallbacks)
    if (!playUrl || !cover || images.length === 0) {
      const cleanUrl = url.split('?')[0].replace(/\/$/, '');
      const crawlerAgents = [
        'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        'Twitterbot/1.0',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
      ];

      for (const ua of crawlerAgents) {
        try {
          const pageRes = await axios.get(cleanUrl, {
            headers: {
              'User-Agent': ua,
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
            },
            timeout: 6000,
          });

          if (pageRes.data && typeof pageRes.data === 'string') {
            const $ = cheerio.load(pageRes.data);
            const ogImg = $('meta[property="og:image"]').attr('content');
            const ogTitle = $('meta[property="og:title"]').attr('content');
            const ogDesc = $('meta[property="og:description"]').attr('content');
            const ogVideo = $('meta[property="og:video"]').attr('content') || $('meta[property="og:video:secure_url"]').attr('content');

            if (ogImg && !cover) {
              cover = ogImg;
              if (!images.includes(ogImg)) images.push(ogImg);
            }

            if (ogVideo && !playUrl) {
              playUrl = ogVideo;
              if (videoStreams.length === 0) {
                videoStreams.push({
                  quality: 'HD MP4',
                  label: 'Download Without Watermark (HD MP4)',
                  format: 'mp4',
                  url: ogVideo,
                });
              }
            }

            if (ogTitle && (!title || title === 'Instagram Reel Video')) {
              if (ogTitle.includes(' on Instagram: ')) {
                const parts = ogTitle.split(' on Instagram: ');
                authorName = parts[0].trim();
                title = parts[1]?.replace(/^"|"$/g, '').trim() || ogTitle;
              } else {
                title = ogTitle;
              }
            }

            if (ogDesc) {
              const userMatch = ogDesc.match(/-\s*([a-zA-Z0-9_\.]+)\s+on\s+/i);
              if (userMatch && (!authorUsername || authorUsername === 'instagram_user')) {
                authorUsername = userMatch[1];
                authorName = authorName === 'Instagram Creator' ? userMatch[1] : authorName;
              }
              const likesMatch = ogDesc.match(/^([\d\.,KMkm]+)\s*likes?/i);
              if (likesMatch && !likes) {
                const rawL = likesMatch[1].toUpperCase();
                if (rawL.includes('K')) likes = parseFloat(rawL) * 1000;
                else if (rawL.includes('M')) likes = parseFloat(rawL) * 1000000;
                else likes = parseInt(rawL.replace(/,/g, '')) || 0;
              }
            }

            if (cover) break;
          }
        } catch (crawlerErr: any) {
          // Continue to next crawler agent if any
        }
      }
    }

    // Method 3: Fallback via Instagram Embed Captioned
    if (!cover || (!playUrl && images.length === 0)) {
      try {
        const cleanUrl = url.split('?')[0].replace(/\/$/, '');
        const pageRes = await axios.get(`${cleanUrl}/embed/captioned/`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
          timeout: 6000,
        });

        if (pageRes.data && typeof pageRes.data === 'string') {
          const $ = cheerio.load(pageRes.data);
          const imgSrc = $('img.EmbeddedMediaImage').attr('src') || $('img').first().attr('src');
          if (imgSrc && !cover) {
            cover = imgSrc;
            if (!images.includes(imgSrc)) images.push(imgSrc);
          }

          const videoSrc = $('video').attr('src');
          if (videoSrc && !playUrl) {
            playUrl = videoSrc;
            videoStreams.push({
              quality: 'HD MP4',
              label: 'Download Without Watermark (HD MP4)',
              format: 'mp4',
              url: videoSrc,
            });
          }

          const captionText = $('.Caption').text().trim();
          if (captionText && (!title || title === 'Instagram Reel Video')) title = captionText;

          const usernameText = $('.UsernameText').text().trim();
          if (usernameText && (!authorUsername || authorUsername === 'instagram_user')) {
            authorUsername = usernameText;
            authorName = usernameText;
          }
        }
      } catch (scrapeErr: any) {
        console.warn('[Instagram Scrape Notice]:', scrapeErr.message);
      }
    }

    // Method 4: Fallback via oEmbed
    if (!cover || !title || title === 'Instagram Reel Video') {
      try {
        const oembedRes = await axios.get(
          `https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}`,
          { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 4000 }
        );
        if (oembedRes.data) {
          title = oembedRes.data.title || title;
          authorName = oembedRes.data.author_name || authorName;
          authorUsername = oembedRes.data.author_name || authorUsername;
          if (oembedRes.data.thumbnail_url && !cover) {
            cover = oembedRes.data.thumbnail_url;
            if (!images.includes(cover)) images.push(cover);
          }
        }
      } catch (oembedErr: any) {
        console.warn('[Instagram oEmbed Notice]:', oembedErr.message);
      }
    }

    const hasVideo = !!playUrl || videoStreams.length > 0;
    const isPhotoOrCarousel = !hasVideo || images.length > 0;
    const subType = images.length > 1 ? 'carousel' : !hasVideo ? 'photo' : isReel ? 'reel' : 'video';

    // If it is a video post but no stream was found yet, fallback
    if (hasVideo && videoStreams.length === 0) {
      videoStreams.push({
        quality: 'HD MP4',
        label: 'Download Without Watermark (HD MP4)',
        format: 'mp4',
        url: playUrl || url,
      });
    }

    if (audioStreams.length === 0 && playUrl) {
      audioStreams.push({
        quality: '320kbps',
        label: 'Original Soundtrack (MP3 320kbps)',
        format: 'mp3',
        url: playUrl,
      });
    }

    const result = {
      platform: 'instagram',
      subType: subType,
      id: shortcode,
      originalUrl: url,
      title: title || (subType === 'photo' ? 'Instagram Photo Post' : 'Instagram Reel Video'),
      duration: duration,
      cover: cover || (images.length > 0 ? images[0] : ''),
      hqCover: cover || (images.length > 0 ? images[0] : ''),
      thumbnails: cover ? [{ label: 'HD Cover Poster', url: cover }] : [],
      author: {
        username: authorUsername,
        nickname: authorName,
        profileUrl: `https://www.instagram.com/${authorUsername}`,
      },
      stats: {
        views: 0,
        likes: likes || 0,
      },
      videoStreams: videoStreams,
      audioStreams: audioStreams,
      images: images.length > 0 ? images : (cover ? [cover] : []),
      primaryPlayUrl: playUrl || '',
      primaryAudioUrl: audioUrl || playUrl || '',
    };

    return res.json({ success: true, data: result });

    return res.json({ success: true, data: result });
  } catch (topLevelErr: any) {
    console.error('[Instagram Downloader Error]:', topLevelErr);
    return res.status(200).json({
      success: false,
      error: typeof topLevelErr.message === 'string' ? topLevelErr.message : 'Could not process this Instagram video. Please check that the post is public.'
    });
  }
});

// Universal streaming media proxy for Instagram Reels & Videos with support for range streaming & download attachment headers
app.get('/api/media-proxy', async (req, res) => {
  const mediaUrl = req.query.url as string;
  let filename = (req.query.filename as string) || 'video_download.mp4';
  const platform = (req.query.platform as string) || 'generic';
  const isPreview = req.query.preview === '1';

  if (!mediaUrl) {
    return res.status(400).send('Missing media URL parameter');
  }

  // Clean filename for safety and ensure correct extension
  filename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const isAudio = filename.toLowerCase().endsWith('.mp3') || filename.toLowerCase().endsWith('.m4a');
  const isImage = filename.toLowerCase().endsWith('.jpg') || filename.toLowerCase().endsWith('.jpeg') || filename.toLowerCase().endsWith('.png') || filename.toLowerCase().endsWith('.webp');
  const isVideo = !isAudio && !isImage;

  if (isVideo && !filename.toLowerCase().endsWith('.mp4')) {
    filename += '.mp4';
  }

  try {
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': '*/*',
    };

    if (req.headers.range) {
      headers['Range'] = req.headers.range;
    }

    if (platform === 'instagram' || mediaUrl.includes('cdninstagram') || mediaUrl.includes('fbcdn')) {
      headers['Referer'] = 'https://www.instagram.com/';
      headers['Origin'] = 'https://www.instagram.com';
    } else if (platform === 'youtube' || mediaUrl.includes('googlevideo.com') || mediaUrl.includes('ytimg.com')) {
      headers['Referer'] = 'https://www.youtube.com/';
      headers['Origin'] = 'https://www.youtube.com';
    }

    const response = await axios({
      method: 'GET',
      url: mediaUrl,
      responseType: 'stream',
      headers: headers,
      timeout: 35000,
      validateStatus: (status) => status < 400,
    });

    const contentType = isAudio 
      ? 'audio/mpeg' 
      : isImage 
      ? 'image/jpeg' 
      : 'video/mp4';

    if (isPreview) {
      res.setHeader('Content-Disposition', 'inline');
    } else {
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    }

    res.setHeader('Content-Type', response.headers['content-type'] || contentType);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=3600');

    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }
    if (response.headers['content-range']) {
      res.setHeader('Content-Range', response.headers['content-range']);
      res.status(206);
    }

    response.data.pipe(res);
  } catch (err: any) {
    console.error('[Media Proxy Error]:', err.message);
    if (!res.headersSent) {
      res.redirect(mediaUrl);
    }
  }
});

export default app;

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is listening on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Start the server only if we're not in a serverless environment (like Vercel)
// or if we're explicitly running in production mode locally
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  startServer();
}
