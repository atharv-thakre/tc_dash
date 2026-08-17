import React from 'react';
import { Moon } from 'lucide-react';

export const ThemeSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 font-medium ${className}`}
      title="Dark Mode Enabled"
    >
      <Moon className="w-3.5 h-3.5 text-indigo-400" />
      <span>Dark</span>
    </div>
  );
};

