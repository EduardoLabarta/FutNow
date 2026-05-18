import type { ReactNode } from 'react';

interface PageHeaderProps {
  actions?: ReactNode;
  description?: string;
  eyebrow?: string;
  headingLevel?: 1 | 2;
  meta?: ReactNode;
  title: string;
}

export function PageHeader({ actions, description, eyebrow, headingLevel = 1, meta, title }: PageHeaderProps) {
  const TitleTag = headingLevel === 2 ? 'h2' : 'h1';

  return (
    <header className="page-header">
      <div className="page-header-copy">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <TitleTag>{title}</TitleTag>
        {description && <p>{description}</p>}
        {meta && <div className="page-header-meta">{meta}</div>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </header>
  );
}
