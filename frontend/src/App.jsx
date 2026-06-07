import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';

// Public Pages
import Home from './pages/Home';
import AnnexesList from './pages/AnnexesList';
import AnnexeDetail from './pages/AnnexeDetail';
import Login from './pages/Login';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import AnnexesManage from './pages/admin/AnnexesManage';
import AnnexeForm from './pages/admin/AnnexeForm';

// Protect Admin Routes
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-900">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/annexes" element={<PublicLayout><AnnexesList /></PublicLayout>} />
            <Route path="/annexes/:slug" element={<PublicLayout><AnnexeDetail /></PublicLayout>} />
            <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />

            {/* Admin Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AdminLayout><Dashboard /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/annexes" element={
              <ProtectedRoute>
                <AdminLayout><AnnexesManage /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/annexes/create" element={
              <ProtectedRoute>
                <AdminLayout><AnnexeForm /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/annexes/edit/:id" element={
              <ProtectedRoute>
                <AdminLayout><AnnexeForm /></AdminLayout>
              </ProtectedRoute>
            } />

            {/* Catch All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
