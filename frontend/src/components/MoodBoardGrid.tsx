import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/src/utils/cn';

interface MoodBoardImage {
  url: string;
  alt?: string;
}

interface MoodBoardGridProps {
  images: MoodBoardImage[];
  className?: string;
}

/**
 * Renders a Pinterest-style grid of mood board images.
 * First image is large (2 cols + 2 rows), rest are smaller.
 */
export const MoodBoardGrid: React.FC<MoodBoardGridProps> = ({ images, className }) => {
  if (!images.length) {
    return (
      <div className={cn('h-80 flex items-center justify-center rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200', className)}>
        <p className="text-slate-400 text-sm font-bold">No images generated yet</p>
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-3 gap-3', className)}>
      {images.slice(0, 6).map((img, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.08, duration: 0.4 }}
          className={cn(
            'relative group overflow-hidden rounded-2xl shadow-sm',
            idx === 0 ? 'col-span-2 row-span-2' : ''
          )}
          style={{ aspectRatio: idx === 0 ? undefined : '1 / 1' }}
        >
          {idx === 0 && <div className="pb-[100%]" />}
          <img
            src={img.url}
            alt={img.alt || `Mood board image ${idx + 1}`}
            className={cn(
              'object-cover transition-transform duration-700 group-hover:scale-105',
              idx === 0 ? 'absolute inset-0 w-full h-full' : 'w-full h-full'
            )}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
        </motion.div>
      ))}
    </div>
  );
};
