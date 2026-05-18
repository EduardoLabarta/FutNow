import { ArrowRight, CalendarClock, MapPin, UsersRound } from 'lucide-react';
import type { Match } from '../../types/match';
import { Button } from './Button';
import { StatusBadge } from './StatusBadge';

interface MatchCardProps {
  match: Match;
  onView: (id: string) => void;
}

export function MatchCard({ match, onView }: MatchCardProps) {
  return (
    <article className="match-card">
      <div className="match-card-header">
        <h3>{match.title}</h3>
        <StatusBadge status={match.status} />
      </div>

      <dl className="match-meta-list">
        <div>
          <dt>
            <CalendarClock size={16} aria-hidden="true" />
            Fecha
          </dt>
          <dd>{new Date(match.scheduled_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</dd>
        </div>
        <div>
          <dt>
            <MapPin size={16} aria-hidden="true" />
            Sede
          </dt>
          <dd>{match.venue_name || match.location}</dd>
        </div>
        <div>
          <dt>
            <UsersRound size={16} aria-hidden="true" />
            Capacidad
          </dt>
          <dd>{match.max_players} jugadores</dd>
        </div>
      </dl>

      <Button
        className="match-card-action"
        fullWidth
        onClick={() => onView(match.id)}
        rightIcon={<ArrowRight size={16} aria-hidden="true" />}
        variant="secondary"
      >
        Ver detalles
      </Button>
    </article>
  );
}
