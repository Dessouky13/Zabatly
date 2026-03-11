import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, X, Zap, CreditCard, Smartphone, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/src/components/Layout';
import { Logo } from '@/src/components/Logo';
import { LanguageToggle } from '@/src/components/LanguageToggle';
import { useLanguage } from '@/src/context/LanguageContext';

const PLANS = [
  {
    key: 'free',
    price: 0,
    highlighted: false,
    hasBadge: false,
    features: [
      { featKey: 'pricing.free.feat1', included: true },
      { featKey: 'pricing.free.feat2', included: true },
      { featKey: 'pricing.free.feat3', included: true },
      { featKey: 'pricing.free.feat4', included: false },
      { featKey: 'pricing.free.feat5', included: false },
    ],
  },
  {
    key: 'basic',
    price: 39,
    highlighted: false,
    hasBadge: false,
    features: [
      { featKey: 'pricing.basic.feat1', included: true },
      { featKey: 'pricing.basic.feat2', included: true },
      { featKey: 'pricing.basic.feat3', included: true },
      { featKey: 'pricing.basic.feat4', included: true },
      { featKey: 'pricing.basic.feat5', included: true },
    ],
  },
  {
    key: 'premium',
    price: 79,
    highlighted: true,
    hasBadge: true,
    features: [
      { featKey: 'pricing.premium.feat1', included: true },
      { featKey: 'pricing.premium.feat2', included: true },
      { featKey: 'pricing.premium.feat3', included: true },
      { featKey: 'pricing.premium.feat4', included: true },
      { featKey: 'pricing.premium.feat5', included: true },
    ],
  },
];

export default function Pricing() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-primary/10 bg-background-light/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <Logo size={36} className="text-primary" />
            <span className="text-lg font-extrabold">Zabatly | ظبطلي</span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <Link to="/login">
              <Button size="sm" className="rounded-full px-6">{t('nav.login')}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20 text-center"
        >
          <span className="inline-block mb-4 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-black text-primary uppercase tracking-widest">
            {t('pricing.badge')}
          </span>
          <h1 className="text-4xl font-black text-slate-900 lg:text-6xl mb-4">{t('pricing.title')}</h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">{t('pricing.subtitle')}</p>
        </motion.div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center mb-20">
          {PLANS.map((plan, idx) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative flex flex-col rounded-[2.5rem] p-8 transition-all ${
                plan.highlighted
                  ? 'bg-primary text-white shadow-2xl shadow-primary/30 scale-105 z-10'
                  : 'bg-white border border-primary/10'
              }`}
            >
              {plan.hasBadge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-5 py-1.5 text-[10px] font-black text-primary uppercase tracking-widest shadow-md">
                  {t('pricing.mostPopular')}
                </div>
              )}
              <h3 className={`text-xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>
                {t(`pricing.${plan.key}.name`)}
              </h3>
              <div className={`flex items-baseline gap-1 mb-8 ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>
                <span className="text-5xl font-black">{plan.price}</span>
                {plan.price > 0 && (
                  <>
                    <span className={`text-sm font-bold ml-1 ${plan.highlighted ? 'text-white/80' : 'text-slate-400'}`}>EGP</span>
                    <span className={`text-sm ${plan.highlighted ? 'text-white/70' : 'text-slate-400'}`}>{t('pricing.perMonth')}</span>
                  </>
                )}
                {plan.price === 0 && (
                  <span className={`text-sm font-bold ml-2 ${plan.highlighted ? 'text-white/70' : 'text-slate-400'}`}>{t('pricing.freeForever')}</span>
                )}
              </div>
              <ul className="flex flex-col gap-4 mb-8 flex-1">
                {plan.features.map((f, fi) => (
                  <li key={fi} className={`flex items-center gap-3 text-sm ${!f.included ? (plan.highlighted ? 'opacity-40' : 'text-slate-300') : ''}`}>
                    {f.included
                      ? <CheckCircle2 size={17} className={plan.highlighted ? 'text-white shrink-0' : 'text-primary shrink-0'} />
                      : <X size={17} className="shrink-0" />
                    }
                    {t(f.featKey)}
                  </li>
                ))}
              </ul>
              <Link to={plan.price === 0 ? '/signup' : `/payment?plan=${plan.key}`}>
                <Button className={`w-full h-12 rounded-2xl text-sm font-bold ${
                  plan.highlighted
                    ? 'bg-white text-primary hover:scale-105'
                    : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white'
                }`}>
                  {t(`pricing.cta.${plan.key}`)}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Pay per design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-[2.5rem] border border-primary/10 p-10 mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-8 justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap size={18} className="text-primary" />
                <h3 className="text-lg font-black text-slate-900">{t('pricing.payPerDesign')}</h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-3 bg-primary/5 rounded-2xl px-5 py-3">
                  <span className="text-2xl font-black text-primary">10</span>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">EGP</p>
                    <p className="text-sm font-bold text-slate-700">{t('pricing.ppBoard')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-primary/5 rounded-2xl px-5 py-3">
                  <span className="text-2xl font-black text-primary">15</span>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">EGP</p>
                    <p className="text-sm font-bold text-slate-700">{t('pricing.ppRedesign')}</p>
                  </div>
                </div>
              </div>
            </div>
            <Link to="/payment?plan=payperdesign">
              <Button className="rounded-2xl px-8 h-12 gap-2">
                {t('pricing.cta.getStarted')}
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-900 text-white rounded-[2.5rem] p-10 mb-12"
        >
          <h3 className="text-xl font-black mb-6">{t('pricing.paymentMethods')}</h3>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex items-center gap-4 bg-white/10 rounded-2xl px-6 py-4 flex-1">
              <div className="size-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Smartphone size={22} className="text-primary" />
              </div>
              <div>
                <p className="font-black">{t('pricing.instapay')}</p>
                <p className="text-xs text-white/60 font-medium">{t('payment.instantTransfer')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/10 rounded-2xl px-6 py-4 flex-1">
              <div className="size-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <CreditCard size={22} className="text-red-400" />
              </div>
              <div>
                <p className="font-black">{t('pricing.vodafone')}</p>
                <p className="text-xs text-white/60 font-medium">{t('payment.mobileWallet')}</p>
              </div>
            </div>
          </div>
          <p className="mt-6 text-sm text-white/60">{t('pricing.paymentNote')}</p>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-2xl mx-auto bg-white rounded-[2rem] border border-primary/10 p-8"
        >
          <h3 className="text-lg font-black text-slate-900 mb-3">{t('pricing.faq')}</h3>
          <p className="text-slate-500 text-sm leading-relaxed">{t('pricing.faqDesc')}</p>
        </motion.div>
      </main>
    </div>
  );
}
