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
  
  const avatarUrl = profile?.avatar_path 
    ? supabase.storage.from('avatars').getPublicUrl(profile.avatar_path).data.publicUrl 
    : null;

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
    <div className="page-container" style={{ paddingTop: '20px', paddingBottom: '40px', position: 'relative' }}>
      {/* Ambient Atmospheric Background */}
      <div className="ambient-bg"></div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {isSuspended && (
          <div className="alert alert-danger mb-6">
            <strong>Cuenta Suspendida:</strong> No puedes organizar ni unirte a nuevos partidos. Acceso de solo lectura.
          </div>
        )}

        {/* Hero Section (Two Columns) */}
        <section className="mb-12" style={{ paddingTop: '20px', paddingBottom: '60px' }}>
          <div className="hero-grid">
            
            {/* Left Column: Messaging */}
            <div className="flex-column" style={{ alignItems: 'flex-start', textAlign: 'left' }}>
              <h1 className="text-gradient mb-4" style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                Conecta, Juega,<br/>Compite.
              </h1>
              <p className="text-muted mb-8" style={{ fontSize: '18px', maxWidth: '500px', lineHeight: 1.6 }}>
                Encuentra partidos en tu zona o crea tu propia convocatoria deportiva en segundos. La cancha te espera.
              </p>
              <div className="flex-center" style={{ gap: '16px', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                {!isSuspended && (
                  <button className="btn btn-primary" onClick={() => navigate('/matches/new')} style={{ padding: '14px 32px', fontSize: '16px', boxShadow: '0 8px 24px rgba(37,99,235,0.4)' }}>
                    + Organizar Partido
                  </button>
                )}
                <button className="btn btn-secondary" onClick={() => navigate('/my-matches')} style={{ padding: '14px 32px', fontSize: '16px' }}>
                  Mis Partidos
                </button>
              </div>
            </div>

            {/* Right Column: Visual Composition */}
            <div style={{ position: 'relative', height: '100%', minHeight: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              
              {/* Hero Image */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', zIndex: 0, backgroundColor: 'rgba(255,255,255,0.02)' }}>
                 <img src="/hero-image.jpg" alt="Futbol" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} /> 
              </div>
              
              {/* Main floating panel */}
              <div className="glass-panel" style={{ padding: '24px', width: '100%', maxWidth: '340px', zIndex: 2, position: 'relative' }}>
                <div className="flex-between mb-5">
                  <span className="text-muted text-sm" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actividad Global</span>
                  <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor', display: 'inline-block', boxShadow: '0 0 8px currentColor' }}></span>
                    En vivo
                  </span>
                </div>
                
                <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '16px', marginBottom: '24px' }}>
                  <div className="icon-box" style={{ width: '48px', height: '48px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  </div>
                  <div className="flex-column">
                    <span className="text-main" style={{ fontSize: '28px', fontWeight: 800, lineHeight: 1 }}>{matches.length}</span>
                    <span className="text-muted text-sm">Partidos Abiertos</span>
                  </div>
                </div>
                

              </div>

              {/* Decorative back panel (offset) */}
              <div className="glass-panel" style={{ position: 'absolute', top: '5%', right: '0%', width: '200px', padding: '16px', opacity: 0.6, zIndex: 1, transform: 'rotate(6deg)' }}>
                 <div className="flex-center" style={{ gap: '12px', justifyContent: 'flex-start' }}>
                   <div className="icon-box warning" style={{ width: '32px', height: '32px' }}>
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                   </div>
                   <span className="text-sm font-semibold">Sedes Listas</span>
                 </div>
              </div>
            </div>
            
          </div>
        </section>

        {/* Stats Quick View */}
        {profile && (
          <section className="mb-12" style={{ marginBottom: '64px' }}>
            <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              
              <div className="card flex-center" style={{ margin: 0, padding: '20px', justifyContent: 'flex-start', gap: '16px', borderBottom: '3px solid var(--primary)' }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div className="icon-box" style={{ borderRadius: '50%', fontWeight: 'bold' }}>
                    {profile.name ? profile.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="flex-column gap-1">
                  <span className="text-sm text-muted" style={{ lineHeight: 1 }}>Jugador</span>
                  <span className="font-semibold" style={{ lineHeight: 1 }}>{profile.name || user?.email}</span>
                </div>
              </div>

              <div className="card flex-center" style={{ margin: 0, padding: '20px', justifyContent: 'flex-start', gap: '16px', borderBottom: '3px solid var(--success)' }}>
                <div className="icon-box success">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                </div>
                <div className="flex-column gap-1">
                  <span className="text-sm text-muted" style={{ lineHeight: 1 }}>Estado</span>
                  <span style={{ color: profile.status === 'ACTIVE' ? 'var(--success)' : 'var(--danger)', fontWeight: 600, lineHeight: 1 }}>{profile.status}</span>
                </div>
              </div>

              <div className="card flex-center" style={{ margin: 0, padding: '20px', justifyContent: 'flex-start', gap: '16px', borderBottom: '3px solid var(--warning)' }}>
                <div className="icon-box warning">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                </div>
                <div className="flex-column gap-1">
                  <span className="text-sm text-muted" style={{ lineHeight: 1 }}>Posición</span>
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
              <h2 style={{ margin: 0, fontSize: '24px' }}>Próximas Convocatorias</h2>
              <span className="badge badge-secondary">{matches.length}</span>
            </div>
          </div>

          {loadingMatches && <div className="loading-state">Cargando disponibilidad...</div>}
          {errorStatus && <div className="alert alert-danger">{errorStatus}</div>}
          
          {!loadingMatches && !errorStatus && matches.length === 0 && (
            <div className="card flex-column flex-center text-center" style={{ padding: '80px 20px', minHeight: '300px', borderStyle: 'dashed', borderWidth: '2px', backgroundColor: 'transparent' }}>
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
    </div>
  );
}
