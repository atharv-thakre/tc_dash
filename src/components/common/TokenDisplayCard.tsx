import React, { useState } from 'react';
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  Key,
  Layers,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { toast } from 'sonner';
import { tokenStorage } from '../../services/apiClient';
import { Badge } from './Badge';

interface TokenDisplayCardProps {
  title?: string;
  description?: string;
  className?: string;
  showDualToken?: boolean;
}

export const TokenDisplayCard: React.FC<TokenDisplayCardProps> = ({
  title = 'Active Authentication Token',
  description = 'Your signed JSON Web Token (JWT) used to authenticate API requests.',
  className = '',
  showDualToken = true,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<{ access: boolean; refresh: boolean }>({
    access: false,
    refresh: false,
  });

  const accessToken = tokenStorage.getAccessToken() || '';
  const refreshToken = tokenStorage.getRefreshToken() || '';
  const isDualMode = Boolean(refreshToken);

  const handleCopy = (text: string, type: string, successMessage: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    toast.success(successMessage);
    setTimeout(() => {
      setCopiedType(null);
    }, 2000);
  };

  const maskToken = (token: string) => {
    if (!token) return 'No token stored';
    if (token.length <= 32) return token;
    return `${token.slice(0, 18)}••••••••••••••••••••••••••••••••${token.slice(-10)}`;
  };

  return (
    <div className={`rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-2xs space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{title}</span>
              <Badge variant={isDualMode ? 'success' : 'default'} size="sm">
                {isDualMode ? 'Dual-Token Mode' : 'Single-Token Mode'}
              </Badge>
            </h3>
            {description && (
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{description}</p>
            )}
          </div>
        </div>

        {/* Mode info label */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
            {isDualMode ? 'Short-lived (15m) + Auto Refresh' : 'Long-lived (7d) Bearer'}
          </span>
        </div>
      </div>

      {/* Access Token Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
              Access Token (Bearer)
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40">
              Header: Authorization
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Reveal / Mask */}
            <button
              type="button"
              onClick={() => setRevealed((prev) => ({ ...prev, access: !prev.access }))}
              disabled={!accessToken}
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg border border-slate-200 dark:border-zinc-700/60 transition-colors cursor-pointer disabled:opacity-40"
              title={revealed.access ? 'Mask token' : 'Reveal entire token string'}
            >
              {revealed.access ? (
                <>
                  <EyeOff className="w-3 h-3 text-slate-500 dark:text-zinc-400" />
                  <span>Mask</span>
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3 text-slate-500 dark:text-zinc-400" />
                  <span>Reveal</span>
                </>
              )}
            </button>

            {/* Copy Bearer Header */}
            <button
              type="button"
              onClick={() =>
                handleCopy(
                  `Bearer ${accessToken}`,
                  'access-header',
                  'Bearer authorization header copied'
                )
              }
              disabled={!accessToken}
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg border border-slate-200 dark:border-zinc-700/60 transition-colors cursor-pointer disabled:opacity-40"
              title="Copy 'Bearer <token>' for HTTP headers"
            >
              {copiedType === 'access-header' ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-500 font-bold">Copied Header</span>
                </>
              ) : (
                <>
                  <Terminal className="w-3 h-3" />
                  <span>Bearer Header</span>
                </>
              )}
            </button>

            {/* Copy Raw Token */}
            <button
              type="button"
              onClick={() => handleCopy(accessToken, 'access-raw', 'Access token copied to clipboard')}
              disabled={!accessToken}
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer disabled:opacity-40 shadow-2xs ${
                copiedType === 'access-raw'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-300 font-bold'
                  : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white border-indigo-500/30'
              }`}
              title="Copy access token"
            >
              {copiedType === 'access-raw' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Token</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Token String Container */}
        <div className="relative group">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 font-mono text-[11px] text-slate-800 dark:text-zinc-200 break-all select-all leading-relaxed transition-colors">
            {accessToken ? (
              revealed.access ? (
                <span>{accessToken}</span>
              ) : (
                <span className="tracking-wide text-slate-600 dark:text-zinc-400">
                  {maskToken(accessToken)}
                </span>
              )
            ) : (
              <span className="text-slate-400 dark:text-zinc-500 italic">
                No active token in local storage. Sign in to issue a token.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Refresh Token Section (if Dual Token Mode) */}
      {showDualToken && isDualMode && (
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                Refresh Token
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                Long-lived (7d) · Rotates
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setRevealed((prev) => ({ ...prev, refresh: !prev.refresh }))}
                disabled={!refreshToken}
                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg border border-slate-200 dark:border-zinc-700/60 transition-colors cursor-pointer disabled:opacity-40"
              >
                {revealed.refresh ? (
                  <>
                    <EyeOff className="w-3 h-3" />
                    <span>Mask</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3" />
                    <span>Reveal</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  handleCopy(refreshToken, 'refresh-raw', 'Refresh token copied to clipboard')
                }
                disabled={!refreshToken}
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer disabled:opacity-40 shadow-2xs ${
                  copiedType === 'refresh-raw'
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-300 font-bold'
                    : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border-slate-200 dark:border-zinc-700'
                }`}
              >
                {copiedType === 'refresh-raw' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Refresh Token</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 font-mono text-[11px] text-emerald-600 dark:text-emerald-400/90 break-all select-all leading-relaxed">
            {revealed.refresh ? (
              <span>{refreshToken}</span>
            ) : (
              <span className="tracking-wide text-emerald-600/70 dark:text-emerald-500/70">
                {maskToken(refreshToken)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
