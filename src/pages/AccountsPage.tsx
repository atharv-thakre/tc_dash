import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Edit2, MoreVertical, Plus, RefreshCw, Shield, Trash2, UserCheck, UserPlus, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Account, AccountRole, AccountStatus, CreateAccountInput } from '../types';
import { accountsService } from '../services/accounts';
import { DataTable } from '../components/common/DataTable';
import { SearchBubble, SearchFieldOption } from '../components/common/SearchBubble';
import { Modal } from '../components/common/Modal';
import { AnimatedCounter } from '../components/reactbits/AnimatedCounter';
import { DecryptedText } from '../components/reactbits/DecryptedText';

const ACCOUNT_SEARCH_FIELDS: SearchFieldOption[] = [
  { key: 'email', label: 'Email' },
  { key: 'id', label: 'Account ID' },
  { key: 'uid', label: 'UID' },
  { key: 'phone', label: 'Phone' },
  { key: 'name', label: 'Name' },
  { key: 'handle', label: 'Handle' },
];
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Badge } from '../components/common/Badge';
import { PageHeader } from '../components/common/PageHeader';
import { FormField } from '../components/common/FormField';
import { UserAvatar } from '../components/common/UserAvatar';
import { formatDate } from '../lib/utils';

import { getErrorMessage } from '../services/apiClient';

const accountSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email required'),
  handle: z.string().min(2, 'Handle must be at least 2 characters'),
  phone: z.string().optional().nullable(),
  avatar_url: z.string().optional().nullable(),
  role: z.enum(['superadmin', 'admin', 'user']),
  status: z.enum(['active', 'suspended', 'pending', 'inactive']),
  password: z.string().optional(),
});

type AccountFormData = z.infer<typeof accountSchema>;

export const AccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchField, setSearchField] = useState<string>('email');
  const [searchValue, setSearchValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAccounts = async (p = page, l = limit, searchOverride?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const q = searchOverride !== undefined ? searchOverride : searchValue;
      if (q.trim()) {
        const res = await accountsService.queryAccounts(searchField, q.trim(), p, l);
        setAccounts(res.items);
        setTotalCount(res.total);
      } else {
        const res = await accountsService.listAccounts(p, l);
        setAccounts(res.items);
        setTotalCount(res.total);
      }
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to fetch accounts'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuerySubmit = () => {
    setPage(1);
    fetchAccounts(1, limit);
  };

  const handleResetSearch = () => {
    setSearchValue('');
    setPage(1);
    fetchAccounts(1, limit, '');
  };

  useEffect(() => {
    fetchAccounts(page, limit);
  }, [page, limit]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      role: 'user',
      status: 'active',
    },
  });

  const handleOpenCreate = () => {
    reset({
      name: '',
      email: '',
      handle: '',
      phone: '',
      avatar_url: '',
      role: 'user',
      status: 'active',
      password: '',
    });
    setEditingAccount(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (acc: Account) => {
    setEditingAccount(acc);
    reset({
      name: acc.name || '',
      email: acc.email || '',
      handle: acc.handle || '',
      phone: acc.phone || '',
      avatar_url: acc.avatar_url || '',
      role: acc.role || 'user',
      status: acc.status || 'active',
      password: '',
    });
    setIsCreateOpen(true);
  };

  const onSubmitForm = async (data: AccountFormData) => {
    setIsSubmitting(true);
    try {
      if (editingAccount) {
        // PATCH /account/
        await accountsService.updateAccount({
          account_id: editingAccount.id,
          name: data.name,
          email: data.email,
          handle: data.handle,
          phone: data.phone || null,
          avatar_url: data.avatar_url || null,
          role: data.role as AccountRole,
          status: data.status as AccountStatus,
          password: data.password ? data.password : undefined,
        });
        toast.success('Account updated successfully');
      } else {
        // POST /account/
        await accountsService.createAccount({
          name: data.name,
          email: data.email,
          handle: data.handle,
          phone: data.phone || null,
          avatar_url: data.avatar_url || null,
          role: data.role as AccountRole,
          status: data.status as AccountStatus,
          password: data.password || undefined,
        });
        toast.success('Account created successfully');
      }
      setIsCreateOpen(false);
      fetchAccounts();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to save account'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAccountId) return;
    setIsSubmitting(true);
    try {
      await accountsService.deleteAccount(deletingAccountId);
      toast.success('Account deleted successfully');
      setDeletingAccountId(null);
      fetchAccounts();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to delete account'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const safeAccounts = Array.isArray(accounts) ? accounts : [];

  const superadminCount = safeAccounts.filter((a) => a.role === 'superadmin').length;
  const activeCount = safeAccounts.filter((a) => a.status === 'active').length;

  const columns = [
    {
      header: 'ID',
      sortable: true,
      accessorKey: 'id' as const,
      cell: (item: Account) => (
        <div className="space-y-0.5">
          <span className="font-mono text-xs font-bold text-zinc-100 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800 inline-block shadow-2xs">
            #<DecryptedText text={String(item.id)} speed={35} />
          </span>
          {(item as any).account_id && String((item as any).account_id) !== String(item.id) && (
            <span className="text-[10px] font-mono text-indigo-400 block">Acc ID: {(item as any).account_id}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Account Identity',
      sortable: true,
      accessorKey: 'name' as const,
      cell: (item: Account) => (
        <div className="flex items-center gap-3 py-1">
          <UserAvatar src={item.avatar_url} name={item.name} size="md" />
          <div className="space-y-0.5">
            <p className="font-bold text-xs text-white leading-tight">{item.name}</p>
            <p className="text-[11px] text-zinc-400 font-mono">@{item.handle}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Email & Contact',
      sortable: true,
      accessorKey: 'email' as const,
      cell: (item: Account) => (
        <div className="space-y-0.5 py-1">
          <p className="text-xs font-bold text-white font-mono">{item.email}</p>
          <p className="text-[11px] text-zinc-400">{item.phone || 'No phone set'}</p>
        </div>
      ),
    },
    {
      header: 'Role & Status',
      sortable: true,
      accessorKey: 'role' as const,
      cell: (item: Account) => (
        <div className="flex items-center gap-1.5 flex-wrap py-1">
          <Badge
            variant={item.role === 'superadmin' ? 'purple' : item.role === 'admin' ? 'info' : 'neutral'}
            className="capitalize font-semibold text-[11px] px-2.5 py-0.5"
          >
            {item.role}
          </Badge>
          <Badge
            variant={
              item.status === 'active'
                ? 'success'
                : item.status === 'suspended'
                ? 'danger'
                : item.status === 'pending'
                ? 'warning'
                : 'neutral'
            }
            className="capitalize font-semibold text-[11px] px-2.5 py-0.5"
          >
            {item.status}
          </Badge>
        </div>
      ),
    },
    {
      header: 'Created',
      sortable: true,
      accessorKey: 'created_at' as const,
      cell: (item: Account) => (
        <span className="text-xs font-mono text-zinc-400">{formatDate(item.created_at)}</span>
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
        title="Accounts Management"
        description="View, search, create, update, and manage all accounts in the tc-auth identity database."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchAccounts(page, limit)}
              className="p-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
              title="Refresh table"
            >
              <RefreshCw className={`w-4 h-4 text-zinc-400 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/20 transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Create Account
            </button>
          </div>
        }
      />

      {/* Account Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Identities Loaded</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-2">
            {isLoading ? <span className="text-zinc-500">...</span> : <AnimatedCounter to={totalCount ?? safeAccounts.length} duration={1} />}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Superadmin Accounts</span>
            <Shield className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-2">
            {isLoading ? <span className="text-zinc-500">...</span> : <AnimatedCounter to={superadminCount} duration={1} />}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Status</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-2">
            {isLoading ? <span className="text-zinc-500">...</span> : <AnimatedCounter to={activeCount} duration={1} />}
          </div>
        </div>
      </div>

      {/* Query Search Bubble */}
      <div className="w-full">
        <SearchBubble
          fields={ACCOUNT_SEARCH_FIELDS}
          activeFieldKey={searchField}
          onFieldChange={(key) => setSearchField(key)}
          searchValue={searchValue}
          onSearchValueChange={(val) => setSearchValue(val)}
          onSearchSubmit={handleQuerySubmit}
          onReset={handleResetSearch}
          isLoading={isLoading}
        />
      </div>

      {/* Data Table */}
      <DataTable
        data={safeAccounts}
        columns={columns}
        isLoading={isLoading}
        error={error}
        emptyTitle="No accounts match criteria"
        emptyDescription="Try adjusting your search keywords or create a new user account."
        onRefresh={() => fetchAccounts(page, limit)}
        page={page}
        limit={limit}
        totalCount={totalCount}
        onPageChange={(newPage) => setPage(newPage)}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        actions={(acc) => (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => handleOpenEdit(acc)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Edit Account"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeletingAccountId(acc.id)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Delete Account"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      {/* Modal: Create / Edit Account */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={editingAccount ? 'Update Account Record' : 'Create New Account'}
        description={editingAccount ? `Modifying identity attributes for ID: ${editingAccount.id}` : 'Create a new account with credentials and role permissions.'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Full Name" error={errors.name?.message} required>
              <input
                type="text"
                placeholder="John Smith"
                {...register('name')}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white"
              />
            </FormField>

            <FormField label="Handle / Username" error={errors.handle?.message} required>
              <input
                type="text"
                placeholder="jsmith"
                {...register('handle')}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white font-mono text-xs"
              />
            </FormField>
          </div>

          <FormField label="Email Address" error={errors.email?.message} required>
            <input
              type="email"
              placeholder="john.smith@tcauth.dev"
              {...register('email')}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Phone Number" error={errors.phone?.message}>
              <input
                type="text"
                placeholder="+1 (555) 000-0000"
                {...register('phone')}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white"
              />
            </FormField>

            <FormField label="Avatar Image URL" error={errors.avatar_url?.message}>
              <input
                type="text"
                placeholder="https://example.com/avatar.jpg"
                {...register('avatar_url')}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white font-mono text-xs"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Role Permission" required>
              <select
                {...register('role')}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </FormField>

            <FormField label="Account Status" required>
              <select
                {...register('status')}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </select>
            </FormField>
          </div>

          <FormField
            label={editingAccount ? 'New Password (leave empty to keep existing)' : 'Account Password'}
            error={errors.password?.message}
          >
            <input
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white"
            />
          </FormField>

          <div className="pt-4 flex justify-end gap-2 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              {isSubmitting ? 'Saving...' : editingAccount ? 'Update Account' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingAccountId}
        onClose={() => setDeletingAccountId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Account Record"
        description="Are you sure you want to delete this account? This will revoke access and destroy linked session credentials."
        confirmText="Delete Account"
        isDestructive
        isLoading={isSubmitting}
      />
    </motion.div>
  );
};
