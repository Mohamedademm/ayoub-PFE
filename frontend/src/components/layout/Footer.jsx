import { Link } from 'react-router-dom';
import { FileText, Github, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary-900 dark:bg-secondary-950 text-secondary-400 border-t border-secondary-800">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">PFE Annexes</span>
            </Link>
            <p className="text-sm leading-relaxed">
              Plateforme de consultation des annexes du rapport PFE via QR Code.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Accueil</Link></li>
              <li><Link to="/annexes" className="hover:text-white transition-colors">Annexes</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Administration</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">Projet PFE</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                React.js + Node.js
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                MongoDB + Express
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                QR Code Integration
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-secondary-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">
            © {currentYear} PFE Annexes. Tous droits réservés.
          </p>
          <p className="text-sm flex items-center gap-1.5">
            Fait avec <Heart className="w-3.5 h-3.5 text-red-400" /> pour mon PFE
          </p>
        </div>
      </div>
    </footer>
  );
}
