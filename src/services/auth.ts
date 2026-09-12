import {
  AuthResponse,
  ForgotPasswordInput,
  LoginOTPInput,
  LoginPasswordInput,
  OTPPurpose,
  SendEmailOTPInput,
  SendEmailOTPResponse,
  SendMagicLinkInput,
  SendMagicLinkResponse,
  SignupOTPInput,
  SignupPasswordInput,
  VerifyEmailMagicLinkResponse,
  VerifyMagicLinkInput,
} from '../types';
import {
  apiClient,
  getCustomBaseUrl,
  getStoredApiMode,
  LOCAL_STORAGE_REFRESH_TOKEN_KEY,
  LOCAL_STORAGE_TOKEN_KEY,
  requestWithFallback,
} from './apiClient';
import { getDemoConfig } from './config';
import { INITIAL_ACCOUNTS } from './mockData';

// Local storage key for demo accounts
const DEMO_ACCOUNTS_KEY = 'tc_auth_demo_accounts_v2';

export function getDemoAccounts() {
  const data = localStorage.getItem(DEMO_ACCOUNTS_KEY);
  if (!data) {
    localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(INITIAL_ACCOUNTS));
    return INITIAL_ACCOUNTS;
  }
  try {
    const parsed = JSON.parse(data);
    // If cache has old data or fewer accounts, refresh from INITIAL_ACCOUNTS
    if (
      !Array.isArray(parsed) ||
      parsed.length < INITIAL_ACCOUNTS.length ||
      parsed.some((a: any) => a.name === 'Sarah Chen' || a.name === 'Alex Rivera')
    ) {
      localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(INITIAL_ACCOUNTS));
      return INITIAL_ACCOUNTS;
    }
    return parsed;
  } catch {
    localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(INITIAL_ACCOUNTS));
    return INITIAL_ACCOUNTS;
  }
}

export function saveDemoAccounts(accounts: any[]) {
  localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(accounts));
}

// Helper: build demo token response respecting Single vs Dual Token Mode
function createDemoTokenResponse(account: any, providerPrefix = 'demo'): AuthResponse {
  let isDual = true;
  try {
    const conf = getDemoConfig();
    isDual = conf.jwt?.dual_token_mode ?? true;
  } catch {
    isDual = true;
  }

  const access_token = `tc_${providerPrefix}_token_${account.id}_${Date.now()}`;
  localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, access_token);

  const response: AuthResponse = {
    access_token,
    token_type: 'Bearer',
    account,
  };

  if (isDual) {
    const refresh_token = `tc_${providerPrefix}_ref_${account.id}_${Date.now()}`;
    response.refresh_token = refresh_token;
    localStorage.setItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY, refresh_token);
  } else {
    // Single Token Mode: clear any existing refresh token
    localStorage.removeItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY);
  }

  return response;
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
  } else {
    // Single Token Mode: ensure any previous refresh token is cleared
    localStorage.removeItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY);
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
    const frontendUrl =
      input.frontend_url || (typeof window !== 'undefined' && window.location ? window.location.origin : undefined);
    const payload = {
      email: input.email,
      ...(frontendUrl ? { frontend_url: frontendUrl } : {}),
    };

    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const expires_at = Math.floor(Date.now() / 1000) + 600;
      return { expires_at };
    }

    const query = frontendUrl ? `?frontend_url=${encodeURIComponent(frontendUrl)}` : '';
    const resData = await requestWithFallback<any>('post', [
      `/send/email/otp/${validPurpose}${query}`,
      `/send/email/otp/${validPurpose}`,
      `/send/email/otp/${validPurpose}/`,
      `/otp/send/${validPurpose}`,
    ], payload);
    const data = resData?.data || resData || {};
    if (typeof data === 'object' && data !== null && 'expires_at' in data) {
      return { expires_at: data.expires_at };
    }
    return { expires_at: data };
  },

  // POST /send/email/link/{purpose} - Dedicated Magic Link Route (explicit intent)
  async sendMagicLink(purpose: OTPPurpose = 'login', input: SendMagicLinkInput): Promise<SendMagicLinkResponse> {
    const validPurpose = purpose || 'login';
    const frontendUrl =
      input.frontend_url || (typeof window !== 'undefined' && window.location ? window.location.origin : undefined);
    const payload = {
      email: input.email,
      ...(frontendUrl ? { frontend_url: frontendUrl } : {}),
    };

    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const expires_at = Math.floor(Date.now() / 1000) + 300;
      return { expires_at };
    }

    const query = frontendUrl ? `?frontend_url=${encodeURIComponent(frontendUrl)}` : '';
    const resData = await requestWithFallback<any>('post', [
      `/send/email/link/${validPurpose}${query}`,
      `/send/email/link/${validPurpose}`,
      `/send/email/link/${validPurpose}/`,
      `/link/send/${validPurpose}`,
    ], payload);
    const data = resData?.data || resData || {};
    if (typeof data === 'object' && data !== null && 'expires_at' in data) {
      return { expires_at: data.expires_at };
    }
    return { expires_at: data };
  },

  // POST /link/{purpose} - Programmatic Bot-Safe Magic Link Verification
  async verifyMagicLink(
    purpose: OTPPurpose | string = 'login',
    input: VerifyMagicLinkInput
  ): Promise<AuthResponse | VerifyEmailMagicLinkResponse> {
    const validPurpose = purpose || 'login';

    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 600));
      if (validPurpose === 'verify') {
        return {
          success: true,
          message: 'Email verified successfully',
          email: input.email,
        };
      }
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
      return createDemoTokenResponse(acc, 'magic_link');
    }

    const resData = await requestWithFallback<any>('post', [
      `/link/${validPurpose}`,
      `/link/${validPurpose}/`,
      `/tc-auth/link/${validPurpose}`,
    ], {
      email: input.email,
      otp: input.otp,
    });

    if (validPurpose === 'verify') {
      const payload = resData?.data || resData || {};
      return {
        success: payload.success !== false,
        message: payload.message || 'Email verified successfully',
        email: payload.email || input.email,
      };
    }

    const authRes = extractAuthResponse(resData);
    if (authRes.access_token) {
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, authRes.access_token);
    }
    return authRes;
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
      return createDemoTokenResponse(newAcc);
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
      return createDemoTokenResponse(newAcc);
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

      return createDemoTokenResponse(acc);
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

      return createDemoTokenResponse(acc);
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

    return createDemoTokenResponse(acc, `demo_oauth_${provider}`);
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
    const access_token = payload.access_token || payload.accessToken || payload.token || payload.jwt || localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY) || '';
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
