import { useEffect, useState } from 'react';
import { ArrowRight, CalendarClock, CircleX, MapPin, Trophy, UsersRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { matchService } from '../services/matchService';
import { Button, EmptyState, PageHeader, StatCard, StatusBadge } from '../components/ui';
import type { Match, MatchJoined } from '../types/match';

export default function MyMatchesPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const userId = user?.id;

  const [organized, setOrganized] = useState<Match[]>([]);
  const [joined, setJoined] = useState<MatchJoined[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (!userId) return;
      setLoading(true);
      setErrorMsg('');

      const [orgRes, joinRes] = await Promise.all([
        matchService.getMatchesOrganizedByUser(userId),
        matchService.getMatchesJoinedByUser(userId)
      ]);

      if (isMounted) {
        if (orgRes.error || joinRes.error) {
          setErrorMsg('Error cargando tu información deportiva.');
        } else {
          setOrganized(orgRes.data || []);
          setJoined(joinRes.data || []);
        }
        setLoading(false);
      }
    };
    void loadData();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  if (!user || !profile) return <div className="loading-state">Sincronizando identidad...</div>;

  const isSuspended = profile.status === 'SUSPENDED';

  const totalOrganized = organized.length;
  const totalJoined = joined.length;
  const totalCancelled =
    organized.filter(m => m.status === 'CANCELLED').length +
    joined.filter(j => j.matches?.status === 'CANCELLED').length;

  const now = new Date();
  const upcomingOrganized = organized.filter(m => m.status === 'OPEN' && new Date(m.scheduled_at) > now);
  const upcomingJoinedMatches = joined
    .filter(j => j.matches && j.matches.status === 'OPEN' && new Date(j.matches.scheduled_at) > now)
    .map(j => j.matches as Match);

  const upcomingMap = new Map<string, Match>();
  upcomingOrganized.forEach(m => upcomingMap.set(m.id, m));
  upcomingJoinedMatches.forEach(m => upcomingMap.set(m.id, m));

  const upcomingMatches = Array.from(upcomingMap.values()).sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  const nextMatch = upcomingMatches.length > 0 ? upcomingMatches[0] : null;

  const renderCompactMatch = (match: Match) => (
    <article key={match.id} className="compact-item">
      <div className="icon-box">
        <CalendarClock size={18} aria-hidden="true" />
      </div>
      <div className="compact-item-copy">
        <div className="compact-item-head">
          <strong className="text-main">{match.title}</strong>
          <StatusBadge status={match.status} />
        </div>
        <p className="m-0 text-sm">
          <CalendarClock size={14} aria-hidden="true" />{' '}
          {new Date(match.scheduled_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
        </p>
        <p className="m-0 text-sm">
          <MapPin size={14} aria-hidden="true" /> {match.venue_name || match.location}
        </p>
        <Button onClick={() => navigate(`/matches/${match.id}`)} rightIcon={<ArrowRight size={16} aria-hidden="true" />} size="sm" variant="secondary">
          Ver partido
        </Button>
      </div>
    </article>
  );

  return (
    <div className="page-container">
      <PageHeader
        description="Consulta tus partidos organizados, participaciones y próximos compromisos."
        eyebrow="Actividad personal"
        title="Mis partidos"
      />

      {isSuspended && (
        <div className="alert alert-danger" role="alert">
          <strong>Cuenta suspendida:</strong> puedes ver tu historial, pero no organizar ni apuntarte a partidos.
        </div>
      )}

      {errorMsg && <div className="alert alert-danger" role="alert">{errorMsg}</div>}

      {loading ? (
        <div className="loading-state">Cargando tus partidos...</div>
      ) : (
        <>
          <section className="stats-grid mb-8" aria-label="Resumen de actividad">
            <StatCard icon={<Trophy size={22} aria-hidden="true" />} label="Organizados" value={totalOrganized} />
            <StatCard icon={<UsersRound size={22} aria-hidden="true" />} label="Participaciones" tone="success" value={totalJoined} />
            <StatCard icon={<CircleX size={22} aria-hidden="true" />} label="Cancelados" tone="danger" value={totalCancelled} />
          </section>

          <section className="card tone-warning">
            <div className="section-title">
              <div>
                <h2>Próximo partido</h2>
                <p>El siguiente compromiso confirmado en tu calendario.</p>
              </div>
            </div>
            {nextMatch ? (
              <div className="info-row">
                <CalendarClock size={22} aria-hidden="true" />
                <div>
                  <span>{new Date(nextMatch.scheduled_at).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}</span>
                  <strong>{nextMatch.title}</strong>
                  <div className="mt-4">
                    <Button onClick={() => navigate(`/matches/${nextMatch.id}`)} rightIcon={<ArrowRight size={16} aria-hidden="true" />} size="sm">
                      Ver detalles
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                description="No hay próximos partidos programados. Cuando confirmes una plaza, aparecerá aquí."
                icon={<CalendarClock size={26} aria-hidden="true" />}
                title="Sin próximos partidos"
              />
            )}
          </section>

          <div className="content-grid">
            <section className="card">
              <h2 className="card-title">Partidos que organizo</h2>
              {organized.length === 0 ? (
                <EmptyState
                  description="Todavía no has organizado ningún partido."
                  icon={<Trophy size={26} aria-hidden="true" />}
                  title="Sin convocatorias propias"
                />
              ) : (
                <div className="compact-list">{organized.map(renderCompactMatch)}</div>
              )}
            </section>

            <section className="card">
              <h2 className="card-title">Participaciones confirmadas</h2>
              {joined.length === 0 ? (
                <EmptyState
                  description="Aún no estás apuntado a ningún partido."
                  icon={<UsersRound size={26} aria-hidden="true" />}
                  title="Sin participaciones"
                />
              ) : (
                <div className="compact-list">
                  {joined.map(j => (j.matches ? renderCompactMatch(j.matches) : null))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
