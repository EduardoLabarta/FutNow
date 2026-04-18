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
    <div className="page-container flex-column flex-center">
      <div className="card" style={{ width: '100%', maxWidth: '600px' }}>
        <h2 className="mb-2">Nuevo Encuentro Deportivo</h2>
        <p className="text-muted mb-6">Completa los datos para habilitar una nueva convocatoria.</p>

        {errorMsg && <div className="alert alert-danger mb-4">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="flex-column gap-4">
          <div className="form-group mb-0">
            <label>Título Descriptivo *</label>
            <input className="form-control" type="text" placeholder="Ej: Pachanga Viernes..." required value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          
          <div className="form-group mb-0">
            <label>Horario Programado *</label>
            <input className="form-control" type="datetime-local" required value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
          </div>
          
          <div className="form-group mb-0">
            <label>Sede / Instalación *</label>
            <input className="form-control" type="text" placeholder="Ej: Pista Central" required value={location} onChange={e => setLocation(e.target.value)} />
          </div>
          
          <div className="form-group mb-0">
            <label>Plazas Totales Restringidas *</label>
            <input className="form-control" type="number" min="2" max="22" required value={maxPlayers} onChange={e => setMaxPlayers(Number(e.target.value))} />
          </div>
          
          <div className="flex-between mt-4 border-top pt-4" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ paddingLeft: '32px', paddingRight: '32px' }}>
              {loading ? 'Procesando...' : 'Autorizar Partido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
