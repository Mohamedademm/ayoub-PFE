import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Eye, EyeOff, Lock, Mail, FileText, Shield, Sparkles, QrCode } from 'lucide-react';
import heroImg from '../assets/hero.png';

export default function Login() {
  const { t } = useTranslation();
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: FileText, text: 'Gestion complète des annexes PDF' },
    { icon: QrCode, text: 'Génération automatique de QR Codes' },
    { icon: Shield, text: 'Espace sécurisé et dédié' },
  ];

  return (
    <div className="min-h-screen flex">

      {/* ══════════════════════════════
          Left Panel — Illustration
      ══════════════════════════════ */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Dark gradient background */}
        <div className="absolute inset-0 hero-bg" />
        <div className="absolute inset-0 bg-grid opacity-20" />

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary-500/15 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-60 h-60 rounded-full bg-violet-500/15 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent rounded-xl flex items-center justify-center shadow-glow">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-lg tracking-tight">
                PFE <span className="gradient-text">Annexes</span>
              </span>
              <p className="text-[10px] text-secondary-400 font-medium tracking-widest uppercase">Plateforme 2026</p>
            </div>
          </div>

          {/* Center content */}
          <div className="text-center">
            {/* Hero image */}
            <motion.div
              animate={{
                y: [0, -15, 0],
                rotate: [0, 1, 0, -1, 0],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="flex justify-center mb-8"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary-500/20 blur-3xl rounded-full scale-75" />
                <img
                  src={heroImg}
                  alt="PFE Annexes Platform"
                  className="relative z-10 w-64 h-64 object-contain"
                  style={{ filter: 'drop-shadow(0 0 40px rgba(79, 70, 229, 0.5))' }}
                />
              </div>
            </motion.div>

            <h2 className="text-2xl font-extrabold text-white mb-3">
              Espace d'<span className="gradient-text">Administration</span>
            </h2>
            <p className="text-secondary-400 text-sm leading-relaxed max-w-xs mx-auto mb-8">
              Gérez vos annexes, visualisez les statistiques et générez des QR Codes pour votre rapport PFE.
            </p>

            {/* Features */}
            <div className="space-y-3 text-left max-w-xs mx-auto">
              {features.map((feat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.15 }}
                  className="flex items-center gap-3 glass rounded-xl px-4 py-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                    <feat.icon className="w-4 h-4 text-primary-300" />
                  </div>
                  <span className="text-sm text-secondary-300 font-medium">{feat.text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <p className="text-secondary-600 text-xs text-center">
            Projet de Fin d'Études — Accès réservé à l'administrateur
          </p>
        </div>
      </div>

      {/* ══════════════════════════════
          Right Panel — Login Form
      ══════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background dark:bg-secondary-950 relative">
        {/* Background mesh */}
        <div className="absolute inset-0 bg-mesh pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent rounded-xl flex items-center justify-center shadow-glow">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-secondary-900 dark:text-white text-lg">
              PFE <span className="gradient-text">Annexes</span>
            </span>
          </div>

          {/* Card */}
          <div className="card p-8 lg:p-10 shadow-card-hover">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center shadow-glow"
              >
                <Shield className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-2xl font-extrabold text-secondary-900 dark:text-white">
                Espace Administration
              </h1>
              <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
                Connectez-vous pour gérer les annexes
              </p>
            </div>

            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
                      <Lock className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
              {/* Email */}
              <div>
                <label className="label" htmlFor="email">Adresse email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@gmail.com"
                    className="input pl-10"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="label" htmlFor="password">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input pl-10 pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 transition-colors"
                    tabIndex={-1}
                    id="toggle-password"
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={showPassword ? 'hide' : 'show'}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.15 }}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </motion.div>
                    </AnimatePresence>
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.97 }}
                className="btn-primary w-full mt-2 relative overflow-hidden group"
                id="submit-login-btn"
              >
                {/* Shimmer on hover */}
                <span className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Connexion en cours...
                    </motion.div>
                  ) : (
                    <motion.div
                      key="submit"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 relative z-10"
                    >
                      <LogIn className="w-4 h-4" />
                      Se connecter
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </form>

            {/* Info notice */}
            <div className="mt-6 p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/40">
              <p className="text-xs text-primary-700 dark:text-primary-300 text-center font-medium flex items-center justify-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Accès réservé à l'administrateur du projet PFE
              </p>
            </div>
          </div>

          {/* Decorative dots */}
          <div className="flex justify-center gap-2 mt-6">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                className="w-1.5 h-1.5 rounded-full bg-primary-300 dark:bg-primary-700"
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
