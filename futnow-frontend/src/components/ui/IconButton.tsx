import type { ButtonHTMLAttributes, ReactNode } from 'react';

type IconButtonVariant = 'secondary' | 'ghost' | 'danger';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  children: ReactNode;
  variant?: IconButtonVariant;
}

export function IconButton({
  children,
  className = '',
  type = 'button',
  variant = 'ghost',
  ...props
}: IconButtonProps) {
  return (
    <button
      className={['icon-button', `icon-button-${variant}`, className].filter(Boolean).join(' ')}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
