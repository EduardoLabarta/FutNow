import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Ban, Building2, RefreshCw, Trophy, UserCog } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { profileService } from '../services/profileService';
import { matchService } from '../services/matchService';
import { venueService } from '../services/venueService';
import { Button, PageHeader, StatusBadge } from '../components/ui';
import type { Profile } from '../types/profile';
import type { Match } from '../types/match';
import type { Venue, PitchType, CreateVenueInput } from '../types/venue';

export default function AdminPage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [isCreatingVenue, setIsCreatingVenue] = useState(false);

  const initialVenueForm: CreateVenueInput = {
    name: '',
    address: '',
    lat: null,
    lng: null,
    pitch_type: 'FOOTBALL_11',
    players_per_team: 11,
    max_players: 22,
    is_active: true,
  };
  const [venueForm, setVenueForm] = useState<CreateVenueInput>(initialVenueForm);

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    const [profRes, matchRes, venueRes] = await Promise.all([
      profileService.getAllProfiles(),
      matchService.getAllMatchesAdmin(),
      venueService.getAllVenuesAdmin(),
    ]);
    if (profRes.error || matchRes.error || venueRes.error) setErrorMsg('Error cargando datos de administración.');
    else {
      setProfiles(profRes.data || []);
      setMatches(matchRes.data || []);
      setVenues(venueRes.data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadData]);

  const handleToggleStatus = async (targetId: string, currentStatus: string) => {
    if (targetId === user?.id) return alert('No puedes suspender tu propia cuenta.');
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!window.confirm(`¿Seguro que quieres cambiar el estado a ${newStatus}?`)) return;

    const { error } = await profileService.updateProfileStatus(targetId, newStatus as 'ACTIVE' | 'SUSPENDED');
    if (error) alert(`Error RPC: ${error.message}`);
    else void loadData();
  };

  const handleCancelMatch = async (matchId: string) => {
    if (!window.confirm('Atención: ¿seguro que quieres cancelar administrativamente este partido?')) return;
    const { error } = await matchService.cancelMatch(matchId);
    if (error) alert(`Error de jerarquía: ${error.message}`);
    else void loadData();
  };

  const handleToggleVenueStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await venueService.toggleVenueStatus(id, currentStatus);
    if (error) alert(`Error al cambiar estado: ${error.message}`);
    else void loadData();
  };

  const handleEditVenue = (venue: Venue) => {
    setEditingVenue(venue);
    setIsCreatingVenue(false);
    setVenueForm({
      name: venue.name,
      address: venue.address,
      lat: venue.lat,
      lng: venue.lng,
      pitch_type: venue.pitch_type,
      players_per_team: venue.players_per_team,
      max_players: venue.max_players,
      is_active: venue.is_active,
    });
  };

  const handleNewVenue = () => {
    setEditingVenue(null);
    setIsCreatingVenue(true);
    setVenueForm(initialVenueForm);
  };

  const handleSaveVenue = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let error;
    if (isCreatingVenue) {
      const res = await venueService.createVenue(venueForm);
      error = res.error;
    } else if (editingVenue) {
      const res = await venueService.updateVenue(editingVenue.id, venueForm);
      error = res.error;
    }

    if (error) {
      alert(`Error guardando sede: ${error.message}`);
      setLoading(false);
    } else {
      setEditingVenue(null);
      setIsCreatingVenue(false);
      await loadData();
    }
  };

  const formatPitchType = (type: PitchType) => {
    switch (type) {
      case 'FOOTBALL_11':
        return 'Fútbol 11';
      case 'FOOTBALL_7':
        return 'Fútbol 7';
      case 'FUTSAL':
        return 'Fútbol sala';
      default:
        return type;
    }
  };

  return (
    <div className="page-container">
      <PageHeader
        actions={
          <Button disabled={loading} leftIcon={<RefreshCw size={17} aria-hidden="true" />} onClick={() => void loadData()} variant="secondary">
            Sincronizar datos
          </Button>
        }
        description="Supervisión de usuarios, partidos e instalaciones disponibles en FutNow."
        eyebrow="Administración"
        title="Centro de mando"
      />

      {errorMsg && <div className="alert alert-danger" role="alert">{errorMsg}</div>}

      {loading ? (
        <div className="loading-state">Conectando al panel de control...</div>
      ) : (
        <div className="flex-column gap-6">
          <section className="card admin-section tone-warning">
            <div className="admin-section-header">
              <h2>
                <UserCog size={20} aria-hidden="true" /> Moderación de usuarios
              </h2>
            </div>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map(p => (
                    <tr key={p.id}>
                      <td><strong className="text-main">{p.name || 'Anónimo'}</strong></td>
                      <td><StatusBadge status={p.role} /></td>
                      <td><StatusBadge status={p.status} /></td>
                      <td>
                        {p.id !== user?.id && p.role !== 'ADMIN' && (
                          <Button onClick={() => void handleToggleStatus(p.id, p.status)} size="sm" variant="secondary">
                            {p.status === 'ACTIVE' ? 'Suspender' : 'Reactivar'}
                          </Button>
                        )}
                        {p.id === user?.id && <span className="text-sm text-muted">Cuenta actual</span>}
                        {p.id !== user?.id && p.role === 'ADMIN' && <span className="text-sm text-muted">Admin protegido</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card admin-section tone-primary">
            <div className="admin-section-header">
              <h2>
                <Trophy size={20} aria-hidden="true" /> Supervisión de partidos
              </h2>
            </div>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Partido</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map(m => (
                    <tr key={m.id}>
                      <td><strong className="text-main">{m.title}</strong></td>
                      <td className="text-muted">{new Date(m.scheduled_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</td>
                      <td><StatusBadge status={m.status} /></td>
                      <td>
                        {m.status === 'OPEN' && (
                          <Button leftIcon={<Ban size={15} aria-hidden="true" />} onClick={() => void handleCancelMatch(m.id)} size="sm" variant="danger">
                            Cancelar
                          </Button>
                        )}
                        {m.status === 'CANCELLED' && <span className="text-sm text-muted">Cerrado definitivo</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card admin-section tone-success">
            <div className="admin-section-header">
              <h2>
                <Building2 size={20} aria-hidden="true" /> Instalaciones
              </h2>
              {!isCreatingVenue && !editingVenue && (
                <Button onClick={handleNewVenue} size="sm">
                  Nuevo campo
                </Button>
              )}
            </div>

            {isCreatingVenue || editingVenue ? (
              <form onSubmit={(e) => void handleSaveVenue(e)} className="admin-form flex-column gap-4">
                <div className="form-group mb-0">
                  <label htmlFor="venue-name">Nombre del campo</label>
                  <input
                    id="venue-name"
                    type="text"
                    className="form-control"
                    value={venueForm.name}
                    onChange={e => setVenueForm({ ...venueForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group mb-0">
                  <label htmlFor="venue-address">Dirección</label>
                  <input
                    id="venue-address"
                    type="text"
                    className="form-control"
                    value={venueForm.address}
                    onChange={e => setVenueForm({ ...venueForm, address: e.target.value })}
                    required
                  />
                </div>

                <div className="split-fields">
                  <div className="form-group mb-0">
                    <label htmlFor="venue-lat">Latitud</label>
                    <input
                      id="venue-lat"
                      type="number"
                      step="any"
                      className="form-control"
                      value={venueForm.lat ?? ''}
                      onChange={e => setVenueForm({ ...venueForm, lat: e.target.value === '' ? null : parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="form-group mb-0">
                    <label htmlFor="venue-lng">Longitud</label>
                    <input
                      id="venue-lng"
                      type="number"
                      step="any"
                      className="form-control"
                      value={venueForm.lng ?? ''}
                      onChange={e => setVenueForm({ ...venueForm, lng: e.target.value === '' ? null : parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-group mb-0">
                  <label htmlFor="venue-type">Tipo de campo</label>
                  <select
                    id="venue-type"
                    className="form-control"
                    value={venueForm.pitch_type}
                    onChange={e => setVenueForm({ ...venueForm, pitch_type: e.target.value as PitchType })}
                  >
                    <option value="FOOTBALL_11">Fútbol 11</option>
                    <option value="FOOTBALL_7">Fútbol 7</option>
                    <option value="FUTSAL">Fútbol sala</option>
                  </select>
                </div>

                <div className="split-fields">
                  <div className="form-group mb-0">
                    <label htmlFor="venue-team-size">Jugadores por equipo</label>
                    <input
                      id="venue-team-size"
                      type="number"
                      className="form-control"
                      value={venueForm.players_per_team}
                      onChange={e => setVenueForm({ ...venueForm, players_per_team: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="form-group mb-0">
                    <label htmlFor="venue-max">Jugadores máximos</label>
                    <input
                      id="venue-max"
                      type="number"
                      className="form-control"
                      value={venueForm.max_players}
                      onChange={e => setVenueForm({ ...venueForm, max_players: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>

                <div className="checkbox-row">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={venueForm.is_active}
                    onChange={e => setVenueForm({ ...venueForm, is_active: e.target.checked })}
                  />
                  <label htmlFor="isActive" className="m-0">Campo activo y visible</label>
                </div>

                <div className="form-actions">
                  <Button type="submit" disabled={loading}>
                    {isCreatingVenue ? 'Crear campo' : 'Guardar cambios'}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsCreatingVenue(false);
                      setEditingVenue(null);
                    }}
                    variant="secondary"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Tipo</th>
                      <th>Capacidad</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {venues.map(v => (
                      <tr key={v.id}>
                        <td><strong className="text-main">{v.name}</strong></td>
                        <td>{formatPitchType(v.pitch_type)}</td>
                        <td className="text-muted">{v.max_players} plazas ({v.players_per_team}v{v.players_per_team})</td>
                        <td><StatusBadge status={v.is_active} /></td>
                        <td>
                          <div className="table-actions">
                            <Button onClick={() => handleEditVenue(v)} size="sm" variant="secondary">
                              Editar
                            </Button>
                            <Button onClick={() => void handleToggleVenueStatus(v.id, v.is_active)} size="sm" variant="secondary">
                              {v.is_active ? 'Desactivar' : 'Activar'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
