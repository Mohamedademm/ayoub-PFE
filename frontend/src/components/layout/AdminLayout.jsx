import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, Plus, LogOut, Sun, Moon,
  Home, ChevronRight, User, Menu, X, ArrowUpRight
} from 'lucide-react';
import { useState, useEffect } from 'react';

const adminLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord', id: 'dash-home' },
  { to: '/dashboard/annexes', icon: FileText, label: 'Gestion des Annexes', id: 'dash-annexes' },
  { to: '/dashboard/annexes/create', icon: Plus, label: 'Nouvelle Annexe', id: 'dash-create' },
];

export default function AdminLayout({ children }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentPathName = adminLinks.find(link => link.to === location.pathname)?.label || 'Administration';

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-secondary-900 border-r border-secondary-100 dark:border-secondary-800">
      {/* Logo */}
      <div className="p-6 border-b border-secondary-100 dark:border-secondary-800">
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent rounded-xl flex items-center justify-center shadow-glow"
          >
            <FileText className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <div className="font-bold text-secondary-900 dark:text-white text-base tracking-tight">PFE <span className="gradient-text">Annexes</span></div>
            <div className="text-[10px] text-secondary-400 font-medium uppercase tracking-widest mt-0.5">Administration</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {adminLinks.map(link => {
          const active = isActive(link.to);
          return (
            <Link
              key={link.to}
              to={link.to}
              id={link.id}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-800/50 hover:text-secondary-900 dark:hover:text-white'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary-500 rounded-r-full"
                />
              )}
              <link.icon className={`w-4.5 h-4.5 flex-shrink-0 transition-colors ${active ? 'text-primary-500' : 'text-secondary-400 group-hover:text-secondary-600 dark:group-hover:text-secondary-300'}`} />
              <span>{link.label}</span>
              {active && <ChevronRight className="w-4 h-4 ml-auto opacity-60" />}
            </Link>
          );
        })}

        <div className="pt-4 border-t border-secondary-100 dark:border-secondary-800 mt-4">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-800/50 transition-all duration-200" id="back-to-site">
            <Home className="w-4.5 h-4.5 text-secondary-400" />
            <span>Voir le site</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-auto opacity-50" />
          </Link>
        </div>
      </nav>

      {/* User Info & Controls */}
      <div className="p-4 border-t border-secondary-100 dark:border-secondary-800 bg-secondary-50/50 dark:bg-secondary-900/50">
        <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-white dark:bg-secondary-800 border border-secondary-100 dark:border-secondary-700 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-400 to-accent flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 pr-2">
            <p className="text-sm font-bold text-secondary-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-secondary-500 dark:text-secondary-400 truncate uppercase tracking-wider">{user?.email}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-all duration-200 text-xs font-semibold"
            id="admin-dark-toggle"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={darkMode ? 'sun' : 'moon'}
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </motion.div>
            </AnimatePresence>
            Thème
          </button>
          
          <button
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-all duration-200 text-xs font-semibold"
            id="admin-logout-btn"
          >
            <LogOut className="w-3.5 h-3.5" />
            Quitter
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 flex relative overflow-hidden">
      {/* Background Mesh */}
      <div className="absolute inset-0 bg-mesh opacity-50 pointer-events-none" />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-secondary-900/60 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -264 }}
              animate={{ x: 0 }}
              exit={{ x: -264 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-64 h-full z-50 shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="lg:ml-64 flex-1 flex flex-col min-h-screen relative z-10">
        
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-secondary-900/80 backdrop-blur-xl border-b border-secondary-200 dark:border-secondary-800 shadow-sm px-4 lg:px-8 py-3 lg:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-secondary-600 hover:bg-secondary-100 dark:text-secondary-400 dark:hover:bg-secondary-800 transition-colors"
              id="mobile-sidebar-btn"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <span className="hidden lg:block text-xs font-semibold text-primary-500 uppercase tracking-wider">Administration</span>
              <h1 className="text-lg font-bold text-secondary-900 dark:text-white leading-tight">
                {currentPathName}
              </h1>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
