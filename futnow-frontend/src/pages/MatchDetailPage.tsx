import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, CalendarClock, MapPinned, Navigation, ShieldAlert, UserMinus, UserPlus, UsersRound } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { useAuth } from '../context/useAuth';
import { matchService } from '../services/matchService';
import { supabase } from '../lib/supabase';
import { venueService } from '../services/venueService';
import { Button, EmptyState, PageHeader, StatusBadge } from '../components/ui';
import type { Match, MatchParticipant } from '../types/match';
import type { Venue } from '../types/venue';

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [match, setMatch] = useState<Match | null>(null);
  const [participants, setParticipants] = useState<MatchParticipant[]>([]);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setMessage('');

    const [matchRes, partsRes] = await Promise.all([
      matchService.getMatchById(id),
      matchService.getConfirmedParticipants(id),
    ]);

    if (matchRes.error || !matchRes.data) {
      setMatch(null);
      setParticipants([]);
      setVenue(null);
      setMessage('Error al cargar datos. El partido no existe o ha sido cancelado.');
      setLoading(false);
      return;
    }

    setMatch(matchRes.data);
    if (!partsRes.error) setParticipants(partsRes.data || []);

    if (matchRes.data.venue_id) {
      const venueRes = await venueService.getVenueById(matchRes.data.venue_id);
      if (!venueRes.error && venueRes.data) {
        setVenue(venueRes.data);
      }
    }

    setLoading(false);
  }, [id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadData]);

  if (loading) return <div className="loading-state">Sincronizando detalles del partido...</div>;

  if (!match) {
    return (
      <div className="page-narrow">
        <EmptyState
          action={<Button leftIcon={<ArrowLeft size={17} aria-hidden="true" />} onClick={() => navigate(-1)} variant="secondary">Volver</Button>}
          description={message}
          icon={<ShieldAlert size={26} aria-hidden="true" />}
          title="Partido no disponible"
        />
      </div>
    );
  }

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
    else {
      setMessage('');
      void loadData();
    }
  };

  const handleLeave = async () => {
    if (!id || isSuspended) return;
    setActionLoading(true);
    const { error } = await matchService.leaveMatch(id);
    setActionLoading(false);
    if (error) setMessage(`Error al salir del partido: ${error.message}`);
    else {
      setMessage('');
      void loadData();
    }
  };

  const handleCancel = async () => {
    if (!id || isSuspended) return;
    if (!window.confirm('¿Seguro que deseas cancelar este partido?')) return;
    setActionLoading(true);
    const { error } = await matchService.cancelMatch(id);
    setActionLoading(false);
    if (error) setMessage(`Error al cancelar: ${error.message}`);
    else {
      setMessage('Partido cancelado de forma exitosa.');
      void loadData();
    }
  };

  const mapsUrl =
    match.venue_lat != null && match.venue_lng != null
      ? `https://www.google.com/maps/dir/?api=1&destination=${match.venue_lat},${match.venue_lng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(match.venue_address || match.location)}`;

  return (
    <div className="page-container">
      {isSuspended && (
        <div className="alert alert-danger" role="alert">
          <strong>Cuenta suspendida:</strong> no tienes permisos para participar ni organizar partidos.
        </div>
      )}

      {message && <div className="alert alert-info" role="status">{message}</div>}

      <PageHeader
        actions={<StatusBadge status={match.status} />}
        description="Revisa sede, hora y alineación antes de confirmar tu asistencia."
        eyebrow="Detalle del partido"
        meta={
          <Button leftIcon={<ArrowLeft size={17} aria-hidden="true" />} onClick={() => navigate(-1)} size="sm" variant="secondary">
            Volver
          </Button>
        }
        title={match.title}
      />

      <div className="content-grid">
        <section className={`card ${match.status === 'OPEN' ? 'tone-success' : 'tone-danger'}`}>
          <h2 className="card-title">
            <CalendarClock size={20} aria-hidden="true" />
            Información general
          </h2>

          <div className="info-list">
            <div className="info-row">
              <CalendarClock size={20} aria-hidden="true" />
              <div>
                <span>Fecha y hora</span>
                <strong>{new Date(match.scheduled_at).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}</strong>
              </div>
            </div>

            <div className="info-row">
              <MapPinned size={20} aria-hidden="true" />
              <div>
                <span>Lugar / sede</span>
                <strong>{match.venue_name || match.location}</strong>
                {match.venue_address && <p className="m-0 mt-2">{match.venue_address}</p>}
                {venue && (
                  <p className="m-0 mt-2">
                    {venue.pitch_type === 'FOOTBALL_11' ? 'Fútbol 11' : venue.pitch_type === 'FOOTBALL_7' ? 'Fútbol 7' : 'Fútbol Sala'} · {venue.players_per_team} vs {venue.players_per_team}
                  </p>
                )}
              </div>
            </div>

            {match.venue_lat != null && match.venue_lng != null && (
              <div className="map-frame map-frame-sm">
                <MapContainer center={[match.venue_lat, match.venue_lng]} zoom={15} className="leaflet-map" scrollWheelZoom={false}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[match.venue_lat, match.venue_lng]} />
                </MapContainer>
              </div>
            )}

            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-md">
              <Navigation size={16} aria-hidden="true" />
              Cómo llegar
            </a>

            <div className="info-row">
              <UsersRound size={20} aria-hidden="true" />
              <div>
                <span>Aforo del encuentro</span>
                <strong>{participants.length} / {match.max_players} jugadores confirmados</strong>
                {isFull && <div className="mt-2"><StatusBadge label="Completo" tone="danger" /></div>}
              </div>
            </div>
          </div>

          {!isSuspended && (
            <div className="form-actions">
              {canJoin && (
                <Button disabled={actionLoading} fullWidth leftIcon={<UserPlus size={17} aria-hidden="true" />} onClick={() => void handleJoin()}>
                  Confirmar asistencia
                </Button>
              )}
              {canLeave && (
                <Button disabled={actionLoading} fullWidth leftIcon={<UserMinus size={17} aria-hidden="true" />} onClick={() => void handleLeave()} variant="secondary">
                  Anular mi plaza
                </Button>
              )}
              {canAdminCancel && match.status === 'OPEN' && (
                <Button disabled={actionLoading} fullWidth leftIcon={<ShieldAlert size={17} aria-hidden="true" />} onClick={() => void handleCancel()} variant="danger">
                  Suspender partido
                </Button>
              )}
            </div>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">
            <UsersRound size={20} aria-hidden="true" />
            Alineación confirmada
          </h2>

          {participants.length === 0 ? (
            <EmptyState
              description="Aún no hay inscritos. La convocatoria está lista para recibir jugadores."
              icon={<UsersRound size={26} aria-hidden="true" />}
              title="Sin jugadores confirmados"
            />
          ) : (
            <div className="participant-list">
              {participants.map(p => {
                const name = p.profiles?.name || 'Usuario anónimo';
                const avatarPath = p.profiles?.avatar_path;
                return (
                  <article key={p.id} className="participant-item">
                    {avatarPath ? (
                      <img
                        src={supabase.storage.from('avatars').getPublicUrl(avatarPath).data.publicUrl}
                        alt=""
                        className="avatar"
                      />
                    ) : (
                      <div className="avatar-placeholder" aria-hidden="true">
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <strong className="text-main">{name}</strong>
                      <p className="m-0 text-sm">
                        {p.profiles?.preferred_position || 'Sin posición'}
                        {p.user_id === user?.id && <span className="text-primary"> · Tú</span>}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
