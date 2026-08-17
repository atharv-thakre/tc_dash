import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Lock,
  Zap,
  Users,
  Mail,
  Sliders,
  CheckCircle2,
  Smartphone,
  Laptop,
  Globe,
  KeyRound,
  Trash2,
  Send,
  Sparkles,
  ArrowRight,
  Activity,
  UserCheck,
  ChevronRight,
  Fingerprint,
  RefreshCw,
} from 'lucide-react';
import { BorderBeam } from './BorderBeam';
import { Magnet } from './Magnet';
import { DecryptedText } from './DecryptedText';

export const FeatureBentoHub: React.FC<{ onNavigateDocs?: () => void }> = ({ onNavigateDocs }) => {
  // Widget 1: Multi-strategy interactive preview
  const [activeStrategy, setActiveStrategy] = useState<'password' | 'otp' | 'google' | 'github'>('password');

  // Widget 2: Stateful Session Revocation live toggle
  const [sessions, setSessions] = useState([
    { id: 'sess_9941', device: 'MacBook Pro M3 (Chrome)', location: 'San Francisco, US', ip: '198.51.100.24', active: true, icon: <Laptop className="w-4 h-4 text-indigo-400" /> },
    { id: 'sess_8820', device: 'iPhone 16 Pro (Safari)', location: 'San Francisco, US', ip: '198.51.100.89', active: true, icon: <Smartphone className="w-4 h-4 text-emerald-400" /> },
    { id: 'sess_3319', device: 'Ubuntu Server (CLI)', location: 'Frankfurt, DE', ip: '203.0.113.50', active: false, icon: <Globe className="w-4 h-4 text-amber-400" /> },
  ]);

  const handleRevokeSession = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: false } : s))
    );
  };

  const handleResetSessions = () => {
    setSessions([
      { id: 'sess_9941', device: 'MacBook Pro M3 (Chrome)', location: 'San Francisco, US', ip: '198.51.100.24', active: true, icon: <Laptop className="w-4 h-4 text-indigo-400" /> },
      { id: 'sess_8820', device: 'iPhone 16 Pro (Safari)', location: 'San Francisco, US', ip: '198.51.100.89', active: true, icon: <Smartphone className="w-4 h-4 text-emerald-400" /> },
      { id: 'sess_3319', device: 'Ubuntu Server (CLI)', location: 'Frankfurt, DE', ip: '203.0.113.50', active: true, icon: <Globe className="w-4 h-4 text-amber-400" /> },
    ]);
  };

  // Widget 3: RBAC tier inspector
  const [selectedRole, setSelectedRole] = useState<'user' | 'admin' | 'superadmin'>('admin');
  const rolePermissions = {
    user: ['read:profile', 'update:own_password', 'manage:own_sessions'],
    admin: ['read:profile', 'update:own_password', 'manage:own_sessions', 'read:all_users', 'audit:logs', 'revoke:user_sessions'],
    superadmin: ['read:profile', 'update:own_password', 'manage:own_sessions', 'read:all_users', 'audit:logs', 'revoke:user_sessions', 'manage:smtp', 'system:purge', 'manage:oauth_keys'],
  };

  // Widget 4: Email OTP interactive mini-mailer
  const [otpSent, setOtpSent] = useState(false);
  const [simulatedCode, setSimulatedCode] = useState('739218');

  const handleDispatchOtp = () => {
    const nextCode = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedCode(nextCode);
    setOtpSent(true);
  };

  return (
    <div className="w-full space-y-6">
      {/* Dynamic Bento Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* CARD 1: Unified Multi-Strategy Auth (Col Span 7) */}
        <div className="md:col-span-7 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 sm:p-7 relative overflow-hidden shadow-xl flex flex-col justify-between group">
          <BorderBeam size={220} duration={14} colorFrom="#6366f1" colorTo="#a855f7" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-950/70 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-md">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Multi-Strategy Authentication
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono">Unified Identity Gateway</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold text-indigo-300 bg-indigo-950/60 border border-indigo-800/60">
                4-in-1 Engine
              </span>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Consolidate password hashing, time-limited 6-digit email OTPs, Google OpenID Connect, and GitHub OAuth 2.0 within a single Python engine and unified relational schema.
            </p>

            {/* Interactive Strategy Selector */}
            <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800/90 space-y-3">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'password', label: 'Bcrypt Passwords' },
                  { id: 'otp', label: 'Email OTP (Passwordless)' },
                  { id: 'google', label: 'Google OAuth 2.0' },
                  { id: 'github', label: 'GitHub SSO' },
                ].map((strat) => (
                  <button
                    key={strat.id}
                    onClick={() => setActiveStrategy(strat.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                      activeStrategy === strat.id
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-zinc-700/50'
                    }`}
                  >
                    {strat.label}
                  </button>
                ))}
              </div>

              {/* Dynamic Strategy Spec Output */}
              <div className="pt-2 text-xs font-mono">
                {activeStrategy === 'password' && (
                  <div className="flex items-center justify-between text-zinc-300 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                    <span>Algorithm: <span className="text-emerald-400 font-bold">bcrypt ($2b$12$)</span></span>
                    <span className="text-indigo-400">auth.service.login()</span>
                  </div>
                )}
                {activeStrategy === 'otp' && (
                  <div className="flex items-center justify-between text-zinc-300 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                    <span>Delivery: <span className="text-indigo-400 font-bold">SMTP Relay (300s TTL)</span></span>
                    <span className="text-emerald-400">auth.otp.create_otp()</span>
                  </div>
                )}
                {activeStrategy === 'google' && (
                  <div className="flex items-center justify-between text-zinc-300 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                    <span>Protocol: <span className="text-amber-400 font-bold">OpenID Connect + PKCE</span></span>
                    <span className="text-purple-400">/tc-auth/oauth/google</span>
                  </div>
                )}
                {activeStrategy === 'github' && (
                  <div className="flex items-center justify-between text-zinc-300 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                    <span>Protocol: <span className="text-sky-400 font-bold">OAuth 2.0 Bearer Flow</span></span>
                    <span className="text-sky-400">/tc-auth/oauth/github</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2 flex items-center justify-between border-t border-zinc-800/80 text-xs font-mono text-zinc-500">
            <span>Unified User ID linkage</span>
            <span className="text-indigo-400 font-bold flex items-center gap-1">Zero schema collisions <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /></span>
          </div>
        </div>

        {/* CARD 2: Stateful Session Revocation (Col Span 5) */}
        <div className="md:col-span-5 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 sm:p-7 relative overflow-hidden shadow-xl flex flex-col justify-between">
          <BorderBeam size={220} duration={16} colorFrom="#10b981" colorTo="#6366f1" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-md">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Stateful Session Killswitch
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono">Instant &lt;1ms Revocation</p>
                </div>
              </div>
              <button
                onClick={handleResetSessions}
                className="text-[11px] font-mono text-zinc-400 hover:text-zinc-200 flex items-center gap-1 p-1 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                title="Reset session state"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Every JWT contains a database-verified <code className="text-indigo-300 font-mono">sid</code>. Revoke any token or all active devices immediately.
            </p>

            {/* Mini Session List with Live Revoke buttons */}
            <div className="space-y-2">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                    s.active
                      ? 'bg-zinc-900/90 border-zinc-800 text-zinc-200'
                      : 'bg-zinc-950/40 border-zinc-900 text-zinc-600 line-through opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="shrink-0">{s.icon}</div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate text-[11px]">{s.device}</p>
                      <p className="text-[10px] font-mono text-zinc-500">{s.ip}</p>
                    </div>
                  </div>

                  {s.active ? (
                    <button
                      onClick={() => handleRevokeSession(s.id)}
                      className="px-2 py-1 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-[10px] font-mono font-bold text-rose-300 transition-all cursor-pointer shrink-0"
                    >
                      Revoke
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono text-rose-500 font-bold bg-rose-950/30 px-2 py-0.5 rounded">
                      REVOKED
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-500">
            <span>Database check</span>
            <span className="text-emerald-400 font-bold">&lt; 0.4ms overhead</span>
          </div>
        </div>

        {/* CARD 3: Granular RBAC Permissions (Col Span 4) */}
        <div className="md:col-span-4 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 relative overflow-hidden shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950/70 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Granular RBAC Tiers</h3>
                <p className="text-xs text-zinc-400 font-mono">Route Guards & Scopes</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Enforce role hierarchies with clean decorators (<code className="text-amber-300 font-mono">@auth.require_role("admin")</code>).
            </p>

            {/* Role Switcher */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
              {(['user', 'admin', 'superadmin'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRole(r)}
                  className={`py-1.5 rounded-lg text-xs font-mono font-bold capitalize transition-all cursor-pointer text-center ${
                    selectedRole === r
                      ? 'bg-amber-500 text-zinc-950 shadow-md font-black'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Active Permissions List */}
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block mb-1">
                Granted Capability Scopes:
              </span>
              <div className="flex flex-wrap gap-1">
                {rolePermissions[selectedRole].map((perm, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded text-[10px] font-mono text-amber-300 bg-amber-950/40 border border-amber-800/50"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-zinc-800/80 text-[11px] font-mono text-zinc-500 flex justify-between">
            <span>Privilege escalation</span>
            <span className="text-emerald-400 font-bold">Strictly Blocked</span>
          </div>
        </div>

        {/* CARD 4: Pure Python SDK Architecture (Col Span 4) */}
        <div className="md:col-span-4 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 relative overflow-hidden shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Pure Python DX</h3>
                <p className="text-xs text-zinc-400 font-mono">FastAPI & SQLAlchemy</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              No bloated external node servers or proxy wrappers. Integrates natively into your existing FastAPI ASGI stack.
            </p>

            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-[11px] text-zinc-300 space-y-1">
              <div className="text-emerald-400 font-bold"># Clean Dependency Injection</div>
              <p className="text-zinc-400">@app.get("/api/dashboard")</p>
              <p className="text-zinc-200">def view(user = Depends(auth.require_role("admin"))):</p>
              <p className="text-indigo-400 pl-4">return {"{ status: 'ok', user: user.email }"}</p>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-zinc-800/80 text-[11px] font-mono text-zinc-500 flex justify-between">
            <span>ORM Standard</span>
            <span className="text-emerald-400 font-bold">SQLAlchemy 2.0+</span>
          </div>
        </div>

        {/* CARD 5: Built-in Email OTP Engine (Col Span 4) */}
        <div className="md:col-span-4 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 relative overflow-hidden shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-950/70 border border-sky-500/40 flex items-center justify-center text-sky-400 shadow-md">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Built-in Email OTP</h3>
                <p className="text-xs text-zinc-400 font-mono">Passwordless Mail Relay</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Direct SMTP connection for dispatching cryptographic verification codes with rate limits and attempt tracking.
            </p>

            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-mono text-[11px]">SMTP Dispatch Test</span>
                <button
                  onClick={handleDispatchOtp}
                  className="px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold font-mono transition-all cursor-pointer flex items-center gap-1"
                >
                  <Send className="w-3 h-3" /> Send Code
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 font-mono text-xs flex items-center justify-between">
                <span className="text-zinc-500 text-[11px]">Generated OTP:</span>
                <span className="text-sky-400 font-black tracking-widest text-sm">
                  {otpSent ? <DecryptedText text={simulatedCode} speed={25} maxIterations={6} animateOn="view" /> : '••••••'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-zinc-800/80 text-[11px] font-mono text-zinc-500 flex justify-between">
            <span>Rate limit</span>
            <span className="text-sky-400 font-bold">5 attempts / 300s</span>
          </div>
        </div>
      </div>
    </div>
  );
};
