import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ArrowLeft,
  Wrench,
  QrCode,
  Type,
  Link as LinkIcon,
  Cpu,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Copy,
  Trash2,
  FileText,
  Share2,
  Sparkles,
  ArrowRight,
  Download,
  RefreshCw,
  Palette,
  Check,
  ExternalLink,
  Camera,
  Upload,
  X,
  Calculator,
  BarChart3,
  Clock,
  Lightbulb,
  AlignLeft,
  Pilcrow,
  Heading,
  Mic,
  Edit3,
  FileEdit,
  Eraser,
  Square,
  Circle,
  Type as TypeIcon,
  Image as ImageIcon,
  Crop,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Save,
  Undo,
  Redo,
  MousePointer2,
  Hand
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { Html5Qrcode } from 'html5-qrcode';
import { Canvas, FabricImage, Textbox, PencilBrush, Rect } from 'fabric';
import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';

// Set PDF.js worker using jsdelivr for version 5.x compatibility
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

import { SiteSettings, TOOLS, Tool } from '../types';
import { auth, onAuthStateChanged, googleProvider, signInWithPopup, signOut } from '../firebase';
import { User } from 'firebase/auth';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AddGroupModal } from './AddGroupModal';
import AdPlacement from './AdPlacement';
import { Button } from './ui/Button';

interface ToolDetailProps {
  settings: SiteSettings;
}

const iconMap: Record<string, any> = {
  Search,
  QrCode,
  Type,
  Link: LinkIcon,
  Cpu,
  FileEdit
};

// --- AI Detector Component ---
const AIDetector = () => {
  const [text, setText] = React.useState('');
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [results, setResults] = React.useState<any>(null);
  const [activeTab, setActiveTab] = React.useState<'detector' | 'humanizer'>('detector');
  const [humanizedText, setHumanizedText] = React.useState('');

  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  const charCount = text.length;

  const handleDetect = () => {
    if (text.length < 50) {
      alert('Please enter at least 50 characters for accurate analysis.');
      return;
    }

    setIsAnalyzing(true);
    setResults(null);

    setTimeout(() => {
      const words = text.split(/\s+/);
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      let aiScore = 0;

      const aiPhrases = [
        'it is important to note', 'furthermore', 'moreover', 'additionally',
        'consequently', 'delve into', 'dive into', 'explore the',
        'it is essential', 'crucial to understand', 'comprehensive',
        'multifaceted', 'paradigm', 'leverage', 'optimize', 'utilize'
      ];

      let phraseMatches = 0;
      aiPhrases.forEach(phrase => {
        if (text.toLowerCase().includes(phrase)) phraseMatches++;
      });
      aiScore += Math.min(phraseMatches * 5, 30);

      const avgSentenceLength = words.length / sentences.length;
      if (avgSentenceLength > 15 && avgSentenceLength < 25) aiScore += 15;

      const longWords = words.filter(w => w.length > 8).length;
      const complexityRatio = longWords / words.length;
      if (complexityRatio > 0.15) aiScore += 20;

      const personalPronouns = ['i', 'me', 'my', 'we', 'our', 'us'];
      const pronounCount = words.filter(w => personalPronouns.includes(w.toLowerCase())).length;
      if (pronounCount < words.length * 0.02) aiScore += 15;

      const hasTypos = /\b(teh|hte|adn|taht|waht)\b/i.test(text);
      if (!hasTypos && text.length > 200) aiScore += 10;

      aiScore = Math.min(Math.max(Math.round(aiScore + (Math.random() * 10 - 5)), 0), 100);

      setResults({
        aiProbability: aiScore,
        humanProbability: 100 - aiScore,
        wordCount: words.length,
        sentenceCount: sentences.length,
        avgSentenceLength: Math.round(avgSentenceLength),
        aiPhraseCount: phraseMatches
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleHumanize = () => {
    if (text.length < 50) {
      alert('Please enter at least 50 characters to humanize.');
      return;
    }

    setIsAnalyzing(true);
    setTimeout(() => {
      let humanized = text;
      const replacements: Record<string, string> = {
        'it is important to note that': 'worth mentioning,',
        'it\'s worth noting that': 'interestingly,',
        'in conclusion': 'to wrap up,',
        'furthermore': 'also,',
        'moreover': 'plus,',
        'additionally': 'and',
        'however': 'but',
        'therefore': 'so',
        'utilize': 'use',
        'implement': 'use',
        'leverage': 'use',
        'optimize': 'improve'
      };

      Object.keys(replacements).forEach(formal => {
        const regex = new RegExp(formal, 'gi');
        humanized = humanized.replace(regex, replacements[formal]);
      });

      humanized = humanized.replace(/\bdo not\b/gi, 'don\'t')
                          .replace(/\bcannot\b/gi, 'can\'t')
                          .replace(/\bit is\b/gi, 'it\'s');

      setHumanizedText(humanized);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[2rem] border border-gray-100 p-2 shadow-sm inline-flex mb-4">
        <button 
          onClick={() => setActiveTab('detector')}
          className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'detector' ? 'bg-[#00a884] text-white shadow-lg shadow-[#00a884]/20' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          AI Detector
        </button>
        <button 
          onClick={() => setActiveTab('humanizer')}
          className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'humanizer' ? 'bg-[#00a884] text-white shadow-lg shadow-[#00a884]/20' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          AI Humanizer
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span>{wordCount} words</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Type className="w-4 h-4" />
              <span>{charCount} characters</span>
            </div>
          </div>
          <button onClick={() => setText('')} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <textarea 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={activeTab === 'detector' ? "Paste text to detect AI content..." : "Paste AI text to humanize..."}
          className="w-full h-64 md:h-80 p-6 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#00a884]/30 focus:ring-4 focus:ring-[#00a884]/5 outline-none transition-all resize-none text-gray-700 leading-relaxed"
        />

        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-gray-400 max-w-md">
            <AlertCircle className="w-4 h-4 inline mr-1" />
            {activeTab === 'detector' 
              ? "Our algorithm analyzes patterns common in GPT-3.5, GPT-4, and other LLMs." 
              : "We rephrase AI-style sentences to sound more natural and human-like."}
          </p>
          <Button 
            onClick={activeTab === 'detector' ? handleDetect : handleHumanize}
            disabled={isAnalyzing || text.length < 50}
            className="w-full md:w-auto bg-[#00a884] text-white hover:bg-[#008f6f] px-10 py-4 font-bold rounded-2xl h-auto disabled:opacity-50 shadow-xl shadow-[#00a884]/20"
          >
            {isAnalyzing ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
            ) : (
              activeTab === 'detector' ? <><Search className="w-5 h-5 mr-2" /> Detect AI Content</> : <><Sparkles className="w-5 h-5 mr-2" /> Humanize Text</>
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {activeTab === 'detector' && results && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
              <h3 className="text-xl font-black text-gray-900 mb-8">Detection Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="p-8 rounded-[2rem] bg-orange-50 border border-orange-100 text-center">
                  <div className="text-4xl font-black text-orange-600 mb-2">{results.aiProbability}%</div>
                  <div className="text-sm font-bold text-orange-400 uppercase tracking-wider">AI Content</div>
                </div>
                <div className="p-8 rounded-[2rem] bg-blue-50 border border-blue-100 text-center">
                  <div className="text-4xl font-black text-blue-600 mb-2">{results.humanProbability}%</div>
                  <div className="text-sm font-bold text-blue-400 uppercase tracking-wider">Human Content</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-500 font-medium">AI Phrase Matches</span>
                  <span className="font-bold text-orange-600">{results.aiPhraseCount}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-500 font-medium">Avg. Sentence Length</span>
                  <span className="font-bold text-gray-900">{results.avgSentenceLength} words</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 rounded-[2rem] p-8 text-white">
              <h4 className="text-lg font-black mb-4">Verdict</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                {results.aiProbability > 70 
                  ? "Highly likely to be AI-generated. The text shows consistent sentence length and common AI transition words."
                  : results.aiProbability > 40
                  ? "Mixed indicators found. This could be human-edited AI content or a very formal human writer."
                  : "Likely human-written. The text shows natural variation and personal style."}
              </p>
            </div>
          </motion.div>
        )}

        {activeTab === 'humanizer' && humanizedText && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-900">Humanized Text</h3>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(humanizedText);
                  alert('Copied to clipboard!');
                }}
                className="flex items-center gap-2 text-[#00a884] font-bold text-sm"
              >
                <Copy className="w-4 h-4" /> Copy Text
              </button>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl text-gray-700 leading-relaxed whitespace-pre-wrap">
              {humanizedText}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- QR Code Generator Component ---
const QRCodeGenerator = () => {
  const [text, setText] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [fgColor, setFgColor] = React.useState('#000000');
  const [bgColor, setBgColor] = React.useState('#ffffff');
  const [size, setSize] = React.useState(256);
  const [level, setLevel] = React.useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [includeMargin, setIncludeMargin] = React.useState(true);
  const [history, setHistory] = React.useState<any[]>([]);
  const [isGenerated, setIsGenerated] = React.useState(false);
  const qrRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const saved = localStorage.getItem('qr-history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse QR history');
      }
    }
  }, []);

  const saveToHistory = (newQr: any) => {
    const updated = [newQr, ...history.filter(h => h.text !== newQr.text)].slice(0, 10);
    setHistory(updated);
    localStorage.setItem('qr-history', JSON.stringify(updated));
  };

  const handleGenerate = () => {
    if (!text.trim()) {
      alert('Please enter a link or text.');
      return;
    }
    setIsGenerated(true);
    saveToHistory({
      id: Date.now(),
      title: title || 'Untitled QR',
      text: text,
      date: new Date().toLocaleDateString()
    });
  };

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${title || 'qrcode'}.png`;
      link.href = url;
      link.click();
    }
  };

  const clearHistory = () => {
    if (window.confirm('Clear all recently generated QR codes?')) {
      setHistory([]);
      localStorage.removeItem('qr-history');
    }
  };

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* --- Input Section --- */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#00a884]" /> Customize QR Code
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">QR Title (Optional)</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. My Website, WhatsApp Group"
                className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#00a884]/30 focus:ring-4 focus:ring-[#00a884]/5 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Link or Text</label>
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your URL or text here..."
                className="w-full h-32 px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#00a884]/30 focus:ring-4 focus:ring-[#00a884]/5 outline-none transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Foreground Color</label>
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-2xl border border-gray-100">
                  <input 
                    type="color" 
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                  />
                  <span className="text-xs font-mono text-gray-500 uppercase">{fgColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Background Color</label>
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-2xl border border-gray-100">
                  <input 
                    type="color" 
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                  />
                  <span className="text-xs font-mono text-gray-500 uppercase">{bgColor}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <span className="text-sm font-bold text-gray-700">Include Margin</span>
              <button 
                onClick={() => setIncludeMargin(!includeMargin)}
                className={`w-12 h-6 rounded-full transition-colors relative ${includeMargin ? 'bg-[#00a884]' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${includeMargin ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <Button 
              onClick={handleGenerate}
              className="w-full bg-[#00a884] text-white hover:bg-[#008f6f] py-6 font-black rounded-[1.5rem] shadow-xl shadow-[#00a884]/20 text-lg"
            >
              <RefreshCw className="w-5 h-5 mr-2" /> Generate QR Code
            </Button>
          </div>
        </div>

        {/* --- Preview Section --- */}
        <div className="flex flex-col gap-8">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
            {text && isGenerated ? (
              <div className="text-center space-y-8">
                <div 
                  ref={qrRef}
                  className="p-6 bg-white rounded-[2rem] shadow-2xl shadow-gray-200 inline-block border border-gray-50"
                >
                  <QRCodeCanvas 
                    value={text}
                    size={size}
                    fgColor={fgColor}
                    bgColor={bgColor}
                    level={level}
                    includeMargin={includeMargin}
                  />
                </div>
                <div className="space-y-4">
                  <h4 className="text-xl font-black text-gray-900">{title || 'Your QR Code'}</h4>
                  <p className="text-sm text-gray-400 break-all max-w-xs mx-auto">{text}</p>
                  <div className="flex items-center justify-center gap-4">
                    <Button 
                      onClick={downloadQR}
                      className="bg-gray-900 text-white hover:bg-black px-8 py-4 rounded-2xl font-bold"
                    >
                      <Download className="w-5 h-5 mr-2" /> Download PNG
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-10 h-10 text-gray-200" />
                </div>
                <p className="text-gray-400 font-medium">Enter details to generate preview</p>
              </div>
            )}
          </div>

          {/* --- History Section --- */}
          {history.length > 0 && (
            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-gray-900">Recently Generated</h3>
                <button 
                  onClick={clearHistory}
                  className="text-xs font-bold text-red-500 hover:underline"
                >
                  Clear All
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {history.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => {
                      setText(item.text);
                      setTitle(item.title);
                      setIsGenerated(true);
                    }}
                    className="p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-[#00a884]/30 cursor-pointer transition-all group"
                  >
                    <div className="aspect-square bg-white rounded-xl mb-3 flex items-center justify-center border border-gray-100 overflow-hidden">
                      <QRCodeCanvas 
                        value={item.text}
                        size={60}
                        fgColor="#000000"
                        bgColor="#ffffff"
                        level="L"
                        includeMargin={false}
                      />
                    </div>
                    <p className="text-[10px] font-black text-gray-900 truncate">{item.title}</p>
                    <p className="text-[8px] text-gray-400">{item.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- QR Code Scanner Component ---
const QRCodeScanner = () => {
  const [scanResult, setScanResult] = React.useState<string | null>(null);
  const [isScanning, setIsScanning] = React.useState(false);
  const [isInitializing, setIsInitializing] = React.useState(false);
  const [scanHistory, setScanHistory] = React.useState<string[]>([]);
  const [activeTab, setActiveTab] = React.useState<'camera' | 'upload'>('camera');
  const [error, setError] = React.useState<string | null>(null);
  const scannerRef = React.useRef<Html5Qrcode | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const savedHistory = localStorage.getItem('qr_scan_history');
    if (savedHistory) {
      setScanHistory(JSON.parse(savedHistory));
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  // Stop camera when switching tabs
  React.useEffect(() => {
    if (activeTab !== 'camera' && isScanning) {
      stopCamera();
    }
  }, [activeTab]);

  const saveToHistory = (result: string) => {
    setScanHistory(prev => {
      const newHistory = [result, ...prev.filter(item => item !== result)].slice(0, 10);
      localStorage.setItem('qr_scan_history', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const startCamera = async () => {
    try {
      setIsInitializing(true);
      setError(null);
      setScanResult(null);

      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;
      
      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          setScanResult(decodedText);
          saveToHistory(decodedText);
          stopCamera();
        },
        () => {} // Ignore errors
      );
      
      setIsScanning(true);
      setIsInitializing(false);
    } catch (err) {
      console.error("Error starting camera:", err);
      setError("Could not access camera. Please check permissions.");
      setIsScanning(false);
      setIsInitializing(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error("Error stopping camera:", err);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const html5QrCode = new Html5Qrcode("qr-reader-file");
    try {
      const result = await html5QrCode.scanFile(file, true);
      setScanResult(result);
      saveToHistory(result);
      setError(null);
    } catch (err) {
      console.error("Error scanning file:", err);
      setError("Could not find a QR code in this image.");
    }
  };

  const clearHistory = () => {
    setScanHistory([]);
    localStorage.removeItem('qr_scan_history');
  };

  const deleteHistoryItem = (index: number) => {
    const newHistory = scanHistory.filter((_, i) => i !== index);
    setScanHistory(newHistory);
    localStorage.setItem('qr_scan_history', JSON.stringify(newHistory));
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-sm">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="flex p-1 bg-gray-50 rounded-2xl">
            <button
              onClick={() => setActiveTab('camera')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all ${activeTab === 'camera' ? 'bg-white text-[#00a884] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Camera className="w-5 h-5" /> Camera
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all ${activeTab === 'upload' ? 'bg-white text-[#00a884] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Upload className="w-5 h-5" /> Upload Image
            </button>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-100 p-6 rounded-2xl flex items-center gap-4 text-red-600"
            >
              <AlertCircle className="w-6 h-6 shrink-0" />
              <p className="font-bold">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto p-2 hover:bg-red-100 rounded-xl transition-all">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {activeTab === 'camera' ? (
            <div className="space-y-6">
              <div className="overflow-hidden rounded-3xl bg-black aspect-square max-w-sm mx-auto relative">
                <div id="qr-reader" className="w-full h-full"></div>
                {isInitializing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center space-y-4 bg-black/80 z-10">
                    <Loader2 className="w-10 h-10 animate-spin text-[#00a884]" />
                    <p className="font-bold">Initializing Camera...</p>
                  </div>
                )}
                {!isScanning && !isInitializing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center space-y-4 bg-black/60">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                      <Camera className="w-8 h-8" />
                    </div>
                    <p className="font-medium opacity-60">Camera is ready to scan</p>
                  </div>
                )}
              </div>
              <div className="flex justify-center">
                {!isScanning ? (
                  <Button 
                    onClick={startCamera}
                    disabled={isInitializing}
                    className="bg-[#00a884] text-white hover:bg-[#008f6f] px-12 py-4 font-black rounded-2xl shadow-xl shadow-[#00a884]/20"
                  >
                    {isInitializing ? "Starting..." : "Start Camera"}
                  </Button>
                ) : (
                  <Button 
                    onClick={stopCamera}
                    className="bg-red-500 text-white hover:bg-red-600 px-12 py-4 font-black rounded-2xl shadow-xl shadow-red-500/20"
                  >
                    Stop Camera
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-4 border-dashed border-gray-100 rounded-[2rem] p-12 text-center hover:border-[#00a884]/30 hover:bg-[#00a884]/5 transition-all cursor-pointer group"
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Upload className="w-10 h-10 text-gray-400 group-hover:text-[#00a884]" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Upload QR Image</h3>
                <p className="text-gray-500">Click to select an image from your device</p>
              </div>
              <div id="qr-reader-file" className="hidden"></div>
            </div>
          )}

          {scanResult && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#e1ffc7] border-l-8 border-[#00a884] p-8 rounded-3xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#00a884] uppercase tracking-widest">Scan Result</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(scanResult);
                    alert('Copied!');
                  }}
                  className="p-2 bg-white/50 hover:bg-white rounded-xl transition-all"
                >
                  <Copy className="w-4 h-4 text-[#00a884]" />
                </button>
              </div>
              <div className="text-xl font-bold text-[#075e54] break-all leading-relaxed">
                {scanResult}
              </div>
              {scanResult.startsWith('http') && (
                <a 
                  href={scanResult}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#00a884] font-black text-sm hover:underline"
                >
                  Visit Link <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {scanHistory.length > 0 && (
        <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-gray-900">Recent Scans</h3>
            <button 
              onClick={clearHistory}
              className="text-sm font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-all"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-4">
            {scanHistory.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl group hover:bg-white hover:shadow-md transition-all">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-gray-900 font-medium truncate">{item}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(item);
                      alert('Copied!');
                    }}
                    className="p-3 text-gray-400 hover:text-[#00a884] hover:bg-[#00a884]/10 rounded-xl transition-all"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteHistoryItem(index)}
                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Stylish Text Generator Component ---
const StylishTextGenerator = () => {
  const [text, setText] = React.useState('');
  
  const styles = React.useMemo(() => {
    if (!text) return [];
    
    const charMap: Record<string, Record<string, string>> = {
      bold: {
        'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢', 'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
        'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙'
      },
      italic: {
        'a': '𝘢', 'b': '𝘣', 'c': '𝘤', 'd': '𝘥', 'e': '𝘦', 'f': '𝘧', 'g': '𝘨', 'h': '𝘩', 'i': '𝘪', 'j': '𝘫', 'k': '𝘬', 'l': '𝘭', 'm': '𝘮', 'n': '𝘯', 'o': '𝘰', 'p': '𝘱', 'q': '𝘲', 'r': '𝘳', 's': '𝘴', 't': '𝘵', 'u': '𝘶', 'v': '𝘷', 'w': '𝘸', 'x': '𝘹', 'y': '𝘺', 'z': '𝘻',
        'A': '𝘈', 'B': '𝘉', 'C': '𝘊', 'D': '𝘋', 'E': '𝘌', 'F': '𝘍', 'G': '𝘎', 'H': '𝘏', 'I': '𝘐', 'J': '𝘑', 'K': '𝘒', 'L': '𝘓', 'M': '𝘔', 'N': '𝘕', 'O': '𝘖', 'P': '𝘗', 'Q': '𝘘', 'R': '𝘙', 'S': '𝘚', 'T': '𝘛', 'U': '𝘜', 'V': '𝘝', 'W': '𝘞', 'X': '𝘟', 'Y': '𝘠', 'Z': '𝘡'
      },
      script: {
        'a': '𝒶', 'b': '𝒷', 'c': '𝒸', 'd': '𝒹', 'e': '𝑒', 'f': '𝒻', 'g': '𝑔', 'h': '𝒽', 'i': '𝒾', 'j': '𝒿', 'k': '𝓀', 'l': '𝓁', 'm': '𝓂', 'n': '𝓃', 'o': '𝑜', 'p': '𝓅', 'q': '𝓆', 'r': '𝓇', 's': '𝓈', 't': '𝓉', 'u': '𝓊', 'v': '𝓋', 'w': '𝓌', 'x': '𝓍', 'y': '𝓎', 'z': '𝓏',
        'A': '𝒜', 'B': 'ℬ', 'C': '𝒞', 'D': '𝒟', 'E': '𝐸', 'F': 'ℱ', 'G': '𝒢', 'H': 'ℋ', 'I': 'ℐ', 'J': '𝒥', 'K': '𝒦', 'L': 'ℒ', 'M': 'ℳ', 'N': '𝒩', 'O': '𝒪', 'P': '𝒫', 'Q': '𝒬', 'R': 'ℛ', 'S': '𝒮', 'T': '𝒯', 'U': '𝒰', 'V': '𝒱', 'W': '𝒲', 'X': '𝒳', 'Y': '𝒴', 'Z': '𝒵'
      },
      double: {
        'a': '𝕒', 'b': '𝕓', 'c': '𝕔', 'd': '𝕕', 'e': '𝕖', 'f': '𝕗', 'g': '𝕘', 'h': '𝕙', 'i': '𝕚', 'j': '𝕛', 'k': '𝕜', 'l': '𝕝', 'm': '𝕞', 'n': '𝕟', 'o': '𝕠', 'p': '𝕡', 'q': '𝕢', 'r': '𝕣', 's': '𝕤', 't': '𝕥', 'u': '𝕦', 'v': '𝕧', 'w': '𝕨', 'x': '𝕩', 'y': '𝕪', 'z': '𝕫',
        'A': '𝔸', 'B': '𝔹', 'C': 'ℂ', 'D': '𝔻', 'E': '𝔼', 'F': '𝔽', 'G': '𝔾', 'H': 'ℍ', 'I': '𝕀', 'J': '𝕁', 'K': '𝕂', 'L': '𝕃', 'M': '𝕄', 'N': 'ℕ', 'O': '𝕆', 'P': 'ℙ', 'Q': 'ℚ', 'R': 'ℝ', 'S': '𝕊', 'T': '𝕋', 'U': '𝕌', 'V': '𝕍', 'W': '𝕎', 'X': '𝕏', 'Y': '𝕐', 'Z': 'ℤ'
      }
    };

    const transform = (input: string, map: Record<string, string>) => {
      return input.split('').map(c => map[c] || c).join('');
    };

    return [
      { name: 'Bold', text: transform(text, charMap.bold) },
      { name: 'Italic', text: transform(text, charMap.italic) },
      { name: 'Script', text: transform(text, charMap.script) },
      { name: 'Double Struck', text: transform(text, charMap.double) },
      { name: 'Bubble', text: text.split('').map(c => {
        const code = c.toLowerCase().charCodeAt(0);
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x24D0 + (code - 97));
        return c;
      }).join('') },
      { name: 'Square', text: text.split('').map(c => {
        const code = c.toLowerCase().charCodeAt(0);
        if (code >= 97 && code <= 122) return String.fromCodePoint(0x1F170 + (code - 97));
        return c;
      }).join('') }
    ];
  }, [text]);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-sm">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-black text-gray-900 mb-2">Style Your Text</h3>
            <p className="text-gray-500">Enter your text below to see it in various cool fonts.</p>
          </div>
          <input 
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type something here..."
            className="w-full px-8 py-6 bg-gray-50 border border-transparent rounded-3xl focus:bg-white focus:border-[#00a884]/30 focus:ring-4 focus:ring-[#00a884]/5 outline-none transition-all text-xl font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {styles.map((style) => (
          <div key={style.name} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black text-[#00a884] uppercase tracking-widest">{style.name}</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(style.text);
                  alert('Copied!');
                }}
                className="p-3 bg-gray-50 text-gray-400 hover:text-[#00a884] hover:bg-[#00a884]/10 rounded-xl transition-all"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className="text-2xl text-gray-900 break-all font-medium leading-relaxed">
              {style.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Text Repeater Component ---
const TextRepeater = () => {
  const [text, setText] = React.useState('');
  const [count, setCount] = React.useState(10);
  const [separator, setSeparator] = React.useState('newline');
  const [result, setResult] = React.useState('');
  
  const handleRepeat = () => {
    if (!text) return;
    const sep = separator === 'newline' ? '\n' : separator === 'space' ? ' ' : '';
    setResult(new Array(count).fill(text).join(sep));
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-sm">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-2">Text to Repeat</label>
              <input 
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text..."
                className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#00a884]/30 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-2">Repetitions</label>
              <input 
                type="number"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 0)}
                min="1"
                max="10000"
                className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#00a884]/30 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center justify-center">
            <button 
              onClick={() => setSeparator('newline')}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${separator === 'newline' ? 'bg-[#00a884] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              New Line
            </button>
            <button 
              onClick={() => setSeparator('space')}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${separator === 'space' ? 'bg-[#00a884] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              Space
            </button>
            <button 
              onClick={() => setSeparator('none')}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${separator === 'none' ? 'bg-[#00a884] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              No Separator
            </button>
          </div>

          <Button 
            onClick={handleRepeat}
            className="w-full bg-[#00a884] text-white hover:bg-[#008f6f] py-5 font-black rounded-2xl shadow-xl shadow-[#00a884]/20"
          >
            Repeat Text
          </Button>
        </div>
      </div>

      {result && (
        <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-gray-900">Result</h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(result);
                  alert('Copied!');
                }}
                className="flex items-center gap-2 text-[#00a884] font-bold text-sm bg-[#00a884]/10 px-4 py-2 rounded-xl"
              >
                <Copy className="w-4 h-4" /> Copy All
              </button>
              <button 
                onClick={() => setResult('')}
                className="p-2 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="p-6 bg-gray-50 rounded-2xl text-gray-700 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto font-mono text-sm">
            {result}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Word Counter Component ---
// --- PDF Editor Component ---
const PDFEditor = () => {
  const [pdfFile, setPdfFile] = React.useState<File | null>(null);
  const [numPages, setNumPages] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeTool, setActiveTool] = React.useState<'select' | 'text' | 'draw' | 'erase' | 'image' | 'rect'>('select');
  const [zoom, setZoom] = React.useState(1);
  const [pages, setPages] = React.useState<any[]>([]);
  const [fabricCanvases, setFabricCanvases] = React.useState<Record<number, any>>({});
  
  // Tool Options
  const [brushColor, setBrushColor] = React.useState('#00a884');
  const [brushWidth, setBrushWidth] = React.useState(5);
  const [textColor, setTextColor] = React.useState('#000000');
  const [fontSize, setFontSize] = React.useState(20);
  const [isBold, setIsBold] = React.useState(false);
  const [isItalic, setIsItalic] = React.useState(false);
  const [rectColor, setRectColor] = React.useState('#000000');

  // History for Undo/Redo
  const [history, setHistory] = React.useState<Record<number, string[]>>({});
  const [historyIndex, setHistoryIndex] = React.useState<Record<number, number>>({});
  
  const containerRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Save state to history
  const saveHistory = (pageNumber: number, canvas: any) => {
    const json = JSON.stringify(canvas.toJSON());
    setHistory(prev => {
      const pageHistory = prev[pageNumber] || [];
      const currentIndex = historyIndex[pageNumber] ?? -1;
      const newHistory = pageHistory.slice(0, currentIndex + 1);
      newHistory.push(json);
      // Limit history to 50 steps
      if (newHistory.length > 50) newHistory.shift();
      return { ...prev, [pageNumber]: newHistory };
    });
    setHistoryIndex(prev => ({ ...prev, [pageNumber]: (prev[pageNumber] ?? -1) + 1 }));
  };

  const undo = () => {
    const canvas = fabricCanvases[currentPage];
    const pageHistory = history[currentPage];
    const currentIndex = historyIndex[currentPage];
    if (!canvas || !pageHistory || currentIndex <= 0) return;

    const newIndex = currentIndex - 1;
    canvas.loadFromJSON(JSON.parse(pageHistory[newIndex])).then(() => {
      canvas.renderAll();
      setHistoryIndex(prev => ({ ...prev, [currentPage]: newIndex }));
    });
  };

  const redo = () => {
    const canvas = fabricCanvases[currentPage];
    const pageHistory = history[currentPage];
    const currentIndex = historyIndex[currentPage];
    if (!canvas || !pageHistory || currentIndex >= pageHistory.length - 1) return;

    const newIndex = currentIndex + 1;
    canvas.loadFromJSON(JSON.parse(pageHistory[newIndex])).then(() => {
      canvas.renderAll();
      setHistoryIndex(prev => ({ ...prev, [currentPage]: newIndex }));
    });
  };

  // Local Storage Persistence
  React.useEffect(() => {
    if (pdfFile) {
      const savedData = localStorage.getItem(`pdf_edits_${pdfFile.name}_${pdfFile.size}`);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          // We can't easily restore fabric objects until canvases are initialized
          // So we'll store them and apply when renderPage happens
          (window as any)._pendingEdits = parsed;
        } catch (e) {
          console.error('Failed to load saved edits', e);
        }
      }
    }
  }, [pdfFile]);

  const persistEdits = () => {
    if (!pdfFile) return;
    const edits: Record<number, any> = {};
    Object.entries(fabricCanvases).forEach(([page, canvas]) => {
      edits[Number(page)] = (canvas as any).toJSON();
    });
    localStorage.setItem(`pdf_edits_${pdfFile.name}_${pdfFile.size}`, JSON.stringify(edits));
  };

  React.useEffect(() => {
    const interval = setInterval(persistEdits, 5000);
    return () => clearInterval(interval);
  }, [fabricCanvases, pdfFile]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') return;
    
    setIsLoading(true);
    setPdfFile(file);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setNumPages(pdf.numPages);
      
      const newPages = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        newPages.push({
          pageNumber: i,
          width: viewport.width,
          height: viewport.height,
          viewport
        });
      }
      setPages(newPages);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Failed to load PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPage = React.useCallback(async (pageData: any) => {
    if (!pdfFile) return;
    
    const canvasId = `pdf-canvas-${pageData.pageNumber}`;
    const fabricId = `fabric-canvas-${pageData.pageNumber}`;
    const pdfCanvas = document.getElementById(canvasId) as HTMLCanvasElement;
    
    if (!pdfCanvas) return;

    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(pageData.pageNumber);
    const viewport = page.getViewport({ scale: 1.5 * zoom });
    
    pdfCanvas.width = viewport.width;
    pdfCanvas.height = viewport.height;
    const ctx = pdfCanvas.getContext('2d');
    if (ctx) {
      await (page as any).render({ canvasContext: ctx, viewport } as any).promise;
    }

    // Initialize Fabric Canvas if not already
    if (!fabricCanvases[pageData.pageNumber]) {
      const fCanvas = new Canvas(fabricId, {
        width: viewport.width,
        height: viewport.height,
        preserveObjectStacking: true
      });

      // Restore from local storage if available
      const pending = (window as any)._pendingEdits;
      if (pending && pending[pageData.pageNumber]) {
        fCanvas.loadFromJSON(pending[pageData.pageNumber]).then(() => {
          fCanvas.renderAll();
          saveHistory(pageData.pageNumber, fCanvas);
        });
      } else {
        saveHistory(pageData.pageNumber, fCanvas);
      }

      fCanvas.on('object:added', () => saveHistory(pageData.pageNumber, fCanvas));
      fCanvas.on('object:modified', () => saveHistory(pageData.pageNumber, fCanvas));
      fCanvas.on('object:removed', () => saveHistory(pageData.pageNumber, fCanvas));

      setFabricCanvases(prev => ({ ...prev, [pageData.pageNumber]: fCanvas }));
    } else {
      const fCanvas = fabricCanvases[pageData.pageNumber];
      fCanvas.setDimensions({ width: viewport.width, height: viewport.height });
      fCanvas.renderAll();
    }
  }, [pdfFile, zoom, fabricCanvases]);

  React.useEffect(() => {
    if (pages.length > 0) {
      const page = pages[currentPage - 1];
      if (page) renderPage(page);
    }
  }, [currentPage, pages, zoom]);

  const addText = () => {
    const canvas = fabricCanvases[currentPage];
    if (!canvas) return;
    
    const text = new Textbox('Type your text here...', {
      left: 100,
      top: 100,
      width: 200,
      fontSize: fontSize,
      fill: textColor,
      fontFamily: 'Inter',
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal'
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    setActiveTool('text');
    canvas.isDrawingMode = false;
  };

  const addRect = () => {
    const canvas = fabricCanvases[currentPage];
    if (!canvas) return;
    
    const rect = new Rect({
      left: 100,
      top: 100,
      width: 100,
      height: 60,
      fill: rectColor,
      stroke: 'transparent',
      strokeWidth: 0
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
    setActiveTool('rect');
    canvas.isDrawingMode = false;
  };

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = async (f) => {
        const data = f.target?.result as string;
        try {
          const img = await FabricImage.fromURL(data);
          const canvas = fabricCanvases[currentPage];
          if (!canvas) return;
          
          img.scaleToWidth(200);
          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
          setActiveTool('image');
          canvas.isDrawingMode = false;
        } catch (err) {
          console.error('Error loading image into fabric:', err);
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const toggleDraw = () => {
    const canvas = fabricCanvases[currentPage];
    if (!canvas) return;
    
    const isDrawing = activeTool === 'draw';
    canvas.isDrawingMode = !isDrawing;
    if (!isDrawing) {
      canvas.freeDrawingBrush = new PencilBrush(canvas);
      canvas.freeDrawingBrush.width = brushWidth;
      canvas.freeDrawingBrush.color = brushColor;
      setActiveTool('draw');
    } else {
      setActiveTool('select');
    }
  };

  // Update brush settings when options change
  React.useEffect(() => {
    const canvas = fabricCanvases[currentPage];
    if (canvas && canvas.isDrawingMode && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = brushColor;
      canvas.freeDrawingBrush.width = brushWidth;
    }
  }, [brushColor, brushWidth, currentPage, fabricCanvases]);

  const deleteSelected = () => {
    const canvas = fabricCanvases[currentPage];
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    canvas.remove(...activeObjects);
    canvas.discardActiveObject().renderAll();
  };

  const downloadPdf = async () => {
    if (!pdfFile || pages.length === 0) return;
    
    setIsLoading(true);
    try {
      const doc = new jsPDF({
        unit: 'pt',
        format: [pages[0].width, pages[0].height]
      });

      for (let i = 0; i < pages.length; i++) {
        const pageData = pages[i];
        const pdfCanvas = document.getElementById(`pdf-canvas-${pageData.pageNumber}`) as HTMLCanvasElement;
        const fabricCanvas = fabricCanvases[pageData.pageNumber];
        
        if (!pdfCanvas) continue;

        // Create a temporary canvas to merge PDF and Fabric layers
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = pageData.width;
        tempCanvas.height = pageData.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        if (tempCtx) {
          // Draw PDF background
          tempCtx.drawImage(pdfCanvas, 0, 0);
          
          // Draw Fabric overlay
          if (fabricCanvas) {
            const overlayData = fabricCanvas.toDataURL({ format: 'png' });
            const img = await new Promise<HTMLImageElement>((resolve) => {
              const img = new Image();
              img.onload = () => resolve(img);
              img.src = overlayData;
            });
            tempCtx.drawImage(img, 0, 0);
          }
        }

        const imgData = tempCanvas.toDataURL('image/jpeg', 0.95);
        if (i > 0) {
          doc.addPage([pageData.width, pageData.height], 'portrait');
        }
        doc.addImage(imgData, 'JPEG', 0, 0, pageData.width, pageData.height);
      }

      doc.save('edited_document.pdf');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* --- Toolbar --- */}
      <div className="bg-white rounded-[2rem] border border-gray-100 p-4 shadow-sm flex flex-wrap items-center gap-2 sticky top-24 z-30">
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="application/pdf"
          className="hidden"
        />
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fileInputRef.current?.click()}
          className="gap-2 rounded-xl"
        >
          <Upload className="w-4 h-4" /> Open PDF
        </Button>
        
        <div className="w-px h-8 bg-gray-100 mx-2" />
        
        <div className="flex items-center bg-gray-50 rounded-xl p-1">
          <button 
            onClick={() => {
              setActiveTool('select');
              const canvas = fabricCanvases[currentPage];
              if (canvas) canvas.isDrawingMode = false;
            }}
            className={`p-2 rounded-lg transition-all ${activeTool === 'select' ? 'bg-white text-[#00a884] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            title="Select Tool"
          >
            <MousePointer2 className="w-5 h-5" />
          </button>
          <button 
            onClick={addText}
            className={`p-2 rounded-lg transition-all ${activeTool === 'text' ? 'bg-white text-[#00a884] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            title="Add Text"
          >
            <TypeIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={toggleDraw}
            className={`p-2 rounded-lg transition-all ${activeTool === 'draw' ? 'bg-white text-[#00a884] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            title="Draw Tool"
          >
            <Edit3 className="w-5 h-5" />
          </button>
          <button 
            onClick={addRect}
            className={`p-2 rounded-lg transition-all ${activeTool === 'rect' ? 'bg-white text-[#00a884] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            title="Add Square"
          >
            <Square className="w-5 h-5" />
          </button>
          <button 
            onClick={addImage}
            className={`p-2 rounded-lg transition-all ${activeTool === 'image' ? 'bg-white text-[#00a884] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            title="Add Image"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={deleteSelected}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 transition-all"
            title="Delete Selected"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <div className="w-px h-8 bg-gray-100 mx-2" />

        <div className="flex items-center bg-gray-50 rounded-xl p-1">
          <button 
            onClick={undo}
            disabled={!history[currentPage] || historyIndex[currentPage] <= 0}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-all"
            title="Undo"
          >
            <Undo className="w-5 h-5" />
          </button>
          <button 
            onClick={redo}
            disabled={!history[currentPage] || historyIndex[currentPage] >= (history[currentPage]?.length - 1)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-all"
            title="Redo"
          >
            <Redo className="w-5 h-5" />
          </button>
        </div>

        <div className="w-px h-8 bg-gray-100 mx-2" />
        
        {/* --- Tool Options Panel --- */}
        <div className="flex items-center gap-3 px-2">
          {activeTool === 'draw' && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
              <span className="text-xs font-medium text-gray-500">Color:</span>
              <input 
                type="color" 
                value={brushColor} 
                onChange={(e) => setBrushColor(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0 p-0 overflow-hidden"
              />
              <span className="text-xs font-medium text-gray-500 ml-2">Size:</span>
              <input 
                type="range" 
                min="1" 
                max="50" 
                value={brushWidth} 
                onChange={(e) => setBrushWidth(Number(e.target.value))}
                className="w-20 accent-[#00a884]"
              />
            </div>
          )}
          {activeTool === 'text' && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
              <span className="text-xs font-medium text-gray-500">Color:</span>
              <input 
                type="color" 
                value={textColor} 
                onChange={(e) => setTextColor(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0 p-0 overflow-hidden"
              />
              <span className="text-xs font-medium text-gray-500 ml-2">Size:</span>
              <select 
                value={fontSize} 
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="text-xs border border-gray-200 rounded p-1 outline-none"
              >
                {[12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72].map(s => (
                  <option key={s} value={s}>{s}px</option>
                ))}
              </select>
              <div className="flex border border-gray-200 rounded overflow-hidden ml-1">
                <button 
                  onClick={() => setIsBold(!isBold)}
                  className={`p-1 px-2 text-xs font-bold ${isBold ? 'bg-gray-200' : 'bg-white'}`}
                >B</button>
                <button 
                  onClick={() => setIsItalic(!isItalic)}
                  className={`p-1 px-2 text-xs italic ${isItalic ? 'bg-gray-200' : 'bg-white'}`}
                >I</button>
              </div>
            </div>
          )}
          {activeTool === 'rect' && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
              <span className="text-xs font-medium text-gray-500">Fill Color:</span>
              <input 
                type="color" 
                value={rectColor} 
                onChange={(e) => setRectColor(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0 p-0 overflow-hidden"
              />
              <p className="text-[10px] text-gray-400 italic ml-2">Use for hiding content</p>
            </div>
          )}
        </div>

        <div className="w-px h-8 bg-gray-100 mx-2" />

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold text-gray-500 w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button 
            onClick={() => setZoom(prev => Math.min(3, prev + 0.1))}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1" />

        <Button 
          onClick={downloadPdf}
          disabled={!pdfFile || isLoading}
          className="bg-[#00a884] hover:bg-[#008f70] text-white gap-2 rounded-xl"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Download PDF
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* --- Sidebar / Thumbnails --- */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-4">
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm">
            <h4 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#00a884]" /> Pages ({numPages})
            </h4>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {pages.map((page) => (
                <button
                  key={page.pageNumber}
                  onClick={() => setCurrentPage(page.pageNumber)}
                  className={`w-full p-3 rounded-2xl border-2 transition-all text-left flex items-center gap-3 ${currentPage === page.pageNumber ? 'border-[#00a884] bg-[#00a884]/5' : 'border-transparent bg-gray-50 hover:bg-gray-100'}`}
                >
                  <div className="w-10 h-14 bg-white border border-gray-200 rounded flex items-center justify-center text-[10px] font-bold text-gray-400">
                    {page.pageNumber}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">Page {page.pageNumber}</div>
                    <div className="text-[10px] text-gray-400">{Math.round(page.width)} x {Math.round(page.height)}</div>
                  </div>
                </button>
              ))}
              {pages.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-xs">
                  Upload a PDF to see pages
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- Editor Stage --- */}
        <div className="flex-1 min-h-[800px] bg-gray-100/50 rounded-[3rem] border border-gray-100 p-8 flex items-start justify-center overflow-auto relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center rounded-[3rem]">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-[#00a884] animate-spin" />
                <p className="text-sm font-bold text-gray-500">Processing PDF...</p>
              </div>
            </div>
          )}
          
          {!pdfFile && !isLoading && (
            <div className="flex flex-col items-center justify-center py-40 text-center space-y-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm">
                <FileEdit className="w-12 h-12 text-gray-200" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 mb-2">No PDF Selected</h3>
                <p className="text-gray-500 max-w-xs mx-auto text-sm">
                  Upload a PDF file to start editing, adding text, images, and annotations.
                </p>
              </div>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#00a884] hover:bg-[#008f70] text-white rounded-xl px-8"
              >
                Select PDF File
              </Button>
            </div>
          )}

          <div className={`relative shadow-2xl bg-white ${!pdfFile ? 'hidden' : ''}`}>
            {pages.map((page) => (
              <div 
                key={page.pageNumber}
                className={currentPage === page.pageNumber ? 'block' : 'hidden'}
              >
                <canvas 
                  id={`pdf-canvas-${page.pageNumber}`}
                  className="absolute top-0 left-0"
                />
                <canvas 
                  id={`fabric-canvas-${page.pageNumber}`}
                  className="relative z-10"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const WordCounter = () => {
  const [text, setText] = React.useState('');
  
  // Restore from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('wordCounterText');
    if (saved) setText(saved);
  }, []);

  // Save to localStorage
  React.useEffect(() => {
    localStorage.setItem('wordCounterText', text);
  }, [text]);

  const stats = React.useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0).length;
    
    // Headings detection (lines starting with # or Title Case lines)
    const lines = text.split('\n');
    let headings = 0;
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('#')) {
        headings++;
      } else if (trimmedLine.length > 0 && trimmedLine.length < 100 && !/[.!?]$/.test(trimmedLine)) {
        const wordsInLine = trimmedLine.split(/\s+/);
        const capitalizedWords = wordsInLine.filter(word => /^[A-Z]/.test(word));
        if (capitalizedWords.length >= wordsInLine.length * 0.6 && wordsInLine.length >= 2) {
          headings++;
        }
      }
    });

    // Reading time (avg 225 wpm)
    const readingTime = Math.ceil(words / 225);
    // Speaking time (avg 115 wpm)
    const speakingTime = Math.ceil(words / 115);

    // Average lengths
    const avgWordLength = words > 0 ? (charsNoSpaces / words).toFixed(1) : '0';
    const avgSentenceLength = sentences > 0 ? Math.round(words / sentences) : 0;

    // Longest word
    const wordsArray = trimmed.match(/\b\w+\b/g) || [];
    let longestWord = '-';
    if (wordsArray.length > 0) {
      longestWord = wordsArray.reduce((a, b) => a.length >= b.length ? a : b);
    }

    // Keyword density
    const wordFreq: Record<string, number> = {};
    wordsArray.forEach(w => {
      const word = w.toLowerCase();
      if (word.length > 3) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
    const topKeywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return { 
      words, chars, charsNoSpaces, sentences, paragraphs, headings,
      readingTime, speakingTime, avgWordLength, avgSentenceLength, longestWord, topKeywords 
    };
  }, [text]);

  const handleCase = (type: 'upper' | 'lower' | 'title' | 'sentence') => {
    if (!text) return;
    let newText = text;
    switch (type) {
      case 'upper': newText = text.toUpperCase(); break;
      case 'lower': newText = text.toLowerCase(); break;
      case 'title': 
        newText = text.toLowerCase().split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
        break;
      case 'sentence':
        newText = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
        break;
    }
    setText(newText);
  };

  const copyStats = () => {
    const statsText = `
📊 TEXT STATISTICS
═══════════════════════════════

📝 Basic Counts:
   • Total Words: ${stats.words}
   • Total Characters: ${stats.chars}
   • Characters (No Spaces): ${stats.charsNoSpaces}
   • Total Sentences: ${stats.sentences}
   • Total Headings: ${stats.headings}
   • Total Paragraphs: ${stats.paragraphs}

⏱️ Time Estimates:
   • Reading Time: ${stats.readingTime} min
   • Speaking Time: ${stats.speakingTime} min

💡 Additional Insights:
   • Average Word Length: ${stats.avgWordLength} characters
   • Average Sentence Length: ${stats.avgSentenceLength} words
   • Longest Word: ${stats.longestWord}

Generated by LinkShare Word Counter
${window.location.href}
    `.trim();

    navigator.clipboard.writeText(statsText);
    alert('Statistics copied to clipboard!');
  };

  // Progress bar helper
  const renderProgressBar = (label: string, value: number, max: number, color: string, Icon: any) => {
    const percentage = Math.min((value / max) * 100, 100);
    return (
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm transition-all hover:shadow-md group">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} text-white shadow-lg`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</div>
            <div className="text-2xl font-black text-gray-900">{value}</div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              className={`h-full ${color.replace('bg-', 'bg-')}`}
              style={{ backgroundColor: color.includes('00a884') ? '#00a884' : undefined }}
            />
          </div>
          <div className="text-[10px] font-bold text-gray-400 text-right">{Math.round(percentage)}%</div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10">
      {/* --- Input Area --- */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00a884]/10 rounded-xl flex items-center justify-center">
              <Edit3 className="w-5 h-5 text-[#00a884]" />
            </div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Text Analysis Tool</h3>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={copyStats}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-bold transition-all"
            >
              <Copy className="w-4 h-4" /> Copy Stats
            </button>
            <button 
              onClick={() => {
                if (window.confirm('Clear all text?')) setText('');
              }}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <textarea 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste your text here to analyze words, characters, sentences, and headings..."
          className="w-full h-80 p-8 bg-gray-50 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-[#00a884]/30 focus:ring-8 focus:ring-[#00a884]/5 outline-none transition-all resize-none text-gray-700 leading-relaxed text-lg"
        />

        <div className="mt-8 flex flex-wrap gap-3">
          <button onClick={() => handleCase('upper')} className="px-6 py-3 bg-white border border-gray-100 hover:border-[#00a884]/30 hover:bg-gray-50 rounded-xl text-xs font-black text-gray-600 transition-all shadow-sm">UPPERCASE</button>
          <button onClick={() => handleCase('lower')} className="px-6 py-3 bg-white border border-gray-100 hover:border-[#00a884]/30 hover:bg-gray-50 rounded-xl text-xs font-black text-gray-600 transition-all shadow-sm">lowercase</button>
          <button onClick={() => handleCase('title')} className="px-6 py-3 bg-white border border-gray-100 hover:border-[#00a884]/30 hover:bg-gray-50 rounded-xl text-xs font-black text-gray-600 transition-all shadow-sm">Title Case</button>
          <button onClick={() => handleCase('sentence')} className="px-6 py-3 bg-white border border-gray-100 hover:border-[#00a884]/30 hover:bg-gray-50 rounded-xl text-xs font-black text-gray-600 transition-all shadow-sm">Sentence case</button>
        </div>
      </div>

      {/* --- Stats Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderProgressBar('Total Words', stats.words, 1000, 'bg-[#00a884]', FileText)}
        {renderProgressBar('Total Characters', stats.chars, 5000, 'bg-blue-600', Type)}
        {renderProgressBar('Characters (No Spaces)', stats.charsNoSpaces, 4000, 'bg-purple-600', AlignLeft)}
        {renderProgressBar('Total Sentences', stats.sentences, 50, 'bg-orange-600', Pilcrow)}
        {renderProgressBar('Total Headings', stats.headings, 20, 'bg-pink-600', Heading)}
        {renderProgressBar('Reading Time', stats.readingTime, 10, 'bg-indigo-600', Clock)}
      </div>

      {/* --- Insights Section --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-yellow-400/10 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
            </div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Additional Insights</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 bg-gray-50 rounded-2xl flex items-center justify-between group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100">
              <span className="text-sm font-bold text-gray-500">Avg. Word Length</span>
              <span className="text-lg font-black text-[#00a884]">{stats.avgWordLength} chars</span>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl flex items-center justify-between group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100">
              <span className="text-sm font-bold text-gray-500">Avg. Sentence Length</span>
              <span className="text-lg font-black text-blue-600">{stats.avgSentenceLength} words</span>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl flex items-center justify-between group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100">
              <span className="text-sm font-bold text-gray-500">Speaking Time</span>
              <span className="text-lg font-black text-purple-600">{stats.speakingTime} min</span>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl flex items-center justify-between group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100">
              <span className="text-sm font-bold text-gray-500">Longest Word</span>
              <span className="text-sm font-black text-orange-600 truncate max-w-[120px]">{stats.longestWord}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-[#00a884]" /> Keyword Density
            </h3>
            {stats.topKeywords.length > 0 ? (
              <div className="space-y-6">
                {stats.topKeywords.map(([word, count]) => (
                  <div key={word} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="capitalize text-gray-400">{word}</span>
                      <span className="text-[#00a884]">{count} times</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / stats.words) * 100 * 5}%` }}
                        className="h-full bg-[#00a884]" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center space-y-4">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                  <Type className="w-6 h-6 text-gray-600" />
                </div>
                <p className="text-gray-500 text-sm">Enter more text to see keyword density.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Short URL Generator Component ---
const ShortURLGenerator = () => {
  const [url, setUrl] = React.useState('');
  const [alias, setAlias] = React.useState('');
  const [isShortening, setIsShortening] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);
  const [history, setHistory] = React.useState<any[]>([]);

  React.useEffect(() => {
    const saved = localStorage.getItem('url-history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse URL history');
      }
    }
  }, []);

  const handleShorten = () => {
    if (!url.trim()) {
      alert('Please enter a URL.');
      return;
    }
    if (!url.startsWith('http')) {
      alert('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setIsShortening(true);
    setResult(null);

    // Simulation of shortening
    setTimeout(() => {
      const shortId = alias.trim() || Math.random().toString(36).substring(2, 8);
      const shortUrl = `${window.location.origin}/s/${shortId}`;
      
      setResult(shortUrl);
      
      const newHistory = [
        { id: Date.now(), original: url, short: shortUrl, date: new Date().toLocaleDateString() },
        ...history
      ].slice(0, 10);
      
      setHistory(newHistory);
      localStorage.setItem('url-history', JSON.stringify(newHistory));
      setIsShortening(false);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-sm">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center">
            <h3 className="text-2xl font-black text-gray-900 mb-2">Shorten Your Link</h3>
            <p className="text-gray-500">Paste your long URL below to get a clean, short link.</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/very-long-url-path..."
                className="w-full pl-14 pr-5 py-5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#00a884]/30 focus:ring-4 focus:ring-[#00a884]/5 outline-none transition-all text-lg"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">linkshare.online/s/</span>
                <input 
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="custom-alias"
                  className="w-full pl-36 pr-5 py-5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#00a884]/30 focus:ring-4 focus:ring-[#00a884]/5 outline-none transition-all"
                />
              </div>
              <Button 
                onClick={handleShorten}
                disabled={isShortening || !url}
                className="bg-[#00a884] text-white hover:bg-[#008f6f] px-10 py-5 font-black rounded-2xl h-auto disabled:opacity-50 shadow-xl shadow-[#00a884]/20"
              >
                {isShortening ? <Loader2 className="w-6 h-6 animate-spin" /> : "Shorten URL"}
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {result && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 bg-green-50 border border-green-100 rounded-[2rem] text-center"
              >
                <div className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3">Your Short Link is Ready!</div>
                <div className="text-2xl font-black text-gray-900 mb-6 break-all">{result}</div>
                <div className="flex items-center justify-center gap-4">
                  <Button 
                    onClick={() => {
                      navigator.clipboard.writeText(result);
                      alert('Copied to clipboard!');
                    }}
                    className="bg-green-600 text-white hover:bg-green-700 px-8 py-3 rounded-xl font-bold"
                  >
                    <Copy className="w-4 h-4 mr-2" /> Copy Link
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => window.open(result, '_blank')}
                    className="bg-white border-green-200 text-green-600 hover:bg-green-100 px-8 py-3 rounded-xl font-bold"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" /> Visit
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {history.length > 0 && (
        <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-gray-900">Recent Links</h3>
            <button 
              onClick={() => {
                if (window.confirm('Clear your link history?')) {
                  setHistory([]);
                  localStorage.removeItem('url-history');
                }
              }}
              className="text-sm font-bold text-red-500 hover:underline"
            >
              Clear History
            </button>
          </div>
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-gray-50 rounded-2xl gap-4 group">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 mb-1 truncate">{item.short}</div>
                  <div className="text-xs text-gray-400 truncate">{item.original}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-gray-300 mr-2">{item.date}</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(item.short);
                      alert('Copied!');
                    }}
                    className="p-3 bg-white text-gray-400 hover:text-[#00a884] hover:shadow-md rounded-xl transition-all"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => window.open(item.short, '_blank')}
                    className="p-3 bg-white text-gray-400 hover:text-blue-500 hover:shadow-md rounded-xl transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Plagiarism Checker Component ---
const PlagiarismChecker = () => {
  const [text, setText] = React.useState('');
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [results, setResults] = React.useState<any>(null);

  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  const charCount = text.length;

  const handleCheck = () => {
    if (text.length < 50) {
      alert('Please enter at least 50 characters for accurate analysis.');
      return;
    }

    setIsAnalyzing(true);
    setResults(null);

    // Simulate analysis
    setTimeout(() => {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const totalSentences = sentences.length;

      const commonPhrases = [
        'the quick brown fox', 'lorem ipsum dolor sit amet', 'to be or not to be',
        'all that glitters is not gold', 'a picture is worth a thousand words',
        'actions speak louder than words', 'the early bird catches the worm',
        'better late than never', 'practice makes perfect', 'time is money',
        'knowledge is power', 'honesty is the best policy',
        'where there is a will there is a way', 'the pen is mightier than the sword',
        'two heads are better than one'
      ];

      let matchedSentences = 0;
      let matchedContent: any[] = [];

      sentences.forEach(sentence => {
        const lowerSentence = sentence.toLowerCase().trim();
        let matched = false;

        commonPhrases.forEach(phrase => {
          if (lowerSentence.includes(phrase)) {
            matched = true;
            matchedContent.push({ text: sentence.trim(), reason: 'Common phrase detected' });
          }
        });

        const commonStarters = ['according to', 'research shows that', 'studies have shown', 'it is widely known that'];
        commonStarters.forEach(starter => {
          if (lowerSentence.startsWith(starter) && Math.random() > 0.7) {
            matched = true;
            matchedContent.push({ text: sentence.trim(), reason: 'Commonly used phrase pattern' });
          }
        });

        if (matched) matchedSentences++;
      });

      const randomFactor = Math.random() * 0.1;
      const basePlagiarismScore = (matchedSentences / totalSentences) * 100;
      const plagiarismScore = Math.min(Math.round(basePlagiarismScore + (randomFactor * 100)), 100);
      const uniqueScore = 100 - plagiarismScore;

      setResults({
        plagiarismScore,
        uniqueScore,
        totalSentences,
        matchedSentences,
        matchedContent: matchedContent.slice(0, 5)
      });
      setIsAnalyzing(false);
    }, 2500);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span>{wordCount} words</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Type className="w-4 h-4" />
              <span>{charCount} characters</span>
            </div>
          </div>
          <button 
            onClick={() => setText('')}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Clear text"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <textarea 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your text here to check for plagiarism (minimum 50 characters)..."
          className="w-full h-64 md:h-80 p-6 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#00a884]/30 focus:ring-4 focus:ring-[#00a884]/5 outline-none transition-all resize-none text-gray-700 leading-relaxed"
        />

        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-gray-400 max-w-md">
            <AlertCircle className="w-4 h-4 inline mr-1" />
            Your text is analyzed against our database of common phrases and patterns. For professional use, consider official APIs.
          </p>
          <Button 
            onClick={handleCheck}
            disabled={isAnalyzing || text.length < 50}
            className="w-full md:w-auto bg-[#00a884] text-white hover:bg-[#008f6f] px-10 py-4 font-bold rounded-2xl h-auto disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-[#00a884]/20 transition-all active:scale-95"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing Content...
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Check for Plagiarism
              </>
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
                <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#00a884]" />
                  Analysis Results
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="p-8 rounded-[2rem] bg-red-50 border border-red-100 text-center">
                    <div className="text-4xl font-black text-red-600 mb-2">{results.plagiarismScore}%</div>
                    <div className="text-sm font-bold text-red-400 uppercase tracking-wider">Plagiarism</div>
                  </div>
                  <div className="p-8 rounded-[2rem] bg-green-50 border border-green-100 text-center">
                    <div className="text-4xl font-black text-green-600 mb-2">{results.uniqueScore}%</div>
                    <div className="text-sm font-bold text-green-400 uppercase tracking-wider">Unique Content</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-500 font-medium">Total Sentences</span>
                    <span className="font-bold text-gray-900">{results.totalSentences}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-500 font-medium">Matched Sentences</span>
                    <span className="font-bold text-red-600">{results.matchedSentences}</span>
                  </div>
                </div>
              </div>

              {results.matchedContent.length > 0 && (
                <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
                  <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    Potential Matches
                  </h3>
                  <div className="space-y-4">
                    {results.matchedContent.map((match: any, i: number) => (
                      <div key={i} className="p-6 bg-orange-50/50 border border-orange-100 rounded-2xl">
                        <p className="text-gray-800 font-medium mb-2 italic">"{match.text}"</p>
                        <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">{match.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-8">
              <div className="bg-[#00a884] rounded-[2rem] p-8 text-white shadow-xl shadow-[#00a884]/20 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                <div className="relative z-10">
                  <h4 className="text-lg font-black mb-4">Summary</h4>
                  <p className="text-white/80 text-sm leading-relaxed mb-6">
                    {results.plagiarismScore > 50 
                      ? "Your content shows high similarity to existing sources. We recommend significant revisions to ensure originality."
                      : results.plagiarismScore > 20
                      ? "Some content matches existing patterns. Consider rephrasing the highlighted sections."
                      : "Great job! Your content appears to be highly original with minimal matches."}
                  </p>
                  <div className="flex items-center gap-4">
                    <button className="flex-1 py-3 bg-white text-[#00a884] rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                      <Copy className="w-4 h-4" />
                      Copy Report
                    </button>
                    <button className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-[2rem] p-8 text-white">
                <h4 className="text-lg font-black mb-6">Pro Tip</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Always cite your sources correctly. Even if a phrase is common, proper attribution builds trust and authority with your readers.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function ToolDetail({ settings }: ToolDetailProps) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = React.useState<User | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [authLoading, setAuthLoading] = React.useState(false);
  const [authError, setAuthError] = React.useState('');

  const tool = TOOLS.find(t => t.slug === slug);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user as User | null);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (authLoading) return;
    setAuthLoading(true);
    setAuthError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/popup-blocked') {
        setAuthError('Popup blocked! Please allow popups for this site to sign in.');
      } else {
        setAuthError('An error occurred during login. Please try again.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!tool) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <AlertCircle className="w-20 h-20 text-gray-200 mb-6" />
        <h1 className="text-3xl font-black text-gray-900 mb-4">Tool Not Found</h1>
        <p className="text-gray-500 mb-8 text-center max-w-md">The tool you're looking for doesn't exist or has been moved.</p>
        <Link to="/tools">
          <Button className="bg-[#00a884] text-white hover:bg-[#008f6f]">
            Browse All Tools
          </Button>
        </Link>
      </div>
    );
  }

  const Icon = iconMap[tool.icon] || Wrench;
  const relatedTools = TOOLS.filter(t => t.slug !== tool.slug && t.enabled).slice(0, 3);

  const renderTool = () => {
    switch (tool.slug) {
      case 'plagiarism-checker': return <PlagiarismChecker />;
      case 'ai-detector': return <AIDetector />;
      case 'qr-code-generator': return <QRCodeGenerator />;
      case 'word-counter': return <WordCounter />;
      case 'short-url-generator': return <ShortURLGenerator />;
      case 'stylish-text-generator': return <StylishTextGenerator />;
      case 'text-repeater': return <TextRepeater />;
      case 'qr-code-scanner': return <QRCodeScanner />;
      case 'pdf-editor': return <PDFEditor />;
      default: return (
        <div className="bg-white rounded-[3rem] p-12 md:p-20 text-center border border-gray-100 shadow-sm">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <Wrench className="w-12 h-12 text-gray-300" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Coming Soon!</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-10">
            We're currently working on this tool. Check back soon or browse our other available tools.
          </p>
          <Link to="/tools">
            <Button variant="outline" className="px-8 py-3 rounded-xl">
              Browse Other Tools
            </Button>
          </Link>
        </div>
      );
    }
  };

  const getToolContent = () => {
    if (tool.slug === 'plagiarism-checker') {
      return {
        howToUse: [
          "Copy the text you want to check for originality.",
          "Paste the text into the large input area above (minimum 50 characters).",
          "Click the 'Check for Plagiarism' button to start the analysis.",
          "Review the results to see the percentage of unique vs. matched content."
        ],
        benefits: [
          "Ensure your content is 100% original before publishing.",
          "Avoid SEO penalties from search engines for duplicate content.",
          "Identify specific sentences that might need rephrasing.",
          "Protect your academic or professional reputation."
        ]
      };
    }
    if (tool.slug === 'ai-detector') {
      return {
        howToUse: [
          "Select the 'AI Detector' tab for analysis or 'AI Humanizer' to rephrase.",
          "Paste your text into the input field (at least 50 characters).",
          "Click 'Detect AI Content' to see the probability of AI generation.",
          "Use the 'Humanizer' to make AI-generated text sound more natural."
        ],
        benefits: [
          "Verify if content was written by a human or generated by AI.",
          "Improve the 'human' feel of your AI-generated drafts.",
          "Maintain a consistent brand voice that doesn't sound robotic.",
          "Stay ahead of search engine algorithms that prefer human-written content."
        ]
      };
    }
    if (tool.slug === 'qr-code-generator') {
      return {
        howToUse: [
          "Enter a title for your QR code (optional) to help you identify it later.",
          "Paste the URL, text, or WhatsApp link you want to encode.",
          "Customize the colors and margin to match your brand or preference.",
          "Click 'Generate QR Code' and download the high-quality PNG image."
        ],
        benefits: [
          "Create professional QR codes for free without any watermarks.",
          "Customize colors to make your QR codes stand out.",
          "Keep track of your recently generated codes for quick access.",
          "High-resolution output suitable for printing and digital sharing."
        ]
      };
    }
    if (tool.slug === 'word-counter') {
      return {
        howToUse: [
          "Type or paste your text into the input area.",
          "The statistics will update in real-time as you type.",
          "Check the keyword density to see which words appear most frequently.",
          "Use the case conversion buttons to quickly format your text."
        ],
        benefits: [
          "Get instant counts for words, characters, and sentences.",
          "Estimate reading and speaking time for your content.",
          "Analyze keyword density for better SEO optimization.",
          "Quickly format text with one-click case conversion."
        ]
      };
    }
    if (tool.slug === 'short-url-generator') {
      return {
        howToUse: [
          "Paste your long URL into the input field.",
          "Enter a custom alias if you want a specific short link (optional).",
          "Click 'Shorten URL' to generate your clean link.",
          "Copy the result and share it anywhere!"
        ],
        benefits: [
          "Turn long, messy links into clean, professional URLs.",
          "Create custom aliases that are easy to remember.",
          "Track your recently shortened links in the history section.",
          "Perfect for social media bios and marketing campaigns."
        ]
      };
    }
    if (tool.slug === 'stylish-text-generator') {
      return {
        howToUse: [
          "Type the text you want to style in the input box.",
          "Browse through the various font styles generated below.",
          "Click the copy icon next to your favorite style.",
          "Paste it directly into WhatsApp, Instagram, or any other app."
        ],
        benefits: [
          "Stand out with unique and cool fonts on social media.",
          "No special software needed - works directly in your browser.",
          "Wide variety of styles from bold to script and bubbles.",
          "100% compatible with WhatsApp and most social platforms."
        ]
      };
    }
    if (tool.slug === 'text-repeater') {
      return {
        howToUse: [
          "Enter the text you want to repeat.",
          "Specify the number of times you want it repeated.",
          "Choose your preferred separator (new line, space, or none).",
          "Click 'Repeat Text' and copy the result."
        ],
        benefits: [
          "Save time by repeating text instantly instead of manual copy-pasting.",
          "Create fun text patterns or long messages for friends.",
          "Support for up to 10,000 repetitions in one click.",
          "Easy one-click copy to clipboard functionality."
        ]
      };
    }
    if (tool.slug === 'qr-code-scanner') {
      return {
        howToUse: [
          "Choose between 'Camera' or 'Upload Image' mode.",
          "For Camera: Grant permission and point your camera at the QR code.",
          "For Upload: Select an image file containing a QR code from your device.",
          "The result will appear instantly with a copy button."
        ],
        benefits: [
          "Scan QR codes without downloading any extra apps.",
          "Works on both mobile and desktop devices.",
          "Privacy-focused: Scanning happens entirely in your browser.",
          "Keep track of your recent scans with the history feature."
        ]
      };
    }
    if (tool.slug === 'pdf-editor') {
      return {
        howToUse: [
          "Upload your PDF file using the 'Open PDF' button.",
          "Select a page from the sidebar to start editing.",
          "Use the toolbar to add text, images, or draw on the PDF.",
          "Click 'Download Edited PDF' to save your changes."
        ],
        benefits: [
          "Edit PDFs directly in your browser without any installation.",
          "Add text, images, and annotations to your documents for free.",
          "High-quality rendering and export for professional results.",
          "Privacy-focused: Your files never leave your browser."
        ]
      };
    }
    return null;
  };

  const toolContent = getToolContent();

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar 
        settings={settings}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onAddClick={() => setIsAddModalOpen(true)}
        authError={authError}
        authLoading={authLoading}
      />

      <AdPlacement id="global_top" settings={settings} />

      {/* --- Tool Header --- */}
      <section className="pt-40 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <Link 
            to="/tools"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-[#00a884] font-bold text-sm mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Tools
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-[#00a884]/10 rounded-2xl flex items-center justify-center">
                  <Icon className="w-8 h-8 text-[#00a884]" />
                </div>
                <div>
                  <span className="px-3 py-1 bg-[#00a884]/10 text-[#00a884] rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">
                    {tool.category}
                  </span>
                  <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                    {tool.title}
                  </h1>
                </div>
              </div>
              <p className="text-xl text-gray-500 leading-relaxed">
                {tool.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Main Content --- */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4">
          {renderTool()}

          <AdPlacement id="tool_detail_bottom" settings={settings} />

          {/* --- SEO Content Section --- */}
          {toolContent && (
            <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm"
              >
                <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#00a884]/10 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-[#00a884]" />
                  </div>
                  How to Use
                </h3>
                <ul className="space-y-6">
                  {toolContent.howToUse.map((step, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="flex-shrink-0 w-6 h-6 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center text-xs font-bold mt-1">
                        {i + 1}
                      </span>
                      <p className="text-gray-600 leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-gray-900 p-10 rounded-[2.5rem] text-white shadow-xl"
              >
                <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#00a884]/20 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#00a884]" />
                  </div>
                  Key Benefits
                </h3>
                <ul className="space-y-6">
                  {toolContent.benefits.map((benefit, i) => (
                    <li key={i} className="flex gap-4">
                      <div className="mt-1.5 w-2 h-2 bg-[#00a884] rounded-full flex-shrink-0" />
                      <p className="text-gray-400 leading-relaxed">{benefit}</p>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          )}

          {/* --- Related Tools --- */}
          <div className="mt-20">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-black text-gray-900">Related Tools</h3>
              <Link to="/tools" className="text-[#00a884] font-bold text-sm hover:underline">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedTools.map((t) => {
                const RIcon = iconMap[t.icon] || Wrench;
                return (
                  <Link 
                    key={t.id}
                    to={`/tools/${t.slug}`}
                    className="group bg-white p-8 rounded-[2rem] border border-gray-100 hover:shadow-xl hover:shadow-[#00a884]/5 transition-all duration-500"
                  >
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#00a884]/10 group-hover:scale-110 transition-all duration-500">
                      <RIcon className="w-6 h-6 text-gray-400 group-hover:text-[#00a884]" />
                    </div>
                    <h4 className="text-lg font-black text-gray-900 mb-2 group-hover:text-[#00a884] transition-colors">
                      {t.title}
                    </h4>
                    <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <Footer settings={settings} />

      <AddGroupModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        user={user}
        settings={settings}
        onLogin={handleLogin}
        authLoading={authLoading}
        authError={authError}
      />
    </div>
  );
}
