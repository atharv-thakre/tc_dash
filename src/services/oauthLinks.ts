import { CreateOAuthLinkInput, DeleteOAuthLinkInput, OAuthLink } from '../types';
import {
  apiClient,
  getStoredApiMode,
  normalizeArrayResponse,
  normalizePaginatedResponse,
  PaginatedResult,
  requestWithFallback,
} from './apiClient';
import { INITIAL_OAUTH_LINKS } from './mockData';

const DEMO_OAUTH_LINKS_KEY = 'tc_auth_demo_oauth_links';

function getDemoOAuthLinks(): OAuthLink[] {
  const data = localStorage.getItem(DEMO_OAUTH_LINKS_KEY);
  if (!data) {
    localStorage.setItem(DEMO_OAUTH_LINKS_KEY, JSON.stringify(INITIAL_OAUTH_LINKS));
    return INITIAL_OAUTH_LINKS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_OAUTH_LINKS;
  }
}

function saveDemoOAuthLinks(links: OAuthLink[]) {
  localStorage.setItem(DEMO_OAUTH_LINKS_KEY, JSON.stringify(links));
}

export const oauthLinksService = {
  // GET /oauth/
  async listLinks(page: number = 1, limit: number = 10): Promise<PaginatedResult<OAuthLink>> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const all = getDemoOAuthLinks();
      const start = (page - 1) * limit;
      return {
        items: all.slice(start, start + limit),
        total: all.length,
      };
    }
    const resData = await requestWithFallback<any>(
      'get',
      ['/oauth/', '/oauth', '/oauth/link', '/oauth/links', '/oauth-links'],
      { params: { page, limit } }
    );
    return normalizePaginatedResponse<OAuthLink>(resData);
  },

  // GET /oauth/query or GET /oauth/qurey
  async queryOAuthLinks(
    field: string,
    value: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<OAuthLink>> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const all = getDemoOAuthLinks();
      const filtered = all.filter((link: any) => {
        if (!value) return true;
        let targetVal = '';
        if (field === 'provider_id') {
          targetVal = String(link.provider_user_id || link.provider_id || '');
        } else if (field === 'account_id') {
          targetVal = String(link.account_id || '');
        } else {
          targetVal = String(link.id || '');
        }
        return targetVal.toLowerCase().includes(value.toLowerCase());
      });
      const start = (page - 1) * limit;
      return {
        items: filtered.slice(start, start + limit),
        total: filtered.length,
      };
    }
    const resData = await requestWithFallback<any>(
      'get',
      [
        '/oauth/query',
        '/oauth/qurey',
        '/oauth/query/',
        '/oauth/qurey/',
        '/oauth/',
        '/oauth',
        '/oauth/link/query',
        '/oauth/link',
      ],
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
    return normalizePaginatedResponse<OAuthLink>(resData);
  },

  // POST /oauth/
  async createLink(input: CreateOAuthLinkInput): Promise<OAuthLink> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const links = getDemoOAuthLinks();
      const newLink: OAuthLink = {
        id: `lnk_${Date.now()}`,
        account_id: input.account_id,
        provider: input.provider,
        provider_user_id: input.provider_user_id,
        created_at: new Date().toISOString(),
      };
      links.unshift(newLink);
      saveDemoOAuthLinks(links);
      return newLink;
    }
    const resData = await requestWithFallback<any>('post', ['/oauth/', '/oauth', '/oauth/link', '/oauth/links'], input);
    return resData?.data || resData;
  },

  // DELETE /oauth/
  async deleteLink(input: DeleteOAuthLinkInput): Promise<null> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 400));
      let links = getDemoOAuthLinks();
      links = links.filter(
        (l) => !(l.account_id === input.account_id && l.provider.toLowerCase() === input.provider.toLowerCase())
      );
      saveDemoOAuthLinks(links);
      return null;
    }
    await requestWithFallback<any>('delete', ['/oauth/', '/oauth', '/oauth/link'], input);
    return null;
  },
};

