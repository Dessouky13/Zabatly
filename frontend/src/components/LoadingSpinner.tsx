import React from 'react';
import { cn } from '@/src/utils/cn';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  className,
  size = 'md',
  label,
}) => {
  const sizes = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-[3px]',
    lg: 'h-16 w-16 border-4',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-primary/20 border-t-primary',
          sizes[size]
        )}
      />
      {label && (
        <p className="text-sm font-bold text-slate-500 animate-pulse">{label}</p>
      )}
    </div>
  );
};
