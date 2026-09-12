import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Check,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  Globe,
  Key,
  KeyRound,
  Link2,
  Link2Off,
  Lock,
  LogOut,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  UserCheck,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { profileService } from '../services/profile';
import { OAuthLink } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { UserAvatar } from '../components/common/UserAvatar';
import { PageHeader } from '../components/common/PageHeader';
import { FormField } from '../components/common/FormField';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { BorderBeam } from '../components/reactbits/BorderBeam';
import { DecryptedText } from '../components/reactbits/DecryptedText';
import { formatDate } from '../lib/utils';
import {
  getErrorMessage,
  LOCAL_STORAGE_REFRESH_TOKEN_KEY,
  LOCAL_STORAGE_TOKEN_KEY,
} from '../services/apiClient';

const updatePasswordSchema = z.object({
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

export const ProfilePage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { account, session, payload, logout, logoutAll, isSuperAdmin, patchMe, refreshToken, token } = useAuth();
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isLogoutAllDialogOpen, setIsLogoutAllDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [revealedTokens, setRevealedTokens] = useState<Record<string, boolean>>({});

  // OAuth Links State
  const [oauthLinks, setOauthLinks] = useState<OAuthLink[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [unlinkingProvider, setUnlinkingProvider] = useState<string | null>(null);
  const [isUnlinkConfirmOpen, setIsUnlinkConfirmOpen] = useState(false);

  // Profile Edit State
  const [profileName, setProfileName] = useState(account?.name || '');
  const [profileEmail, setProfileEmail] = useState(account?.email || '');
  const [profileHandle, setProfileHandle] = useState(account?.handle || '');
  const [profilePhone, setProfilePhone] = useState(account?.phone || '');
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(account?.avatar_url || '');

  const loadOAuthLinks = async () => {
    setIsLoadingLinks(true);
    try {
      const links = await profileService.getOAuthLinks();
      setOauthLinks(links || []);
    } catch {
      // Fallback
      setOauthLinks([]);
    } finally {
      setIsLoadingLinks(false);
    }
  };

  useEffect(() => {
    if (account) {
      setProfileName(account.name || '');
      setProfileEmail(account.email || '');
      setProfileHandle(account.handle || '');
      setProfilePhone(account.phone || '');
      setProfileAvatarUrl(account.avatar_url || '');
      loadOAuthLinks();
    }
  }, [account]);

  const handleLinkOAuth = async (provider: 'google' | 'github' | 'discord') => {
    try {
      await profileService.linkOAuthProvider(provider);
      toast.success(`Connected ${provider} successfully`);
      loadOAuthLinks();
    } catch (err: any) {
      toast.error(getErrorMessage(err, `Failed to link ${provider}`));
    }
  };

  const handleConfirmUnlink = async () => {
    if (!unlinkingProvider) return;
    setIsSubmitting(true);
    try {
      const res = await profileService.unlinkOAuthProvider(unlinkingProvider);
      toast.success(res?.message || `Unlinked ${unlinkingProvider} successfully`);
      setIsUnlinkConfirmOpen(false);
      setUnlinkingProvider(null);
      loadOAuthLinks();
    } catch (err: any) {
      toast.error(getErrorMessage(err, `Lockout Prevention: Cannot unlink ${unlinkingProvider}`));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestTokenRefresh = async () => {
    const storedRefresh = localStorage.getItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY);
    if (!storedRefresh) {
      toast.error('No refresh token found in local storage. Sign in with dual-token mode enabled.');
      return;
    }
    setIsRefreshing(true);
    try {
      const tokens = await refreshToken();
      const tokenPreview = tokens?.access_token ? `${tokens.access_token.slice(0, 15)}...` : 'Active';
      toast.success(`Tokens rotated successfully! New access token: ${tokenPreview}`);
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to refresh token'));
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCopyToken = (tokenValue: string, label: string) => {
    if (!tokenValue) {
      toast.error(`No ${label.toLowerCase()} available to copy`);
      return;
    }
    navigator.clipboard.writeText(tokenValue);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success(`Copied ${label} to clipboard!`);
  };

  const toggleRevealToken = (key: string) => {
    setRevealedTokens((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await patchMe({
        name: profileName || undefined,
        email: profileEmail || undefined,
        handle: profileHandle || undefined,
        phone: profilePhone || null,
        avatar_url: profileAvatarUrl || null,
      });
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to update profile'));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const onSubmitPassword = async (data: UpdatePasswordFormData) => {
    setIsUpdatingPassword(true);
    try {
      const res = await profileService.updatePassword({ password: data.password });
      toast.success(res?.message || 'Password updated successfully');
      reset();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to update password'));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleConfirmLogoutAll = async () => {
    setIsSubmitting(true);
    try {
      await logoutAll();
      toast.success('All sessions destroyed for account');
      setIsLogoutAllDialogOpen(false);
      onNavigate('/login');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to logout from all sessions'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!account) {
    return (
      <div className="p-8 text-center">
        <p className="text-zinc-400">Please sign in to view your profile settings.</p>
      </div>
    );
  }

  const providers = [
    {
      id: 'google' as const,
      name: 'Google',
      icon: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
      ),
      description: 'Single sign-on via Google Account',
      badgeBg: 'bg-white/10 border-white/20',
    },
    {
      id: 'github' as const,
      name: 'GitHub',
      icon: (
        <svg className="w-5 h-5 fill-current text-white shrink-0" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
      ),
      description: 'Single sign-on via GitHub developer account',
      badgeBg: 'bg-zinc-800 border-zinc-700',
    },
    {
      id: 'discord' as const,
      name: 'Discord',
      icon: (
        <svg className="w-5 h-5 fill-[#5865F2] shrink-0" viewBox="0 0 24 24">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      ),
      description: 'Single sign-on via Discord account',
      badgeBg: 'bg-[#5865F2]/15 border-[#5865F2]/30',
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
        title="My Profile & Security"
        description="Self-service account management, authentication providers, password configuration, and session security."
        badge={
          <Badge variant={isSuperAdmin ? 'purple' : 'info'} icon={<ShieldCheck className="w-3 h-3" />}>
            {account.role}
          </Badge>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Card */}
        <Card className="lg:col-span-1 relative overflow-hidden h-fit">
          <BorderBeam size={180} duration={12} colorFrom="#6366f1" colorTo="#a855f7" />
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-3">
              <UserAvatar src={account.avatar_url} name={account.name} size="xl" />
            </div>
            <CardTitle>{account.name}</CardTitle>
            <CardDescription className="font-mono text-xs text-indigo-400">@{account.handle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-2 text-xs">
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-400">Email Address:</span>
              <span className="font-medium text-zinc-100">{account.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-400">Account ID:</span>
              <span className="font-mono font-medium text-zinc-100">
                #<DecryptedText text={String(account.id)} speed={35} />
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-400">Phone Number:</span>
              <span className="text-zinc-200">{account.phone || 'Not provided'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-400">Account Status:</span>
              <Badge variant={account.status === 'active' ? 'success' : 'warning'}>{account.status}</Badge>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-zinc-400">Member Since:</span>
              <span className="font-mono text-zinc-300">{formatDate(account.created_at)}</span>
            </div>

            {session && (
              <div className="pt-3 border-t border-zinc-800">
                <p className="font-semibold text-zinc-200 mb-2 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  Active Session Information
                </p>
                <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 font-mono text-[11px] space-y-1.5 text-zinc-300">
                  <p><span className="text-zinc-500">IP:</span> {session.ip_address || '127.0.0.1'}</p>
                  <p><span className="text-zinc-500">Session ID:</span> {session.id}</p>
                  <p className="truncate"><span className="text-zinc-500">Client:</span> {session.user_agent}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security & Settings Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Linked Identity Providers (Google, GitHub, Discord) */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-indigo-400" />
                    Connected Social & SSO Accounts
                  </CardTitle>
                  <CardDescription>
                    Authenticate or link your profile using external OAuth identity providers for seamless single sign-on.
                  </CardDescription>
                </div>
                <button
                  type="button"
                  onClick={loadOAuthLinks}
                  disabled={isLoadingLinks}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
                  title="Reload Connected Accounts"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLinks ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {providers.map((p) => {
                  const link = oauthLinks.find(
                    (l) => l.provider.toLowerCase() === p.id
                  );
                  const isLinked = !!link;

                  return (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${p.badgeBg}`}>
                              {p.icon}
                            </div>
                            <span className="text-xs font-bold text-zinc-100">{p.name}</span>
                          </div>
                          {isLinked ? (
                            <Badge variant="success" className="text-[10px] py-0.5 px-2 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Linked
                            </Badge>
                          ) : (
                            <Badge variant="neutral" className="text-[10px] py-0.5 px-2">
                              Not Linked
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                          {isLinked
                            ? `Connected as ${link.provider_user_id || 'Active Account'}`
                            : p.description}
                        </p>
                      </div>

                      <div>
                        {isLinked ? (
                          <button
                            type="button"
                            onClick={() => {
                              setUnlinkingProvider(p.id);
                              setIsUnlinkConfirmOpen(true);
                            }}
                            className="inline-flex items-center justify-center gap-1.5 w-full h-9 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl transition-colors cursor-pointer"
                          >
                            <Link2Off className="w-3.5 h-3.5" />
                            <span>Unlink {p.name}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleLinkOAuth(p.id)}
                            className={`inline-flex items-center justify-center gap-1.5 w-full h-9 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs ${
                              p.id === 'discord'
                                ? 'bg-[#5865F2] hover:bg-[#4752C4] text-white'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                            }`}
                          >
                            <Link2 className="w-3.5 h-3.5" />
                            <span>Connect {p.name}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Lockout Prevention Callout Banner */}
              <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs text-amber-300/90 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-amber-300">Lockout Prevention Protection</p>
                  <p className="text-[11px] text-amber-400/80 leading-relaxed">
                    You cannot unlink your primary login method if your account does not have a configured password or any other remaining login provider.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-400" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your identity details, public handle, avatar image, and verified contact numbers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Full Name">
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-3.5 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </FormField>

                  <FormField label="Handle / Username">
                    <input
                      type="text"
                      value={profileHandle}
                      onChange={(e) => setProfileHandle(e.target.value)}
                      placeholder="username"
                      className="w-full px-3.5 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono text-xs placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Email Address">
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full px-3.5 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </FormField>

                  <FormField label="Phone Number">
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3.5 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </FormField>
                </div>

                <FormField label="Avatar Image URL">
                  <input
                    type="url"
                    value={profileAvatarUrl}
                    onChange={(e) => setProfileAvatarUrl(e.target.value)}
                    placeholder="https://images.example.com/avatar.jpg"
                    className="w-full px-3.5 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </FormField>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="inline-flex items-center justify-center gap-2 h-9 px-5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdatingProfile ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Update Password */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-400" />
                Account Password
              </CardTitle>
              <CardDescription>
                Ensure your credentials remain robust. Passwords must contain upper and lower case letters, and numbers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="New Password" error={errors.password?.message} required>
                    <input
                      type="password"
                      placeholder="At least 6 characters"
                      {...register('password')}
                      className="w-full px-3.5 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </FormField>

                  <FormField label="Confirm New Password" error={errors.confirmPassword?.message} required>
                    <input
                      type="password"
                      placeholder="Repeat new password"
                      {...register('confirmPassword')}
                      className="w-full px-3.5 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </FormField>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="inline-flex items-center justify-center gap-2 h-9 px-5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdatingPassword ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Token Health & Session Security (Single vs Dual Token Mode) */}
          {(() => {
            const activeAccessToken = token || localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY) || '';
            const activeRefreshToken = localStorage.getItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY) || '';
            const isDualToken = Boolean(activeRefreshToken);

            return (
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <CardTitle className="text-base flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Token Mode & Session Security</span>
                    </CardTitle>
                    <Badge
                      variant={isDualToken ? 'success' : 'neutral'}
                      className="text-[10px] py-0.5 px-2.5 font-mono uppercase tracking-wider w-fit"
                    >
                      {isDualToken ? 'Dual-Token Mode' : 'Single-Token Mode'}
                    </Badge>
                  </div>
                  <CardDescription>
                    Inspect your active token architecture, copy credentials for external API testing, and rotate session tokens.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Status Banner */}
                  {isDualToken ? (
                    <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Dual-Token Architecture Active
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300">
                            Auto-Retry Interceptor Ready
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          Short-lived access token is renewed seamlessly when expired. Single-use refresh token automatically rotates with every renewal cycle.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleTestTokenRefresh}
                        disabled={isRefreshing}
                        className="inline-flex items-center justify-center gap-2 h-9 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl shadow-xs transition-all shrink-0 disabled:opacity-50 cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span>{isRefreshing ? 'Rotating...' : 'Rotate Token Now'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                            <span className="inline-block w-2 h-2 rounded-full bg-indigo-400"></span>
                            Single-Token Mode Active
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400">
                            7-Day Stateless JWT
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          Requests are authorized directly using a standalone signed JWT. No refresh token is stored in the browser session.
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          To switch to short-lived access tokens with automatic rotation, enable <strong className="text-zinc-300">Dual Token Mode</strong> in System Configuration and re-authenticate.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onNavigate('/config')}
                        className="inline-flex items-center justify-center gap-2 h-9 px-4 text-xs font-semibold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-900 rounded-xl border border-zinc-700 transition-all shrink-0 cursor-pointer"
                      >
                        <span>Configure JWT</span>
                      </button>
                    </div>
                  )}

                  {/* Token Copy & Inspection Cards */}
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
                      <span className="flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Active Session Tokens</span>
                      </span>
                      <span className="text-[11px] font-normal text-zinc-500">Click copy to use with curl or API clients</span>
                    </div>

                    {/* Access Token */}
                    <div className="p-3 rounded-xl border border-zinc-800/90 bg-zinc-900/60 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-medium text-zinc-200 truncate">Access Token (Bearer)</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shrink-0">
                            Authorization: Bearer
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleRevealToken('access')}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800/60 hover:bg-zinc-800 rounded-lg border border-zinc-700/50 transition-colors cursor-pointer"
                            title={revealedTokens['access'] ? 'Mask token preview' : 'Reveal full token'}
                          >
                            {revealedTokens['access'] ? (
                              <>
                                <EyeOff className="w-3 h-3" />
                                <span className="hidden sm:inline">Mask</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3 h-3" />
                                <span className="hidden sm:inline">Reveal</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyToken(`Bearer ${activeAccessToken}`, 'Bearer Header')}
                            disabled={!activeAccessToken}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                              copiedKey === 'Bearer Header'
                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                                : 'bg-zinc-800/80 hover:bg-zinc-700 border-zinc-700 text-zinc-200 hover:text-white'
                            }`}
                            title="Copy Authorization: Bearer <token>"
                          >
                            {copiedKey === 'Bearer Header' ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Copied Header</span>
                              </>
                            ) : (
                              <>
                                <Terminal className="w-3.5 h-3.5" />
                                <span>Bearer Header</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyToken(activeAccessToken, 'Access Token')}
                            disabled={!activeAccessToken}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                              copiedKey === 'Access Token'
                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                                : 'bg-zinc-800/80 hover:bg-zinc-700 border-zinc-700 text-zinc-200 hover:text-white'
                            }`}
                            title="Copy Access Token to clipboard"
                          >
                            {copiedKey === 'Access Token' ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Token</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-black/50 border border-zinc-800/80 font-mono text-[11px] text-zinc-300 break-all select-all overflow-x-auto">
                        {activeAccessToken ? (
                          revealedTokens['access'] ? (
                            <span>{activeAccessToken}</span>
                          ) : (
                            <span className="tracking-wide text-zinc-400">
                              {activeAccessToken.length > 40
                                ? `${activeAccessToken.slice(0, 24)}••••••••••••••••••••••••••••••••${activeAccessToken.slice(-12)}`
                                : activeAccessToken}
                            </span>
                          )
                        ) : (
                          <span className="text-zinc-500 italic">No active access token stored</span>
                        )}
                      </div>
                    </div>

                    {/* Refresh Token (Dual-Token Mode only) */}
                    {isDualToken && (
                      <div className="p-3 rounded-xl border border-zinc-800/90 bg-zinc-900/60 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-medium text-zinc-200 truncate">Refresh Token</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shrink-0">
                              Single-Use · Rotates
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => toggleRevealToken('refresh')}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800/60 hover:bg-zinc-800 rounded-lg border border-zinc-700/50 transition-colors cursor-pointer"
                              title={revealedTokens['refresh'] ? 'Mask token preview' : 'Reveal full token'}
                            >
                              {revealedTokens['refresh'] ? (
                                <>
                                  <EyeOff className="w-3 h-3" />
                                  <span className="hidden sm:inline">Mask</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3 h-3" />
                                  <span className="hidden sm:inline">Reveal</span>
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyToken(activeRefreshToken, 'Refresh Token')}
                              disabled={!activeRefreshToken}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                                copiedKey === 'Refresh Token'
                                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                                  : 'bg-zinc-800/80 hover:bg-zinc-700 border-zinc-700 text-zinc-200 hover:text-white'
                              }`}
                              title="Copy Refresh Token to clipboard"
                            >
                              {copiedKey === 'Refresh Token' ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy Token</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-black/50 border border-zinc-800/80 font-mono text-[11px] text-emerald-400/90 break-all select-all overflow-x-auto">
                          {activeRefreshToken ? (
                            revealedTokens['refresh'] ? (
                              <span>{activeRefreshToken}</span>
                            ) : (
                              <span className="tracking-wide text-emerald-500/70">
                                {activeRefreshToken.length > 40
                                  ? `${activeRefreshToken.slice(0, 24)}••••••••••••••••••••••••••••••••${activeRefreshToken.slice(-12)}`
                                  : activeRefreshToken}
                              </span>
                            )
                          ) : (
                            <span className="text-zinc-500 italic">No refresh token in storage</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* Session & Authentication Actions */}
          <Card className="border-rose-500/20 bg-rose-500/5">
            <CardHeader>
              <CardTitle className="text-base text-rose-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Session & Authentication Actions
              </CardTitle>
              <CardDescription>
                Sign out from this local device or invalidate all active sessions globally across all registered devices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    toast.success('Signed out successfully');
                    onNavigate('/login');
                  }}
                  className="inline-flex items-center justify-center gap-2 h-10 px-4 text-xs font-semibold bg-zinc-900 border border-zinc-700/80 text-zinc-200 hover:bg-zinc-800 hover:text-white hover:border-zinc-600 rounded-xl transition-all shadow-2xs cursor-pointer select-none"
                >
                  <LogOut className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>Sign Out Current Device</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsLogoutAllDialogOpen(true)}
                  className="inline-flex items-center justify-center gap-2 h-10 px-4 text-xs font-semibold text-white bg-rose-600 border border-rose-500 hover:bg-rose-500 hover:border-rose-400 active:bg-rose-700 rounded-xl shadow-2xs transition-all cursor-pointer select-none"
                >
                  <ShieldAlert className="w-4 h-4 shrink-0 text-white" />
                  <span>Sign Out All Devices</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Logout All Confirm Dialog */}
      <ConfirmDialog
        isOpen={isLogoutAllDialogOpen}
        onClose={() => setIsLogoutAllDialogOpen(false)}
        onConfirm={handleConfirmLogoutAll}
        title="Sign Out From All Devices"
        description="Are you sure you want to sign out everywhere? This will invalidate all active sessions across all browser instances and devices."
        confirmText="Sign Out Everywhere"
        isDestructive
        isLoading={isSubmitting}
      />

      {/* Unlink OAuth Provider Dialog */}
      <ConfirmDialog
        isOpen={isUnlinkConfirmOpen}
        onClose={() => {
          setIsUnlinkConfirmOpen(false);
          setUnlinkingProvider(null);
        }}
        onConfirm={handleConfirmUnlink}
        title={`Unlink ${unlinkingProvider ? (unlinkingProvider === 'google' ? 'Google' : unlinkingProvider === 'github' ? 'GitHub' : 'Discord') : 'Social'} Account`}
        description={`Are you sure you want to unlink your ${unlinkingProvider} account? You will no longer be able to sign in using this provider. (Safe unlinking will prevent this action if no password exists and this is your only auth method).`}
        confirmText="Unlink Account"
        isDestructive
        isLoading={isSubmitting}
      />
    </motion.div>
  );
};

