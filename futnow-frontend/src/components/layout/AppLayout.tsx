import { Outlet, useNavigate, NavLink, Link } from 'react-router-dom';
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
        <Link to="/" className="header-brand" style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '24px', height: '24px', backgroundColor: 'var(--primary)', borderRadius: '4px' }}></div>
          FutNow
        </Link>
        
        {user && profile && (
          <nav className="header-nav">
            <NavLink to="/">Inicio</NavLink>
            <NavLink to="/my-matches">Mis Partidos</NavLink>
            <NavLink to="/profile">Perfil</NavLink>
            {profile.role === 'ADMIN' && (
              <NavLink to="/admin" style={{ color: 'var(--warning)', fontWeight: 600 }}>Admin</NavLink>
            )}
            <button 
              onClick={() => void handleSignOut()}
              className="btn btn-secondary" style={{ marginLeft: '12px', padding: '6px 12px', fontSize: '13px' }}
            >
              Salir
            </button>
          </nav>
        )}
      </header>

      <main style={{ flex: 1, padding: '40px 24px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <Outlet />
      </main>

      <footer style={{ textAlign: 'center', padding: '32px 24px', color: 'var(--text-light)', fontSize: '13px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)' }}>
        &copy; {new Date().getFullYear()} FutNow MVP - Entorno Corporativo
      </footer>
    </div>
  );
};
