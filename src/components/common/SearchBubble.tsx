import React from 'react';
import { Search, RotateCw, X } from 'lucide-react';

export interface SearchFieldOption {
  key: string;
  label: string;
}

interface SearchBubbleProps {
  fields: SearchFieldOption[];
  activeFieldKey: string;
  onFieldChange: (fieldKey: string) => void;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  onSearchSubmit: () => void;
  onReset?: () => void;
  isLoading?: boolean;
  className?: string;
}

export const SearchBubble: React.FC<SearchBubbleProps> = ({
  fields,
  activeFieldKey,
  onFieldChange,
  searchValue,
  onSearchValueChange,
  onSearchSubmit,
  onReset,
  isLoading = false,
  className = '',
}) => {
  const activeIndex = fields.findIndex((f) => f.key === activeFieldKey);
  const currentField = fields[activeIndex >= 0 ? activeIndex : 0] || { key: 'id', label: 'ID' };

  const handleCycleField = () => {
    if (fields.length === 0) return;
    const nextIndex = (activeIndex + 1) % fields.length;
    onFieldChange(fields[nextIndex].key);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearchSubmit();
    }
  };

  return (
    <div
      className={`relative flex items-center gap-2 p-1.5 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs hover:shadow-md focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-500/50 transition-all w-full ${className}`}
    >
      {/* Min Bubble - Cycling Field Selector */}
      <button
        type="button"
        onClick={handleCycleField}
        title="Click to cycle through search fields"
        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-[11px] sm:text-xs font-semibold select-none cursor-pointer active:scale-95 transition-all shadow-2xs whitespace-nowrap group shrink-0"
      >
        <RotateCw className="w-3 h-3 text-indigo-500 group-hover:rotate-180 transition-transform duration-300 shrink-0" />
        <span><span className="hidden sm:inline">Field: </span><strong className="font-bold text-indigo-700 dark:text-indigo-300">{currentField.label}</strong></span>
        <span className="text-[9px] sm:text-[10px] text-indigo-400 dark:text-indigo-500 font-mono bg-indigo-100 dark:bg-indigo-900/80 px-1.5 py-0.2 sm:py-0.5 rounded-full ml-0.5">
          {activeIndex + 1}/{fields.length}
        </span>
      </button>

      {/* Input Field on the left */}
      <div className="relative flex-1 flex items-center min-w-0">
        <input
          type="text"
          value={searchValue || ''}
          onChange={(e) => onSearchValueChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Query by ${currentField.label.toLowerCase()}...`}
          className="w-full bg-transparent border-0 text-[11px] sm:text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-0 px-1.5 sm:px-2 py-1 min-w-0"
        />

        {searchValue && (
          <button
            type="button"
            onClick={() => {
              onSearchValueChange('');
              if (onReset) onReset();
            }}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mr-1 shrink-0"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Search Button on the right */}
      <button
        type="button"
        onClick={onSearchSubmit}
        disabled={isLoading}
        className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] sm:text-xs font-semibold shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer disabled:opacity-60 shrink-0"
      >
        <Search className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">{isLoading ? 'Querying...' : 'Search'}</span>
      </button>
    </div>
  );
};
