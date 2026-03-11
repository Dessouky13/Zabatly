import React from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { cn } from '@/src/utils/cn';
import { Button } from '@/src/components/Layout';
import { Link } from 'react-router-dom';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PlanCardProps {
  name: string;
  price: string | number;
  priceUnit?: string;
  currency?: string;
  features: PlanFeature[];
  ctaLabel: string;
  ctaHref?: string;
  highlighted?: boolean;
  badge?: string;
  className?: string;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  name,
  price,
  priceUnit = '/month',
  currency = 'EGP',
  features,
  ctaLabel,
  ctaHref = '/payment',
  highlighted = false,
  badge,
  className,
}) => {
  return (
    <div
      className={cn(
        'relative flex flex-col rounded-[2.5rem] p-8 transition-all',
        highlighted
          ? 'bg-primary text-white shadow-2xl shadow-primary/30 scale-105 z-10'
          : 'bg-white border border-primary/10 hover:shadow-xl',
        className
      )}
    >
      {badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-5 py-1.5 text-[10px] font-black text-primary uppercase tracking-widest shadow-md">
          {badge}
        </div>
      )}

      <h3 className={cn('text-xl font-bold mb-2', highlighted ? 'text-white' : 'text-slate-900')}>{name}</h3>

      <div className={cn('flex items-baseline gap-1 mb-8', highlighted ? 'text-white' : 'text-slate-900')}>
        <span className="text-5xl font-black">{price}</span>
        {price !== 0 && price !== '0' && (
          <>
            <span className={cn('text-sm font-bold ml-1', highlighted ? 'text-white/80' : 'text-slate-400')}>{currency}</span>
            <span className={cn('text-sm', highlighted ? 'text-white/70' : 'text-slate-400')}>{priceUnit}</span>
          </>
        )}
        {(price === 0 || price === '0') && (
          <span className={cn('text-sm font-bold ml-2', highlighted ? 'text-white/70' : 'text-slate-400')}>Free forever</span>
        )}
      </div>

      <ul className="flex flex-col gap-4 mb-8 flex-1">
        {features.map((f, idx) => (
          <li key={idx} className={cn('flex items-center gap-3 text-sm', f.included ? '' : highlighted ? 'opacity-50' : 'text-slate-400')}>
            {f.included ? (
              <CheckCircle2 size={18} className={highlighted ? 'text-white' : 'text-primary'} />
            ) : (
              <X size={18} className="shrink-0" />
            )}
            {f.text}
          </li>
        ))}
      </ul>

      <Link to={ctaHref}>
        <Button
          className={cn(
            'w-full h-12 rounded-2xl text-sm',
            highlighted
              ? 'bg-white text-primary hover:scale-105'
              : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white'
          )}
        >
          {ctaLabel}
        </Button>
      </Link>
    </div>
  );
};
