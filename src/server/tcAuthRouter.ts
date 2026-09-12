import { Router, Request, Response } from 'express';

export const tcAuthRouter = Router();

// Middleware: strip /tc-auth prefix if present in the sub-url
tcAuthRouter.use((req: Request, _res: Response, next) => {
  if (req.url.startsWith('/tc-auth')) {
    req.url = req.url.replace(/^\/tc-auth/, '') || '/';
  }
  next();
});

// Password strength validation helper (4 core rules: >=6 chars, uppercase, lowercase, digit)
export function validatePassword(password: string): { valid: boolean; message: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true, message: 'Password meets complexity standards' };
}

// Allowed OTP purposes
export const ALLOWED_OTP_PURPOSES = ['signup', 'login', 'reset', 'verify'];

// In-memory database store
let accounts = [
  {
    id: 1,
    uid: 'tc_usr_01',
    name: 'Super Administrator',
    email: 'admin@tcauth.dev',
    handle: 'superadmin',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    phone: '+1-555-0199',
    role: 'superadmin',
    status: 'active',
    has_password: true,
    created_at: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 2,
    uid: 'tc_usr_02',
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    handle: 'schen_dev',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    phone: '+1-555-0234',
    role: 'admin',
    status: 'active',
    has_password: true,
    created_at: '2026-02-01T10:30:00.000Z',
  },
  {
    id: 3,
    uid: 'tc_usr_03',
    name: 'Marcus Vance',
    email: 'marcus.vance@example.org',
    handle: 'mvance',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    phone: null,
    role: 'user',
    status: 'active',
    has_password: true,
    created_at: '2026-02-15T14:15:00.000Z',
  },
  {
    id: 4,
    uid: 'tc_usr_04',
    name: 'Elena Rostova',
    email: 'elena.rostova@testlab.io',
    handle: 'erostova',
    avatar_url: null,
    phone: null,
    role: 'user',
    status: 'pending',
    has_password: false, // OAuth-only user to test lockout prevention
    created_at: '2026-03-01T09:45:00.000Z',
  },
];

let sessions = [
  {
    id: 1,
    token: 'tc_sess_live_01_9981a8',
    account_id: '1',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36',
    ip_address: '192.168.1.42',
    created_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    expires_at: new Date(Date.now() + 3600 * 1000 * 24 * 7).toISOString(),
  },
  {
    id: 2,
    token: 'tc_sess_live_02_bb8471',
    account_id: '2',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36',
    ip_address: '10.0.4.19',
    created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    expires_at: new Date(Date.now() + 3600 * 1000 * 24 * 3).toISOString(),
  },
];

let otpRecords = [
  {
    id: 1,
    identifier: 'admin@tcauth.dev',
    otp: '849201',
    purpose: 'login',
    created_at: new Date(Date.now() - 60000).toISOString(),
    expires_at: new Date(Date.now() + 240000).toISOString(),
  },
  {
    id: 2,
    identifier: 'sarah.chen@example.com',
    otp: '319042',
    purpose: 'reset',
    created_at: new Date(Date.now() - 120000).toISOString(),
    expires_at: new Date(Date.now() + 180000).toISOString(),
  },
];

let oauthLinks = [
  {
    id: 1,
    account_id: '1',
    provider: 'google',
    provider_user_id: 'google-oauth2|10928374619283',
    created_at: '2026-01-16T12:00:00.000Z',
  },
  {
    id: 2,
    account_id: '2',
    provider: 'github',
    provider_user_id: 'gh_84920194',
    created_at: '2026-02-02T14:30:00.000Z',
  },
  {
    id: 3,
    account_id: '4',
    provider: 'discord',
    provider_user_id: 'discord_991823746',
    created_at: '2026-03-01T09:50:00.000Z',
  },
];

let systemConfig = {
  email: {
    smtp_server: 'smtp.sendgrid.net',
    port: 587,
    username: 'apikey',
    password: '********************',
    sender_email: 'noreply@tcauth.dev',
    tls: true,
  },
  github: {
    client_id: 'gh_client_mock_849283',
    client_secret: '********************',
    redirect_uri: 'http://localhost:3000/tc-auth/github/callback',
  },
  google: {
    client_id: 'google-mock-client-id.apps.googleusercontent.com',
    client_secret: '********************',
    redirect_uri: 'http://localhost:3000/tc-auth/google/callback',
  },
  discord: {
    client_id: 'discord-mock-client-id-12345678',
    client_secret: '********************',
    redirect_uri: 'http://localhost:3000/tc-auth/discord/callback',
  },
  jwt: {
    secret_key: 'supersecret-tcauth-jwt-signing-key-production-ready',
    algorithm: 'HS256',
    session_duration_days: 7,
    dual_token_mode: true,
    access_token_expire_minutes: 15,
    refresh_token_expire_days: 7,
  },
};

// Helper: paginate array
function paginate<T>(items: T[], page = 1, limit = 10): T[] {
  const p = Math.max(1, Number(page) || 1);
  const l = Math.max(1, Math.min(100, Number(limit) || 10));
  const start = (p - 1) * l;
  return items.slice(start, start + l);
}

// Helper: build auth response with optional dual-token refresh_token
function createAuthTokenResponse(account: any) {
  const response: any = {
    access_token: `tc_jwt_token_${account.id}_${Date.now()}`,
    token_type: 'Bearer',
    account,
  };
  if (systemConfig.jwt.dual_token_mode) {
    response.refresh_token = `tc_jwt_ref_${account.id}_${Date.now()}`;
  }
  return response;
}

// Helper: resolve frontend_url from body, query, Origin, Referer, or Host headers
function resolveFrontendUrl(req: Request): string {
  const bodyUrl = req.body?.frontend_url;
  const queryUrl = req.query?.frontend_url as string;
  const origin = req.headers.origin as string;
  const referer = req.headers.referer as string;
  const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';
  const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || 'localhost:3000';

  if (bodyUrl && typeof bodyUrl === 'string' && bodyUrl.trim()) return bodyUrl.trim().replace(/\/+$/, '');
  if (queryUrl && typeof queryUrl === 'string' && queryUrl.trim()) return queryUrl.trim().replace(/\/+$/, '');
  if (origin && typeof origin === 'string' && origin.trim()) return origin.trim().replace(/\/+$/, '');
  if (referer && typeof referer === 'string' && referer.trim()) {
    try {
      const parsed = new URL(referer);
      return `${parsed.protocol}//${parsed.host}`.replace(/\/+$/, '');
    } catch {
      // ignore
    }
  }
  return `${proto}://${host}`.replace(/\/+$/, '');
}

// ==========================================
// 1. CONFIG & SYSTEM ROUTES
// ==========================================

// GET /config/pulse
tcAuthRouter.get(['/config/pulse', '/config/pulse/'], (_req: Request, res: Response) => {
  res.json({
    system_time: new Date().toISOString(),
    response: 'Hello',
    status: 'healthy',
    state: 'active',
  });
});

// GET /config/counts
tcAuthRouter.get(['/config/counts', '/config/counts/'], (_req: Request, res: Response) => {
  res.json({
    accounts: accounts.length,
    oauth: oauthLinks.length,
    sessions: sessions.length,
    otp: otpRecords.length,
  });
});

// GET /config/load/
tcAuthRouter.get(['/config/load', '/config/load/'], (_req: Request, res: Response) => {
  res.json(systemConfig);
});

// POST /config/email
tcAuthRouter.post(['/config/email', '/config/email/'], (req: Request, res: Response) => {
  systemConfig.email = { ...systemConfig.email, ...req.body };
  res.json({
    success: true,
    message: 'Email service configured successfully',
  });
});

// POST /config/github
tcAuthRouter.post(['/config/github', '/config/github/'], (req: Request, res: Response) => {
  systemConfig.github = { ...systemConfig.github, ...req.body };
  res.json({
    success: true,
    message: 'GitHub OAuth configured successfully',
  });
});

// POST /config/google
tcAuthRouter.post(['/config/google', '/config/google/'], (req: Request, res: Response) => {
  systemConfig.google = { ...systemConfig.google, ...req.body };
  res.json({
    success: true,
    message: 'Google OAuth configured successfully',
  });
});

// POST /config/discord
tcAuthRouter.post(['/config/discord', '/config/discord/'], (req: Request, res: Response) => {
  systemConfig.discord = { ...systemConfig.discord, ...req.body };
  res.json({
    success: true,
    message: 'Discord OAuth configured successfully',
  });
});

// POST /config/jwt
tcAuthRouter.post(['/config/jwt', '/config/jwt/'], (req: Request, res: Response) => {
  systemConfig.jwt = { ...systemConfig.jwt, ...req.body };
  res.json({
    success: true,
    message: 'JWT configured successfully',
  });
});

// ==========================================
// 2. AUTHENTICATION & LOGIN ROUTES
// ==========================================

// POST /send/email/otp/:purpose
tcAuthRouter.post(['/send/email/otp/:purpose', '/send/email/otp/:purpose/'], (req: Request, res: Response) => {
  const { purpose } = req.params;
  const normalizedPurpose = (purpose || '').toLowerCase();

  // Enforce OTP purpose restriction (signup, login, reset, verify)
  if (!ALLOWED_OTP_PURPOSES.includes(normalizedPurpose)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email purpose. Allowed purposes are: signup, login, reset, verify',
      detail: 'Invalid email purpose. Allowed purposes are: signup, login, reset, verify',
    });
  }

  const { email } = req.body;
  const frontendUrl = resolveFrontendUrl(req);
  const expiryTimestamp = Math.floor(Date.now() / 1000) + 300;
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  otpRecords.push({
    id: otpRecords.length + 1,
    identifier: email || 'user@example.com',
    otp: code,
    purpose: normalizedPurpose,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 300000).toISOString(),
  });

  res.json({
    expires_at: expiryTimestamp,
    frontend_url: frontendUrl,
  });
});

// POST /send/email/link/:purpose (Dedicated Magic Link Route)
tcAuthRouter.post(['/send/email/link/:purpose', '/send/email/link/:purpose/'], (req: Request, res: Response) => {
  const { purpose } = req.params;
  const normalizedPurpose = (purpose || '').toLowerCase();

  if (!ALLOWED_OTP_PURPOSES.includes(normalizedPurpose)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email purpose. Allowed purposes are: signup, login, reset, verify',
      detail: 'Invalid email purpose. Allowed purposes are: signup, login, reset, verify',
    });
  }

  const { email } = req.body;
  const frontendUrl = resolveFrontendUrl(req);
  const expiryTimestamp = Math.floor(Date.now() / 1000) + 300;
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  otpRecords.push({
    id: otpRecords.length + 1,
    identifier: email || 'user@example.com',
    otp: code,
    purpose: normalizedPurpose,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 300000).toISOString(),
  });

  res.json({
    expires_at: expiryTimestamp,
    frontend_url: frontendUrl,
  });
});

// GET /link/:purpose (Direct Browser Verification via Email Link Click)
tcAuthRouter.get(['/link/:purpose', '/link/:purpose/'], (req: Request, res: Response) => {
  const { purpose } = req.params;
  const normalizedPurpose = (purpose || '').toLowerCase();
  const email = (req.query.email as string) || '';
  const otp = (req.query.otp as string) || '';
  const frontendUrl = resolveFrontendUrl(req);

  if (!ALLOWED_OTP_PURPOSES.includes(normalizedPurpose)) {
    return res.redirect(307, `${frontendUrl}/magic-link/callback?error=${encodeURIComponent('Invalid magic link purpose')}`);
  }

  if (!email || !otp) {
    return res.redirect(307, `${frontendUrl}/magic-link/callback?error=${encodeURIComponent('Missing required email or OTP token parameter')}`);
  }

  // Validate OTP in records or check length
  const recordIndex = otpRecords.findIndex(
    (r) =>
      r.identifier.toLowerCase() === email.toLowerCase() &&
      r.purpose.toLowerCase() === normalizedPurpose &&
      r.otp === otp
  );

  const isValid = recordIndex !== -1 || otp.length === 6;

  if (!isValid) {
    return res.redirect(307, `${frontendUrl}/magic-link/callback?error=${encodeURIComponent('Invalid or expired Magic Link. Please request a new one.')}`);
  }

  // Burn OTP if purpose is 'login' or 'verify'
  if (normalizedPurpose === 'login' || normalizedPurpose === 'verify') {
    if (recordIndex !== -1) {
      otpRecords.splice(recordIndex, 1);
    }
  }

  if (normalizedPurpose === 'login') {
    let account = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (!account) {
      account = {
        id: accounts.length + 1,
        uid: `tc_usr_${String(accounts.length + 1).padStart(2, '0')}`,
        name: email.split('@')[0],
        email: email,
        handle: email.split('@')[0],
        avatar_url: null,
        phone: null,
        role: 'user' as const,
        status: 'active' as const,
        has_password: false,
        created_at: new Date().toISOString(),
      };
      accounts.push(account);
    }
    const tokenData = createAuthTokenResponse(account);
    let redirectUrl = `${frontendUrl}/oauth/callback?access_token=${encodeURIComponent(tokenData.access_token)}`;
    if (tokenData.refresh_token) {
      redirectUrl += `&refresh_token=${encodeURIComponent(tokenData.refresh_token)}`;
    }
    return res.redirect(307, redirectUrl);
  }

  if (normalizedPurpose === 'verify') {
    const account = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (account) {
      account.status = 'active';
    }
    return res.redirect(307, `${frontendUrl}/magic-link/callback?verified=true&email=${encodeURIComponent(email)}`);
  }

  if (normalizedPurpose === 'reset') {
    return res.redirect(307, `${frontendUrl}/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`);
  }

  if (normalizedPurpose === 'signup') {
    return res.redirect(307, `${frontendUrl}/signup?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}&verified=true`);
  }

  return res.redirect(307, `${frontendUrl}/magic-link/callback?error=${encodeURIComponent('Unknown action')}`);
});

// POST /link/:purpose (Programmatic Bot-Safe Magic Link Verification)
tcAuthRouter.post(['/link/:purpose', '/link/:purpose/'], (req: Request, res: Response) => {
  const { purpose } = req.params;
  const normalizedPurpose = (purpose || '').toLowerCase();
  const { email, otp } = req.body;

  if (!ALLOWED_OTP_PURPOSES.includes(normalizedPurpose)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid purpose for magic link verification',
      detail: 'Invalid purpose for magic link verification',
    });
  }

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Email and OTP are required',
      detail: 'Email and OTP are required',
    });
  }

  const recordIndex = otpRecords.findIndex(
    (r) =>
      r.identifier.toLowerCase() === email.toLowerCase() &&
      r.purpose.toLowerCase() === normalizedPurpose &&
      r.otp === otp
  );

  const isValid = recordIndex !== -1 || otp.length === 6;

  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired verification code',
      detail: 'Invalid or expired verification code',
    });
  }

  // Burn OTP if purpose is 'login' or 'verify'
  if (normalizedPurpose === 'login' || normalizedPurpose === 'verify') {
    if (recordIndex !== -1) {
      otpRecords.splice(recordIndex, 1);
    }
  }

  if (normalizedPurpose === 'login') {
    let account = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (!account) {
      account = {
        id: accounts.length + 1,
        uid: `tc_usr_${String(accounts.length + 1).padStart(2, '0')}`,
        name: email.split('@')[0],
        email: email,
        handle: email.split('@')[0],
        avatar_url: null,
        phone: null,
        role: 'user' as const,
        status: 'active' as const,
        has_password: false,
        created_at: new Date().toISOString(),
      };
      accounts.push(account);
    }
    return res.json(createAuthTokenResponse(account));
  }

  if (normalizedPurpose === 'verify') {
    const account = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (account) {
      account.status = 'active';
    }
    return res.json({
      success: true,
      message: 'Email verified successfully',
      email,
    });
  }

  return res.json({
    success: true,
    message: 'Verification valid',
    email,
    otp,
  });
});

// POST /signup/otp
tcAuthRouter.post(['/signup/otp', '/signup/otp/'], (req: Request, res: Response) => {
  const { name, email, handle, password } = req.body;

  if (password) {
    const check = validatePassword(password);
    if (!check.valid) {
      return res.status(400).json({
        success: false,
        message: check.message,
        detail: check.message,
      });
    }
  }

  const newAccount = {
    id: accounts.length + 1,
    uid: `tc_usr_${String(accounts.length + 1).padStart(2, '0')}`,
    name: name || 'New User',
    email: email || 'user@example.com',
    handle: handle || 'newuser',
    avatar_url: null,
    phone: null,
    role: 'user' as const,
    status: 'active' as const,
    has_password: Boolean(password),
    created_at: new Date().toISOString(),
  };
  accounts.push(newAccount);

  res.json(createAuthTokenResponse(newAccount));
});

// POST /signup/password
tcAuthRouter.post(['/signup/password', '/signup/password/'], (req: Request, res: Response) => {
  const { name, email, handle, password } = req.body;

  const check = validatePassword(password);
  if (!check.valid) {
    return res.status(400).json({
      success: false,
      message: check.message,
      detail: check.message,
    });
  }

  const newAccount = {
    id: accounts.length + 1,
    uid: `tc_usr_${String(accounts.length + 1).padStart(2, '0')}`,
    name: name || 'New User',
    email: email || 'user@example.com',
    handle: handle || 'newuser',
    avatar_url: null,
    phone: null,
    role: 'user' as const,
    status: 'active' as const,
    has_password: true,
    created_at: new Date().toISOString(),
  };
  accounts.push(newAccount);

  res.json(createAuthTokenResponse(newAccount));
});

// POST /login/otp
tcAuthRouter.post(['/login/otp', '/login/otp/'], (req: Request, res: Response) => {
  const { email } = req.body;
  const account = accounts.find((a) => a.email.toLowerCase() === (email || '').toLowerCase()) || accounts[0];

  res.json(createAuthTokenResponse(account));
});

// POST /login/password
tcAuthRouter.post(['/login/password', '/login/password/'], (req: Request, res: Response) => {
  const { identifier } = req.body;
  const target = (identifier || '').toLowerCase();
  const account = accounts.find((a) => a.email.toLowerCase() === target || a.handle.toLowerCase() === target) || accounts[0];

  res.json(createAuthTokenResponse(account));
});

// POST /forgot/password
tcAuthRouter.post(['/forgot/password', '/forgot/password/'], (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (password) {
    const check = validatePassword(password);
    if (!check.valid) {
      return res.status(400).json({
        success: false,
        message: check.message,
        detail: check.message,
      });
    }
  }

  const account = accounts.find((a) => a.email.toLowerCase() === (email || '').toLowerCase()) || accounts[0];
  account.has_password = true;

  res.json(createAuthTokenResponse(account));
});

// POST /token/refresh
tcAuthRouter.post(['/token/refresh', '/token/refresh/'], (req: Request, res: Response) => {
  if (!systemConfig.jwt.dual_token_mode) {
    return res.status(400).json({
      success: false,
      error: 'dual_token_mode_disabled',
      message: 'Dual-token authentication mode is disabled in system configuration.',
      detail: 'Switch token_mode to dual in JWT settings to enable refresh tokens and rotation.',
    });
  }

  const { refresh_token } = req.body;
  if (!refresh_token || typeof refresh_token !== 'string') {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token',
      detail: 'Invalid or expired refresh token',
    });
  }

  // Accept valid refresh tokens and rotate
  const newAccessToken = `tc_jwt_token_${Date.now()}`;
  const newRefreshToken = `tc_jwt_ref_${Date.now()}`;

  res.json({
    access_token: newAccessToken,
    refresh_token: newRefreshToken,
    token_type: 'Bearer',
  });
});

// ==========================================
// 3. OAUTH PROVIDERS (GOOGLE, GITHUB, DISCORD)
// ==========================================

function handleOAuthLogin(provider: string, req: Request, res: Response) {
  const frontendUrl = (req.query.frontend_url as string) || (req.headers.referer ? new URL(req.headers.referer).origin : 'http://localhost:3000');
  const token = `tc_jwt_token_${provider}_${Date.now()}`;
  let redirectUrl = `${frontendUrl}/oauth/callback?access_token=${token}&provider=${provider}`;

  if (systemConfig.jwt.dual_token_mode) {
    const refreshToken = `tc_jwt_ref_${provider}_${Date.now()}`;
    redirectUrl += `&refresh_token=${refreshToken}`;
  }

  // Direct redirect simulating successful OAuth callback flow
  return res.redirect(307, redirectUrl);
}

tcAuthRouter.get(['/google/login', '/google/login/'], (req: Request, res: Response) => handleOAuthLogin('google', req, res));
tcAuthRouter.get(['/google/callback', '/google/callback/'], (req: Request, res: Response) => handleOAuthLogin('google', req, res));

tcAuthRouter.get(['/github/login', '/github/login/'], (req: Request, res: Response) => handleOAuthLogin('github', req, res));
tcAuthRouter.get(['/github/callback', '/github/callback/'], (req: Request, res: Response) => handleOAuthLogin('github', req, res));

tcAuthRouter.get(['/discord/login', '/discord/login/'], (req: Request, res: Response) => handleOAuthLogin('discord', req, res));
tcAuthRouter.get(['/discord/callback', '/discord/callback/'], (req: Request, res: Response) => handleOAuthLogin('discord', req, res));

// ==========================================
// 4. USER-LEVEL OAUTH LINKING & SAFE UNLINKING
// ==========================================

// GET /account/oauth/links
tcAuthRouter.get(['/account/oauth/links', '/account/oauth/links/'], (_req: Request, res: Response) => {
  const account = accounts[0]; // Authenticated current user
  const userLinks = oauthLinks.filter((l) => String(l.account_id) === String(account.id));
  res.json(userLinks);
});

// POST /account/oauth/link/:provider
tcAuthRouter.post(['/account/oauth/link/:provider', '/account/oauth/link/:provider/'], (req: Request, res: Response) => {
  const { provider } = req.params;
  const account = accounts[0];
  const { provider_user_id, frontend_url } = req.body || {};

  if (frontend_url && !provider_user_id) {
    return res.redirect(307, `${frontend_url}/oauth/callback?linked=true&provider=${provider}`);
  }

  const newLink = {
    id: oauthLinks.length + 1,
    account_id: String(account.id),
    provider: provider.toLowerCase(),
    provider_user_id: provider_user_id || `${provider}_${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  // Avoid duplicate provider linking
  const existingIdx = oauthLinks.findIndex(
    (l) => String(l.account_id) === String(account.id) && l.provider.toLowerCase() === provider.toLowerCase()
  );
  if (existingIdx >= 0) {
    oauthLinks[existingIdx] = newLink;
  } else {
    oauthLinks.push(newLink);
  }

  res.json(newLink);
});

// DELETE /account/oauth/:provider (with lockout prevention rule)
tcAuthRouter.delete(['/account/oauth/:provider', '/account/oauth/:provider/'], (req: Request, res: Response) => {
  const { provider } = req.params;
  const account = accounts[0]; // Current authenticated user

  const userLinks = oauthLinks.filter((l) => String(l.account_id) === String(account.id));
  const linkExists = userLinks.some((l) => l.provider.toLowerCase() === provider.toLowerCase());

  if (!linkExists) {
    return res.status(404).json({
      success: false,
      message: `OAuth link for provider '${provider}' not found`,
      detail: `OAuth link for provider '${provider}' not found`,
    });
  }

  // Safe Unlinking / Lockout Prevention Rule:
  // Cannot unlink if account has NO password AND this is the ONLY authentication method
  if (!account.has_password && userLinks.length <= 1) {
    return res.status(400).json({
      success: false,
      message: 'Cannot unlink provider: account must have a password or at least one other active authentication method',
      detail: 'Cannot unlink provider: account must have a password or at least one other active authentication method',
    });
  }

  oauthLinks = oauthLinks.filter(
    (l) => !(String(l.account_id) === String(account.id) && l.provider.toLowerCase() === provider.toLowerCase())
  );

  res.json({
    success: true,
    message: `OAuth link for '${provider}' removed successfully`,
  });
});

// ==========================================
// 5. PROFILE & SESSION MANAGEMENT
// ==========================================

// GET /me
tcAuthRouter.get(['/me', '/me/'], (req: Request, res: Response) => {
  const account = accounts[0];
  const session = sessions[0] || {
    id: 1,
    token: 'tc_sess_live_current',
    account_id: String(account.id),
    user_agent: req.headers['user-agent'] || 'Unknown',
    ip_address: req.ip || '127.0.0.1',
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 86400000 * 7).toISOString(),
  };

  res.json({
    account,
    session,
    payload: {
      sub: account.uid,
      role: account.role,
      status: account.status,
      session_id: session.id,
    },
  });
});

// PATCH /me
tcAuthRouter.patch(['/me', '/me/'], (req: Request, res: Response) => {
  const account = accounts[0];
  if (req.body.name) account.name = req.body.name;
  if (req.body.email) account.email = req.body.email;
  if (req.body.handle) account.handle = req.body.handle;
  if (req.body.phone !== undefined) account.phone = req.body.phone;
  if (req.body.avatar_url !== undefined) account.avatar_url = req.body.avatar_url;

  res.json(account);
});

// PUT /update/password
tcAuthRouter.put(['/update/password', '/update/password/'], (req: Request, res: Response) => {
  const { password } = req.body;
  const check = validatePassword(password);
  if (!check.valid) {
    return res.status(400).json({
      success: false,
      message: check.message,
      detail: check.message,
    });
  }

  const account = accounts[0];
  account.has_password = true;

  res.json({
    success: true,
    message: 'Password updated successfully',
  });
});

// POST /logout
tcAuthRouter.post(['/logout', '/logout/'], (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Session destroyed successfully',
  });
});

// POST /logout-all
tcAuthRouter.post(['/logout-all', '/logout-all/'], (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'All sessions destroyed for account',
    count: 1,
  });
});

// ==========================================
// 6. ACCOUNT DASHBOARD ROUTES
// ==========================================

// GET /account/ and /account/query
tcAuthRouter.get(['/account', '/account/', '/account/query'], (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit || req.query.page_size) || 10;
  const field = req.query.field as string;
  const value = req.query.value as string;

  let filtered = accounts;
  if (field && value) {
    filtered = accounts.filter((a: any) =>
      String(a[field] || '').toLowerCase().includes(value.toLowerCase())
    );
  }

  res.json(paginate(filtered, page, limit));
});

// POST /account/
tcAuthRouter.post(['/account', '/account/'], (req: Request, res: Response) => {
  if (req.body.password) {
    const check = validatePassword(req.body.password);
    if (!check.valid) {
      return res.status(400).json({
        success: false,
        message: check.message,
        detail: check.message,
      });
    }
  }

  const newAccount = {
    id: accounts.length + 1,
    uid: `tc_usr_${String(accounts.length + 1).padStart(2, '0')}`,
    name: req.body.name || 'New User',
    email: req.body.email || 'user@example.com',
    handle: req.body.handle || 'user',
    avatar_url: req.body.avatar_url || null,
    phone: req.body.phone || null,
    role: req.body.role || 'user',
    status: req.body.status || 'active',
    has_password: Boolean(req.body.password),
    created_at: new Date().toISOString(),
  };
  accounts.push(newAccount);
  res.json(newAccount);
});

// PATCH /account/
tcAuthRouter.patch(['/account', '/account/'], (req: Request, res: Response) => {
  const id = req.body.account_id || req.body.id;
  const account = accounts.find((a) => String(a.id) === String(id) || a.uid === id);
  if (!account) {
    return res.status(404).json({ detail: 'Account not found' });
  }

  if (req.body.password) {
    const check = validatePassword(req.body.password);
    if (!check.valid) {
      return res.status(400).json({
        success: false,
        message: check.message,
        detail: check.message,
      });
    }
    account.has_password = true;
  }

  if (req.body.name) account.name = req.body.name;
  if (req.body.email) account.email = req.body.email;
  if (req.body.handle) account.handle = req.body.handle;
  if (req.body.role) account.role = req.body.role;
  if (req.body.status) account.status = req.body.status;
  if (req.body.phone !== undefined) account.phone = req.body.phone;
  if (req.body.avatar_url !== undefined) account.avatar_url = req.body.avatar_url;

  res.json(account);
});

// DELETE /account/
tcAuthRouter.delete(['/account', '/account/'], (req: Request, res: Response) => {
  const id = req.body.account_id || req.body.id || req.query.account_id;
  accounts = accounts.filter((a) => String(a.id) !== String(id) && a.uid !== id);

  res.json({
    success: true,
    message: 'Account deleted successfully',
  });
});

// ==========================================
// 7. SESSION DASHBOARD ROUTES
// ==========================================

// GET /session/ and /session/query
tcAuthRouter.get(['/session', '/session/', '/session/query'], (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit || req.query.page_size) || 10;
  const field = req.query.field as string;
  const value = req.query.value as string;

  let filtered = sessions;
  if (field && value) {
    filtered = sessions.filter((s: any) =>
      String(s[field] || '').toLowerCase().includes(value.toLowerCase())
    );
  }

  res.json(paginate(filtered, page, limit));
});

// DELETE /session/
tcAuthRouter.delete(['/session', '/session/'], (req: Request, res: Response) => {
  const id = req.body.session_id || req.body.id || req.query.session_id;
  sessions = sessions.filter((s) => String(s.id) !== String(id));

  res.json({
    success: true,
    message: 'Session destroyed successfully',
  });
});

// DELETE /session/all
tcAuthRouter.delete(['/session/all', '/session/all/'], (req: Request, res: Response) => {
  const accountId = req.body.account_id || req.query.account_id;
  const prevCount = sessions.length;
  sessions = sessions.filter((s) => String(s.account_id) !== String(accountId));
  const count = prevCount - sessions.length;

  res.json({
    success: true,
    message: 'All sessions destroyed for account',
    count,
  });
});

// DELETE /session/cleanup
tcAuthRouter.delete(['/session/cleanup', '/session/cleanup/'], (_req: Request, res: Response) => {
  const now = Date.now();
  const prevCount = sessions.length;
  sessions = sessions.filter((s) => new Date(s.expires_at).getTime() > now);
  const count = prevCount - sessions.length;

  res.json({
    success: true,
    message: 'Expired sessions cleaned up successfully',
    count,
  });
});

// DELETE /session/clear
tcAuthRouter.delete(['/session/clear', '/session/clear/'], (_req: Request, res: Response) => {
  const count = sessions.length;
  sessions = [];

  res.json({
    success: true,
    message: 'All sessions cleared successfully',
    count,
  });
});

// ==========================================
// 8. OTP DASHBOARD ROUTES
// ==========================================

// GET /otp/ and /otp/query
tcAuthRouter.get(['/otp', '/otp/', '/otp/query'], (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit || req.query.page_size) || 10;
  const field = req.query.field as string;
  const value = req.query.value as string;

  let filtered = otpRecords;
  if (field && value) {
    filtered = otpRecords.filter((o: any) =>
      String(o[field] || '').toLowerCase().includes(value.toLowerCase())
    );
  }

  res.json(paginate(filtered, page, limit));
});

// POST /otp/
tcAuthRouter.post(['/otp', '/otp/'], (req: Request, res: Response) => {
  const { identifier, purpose, expiry } = req.body;
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Math.floor(Date.now() / 1000) + (Number(expiry) || 300);

  otpRecords.push({
    id: otpRecords.length + 1,
    identifier: identifier || 'user@example.com',
    otp: code,
    purpose: purpose || 'login',
    created_at: new Date().toISOString(),
    expires_at: new Date(expiresAt * 1000).toISOString(),
  });

  res.json({
    otp: code,
    expires_at: expiresAt,
  });
});

// DELETE /otp/
tcAuthRouter.delete(['/otp', '/otp/'], (req: Request, res: Response) => {
  const { identifier, purpose } = req.body;
  const prevCount = otpRecords.length;
  otpRecords = otpRecords.filter(
    (o) => !(o.identifier === identifier && o.purpose.toLowerCase() === (purpose || '').toLowerCase())
  );
  const count = prevCount - otpRecords.length;

  res.json({
    success: true,
    message: 'OTP revoked successfully',
    count,
  });
});

// DELETE /otp/cleanup
tcAuthRouter.delete(['/otp/cleanup', '/otp/cleanup/'], (_req: Request, res: Response) => {
  const now = Date.now();
  const prevCount = otpRecords.length;
  otpRecords = otpRecords.filter((o) => new Date(o.expires_at).getTime() > now);
  const count = prevCount - otpRecords.length;

  res.json({
    success: true,
    message: 'Expired OTPs cleaned successfully',
    count,
  });
});

// DELETE /otp/clear
tcAuthRouter.delete(['/otp/clear', '/otp/clear/'], (_req: Request, res: Response) => {
  const count = otpRecords.length;
  otpRecords = [];

  res.json({
    success: true,
    message: 'All OTPs cleared successfully',
    count,
  });
});

// ==========================================
// 9. OAUTH LINKS DASHBOARD ROUTES
// ==========================================

// GET /oauth/ and /oauth/query
tcAuthRouter.get(['/oauth', '/oauth/', '/oauth/query'], (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit || req.query.page_size) || 10;
  const field = req.query.field as string;
  const value = req.query.value as string;

  let filtered = oauthLinks;
  if (field && value) {
    filtered = oauthLinks.filter((l: any) =>
      String(l[field] || '').toLowerCase().includes(value.toLowerCase())
    );
  }

  res.json(paginate(filtered, page, limit));
});

// POST /oauth/
tcAuthRouter.post(['/oauth', '/oauth/'], (req: Request, res: Response) => {
  const newLink = {
    id: oauthLinks.length + 1,
    account_id: String(req.body.account_id || '1'),
    provider: req.body.provider || 'google',
    provider_user_id: req.body.provider_user_id || `oauth_${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  oauthLinks.push(newLink);
  res.json(newLink);
});

// DELETE /oauth/
tcAuthRouter.delete(['/oauth', '/oauth/'], (req: Request, res: Response) => {
  const { account_id, provider } = req.body;
  oauthLinks = oauthLinks.filter(
    (l) => !(String(l.account_id) === String(account_id) && l.provider.toLowerCase() === (provider || '').toLowerCase())
  );

  res.json({
    success: true,
    message: 'OAuth link removed successfully',
  });
});
