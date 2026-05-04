import { useEffect, useState } from 'react';
import { Outlet, useNavigate, NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';
import logo from '../../assets/logo.png';

export const AppLayout = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      notificationService.getUnreadCount().then(({ count }) => {
        if (count !== null) setUnreadCount(count);
      });
    }
  }, [user, location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="header-layout">
        <Link to="/" className="header-brand" style={{ display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt="FutNow" style={{ height: '80px', width: 'auto' }} />
        </Link>
        
        {user && profile && (
          <nav className="header-nav">
            <NavLink to="/">Inicio</NavLink>
            <NavLink to="/my-matches">Mis Partidos</NavLink>
            <NavLink to="/profile">Perfil</NavLink>
            {profile.role === 'ADMIN' && (
              <NavLink to="/admin" style={{ color: 'var(--warning)', fontWeight: 600 }}>Admin</NavLink>
            )}
            
            <Link to="/notifications" style={{ position: 'relative', display: 'flex', alignItems: 'center', marginLeft: '8px', textDecoration: 'none', color: 'var(--text-main)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-main)', opacity: 0.8 }}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-10px',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '2px 6px',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
            <button 
              onClick={() => void handleSignOut()}
              className="btn btn-secondary" style={{ marginLeft: '12px', padding: '6px 12px', fontSize: '13px' }}
            >
              Salir
            </button>
          </nav>
        )}
      </header>

      <main style={{ flex: 1, padding: '64px 24px 40px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <Outlet />
      </main>

      <footer style={{ textAlign: 'center', padding: '32px 24px', color: 'var(--text-light)', fontSize: '13px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)' }}>
        &copy; {new Date().getFullYear()} FutNow
      </footer>
    </div>
  );
};
