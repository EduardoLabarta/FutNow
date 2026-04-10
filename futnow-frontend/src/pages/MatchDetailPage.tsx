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
      setMessage('Error de indexación. El partido no existe o fue despedido.');
      setLoading(false);
      return; 
    } 

    setMatch(matchRes.data);
    if (!partsRes.error) setParticipants(partsRes.data || []);
    setLoading(false);
  };

  useEffect(() => { void loadData(); }, [id]);

  if (loading) return <div className="page-container" style={{ textAlign: 'center' }}>Sincronizando Detalles Técnicos...</div>;
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
    if (error) setMessage(`Reserva Denegada: ${error.message}`);
    else { setMessage(''); void loadData(); }
  };

  const handleLeave = async () => {
    if (!id || isSuspended) return;
    setActionLoading(true);
    const { error } = await matchService.leaveMatch(id);
    setActionLoading(false);
    if (error) setMessage(`Fallo abandonando: ${error.message}`);
    else { setMessage(''); void loadData(); }
  };

  const handleCancel = async () => {
    if (!id || isSuspended) return;
    if (!window.confirm("¿Seguro que deseas Clausurar y CANCELAR este partido definitivamente?")) return;
    setActionLoading(true);
    const { error } = await matchService.cancelMatch(id);
    setActionLoading(false);
    if (error) setMessage(`Resistencia de jerarquía: ${error.message}`);
    else { alert("Evento Destruido."); void loadData(); }
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      {isSuspended && (
        <div className="alert alert-danger">
          <strong>⚠️ Modo Observador Restringido:</strong> Cuenta SUSPENDIDA. Restricción total de interacción.
        </div>
      )}

      {message && <div className="alert alert-info">{message}</div>}
      
      <div className="card" style={{ borderLeft: match.status === 'OPEN' ? '5px solid var(--success)' : '5px solid var(--danger)' }}>
        <h2 style={{ marginBottom: '5px' }}>{match.title}</h2>
        <span style={{ backgroundColor: match.status === 'OPEN' ? 'var(--success)' : 'var(--danger)', color: 'white', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>ESTADO: {match.status}</span>
        
        <div style={{ margin: '20px 0', fontSize: '15px' }}>
          <p><strong>Día Programado:</strong> {new Date(match.scheduled_at).toLocaleString()}</p>
          <p><strong>Ubicación Oficial:</strong> {match.location}</p>
          <p><strong>Aforo Actual:</strong> <span style={{ color: isFull ? 'var(--danger)' : 'var(--text-main)', fontWeight: isFull ? 'bold' : 'normal' }}>{participants.length} plazas ocupadas de {match.max_players}</span></p>
        </div>
        
        {!isSuspended && (
           <div style={{ marginTop: '25px', display: 'flex', gap: '10px', flexWrap: 'wrap', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
             {canJoin && <button disabled={actionLoading} onClick={() => void handleJoin()} className="btn btn-success">Anotarme a la Convocatoria</button>}
             {canLeave && <button disabled={actionLoading} onClick={() => void handleLeave()} className="btn btn-secondary">Ceder mi Plaza (Baja)</button>}
             {canAdminCancel && match.status === 'OPEN' && <button disabled={actionLoading} onClick={() => void handleCancel()} className="btn btn-danger">Clausurar Evento</button>}
           </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Inscritos Confirmados</h3>
        {participants.length === 0 ? (
          <p style={{ color: 'var(--secondary)' }}>Aún no hay inscritos en la hoja técnica.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
            {participants.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px', backgroundColor: 'var(--bg-color)', borderRadius: '4px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--info)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '18px' }}>
                  {p.profiles?.name.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <div style={{ fontWeight: 'bold' }}>
                    {p.profiles?.name || 'Deportista Non-Grato'}
                    {p.user_id === user?.id && <span style={{ color: 'var(--primary)' }}> (Tú)</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
