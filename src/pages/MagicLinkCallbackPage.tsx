import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface MagicLinkCallbackPageProps {
  onNavigate?: (path: string) => void;
}

export const MagicLinkCallbackPage: React.FC<MagicLinkCallbackPageProps> = ({ onNavigate }) => {
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const verified = searchParams.get('verified');
  const email = searchParams.get('email');
  const error = searchParams.get('error');

  const [isLoading, setIsLoading] = useState(!error && !verified);

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  useEffect(() => {
    // If no explicit error or verified query parameter, set loading to false after brief check
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [verified, error]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-md bg-zinc-900/90 border border-zinc-800/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl text-center"
      >
        {isLoading ? (
          <div className="py-8 space-y-4">
            <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-white">Validating Magic Link</h2>
            <p className="text-sm text-zinc-400">Verifying authentication token and redirecting...</p>
          </div>
        ) : error ? (
          <div className="py-4 space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Authentication Failed</h2>
              <p className="text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
                {decodeURIComponent(error)}
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                <span>Request New Magic Link</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full py-2 px-4 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
              >
                Back to Home
              </button>
            </div>
          </div>
        ) : verified === 'true' ? (
          <div className="py-4 space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Email Verified!</h2>
              <p className="text-sm text-zinc-300">
                Your email <span className="font-semibold text-emerald-400">{email || 'address'}</span> has been successfully verified.
              </p>
              <p className="text-xs text-zinc-400">
                Your account is active and you can now sign in immediately.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full py-2 px-4 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
              >
                Back to Home
              </button>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Magic Link Portal</h2>
              <p className="text-sm text-zinc-400">
                Authentication link processed. You may proceed to your dashboard or login.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-2 px-4 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
