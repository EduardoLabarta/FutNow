import { useEffect, useState } from 'react';
import { CalendarPlus, ShieldCheck, Target, UserRound, UsersRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { matchService } from '../services/matchService';
import { supabase } from '../lib/supabase';
import { Button, EmptyState, MatchCard, PageHeader, StatCard, StatusBadge } from '../components/ui';
import type { Match } from '../types/match';

export default function HomePage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [errorStatus, setErrorStatus] = useState('');

  const isSuspended = profile?.status === 'SUSPENDED';

  const avatarUrl = profile?.avatar_path
    ? supabase.storage.from('avatars').getPublicUrl(profile.avatar_path).data.publicUrl
    : null;

  useEffect(() => {
    let isMounted = true;
    const fetchMatches = async () => {
      setLoadingMatches(true);
      setErrorStatus('');

      const { data, error } = await matchService.getUpcomingMatches();

      if (isMounted) {
        if (error) {
          console.error(error);
          setErrorStatus('No se pudieron obtener los partidos actuales.');
        } else {
          setMatches(data || []);
        }
        setLoadingMatches(false);
      }
    };
    void fetchMatches();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="page-container">
      {isSuspended && (
        <div className="alert alert-danger" role="alert">
          <strong>Cuenta suspendida:</strong> no puedes organizar ni unirte a nuevos partidos. Acceso de solo lectura.
        </div>
      )}

      <section className="dashboard-hero" aria-labelledby="home-title">
        <div className="panel hero-panel">
          <span className="eyebrow">FutNow</span>
          <h1 id="home-title">Convocatorias claras para jugar más rápido.</h1>
          <p>
            Encuentra partidos abiertos, crea una convocatoria y revisa tu actividad sin perderte entre chats.
          </p>
          <div className="hero-actions">
            {!isSuspended && (
              <Button leftIcon={<CalendarPlus size={18} aria-hidden="true" />} onClick={() => navigate('/matches/new')} size="lg">
                Organizar partido
              </Button>
            )}
            <Button onClick={() => navigate('/my-matches')} size="lg" variant="secondary">
              Mis partidos
            </Button>
          </div>
        </div>

        <aside className="panel live-panel" aria-label="Resumen de actividad">
          <div>
            <div className="flex-between mb-4">
              <span className="eyebrow">Actividad</span>
              <StatusBadge label="En vivo" tone="success" />
            </div>
            <div className="live-number">{matches.length}</div>
            <div className="live-label">partidos abiertos ahora</div>
          </div>
          <div className="info-row">
            <UsersRound size={22} aria-hidden="true" />
            <div>
              <span>Comunidad</span>
              <strong>Jugadores listos para completar convocatoria</strong>
            </div>
          </div>
        </aside>
      </section>

      {profile && (
        <section className="stats-grid mb-10" aria-label="Resumen del perfil">
          <StatCard
            detail={profile.name || user?.email || 'Perfil FutNow'}
            icon={
              avatarUrl ? (
                <img src={avatarUrl} alt="" className="avatar" />
              ) : (
                <UserRound size={22} aria-hidden="true" />
              )
            }
            label="Jugador"
            value={profile.name || user?.email || 'Usuario'}
          />
          <StatCard
            icon={<ShieldCheck size={22} aria-hidden="true" />}
            label="Estado"
            tone={profile.status === 'ACTIVE' ? 'success' : 'danger'}
            value={profile.status === 'ACTIVE' ? 'Activo' : 'Suspendido'}
          />
          <StatCard
            icon={<Target size={22} aria-hidden="true" />}
            label="Posición"
            tone="warning"
            value={profile.preferred_position || 'No definida'}
          />
        </section>
      )}

      <section>
        <PageHeader
          actions={<StatusBadge label={`${matches.length} disponibles`} tone="info" />}
          description="Explora los próximos partidos abiertos y confirma tu plaza cuando encaje contigo."
          eyebrow="Convocatorias"
          headingLevel={2}
          title="Próximos partidos"
        />

        {loadingMatches && <div className="loading-state">Cargando disponibilidad...</div>}
        {errorStatus && <div className="alert alert-danger" role="alert">{errorStatus}</div>}

        {!loadingMatches && !errorStatus && matches.length === 0 && (
          <EmptyState
            action={
              !isSuspended && (
                <Button leftIcon={<CalendarPlus size={18} aria-hidden="true" />} onClick={() => navigate('/matches/new')}>
                  Crear el primer partido
                </Button>
              )
            }
            description="Todavía no hay convocatorias abiertas. Puedes iniciar una y dejar que el resto se sume."
            icon={<CalendarPlus size={26} aria-hidden="true" />}
            title="No hay partidos en este momento"
          />
        )}

        {matches.length > 0 && (
          <div className="match-list">
            {matches.map(match => (
              <MatchCard key={match.id} match={match} onView={id => navigate(`/matches/${id}`)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
