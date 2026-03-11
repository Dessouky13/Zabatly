import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, Image } from 'lucide-react';
import { cn } from '@/src/utils/cn';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  onClear?: () => void;
  accept?: string;
  maxSizeMB?: number;
  preview?: string | null;
  label?: string;
  sublabel?: string;
  className?: string;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFileSelect,
  onClear,
  accept = 'image/jpeg,image/png,image/webp',
  maxSizeMB = 10,
  preview,
  label = 'Drag & drop your image here',
  sublabel = 'Supports JPG, PNG, WEBP up to 10MB',
  className,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file (JPG, PNG, or WEBP)');
        return;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File too large. Maximum size is ${maxSizeMB}MB`);
        return;
      }
      onFileSelect(file);
    },
    [onFileSelect, maxSizeMB]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  if (preview) {
    return (
      <div className={cn('relative rounded-2xl overflow-hidden group', className)}>
        <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
          <button
            type="button"
            onClick={() => {
              onClear?.();
              if (inputRef.current) inputRef.current.value = '';
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-slate-700 rounded-full p-2 shadow-lg hover:bg-red-50 hover:text-red-500"
          >
            <X size={20} />
          </button>
        </div>
        <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-widest flex items-center gap-1.5">
          <Image size={10} />
          Uploaded
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl p-10 border-2 border-dashed cursor-pointer transition-all',
          isDragging
            ? 'border-primary bg-primary/10 scale-[1.01]'
            : 'border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40'
        )}
      >
        <div className={cn('mb-4 p-4 rounded-2xl transition-colors', isDragging ? 'bg-primary/20' : 'bg-primary/10')}>
          <Upload size={32} className="text-primary" />
        </div>
        <p className="text-sm font-bold text-slate-700 text-center">{label}</p>
        <p className="text-[11px] text-slate-400 mt-1.5 font-medium text-center">{sublabel}</p>
        <button
          type="button"
          className="mt-6 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors"
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
        >
          Browse Files
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-500 font-bold flex items-center gap-1.5">
          <X size={12} className="shrink-0" />
          {error}
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  );
};
