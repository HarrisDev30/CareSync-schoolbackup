import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'purple';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'border-transparent bg-blue-600 text-white shadow-2xs hover:bg-blue-700',
    secondary: 'border-transparent bg-slate-100 text-slate-800 hover:bg-slate-200/80',
    destructive: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    warning: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
    purple: 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100',
    outline: 'border-slate-200 text-slate-700 hover:bg-slate-50',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
