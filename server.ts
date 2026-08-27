import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
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
