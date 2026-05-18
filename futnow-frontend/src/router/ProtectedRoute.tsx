import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export const ProtectedRoute = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return <div className="loading-state">Cargando sistema de seguridad...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
