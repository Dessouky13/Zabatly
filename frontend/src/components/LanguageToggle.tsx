import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/src/context/LanguageContext';
import { cn } from '@/src/utils/cn';

interface LanguageToggleProps {
  className?: string;
  variant?: 'pill' | 'text';
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ className, variant = 'pill' }) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
      className={cn(
        'flex items-center gap-2 transition-all font-bold',
        variant === 'pill'
          ? 'rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary hover:bg-primary/10'
          : 'text-sm text-slate-600 hover:text-primary',
        className
      )}
    >
      <Globe size={16} />
      <span>{t('common.lang')}</span>
    </button>
  );
};
