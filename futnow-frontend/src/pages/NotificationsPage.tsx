import { useCallback, useEffect, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { Bell, CheckCheck, MailOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import { Button, EmptyState, PageHeader, StatusBadge } from '../components/ui';
import type { AppNotification } from '../types/notification';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    const { data } = await notificationService.getNotifications();
    if (data) setNotifications(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadNotifications();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadNotifications]);

  const handleMarkAsRead = async (id: string, e: MouseEvent) => {
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
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
    }
  };

  const handleNotificationKey = (e: KeyboardEvent<HTMLElement>, notif: AppNotification) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      void handleNotificationClick(notif);
    }
  };

  if (loading) return <div className="loading-state">Cargando notificaciones...</div>;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="page-narrow">
      <PageHeader
        actions={
          unreadCount > 0 && (
            <Button leftIcon={<CheckCheck size={17} aria-hidden="true" />} onClick={() => void handleMarkAllAsRead()} size="sm" variant="secondary">
              Marcar todas como leídas
            </Button>
          )
        }
        description="Avisos de actividad, plazas y cambios importantes en tus convocatorias."
        eyebrow="Centro de avisos"
        meta={unreadCount > 0 && <StatusBadge label={`${unreadCount} sin leer`} tone="info" />}
        title="Notificaciones"
      />

      {notifications.length === 0 ? (
        <EmptyState
          description="Cuando haya cambios en tus partidos, los verás aquí."
          icon={<Bell size={26} aria-hidden="true" />}
          title="No tienes notificaciones"
        />
      ) : (
        <div className="notification-list">
          {notifications.map(notif => (
            <article
              key={notif.id}
              className={`notification-item ${notif.is_read ? 'is-read' : 'is-unread'}`}
              onClick={() => void handleNotificationClick(notif)}
              onKeyDown={e => handleNotificationKey(e, notif)}
              role="button"
              tabIndex={0}
            >
              <div className="icon-box">
                <MailOpen size={18} aria-hidden="true" />
              </div>

              <div className="notification-copy">
                <div className="notification-head">
                  <strong className="text-main">{notif.title}</strong>
                  {!notif.is_read && <StatusBadge label="Nueva" tone="success" />}
                </div>
                <p className="m-0 text-sm">{notif.message}</p>
                <span className="text-muted text-sm">
                  {new Date(notif.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>

              {!notif.is_read && (
                <Button onClick={e => void handleMarkAsRead(notif.id, e)} size="sm" variant="ghost">
                  Marcar leída
                </Button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
