import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useParams, Link } from 'react-router-dom';
import { Logo } from '@/src/components/Logo';
import { Palette, Box, Sofa, ExternalLink } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

interface ColorSwatch { hex: string; name: string }
interface FurnitureSuggestion { item: string; style: string; material: string }
interface Board {
  id: string;
  title: string;
  room_type: string;
  style: string;
  generated_images: string[];
  color_palette: ColorSwatch[];
  materials: string[];
  furniture_suggestions: FurnitureSuggestion[];
  created_at: string;
}

export default function SharedBoard() {
  const { token } = useParams<{ token: string }>();
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!token) { setNotFound(true); setLoading(false); return; }
    fetch(`${API_URL}/api/shared/${token}`)
      .then((r) => {
        if (!r.ok) throw new Error('not found');
        return r.json();
      })
      .then(({ board: b }) => setBoard(b))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="size-10 border-[3px] border-primary/20 border-t-primary rounded-full"
        />
      </div>
    );
  }

  if (notFound || !board) {
    return (
      <div className="min-h-screen bg-background-light flex flex-col items-center justify-center gap-6 p-6 text-center">
        <Logo size={40} className="text-primary" />
        <h1 className="text-2xl font-black text-slate-900">Board not found</h1>
        <p className="text-slate-500 max-w-sm">
          This shared link may have expired or been removed by the owner.
        </p>
        <Link
          to="/"
          className="bg-primary text-white font-black px-6 py-3 rounded-2xl hover:bg-primary/90 transition-colors"
        >
          Go to Zabatly
        </Link>
      </div>
    );
  }

  const images: string[] = Array.isArray(board.generated_images) ? board.generated_images : [];
  const palette: ColorSwatch[] = Array.isArray(board.color_palette) ? board.color_palette : [];
  const materials: string[] = Array.isArray(board.materials) ? board.materials : [];
  const furniture: FurnitureSuggestion[] = Array.isArray(board.furniture_suggestions) ? board.furniture_suggestions : [];

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <header className="bg-white border-b border-primary/10 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo size={28} className="text-primary" />
            <span className="font-black text-slate-800 text-sm">Zabatly</span>
          </Link>
          <Link
            to="/signup"
            className="flex items-center gap-2 bg-primary text-white text-sm font-black px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors"
          >
            Create Your Own
            <ExternalLink size={14} />
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Board Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            Shared Mood Board
          </p>
          <h1 className="text-3xl font-black text-slate-900 mb-1">{board.title}</h1>
          <p className="text-slate-500 text-sm">
            {board.room_type} · {board.style} ·{' '}
            {new Date(board.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </motion.div>

        {/* Image Grid */}
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-3 mb-10"
          >
            {images.map((url, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.01 }}
                className={`overflow-hidden rounded-2xl shadow-sm ${idx === 0 ? 'col-span-2 aspect-[16/7]' : 'aspect-square'}`}
              >
                <img
                  src={url}
                  alt={`Mood board image ${idx + 1}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Color Palette */}
          {palette.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Palette size={16} className="text-primary" />
                </div>
                <h2 className="font-black text-slate-800">Color Palette</h2>
              </div>
              <div className="flex h-10 rounded-xl overflow-hidden mb-4 shadow-inner">
                {palette.map((c, i) => (
                  <div key={i} className="flex-1" style={{ backgroundColor: c.hex }} title={c.name} />
                ))}
              </div>
              <div className="flex flex-col gap-2">
                {palette.map((c, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="size-6 rounded-lg border border-slate-100 shadow-sm" style={{ backgroundColor: c.hex }} />
                    <span className="text-sm font-bold text-slate-700">{c.name}</span>
                    <span className="text-xs text-slate-400 ml-auto font-mono">{c.hex}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Materials */}
          {materials.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Box size={16} className="text-primary" />
                </div>
                <h2 className="font-black text-slate-800">Materials</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {materials.map((m, i) => (
                  <span key={i} className="bg-background-light text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full border border-primary/10">
                    {m}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Furniture */}
          {furniture.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-3xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sofa size={16} className="text-primary" />
                </div>
                <h2 className="font-black text-slate-800">Furniture</h2>
              </div>
              <div className="flex flex-col gap-3">
                {furniture.map((f, i) => (
                  <div key={i} className="flex flex-col gap-0.5">
                    <span className="text-sm font-black text-slate-800">{f.item}</span>
                    <span className="text-xs text-slate-500">{f.style} · {f.material}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-primary rounded-3xl p-8 text-center text-white"
        >
          <h2 className="text-2xl font-black mb-2">Design your home before you furnish it</h2>
          <p className="text-primary-foreground/80 mb-6 text-sm font-medium">
            Generate AI mood boards, redesign rooms, and plan your dream home with Zabatly — free to start.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-white text-primary font-black px-8 py-3 rounded-2xl hover:bg-primary/10 hover:text-white border border-white/20 transition-colors"
          >
            Start for Free
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
