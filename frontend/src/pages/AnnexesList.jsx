import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Eye, Download, FileText, ChevronLeft, ChevronRight,
  X, Sparkles, BookOpen, ArrowRight, SlidersHorizontal
} from 'lucide-react';
import { useAnnexes } from '../hooks/useAnnexes';
import api from '../lib/api';
import { format } from 'date-fns';
import { fr, enUS, arSA } from 'date-fns/locale';
import { useTheme } from '../contexts/ThemeContext';

const CATEGORY_META = {
  'Documentation': { icon: '📄', cls: 'cat-documentation' },
  'Code Source': { icon: '💻', cls: 'cat-code' },
  'Schémas': { icon: '📐', cls: 'cat-schemas' },
  "Captures d'écran": { icon: '🖼️', cls: 'cat-captures' },
  'Vidéos': { icon: '🎬', cls: 'cat-videos' },
  'Rapports': { icon: '📊', cls: 'cat-rapports' },
  'Données': { icon: '🗃️', cls: 'cat-donnees' },
  'Autre': { icon: '📎', cls: 'cat-autre' },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

export default function AnnexesList() {
  const { t } = useTranslation();
  const { language } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const { annexes, pagination, loading } = useAnnexes({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'all',
    page: searchParams.get('page') || 1,
    limit: 12,
  });

  useEffect(() => {
    api.get('/annexes/categories')
      .then(res => setCategories(res.data.data))
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({ search: searchTerm, page: 1 });
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    updateParams({ category: cat, page: 1 });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategory('all');
    setSearchParams({});
  };

  const handlePageChange = (newPage) => updateParams({ page: newPage });

  const updateParams = (updates) => {
    const current = Object.fromEntries(searchParams.entries());
    const merged = { ...current, ...updates };
    Object.keys(merged).forEach(key => {
      if (!merged[key] || merged[key] === 'all' || (key === 'page' && merged[key] == 1)) {
        delete merged[key];
      }
    });
    setSearchParams(merged);
  };

  const getLocale = () => {
    switch (language) {
      case 'fr': return fr;
      case 'en': return enUS;
      case 'ar': return arSA;
      default: return fr;
    }
  };

  const hasActiveFilters = searchParams.get('search') || (searchParams.get('category') && searchParams.get('category') !== 'all');

  return (
    <div className="min-h-screen bg-mesh dark:bg-mesh">

      {/* ── Page Banner ── */}
      <div className="relative overflow-hidden py-16 hero-bg">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-56 h-56 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="page-container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-primary-500/30 text-primary-300 text-xs font-semibold uppercase tracking-wider mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {pagination?.total || 0} document{(pagination?.total || 0) !== 1 ? 's' : ''} disponible{(pagination?.total || 0) !== 1 ? 's' : ''}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold text-white mb-4"
          >
            Toutes les <span className="gradient-text">Annexes</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-secondary-300 text-lg max-w-xl mx-auto"
          >
            Explorez tous les documents complémentaires de mon Projet de Fin d'Études.
          </motion.p>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full dark:hidden">
            <path d="M0 40L1440 40L1440 0C1200 30 960 40 720 35C480 30 240 15 0 10V40Z" fill="#f8fafc"/>
          </svg>
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full hidden dark:block">
            <path d="M0 40L1440 40L1440 0C1200 30 960 40 720 35C480 30 240 15 0 10V40Z" fill="#020617"/>
          </svg>
        </div>
      </div>

      <div className="page-container py-10">

        {/* ── Search Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card p-4 mb-6 shadow-card"
        >
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-secondary-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher une annexe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 h-11"
                id="search-annexes"
              />
            </div>
            <button type="submit" className="btn-primary px-5" id="search-btn">
              <Search className="w-4 h-4" />
              <span className="hidden sm:block">Rechercher</span>
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                showFilters || hasActiveFilters
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'border-secondary-200 dark:border-secondary-600 text-secondary-600 dark:text-secondary-400 hover:border-primary-400'
              }`}
              id="filters-toggle"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:block">Filtres</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
              )}
            </button>
          </form>

          {/* Category filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-secondary-100 dark:border-secondary-700">
                  <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-3">Catégories</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleCategoryChange('all')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                        category === 'all'
                          ? 'bg-primary-500 text-white shadow-glow'
                          : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600'
                      }`}
                    >
                      🗂️ Toutes
                    </button>
                    {categories.map(cat => {
                      const meta = CATEGORY_META[cat] || { icon: '📎', cls: 'cat-autre' };
                      return (
                        <button
                          key={cat}
                          onClick={() => handleCategoryChange(cat)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                            category === cat
                              ? 'bg-primary-500 text-white shadow-glow'
                              : `${meta.cls} hover:opacity-80`
                          }`}
                        >
                          {meta.icon} {cat}
                        </button>
                      );
                    })}

                    {hasActiveFilters && (
                      <button
                        onClick={handleClearFilters}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 transition-all duration-200"
                        id="clear-filters"
                      >
                        <X className="w-3 h-3" />
                        Réinitialiser
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Results info ── */}
        {!loading && pagination && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between mb-6"
          >
            <p className="text-sm text-secondary-500 dark:text-secondary-400">
              <span className="font-semibold text-secondary-900 dark:text-white">{pagination.total}</span> annexe{pagination.total !== 1 ? 's' : ''} trouvée{pagination.total !== 1 ? 's' : ''}
              {hasActiveFilters && <span className="text-primary-600 dark:text-primary-400"> (filtrées)</span>}
            </p>
            {pagination.pages > 1 && (
              <p className="text-sm text-secondary-400">
                Page {pagination.page} / {pagination.pages}
              </p>
            )}
          </motion.div>
        )}

        {/* ── Loading ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card p-5 space-y-4 animate-pulse">
                <div className="h-3 bg-secondary-200 dark:bg-secondary-700 rounded-full w-2/3" />
                <div className="w-12 h-12 bg-secondary-200 dark:bg-secondary-700 rounded-xl" />
                <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded-lg" />
                <div className="h-3 bg-secondary-200 dark:bg-secondary-700 rounded-full w-4/5" />
                <div className="h-3 bg-secondary-200 dark:bg-secondary-700 rounded-full w-3/5" />
              </div>
            ))}
          </div>
        ) : annexes.length > 0 ? (
          <>
            {/* ── Grid ── */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {annexes.map((annexe) => {
                  const meta = CATEGORY_META[annexe.category] || { icon: '📎', cls: 'cat-autre' };
                  return (
                    <motion.div
                      key={annexe._id}
                      variants={cardVariant}
                      layout
                      whileHover={{ y: -5, boxShadow: '0 16px 40px rgba(79,70,229,0.12)' }}
                    >
                      <Link
                        to={`/annexes/${annexe.slug}`}
                        className="card h-full flex flex-col group overflow-hidden block"
                      >
                        {/* Top color bar */}
                        <div className="h-1 bg-gradient-to-r from-primary-500 to-violet-500 group-hover:from-violet-500 group-hover:to-primary-500 transition-all duration-500" />

                        <div className="p-5 flex-1 flex flex-col">
                          {/* Category */}
                          <div className="flex items-center justify-between mb-4">
                            <span className={`badge text-xs ${meta.cls}`}>
                              {meta.icon} {annexe.category}
                            </span>
                            <span className="text-xs text-secondary-400">
                              {format(new Date(annexe.createdAt), 'MMM yyyy', { locale: getLocale() })}
                            </span>
                          </div>

                          {/* Icon */}
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/40 transition-colors duration-300 flex-shrink-0"
                          >
                            <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                          </motion.div>

                          {/* Title */}
                          <h3 className="font-bold text-secondary-900 dark:text-white text-base mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200 flex-1">
                            {annexe.title}
                          </h3>

                          {/* Description */}
                          {annexe.description && (
                            <p className="text-secondary-500 dark:text-secondary-400 text-xs line-clamp-2 leading-relaxed mb-3">
                              {annexe.description}
                            </p>
                          )}

                          {/* Tags */}
                          {annexe.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {annexe.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-secondary-100 dark:bg-secondary-700 text-secondary-500 dark:text-secondary-400 rounded font-medium">
                                  #{tag}
                                </span>
                              ))}
                              {annexe.tags.length > 2 && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-secondary-100 dark:bg-secondary-700 text-secondary-400 rounded">
                                  +{annexe.tags.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-3 border-t border-secondary-100 dark:border-secondary-700 bg-secondary-50/50 dark:bg-secondary-800/50 flex justify-between items-center">
                          <div className="flex gap-3 text-xs font-medium text-secondary-400">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5" />
                              {annexe.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Download className="w-3.5 h-3.5" />
                              {annexe.downloads}
                            </span>
                          </div>
                          <span className="flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 group-hover:gap-2 transition-all duration-200">
                            Voir <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {/* ── Pagination ── */}
            {pagination && pagination.pages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-secondary-200 dark:border-secondary-700 text-secondary-600 dark:text-secondary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>

                <div className="flex items-center gap-1">
                  {[...Array(pagination.pages)].map((_, i) => {
                    const p = i + 1;
                    if (p === 1 || p === pagination.pages || (p >= pagination.page - 1 && p <= pagination.page + 1)) {
                      return (
                        <motion.button
                          key={p}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handlePageChange(p)}
                          className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-200 ${
                            pagination.page === p
                              ? 'bg-gradient-to-r from-primary-500 to-violet-500 text-white shadow-glow'
                              : 'border border-secondary-200 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400'
                          }`}
                        >
                          {p}
                        </motion.button>
                      );
                    } else if (p === pagination.page - 2 || p === pagination.page + 2) {
                      return <span key={p} className="text-secondary-400 px-1">···</span>;
                    }
                    return null;
                  })}
                </div>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-secondary-200 dark:border-secondary-700 text-secondary-600 dark:text-secondary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            )}
          </>
        ) : (
          /* ── Empty State ── */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center shadow-inner"
            >
              <Search className="w-12 h-12 text-secondary-300 dark:text-secondary-600" />
            </motion.div>
            <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-3">
              Aucune annexe trouvée
            </h3>
            <p className="text-secondary-500 dark:text-secondary-400 mb-8 max-w-sm mx-auto">
              Aucun résultat ne correspond à votre recherche. Essayez d'autres mots-clés ou réinitialisez les filtres.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleClearFilters}
              className="btn-outline"
            >
              <X className="w-4 h-4" />
              Réinitialiser les filtres
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
