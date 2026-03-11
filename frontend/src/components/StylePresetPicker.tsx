import React from 'react';
import { cn } from '@/src/utils/cn';
import { CheckCircle2 } from 'lucide-react';

const STYLE_PRESETS = [
  { id: 'modern',       label: 'Modern',       labelAr: 'مودرن',        img: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=60&w=300' },
  { id: 'scandinavian', label: 'Scandinavian',  labelAr: 'سكاندينافي',   img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=60&w=300' },
  { id: 'minimal',      label: 'Minimal',       labelAr: 'مينيمال',      img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=60&w=300' },
  { id: 'industrial',   label: 'Industrial',    labelAr: 'إندستريال',    img: 'https://images.unsplash.com/photo-1505873242700-f289a29e1724?auto=format&fit=crop&q=60&w=300' },
  { id: 'boho',         label: 'Boho',          labelAr: 'بوهو',         img: 'https://images.unsplash.com/photo-1513519247388-4e282660bf6b?auto=format&fit=crop&q=60&w=300' },
  { id: 'classic',      label: 'Classic',       labelAr: 'كلاسيك',      img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=60&w=300' },
  { id: 'luxury',       label: 'Luxury',        labelAr: 'فاخر',         img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=60&w=300' },
];

interface StylePresetPickerProps {
  value: string;
  onChange: (style: string) => void;
  language?: 'en' | 'ar';
  className?: string;
}

export const StylePresetPicker: React.FC<StylePresetPickerProps> = ({
  value,
  onChange,
  language = 'en',
  className,
}) => {
  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3', className)}>
      {STYLE_PRESETS.map((preset) => {
        const isSelected = value === preset.id;
        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => onChange(preset.id)}
            className={cn(
              'relative group rounded-2xl overflow-hidden border-2 transition-all',
              isSelected
                ? 'border-primary shadow-lg shadow-primary/20 scale-[1.02]'
                : 'border-transparent hover:border-primary/30'
            )}
          >
            <div className="aspect-square">
              <img
                src={preset.img}
                alt={preset.label}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-2 left-0 right-0 px-3 flex items-center justify-between">
              <span className="text-xs font-black text-white">
                {language === 'ar' ? preset.labelAr : preset.label}
              </span>
              {isSelected && (
                <CheckCircle2 size={14} className="text-white fill-primary shrink-0" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export { STYLE_PRESETS };
