import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profileService';
import { supabase } from '../lib/supabase';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  
  const [name, setName] = useState('');
  const [avatarId, setAvatarId] = useState<string>('');
  const [preferredPosition, setPreferredPosition] = useState('');
  const [displayImage, setDisplayImage] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setAvatarId(profile.avatar_id !== null ? String(profile.avatar_id) : '');
      setPreferredPosition(profile.preferred_position || '');

      if (profile.avatar_path) {
        const { data } = supabase.storage.from('avatars').getPublicUrl(profile.avatar_path);
        setDisplayImage(data.publicUrl);
      } else {
        setDisplayImage(null);
      }
    }
  }, [profile]);

  if (!profile || !user) return <p>Cargando datos...</p>;

  const isSuspended = profile.status === 'SUSPENDED';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || isSuspended) return;
    const file = e.target.files[0];
    
    setLoading(true);
    setErrorMsg('');
    setMessage('');

    try {
      if (profile.avatar_path) {
        await profileService.removeAvatar(profile.avatar_path);
      }
      
      const { path, error: uploadError } = await profileService.uploadAvatar(user.id, file);
      
      if (uploadError || !path) {
        setErrorMsg('Error al subir la imagen');
      } else {
        const { error: updateError } = await profileService.updateMyProfile(user.id, {
          name: profile.name,
          avatar_id: profile.avatar_id,
          avatar_path: path,
          preferred_position: profile.preferred_position
        });
        
        if (updateError) {
          setErrorMsg('Imagen subida pero no se pudo vincular al perfil');
        } else {
          setMessage('¡Foto de perfil actualizada!');
          await refreshProfile();
        }
      }
    } catch (err: any) {
      setErrorMsg(`Fallo de red: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSuspended) return;
    
    setLoading(true); setMessage(''); setErrorMsg('');
    const { error } = await profileService.updateMyProfile(user.id, {
      name: name.trim(),
      avatar_id: avatarId.trim() === '' ? null : Number(avatarId),
      avatar_path: profile.avatar_path,
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
    <div className="page-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2 className="mb-6">Administración de Perfil</h2>
      
      <div className="grid-responsive">
        
        {/* Columna Read-Only */}
        <div className="flex-column gap-6">
          <div className="card" style={{ backgroundColor: 'var(--primary-light)', borderColor: 'var(--border-color)', margin: 0 }}>
            <h3 className="card-title text-primary" style={{ borderBottomColor: 'var(--border-color)', color: 'var(--primary)' }}>Identidad del Sistema</h3>
            
            <div className="flex-column gap-4 text-sm">
              <div>
                <strong className="text-main block mb-2">Email Autenticación:</strong>
                <div style={{ padding: '8px 12px', background: 'rgba(39, 39, 42, 0.5)', borderRadius: 'var(--radius-sm)' }}>
                  {user.email}
                </div>
              </div>
              
              <div>
                 <strong className="text-main block mb-2">Rol Asignado:</strong>
                 <span className={profile.role === 'ADMIN' ? 'badge badge-warning' : 'badge badge-secondary'}>{profile.role}</span>
              </div>
              
              <div>
                 <strong className="text-main block mb-2">Estado de Cuenta:</strong>
                 <span className={isSuspended ? 'badge badge-danger' : 'badge badge-success'}>{profile.status}</span>
              </div>
            </div>
          </div>
          
          <div className="card text-center" style={{ margin: 0 }}>
             <h3 className="card-title">Avatar Activo</h3>
             <div className="flex-center mt-4">
               {displayImage ? (
                 <img src={displayImage} alt="Avatar" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', boxShadow: 'var(--shadow-glow)', border: '2px solid var(--primary)' }} />
               ) : (
                 <div className="flex-center" style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'rgba(39, 39, 42, 0.5)', color: 'var(--text-muted)', fontSize: '40px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }}>
                   👤
                 </div>
               )}
             </div>
             
             <div className="mt-4">
               <label className="btn btn-secondary btn-block" style={{ cursor: isSuspended ? 'not-allowed' : 'pointer', opacity: isSuspended ? 0.6 : 1 }}>
                 {loading ? 'Subiendo...' : 'Actualizar Foto Recreativa'}
                 <input type="file" accept="image/*" onChange={handleFileChange} disabled={isSuspended || loading} style={{ display: 'none' }} />
               </label>
             </div>
          </div>
        </div>

        {/* Columna Editar */}
        <div className="card" style={{ margin: 0 }}>
          <h3 className="card-title">Ajustes Deportivos</h3>
          
          {message && <div className="alert alert-success mb-4">{message}</div>}
          {errorMsg && <div className="alert alert-danger mb-4">{errorMsg}</div>}

          <form onSubmit={handleSubmit} className="flex-column gap-4">
            <div className="form-group mb-0">
              <label>Pseúdonimo Principal *</label>
              <input className="form-control" type="text" required disabled={isSuspended} value={name} onChange={e => setName(e.target.value)} />
            </div>
            
            <div className="form-group mb-0">
              <label>Dorsal Histórico (Opcional)</label>
              <input className="form-control" type="number" placeholder="1-99" disabled={isSuspended} value={avatarId} onChange={e => setAvatarId(e.target.value)} />
            </div>
            
            <div className="form-group mb-0">
              <label>Demarcación Preferida (Opcional)</label>
              <select 
                className="form-control" 
                disabled={isSuspended} 
                value={preferredPosition} 
                onChange={e => setPreferredPosition(e.target.value)}
              >
                <option value="">No definida</option>
                <option value="Portero">Portero</option>
                <option value="Defensa">Defensa</option>
                <option value="Centrocampista">Centrocampista</option>
                <option value="Delantero">Delantero</option>
              </select>
            </div>
            
            {!isSuspended && (
               <button type="submit" disabled={loading} className="btn btn-primary mt-4">
                 {loading ? 'Sincronizando...' : 'Guardar Información'}
               </button>
            )}
            
            {isSuspended && (
              <p className="text-sm text-danger text-center mt-4">
                La edición de información está restringida por medidas disciplinarias.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
