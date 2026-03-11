import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '@/src/context/LanguageContext';
import { Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '@/src/components/Logo';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background-light">
      {/* Left Side: Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-background-dark">
        <img 
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1200" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 blur-[2px] scale-105"
          alt="Luxury Interior"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-transparent to-background-dark/80"></div>
        
        <div className="relative z-10 p-16 flex flex-col justify-between w-full">
          <Link to="/" className="flex items-center gap-3 group">
            <Logo size={48} className="text-white group-hover:scale-110 transition-transform" />
            <div className="flex flex-col">
              <h1 className="text-2xl font-black text-white leading-none">Zabatly</h1>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest">ظبطلي</p>
            </div>
          </Link>

          <div className="max-w-md">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-black text-white leading-tight mb-6"
            >
              The future of <span className="text-primary italic font-medium">interior design</span> is here.
            </motion.h2>
            <p className="text-white/70 text-lg leading-relaxed">
              Join our community of visionaries and transform your space with the power of neural architecture.
            </p>
          </div>

          <div className="flex items-center gap-8 text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
            <p>© 2024 ZABATLY AI</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex flex-col relative">
        {/* Top Bar */}
        <div className="p-6 flex justify-end items-center gap-4">
          <button 
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/10 bg-white/50 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 transition-all"
          >
            <Globe size={14} />
            {t('common.lang')}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
