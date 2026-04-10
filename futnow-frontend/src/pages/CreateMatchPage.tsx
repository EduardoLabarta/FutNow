import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { matchService } from '../services/matchService';

export default function CreateMatchPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [title, setTitle] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [location, setLocation] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const isSuspended = profile?.status === 'SUSPENDED';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSuspended) return;
    
    setErrorMsg('');

    const selectedDate = new Date(scheduledAt);
    if (selectedDate <= new Date()) {
      setErrorMsg('No puedes organizar un partido en el pasado. Programa una hora futura.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await matchService.createMatch({
          title,
          scheduled_at: selectedDate.toISOString(),
          location,
          max_players: maxPlayers,
          organizer_id: user.id
      });

      if (error) setErrorMsg(`Error de servidor: ${error.message}`);
      else navigate('/');
    } catch (err: any) {
      setErrorMsg(`Excepción local: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
      
      {isSuspended && (
        <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
          <strong>⚠️ Nota RLS:</strong> Cuenta SUSPENDIDA. Careces de permisos para organizar.
        </div>
      )}

      <div className="card">
        <h2 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Crear Partido Deportivo</h2>
        
        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <div className="form-group">
             <label>Título del Partido (Ej. Pachanga Jueves)</label>
             <input className="form-control" type="text" required disabled={isSuspended} value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="form-group">
             <label>Fecha y Hora Oficial</label>
             <input className="form-control" type="datetime-local" required disabled={isSuspended} value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
          </div>
          <div className="form-group">
             <label>Ubicación (Nombre del Recinto)</label>
             <input className="form-control" type="text" required disabled={isSuspended} value={location} onChange={e => setLocation(e.target.value)} />
          </div>
          <div className="form-group">
             <label>Plazas Disponibles (Total Jugadores)</label>
             <input className="form-control" type="number" min="2" max="30" required disabled={isSuspended} value={maxPlayers} onChange={e => setMaxPlayers(Number(e.target.value))} />
          </div>
          
          <div style={{ marginTop: '25px', display: 'flex', gap: '15px' }}>
             {!isSuspended && (
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
                  {loading ? 'Tramitando...' : 'Confirmar Reserva de Creación'}
                </button>
             )}
             <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
               Cancelar
             </button>
          </div>
        </form>
      </div>

    </div>
  );
}
