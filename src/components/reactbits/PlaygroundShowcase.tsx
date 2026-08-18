import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  ShieldCheck,
  Terminal,
  Send,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Server,
  Lock,
  Zap,
  Key,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { Magnet } from './Magnet';
import { DecryptedText } from './DecryptedText';
import { ShinyText } from './ShinyText';
import { BorderBeam } from './BorderBeam';

interface PlaygroundShowcaseProps {
  onNavigateDocs?: () => void;
}

export const PlaygroundShowcase: React.FC<PlaygroundShowcaseProps> = ({ onNavigateDocs }) => {
  const [activeTab, setActiveTab] = useState<'otp' | 'jwt' | 'rest'>('otp');

  // --- OTP State ---
  const [otpEmail, setOtpEmail] = useState('developer@tcauth.dev');
  const [otpPurpose, setOtpPurpose] = useState<'login' | 'signup' | 'reset'>('login');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [inputOtp, setInputOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpVerificationResult, setOtpVerificationResult] = useState<'success' | 'failure' | null>(null);

  // --- JWT State ---
  const [jwtRole, setJwtRole] = useState<'user' | 'admin' | 'superadmin'>('superadmin');
  const [jwtStatus, setJwtStatus] = useState<'active' | 'revoked'>('active');

  // --- REST Probe State ---
  const [selectedEndpoint, setSelectedEndpoint] = useState<'login' | 'pulse' | 'me' | 'sessions'>('login');
  const [isProbing, setIsProbing] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSimulateOtp = () => {
    setIsSendingOtp(true);
    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setInputOtp('');
      setOtpVerificationResult(null);
      setIsSendingOtp(false);
      toast.success(`OTP dispatched to ${otpEmail}`);
    }, 400);
  };

  const handleVerifyOtp = () => {
    if (inputOtp === generatedOtp) {
      setOtpVerificationResult('success');
      toast.success('OTP verified! Access token issued.');
    } else {
      setOtpVerificationResult('failure');
      toast.error('Invalid OTP code. Please check the simulated inbox.');
    }
  };

  const handleAutoFill = () => {
    if (generatedOtp) {
      setInputOtp(generatedOtp);
      toast.info('Auto-filled 6-digit OTP code into verification field');
    }
  };

  // JWT Generator mock
  const encodedHeader = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
  const payloadObj = {
    aid: 1,
    sid: 60,
    sub: 'developer@tcauth.dev',
    role: jwtRole,
    status: jwtStatus,
    iat: Math.floor(Date.now() / 1000),
    exp: jwtStatus === 'active' ? Math.floor(Date.now() / 1000) + 604800 : Math.floor(Date.now() / 1000) - 3600,
    iss: 'tc_auth_v1.5.1'
  };
  const encodedPayload = btoa(JSON.stringify(payloadObj)).replace(/=/g, '');
  const encodedSig = 'c3VwZXJzZWNyZXRzaWduYXR1cmVoYXNoMTIzNDU2';
  const fullJwt = `${encodedHeader}.${encodedPayload}.${encodedSig}`;

  // Endpoints mock data
  const endpoints = [
    {
      id: 'login',
      method: 'POST',
      path: '/tc-auth/login/password',
      desc: 'Verify credentials & issue stateful JWT',
      response: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhaWQiOjEsInNpZCI6NjAsInJvbGUiOiJzdXBlcmFkbWluIn0...',
        token_type: 'Bearer',
        account: {
          id: 1,
          uid: '2d7b5f8e-8d8a-4cc4-9c3d-2f2c6c4d2e28',
          name: 'Alex Rivera',
          email: 'developer@tcauth.dev',
          role: 'superadmin',
          status: 'active'
        },
        session: {
          id: 60,
          ip_address: '127.0.0.1',
          user_agent: 'FastAPI REST Client / Python 3.11',
          created_at: new Date().toISOString()
        }
      }
    },
    {
      id: 'pulse',
      method: 'GET',
      path: '/tc-auth/config/pulse',
      desc: 'Database health & connection ping',
      response: {
        system_time: new Date().toISOString(),
        database: 'connected (PostgreSQL 16.2)',
        status: 'healthy',
        active_sessions_count: 24,
        auth_engine_version: '1.5.1'
      }
    },
    {
      id: 'me',
      method: 'GET',
      path: '/tc-auth/me',
      desc: 'Retrieve current authenticated caller profile',
      response: {
        authenticated: true,
        account_id: 1,
        email: 'developer@tcauth.dev',
        role: 'superadmin',
        permissions: ['accounts.read', 'accounts.write', 'sessions.revoke', 'otp.dispatch', 'system.config'],
        session_id: 60
      }
    },
    {
      id: 'sessions',
      method: 'GET',
      path: '/tc-auth/sessions/active',
      desc: 'Audit active device sessions for current account',
      response: {
        total: 2,
        sessions: [
          { id: 60, ip: '127.0.0.1', browser: 'Chrome on macOS', current: true, created: 'Just now' },
          { id: 59, ip: '198.51.100.42', browser: 'Safari on iOS 17', current: false, created: '2 days ago' }
        ]
      }
    }
  ];

  const currentEndpointObj = endpoints.find((e) => e.id === selectedEndpoint) || endpoints[0];

  return (
    <div className="w-full max-w-5xl mx-auto rounded-2xl border border-zinc-800/90 bg-zinc-950/90 backdrop-blur-xl shadow-2xl overflow-hidden relative">
      <BorderBeam size={260} duration={16} colorFrom="#6366f1" colorTo="#a855f7" />

      {/* Top Segmented Navigation Tab Bar */}
      <div className="p-2.5 sm:p-3 bg-zinc-900/70 border-b border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-xl bg-zinc-950/80 border border-zinc-800/80 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'otp', label: '1. Email OTP', fullLabel: '1. Email OTP Simulator', icon: Mail, tag: 'Passwordless' },
            { id: 'jwt', label: '2. JWT Claims', fullLabel: '2. JWT Claims Inspector', icon: ShieldCheck, tag: 'Stateful' },
            { id: 'rest', label: '3. REST Probe', fullLabel: '3. Live REST Probe', icon: Terminal, tag: 'API Engine' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer flex-1 sm:flex-initial select-none ${
                  isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activePlaygroundTabIndicator"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-600/90 to-purple-600/90 shadow-md shadow-indigo-500/20 border border-indigo-400/30"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5 whitespace-nowrap">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-200' : 'text-zinc-400'}`} />
                  <span className="font-medium hidden sm:inline">{tab.fullLabel}</span>
                  <span className="font-medium sm:hidden">{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Status indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Engine Status: <strong className="text-zinc-200">Interactive Sandbox</strong></span>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="p-5 sm:p-7">
        <AnimatePresence mode="wait">
          {/* ========================================================================= */}
          {/* TAB 1: EMAIL OTP SIMULATOR */}
          {/* ========================================================================= */}
          {activeTab === 'otp' && (
            <motion.div
              key="tab-otp"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Column: Dispatch Configuration */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded">
                    Step 1: Dispatch
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">auth.otp.create_otp()</span>
                </div>

                {/* Recipient Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Recipient Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                      placeholder="name@company.dev"
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-zinc-700 bg-zinc-900/90 text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                    />
                  </div>
                  {/* Quick preset chips */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-zinc-500">Presets:</span>
                    {['dev@tcauth.dev', 'admin@startup.io'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setOtpEmail(preset)}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Purpose Flow Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Authentication Purpose Flow
                  </label>
                  <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-zinc-900/90 border border-zinc-800">
                    {(['login', 'signup', 'reset'] as const).map((p) => {
                      const isSelected = otpPurpose === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setOtpPurpose(p)}
                          className={`relative py-1.5 text-xs font-mono font-bold capitalize rounded-lg transition-all cursor-pointer ${
                            isSelected ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {isSelected && (
                            <motion.div
                              layoutId="otpPurposeActive"
                              className="absolute inset-0 rounded-lg bg-indigo-600 shadow-xs"
                              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                            />
                          )}
                          <span className="relative z-10">{p}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Trigger Button */}
                <Magnet magnetStrength={0.2} className="w-full pt-1">
                  <button
                    onClick={handleSimulateOtp}
                    disabled={isSendingOtp}
                    className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSendingOtp ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <Send className="w-4 h-4 text-indigo-200" />
                    )}
                    <span>{isSendingOtp ? 'Dispatching Cryptographic OTP...' : 'Send Simulated OTP Code'}</span>
                  </button>
                </Magnet>

                <p className="text-[11px] text-zinc-500 leading-normal">
                  In production, tc_auth connects directly to your SMTP host or SES service with customizable HTML templates and rate-limiting guards.
                </p>
              </div>

              {/* Right Column: Simulated SMTP Client & Step 2 Verification */}
              <div className="lg:col-span-7 space-y-4">
                {/* Simulated Mail Client Window */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-inner">
                  {/* Mailbox Window Titlebar */}
                  <div className="px-4 py-2.5 bg-zinc-950/90 border-b border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      </div>
                      <span className="text-[11px] font-mono text-zinc-400 ml-1">Simulated SMTP Inbox</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {generatedOtp ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/80">
                          <Check className="w-3 h-3" />
                          <span>1 Message Received</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-zinc-500">Listening on port 587</span>
                      )}
                    </div>
                  </div>

                  {/* Mailbox Content Body */}
                  <div className="p-4 sm:p-5 min-h-[170px] flex flex-col justify-center">
                    {generatedOtp ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 rounded-xl bg-zinc-950/80 border border-indigo-500/30 space-y-3 shadow-md"
                      >
                        <div className="flex flex-wrap items-center justify-between text-[11px] text-zinc-400 font-mono border-b border-zinc-800/80 pb-2">
                          <div>
                            <span className="text-zinc-500">From: </span>
                            <span className="text-zinc-200">tc_auth Security &lt;noreply@tcauth.dev&gt;</span>
                          </div>
                          <div>
                            <span className="text-zinc-500">To: </span>
                            <span className="text-indigo-300">{otpEmail}</span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <p className="text-xs text-zinc-300 font-medium">
                              Your 6-digit <span className="text-indigo-300 font-bold uppercase">{otpPurpose}</span> verification code is:
                            </p>
                            <div className="text-3xl font-mono font-black text-transparent bg-gradient-to-r from-indigo-400 to-purple-300 bg-clip-text tracking-[0.25em] py-1">
                              <DecryptedText text={generatedOtp} speed={25} maxIterations={6} animateOn="view" />
                            </div>
                            <p className="text-[10px] text-zinc-500 font-mono">Expires in 5 minutes (300s TTL) • 1-time use</p>
                          </div>

                          <button
                            type="button"
                            onClick={handleAutoFill}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap self-start sm:self-center"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Auto-fill OTP</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="text-center py-6 space-y-2">
                        <Mail className="w-8 h-8 text-zinc-700 mx-auto" />
                        <p className="text-xs font-medium text-zinc-400">SMTP Inbox is Idle</p>
                        <p className="text-[11px] text-zinc-600 max-w-sm mx-auto">
                          Click <strong className="text-indigo-400">"Send Simulated OTP Code"</strong> on the left to trigger the cryptographic generation and delivery flow.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 2: Verification Input Card */}
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                      Step 2: Verify & Issue Session
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">auth.service.verify_otp_and_login()</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2.5">
                    <div className="relative w-full sm:flex-1">
                      <Key className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Enter 6-digit code (e.g. 849201)"
                        value={inputOtp}
                        onChange={(e) => setInputOtp(e.target.value.trim())}
                        className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm font-mono font-bold tracking-widest text-zinc-100 rounded-xl border border-zinc-700 bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      />
                    </div>

                    <button
                      onClick={handleVerifyOtp}
                      disabled={!inputOtp}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer whitespace-nowrap"
                    >
                      Verify Code
                    </button>
                  </div>

                  {/* Verification Feedback Banners */}
                  {otpVerificationResult === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-700/60 flex items-start gap-2.5 text-xs text-emerald-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Authentication Successful!</p>
                        <p className="text-[11px] text-emerald-400/90 font-mono mt-0.5">
                          Database session record #60 created. Stateful JWT Access Token generated and active.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {otpVerificationResult === 'failure' && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/60 flex items-start gap-2.5 text-xs text-rose-300"
                    >
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Verification Failed</p>
                        <p className="text-[11px] text-rose-400/90 mt-0.5">
                          The code entered does not match the dispatched OTP or has expired.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: JWT CLAIMS INSPECTOR */}
          {/* ========================================================================= */}
          {activeTab === 'jwt' && (
            <motion.div
              key="tab-jwt"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Interactive Config Controls */}
              <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                {/* Role Switcher */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-zinc-400">Account Role:</span>
                  <div className="flex items-center gap-1.5 p-1 rounded-lg bg-zinc-950 border border-zinc-800">
                    {(['user', 'admin', 'superadmin'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setJwtRole(r)}
                        className={`px-3 py-1 rounded-md text-xs font-mono font-bold capitalize transition-all cursor-pointer ${
                          jwtRole === r
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Session Status Switcher */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-zinc-400">Database Session Status:</span>
                  <div className="flex items-center gap-1.5 p-1 rounded-lg bg-zinc-950 border border-zinc-800">
                    {(['active', 'revoked'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setJwtStatus(s)}
                        className={`px-3 py-1 rounded-md text-xs font-mono font-bold capitalize transition-all cursor-pointer ${
                          jwtStatus === s
                            ? s === 'active'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-rose-600 text-white shadow-xs'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {s === 'active' ? '● Active (< 1ms)' : '✕ Revoked (Blocked)'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* JWT Structure Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Encoded Token String */}
                <div className="lg:col-span-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>1. Encoded Compact JWT Token</span>
                    </h4>
                    <button
                      onClick={() => copyText(fullJwt, 'JWT string')}
                      className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedKey === 'JWT string' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs break-all leading-relaxed min-h-[240px] flex flex-col justify-between">
                    <div>
                      <p className="text-[11px] text-zinc-500 mb-2">Bearer &lt;token&gt; header value:</p>
                      <span className="text-rose-400 font-bold">{encodedHeader}</span>
                      <span className="text-zinc-600">.</span>
                      <span className="text-purple-400 font-bold">{encodedPayload}</span>
                      <span className="text-zinc-600">.</span>
                      <span className="text-sky-400 font-bold">{encodedSig}</span>
                    </div>

                    <div className="pt-4 border-t border-zinc-900 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-rose-400" /> Header
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-purple-400" /> Payload
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-sky-400" /> Signature
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Decoded Header & Payload Claims */}
                <div className="lg:col-span-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>2. Decoded Header & Stateful Claims</span>
                    </h4>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      jwtStatus === 'active' ? 'text-emerald-400 bg-emerald-950/80 border border-emerald-800' : 'text-rose-400 bg-rose-950/80 border border-rose-800'
                    }`}>
                      {jwtStatus === 'active' ? 'SIGNATURE & SID VALID' : 'REVOKED SESSION'}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs min-h-[240px] overflow-y-auto">
                    <pre className="text-zinc-300">
                      {JSON.stringify(
                        {
                          header: { alg: 'HS256', typ: 'JWT' },
                          payload: payloadObj,
                          stateful_verification: {
                            db_session_id: 60,
                            revoked: jwtStatus === 'revoked',
                            middleware_action: jwtStatus === 'active' ? 'ALLOW_REQUEST' : 'HTTP_401_UNAUTHORIZED'
                          }
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: LIVE REST PROBE */}
          {/* ========================================================================= */}
          {activeTab === 'rest' && (
            <motion.div
              key="tab-rest"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Endpoint Selector Tabs */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-zinc-400">Select API Route to Probe:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {endpoints.map((ep) => {
                    const isSelected = selectedEndpoint === ep.id;
                    return (
                      <button
                        key={ep.id}
                        onClick={() => setSelectedEndpoint(ep.id as any)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-indigo-950/60 border-indigo-500/80 shadow-md shadow-indigo-950/40'
                            : 'bg-zinc-900/70 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-black ${
                            ep.method === 'POST' ? 'text-amber-400 bg-amber-950/80 border border-amber-800' : 'text-emerald-400 bg-emerald-950/80 border border-emerald-800'
                          }`}>
                            {ep.method}
                          </span>
                          <span className="text-xs font-mono font-bold text-zinc-200 truncate">{ep.path}</span>
                        </div>
                        <span className="text-[11px] text-zinc-400 line-clamp-1">{ep.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Request & Response Visualizer */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
                {/* Console Bar */}
                <div className="px-4 py-3 bg-zinc-900/90 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-black ${
                      currentEndpointObj.method === 'POST' ? 'text-amber-400 bg-amber-950' : 'text-emerald-400 bg-emerald-950'
                    }`}>
                      {currentEndpointObj.method}
                    </span>
                    <span className="font-mono text-xs font-bold text-zinc-200">{currentEndpointObj.path}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-[11px] font-mono">
                      <span className="text-emerald-400 font-bold">HTTP 200 OK</span>
                      <span className="text-zinc-600">|</span>
                      <span className="text-zinc-400">Latency: <strong className="text-zinc-200">9ms</strong></span>
                    </div>

                    <button
                      onClick={() => copyText(JSON.stringify(currentEndpointObj.response, null, 2), 'response payload')}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      title="Copy response JSON"
                    >
                      {copiedKey === 'response payload' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Output JSON */}
                <div className="p-5 font-mono text-xs max-h-[300px] overflow-y-auto">
                  <pre className="text-emerald-400 leading-relaxed">
                    {JSON.stringify(currentEndpointObj.response, null, 2)}
                  </pre>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
