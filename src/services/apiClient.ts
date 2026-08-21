import axios from 'axios';

export const DEFAULT_BASE_URL = 'https://api.codesena.me/tc-auth';

export const LOCAL_STORAGE_TOKEN_KEY = 'tc_auth_access_token';
export const LOCAL_STORAGE_API_MODE_KEY = 'tc_auth_api_mode';
export const LOCAL_STORAGE_CUSTOM_URL_KEY = 'tc_auth_custom_url';
export const LOCAL_STORAGE_CUSTOM_PRESETS_KEY = 'tc_auth_custom_presets';

export type ApiMode = 'demo' | 'live';

export interface ServerPreset {
  id: string;
  name: string;
  url: string;
  isBuiltin?: boolean;
}

export const BUILTIN_PRESETS: ServerPreset[] = [
  {
    id: 'codesena-live',
    name: 'CodeSena Live API (Default)',
    url: 'https://api.codesena.me/tc-auth',
    isBuiltin: true,
  },
  {
    id: 'local-proxy',
    name: 'Local Proxy (/tc-auth)',
    url: '/tc-auth',
    isBuiltin: true,
  },
];

export function getCustomPresets(): ServerPreset[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CUSTOM_PRESETS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (p) =>
          p &&
          typeof p.url === 'string' &&
          typeof p.name === 'string' &&
          !p.url.includes('totalchaos.online') &&
          !p.url.includes('localhost:8000') &&
          !p.url.includes('127.0.0.1:8000')
      );
    }
    return [];
  } catch {
    return [];
  }
}

export function saveCustomPreset(name: string, url: string): ServerPreset {
  const cleanedUrl = normalizeBaseUrl(url);
  const presets = getCustomPresets();
  const newPreset: ServerPreset = {
    id: 'custom-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    name: name.trim() || cleanedUrl,
    url: cleanedUrl,
    isBuiltin: false,
  };
  const updated = [...presets, newPreset];
  localStorage.setItem(LOCAL_STORAGE_CUSTOM_PRESETS_KEY, JSON.stringify(updated));
  return newPreset;
}

export function deleteCustomPreset(id: string): void {
  const presets = getCustomPresets();
  const filtered = presets.filter((p) => p.id !== id);
  localStorage.setItem(LOCAL_STORAGE_CUSTOM_PRESETS_KEY, JSON.stringify(filtered));
}

export function getStoredApiMode(): ApiMode {
  const stored = localStorage.getItem(LOCAL_STORAGE_API_MODE_KEY);
  if (stored === 'live' || stored === 'demo') return stored;
  return 'live'; // Default to live server mode
}

export function setStoredApiMode(mode: ApiMode) {
  localStorage.setItem(LOCAL_STORAGE_API_MODE_KEY, mode);
}

/**
 * Normalizes any user-entered backend URL (accepts localhost, IP addresses, domains, relative paths).
 */
export function normalizeBaseUrl(input?: string | null): string {
  if (!input || !input.trim()) return DEFAULT_BASE_URL;
  let trimmed = input.trim();

  // If it's a relative path starting with '/', preserve it (e.g. /tc-auth, /api)
  if (trimmed.startsWith('/')) {
    return trimmed.length > 1 ? trimmed.replace(/\/+$/, '') : trimmed;
  }

  // If missing protocol (e.g. localhost:5000, 127.0.0.1:5000, api.example.com)
  if (!/^https?:\/\//i.test(trimmed)) {
    if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?/i.test(trimmed)) {
      trimmed = `http://${trimmed}`;
    } else {
      trimmed = `https://${trimmed}`;
    }
  }

  // Remove trailing slashes for clean concatenation with endpoint paths
  return trimmed.replace(/\/+$/, '');
}

export function getCustomBaseUrl(): string {
  try {
    const url = localStorage.getItem(LOCAL_STORAGE_CUSTOM_URL_KEY);
    if (!url || !url.trim() || url.includes('totalchaos.online') || url.includes('localhost:8000') || url.includes('127.0.0.1:8000')) {
      localStorage.setItem(LOCAL_STORAGE_CUSTOM_URL_KEY, DEFAULT_BASE_URL);
      return DEFAULT_BASE_URL;
    }
    return normalizeBaseUrl(url);
  } catch {
    return DEFAULT_BASE_URL;
  }
}

export function setCustomBaseUrl(url: string): string {
  const normalized = normalizeBaseUrl(url);
  try {
    localStorage.setItem(LOCAL_STORAGE_CUSTOM_URL_KEY, normalized);
  } catch {
    // ignore
  }
  if (apiClient && apiClient.defaults) {
    apiClient.defaults.baseURL = normalized;
  }
  return normalized;
}

export const apiClient = axios.create({
  baseURL: getCustomBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authorization header and dynamic base URL
apiClient.interceptors.request.use(
  (config) => {
    const currentBaseUrl = getCustomBaseUrl();
    config.baseURL = currentBaseUrl;
    if (apiClient && apiClient.defaults) {
      apiClient.defaults.baseURL = currentBaseUrl;
    }
    const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export interface PaginatedResult<T> {
  items: T[];
  total?: number;
}

/**
 * Safely extracts an array and optional total count from various API response shapes.
 */
export function normalizePaginatedResponse<T>(data: any): PaginatedResult<T> {
  const items = normalizeArrayResponse<T>(data);
  let total: number | undefined = undefined;

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    if (typeof data.total === 'number') total = data.total;
    else if (typeof data.total_count === 'number') total = data.total_count;
    else if (typeof data.totalCount === 'number') total = data.totalCount;
    else if (typeof data.count === 'number') total = data.count;
  }

  return { items, total };
}

/**
 * Safely extracts an array from various API response shapes (wrapped vs raw array).
 */
export function normalizeArrayResponse<T>(data: any): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'object') {
    const keysToCheck = [
      'data',
      'items',
      'results',
      'links',
      'oauth_links',
      'oauthLinks',
      'oauth',
      'sessions',
      'session_records',
      'sessionRecords',
      'accounts',
      'records',
      'otps',
      'otp_records',
    ];
    for (const key of keysToCheck) {
      if (Array.isArray(data[key])) {
        return data[key];
      }
    }
    // Check nested objects e.g. data.data
    if (data.data && typeof data.data === 'object') {
      const nested = normalizeArrayResponse<T>(data.data);
      if (nested.length > 0) return nested;
    }
    // Check if any top-level property value is an array
    for (const value of Object.values(data)) {
      if (Array.isArray(value)) {
        return value as T[];
      }
    }
  }
  return [];
}

/**
 * Intelligently generates endpoint candidates considering router prefixes (like /tc-auth or /) and trailing slashes.
 */
export function generateCandidateEndpoints(endpoints: string[], targetBaseUrl?: string): string[] {
  const currentBase = targetBaseUrl ? normalizeBaseUrl(targetBaseUrl) : getCustomBaseUrl();
  const baseHasTcAuth = /\/tc[-_]auth(\/|$)/i.test(currentBase);
  const result: string[] = [];

  const add = (p: string) => {
    if (p && !result.includes(p)) result.push(p);
  };

  for (const ep of endpoints) {
    const cleanEp = ep.startsWith('/') ? ep : `/${ep}`;
    add(cleanEp);

    // Add trailing slash and non-trailing slash variants
    const withSlash = cleanEp.endsWith('/') ? cleanEp : `${cleanEp}/`;
    const withoutSlash = cleanEp.endsWith('/') ? cleanEp.replace(/\/+$/, '') : cleanEp;
    add(withSlash);
    add(withoutSlash);

    // If base URL does not have /tc-auth prefix (e.g. user set base URL to custom backend root)
    // but the backend router is mounted at /tc-auth (which is standard for tc_auth library)
    if (!baseHasTcAuth) {
      const tcPrefixed = `/tc-auth${withoutSlash}`;
      add(tcPrefixed);
      add(`${tcPrefixed}/`);
    } else {
      // If base URL DOES have /tc-auth prefix, but backend routes might be mounted at root
      const strippedTcAuth = cleanEp.replace(/^\/tc[-_]auth/, '');
      if (strippedTcAuth) {
        add(strippedTcAuth);
        add(strippedTcAuth.endsWith('/') ? strippedTcAuth : `${strippedTcAuth}/`);
      }
    }
  }

  return result;
}

/**
 * Tries multiple endpoint paths sequentially until one succeeds, handling 404/405 route variations across different backend implementations.
 */
export async function requestWithFallback<T>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  endpoints: string[],
  payloadOrConfig?: any,
  config?: any
): Promise<T> {
  const currentBase = getCustomBaseUrl();
  const candidates = generateCandidateEndpoints(endpoints, currentBase);
  let lastError: any;

  for (const ep of candidates) {
    try {
      if (method === 'get') {
        const res = await apiClient.get<T>(ep, payloadOrConfig);
        return res.data;
      } else if (method === 'post') {
        const res = await apiClient.post<T>(ep, payloadOrConfig, config);
        return res.data;
      } else if (method === 'put') {
        const res = await apiClient.put<T>(ep, payloadOrConfig, config);
        return res.data;
      } else if (method === 'patch') {
        const res = await apiClient.patch<T>(ep, payloadOrConfig, config);
        return res.data;
      } else if (method === 'delete') {
        const axiosConfig = payloadOrConfig
          ? payloadOrConfig.data !== undefined
            ? payloadOrConfig
            : { data: payloadOrConfig }
          : undefined;
        const res = await apiClient.delete<T>(ep, axiosConfig);
        return res.data;
      }
    } catch (err: any) {
      lastError = err;
      // If 404, 405, or 307/308 redirect, try next candidate
      if (
        err.response?.status === 404 ||
        err.response?.status === 405 ||
        err.response?.status === 307 ||
        err.response?.status === 308
      ) {
        continue;
      }
      // For other status codes (e.g., 400, 401, 422, 500), throw directly
      throw err;
    }
  }
  throw lastError;
}

export interface ApiErrorDetails {
  title: string;
  message: string;
  status?: number;
  statusText?: string;
  code?: string;
  url?: string;
  method?: string;
  timestamp: string;
  responseData?: any;
  suggestions: string[];
}

/**
 * Extracts a concise, clean, non-bloated user error message.
 */
export function getErrorMessage(err: any, fallbackMessage: string = 'An error occurred'): string {
  if (!err) return fallbackMessage;
  if (typeof err === 'string') return err;

  const responseData = err.response?.data;
  if (responseData) {
    if (typeof responseData === 'string' && responseData.length < 150) return responseData;
    if (responseData.detail && typeof responseData.detail === 'string') return responseData.detail;
    if (responseData.message && typeof responseData.message === 'string') return responseData.message;
    if (responseData.error && typeof responseData.error === 'string') return responseData.error;
    if (Array.isArray(responseData.detail)) {
      return responseData.detail.map((e: any) => e.msg || e.message || JSON.stringify(e)).join(', ');
    }
  }

  // Network errors or CORS failures
  if (err.code === 'ERR_NETWORK' || err.message === 'Network Error' || (!err.response && err.request)) {
    return 'Unable to reach backend server';
  }

  if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
    return 'Request timed out';
  }

  if (err.response?.status === 403) {
    return 'Forbidden: Admin authorization required';
  }
  if (err.response?.status === 401) {
    return 'Unauthorized: Invalid credentials or session expired';
  }
  if (err.response?.status === 404) {
    return 'Endpoint or resource not found (404)';
  }
  if (err.response?.status === 422) {
    return 'Validation failed on submitted data';
  }
  if (err.response?.status === 500) {
    return 'Internal server error (500)';
  }

  return err.message && err.message.length < 120 ? err.message : fallbackMessage;
}

/**
 * Extracts full technical error details for the "View Details" info toggle.
 */
export function getErrorDetails(err: any, targetUrl?: string): ApiErrorDetails {
  const currentUrl = targetUrl || getCustomBaseUrl();
  const status = err?.response?.status;
  const statusText = err?.response?.statusText;
  const code = err?.code || (err?.response ? `HTTP_${status}` : 'ERR_CONNECTION');
  const method = err?.config?.method?.toUpperCase() || 'GET';
  const url = err?.config?.url ? `${err.config.baseURL || ''}${err.config.url}` : currentUrl;
  const responseData = err?.response?.data;
  const message = getErrorMessage(err);

  const suggestions: string[] = [];

  if (err?.code === 'ERR_NETWORK' || err?.message === 'Network Error' || !err?.response) {
    suggestions.push(`Verify backend server is actively listening on "${currentUrl}"`);
    suggestions.push('Check if CORS allows cross-origin requests from this web domain');
    if (currentUrl.includes('devtunnels.ms') || currentUrl.includes('ngrok')) {
      suggestions.push('For Dev Tunnels or ngrok, ensure the tunnel is active and port access is set to Public');
    }
    suggestions.push('Switch to "Demo Mock" mode above if you want to explore offline');
  } else if (status === 404) {
    suggestions.push('The requested API route was not found on the backend.');
    suggestions.push('Check if the router is mounted at root or at `/tc-auth`');
  } else if (status === 401 || status === 403) {
    suggestions.push('Ensure your JWT token is valid and user has appropriate SuperAdmin role.');
  }

  return {
    title: status ? `HTTP Error ${status}${statusText ? ` (${statusText})` : ''}` : (err?.name || 'Network Connection Error'),
    message,
    status,
    statusText,
    code,
    url,
    method,
    timestamp: new Date().toISOString(),
    responseData,
    suggestions,
  };
}

