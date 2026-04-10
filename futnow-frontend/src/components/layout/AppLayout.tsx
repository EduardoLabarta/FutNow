import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const AppLayout = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="header-layout">
        <div style={{ fontSize: '22px', fontWeight: 'bold' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>⚽ FutNow</Link>
        </div>
        
        {user && profile && (
          <nav className="header-nav">
            <Link to="/">Inicio</Link>
            <Link to="/my-matches">Mis Partidos</Link>
            <Link to="/profile">Perfil</Link>
            {profile.role === 'ADMIN' && (
              <Link to="/admin" style={{ color: '#ffc107' }}>Admin</Link>
            )}
            <button 
              onClick={() => void handleSignOut()}
              className="btn btn-danger" style={{ marginLeft: '10px', fontSize: '13px' }}
            >
              Salir
            </button>
          </nav>
        )}
      </header>

      <main style={{ flex: 1, padding: '30px 20px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <Outlet />
      </main>

      <footer style={{ textAlign: 'center', padding: '20px', color: 'var(--secondary)', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)' }}>
        &copy; {new Date().getFullYear()} FutNow MVP - Entorno TFG Consolidado
      </footer>
    </div>
  );
};
