import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  CheckCircle2,
  Star,
  Zap,
  Camera,
  Palette,
  Wand2,
  Globe,
  Mail,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/src/components/Layout';
import { useLanguage } from '@/src/context/LanguageContext';
import { Logo } from '@/src/components/Logo';

const NAV_LINKS = [
  { key: 'nav.howItWorks', href: '#how-it-works' },
  { key: 'nav.examples',   href: '#examples' },
  { key: 'nav.pricing',    href: '/pricing' },
  { key: 'nav.testimonials', href: '#testimonials' },
] as const;

const TESTIMONIALS = [
  {
    nameKey: 'Sara Al-Fahd',
    roleKey: 'Homeowner, Dubai',
    text: '"Zabatly saved me thousands in design fees. I saw exactly how my living room would look before buying a single sofa. Truly magical!"',
    img: 20,
  },
  {
    nameKey: 'Ahmed Hassan',
    roleKey: 'Real Estate Agent, Cairo',
    text: '"The Egyptian translation makes it so easy to use locally. Finally, an AI tool that understands our aesthetic preferences."',
    img: 21,
  },
  {
    nameKey: 'Elena Rodriguez',
    roleKey: 'Professional Architect',
    text: '"As an interior designer, I use this for rapid mood-boarding. It cuts my brainstorming time by 80%."',
    img: 22,
  },
];

export default function LandingPage() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen bg-background-light">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background-light/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={40} className="text-primary" />
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Zabatly | ظبطلي</h2>
          </div>
          <nav className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map((item) => (
              item.href.startsWith('/') ? (
                <Link
                  key={item.key}
                  to={item.href}
                  className="text-sm font-semibold hover:text-primary transition-colors"
                >
                  {t(item.key)}
                </Link>
              ) : (
                <a
                  key={item.key}
                  href={item.href}
                  className="text-sm font-semibold hover:text-primary transition-colors"
                >
                  {t(item.key)}
                </a>
              )
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/10 transition-all"
            >
              <Globe size={16} />
              <span>{t('common.lang')}</span>
            </button>
            <Link to="/login">
              <Button className="rounded-full px-8">{t('nav.login')}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:px-10 lg:py-32 overflow-hidden">
        <div className="mx-auto max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-8"
            >
              <div className="inline-flex w-fit items-center rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                {t('hero.badge')}
              </div>
              <h1 className="text-5xl font-black leading-[1.1] tracking-tight text-slate-900 lg:text-7xl">
                {t('hero.title')} <span className="text-primary">{t('hero.titleAccent')}</span>
                <br />
                <span className="text-3xl lg:text-4xl font-bold opacity-60">{t('hero.titleAr')}</span>
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-slate-600">
                {t('hero.desc')}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/redesign">
                  <Button size="lg" className="rounded-2xl h-16 px-10 text-lg">
                    {t('hero.cta')}
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="rounded-2xl h-16 px-10 text-lg bg-white">
                  {t('hero.gallery')}
                </Button>
              </div>
              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <img
                      key={i}
                      src={`https://i.pravatar.cc/100?img=${i + 10}`}
                      className="h-10 w-10 rounded-full border-2 border-background-light"
                      alt="User"
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
                <p className="text-sm font-medium text-slate-500">{t('hero.users')}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-[4/5] overflow-hidden rounded-[3rem] bg-slate-200 shadow-2xl relative">
                <img
                  src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800"
                  className="w-full h-full object-cover"
                  alt="Hero"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -bottom-10 -left-10 aspect-square w-48 overflow-hidden rounded-3xl border-8 border-background-light bg-white shadow-2xl"
              >
                <img
                  src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=400"
                  className="w-full h-full object-cover"
                  alt="Detail"
                  referrerPolicy="no-referrer"
                />
              </motion.div>

              <div className="absolute -right-6 top-10 flex flex-col gap-2 rounded-2xl bg-white/90 p-4 shadow-xl backdrop-blur-md border border-white/20">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-primary fill-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{t('hero.aiRendering')}</span>
                </div>
                <div className="h-1.5 w-32 rounded-full bg-slate-100 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '75%' }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-full bg-primary"
                  />
                </div>
                <span className="text-[10px] font-bold">{t('hero.optimizing')}</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Background blobs */}
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10"></div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-24 lg:py-32" id="how-it-works">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-20 text-center">
            <h2 className="text-primary text-sm font-bold uppercase tracking-[0.2em] mb-4">{t('process.badge')}</h2>
            <h3 className="text-4xl font-black lg:text-5xl text-slate-900">{t('process.title')}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: t('process.step1.title'), desc: t('process.step1.desc'), icon: Camera },
              { title: t('process.step2.title'), desc: t('process.step2.desc'), icon: Palette },
              { title: t('process.step3.title'), desc: t('process.step3.desc'), icon: Wand2 },
            ].map((step, idx) => (
              <div key={idx} className="group relative flex flex-col items-center text-center">
                <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-background-light text-primary shadow-inner group-hover:scale-110 transition-transform duration-500">
                  <step.icon size={40} />
                </div>
                <h4 className="mb-4 text-2xl font-bold">{step.title}</h4>
                <p className="text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="px-6 py-24 lg:px-10" id="examples">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div>
              <h2 className="text-primary text-sm font-bold uppercase tracking-[0.2em] mb-4">{t('gallery.badge')}</h2>
              <h3 className="text-4xl font-black text-slate-900">{t('gallery.title')}</h3>
            </div>
            <div className="flex gap-3">
              <button className="h-12 w-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                <ChevronLeft size={24} />
              </button>
              <button className="h-12 w-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { title: 'Neo-Classical', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800' },
              { title: 'Japandi', img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800' },
            ].map((item, idx) => (
              <div key={idx} className="relative overflow-hidden rounded-[2.5rem] group cursor-pointer">
                <div className="aspect-video transition-transform duration-700 group-hover:scale-105">
                  <img src={item.img} className="w-full h-full object-cover" alt={item.title} referrerPolicy="no-referrer" />
                </div>
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between rounded-2xl bg-white/20 p-5 backdrop-blur-xl border border-white/30">
                  <div>
                    <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">{t('gallery.styleLabel')}</p>
                    <p className="text-lg font-bold text-white">{item.title}</p>
                  </div>
                  <Zap size={20} className="text-white fill-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-slate-900 px-6 py-24 lg:px-10" id="pricing">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-primary text-sm font-bold uppercase tracking-[0.2em] mb-4">{t('pricing.badge')}</h2>
            <h3 className="text-4xl font-black text-white">{t('pricing.title')}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Free */}
            <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-10 text-white hover:bg-white/[0.08] transition-all">
              <h4 className="text-xl font-bold mb-2">{t('pricing.free.name')}</h4>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-black">0</span>
                <span className="text-white/60 text-sm font-bold ml-2">{t('pricing.freeForever')}</span>
              </div>
              <ul className="mb-10 flex flex-col gap-5 text-white/70">
                <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-primary" /> {t('pricing.free.feat1')}</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-primary" /> {t('pricing.free.feat2')}</li>
                <li className="flex items-center gap-3 text-white/30"><X size={18} /> {t('pricing.free.feat3')}</li>
              </ul>
              <Link to="/signup">
                <Button variant="secondary" className="w-full h-14 rounded-2xl bg-white/10 border-white/20 text-white hover:bg-white hover:text-slate-900">
                  {t('pricing.cta.free')}
                </Button>
              </Link>
            </div>

            {/* Basic — Most Popular */}
            <div className="relative rounded-[3rem] bg-primary p-12 text-white shadow-2xl shadow-primary/20 scale-105 z-10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-white px-5 py-1.5 text-[10px] font-black text-primary uppercase tracking-widest">
                {t('pricing.mostPopular')}
              </div>
              <h4 className="text-2xl font-bold mb-2">{t('pricing.basic.name')}</h4>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-6xl font-black">39</span>
                <span className="text-white/80 text-sm font-bold ml-1">EGP</span>
                <span className="text-white/80">{t('pricing.perMonth')}</span>
              </div>
              <ul className="mb-10 flex flex-col gap-5">
                <li className="flex items-center gap-3"><CheckCircle2 size={20} /> {t('pricing.basic.feat1')}</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={20} /> {t('pricing.basic.feat2')}</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={20} /> {t('pricing.basic.feat3')}</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={20} /> {t('pricing.basic.feat4')}</li>
              </ul>
              <Link to="/payment?plan=basic">
                <Button className="w-full h-16 rounded-2xl bg-white text-primary shadow-xl hover:scale-105">
                  {t('pricing.cta.basic')}
                </Button>
              </Link>
            </div>

            {/* Premium */}
            <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-10 text-white hover:bg-white/[0.08] transition-all">
              <h4 className="text-xl font-bold mb-2">{t('pricing.premium.name')}</h4>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-black">79</span>
                <span className="text-white/60 text-sm font-bold ml-1">EGP</span>
                <span className="text-white/60">{t('pricing.perMonth')}</span>
              </div>
              <ul className="mb-10 flex flex-col gap-5 text-white/70">
                <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-primary" /> {t('pricing.premium.feat1')}</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-primary" /> {t('pricing.premium.feat2')}</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-primary" /> {t('pricing.premium.feat4')}</li>
              </ul>
              <Link to="/payment?plan=premium">
                <Button variant="secondary" className="w-full h-14 rounded-2xl bg-white/10 border-white/20 text-white hover:bg-white hover:text-slate-900">
                  {t('pricing.cta.premium')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-24 lg:py-32" id="testimonials">
        <div className="mx-auto max-w-7xl">
          <div className="mb-20 flex flex-col items-center text-center">
            <h2 className="text-primary text-sm font-bold uppercase tracking-[0.2em] mb-4">{t('testimonials.badge')}</h2>
            <h3 className="text-4xl font-black text-slate-900 lg:text-5xl">{t('testimonials.title')}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, idx) => (
              <div key={idx} className="rounded-[2.5rem] bg-white p-10 shadow-sm border border-primary/5 flex flex-col">
                <div className="flex gap-1 text-primary mb-6">
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={16} fill="currentColor" />)}
                </div>
                <p className="mb-8 italic text-slate-600 leading-relaxed text-lg">{testimonial.text}</p>
                <div className="flex items-center gap-4 mt-auto">
                  <img src={`https://i.pravatar.cc/100?img=${testimonial.img}`} className="h-12 w-12 rounded-full object-cover" alt={testimonial.nameKey} referrerPolicy="no-referrer" />
                  <div>
                    <p className="font-bold text-slate-900">{testimonial.nameKey}</p>
                    <p className="text-xs text-slate-500 font-medium">{testimonial.roleKey}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="relative overflow-hidden rounded-[4rem] bg-primary px-8 py-24 text-center text-white lg:px-20">
          <div className="relative z-10 flex flex-col items-center gap-10">
            <h2 className="text-4xl font-black lg:text-7xl max-w-4xl">{t('cta.title')}</h2>
            <p className="max-w-2xl text-xl text-white/80">{t('cta.desc')}</p>
            <Link to="/redesign">
              <Button className="h-20 rounded-3xl bg-white px-16 text-2xl font-black text-primary shadow-2xl hover:scale-105 transition-all">
                {t('cta.button')}
              </Button>
            </Link>
          </div>
          <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-black/10 blur-3xl"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/10 px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between gap-16">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3">
              <Logo size={40} className="text-primary" />
              <h2 className="text-2xl font-extrabold text-slate-900">Zabatly</h2>
            </div>
            <p className="max-w-xs text-slate-500 leading-relaxed">{t('footer.tagline')}</p>
            <div className="flex gap-4">
              <a href="#" className="h-12 w-12 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:text-primary transition-all"><Globe size={20} /></a>
              <a href="#" className="h-12 w-12 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:text-primary transition-all"><Mail size={20} /></a>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-16">
            {[
              {
                titleKey: 'footer.platform',
                links: [
                  { key: 'footer.howItWorks', href: '#how-it-works' },
                  { key: 'footer.gallery',    href: '#examples' },
                  { key: 'footer.styles',     href: '#' },
                ],
              },
              {
                titleKey: 'footer.company',
                links: [
                  { key: 'footer.aboutUs', href: '#' },
                  { key: 'footer.contact', href: '#' },
                  { key: 'footer.privacy', href: '#' },
                ],
              },
              {
                titleKey: 'footer.support',
                links: [
                  { key: 'footer.helpCenter', href: '#' },
                  { key: 'footer.api',        href: '#' },
                  { key: 'footer.community',  href: '#' },
                ],
              },
            ].map((col) => (
              <div key={col.titleKey} className="flex flex-col gap-6">
                <h5 className="font-bold text-slate-900">{t(col.titleKey)}</h5>
                {col.links.map((link) => (
                  <a key={link.key} href={link.href} className="text-sm text-slate-500 hover:text-primary transition-colors">
                    {t(link.key)}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mx-auto max-w-7xl mt-24 pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">
          <p>{t('common.copyright')}</p>
          <p className="flex items-center gap-2">{t('common.madeWith')} <Star size={10} fill="currentColor" className="text-primary" /></p>
        </div>
      </footer>
    </div>
  );
}
