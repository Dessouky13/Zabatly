import React, { useState } from 'react';
import { AuthLayout } from '@/src/components/AuthLayout';
import { Input } from '@/src/components/Input';
import { Button } from '@/src/components/Layout';
import { useLanguage } from '@/src/context/LanguageContext';
import { useAuth } from '@/src/context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Chrome } from 'lucide-react';

export default function Login() {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      const from = (location.state as { from?: string })?.from || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-10">
        <h2 className="text-4xl font-black text-slate-900 mb-2">{t('auth.login.title')}</h2>
        <p className="text-slate-500 font-medium">{t('auth.login.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <Input
          label={t('auth.login.email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="relative">
          <Input
            label={t('auth.login.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Link
            to="/forgot-password"
            className="absolute right-0 -top-8 text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
          >
            {t('auth.login.forgot')}
          </Link>
        </div>

        {error && (
          <p className="text-sm text-red-600 font-medium pt-1">{error}</p>
        )}

        <Button
          type="submit"
          className="w-full py-5 rounded-2xl text-lg mt-4"
          disabled={isLoading}
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="size-5 border-2 border-white/30 border-t-white rounded-full"
            />
          ) : t('auth.login.submit')}
        </Button>
      </form>

      <div className="mt-10">
        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-primary/10"></div>
          </div>
          <span className="relative bg-background-light px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            {t('auth.login.social')}
          </span>
        </div>

        <Button variant="outline" className="w-full bg-white rounded-2xl h-14 gap-3" type="button">
          <Chrome size={20} />
          Google
        </Button>
      </div>

      <p className="mt-12 text-center text-sm font-medium text-slate-500">
        {t('auth.login.noAccount')}{' '}
        <Link to="/signup" className="text-primary font-black uppercase tracking-widest hover:underline ml-1">
          {t('auth.login.signUp')}
        </Link>
      </p>
    </AuthLayout>
  );
}
