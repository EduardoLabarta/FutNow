import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export const AdminRoute = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="loading-state">Verificando autorizaciones de seguridad...</div>;
  }

  // Not authenticated or not an admin
  if (!user || !profile || profile.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
