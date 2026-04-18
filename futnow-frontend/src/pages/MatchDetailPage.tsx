import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { matchService } from '../services/matchService';
import type { Match, MatchParticipant } from '../types/match';

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [match, setMatch] = useState<Match | null>(null);
  const [participants, setParticipants] = useState<MatchParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadData = async () => {
    if (!id) return;
    setLoading(true); setMessage('');
    
    const [matchRes, partsRes] = await Promise.all([
      matchService.getMatchById(id),
      matchService.getConfirmedParticipants(id)
    ]);

    if (matchRes.error || !matchRes.data) {
      setMatch(null);
      setParticipants([]);
      setMessage('Error al cargar datos. El partido no existe o ha sido cancelado.');
      setLoading(false);
      return; 
    } 

    setMatch(matchRes.data);
    if (!partsRes.error) setParticipants(partsRes.data || []);
    setLoading(false);
  };

  useEffect(() => { void loadData(); }, [id]);

  if (loading) return <div className="page-container"><div className="loading-state">Sincronizando Detalles Técnicos...</div></div>;
  if (!match) return <div className="page-container"><div className="alert alert-danger">{message}</div><button className="btn btn-secondary" onClick={() => navigate(-1)}>Retroceder</button></div>;

  const isSuspended = profile?.status === 'SUSPENDED';
  const isJoined = participants.some(p => p.user_id === user?.id);
  const isFuture = new Date(match.scheduled_at) > new Date();
  const isOpen = match.status === 'OPEN';
  const isFull = participants.length >= match.max_players;
  
  const canJoin = isOpen && isFuture && !isJoined && !isFull && !isSuspended;
  const canLeave = isJoined && !isSuspended; 
  const canAdminCancel = (profile?.role === 'ADMIN' || user?.id === match.organizer_id) && !isSuspended;

  const handleJoin = async () => {
    if (!id || isSuspended) return;
    setActionLoading(true);
    const { error } = await matchService.joinMatch(id);
    setActionLoading(false);
    if (error) setMessage(`Error al unirse: ${error.message}`);
    else { setMessage(''); void loadData(); }
  };

  const handleLeave = async () => {
    if (!id || isSuspended) return;
    setActionLoading(true);
    const { error } = await matchService.leaveMatch(id);
    setActionLoading(false);
    if (error) setMessage(`Error al salir del partido: ${error.message}`);
    else { setMessage(''); void loadData(); }
  };

  const handleCancel = async () => {
    if (!id || isSuspended) return;
    if (!window.confirm("¿Seguro que deseas cancelar este partido?")) return;
    setActionLoading(true);
    const { error } = await matchService.cancelMatch(id);
    setActionLoading(false);
    if (error) setMessage(`Error al cancelar: ${error.message}`);
    else { alert("Partido cancelado de forma exitosa."); void loadData(); }
  };

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      {isSuspended && (
        <div className="alert alert-danger mb-6">
          <strong>Cuenta Suspendida:</strong> No tienes permisos para participar ni organizar partidos.
        </div>
      )}

      {message && <div className="alert alert-info mb-6">{message}</div>}
      
      <div className="flex-between mb-6">
        <div>
          <button className="btn btn-secondary mb-4" onClick={() => navigate(-1)} style={{ padding: '6px 12px', fontSize: '13px' }}>
            &larr; Volver
          </button>
          <h2 style={{ margin: 0, fontSize: '28px' }}>{match.title}</h2>
        </div>
        <span className={match.status === 'OPEN' ? 'badge badge-success' : 'badge badge-danger'} style={{ fontSize: '14px', padding: '6px 16px' }}>
          {match.status}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Detalles del Partido */}
        <div className="card" style={{ borderTop: match.status === 'OPEN' ? '6px solid var(--success)' : '6px solid var(--danger)', margin: 0 }}>
          <h3 className="card-title text-main">Información General</h3>
          
          <div className="flex-column gap-6 mt-4">
            <div>
              <strong className="text-muted text-sm block mb-2">Fecha Programada</strong>
              <div className="text-main font-semibold" style={{ fontSize: '16px' }}>
                {new Date(match.scheduled_at).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}
              </div>
            </div>

            <div>
              <strong className="text-muted text-sm block mb-2">Sede / Instalación</strong>
              <div className="text-main font-semibold" style={{ fontSize: '16px' }}>{match.location}</div>
            </div>

            <div>
              <strong className="text-muted text-sm block mb-2">Estado de Aforo</strong>
              <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '12px' }}>
                <span style={{ fontSize: '16px', color: isFull ? 'var(--danger)' : 'var(--text-main)', fontWeight: isFull ? '600' : 'normal' }}>
                  {participants.length} / {match.max_players} plazas ocupadas
                </span>
                {isFull && <span className="badge badge-danger">LLENO</span>}
              </div>
            </div>
            
            {!isSuspended && (
               <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                 <div className="flex-column gap-3">
                   {canJoin && <button disabled={actionLoading} onClick={() => void handleJoin()} className="btn btn-primary btn-block">Unirse al Partido</button>}
                   {canLeave && <button disabled={actionLoading} onClick={() => void handleLeave()} className="btn btn-secondary btn-block">Salir del Partido</button>}
                   {canAdminCancel && match.status === 'OPEN' && <button disabled={actionLoading} onClick={() => void handleCancel()} className="btn btn-danger btn-block mt-2">Cancelar Partido</button>}
                 </div>
               </div>
            )}
          </div>
        </div>

        {/* Lista de Participantes */}
        <div className="card" style={{ margin: 0 }}>
          <h3 className="card-title text-main">Alineación Confirmada</h3>
          {participants.length === 0 ? (
            <div className="flex-column flex-center text-center" style={{ padding: '40px 0' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.5 }}>👕</div>
              <p className="text-muted m-0">Aún no hay inscritos en este partido.</p>
            </div>
          ) : (
            <div className="flex-column gap-3 mt-4">
              {participants.map(p => (
                <div key={p.id} className="flex-center" style={{ justifyContent: 'flex-start', gap: '16px', padding: '12px 16px', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div className="flex-center font-semibold" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontSize: '18px' }}>
                    {p.profiles?.name.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="font-semibold text-main">
                      {p.profiles?.name || 'Usuario Anónimo'}
                    </div>
                    {p.user_id === user?.id && <div className="text-sm" style={{ color: 'var(--primary)' }}>Tú mismo</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
