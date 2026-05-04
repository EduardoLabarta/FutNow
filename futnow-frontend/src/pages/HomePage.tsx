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
    <div className="page-container" style={{ paddingTop: '20px', paddingBottom: '40px' }}>
      {isSuspended && (
        <div className="alert alert-danger mb-6">
          <strong>Cuenta Suspendida:</strong> No puedes organizar ni unirte a nuevos partidos. Acceso de solo lectura.
        </div>
      )}

      {/* Hero Section */}
      <section className="hero-section bg-gradient-hero mb-10">
        <h1 className="text-gradient mb-4" style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-0.04em' }}>
          Conecta, Juega, Compite.
        </h1>
        <p className="text-muted mb-6" style={{ fontSize: '18px', maxWidth: '600px', margin: '0 auto 24px' }}>
          Encuentra partidos en tu zona o crea tu propia convocatoria deportiva en segundos. La cancha te espera.
        </p>
        <div className="flex-center" style={{ gap: '16px', flexWrap: 'wrap' }}>
          {!isSuspended && (
            <button className="btn btn-primary" onClick={() => navigate('/matches/new')} style={{ padding: '14px 28px', fontSize: '16px' }}>
              + Organizar Partido
            </button>
          )}
          <button className="btn btn-secondary" onClick={() => navigate('/my-matches')} style={{ padding: '14px 28px', fontSize: '16px' }}>
            Mis Partidos
          </button>
        </div>
      </section>

      {/* Stats Quick View */}
      {profile && (
        <section className="mb-10">
          <h3 className="mb-4 text-muted" style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Resumen Rápido</h3>
          <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            
            <div className="card flex-center" style={{ margin: 0, padding: '20px', justifyContent: 'flex-start', gap: '16px' }}>
              <div className="icon-box">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <div className="flex-column gap-1">
                <span className="text-sm text-muted" style={{ lineHeight: 1 }}>Identidad</span>
                <span className="font-semibold" style={{ lineHeight: 1 }}>{profile.name || user?.email}</span>
              </div>
            </div>

            <div className="card flex-center" style={{ margin: 0, padding: '20px', justifyContent: 'flex-start', gap: '16px' }}>
              <div className="icon-box success">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <div className="flex-column gap-1">
                <span className="text-sm text-muted" style={{ lineHeight: 1 }}>Estado</span>
                <span style={{ color: profile.status === 'ACTIVE' ? 'var(--success)' : 'var(--danger)', fontWeight: 600, lineHeight: 1 }}>{profile.status}</span>
              </div>
            </div>

            <div className="card flex-center" style={{ margin: 0, padding: '20px', justifyContent: 'flex-start', gap: '16px' }}>
              <div className="icon-box warning">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              </div>
              <div className="flex-column gap-1">
                <span className="text-sm text-muted" style={{ lineHeight: 1 }}>Posición Favorita</span>
                <span className="font-semibold" style={{ lineHeight: 1 }}>{profile.preferred_position || 'No definida'}</span>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* Matches List */}
      <section>
        <div className="flex-between mb-6 responsive-keep-row">
          <div className="flex-center" style={{ gap: '12px', justifyContent: 'flex-start' }}>
            <h2 style={{ margin: 0, fontSize: '24px' }}>Partidos Disponibles</h2>
            <span className="badge badge-secondary">{matches.length}</span>
          </div>
        </div>

        {loadingMatches && <div className="loading-state">Cargando disponibilidad...</div>}
        {errorStatus && <div className="alert alert-danger">{errorStatus}</div>}
        
        {!loadingMatches && !errorStatus && matches.length === 0 && (
          <div className="card flex-column flex-center text-center" style={{ padding: '80px 20px', minHeight: '300px', borderStyle: 'dashed', borderWidth: '2px' }}>
            <div className="icon-box flex-center" style={{ width: '64px', height: '64px', borderRadius: '50%', marginBottom: '24px', backgroundColor: 'var(--primary-light)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '22px' }}>No hay partidos en este momento</h3>
            <p className="text-muted" style={{ margin: '0 0 32px 0', maxWidth: '400px' }}>El terreno de juego está vacío. ¡Sé el primero en organizar una convocatoria y reúne a los jugadores!</p>
            {!isSuspended && (
              <button className="btn btn-primary" onClick={() => navigate('/matches/new')} style={{ padding: '12px 24px' }}>
                Crear el primer partido
              </button>
            )}
          </div>
        )}
        
        {matches.length > 0 && (
          <div className="grid-responsive">
            {matches.map(m => (
               <div key={m.id} className="card card-hover-up flex-column" style={{ marginBottom: 0, height: '100%', padding: '24px', position: 'relative' }}>
                 
                 <div className="flex-between mb-4" style={{ alignItems: 'flex-start' }}>
                    <h3 className="card-title" style={{ margin: 0, fontSize: '18px', borderBottom: 'none', paddingBottom: 0, paddingRight: '12px', lineHeight: 1.3 }}>{m.title}</h3>
                    <span className={m.status === 'OPEN' ? 'badge badge-success' : 'badge badge-danger'} style={{ whiteSpace: 'nowrap' }}>{m.status}</span>
                 </div>
                 
                 <div className="flex-column gap-3 text-sm text-muted mb-6" style={{ flex: 1 }}>
                    <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '10px' }}>
                      <div className="icon-box-sm flex-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      </div>
                      <span>{new Date(m.scheduled_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                    
                    <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '10px' }}>
                      <div className="icon-box-sm flex-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      </div>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.location}</span>
                    </div>
                    
                    <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '10px' }}>
                      <div className="icon-box-sm flex-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                      </div>
                      <span>{m.max_players} Jugadores Máximo</span>
                    </div>
                 </div>

                 <button className="btn btn-secondary btn-block" onClick={() => navigate(`/matches/${m.id}`)} style={{ border: '1px solid var(--border-color)', backgroundColor: 'transparent', transition: 'all 0.2s ease' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; e.currentTarget.style.borderColor = 'var(--primary-light)'; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}>
                    Ver Detalles
                 </button>
                 
               </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
