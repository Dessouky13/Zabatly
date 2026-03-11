import React, { useState, useRef, useCallback } from 'react';
import { ChevronsLeftRight } from 'lucide-react';
import { cn } from '@/src/utils/cn';

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeSrc,
  afterSrc,
  beforeLabel = 'Before',
  afterLabel = 'After',
  className,
}) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = Math.min(Math.max(((clientX - rect.left) / rect.width) * 100, 2), 98);
    setSliderPos(pos);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    updatePosition(e.clientX);

    const onMove = (ev: MouseEvent) => {
      if (isDragging.current) updatePosition(ev.clientX);
    };
    const onUp = () => {
      isDragging.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    updatePosition(e.touches[0].clientX);
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative select-none overflow-hidden rounded-2xl cursor-ew-resize', className)}
      onMouseDown={onMouseDown}
      onTouchMove={onTouchMove}
    >
      {/* After (base layer) */}
      <img
        src={afterSrc}
        alt={afterLabel}
        className="w-full h-full object-cover pointer-events-none"
        referrerPolicy="no-referrer"
        draggable={false}
      />

      {/* Before (clipped overlay) */}
      <div
        className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-white shadow-[2px_0_12px_rgba(0,0,0,0.25)]"
        style={{ width: `${sliderPos}%` }}
      >
        <img
          src={beforeSrc}
          alt={beforeLabel}
          className="absolute inset-y-0 left-0 h-full object-cover pointer-events-none"
          style={{ width: `${10000 / sliderPos}%`, maxWidth: 'none' }}
          referrerPolicy="no-referrer"
          draggable={false}
        />
        {/* Before label */}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest">
          {beforeLabel}
        </div>
      </div>

      {/* After label */}
      <div className="absolute top-4 right-4 bg-primary/80 backdrop-blur-sm text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest pointer-events-none">
        {afterLabel}
      </div>

      {/* Drag handle */}
      <div
        className="absolute top-0 bottom-0 z-20 flex items-center justify-center"
        style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
      >
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-2xl border-2 border-primary text-primary hover:scale-110 transition-transform">
          <ChevronsLeftRight size={18} />
        </div>
      </div>
    </div>
  );
};
