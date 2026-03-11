import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  Lightbulb,
  Maximize2,
  Sparkles,
  Loader2,
  X,
  ImageIcon,
} from 'lucide-react';
import { Sidebar, Header, Button, Card } from '@/src/components/Layout';
import { cn } from '@/src/utils/cn';
import { useLanguage } from '@/src/context/LanguageContext';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/Toast';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

const STYLE_OPTIONS = [
  { value: 'modern', labelEn: 'Modern', labelAr: 'عصري' },
  { value: 'scandinavian', labelEn: 'Scandinavian', labelAr: 'إسكندنافي' },
  { value: 'minimal', labelEn: 'Minimal', labelAr: 'مينيمال' },
  { value: 'industrial', labelEn: 'Industrial', labelAr: 'إندستريال' },
  { value: 'boho', labelEn: 'Boho', labelAr: 'بوهو' },
  { value: 'classic', labelEn: 'Classic', labelAr: 'كلاسيكي' },
  { value: 'luxury', labelEn: 'Luxury', labelAr: 'فاخر' },
];

const ROOM_TYPES = ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office'] as const;

interface RedesignResult {
  id: string;
  original_image_url: string;
  style: string;
  result_images: string[];
}

export default function RoomRedesign() {
  const { t, language } = useLanguage();
  const { token } = useAuth();
  const { success, error: toastError } = useToast();
  const isAr = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState('modern');
  const [selectedRoom, setSelectedRoom] = useState<string>('Living Room');
  const [intensity, setIntensity] = useState(50);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<RedesignResult | null>(null);
  const [activeVariation, setActiveVariation] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toastError(isAr ? 'يرجى اختيار صورة فقط' : 'Please select an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toastError(isAr ? 'الحد الأقصى 10 ميجابايت' : 'Max file size is 10MB');
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    if (!token) { toastError(isAr ? 'يجب تسجيل الدخول أولاً' : 'Please log in first.'); return; }
    if (!selectedFile) { toastError(isAr ? 'يرجى رفع صورة الغرفة' : 'Please upload a room photo.'); return; }

    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('style', selectedStyle);
      formData.append('room_type', selectedRoom);

      const res = await fetch(`${API_URL}/api/redesign/generate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Generation failed');
      }

      const data = await res.json();
      const redesign = data.redesign;

      // Parse result_images if it's a string
      let images = redesign.result_images;
      if (typeof images === 'string') images = JSON.parse(images);

      setResult({ ...redesign, result_images: images });
      setActiveVariation(0);
      success(isAr ? 'تم إعادة تصميم الغرفة بنجاح!' : 'Room redesigned successfully!');
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : (isAr ? 'حدث خطأ' : 'Something went wrong'));
    } finally {
      setIsGenerating(false);
    }
  };

  const currentAfterImage = result?.result_images?.[activeVariation];

  return (
    <div className="flex min-h-screen bg-background-light">
      <Sidebar activePath="/redesign" />
      
      <main className="flex-1 flex flex-col">
        <Header />
        
        <div className="p-8 max-w-7xl mx-auto w-full">
          <section className="mb-12">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">{t('redesign.title')}</h2>
              <p className="text-lg text-slate-600">{t('redesign.subtitle')}</p>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Panel — Upload & Options */}
            <div className="lg:col-span-1 space-y-8">
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-8">
                  <Upload className="text-primary" size={20} />
                  <h3 className="font-black text-lg uppercase tracking-tight">{t('redesign.uploadTitle')}</h3>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {!previewUrl ? (
                  <div
                    className="relative group"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-primary/20 rounded-2xl p-12 bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer">
                      <Upload className="text-primary/40 mb-4" size={48} />
                      <p className="text-sm font-bold text-slate-700">{t('redesign.uploadLabel')}</p>
                      <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">{t('redesign.uploadSub')}</p>
                      <Button className="mt-8 rounded-xl px-8" onClick={(e: React.MouseEvent) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                        {t('redesign.browse')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden">
                    <img src={previewUrl} alt="Room preview" className="w-full h-48 object-cover rounded-2xl" />
                    <button
                      onClick={clearFile}
                      className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <X size={16} />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-primary/80 backdrop-blur text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest">
                      {t('redesign.uploaded')}
                    </div>
                  </div>
                )}

                <div className="mt-10 space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('redesign.roomType')}</label>
                    <select
                      value={selectedRoom}
                      onChange={(e) => setSelectedRoom(e.target.value)}
                      className="w-full rounded-xl border-primary/10 bg-background-light p-3.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                    >
                      {ROOM_TYPES.map((room) => (
                        <option key={room} value={room}>{t(`moodboard.room.${room.toLowerCase().replace(' ', '')}`)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      {isAr ? 'النمط' : 'Style'}
                    </label>
                    <select
                      value={selectedStyle}
                      onChange={(e) => setSelectedStyle(e.target.value)}
                      className="w-full rounded-xl border-primary/10 bg-background-light p-3.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                    >
                      {STYLE_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{isAr ? s.labelAr : s.labelEn}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('redesign.intensity')}</label>
                      <span className="text-xs font-bold text-primary">{intensity}%</span>
                    </div>
                    <input 
                      type="range" 
                      value={intensity}
                      onChange={(e) => setIntensity(parseInt(e.target.value))}
                      className="w-full accent-primary h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer"
                    />
                  </div>

                  <Button
                    className="w-full rounded-xl py-4 gap-2"
                    onClick={handleGenerate}
                    disabled={isGenerating || !selectedFile}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        {isAr ? 'جاري التصميم...' : 'Redesigning...'}
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        {isAr ? 'إعادة تصميم الغرفة' : 'Redesign Room'}
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              <div className="bg-slate-900 text-white p-8 rounded-2xl overflow-hidden relative shadow-xl">
                <div className="relative z-10">
                  <h4 className="font-black mb-2 uppercase tracking-tight">{t('redesign.proTip')}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{t('redesign.proTipText')}</p>
                </div>
                <div className="absolute -right-6 -bottom-6 opacity-10">
                  <Lightbulb size={120} />
                </div>
              </div>
            </div>

            {/* Right Panel — Results */}
            <div className="lg:col-span-2 space-y-12">
              <Card className="shadow-2xl border-none">
                <div className="p-4 border-b border-primary/5 flex justify-between items-center bg-slate-50/50">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t('redesign.preview')}</span>
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-400/20 border border-red-400/40"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-400/20 border border-yellow-400/40"></div>
                    <div className="h-3 w-3 rounded-full bg-green-400/20 border border-green-400/40"></div>
                  </div>
                </div>
                
                <div className="relative aspect-video group overflow-hidden bg-slate-100">
                  {isGenerating ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkles size={48} className="text-primary/40" />
                      </motion.div>
                      <p className="text-sm font-bold text-slate-500 mt-4">
                        {isAr ? 'جاري إعادة تصميم الغرفة...' : 'AI is redesigning your room...'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {isAr ? 'قد يستغرق هذا حوالي 30 ثانية' : 'This may take about 30 seconds'}
                      </p>
                    </div>
                  ) : previewUrl && currentAfterImage ? (
                    <>
                      {/* After Image */}
                      <img 
                        src={currentAfterImage}
                        className="absolute inset-0 w-full h-full object-cover"
                        alt="After"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Before Image (Clipped) */}
                      <div 
                        className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-white shadow-2xl z-10"
                        style={{ width: `${sliderPos}%` }}
                      >
                        <img 
                          src={previewUrl}
                          className="absolute inset-y-0 left-0 h-full object-cover"
                          style={{ width: `${10000 / sliderPos}%` }}
                          alt="Before"
                        />
                        <div className="absolute top-6 left-6 bg-black/40 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest">{t('redesign.before')}</div>
                      </div>

                      <div className="absolute top-6 right-6 bg-primary/80 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest z-20">{t('redesign.after')}</div>
                      
                      {/* Slider Handle */}
                      <div 
                        className="absolute top-0 bottom-0 z-30 flex items-center justify-center cursor-ew-resize group/handle"
                        style={{ left: `${sliderPos}%` }}
                        onMouseDown={(e) => {
                          const move = (moveEvent: MouseEvent) => {
                            const rect = (e.currentTarget as HTMLElement).parentElement?.getBoundingClientRect();
                            if (rect) {
                              const pos = ((moveEvent.clientX - rect.left) / rect.width) * 100;
                              setSliderPos(Math.min(Math.max(pos, 0), 100));
                            }
                          };
                          window.addEventListener('mousemove', move);
                          window.addEventListener('mouseup', () => window.removeEventListener('mousemove', move), { once: true });
                        }}
                      >
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-2xl border-2 border-primary text-primary group-hover/handle:scale-110 transition-transform">
                          <Maximize2 size={18} className="rotate-45" />
                        </div>
                      </div>
                    </>
                  ) : previewUrl ? (
                    <img src={previewUrl} className="absolute inset-0 w-full h-full object-cover" alt="Uploaded room" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
                      <ImageIcon size={64} />
                      <p className="text-sm font-bold mt-4">{isAr ? 'ارفع صورة لترى المعاينة' : 'Upload a photo to see preview'}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Variations */}
              <AnimatePresence>
                {result && result.result_images.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-black tracking-tight">{t('redesign.variations')}</h3>
                      <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="flex items-center gap-2 text-primary text-sm font-bold hover:underline disabled:opacity-50"
                      >
                        <RefreshCw size={16} className={isGenerating ? 'animate-spin' : ''} />
                        {t('redesign.regenerate')}
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {result.result_images.map((img, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * idx }}
                          onClick={() => setActiveVariation(idx)}
                          className={cn(
                            "group relative bg-white rounded-2xl overflow-hidden border transition-all cursor-pointer",
                            activeVariation === idx
                              ? "border-primary shadow-2xl ring-4 ring-primary/10" 
                              : "border-primary/5 shadow-sm hover:shadow-xl"
                          )}
                        >
                          <div className="aspect-square relative overflow-hidden">
                            <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={`Variation ${idx + 1}`} referrerPolicy="no-referrer" />
                            {activeVariation === idx && (
                              <div className="absolute top-3 right-3 bg-primary text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg tracking-widest">{t('redesign.active')}</div>
                            )}
                          </div>
                          <div className="p-5 flex justify-between items-center">
                            <div>
                              <h4 className="font-black text-slate-800">
                                {isAr ? `تصميم ${idx + 1}` : `Variation ${idx + 1}`}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                {STYLE_OPTIONS.find(s => s.value === result.style)?.[isAr ? 'labelAr' : 'labelEn'] || result.style}
                              </p>
                            </div>
                            <CheckCircle2 className={cn("transition-colors", activeVariation === idx ? "text-primary" : "text-slate-200")} size={20} />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
