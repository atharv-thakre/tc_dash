import { SessionRecord } from '../types';
import {
  apiClient,
  getStoredApiMode,
  normalizeArrayResponse,
  normalizePaginatedResponse,
  PaginatedResult,
  requestWithFallback,
} from './apiClient';
import { INITIAL_SESSIONS } from './mockData';

const DEMO_SESSIONS_KEY = 'tc_auth_demo_sessions';

function getDemoSessions(): SessionRecord[] {
  const data = localStorage.getItem(DEMO_SESSIONS_KEY);
  if (!data) {
    localStorage.setItem(DEMO_SESSIONS_KEY, JSON.stringify(INITIAL_SESSIONS));
    return INITIAL_SESSIONS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_SESSIONS;
  }
}

function saveDemoSessions(sessions: SessionRecord[]) {
  localStorage.setItem(DEMO_SESSIONS_KEY, JSON.stringify(sessions));
}

export const sessionsService = {
  // GET /session/
  async listSessions(page: number = 1, limit: number = 10): Promise<PaginatedResult<SessionRecord>> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const all = getDemoSessions();
      const start = (page - 1) * limit;
      return {
        items: all.slice(start, start + limit),
        total: all.length,
      };
    }
    const resData = await requestWithFallback<any>(
      'get',
      ['/session/', '/session', '/sessions/', '/sessions', '/session/list'],
      { params: { page, limit } }
    );
    return normalizePaginatedResponse<SessionRecord>(resData);
  },

  // GET /session/query or GET /session/ with query filters
  async querySessions(
    field: string,
    value: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<SessionRecord>> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const all = getDemoSessions();
      const filtered = all.filter((s: any) => {
        if (!value) return true;
        const val = String(s[field] || '').toLowerCase();
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
      ['/session/query', '/session/query/', '/session/', '/session', '/sessions/query', '/sessions/'],
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
    return normalizePaginatedResponse<SessionRecord>(resData);
  },

  // DELETE /session/
  async deleteSession(session_id: string | number): Promise<null> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let sessions = getDemoSessions();
      sessions = sessions.filter((s) => String(s.id) !== String(session_id));
      saveDemoSessions(sessions);
      return null;
    }

    const idStr = String(session_id);
    const parsedId = /^\d+$/.test(idStr) ? Number(idStr) : session_id;

    await requestWithFallback<any>(
      'delete',
      ['/session/', '/session', '/sessions/'],
      { session_id: parsedId }
    );
    return null;
  },

  // DELETE /session/all
  async deleteAllForAccount(account_id: string | number): Promise<null> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let sessions = getDemoSessions();
      sessions = sessions.filter((s) => String(s.account_id) !== String(account_id));
      saveDemoSessions(sessions);
      return null;
    }

    const accStr = String(account_id);
    const parsedId = /^\d+$/.test(accStr) ? Number(accStr) : account_id;

    await requestWithFallback<any>(
      'delete',
      ['/session/all', '/session/all/', '/sessions/all'],
      { account_id: parsedId }
    );
    return null;
  },

  // DELETE /session/cleanup
  async cleanupExpired(): Promise<null> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let sessions = getDemoSessions();
      const now = new Date().getTime();
      sessions = sessions.filter((s) => new Date(s.expires_at).getTime() > now);
      saveDemoSessions(sessions);
      return null;
    }
    await requestWithFallback<any>('delete', ['/session/cleanup', '/sessions/cleanup', '/session/cleanup/']);
    return null;
  },

  // DELETE /session/clear
  async clearAll(): Promise<null> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      saveDemoSessions([]);
      return null;
    }
    await requestWithFallback<any>('delete', ['/session/clear', '/sessions/clear', '/session/clear/']);
    return null;
  },
};

