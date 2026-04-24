import React from 'react';
import { domToPng } from 'modern-screenshot';
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
  Code,
  FileCode,
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
  Maximize2,
  MousePointer2,
  Hand,
  MessageSquare,
  MessageCircle,
  Eye,
  EyeOff,
  Info,
  Signal,
  Wifi,
  Battery,
  User as UserIcon,
  Edit2,
  Plus,
  CheckCheck,
  MoreVertical,
  Phone,
  Video,
  Smile,
  Paperclip,
  Users,
  Home,
  Briefcase,
  Trophy,
  Gamepad2,
  GraduationCap,
  Bold,
  Italic,
  Strikethrough,
  ListMusic,
  Play,
  Filter,
  FileStack,
  GripVertical,
  ShieldCheck,
  Cloud,
  Heart
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { Html5Qrcode } from 'html5-qrcode';
import { GoogleGenAI } from "@google/genai";
import { Canvas, FabricImage, Textbox, PencilBrush, Rect, Circle as FabricCircle } from 'fabric';
import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';
import { PDFDocument } from 'pdf-lib';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Set PDF.js worker using jsdelivr for version 5.x compatibility
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

import { SiteSettings, TOOLS, Tool } from '../types';
import { auth, db, doc, getDoc, setDoc, serverTimestamp, onAuthStateChanged, googleProvider, signInWithPopup, signOut } from '../firebase';
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
  FileEdit,
  Sparkles,
  RefreshCw,
  Camera,
  MessageSquare,
  MessageCircle
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
    const charMap: Record<string, Record<string, string>> = {
      bold: {
        'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢', 'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
        'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
        '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
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
        'A': '𝔸', 'B': '𝔹', 'C': 'ℂ', 'D': '𝔻', 'E': '𝔼', 'F': '𝔽', 'G': '𝔾', 'H': 'ℍ', 'I': '𝕀', 'J': '𝕁', 'K': '𝕂', 'L': '𝕃', 'M': '𝕄', 'N': 'ℕ', 'O': '𝕆', 'P': 'ℙ', 'Q': 'ℚ', 'R': 'ℝ', 'S': '𝕊', 'T': '𝕋', 'U': '𝕌', 'V': '𝕍', 'W': '𝕎', 'X': '𝕏', 'Y': '𝕐', 'Z': 'ℤ',
        '0': '𝟘', '1': '𝟙', '2': '𝟚', '3': '𝟛', '4': '𝟜', '5': '𝟝', '6': '𝟞', '7': '𝟟', '8': '𝟠', '9': '𝟡'
      },
      smallCaps: {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ꜰ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ',
        'A': 'ᴀ', 'B': 'ʙ', 'C': 'ᴄ', 'D': 'ᴅ', 'E': 'ᴇ', 'F': 'ꜰ', 'G': 'ɢ', 'H': 'ʜ', 'I': 'ɪ', 'J': 'ᴊ', 'K': 'ᴋ', 'L': 'ʟ', 'M': 'ᴍ', 'N': 'ɴ', 'O': 'ᴏ', 'P': 'ᴘ', 'Q': 'ǫ', 'R': 'ʀ', 'S': 's', 'T': 'ᴛ', 'U': 'ᴜ', 'V': 'ᴠ', 'W': 'ᴡ', 'X': 'x', 'Y': 'ʏ', 'Z': 'ᴢ'
      },
      fraktur: {
        'a': '𝔞', 'b': '𝔟', 'c': '𝔣', 'd': '𝔡', 'e': '𝔢', 'f': '𝔣', 'g': '𝔤', 'h': '𝔥', 'i': '𝔦', 'j': '𝔧', 'k': '𝔨', 'l': '𝔩', 'm': '𝔪', 'n': '𝔫', 'o': '𝔬', 'p': '𝔭', 'q': '𝔮', 'r': '𝔯', 's': '𝔰', 't': '𝔱', 'u': '𝔲', 'v': '𝔳', 'w': '𝔴', 'x': '𝔵', 'y': '𝔶', 'z': '𝔷',
        'A': '𝔄', 'B': '𝔅', 'C': 'ℭ', 'D': '𝔇', 'E': '𝔈', 'F': '𝔉', 'G': '𝔊', 'H': 'ℌ', 'I': 'ℑ', 'J': '𝔍', 'K': '𝔎', 'L': '𝔏', 'M': '𝔐', 'N': '𝔑', 'O': '𝔒', 'P': '𝔓', 'Q': '𝔔', 'R': 'ℜ', 'S': '𝔖', 'T': '𝔗', 'U': '𝔘', 'V': '𝔙', 'W': '𝔚', 'X': '𝔛', 'Y': '𝔜', 'Z': 'ℨ'
      },
      mono: {
        'a': '𝚊', 'b': '𝚋', 'c': '𝚌', 'd': '𝚍', 'e': '𝚎', 'f': '𝚏', 'g': '𝚐', 'h': '𝚑', 'i': '𝚒', 'j': '𝚓', 'k': '𝚔', 'l': '𝚕', 'm': '𝚖', 'n': '𝚗', 'o': '𝚘', 'p': '𝚙', 'q': '𝚚', 'r': '𝚛', 's': '𝚜', 't': '𝚝', 'u': '𝚞', 'v': '𝚟', 'w': '𝚠', 'x': '𝚡', 'y': '𝚢', 'z': '𝚣',
        'A': '𝙰', 'B': '𝙱', 'C': '𝙲', 'D': '𝙳', 'E': '𝙴', 'F': '𝙵', 'G': '𝙶', 'H': '𝙷', 'I': '𝙸', 'J': '𝙹', 'K': '𝙺', 'L': '𝙻', 'M': '𝙼', 'N': '𝙽', 'O': '𝙾', 'P': '𝙿', 'Q': '𝚀', 'R': '𝚁', 'S': '𝚂', 'T': '𝚃', 'U': '𝚄', 'V': '𝚅', 'W': '𝚆', 'X': '𝚇', 'Y': '𝚈', 'Z': '𝚉',
        '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿'
      }
    };

    const transform = (input: string, map: Record<string, string>) => {
      return input.split('').map(c => map[c] || c).join('');
    };

    const val = text || 'Example';

    return [
      {
        category: 'Classic Fonts',
        items: [
          { name: 'Bold', text: transform(val, charMap.bold) },
          { name: 'Italic', text: transform(val, charMap.italic) },
          { name: 'Script', text: transform(val, charMap.script) },
          { name: 'Double Struck', text: transform(val, charMap.double) },
          { name: 'Small Caps', text: transform(val, charMap.smallCaps) },
          { name: 'Fraktur', text: transform(val, charMap.fraktur) },
          { name: 'Monospace', text: transform(val, charMap.mono) },
          { name: 'Bubble', text: val.split('').map(c => {
            const code = c.toLowerCase().charCodeAt(0);
            if (code >= 97 && code <= 122) return String.fromCodePoint(0x24D0 + (code - 97));
            return c;
          }).join('') },
          { name: 'Square', text: val.split('').map(c => {
            const code = c.toLowerCase().charCodeAt(0);
            if (code >= 97 && code <= 122) return String.fromCodePoint(0x1F170 + (code - 97));
            return c;
          }).join('') }
        ]
      },
      {
        category: 'Gaming & PUBG Styles',
        items: [
          { name: 'Gun Style 1', text: `╾━╤デ╦︻ ${val} ︻╦デ╤━╼` },
          { name: 'Gun Style 2', text: `︻╦̵̵͇̿̿̿̿╤── ${val} ──╤̵̵͇̿̿̿̿╦︻` },
          { name: 'King Style', text: `꧁༒ ${val} ༒꧂` },
          { name: 'Boss Style', text: `亗 ${val} 亗` },
          { name: 'Smile Style', text: `╰‿╯ ${val} ╰‿╯` },
          { name: 'Thunder Style', text: `⚡ ${val} ⚡` },
          { name: 'Sword Style', text: `⚔️ ${val} ⚔️` },
          { name: 'Ninja Style', text: `〆 ${val} 〆` },
          { name: 'God Style', text: `ᴳᵒᵈ ${val}` },
          { name: 'Ghost Style', text: `👻 ${val} 👻` },
          { name: 'Biohazard', text: `☣️ ${val} ☣️` },
          { name: 'Skull', text: `☠️ ${val} ☠️` },
          { name: 'Slayer', text: `꧁☬ ${val} ☬꧂` }
        ]
      },
      {
        category: 'Instagram & TikTok Styles',
        items: [
          { name: 'Sparkle', text: `✧ ${val} ✧` },
          { name: 'Moon', text: `☾ ${val} ☽` },
          { name: 'Flower', text: `❀ ${val} ❀` },
          { name: 'Quotes', text: `˗ˏˋ ${val} ˎˊ˗` },
          { name: 'Cuddle', text: `꒰ ${val} ꒱` },
          { name: 'Starry', text: `⋆｡˚ ${val} ˚｡⋆` },
          { name: 'Angel', text: `ʚ ${val} ɞ` },
          { name: 'Cherry Blossom', text: `✿ ${val} ✿` }
        ]
      },
      {
        category: 'Facebook & WhatsApp Styles',
        items: [
          { name: 'Bubble Chat', text: `(っ◔◡◔)っ ${val}` },
          { name: 'Bracket', text: `【 ${val} 】` },
          { name: 'Banner', text: `◤ ${val} ◢` },
          { name: 'Star Box', text: `╰☆☆ ${val} ☆☆╮` },
          { name: 'Music Bars', text: `ıllıllı ${val} ıllıllı` },
          { name: 'Block Style', text: `░▒▓█ ${val} █▓▒░` },
          { name: 'Heart Style', text: `❤️ ${val} ❤️` },
          { name: 'Star Style', text: `⭐ ${val} ⭐` },
          { name: 'Fire Style', text: `🔥 ${val} 🔥` }
        ]
      },
      {
        category: 'Invisible & Blank Text',
        items: [
          { name: 'Blank Text (Small)', text: '\u3164' },
          { name: 'Blank Text (Medium)', text: '\u3164\u3164\u3164' },
          { name: 'Blank Text (Large)', text: '\u3164\u3164\u3164\u3164\u3164' }
        ]
      }
    ];
  }, [text]);

  return (
    <div className="space-y-12">
      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-sm">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-black text-gray-900 mb-2">Stylish Text Generator</h3>
            <p className="text-gray-500">Create cool fonts for WhatsApp, Instagram, and Gaming profiles.</p>
          </div>
          <div className="relative">
            <input 
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your name or text here..."
              className="w-full px-8 py-6 bg-gray-50 border border-transparent rounded-3xl focus:bg-white focus:border-[#00a884]/30 focus:ring-4 focus:ring-[#00a884]/5 outline-none transition-all text-xl font-medium"
            />
            {text && (
              <button 
                onClick={() => setText('')}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {styles.map((category) => (
          <div key={category.category} className="space-y-6">
            <div className="flex items-center gap-4">
              <h4 className="text-lg font-black text-gray-900 whitespace-nowrap">{category.category}</h4>
              <div className="h-px bg-gray-100 w-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.items.map((style) => (
                <div key={style.name} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black text-[#00a884] uppercase tracking-widest bg-[#00a884]/5 px-3 py-1 rounded-full">{style.name}</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(style.text);
                          alert('Copied to clipboard!');
                        }}
                        className="p-2.5 bg-gray-50 text-gray-400 hover:text-[#00a884] hover:bg-[#00a884]/10 rounded-xl transition-all"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xl text-gray-900 break-all font-medium leading-relaxed min-h-[3rem] flex items-center">
                      {style.text || <span className="text-gray-300 italic text-sm">Type something...</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Fake WhatsApp Generator Component ---
const FakeWhatsAppGenerator = () => {
  const [contactName, setContactName] = React.useState('John Doe');
  const [contactStatus, setContactStatus] = React.useState('online');
  const [profilePic, setProfilePic] = React.useState('');
  const [batteryLevel, setBatteryLevel] = React.useState(85);
  const [timeDisplay, setTimeDisplay] = React.useState('19:30');
  const [carrierSignals, setCarrierSignals] = React.useState('2');
  const [wifiEnabled, setWifiEnabled] = React.useState(true);
  const [headerIconSize, setHeaderIconSize] = React.useState(1.0);
  
  const [messages, setMessages] = React.useState<any[]>([
    { id: 1, type: 'sent', text: 'Hello, how are you doing today', time: '14:29', status: 'seen' }
  ]);
  
  const [newMessageText, setNewMessageText] = React.useState('');
  const [newMessageType, setNewMessageType] = React.useState('sent');
  const [newMessageTime, setNewMessageTime] = React.useState('14:30');
  const [newMessageStatus, setNewMessageStatus] = React.useState('seen');
  
  const [editingMessageId, setEditingMessageId] = React.useState<number | null>(null);
  const [editText, setEditText] = React.useState('');
  const [editTime, setEditTime] = React.useState('');
  
  const [isGenerating, setIsGenerating] = React.useState(false);
  const previewRef = React.useRef<HTMLDivElement>(null);

  const handleAddMessage = () => {
    if (!newMessageText.trim()) return;
    const newMessage = {
      id: Date.now(),
      type: newMessageType,
      text: newMessageText.trim(),
      time: newMessageTime,
      status: newMessageType === 'sent' ? newMessageStatus : 'none'
    };
    setMessages([...messages, newMessage]);
    setNewMessageText('');
  };

  const handleDeleteMessage = (id: number) => {
    setMessages(messages.filter(m => m.id !== id));
  };

  const handleEditMessage = (id: number) => {
    const msg = messages.find(m => m.id === id);
    if (msg) {
      setEditingMessageId(id);
      setEditText(msg.text);
      setEditTime(msg.time);
    }
  };

  const handleSaveEdit = () => {
    if (!editText.trim()) return;
    setMessages(messages.map(m => 
      m.id === editingMessageId ? { ...m, text: editText.trim(), time: editTime } : m
    ));
    setEditingMessageId(null);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all messages?')) {
      setMessages([]);
    }
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const generateScreenshot = async () => {
    if (!previewRef.current) return;
    setIsGenerating(true);
    
    try {
      // Small delay to ensure everything is rendered
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const dataURL = await domToPng(previewRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        width: 375,
        height: 720
      });
      
      const link = document.createElement('a');
      link.href = dataURL;
      const safeName = contactName.replace(/[^a-z0-9-_]+/gi, '_');
      link.download = `whatsapp_${safeName}_${Date.now()}.png`;
      link.click();
    } catch (error) {
      console.error('Screenshot error:', error);
      alert('Failed to generate screenshot. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* --- Controls Panel --- */}
      <div className="space-y-8">
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-[#00a884]" />
            Chat Settings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-2">Contact Name</label>
              <input 
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#00a884]/30 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-2">Status</label>
              <select 
                value={contactStatus}
                onChange={(e) => setContactStatus(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#00a884]/30 outline-none transition-all"
              >
                <option value="online">Online</option>
                <option value="last-seen">Last seen recently</option>
                <option value="typing">typing...</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-gray-700 ml-2">Profile Picture URL</label>
              <input 
                type="text"
                value={profilePic}
                onChange={(e) => setProfilePic(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#00a884]/30 outline-none transition-all"
              />
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-2">Battery Level ({batteryLevel}%)</label>
              <input 
                type="range"
                min="0"
                max="100"
                value={batteryLevel}
                onChange={(e) => setBatteryLevel(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#00a884]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-2">System Time</label>
              <input 
                type="time"
                value={timeDisplay}
                onChange={(e) => setTimeDisplay(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#00a884]/30 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-2">Carrier Signals</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="signals" value="1" checked={carrierSignals === '1'} onChange={(e) => setCarrierSignals(e.target.value)} className="accent-[#00a884]" />
                  <span className="text-sm text-gray-600">1 Carrier</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="signals" value="2" checked={carrierSignals === '2'} onChange={(e) => setCarrierSignals(e.target.value)} className="accent-[#00a884]" />
                  <span className="text-sm text-gray-600">2 Carriers</span>
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-2">WiFi Enabled</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={wifiEnabled} onChange={(e) => setWifiEnabled(e.target.checked)} className="w-5 h-5 accent-[#00a884] rounded" />
                <span className="text-sm text-gray-600">Show WiFi Icon</span>
              </label>
            </div>
          </div>
        </div>

        {/* --- Message Controls --- */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#00a884]" />
            Add Message
          </h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-2">Type</label>
                <select 
                  value={newMessageType}
                  onChange={(e) => setNewMessageType(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#00a884]/30 outline-none transition-all"
                >
                  <option value="sent">Sent</option>
                  <option value="received">Received</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-2">Time</label>
                <input 
                  type="time"
                  value={newMessageTime}
                  onChange={(e) => setNewMessageTime(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#00a884]/30 outline-none transition-all"
                />
              </div>
            </div>

            {newMessageType === 'sent' && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-2">Status</label>
                <select 
                  value={newMessageStatus}
                  onChange={(e) => setNewMessageStatus(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#00a884]/30 outline-none transition-all"
                >
                  <option value="sent">Sent (1 tick)</option>
                  <option value="delivered">Delivered (2 ticks)</option>
                  <option value="seen">Seen (Blue ticks)</option>
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-2">Message Text</label>
              <textarea 
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddMessage();
                  }
                }}
                className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#00a884]/30 outline-none transition-all min-h-[100px]"
                placeholder="Type a message..."
              />
            </div>

            <Button 
              onClick={handleAddMessage}
              className="w-full bg-[#00a884] text-white hover:bg-[#008f6f] py-4 font-bold rounded-2xl"
            >
              Add Message
            </Button>
          </div>
        </div>

        {/* --- Message List --- */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-gray-900">Messages</h3>
            <button 
              onClick={handleClearAll}
              className="text-red-500 font-bold text-sm hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          </div>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`p-4 rounded-2xl border ${msg.type === 'sent' ? 'bg-[#e8f5e8] border-green-100' : 'bg-blue-50 border-blue-100'}`}>
                {editingMessageId === msg.id ? (
                  <div className="space-y-4">
                    <textarea 
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#00a884]"
                    />
                    <div className="flex gap-2">
                      <input 
                        type="time"
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                        className="p-2 bg-white border border-gray-200 rounded-xl outline-none"
                      />
                      <button onClick={handleSaveEdit} className="px-4 py-2 bg-[#00a884] text-white rounded-xl font-bold text-sm">Save</button>
                      <button onClick={() => setEditingMessageId(null)} className="px-4 py-2 bg-gray-200 text-gray-600 rounded-xl font-bold text-sm">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase mb-1">{msg.type}</div>
                      <p className="text-gray-800 text-sm mb-1">{msg.text}</p>
                      <div className="text-[10px] text-gray-400">{formatTime(msg.time)}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditMessage(msg.id)} className="p-2 text-gray-400 hover:text-[#00a884] transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteMessage(msg.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-center py-10 text-gray-400 italic">No messages yet...</div>
            )}
          </div>
        </div>
      </div>

      {/* --- Preview Panel --- */}
      <div className="space-y-8">
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm sticky top-40">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-gray-900">Live Preview</h3>
            <Button 
              onClick={generateScreenshot}
              disabled={isGenerating}
              className="bg-[#00a884] text-white hover:bg-[#008f6f] px-6 py-3 font-bold rounded-xl shadow-lg shadow-[#00a884]/20 flex items-center gap-2"
            >
              {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
              Generate Screenshot
            </Button>
          </div>

          <div className="flex justify-center w-full overflow-x-auto pb-10 custom-scrollbar">
            {/* Phone Mockup */}
            <div 
              className="w-[375px] h-[720px] shrink-0 rounded-[40px] border-[8px] overflow-hidden relative shadow-2xl flex flex-col font-sans mx-auto"
              style={{ 
                backgroundColor: '#ffffff',
                borderColor: '#111827',
                fontFamily: "'-apple-system', BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" 
              }}
            >
              {/* Capture Area */}
              <div 
                ref={previewRef} 
                className="w-full h-full flex flex-col overflow-hidden bg-white"
                style={{ width: '375px', height: '720px' }}
              >
                {/* Status Bar */}
                <div 
                  className="px-4 py-2 flex justify-between items-center text-[12px] font-medium shrink-0"
                  style={{ backgroundColor: '#075e54', color: '#ffffff' }}
                >
                  <div className="font-bold">{timeDisplay}</div>
                  <div className="flex items-center gap-1.5">
                    <Signal className="w-3.5 h-3.5" />
                    {carrierSignals === '2' && <Signal className="w-3.5 h-3.5" />}
                    {wifiEnabled && <Wifi className="w-3.5 h-3.5" />}
                    <div className="flex items-center gap-1 ml-1">
                      <span className="text-[10px] font-bold">{batteryLevel}%</span>
                      <div className="w-6 h-3 border rounded-[3px] relative p-[1px]" style={{ borderColor: 'rgba(255,255,255,0.8)' }}>
                        <div 
                          className={`h-full rounded-[1px] ${batteryLevel <= 20 ? 'bg-red-500' : ''}`}
                          style={{ 
                            width: `${batteryLevel}%`,
                            backgroundColor: batteryLevel <= 20 ? '#ef4444' : '#ffffff'
                          }}
                        />
                        <div className="absolute -right-[3px] top-1/2 -translate-y-1/2 w-[2px] h-1.5 rounded-r-sm" style={{ backgroundColor: 'rgba(255,255,255,0.8)' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat Header */}
                <div 
                  className="border-b px-3 py-2 flex items-center justify-between shrink-0 shadow-sm z-10"
                  style={{ backgroundColor: '#ffffff', borderColor: '#f3f4f6' }}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <ArrowLeft className="w-6 h-6 shrink-0" style={{ color: '#00a884' }} />
                    <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden shrink-0 bg-gray-200" style={{ color: '#ffffff' }}>
                      {profilePic ? (
                        <img src={profilePic} alt="avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full bg-[#00a884] flex items-center justify-center">
                          <UserIcon className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-[15px] truncate leading-tight" style={{ color: '#111827' }}>{contactName || 'John Doe'}</div>
                      <div className="text-[11px] leading-tight" style={{ color: '#00a884' }}>
                        {contactStatus === 'online' ? 'Online' : contactStatus === 'typing' ? 'typing...' : 'Last seen recently'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-2" style={{ color: '#00a884' }}>
                    <Video className="w-5 h-5" />
                    <Phone className="w-5 h-5" />
                    <MoreVertical className="w-5 h-5" />
                  </div>
                </div>

                {/* Messages Area */}
                <div 
                  className="flex-1 overflow-y-auto p-4 space-y-3 relative"
                  style={{ 
                    backgroundColor: '#efeae2',
                    backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                    backgroundSize: '400px'
                  }}
                >
                  <div className="flex justify-center my-4">
                    <span className="px-3 py-1 rounded-lg text-[11px] font-bold shadow-sm uppercase tracking-wider" style={{ backgroundColor: '#d1e4f3', color: '#4b5563' }}>Today</span>
                  </div>
                  
                  <div className="flex justify-center mb-4">
                    <div className="px-4 py-2 rounded-xl text-[11px] text-center shadow-sm max-w-[95%] border border-yellow-100" style={{ backgroundColor: '#fff9c4', color: '#4b5563' }}>
                      <span className="flex items-center justify-center gap-2">
                        <Clock className="w-3.5 h-3.5 shrink-0" /> 
                        <span>Messages are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them. Click to learn more.</span>
                      </span>
                    </div>
                  </div>

                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
                      <div 
                        className={`max-w-[85%] px-3 py-1.5 rounded-xl relative shadow-sm text-[14px] ${
                          msg.type === 'sent' 
                            ? 'rounded-tr-none' 
                            : 'rounded-tl-none'
                        }`}
                        style={{ backgroundColor: msg.type === 'sent' ? '#e1ffc7' : '#ffffff' }}
                      >
                        <div className="leading-relaxed whitespace-pre-wrap" style={{ color: '#111827' }}>{msg.text}</div>
                        <div className="flex items-center justify-end gap-1 mt-0.5">
                          <span className="text-[10px]" style={{ color: '#667781' }}>{formatTime(msg.time)}</span>
                          {msg.type === 'sent' && (
                            <span className="shrink-0">
                              {msg.status === 'sent' && <Check className="w-3.5 h-3.5" style={{ color: '#667781' }} />}
                              {msg.status === 'delivered' && <CheckCheck className="w-3.5 h-3.5" style={{ color: '#667781' }} />}
                              {msg.status === 'seen' && <CheckCheck className="w-3.5 h-3.5" style={{ color: '#53bdeb' }} />}
                            </span>
                          )}
                        </div>
                        {/* Tail */}
                        <div 
                          className={`absolute top-0 w-2.5 h-3.5 ${
                            msg.type === 'sent' 
                              ? '-right-2' 
                              : '-left-2'
                          }`}
                          style={{
                            backgroundColor: msg.type === 'sent' ? '#e1ffc7' : '#ffffff',
                            clipPath: msg.type === 'sent' 
                              ? 'polygon(0 0, 0 100%, 100% 0)' 
                              : 'polygon(100% 0, 100% 100%, 0 0)'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input Area */}
                <div className="p-2 flex items-center gap-2 shrink-0" style={{ backgroundColor: '#f0f2f6' }}>
                  <div className="flex-1 rounded-full px-4 py-2.5 flex items-center gap-3 shadow-sm" style={{ backgroundColor: '#ffffff' }}>
                    <Smile className="w-6 h-6" style={{ color: '#8696a0' }} />
                    <div className="flex-1 text-[15px]" style={{ color: '#8696a0' }}>Type a message</div>
                    <Paperclip className="w-6 h-6 -rotate-45" style={{ color: '#8696a0' }} />
                    <Camera className="w-6 h-6" style={{ color: '#8696a0' }} />
                  </div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md shrink-0" style={{ backgroundColor: '#00a884', color: '#ffffff' }}>
                    <Mic className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
  const [historyState, setHistoryState] = React.useState<Record<number, { history: string[], index: number }>>({});
  const isUndoing = React.useRef(false);
  
  const containerRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Save state to history
  const saveHistory = (pageNumber: number, canvas: any) => {
    if (isUndoing.current) return;
    const json = JSON.stringify(canvas.toJSON());
    setHistoryState(prev => {
      const pageState = prev[pageNumber] || { history: [], index: -1 };
      const newHistory = pageState.history.slice(0, pageState.index + 1);
      
      // Don't save if state is identical to current
      if (newHistory.length > 0 && newHistory[newHistory.length - 1] === json) {
        return prev;
      }

      newHistory.push(json);
      // Limit history to 50 steps
      if (newHistory.length > 50) newHistory.shift();
      
      return { 
        ...prev, 
        [pageNumber]: { 
          history: newHistory, 
          index: newHistory.length - 1 
        } 
      };
    });
  };

  const undo = () => {
    const canvas = fabricCanvases[currentPage];
    const pageState = historyState[currentPage];
    if (!canvas || !pageState || pageState.index <= 0) return;

    const newIndex = pageState.index - 1;
    const stateStr = pageState.history[newIndex];
    if (!stateStr) return;

    isUndoing.current = true;
    try {
      const state = JSON.parse(stateStr);
      canvas.loadFromJSON(state).then(() => {
        canvas.renderAll();
        setHistoryState(prev => ({
          ...prev,
          [currentPage]: { ...prev[currentPage], index: newIndex }
        }));
        isUndoing.current = false;
      }).catch(() => {
        isUndoing.current = false;
      });
    } catch (e) {
      console.error('Undo error:', e);
      isUndoing.current = false;
    }
  };

  const redo = () => {
    const canvas = fabricCanvases[currentPage];
    const pageState = historyState[currentPage];
    if (!canvas || !pageState || pageState.index >= pageState.history.length - 1) return;

    const newIndex = pageState.index + 1;
    const stateStr = pageState.history[newIndex];
    if (!stateStr) return;

    isUndoing.current = true;
    try {
      const state = JSON.parse(stateStr);
      canvas.loadFromJSON(state).then(() => {
        canvas.renderAll();
        setHistoryState(prev => ({
          ...prev,
          [currentPage]: { ...prev[currentPage], index: newIndex }
        }));
        isUndoing.current = false;
      }).catch(() => {
        isUndoing.current = false;
      });
    } catch (e) {
      console.error('Redo error:', e);
      isUndoing.current = false;
    }
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
    if (activeObjects.length === 0) return;
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
            disabled={!historyState[currentPage] || historyState[currentPage].index <= 0}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-all"
            title="Undo"
          >
            <Undo className="w-5 h-5" />
          </button>
          <button 
            onClick={redo}
            disabled={!historyState[currentPage] || historyState[currentPage].index >= (historyState[currentPage].history.length - 1)}
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
const ShortURLGenerator = ({ user }: { user: User | null }) => {
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

  const handleShorten = async () => {
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

    try {
      const shortId = alias.trim() || Math.random().toString(36).substring(2, 8);
      
      // Check if alias already exists
      const docRef = doc(db, 'shortlinks', shortId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        if (alias.trim()) {
          alert('This custom alias is already taken. Please try another one.');
          setIsShortening(false);
          return;
        } else {
          // If random ID exists (unlikely but possible), try again
          handleShorten();
          return;
        }
      }

      // Save to Firestore
      await setDoc(docRef, {
        shortId,
        originalUrl: url,
        authorUid: user?.uid || 'anonymous',
        createdAt: serverTimestamp(),
        clicks: 0
      });

      const shortUrl = `https://linksshare.online/s/${shortId}`;
      setResult(shortUrl);
      
      const newHistory = [
        { id: Date.now(), original: url, short: shortUrl, date: new Date().toLocaleDateString() },
        ...history
      ].slice(0, 10);
      
      setHistory(newHistory);
      localStorage.setItem('url-history', JSON.stringify(newHistory));
    } catch (err) {
      console.error('Shortening error:', err);
      alert('An error occurred while shortening your URL. Please try again.');
    } finally {
      setIsShortening(false);
    }
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
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">linksshare.online/s/</span>
                <input 
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="custom-alias"
                  className="w-full pl-44 pr-5 py-5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#00a884]/30 focus:ring-4 focus:ring-[#00a884]/5 outline-none transition-all"
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

const ReadMoreGenerator = () => {
  const [visibleText, setVisibleText] = React.useState('');
  const [hiddenText, setHiddenText] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    if (!visibleText && !hiddenText) return;
    
    // The "Read More" magic separator
    // \u200E is Left-to-Right Mark
    // We use a large number of them to force WhatsApp to truncate
    const separator = "\u200E".repeat(4000);
    const fullText = `${visibleText}\n${separator}${hiddenText}`;
    
    try {
      navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard. Please try manually.');
    }
  };

  return (
    <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Input Side */}
        <div className="space-y-8">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#00a884]" /> Visible Text (Before "Read More")
            </label>
            <textarea
              value={visibleText}
              onChange={(e) => setVisibleText(e.target.value)}
              placeholder="e.g., I have a secret for you..."
              className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 min-h-[120px] text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-red-500" /> Hidden Text (After "Read More")
            </label>
            <textarea
              value={hiddenText}
              onChange={(e) => setHiddenText(e.target.value)}
              placeholder="e.g., You are awesome! 😂"
              className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 min-h-[120px] text-lg"
            />
          </div>

          <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
                <Info className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-black text-blue-900 mb-1">How it works</h4>
                <p className="text-sm text-blue-700 leading-relaxed">
                  We insert special invisible characters between your texts. When you paste this into WhatsApp, it will show the first part with a "Read More" button.
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={copyToClipboard}
            className="w-full py-4 text-lg shadow-lg shadow-[#00a884]/20"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            {copied ? 'Copied to Clipboard!' : 'Generate & Copy Message'}
          </Button>
        </div>

        {/* Preview Side */}
        <div className="space-y-6">
          <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-[#00a884]" /> WhatsApp Preview
          </label>
          
          <div className="bg-[#e5ddd5] rounded-[2.5rem] p-8 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden border border-gray-200">
            {/* WhatsApp Background Pattern (Simplified) */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '20px 20px' }} />
            
            <div className="relative z-10 w-full max-w-[300px]">
              <div className="bg-white rounded-2xl p-4 shadow-sm relative self-start max-w-[90%]">
                <div className="text-gray-900 text-sm leading-relaxed break-words">
                  <div className="whitespace-pre-wrap">{visibleText || 'Your visible text...'}</div>
                  <div className="text-[#00a884] font-bold cursor-pointer hover:underline mt-1">read more</div>
                </div>
                <div className="flex justify-end mt-1">
                  <span className="text-[10px] text-gray-400">12:34 PM</span>
                </div>
                {/* Bubble Tail */}
                <div className="absolute top-0 -left-2 w-4 h-4 bg-white" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500 font-medium italic">
                  Note: The "Read More" button will appear automatically when you paste the generated text into WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const WhatsAppLinkGenerator = () => {
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [generatedLink, setGeneratedLink] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  const [qrColor, setQrColor] = React.useState('#000000');
  const [qrBgColor, setQrBgColor] = React.useState('#ffffff');

  const generateLink = () => {
    if (!phoneNumber) return;
    // Remove non-numeric characters
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    const link = `https://wa.me/${cleanNumber}${message ? `?text=${encodedMessage}` : ''}`;
    setGeneratedLink(link);
  };

  const copyToClipboard = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const canvas = document.getElementById('whatsapp-qr') as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'whatsapp-link-qr.png';
    link.href = url;
    link.click();
  };

  return (
    <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Input Side */}
        <div className="space-y-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#00a884]" /> Phone Number (with Country Code)
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g., 923001234567"
                className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 text-lg"
              />
              <p className="mt-2 text-xs text-gray-400">Don't include '+' or '00' at the start.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#00a884]" /> Pre-filled Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g., Hello, I am interested in your services!"
                className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 min-h-[120px] text-lg"
              />
            </div>

            <Button 
              onClick={generateLink}
              disabled={!phoneNumber}
              className="w-full py-4 text-lg shadow-lg shadow-[#00a884]/20"
            >
              <Sparkles className="w-5 h-5" /> Generate WhatsApp Link
            </Button>
          </div>

          {generatedLink && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-[#00a884]/5 rounded-[2rem] border border-[#00a884]/10 space-y-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-black text-[#00a884] uppercase tracking-widest mb-1">Your Link</label>
                  <p className="text-sm font-medium text-gray-900 truncate">{generatedLink}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={copyToClipboard}
                    className="p-3 bg-white text-[#00a884] rounded-xl border border-[#00a884]/20 hover:bg-[#00a884] hover:text-white transition-all shadow-sm"
                    title="Copy Link"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                  <a 
                    href={generatedLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white text-[#00a884] rounded-xl border border-[#00a884]/20 hover:bg-[#00a884] hover:text-white transition-all shadow-sm"
                    title="Open Link"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* QR Code Side */}
        <div className="space-y-8">
          <div className="bg-gray-50 rounded-[2.5rem] p-8 flex flex-col items-center justify-center border border-gray-100 min-h-[400px]">
            <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/50 mb-8">
              <QRCodeCanvas
                id="whatsapp-qr"
                value={generatedLink || 'https://wa.me/'}
                size={200}
                level="H"
                fgColor={qrColor}
                bgColor={qrBgColor}
                includeMargin={true}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-8">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 text-center">QR Color</label>
                <input 
                  type="color" 
                  value={qrColor}
                  onChange={(e) => setQrColor(e.target.value)}
                  className="w-full h-10 rounded-xl cursor-pointer border-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 text-center">BG Color</label>
                <input 
                  type="color" 
                  value={qrBgColor}
                  onChange={(e) => setQrBgColor(e.target.value)}
                  className="w-full h-10 rounded-xl cursor-pointer border-none"
                />
              </div>
            </div>

            <Button 
              variant="outline"
              disabled={!generatedLink}
              onClick={downloadQR}
              className="w-full max-w-xs py-3 rounded-xl border-2"
            >
              <Download className="w-4 h-4" /> Download QR Code
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const WhatsAppDPBorderMaker = () => {
  const [image, setImage] = React.useState<string | null>(null);
  const [borderWidth, setBorderWidth] = React.useState(10);
  const [borderColor, setBorderColor] = React.useState('#00a884');
  const [borderStyle, setBorderStyle] = React.useState<'solid' | 'dashed' | 'double'>('solid');
  const [isDownloading, setIsDownloading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadImage = () => {
    if (!image) return;
    setIsDownloading(true);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const size = Math.max(img.width, img.height);
      canvas.width = size;
      canvas.height = size;

      if (ctx) {
        // Draw circular clipping path
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();

        // Draw image centered
        const offsetX = (size - img.width) / 2;
        const offsetY = (size - img.height) / 2;
        ctx.drawImage(img, offsetX, offsetY);

        // Draw border
        ctx.lineWidth = (borderWidth / 100) * size;
        ctx.strokeStyle = borderColor;
        
        if (borderStyle === 'dashed') {
          ctx.setLineDash([size / 20, size / 40]);
        } else if (borderStyle === 'double') {
          // Inner border
          ctx.lineWidth = ((borderWidth / 100) * size) / 3;
          ctx.stroke();
          // Outer border
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, (size / 2) - (ctx.lineWidth * 2), 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.stroke();
        }

        const link = document.createElement('a');
        link.download = 'whatsapp-dp-border.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
      setIsDownloading(false);
    };
    img.src = image;
  };

  return (
    <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Controls Side */}
        <div className="space-y-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#00a884]" /> Upload Profile Picture
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-40 border-2 border-dashed border-gray-200 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-[#00a884] hover:bg-[#00a884]/5 transition-all group"
              >
                <Camera className="w-8 h-8 text-gray-300 group-hover:text-[#00a884] mb-2" />
                <span className="text-sm font-bold text-gray-400 group-hover:text-[#00a884]">Click to upload image</span>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            {image && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center justify-between">
                    <span>Border Width</span>
                    <span className="text-[#00a884]">{borderWidth}px</span>
                  </label>
                  <input 
                    type="range" 
                    min="1" 
                    max="50" 
                    value={borderWidth}
                    onChange={(e) => setBorderWidth(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#00a884]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Border Color</label>
                    <div className="flex gap-2 flex-wrap">
                      {['#00a884', '#2563eb', '#dc2626', '#9333ea', '#f59e0b', '#000000'].map(color => (
                        <button
                          key={color}
                          onClick={() => setBorderColor(color)}
                          className={`w-8 h-8 rounded-full border-2 ${borderColor === color ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      <input 
                        type="color" 
                        value={borderColor}
                        onChange={(e) => setBorderColor(e.target.value)}
                        className="w-8 h-8 rounded-full cursor-pointer border-none p-0 overflow-hidden"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Style</label>
                    <select 
                      value={borderStyle}
                      onChange={(e) => setBorderStyle(e.target.value as any)}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 font-bold text-gray-700"
                    >
                      <option value="solid">Solid</option>
                      <option value="dashed">Dashed</option>
                      <option value="double">Double</option>
                    </select>
                  </div>
                </div>

                <Button 
                  onClick={downloadImage}
                  className="w-full py-4 text-lg shadow-lg shadow-[#00a884]/20"
                >
                  {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                  Download DP with Border
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Preview Side */}
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="relative group">
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shadow-2xl shadow-gray-200/50 relative">
              {image ? (
                <div 
                  className="w-full h-full rounded-full overflow-hidden relative"
                  style={{ 
                    padding: `${borderWidth}px`,
                    backgroundColor: borderStyle === 'solid' ? borderColor : 'transparent'
                  }}
                >
                  <div 
                    className="w-full h-full rounded-full overflow-hidden bg-white relative"
                    style={{
                      border: borderStyle !== 'solid' ? `${borderWidth}px ${borderStyle} ${borderColor}` : 'none'
                    }}
                  >
                    <img 
                      src={image} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center p-8">
                  <Camera className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-sm font-bold text-gray-300">Upload a photo to see the preview</p>
                </div>
              )}
            </div>
            {image && (
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg border border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Circular Preview
              </div>
            )}
          </div>

          {image && (
            <div className="text-center max-w-xs">
              <p className="text-xs text-gray-400 font-medium">
                Note: WhatsApp will automatically crop your image into a circle. This tool helps you add a border that fits perfectly within that circle.
              </p>
            </div>
          )}
        </div>
      </div>
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

// --- WhatsApp Group Name Generator Component ---
// --- WhatsApp Status Formatter Component ---
// --- M3U Playlist Viewer Component ---
const M3UPlaylistViewer = () => {
  const [url, setUrl] = React.useState('');
  const [channels, setChannels] = React.useState<any[]>([]);
  const [filteredChannels, setFilteredChannels] = React.useState<any[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortOrder, setSortOrder] = React.useState('default');
  const [countryFilter, setCountryFilter] = React.useState('');
  const [groupFilter, setGroupFilter] = React.useState('');
  const [countries, setCountries] = React.useState<string[]>([]);
  const [groups, setGroups] = React.useState<string[]>([]);
  const [displayLimit, setDisplayLimit] = React.useState(500);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const processM3U = (content: string) => {
    const lines = content.split(/\r?\n/);
    let count = 0;
    const allChannels: any[] = [];
    const foundCountries = new Set<string>();
    const foundGroups = new Set<string>();

    const chunkSize = 500;
    let currentLine = 0;

    const processChunk = () => {
      const startTime = performance.now();
      while (currentLine < lines.length && performance.now() - startTime < 50) {
        if (lines[currentLine].startsWith('#EXTINF')) {
          if (currentLine + 1 < lines.length && !lines[currentLine + 1].startsWith('#')) {
            const extinf = lines[currentLine];
            const channelUrl = lines[currentLine + 1];

            let name = 'Unknown';
            let logo = '';
            let group = '';
            let country = '';

            const tvgNameMatch = extinf.match(/tvg-name="([^"]*)"/);
            const tvgLogoMatch = extinf.match(/tvg-logo="([^"]*)"/);
            const groupMatch = extinf.match(/group-title="([^"]*)"/);
            const nameMatch = extinf.match(/,(.+)$/);
            const countryMatch = extinf.match(/tvg-country="([^"]*)"/);

            if (tvgNameMatch) name = tvgNameMatch[1] || 'Unknown';
            if (tvgLogoMatch) logo = tvgLogoMatch[1] || '';
            if (groupMatch) group = groupMatch[1] || '';
            if (countryMatch) country = countryMatch[1] || '';
            if (nameMatch && nameMatch[1].trim() && name === 'Unknown') name = nameMatch[1].trim();

            if (country) foundCountries.add(country);
            if (group) foundGroups.add(group);

            allChannels.push({ name, logo, group, country, extinf, url: channelUrl });
            count++;
            currentLine++;
          }
        }
        currentLine++;
      }

      const newProgress = Math.min(100, Math.round((currentLine / lines.length) * 100));
      setProgress(newProgress);

      if (currentLine < lines.length) {
        requestAnimationFrame(processChunk);
      } else {
        setChannels(allChannels);
        setFilteredChannels(allChannels);
        setCountries(Array.from(foundCountries).sort());
        setGroups(Array.from(foundGroups).sort());
        setIsProcessing(false);
      }
    };

    processChunk();
  };

  const handlePlaylist = async () => {
    if (!url && !fileInputRef.current?.files?.[0]) {
      alert('Please enter a URL or upload a file');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setChannels([]);
    setFilteredChannels([]);

    try {
      let content = '';
      if (url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
        content = await response.text();
      } else if (fileInputRef.current?.files?.[0]) {
        content = await fileInputRef.current.files[0].text();
      }
      processM3U(content);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
      setIsProcessing(false);
    }
  };

  React.useEffect(() => {
    let result = [...channels];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(term) || 
        c.group.toLowerCase().includes(term) || 
        c.country.toLowerCase().includes(term)
      );
    }

    if (countryFilter) {
      result = result.filter(c => c.country === countryFilter);
    }

    if (groupFilter) {
      result = result.filter(c => c.group === groupFilter);
    }

    if (sortOrder === 'nameAsc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === 'nameDesc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    setFilteredChannels(result);
    setDisplayLimit(500);
  }, [searchTerm, sortOrder, countryFilter, groupFilter, channels]);

  const copyAll = () => {
    const content = "#EXTM3U\n" + channels.map(c => `${c.extinf}\n${c.url}`).join('\n');
    navigator.clipboard.writeText(content);
    alert('Full playlist copied!');
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-sm">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700">M3U/M3U8 URL</label>
            <input 
              type="url" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste your M3U or M3U8 URL here..."
              className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#00a884]/30 focus:ring-4 focus:ring-[#00a884]/5 outline-none transition-all"
            />
            <div className="text-xs text-gray-400">
              Example: <button onClick={() => setUrl('https://iptv-org.github.io/iptv/index.m3u')} className="text-[#00a884] hover:underline">https://iptv-org.github.io/iptv/index.m3u</button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-px bg-gray-100 flex-1" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">OR</span>
            <div className="h-px bg-gray-100 flex-1" />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700">Upload M3U File</label>
            <input 
              type="file" 
              ref={fileInputRef}
              accept=".m3u,.m3u8"
              className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#00a884]/30 focus:ring-4 focus:ring-[#00a884]/5 outline-none transition-all"
            />
          </div>

          <Button 
            onClick={handlePlaylist}
            disabled={isProcessing}
            className="w-full bg-[#00a884] text-white hover:bg-[#008f6f] py-6 font-black rounded-2xl shadow-xl shadow-[#00a884]/20 text-lg"
          >
            {isProcessing ? (
              <><Loader2 className="w-6 h-6 mr-2 animate-spin" /> Processing {progress}%...</>
            ) : (
              <><Search className="w-6 h-6 mr-2" /> Analyze Playlist</>
            )}
          </Button>
        </div>
      </div>

      {channels.length > 0 && (
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-[#00a884]/10 rounded-xl">
                <span className="text-[#00a884] font-black">{filteredChannels.length}</span>
                <span className="text-gray-400 text-xs ml-2 uppercase font-bold">Channels Found</span>
              </div>
              <button onClick={copyAll} className="text-sm font-bold text-gray-500 hover:text-[#00a884] flex items-center gap-2">
                <Copy className="w-4 h-4" /> Copy All
              </button>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search channels..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-[#00a884]/30 outline-none text-sm transition-all"
                />
              </div>
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-[#00a884]/30 outline-none text-sm transition-all"
              >
                <option value="default">Default Order</option>
                <option value="nameAsc">Name (A-Z)</option>
                <option value="nameDesc">Name (Z-A)</option>
              </select>
              <select 
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-[#00a884]/30 outline-none text-sm transition-all"
              >
                <option value="">All Countries</option>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select 
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-[#00a884]/30 outline-none text-sm transition-all"
              >
                <option value="">All Groups</option>
                {groups.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChannels.slice(0, displayLimit).map((channel, idx) => (
              <div key={idx} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-gray-100">
                    {channel.logo ? (
                      <img src={channel.logo} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <Play className="w-6 h-6 text-gray-200" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 truncate">{channel.name}</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {channel.group && <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md uppercase">{channel.group}</span>}
                      {channel.country && <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-50 text-orange-600 rounded-md uppercase">{channel.country}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-gray-400 break-all mb-4 line-clamp-1">
                  {channel.url}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${channel.extinf}\n${channel.url}`);
                      alert('Channel info copied!');
                    }}
                    className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-600 transition-all"
                  >
                    Copy Info
                  </button>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(channel.url);
                      alert('URL copied!');
                    }}
                    className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-600 transition-all"
                  >
                    Copy URL
                  </button>
                  <a 
                    href={channel.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-[#00a884]/10 text-[#00a884] rounded-xl hover:bg-[#00a884] hover:text-white transition-all"
                  >
                    <Play className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {filteredChannels.length > displayLimit && (
            <div className="text-center pt-8">
              <Button 
                variant="outline"
                onClick={() => setDisplayLimit(prev => prev + 500)}
                className="px-12 py-4 rounded-2xl font-bold"
              >
                Load More Channels
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const WhatsAppStatusFormatter = () => {
  const [text, setText] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'native' | 'stylish'>('native');

  const applyFormat = (prefix: string, suffix: string) => {
    const textarea = document.getElementById('status-input') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);
    
    if (selectedText) {
      const newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);
      setText(newText);
    } else {
      setText(text + prefix + suffix);
    }
  };

  const stylishFonts = (str: string) => {
    if (!str) return [];
    
    const maps: Record<string, Record<string, string>> = {
      bold: {
        a: '𝐚', b: '𝐛', c: '𝐜', d: '𝐝', e: '𝐞', f: '𝐟', g: '𝐠', h: '𝐡', i: '𝐢', j: '𝐣', k: '𝐤', l: '𝐥', m: '𝐦', n: '𝐧', o: '𝐨', p: '𝐩', q: '𝐪', r: '𝐫', s: '𝐬', t: '𝐭', u: '𝐮', v: '𝐯', w: '𝐰', x: '𝐱', y: '𝐲', z: '𝐳',
        A: '𝐀', B: '𝐁', C: '𝐂', D: '𝐃', E: '𝐄', F: '𝐅', G: '𝐆', H: '𝐇', I: '𝐈', J: '𝐉', K: '𝐊', L: '𝐋', M: '𝐌', N: '𝐍', O: '𝐎', P: '𝐏', Q: '𝐐', R: '𝐑', S: '𝐒', T: '𝐓', U: '𝐔', V: '𝐕', W: '𝐖', X: '𝐗', Y: '𝐘', Z: '𝐙',
        '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
      },
      italic: {
        a: '𝑎', b: '𝑏', c: '𝑐', d: '𝑑', e: '𝑒', f: '𝑓', g: '𝑔', h: 'ℎ', i: '𝑖', j: '𝑗', k: '𝑘', l: '𝑙', m: '𝑚', n: '𝑛', o: '𝑜', p: '𝑝', q: '𝑞', r: '𝑟', s: '𝑠', t: '𝑡', u: '𝑢', v: '𝑣', w: '𝑤', x: '𝑥', y: '𝑦', z: '𝑧',
        A: '𝐴', B: '𝐵', C: '𝐶', D: '𝐷', E: '𝐸', F: '𝐹', G: '𝐺', H: '𝐻', I: '𝐼', J: '𝐽', K: '𝐾', L: '𝐿', M: '𝑀', N: '𝑁', O: '𝑂', P: '𝑃', Q: '𝑄', R: '𝑅', S: '𝑆', T: '𝑇', U: '𝑈', V: '𝑉', W: '𝑊', X: '𝑋', Y: '𝑌', Z: '𝑍'
      },
      mono: {
        a: '𝚊', b: '𝚋', c: '𝚌', d: '𝚍', e: '𝚎', f: '𝚏', g: '𝚐', h: '𝚑', i: '𝚒', j: '𝚓', k: '𝚔', l: '𝚕', m: '𝚖', n: '𝚗', o: '𝚘', p: '𝚙', q: '𝚚', r: '𝚛', s: '𝚜', t: '𝚝', u: '𝚞', v: '𝚟', w: '𝚠', x: '𝚡', y: '𝚢', z: '𝚣',
        A: '𝙰', B: '𝙱', C: '𝙲', D: '𝙳', E: '𝙴', F: '𝙵', G: '𝙶', H: '𝙷', I: '𝙸', J: '𝙹', K: '𝙺', L: '𝙻', M: '𝙼', N: '𝙽', O: '𝙾', P: '𝙿', Q: '𝚀', R: '𝚁', S: '𝚂', T: '𝚃', U: '𝚄', V: '𝚅', W: '𝚆', X: '𝚇', Y: '𝚈', Z: '𝚉',
        '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿'
      },
      script: {
        a: '𝒶', b: '𝒷', c: '𝒸', d: '𝒹', e: '𝑒', f: '𝒻', g: '𝑔', h: '𝒽', i: '𝒾', j: '𝒿', k: '𝓀', l: '𝓁', m: '𝓂', n: '𝓃', o: '𝑜', p: '𝓅', q: '𝓆', r: '𝓇', s: '𝓈', t: '𝓉', u: '𝓊', v: '𝓋', w: '𝓌', x: '𝓍', y: '𝓎', z: '𝓏',
        A: '𝒜', B: 'ℬ', C: '𝒞', D: '𝒟', E: 'ℰ', F: 'ℱ', G: '𝒢', H: 'ℋ', I: 'ℐ', J: '𝒥', K: '𝒦', L: 'ℒ', M: 'ℳ', N: '𝒩', O: '𝒪', P: '𝒫', Q: '𝒬', R: 'ℛ', S: '𝒮', T: '𝒯', U: '𝒰', V: '𝒱', W: '𝒲', X: '𝒳', Y: '𝒴', Z: '𝒵'
      },
      bubble: {
        a: 'ⓐ', b: 'ⓑ', c: 'ⓒ', d: 'ⓓ', e: 'ⓔ', f: 'ⓕ', g: 'ⓖ', h: 'ⓗ', i: 'ⓘ', j: 'ⓙ', k: 'ⓚ', l: 'ⓛ', m: 'ⓜ', n: 'ⓝ', o: 'ⓞ', p: 'ⓟ', q: 'ⓠ', r: 'ⓡ', s: 'ⓢ', t: 'ⓣ', u: 'ⓤ', v: 'ⓥ', w: 'ⓦ', x: 'ⓧ', y: 'ⓨ', z: 'ⓩ',
        A: 'Ⓐ', B: 'Ⓑ', C: 'Ⓒ', D: 'Ⓓ', E: 'Ⓔ', F: 'Ⓕ', G: 'Ⓖ', H: 'Ⓗ', I: 'Ⓘ', J: 'Ⓙ', K: 'Ⓚ', L: 'Ⓛ', M: 'Ⓜ', N: 'Ⓝ', O: 'Ⓞ', P: 'Ⓟ', Q: 'Ⓠ', R: 'Ⓡ', S: 'Ⓢ', T: 'Ⓣ', U: 'Ⓤ', V: 'Ⓥ', W: 'Ⓦ', X: 'Ⓧ', Y: 'Ⓨ', Z: 'Ⓩ',
        '0': '⓪', '1': '①', '2': '②', '3': '③', '4': '④', '5': '⑤', '6': '⑥', '7': '⑦', '8': '⑧', '9': '⑨'
      }
    };

    const transform = (text: string, map: Record<string, string>) => {
      return text.split('').map(char => map[char] || char).join('');
    };

    return [
      { name: 'Bold', text: transform(str, maps.bold) },
      { name: 'Italic', text: transform(str, maps.italic) },
      { name: 'Monospace', text: transform(str, maps.mono) },
      { name: 'Script', text: transform(str, maps.script) },
      { name: 'Bubble', text: transform(str, maps.bubble) },
    ];
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[2rem] border border-gray-100 p-2 shadow-sm inline-flex mb-4">
        <button 
          onClick={() => setActiveTab('native')}
          className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'native' ? 'bg-[#00a884] text-white shadow-lg shadow-[#00a884]/20' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Native Formatting
        </button>
        <button 
          onClick={() => setActiveTab('stylish')}
          className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'stylish' ? 'bg-[#00a884] text-white shadow-lg shadow-[#00a884]/20' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Stylish Fonts
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-gray-900">Input Text</h3>
          <button onClick={() => setText('')} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <textarea 
          id="status-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your WhatsApp status here..."
          className="w-full h-40 p-6 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#00a884]/30 focus:ring-4 focus:ring-[#00a884]/5 outline-none transition-all resize-none text-gray-700 leading-relaxed"
        />

        {activeTab === 'native' && (
          <div className="mt-6 flex flex-wrap gap-3">
            <button 
              onClick={() => applyFormat('*', '*')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-all"
            >
              <Bold className="w-4 h-4" /> Bold
            </button>
            <button 
              onClick={() => applyFormat('_', '_')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-all"
            >
              <Italic className="w-4 h-4" /> Italic
            </button>
            <button 
              onClick={() => applyFormat('~', '~')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-all"
            >
              <Strikethrough className="w-4 h-4" /> Strikethrough
            </button>
            <button 
              onClick={() => applyFormat('```', '```')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-all"
            >
              <Code className="w-4 h-4" /> Monospace
            </button>
          </div>
        )}
      </div>

      {activeTab === 'native' ? (
        <div className="bg-[#e1ffc7] rounded-[2rem] border border-[#00a884]/20 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-[#075e54]">Preview & Copy</h3>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(text);
                alert('Copied to clipboard!');
              }}
              className="flex items-center gap-2 text-[#00a884] font-bold"
            >
              <Copy className="w-5 h-5" /> Copy Formatted Text
            </button>
          </div>
          <div className="p-6 bg-white/50 rounded-2xl text-gray-700 whitespace-pre-wrap font-medium">
            {text || "Your formatted text will appear here..."}
          </div>
          <p className="mt-4 text-xs text-[#075e54]/60 font-bold uppercase tracking-widest">
            Note: WhatsApp will render the formatting (bold, etc.) after you paste and send the message.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stylishFonts(text).map((font, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-[#00a884]/30 transition-all">
              <div className="flex-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">{font.name}</span>
                <span className="font-bold text-gray-800 text-lg">{font.text || "Preview"}</span>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(font.text);
                  alert(`Copied ${font.name} style!`);
                }}
                className="p-3 bg-gray-50 text-gray-400 hover:bg-[#00a884] hover:text-white rounded-xl transition-all"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Image to PDF & PDF Merger Component ---
interface SortableFileItemProps {
  id: string;
  file: any;
  onRemove: (id: string) => void;
  key?: React.Key;
}

const SortableFileItem = ({ id, file, onRemove }: SortableFileItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`bg-white p-4 rounded-2xl border ${isDragging ? 'border-[#00a884] shadow-xl ring-2 ring-[#00a884]/10' : 'border-gray-100 shadow-sm'} flex items-center gap-4 group transition-all`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 text-gray-300 hover:text-gray-500 transition-colors">
        <GripVertical className="w-5 h-5" />
      </div>
      
      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-gray-100">
        {file.preview ? (
          <img src={file.preview} alt="" className="w-full h-full object-cover" />
        ) : (
          <FileText className="w-6 h-6 text-gray-300" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-gray-900 truncate text-sm">{file.name}</h4>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          {(file.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>

      <button 
        onClick={() => onRemove(id)}
        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

const ImageToPDFMerger = () => {
  const [activeTab, setActiveTab] = React.useState<'imageToPdf' | 'pdfMerger'>('imageToPdf');
  const [files, setFiles] = React.useState<any[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const newFiles = selectedFiles.map((file: File) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));

    setFiles(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.preview) URL.revokeObjectURL(fileToRemove.preview);
      return prev.filter(f => f.id !== id);
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFiles((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const generatePDF = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    try {
      if (activeTab === 'imageToPdf') {
        const pdf = new jsPDF();
        
        for (let i = 0; i < files.length; i++) {
          const fileObj = files[i];
          const imgData = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(fileObj.file);
          });

          if (i > 0) pdf.addPage();
          
          const imgProps = pdf.getImageProperties(imgData);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);
          const width = imgProps.width * ratio;
          const height = imgProps.height * ratio;
          const x = (pdfWidth - width) / 2;
          const y = (pdfHeight - height) / 2;

          pdf.addImage(imgData, 'JPEG', x, y, width, height);
        }
        pdf.save('converted-images.pdf');
      } else {
        const mergedPdf = await PDFDocument.create();
        
        for (const fileObj of files) {
          const pdfBytes = await fileObj.file.arrayBuffer();
          const pdf = await PDFDocument.load(pdfBytes);
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const mergedPdfBytes = await mergedPdf.save();
        const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'merged-document.pdf';
        link.click();
      }
      alert('Success! Your PDF has been generated.');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('An error occurred while generating the PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[2rem] border border-gray-100 p-2 shadow-sm inline-flex mb-4">
        <button 
          onClick={() => {
            setActiveTab('imageToPdf');
            setFiles([]);
          }}
          className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'imageToPdf' ? 'bg-[#00a884] text-white shadow-lg shadow-[#00a884]/20' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Image to PDF
        </button>
        <button 
          onClick={() => {
            setActiveTab('pdfMerger');
            setFiles([]);
          }}
          className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'pdfMerger' ? 'bg-[#00a884] text-white shadow-lg shadow-[#00a884]/20' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          PDF Merger
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-sm">
        <div className="max-w-2xl mx-auto space-y-8">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-4 border-dashed border-gray-100 rounded-[2rem] p-12 text-center hover:border-[#00a884]/30 hover:bg-[#00a884]/5 transition-all cursor-pointer group"
          >
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Upload className="w-10 h-10 text-[#00a884]" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">
              {activeTab === 'imageToPdf' ? 'Upload Images' : 'Upload PDF Files'}
            </h3>
            <p className="text-gray-500 font-medium">
              Drag and drop your files here or click to browse
            </p>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept={activeTab === 'imageToPdf' ? "image/*" : "application/pdf"}
              className="hidden"
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">
                  {files.length} Files Selected (Drag to reorder)
                </h4>
                <button onClick={() => setFiles([])} className="text-xs font-bold text-red-500 hover:underline">
                  Clear All
                </button>
              </div>

              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={files.map(f => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {files.map((file) => (
                      <SortableFileItem 
                        key={file.id} 
                        id={file.id} 
                        file={file} 
                        onRemove={removeFile} 
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              <Button 
                onClick={generatePDF}
                disabled={isProcessing}
                className="w-full bg-[#00a884] text-white hover:bg-[#008f6f] py-6 font-black rounded-2xl shadow-xl shadow-[#00a884]/20 text-lg"
              >
                {isProcessing ? (
                  <><Loader2 className="w-6 h-6 mr-2 animate-spin" /> Processing...</>
                ) : (
                  <>
                    <Download className="w-6 h-6 mr-2" /> 
                    {activeTab === 'imageToPdf' ? 'Convert to PDF' : 'Merge PDFs'}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ImageEditor = () => {
  const [canvas, setCanvas] = React.useState<Canvas | null>(null);
  const canvasRefObj = React.useRef<Canvas | null>(null);
  const [activeTool, setActiveTool] = React.useState<'select' | 'draw' | 'text' | 'rect' | 'circle' | 'sticker' | 'filter'>('select');
  const [color, setColor] = React.useState('#00a884');
  const [history, setHistory] = React.useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = React.useState(-1);
  const historyIndexRef = React.useRef(-1);
  const isHistoryAction = React.useRef(false);
  const [selectedObject, setSelectedObject] = React.useState<any>(null);
  const [exportFormat, setExportFormat] = React.useState<'png' | 'jpeg'>('png');
  const [canvasWidth, setCanvasWidth] = React.useState(800);
  const [canvasHeight, setCanvasHeight] = React.useState(600);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const overlayInputRef = React.useRef<HTMLInputElement>(null);

  const updateCanvasSize = (w: number, h: number) => {
    if (!canvas) return;
    setCanvasWidth(w);
    setCanvasHeight(h);
    canvas.setDimensions({ width: w, height: h });
    canvas.renderAll();
    saveHistory();
  };

  const saveHistory = React.useCallback(() => {
    const currentCanvas = canvasRefObj.current;
    if (!currentCanvas || isHistoryAction.current) return;
    const json = JSON.stringify(currentCanvas.toJSON());
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndexRef.current + 1);
      const updated = [...newHistory, json];
      historyIndexRef.current = updated.length - 1;
      setHistoryIndex(historyIndexRef.current);
      return updated;
    });
  }, []);

  const STICKERS = [
    '🔥', '❤️', '✨', '⭐', '🌟', '💥', '💯', '✅', '❌', '⚠️', 
    '🚀', '💡', '🎉', '🎈', '🎨', '📸', '💻', '📱', '🌍', '🍕',
    '😂', '😍', '🤔', '😎', '😭', '👍', '🙌', '👏', '🤝', '💪'
  ];

  React.useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const fabricCanvas = new Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff'
    });

    setCanvas(fabricCanvas);
    canvasRefObj.current = fabricCanvas;

    fabricCanvas.on('object:added', saveHistory);
    fabricCanvas.on('object:modified', saveHistory);
    fabricCanvas.on('object:removed', saveHistory);
    
    fabricCanvas.on('selection:created', (e) => setSelectedObject(e.selected[0]));
    fabricCanvas.on('selection:updated', (e) => setSelectedObject(e.selected[0]));
    fabricCanvas.on('selection:cleared', () => setSelectedObject(null));

    // Initial state
    const initialJson = JSON.stringify(fabricCanvas.toJSON());
    setHistory([initialJson]);
    setHistoryIndex(0);
    historyIndexRef.current = 0;

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  React.useEffect(() => {
    if (!canvas) return;

    if (activeTool === 'draw') {
      canvas.isDrawingMode = true;
      const brush = new PencilBrush(canvas);
      brush.color = color;
      brush.width = 5;
      canvas.freeDrawingBrush = brush;
    } else {
      canvas.isDrawingMode = false;
    }
  }, [activeTool, color, canvas]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = async (f) => {
      const data = f.target?.result as string;
      const img = await FabricImage.fromURL(data);
      
      const w = img.width!;
      const h = img.height!;
      
      setCanvasWidth(w);
      setCanvasHeight(h);
      
      canvas.setDimensions({
        width: w,
        height: h
      });

      canvas.backgroundImage = img;
      canvas.renderAll();
      saveHistory();
    };
    reader.readAsDataURL(file);
  };

  const addOverlayImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = async (f) => {
      const data = f.target?.result as string;
      const img = await FabricImage.fromURL(data);
      
      const center = { left: canvas.width / 2, top: canvas.height / 2 };
      img.set({
        left: center.left,
        top: center.top,
        originX: 'center',
        originY: 'center'
      });
      
      // Scale down if too large
      const maxDim = Math.min(canvas.width!, canvas.height!) * 0.5;
      if (img.width! > maxDim || img.height! > maxDim) {
        img.scale(maxDim / Math.max(img.width!, img.height!));
      } else {
        img.scale(0.5);
      }

      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    };
    reader.readAsDataURL(file);
  };

  const addText = () => {
    if (!canvas) return;
    setActiveTool('text');
    const center = { left: canvas.width / 2, top: canvas.height / 2 };
    const text = new Textbox('Type here...', {
      left: center.left,
      top: center.top,
      originX: 'center',
      originY: 'center',
      width: 200,
      fontSize: 40,
      fill: color,
      fontFamily: 'Inter',
      textAlign: 'center'
    });
    canvas.add(text);
    canvas.setActiveObject(text);
  };

  const addRect = () => {
    if (!canvas) return;
    setActiveTool('rect');
    const center = { left: canvas.width / 2, top: canvas.height / 2 };
    const rect = new Rect({
      left: center.left,
      top: center.top,
      originX: 'center',
      originY: 'center',
      fill: color,
      width: 200,
      height: 200,
      transparentCorners: false
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
  };

  const addCircle = () => {
    if (!canvas) return;
    setActiveTool('circle');
    const center = { left: canvas.width / 2, top: canvas.height / 2 };
    const circle = new FabricCircle({
      left: center.left,
      top: center.top,
      originX: 'center',
      originY: 'center',
      fill: color,
      radius: 100,
      transparentCorners: false
    });
    canvas.add(circle);
    canvas.setActiveObject(circle);
  };

  const addSticker = (emoji: string) => {
    if (!canvas) return;
    const center = { left: canvas.width / 2, top: canvas.height / 2 };
    const text = new Textbox(emoji, {
      left: center.left,
      top: center.top,
      originX: 'center',
      originY: 'center',
      fontSize: 80,
      textAlign: 'center'
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    setActiveTool('select');
  };

  const flipX = () => {
    if (!selectedObject || !canvas) return;
    selectedObject.set('flipX', !selectedObject.flipX);
    canvas.renderAll();
    saveHistory();
  };

  const flipY = () => {
    if (!selectedObject || !canvas) return;
    selectedObject.set('flipY', !selectedObject.flipY);
    canvas.renderAll();
    saveHistory();
  };

  const rotate = (angle: number) => {
    if (!selectedObject || !canvas) return;
    selectedObject.rotate((selectedObject.angle || 0) + angle);
    canvas.renderAll();
    saveHistory();
  };

  const deleteSelected = () => {
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    canvas.remove(...activeObjects);
    canvas.discardActiveObject();
    canvas.renderAll();
  };

  const clearCanvas = () => {
    if (!canvas) return;
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    canvas.renderAll();
    saveHistory();
  };

  const undo = () => {
    if (!canvas || historyIndex <= 0) return;
    const prevIndex = historyIndex - 1;
    const state = JSON.parse(history[prevIndex]);
    isHistoryAction.current = true;
    canvas.loadFromJSON(state).then(() => {
      canvas.renderAll();
      setHistoryIndex(prevIndex);
      historyIndexRef.current = prevIndex;
      isHistoryAction.current = false;
    }).catch(err => {
      console.error('Undo error:', err);
      isHistoryAction.current = false;
    });
  };

  const redo = () => {
    if (!canvas || historyIndex >= history.length - 1) return;
    const nextIndex = historyIndex + 1;
    const state = JSON.parse(history[nextIndex]);
    isHistoryAction.current = true;
    canvas.loadFromJSON(state).then(() => {
      canvas.renderAll();
      setHistoryIndex(nextIndex);
      historyIndexRef.current = nextIndex;
      isHistoryAction.current = false;
    }).catch(err => {
      console.error('Redo error:', err);
      isHistoryAction.current = false;
    });
  };

  const download = () => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL({
      format: exportFormat,
      quality: 1,
      multiplier: 1
    });
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `edited-image.${exportFormat}`;
    link.click();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Toolbar - Responsive */}
      <div className="bg-white rounded-[2rem] border border-gray-100 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-gray-50 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTool('select')}
              className={`p-2 rounded-lg transition-all flex items-center gap-2 ${activeTool === 'select' ? 'bg-white text-[#00a884] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              title="Select"
            >
              <MousePointer2 className="w-5 h-5" />
              <span className="text-xs font-bold hidden sm:inline">Select</span>
            </button>
            <button 
              onClick={() => setActiveTool('draw')}
              className={`p-2 rounded-lg transition-all flex items-center gap-2 ${activeTool === 'draw' ? 'bg-white text-[#00a884] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              title="Draw"
            >
              <Edit3 className="w-5 h-5" />
              <span className="text-xs font-bold hidden sm:inline">Draw</span>
            </button>
          </div>

          <div className="w-px h-6 bg-gray-200 mx-1" />

          <div className="flex gap-1">
            <button 
              onClick={addText} 
              className={`p-2 rounded-lg transition-all ${activeTool === 'text' ? 'bg-[#00a884] text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`} 
              title="Add Text"
            >
              <Type className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setActiveTool('sticker')} 
              className={`p-2 rounded-lg transition-all ${activeTool === 'sticker' ? 'bg-[#00a884] text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`} 
              title="Stickers"
            >
              <Smile className="w-5 h-5" />
            </button>
            <button 
              onClick={addRect} 
              className={`p-2 rounded-lg transition-all ${activeTool === 'rect' ? 'bg-[#00a884] text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`} 
              title="Rectangle"
            >
              <Square className="w-5 h-5" />
            </button>
            <button 
              onClick={addCircle} 
              className={`p-2 rounded-lg transition-all ${activeTool === 'circle' ? 'bg-[#00a884] text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`} 
              title="Circle"
            >
              <Circle className="w-5 h-5" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-200 mx-1" />

          <div className="flex gap-1">
            <button onClick={() => overlayInputRef.current?.click()} className="p-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-all" title="Add Image">
              <ImageIcon className="w-5 h-5" />
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-all" title="Change Background">
              <Upload className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-50 p-1 rounded-xl">
            <button 
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 text-gray-500 hover:text-[#00a884] active:scale-90 transition-all disabled:opacity-30 disabled:scale-100"
              title="Undo"
            >
              <Undo className="w-5 h-5" />
            </button>
            <button 
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 text-gray-500 hover:text-[#00a884] active:scale-90 transition-all disabled:opacity-30 disabled:scale-100"
              title="Redo"
            >
              <Redo className="w-5 h-5" />
            </button>
          </div>
          <button onClick={clearCanvas} className="p-2 bg-red-50 text-red-500 hover:bg-red-100 active:scale-90 transition-all rounded-lg" title="Clear Canvas">
            <Eraser className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Controls */}
        <div className="w-full lg:w-72 space-y-6">
          {activeTool === 'sticker' && (
            <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                  <Smile className="w-4 h-4 text-yellow-500" /> Stickers
                </h3>
                <button onClick={() => setActiveTool('select')} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {STICKERS.map(emoji => (
                  <button 
                    key={emoji}
                    onClick={() => addSticker(emoji)}
                    className="text-2xl p-2 hover:bg-gray-50 rounded-lg transition-all"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedObject && (
            <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm animate-in fade-in slide-in-from-left-4">
              <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-500" /> Object Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Color</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={color}
                      onChange={(e) => {
                        setColor(e.target.value);
                        selectedObject.set('fill', e.target.value);
                        canvas?.renderAll();
                        saveHistory();
                      }}
                      className="w-10 h-10 rounded-lg cursor-pointer border-none bg-gray-50 p-1"
                    />
                    <span className="text-xs font-mono text-gray-500 uppercase">{color}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={flipX} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-[10px] font-bold flex flex-col items-center gap-1">
                    <RefreshCw className="w-4 h-4" /> Flip X
                  </button>
                  <button onClick={flipY} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-[10px] font-bold flex flex-col items-center gap-1">
                    <RefreshCw className="w-4 h-4 rotate-90" /> Flip Y
                  </button>
                  <button onClick={() => rotate(-90)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-[10px] font-bold flex flex-col items-center gap-1">
                    <Undo className="w-4 h-4" /> -90°
                  </button>
                  <button onClick={() => rotate(90)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-[10px] font-bold flex flex-col items-center gap-1">
                    <Redo className="w-4 h-4" /> +90°
                  </button>
                </div>
                <button 
                  onClick={deleteSelected}
                  className="w-full p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
              <Download className="w-4 h-4 text-[#00a884]" /> Export Settings
            </h3>
            <div className="space-y-4">
              <div className="flex bg-gray-50 p-1 rounded-xl">
                <button 
                  onClick={() => setExportFormat('png')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${exportFormat === 'png' ? 'bg-white text-[#00a884] shadow-sm' : 'text-gray-500'}`}
                >
                  PNG
                </button>
                <button 
                  onClick={() => setExportFormat('jpeg')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${exportFormat === 'jpeg' ? 'bg-white text-[#00a884] shadow-sm' : 'text-gray-500'}`}
                >
                  JPG
                </button>
              </div>
              <Button 
                onClick={download}
                className="w-full bg-[#00a884] text-white hover:bg-[#008f6f] py-3 rounded-xl font-black shadow-lg shadow-[#00a884]/20 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download {exportFormat.toUpperCase()}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 space-y-4">
          <div 
            ref={containerRef}
            className="relative bg-gray-200 rounded-[2.5rem] overflow-auto border-4 border-white shadow-inner min-h-[500px] max-h-[80vh] flex items-center justify-center p-4 sm:p-8"
          >
            <div className="shadow-2xl bg-white leading-[0]">
              <canvas ref={canvasRef} />
            </div>
          </div>
          
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Editor</span>
              </div>
              <span className="text-[10px] font-bold text-gray-300">|</span>
              <div className="flex items-center gap-1 group">
                <Maximize2 className="w-3 h-3 text-gray-300 group-hover:text-[#00a884] transition-colors" />
                <input 
                  type="number" 
                  value={canvasWidth} 
                  onChange={(e) => updateCanvasSize(parseInt(e.target.value) || 0, canvasHeight)}
                  className="w-14 bg-gray-50/50 px-1 rounded border border-transparent hover:border-gray-200 focus:border-[#00a884] focus:bg-white text-[10px] font-bold text-gray-600 uppercase tracking-widest outline-none text-center transition-all"
                  title="Canvas Width"
                />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">×</span>
                <input 
                  type="number" 
                  value={canvasHeight} 
                  onChange={(e) => updateCanvasSize(canvasWidth, parseInt(e.target.value) || 0)}
                  className="w-14 bg-gray-50/50 px-1 rounded border border-transparent hover:border-gray-200 focus:border-[#00a884] focus:bg-white text-[10px] font-bold text-gray-600 uppercase tracking-widest outline-none text-center transition-all"
                  title="Canvas Height"
                />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">PX</span>
              </div>
            </div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Fabric Engine v7.2
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Inputs */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />
      <input 
        type="file" 
        ref={overlayInputRef}
        onChange={addOverlayImage}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

const WhatsAppGroupNameGenerator = () => {
  const [category, setCategory] = React.useState('Friends');
  const [generatedNames, setGeneratedNames] = React.useState<string[]>([]);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const categories = [
    { id: 'Friends', icon: 'Users', color: 'bg-blue-500' },
    { id: 'Family', icon: 'Home', color: 'bg-pink-500' },
    { id: 'Business', icon: 'Briefcase', color: 'bg-gray-800' },
    { id: 'Tech', icon: 'Cpu', color: 'bg-indigo-500' },
    { id: 'Funny', icon: 'Smile', color: 'bg-yellow-500' },
    { id: 'Sports', icon: 'Trophy', color: 'bg-orange-500' },
    { id: 'Gaming', icon: 'Gamepad2', color: 'bg-purple-500' },
    { id: 'Education', icon: 'GraduationCap', color: 'bg-green-500' },
  ];

  const nameData: Record<string, string[]> = {
    Friends: [
      'The Three Musketeers', 'Chai & Chitchat', 'The Backbenchers', 'Awesome Blossoms', 'BFFs Forever',
      'The Squad', 'Circle of Trust', 'No Filter Needed', 'The Dream Team', 'Life is a Party',
      'Weekend Warriors', 'The Gossip Girls', 'Bros for Life', 'The Inner Circle', 'Crazy Cousins',
      'The Funky Bunch', 'Besties for Resties', 'The A-Team', 'Soul Sisters', 'The Wolf Pack'
    ],
    Family: [
      'The Family Tree', 'Home Sweet Home', 'The Clan', 'Family Ties', 'Generations',
      'The Incredibles', 'Modern Family', 'The Godfather Family', 'Family First', 'The Roots',
      'Kinship Circle', 'The Legacy', 'Blood is Thicker', 'Family Reunion', 'The Tribe',
      'House of [Name]', 'The Ancestors', 'Family Matters', 'The Heritage', 'Our Little World'
    ],
    Business: [
      'The Boardroom', 'Market Masters', 'Profit Pioneers', 'The Visionaries', 'Startup Squad',
      'Business Builders', 'The Strategists', 'Growth Hackers', 'The Executives', 'Corporate Kings',
      'The Innovators', 'Success Stories', 'The Professionals', 'Industry Icons', 'The Network',
      'Venture Voices', 'The Partners', 'Enterprise Elite', 'The Consultants', 'Market Movers'
    ],
    Tech: [
      'The Code Breakers', 'Digital Nomads', 'Tech Titans', 'The Algorithm', 'Future Tech',
      'The Developers', 'Binary Bros', 'Cloud Chasers', 'The Engineers', 'Tech Talk',
      'The Silicon Valley', 'Cyber Squad', 'The IT Crowd', 'Data Driven', 'The Hardware Hub',
      'Software Savvy', 'The Gadget Gurus', 'AI Avengers', 'The Web Wizards', 'Tech Trends'
    ],
    Funny: [
      'The Un-Stoppables', 'Wats-Appening', 'The Chatty Cathys', 'Error 404: Brain Not Found', 'The Meme Team',
      'Sarcasm Society', 'The Pun-ishers', 'Laughter Therapy', 'The Jokers', 'Funny Bones',
      'The Comedy Club', 'Laugh Out Loud', 'The Pranksters', 'Humor Hub', 'The Witty Ones',
      'Giggle Gang', 'The Snarky Squad', 'Hilarious Humans', 'The Chuckle Crew', 'Wit & Wisdom'
    ],
    Sports: [
      'The Game Changers', 'Victory Voices', 'The Champions', 'Sports Central', 'The Athletes',
      'Team Spirit', 'The Goal Getters', 'Sports Savvy', 'The All-Stars', 'Game On',
      'The Playmakers', 'Sports Stars', 'The Competitors', 'Victory Lap', 'The Fanatics',
      'Sports Sphere', 'The Winners Circle', 'Team Talk', 'The Sports Hub', 'Field of Dreams'
    ],
    Gaming: [
      'The Level Up', 'Game Over', 'The Pro Gamers', 'Gaming Galaxy', 'The Controllers',
      'Pixel Pioneers', 'The Quest', 'Gaming Gurus', 'The Streamers', 'Game Night',
      'The Esports Elite', 'Gaming Guild', 'The Joysticks', 'Game Glory', 'The Virtual World',
      'Gaming Gang', 'The Boss Level', 'Game On!', 'The Gaming Hub', 'Legendary Loot'
    ],
    Education: [
      'The Scholars', 'Knowledge Keepers', 'The Learners', 'Study Squad', 'The Intellectuals',
      'Education Elite', 'The Researchers', 'Smart Minds', 'The Academics', 'Learning Lab',
      'The Thinkers', 'Knowledge Network', 'The Students', 'Wisdom Warriors', 'The Library',
      'Classroom Chronicles', 'The Educators', 'Brainy Bunch', 'The Mentors', 'Future Leaders'
    ]
  };

  const generateNames = () => {
    setIsGenerating(true);
    setGeneratedNames([]);
    
    setTimeout(() => {
      const allNames = nameData[category] || [];
      const shuffled = [...allNames].sort(() => 0.5 - Math.random());
      setGeneratedNames(shuffled.slice(0, 10));
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="space-y-10">
      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-sm">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-black text-gray-900">Choose a Category</h3>
            <p className="text-gray-500">Select the type of group you're creating to get relevant name suggestions.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 group ${
                  category === cat.id 
                    ? 'border-[#00a884] bg-[#00a884]/5 shadow-lg shadow-[#00a884]/10' 
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 ${cat.color}`}>
                  {cat.id === 'Friends' && <Users className="w-6 h-6" />}
                  {cat.id === 'Family' && <Home className="w-6 h-6" />}
                  {cat.id === 'Business' && <Briefcase className="w-6 h-6" />}
                  {cat.id === 'Tech' && <Cpu className="w-6 h-6" />}
                  {cat.id === 'Funny' && <Smile className="w-6 h-6" />}
                  {cat.id === 'Sports' && <Trophy className="w-6 h-6" />}
                  {cat.id === 'Gaming' && <Gamepad2 className="w-6 h-6" />}
                  {cat.id === 'Education' && <GraduationCap className="w-6 h-6" />}
                </div>
                <span className={`font-bold text-sm ${category === cat.id ? 'text-[#00a884]' : 'text-gray-600'}`}>
                  {cat.id}
                </span>
              </button>
            ))}
          </div>

          <div className="flex justify-center pt-4">
            <Button 
              onClick={generateNames}
              disabled={isGenerating}
              className="bg-[#00a884] text-white hover:bg-[#008f6f] px-12 py-5 font-black rounded-2xl shadow-xl shadow-[#00a884]/20 text-lg h-auto"
            >
              {isGenerating ? (
                <><Loader2 className="w-6 h-6 mr-2 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="w-6 h-6 mr-2" /> Generate Names</>
              )}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {generatedNames.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {generatedNames.map((name, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-[#00a884]/30 hover:shadow-md transition-all"
              >
                <span className="font-bold text-gray-800 text-lg">{name}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(name);
                    alert(`Copied "${name}" to clipboard!`);
                  }}
                  className="p-3 bg-gray-50 text-gray-400 hover:bg-[#00a884] hover:text-white rounded-xl transition-all"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AICaptionGenerator = () => {
  const [topic, setTopic] = React.useState('');
  const [mood, setMood] = React.useState('Deep');
  const [captions, setCaptions] = React.useState<string[]>([]);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState('');

  const moods = [
    { id: 'Deep', icon: 'Sparkles', color: 'bg-purple-500' },
    { id: 'Funny', icon: 'Smile', color: 'bg-yellow-500' },
    { id: 'Witty', icon: 'Lightbulb', color: 'bg-orange-500' },
    { id: 'Cool', icon: 'RefreshCw', color: 'bg-blue-500' },
    { id: 'Sad', icon: 'Cloud', color: 'bg-gray-500' },
    { id: 'Love', icon: 'Heart', color: 'bg-red-500' },
    { id: 'Motivation', icon: 'Trophy', color: 'bg-green-500' }
  ];

  const generateCaptions = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic or photo description.');
      return;
    }
    setIsGenerating(true);
    setError('');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Generate 5 unique, short, and engaging WhatsApp status captions for a photo about "${topic}". The mood should be "${mood}". 
      Make them perfect for WhatsApp status (modern, catchy, and use relevant emojis).
      Return only the captions as a JSON array of strings. Do not include any Markdown formatting or code blocks.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json"
        }
      });
      
      const result = JSON.parse(response.text || '[]');
      setCaptions(Array.isArray(result) ? result : []);
    } catch (err: any) {
      console.error(err);
      setError('AI generation failed. Please check your connection and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-sm shadow-[#00a884]/5">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="space-y-4">
            <label className="block text-xl font-black text-gray-900">What is your photo about?</label>
            <textarea 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. A sunset at the beach, my new cat, coding late at night..."
              className="w-full h-32 px-6 py-5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#00a884]/30 focus:ring-4 focus:ring-[#00a884]/5 outline-none transition-all resize-none text-lg leading-relaxed text-gray-700"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-lg font-bold text-gray-800 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-[#00a884]" /> Choose Vibe
            </label>
            <div className="flex flex-wrap gap-3">
              {moods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMood(m.id)}
                  className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 border ${
                    mood === m.id 
                      ? 'bg-[#00a884] text-white border-transparent shadow-lg shadow-[#00a884]/20' 
                      : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {m.id}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <Button 
              onClick={generateCaptions}
              disabled={isGenerating || !topic.trim()}
              className="w-full bg-gray-900 text-white hover:bg-black py-6 font-black rounded-2xl shadow-xl transition-all h-auto disabled:opacity-50"
            >
              {isGenerating ? (
                <><Loader2 className="w-6 h-6 mr-2 animate-spin" /> Brewing Ideas...</>
              ) : (
                <><Sparkles className="w-6 h-6 mr-2 text-[#00a884]" /> Generate Captions</>
              )}
            </Button>
            {error && <p className="mt-4 text-center text-red-500 font-medium text-sm">{error}</p>}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {captions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 gap-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-1 flex-1 bg-gray-100 rounded-full" />
              <h3 className="text-xl font-black text-gray-900">AI Results</h3>
              <div className="h-1 flex-1 bg-gray-100 rounded-full" />
            </div>
            {captions.map((caption, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-[#00a884]/30 hover:shadow-md transition-all sm:flex-row flex-col gap-4 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-[#00a884]/50" />
                <div className="text-gray-800 font-medium leading-relaxed flex-1 italic text-lg px-2 group-hover:text-gray-900 transition-colors">
                  "{caption}"
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(caption);
                    alert('Caption copied!');
                  }}
                  className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-gray-50 text-gray-400 hover:bg-[#00a884] hover:text-white rounded-xl transition-all font-bold text-sm whitespace-nowrap shadow-sm"
                >
                  <Copy className="w-4 h-4" /> Copy
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SourceCodeViewer = () => {
  const [url, setUrl] = React.useState('');
  const [source, setSource] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [stats, setStats] = React.useState<any>(null);

  const handleFetch = async () => {
    if (!url.trim()) {
      setError('Please enter a website URL.');
      return;
    }
    
    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http')) {
      targetUrl = 'https://' + targetUrl;
    }

    setIsLoading(true);
    setError('');
    setSource('');
    setStats(null);

    try {
      const response = await fetch('/api/fetch-source', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (response.status >= 500) {
        let errorMsg = 'The server encountered an error while fetching. This usually happens when the target website blocks automated access.';
        try {
          const errorData = await response.json();
          if (errorData.error) errorMsg = errorData.error;
        } catch (e) {
          // Fallback to text if JSON fails
          const text = await response.clone().text();
          if (text.includes('Too Many Requests')) errorMsg = 'Too many requests. Please wait a moment.';
        }
        throw new Error(errorMsg);
      }

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        // Special check for common proxy error pages
        if (text.includes('<html') || text.includes('An error occurred')) {
          throw new Error('The server is currently unreachable or rejecting the request. Please try again or check the URL.');
        }
        throw new Error('The server returned an unexpected response format.');
      }
      
      if (data.error) throw new Error(data.error);
      if (!data.source) throw new Error('No source code was returned from the website.');

      setSource(data.source);
      
      // Calculate Stats
      const kb = (new Blob([data.source]).size / 1024).toFixed(2);
      const lines = data.source.split('\n').length;
      const links = (data.source.match(/href=/g) || []).length;
      const scripts = (data.source.match(/<script/g) || []).length;
      const styles = (data.source.match(/<style|<\/link/g) || []).length;

      setStats({ size: kb, lines, links, scripts, styles });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch source code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (format: 'html' | 'txt') => {
    const blob = new Blob([source], { type: format === 'html' ? 'text/html' : 'text/plain' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `source-${new URL(url.startsWith('http') ? url : 'https://'+url).hostname}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  const highlightedSource = React.useMemo(() => {
    if (!source) return '';
    
    // Escape HTML first so it's visible as text
    const escaped = source
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    if (!searchQuery) return escaped;
    
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return escaped.replace(regex, '<mark class="bg-[#00a884] text-white rounded-sm px-0.5">$1</mark>');
  }, [source, searchQuery]);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-sm">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
                placeholder="Enter website URL (e.g. google.com)"
                className="w-full pl-14 pr-6 py-5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#00a884]/30 focus:ring-4 focus:ring-[#00a884]/5 outline-none transition-all text-lg"
              />
            </div>
            <Button 
              onClick={handleFetch}
              disabled={isLoading}
              className="w-full md:w-auto bg-[#00a884] text-white hover:bg-[#008f6f] px-10 py-5 font-black rounded-2xl h-auto disabled:opacity-50 shadow-xl shadow-[#00a884]/20"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Fetch Source"}
            </Button>
          </div>
          {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}
        </div>
      </div>

      {source && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* --- Stats Cards --- */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'File Size', value: `${stats.size} KB`, icon: FileCode, color: 'text-blue-500' },
              { label: 'Total Lines', value: stats.lines, icon: ListMusic, color: 'text-purple-500' },
              { label: 'Links Found', value: stats.links, icon: LinkIcon, color: 'text-green-500' },
              { label: 'JS Scripts', value: stats.scripts, icon: Code, color: 'text-orange-500' },
              { label: 'Stylesheets', value: stats.styles, icon: Palette, color: 'text-pink-500' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                <stat.icon className={`w-5 h-5 mb-2 ${stat.color}`} />
                <div className="text-xl font-black text-gray-900">{stat.value}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-[#1e1e1e] rounded-[2.5rem] border border-gray-800 overflow-hidden shadow-2xl flex flex-col h-[700px]">
            {/* --- Toolbar --- */}
            <div className="p-4 bg-gray-900/50 border-b border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text"
                  placeholder="Search in source code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00a884]/20"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(source);
                    alert('Source code copied!');
                  }}
                  className="p-2.5 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 transition-all text-gray-400"
                  title="Copy All"
                >
                  <Copy className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDownload('html')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#00a884] text-white rounded-xl font-bold text-sm hover:bg-[#008f6f] transition-all"
                >
                  <Download className="w-4 h-4" /> .HTML
                </button>
                <button 
                  onClick={() => handleDownload('txt')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 text-white rounded-xl font-bold text-sm hover:bg-gray-600 transition-all"
                >
                  <FileText className="w-4 h-4" /> .TXT
                </button>
              </div>
            </div>

            {/* --- Code Display --- */}
            <div className="flex-1 overflow-auto p-0 font-mono text-[13px] leading-6 relative scrollbar-thin scrollbar-thumb-gray-800">
              <div className="flex min-h-full">
                {/* --- Line Numbers Gutter --- */}
                <div className="w-12 bg-gray-900/50 text-right pr-4 text-gray-600 select-none border-r border-gray-800 pt-6 flex-shrink-0">
                  {Array.from({ length: Math.min(stats.lines, 2000) }).map((_, i) => (
                    <div key={i} className="h-6 leading-6">{i + 1}</div>
                  ))}
                </div>
                
                {/* --- Code Content --- */}
                <div className="p-6 overflow-visible flex-1">
                  <pre className="text-gray-300 m-0">
                    <code 
                      dangerouslySetInnerHTML={{ __html: highlightedSource }}
                      className="whitespace-pre block"
                    />
                  </pre>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-center text-gray-500 text-xs">
            <Info className="w-3 h-3 inline mr-1" /> Performance Note: Preview limited to first 2,000 lines. Download for full file.
          </p>
        </motion.div>
      )}
    </div>
  );
};

  const renderTool = () => {
    switch (tool.slug) {
      case 'plagiarism-checker': return <PlagiarismChecker />;
      case 'ai-detector': return <AIDetector />;
      case 'qr-code-generator': return <QRCodeGenerator />;
      case 'word-counter': return <WordCounter />;
      case 'short-url-generator': return <ShortURLGenerator user={user} />;
      case 'stylish-text-generator': return <StylishTextGenerator />;
      case 'text-repeater': return <TextRepeater />;
      case 'fake-whatsapp-screenshot': return <FakeWhatsAppGenerator />;
      case 'whatsapp-read-more': return <ReadMoreGenerator />;
      case 'whatsapp-link-generator': return <WhatsAppLinkGenerator />;
      case 'whatsapp-dp-border': return <WhatsAppDPBorderMaker />;
      case 'qr-code-scanner': return <QRCodeScanner />;
      case 'pdf-editor': return <PDFEditor />;
      case 'image-pdf-merger': return <ImageToPDFMerger />;
      case 'image-editor': return <ImageEditor />;
      case 'whatsapp-group-name-generator': return <WhatsAppGroupNameGenerator />;
      case 'whatsapp-status-formatter': return <WhatsAppStatusFormatter />;
      case 'm3u-playlist-viewer': return <M3UPlaylistViewer />;
      case 'whatsapp-caption-generator': return <AICaptionGenerator />;
      case 'source-code-viewer': return <SourceCodeViewer />;
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
    if (tool.slug === 'image-editor') {
      return {
        howToUse: [
          "Upload a background image or start with a blank canvas.",
          "Use the toolbar to add text, draw, or insert shapes.",
          "Change colors using the color picker for any selected object.",
          "Add overlay images to create collages or add watermarks.",
          "Download your final masterpiece as a high-quality PNG image."
        ],
        benefits: [
          "Quick and easy image editing directly in your browser.",
          "No software installation or account required.",
          "Professional tools like layers, undo/redo, and text formatting.",
          "Completely free with no watermarks added to your work."
        ]
      };
    }
    if (tool.slug === 'image-pdf-merger') {
      return {
        howToUse: [
          "Choose between 'Image to PDF' or 'PDF Merger' tabs.",
          "Upload your files by clicking the upload area or dragging them in.",
          "Drag and drop the files to change their order in the final PDF.",
          "Click the 'Convert' or 'Merge' button to generate and download your file."
        ],
        benefits: [
          "Combine multiple images into a professional PDF document.",
          "Merge separate PDF files into one organized file.",
          "Completely free and works entirely in your browser for privacy.",
          "No file size limits or watermarks added to your documents."
        ]
      };
    }
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
    if (tool.slug === 'fake-whatsapp-screenshot') {
      return {
        howToUse: [
          "Customize the chat header with contact name, status, and profile picture.",
          "Set the phone status bar details like time, battery, and signal strength.",
          "Add messages to the conversation, choosing between 'Sent' and 'Received'.",
          "For sent messages, select the message status (Sent, Delivered, or Seen).",
          "Click 'Generate Screenshot' to download your realistic WhatsApp chat image."
        ],
        benefits: [
          "Create highly realistic WhatsApp chat screenshots for pranks or storytelling.",
          "Fully customizable elements including status bar, header, and message details.",
          "Live preview allows you to see changes instantly as you edit.",
          "High-quality PNG export suitable for sharing on social media.",
          "Privacy-focused: All generation happens locally in your browser."
        ]
      };
    }
    if (tool.slug === 'whatsapp-read-more') {
      return {
        howToUse: [
          "Enter the text you want to be visible immediately in the first box.",
          "Enter the 'secret' or prank message in the second box.",
          "Click 'Generate & Copy Message' to get the special formatted text.",
          "Paste the text into any WhatsApp chat - the 'Read More' button will appear automatically."
        ],
        benefits: [
          "Create hilarious pranks and surprises for your friends.",
          "Hide spoilers or long punchlines in group chats.",
          "No special apps required - works with the standard WhatsApp app.",
          "Simple one-click generation and copying."
        ]
      };
    }
    if (tool.slug === 'whatsapp-link-generator') {
      return {
        howToUse: [
          "Enter your phone number including the country code (without + or 00).",
          "Type an optional message that you want users to send to you automatically.",
          "Click 'Generate WhatsApp Link' to create your custom URL.",
          "Customize the QR code colors and download it for your marketing materials."
        ],
        benefits: [
          "Make it easy for customers to contact you with a single click.",
          "Perfect for Instagram bios, Facebook ads, and business cards.",
          "Generate high-quality QR codes that match your brand colors.",
          "Pre-filled messages save time for your users and improve conversion."
        ]
      };
    }
    if (tool.slug === 'whatsapp-dp-border') {
      return {
        howToUse: [
          "Upload your profile picture using the upload box.",
          "Adjust the border width using the slider to your liking.",
          "Choose a color from the presets or use the color picker for a custom shade.",
          "Select a border style (Solid, Dashed, or Double) for a unique look.",
          "Click 'Download DP with Border' to save your new profile picture."
        ],
        benefits: [
          "Make your profile stand out in chat lists and group members lists.",
          "Create a professional and branded look for your business account.",
          "Easy to use with real-time preview of the circular crop.",
          "High-quality downloads ready to be used as your WhatsApp DP."
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
    if (tool.slug === 'whatsapp-group-name-generator') {
      return {
        howToUse: [
          "Choose a category that best fits your group's purpose (e.g., Friends, Family, Business).",
          "Click the 'Generate Names' button to get a list of creative suggestions.",
          "Browse through the generated names and find one you like.",
          "Click the copy icon next to any name to copy it to your clipboard instantly."
        ],
        benefits: [
          "Save time thinking of creative and catchy names for your groups.",
          "Get relevant suggestions based on specific categories.",
          "Discover unique and funny names that stand out in chat lists.",
          "Completely free to use with unlimited generations."
        ]
      };
    }
    if (tool.slug === 'whatsapp-status-formatter') {
      return {
        howToUse: [
          "Type or paste your status text into the input field.",
          "Use the 'Native Formatting' tab to apply bold, italic, or strikethrough (using WhatsApp's special characters).",
          "Switch to 'Stylish Fonts' to convert your text into cool unicode styles like Bubble or Script.",
          "Click the copy button to copy your formatted text and paste it into your WhatsApp status."
        ],
        benefits: [
          "Make your WhatsApp status stand out with unique formatting.",
          "Easily apply WhatsApp's native formatting without remembering the codes.",
          "Access a variety of stylish fonts that work across most devices.",
          "Quick and easy one-click copy functionality."
        ]
      };
    }
    if (tool.slug === 'm3u-playlist-viewer') {
      return {
        howToUse: [
          "Paste a URL to an M3U/M3U8 file or upload a local file from your device.",
          "Click 'Analyze Playlist' to process the file and extract all channels.",
          "Use the search box and filters (Country, Group) to find specific channels.",
          "Test streams directly or copy channel information for your player."
        ],
        benefits: [
          "Fast processing of large playlists with thousands of channels.",
          "Advanced filtering by name, country, and group category.",
          "100% client-side processing for maximum privacy.",
          "Easy one-click testing and copying of stream links."
        ]
      };
    }
    if (tool.slug === 'whatsapp-caption-generator') {
      return {
        howToUse: [
          "Describe your photo, mood, or what you are doing in the text box.",
          "Select the mood or vibe you want for the caption (Deep, Funny, Cool, etc.).",
          "Click 'Generate Captions' to let the AI create 5 unique options.",
          "Click 'Copy' on your favorite caption and paste it into your WhatsApp status."
        ],
        benefits: [
          "Powered by advanced Gemini AI for human-like, trendy captions.",
          "Save time thinking of what to write for your daily status updates.",
          "Multiple moods to match every photo and emotion perfectly.",
          "Includes relevant emojis for high social media engagement."
        ]
      };
    }
    if (tool.slug === 'source-code-viewer') {
      return {
        howToUse: [
          "Enter the full URL of the website you want to inspect.",
          "Click 'Fetch Source' to load the raw HTML code.",
          "Use the built-in search bar to find specific tags, CSS, or scripts.",
          "Download the code as a .html or .txt file for offline analysis."
        ],
        benefits: [
          "Perfect for mobile devices that don't have a native 'View Source' option.",
          "Automatic counts for file size, scripts, links, and stylesheets.",
          "Live search and syntax highlighting for easier reading.",
          "Fast, clean, and 100% legal way to inspect publicly available code."
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
