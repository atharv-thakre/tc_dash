import React, { useState } from 'react';
import { AlertCircle, RefreshCw, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { ApiErrorDetails } from '../../services/apiClient';

interface ErrorStateProps {
  title?: string;
  message?: string;
  details?: string | ApiErrorDetails;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'An error occurred',
  message = 'Unable to complete request.',
  details,
  onRetry,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center bg-rose-500/5 border border-rose-500/20 rounded-2xl max-w-md mx-auto my-6">
      <div className="p-2.5 rounded-full bg-rose-500/10 text-rose-500 mb-2.5">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-rose-600 dark:text-rose-400">{title}</h3>
      <p className="text-xs text-zinc-400 mt-1 max-w-sm">{message}</p>

      {details && (
        <div className="w-full mt-3">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400/90 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <Info className="w-3 h-3" />
            <span>{showDetails ? 'Hide Details' : 'View Details'}</span>
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showDetails && (
            <div className="mt-2 p-3 text-left bg-zinc-950/80 border border-zinc-800/80 rounded-xl text-[10px] font-mono text-zinc-300 space-y-1 overflow-x-auto max-h-48">
              {typeof details === 'string' ? (
                <p className="whitespace-pre-wrap">{details}</p>
              ) : (
                <>
                  {details.url && <p><span className="text-zinc-500 font-sans">URL:</span> {details.url}</p>}
                  {details.code && <p><span className="text-zinc-500 font-sans">Code:</span> {details.code}</p>}
                  {details.timestamp && <p><span className="text-zinc-500 font-sans">Time:</span> {details.timestamp}</p>}
                  {details.suggestions?.length > 0 && (
                    <div className="pt-1 text-zinc-400 font-sans">
                      <p className="font-semibold text-zinc-300">Suggestions:</p>
                      <ul className="list-disc list-inside space-y-0.5 mt-0.5">
                        {details.suggestions.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Request
        </button>
      )}
    </div>
  );
};
