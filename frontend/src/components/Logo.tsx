import React from 'react';
import { cn } from '@/src/utils/cn';

export const Logo = ({ className, size = 40 }: { className?: string, size?: number }) => {
  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Main Square Frame */}
        <rect x="5" y="5" width="90" height="90" rx="4" stroke="currentColor" strokeWidth="8" />
        
        {/* Internal stylized lines based on the image */}
        <path
          d="M25 25H45V45H25V25Z"
          fill="currentColor"
          fillOpacity="0.2"
        />
        <path
          d="M25 25V75H75V25H25ZM33 33H67V67H33V33Z"
          fill="currentColor"
        />
        <path
          d="M50 33L67 67H33L50 33Z"
          fill="currentColor"
        />
        <path
          d="M20 60C20 60 40 80 80 80"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
