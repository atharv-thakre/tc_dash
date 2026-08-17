import { Account, CreateAccountInput, PatchAccountInput } from '../types';
import {
  apiClient,
  getStoredApiMode,
  normalizeArrayResponse,
  normalizePaginatedResponse,
  PaginatedResult,
  requestWithFallback,
} from './apiClient';
import { getDemoAccounts, saveDemoAccounts } from './auth';

export const accountsService = {
  // GET /account/
  async listAccounts(page: number = 1, limit: number = 10): Promise<PaginatedResult<Account>> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const all = getDemoAccounts();
      const start = (page - 1) * limit;
      return {
        items: all.slice(start, start + limit),
        total: all.length,
      };
    }
    const resData = await requestWithFallback<any>(
      'get',
      ['/account/', '/account', '/accounts/', '/accounts'],
      { params: { page, limit } }
    );
    return normalizePaginatedResponse<Account>(resData);
  },

  // GET /account/query or GET /account/ with query filters
  async queryAccounts(
    field: string,
    value: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<Account>> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const all = getDemoAccounts();
      const filtered = all.filter((acc: any) => {
        if (!value) return true;
        const val = String(acc[field] || '').toLowerCase();
        return val.includes(value.toLowerCase());
      });
      const start = (page - 1) * limit;
      return {
        items: filtered.slice(start, start + limit),
        total: filtered.length,
      };
    }
    const resData = await requestWithFallback<any>(
      'get',
      ['/account/query', '/account/query/', '/account/', '/account', '/accounts/query', '/accounts/'],
      {
        params: {
          field,
          value,
          [field]: value,
          query: value,
          page,
          limit,
        },
      }
    );
    return normalizePaginatedResponse<Account>(resData);
  },

  // POST /account/
  async createAccount(input: CreateAccountInput): Promise<Account> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const accounts = getDemoAccounts();
      const newAcc: Account = {
        id: `acc_${Date.now()}`,
        uid: `uid_${Date.now()}`,
        name: input.name,
        email: input.email,
        handle: input.handle,
        phone: input.phone || null,
        avatar_url: input.avatar_url || null,
        role: input.role,
        status: input.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      accounts.unshift(newAcc);
      saveDemoAccounts(accounts);
      return newAcc;
    }
    const resData = await requestWithFallback<any>('post', ['/account/', '/account', '/accounts/'], input);
    return resData?.data || resData;
  },

  // PATCH /account/
  async updateAccount(input: PatchAccountInput): Promise<Account> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const accounts = getDemoAccounts();
      const idx = accounts.findIndex((a: Account) => a.id === input.account_id);
      if (idx === -1) throw new Error('Account not found');

      const updated = {
        ...accounts[idx],
        ...input,
        updated_at: new Date().toISOString(),
      };
      accounts[idx] = updated;
      saveDemoAccounts(accounts);
      return updated;
    }
    const resData = await requestWithFallback<any>('patch', ['/account/', '/account', '/accounts/'], input);
    return resData?.data || resData;
  },

  // DELETE /account/
  async deleteAccount(account_id: string | number): Promise<null> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 400));
      let accounts = getDemoAccounts();
      accounts = accounts.filter((a: Account) => String(a.id) !== String(account_id));
      saveDemoAccounts(accounts);
      return null;
    }
    const accStr = String(account_id);
    const parsedId = /^\d+$/.test(accStr) ? Number(accStr) : account_id;
    await requestWithFallback<any>('delete', ['/account/', '/account', '/accounts/'], { account_id: parsedId });
    return null;
  },
};

