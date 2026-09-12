import {
  AuthResponse,
  ForgotPasswordInput,
  LoginOTPInput,
  LoginPasswordInput,
  OTPPurpose,
  SendEmailOTPInput,
  SendEmailOTPResponse,
  SignupOTPInput,
  SignupPasswordInput,
} from '../types';
import {
  apiClient,
  getCustomBaseUrl,
  getStoredApiMode,
  LOCAL_STORAGE_REFRESH_TOKEN_KEY,
  LOCAL_STORAGE_TOKEN_KEY,
  requestWithFallback,
} from './apiClient';
import { INITIAL_ACCOUNTS } from './mockData';

// Local storage key for demo accounts
const DEMO_ACCOUNTS_KEY = 'tc_auth_demo_accounts';

export function getDemoAccounts() {
  const data = localStorage.getItem(DEMO_ACCOUNTS_KEY);
  if (!data) {
    localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(INITIAL_ACCOUNTS));
    return INITIAL_ACCOUNTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_ACCOUNTS;
  }
}

export function saveDemoAccounts(accounts: any[]) {
  localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(accounts));
}

function extractAuthResponse(resData: any): AuthResponse {
  const payload = resData?.data || resData || {};
  const access_token = payload.access_token || payload.token || payload.accessToken || payload.jwt || '';
  const refresh_token = payload.refresh_token || payload.refreshToken || undefined;
  const token_type = payload.token_type || payload.tokenType || 'Bearer';
  const account = payload.account || payload.user || payload.account_data || payload.data?.account || payload.data?.user || null;

  if (!access_token && !account && !payload.id && !payload.email && !payload.handle) {
    throw new Error('Invalid authentication response from server. Please check server connection.');
  }

  if (refresh_token) {
    localStorage.setItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY, refresh_token);
  }

  return {
    access_token,
    refresh_token,
    token_type,
    account: account || {
      id: payload.id || 'acc_unknown',
      uid: payload.uid || 'uid_unknown',
      name: payload.name || payload.email?.split('@')[0] || 'User',
      handle: payload.handle || payload.email?.split('@')[0] || 'user',
      email: payload.email || '',
      phone: payload.phone || null,
      avatar_url: payload.avatar_url || null,
      role: payload.role || 'user',
      status: payload.status || 'active',
      created_at: payload.created_at || new Date().toISOString(),
      updated_at: payload.updated_at || new Date().toISOString(),
    },
  };
}

export const authService = {
  // POST /send/email/otp/{purpose}
  async sendEmailOTP(purpose: OTPPurpose = 'login', input: SendEmailOTPInput): Promise<SendEmailOTPResponse> {
    const validPurpose = purpose || 'login';
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const expires_at = Math.floor(Date.now() / 1000) + 600;
      return { expires_at };
    }
    const resData = await requestWithFallback<any>('post', [
      `/send/email/otp/${validPurpose}`,
      `/send/email/otp/${validPurpose}/`,
      `/otp/send/${validPurpose}`,
    ], input);
    const data = resData?.data || resData || {};
    if (typeof data === 'object' && data !== null && 'expires_at' in data) {
      return { expires_at: data.expires_at };
    }
    return { expires_at: data };
  },

  // POST /signup/otp
  async signupOTP(input: SignupOTPInput): Promise<AuthResponse> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const accounts = getDemoAccounts();
      const newAcc = {
        id: `acc_${Date.now()}`,
        uid: `uid_${Date.now()}`,
        name: input.name,
        handle: input.handle || input.email.split('@')[0],
        email: input.email,
        phone: null,
        avatar_url: null,
        role: 'user' as const,
        status: 'active' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      accounts.push(newAcc);
      saveDemoAccounts(accounts);

      const response: AuthResponse = {
        access_token: `tc_demo_token_${newAcc.id}_${Date.now()}`,
        token_type: 'Bearer',
        account: newAcc,
      };
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, response.access_token);
      return response;
    }
    const resData = await requestWithFallback<any>('post', ['/signup/otp', '/signup/otp/'], input);
    const authRes = extractAuthResponse(resData);
    if (authRes.access_token) {
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, authRes.access_token);
    }
    return authRes;
  },

  // POST /signup/password
  async signupPassword(input: SignupPasswordInput): Promise<AuthResponse> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const accounts = getDemoAccounts();
      const existing = accounts.find(
        (a: any) => a.email.toLowerCase() === input.email.toLowerCase() || a.handle === input.handle
      );
      if (existing) {
        throw new Error('Account with this email or handle already exists');
      }

      const newAcc = {
        id: `acc_${Date.now()}`,
        uid: `uid_${Date.now()}`,
        name: input.name,
        handle: input.handle,
        email: input.email,
        phone: null,
        avatar_url: null,
        role: 'user' as const,
        status: 'active' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      accounts.push(newAcc);
      saveDemoAccounts(accounts);

      const response: AuthResponse = {
        access_token: `tc_demo_token_${newAcc.id}_${Date.now()}`,
        token_type: 'Bearer',
        account: newAcc,
      };
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, response.access_token);
      return response;
    }
    const resData = await requestWithFallback<any>('post', ['/signup/password', '/signup/password/'], input);
    const authRes = extractAuthResponse(resData);
    if (authRes.access_token) {
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, authRes.access_token);
    }
    return authRes;
  },

  // POST /login/otp
  async loginOTP(input: LoginOTPInput): Promise<AuthResponse> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const accounts = getDemoAccounts();
      let acc = accounts.find((a: any) => a.email.toLowerCase() === input.email.toLowerCase());
      if (!acc) {
        acc = {
          id: `acc_${Date.now()}`,
          uid: `uid_${Date.now()}`,
          name: input.email.split('@')[0],
          handle: input.email.split('@')[0],
          email: input.email,
          phone: null,
          avatar_url: null,
          role: 'user' as const,
          status: 'active' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        accounts.push(acc);
        saveDemoAccounts(accounts);
      }

      const response: AuthResponse = {
        access_token: `tc_demo_token_${acc.id}_${Date.now()}`,
        token_type: 'Bearer',
        account: acc,
      };
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, response.access_token);
      return response;
    }
    const resData = await requestWithFallback<any>('post', ['/login/otp', '/login/otp/'], input);
    const authRes = extractAuthResponse(resData);
    if (authRes.access_token) {
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, authRes.access_token);
    }
    return authRes;
  },

  // POST /login/password
  async loginPassword(input: LoginPasswordInput): Promise<AuthResponse> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const accounts = getDemoAccounts();
      let acc = accounts.find(
        (a: any) =>
          a.email.toLowerCase() === input.identifier.toLowerCase() ||
          a.handle.toLowerCase() === input.identifier.toLowerCase()
      );

      if (!acc) {
        // Fallback for demo mode matching superadmin or creating user
        if (input.identifier.toLowerCase().includes('admin') || input.identifier.toLowerCase().includes('atharv')) {
          acc = accounts[0];
        } else {
          throw new Error('Invalid email/handle or password');
        }
      }

      const response: AuthResponse = {
        access_token: `tc_demo_token_${acc.id}_${Date.now()}`,
        token_type: 'Bearer',
        account: acc,
      };
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, response.access_token);
      return response;
    }

    const resData = await requestWithFallback<any>('post', [
      '/login/password',
      '/login/password/',
      '/login',
      '/login/',
    ], input);

    const authRes = extractAuthResponse(resData);
    if (authRes.access_token) {
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, authRes.access_token);
    }
    return authRes;
  },

  // POST /forgot/password
  async forgotPassword(input: ForgotPasswordInput): Promise<AuthResponse> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const accounts = getDemoAccounts();
      let acc = accounts.find((a: any) => a.email.toLowerCase() === input.email.toLowerCase());
      if (!acc) {
        acc = accounts[0];
      }
      const response: AuthResponse = {
        access_token: `tc_demo_token_${acc.id}_${Date.now()}`,
        token_type: 'Bearer',
        account: acc,
      };
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, response.access_token);
      return response;
    }
    const payload = {
      email: input.email,
      otp: input.otp,
      password: input.password || 'NewPassword123!',
    };
    const resData = await requestWithFallback<any>('post', [
      '/forgot/password',
      '/forgot/password/',
      '/forgot-password',
      '/auth/forgot-password',
    ], payload);
    const authRes = extractAuthResponse(resData);
    if (authRes.access_token) {
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, authRes.access_token);
    }
    return authRes;
  },

  getOAuthLoginUrl(provider: 'google' | 'github' | 'discord'): string {
    const origin = typeof window !== 'undefined' && window.location ? window.location.origin : '';
    const baseUrl = getCustomBaseUrl();
    const slash = baseUrl.endsWith('/') ? '' : '/';
    return `${baseUrl}${slash}${provider}/login?frontend_url=${encodeURIComponent(origin)}`;
  },

  async loginOAuthDemo(provider: 'google' | 'github' | 'discord'): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const accounts = getDemoAccounts();
    const emailMap: Record<string, string> = {
      google: 'alex.google@tcauth.dev',
      github: 'sam.github@tcauth.dev',
      discord: 'taylor.discord@tcauth.dev',
    };
    const nameMap: Record<string, string> = {
      google: 'Alex Google User',
      github: 'Sam GitHub Dev',
      discord: 'Taylor Discord User',
    };
    const handleMap: Record<string, string> = {
      google: 'alex_google',
      github: 'sam_github',
      discord: 'taylor_discord',
    };
    const avatarMap: Record<string, string> = {
      google: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      github: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      discord: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    };

    const email = emailMap[provider] || `${provider}@tcauth.dev`;
    const name = nameMap[provider] || `${provider} User`;
    const handle = handleMap[provider] || `${provider}_user`;
    const avatar_url = avatarMap[provider] || null;

    let acc = accounts.find((a: any) => a.email.toLowerCase() === email.toLowerCase());
    if (!acc) {
      acc = {
        id: `acc_oauth_${provider}_${Date.now()}`,
        uid: `uid_oauth_${provider}_${Date.now()}`,
        name,
        handle,
        email,
        phone: null,
        avatar_url,
        role: 'user',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      accounts.push(acc);
      saveDemoAccounts(accounts);
    }

    const response: AuthResponse = {
      access_token: `tc_demo_oauth_token_${provider}_${acc.id}_${Date.now()}`,
      refresh_token: `tc_jwt_ref_demo_${acc.id}_${Date.now()}`,
      token_type: 'Bearer',
      account: acc,
    };
    localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, response.access_token);
    if (response.refresh_token) {
      localStorage.setItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY, response.refresh_token);
    }
    return response;
  },

  // POST /token/refresh
  async refreshToken(tokenToRefresh?: string): Promise<{ access_token: string; refresh_token: string; token_type: string }> {
    const refreshTokenValue = tokenToRefresh || localStorage.getItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY);
    if (!refreshTokenValue) {
      throw new Error('No refresh token available');
    }

    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const newAccess = `tc_demo_token_refreshed_${Date.now()}`;
      const newRefresh = `tc_jwt_ref_demo_${Date.now()}`;
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, newAccess);
      localStorage.setItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY, newRefresh);
      return {
        access_token: newAccess,
        refresh_token: newRefresh,
        token_type: 'Bearer',
      };
    }

    const resData = await requestWithFallback<any>('post', [
      '/token/refresh',
      '/token/refresh/',
      '/auth/refresh',
    ], { refresh_token: refreshTokenValue });

    const payload = resData?.data || resData || {};
    const access_token = payload.access_token || payload.accessToken;
    const new_refresh_token = payload.refresh_token || payload.refreshToken || refreshTokenValue;
    if (access_token) {
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, access_token);
    }
    if (new_refresh_token) {
      localStorage.setItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY, new_refresh_token);
    }
    return {
      access_token,
      refresh_token: new_refresh_token,
      token_type: payload.token_type || 'Bearer',
    };
  },
};
