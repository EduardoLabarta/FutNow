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
    <div className="page-container">
      <h2>Consola Central de Administración (MVP)</h2>
      <p style={{ color: 'var(--secondary)', marginBottom: '30px' }}>Supervisión y control jerárquico absoluto.</p>

      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      {loading ? <p>Conectando al panel de control remoto...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          <section className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <h3 style={{ margin: 0, padding: '20px', backgroundColor: '#343a40', color: 'white' }}>Moderación de Expedientes (Usuarios)</h3>
            <div style={{ overflowX: 'auto', padding: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '12px' }}>A.K.A. (Nick)</th>
                    <th style={{ padding: '12px' }}>Jerarquía</th>
                    <th style={{ padding: '12px' }}>Estatus</th>
                    <th style={{ padding: '12px' }}>Operativa</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px' }}><strong>{p.name || 'Anónimo'}</strong></td>
                      <td style={{ padding: '12px' }}>
                         <span style={{ backgroundColor: p.role === 'ADMIN' ? '#ffc107' : '#e2e3e5', color: p.role === 'ADMIN' ? '#000' : '#444', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                            {p.role}
                         </span>
                      </td>
                      <td style={{ padding: '12px', color: p.status === 'ACTIVE' ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>{p.status}</td>
                      <td style={{ padding: '12px' }}>
                        {p.id !== user?.id && p.role !== 'ADMIN' && (
                           <button 
                             onClick={() => void handleToggleStatus(p.id, p.status)} 
                             className={`btn ${p.status === 'ACTIVE' ? 'btn-danger' : 'btn-success'}`} 
                             style={{ padding: '6px 12px', fontSize: '12px' }}
                           >
                              {p.status === 'ACTIVE' ? 'Forzar Suspensión' : 'Revocar Suspensión'}
                           </button>
                        )}
                        {p.id === user?.id && <span style={{ fontSize: '13px', color: '#6c757d', fontStyle: 'italic' }}>Auto (Bloqueado)</span>}
                        {p.id !== user?.id && p.role === 'ADMIN' && <span style={{ fontSize: '13px', color: '#6c757d', fontStyle: 'italic' }}>Inmune (Admin)</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <h3 style={{ margin: 0, padding: '20px', backgroundColor: '#343a40', color: 'white' }}>Intervención de Partidos</h3>
            <div style={{ overflowX: 'auto', padding: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '12px' }}>Cabecera Evento</th>
                    <th style={{ padding: '12px' }}>Horario Programado</th>
                    <th style={{ padding: '12px' }}>Estado RLS</th>
                    <th style={{ padding: '12px' }}>Operativa</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map(m => (
                    <tr key={m.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px' }}><strong>{m.title}</strong></td>
                      <td style={{ padding: '12px' }}>{new Date(m.scheduled_at).toLocaleDateString()} {new Date(m.scheduled_at).toLocaleTimeString()}</td>
                      <td style={{ padding: '12px', color: m.status === 'OPEN' ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>{m.status}</td>
                      <td style={{ padding: '12px' }}>
                         {m.status === 'OPEN' && (
                           <button 
                              onClick={() => void handleCancelMatch(m.id)} 
                              className="btn btn-warning" 
                              style={{ padding: '6px 12px', fontSize: '12px', color: '#000' }}
                           >
                              Forzar Cancelación (Admin)
                           </button>
                         )}
                         {m.status === 'CANCELLED' && <span style={{ fontSize: '13px', color: '#6c757d', fontStyle: 'italic' }}>Cerrado Definitivo</span>}
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
