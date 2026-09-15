import React from 'react';
import { cn } from '@/lib/utils';
import { DESIGN_TOKENS } from '@/lib/tokens';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  statusKey?: keyof typeof DESIGN_TOKENS.statusStyles;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export function Badge({ className, statusKey, variant = 'default', children, ...props }: BadgeProps) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
  };

  const styleClass = statusKey
    ? DESIGN_TOKENS.statusStyles[statusKey] || variantStyles[variant]
    : variantStyles[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize',
        styleClass,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
