import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
  TrendingUp,
  LayoutGrid,
  ImageIcon,
} from 'lucide-react';
import { Sidebar, Header, Button, Card } from '@/src/components/Layout';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/src/context/LanguageContext';
import { useAuth } from '@/src/context/AuthContext';
import { UsageBar } from '@/src/components/UsageBar';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

interface Board {
  id: string;
  title: string;
  style: string;
  room_type: string;
  generated_images: string[];
  created_at: string;
}

interface Usage {
  boards_used: number;
  boards_limit: number;
  redesigns_used: number;
  redesigns_limit: number;
}

export default function Dashboard() {
  const { t, language } = useLanguage();
  const { user, plan, token } = useAuth();
  const isAr = language === 'ar';

  const [boards, setBoards] = useState<Board[]>([]);
  const [usage, setUsage] = useState<Usage>({ boards_used: 0, boards_limit: 2, redesigns_used: 0, redesigns_limit: 1 });
  const [loadingBoards, setLoadingBoards] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch(`${API_URL}/api/moodboards?limit=6`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.ok ? r.json() : { boards: [] })
        .then(({ boards: b }) => setBoards(b ?? []))
        .finally(() => setLoadingBoards(false)),
      fetch(`${API_URL}/api/subscriptions/usage`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.ok ? r.json() : null)
        .then((d) => { if (d) setUsage(d); }),
    ]);
  }, [token]);

  const planLabel = { free: isAr ? 'مجاني' : 'Free', basic: isAr ? 'أساسي' : 'Basic', premium: isAr ? 'مميز' : 'Premium' }[plan] ?? 'Free';

  return (
    <div className="flex min-h-screen bg-background-light">
      <Sidebar activePath="/dashboard" />

      <main className="flex-1 flex flex-col">
        <Header />

        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {/* Welcome */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
                {t('dashboard.welcome')}{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
              </h2>
              <p className="text-slate-500 text-base">{t('dashboard.subtitle')}</p>
            </motion.div>

            <div className="flex gap-3">
              <Link to="/generate/redesign">
                <Button variant="secondary" className="bg-white rounded-2xl gap-2 h-12">
                  <ImageIcon size={18} />
                  {isAr ? 'إعادة تصميم' : 'Room Redesign'}
                </Button>
              </Link>
              <Link to="/generate/moodboard">
                <Button className="rounded-2xl gap-2 h-12">
                  <Plus size={18} />
                  {t('dashboard.newMoodboard')}
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <LayoutGrid size={22} />
                  </div>
                  <span className="text-[10px] font-black text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-widest">
                    {planLabel}
                  </span>
                </div>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-1">
                  {isAr ? 'لوحات الأفكار' : 'Mood Boards'}
                </p>
                <p className="text-4xl font-black">{usage.boards_used}</p>
                <UsageBar
                  label=""
                  used={usage.boards_used}
                  limit={usage.boards_limit}
                  className="mt-3"
                />
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <ImageIcon size={22} />
                  </div>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-widest border border-emerald-100">
                    {isAr ? 'نشط' : 'Active'}
                  </span>
                </div>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-1">
                  {isAr ? 'إعادة التصميم' : 'Room Redesigns'}
                </p>
                <p className="text-4xl font-black">{usage.redesigns_used}</p>
                <UsageBar
                  label=""
                  used={usage.redesigns_used}
                  limit={usage.redesigns_limit}
                  className="mt-3"
                />
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-primary p-6 text-white relative overflow-hidden group h-full">
                <div className="relative z-10">
                  <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-1">
                    {isAr ? 'ميزة جديدة' : 'AI Powered'}
                  </p>
                  <p className="text-xl font-black mb-6 leading-tight">
                    {isAr ? 'صمّم غرفتك بالذكاء الاصطناعي' : 'Redesign any room with AI'}
                  </p>
                  <Link to="/generate/redesign">
                    <Button variant="secondary" size="sm" className="bg-white text-primary rounded-xl border-none">
                      {isAr ? 'جرّب الآن' : 'Try Now'}
                    </Button>
                  </Link>
                </div>
                <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                  <Sparkles size={160} />
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Upgrade Banner (free plan only) */}
          {plan === 'free' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-10 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div>
                <p className="font-black text-amber-900 text-sm">
                  {isAr ? 'أنت على الخطة المجانية' : "You're on the Free Plan"}
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  {isAr
                    ? `${usage.boards_limit - usage.boards_used} لوحة متبقية هذا الشهر. قم بالترقية للحصول على المزيد.`
                    : `${usage.boards_limit - usage.boards_used} boards remaining this month. Upgrade for unlimited access.`}
                </p>
              </div>
              <Link to="/pricing">
                <Button size="sm" className="rounded-xl gap-2 whitespace-nowrap">
                  <TrendingUp size={14} />
                  {isAr ? 'ترقية الخطة' : 'Upgrade Plan'}
                </Button>
              </Link>
            </motion.div>
          )}

          {/* Recent Projects */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black tracking-tight">{t('dashboard.recent')}</h3>
              <Link to="/mood-boards" className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
                {t('dashboard.viewAll')}
                <ArrowRight size={14} />
              </Link>
            </div>

            {loadingBoards ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-[4/5] rounded-[2rem] bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {boards.map((board, idx) => {
                  const images: string[] = Array.isArray(board.generated_images) ? board.generated_images : [];
                  const thumb = images[0] || '';
                  const rel = new Date(board.created_at).toLocaleDateString();
                  return (
                    <motion.div
                      key={board.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * idx }}
                      className="group cursor-pointer"
                    >
                      <Link to={`/editor/${board.id}`}>
                        <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-4 shadow-sm bg-slate-100">
                          {thumb ? (
                            <img
                              src={thumb}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              alt={board.title}
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <LayoutGrid size={40} />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                            <div className="flex gap-2">
                              <Button variant="secondary" size="sm" className="bg-white/20 backdrop-blur-md border-white/30 text-white p-2 min-w-0">
                                <ArrowRight size={16} />
                              </Button>
                            </div>
                          </div>
                          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur py-1 px-3 rounded-full text-[10px] font-black text-primary shadow-sm tracking-widest uppercase">
                            {board.style}
                          </div>
                        </div>
                        <h4 className="font-bold text-slate-800 mb-1 group-hover:text-primary transition-colors truncate">{board.title}</h4>
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                          <Clock size={12} />
                          <span>{rel}</span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}

                {/* New board card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * boards.length }}
                >
                  <Link to="/generate/moodboard">
                    <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-4 bg-primary/5 border-2 border-dashed border-primary/20 flex flex-col items-center justify-center gap-4 hover:border-primary/50 transition-all group">
                      <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Plus size={32} />
                      </div>
                      <p className="text-sm font-black text-primary uppercase tracking-widest">{t('dashboard.startNew')}</p>
                    </div>
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="mt-24 pt-8 border-t border-primary/10 flex flex-col md:flex-row items-center justify-between text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <p>{t('common.copyright')}</p>
            <div className="flex gap-8 mt-4 md:mt-0">
              <a href="#" className="hover:text-primary transition-colors">{t('dashboard.footer.privacy')}</a>
              <a href="#" className="hover:text-primary transition-colors">{t('dashboard.footer.terms')}</a>
              <a href="#" className="hover:text-primary transition-colors">{t('dashboard.footer.support')}</a>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
