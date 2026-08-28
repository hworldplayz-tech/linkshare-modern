// Advanced SEO Helper with Dynamic Real-Time Date Generation, Human Search Titles, Schema JSON-LD, 50+ Search Hashtags & Backlinks Strategy

export interface FormattedDateInfo {
  formattedDayMonthYear: string; // e.g. "23 Aug, 2026"
  formattedMonthYear: string;    // e.g. "August 2026"
  formattedFullDate: string;     // e.g. "August 23, 2026"
  isoDate: string;               // e.g. "2026-08-23"
  year: number;                  // 2026
}

export function getCurrentDateInfo(): FormattedDateInfo {
  const now = new Date();
  const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthsFull = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const day = now.getDate();
  const monthShort = monthsShort[now.getMonth()];
  const monthFull = monthsFull[now.getMonth()];
  const year = now.getFullYear();

  return {
    formattedDayMonthYear: `${day} ${monthShort}, ${year}`,
    formattedMonthYear: `${monthFull} ${year}`,
    formattedFullDate: `${monthFull} ${day}, ${year}`,
    isoDate: now.toISOString().split('T')[0],
    year
  };
}

// 50+ High-Search Intent Curated Hashtags
export const SEO_HASHTAGS = [
  { tag: '#AIContentDetector', label: 'AI Content Detector', category: 'tools' },
  { tag: '#PlagiarismCheckerFree', label: 'Free Plagiarism Checker', category: 'tools' },
  { tag: '#QRCodeGeneratorOnline', label: 'Online QR Code Generator', category: 'tools' },
  { tag: '#WhatsAppGroupLinks2026', label: 'WhatsApp Groups 2026', category: 'groups' },
  { tag: '#LatestTechTools', label: 'Latest Tech Tools', category: 'tools' },
  { tag: '#ShortURLGenerator', label: 'Short URL Generator', category: 'tools' },
  { tag: '#StylishFontGenerator', label: 'Stylish Text Generator', category: 'tools' },
  { tag: '#FreeTextRepeater', label: 'Text Repeater Online', category: 'tools' },
  { tag: '#OnlineQRCodeScanner', label: 'QR Code Scanner', category: 'tools' },
  { tag: '#FreePDFEditorOnline', label: 'PDF Editor Online', category: 'tools' },
  { tag: '#FakeWhatsAppChat', label: 'Fake WhatsApp Screenshot', category: 'tools' },
  { tag: '#WhatsAppReadMorePrank', label: 'WhatsApp Read More Prank', category: 'tools' },
  { tag: '#DirectWhatsAppLink', label: 'WhatsApp Link Generator', category: 'tools' },
  { tag: '#WhatsAppDPBorderMaker', label: 'WhatsApp DP Border Maker', category: 'tools' },
  { tag: '#GroupNamesGenerator', label: 'WhatsApp Group Names', category: 'tools' },
  { tag: '#WhatsAppTextFormatter', label: 'Status Text Formatter', category: 'tools' },
  { tag: '#ImageToPDFMerger', label: 'Image to PDF Merger', category: 'tools' },
  { tag: '#M3UPlaylistViewer', label: 'M3U IPTV Playlist Reader', category: 'tools' },
  { tag: '#AIStatusCaptions', label: 'AI WhatsApp Status Generator', category: 'tools' },
  { tag: '#SourceCodeViewer', label: 'Website Source Code Viewer', category: 'tools' },
  { tag: '#FreeImageEditorOnline', label: 'Image Editor Online', category: 'tools' },
  { tag: '#IframeGenerator', label: 'HTML iFrame Code Generator', category: 'tools' },
  { tag: '#ResponsiveIframeMaker', label: 'Responsive iFrame Embedder', category: 'tools' },
  { tag: '#TrendingWhatsAppLinks', label: 'Trending Groups', category: 'groups' },
  { tag: '#ActiveCommunityLinks', label: 'Active Communities', category: 'groups' },
  { tag: '#TechTutorials2026', label: 'Tech Tutorials', category: 'blogs' },
  { tag: '#DeveloperUtilities', label: 'Developer Utilities', category: 'tools' },
  { tag: '#FastURLShortener', label: 'Fast URL Shortener', category: 'tools' },
  { tag: '#WordCounterOnline', label: 'Word & Character Counter', category: 'tools' },
  { tag: '#SEOAuditTools', label: 'SEO Audit Tools', category: 'tools' },
  { tag: '#VerifiedInviteLinks', label: 'Verified Invite Links', category: 'groups' },
  { tag: '#CryptoWhatsAppGroups', label: 'Crypto Groups', category: 'groups' },
  { tag: '#GamingWhatsAppGroups', label: 'Gaming WhatsApp Groups', category: 'groups' },
  { tag: '#EducationGroupsLinks', label: 'Education WhatsApp Groups', category: 'groups' },
  { tag: '#OnlineProductivity', label: 'Online Productivity', category: 'tools' },
  { tag: '#NoSignupUtilities', label: '100% Free Tools No Signup', category: 'tools' },
  { tag: '#FastBrowserTools', label: 'Fast In-Browser Utilities', category: 'tools' },
  { tag: '#FreeOnlineTools2026', label: 'Free Online Tools 2026', category: 'tools' },
  { tag: '#WhatsAppTipsTricks', label: 'WhatsApp Tips & Tricks', category: 'blogs' },
  { tag: '#SocialMediaGenerators', label: 'Social Media Generators', category: 'tools' },
  { tag: '#CleanLinkShare', label: 'LinkShare Platform', category: 'platform' },
  { tag: '#WebmasterUtilities', label: 'Webmaster Utilities', category: 'tools' },
  { tag: '#PDFConverterFree', label: 'Free PDF Converter', category: 'tools' },
  { tag: '#TextFormattingTools', label: 'Text Formatting Tools', category: 'tools' },
  { tag: '#InstantResultTools', label: 'Instant Result Tools', category: 'tools' },
  { tag: '#SafeGroupSharing', label: 'Safe Group Sharing', category: 'groups' },
  { tag: '#GlobalChatLinks', label: 'Global Chat Links', category: 'groups' },
  { tag: '#MobileResponsiveTools', label: 'Mobile Responsive Tools', category: 'tools' },
  { tag: '#HighAccuracyAIDetector', label: 'High Accuracy AI Detector', category: 'tools' },
  { tag: '#BatchImageEditor', label: 'Online Image Editor', category: 'tools' },
  { tag: '#TikTokDownloader', label: 'TikTok Video Downloader', category: 'tools' },
  { tag: '#TikTokNoWatermark', label: 'TikTok Without Watermark', category: 'tools' },
  { tag: '#InstagramDownloader', label: 'Instagram Video Downloader', category: 'tools' },
  { tag: '#InstagramReelsDownloader', label: 'Instagram Reels MP4 & MP3 Downloader', category: 'tools' },
  { tag: '#DailyUpdatedTools', label: 'Daily Updated Tools', category: 'tools' },
  { tag: '#BestFreeTechUtilities', label: 'Best Free Tech Utilities', category: 'tools' },
  { tag: '#TopRankedWebTools', label: 'Top Ranked Web Tools', category: 'tools' },
  { tag: '#ViralStatusQuotes', label: 'Viral Status Captions', category: 'tools' }
];

// Rich Human Title Templates for Tools (30+ word equivalent SEO impact, natural search phrasing)
export const TOOL_SEO_METAS: Record<string, { titlePrefix: string; titleSuffix: string; searchKeywords: string; description: string }> = {
  'ai-detector': {
    titlePrefix: 'Latest [DATE] AI Content Detector: 100% Free ChatGPT & GPT-4 Humanize Text Checker',
    titleSuffix: 'Instant Accurate Detection Without Signup',
    searchKeywords: 'ai content detector, check chatgpt text, gpt4 detector free, human vs ai checker, detect ai writing, latest ai detector',
    description: 'Accurately detect ChatGPT, GPT-4, Gemini, and Claude generated text. 100% free online AI detector with sentence-by-sentence analysis, probability scoring, and instant results.'
  },
  'plagiarism-checker': {
    titlePrefix: 'Latest [DATE] Plagiarism Checker: 100% Free Online Originality & Duplicate Content Scanner',
    titleSuffix: 'Deep Web Scan for Articles & Essays',
    searchKeywords: 'plagiarism checker free, duplicate content scanner, check plagiarism online, essay checker, originality report, copyright checker',
    description: 'Check content for plagiarism and duplicate text with advanced web scanning. Instant percentage analysis, similarity highlights, and originality reporting for writers and students.'
  },
  'qr-code-generator': {
    titlePrefix: 'Latest [DATE] QR Code Generator: Create Custom Colored QR Codes for URLs, Wi-Fi & WhatsApp',
    titleSuffix: 'High Resolution PNG Download Free',
    searchKeywords: 'qr code generator, custom qr code, free qr maker, generate qr for wifi, whatsapp qr code, vector qr code',
    description: 'Generate high-quality custom QR codes with custom colors, logos, and frames. Perfect for website links, Wi-Fi passwords, WhatsApp numbers, vCards, and social profiles.'
  },
  'word-counter': {
    titlePrefix: 'Latest [DATE] Word Counter & Character Counter: Real-Time Reading Time & Text Stats Calculator',
    titleSuffix: 'Instant Word Density & Sentence Counter',
    searchKeywords: 'word counter, character counter, reading time calculator, text analyzer, count words online, sentence count tool',
    description: 'Free online word counter and character counter with instant calculation of words, characters, sentences, paragraphs, reading time, and keyword density.'
  },
  'short-url-generator': {
    titlePrefix: 'Latest [DATE] Short URL Generator: Fast Clean Link Shortener with Instant QR Code & Analytics',
    titleSuffix: 'Shorten Long Links Instantly',
    searchKeywords: 'short url generator, link shortener free, create short link, url tracker, custom short link, tiny link generator',
    description: 'Transform long messy URLs into clean, fast, shareable short links with instant redirect speed and zero expiration.'
  },
  'stylish-text': {
    titlePrefix: 'Latest [DATE] Stylish Text Generator: 100+ Cool Aesthetic Fonts for WhatsApp, Instagram & Bio',
    titleSuffix: 'Copy & Paste Fancy Text Instantly',
    searchKeywords: 'stylish text generator, fancy font copy paste, aesthetic text converter, whatsapp stylish font, instagram bio font, cool letters',
    description: 'Convert ordinary text into 100+ cool, stylish, and fancy Unicode fonts. Easily copy and paste to WhatsApp status, Instagram bio, Twitter, and TikTok.'
  },
  'text-repeater': {
    titlePrefix: 'Latest [DATE] Text Repeater Online: Repeat Any Text 10,000 Times in 1 Click for WhatsApp',
    titleSuffix: 'Instant Line Break & Space Repeater',
    searchKeywords: 'text repeater online, repeat text 10000 times, whatsapp text repeater, repeat words copy paste, text spammer generator, instant repeater',
    description: 'Repeat words, emojis, or sentences up to 10,000 times instantly with optional newlines, commas, and spaces. One-click copy for WhatsApp messages.'
  },
  'qr-scanner': {
    titlePrefix: 'Latest [DATE] QR Code Scanner Online: Scan QR Codes via Web Camera or Image Upload Instantly',
    titleSuffix: 'Fast Browser Decoder No App Needed',
    searchKeywords: 'qr code scanner online, scan qr from image, web camera qr reader, barcode scanner browser, decode qr code fast',
    description: 'Scan and decode any QR code directly in your browser using your mobile/laptop camera or by uploading an image. Fast, secure, and zero installation.'
  },
  'pdf-editor': {
    titlePrefix: 'Latest [DATE] Free Online PDF Editor: Add Text, Draw, Insert Signatures & Export High-Quality PDF',
    titleSuffix: '100% Private In-Browser PDF Studio',
    searchKeywords: 'pdf editor online free, edit pdf browser, sign pdf online, draw on pdf, add text to pdf, free pdf annotator',
    description: 'Edit PDF documents directly in your web browser. Add text, insert images, draw annotations, sign contracts, and export clean high-resolution PDFs with zero watermark.'
  },
  'fake-whatsapp-screenshot': {
    titlePrefix: 'Latest [DATE] Fake WhatsApp Chat Generator: Realistic Prank Conversation Screenshot Maker',
    titleSuffix: 'Custom Battery, Time & Verified Badge',
    searchKeywords: 'fake whatsapp screenshot generator, fake chat maker, whatsapp prank screenshot, realistic chat generator, custom chat mockup',
    description: 'Create realistic fake WhatsApp conversation screenshots for pranks, memes, and social media with custom profiles, timestamps, blue double ticks, and battery status.'
  },
  'whatsapp-read-more': {
    titlePrefix: 'Latest [DATE] WhatsApp Read More Prank Generator: Create Hidden Punchlines & Spoiler Messages',
    titleSuffix: 'Instant Copy for WhatsApp Groups',
    searchKeywords: 'whatsapp read more generator, read more prank message, spoiler message generator, whatsapp prank copy paste, hidden text generator',
    description: 'Generate viral WhatsApp prank messages with a clickable "Read More..." expand button to hide punchlines, spoilers, or surprise quotes.'
  },
  'whatsapp-link-generator': {
    titlePrefix: 'Latest [DATE] WhatsApp Link Generator with Pre-filled Message: Direct Chat Link & QR Code Creator',
    titleSuffix: 'wa.me Link Creator Free',
    searchKeywords: 'whatsapp link generator, create direct whatsapp link, wa me link with message, whatsapp business link maker, chat link generator',
    description: 'Create customized direct WhatsApp click-to-chat links with pre-filled greeting messages and instant QR codes for customer support, websites, and bio links.'
  },
  'whatsapp-dp-border': {
    titlePrefix: 'Latest [DATE] WhatsApp DP Border Maker: Create Professional Profile Picture Rings & Frames',
    titleSuffix: 'HD Gradient & Neon Profile Frames',
    searchKeywords: 'whatsapp dp border maker, profile picture border, dp frame generator, gradient profile ring, round avatar border, neon dp ring',
    description: 'Make your WhatsApp and Instagram profile picture stand out with eye-catching gradient borders, neon rings, badges, and circular frames.'
  },
  'whatsapp-group-name-generator': {
    titlePrefix: 'Latest [DATE] WhatsApp Group Name Generator: 5,000+ Funny, Cool, Tech & Family Group Ideas',
    titleSuffix: 'Instant Category Filter & One-Click Copy',
    searchKeywords: 'whatsapp group names generator, funny group names, cool whatsapp group names, tech group ideas, best group titles 2026',
    description: 'Discover thousands of creative, funny, professional, and stylish group name ideas for WhatsApp, Telegram, and Discord across 15+ curated categories.'
  },
  'whatsapp-status-formatter': {
    titlePrefix: 'Latest [DATE] WhatsApp Status Text Formatter: Bold, Italic, Strikethrough & Monospace Converter',
    titleSuffix: 'Instant Text Formatting Tool',
    searchKeywords: 'whatsapp text formatter, bold italic whatsapp generator, monospace text converter, strikethrough text maker, format status font',
    description: 'Effortlessly format text with bold, italic, strikethrough, monospace, and uppercase styles ready to paste into WhatsApp status updates and chats.'
  },
  'image-pdf-merger': {
    titlePrefix: 'Latest [DATE] Image to PDF & PDF Merger: Convert Photos to PDF & Combine Multiple Files Free',
    titleSuffix: 'Drag & Drop Page Reordering',
    searchKeywords: 'image to pdf converter, merge pdf files online, combine pdf documents, jpg to pdf free, merge multiple pdfs, secure pdf merger',
    description: 'Convert JPG, PNG, and WebP images to PDF or merge multiple PDF documents into a single organized file with instant drag-and-drop page sorting.'
  },
  'm3u-playlist-viewer': {
    titlePrefix: 'Latest [DATE] M3U Playlist Viewer & IPTV Stream Analyzer: Parse, Search & Test Channel Streams',
    titleSuffix: 'Web-Based M3U8 Player & Channel Sorter',
    searchKeywords: 'm3u playlist viewer, iptv m3u parser, test m3u stream online, m3u8 player online, parse iptv channels, extract m3u links',
    description: 'Analyze, filter, and extract channel streams from M3U and M3U8 IPTV playlists by country, genre, or quality. Built-in instant channel search.'
  },
  'whatsapp-caption-generator': {
    titlePrefix: 'Latest [DATE] AI WhatsApp Status Caption Generator: Trendy, Deep, Funny & Attitude Bio Quotes',
    titleSuffix: 'One-Click Copy Ready Captions',
    searchKeywords: 'whatsapp status caption generator, attitude captions, funny whatsapp quotes, deep quotes status, bio captions 2026, viral captions',
    description: 'Generate high-impact, trendy, humorous, romantic, and motivational captions for your WhatsApp status, Instagram reels, and social stories.'
  },
  'source-code-viewer': {
    titlePrefix: 'Latest [DATE] Website Source Code Viewer: View, Inspect & Extract HTML, CSS, JS from Any URL',
    titleSuffix: 'Mobile Web Inspector & Code Beautifier',
    searchKeywords: 'website source code viewer, inspect element mobile, view page source online, html code viewer, extract website css js, web source reader',
    description: 'Inspect and analyze the raw HTML, CSS, and JavaScript source code of any public website with syntax highlighting, search, and formatting tools.'
  },
  'image-editor': {
    titlePrefix: 'Latest [DATE] Free Online Image Editor: Crop, Resize, Add Text, Apply Filters & Draw on Photos',
    titleSuffix: 'No Download In-Browser Photo Studio',
    searchKeywords: 'image editor online free, photo editor browser, crop resize image, photo filters online, draw on image free, quick photo enhancer',
    description: 'Full-featured online photo editor to crop, resize, rotate, draw annotations, add text overlays, and apply color filters with instant HD PNG/JPG download.'
  },
  'iframe-generator': {
    titlePrefix: 'Latest [DATE] HTML iFrame Code Generator: Create Responsive Embeds, Custom Borders & Live Preview',
    titleSuffix: '100% Free HTML5 iFrame Maker with Security Controls',
    searchKeywords: 'iframe generator, html iframe maker, responsive iframe generator, generate iframe code, custom iframe border, embed code generator, iframe sandbox builder 2026',
    description: 'Easily generate responsive, customizable HTML iframe embed codes with real-time live preview, custom borders, aspect ratios, scrollbar controls, and sandbox security settings.'
  },
  'tiktok-downloader': {
    titlePrefix: 'Latest [DATE] TikTok Video Downloader: 100% Free HD MP4 & MP3 Download Without Watermark',
    titleSuffix: 'Save TikTok Videos, Sounds & Photos on Android, iPhone, PC',
    searchKeywords: 'tiktok video downloader, download tiktok without watermark, tiktok no watermark, save tiktok mp4, tiktok mp3 download, tiktok photo downloader, snaptik alternative, sss tiktok download free',
    description: 'Download TikTok videos in HD quality without watermark for free. Fast online TikTok to MP4 converter, MP3 audio extractor, and photo slideshow saver with direct 1-click download.'
  },
  'image-compressor': {
    titlePrefix: 'Latest [DATE] Image Compressor & Resizer Pro: Batch Compress JPG, PNG, WebP with Split Slider',
    titleSuffix: 'Target KB Pro, Zero Loss In-Browser Shrinker & ZIP Export',
    searchKeywords: 'image compressor, compress image under 100kb, compress image 50kb, bulk image resizer, webp converter, passport photo compressor, shrink photo size, online photo compressor without losing quality, batch image zip',
    description: 'Batch compress and resize JPG, PNG, WebP images online with real-time before/after split slider, target KB limits (50KB/100KB for visa/forms), dimensions resizer, EXIF cleaner, and 100% private browser processing.'
  },
  'instagram-reels-downloader': {
    titlePrefix: 'Latest [DATE] Instagram Video & Reels Downloader Pro: 1080p Full HD MP4 & 320kbps MP3',
    titleSuffix: 'Save Instagram Reels, Videos, Carousels & Audio Without Watermark Free',
    searchKeywords: 'instagram video downloader, instagram reels downloader, download reels without watermark, save instagram reel, instagram mp3 download, ig reel audio download, instagram carousel downloader, download ig video 1080p free 2026',
    description: 'Download Instagram Reels, Videos, Carousels, and original MP3 audio in 1080p Full HD quality without watermark for free. Fast online Instagram downloader for iPhone, Android, and PC.'
  },
  'instagram-downloader': {
    titlePrefix: 'Latest [DATE] Instagram Video & Reels Downloader Pro: 1080p Full HD MP4 & 320kbps MP3',
    titleSuffix: 'Save Instagram Reels, Videos, Carousels & Audio Without Watermark Free',
    searchKeywords: 'instagram video downloader, instagram reels downloader, download reels without watermark, save instagram reel, instagram mp3 download, ig reel audio download, instagram carousel downloader, download ig video 1080p free 2026',
    description: 'Download Instagram Reels, Videos, Carousels, and original MP3 audio in 1080p Full HD quality without watermark for free. Fast online Instagram downloader for iPhone, Android, and PC.'
  },
  'youtube-instagram-reels-downloader': {
    titlePrefix: 'Latest [DATE] Instagram Video & Reels Downloader Pro: 1080p Full HD MP4 & 320kbps MP3',
    titleSuffix: 'Save Instagram Reels, Videos, Carousels & Audio Without Watermark Free',
    searchKeywords: 'instagram video downloader, instagram reels downloader, download reels without watermark, save instagram reel, instagram mp3 download, ig reel audio download, instagram carousel downloader, download ig video 1080p free 2026',
    description: 'Download Instagram Reels, Videos, Carousels, and original MP3 audio in 1080p Full HD quality without watermark for free. Fast online Instagram downloader for iPhone, Android, and PC.'
  },
  'youtube-instagram-downloader': {
    titlePrefix: 'Latest [DATE] Instagram Video & Reels Downloader Pro: 1080p Full HD MP4 & 320kbps MP3',
    titleSuffix: 'Save Instagram Reels, Videos, Carousels & Audio Without Watermark Free',
    searchKeywords: 'instagram video downloader, instagram reels downloader, download reels without watermark, save instagram reel, instagram mp3 download, ig reel audio download, instagram carousel downloader, download ig video 1080p free 2026',
    description: 'Download Instagram Reels, Videos, Carousels, and original MP3 audio in 1080p Full HD quality without watermark for free. Fast online Instagram downloader for iPhone, Android, and PC.'
  }
};

// Generate Full SEO Title with Today's Date
export function generateSeoTitle(slugOrKey: string, customTitle?: string): string {
  const { formattedDayMonthYear } = getCurrentDateInfo();
  
  if (TOOL_SEO_METAS[slugOrKey]) {
    const meta = TOOL_SEO_METAS[slugOrKey];
    const prefix = meta.titlePrefix.replace('[DATE]', formattedDayMonthYear);
    return `${prefix} | ${meta.titleSuffix}`;
  }

  if (customTitle) {
    return `Latest ${formattedDayMonthYear}: ${customTitle} | Free Tech Tools & Verified Links Directory`;
  }

  return `Latest ${formattedDayMonthYear}: Free Tech Tools, Online Utilities & Verified WhatsApp Group Links`;
}

// Generate Full SEO Description
export function generateSeoDescription(slugOrKey: string, fallbackDesc?: string): string {
  const { formattedMonthYear } = getCurrentDateInfo();
  if (TOOL_SEO_METAS[slugOrKey]) {
    return `${TOOL_SEO_METAS[slugOrKey].description} Updated for ${formattedMonthYear} with latest features and 100% free access.`;
  }
  if (fallbackDesc) {
    return `${fallbackDesc} - Free, fast, and verified active online tool updated for ${formattedMonthYear}.`;
  }
  return `Discover 20+ free high-speed tech tools, generators, calculators, and verified WhatsApp group links updated daily for ${formattedMonthYear}.`;
}

// Generate Structured JSON-LD Data for Google Search Rich Snippets
export function generateSoftwareSchema(toolId: string, title: string, description: string, url: string) {
  const { isoDate } = getCurrentDateInfo();
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': title,
    'operatingSystem': 'Any',
    'applicationCategory': 'UtilitiesApplication',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.9',
      'ratingCount': '1480',
      'bestRating': '5',
      'worstRating': '1'
    },
    'dateModified': isoDate,
    'description': description,
    'url': url
  };
}

export function generateArticleSchema(title: string, description: string, url: string, imageUrl?: string) {
  const { isoDate } = getCurrentDateInfo();
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': title,
    'description': description,
    'image': imageUrl || 'https://ai.google.dev/static/site-assets/images/share-ais-513315318.png',
    'datePublished': '2026-01-01',
    'dateModified': isoDate,
    'author': {
      '@type': 'Person',
      'name': 'LinkShare Editorial Team'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'LinkShare',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://ai.google.dev/static/site-assets/images/share-ais-513315318.png'
      }
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': url
    }
  };
}
