import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Download, Share2, Eye, Calendar, Tag,
  AlertTriangle, Check, Copy, QrCode, FileText, ArrowRight
} from 'lucide-react';
import { useAnnexeBySlug } from '../hooks/useAnnexes';
import { format } from 'date-fns';
import { fr, enUS, arSA } from 'date-fns/locale';
import { useTheme } from '../contexts/ThemeContext';
import api from '../lib/api';

// React PDF Viewer
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

export default function AnnexeDetail() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const { language } = useTheme();
  const { annexe, loading, error } = useAnnexeBySlug(slug);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const getLocale = () => {
    switch (language) {
      case 'fr': return fr;
      case 'en': return enUS;
      case 'ar': return arSA;
      default: return fr;
    }
  };

  const handleDownload = async () => {
    if (!annexe || downloading) return;
    
    setDownloading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}${annexe.fileUrl}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = annexe.fileOriginalName || `annexe-${annexe.slug}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      api.post(`/annexes/${annexe.slug}/download`).catch(console.error);
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setTimeout(() => setDownloading(false), 1000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: annexe.title,
          text: annexe.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share error:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-t-2 border-primary-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-r-2 border-violet-500 animate-spin-slow"></div>
            <div className="absolute inset-4 rounded-full border-b-2 border-emerald-500 animate-spin"></div>
          </div>
          <p className="text-secondary-500 font-medium animate-pulse">Chargement du document...</p>
        </div>
      </div>
    );
  }

  if (error || !annexe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-950 page-container">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-8 max-w-md w-full text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-secondary-900 dark:text-white mb-2">
            Annexe introuvable
          </h2>
          <p className="text-secondary-500 dark:text-secondary-400 mb-8 leading-relaxed">
            Le document que vous recherchez n'existe pas ou a été déplacé. Veuillez vérifier le lien ou retourner à la liste des annexes.
          </p>
          <Link to="/annexes" className="btn-primary w-full">
            <ArrowLeft className="w-4 h-4" />
            Retour aux annexes
          </Link>
        </motion.div>
      </div>
    );
  }

  const isPdf = annexe.fileType === 'application/pdf' || annexe.fileUrl.endsWith('.pdf');
  const fileUrl = `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : ''}${annexe.fileUrl}`;

  return (
    <div className="min-h-screen bg-mesh dark:bg-mesh relative">
      <div className="page-container py-8 max-w-7xl">

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            to="/annexes"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 text-sm font-semibold text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-300 transition-all duration-200 shadow-sm hover:shadow-md group"
          >
            <ArrowLeft className="w-4 h-4 rtl-flip group-hover:-translate-x-1 transition-transform" />
            Retour aux annexes
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content: Document Viewer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-8 space-y-6"
          >
            <div className="card overflow-hidden shadow-2xl flex flex-col h-[calc(100vh-140px)] min-h-[700px]">
              
              {/* Viewer Header */}
              <div className="px-5 py-4 border-b border-secondary-100 dark:border-secondary-700 bg-secondary-50/80 dark:bg-secondary-900/80 flex justify-between items-center backdrop-blur-md">
                <div className="flex items-center gap-3 overflow-hidden pr-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-bold text-secondary-900 dark:text-white truncate text-sm">
                      {annexe.fileOriginalName || annexe.title}
                    </h2>
                    <p className="text-[10px] text-secondary-500 font-medium uppercase tracking-wider mt-0.5">
                      Visualisation
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={handleShare} className="btn-outline btn-sm h-10 w-10 p-0 rounded-lg" title="Partager">
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="btn-primary btn-sm h-10 rounded-lg group"
                  >
                    {downloading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                    )}
                    <span className="hidden sm:inline ml-1 font-semibold text-xs">Télécharger</span>
                  </button>
                </div>
              </div>
              
              {/* Viewer Body */}
              <div className="flex-1 bg-secondary-200/50 dark:bg-secondary-950/80 relative overflow-hidden flex items-center justify-center">
                {/* Decorative background logo */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 dark:opacity-[0.02]">
                  <FileText className="w-96 h-96" />
                </div>

                {isPdf ? (
                  <div className="absolute inset-0 pdf-viewer-container">
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                      <Viewer
                        fileUrl={fileUrl}
                        plugins={[defaultLayoutPluginInstance]}
                        theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                      />
                    </Worker>
                  </div>
                ) : (
                  <img 
                    src={fileUrl} 
                    alt={annexe.title} 
                    className="max-w-full max-h-full object-contain p-4 relative z-10 drop-shadow-xl"
                  />
                )}
              </div>
            </div>
          </motion.div>

          {/* Sidebar: Details & Metadata */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-4 space-y-6"
          >
            <div className="card p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-bl-full pointer-events-none" />
              
              <span className="badge-primary mb-4">{annexe.category}</span>
              <h1 className="text-2xl font-extrabold text-secondary-900 dark:text-white mb-4 leading-tight">
                {annexe.title}
              </h1>
              
              {annexe.description && (
                <div className="p-4 rounded-xl bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-100 dark:border-secondary-700 mb-6">
                  <p className="text-secondary-600 dark:text-secondary-300 text-sm leading-relaxed">
                    {annexe.description}
                  </p>
                </div>
              )}

              {/* Stats & Meta */}
              <div className="space-y-4">
                <div className="flex items-center p-3 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-800/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center mr-3">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-secondary-500 font-semibold mb-0.5">Date d'ajout</p>
                    <p className="text-sm font-bold text-secondary-900 dark:text-white">
                      {format(new Date(annexe.createdAt), 'dd MMMM yyyy', { locale: getLocale() })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-800/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-violet-50 dark:bg-violet-900/20 text-violet-500 flex items-center justify-center mr-3">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-secondary-500 font-semibold mb-0.5">Consultations</p>
                    <p className="text-sm font-bold text-secondary-900 dark:text-white">{annexe.views}</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-800/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center mr-3">
                    <Download className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-secondary-500 font-semibold mb-0.5">Téléchargements</p>
                    <p className="text-sm font-bold text-secondary-900 dark:text-white">{annexe.downloads}</p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {annexe.tags && annexe.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t border-secondary-100 dark:border-secondary-800">
                  <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-3">Mots-clés</p>
                  <div className="flex flex-wrap gap-2">
                    {annexe.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 text-xs font-medium hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors">
                        <Tag className="w-3 h-3 text-secondary-400" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* QR Code Card Premium */}
            {annexe.qrCodeUrl && (
              <div className="card overflow-hidden group">
                <div className="h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                <div className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-violet-50 dark:bg-violet-900/20 mx-auto mb-3 flex items-center justify-center">
                    <QrCode className="w-6 h-6 text-violet-500" />
                  </div>
                  <h3 className="font-extrabold text-secondary-900 dark:text-white text-lg mb-1">
                    QR Code de l'Annexe
                  </h3>
                  <p className="text-xs text-secondary-500 mb-6 px-4 leading-relaxed">
                    Scannez ce code pour accéder directement à ce document depuis un appareil mobile.
                  </p>
                  
                  <div className="relative mx-auto w-48 h-48 p-3 rounded-2xl border-2 border-dashed border-secondary-200 dark:border-secondary-700 bg-white mb-6 group-hover:border-violet-400 dark:group-hover:border-violet-500 transition-colors">
                    <img 
                      src={annexe.qrCodeUrl} 
                      alt={`QR Code for ${annexe.title}`} 
                      className="w-full h-full object-contain"
                    />
                    {/* Corner accents */}
                    <div className="absolute top-[-2px] left-[-2px] w-4 h-4 border-t-2 border-l-2 border-violet-500 rounded-tl-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-[-2px] right-[-2px] w-4 h-4 border-t-2 border-r-2 border-violet-500 rounded-tr-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-[-2px] left-[-2px] w-4 h-4 border-b-2 border-l-2 border-violet-500 rounded-bl-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-[-2px] right-[-2px] w-4 h-4 border-b-2 border-r-2 border-violet-500 rounded-br-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <a 
                    href={annexe.qrCodeUrl} 
                    download={`QR-${annexe.slug}.png`}
                    className="btn-outline w-full flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger le QR Code
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
