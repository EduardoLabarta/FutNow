import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profileService';
import { matchService } from '../services/matchService';
import { venueService } from '../services/venueService';
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
    is_active: true
  };
  const [venueForm, setVenueForm] = useState<CreateVenueInput>(initialVenueForm);

  const loadData = async () => {
    setLoading(true); setErrorMsg('');
    const [profRes, matchRes, venueRes] = await Promise.all([
      profileService.getAllProfiles(),
      matchService.getAllMatchesAdmin(),
      venueService.getAllVenuesAdmin()
    ]);
    if (profRes.error || matchRes.error || venueRes.error) setErrorMsg('Error cargando datos de administración.');
    else {
      setProfiles(profRes.data || []);
      setMatches(matchRes.data || []);
      setVenues(venueRes.data || []);
    }
    setLoading(false);
  };

  useEffect(() => { void loadData(); }, []);

  const handleToggleStatus = async (targetId: string, currentStatus: string) => {
    if (targetId === user?.id) return alert("No puedes autosuspenderte.");
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!window.confirm(`¿Seguro que quieres forzar estado a ${newStatus}?`)) return;

    const { error } = await profileService.updateProfileStatus(targetId, newStatus as 'ACTIVE' | 'SUSPENDED');
    if (error) alert(`Error RPC: ${error.message}`);
    else void loadData();
  };

  const handleCancelMatch = async (matchId: string) => {
    if (!window.confirm("ATENCIÓN: ¿Seguro que quieres DESTRUIR (CANCELAR) administrativamente este partido ajeno?")) return;
    const { error } = await matchService.cancelMatch(matchId);
    if (error) alert(`Error de Jerarquía: ${error.message}`);
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
      is_active: venue.is_active
    });
  };

  const handleNewVenue = () => {
    setEditingVenue(null);
    setIsCreatingVenue(true);
    setVenueForm(initialVenueForm);
  };

  const handleSaveVenue = async (e: React.FormEvent) => {
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
      alert(`Error guardando venue: ${error.message}`);
      setLoading(false);
    } else {
      setEditingVenue(null);
      setIsCreatingVenue(false);
      await loadData();
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div className="flex-between mb-6">
        <div>
          <h2 className="text-main" style={{ fontSize: '32px', marginBottom: '4px', marginTop: '20px' }}>Centro de Mando</h2>
          <p className="text-muted">Supervisión técnica de la plataforma FutNow.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => void loadData()} disabled={loading}>
          Sincronizar Datos
        </button>
      </div>

      {errorMsg && <div className="alert alert-danger mb-6">{errorMsg}</div>}

      {loading ? <div className="loading-state">Conectando al panel de control remoto...</div> : (
        <div className="flex-column gap-6">
          
          <section className="card" style={{ padding: 0, overflow: 'hidden', margin: 0, borderTop: '4px solid var(--warning)', boxShadow: '0 0 20px rgba(245, 165, 36, 0.05)' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(39, 39, 42, 0.3)' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Moderación de Usuarios</h3>
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
                      <td>
                         <span className={p.role === 'ADMIN' ? 'badge badge-warning' : 'badge badge-secondary'}>
                            {p.role}
                         </span>
                      </td>
                      <td>
                         <span className={p.status === 'ACTIVE' ? 'badge badge-success' : 'badge badge-danger'}>
                           {p.status}
                         </span>
                      </td>
                      <td>
                        {p.id !== user?.id && p.role !== 'ADMIN' && (
                           <button 
                             onClick={() => void handleToggleStatus(p.id, p.status)} 
                             className="btn btn-secondary"
                             style={{ padding: '6px 12px', fontSize: '12px' }}
                           >
                              {p.status === 'ACTIVE' ? 'Suspender' : 'Reactivar'}
                           </button>
                        )}
                        {p.id === user?.id && <span className="text-sm text-muted">Cuenta Actual</span>}
                        {p.id !== user?.id && p.role === 'ADMIN' && <span className="text-sm text-muted">Admin Inmune</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card" style={{ padding: 0, overflow: 'hidden', margin: 0, borderTop: '4px solid var(--primary)', boxShadow: '0 0 20px rgba(59, 130, 246, 0.05)' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(39, 39, 42, 0.3)' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Supervisión de Partidos</h3>
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
                      <td>
                         <span className={m.status === 'OPEN' ? 'badge badge-success' : 'badge badge-danger'}>
                           {m.status}
                         </span>
                      </td>
                      <td>
                         {m.status === 'OPEN' && (
                           <button 
                              onClick={() => void handleCancelMatch(m.id)} 
                              className="btn btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                           >
                              Forzar Cancelación
                           </button>
                         )}
                         {m.status === 'CANCELLED' && <span className="text-sm text-muted">Cerrado Definitivo</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card" style={{ padding: 0, overflow: 'hidden', margin: 0, borderTop: '4px solid var(--success)', boxShadow: '0 0 20px rgba(16, 185, 129, 0.05)' }}>
            <div className="flex-between" style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(39, 39, 42, 0.3)' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Instalaciones (Venues)</h3>
              {(!isCreatingVenue && !editingVenue) && (
                <button onClick={handleNewVenue} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                  + Nuevo Campo
                </button>
              )}
            </div>

            {(isCreatingVenue || editingVenue) ? (
              <div style={{ padding: '24px' }}>
                <form onSubmit={(e) => void handleSaveVenue(e)} className="flex-column gap-4">
                  <div className="form-group">
                    <label className="form-label">Nombre del campo</label>
                    <input type="text" className="form-control" value={venueForm.name} onChange={e => setVenueForm({...venueForm, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Dirección</label>
                    <input type="text" className="form-control" value={venueForm.address} onChange={e => setVenueForm({...venueForm, address: e.target.value})} required />
                  </div>
                  <div className="flex-between gap-4">
                    <div className="form-group" style={{ flex: 1, width: '100%' }}>
                      <label className="form-label">Latitud (opcional)</label>
                      <input type="number" step="any" className="form-control" value={venueForm.lat ?? ''} onChange={e => setVenueForm({...venueForm, lat: e.target.value === '' ? null : parseFloat(e.target.value)})} />
                    </div>
                    <div className="form-group" style={{ flex: 1, width: '100%' }}>
                      <label className="form-label">Longitud (opcional)</label>
                      <input type="number" step="any" className="form-control" value={venueForm.lng ?? ''} onChange={e => setVenueForm({...venueForm, lng: e.target.value === '' ? null : parseFloat(e.target.value)})} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tipo de Campo</label>
                    <select className="form-control" value={venueForm.pitch_type} onChange={e => setVenueForm({...venueForm, pitch_type: e.target.value as PitchType})}>
                      <option value="FOOTBALL_11">Fútbol 11</option>
                      <option value="FOOTBALL_7">Fútbol 7</option>
                      <option value="FUTSAL">Fútbol Sala</option>
                    </select>
                  </div>
                  <div className="flex-between gap-4">
                    <div className="form-group" style={{ flex: 1, width: '100%' }}>
                      <label className="form-label">Jugadores por equipo</label>
                      <input type="number" className="form-control" value={venueForm.players_per_team} onChange={e => setVenueForm({...venueForm, players_per_team: parseInt(e.target.value) || 0})} required />
                    </div>
                    <div className="form-group" style={{ flex: 1, width: '100%' }}>
                      <label className="form-label">Jugadores máximos (total)</label>
                      <input type="number" className="form-control" value={venueForm.max_players} onChange={e => setVenueForm({...venueForm, max_players: parseInt(e.target.value) || 0})} required />
                    </div>
                  </div>
                  <div className="form-group flex-between responsive-keep-row" style={{ justifyContent: 'flex-start', gap: '12px' }}>
                    <input type="checkbox" id="isActive" checked={venueForm.is_active} onChange={e => setVenueForm({...venueForm, is_active: e.target.checked})} style={{ width: 'auto' }} />
                    <label htmlFor="isActive" className="form-label m-0">Campo Activo (visible para usuarios)</label>
                  </div>

                  <div className="flex-column gap-4 mt-4" style={{ width: '100%' }}>
                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                      {isCreatingVenue ? 'Crear Campo' : 'Guardar Cambios'}
                    </button>
                    <button type="button" onClick={() => { setIsCreatingVenue(false); setEditingVenue(null); }} className="btn btn-secondary btn-block">
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
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
                        <td>{v.pitch_type}</td>
                        <td className="text-muted">{v.max_players} pax ({v.players_per_team}v{v.players_per_team})</td>
                        <td>
                           <span className={v.is_active ? 'badge badge-success' : 'badge badge-danger'}>
                             {v.is_active ? 'ACTIVO' : 'INACTIVO'}
                           </span>
                        </td>
                        <td style={{ display: 'flex', gap: '8px' }}>
                           <button 
                              onClick={() => handleEditVenue(v)} 
                              className="btn btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                           >
                              Editar
                           </button>
                           <button 
                              onClick={() => void handleToggleVenueStatus(v.id, v.is_active)} 
                              className="btn btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                           >
                              {v.is_active ? 'Desactivar' : 'Activar'}
                           </button>
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
