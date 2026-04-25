import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import type { AppNotification } from '../types/notification';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadNotifications = async () => {
    setLoading(true);
    const { data } = await notificationService.getNotifications();
    if (data) setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    void loadNotifications();
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.is_read) {
      await notificationService.markAsRead(notif.id);
    }
    if (notif.related_match_id) {
      navigate(`/matches/${notif.related_match_id}`);
    } else {
      // Just update local state if no navigation
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
    }
  };

  if (loading) return <div className="page-container"><div className="loading-state">Cargando notificaciones...</div></div>;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="flex-between mb-6">
        <h2 style={{ margin: 0, fontSize: '28px' }}>Notificaciones</h2>
        {unreadCount > 0 && (
          <button onClick={() => void handleMarkAllAsRead()} className="btn btn-secondary" style={{ fontSize: '13px', padding: '6px 12px' }}>
            Marcar todas como leídas
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card text-center" style={{ padding: '40px 20px' }}>
          <p className="text-muted m-0">No tienes ninguna notificación.</p>
        </div>
      ) : (
        <div className="flex-column gap-3">
          {notifications.map(notif => (
            <div 
              key={notif.id} 
              className="card" 
              onClick={() => void handleNotificationClick(notif)}
              style={{ 
                margin: 0, 
                padding: '16px 20px', 
                cursor: notif.related_match_id ? 'pointer' : 'default',
                borderLeft: notif.is_read ? '4px solid transparent' : '4px solid var(--primary)',
                backgroundColor: notif.is_read ? 'rgba(39, 39, 42, 0.2)' : 'rgba(39, 39, 42, 0.6)',
                transition: 'all 0.2s ease',
              }}
            >
              <div className="flex-between" style={{ alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                    <strong className="text-main" style={{ fontSize: '15px' }}>{notif.title}</strong>
                    {!notif.is_read && <span className="badge" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '2px 6px', fontSize: '10px' }}>NUEVA</span>}
                  </div>
                  <p className="text-muted m-0" style={{ fontSize: '14px', lineHeight: '1.5' }}>{notif.message}</p>
                  <div className="text-muted mt-2" style={{ fontSize: '12px' }}>
                    {new Date(notif.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>
                
                <div className="flex-column gap-2" style={{ alignItems: 'flex-end' }}>
                  {!notif.is_read && (
                    <button 
                      onClick={(e) => void handleMarkAsRead(notif.id, e)}
                      className="btn btn-secondary" 
                      style={{ padding: '4px 8px', fontSize: '12px', background: 'transparent', border: 'none', color: 'var(--primary)', textDecoration: 'underline' }}
                    >
                      Marcar leída
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
