import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import AdminDashboard from './pages/AdminDashboard';

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <>
      <Navbar />
      <main>
        <Routes>
          {/* Public auth routes */}
          <Route
            path="/login"
            element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/events'} replace /> : <LoginPage />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/events'} replace /> : <RegisterPage />}
          />

          {/* Protected — any user */}
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <EventsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:id"
            element={
              <ProtectedRoute>
                <EventDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Admin only */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/events" replace />} />
          <Route path="*" element={<Navigate to="/events" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
