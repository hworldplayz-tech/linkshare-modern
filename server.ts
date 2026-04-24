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
