import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { apiClient, tokenStorage } from '../services/apiClient';

interface OAuthCallbackPageProps {
  provider?: 'google' | 'github' | 'discord';
  onNavigate: (path: string) => void;
}

export const OAuthCallbackPage: React.FC<OAuthCallbackPageProps> = ({ provider = 'google', onNavigate }) => {
  const { refetchMe } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      let hashParams: URLSearchParams | null = null;
      if (window.location.hash) {
        hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      }

      // Check for OAuth errors or account linking callbacks
      const errorParam = urlParams.get('error') || hashParams?.get('error');
      const errorDesc = urlParams.get('error_description') || hashParams?.get('error_description');
      const linkedParam = urlParams.get('linked') || hashParams?.get('linked');
      const providerParam = urlParams.get('provider') || hashParams?.get('provider');

      if (linkedParam === 'true') {
        window.history.replaceState({}, document.title, window.location.pathname);
        toast.success(`Connected ${providerParam || provider} account successfully`);
        onNavigate('/profile');
        return;
      }

      if (errorParam || linkedParam === 'false') {
        window.history.replaceState({}, document.title, window.location.pathname);
        setStatus('error');
        setErrorMessage(errorDesc || errorParam || 'OAuth authentication or account linking failed.');
        toast.error(errorDesc || errorParam || 'OAuth failed');
        return;
      }

      // 1. Direct access_token / refresh_token in query or hash parameter
      const directToken =
        urlParams.get('access_token') ||
        urlParams.get('token') ||
        hashParams?.get('access_token') ||
        hashParams?.get('token');

      const directRefreshToken =
        urlParams.get('refresh_token') ||
        hashParams?.get('refresh_token');

      if (directToken) {
        try {
          tokenStorage.setTokens(directToken, directRefreshToken);
          // Clean query parameters from URL history immediately for security
          window.history.replaceState({}, document.title, window.location.pathname);

          await refetchMe();
          setStatus('success');
          toast.success('Successfully authenticated via OAuth');
          setTimeout(() => onNavigate('/dashboard'), 800);
          return;
        } catch (err: any) {
          setStatus('error');
          setErrorMessage(err.message || 'Failed to process access token from URL.');
          return;
        }
      }

      // 2. Authorization Code in query params
      const code = urlParams.get('code') || hashParams?.get('code');

      if (code) {
        const detectedProvider =
          urlParams.get('provider') ||
          (window.location.pathname.includes('github')
            ? 'github'
            : window.location.pathname.includes('discord')
            ? 'discord'
            : 'google');

        const endpointsToTry = [
          `/${detectedProvider}/callback?code=${encodeURIComponent(code)}`,
          `/oauth/callback?code=${encodeURIComponent(code)}`,
        ];

        let tokenObtained: string | null = null;
        let refreshTokenObtained: string | null = null;
        let lastError: any = null;

        for (const ep of endpointsToTry) {
          try {
            const res = await apiClient.get(ep);
            if (res.data?.access_token || res.data?.token) {
              tokenObtained = res.data.access_token || res.data.token;
              refreshTokenObtained = res.data.refresh_token || null;
              break;
            }
          } catch (err: any) {
            lastError = err;
          }
        }

        if (tokenObtained) {
          tokenStorage.setTokens(tokenObtained, refreshTokenObtained);
          // Clean query parameters from URL history immediately for security
          window.history.replaceState({}, document.title, window.location.pathname);

          await refetchMe();
          setStatus('success');
          const provName = detectedProvider === 'discord' ? 'Discord' : detectedProvider === 'github' ? 'GitHub' : 'Google';
          toast.success(`Successfully authenticated with ${provName}`);
          setTimeout(() => onNavigate('/dashboard'), 800);
          return;
        } else {
          setStatus('error');
          setErrorMessage(
            lastError?.response?.data?.message ||
              lastError?.message ||
              'Failed to exchange authorization code for access token.'
          );
          return;
        }
      }

      // 3. Fallback: check if user is already authenticated in local state
      const existingToken = tokenStorage.getAccessToken();
      if (existingToken) {
        try {
          await refetchMe();
          setStatus('success');
          toast.success('Session verified');
          setTimeout(() => onNavigate('/dashboard'), 800);
          return;
        } catch {
          // Token invalid
        }
      }

      setStatus('error');
      setErrorMessage('Missing OAuth authorization code or access token in callback URL.');
    };

    processCallback();
  }, [provider]);

  const providerLabel = provider === 'google' ? 'Google' : provider === 'github' ? 'GitHub' : 'Discord';

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-xl">
        {status === 'processing' && (
          <div className="space-y-4">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Authenticating with {providerLabel}...
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Exchanging authorization code with <code className="font-mono text-indigo-500">/{provider}/callback</code>
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Authentication Successful</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Session established. Redirecting to your dashboard...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
            <h2 className="text-lg font-bold text-rose-600 dark:text-rose-400">OAuth Exchange Failed</h2>
            <p className="text-xs text-gray-600 dark:text-gray-300">{errorMessage}</p>
            <button
              onClick={() => onNavigate('/login')}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
