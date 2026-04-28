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
  }, [user?.id]);

  if (!user || !profile) return <div className="loading-state">Sincronizando identidad...</div>;

  const isSuspended = profile.status === 'SUSPENDED';

  // Lógica de resumen
  const totalOrganized = organized.length;
  const totalJoined = joined.length;
  
  const cancelledOrganized = organized.filter(m => m.status === 'CANCELLED').length;
  const cancelledJoined = joined.filter(j => j.matches?.status === 'CANCELLED').length;
  const totalCancelled = cancelledOrganized + cancelledJoined;

  const now = new Date();
  const upcomingOrganized = organized.filter(m => m.status === 'OPEN' && new Date(m.scheduled_at) > now);
  const upcomingJoinedMatches = joined
    .filter(j => j.matches && j.matches.status === 'OPEN' && new Date(j.matches.scheduled_at) > now)
    .map(j => j.matches as Match);
    
  const upcomingMap = new Map<string, Match>();
  upcomingOrganized.forEach(m => upcomingMap.set(m.id, m));
  upcomingJoinedMatches.forEach(m => upcomingMap.set(m.id, m));
  
  const upcomingMatches = Array.from(upcomingMap.values()).sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  const nextMatch = upcomingMatches.length > 0 ? upcomingMatches[0] : null;

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '8px', marginTop: '20px' }}>Panel Actividad Deportiva Personal</h2>
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
        <>
          <section className="mb-8">
            <h3 className="mb-4" style={{ fontSize: '20px', fontWeight: 600 }}>Resumen de Actividad</h3>
            <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
              
              <div className="card" style={{ padding: '20px', margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', backgroundColor: 'var(--bg-color)', borderTop: '3px solid var(--primary)' }}>
                <span className="text-muted text-sm mb-2" style={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Organizados</span>
                <span className="text-main" style={{ fontSize: '36px', fontWeight: 700, lineHeight: 1 }}>{totalOrganized}</span>
              </div>
              
              <div className="card" style={{ padding: '20px', margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', backgroundColor: 'var(--bg-color)', borderTop: '3px solid var(--success)' }}>
                <span className="text-muted text-sm mb-2" style={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Participaciones</span>
                <span className="text-main" style={{ fontSize: '36px', fontWeight: 700, lineHeight: 1 }}>{totalJoined}</span>
              </div>
              
              <div className="card" style={{ padding: '20px', margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', backgroundColor: 'var(--bg-color)', borderTop: '3px solid var(--danger)' }}>
                <span className="text-muted text-sm mb-2" style={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cancelados</span>
                <span className="text-main" style={{ fontSize: '36px', fontWeight: 700, lineHeight: 1 }}>{totalCancelled}</span>
              </div>

              <div className="card" style={{ padding: '20px', margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', backgroundColor: 'var(--bg-color)', borderTop: '3px solid var(--warning)', gridColumn: '1 / -1' }}>
                <span className="text-muted text-sm mb-2" style={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Próximo Partido</span>
                {nextMatch ? (
                  <>
                    <strong className="text-main mb-1" style={{ fontSize: '18px' }}>{nextMatch.title}</strong>
                    <span className="text-muted text-sm mb-3">
                      {new Date(nextMatch.scheduled_at).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}
                    </span>
                    <button onClick={() => navigate(`/matches/${nextMatch.id}`)} className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '14px' }}>
                      Ver Detalles
                    </button>
                  </>
                ) : (
                  <span className="text-muted" style={{ fontSize: '16px' }}>No hay próximos partidos programados.</span>
                )}
              </div>

            </div>
          </section>

          <div className="grid-responsive">
          
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
                    <div className="flex-between responsive-keep-row mb-4">
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
                        <div className="flex-between responsive-keep-row mb-4">
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
        </>
      )}
    </div>
  );
}
