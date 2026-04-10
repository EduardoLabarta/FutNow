import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AdminRoute = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>Verificando autorizaciones de seguridad...</div>;
  }

  // Not authenticated or not an admin
  if (!user || !profile || profile.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
