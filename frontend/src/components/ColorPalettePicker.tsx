import React from 'react';
import { cn } from '@/src/utils/cn';
import { Check } from 'lucide-react';

const COLOR_PALETTES = [
  { id: 'warm-beige',   label: 'Warm Beige',    labelAr: 'البيج الدافئ',  swatches: ['#F5EFE6', '#E8DFD2', '#D2C2B1', '#C9704A'] },
  { id: 'earth-tones',  label: 'Earth Tones',   labelAr: 'ألوان الطبيعة', swatches: ['#8B6914', '#C4A45A', '#E8D5A3', '#F7F0E0'] },
  { id: 'cool-gray',    label: 'Cool Gray',      labelAr: 'الرمادي البارد', swatches: ['#1F2937', '#4B5563', '#9CA3AF', '#F3F4F6'] },
  { id: 'sage-green',   label: 'Sage & Green',   labelAr: 'الأخضر',       swatches: ['#2D4A3E', '#5C8374', '#93C572', '#D4EDDA'] },
  { id: 'dusty-rose',   label: 'Dusty Rose',     labelAr: 'الوردي',       swatches: ['#8B2252', '#C06080', '#E8A0B4', '#FDE8F0'] },
  { id: 'navy-gold',    label: 'Navy & Gold',    labelAr: 'الكحلي والذهبي', swatches: ['#0A1628', '#1E3A5F', '#B8962E', '#F5DEB3'] },
];

interface ColorPalettePickerProps {
  value: string;
  onChange: (paletteId: string) => void;
  language?: 'en' | 'ar';
  className?: string;
}

export const ColorPalettePicker: React.FC<ColorPalettePickerProps> = ({
  value,
  onChange,
  language = 'en',
  className,
}) => {
  return (
    <div className={cn('grid grid-cols-2 gap-3', className)}>
      {COLOR_PALETTES.map((palette) => {
        const isSelected = value === palette.id;
        return (
          <button
            key={palette.id}
            type="button"
            onClick={() => onChange(palette.id)}
            className={cn(
              'flex flex-col gap-2 rounded-2xl p-3 border-2 transition-all text-left',
              isSelected
                ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                : 'border-slate-100 bg-white hover:border-primary/30'
            )}
          >
            {/* Swatches */}
            <div className="flex rounded-xl overflow-hidden h-8">
              {palette.swatches.map((hex) => (
                <div
                  key={hex}
                  className="flex-1 transition-transform hover:scale-105"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
            {/* Label */}
            <div className="flex items-center justify-between">
              <span className={cn('text-xs font-bold', isSelected ? 'text-primary' : 'text-slate-600')}>
                {language === 'ar' ? palette.labelAr : palette.label}
              </span>
              {isSelected && <Check size={14} className="text-primary shrink-0" />}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export { COLOR_PALETTES };
