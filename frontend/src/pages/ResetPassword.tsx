import React, { useState } from 'react';
import { AuthLayout } from '@/src/components/AuthLayout';
import { Input } from '@/src/components/Input';
import { Button } from '@/src/components/Layout';
import { useLanguage } from '@/src/context/LanguageContext';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function ResetPassword() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Reset failed');
      }
      setIsDone(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout>
        <div className="text-center py-12">
          <p className="text-red-600 font-bold">Invalid or missing reset token.</p>
          <Link to="/forgot-password" className="text-primary font-black mt-4 block hover:underline">
            Request a new reset link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-10">
        <h2 className="text-4xl font-black text-slate-900 mb-2">{t('auth.reset.title')}</h2>
        <p className="text-slate-500 font-medium">{t('auth.reset.subtitle')}</p>
      </div>

      {isDone ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-200 text-center"
        >
          <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-4" />
          <p className="font-bold text-emerald-700">{t('auth.reset.success')}</p>
          <p className="text-sm text-emerald-600 mt-2">Redirecting to login…</p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label={t('auth.reset.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
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
            ) : t('auth.reset.submit')}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
