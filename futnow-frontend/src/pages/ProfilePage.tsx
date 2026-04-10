import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profileService';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  
  const [name, setName] = useState('');
  const [avatarId, setAvatarId] = useState<string>('');
  const [preferredPosition, setPreferredPosition] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setAvatarId(profile.avatar_id !== null ? String(profile.avatar_id) : '');
      setPreferredPosition(profile.preferred_position || '');
    }
  }, [profile]);

  if (!profile || !user) return <p>Cargando datos...</p>;

  const isSuspended = profile.status === 'SUSPENDED';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSuspended) return;
    
    setLoading(true); setMessage(''); setErrorMsg('');
    const { error } = await profileService.updateMyProfile(user.id, {
      name: name.trim(),
      avatar_id: avatarId.trim() === '' ? null : Number(avatarId),
      preferred_position: preferredPosition.trim() === '' ? null : preferredPosition.trim()
    });

    if (error) setErrorMsg(`Error actualizando perfil: ${error.message}`);
    else {
      setMessage('¡Perfil actualizado con éxito!');
      await refreshProfile();
    }
    setLoading(false);
  };

  return (
    <div className="page-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Mi Perfil Deportivo</h2>
      
      <div className="card" style={{ backgroundColor: 'var(--bg-color)' }}>
        <h3 style={{ marginTop: 0 }}>Datos Inalterables (Read-Only)</h3>
        <p><strong>Email Autenticación:</strong> {user.email}</p>
        <p><strong>Rango Sistema:</strong> {profile.role}</p>
        <p><strong>Estado:</strong> <span style={{ color: isSuspended ? 'var(--danger)' : 'var(--success)', fontWeight: 'bold' }}>{profile.status}</span></p>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Datos Públicos Amigables</h3>
        
        {message && <div className="alert alert-success">{message}</div>}
        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <div className="form-group">
            <label>Nombre en Pista (Nickname)*</label>
            <input className="form-control" type="text" required disabled={isSuspended} value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Avatar Numérico (Opcional)</label>
            <input className="form-control" type="number" placeholder="1-99" disabled={isSuspended} value={avatarId} onChange={e => setAvatarId(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Posición Preferida (Opcional)</label>
            <input className="form-control" type="text" placeholder="Ej: Delantero, Portero..." disabled={isSuspended} value={preferredPosition} onChange={e => setPreferredPosition(e.target.value)} />
          </div>
          
          {!isSuspended && (
             <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
               {loading ? 'Sincronizando...' : 'Guardar Cambios Formales'}
             </button>
          )}
        </form>
      </div>
    </div>
  );
}
