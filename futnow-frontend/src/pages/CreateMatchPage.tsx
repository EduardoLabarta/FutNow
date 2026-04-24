import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { matchService } from '../services/matchService';
import { venueService } from '../services/venueService';
import type { Venue } from '../types/venue';

export default function CreateMatchPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [title, setTitle] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [selectedVenueId, setSelectedVenueId] = useState('');
  
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const isSuspended = profile?.status === 'SUSPENDED';

  useEffect(() => {
    const fetchVenues = async () => {
      const { data, error } = await venueService.getActiveVenues();
      if (!error && data) {
        setVenues(data);
      }
      setLoadingVenues(false);
    };
    void fetchVenues();
  }, []);

  const selectedVenue = venues.find(v => v.id === selectedVenueId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSuspended) return;
    
    setErrorMsg('');

    if (!selectedVenue) {
      setErrorMsg('Por favor, selecciona un campo para el partido.');
      return;
    }

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
          location: selectedVenue.address,
          max_players: selectedVenue.max_players,
          organizer_id: user.id,
          venue_id: selectedVenue.id,
          venue_name: selectedVenue.name,
          venue_address: selectedVenue.address,
          venue_lat: selectedVenue.lat,
          venue_lng: selectedVenue.lng,
      });

      if (error) setErrorMsg(`Error de servidor: ${error.message}`);
      else navigate('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setErrorMsg(`Excepción local: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatPitchType = (type: string) => {
    switch (type) {
      case 'FOOTBALL_11': return 'Fútbol 11';
      case 'FOOTBALL_7': return 'Fútbol 7';
      case 'FUTSAL': return 'Fútbol Sala';
      default: return type;
    }
  };

  return (
    <div className="page-container flex-center" style={{ padding: '20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '40px' }}>
        <h2 className="mb-2" style={{ fontSize: '28px' }}>Crear Nuevo Encuentro</h2>
        <p className="text-muted mb-6">Configura los detalles técnicos para tu próxima convocatoria deportiva.</p>

        {errorMsg && <div className="alert alert-danger mb-4">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="flex-column gap-6">
          <div className="form-group mb-0">
            <label>Título de la Convocatoria *</label>
            <input 
              className="form-control" 
              type="text" 
              placeholder="Ej: Pachanga Viernes Noche" 
              required 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
            />
          </div>
          
          <div className="form-group mb-0">
            <label>Horario y Fecha *</label>
            <input 
              className="form-control" 
              type="datetime-local" 
              required 
              value={scheduledAt} 
              onChange={e => setScheduledAt(e.target.value)} 
            />
          </div>
          
          <div className="form-group mb-0">
            <label>Instalación Deportiva *</label>
            {loadingVenues ? (
               <div className="form-control" style={{ opacity: 0.7 }}>Cargando campos disponibles...</div>
            ) : (
               <select 
                 className="form-control"
                 required
                 value={selectedVenueId}
                 onChange={e => setSelectedVenueId(e.target.value)}
                 style={{ appearance: 'auto' }}
               >
                 <option value="" disabled>-- Selecciona un campo --</option>
                 {venues.map(v => (
                   <option key={v.id} value={v.id}>
                     {v.name}
                   </option>
                 ))}
               </select>
            )}
            
            {selectedVenue && (
              <div style={{ marginTop: '12px', padding: '16px', backgroundColor: 'rgba(39, 39, 42, 0.4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {selectedVenue.name}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  {selectedVenue.address}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Tipo: </span>
                    <strong style={{ color: 'var(--primary)' }}>{formatPitchType(selectedVenue.pitch_type)}</strong>
                  </div>
                  <div style={{ fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Modalidad: </span>
                    <strong style={{ color: 'var(--text-main)' }}>{selectedVenue.players_per_team} vs {selectedVenue.players_per_team}</strong>
                  </div>
                  <div style={{ fontSize: '13px', gridColumn: '1 / -1' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Aforo máximo: </span>
                    <strong style={{ color: 'var(--text-main)' }}>{selectedVenue.max_players} jugadores</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex-between mt-6 pt-6" style={{ borderTop: '1px solid var(--border-color)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
              Descartar
            </button>
            <button type="submit" disabled={loading || !selectedVenueId} className="btn btn-primary" style={{ minWidth: '180px' }}>
              {loading ? 'Procesando...' : 'Lanzar Convocatoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
