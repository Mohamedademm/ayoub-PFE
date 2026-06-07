import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Save, Upload, FileText, X, AlertCircle,
  CheckCircle2, Eye, Tag, Hash, ToggleLeft, ToggleRight,
  CloudUpload, File
} from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'Documentation', icon: '📄', color: '#3b82f6' },
  { value: 'Code Source', icon: '💻', color: '#8b5cf6' },
  { value: 'Schémas', icon: '📐', color: '#06b6d4' },
  { value: "Captures d'écran", icon: '🖼️', color: '#f59e0b' },
  { value: 'Vidéos', icon: '🎬', color: '#ef4444' },
  { value: 'Rapports', icon: '📊', color: '#10b981' },
  { value: 'Données', icon: '🗃️', color: '#f97316' },
  { value: 'Autre', icon: '📎', color: '#6b7280' },
];

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export default function AnnexeForm() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].value);
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [tagsInput, setTagsInput] = useState('');
  const [file, setFile] = useState(null);
  const [existingFileUrl, setExistingFileUrl] = useState('');
  const [existingFileName, setExistingFileName] = useState('');

  // Fetch Annexe data if in edit mode
  useEffect(() => {
    if (!id) return;
    const fetchAnnexe = async () => {
      try {
        const res = await api.get(`/admin/annexes/${id}`);
        const data = res.data.data;
        setTitle(data.title);
        setDescription(data.description || '');
        setCategory(data.category);
        setOrder(data.order || 0);
        setIsActive(data.isActive);
        setTagsInput(data.tags ? data.tags.join(', ') : '');
        setExistingFileUrl(data.fileUrl);
        setExistingFileName(data.fileOriginalName || 'Fichier existant.pdf');
      } catch (err) {
        setError(err.response?.data?.message || "Erreur lors du chargement de l'annexe");
        toast.error('Impossible de charger les données');
      } finally {
        setFetching(false);
      }
    };
    fetchAnnexe();
  }, [id]);

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;
    if (selectedFile.type !== 'application/pdf') {
      toast.error('❌ Seuls les fichiers PDF sont acceptés.');
      return false;
    }
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error('❌ Le fichier ne doit pas dépasser 50 Mo.');
      return false;
    }
    return true;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      toast.success(`✅ "${selectedFile.name}" sélectionné`);
    }
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Drag & Drop handlers
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only leave if we actually left the drop zone
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (validateFile(droppedFile)) {
      setFile(droppedFile);
      toast.success(`✅ "${droppedFile.name}" déposé avec succès`);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Le titre est obligatoire.');
      return;
    }
    if (!isEdit && !file) {
      setError('Veuillez sélectionner un fichier PDF.');
      return;
    }

    const loadToastId = toast.loading(isEdit ? '⏳ Modification en cours...' : '⏳ Création en cours...');
    setLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('order', order);
      formData.append('isActive', isActive);

      const tagsArray = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t !== '');
      formData.append('tags', JSON.stringify(tagsArray));

      if (file) formData.append('file', file);

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
      };

      let res;
      if (isEdit) {
        res = await api.put(`/admin/annexes/${id}`, formData, config);
      } else {
        res = await api.post('/admin/annexes', formData, config);
      }

      if (res.data.success) {
        toast.success(
          isEdit ? '✅ Annexe modifiée avec succès !' : '✅ Annexe créée avec succès !',
          { id: loadToastId }
        );
        navigate('/dashboard/annexes');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || "Une erreur est survenue lors de l'enregistrement.";
      setError(errMsg);
      toast.error('❌ ' + errMsg, { id: loadToastId });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="spinner w-12 h-12 mx-auto"></div>
          <p className="text-secondary-500 dark:text-secondary-400 text-sm">Chargement des données...</p>
        </div>
      </div>
    );
  }

  const selectedCategory = CATEGORIES.find((c) => c.value === category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/dashboard/annexes"
          className="flex items-center gap-2 text-sm text-secondary-500 hover:text-secondary-900 dark:hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour
        </Link>
        <div className="h-5 w-px bg-secondary-200 dark:bg-secondary-700"></div>
        <h1 className="text-xl font-bold text-secondary-900 dark:text-white">
          {isEdit ? '✏️ Modifier l\'Annexe' : '➕ Nouvelle Annexe'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              <button type="button" onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main info card */}
        <div className="card p-6 space-y-5">
          <h2 className="text-sm font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider border-b border-secondary-100 dark:border-secondary-800 pb-3">
            📝 Informations générales
          </h2>

          {/* Title */}
          <div>
            <label className="label" htmlFor="title">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Annexe A — Diagramme UML du système"
              className="input w-full"
            />
          </div>

          {/* Category */}
          <div>
            <label className="label" htmlFor="category">
              Catégorie <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-xs font-semibold transition-all duration-200 ${
                    category === cat.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'border-secondary-200 dark:border-secondary-700 hover:border-secondary-400 dark:hover:border-secondary-500 text-secondary-600 dark:text-secondary-400 bg-white dark:bg-secondary-800/50'
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-center leading-tight">{cat.value}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez le contenu de cette annexe..."
              className="input w-full resize-none py-3"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="label" htmlFor="tags">
              <Tag className="w-3.5 h-3.5 inline mr-1" />
              Tags <span className="text-xs text-secondary-400 font-normal">(séparés par des virgules)</span>
            </label>
            <input
              id="tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Ex: UML, architecture, backend, API"
              className="input w-full"
            />
            {tagsInput && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tagsInput.split(',').filter(t => t.trim()).map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium">
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Settings card */}
        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider border-b border-secondary-100 dark:border-secondary-800 pb-3">
            ⚙️ Paramètres
          </h2>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <label className="label" htmlFor="order">
                <Hash className="w-3.5 h-3.5 inline mr-1" />
                Ordre d'affichage
              </label>
              <input
                id="order"
                type="number"
                min="0"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                className="input w-full"
              />
              <p className="text-xs text-secondary-400 mt-1">Les annexes sont triées par ordre croissant</p>
            </div>

            <div className="flex-1 flex items-center gap-3 pt-6">
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
                  isActive ? 'bg-primary-500' : 'bg-secondary-300 dark:bg-secondary-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                    isActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <div>
                <label
                  htmlFor="isActive"
                  className="text-sm font-semibold text-secondary-900 dark:text-secondary-200 cursor-pointer"
                  onClick={() => setIsActive(!isActive)}
                >
                  {isActive ? '✅ Annexe active' : '⏸️ Annexe désactivée'}
                </label>
                <p className="text-xs text-secondary-400">
                  {isActive ? 'Visible par le public via QR Code' : 'Masquée, non accessible via QR Code'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* File Upload card */}
        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider border-b border-secondary-100 dark:border-secondary-800 pb-3">
            📎 Fichier PDF {!isEdit && <span className="text-red-500">*</span>}
          </h2>

          {/* Existing file info for edit mode */}
          {isEdit && !file && existingFileUrl && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">{existingFileName}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Fichier actuel — laissez vide pour conserver</p>
                </div>
              </div>
              <a
                href={existingFileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-blue-700 dark:text-blue-300 font-bold hover:underline flex-shrink-0"
              >
                <Eye className="w-3.5 h-3.5" />
                Voir
              </a>
            </div>
          )}

          {/* Drop Zone */}
          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all duration-200 select-none ${
                  isDragOver
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-[1.01]'
                    : 'border-secondary-300 dark:border-secondary-600 hover:border-primary-400 dark:hover:border-primary-500 bg-secondary-50 dark:bg-secondary-800/30 hover:bg-white dark:hover:bg-secondary-800/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <AnimatePresence>
                  {isDragOver ? (
                    <motion.div
                      key="drag"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <CloudUpload className="w-14 h-14 text-primary-500" />
                      <p className="text-primary-600 dark:text-primary-400 font-bold text-lg">Déposez le PDF ici !</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-primary-500" />
                      </div>
                      <div className="text-center">
                        <p className="text-secondary-900 dark:text-white font-semibold text-base">
                          {isEdit ? 'Remplacer le fichier PDF' : 'Sélectionner ou glisser un PDF'}
                        </p>
                        <p className="text-secondary-400 dark:text-secondary-500 text-sm mt-1">
                          Glissez-déposez un fichier PDF ici, ou <span className="text-primary-600 dark:text-primary-400 font-semibold">cliquez pour parcourir</span>
                        </p>
                        <p className="text-secondary-400 text-xs mt-2">PDF uniquement • Max 50 MB</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="file-selected"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                      <File className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-secondary-900 dark:text-white truncate">{file.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-secondary-400">{formatFileSize(file.size)}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">Prêt à l'envoi</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-secondary-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Supprimer le fichier"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Upload progress bar (visible during submit) */}
                {loading && uploadProgress > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-secondary-500 mb-1">
                      <span>Envoi en cours...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-1.5 bg-secondary-200 dark:bg-secondary-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard/annexes')}
            disabled={loading}
            className="btn-outline flex-1 rounded-xl"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 rounded-xl flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {uploadProgress > 0 ? `Envoi ${uploadProgress}%` : 'Enregistrement...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEdit ? 'Mettre à jour' : 'Créer l\'annexe'}
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
