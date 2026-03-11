import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Smartphone, CreditCard, CheckCircle2, Clock,
  AlertCircle, Copy, Check, ArrowLeft, Upload
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/src/components/Layout';
import { Logo } from '@/src/components/Logo';
import { UploadZone } from '@/src/components/UploadZone';
import { LanguageToggle } from '@/src/components/LanguageToggle';
import { useLanguage } from '@/src/context/LanguageContext';
import { useAuth } from '@/src/context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

type PaymentStatus = 'idle' | 'uploading' | 'verifying' | 'success' | 'error';

const PLAN_DETAILS = {
  free: { name: 'Free Plan', nameAr: 'الخطة المجانية', price: 0 },
  basic: { name: 'Basic Plan', nameAr: 'الخطة الأساسية', price: 39 },
  premium: { name: 'Premium Plan', nameAr: 'الخطة المميزة', price: 79 },
  payperdesign: { name: 'Pay Per Design', nameAr: 'الدفع لكل تصميم', price: 0 },
};

// Phone numbers come from env vars (set VITE_INSTAPAY_PHONE and VITE_VODAFONE_PHONE)
const INSTAPAY_PHONE = import.meta.env.VITE_INSTAPAY_PHONE || '01XXXXXXXXX';
const VODAFONE_PHONE = import.meta.env.VITE_VODAFONE_PHONE || '01XXXXXXXXX';

export default function Payment() {
  const { t } = useLanguage();
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const planKey = (searchParams.get('plan') || 'basic') as keyof typeof PLAN_DETAILS;
  const plan = PLAN_DETAILS[planKey] || PLAN_DETAILS.basic;

  const [method, setMethod] = useState<'instapay' | 'vodafone_cash'>('instapay');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedPhone, setCopiedPhone] = useState(false);

  const planName = planKey === 'payperdesign'
    ? t('pricing.payPerDesign')
    : t(`pricing.${planKey}.name`);
  const phone = method === 'instapay' ? INSTAPAY_PHONE : VODAFONE_PHONE;

  const copyPhone = () => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setStatus('idle');
    setErrorMsg('');
  };

  const handleSubmit = async () => {
    if (!uploadedFile || !token) return;
    setStatus('uploading');
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('screenshot', uploadedFile);
      formData.append('plan', planKey);
      formData.append('method', method);
      formData.append('amount', String(plan.price));

      const res = await fetch(`${API_URL}/api/payments/upload-screenshot`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      setStatus('verifying');
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || t('payment.failDesc'));
        setStatus('error');
        return;
      }

      // 'pending' means OCR is processing / manual review — treat as success from UX perspective
      if (data.status === 'verified' || data.status === 'pending' || data.status === 'manual_review') {
        setStatus('success');
      } else {
        setErrorMsg(data.reason || t('payment.failDesc'));
        setStatus('error');
      }
    } catch {
      setErrorMsg(t('payment.failDesc'));
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-primary/10 bg-background-light/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <Logo size={36} className="text-primary" />
            <span className="text-lg font-extrabold">Zabatly | ظبطلي</span>
          </Link>
          <LanguageToggle />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-16">
        <Link to="/pricing" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors mb-8">
          <ArrowLeft size={16} />
          {t('payment.backToPricing')}
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Plan Summary */}
          <div className="bg-white rounded-[2rem] border border-primary/10 p-8 mb-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              {t('payment.planSummary')}
            </p>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900">{planName}</h2>
              {plan.price > 0 && (
                <div className="text-right">
                  <span className="text-3xl font-black text-primary">{plan.price}</span>
                  <span className="text-sm text-slate-400 ml-1">EGP{t('pricing.perMonth')}</span>
                </div>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[2rem] border border-emerald-200 p-12 text-center"
              >
                <div className="size-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} className="text-emerald-500" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">
                  {t('payment.successTitle')}
                </h3>
                <p className="text-slate-500 mb-8">
                  {t('payment.successDesc')}
                </p>
                <Link to="/dashboard">
                  <Button className="rounded-2xl px-10 h-12">
                    {t('payment.goToDashboard')}
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <motion.div key="form" className="flex flex-col gap-6">
                {/* Payment Method Selector */}
                <div className="bg-white rounded-[2rem] border border-primary/10 p-8">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">
                    {t('payment.method')}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {(['instapay', 'vodafone_cash'] as const).map((m) => {
                      const isActive = method === m;
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMethod(m)}
                          className={`flex items-center gap-3 rounded-2xl p-4 border-2 transition-all ${
                            isActive ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-primary/30'
                          }`}
                        >
                          <div className={`size-10 rounded-xl flex items-center justify-center ${
                            m === 'instapay' ? 'bg-primary/10' : 'bg-red-50'
                          }`}>
                            {m === 'instapay'
                              ? <Smartphone size={20} className="text-primary" />
                              : <CreditCard size={20} className="text-red-500" />
                            }
                          </div>
                          <span className={`text-sm font-black ${isActive ? 'text-primary' : 'text-slate-600'}`}>
                            {m === 'instapay' ? t('payment.instapay') : t('payment.vodafone')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Transfer Instructions */}
                <div className="bg-slate-900 text-white rounded-[2rem] p-8">
                  <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-5">
                    {t('payment.instructions')}
                  </p>
                  <ol className="space-y-4 text-sm text-white/80">
                    <li className="flex gap-3">
                      <span className="size-6 rounded-full bg-primary text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">1</span>
                      <span>{t('payment.step1')} {method === 'instapay' ? t('payment.instapay') : t('payment.vodafone')} {t('payment.step1App')}</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="size-6 rounded-full bg-primary text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <div className="flex-1">
                        <span>{t('payment.step2')} <strong className="text-white">{plan.price} EGP</strong> {t('payment.step2To')}</span>
                        <div className="flex items-center gap-3 mt-2 bg-white/10 rounded-xl px-4 py-2.5">
                          <span className="font-black text-white tracking-widest flex-1">{phone}</span>
                          <button onClick={copyPhone} className="text-white/60 hover:text-primary transition-colors">
                            {copiedPhone ? <Check size={16} /> : <Copy size={16} />}
                          </button>
                        </div>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="size-6 rounded-full bg-primary text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">3</span>
                      <span>{t('payment.step3')}</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="size-6 rounded-full bg-primary text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">4</span>
                      <span>{t('payment.step4')}</span>
                    </li>
                  </ol>
                </div>

                {/* Screenshot Upload */}
                <div className="bg-white rounded-[2rem] border border-primary/10 p-8">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">
                    {t('payment.uploadTitle')}
                  </p>
                  <UploadZone
                    onFileSelect={handleFileSelect}
                    onClear={() => { setUploadedFile(null); setPreviewUrl(null); }}
                    preview={previewUrl}
                    label={t('payment.uploadLabel')}
                    sublabel={t('payment.uploadSub')}
                    className={previewUrl ? 'h-48' : ''}
                  />
                </div>

                {/* Status Messages */}
                {status === 'verifying' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-2xl p-5"
                  >
                    <Clock size={20} className="text-amber-500 animate-spin" />
                    <div>
                      <p className="font-black text-amber-700 text-sm">
                        {t('payment.verifying')}
                      </p>
                      <p className="text-xs text-amber-600">
                        {t('payment.verifyingDesc')}
                      </p>
                    </div>
                  </motion.div>
                )}

                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-4 bg-red-50 border border-red-200 rounded-2xl p-5"
                  >
                    <AlertCircle size={20} className="text-red-500 shrink-0" />
                    <div>
                      <p className="font-black text-red-700 text-sm">
                        {t('payment.failTitle')}
                      </p>
                      <p className="text-xs text-red-600">
                        {errorMsg || t('payment.failDesc')}
                      </p>
                    </div>
                  </motion.div>
                )}

                <Button
                  className="w-full h-14 rounded-2xl text-base gap-3"
                  disabled={!uploadedFile || status === 'uploading' || status === 'verifying'}
                  onClick={handleSubmit}
                >
                  {status === 'uploading' || status === 'verifying' ? (
                    <>
                      <Clock size={18} className="animate-spin" />
                      {t('payment.processing')}
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      {t('payment.verifyBtn')}
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
