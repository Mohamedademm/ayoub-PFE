import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminStats } from '../../hooks/useAnnexes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Eye, Download, CheckCircle, XCircle, Plus, Folder,
  Calendar, ArrowUpRight, TrendingUp, Activity, BarChart3, AlertTriangle, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { stats, loading, error } = useAdminStats();

  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 relative">
          <div className="absolute inset-0 rounded-full border-t-2 border-primary-500 animate-spin" />
          <div className="absolute inset-1.5 rounded-full border-r-2 border-accent animate-spin-slow" />
        </div>
        <p className="text-secondary-500 font-medium animate-pulse">Chargement des statistiques...</p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-8 text-center max-w-xl mx-auto mt-12 border-red-100 dark:border-red-900/30">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-2">Erreur de chargement</h3>
        <p className="text-secondary-500 dark:text-secondary-400 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-outline">
          Réessayer
        </button>
      </motion.div>
    );
  }

  const statCards = [
    {
      label: 'Annexes Totales',
      value: stats?.totalAnnexes || 0,
      icon: FileText,
      trend: '+12%',
      color: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/20',
      bg: 'bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400'
    },
    {
      label: 'Annexes Actives',
      value: stats?.activeAnnexes || 0,
      icon: CheckCircle,
      trend: '+5%',
      color: 'from-emerald-400 to-teal-500',
      shadow: 'shadow-emerald-500/20',
      bg: 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400'
    },
    {
      label: 'Vues Globales',
      value: stats?.totalViews || 0,
      icon: Eye,
      trend: '+24%',
      color: 'from-amber-400 to-orange-500',
      shadow: 'shadow-orange-500/20',
      bg: 'bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400'
    },
    {
      label: 'Téléchargements',
      value: stats?.totalDownloads || 0,
      icon: Download,
      trend: '+18%',
      color: 'from-violet-500 to-fuchsia-600',
      shadow: 'shadow-violet-500/20',
      bg: 'bg-violet-50 dark:bg-violet-900/10 text-violet-600 dark:text-violet-400'
    }
  ];

  const totalCount = stats?.byCategory?.reduce((sum, item) => sum + item.count, 0) || 1;

  return (
    <div className="space-y-8">
      {/* ── Welcome Banner ── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl bg-secondary-950 p-8 md:p-10 text-white shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-mesh-dark opacity-80" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-md">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-secondary-200">Système opérationnel</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 leading-tight">
              Bonjour, <span className="gradient-text">{user?.name?.split(' ')[0] || 'Admin'}</span> 👋
            </h1>
            <p className="text-secondary-400 text-sm md:text-base max-w-xl leading-relaxed">
              Voici un aperçu en temps réel de l'activité de vos annexes. Gérez vos documents, visualisez les statistiques et générez vos QR Codes.
            </p>
          </div>
          
          <div className="flex-shrink-0 flex flex-col sm:flex-row gap-4">
            <Link to="/dashboard/annexes/create" className="btn-primary py-3 px-6 shadow-glow group">
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              Créer une annexe
            </Link>
            <Link to="/dashboard/annexes" className="btn-outline border-white/20 text-white hover:bg-white/10 hover:border-white/30 py-3 px-6">
              Voir tout
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Grid Cards Stats ── */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statCards.map((card, idx) => (
          <motion.div
            key={card.label}
            variants={fadeInUp}
            whileHover={{ y: -5, scale: 1.02 }}
            className="card p-6 relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.color} opacity-5 rounded-bl-full pointer-events-none transition-opacity group-hover:opacity-10`} />
            
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg ${card.shadow} group-hover:scale-110 transition-transform duration-300`}>
                <card.icon className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">
                <TrendingUp className="w-3 h-3" />
                {card.trend}
              </span>
            </div>
            
            <div>
              <h3 className="text-3xl font-black text-secondary-900 dark:text-white tabular-nums tracking-tight mb-1">
                {card.value}
              </h3>
              <p className="text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                {card.label}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── Recent Activity ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card p-0 lg:col-span-2 flex flex-col h-full overflow-hidden"
        >
          <div className="p-6 border-b border-secondary-100 dark:border-secondary-800 flex items-center justify-between bg-secondary-50/50 dark:bg-secondary-900/30">
            <h2 className="text-lg font-extrabold text-secondary-900 dark:text-white flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              </div>
              Activité Récente
            </h2>
            <Link to="/dashboard/annexes" className="btn-ghost btn-sm text-primary-600 dark:text-primary-400 font-semibold group">
              Gérer
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="flex-1 p-6">
            {!stats?.recentAnnexes || stats.recentAnnexes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-secondary-400 text-sm">
                <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-secondary-300 dark:text-secondary-600" />
                </div>
                <p className="font-medium text-secondary-900 dark:text-white mb-1">Aucune activité</p>
                <p>Commencez par ajouter une annexe.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentAnnexes.map((annexe, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (i * 0.1) }}
                    key={annexe._id} 
                    className="group flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center gap-4 min-w-0 pr-4">
                      <div className="w-10 h-10 rounded-xl bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 transition-colors">
                        <FileText className="w-5 h-5 text-secondary-500 dark:text-secondary-400 group-hover:text-primary-500" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-secondary-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {annexe.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-secondary-500 font-medium">
                          <span>{format(new Date(annexe.createdAt), 'dd MMM yyyy', { locale: fr })}</span>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 bg-secondary-100 dark:bg-secondary-700 px-1.5 py-0.5 rounded"><Eye className="w-3 h-3" /> {annexe.views}</span>
                            <span className="flex items-center gap-1 bg-secondary-100 dark:bg-secondary-700 px-1.5 py-0.5 rounded"><Download className="w-3 h-3" /> {annexe.downloads}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {annexe.isActive ? (
                        <span className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Actif
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-secondary-100 text-secondary-600 dark:bg-secondary-800 dark:text-secondary-400 flex items-center gap-1.5 border border-secondary-200 dark:border-secondary-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary-400"></span>
                          Inactif
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Category distribution ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="card p-0 flex flex-col h-full overflow-hidden"
        >
          <div className="p-6 border-b border-secondary-100 dark:border-secondary-800 flex items-center justify-between bg-secondary-50/50 dark:bg-secondary-900/30">
            <h2 className="text-lg font-extrabold text-secondary-900 dark:text-white flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </div>
              Répartition
            </h2>
          </div>

          <div className="flex-1 p-6 space-y-6">
            {!stats?.byCategory || stats.byCategory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-secondary-400 text-sm">
                <Folder className="w-12 h-12 mb-3 opacity-30" />
                Aucune donnée
              </div>
            ) : (
              stats.byCategory.map((item, i) => {
                const pct = Math.round((item.count / totalCount) * 100);
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (i * 0.1) }}
                    key={item._id} 
                    className="space-y-2 group"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-secondary-800 dark:text-secondary-200 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                        {item._id || 'Non classé'}
                      </span>
                      <span className="text-secondary-500 font-semibold bg-secondary-100 dark:bg-secondary-800 px-2 py-0.5 rounded-md">
                        {item.count} <span className="text-xs font-normal opacity-70">({pct}%)</span>
                      </span>
                    </div>
                    
                    <div className="w-full h-2.5 rounded-full bg-secondary-100 dark:bg-secondary-800 overflow-hidden relative">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: 0.5 + (i * 0.1), type: 'spring', bounce: 0.2 }}
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                      />
                    </div>
                    
                    <div className="text-[10px] text-secondary-400 font-semibold uppercase tracking-wider flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0 duration-300">
                      <Eye className="w-3 h-3" /> {item.views} vues accumulées
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
