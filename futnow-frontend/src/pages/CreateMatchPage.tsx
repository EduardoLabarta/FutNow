import { useState, useEffect, type FormEvent } from 'react';
import { CalendarClock, MapPin, Send, UsersRound, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useAuth } from '../context/useAuth';
import { matchService } from '../services/matchService';
import { venueService } from '../services/venueService';
import { Button, PageHeader } from '../components/ui';
import type { Venue } from '../types/venue';

function MapUpdater({ selectedVenue }: { selectedVenue: Venue | undefined }) {
  const map = useMap();

  useEffect(() => {
    if (selectedVenue && selectedVenue.lat != null && selectedVenue.lng != null) {
      map.flyTo([selectedVenue.lat, selectedVenue.lng], 15, { duration: 1.2 });
    }
  }, [selectedVenue, map]);

  return null;
}

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

  const handleSubmit = async (e: FormEvent) => {
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

  const defaultCenter: [number, number] = [36.75, -6.26];

  return (
    <div className="page-container">
      <PageHeader
        description="Define la hora, el campo y la capacidad. El partido quedará listo para que otros jugadores confirmen plaza."
        eyebrow="Nueva convocatoria"
        title="Crear partido"
      />

      {isSuspended && (
        <div className="alert alert-danger" role="alert">
          Tu cuenta está suspendida. Puedes revisar partidos, pero no crear nuevas convocatorias.
        </div>
      )}

      {errorMsg && <div className="alert alert-danger" role="alert">{errorMsg}</div>}

      <form onSubmit={handleSubmit} className="form-layout">
        <section className="card">
          <h2 className="card-title">
            <CalendarClock size={20} aria-hidden="true" />
            Datos del encuentro
          </h2>

          <div className="form-group">
            <label htmlFor="match-title">Título de la convocatoria *</label>
            <input
              id="match-title"
              className="form-control"
              type="text"
              placeholder="Ej: Pachanga viernes noche"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="match-date">Fecha y hora *</label>
            <input
              id="match-date"
              className="form-control"
              type="datetime-local"
              required
              value={scheduledAt}
              onChange={e => setScheduledAt(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <Button
              disabled={loading || !selectedVenueId || isSuspended}
              fullWidth
              leftIcon={<Send size={17} aria-hidden="true" />}
              type="submit"
            >
              {loading ? 'Procesando...' : 'Lanzar convocatoria'}
            </Button>
            <Button
              fullWidth
              leftIcon={<X size={17} aria-hidden="true" />}
              onClick={() => navigate('/')}
              variant="secondary"
            >
              Descartar
            </Button>
          </div>
        </section>

        <section className="card">
          <h2 className="card-title">
            <MapPin size={20} aria-hidden="true" />
            Instalación deportiva
          </h2>

          {loadingVenues ? (
            <div className="loading-state">Cargando campos disponibles...</div>
          ) : (
            <>
              <div className="map-frame mb-4">
                <MapContainer center={defaultCenter} zoom={11} className="leaflet-map">
                  <MapUpdater selectedVenue={selectedVenue} />
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {venues.filter(v => v.lat != null && v.lng != null).map(v => (
                    <Marker
                      key={v.id}
                      position={[v.lat as number, v.lng as number]}
                      eventHandlers={{
                        click: () => {
                          setSelectedVenueId(v.id);
                        },
                      }}
                    >
                      <Popup>
                        <strong>{v.name}</strong><br />
                        {v.address}<br />
                        <em>{formatPitchType(v.pitch_type)}</em>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              <div className="form-group mb-0">
                <label htmlFor="venue-select">Selecciona desde la lista *</label>
                <select
                  id="venue-select"
                  className="form-control"
                  required
                  value={selectedVenueId}
                  onChange={e => setSelectedVenueId(e.target.value)}
                >
                  <option value="" disabled>Selecciona un campo</option>
                  {venues.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {selectedVenue && (
            <aside className="venue-summary" aria-label="Campo seleccionado">
              <div>
                <h3>{selectedVenue.name}</h3>
                <p>{selectedVenue.address}</p>
              </div>
              <div className="venue-facts">
                <div>
                  <span>Tipo</span>
                  <strong>{formatPitchType(selectedVenue.pitch_type)}</strong>
                </div>
                <div>
                  <span>Modalidad</span>
                  <strong>{selectedVenue.players_per_team} vs {selectedVenue.players_per_team}</strong>
                </div>
                <div>
                  <span>Aforo máximo</span>
                  <strong>{selectedVenue.max_players} jugadores</strong>
                </div>
              </div>
            </aside>
          )}

          {!selectedVenue && !loadingVenues && (
            <div className="info-row mt-4">
              <UsersRound size={20} aria-hidden="true" />
              <div>
                <span>Capacidad automática</span>
                <strong>Al elegir una sede, FutNow usará su aforo y modalidad.</strong>
              </div>
            </div>
          )}
        </section>
      </form>
    </div>
  );
}
