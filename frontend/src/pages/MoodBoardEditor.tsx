import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Save, Download, Share2, Type, Image, Square,
  Trash2, ZoomIn, ZoomOut, RotateCcw, ArrowLeft,
  Palette, Layers, CheckCircle2, Link2
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Button, Card } from '@/src/components/Layout';
import { Logo } from '@/src/components/Logo';
import { useLanguage } from '@/src/context/LanguageContext';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/Toast';
import { cn } from '@/src/utils/cn';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Tool types for the editor toolbar
type EditorTool = 'select' | 'text' | 'image' | 'shape';

const COLOR_SWATCHES = [
  '#F5EFE6', '#C9704A', '#1A1A1A', '#FAFAFA',
  '#E8DFD2', '#4A3F35', '#D2C2B1', '#8B6914',
];

const SAMPLE_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=60&w=300', label: 'Living Room' },
  { url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=60&w=300', label: 'Bedroom' },
  { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=60&w=300', label: 'Detail' },
  { url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=60&w=300', label: 'Lighting' },
];

export default function MoodBoardEditor() {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const { token } = useAuth();
  const { success, error: toastError, info } = useToast();
  const isAr = language === 'ar';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTool, setActiveTool] = useState<EditorTool>('select');
  const [activePanel, setActivePanel] = useState<'images' | 'colors' | 'layers'>('images');
  const [isSaved, setIsSaved] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // NOTE: In production this integrates Fabric.js:
  //   import { fabric } from 'fabric';
  //   const fabricCanvas = new fabric.Canvas(canvasRef.current, { ...options });
  // For now we render a placeholder canvas with instructions.

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw placeholder grid
    ctx.fillStyle = '#F5EFE6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.strokeStyle = '#E8DFD2';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Center text
    ctx.fillStyle = '#C9704A';
    ctx.font = 'bold 18px Manrope, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Canvas Editor', canvas.width / 2, canvas.height / 2 - 12);
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '13px Manrope, sans-serif';
    ctx.fillText('Fabric.js integration ready — drag images from sidebar', canvas.width / 2, canvas.height / 2 + 16);
  }, []);

  const handleSave = async () => {
    if (!id || !token) return;
    try {
      const res = await fetch(`${API_URL}/api/moodboards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ canvas_data: { saved_at: new Date().toISOString() } }),
      });
      if (!res.ok) throw new Error();
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
      success(isAr ? 'تم الحفظ' : 'Board saved!');
    } catch {
      toastError(isAr ? 'فشل الحفظ' : 'Failed to save.');
    }
  };

  const handleShare = async () => {
    if (!id || !token) return;
    setIsSharing(true);
    try {
      const res = await fetch(`${API_URL}/api/moodboards/${id}/share`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const { share_url } = await res.json();
      await navigator.clipboard.writeText(share_url);
      success(isAr ? 'تم نسخ رابط المشاركة' : 'Share link copied to clipboard!');
    } catch {
      toastError(isAr ? 'فشل إنشاء رابط المشاركة' : 'Failed to generate share link.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleExport = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsExporting(true);
    try {
      // Try PDF export using jsPDF if available, fallback to PNG
      const jsPDFModule = await import('jspdf').catch(() => null);
      if (jsPDFModule) {
        const { jsPDF } = jsPDFModule;
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
        pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
        pdf.save(`moodboard-${id || 'export'}.pdf`);
      } else {
        const link = document.createElement('a');
        link.download = `moodboard-${id || 'export'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    } finally {
      setIsExporting(false);
    }
  };

  const TOOLS: { id: EditorTool; icon: React.ElementType; labelEn: string; labelAr: string }[] = [
    { id: 'select', icon: Square, labelEn: 'Select', labelAr: 'تحديد' },
    { id: 'text', icon: Type, labelEn: 'Text', labelAr: 'نص' },
    { id: 'image', icon: Image, labelEn: 'Image', labelAr: 'صورة' },
    { id: 'shape', icon: Square, labelEn: 'Shape', labelAr: 'شكل' },
  ];

  return (
    <div className="flex h-screen bg-background-light overflow-hidden">
      {/* Left Sidebar — Tools */}
      <aside className="w-16 bg-white border-r border-primary/10 flex flex-col items-center py-4 gap-2 z-20">
        <Link to="/dashboard" className="mb-4">
          <Logo size={28} className="text-primary" />
        </Link>
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            title={isAr ? tool.labelAr : tool.labelEn}
            className={cn(
              'size-10 rounded-xl flex items-center justify-center transition-all',
              activeTool === tool.id
                ? 'bg-primary text-white shadow-md shadow-primary/30'
                : 'text-slate-400 hover:bg-primary/5 hover:text-primary'
            )}
          >
            <tool.icon size={18} />
          </button>
        ))}
        <div className="mt-auto flex flex-col gap-2">
          <button
            title="Undo"
            className="size-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-primary/5 hover:text-primary transition-all"
          >
            <RotateCcw size={18} />
          </button>
          <button
            title="Delete selected"
            className="size-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </aside>

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 bg-white border-b border-primary/10 flex items-center px-4 gap-4 shrink-0">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors">
            <ArrowLeft size={16} />
            {isAr ? 'العودة' : 'Back'}
          </Link>
          <div className="h-5 w-px bg-slate-200" />
          <input
            type="text"
            defaultValue="Untitled Mood Board"
            className="text-sm font-black bg-transparent focus:outline-none focus:ring-0 text-slate-700 w-48"
          />
          <div className="ml-auto flex items-center gap-2">
            <button className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 transition-all">
              <ZoomOut size={16} />
            </button>
            <span className="text-xs font-black text-slate-400 w-10 text-center">100%</span>
            <button className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 transition-all">
              <ZoomIn size={16} />
            </button>
            <div className="h-5 w-px bg-slate-200 mx-1" />
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl gap-2 bg-white"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="size-3.5 border-2 border-slate-300 border-t-slate-600 rounded-full" />
              ) : (
                <Download size={14} />
              )}
              {isAr ? 'تصدير PDF' : 'Export PDF'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl gap-2 bg-white"
              onClick={handleShare}
              disabled={isSharing}
            >
              {isSharing ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="size-3.5 border-2 border-slate-300 border-t-slate-600 rounded-full" />
              ) : (
                <Link2 size={14} />
              )}
              {isAr ? 'مشاركة' : 'Share'}
            </Button>
            <Button
              size="sm"
              className={cn('rounded-xl gap-2', isSaved ? 'bg-emerald-500 hover:bg-emerald-500' : '')}
              onClick={handleSave}
            >
              {isSaved ? <CheckCircle2 size={14} /> : <Save size={14} />}
              {isSaved ? (isAr ? 'تم الحفظ' : 'Saved!') : (isAr ? 'حفظ' : 'Save')}
            </Button>
          </div>
        </header>

        {/* Canvas */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-8">
          <canvas
            ref={canvasRef}
            width={1200}
            height={800}
            className="bg-white shadow-2xl rounded-2xl max-w-full"
            style={{ cursor: activeTool === 'text' ? 'text' : activeTool === 'select' ? 'default' : 'crosshair' }}
          />
        </div>
      </div>

      {/* Right Sidebar — Assets */}
      <aside className="w-64 bg-white border-l border-primary/10 flex flex-col shrink-0">
        {/* Panel Tabs */}
        <div className="flex border-b border-primary/10">
          {[
            { id: 'images' as const, icon: Image, labelEn: 'Images', labelAr: 'صور' },
            { id: 'colors' as const, icon: Palette, labelEn: 'Colors', labelAr: 'ألوان' },
            { id: 'layers' as const, icon: Layers, labelEn: 'Layers', labelAr: 'طبقات' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActivePanel(tab.id)}
              className={cn(
                'flex-1 flex flex-col items-center py-3 gap-1 text-[10px] font-black uppercase tracking-widest transition-colors',
                activePanel === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-slate-400 hover:text-primary'
              )}
            >
              <tab.icon size={16} />
              {isAr ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activePanel === 'images' && (
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {isAr ? 'صور لوحة الأفكار' : 'Mood Board Images'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {SAMPLE_IMAGES.map((img, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="aspect-square rounded-xl overflow-hidden group relative"
                    draggable
                  >
                    <img
                      src={img.url}
                      alt={img.label}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                  </motion.button>
                ))}
              </div>
              <button className="flex items-center gap-2 text-xs font-black text-primary hover:underline mt-2">
                <Image size={14} />
                {isAr ? 'رفع صورة' : 'Upload image'}
              </button>
            </div>
          )}

          {activePanel === 'colors' && (
            <div className="flex flex-col gap-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {isAr ? 'لوحة الألوان' : 'Color Palette'}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {COLOR_SWATCHES.map((hex) => (
                  <button
                    key={hex}
                    title={hex}
                    className="aspect-square rounded-xl border border-slate-100 hover:scale-110 transition-transform shadow-sm"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
              <input type="color" className="w-full h-10 rounded-xl border border-slate-100 cursor-pointer" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                {isAr ? 'ألوان التصميم' : 'Design Colors'}
              </p>
              <div className="flex h-12 rounded-2xl overflow-hidden shadow-inner">
                {['#F5EFE6','#E8DFD2','#D2C2B1','#C9704A','#4A3F35'].map((c) => (
                  <div key={c} className="flex-1 cursor-pointer hover:flex-[2] transition-all" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          )}

          {activePanel === 'layers' && (
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                {isAr ? 'الطبقات' : 'Layers'}
              </p>
              {['Background', 'Image 1', 'Image 2', 'Text Label'].map((layer, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 cursor-pointer group">
                  <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Layers size={14} className="text-slate-400" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 flex-1">{layer}</span>
                  <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
