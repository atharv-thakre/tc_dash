import React from 'react';
import { cn } from '../../lib/utils';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default' | 'neutral' | 'purple' | 'indigo';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', size, children, className, icon }) => {
  const variantStyles: Record<BadgeVariant, string> = {
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    info: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    neutral: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
    default: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  };

  const sizeStyles = size === 'sm' ? 'px-1.5 py-0.2 text-[10px]' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium border transition-colors whitespace-nowrap',
        sizeStyles,
        variantStyles[variant],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
};
