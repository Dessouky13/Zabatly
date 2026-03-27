import React from 'react';
import { cn } from '@/src/utils/cn';
import { CheckCircle2 } from 'lucide-react';

const STYLE_PRESETS = [
  { id: 'neo-classical',       label: 'Neo-Classical',         labelAr: 'نيو كلاسيك',          img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=60&w=300' },
  { id: 'classical',           label: 'Classical',             labelAr: 'كلاسيكي',             img: 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&q=60&w=300' },
  { id: 'victorian',           label: 'Victorian',             labelAr: 'فيكتوري',             img: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=60&w=300' },
  { id: 'japandi',             label: 'Japandi',               labelAr: 'ياباندي',             img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=60&w=300' },
  { id: 'scandinavian',        label: 'Scandinavian',          labelAr: 'إسكندنافي',           img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=60&w=300' },
  { id: 'minimalist',          label: 'Minimalist',            labelAr: 'مينيمالست',           img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=60&w=300' },
  { id: 'modern',              label: 'Modern',                labelAr: 'مودرن',               img: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=60&w=300' },
  { id: 'contemporary',        label: 'Contemporary',          labelAr: 'كونتمبراري',          img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=60&w=300' },
  { id: 'industrial',          label: 'Industrial',            labelAr: 'إندستريال',           img: 'https://images.unsplash.com/photo-1505873242700-f289a29e1724?auto=format&fit=crop&q=60&w=300' },
  { id: 'loft',                label: 'Loft',                  labelAr: 'لوفت',                img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=60&w=300' },
  { id: 'bohemian',            label: 'Bohemian (Boho)',       labelAr: 'بوهيمي',              img: 'https://images.unsplash.com/photo-1513519247388-4e282660bf6b?auto=format&fit=crop&q=60&w=300' },
  { id: 'coastal',             label: 'Coastal',               labelAr: 'ساحلي',               img: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&q=60&w=300' },
  { id: 'tropical',            label: 'Tropical',              labelAr: 'استوائي',             img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=60&w=300' },
  { id: 'rustic',              label: 'Rustic',                labelAr: 'ريفي',                img: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=60&w=300' },
  { id: 'farmhouse',           label: 'Farmhouse',             labelAr: 'فارم هاوس',           img: 'https://images.unsplash.com/photo-1600566753376-12c8ab7a5a0e?auto=format&fit=crop&q=60&w=300' },
  { id: 'art-deco',            label: 'Art Deco',              labelAr: 'آرت ديكو',            img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=60&w=300' },
  { id: 'hollywood-glam',      label: 'Hollywood Glam',        labelAr: 'هوليوود جلام',        img: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=60&w=300' },
  { id: 'maximalist',          label: 'Maximalist',            labelAr: 'ماكسيمالست',          img: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&q=60&w=300' },
  { id: 'mediterranean',       label: 'Mediterranean',         labelAr: 'بحر أبيض متوسطي',    img: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&q=60&w=300' },
  { id: 'moroccan',            label: 'Moroccan',              labelAr: 'مغربي',               img: 'https://images.unsplash.com/photo-1590725121839-892b458a74fe?auto=format&fit=crop&q=60&w=300' },
  { id: 'arabic-islamic',      label: 'Arabic / Islamic',      labelAr: 'عربي / إسلامي',      img: 'https://images.unsplash.com/photo-1584286595398-a59511e0649f?auto=format&fit=crop&q=60&w=300' },
  { id: 'japanese-traditional', label: 'Japanese Traditional',  labelAr: 'ياباني تقليدي',      img: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&q=60&w=300' },
  { id: 'transitional',        label: 'Transitional',          labelAr: 'ترانزيشنال',          img: 'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?auto=format&fit=crop&q=60&w=300' },
  { id: 'modern-classic',      label: 'Modern Classic',        labelAr: 'مودرن كلاسيك',       img: 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&q=60&w=300' },
  { id: 'eclectic',            label: 'Eclectic',              labelAr: 'إكلكتيك',            img: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&q=60&w=300' },
  { id: 'retro',               label: 'Retro',                 labelAr: 'ريترو',               img: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&q=60&w=300' },
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
