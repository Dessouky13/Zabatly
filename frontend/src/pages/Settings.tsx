import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  User, Globe, CreditCard, Bell, Shield, Camera, ChevronRight, CheckCircle2
} from 'lucide-react';
import { Sidebar, Header, Button, Card } from '@/src/components/Layout';
import { UsageBar } from '@/src/components/UsageBar';
import { useLanguage } from '@/src/context/LanguageContext';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/Toast';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/src/utils/cn';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export default function Settings() {
  const { language, setLanguage, t } = useLanguage();
  const { user, token, logout, updateUser, refreshUser } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const isAr = language === 'ar';

  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  // Usage data fetched fresh from API (not from stale JWT)
  const [usage, setUsage] = useState({
    plan: 'free',
    boards_used: 0, boards_limit: 2,
    redesigns_used: 0, redesigns_limit: 1,
    expires_at: null as string | null,
  });

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/subscriptions/usage`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) setUsage({
          plan: data.plan ?? 'free',
          boards_used: data.boards?.used ?? 0,
          boards_limit: data.boards?.limit ?? 2,
          redesigns_used: data.redesigns?.used ?? 0,
          redesigns_limit: data.redesigns?.limit ?? 1,
          expires_at: data.expires_at ?? null,
        });
      })
      .catch(() => {});
  }, [token]);

  // Keep name in sync if user loads after mount
  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error();
      updateUser({ name });
      success(isAr ? 'تم حفظ التغييرات' : 'Changes saved!');
    } catch {
      toastError(isAr ? 'فشل الحفظ' : 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm(isAr ? 'هل أنت متأكد؟ لا يمكن التراجع.' : 'Are you sure? This cannot be undone.')) return;
    try {
      await fetch(`${API_URL}/api/users/account`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      logout();
      navigate('/');
    } catch {
      toastError('Failed to delete account.');
    }
  };

  const planLabel = {
    free: isAr ? 'الخطة المجانية' : 'Free Plan',
    basic: isAr ? 'الخطة الأساسية' : 'Basic Plan',
    premium: isAr ? 'الخطة المميزة' : 'Premium Plan',
  }[usage.plan] || (isAr ? 'الخطة المجانية' : 'Free Plan');

  const avatarSrc = user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=C9704A&color=fff`;

  return (
    <div className="flex min-h-screen bg-background-light">
      <Sidebar activePath="/settings" />
      <main className="flex-1 flex flex-col">
        <Header />
        <div className="p-6 md:p-10 max-w-4xl mx-auto w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-1">
              {t('nav.settings')}
            </h1>
            <p className="text-slate-500">{isAr ? 'أدر حسابك وتفضيلاتك' : 'Manage your account and preferences'}</p>
          </motion.div>

          <div className="flex flex-col gap-6">
            {/* Profile Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <User size={20} className="text-primary" />
                  </div>
                  <h2 className="text-lg font-black">{isAr ? 'الملف الشخصي' : 'Profile'}</h2>
                </div>

                <div className="flex flex-col sm:flex-row gap-8 items-start">
                  <div className="relative group shrink-0">
                    <img
                      src={avatarSrc}
                      alt={user?.name || 'Avatar'}
                      className="size-24 rounded-full object-cover border-4 border-white shadow-md"
                      referrerPolicy="no-referrer"
                    />
                    <button className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera size={20} className="text-white" />
                    </button>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        {isAr ? 'الاسم الكامل' : 'Full Name'}
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-background-light rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        {isAr ? 'البريد الإلكتروني' : 'Email'}
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        readOnly
                        className="w-full bg-background-light rounded-xl px-4 py-3 text-sm font-bold opacity-60 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-xl gap-2 px-8"
                  >
                    {saving ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="size-4 border-2 border-white/30 border-t-white rounded-full" />
                    ) : (
                      <><CheckCircle2 size={16} /> {isAr ? 'حفظ التغييرات' : 'Save Changes'}</>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Subscription Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <CreditCard size={20} className="text-primary" />
                  </div>
                  <h2 className="text-lg font-black">{isAr ? 'الاشتراك' : 'Subscription'}</h2>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      {isAr ? 'الخطة الحالية' : 'Current Plan'}
                    </p>
                    <p className="text-xl font-black text-slate-900">{planLabel}</p>
                    {usage.expires_at && (
                      <p className="text-xs text-slate-500 mt-1 font-medium">
                        {isAr ? 'تنتهي' : 'Expires'}: {new Date(usage.expires_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-emerald-200">
                      {isAr ? 'نشط' : 'Active'}
                    </span>
                    {usage.plan !== 'premium' && (
                      <Link to="/pricing">
                        <Button size="sm" className="rounded-xl gap-2">
                          {isAr ? 'ترقية' : 'Upgrade'}
                          <ChevronRight size={14} />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {isAr ? 'الاستخدام هذا الشهر' : 'Usage This Month'}
                  </p>
                  <UsageBar
                    label={isAr ? 'لوحات الأفكار' : 'Mood Boards'}
                    used={usage.boards_used}
                    limit={usage.boards_limit}
                  />
                  <UsageBar
                    label={isAr ? 'إعادة التصميم' : 'Room Redesigns'}
                    used={usage.redesigns_used}
                    limit={usage.redesigns_limit}
                  />
                </div>
              </Card>
            </motion.div>

            {/* Language Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Globe size={20} className="text-primary" />
                  </div>
                  <h2 className="text-lg font-black">{isAr ? 'اللغة' : 'Language'}</h2>
                </div>
                <div className="grid grid-cols-2 gap-4 max-w-sm">
                  {(['en', 'ar'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={cn(
                        'flex items-center gap-3 rounded-2xl p-4 border-2 transition-all font-bold text-sm',
                        language === lang
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-slate-100 text-slate-600 hover:border-primary/30'
                      )}
                    >
                      <span className="text-2xl">{lang === 'en' ? '🇬🇧' : '🇪🇬'}</span>
                      {lang === 'en' ? 'English' : 'العربية'}
                      {language === lang && <CheckCircle2 size={16} className="ml-auto text-primary" />}
                    </button>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Notifications Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Bell size={20} className="text-primary" />
                  </div>
                  <h2 className="text-lg font-black">{isAr ? 'الإشعارات' : 'Notifications'}</h2>
                </div>
                <div className="flex flex-col gap-4">
                  {[
                    { key: 'payment', label: isAr ? 'تأكيد الدفع' : 'Payment confirmations' },
                    { key: 'expiry', label: isAr ? 'تحذير انتهاء الاشتراك' : 'Subscription expiry warnings' },
                    { key: 'tips', label: isAr ? 'نصائح التصميم' : 'Design tips & inspiration' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                      <span className="text-sm font-bold text-slate-700">{item.label}</span>
                      <button className="relative w-11 h-6 rounded-full bg-primary transition-colors">
                        <span className="absolute right-1 top-1 size-4 rounded-full bg-white shadow-sm transition-transform" />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Danger Zone */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card className="p-8 border-red-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="size-10 rounded-2xl bg-red-50 flex items-center justify-center">
                    <Shield size={20} className="text-red-500" />
                  </div>
                  <h2 className="text-lg font-black">{isAr ? 'المنطقة الخطرة' : 'Danger Zone'}</h2>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-red-50 rounded-2xl border border-red-100">
                  <div>
                    <p className="font-black text-slate-900 text-sm">{isAr ? 'حذف الحساب' : 'Delete Account'}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {isAr ? 'سيتم حذف جميع بياناتك نهائياً ولا يمكن التراجع.' : 'All your data will be permanently deleted. This cannot be undone.'}
                    </p>
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    className="text-sm font-black text-red-500 border border-red-200 rounded-xl px-5 py-2.5 hover:bg-red-100 transition-colors whitespace-nowrap"
                  >
                    {isAr ? 'حذف حسابي' : 'Delete My Account'}
                  </button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
