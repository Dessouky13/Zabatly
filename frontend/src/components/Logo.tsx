import React from 'react';
import { cn } from '@/src/utils/cn';

export const Logo = ({ className, size = 40 }: { className?: string, size?: number }) => {
  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <img
        src="/logo.jpeg"
        alt="Zabatly"
        className="w-full h-full object-contain rounded-lg"
      />
    </div>
  );
};
