import { ConfigPayload, EmailConfig, JWTConfig, OAuthConfig } from '../types';
import { apiClient, getStoredApiMode, requestWithFallback } from './apiClient';
import { INITIAL_CONFIG } from './mockData';

const DEMO_CONFIG_KEY = 'tc_auth_demo_config';

function getDemoConfig(): ConfigPayload {
  const data = localStorage.getItem(DEMO_CONFIG_KEY);
  if (!data) {
    localStorage.setItem(DEMO_CONFIG_KEY, JSON.stringify(INITIAL_CONFIG));
    return INITIAL_CONFIG;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_CONFIG;
  }
}

function saveDemoConfig(config: ConfigPayload) {
  localStorage.setItem(DEMO_CONFIG_KEY, JSON.stringify(config));
}

export interface ServerCounts {
  accounts: number;
  oauth: number;
  sessions: number;
  otp: number;
}

export interface PulseResponse {
  system_time: string;
  response?: string;
  status: string;
  state: string;
}

export const configService = {
  // GET /config/pulse
  async testPulse(): Promise<PulseResponse> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 250));
      return {
        system_time: new Date().toISOString(),
        response: 'Hello (Demo Mode)',
        status: 'healthy (Demo)',
        state: 'active (Demo Mock)',
      };
    }
    const resData = await requestWithFallback<any>('get', [
      '/config/pulse',
      '/config/pulse/',
      '/pulse',
      '/pulse/',
    ]);
    const payload = resData?.data || resData || {};
    return {
      system_time: payload.system_time || new Date().toISOString(),
      response: payload.response ?? 'Hello',
      status: payload.status || 'healthy',
      state: payload.state || 'active',
    };
  },

  // GET /config/counts
  async getCounts(): Promise<ServerCounts> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const getLength = (key: string, fallbackArr: any[]) => {
        try {
          const item = localStorage.getItem(key);
          if (item) return JSON.parse(item).length;
        } catch {
          // ignore
        }
        return fallbackArr.length;
      };
      return {
        accounts: getLength('tc_auth_demo_accounts', INITIAL_CONFIG ? [1, 2, 3] : []),
        oauth: getLength('tc_auth_demo_oauth_links', [1, 2, 3]),
        sessions: getLength('tc_auth_demo_sessions', [1, 2, 3, 4, 5]),
        otp: getLength('tc_auth_demo_otp_records', [1]),
      };
    }
    const resData = await requestWithFallback<any>('get', [
      '/config/counts',
      '/config/counts/',
      '/counts',
      '/counts/',
    ]);
    const counts = resData?.data || resData || {};
    return {
      accounts: Number(counts.accounts ?? counts.accountsCount ?? counts.account ?? 0),
      oauth: Number(counts.oauth ?? counts.oauthCount ?? counts.oauth_links ?? 0),
      sessions: Number(counts.sessions ?? counts.sessionsCount ?? counts.session ?? 0),
      otp: Number(counts.otp ?? counts.otpCount ?? counts.otp_records ?? 0),
    };
  },

  // GET /config/load/
  async loadConfig(): Promise<ConfigPayload> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return getDemoConfig();
    }
    const resData = await requestWithFallback<any>('get', [
      '/config/load/',
      '/config/load',
      '/config/',
      '/config',
    ]);
    return resData?.data || resData;
  },

  // POST /config/email
  async updateEmailConfig(input: EmailConfig): Promise<null> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const conf = getDemoConfig();
      conf.email = { ...conf.email, ...input };
      saveDemoConfig(conf);
      return null;
    }
    const resData = await requestWithFallback<any>('post', ['/config/email', '/config/email/'], input);
    return resData?.data || resData;
  },

  // POST /config/github
  async updateGithubConfig(input: OAuthConfig): Promise<null> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const conf = getDemoConfig();
      conf.github = { ...conf.github, ...input };
      saveDemoConfig(conf);
      return null;
    }
    const resData = await requestWithFallback<any>('post', ['/config/github', '/config/github/'], input);
    return resData?.data || resData;
  },

  // POST /config/google
  async updateGoogleConfig(input: OAuthConfig): Promise<null> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const conf = getDemoConfig();
      conf.google = { ...conf.google, ...input };
      saveDemoConfig(conf);
      return null;
    }
    const resData = await requestWithFallback<any>('post', ['/config/google', '/config/google/'], input);
    return resData?.data || resData;
  },

  // POST /config/jwt
  async updateJwtConfig(input: JWTConfig): Promise<null> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const conf = getDemoConfig();
      conf.jwt = { ...conf.jwt, ...input };
      saveDemoConfig(conf);
      return null;
    }
    const resData = await requestWithFallback<any>('post', ['/config/jwt', '/config/jwt/'], input);
    return resData?.data || resData;
  },
};
