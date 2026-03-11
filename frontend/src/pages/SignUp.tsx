import React, { useState } from 'react';
import { AuthLayout } from '@/src/components/AuthLayout';
import { Input } from '@/src/components/Input';
import { Button } from '@/src/components/Layout';
import { useLanguage } from '@/src/context/LanguageContext';
import { useAuth } from '@/src/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '@/src/utils/cn';
import { User, Briefcase } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function SignUp() {
  const { t, language } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'homeowner' | 'designer'>('homeowner');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, language }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Registration failed');
      }

      // Auto-login after successful registration
      await login(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-10">
        <h2 className="text-4xl font-black text-slate-900 mb-2">{t('auth.signup.title')}</h2>
        <p className="text-slate-500 font-medium">{t('auth.signup.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <Input
          label={t('auth.signup.name')}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label={t('auth.login.email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label={t('auth.login.password')}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />

        <div className="py-4">
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
            {t('auth.signup.role')}
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole('homeowner')}
              className={cn(
                'flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all',
                role === 'homeowner'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-primary/10 text-slate-400 hover:border-primary/30'
              )}
            >
              <User size={24} />
              <span className="text-xs font-black uppercase tracking-widest">{t('auth.signup.homeowner')}</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('designer')}
              className={cn(
                'flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all',
                role === 'designer'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-primary/10 text-slate-400 hover:border-primary/30'
              )}
            >
              <Briefcase size={24} />
              <span className="text-xs font-black uppercase tracking-widest">{t('auth.signup.designer')}</span>
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 font-medium pt-1">{error}</p>
        )}

        <Button
          type="submit"
          className="w-full py-5 rounded-2xl text-lg mt-6"
          disabled={isLoading}
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="size-5 border-2 border-white/30 border-t-white rounded-full"
            />
          ) : t('auth.signup.submit')}
        </Button>
      </form>

      <p className="mt-12 text-center text-sm font-medium text-slate-500">
        {t('auth.signup.hasAccount')}{' '}
        <Link to="/login" className="text-primary font-black uppercase tracking-widest hover:underline ml-1">
          {t('auth.signup.login')}
        </Link>
      </p>
    </AuthLayout>
  );
}
