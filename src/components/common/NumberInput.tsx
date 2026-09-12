import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface NumberInputProps {
  value: number | string | undefined;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  unit?: string;
  id?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  unit,
  id,
}) => {
  const numericValue = typeof value === 'number' ? value : Number(value) || 0;

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;
    const next = numericValue - step;
    if (min !== undefined && next < min) {
      onChange(min);
    } else {
      onChange(next);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;
    const next = numericValue + step;
    if (max !== undefined && next > max) {
      onChange(max);
    } else {
      onChange(next);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (rawVal === '') {
      onChange(min ?? 0);
      return;
    }
    const parsed = Number(rawVal);
    if (!isNaN(parsed)) {
      if (max !== undefined && parsed > max) {
        onChange(max);
      } else if (min !== undefined && parsed < min) {
        onChange(min);
      } else {
        onChange(parsed);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleIncrement(e as unknown as React.MouseEvent);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleDecrement(e as unknown as React.MouseEvent);
    }
  };

  const isMinReached = min !== undefined && numericValue <= min;
  const isMaxReached = max !== undefined && numericValue >= max;

  return (
    <div className="relative flex items-center group w-full">
      <input
        type="number"
        id={id}
        value={value ?? ''}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full pl-3 pr-16 py-2 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all ${className}`}
      />

      <div className="absolute right-1.5 flex items-center gap-1">
        {unit && (
          <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase mr-0.5 select-none pointer-events-none">
            {unit}
          </span>
        )}

        {/* Seamless stepper buttons perfectly blended into input theme */}
        <div className="flex items-center gap-0.5 bg-zinc-100 dark:bg-zinc-900/90 p-0.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={disabled || isMinReached}
            className="w-5 h-5 flex items-center justify-center rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-zinc-800 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            title="Decrease"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={handleIncrement}
            disabled={disabled || isMaxReached}
            className="w-5 h-5 flex items-center justify-center rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-zinc-800 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            title="Increase"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
