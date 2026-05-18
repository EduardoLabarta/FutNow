import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { Camera, Hash, ShieldCheck, Trophy, UserRound } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { profileService } from '../services/profileService';
import { supabase } from '../lib/supabase';
import { Button, PageHeader, StatusBadge } from '../components/ui';

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

  if (!profile || !user) return <div className="loading-state">Cargando datos...</div>;

  const isSuspended = profile.status === 'SUSPENDED';

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
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
        setErrorMsg('Error al subir la imagen.');
      } else {
        const { error: updateError } = await profileService.updateMyProfile(user.id, {
          name: profile.name,
          avatar_id: profile.avatar_id,
          avatar_path: path,
          preferred_position: profile.preferred_position,
        });

        if (updateError) {
          setErrorMsg('Imagen subida, pero no se pudo vincular al perfil.');
        } else {
          setMessage('Foto de perfil actualizada.');
          await refreshProfile();
        }
      }
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : 'Error desconocido';
      setErrorMsg(`Fallo de red: ${text}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSuspended) return;

    setLoading(true);
    setMessage('');
    setErrorMsg('');

    const { error } = await profileService.updateMyProfile(user.id, {
      name: name.trim(),
      avatar_id: avatarId.trim() === '' ? null : Number(avatarId),
      avatar_path: profile.avatar_path,
      preferred_position: preferredPosition.trim() === '' ? null : preferredPosition.trim(),
    });

    if (error) setErrorMsg(`Error actualizando perfil: ${error.message}`);
    else {
      setMessage('Perfil actualizado con éxito.');
      await refreshProfile();
    }
    setLoading(false);
  };

  return (
    <div className="page-container">
      <PageHeader
        description="Mantén tu identidad deportiva lista para cada convocatoria."
        eyebrow="Perfil"
        title="Administración de perfil"
      />

      <div className="content-grid">
        <aside className="flex-column gap-6">
          <section className="card">
            <h2 className="card-title">
              <ShieldCheck size={20} aria-hidden="true" />
              Identidad del sistema
            </h2>

            <div className="info-list">
              <div className="info-row">
                <UserRound size={20} aria-hidden="true" />
                <div>
                  <span>Email de autenticación</span>
                  <strong>{user.email}</strong>
                </div>
              </div>

              <div className="info-row">
                <ShieldCheck size={20} aria-hidden="true" />
                <div>
                  <span>Rol asignado</span>
                  <StatusBadge status={profile.role} />
                </div>
              </div>

              <div className="info-row">
                <Trophy size={20} aria-hidden="true" />
                <div>
                  <span>Estado de cuenta</span>
                  <StatusBadge status={profile.status} />
                </div>
              </div>
            </div>
          </section>

          <section className="card">
            <h2 className="card-title">
              <Camera size={20} aria-hidden="true" />
              Avatar activo
            </h2>

            <div className="profile-avatar-panel">
              {displayImage ? (
                <img src={displayImage} alt="Avatar del perfil" className="avatar avatar-lg" />
              ) : (
                <div className="avatar-placeholder avatar-lg" aria-hidden="true">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}

              <label className={`btn btn-secondary btn-md btn-block ${isSuspended ? 'disabled-label' : ''}`}>
                {loading ? 'Subiendo...' : 'Actualizar foto'}
                <input type="file" accept="image/*" onChange={handleFileChange} disabled={isSuspended || loading} className="sr-only" />
              </label>
            </div>
          </section>
        </aside>

        <section className="card">
          <h2 className="card-title">
            <Trophy size={20} aria-hidden="true" />
            Ajustes deportivos
          </h2>

          {message && <div className="alert alert-success" role="status">{message}</div>}
          {errorMsg && <div className="alert alert-danger" role="alert">{errorMsg}</div>}

          <form onSubmit={handleSubmit} className="flex-column gap-4">
            <div className="form-group mb-0">
              <label htmlFor="profile-name">Pseudónimo principal *</label>
              <div className="info-row">
                <UserRound size={18} aria-hidden="true" />
                <input
                  id="profile-name"
                  className="form-control"
                  type="text"
                  required
                  disabled={isSuspended}
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group mb-0">
              <label htmlFor="profile-number">Dorsal histórico</label>
              <div className="info-row">
                <Hash size={18} aria-hidden="true" />
                <input
                  id="profile-number"
                  className="form-control"
                  type="number"
                  placeholder="1-99"
                  disabled={isSuspended}
                  value={avatarId}
                  onChange={e => setAvatarId(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group mb-0">
              <label htmlFor="profile-position">Demarcación preferida</label>
              <select
                id="profile-position"
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

            {!isSuspended ? (
              <Button disabled={loading} type="submit">
                {loading ? 'Sincronizando...' : 'Guardar información'}
              </Button>
            ) : (
              <p className="text-sm text-danger text-center mt-4">
                La edición de información está restringida por medidas disciplinarias.
              </p>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}
