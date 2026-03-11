import React, { useState } from 'react';
import { cn } from '@/src/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className, value, ...props }) => {
  const [focused, setFocused] = useState(false);
  const isFilled = value !== undefined && value !== '';

  return (
    <div className="relative w-full mb-6">
      <div 
        className={cn(
          "relative border-2 rounded-2xl transition-all duration-300 bg-white/50 backdrop-blur-sm",
          focused ? "border-primary ring-4 ring-primary/5" : "border-primary/10 hover:border-primary/30",
          error ? "border-red-500 ring-red-500/5" : ""
        )}
      >
        <label 
          className={cn(
            "absolute left-5 transition-all duration-300 pointer-events-none font-medium",
            (focused || isFilled) 
              ? "top-2 text-[10px] uppercase tracking-widest text-primary font-black" 
              : "top-1/2 -translate-y-1/2 text-slate-400 text-sm"
          )}
        >
          {label}
        </label>
        <input
          {...props}
          value={value}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          className={cn(
            "w-full px-5 pb-2 pt-6 bg-transparent border-none focus:ring-0 text-slate-900 font-bold text-sm outline-none",
            className
          )}
        />
      </div>
      {error && <p className="mt-1.5 ml-4 text-[10px] font-black text-red-500 uppercase tracking-widest">{error}</p>}
    </div>
  );
};
