type BadgeTone = 'success' | 'danger' | 'warning' | 'info' | 'secondary';

interface StatusBadgeProps {
  label?: string;
  status?: string | boolean | null;
  tone?: BadgeTone;
}

const toneByStatus: Record<string, BadgeTone> = {
  ACTIVE: 'success',
  ACTIVO: 'success',
  ADMIN: 'warning',
  CANCELLED: 'danger',
  CERRADO: 'danger',
  INACTIVO: 'danger',
  OPEN: 'success',
  SUSPENDED: 'danger',
  USER: 'secondary',
};

export function StatusBadge({ label, status, tone }: StatusBadgeProps) {
  const normalized = typeof status === 'boolean' ? (status ? 'ACTIVO' : 'INACTIVO') : status ?? label ?? '';
  const resolvedTone = tone ?? toneByStatus[String(normalized).toUpperCase()] ?? 'secondary';
  const text = label ?? String(normalized);

  return <span className={`badge badge-${resolvedTone}`}>{text}</span>;
}
