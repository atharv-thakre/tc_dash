import {
  Account,
  ConfigPayload,
  OAuthLink,
  OTPRecord,
  SessionRecord,
} from '../types';

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc_01h8x8k9z01',
    uid: 'uid_admin_001',
    name: 'Atharv Thakre',
    handle: 'superadmin',
    email: 'admin@tcauth.dev',
    phone: '+91 98765 43210',
    avatar_url:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'superadmin',
    status: 'active',
    created_at: '2026-01-10T08:30:00Z',
    updated_at: '2026-08-01T14:20:00Z',
  },
  {
    id: 'acc_01h8x8k9z02',
    uid: 'uid_admin_002',
    name: 'Ananya Sharma',
    handle: 'ananya_admin',
    email: 'ananya.sharma@codesena.dev',
    phone: '+91 98123 45678',
    avatar_url:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    status: 'active',
    created_at: '2026-02-14T11:15:00Z',
    updated_at: '2026-07-28T09:10:00Z',
  },
  {
    id: 'acc_01h8x8k9z03',
    uid: 'uid_user_003',
    name: 'Rohan Kulkarni',
    handle: 'rohan_kulkarni',
    email: 'rohan.kulkarni@example.com',
    phone: '+91 97654 32109',
    avatar_url:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'user',
    status: 'active',
    created_at: '2026-03-22T16:45:00Z',
    updated_at: '2026-08-05T18:00:00Z',
  },
  {
    id: 'acc_01h8x8k9z04',
    uid: 'uid_user_004',
    name: 'Priya Nair',
    handle: 'priya_nair',
    email: 'priya.nair@example.com',
    phone: null,
    avatar_url:
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&auto=format&fit=crop&q=80',
    role: 'user',
    status: 'pending',
    created_at: '2026-08-01T09:10:00Z',
    updated_at: '2026-08-01T09:10:00Z',
  },
  {
    id: 'acc_01h8x8k9z05',
    uid: 'uid_user_005',
    name: 'Kavya Iyer',
    handle: 'kavya_iyer',
    email: 'kavya.iyer@example.com',
    phone: '+91 98987 65432',
    avatar_url:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'user',
    status: 'suspended',
    created_at: '2026-05-19T13:20:00Z',
    updated_at: '2026-08-02T10:11:00Z',
  },
  {
    id: 'acc_01h8x8k9z06',
    uid: 'uid_user_006',
    name: 'Vikram Deshmukh',
    handle: 'vikram_d',
    email: 'vikram.deshmukh@example.com',
    phone: '+91 98231 76543',
    avatar_url:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    role: 'user',
    status: 'active',
    created_at: '2026-04-08T10:20:00Z',
    updated_at: '2026-08-06T12:30:00Z',
  },
  {
    id: 'acc_01h8x8k9z07',
    uid: 'uid_user_007',
    name: 'Meera Joshi',
    handle: 'meera_joshi',
    email: 'meera.joshi@example.com',
    phone: '+91 98701 23456',
    avatar_url:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    role: 'user',
    status: 'active',
    created_at: '2026-04-19T14:40:00Z',
    updated_at: '2026-08-07T16:15:00Z',
  },
  {
    id: 'acc_01h8x8k9z08',
    uid: 'uid_user_008',
    name: 'Aditya Verma',
    handle: 'aditya_verma',
    email: 'aditya.verma@example.com',
    phone: '+91 99876 54321',
    avatar_url:
      'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
    role: 'user',
    status: 'active',
    created_at: '2026-05-03T08:50:00Z',
    updated_at: '2026-08-08T11:20:00Z',
  },
  {
    id: 'acc_01h8x8k9z09',
    uid: 'uid_user_009',
    name: 'Ishita Kapoor',
    handle: 'ishita_k',
    email: 'ishita.kapoor@example.com',
    phone: null,
    avatar_url:
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&auto=format&fit=crop&q=80',
    role: 'user',
    status: 'active',
    created_at: '2026-05-27T12:10:00Z',
    updated_at: '2026-08-09T13:45:00Z',
  },
  {
    id: 'acc_01h8x8k9z10',
    uid: 'uid_user_010',
    name: 'Rahul Menon',
    handle: 'rahul_menon',
    email: 'rahul.menon@example.com',
    phone: '+91 97456 78901',
    avatar_url:
      'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=150&auto=format&fit=crop&q=80',
    role: 'user',
    status: 'active',
    created_at: '2026-06-11T15:25:00Z',
    updated_at: '2026-08-10T09:30:00Z',
  },
];

export const INITIAL_OAUTH_LINKS: OAuthLink[] = [
  // Atharv - Google + GitHub + Discord
  {
    id: 'lnk_9901',
    account_id: 'acc_01h8x8k9z01',
    provider: 'google',
    provider_user_id: 'google_demo_atharv_001',
    created_at: '2026-01-11T09:00:00Z',
  },
  {
    id: 'lnk_9902',
    account_id: 'acc_01h8x8k9z01',
    provider: 'github',
    provider_user_id: 'github_demo_atharv_001',
    created_at: '2026-01-12T14:22:00Z',
  },
  {
    id: 'lnk_9903',
    account_id: 'acc_01h8x8k9z01',
    provider: 'discord',
    provider_user_id: 'discord_demo_atharv_001',
    created_at: '2026-01-13T18:40:00Z',
  },

  // Ananya - Google + GitHub
  {
    id: 'lnk_9904',
    account_id: 'acc_01h8x8k9z02',
    provider: 'google',
    provider_user_id: 'google_demo_ananya_002',
    created_at: '2026-02-15T12:00:00Z',
  },
  {
    id: 'lnk_9905',
    account_id: 'acc_01h8x8k9z02',
    provider: 'github',
    provider_user_id: 'github_demo_ananya_002',
    created_at: '2026-02-16T10:30:00Z',
  },

  // Rohan - GitHub
  {
    id: 'lnk_9906',
    account_id: 'acc_01h8x8k9z03',
    provider: 'github',
    provider_user_id: 'github_demo_rohan_003',
    created_at: '2026-03-23T10:15:00Z',
  },

  // Priya - Google
  {
    id: 'lnk_9907',
    account_id: 'acc_01h8x8k9z04',
    provider: 'google',
    provider_user_id: 'google_demo_priya_004',
    created_at: '2026-08-01T09:30:00Z',
  },

  // Kavya - Discord
  {
    id: 'lnk_9908',
    account_id: 'acc_01h8x8k9z05',
    provider: 'discord',
    provider_user_id: 'discord_demo_kavya_005',
    created_at: '2026-05-20T11:45:00Z',
  },

  // Vikram - Google + Discord
  {
    id: 'lnk_9909',
    account_id: 'acc_01h8x8k9z06',
    provider: 'google',
    provider_user_id: 'google_demo_vikram_006',
    created_at: '2026-04-09T09:20:00Z',
  },
  {
    id: 'lnk_9910',
    account_id: 'acc_01h8x8k9z06',
    provider: 'discord',
    provider_user_id: 'discord_demo_vikram_006',
    created_at: '2026-04-10T17:10:00Z',
  },

  // Meera - GitHub + Discord
  {
    id: 'lnk_9911',
    account_id: 'acc_01h8x8k9z07',
    provider: 'github',
    provider_user_id: 'github_demo_meera_007',
    created_at: '2026-04-20T13:25:00Z',
  },
  {
    id: 'lnk_9912',
    account_id: 'acc_01h8x8k9z07',
    provider: 'discord',
    provider_user_id: 'discord_demo_meera_007',
    created_at: '2026-04-21T19:00:00Z',
  },

  // Aditya - Google
  {
    id: 'lnk_9913',
    account_id: 'acc_01h8x8k9z08',
    provider: 'google',
    provider_user_id: 'google_demo_aditya_008',
    created_at: '2026-05-04T08:40:00Z',
  },

  // Ishita - Discord
  {
    id: 'lnk_9914',
    account_id: 'acc_01h8x8k9z09',
    provider: 'discord',
    provider_user_id: 'discord_demo_ishita_009',
    created_at: '2026-05-28T15:20:00Z',
  },

  // Rahul - Google + GitHub
  {
    id: 'lnk_9915',
    account_id: 'acc_01h8x8k9z10',
    provider: 'google',
    provider_user_id: 'google_demo_rahul_010',
    created_at: '2026-06-12T11:10:00Z',
  },
  {
    id: 'lnk_9916',
    account_id: 'acc_01h8x8k9z10',
    provider: 'github',
    provider_user_id: 'github_demo_rahul_010',
    created_at: '2026-06-13T16:45:00Z',
  },
];

export const INITIAL_OTP_RECORDS: OTPRecord[] = [
  {
    id: 'otp_8801',
    identifier: 'admin@tcauth.dev',
    purpose: 'login',
    code_hash: '$2a$12$demo_hash_for_seed_data_only',
    attempts: 0,
    expires_at: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
  {
    id: 'otp_8802',
    identifier: 'rohan.kulkarni@example.com',
    purpose: 'reset',
    code_hash: '$2a$12$demo_reset_hash_for_seed_data_only',
    attempts: 1,
    expires_at: new Date(Date.now() + 1000 * 60 * 5).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: 'otp_8803',
    identifier: 'priya.nair@example.com',
    purpose: 'signup',
    code_hash: '$2a$12$demo_expired_hash_for_seed_data_only',
    attempts: 2,
    expires_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'otp_8804',
    identifier: 'meera.joshi@example.com',
    purpose: 'login',
    code_hash: '$2a$12$demo_login_hash_for_seed_data_only',
    attempts: 0,
    expires_at: new Date(Date.now() + 1000 * 60 * 12).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  },
  {
    id: 'otp_8805',
    identifier: 'rahul.menon@example.com',
    purpose: 'reset',
    code_hash: '$2a$12$demo_reset_hash_rahul_seed_data',
    attempts: 2,
    expires_at: new Date(Date.now() + 1000 * 60 * 8).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
  },
];

export const INITIAL_SESSIONS: SessionRecord[] = [
  {
    id: 'sess_1001',
    account_id: 'acc_01h8x8k9z01',
    token_hash: 'demo_token_hash_current_001',
    ip_address: '103.91.84.21',
    user_agent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36',
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: 'sess_1002',
    account_id: 'acc_01h8x8k9z01',
    token_hash: 'demo_token_hash_mobile_002',
    ip_address: '49.36.112.87',
    user_agent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'sess_1003',
    account_id: 'acc_01h8x8k9z02',
    token_hash: 'demo_token_hash_workstation_003',
    ip_address: '117.201.45.63',
    user_agent:
      'Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0',
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'sess_1004',
    account_id: 'acc_01h8x8k9z03',
    token_hash: 'demo_token_hash_home_004',
    ip_address: '122.176.98.41',
    user_agent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/139.0.0.0 Safari/537.36',
    expires_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
  },
  {
    id: 'sess_1005',
    account_id: 'acc_01h8x8k9z06',
    token_hash: 'demo_token_hash_vikram_005',
    ip_address: '49.204.76.18',
    user_agent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36',
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: 'sess_1006',
    account_id: 'acc_01h8x8k9z07',
    token_hash: 'demo_token_hash_meera_006',
    ip_address: '14.139.92.44',
    user_agent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36',
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
  },
  {
    id: 'sess_1007',
    account_id: 'acc_01h8x8k9z08',
    token_hash: 'demo_token_hash_aditya_007',
    ip_address: '103.108.45.72',
    user_agent:
      'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0',
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  },
  {
    id: 'sess_1008',
    account_id: 'acc_01h8x8k9z10',
    token_hash: 'demo_token_hash_rahul_008',
    ip_address: '117.194.28.91',
    user_agent:
      'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/140.0.0.0 Mobile Safari/537.36',
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
];

export const INITIAL_CONFIG: ConfigPayload = {
  email: {
    host: 'smtp.example.com',
    port: 587,
    username: 'demo@example.com',
    password: 'DEMO_SMTP_PASSWORD',
    sender: 'noreply@codesena.me',
    sender_name: 'CodeSena Auth',
    use_tls: true,
  },

  github: {
    client_id: 'DEMO_GITHUB_CLIENT_ID',
    client_secret: 'DEMO_GITHUB_CLIENT_SECRET',
    redirect_uri: 'http://localhost:3000/tc-auth/github/callback',
  },

  google: {
    client_id: 'DEMO_GOOGLE_CLIENT_ID',
    client_secret: 'DEMO_GOOGLE_CLIENT_SECRET',
    redirect_uri: 'http://localhost:3000/tc-auth/google/callback',
  },

  discord: {
    client_id: 'DEMO_DISCORD_CLIENT_ID',
    client_secret: 'DEMO_DISCORD_CLIENT_SECRET',
    redirect_uri: 'http://localhost:3000/tc-auth/discord/callback',
  },

  jwt: {
    secret_key: 'DEMO_JWT_SECRET_DO_NOT_USE_IN_PRODUCTION',
    algorithm: 'HS256',
    session_duration_days: 7,
    dual_token_mode: false,
    access_token_expire_minutes: 15,
    refresh_token_expire_days: 7,
  },
};
