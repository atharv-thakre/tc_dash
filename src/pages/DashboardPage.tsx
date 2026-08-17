import React, { useEffect, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  Database,
  Key,
  KeyRound,
  Link as LinkIcon,
  Plus,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  UserCheck,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { PageHeader } from '../components/common/PageHeader';
import { CodeBlock } from '../components/common/CodeBlock';
import { accountsService } from '../services/accounts';
import { sessionsService } from '../services/sessions';
import { otpService } from '../services/otp';
import { oauthLinksService } from '../services/oauthLinks';
import { configService } from '../services/config';
import { formatDate } from '../lib/utils';
import { AnimatedCounter } from '../components/reactbits/AnimatedCounter';
import { BorderBeam } from '../components/reactbits/BorderBeam';
import { DecryptedText } from '../components/reactbits/DecryptedText';

export const DashboardPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { account, session, payload, isSuperAdmin, refetchMe } = useAuth();
  const [stats, setStats] = useState({
    accountsCount: 0,
    activeSessionsCount: 0,
    otpRecordsCount: 0,
    oauthLinksCount: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const loadDashboardStats = async () => {
    setIsLoadingStats(true);
    try {
      if (isSuperAdmin) {
        try {
          const counts = await configService.getCounts();
          setStats({
            accountsCount: counts.accounts,
            activeSessionsCount: counts.sessions,
            otpRecordsCount: counts.otp,
            oauthLinksCount: counts.oauth,
          });
        } catch {
          const [accs, sess, otps, links] = await Promise.all([
            accountsService.listAccounts(1, 1).catch(() => ({ items: [], total: 0 })),
            sessionsService.listSessions(1, 1).catch(() => ({ items: [], total: 0 })),
            otpService.listRecords(1, 1).catch(() => ({ items: [], total: 0 })),
            oauthLinksService.listLinks(1, 1).catch(() => ({ items: [], total: 0 })),
          ]);
          setStats({
            accountsCount: accs.total ?? accs.items.length,
            activeSessionsCount: sess.total ?? sess.items.length,
            otpRecordsCount: otps.total ?? otps.items.length,
            oauthLinksCount: links.total ?? links.items.length,
          });
        }
      }
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, [isSuperAdmin]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Dashboard Overview"
        description="Real-time authentication system telemetry, active token claims, and administrative shortcuts."
        badge={
          <Badge variant={isSuperAdmin ? 'purple' : 'info'} icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            <span className="font-semibold">{account?.role || 'Guest'}</span>
          </Badge>
        }
        action={
          <button
            onClick={() => {
              refetchMe();
              loadDashboardStats();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 transition-all shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-zinc-400 ${isLoadingStats ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        }
      />

      {/* High Level Stat Grid */}
      {isSuperAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => onNavigate('/accounts')}
            className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors shadow-2xs cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Accounts</span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight text-white font-mono">
                {isLoadingStats ? (
                  <span className="text-zinc-500">...</span>
                ) : (
                  <AnimatedCounter to={stats.accountsCount} duration={1.2} />
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
                Registered identity records <ArrowUpRight className="w-3 h-3 text-indigo-400" />
              </p>
            </div>
          </div>

          <div
            onClick={() => onNavigate('/sessions')}
            className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors shadow-2xs cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Active Sessions</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight text-white font-mono">
                {isLoadingStats ? (
                  <span className="text-zinc-500">...</span>
                ) : (
                  <AnimatedCounter to={stats.activeSessionsCount} duration={1.2} />
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
                Valid token sessions <ArrowUpRight className="w-3 h-3 text-emerald-400" />
              </p>
            </div>
          </div>

          <div
            onClick={() => onNavigate('/otp')}
            className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors shadow-2xs cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">OTP Records</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <KeyRound className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight text-white font-mono">
                {isLoadingStats ? (
                  <span className="text-zinc-500">...</span>
                ) : (
                  <AnimatedCounter to={stats.otpRecordsCount} duration={1.2} />
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
                Challenge verification codes <ArrowUpRight className="w-3 h-3 text-amber-400" />
              </p>
            </div>
          </div>

          <div
            onClick={() => onNavigate('/oauth-links')}
            className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors shadow-2xs cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">OAuth Links</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <LinkIcon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight text-white font-mono">
                {isLoadingStats ? (
                  <span className="text-zinc-500">...</span>
                ) : (
                  <AnimatedCounter to={stats.oauthLinksCount} duration={1.2} />
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
                Google / GitHub identities <ArrowUpRight className="w-3 h-3 text-purple-400" />
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Bar with BorderBeam */}
      <div className="relative rounded-2xl border border-indigo-500/30 bg-zinc-950/80 p-6 overflow-hidden shadow-xl">
        <BorderBeam size={220} duration={10} colorFrom="#6366f1" colorTo="#a855f7" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Quick Admin Control Center</h3>
                <p className="text-xs text-zinc-400">Immediate shortcuts to manage accounts, issue challenge OTPs, or revoke active sessions.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-1">
            {isSuperAdmin && (
              <>
                <button
                  onClick={() => onNavigate('/accounts')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Account
                </button>
                <button
                  onClick={() => onNavigate('/otp')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-zinc-800 rounded-xl transition-all shadow-2xs cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  Generate OTP
                </button>
                <button
                  onClick={() => onNavigate('/sessions')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-zinc-800 rounded-xl transition-all shadow-2xs cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  Manage Sessions
                </button>
                <button
                  onClick={() => onNavigate('/config')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-zinc-800 rounded-xl transition-all shadow-2xs cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  Configure System
                </button>
              </>
            )}
            <button
              onClick={() => onNavigate('/profile')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-zinc-800 rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              Update My Profile
            </button>
          </div>
        </div>
      </div>

      {/* Current Session Context & Claims */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-800">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Authenticated Identity Context</h3>
              <p className="text-xs text-zinc-400 font-mono">GET /tc-auth/account/me</p>
            </div>
          </div>

          <div className="space-y-3">
            {account ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-zinc-800/80">
                  <span className="text-zinc-400">Account ID:</span>
                  <span className="font-mono font-semibold text-indigo-400">
                    <DecryptedText text={String(account.id)} speed={40} />
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-zinc-800/80">
                  <span className="text-zinc-400">Name & Handle:</span>
                  <span className="font-semibold text-white">{account.name} (@{account.handle})</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-zinc-800/80">
                  <span className="text-zinc-400">Email Address:</span>
                  <span className="font-mono text-zinc-200">{account.email}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-zinc-800/80">
                  <span className="text-zinc-400">System Role:</span>
                  <Badge variant={account.role === 'superadmin' ? 'purple' : 'default'}>{account.role}</Badge>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-zinc-800/80">
                  <span className="text-zinc-400">Account Status:</span>
                  <Badge variant={account.status === 'active' ? 'success' : 'warning'}>{account.status}</Badge>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-zinc-400">Created At:</span>
                  <span className="font-mono text-zinc-300">{formatDate(account.created_at)}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-500">No active user logged in.</p>
            )}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-800">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Verified JWT Bearer Claims</h3>
              <p className="text-xs text-zinc-400">Stateful signature payload verification</p>
            </div>
          </div>

          <CodeBlock code={JSON.stringify({ account, session, payload }, null, 2)} />
        </div>
      </div>
    </motion.div>
  );
};

