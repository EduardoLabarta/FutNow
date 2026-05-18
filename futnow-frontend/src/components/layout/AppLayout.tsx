import { useEffect, useMemo, useState } from 'react';
import { Bell, Home, LogOut, ShieldCheck, UserRound, UsersRound } from 'lucide-react';
import { Outlet, useNavigate, NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { notificationService } from '../../services/notificationService';
import { Button, IconButton } from '../ui';
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

  const navItems = useMemo(() => {
    const items = [
      { to: '/', label: 'Inicio', icon: Home },
      { to: '/my-matches', label: 'Mis partidos', icon: UsersRound },
      { to: '/profile', label: 'Perfil', icon: UserRound },
      { to: '/notifications', label: 'Avisos', icon: Bell, count: unreadCount },
    ];

    if (profile?.role === 'ADMIN') {
      items.push({ to: '/admin', label: 'Admin', icon: ShieldCheck });
    }

    return items;
  }, [profile?.role, unreadCount]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const renderNavLink = (item: (typeof navItems)[number]) => {
    const Icon = item.icon;
    const count = 'count' in item ? item.count ?? 0 : 0;

    return (
      <NavLink
        key={item.to}
        to={item.to}
        className={({ isActive }) =>
          [
            'nav-link',
            isActive ? 'active' : '',
            item.to === '/admin' ? 'nav-link-admin' : '',
            item.to === '/notifications' ? 'notification-link' : '',
          ]
            .filter(Boolean)
            .join(' ')
        }
      >
        <Icon size={18} aria-hidden="true" />
        <span>{item.label}</span>
        {count > 0 && (
          <span className="notification-count" aria-label={`${count} notificaciones sin leer`}>
            {count > 99 ? '99+' : count}
          </span>
        )}
      </NavLink>
    );
  };

  return (
    <div className="app-shell">
      <header className="header-layout">
        <Link to="/" className="header-brand" aria-label="Ir al inicio de FutNow">
          <img src={logo} alt="FutNow" className="brand-logo" />
        </Link>

        {user && profile && <nav className="header-nav" aria-label="Navegación principal">{navItems.map(renderNavLink)}</nav>}

        {user && profile && (
          <div className="header-actions">
            <IconButton
              aria-label="Ver notificaciones"
              className="notification-link"
              onClick={() => navigate('/notifications')}
              variant="secondary"
            >
              <Bell size={20} aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="notification-count" aria-label={`${unreadCount} notificaciones sin leer`}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </IconButton>
            <Button
              leftIcon={<LogOut size={16} aria-hidden="true" />}
              onClick={() => void handleSignOut()}
              size="sm"
              variant="secondary"
            >
              Salir
            </Button>
          </div>
        )}
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      {user && profile && <nav className="bottom-nav" aria-label="Navegación móvil">{navItems.map(renderNavLink)}</nav>}

      <footer className="app-footer">&copy; {new Date().getFullYear()} FutNow</footer>
    </div>
  );
};
