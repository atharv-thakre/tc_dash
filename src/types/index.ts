export type AccountRole = 'superadmin' | 'admin' | 'user';
export type AccountStatus = 'active' | 'suspended' | 'pending' | 'inactive';
export type OTPPurpose = 'login' | 'signup' | 'reset' | 'verify';

export interface Account {
  id: string | number;
  uid?: string;
  name: string;
  handle: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  role: AccountRole;
  status: AccountStatus;
  created_at: string;
  updated_at?: string;
}

export interface SessionInfo {
  id: string | number;
  account_id: string | number;
  token_hash?: string;
  ip_address?: string;
  user_agent?: string;
  expires_at: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  account: Account;
}

export interface RefreshTokenInput {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface MeResponse {
  account: Account;
  session?: SessionInfo;
  payload?: Record<string, unknown>;
}

export interface OAuthLink {
  id: string | number;
  account_id: string | number;
  provider: string;
  provider_user_id: string;
  created_at: string;
}

export interface AccountOAuthLinkInput {
  provider_user_id?: string;
  frontend_url?: string;
}

export interface OTPRecord {
  id: string | number;
  identifier: string;
  purpose: OTPPurpose | string;
  code_hash?: string;
  attempts: number;
  expires_at: string | number;
  created_at: string;
}

export interface CreateOTPResponse {
  otp: string;
  expires_at: string | number;
}

export interface SessionRecord {
  id: string | number;
  account_id: string | number;
  token_hash?: string;
  ip_address?: string;
  user_agent?: string;
  expires_at: string;
  created_at: string;
}

export interface EmailConfig {
  host: string;
  port: number;
  username: string;
  password?: string;
  sender: string;
  sender_name: string;
  use_tls: boolean;
}

export interface OAuthConfig {
  client_id: string;
  client_secret?: string;
  redirect_uri: string;
}

export interface JWTConfig {
  secret_key?: string;
  algorithm: string;
  session_duration_days: number;
  dual_token_mode?: boolean;
  access_token_expire_minutes?: number;
  refresh_token_expire_days?: number;
}

export interface ConfigPayload {
  email: EmailConfig;
  github: OAuthConfig;
  google: OAuthConfig;
  discord: OAuthConfig;
  jwt: JWTConfig;
}

// Input Types matching API reference exactly
export interface StandardActionResponse {
  success: boolean;
  message: string;
  count?: number;
}

export interface SendEmailOTPInput {
  email: string;
  frontend_url?: string;
}

export interface SendEmailOTPResponse {
  expires_at: string | number;
}

export interface SendMagicLinkInput {
  email: string;
  frontend_url?: string;
}

export interface SendMagicLinkResponse {
  expires_at: string | number;
}

export interface VerifyMagicLinkInput {
  email: string;
  otp: string;
}

export interface VerifyEmailMagicLinkResponse {
  success: boolean;
  message: string;
  email?: string;
}

export interface LoginPasswordInput {
  identifier: string;
  password: string;
}

export interface LoginOTPInput {
  email: string;
  otp: string;
}

export interface SignupPasswordInput {
  name: string;
  email: string;
  handle: string;
  password: string;
}

export interface SignupOTPInput {
  name: string;
  email: string;
  password: string;
  otp: string;
  handle: string;
}

export interface UpdatePasswordInput {
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
  otp: string;
  password?: string;
}

export interface PatchMeInput {
  name?: string;
  email?: string;
  handle?: string;
  avatar_url?: string | null;
  phone?: string | null;
}

export interface CreateAccountInput {
  name: string;
  email: string;
  handle: string;
  avatar_url?: string | null;
  phone?: string | null;
  role: AccountRole;
  status: AccountStatus;
  password?: string;
}

export interface PatchAccountInput {
  account_id: string;
  name?: string;
  email?: string;
  handle?: string;
  avatar_url?: string | null;
  phone?: string | null;
  role?: AccountRole;
  status?: AccountStatus;
  password?: string;
}

export interface DeleteAccountInput {
  account_id: string;
}

export interface CreateOAuthLinkInput {
  account_id: string;
  provider: string;
  provider_user_id: string;
}

export interface DeleteOAuthLinkInput {
  account_id: string;
  provider: string;
}

export interface CreateOTPInput {
  identifier: string;
  purpose?: OTPPurpose | string;
  expiry?: number; // in seconds (default 300)
  expires?: number; // optional alias
}

export interface DeleteOTPInput {
  identifier: string;
  purpose: string;
}

export interface DeleteSessionInput {
  session_id: string;
}

export interface DeleteAllSessionsInput {
  account_id: string;
}
