import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  gradientHover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, gradientHover = false, ...props }) => {
  return (
    <div
      className={cn(
        'rounded-xl border bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 p-6 shadow-2xs transition-all duration-200',
        gradientHover && 'hover:border-indigo-500/50 hover:shadow-md dark:hover:border-zinc-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('flex flex-col space-y-1.5 mb-4', className)}>{children}</div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <h3 className={cn('text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100', className)}>{children}</h3>
);

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <p className={cn('text-sm text-slate-500 dark:text-zinc-400', className)}>{children}</p>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('space-y-4', className)}>{children}</div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('flex items-center pt-4 border-t border-slate-100 dark:border-zinc-800 mt-4', className)}>
    {children}
  </div>
);
