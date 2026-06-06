import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, FileText, Plus, LogOut, Sun, Moon,
  Globe, Home, ChevronRight, User, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import Navbar from './Navbar';

const adminLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', id: 'dash-home' },
  { to: '/dashboard/annexes', icon: FileText, label: 'Annexes', id: 'dash-annexes' },
  { to: '/dashboard/annexes/create', icon: Plus, label: 'Nouvelle Annexe', id: 'dash-create' },
];

export default function AdminLayout({ children }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-secondary-100 dark:border-secondary-700">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent rounded-xl flex items-center justify-center shadow-glow">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-secondary-900 dark:text-white text-sm">PFE Annexes</div>
            <div className="text-xs text-secondary-400">Administration</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {adminLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            id={link.id}
            onClick={() => setSidebarOpen(false)}
            className={isActive(link.to) ? 'sidebar-link-active' : 'sidebar-link'}
          >
            <link.icon className="w-4 h-4 flex-shrink-0" />
            <span>{link.label}</span>
            {isActive(link.to) && <ChevronRight className="w-4 h-4 ml-auto opacity-60" />}
          </Link>
        ))}

        <div className="pt-4 border-t border-secondary-100 dark:border-secondary-700 mt-4">
          <Link to="/" className="sidebar-link" id="back-to-site">
            <Home className="w-4 h-4" />
            <span>Voir le site</span>
          </Link>
        </div>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-secondary-100 dark:border-secondary-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-secondary-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-secondary-400 truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleDarkMode} className="btn-ghost btn-sm flex-1 rounded-lg" id="admin-dark-toggle">
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={handleLogout} className="btn-ghost btn-sm flex-1 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" id="admin-logout-btn">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 bg-white dark:bg-secondary-800 border-r border-secondary-100 dark:border-secondary-700 z-30 shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <motion.aside
            initial={{ x: -264 }}
            animate={{ x: 0 }}
            exit={{ x: -264 }}
            className="relative w-64 bg-white dark:bg-secondary-800 flex flex-col z-50 shadow-xl"
          >
            <SidebarContent />
          </motion.aside>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:ml-64 flex-1 flex flex-col min-h-screen">
        {/* Top Bar (mobile) */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-secondary-800 border-b border-secondary-100 dark:border-secondary-700 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="btn-ghost btn-sm" id="mobile-sidebar-btn">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-secondary-900 dark:text-white text-sm">Administration</span>
          <button onClick={handleLogout} className="btn-ghost btn-sm text-red-500">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
