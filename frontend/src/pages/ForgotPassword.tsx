import React, { useState } from 'react';
import { AuthLayout } from '@/src/components/AuthLayout';
import { Input } from '@/src/components/Input';
import { Button } from '@/src/components/Layout';
import { useLanguage } from '@/src/context/LanguageContext';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export default function ForgotPassword() {
  const { t, isRTL } = useLanguage();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Request failed');
      }
      setIsSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-10">
        <h2 className="text-4xl font-black text-slate-900 mb-2">{t('auth.forgot.title')}</h2>
        <p className="text-slate-500 font-medium">{t('auth.forgot.subtitle')}</p>
      </div>

      {!isSent ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label={t('auth.login.email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && (
            <p className="text-sm text-red-600 font-medium">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full py-5 rounded-2xl text-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="size-5 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : t('auth.forgot.submit')}
          </Button>
        </form>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10 text-center"
        >
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-primary" />
          </div>
          <p className="text-slate-600 font-medium mb-2">{t('auth.forgot.sent')}</p>
          <p className="text-primary font-bold mb-6">{email}</p>
          <Button variant="outline" className="bg-white rounded-xl" onClick={() => setIsSent(false)}>
            {t('auth.forgot.resend')}
          </Button>
        </motion.div>
      )}

      <Link
        to="/login"
        className="mt-12 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
      >
        {isRTL ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
        {t('auth.forgot.back')}
      </Link>
    </AuthLayout>
  );
}
