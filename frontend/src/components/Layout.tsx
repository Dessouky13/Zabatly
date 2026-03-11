import React from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  LayoutGrid,
  Palette,
  Wand2,
  Compass,
  LogOut,
  Bell,
  Settings,
  ChevronRight,
  Plus,
  ArrowRight,
  Star,
  CheckCircle2,
  Menu,
  X,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/utils/cn';
import { Logo } from '@/src/components/Logo';
import { useLanguage } from '@/src/context/LanguageContext';
import { useAuth } from '@/src/context/AuthContext';

// --- Shared Components ---

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost', size?: 'sm' | 'md' | 'lg' }>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90',
      secondary: 'bg-white text-primary border border-primary/20 hover:bg-primary/5',
      outline: 'border border-slate-200 hover:bg-slate-50 text-slate-700',
      ghost: 'hover:bg-primary/5 text-slate-600',
    };
    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-6 py-2.5 text-sm',
      lg: 'px-8 py-3.5 text-base',
    };
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

export const Card = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <div className={cn('bg-white rounded-2xl border border-primary/5 shadow-sm overflow-hidden', className)}>
    {children}
  </div>
);

// --- Layout Components ---

export const Sidebar = ({ activePath }: { activePath: string }) => {
  const { t } = useLanguage();
  const { logout } = useAuth();
  const navItems = [
    { name: t('nav.home'), icon: Home, path: '/dashboard' },
    { name: t('nav.myDesigns'), icon: LayoutGrid, path: '/designs' },
    { name: t('nav.moodBoards'), icon: Palette, path: '/mood-boards' },
    { name: t('nav.roomRedesign'), icon: Wand2, path: '/redesign' },
    { name: t('nav.exploreStyles'), icon: Compass, path: '/explore' },
    { name: t('nav.pricing'), icon: CreditCard, path: '/pricing' },
    { name: t('nav.settings'), icon: Settings, path: '/settings' },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-primary/10 bg-white hidden md:flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <Logo size={40} className="text-primary" />
        <div className="flex flex-col">
          <h1 className="text-lg font-bold leading-none">Zabatly</h1>
          <p className="text-primary text-[10px] font-bold uppercase tracking-wider">ظبطلي</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors font-medium",
              activePath === item.path 
                ? "bg-primary/10 text-primary font-bold" 
                : "text-slate-600 hover:bg-primary/5 hover:text-primary"
            )}
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-primary/5 rounded-2xl p-4 mb-4">
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">{t('nav.proMember')}</p>
          <p className="text-xs mb-3 text-slate-500 leading-relaxed">{t('nav.proDesc')}</p>
          <Button className="w-full" size="sm">{t('nav.upgrade')}</Button>
        </div>
        <button onClick={logout} className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors w-full">
          <LogOut size={20} />
          <span className="text-sm font-medium">{t('nav.logout')}</span>
        </button>
      </div>
    </aside>
  );
};

export const Header = () => {
  const { t } = useLanguage();
  const { user, plan, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const displayName = user?.name || user?.email || '—';
  const displayPlan = plan ? `${plan.charAt(0).toUpperCase()}${plan.slice(1)} Plan` : 'Free Plan';
  const avatarSrc = user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=C9704A&color=fff`;

  return (
    <header className="h-16 border-b border-primary/10 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button 
          className="md:hidden p-2 text-slate-600 hover:bg-primary/5 rounded-lg transition-colors"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu size={24} />
        </button>
        <div className="relative w-48 md:w-96 max-w-full hidden sm:block">
          <Compass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder={t('common.search')} 
            className="w-full bg-background-light border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        <button className="size-10 flex items-center justify-center rounded-full hover:bg-primary/5 relative transition-colors">
          <Bell size={20} className="text-slate-600" />
          <span className="absolute top-2.5 right-2.5 size-2 bg-primary rounded-full border-2 border-white"></span>
        </button>
        <Link to="/settings" className="size-10 flex items-center justify-center rounded-full hover:bg-primary/5 transition-colors">
          <Settings size={20} className="text-slate-600" />
        </Link>
        <div className="h-8 w-[1px] bg-primary/10 mx-1 md:mx-2"></div>
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden lg:block">
            <p className="text-sm font-bold leading-none">{displayName}</p>
            <p className="text-[10px] text-slate-500 font-medium">{displayPlan}</p>
          </div>
          <img
            src={avatarSrc}
            alt={displayName}
            className="size-8 md:size-10 rounded-full border-2 border-primary/20 object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-50 md:hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-primary/10">
                <div className="flex items-center gap-3">
                  <Logo size={32} className="text-primary" />
                  <h1 className="text-lg font-bold">Zabatly</h1>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-primary">
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <nav className="space-y-2">
                  {[
                    { name: t('nav.home'), icon: Home, path: '/dashboard' },
                    { name: t('nav.myDesigns'), icon: LayoutGrid, path: '/designs' },
                    { name: t('nav.moodBoards'), icon: Palette, path: '/mood-boards' },
                    { name: t('nav.roomRedesign'), icon: Wand2, path: '/redesign' },
                    { name: t('nav.exploreStyles'), icon: Compass, path: '/explore' },
                    { name: t('nav.pricing'), icon: CreditCard, path: '/pricing' },
                    { name: t('nav.settings'), icon: Settings, path: '/settings' },
                  ].map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-600 hover:bg-primary/5 hover:text-primary font-bold transition-all"
                    >
                      <item.icon size={20} />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="p-6 border-t border-primary/10">
                <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 font-bold transition-all w-full">
                  <LogOut size={20} />
                  {t('nav.logout')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
