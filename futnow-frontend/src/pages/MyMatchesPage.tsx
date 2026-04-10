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

  if (!user || !profile) return <p>Sincronizando identidad...</p>;

  const isSuspended = profile.status === 'SUSPENDED';

  return (
    <div className="page-container">
      <h2>Panel Actividad Deportiva Personal</h2>
      <p style={{ color: 'var(--secondary)', marginBottom: '30px' }}>Vista global de compromisos asumidos.</p>

      {isSuspended && (
        <div className="alert alert-danger">
          <strong>⚠️ Nota RLS:</strong> Tu estado actual es SUSPENDIDO. Puedes ojear tu historial, pero no puedes interactuar ni tramitar operaciones transaccionales.
        </div>
      )}

      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      {loading ? (
        <p>Evaluando hoja de ruta...</p>
      ) : (
        <div style={{ display: 'grid', gap: '30px', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
          
          <section className="card" style={{ marginBottom: 0 }}>
            <h3 style={{ color: 'var(--primary)', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Partidos que Organizo</h3>
            {organized.length === 0 ? (
              <p className="alert alert-info">Todavía no has aperturado ningún partido local.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {organized.map(m => (
                  <div key={m.id} style={{ border: '1px solid var(--border-color)', padding: '15px', borderRadius: '4px' }}>
                    <h4 style={{ margin: '0 0 10px 0' }}>{m.title}</h4>
                    <p style={{ margin: '5px 0' }}>📅 {new Date(m.scheduled_at).toLocaleString()}</p>
                    <p style={{ margin: '5px 0' }}>📍 {m.location}</p>
                    <p style={{ margin: '5px 0' }}>
                       <strong>Estado:</strong> <span style={{ color: m.status === 'OPEN' ? 'var(--success)' : 'var(--danger)' }}>{m.status}</span>
                    </p>
                    <button onClick={() => navigate(`/matches/${m.id}`)} className="btn btn-info" style={{ marginTop: '10px' }}>
                      Moderar Evento
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="card" style={{ marginBottom: 0 }}>
            <h3 style={{ color: 'var(--success)', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Participaciones Confirmadas</h3>
            {joined.length === 0 ? (
              <p className="alert alert-info">Actualmente no reservas butaca en ningún encuentro ajeno.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {joined.map(j => {
                   const m = j.matches;
                   if (!m) return null;
                   return (
                      <div key={j.id} style={{ border: '1px solid var(--border-color)', padding: '15px', borderRadius: '4px', backgroundColor: 'var(--bg-color)' }}>
                        <h4 style={{ margin: '0 0 10px 0' }}>{m.title}</h4>
                        <p style={{ margin: '5px 0' }}>📅 {new Date(m.scheduled_at).toLocaleString()}</p>
                        <p style={{ margin: '5px 0' }}>📍 {m.location}</p>
                        <p style={{ margin: '5px 0' }}>
                           <strong>Estado:</strong> <span style={{ color: m.status === 'OPEN' ? 'var(--success)' : 'var(--danger)' }}>{m.status}</span>
                        </p>
                        <button onClick={() => navigate(`/matches/${m.id}`)} className="btn btn-success" style={{ marginTop: '10px' }}>
                          Inspeccionar Rivalidad
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
