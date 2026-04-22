import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { matchService } from '../services/matchService';
import type { Match, MatchJoined } from '../types/match';

export default function MyMatchesPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [organized, setOrganized] = useState<Match[]>([]);
  const [joined, setJoined] = useState<MatchJoined[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (!user) return;
      setLoading(true);
      setErrorMsg('');

      const [orgRes, joinRes] = await Promise.all([
        matchService.getMatchesOrganizedByUser(user.id),
        matchService.getMatchesJoinedByUser(user.id)
      ]);

      if (isMounted) {
        if (orgRes.error || joinRes.error) {
          setErrorMsg('Error cargando información personal de los repositorios.');
        } else {
          setOrganized(orgRes.data || []);
          setJoined(joinRes.data || []);
        }
        setLoading(false);
      }
    };
    void loadData();
    return () => { isMounted = false; };
  }, [user]);

  if (!user || !profile) return <div className="loading-state">Sincronizando identidad...</div>;

  const isSuspended = profile.status === 'SUSPENDED';

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '8px' }}>Panel Actividad Deportiva Personal</h2>
      <p className="text-muted mb-6">Vista de tus partidos organizados y próximos encuentros.</p>

      {isSuspended && (
        <div className="alert alert-danger mb-6">
          <strong>Cuenta Suspendida:</strong> Tu estado actual es SUSPENDIDO. Puedes ver tu historial, pero no puedes organizar ni apuntarte a partidos.
        </div>
      )}

      {errorMsg && <div className="alert alert-danger mb-6">{errorMsg}</div>}

      {loading ? (
        <div className="loading-state">Cargando tus partidos...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          
          <section className="card card-container" style={{ margin: 0, backgroundColor: 'var(--primary-light)', borderColor: 'var(--border-color)' }}>
            <h3 className="card-title text-primary" style={{ borderBottomColor: 'var(--border-color)' }}>Partidos que Organizo</h3>
            {organized.length === 0 ? (
              <div className="flex-column flex-center text-center mt-4 p-4 text-muted border-dashed" style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                Todavía no has organizado ningún partido.
              </div>
            ) : (
              <div className="flex-column gap-4 mt-4">
                {organized.map(m => (
                  <div key={m.id} className="card" style={{ margin: 0, padding: '20px' }}>
                    <div className="flex-between mb-4">
                      <h4 style={{ margin: 0, fontSize: '16px' }}>{m.title}</h4>
                      <span className={m.status === 'OPEN' ? 'badge badge-success' : 'badge badge-danger'}>{m.status}</span>
                    </div>
                    
                    <div className="flex-column gap-2 text-sm text-muted mb-4">
                      <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px' }}>
                        <strong className="text-main">Día:</strong> {new Date(m.scheduled_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                      <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px' }}>
                         <strong className="text-main">Sede:</strong> {m.location}
                      </div>
                    </div>

                    <button onClick={() => navigate(`/matches/${m.id}`)} className="btn btn-secondary btn-block">
                      Ver Partido
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="card card-container" style={{ margin: 0 }}>
            <h3 className="card-title">Participaciones Confirmadas</h3>
            {joined.length === 0 ? (
              <div className="flex-column flex-center text-center mt-4 p-4 text-muted border-dashed" style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                Actualmente no estás apuntado a ningún partido.
              </div>
            ) : (
              <div className="flex-column gap-4 mt-4">
                {joined.map(j => {
                   const m = j.matches;
                   if (!m) return null;
                   return (
                      <div key={j.id} className="card" style={{ margin: 0, padding: '20px', backgroundColor: 'var(--bg-color)' }}>
                        <div className="flex-between mb-4">
                          <h4 style={{ margin: 0, fontSize: '16px' }}>{m.title}</h4>
                          <span className={m.status === 'OPEN' ? 'badge badge-success' : 'badge badge-danger'}>{m.status}</span>
                        </div>
                        
                        <div className="flex-column gap-2 text-sm text-muted mb-4">
                          <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px' }}>
                             <strong className="text-main">Día:</strong> {new Date(m.scheduled_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                          </div>
                          <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px' }}>
                             <strong className="text-main">Sede:</strong> {m.location}
                          </div>
                        </div>

                        <button onClick={() => navigate(`/matches/${m.id}`)} className="btn btn-secondary btn-block">
                          Ver Partido
                        </button>
                      </div>
                   );
                })}
              </div>
            )}
          </section>

        </div>
      )}
    </div>
  );
}
