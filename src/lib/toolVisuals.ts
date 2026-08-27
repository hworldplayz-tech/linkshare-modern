import {
  Disc,
  FileSearch,
  LayoutGrid,
  Type,
  Link as LinkIcon,
  Sparkles,
  Repeat,
  ScanLine,
  FileText,
  Smartphone,
  MessageCircle,
  Link2,
  CircleDot,
  Users,
  AlignLeft,
  FileStack,
  PlaySquare,
  MessageSquarePlus,
  Code2,
  Palette,
  AppWindow,
  Wrench,
  Video,
  LucideIcon
} from 'lucide-react';

export interface ToolVisual {
  icon: LucideIcon;
  bgClass: string;
  textClass: string;
  iconBgColor?: string;
}

export const TOOL_VISUALS: Record<string, ToolVisual> = {
  'ai-detector': {
    icon: Disc,
    bgClass: 'bg-indigo-50/90 text-indigo-500 group-hover:bg-indigo-100/90',
    textClass: 'text-indigo-500',
  },
  'plagiarism-checker': {
    icon: FileSearch,
    bgClass: 'bg-sky-50/90 text-sky-500 group-hover:bg-sky-100/90',
    textClass: 'text-sky-500',
  },
  'qr-code-generator': {
    icon: LayoutGrid,
    bgClass: 'bg-slate-100 text-slate-700 group-hover:bg-slate-200/90',
    textClass: 'text-slate-700',
  },
  'word-counter': {
    icon: Type,
    bgClass: 'bg-emerald-50 text-emerald-500 group-hover:bg-emerald-100/90',
    textClass: 'text-emerald-500',
  },
  'short-url-generator': {
    icon: Link2,
    bgClass: 'bg-amber-50 text-amber-500 group-hover:bg-amber-100/90',
    textClass: 'text-amber-500',
  },
  'stylish-text': {
    icon: Sparkles,
    bgClass: 'bg-purple-50 text-purple-500 group-hover:bg-purple-100/90',
    textClass: 'text-purple-500',
  },
  'text-repeater': {
    icon: Repeat,
    bgClass: 'bg-pink-50 text-pink-500 group-hover:bg-pink-100/90',
    textClass: 'text-pink-500',
  },
  'qr-scanner': {
    icon: ScanLine,
    bgClass: 'bg-teal-50 text-teal-500 group-hover:bg-teal-100/90',
    textClass: 'text-teal-500',
  },
  'pdf-editor': {
    icon: FileText,
    bgClass: 'bg-rose-50 text-rose-500 group-hover:bg-rose-100/90',
    textClass: 'text-rose-500',
  },
  'fake-whatsapp-screenshot': {
    icon: Smartphone,
    bgClass: 'bg-green-50 text-green-500 group-hover:bg-green-100/90',
    textClass: 'text-green-500',
  },
  'whatsapp-read-more': {
    icon: MessageCircle,
    bgClass: 'bg-emerald-50 text-emerald-500 group-hover:bg-emerald-100/90',
    textClass: 'text-emerald-500',
  },
  'whatsapp-link-generator': {
    icon: LinkIcon,
    bgClass: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100/90',
    textClass: 'text-emerald-600',
  },
  'whatsapp-dp-border': {
    icon: CircleDot,
    bgClass: 'bg-emerald-50 text-emerald-500 group-hover:bg-emerald-100/90',
    textClass: 'text-emerald-500',
  },
  'whatsapp-group-name-generator': {
    icon: Users,
    bgClass: 'bg-emerald-50 text-emerald-500 group-hover:bg-emerald-100/90',
    textClass: 'text-emerald-500',
  },
  'whatsapp-status-formatter': {
    icon: AlignLeft,
    bgClass: 'bg-emerald-50 text-emerald-500 group-hover:bg-emerald-100/90',
    textClass: 'text-emerald-500',
  },
  'image-pdf-merger': {
    icon: FileStack,
    bgClass: 'bg-rose-50 text-rose-500 group-hover:bg-rose-100/90',
    textClass: 'text-rose-500',
  },
  'm3u-playlist-viewer': {
    icon: PlaySquare,
    bgClass: 'bg-indigo-50 text-indigo-500 group-hover:bg-indigo-100/90',
    textClass: 'text-indigo-500',
  },
  'whatsapp-caption-generator': {
    icon: MessageSquarePlus,
    bgClass: 'bg-emerald-50 text-emerald-500 group-hover:bg-emerald-100/90',
    textClass: 'text-emerald-500',
  },
  'source-code-viewer': {
    icon: Code2,
    bgClass: 'bg-sky-50 text-sky-500 group-hover:bg-sky-100/90',
    textClass: 'text-sky-500',
  },
  'image-editor': {
    icon: Palette,
    bgClass: 'bg-purple-50 text-purple-500 group-hover:bg-purple-100/90',
    textClass: 'text-purple-500',
  },
  'iframe-generator': {
    icon: AppWindow,
    bgClass: 'bg-teal-50 text-[#00a884] group-hover:bg-emerald-100/90',
    textClass: 'text-[#00a884]',
  },
  'tiktok-downloader': {
    icon: Video,
    bgClass: 'bg-pink-50 text-pink-600 group-hover:bg-pink-100/90',
    textClass: 'text-pink-600',
  },
};

export function getToolVisual(toolIdOrSlug: string): ToolVisual {
  if (TOOL_VISUALS[toolIdOrSlug]) {
    return TOOL_VISUALS[toolIdOrSlug];
  }
  // Try clean slug fallback
  const slugKey = toolIdOrSlug.replace(/^(tool-)/, '');
  if (TOOL_VISUALS[slugKey]) {
    return TOOL_VISUALS[slugKey];
  }
  return {
    icon: Wrench,
    bgClass: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100/90',
    textClass: 'text-emerald-600',
  };
}
