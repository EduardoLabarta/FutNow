import type { ReactNode } from 'react';

type StatTone = 'primary' | 'success' | 'warning' | 'danger' | 'info';

interface StatCardProps {
  detail?: string;
  icon?: ReactNode;
  label: string;
  tone?: StatTone;
  value: ReactNode;
}

export function StatCard({ detail, icon, label, tone = 'primary', value }: StatCardProps) {
  return (
    <article className={`stat-card stat-card-${tone}`}>
      {icon && <div className="stat-icon">{icon}</div>}
      <div className="stat-copy">
        <span className="stat-label">{label}</span>
        <strong>{value}</strong>
        {detail && <span className="stat-detail">{detail}</span>}
      </div>
    </article>
  );
}
