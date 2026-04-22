import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { matchService } from '../services/matchService';
import GeoapifyAutocomplete, { type PlaceResult } from '../components/GeoapifyAutocomplete';

export default function CreateMatchPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [title, setTitle] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Venue state — null means no suggestion was selected
  const [locationText, setLocationText] = useState('');
  const [venueData, setVenueData] = useState<PlaceResult | null>(null);

  const isSuspended = profile?.status === 'SUSPENDED';

  const handlePlaceSelect = useCallback((place: PlaceResult) => {
    setVenueData(place);
    setLocationText(place.name || place.address);
  }, []);

  const handleManualInput = useCallback((text: string) => {
    // User is typing manually → clear any previous selection
    setVenueData(null);
    setLocationText(text);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSuspended) return;
    
    setErrorMsg('');

    if (!locationText.trim()) {
      setErrorMsg('Por favor, indica una ubicación para el partido.');
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
          location: venueData
            ? (venueData.address || venueData.name)
            : locationText.trim(),
          max_players: maxPlayers,
          organizer_id: user.id,
          // Only set venue fields if user selected a suggestion
          venue_name: venueData?.name || null,
          venue_address: venueData?.address || null,
          venue_lat: venueData?.lat || null,
          venue_lng: venueData?.lng || null,
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
            <label>Ubicación / Instalación *</label>
            <GeoapifyAutocomplete
              placeholder="Ej: Polideportivo Municipal"
              required
              value={locationText}
              onPlaceSelect={handlePlaceSelect}
              onManualInput={handleManualInput}
            />
            {venueData && (
              <p style={{
                margin: '6px 0 0 0',
                fontSize: '12px',
                color: 'var(--success, #10b981)',
                fontWeight: 500,
              }}>
                {venueData.address}
              </p>
            )}
          </div>
          
          <div className="form-group mb-0">
            <label>Límite de Jugadores *</label>
            <input 
              className="form-control" 
              type="number" 
              min="2" 
              max="22" 
              required 
              value={maxPlayers} 
              onChange={e => setMaxPlayers(Number(e.target.value))} 
            />
          </div>
          
          <div className="flex-between mt-6 pt-6" style={{ borderTop: '1px solid var(--border-color)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
              Descartar
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ minWidth: '180px' }}>
              {loading ? 'Procesando...' : 'Lanzar Convocatoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
