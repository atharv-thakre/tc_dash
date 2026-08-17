import React, { createContext, useContext, useEffect, useState } from 'react';
import { LOCAL_STORAGE_TOKEN_KEY } from '../services/apiClient';
import { authService } from '../services/auth';
import { profileService } from '../services/profile';
import {
  Account,
  ForgotPasswordInput,
  LoginOTPInput,
  LoginPasswordInput,
  PatchMeInput,
  SessionInfo,
  SignupOTPInput,
  SignupPasswordInput,
} from '../types';
import { useApiConfig } from './ApiConfigContext';

interface AuthContextType {
  account: Account | null;
  session: SessionInfo | null;
  payload: Record<string, unknown> | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  loginPassword: (input: LoginPasswordInput) => Promise<void>;
  loginOTP: (input: LoginOTPInput) => Promise<void>;
  signupPassword: (input: SignupPasswordInput) => Promise<void>;
  signupOTP: (input: SignupOTPInput) => Promise<void>;
  forgotPassword: (input: ForgotPasswordInput) => Promise<void>;
  patchMe: (input: PatchMeInput) => Promise<void>;
  loginOAuth: (provider: 'google' | 'github') => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refetchMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getInitialToken(): string | null {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromQuery = urlParams.get('access_token') || urlParams.get('token');
    if (tokenFromQuery) {
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, tokenFromQuery);
      return tokenFromQuery;
    }
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const tokenFromHash = hashParams.get('access_token') || hashParams.get('token');
      if (tokenFromHash) {
        localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, tokenFromHash);
        return tokenFromHash;
      }
    }
  } catch {
    // ignore
  }
  return localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<Account | null>(null);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [payload, setPayload] = useState<Record<string, unknown> | null>(null);
  const [token, setToken] = useState<string | null>(getInitialToken);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { apiMode } = useApiConfig();

  const clearAuthAndRedirectToLogin = () => {
    localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
    setToken(null);
    setAccount(null);
    setSession(null);
    setPayload(null);
    const path = window.location.pathname;
    if (path === '/' || path === '/landing' || path.startsWith('/docs') || path === '/signup') {
      return;
    }
    if (path !== '/login') {
      window.history.pushState({}, '', '/login');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const fetchMe = async () => {
    setIsLoading(true);
    try {
      const data = await profileService.getMe();
      setAccount(data.account);
      setSession(data.session || null);
      setPayload(data.payload || null);
    } catch {
      // If error fetching profile, reset user state and clear invalid token
      setAccount(null);
      setSession(null);
      setPayload(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, [apiMode]);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearAuthAndRedirectToLogin();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const loginPassword = async (input: LoginPasswordInput) => {
    const res = await authService.loginPassword(input);
    setToken(res.access_token);
    setAccount(res.account);
    await fetchMe();
  };

  const loginOTP = async (input: LoginOTPInput) => {
    const res = await authService.loginOTP(input);
    setToken(res.access_token);
    setAccount(res.account);
    await fetchMe();
  };

  const signupPassword = async (input: SignupPasswordInput) => {
    const res = await authService.signupPassword(input);
    setToken(res.access_token);
    setAccount(res.account);
    await fetchMe();
  };

  const signupOTP = async (input: SignupOTPInput) => {
    const res = await authService.signupOTP(input);
    setToken(res.access_token);
    setAccount(res.account);
    await fetchMe();
  };

  const forgotPassword = async (input: ForgotPasswordInput) => {
    const res = await authService.forgotPassword(input);
    setToken(res.access_token);
    setAccount(res.account);
    await fetchMe();
  };

  const patchMe = async (input: PatchMeInput) => {
    await profileService.patchMe(input);
    await fetchMe();
  };

  const loginOAuth = async (provider: 'google' | 'github') => {
    const res = await authService.loginOAuthDemo(provider);
    setToken(res.access_token);
    setAccount(res.account);
    await fetchMe();
  };

  const logout = async () => {
    try {
      await profileService.logout();
    } catch (err) {
      console.warn('Logout API call failed or session already expired:', err);
    } finally {
      clearAuthAndRedirectToLogin();
    }
  };

  const logoutAll = async () => {
    try {
      await profileService.logoutAll();
    } catch (err) {
      console.warn('LogoutAll API call failed or session already expired:', err);
    } finally {
      clearAuthAndRedirectToLogin();
    }
  };

  const isSuperAdmin = account?.role === 'superadmin';
  const isAuthenticated = !!account;

  return (
    <AuthContext.Provider
      value={{
        account,
        session,
        payload,
        token,
        isLoading,
        isAuthenticated,
        isSuperAdmin,
        loginPassword,
        loginOTP,
        signupPassword,
        signupOTP,
        forgotPassword,
        patchMe,
        loginOAuth,
        logout,
        logoutAll,
        refetchMe: fetchMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
