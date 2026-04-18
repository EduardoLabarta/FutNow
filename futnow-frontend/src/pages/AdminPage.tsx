import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profileService';
import { matchService } from '../services/matchService';
import type { Profile } from '../types/profile';
import type { Match } from '../types/match';

export default function AdminPage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    setLoading(true); setErrorMsg('');
    const [profRes, matchRes] = await Promise.all([
      profileService.getAllProfiles(),
      matchService.getAllMatchesAdmin()
    ]);
    if (profRes.error || matchRes.error) setErrorMsg('Error cargando datos de administración.');
    else {
      setProfiles(profRes.data || []);
      setMatches(matchRes.data || []);
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

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h2 className="text-primary mb-2">Consola Central de Administración</h2>
      <p className="text-muted mb-6">Gestión de usuarios y supervisión general de partidos.</p>

      {errorMsg && <div className="alert alert-danger mb-6">{errorMsg}</div>}

      {loading ? <div className="loading-state">Conectando al panel de control remoto...</div> : (
        <div className="flex-column gap-6">
          
          <section className="card" style={{ padding: 0, overflow: 'hidden', margin: 0, borderTop: '4px solid var(--warning)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Moderación de Usuarios</h3>
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

          <section className="card" style={{ padding: 0, overflow: 'hidden', margin: 0, borderTop: '4px solid var(--primary)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Supervisión de Partidos</h3>
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

        </div>
      )}
    </div>
  );
}
