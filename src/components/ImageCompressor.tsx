import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Trash2, 
  Download, 
  Sliders, 
  Sparkles, 
  Check, 
  AlertCircle, 
  FileImage, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Layers, 
  FileArchive, 
  Info, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Eye,
  Settings2,
  Zap,
  ArrowRight
} from 'lucide-react';
import JSZip from 'jszip';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';

export interface ImageItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalUrl: string;
  
  // Compressed State
  compressedBlob: Blob | null;
  compressedUrl: string | null;
  compressedSize: number;
  compressedWidth: number;
  compressedHeight: number;
  savingsPercentage: number;
  format: string; // 'image/jpeg', 'image/png', 'image/webp', 'image/avif'
  quality: number; // 1 - 100
  isProcessing: boolean;
  status: 'idle' | 'processing' | 'done' | 'error';
}

const RESIZE_PRESETS = [
  { label: 'Original Dimensions', width: 0, height: 0 },
  { label: 'Passport Photo (600 x 600)', width: 600, height: 600 },
  { label: 'WhatsApp DP (500 x 500)', width: 500, height: 500 },
  { label: 'Instagram Post (1080 x 1080)', width: 1080, height: 1080 },
  { label: 'Instagram Story (1080 x 1920)', width: 1080, height: 1920 },
  { label: 'YouTube Thumbnail (1280 x 720)', width: 1280, height: 720 },
  { label: 'Full HD (1920 x 1080)', width: 1920, height: 1080 },
  { label: 'Web Banner (1200 x 630)', width: 1200, height: 630 },
];

const TARGET_SIZE_PRESETS = [
  { label: 'Under 50 KB (Govt/Forms)', sizeKB: 50 },
  { label: 'Under 100 KB (Admissions)', sizeKB: 100 },
  { label: 'Under 200 KB (Standard)', sizeKB: 200 },
  { label: 'Under 500 KB (Web/Mobile)', sizeKB: 500 },
  { label: 'Under 1 MB (High Res)', sizeKB: 1024 },
];

export function ImageCompressor() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Global & Active Controls
  const [activeTab, setActiveTab] = useState<'compressor' | 'resizer' | 'converter' | 'targetSize'>('compressor');
  const [quality, setQuality] = useState<number>(80);
  const [outputFormat, setOutputFormat] = useState<string>('original'); // 'original', 'image/webp', 'image/jpeg', 'image/png'
  const [resizeMode, setResizeMode] = useState<'percent' | 'custom' | 'preset'>('percent');
  const [resizePercent, setResizePercent] = useState<number>(100);
  const [customWidth, setCustomWidth] = useState<number>(0);
  const [customHeight, setCustomHeight] = useState<number>(0);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(true);
  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  
  // Pro Features
  const [targetSizeKB, setTargetSizeKB] = useState<number>(100);
  const [stripExif, setStripExif] = useState<boolean>(true);
  const [applyToAll, setApplyToAll] = useState<boolean>(true);

  // Split View Comparison Slider
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0% to 100%
  const [isComparing, setIsComparing] = useState(false);
  const comparisonContainerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeImage = images.find(img => img.id === activeImageId) || images[0] || null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Helper: Read image dimensions
  const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        resolve({ width: 800, height: 600 });
      };
      img.src = url;
    });
  };

  // Core Compression / Resizing Engine using HTML5 Canvas
  const processImageFile = async (
    item: ImageItem,
    targetQuality: number,
    targetFormat: string,
    widthOverride?: number,
    heightOverride?: number,
    forceTargetSizeKB?: number
  ): Promise<{
    blob: Blob;
    url: string;
    size: number;
    width: number;
    height: number;
    savings: number;
    mime: string;
  }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        let destWidth = widthOverride && widthOverride > 0 ? widthOverride : item.originalWidth;
        let destHeight = heightOverride && heightOverride > 0 ? heightOverride : item.originalHeight;

        // Apply percentage scaling if active and no custom dimensions passed
        if (!widthOverride && resizePercent < 100) {
          destWidth = Math.max(1, Math.round(item.originalWidth * (resizePercent / 100)));
          destHeight = Math.max(1, Math.round(item.originalHeight * (resizePercent / 100)));
        }

        // Determine MIME
        let exportMime = targetFormat === 'original' ? item.file.type : targetFormat;
        if (!exportMime || exportMime === 'image/svg+xml') {
          exportMime = 'image/jpeg';
        }

        const canvas = document.createElement('canvas');
        canvas.width = destWidth;
        canvas.height = destHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }

        // Clean white background for transparent to JPG conversions
        if (exportMime === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, destWidth, destHeight);
        }

        // Always preserve full 100% original color and sharpness
        ctx.filter = 'none';

        ctx.drawImage(img, 0, 0, destWidth, destHeight);

        // If Target File Size mode is selected, run adaptive binary search
        if (forceTargetSizeKB && forceTargetSizeKB > 0) {
          const maxBytes = forceTargetSizeKB * 1024;
          let minQ = 0.05;
          let maxQ = 0.95;
          let bestBlob: Blob | null = null;
          let bestQ = 0.8;

          // Run up to 6 search iterations for fast precision
          for (let iter = 0; iter < 6; iter++) {
            const currentQ = (minQ + maxQ) / 2;
            const currentBlob: Blob = await new Promise((res) => {
              canvas.toBlob((b) => res(b || new Blob()), exportMime, currentQ);
            });

            if (currentBlob.size <= maxBytes) {
              bestBlob = currentBlob;
              bestQ = currentQ;
              minQ = currentQ; // try higher quality while staying under
            } else {
              maxQ = currentQ; // too big, decrease quality
            }
          }

          // If still over, scale down dimensions iteratively
          if (!bestBlob || bestBlob.size > maxBytes) {
            let scaleFactor = 0.85;
            let tempW = destWidth;
            let tempH = destHeight;

            while ((!bestBlob || bestBlob.size > maxBytes) && tempW > 100 && tempH > 100) {
              tempW = Math.round(tempW * scaleFactor);
              tempH = Math.round(tempH * scaleFactor);
              canvas.width = tempW;
              canvas.height = tempH;
              const scaleCtx = canvas.getContext('2d');
              if (scaleCtx) {
                if (exportMime === 'image/jpeg') {
                  scaleCtx.fillStyle = '#FFFFFF';
                  scaleCtx.fillRect(0, 0, tempW, tempH);
                }
                scaleCtx.filter = 'none';
                scaleCtx.drawImage(img, 0, 0, tempW, tempH);
                bestBlob = await new Promise((res) => {
                  canvas.toBlob((b) => res(b || new Blob()), exportMime, 0.65);
                });
                destWidth = tempW;
                destHeight = tempH;
              }
            }
          }

          const finalBlob = bestBlob || new Blob();
          const finalUrl = URL.createObjectURL(finalBlob);
          const finalSize = finalBlob.size;
          const savings = Math.max(0, Math.round(((item.originalSize - finalSize) / item.originalSize) * 100));

          resolve({
            blob: finalBlob,
            url: finalUrl,
            size: finalSize,
            width: destWidth,
            height: destHeight,
            savings,
            mime: exportMime
          });
          return;
        }

        // Standard Quality mode
        const normalizedQuality = Math.max(0.01, Math.min(1.0, targetQuality / 100));
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Compression failed'));
              return;
            }
            const url = URL.createObjectURL(blob);
            const size = blob.size;
            const savings = Math.max(0, Math.round(((item.originalSize - size) / item.originalSize) * 100));
            resolve({
              blob,
              url,
              size,
              width: destWidth,
              height: destHeight,
              savings,
              mime: exportMime
            });
          },
          exportMime,
          normalizedQuality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image file'));
      img.src = item.originalUrl;
    });
  };

  // Handle file uploads
  const handleFiles = async (files: FileList | File[]) => {
    const validImageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (validImageFiles.length === 0) {
      showToast('Please upload valid image files (JPG, PNG, WebP, GIF, etc.)');
      return;
    }

    const newItems: ImageItem[] = [];

    for (const file of validImageFiles) {
      const originalUrl = URL.createObjectURL(file);
      const { width, height } = await getImageDimensions(originalUrl);
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      newItems.push({
        id,
        file,
        name: file.name,
        originalSize: file.size,
        originalWidth: width,
        originalHeight: height,
        originalUrl,
        compressedBlob: null,
        compressedUrl: null,
        compressedSize: file.size,
        compressedWidth: width,
        compressedHeight: height,
        savingsPercentage: 0,
        format: file.type || 'image/jpeg',
        quality: quality,
        isProcessing: false,
        status: 'idle'
      });
    }

    setImages(prev => {
      const updated = [...prev, ...newItems];
      if (!activeImageId && updated.length > 0) {
        setActiveImageId(updated[0].id);
        setCustomWidth(updated[0].originalWidth);
        setCustomHeight(updated[0].originalHeight);
      }
      return updated;
    });

    showToast(`Added ${newItems.length} image${newItems.length > 1 ? 's' : ''}`);

    // Auto-compress immediately for slick instant UX
    setTimeout(() => {
      compressAllImages(newItems);
    }, 100);
  };

  // Compress all or specific images
  const compressAllImages = async (targetItems?: ImageItem[]) => {
    const listToProcess = targetItems || images;
    if (listToProcess.length === 0) return;

    setIsBatchProcessing(true);

    const updatedImages = [...images];

    for (let i = 0; i < listToProcess.length; i++) {
      const item = listToProcess[i];
      const indexInState = updatedImages.findIndex(img => img.id === item.id);
      if (indexInState === -1) continue;

      updatedImages[indexInState].isProcessing = true;
      updatedImages[indexInState].status = 'processing';
      setImages([...updatedImages]);

      try {
        const forceKB = activeTab === 'targetSize' ? targetSizeKB : undefined;
        const result = await processImageFile(
          item,
          quality,
          outputFormat,
          resizeMode === 'custom' ? customWidth : undefined,
          resizeMode === 'custom' ? customHeight : undefined,
          forceKB
        );

        updatedImages[indexInState] = {
          ...updatedImages[indexInState],
          compressedBlob: result.blob,
          compressedUrl: result.url,
          compressedSize: result.size,
          compressedWidth: result.width,
          compressedHeight: result.height,
          savingsPercentage: result.savings,
          format: result.mime,
          quality: quality,
          isProcessing: false,
          status: 'done'
        };
      } catch (err) {
        console.error('Compression error for', item.name, err);
        updatedImages[indexInState].isProcessing = false;
        updatedImages[indexInState].status = 'error';
      }

      setImages([...updatedImages]);
    }

    setIsBatchProcessing(false);
    showToast('Compression completed successfully!');
  };

  // Recompress single active image
  const compressActiveImage = async () => {
    if (!activeImage) return;

    setImages(prev => prev.map(img => img.id === activeImage.id ? { ...img, isProcessing: true } : img));

    try {
      const forceKB = activeTab === 'targetSize' ? targetSizeKB : undefined;
      const result = await processImageFile(
        activeImage,
        quality,
        outputFormat,
        resizeMode === 'custom' ? customWidth : undefined,
        resizeMode === 'custom' ? customHeight : undefined,
        forceKB
      );

      setImages(prev => prev.map(img => {
        if (img.id === activeImage.id) {
          return {
            ...img,
            compressedBlob: result.blob,
            compressedUrl: result.url,
            compressedSize: result.size,
            compressedWidth: result.width,
            compressedHeight: result.height,
            savingsPercentage: result.savings,
            format: result.mime,
            quality: quality,
            isProcessing: false,
            status: 'done'
          };
        }
        return img;
      }));

      showToast(`Updated ${activeImage.name}`);
    } catch (e) {
      console.error(e);
      showToast('Error compressing image');
      setImages(prev => prev.map(img => img.id === activeImage.id ? { ...img, isProcessing: false, status: 'error' } : img));
    }
  };

  // Single file download
  const downloadSingleImage = (item: ImageItem) => {
    if (!item.compressedBlob) {
      showToast('Image not compressed yet');
      return;
    }

    const extension = item.format.includes('webp') ? 'webp' : item.format.includes('png') ? 'png' : 'jpg';
    const cleanName = item.name.replace(/\.[^/.]+$/, '');
    const filename = `${cleanName}-compressed.${extension}`;

    const link = document.createElement('a');
    link.href = item.compressedUrl || URL.createObjectURL(item.compressedBlob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded ${filename}`);
  };

  // Batch download all compressed images as ZIP
  const downloadAllAsZip = async () => {
    if (images.length === 0) return;
    const readyImages = images.filter(img => img.compressedBlob !== null);

    if (readyImages.length === 0) {
      showToast('Please compress images before saving all.');
      return;
    }

    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('compressed-images');

      readyImages.forEach((img, idx) => {
        if (img.compressedBlob) {
          const ext = img.format.includes('webp') ? 'webp' : img.format.includes('png') ? 'png' : 'jpg';
          const cleanName = img.name.replace(/\.[^/.]+$/, '');
          const filename = `${cleanName}-min.${ext}`;
          folder?.file(filename, img.compressedBlob);
        }
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `compressed-images-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`Downloaded ${readyImages.length} images in ZIP!`);
    } catch (err) {
      console.error('ZIP Error:', err);
      showToast('Failed to create ZIP file');
    } finally {
      setIsZipping(false);
    }
  };

  // Delete single image
  const removeImage = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setImages(prev => {
      const remaining = prev.filter(img => img.id !== id);
      if (activeImageId === id) {
        setActiveImageId(remaining.length > 0 ? remaining[0].id : null);
      }
      return remaining;
    });
  };

  // Clear all images
  const clearAll = () => {
    images.forEach(img => {
      if (img.originalUrl) URL.revokeObjectURL(img.originalUrl);
      if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl);
    });
    setImages([]);
    setActiveImageId(null);
    showToast('Cleared all images');
  };

  // Dragging event listeners for split slider
  const handleSliderMove = useCallback((clientX: number) => {
    if (!comparisonContainerRef.current) return;
    const rect = comparisonContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = () => setIsComparing(true);
  const handleMouseUp = () => setIsComparing(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isComparing) handleSliderMove(e.clientX);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isComparing && e.touches[0]) handleSliderMove(e.touches[0].clientX);
    };
    const handleGlobalMouseUp = () => setIsComparing(false);

    if (isComparing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleGlobalMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [isComparing, handleSliderMove]);

  // Update dimension inputs when active image changes
  useEffect(() => {
    if (activeImage) {
      setCustomWidth(activeImage.compressedWidth || activeImage.originalWidth);
      setCustomHeight(activeImage.compressedHeight || activeImage.originalHeight);
    }
  }, [activeImageId]);

  // Aspect ratio lock handler
  const handleWidthChange = (val: number) => {
    setCustomWidth(val);
    if (maintainAspectRatio && activeImage && activeImage.originalWidth > 0) {
      const ratio = activeImage.originalHeight / activeImage.originalWidth;
      setCustomHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val: number) => {
    setCustomHeight(val);
    if (maintainAspectRatio && activeImage && activeImage.originalHeight > 0) {
      const ratio = activeImage.originalWidth / activeImage.originalHeight;
      setCustomWidth(Math.round(val * ratio));
    }
  };

  // Carousel horizontal scrolling helpers
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      carouselRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Overall batch statistics
  const totalOriginalBytes = images.reduce((acc, img) => acc + img.originalSize, 0);
  const totalCompressedBytes = images.reduce((acc, img) => acc + (img.compressedSize || img.originalSize), 0);
  const totalSavedBytes = Math.max(0, totalOriginalBytes - totalCompressedBytes);
  const overallSavingsPercent = totalOriginalBytes > 0 
    ? Math.round((totalSavedBytes / totalOriginalBytes) * 100) 
    : 0;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 z-50 bg-gray-900/95 backdrop-blur-md text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10"
          >
            <div className="w-2 h-2 rounded-full bg-[#00a884] animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => e.target.files && handleFiles(e.target.files)} 
        multiple 
        accept="image/*" 
        className="hidden" 
      />

      {/* ========================================================================= */}
      {/* TOP WORKSPACE CARD (Mode Tabs, File Uploader, Thumbnails Strip Carousel)   */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl sm:rounded-[2.5rem] border border-gray-100 p-5 sm:p-7 md:p-8 shadow-sm">
        
        {/* Top Control Bar with Feature Tabs & Global Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          
          {/* Pro Mode Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-2xl overflow-x-auto scrollbar-none w-full lg:w-auto">
            {[
              { id: 'compressor', label: 'Compressor', icon: Zap },
              { id: 'targetSize', label: 'Target KB Pro', icon: TargetSizeIcon },
              { id: 'resizer', label: 'Resizer', icon: Maximize2 },
              { id: 'converter', label: 'Converter', icon: RefreshCw },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer",
                    isActive 
                      ? "bg-white text-gray-900 shadow-sm scale-102" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  )}
                >
                  <TabIcon className={cn("w-3.5 h-3.5", isActive ? "text-[#00a884]" : "text-gray-400")} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Primary Action Buttons: Select Files | Clear | Compress All | Save All */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#00a884] hover:bg-[#008f6f] text-white font-bold rounded-xl px-4 py-2.5 text-xs sm:text-sm shadow-sm flex items-center gap-2 cursor-pointer h-auto"
            >
              <Upload className="w-4 h-4" />
              <span>Select Files</span>
            </Button>

            {images.length > 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={clearAll}
                  className="border-gray-200 text-gray-600 hover:text-rose-600 hover:border-rose-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer h-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Clear</span>
                </Button>

                <Button
                  onClick={() => compressAllImages()}
                  disabled={isBatchProcessing}
                  className="bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl px-4 py-2.5 text-xs sm:text-sm flex items-center gap-2 cursor-pointer h-auto"
                >
                  <RefreshCw className={cn("w-4 h-4 text-[#00a884]", isBatchProcessing && "animate-spin")} />
                  <span>
                    {activeTab === 'compressor' ? 'Compress' :
                     activeTab === 'targetSize' ? 'Target KB Pro' :
                     activeTab === 'resizer' ? 'Resize' :
                     'Convert'}
                  </span>
                  <span className="bg-[#00a884] text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                    {images.length}
                  </span>
                </Button>

                <Button
                  onClick={downloadAllAsZip}
                  disabled={isZipping || images.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-4 py-2.5 text-xs sm:text-sm flex items-center gap-2 cursor-pointer h-auto shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Save All</span>
                  <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                    {images.filter(i => i.compressedBlob).length}
                  </span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Drag & Drop Upload Zone (Shown when empty or expandable) */}
        {images.length === 0 ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "mt-6 border-2 border-dashed rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center group",
              isDragging 
                ? "border-[#00a884] bg-[#00a884]/5 scale-[1.01]" 
                : "border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-[#00a884]/40"
            )}
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-3xl flex items-center justify-center mb-5 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 sm:w-9 sm:h-9 text-[#00a884]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2 tracking-tight">
              Drop your images here, or <span className="text-[#00a884]">Browse</span>
            </h3>
            <p className="text-gray-500 text-xs sm:text-sm max-w-md mx-auto mb-5 leading-relaxed">
              Supports bulk upload of JPG, PNG, WebP, GIF, BMP, and SVG files. 
              100% private & secure — processed locally inside your browser.
            </p>
            <div className="flex items-center gap-3 text-xs font-bold text-gray-600 bg-white px-4 py-2 rounded-full border border-gray-200">
              <ShieldCheck className="w-4 h-4 text-[#00a884]" />
              <span>Zero server upload • Instant batch compression</span>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* THUMBNAILS CAROUSEL STRIP (Exact visual matching image)   */
          /* ========================================================= */
          <div className="mt-6 relative">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-gray-500">
                  Uploaded Queue ({images.length} Items)
                </span>
                {isBatchProcessing && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#00a884] bg-[#00a884]/10 px-2.5 py-0.5 rounded-full animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Compressing batch...
                  </span>
                )}
              </div>

              {/* Overall Total Savings Badge */}
              {totalSavedBytes > 0 && (
                <div className="text-xs font-bold text-gray-700 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Total Saved: <strong>{formatFileSize(totalSavedBytes)}</strong> ({overallSavingsPercent}%)</span>
                </div>
              )}
            </div>

            {/* Carousel Navigation Buttons */}
            {images.length > 3 && (
              <>
                <button
                  onClick={() => scrollCarousel('left')}
                  className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:scale-110 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollCarousel('right')}
                  className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:scale-110 transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Scrollable Horizontal Thumbnail Grid */}
            <div 
              ref={carouselRef}
              className="flex items-center gap-3.5 overflow-x-auto pb-3 pt-1 scrollbar-none scroll-smooth px-1"
            >
              {images.map((item) => {
                const isSelected = item.id === activeImageId;
                const ext = item.format.includes('webp') ? 'WEBP' : item.format.includes('png') ? 'PNG' : 'JPG';

                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveImageId(item.id)}
                    className={cn(
                      "group relative flex-shrink-0 w-36 sm:w-40 bg-white rounded-2xl border-2 p-2.5 flex flex-col items-center justify-between cursor-pointer transition-all duration-200 shadow-xs",
                      isSelected 
                        ? "border-[#00a884] ring-4 ring-[#00a884]/15 shadow-md scale-102" 
                        : "border-gray-200 hover:border-[#00a884]/50 hover:bg-gray-50/50"
                    )}
                  >
                    {/* Header: File Name & Delete Button */}
                    <div className="w-full flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[11px] font-bold text-gray-700 truncate block max-w-[95px]" title={item.name}>
                        {item.name}
                      </span>
                      <button
                        onClick={(e) => removeImage(item.id, e)}
                        className="w-4 h-4 rounded-full bg-gray-100 hover:bg-rose-100 text-gray-400 hover:text-rose-600 flex items-center justify-center text-[10px] transition-colors"
                        title="Remove"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    {/* Thumbnail Image Canvas with Checkerboard Pattern */}
                    <div className="w-full h-24 rounded-xl overflow-hidden relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:8px_8px] bg-gray-50 flex items-center justify-center border border-gray-100">
                      <img 
                        src={item.compressedUrl || item.originalUrl} 
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />

                      {/* Compression Savings / Status Overlay */}
                      <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px] flex flex-col items-center justify-center text-white">
                        {item.isProcessing ? (
                          <RefreshCw className="w-5 h-5 text-white animate-spin" />
                        ) : item.savingsPercentage > 0 ? (
                          <div className="text-center">
                            <span className="text-xl font-black tracking-tight text-white drop-shadow-md">
                              -{item.savingsPercentage}%
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-300 block -mt-1">
                              {ext}
                            </span>
                          </div>
                        ) : (
                          <div className="text-center">
                            <span className="text-lg font-black text-white/90">
                              -0%
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-white/70 block -mt-1">
                              {ext}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Individual Save Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadSingleImage(item);
                      }}
                      className={cn(
                        "w-full mt-2 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer",
                        item.compressedBlob
                          ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-800"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      )}
                    >
                      <Download className="w-3 h-3" />
                      <span>SAVE</span>
                    </button>
                  </div>
                );
              })}

              {/* Quick Add More Card at end of carousel */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 w-32 h-36 rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#00a884] hover:bg-[#00a884]/5 flex flex-col items-center justify-center text-center cursor-pointer transition-all p-3 text-gray-500 hover:text-[#00a884]"
              >
                <Upload className="w-5 h-5 mb-1 text-gray-400" />
                <span className="text-xs font-bold">Add More</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ACTIVE IMAGE INSPECTOR & INTERACTIVE BEFORE/AFTER SPLIT COMPARISON SLIDER */}
      {/* ========================================================================= */}
      {activeImage && (
        <div className="bg-white rounded-3xl sm:rounded-[2.5rem] border border-gray-100 p-5 sm:p-7 md:p-8 shadow-sm space-y-6">
          
          {/* Header of Inspector: Filename & Before / After Size Comparison Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Image Inspector</span>
                <span className="text-[10px] font-black bg-[#00a884]/10 text-[#00a884] px-2 py-0.5 rounded-full">
                  {activeImage.format.split('/')[1]?.toUpperCase() || 'JPG'}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight truncate max-w-md">
                {activeImage.name}
              </h3>
            </div>

            {/* Before vs After Comparison Pill */}
            <div className="flex items-center gap-3 bg-gray-50 p-2 sm:p-2.5 rounded-2xl border border-gray-200/80">
              <div className="text-left px-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Original</span>
                <span className="text-xs sm:text-sm font-bold text-gray-700">
                  {formatFileSize(activeImage.originalSize)}
                </span>
                <span className="text-[10px] text-gray-400 block">
                  {activeImage.originalWidth}x{activeImage.originalHeight}
                </span>
              </div>

              <div className="w-px h-8 bg-gray-200" />

              <div className="text-left px-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block">Compressed</span>
                <span className="text-xs sm:text-sm font-black text-emerald-600">
                  {formatFileSize(activeImage.compressedSize)} 
                  {activeImage.savingsPercentage > 0 && ` (-${activeImage.savingsPercentage}%)`}
                </span>
                <span className="text-[10px] text-emerald-600 block">
                  {activeImage.compressedWidth}x{activeImage.compressedHeight}
                </span>
              </div>
            </div>
          </div>

          {/* Main Visual Arena: Comparison Split Slider (Left = Before, Right = After) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Split Comparison Canvas Box (Col Span 8) */}
            <div className="lg:col-span-8 flex flex-col items-center">
              <div
                ref={comparisonContainerRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
                className="relative w-full h-80 sm:h-96 md:h-[420px] rounded-3xl overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:12px_12px] bg-gray-100 border border-gray-200 select-none shadow-inner cursor-ew-resize group"
              >
                {/* AFTER IMAGE (Compressed) Background layer */}
                <img
                  src={activeImage.compressedUrl || activeImage.originalUrl}
                  alt="Compressed result"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />

                {/* BEFORE IMAGE (Original) Clipped Left Layer */}
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{ width: `${sliderPosition}%` }}
                >
                  <img
                    src={activeImage.originalUrl}
                    alt="Original source"
                    className="absolute inset-0 w-full h-full object-contain max-w-none"
                    style={{
                      width: comparisonContainerRef.current ? `${comparisonContainerRef.current.clientWidth}px` : '100%',
                      height: '100%'
                    }}
                  />
                </div>

                {/* Visual Badges for Split Sides */}
                <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full pointer-events-none flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Before: {formatFileSize(activeImage.originalSize)}</span>
                </div>

                <div className="absolute top-4 right-4 z-20 bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full pointer-events-none flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span>After: {formatFileSize(activeImage.compressedSize)} (-{activeImage.savingsPercentage}%)</span>
                </div>

                {/* Vertical Divider Slider Line with Central Drag Handle */}
                <div
                  className="absolute top-0 bottom-0 z-30 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.4)] pointer-events-none flex items-center justify-center"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="w-9 h-9 rounded-full bg-white border-2 border-[#00a884] shadow-xl flex items-center justify-center text-[#00a884] font-black text-xs">
                    <span className="tracking-tighter font-mono">‹›</span>
                  </div>
                </div>
              </div>

              {/* Slider Instruction Note */}
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 font-medium">
                <Sliders className="w-3.5 h-3.5 text-[#00a884]" />
                <span>Drag the handle across the image to inspect real-time compression clarity</span>
              </div>
            </div>

            {/* Pro Settings & Tuning Column (Col Span 4) */}
            <div className="lg:col-span-4 bg-gray-50/80 rounded-3xl p-5 sm:p-6 border border-gray-200/80 space-y-5">
              
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-[#00a884]" />
                  <span>Compression Settings</span>
                </h4>
              </div>

              {/* TAB 1: QUALITY MODE */}
              {activeTab === 'compressor' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700">Quality Level</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={quality}
                        onChange={(e) => setQuality(Math.max(1, Math.min(100, parseInt(e.target.value) || 80)))}
                        className="w-14 px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-black text-center text-[#00a884] focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                      />
                      <span className="text-xs font-bold text-gray-400">%</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full accent-[#00a884] cursor-pointer h-2 bg-gray-200 rounded-lg"
                  />

                  {/* Quality Quick Presets */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {[
                      { label: 'Low 40%', q: 40 },
                      { label: 'Bal 65%', q: 65 },
                      { label: 'High 80%', q: 80 },
                      { label: 'Max 92%', q: 92 },
                    ].map((p) => (
                      <button
                        key={p.q}
                        onClick={() => setQuality(p.q)}
                        className={cn(
                          "py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all text-center border cursor-pointer",
                          quality === p.q
                            ? "bg-[#00a884] text-white border-[#00a884]"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: TARGET SIZE PRO MODE */}
              {activeTab === 'targetSize' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700">Target Max File Size</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="10"
                        max="10000"
                        value={targetSizeKB}
                        onChange={(e) => setTargetSizeKB(Math.max(5, parseInt(e.target.value) || 50))}
                        className="w-16 px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-black text-center text-[#00a884] focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                      />
                      <span className="text-xs font-bold text-gray-400">KB</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-500 leading-tight">
                    Smart auto-compression will automatically calculate the best resolution and quality to fit under this target.
                  </p>

                  <div className="space-y-1.5">
                    {TARGET_SIZE_PRESETS.map((t) => (
                      <button
                        key={t.sizeKB}
                        onClick={() => setTargetSizeKB(t.sizeKB)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between border cursor-pointer",
                          targetSizeKB === t.sizeKB
                            ? "bg-[#00a884] text-white border-[#00a884]"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        )}
                      >
                        <span>{t.label}</span>
                        <span className={cn("text-[10px] font-black px-1.5 py-0.5 rounded-md", targetSizeKB === t.sizeKB ? "bg-white/20" : "bg-gray-100")}>
                          {t.sizeKB} KB
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: RESIZE MODE */}
              {activeTab === 'resizer' && (
                <div className="space-y-4">
                  {/* Resize Mode Selector */}
                  <div className="grid grid-cols-3 gap-1 p-1 bg-gray-200/70 rounded-xl">
                    {[
                      { id: 'percent', label: 'Percent %' },
                      { id: 'custom', label: 'Custom Px' },
                      { id: 'preset', label: 'Presets' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setResizeMode(m.id as any)}
                        className={cn(
                          "py-1 text-[11px] font-bold rounded-lg transition-all",
                          resizeMode === m.id ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
                        )}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {resizeMode === 'percent' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-gray-700">
                        <span>Scale Ratio</span>
                        <span className="text-[#00a884] font-black">{resizePercent}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={resizePercent}
                        onChange={(e) => setResizePercent(parseInt(e.target.value))}
                        className="w-full accent-[#00a884] cursor-pointer h-2 bg-gray-200 rounded-lg"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400">
                        <span>25% Tiny</span>
                        <span>50% Medium</span>
                        <span>100% Full</span>
                      </div>
                    </div>
                  )}

                  {resizeMode === 'custom' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-black uppercase text-gray-500 block mb-1">Width (px)</label>
                          <input
                            type="number"
                            value={customWidth || ''}
                            onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase text-gray-500 block mb-1">Height (px)</label>
                          <input
                            type="number"
                            value={customHeight || ''}
                            onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => setMaintainAspectRatio(!maintainAspectRatio)}
                        className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-900 cursor-pointer"
                      >
                        {maintainAspectRatio ? (
                          <Lock className="w-3.5 h-3.5 text-[#00a884]" />
                        ) : (
                          <Unlock className="w-3.5 h-3.5 text-gray-400" />
                        )}
                        <span>Maintain Aspect Ratio</span>
                      </button>
                    </div>
                  )}

                  {resizeMode === 'preset' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 block">Select Target Preset</label>
                      <select
                        value={selectedPreset}
                        onChange={(e) => {
                          const idx = parseInt(e.target.value);
                          setSelectedPreset(idx);
                          const p = RESIZE_PRESETS[idx];
                          if (p.width > 0) {
                            setCustomWidth(p.width);
                            setCustomHeight(p.height);
                            setResizeMode('custom');
                          }
                        }}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800"
                      >
                        {RESIZE_PRESETS.map((p, idx) => (
                          <option key={idx} value={idx}>{p.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: CONVERTER MODE */}
              {activeTab === 'converter' && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-700 block">Target File Format</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'original', label: 'Keep Original', desc: 'Auto' },
                      { id: 'image/webp', label: 'WebP', desc: 'Smallest (~80% off)' },
                      { id: 'image/jpeg', label: 'JPG / JPEG', desc: 'Universal' },
                      { id: 'image/png', label: 'PNG', desc: 'Lossless' },
                    ].map((fmt) => (
                      <button
                        key={fmt.id}
                        onClick={() => setOutputFormat(fmt.id)}
                        className={cn(
                          "p-2.5 rounded-xl text-left transition-all border cursor-pointer",
                          outputFormat === fmt.id
                            ? "bg-[#00a884] text-white border-[#00a884] shadow-xs"
                            : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"
                        )}
                      >
                        <span className="text-xs font-black block">{fmt.label}</span>
                        <span className={cn("text-[10px] block opacity-80", outputFormat === fmt.id ? "text-white" : "text-gray-400")}>
                          {fmt.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pro Toggles: Strip EXIF & Privacy */}
              <div className="pt-2 border-t border-gray-200/80 space-y-2">
                <label className="flex items-center justify-between text-xs font-bold text-gray-700 cursor-pointer">
                  <span>Strip EXIF & Privacy Metadata</span>
                  <input
                    type="checkbox"
                    checked={stripExif}
                    onChange={(e) => setStripExif(e.target.checked)}
                    className="accent-[#00a884] w-4 h-4 rounded"
                  />
                </label>

                <label className="flex items-center justify-between text-xs font-bold text-gray-700 cursor-pointer">
                  <span>Apply settings to all {images.length} files</span>
                  <input
                    type="checkbox"
                    checked={applyToAll}
                    onChange={(e) => setApplyToAll(e.target.checked)}
                    className="accent-[#00a884] w-4 h-4 rounded"
                  />
                </label>
              </div>

              {/* Action Buttons: Apply / Recompress & Download Single */}
              <div className="pt-3 space-y-2">
                <Button
                  onClick={() => {
                    if (applyToAll) {
                      compressAllImages();
                    } else {
                      compressActiveImage();
                    }
                  }}
                  disabled={activeImage.isProcessing}
                  className="w-full bg-[#00a884] hover:bg-[#008f6f] text-white font-bold rounded-xl py-3 text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <RefreshCw className={cn("w-4 h-4", activeImage.isProcessing && "animate-spin")} />
                  <span>
                    {applyToAll ? (
                      activeTab === 'compressor' ? 'Compress All Images' :
                      activeTab === 'targetSize' ? 'Target KB Pro All' :
                      activeTab === 'resizer' ? 'Resize All Images' :
                      'Convert All Images'
                    ) : (
                      activeTab === 'compressor' ? 'Compress This Image' :
                      activeTab === 'targetSize' ? 'Target KB Pro Image' :
                      activeTab === 'resizer' ? 'Resize This Image' :
                      'Convert This Image'
                    )}
                  </span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => downloadSingleImage(activeImage)}
                  disabled={!activeImage.compressedBlob}
                  className="w-full border-gray-200 text-gray-700 hover:bg-gray-100 rounded-xl py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Download This Image</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* WHY USE OUR PRO COMPRESSOR & PRIVACY BANNER                              */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00a884] flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">100% Client-Side Privacy</h4>
            <p className="text-gray-500 text-xs leading-relaxed">
              Your photos never get uploaded to any server. Everything is processed directly in your browser's RAM memory.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">Target KB Pro Algorithm</h4>
            <p className="text-gray-500 text-xs leading-relaxed">
              Need images under 50KB or 100KB for government forms, visas, or admission portals? Our auto-search hits the exact size.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <FileArchive className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">Batch Zip Export</h4>
            <p className="text-gray-500 text-xs leading-relaxed">
              Compress dozens of photos at once with visual comparison and download everything in a clean, organized ZIP file.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom Target Size Icon
function TargetSizeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
