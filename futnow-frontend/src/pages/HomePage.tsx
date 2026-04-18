import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { matchService } from '../services/matchService';
import { supabase } from '../lib/supabase';
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
        <div className="alert alert-danger mb-6">
          <strong>Cuenta Suspendida:</strong> No puedes organizar ni unirte a nuevos partidos. Acceso de solo lectura.
        </div>
      )}

      {/* Snapshot Tarjeta de Perfil Rapida */}
      <div className="card flex-between mb-6" style={{ background: 'linear-gradient(to right, rgba(59,130,246,0.1), var(--card-bg))', borderColor: 'var(--border-color)', boxShadow: 'var(--shadow-glow)' }}>
        <div className="flex-center" style={{ gap: '16px', justifyContent: 'flex-start' }}>
          {profile?.avatar_path ? (
            <img 
              src={supabase.storage.from('avatars').getPublicUrl(profile.avatar_path).data.publicUrl} 
              alt="Avatar" 
              style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} 
            />
          ) : (
            <div className="flex-center" style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--secondary)', color: 'var(--text-main)', fontSize: '20px', fontWeight: 'bold' }}>
              {(profile?.name || user?.email || '?')[0].toUpperCase()}
            </div>
          )}
          <div className="flex-column gap-1">
            <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--primary)' }}>Hola, {profile?.name || user?.email}</h2>
            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>
              <span className={profile?.status === 'ACTIVE' ? 'badge badge-success' : 'badge badge-danger'}>{profile?.status}</span>
              <span>Posición: <strong className="text-main">{profile?.preferred_position || 'No definida'}</strong></span>
            </div>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/profile')}>Mi Perfil</button>
      </div>

      <div className="flex-between mb-6">
        <h2 style={{ margin: 0, fontSize: '24px' }}>Partidos Disponibles</h2>
        {!isSuspended && (
          <button className="btn btn-primary" onClick={() => navigate('/matches/new')} style={{ boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}>
            + Nuevo Partido
          </button>
        )}
      </div>

      <div>
        {loadingMatches && <div className="loading-state">Cargando disponibilidad...</div>}
        {errorStatus && <div className="alert alert-danger">{errorStatus}</div>}
        {!loadingMatches && !errorStatus && matches.length === 0 && (
          <div className="card flex-column flex-center text-center" style={{ padding: '60px 20px', minHeight: '300px' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚽</div>
            <h3 style={{ margin: '0 0 8px 0' }}>No hay partidos programados</h3>
            <p className="text-muted" style={{ margin: '0 0 24px 0' }}>¡Sé el primero en crear uno y empieza a jugar!</p>
            {!isSuspended && <button className="btn btn-primary" onClick={() => navigate('/matches/new')}>Crear un Partido</button>}
          </div>
        )}
        
        {matches.length > 0 && (
          <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {matches.map(m => (
               <div key={m.id} className="card flex-column" style={{ marginBottom: 0, height: '100%', padding: 0, overflow: 'hidden' }}>
                 <div style={{ padding: '24px', flex: 1 }}>
                    <h3 className="card-title" style={{ margin: '0 0 16px 0', fontSize: '18px', borderBottom: 'none', paddingBottom: 0 }}>{m.title}</h3>
                    
                    <div className="flex-column gap-3 text-sm text-muted mb-4">
                      <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px' }}>
                        <span className="font-semibold text-main">Fecha:</span>
                        {new Date(m.scheduled_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                      <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px' }}>
                        <span className="font-semibold text-main">Sede:</span>
                        {m.location}
                      </div>
                      <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px' }}>
                        <span className="font-semibold text-main">Plazas:</span>
                        {m.max_players} jugadores
                      </div>
                    </div>
                 </div>
                <div className="flex-between" style={{ padding: '16px 24px', backgroundColor: 'var(--bg-color)', borderTop: '1px solid var(--border-color)' }}>
                  <span className={m.status === 'OPEN' ? 'badge badge-success' : 'badge badge-danger'}>{m.status}</span>
                  <button className="btn btn-secondary" onClick={() => navigate(`/matches/${m.id}`)}>Desplegar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
