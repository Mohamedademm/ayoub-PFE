import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Plus, Edit2, Trash2, QrCode, Eye, Download,
  Check, X, AlertTriangle, Printer, ExternalLink, ChevronLeft, ChevronRight,
  FileText, ArrowUpRight
} from 'lucide-react';
import { useAdminAnnexes } from '../../hooks/useAnnexes';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const CATEGORIES = [
  'Documentation',
  'Code Source',
  'Schémas',
  "Captures d'écran",
  'Vidéos',
  'Rapports',
  'Données',
  'Autre',
];

export default function AnnexesManage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);

  const [queryParams, setQueryParams] = useState({
    search: '',
    category: 'all',
    page: 1,
    limit: 10
  });

  useEffect(() => {
    setQueryParams({ search, category, page, limit: 10 });
  }, [search, category, page]);

  const { annexes, pagination, loading, error, refetch } = useAdminAnnexes(queryParams);

  const [selectedQR, setSelectedQR] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const handleToggleActive = async (id) => {
    setTogglingId(id);
    try {
      const res = await api.patch(`/admin/annexes/${id}/toggle`);
      if (res.data.success) {
        toast.success("Statut mis à jour");
        refetch();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur de mise à jour");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const loadId = toast.loading("Suppression en cours...");
    try {
      const res = await api.delete(`/admin/annexes/${deleteConfirm}`);
      if (res.data.success) {
        toast.success("Annexe supprimée avec succès", { id: loadId });
        setDeleteConfirm(null);
        refetch();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la suppression", { id: loadId });
    }
  };

  const handlePrintQR = (qrUrl, title) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimer QR Code - ${title}</title>
          <style>
            body { display: flex; flex-direction: column; items: center; justify-content: center; height: 100vh; margin: 0; font-family: -apple-system, sans-serif; text-align: center; }
            .container { border: 2px dashed #CBD5E1; padding: 40px; border-radius: 24px; max-width: 400px; margin: auto; }
            img { width: 260px; height: 260px; margin-bottom: 20px; }
            h1 { font-size: 20px; margin: 0 0 10px 0; font-weight: 700; }
            p { font-size: 14px; color: #64748B; margin: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="${qrUrl}" alt="QR Code" />
            <h1>${title}</h1>
            <p>Scannez pour accéder à l'annexe</p>
          </div>
          <script>window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 500); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-secondary-800 p-6 rounded-2xl border border-secondary-100 dark:border-secondary-700 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-bl-full pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5" />
            Base de données
          </div>
          <h1 className="text-2xl font-extrabold text-secondary-900 dark:text-white">
            Gestion des <span className="gradient-text">Annexes</span>
          </h1>
          <p className="text-sm text-secondary-500 mt-1 max-w-lg">
            Gérez la visibilité des fichiers, modifiez les détails et téléchargez les QR codes associés à chaque document.
          </p>
        </div>
        <Link to="/dashboard/annexes/create" className="btn-primary shadow-glow shrink-0 relative z-10">
          <Plus className="w-5 h-5" />
          <span className="hidden sm:block">Nouvelle Annexe</span>
        </Link>
      </div>

      {/* ── Filters ── */}
      <div className="card p-2 flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute inset-y-0 left-4 my-auto text-secondary-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher par titre, description..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-transparent border-none focus:ring-0 pl-11 pr-4 py-3 text-sm text-secondary-900 dark:text-white placeholder-secondary-400 outline-none"
          />
        </div>
        <div className="h-px md:h-10 md:w-px bg-secondary-100 dark:bg-secondary-800" />
        <div className="flex items-center px-2">
          <Filter className="text-secondary-400 w-4 h-4 ml-2 mr-3 shrink-0" />
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="w-full md:w-48 bg-transparent border-none focus:ring-0 py-3 text-sm text-secondary-900 dark:text-white font-medium outline-none cursor-pointer"
          >
            <option value="all">Toutes les catégories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Table View ── */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-4 border-secondary-200 dark:border-secondary-700 border-t-primary-500 rounded-full animate-spin" />
            <p className="text-sm font-medium text-secondary-500">Chargement des données...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center bg-red-50 dark:bg-red-900/10">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-red-600 dark:text-red-400 font-bold">{error}</p>
          </div>
        ) : !annexes || annexes.length === 0 ? (
          <div className="py-24 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-800 rounded-2xl flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-secondary-400" />
            </div>
            <p className="text-lg font-bold text-secondary-900 dark:text-white">Aucun résultat</p>
            <p className="text-sm text-secondary-500 mt-1 max-w-sm">
              Aucune annexe ne correspond à vos critères de recherche.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-secondary-50/50 dark:bg-secondary-900/30 border-b border-secondary-100 dark:border-secondary-800">
                  <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Document</th>
                  <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Catégorie</th>
                  <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider text-center">Performances</th>
                  <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider text-center">Statut</th>
                  <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800 text-sm">
                {annexes.map((annexe) => (
                  <tr 
                    key={annexe._id}
                    className="hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
                          <FileText className="w-5 h-5 text-secondary-500 dark:text-secondary-400 group-hover:text-primary-500 transition-colors" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-secondary-900 dark:text-white truncate max-w-[200px] lg:max-w-[300px]">
                            {annexe.title}
                          </span>
                          <span className="text-xs text-secondary-400 font-medium truncate mt-0.5">
                            {format(new Date(annexe.createdAt), 'dd MMM yyyy', { locale: fr })}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-300">
                        {annexe.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-4">
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-secondary-900 dark:text-white">{annexe.views}</span>
                          <span className="text-[10px] text-secondary-400 font-medium uppercase">Vues</span>
                        </div>
                        <div className="w-px h-6 bg-secondary-200 dark:bg-secondary-700" />
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-secondary-900 dark:text-white">{annexe.downloads}</span>
                          <span className="text-[10px] text-secondary-400 font-medium uppercase">Dl</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleActive(annexe._id)}
                        disabled={togglingId === annexe._id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                          annexe.isActive
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                            : 'bg-secondary-50 text-secondary-500 border-secondary-200 hover:bg-secondary-100 dark:bg-secondary-800/50 dark:text-secondary-400 dark:border-secondary-700'
                        }`}
                      >
                        {togglingId === annexe._id ? (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                        ) : annexe.isActive ? (
                          <><Check className="w-3.5 h-3.5" /> En Ligne</>
                        ) : (
                          <><X className="w-3.5 h-3.5" /> Masqué</>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setSelectedQR(annexe)}
                          className="p-2 rounded-lg text-secondary-400 hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-violet-900/20 dark:hover:text-violet-400 transition-colors"
                          title="Gérer le QR Code"
                        >
                          <QrCode className="w-4.5 h-4.5" />
                        </button>
                        <a
                          href={annexe.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg text-secondary-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors"
                          title="Aperçu du fichier"
                        >
                          <ExternalLink className="w-4.5 h-4.5" />
                        </a>
                        <Link
                          to={`/dashboard/annexes/edit/${annexe._id}`}
                          className="p-2 rounded-lg text-secondary-400 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/20 dark:hover:text-primary-400 transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-4.5 h-4.5" />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(annexe._id)}
                          className="p-2 rounded-lg text-secondary-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {!loading && pagination && pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-secondary-100 dark:border-secondary-800 bg-secondary-50/50 dark:bg-secondary-900/30 flex items-center justify-between">
            <span className="text-xs font-bold text-secondary-500 uppercase tracking-wider">
              Affichage page {pagination.page} sur {pagination.pages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="btn-outline btn-sm h-8 w-8 p-0 rounded-lg disabled:opacity-30 flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(prev => Math.min(prev + 1, pagination.pages))}
                disabled={page === pagination.pages}
                className="btn-outline btn-sm h-8 w-8 p-0 rounded-lg disabled:opacity-30 flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── QR Code Modal ── */}
      <AnimatePresence>
        {selectedQR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="card w-full max-w-sm p-0 overflow-hidden relative shadow-2xl"
            >
              <div className="h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
              
              <div className="p-6">
                <button 
                  onClick={() => setSelectedQR(null)} 
                  className="absolute top-4 right-4 p-1.5 rounded-lg text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-6 mt-2">
                  <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-3">
                    <QrCode className="w-6 h-6 text-violet-500" />
                  </div>
                  <h3 className="text-lg font-extrabold text-secondary-900 dark:text-white truncate px-6">
                    {selectedQR.title}
                  </h3>
                  <p className="text-[10px] text-secondary-500 font-bold uppercase tracking-widest mt-1">Générateur QR</p>
                </div>

                <div className="w-48 h-48 mx-auto border-2 border-dashed border-secondary-200 dark:border-secondary-700 rounded-2xl p-3 bg-white mb-6 relative group">
                  <img src={selectedQR.qrCodeUrl} alt="QR Code" className="w-full h-full object-contain relative z-10" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={selectedQR.qrCodeUrl}
                    download={`QR-${selectedQR.slug}.png`}
                    className="btn-primary w-full shadow-glow"
                  >
                    <Download className="w-4 h-4" />
                    Enregistrer
                  </a>
                  <button
                    onClick={() => handlePrintQR(selectedQR.qrCodeUrl, selectedQR.title)}
                    className="btn-outline w-full bg-white dark:bg-secondary-800"
                  >
                    <Printer className="w-4 h-4" />
                    Imprimer
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Delete Modal ── */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="card w-full max-w-sm p-0 overflow-hidden relative shadow-2xl"
            >
              <div className="h-1 bg-red-500" />
              
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full mx-auto flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8" />
                </div>

                <h3 className="text-xl font-extrabold text-secondary-900 dark:text-white mb-2">
                  Supprimer l'annexe ?
                </h3>
                <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-8 leading-relaxed">
                  Cette action est définitive. Le fichier PDF et son QR code seront supprimés de façon permanente du serveur.
                </p>

                <div className="flex gap-3">
                  <button onClick={() => setDeleteConfirm(null)} className="btn-outline flex-1">
                    Annuler
                  </button>
                  <button onClick={handleDelete} className="btn-danger flex-1 shadow-glow-danger font-bold">
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
