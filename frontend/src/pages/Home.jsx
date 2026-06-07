import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { FileText, QrCode, Eye, Download, Search, FileDown, Sparkles, ArrowRight, BookOpen, CheckCircle } from 'lucide-react';
import { useAnnexes, useStats } from '../hooks/useAnnexes';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import heroImg from '../assets/hero.png';

// Animated counter component
function AnimatedCounter({ target, suffix = '', duration = 1.5 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView || target === 0) return;
    let start = 0;
    const step = target / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// Category badge colors
const CATEGORY_COLORS = {
  'Documentation': 'cat-documentation',
  'Code Source': 'cat-code',
  'Schémas': 'cat-schemas',
  "Captures d'écran": 'cat-captures',
  'Vidéos': 'cat-videos',
  'Rapports': 'cat-rapports',
  'Données': 'cat-donnees',
  'Autre': 'cat-autre',
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export default function Home() {
  const { t } = useTranslation();
  const { annexes, loading: annexesLoading } = useAnnexes({ limit: 3 });
  const { stats, loading: statsLoading } = useStats();

  const features = [
    '✅ Accès instantané via QR Code',
    '✅ Visualisation PDF en ligne',
    '✅ Téléchargement disponible',
    '✅ Interface multilingue (FR/EN/AR)',
  ];

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">

      {/* ═══════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Dark gradient background */}
        <div className="absolute inset-0 hero-bg" />

        {/* Animated mesh overlay */}
        <div className="absolute inset-0 bg-gradient-mesh-dark opacity-60" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid opacity-20" />

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary-500/10 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-violet-500/10 blur-3xl animate-float-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary-900/20 blur-3xl" />

        <div className="page-container relative z-10 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left — Text Content */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary-500/30 text-primary-300 font-medium text-sm mb-8">
                <motion.span
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex h-2 w-2"
                >
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-400" />
                </motion.span>
                <Sparkles className="w-3.5 h-3.5" />
                Plateforme PFE 2026
              </motion.div>

              {/* Title */}
              <motion.h1
                variants={fadeInUp}
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6"
              >
                Consultez les{' '}
                <span className="relative">
                  <span className="gradient-text">Annexes</span>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.6, ease: 'easeOut' }}
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-400 to-violet-400 origin-left"
                  />
                </span>{' '}
                de mon PFE
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={fadeInUp}
                className="text-lg text-secondary-300 mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0"
              >
                Accédez rapidement à tous les documents complémentaires de mon rapport
                de Projet de Fin d'Études — PDFs, schémas, codes sources et plus encore.
              </motion.p>

              {/* Features list */}
              <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8 text-sm">
                {features.map((f, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="text-secondary-400 flex items-center gap-2"
                  >
                    {f}
                  </motion.p>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/annexes"
                    className="btn-primary btn-lg group relative overflow-hidden"
                  >
                    {/* Shimmer effect */}
                    <span className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <BookOpen className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Explorer les Annexes</span>
                    <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right — Hero Image */}
            <motion.div
              variants={fadeInRight}
              initial="hidden"
              animate="visible"
              className="flex items-center justify-center lg:justify-end relative"
            >
              {/* Glow ring behind image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-80 h-80 rounded-full bg-primary-500/10 blur-2xl animate-pulse-slow" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 rounded-full bg-violet-500/10 blur-xl animate-float-slow" />
              </div>

              {/* Floating decorative cards */}
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -left-4 glass border border-white/10 rounded-2xl px-4 py-3 shadow-xl hidden lg:flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">PDF Viewer</p>
                  <p className="text-[10px] text-secondary-400">Lecture intégrée</p>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [5, -5, 5] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-4 -right-4 glass border border-white/10 rounded-2xl px-4 py-3 shadow-xl hidden lg:flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                  <QrCode className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">QR Code</p>
                  <p className="text-[10px] text-secondary-400">Accès rapide</p>
                </div>
              </motion.div>

              {/* Main hero image */}
              <motion.div
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, 1, 0, -1, 0],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10"
              >
                <div className="relative">
                  {/* Image glow */}
                  <div className="absolute inset-0 bg-primary-500/20 blur-3xl rounded-full scale-75" />
                  <img
                    src={heroImg}
                    alt="Architecture PFE Annexes"
                    className="relative z-10 w-72 h-72 md:w-96 md:h-96 object-contain drop-shadow-2xl"
                    style={{ filter: 'drop-shadow(0 0 40px rgba(79, 70, 229, 0.4))' }}
                  />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L60 66.7C120 53 240 27 360 21.3C480 16 600 32 720 37.3C840 43 960 37 1080 32C1200 27 1320 21 1380 18.7L1440 16V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="#f8fafc"/>
          </svg>
          <div className="dark:hidden absolute inset-0 pointer-events-none" style={{ background: 'transparent' }} />
        </div>
        <div className="hidden dark:block absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L60 66.7C120 53 240 27 360 21.3C480 16 600 32 720 37.3C840 43 960 37 1080 32C1200 27 1320 21 1380 18.7L1440 16V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="#020617"/>
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          STATS SECTION
      ═══════════════════════════════════════════════════════ */}
      <section className="py-16 bg-background dark:bg-secondary-950">
        <div className="page-container">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                value: stats?.activeAnnexes || 0,
                label: 'Annexes disponibles',
                icon: FileText,
                color: 'from-primary-500 to-primary-600',
                bg: 'bg-primary-50 dark:bg-primary-900/20',
                iconColor: 'text-primary-600 dark:text-primary-400',
              },
              {
                value: stats?.totalViews || 0,
                label: 'Consultations totales',
                icon: Eye,
                color: 'from-violet-500 to-violet-600',
                bg: 'bg-violet-50 dark:bg-violet-900/20',
                iconColor: 'text-violet-600 dark:text-violet-400',
              },
              {
                value: stats?.totalDownloads || 0,
                label: 'Téléchargements',
                icon: Download,
                color: 'from-emerald-500 to-emerald-600',
                bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                iconColor: 'text-emerald-600 dark:text-emerald-400',
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(79,70,229,0.12)' }}
                className="card p-6 flex items-center gap-5 group cursor-default"
              >
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-7 h-7 ${stat.iconColor}`} />
                </div>
                <div>
                  <p className="text-4xl font-extrabold text-secondary-900 dark:text-white tabular-nums">
                    {statsLoading ? (
                      <span className="inline-block w-12 h-8 bg-secondary-200 dark:bg-secondary-700 rounded animate-pulse" />
                    ) : (
                      <AnimatedCounter target={stat.value} />
                    )}
                  </p>
                  <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400 mt-0.5">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════════════════ */}
      <section className="section bg-white dark:bg-secondary-900 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-dots opacity-40 dark:opacity-20" />

        <div className="page-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Simple & Rapide
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-secondary-900 dark:text-white mb-4">
              Comment ça <span className="gradient-text">fonctionne</span> ?
            </h2>
            <p className="text-secondary-500 dark:text-secondary-400 leading-relaxed">
              En 3 étapes simples, accédez à n'importe quelle annexe depuis n'importe où.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[18%] right-[18%] h-px">
              <div className="h-full bg-gradient-to-r from-primary-300 via-violet-400 to-emerald-300 dark:from-primary-700 dark:via-violet-700 dark:to-emerald-700 opacity-60" />
              <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-r from-primary-300 via-violet-400 to-emerald-300 blur-sm opacity-40" />
            </div>

            {[
              {
                step: '01',
                icon: QrCode,
                title: 'Scannez le QR Code',
                desc: 'Dans le rapport imprimé, chaque annexe dispose d\'un QR Code unique. Scannez-le avec votre téléphone.',
                color: 'from-primary-500 to-primary-600',
                glow: 'shadow-glow',
              },
              {
                step: '02',
                icon: Search,
                title: 'Accédez à la page',
                desc: 'Vous êtes redirigé instantanément vers la page de l\'annexe correspondante sur cette plateforme.',
                color: 'from-violet-500 to-violet-600',
                glow: 'shadow-glow-accent',
              },
              {
                step: '03',
                icon: FileDown,
                title: 'Consultez & Téléchargez',
                desc: 'Lisez le document directement dans le navigateur ou téléchargez-le en un clic.',
                color: 'from-emerald-500 to-emerald-600',
                glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]',
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                whileHover={{ y: -6 }}
                className="relative z-10 card p-8 group text-center"
              >
                {/* Step number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-secondary-100 to-secondary-200 dark:from-secondary-700 dark:to-secondary-800 border-2 border-white dark:border-secondary-900 flex items-center justify-center text-xs font-black text-secondary-600 dark:text-secondary-300">
                  {step.step}
                </div>

                {/* Icon */}
                <div className="flex justify-center mb-6 mt-2">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} ${step.glow} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}
                  >
                    <step.icon className="w-10 h-10 text-white" />
                  </motion.div>
                </div>

                <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-3">{step.title}</h3>
                <p className="text-secondary-500 dark:text-secondary-400 leading-relaxed text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          RECENT ANNEXES
      ═══════════════════════════════════════════════════════ */}
      <section className="section bg-mesh dark:bg-mesh relative">
        <div className="page-container relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-2 block">
                Derniers ajouts
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-secondary-900 dark:text-white">
                Annexes <span className="gradient-text">récentes</span>
              </h2>
            </div>
            <motion.div whileHover={{ x: 3 }}>
              <Link
                to="/annexes"
                className="hidden sm:flex items-center gap-2 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
              >
                Tout voir
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>

          {annexesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-6 space-y-4 animate-pulse">
                  <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded-full w-2/3" />
                  <div className="h-8 bg-secondary-200 dark:bg-secondary-700 rounded-lg" />
                  <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded-full w-full" />
                  <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded-full w-4/5" />
                </div>
              ))}
            </div>
          ) : annexes?.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center">
                <FileText className="w-10 h-10 text-secondary-400" />
              </div>
              <p className="text-secondary-500 dark:text-secondary-400 text-lg font-medium">Aucune annexe disponible pour le moment.</p>
              <p className="text-secondary-400 dark:text-secondary-500 text-sm mt-2">Revenez bientôt !</p>
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {annexes?.map((annexe, index) => (
                <motion.div
                  key={annexe._id}
                  variants={fadeInUp}
                  whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(79,70,229,0.12)' }}
                  className="card overflow-hidden flex flex-col group cursor-pointer"
                >
                  {/* Color accent top bar */}
                  <div className="h-1 bg-gradient-to-r from-primary-500 to-violet-500" />

                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`badge text-xs ${CATEGORY_COLORS[annexe.category] || 'badge-primary'}`}>
                        {annexe.category}
                      </span>
                      <span className="text-xs text-secondary-400 font-medium">
                        {format(new Date(annexe.createdAt), 'dd MMM yyyy', { locale: fr })}
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>

                    <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {annexe.title}
                    </h3>
                    <p className="text-secondary-500 dark:text-secondary-400 text-sm line-clamp-2 mb-4 leading-relaxed">
                      {annexe.description || 'Aucune description disponible.'}
                    </p>
                  </div>

                  <div className="px-6 py-4 border-t border-secondary-100 dark:border-secondary-700 bg-secondary-50/50 dark:bg-secondary-800/50 flex justify-between items-center">
                    <div className="flex gap-4 text-xs font-medium text-secondary-400">
                      <span className="flex items-center gap-1.5 hover:text-secondary-600 dark:hover:text-secondary-300 transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                        {annexe.views}
                      </span>
                      <span className="flex items-center gap-1.5 hover:text-secondary-600 dark:hover:text-secondary-300 transition-colors">
                        <Download className="w-3.5 h-3.5" />
                        {annexe.downloads}
                      </span>
                    </div>
                    <Link
                      to={`/annexes/${annexe.slug}`}
                      className="flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors group/link"
                    >
                      Consulter
                      <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link to="/annexes" className="btn-outline w-full">
              <BookOpen className="w-4 h-4" />
              Voir toutes les annexes
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CTA SECTION
      ═══════════════════════════════════════════════════════ */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 hero-bg" />
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute top-0 left-1/3 w-72 h-72 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-72 h-72 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="page-container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Prêt à consulter les annexes ?
            </h2>
            <p className="text-secondary-300 mb-10 max-w-xl mx-auto leading-relaxed">
              Explorez tous les documents complémentaires de mon Projet de Fin d'Études.
              PDFs, schémas, codes sources et plus encore.
            </p>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link to="/annexes" className="btn-primary btn-lg group">
                <BookOpen className="w-5 h-5" />
                Parcourir les annexes
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
