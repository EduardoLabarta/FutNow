import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { matchService } from '../services/matchService';
import type { Match } from '../types/match';

export default function HomePage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [errorStatus, setErrorStatus] = useState('');

  const isSuspended = profile?.status === 'SUSPENDED';

  useEffect(() => {
    let isMounted = true;
    const fetchMatches = async () => {
      setLoadingMatches(true);
      setErrorStatus('');
      
      const { data, error } = await matchService.getUpcomingMatches();
      
      if (isMounted) {
        if (error) {
          console.error(error);
          setErrorStatus('No se pudieron obtener los partidos actuales.');
        } else {
          setMatches(data || []);
        }
        setLoadingMatches(false);
      }
    };
    fetchMatches();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="page-container">
      {isSuspended && (
        <div className="alert alert-danger">
          <strong>⚠️ Cuenta Suspendida:</strong> No puedes organizar ni unirte a nuevos partidos. Acceso de solo lectura.
        </div>
      )}

      {/* Snapshot Tarjeta de Perfil Rapida */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-color)' }}>
        <div>
          <h2 style={{ margin: 0 }}>Hola, {profile?.name || user?.email}</h2>
          <p style={{ margin: '5px 0 0 0', color: 'var(--secondary)' }}>
            Estado: <strong style={{ color: profile?.status === 'ACTIVE' ? 'var(--success)' : 'var(--danger)' }}>{profile?.status}</strong> | Posición: {profile?.preferred_position || 'No definida'}
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/profile')}>Editar Perfil</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Partidos Disponibles</h2>
        {!isSuspended && (
          <button className="btn btn-primary" onClick={() => navigate('/matches/new')}>
            + Crear Partido
          </button>
        )}
      </div>

      <div>
        {loadingMatches && <p>Cargando disponibilidad...</p>}
        {errorStatus && <div className="alert alert-danger">{errorStatus}</div>}
        {!loadingMatches && !errorStatus && matches.length === 0 && <p className="alert alert-info">No hay partidos programados. ¡Sé el primero en crear uno!</p>}
        
        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {matches.map(m => (
             <div key={m.id} className="card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
               <div>
                  <h3 style={{ margin: '0 0 10px 0' }}>{m.title}</h3>
                  <p>📅 {new Date(m.scheduled_at).toLocaleString()}</p>
                  <p>📍 {m.location}</p>
                  <p>👥 Disp: {m.max_players} jug.</p>
               </div>
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="btn btn-success" style={{ padding: '4px 8px', fontSize: '11px', cursor: 'default' }}>{m.status}</span>
                <button className="btn btn-info" onClick={() => navigate(`/matches/${m.id}`)}>Ver y Únete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
