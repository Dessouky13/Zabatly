import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  Armchair,
  Bed,
  ChefHat,
  Briefcase,
  Bath,
  Plus,
  Sparkles,
  Download,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { Sidebar, Header, Button, Card } from '@/src/components/Layout';
import { cn } from '@/src/utils/cn';
import { useLanguage } from '@/src/context/LanguageContext';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/Toast';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

const ROOM_MAP: Record<string, string> = {
  living: 'Living Room',
  bedroom: 'Bedroom',
  kitchen: 'Kitchen',
  office: 'Office',
  bathroom: 'Bathroom',
};

const STYLE_OPTIONS = [
  { value: 'modern', labelEn: 'Modern', labelAr: 'عصري' },
  { value: 'scandinavian', labelEn: 'Scandinavian', labelAr: 'إسكندنافي' },
  { value: 'minimal', labelEn: 'Minimal', labelAr: 'مينيمال' },
  { value: 'industrial', labelEn: 'Industrial', labelAr: 'إندستريال' },
  { value: 'boho', labelEn: 'Boho', labelAr: 'بوهو' },
  { value: 'classic', labelEn: 'Classic', labelAr: 'كلاسيكي' },
  { value: 'luxury', labelEn: 'Luxury', labelAr: 'فاخر' },
];

interface ColorSwatch { hex: string; name: string }
interface FurnitureSuggestion { item: string; style: string; material: string }

interface GeneratedBoard {
  id: string;
  title: string;
  generated_images: string[];
  color_palette: ColorSwatch[];
  materials: string[];
  furniture_suggestions: FurnitureSuggestion[];
}

const PRESET_COLORS = [
  { hex: '#fed7aa', name: 'Peach' },
  { hex: '#e2e8f0', name: 'Slate Blue' },
  { hex: '#d1fae5', name: 'Sage' },
  { hex: '#dbeafe', name: 'Sky' },
  { hex: '#78716c', name: 'Warm Stone' },
  { hex: '#f5f1ed', name: 'Beige' },
];

export default function MoodBoardGenerator() {
  const { t, language } = useLanguage();
  const { token, plan } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const isAr = language === 'ar';

  const [selectedRoom, setSelectedRoom] = useState('living');
  const [selectedStyle, setSelectedStyle] = useState('modern');
  const [selectedColor, setSelectedColor] = useState('#fed7aa');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [board, setBoard] = useState<GeneratedBoard | null>(null);

  const handleGenerate = async () => {
    if (!token) { toastError(isAr ? 'يجب تسجيل الدخول أولاً' : 'Please log in first.'); return; }
    setIsGenerating(true);
    try {
      const res = await fetch(`${API_URL}/api/moodboards/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          room_type: ROOM_MAP[selectedRoom],
          style: selectedStyle,
          color_preference: selectedColor,
          custom_prompt: prompt || undefined,
        }),
      });
      if (res.status === 402 || res.status === 403) {
        toastError(isAr ? 'لقد وصلت للحد الأقصى. قم بالترقية للمزيد.' : 'Usage limit reached. Upgrade your plan.');
        navigate('/pricing');
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Generation failed');
      }
      const { board: b } = await res.json();
      setBoard(b);
      success(isAr ? 'تم إنشاء لوحة الأفكار!' : 'Mood board generated!');
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : (isAr ? 'فشل الإنشاء' : 'Failed to generate. Try again.'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!board?.id || !token) return;
    try {
      const res = await fetch(`${API_URL}/api/moodboards/${board.id}/share`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const { share_url } = await res.json();
      await navigator.clipboard.writeText(share_url);
      success(isAr ? 'تم نسخ رابط المشاركة' : 'Share link copied!');
    } catch {
      toastError(isAr ? 'فشل إنشاء رابط المشاركة' : 'Failed to generate share link.');
    }
  };

  const images: string[] = board ? (Array.isArray(board.generated_images) ? board.generated_images : []) : [];
  const palette: ColorSwatch[] = board ? (Array.isArray(board.color_palette) ? board.color_palette : []) : [];
  const materials: string[] = board ? (Array.isArray(board.materials) ? board.materials : []) : [];
  const furniture: FurnitureSuggestion[] = board ? (Array.isArray(board.furniture_suggestions) ? board.furniture_suggestions : []) : [];

  return (
    <div className="flex min-h-screen bg-background-light">
      <Sidebar activePath="/mood-boards" />

      <main className="flex-1 flex flex-col">
        <Header />

        <div className="p-8 max-w-7xl mx-auto w-full">
          <div className="mb-12">
            <h1 className="text-5xl font-black tracking-tight mb-4 text-slate-900">{t('moodboard.title')}</h1>
            <p className="text-lg text-slate-500 max-w-2xl">{t('moodboard.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Panel: Input */}
            <aside className="lg:col-span-4 flex flex-col gap-8">
              <Card className="p-8 bg-white/70 backdrop-blur-md">
                <h3 className="text-lg font-black mb-8 flex items-center gap-3 uppercase tracking-tight">
                  <Settings className="text-primary" size={20} />
                  {t('moodboard.params')}
                </h3>

                <div className="space-y-8">
                  {/* Room Type */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
                      {t('moodboard.roomType')}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'living', labelKey: 'moodboard.room.living', icon: Armchair },
                        { key: 'bedroom', labelKey: 'moodboard.room.bedroom', icon: Bed },
                        { key: 'kitchen', labelKey: 'moodboard.room.kitchen', icon: ChefHat },
                        { key: 'office', labelKey: 'moodboard.room.office', icon: Briefcase },
                        { key: 'bathroom', labelKey: 'moodboard.room.bathroom', icon: Bath },
                      ].map((room) => (
                        <button
                          key={room.key}
                          onClick={() => setSelectedRoom(room.key)}
                          className={cn(
                            'flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all',
                            selectedRoom === room.key
                              ? 'bg-primary text-white shadow-lg shadow-primary/20'
                              : 'bg-primary/5 text-slate-600 hover:bg-primary/10'
                          )}
                        >
                          <room.icon size={18} />
                          {t(room.labelKey)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Style Selector */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
                      {t('moodboard.style')}
                    </label>
                    <select
                      value={selectedStyle}
                      onChange={(e) => setSelectedStyle(e.target.value)}
                      className="w-full bg-primary/5 border-none rounded-xl text-sm font-bold p-4 focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
                    >
                      {STYLE_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {isAr ? s.labelAr : s.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Color Selector */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
                      {t('moodboard.dominantColor')}
                    </label>
                    <div className="flex items-center flex-wrap gap-3">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color.hex}
                          onClick={() => setSelectedColor(color.hex)}
                          className={cn(
                            'size-10 rounded-full border-2 transition-all hover:scale-110',
                            selectedColor === color.hex
                              ? 'border-primary ring-4 ring-primary/10 scale-110'
                              : 'border-transparent'
                          )}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                      ))}
                      <label className="size-10 rounded-full bg-primary/5 flex items-center justify-center text-slate-400 border border-dashed border-slate-300 hover:bg-primary/10 transition-colors cursor-pointer" title="Custom color">
                        <Plus size={18} />
                        <input type="color" className="sr-only" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} />
                      </label>
                    </div>
                  </div>

                  {/* Prompt Input */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
                      {t('moodboard.promptLabel')}
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="w-full bg-primary/5 border-none rounded-xl text-sm font-bold p-5 focus:ring-2 focus:ring-primary/50 placeholder:text-slate-400 min-h-[100px] resize-none"
                      placeholder={t('moodboard.promptPlaceholder')}
                      maxLength={500}
                    />
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full py-5 rounded-2xl text-lg gap-3"
                  >
                    {isGenerating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                          className="size-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                        {isAr ? 'جاري الإنشاء…' : 'Generating…'}
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        {t('moodboard.generateBtn')}
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </aside>

            {/* Right Panel: Results */}
            <section className="lg:col-span-8 flex flex-col gap-10">
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-[500px] gap-6"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                      className="size-16 border-4 border-primary/20 border-t-primary rounded-full"
                    />
                    <div className="text-center">
                      <p className="font-black text-slate-800 text-lg">
                        {isAr ? 'الذكاء الاصطناعي يُبدع…' : 'AI is creating your board…'}
                      </p>
                      <p className="text-slate-500 text-sm mt-1">
                        {isAr ? 'قد يستغرق هذا 15-30 ثانية' : 'This may take 15–30 seconds'}
                      </p>
                    </div>
                  </motion.div>
                ) : board && images.length > 0 ? (
                  <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    {/* Image Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-[500px] mb-8">
                      {images.map((url, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          className={cn(
                            'rounded-[2rem] overflow-hidden shadow-sm group relative',
                            idx === 0 ? 'col-span-2 row-span-2' : ''
                          )}
                        >
                          <img
                            src={url}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            alt={`Generated ${idx + 1}`}
                            referrerPolicy="no-referrer"
                          />
                          {plan === 'free' && (
                            <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest">
                              Zabatly
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>

                    {/* Palette + Materials */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {palette.length > 0 && (
                        <Card className="p-6 bg-white/70 backdrop-blur-md">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
                            {t('moodboard.palette')}
                          </h4>
                          <div className="flex h-16 rounded-2xl overflow-hidden shadow-inner mb-3">
                            {palette.map((c, i) => (
                              <div key={i} className="flex-1" style={{ backgroundColor: c.hex }} title={c.name} />
                            ))}
                          </div>
                          <div className="flex flex-col gap-1.5">
                            {palette.map((c, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <div className="size-4 rounded border border-slate-100" style={{ backgroundColor: c.hex }} />
                                <span className="text-xs font-bold text-slate-600">{c.name}</span>
                                <span className="text-xs text-slate-400 ml-auto font-mono">{c.hex}</span>
                              </div>
                            ))}
                          </div>
                        </Card>
                      )}

                      {materials.length > 0 && (
                        <Card className="p-6 bg-white/70 backdrop-blur-md">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
                            {t('moodboard.materials')}
                          </h4>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {materials.map((m, i) => (
                              <span key={i} className="bg-primary/5 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full border border-primary/10">
                                {m}
                              </span>
                            ))}
                          </div>
                          {furniture.length > 0 && (
                            <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                {isAr ? 'الأثاث المقترح' : 'Furniture'}
                              </p>
                              {furniture.slice(0, 3).map((f, i) => (
                                <div key={i} className="flex flex-col">
                                  <span className="text-xs font-black text-slate-700">{f.item}</span>
                                  <span className="text-xs text-slate-400">{f.style} · {f.material}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </Card>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between border-t border-primary/10 pt-6">
                      <div className="flex gap-3">
                        <Button variant="outline" className="rounded-xl gap-2 bg-white" onClick={handleShare}>
                          <Share2 size={16} />
                          {t('moodboard.shareLink')}
                        </Button>
                        <Button
                          className="rounded-xl gap-2"
                          onClick={() => navigate(`/editor/${board.id}`)}
                        >
                          <ExternalLink size={16} />
                          {isAr ? 'فتح في المحرر' : 'Open in Editor'}
                        </Button>
                      </div>
                      <button
                        onClick={handleGenerate}
                        className="flex items-center gap-2 text-primary font-black text-sm hover:underline"
                      >
                        <Sparkles size={16} />
                        {isAr ? 'إعادة الإنشاء' : 'Regenerate'}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-[500px] gap-4 text-center"
                  >
                    <div className="size-20 rounded-3xl bg-primary/10 flex items-center justify-center">
                      <Sparkles size={36} className="text-primary" />
                    </div>
                    <h3 className="font-black text-xl text-slate-800">
                      {isAr ? 'جاهز لإنشاء لوحة الأفكار' : 'Ready to generate'}
                    </h3>
                    <p className="text-slate-500 text-sm max-w-xs">
                      {isAr
                        ? 'اختر نوع الغرفة والأسلوب ثم اضغط على "إنشاء"'
                        : 'Select your room type and style, then click Generate'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
