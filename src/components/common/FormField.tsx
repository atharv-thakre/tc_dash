import React from 'react';
import { cn } from '../../lib/utils';

interface FormFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ label, error, hint, required, children, className }) => {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-slate-500 dark:text-zinc-400">{hint}</p>}
      {error && <p className="text-xs font-medium text-rose-500 dark:text-rose-400">{error}</p>}
    </div>
  );
};
