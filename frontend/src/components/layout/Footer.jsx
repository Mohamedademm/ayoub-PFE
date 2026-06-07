import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Heart, QrCode, BookOpen, Shield, Layers, ArrowUpRight } from 'lucide-react';

const techStack = [
  { name: 'React.js', color: '#61dafb', dot: '⚛️' },
  { name: 'Node.js', color: '#68a063', dot: '🟢' },
  { name: 'MongoDB', color: '#4faa41', dot: '🍃' },
  { name: 'TailwindCSS', color: '#38bdf8', dot: '💨' },
];

const navLinks = [
  { to: '/', label: 'Accueil', icon: Layers },
  { to: '/annexes', label: 'Annexes', icon: BookOpen },
  { to: '/login', label: 'Administration', icon: Shield },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-secondary-950 text-secondary-400">
      {/* Top gradient border */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary-500/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-violet-500/5 blur-3xl" />
        <div className="absolute inset-0 bg-dots opacity-30" />
      </div>

      <div className="page-container py-14 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-5 group w-fit">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent rounded-xl flex items-center justify-center shadow-glow"
              >
                <FileText className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <span className="font-bold text-white text-lg tracking-tight">
                  PFE <span className="gradient-text">Annexes</span>
                </span>
                <p className="text-[10px] text-secondary-500 font-medium tracking-widest uppercase">Plateforme 2026</p>
              </div>
            </Link>

            <p className="text-sm text-secondary-400 leading-relaxed max-w-sm mb-6">
              Plateforme moderne de consultation des annexes du rapport de Projet de Fin d'Études.
              Accédez à tous les documents via QR Code intégré dans le rapport imprimé.
            </p>

            {/* Tech stack badges */}
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span
                  key={tech.name}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-800/60 border border-secondary-700/50 text-xs font-medium text-secondary-300"
                >
                  <span>{tech.dot}</span>
                  {tech.name}
                </span>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-white mb-5 text-sm uppercase tracking-widest">Navigation</h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="group flex items-center gap-2 text-sm text-secondary-400 hover:text-white transition-all duration-200"
                  >
                    <link.icon className="w-3.5 h-3.5 text-secondary-600 group-hover:text-primary-400 transition-colors" />
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-semibold text-white mb-5 text-sm uppercase tracking-widest">Fonctionnalités</h3>
            <ul className="space-y-3 text-sm">
              {[
                { icon: '📄', text: 'Visionneuse PDF intégrée' },
                { icon: '📱', text: 'QR Codes dynamiques' },
                { icon: '🔍', text: 'Recherche avancée' },
                { icon: '🌙', text: 'Mode sombre/clair' },
                { icon: '🌍', text: 'Multi-langue (FR/EN/AR)' },
              ].map((feat) => (
                <li key={feat.text} className="flex items-center gap-2.5 text-secondary-400">
                  <span className="text-base flex-shrink-0">{feat.icon}</span>
                  <span className="text-xs">{feat.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-secondary-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-secondary-500">
            © {currentYear} <span className="text-secondary-400 font-medium">PFE Annexes</span>. Tous droits réservés.
          </p>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs text-secondary-500 flex items-center gap-1.5"
          >
            Réalisé avec
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
            >
              <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
            </motion.span>
            pour mon Projet de Fin d'Études
          </motion.p>
        </div>
      </div>
    </footer>
  );
}
