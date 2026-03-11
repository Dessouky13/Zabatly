import React from 'react';
import { cn } from '@/src/utils/cn';

interface UsageBarProps {
  label: string;
  used: number;
  limit: number | null; // null = unlimited
  className?: string;
}

export const UsageBar: React.FC<UsageBarProps> = ({ label, used, limit, className }) => {
  const isUnlimited = limit === null || limit < 0;
  const pct = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);
  const isWarning = !isUnlimited && pct >= 80;
  const isFull = !isUnlimited && pct >= 100;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
        <span className={cn('text-xs font-black', isFull ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-slate-400')}>
          {isUnlimited ? `${used} / ∞` : `${used} / ${limit}`}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        {isUnlimited ? (
          <div className="h-full w-full bg-gradient-to-r from-primary/30 to-primary animate-pulse" />
        ) : (
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              isFull ? 'bg-red-500' : isWarning ? 'bg-amber-400' : 'bg-primary'
            )}
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
    </div>
  );
};
