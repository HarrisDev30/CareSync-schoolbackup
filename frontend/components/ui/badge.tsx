import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'purple';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'border-transparent bg-primary text-primary-foreground shadow-xs hover:bg-primary/80',
    secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
    success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    warning: 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400',
    purple: 'border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400',
    outline: 'border-border text-foreground hover:bg-muted',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
