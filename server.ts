import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
