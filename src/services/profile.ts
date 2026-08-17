import { MeResponse, PatchMeInput, UpdatePasswordInput } from '../types';
import { apiClient, getStoredApiMode, LOCAL_STORAGE_TOKEN_KEY, requestWithFallback } from './apiClient';
import { getDemoAccounts, saveDemoAccounts } from './auth';

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
  async logout(): Promise<null> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 200));
      localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
      return null;
    }

    try {
      await requestWithFallback<any>('post', ['/logout', '/logout/', '/auth/logout']);
    } finally {
      localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
    }
    return null;
  },

  // POST /logout-all
  async logoutAll(): Promise<null> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
      return null;
    }

    try {
      await requestWithFallback<any>('post', ['/logout-all', '/logout-all/', '/auth/logout-all', '/logout/all']);
    } finally {
      localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
    }
    return null;
  },

  // PUT /update/password
  async updatePassword(input: UpdatePasswordInput): Promise<null> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return null;
    }

    const resData = await requestWithFallback<any>('put', [
      '/update/password',
      '/update/password/',
      '/password/update',
      '/account/password',
    ], input);
    return resData?.data || resData;
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
};
