import {
  AccountOAuthLinkInput,
  MeResponse,
  OAuthLink,
  PatchMeInput,
  StandardActionResponse,
  UpdatePasswordInput,
} from '../types';
import {
  apiClient,
  getStoredApiMode,
  LOCAL_STORAGE_REFRESH_TOKEN_KEY,
  LOCAL_STORAGE_TOKEN_KEY,
  requestWithFallback,
} from './apiClient';
import { getDemoAccounts, saveDemoAccounts } from './auth';

const DEMO_OAUTH_LINKS_KEY = 'tc_auth_demo_user_oauth_links';

function getDemoOAuthLinks(): OAuthLink[] {
  const data = localStorage.getItem(DEMO_OAUTH_LINKS_KEY);
  if (!data) {
    const initial: OAuthLink[] = [
      {
        id: 1,
        account_id: '1',
        provider: 'google',
        provider_user_id: 'google-oauth2|10928374619283',
        created_at: '2026-01-16T12:00:00.000Z',
      },
    ];
    localStorage.setItem(DEMO_OAUTH_LINKS_KEY, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveDemoOAuthLinks(links: OAuthLink[]) {
  localStorage.setItem(DEMO_OAUTH_LINKS_KEY, JSON.stringify(links));
}

export const profileService = {
  // GET /me
  async getMe(): Promise<MeResponse> {
    const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
    if (!token) {
      throw new Error('Not authenticated');
    }

    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const accounts = getDemoAccounts();

      let matchedAccount = accounts[0]; // Default to superadmin for demo token
      const found = accounts.find((a: any) => token.includes(a.id));
      if (found) matchedAccount = found;

      return {
        account: matchedAccount,
        session: {
          id: `sess_current_${matchedAccount.id}`,
          account_id: matchedAccount.id,
          ip_address: '127.0.0.1',
          user_agent: 'tc-auth Control Panel (Browser Client)',
          expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
          created_at: new Date().toISOString(),
        },
        payload: {
          sub: matchedAccount.id,
          role: matchedAccount.role,
          handle: matchedAccount.handle,
          iss: 'tc-auth',
        },
      };
    }

    const resData = await requestWithFallback<any>('get', ['/me', '/me/', '/user/me']);
    const payload = resData?.data || resData || {};

    if (payload.account) {
      return payload as MeResponse;
    }

    // If payload is the account directly
    return {
      account: {
        id: payload.id || 'acc_me',
        uid: payload.uid || 'uid_me',
        name: payload.name || 'User',
        handle: payload.handle || 'user',
        email: payload.email || '',
        phone: payload.phone || null,
        avatar_url: payload.avatar_url || null,
        role: payload.role || 'user',
        status: payload.status || 'active',
        created_at: payload.created_at || new Date().toISOString(),
        updated_at: payload.updated_at || new Date().toISOString(),
      },
      session: payload.session || null,
      payload: payload.payload || null,
    };
  },

  // POST /logout
  async logout(): Promise<StandardActionResponse> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 200));
      localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
      localStorage.removeItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY);
      return { success: true, message: 'Session destroyed successfully' };
    }

    let resData: any = null;
    try {
      resData = await requestWithFallback<any>('post', ['/logout', '/logout/', '/auth/logout']);
    } finally {
      localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
      localStorage.removeItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY);
    }
    return resData?.data || resData || { success: true, message: 'Session destroyed successfully' };
  },

  // POST /logout-all
  async logoutAll(): Promise<StandardActionResponse> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
      localStorage.removeItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY);
      return { success: true, message: 'All sessions destroyed for account', count: 1 };
    }

    let resData: any = null;
    try {
      resData = await requestWithFallback<any>('post', ['/logout-all', '/logout-all/', '/auth/logout-all', '/logout/all']);
    } finally {
      localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
      localStorage.removeItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY);
    }
    return resData?.data || resData || { success: true, message: 'All sessions destroyed for account', count: 1 };
  },

  // PUT /update/password
  async updatePassword(input: UpdatePasswordInput): Promise<StandardActionResponse> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return { success: true, message: 'Password updated successfully' };
    }

    const resData = await requestWithFallback<any>('put', [
      '/update/password',
      '/update/password/',
      '/password/update',
      '/account/password',
    ], input);
    return resData?.data || resData || { success: true, message: 'Password updated successfully' };
  },

  // PATCH /me
  async patchMe(input: PatchMeInput): Promise<void> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
      const accounts = getDemoAccounts();
      let matchedIdx = accounts.findIndex((a: any) => token && token.includes(a.id));
      if (matchedIdx === -1) matchedIdx = 0;

      const updated = { ...accounts[matchedIdx] };
      if (input.name !== undefined) updated.name = input.name;
      if (input.email !== undefined) updated.email = input.email;
      if (input.handle !== undefined) updated.handle = input.handle;
      if (input.avatar_url !== undefined) updated.avatar_url = input.avatar_url;
      if (input.phone !== undefined) updated.phone = input.phone;
      updated.updated_at = new Date().toISOString();

      accounts[matchedIdx] = updated;
      saveDemoAccounts(accounts);
      return;
    }

    await requestWithFallback<any>('patch', [
      '/me',
      '/me/',
      '/user/me',
    ], input);
  },

  // GET /account/oauth/links
  async getOAuthLinks(): Promise<OAuthLink[]> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return getDemoOAuthLinks();
    }
    const resData = await requestWithFallback<any>('get', [
      '/account/oauth/links',
      '/account/oauth/links/',
      '/me/oauth',
    ]);
    const list = resData?.data || resData || [];
    return Array.isArray(list) ? list : [];
  },

  // POST /account/oauth/link/:provider
  async linkOAuthProvider(provider: string, input?: AccountOAuthLinkInput): Promise<OAuthLink> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const links = getDemoOAuthLinks();
      const existing = links.find((l) => l.provider.toLowerCase() === provider.toLowerCase());
      if (existing) return existing;
      const newLink: OAuthLink = {
        id: links.length + 1,
        account_id: '1',
        provider: provider.toLowerCase(),
        provider_user_id: input?.provider_user_id || `${provider}_${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      links.push(newLink);
      saveDemoOAuthLinks(links);
      return newLink;
    }

    const resData = await requestWithFallback<any>('post', [
      `/account/oauth/link/${provider}`,
      `/account/oauth/link/${provider}/`,
    ], input || {});
    return resData?.data || resData;
  },

  // DELETE /account/oauth/:provider (Safe unlinking with lockout prevention)
  async unlinkOAuthProvider(provider: string): Promise<StandardActionResponse> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const links = getDemoOAuthLinks();
      const userLinks = links.filter((l) => l.account_id === '1');
      // Lockout prevention check in demo mode
      if (userLinks.length <= 1) {
        throw new Error('Cannot unlink provider: account must have a password or at least one other active authentication method');
      }
      const updated = links.filter((l) => l.provider.toLowerCase() !== provider.toLowerCase());
      saveDemoOAuthLinks(updated);
      return { success: true, message: `OAuth link for '${provider}' removed successfully` };
    }

    const resData = await requestWithFallback<any>('delete', [
      `/account/oauth/${provider}`,
      `/account/oauth/${provider}/`,
    ]);
    return resData?.data || resData || { success: true, message: `OAuth link for '${provider}' removed successfully` };
  },
};
