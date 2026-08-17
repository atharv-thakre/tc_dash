import React, { useEffect, useState } from 'react';
import { Calendar, Globe, Laptop, RefreshCw, ShieldAlert, ShieldCheck, ShieldOff, Trash2, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { SessionRecord } from '../types';
import { sessionsService } from '../services/sessions';
import { DataTable } from '../components/common/DataTable';
import { SearchBubble, SearchFieldOption } from '../components/common/SearchBubble';
import { Modal } from '../components/common/Modal';
import { AnimatedCounter } from '../components/reactbits/AnimatedCounter';
import { DecryptedText } from '../components/reactbits/DecryptedText';

const SESSION_SEARCH_FIELDS: SearchFieldOption[] = [
  { key: 'account_id', label: 'Account ID' },
  { key: 'id', label: 'Session ID' },
  { key: 'ip_address', label: 'IP Address' },
];
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Badge } from '../components/common/Badge';
import { PageHeader } from '../components/common/PageHeader';
import { FormField } from '../components/common/FormField';
import { formatDate, truncateText } from '../lib/utils';
import { getErrorMessage } from '../services/apiClient';

export const SessionsPage: React.FC = () => {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [searchField, setSearchField] = useState<string>('account_id');
  const [searchValue, setSearchValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined);

  // Dialog states
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  const [isClearAllOpen, setIsClearAllOpen] = useState(false);
  const [isCleanupOpen, setIsCleanupOpen] = useState(false);
  const [isRevokeAllAccountOpen, setIsRevokeAllAccountOpen] = useState(false);
  const [targetAccountId, setTargetAccountId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSessions = async (p = page, l = limit, searchOverride?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const q = searchOverride !== undefined ? searchOverride : searchValue;
      if (q.trim()) {
        const res = await sessionsService.querySessions(searchField, q.trim(), p, l);
        setSessions(res.items);
        setTotalCount(res.total);
      } else {
        const res = await sessionsService.listSessions(p, l);
        setSessions(res.items);
        setTotalCount(res.total);
      }
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to fetch sessions'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuerySubmit = () => {
    setPage(1);
    fetchSessions(1, limit);
  };

  const handleResetSearch = () => {
    setSearchValue('');
    setPage(1);
    fetchSessions(1, limit, '');
  };

  useEffect(() => {
    fetchSessions(page, limit);
  }, [page, limit]);

  const handleRevokeSingle = async () => {
    if (!revokingSessionId) return;
    setIsSubmitting(true);
    try {
      await sessionsService.deleteSession(revokingSessionId);
      toast.success('Session revoked successfully');
      setRevokingSessionId(null);
      fetchSessions();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to revoke session'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeAllForAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAccountId) {
      toast.error('Please enter an account ID');
      return;
    }
    setIsSubmitting(true);
    try {
      await sessionsService.deleteAllForAccount(targetAccountId);
      toast.success(`All active sessions revoked for account: ${targetAccountId}`);
      setIsRevokeAllAccountOpen(false);
      setTargetAccountId('');
      fetchSessions();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to revoke account sessions'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCleanupExpired = async () => {
    setIsSubmitting(true);
    try {
      await sessionsService.cleanupExpired();
      toast.success('Expired sessions cleaned up');
      setIsCleanupOpen(false);
      fetchSessions();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to cleanup expired sessions'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearAll = async () => {
    setIsSubmitting(true);
    try {
      await sessionsService.clearAll();
      toast.success('All active system sessions destroyed');
      setIsClearAllOpen(false);
      fetchSessions();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to clear all sessions'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const safeSessions = Array.isArray(sessions) ? sessions : [];
  const activeValidSessions = safeSessions.filter((s) => new Date(s.expires_at).getTime() >= Date.now()).length;
  const expiredSessions = safeSessions.filter((s) => new Date(s.expires_at).getTime() < Date.now()).length;

  const columns = [
    {
      header: 'Session Identity',
      sortable: true,
      accessorKey: 'id' as const,
      cell: (item: SessionRecord) => (
        <div className="flex items-center gap-3 py-1">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 shadow-2xs">
            <Zap className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Session ID
              </span>
              <span className="font-mono text-xs font-bold text-zinc-100 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                #<DecryptedText text={String(item.id)} speed={35} />
              </span>
            </div>
            {item.account_id && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                  Account
                </span>
                <span className="font-mono text-xs font-semibold text-indigo-400">
                  {item.account_id}
                </span>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Client & Network',
      sortable: true,
      accessorKey: 'ip_address' as const,
      cell: (item: SessionRecord) => (
        <div className="space-y-1 py-0.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-xs font-semibold text-zinc-200">
            <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>{item.ip_address || 'Unknown IP'}</span>
          </div>
          <p className="text-[11px] text-zinc-400 max-w-xs truncate pl-0.5" title={item.user_agent}>
            {truncateText(item.user_agent || 'Unknown Client', 42)}
          </p>
        </div>
      ),
    },
    {
      header: 'Session Status',
      sortable: true,
      accessorKey: 'expires_at' as const,
      cell: (item: SessionRecord) => {
        const isExpired = new Date(item.expires_at).getTime() < Date.now();
        return (
          <div className="space-y-1">
            <Badge variant={isExpired ? 'danger' : 'success'} className="font-semibold px-2.5 py-0.5">
              {isExpired ? 'Expired' : 'Active'}
            </Badge>
            <p className="text-[11px] text-zinc-500 font-mono flex items-center gap-1">
              <Calendar className="w-3 h-3 text-zinc-500 shrink-0" />
              <span>{formatDate(item.expires_at)}</span>
            </p>
          </div>
        );
      },
    },
    {
      header: 'Created At',
      sortable: true,
      accessorKey: 'created_at' as const,
      cell: (item: SessionRecord) => (
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
          <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          <span>{formatDate(item.created_at)}</span>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Active Sessions Management"
        description="Inspect active JWT token sessions, track client IP addresses, and revoke single or bulk session credentials."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => fetchSessions(page, limit)}
              className="p-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-zinc-400 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsRevokeAllAccountOpen(true)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 transition-colors shadow-2xs cursor-pointer"
            >
              Revoke Account Sessions
            </button>
            <button
              onClick={() => setIsCleanupOpen(true)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer"
            >
              Clear Expired
            </button>
            <button
              onClick={() => setIsClearAllOpen(true)}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 transition-colors cursor-pointer"
            >
              Clear All Sessions
            </button>
          </div>
        }
      />

      {/* Session Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Token Grants</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-2">
            {isLoading ? <span className="text-zinc-500">...</span> : <AnimatedCounter to={totalCount ?? activeValidSessions} duration={1} />}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Loaded Records</span>
            <Zap className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-2">
            {isLoading ? <span className="text-zinc-500">...</span> : <AnimatedCounter to={safeSessions.length} duration={1} />}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Expired Grants</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-2">
            {isLoading ? <span className="text-zinc-500">...</span> : <AnimatedCounter to={expiredSessions} duration={1} />}
          </div>
        </div>
      </div>

      {/* Query Search Bubble */}
      <div className="w-full">
        <SearchBubble
          fields={SESSION_SEARCH_FIELDS}
          activeFieldKey={searchField}
          onFieldChange={(key) => setSearchField(key)}
          searchValue={searchValue}
          onSearchValueChange={(val) => setSearchValue(val)}
          onSearchSubmit={handleQuerySubmit}
          onReset={handleResetSearch}
          isLoading={isLoading}
        />
      </div>

      <DataTable
        data={safeSessions}
        columns={columns}
        isLoading={isLoading}
        error={error}
        emptyTitle="No active sessions"
        emptyDescription="There are currently no active session records in the system."
        onRefresh={() => fetchSessions(page, limit)}
        page={page}
        limit={limit}
        totalCount={totalCount}
        onPageChange={(newPage) => setPage(newPage)}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        actions={(item) => (
          <button
            onClick={() => setRevokingSessionId(item.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all shadow-2xs cursor-pointer"
            title="Revoke session"
          >
            <ShieldOff className="w-3.5 h-3.5" />
            <span>Revoke</span>
          </button>
        )}
      />

      {/* Revoke All Sessions for Account Modal */}
      <Modal
        isOpen={isRevokeAllAccountOpen}
        onClose={() => setIsRevokeAllAccountOpen(false)}
        title="Revoke All Sessions for Account"
        description="Destroys every active session token associated with a specific user account."
      >
        <form onSubmit={handleRevokeAllForAccount} className="space-y-4">
          <FormField label="Account ID" required hint="e.g. 1 or acc_01">
            <input
              type="text"
              value={targetAccountId || ''}
              onChange={(e) => setTargetAccountId(e.target.value)}
              placeholder="1"
              required
              className="w-full px-3.5 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-xl font-mono text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </FormField>

          <div className="pt-4 flex justify-end gap-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsRevokeAllAccountOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md shadow-rose-600/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Revoking...' : 'Revoke All Sessions'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Revoke Single Session Confirm */}
      <ConfirmDialog
        isOpen={!!revokingSessionId}
        onClose={() => setRevokingSessionId(null)}
        onConfirm={handleRevokeSingle}
        title="Revoke Session Token"
        description={`Are you sure you want to revoke session ID: ${revokingSessionId}? The client will be signed out immediately.`}
        confirmText="Revoke Session"
        isDestructive
        isLoading={isSubmitting}
      />

      {/* Cleanup Expired Confirm */}
      <ConfirmDialog
        isOpen={isCleanupOpen}
        onClose={() => setIsCleanupOpen(false)}
        onConfirm={handleCleanupExpired}
        title="Cleanup Expired Sessions"
        description="Delete all session records whose expiry timestamp has passed. Active client sessions will not be affected."
        confirmText="Cleanup Expired"
        isLoading={isSubmitting}
      />

      {/* Clear All Sessions Confirm */}
      <ConfirmDialog
        isOpen={isClearAllOpen}
        onClose={() => setIsClearAllOpen(false)}
        onConfirm={handleClearAll}
        title="Clear All Sessions System-Wide"
        description="CRITICAL ACTION: This will destroy every session token in the entire system, logging out all users immediately."
        confirmText="Clear All Sessions"
        isDestructive
        isLoading={isSubmitting}
      />
    </motion.div>
  );
};

