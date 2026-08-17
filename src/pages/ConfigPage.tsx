import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Key, Mail, RefreshCw, Save, Shield, Sliders } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { ConfigPayload, EmailConfig, JWTConfig, OAuthConfig } from '../types';
import { configService } from '../services/config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/common/Card';
import { PageHeader } from '../components/common/PageHeader';
import { FormField } from '../components/common/FormField';
import { LoadingState } from '../components/common/LoadingState';
import { BorderBeam } from '../components/reactbits/BorderBeam';
import { getErrorMessage } from '../services/apiClient';

export const ConfigPage: React.FC = () => {
  const [config, setConfig] = useState<ConfigPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form states for each card
  const [emailForm, setEmailForm] = useState<EmailConfig>({
    host: '',
    port: 587,
    username: '',
    password: '',
    sender: '',
    sender_name: '',
    use_tls: true,
  });

  const [githubForm, setGithubForm] = useState<OAuthConfig>({
    client_id: '',
    client_secret: '',
    redirect_uri: '',
  });

  const [googleForm, setGoogleForm] = useState<OAuthConfig>({
    client_id: '',
    client_secret: '',
    redirect_uri: '',
  });

  const [jwtForm, setJwtForm] = useState<JWTConfig>({
    secret_key: '',
    algorithm: 'HS256',
    session_duration_days: 7,
  });

  // Secret visibility toggles
  const [showSecrets, setShowSecrets] = useState({
    smtpPassword: false,
    githubSecret: false,
    googleSecret: false,
    jwtKey: false,
  });

  // Saving states
  const [savingSection, setSavingSection] = useState<string | null>(null);

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const data = await configService.loadConfig();
      setConfig(data);
      if (data.email) {
        setEmailForm({
          host: data.email.host ?? '',
          port: data.email.port ?? 587,
          username: data.email.username ?? '',
          password: data.email.password ?? '',
          sender: data.email.sender ?? '',
          sender_name: data.email.sender_name ?? '',
          use_tls: data.email.use_tls ?? true,
        });
      }
      if (data.github) {
        setGithubForm({
          client_id: data.github.client_id ?? '',
          client_secret: data.github.client_secret ?? '',
          redirect_uri: data.github.redirect_uri ?? '',
        });
      }
      if (data.google) {
        setGoogleForm({
          client_id: data.google.client_id ?? '',
          client_secret: data.google.client_secret ?? '',
          redirect_uri: data.google.redirect_uri ?? '',
        });
      }
      if (data.jwt) {
        setJwtForm({
          secret_key: data.jwt.secret_key ?? '',
          algorithm: data.jwt.algorithm ?? 'HS256',
          session_duration_days: data.jwt.session_duration_days ?? 7,
        });
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to load system configuration'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSection('email');
    try {
      await configService.updateEmailConfig(emailForm);
      toast.success('Email (SMTP) configuration updated successfully');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to update email config'));
    } finally {
      setSavingSection(null);
    }
  };

  const handleSaveGithub = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSection('github');
    try {
      await configService.updateGithubConfig(githubForm);
      toast.success('GitHub OAuth configuration updated successfully');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to update GitHub config'));
    } finally {
      setSavingSection(null);
    }
  };

  const handleSaveGoogle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSection('google');
    try {
      await configService.updateGoogleConfig(googleForm);
      toast.success('Google OAuth configuration updated successfully');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to update Google config'));
    } finally {
      setSavingSection(null);
    }
  };

  const handleSaveJwt = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSection('jwt');
    try {
      await configService.updateJwtConfig(jwtForm);
      toast.success('JWT token configuration updated successfully');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to update JWT config'));
    } finally {
      setSavingSection(null);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading current in-memory system configuration..." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="System Configuration"
        description="Configure SMTP email delivery, OAuth social login credentials, and JWT token signing parameters."
        action={
          <button
            onClick={fetchConfig}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-zinc-400 ${isLoading ? 'animate-spin' : ''}`} />
            Reload Config (`GET /config/load/`)
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Email (SMTP) */}
        <Card className="relative overflow-hidden">
          {savingSection === 'email' && <BorderBeam size={200} duration={8} colorFrom="#6366f1" colorTo="#a855f7" />}
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-400" />
              1. Email (SMTP) Delivery Config
            </CardTitle>
            <CardDescription>Endpoint: `POST /config/email` — Mailer settings for sending OTP codes.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveEmail} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <FormField label="SMTP Host" required>
                    <input
                      type="text"
                      value={emailForm.host || ''}
                      onChange={(e) => setEmailForm({ ...emailForm, host: e.target.value })}
                      placeholder="smtp.mailgun.org"
                      required
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white font-mono"
                    />
                  </FormField>
                </div>
                <div>
                  <FormField label="Port" required>
                    <input
                      type="number"
                      value={emailForm.port ?? ''}
                      onChange={(e) => setEmailForm({ ...emailForm, port: Number(e.target.value) })}
                      placeholder="587"
                      required
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white font-mono"
                    />
                  </FormField>
                </div>
              </div>

              <FormField label="SMTP Username" required>
                <input
                  type="text"
                  value={emailForm.username || ''}
                  onChange={(e) => setEmailForm({ ...emailForm, username: e.target.value })}
                  placeholder="postmaster@mg.domain.com"
                  required
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white font-mono"
                />
              </FormField>

              <FormField label="SMTP Password" required>
                <div className="relative">
                  <input
                    type={showSecrets.smtpPassword ? 'text' : 'password'}
                    value={emailForm.password || ''}
                    onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-3 pr-9 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecrets({ ...showSecrets, smtpPassword: !showSecrets.smtpPassword })}
                    className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-200"
                  >
                    {showSecrets.smtpPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Sender Email" required>
                  <input
                    type="email"
                    value={emailForm.sender || ''}
                    onChange={(e) => setEmailForm({ ...emailForm, sender: e.target.value })}
                    placeholder="noreply@domain.com"
                    required
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white"
                  />
                </FormField>

                <FormField label="Sender Display Name" required>
                  <input
                    type="text"
                    value={emailForm.sender_name || ''}
                    onChange={(e) => setEmailForm({ ...emailForm, sender_name: e.target.value })}
                    placeholder="tc-auth Security"
                    required
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white"
                  />
                </FormField>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="use_tls"
                  checked={emailForm.use_tls}
                  onChange={(e) => setEmailForm({ ...emailForm, use_tls: e.target.checked })}
                  className="rounded-xs border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="use_tls" className="text-xs text-gray-700 dark:text-gray-300 font-medium cursor-pointer">
                  Enable TLS Security Connection
                </label>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSection === 'email'}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingSection === 'email' ? 'Saving...' : 'Save Email Config'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Card 2: GitHub OAuth */}
        <Card className="relative overflow-hidden">
          {savingSection === 'github' && <BorderBeam size={200} duration={8} colorFrom="#6366f1" colorTo="#a855f7" />}
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              2. GitHub OAuth App Config
            </CardTitle>
            <CardDescription>Endpoint: `POST /config/github` — OAuth credentials for GitHub login.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveGithub} className="space-y-3.5">
              <FormField label="Client ID" required>
                <input
                  type="text"
                  value={githubForm.client_id || ''}
                  onChange={(e) => setGithubForm({ ...githubForm, client_id: e.target.value })}
                  placeholder="Ov23li9823kL0923a1"
                  required
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white font-mono"
                />
              </FormField>

              <FormField label="Client Secret" required>
                <div className="relative">
                  <input
                    type={showSecrets.githubSecret ? 'text' : 'password'}
                    value={githubForm.client_secret || ''}
                    onChange={(e) => setGithubForm({ ...githubForm, client_secret: e.target.value })}
                    placeholder="ghp_••••••••••••••••"
                    required
                    className="w-full pl-3 pr-9 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecrets({ ...showSecrets, githubSecret: !showSecrets.githubSecret })}
                    className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-200"
                  >
                    {showSecrets.githubSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </FormField>

              <FormField label="Redirect Callback URI" required>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={githubForm.redirect_uri || ''}
                    onChange={(e) => setGithubForm({ ...githubForm, redirect_uri: e.target.value })}
                    placeholder="http://localhost:3000/tc-auth/github/callback"
                    required
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white font-mono"
                  />
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        const detected = `${window.location.origin}/tc-auth/github/callback`;
                        setGithubForm({ ...githubForm, redirect_uri: detected });
                        toast.success('Updated GitHub Redirect URI');
                      }}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      + Use Current Origin URI ({window.location.origin}/tc-auth/github/callback)
                    </button>
                  </div>
                </div>
              </FormField>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSection === 'github'}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingSection === 'github' ? 'Saving...' : 'Save GitHub Config'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Card 3: Google OAuth */}
        <Card className="relative overflow-hidden">
          {savingSection === 'google' && <BorderBeam size={200} duration={8} colorFrom="#6366f1" colorTo="#a855f7" />}
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              3. Google OAuth Client Config
            </CardTitle>
            <CardDescription>Endpoint: `POST /config/google` — OAuth credentials for Google Workspace login.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveGoogle} className="space-y-3.5">
              <FormField label="Client ID" required>
                <input
                  type="text"
                  value={googleForm.client_id || ''}
                  onChange={(e) => setGoogleForm({ ...googleForm, client_id: e.target.value })}
                  placeholder="992019283019-apps.googleusercontent.com"
                  required
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white font-mono"
                />
              </FormField>

              <FormField label="Client Secret" required>
                <div className="relative">
                  <input
                    type={showSecrets.googleSecret ? 'text' : 'password'}
                    value={googleForm.client_secret || ''}
                    onChange={(e) => setGoogleForm({ ...googleForm, client_secret: e.target.value })}
                    placeholder="GOCSPX-••••••••••••••••"
                    required
                    className="w-full pl-3 pr-9 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecrets({ ...showSecrets, googleSecret: !showSecrets.googleSecret })}
                    className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-200"
                  >
                    {showSecrets.googleSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </FormField>

              <FormField label="Redirect Callback URI" required>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={googleForm.redirect_uri || ''}
                    onChange={(e) => setGoogleForm({ ...googleForm, redirect_uri: e.target.value })}
                    placeholder="http://localhost:3000/tc-auth/google/callback"
                    required
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white font-mono"
                  />
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        const detected = `${window.location.origin}/tc-auth/google/callback`;
                        setGoogleForm({ ...googleForm, redirect_uri: detected });
                        toast.success('Updated Google Redirect URI');
                      }}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      + Use Current Origin URI ({window.location.origin}/tc-auth/google/callback)
                    </button>
                  </div>
                </div>
              </FormField>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSection === 'google'}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingSection === 'google' ? 'Saving...' : 'Save Google Config'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Card 4: JWT */}
        <Card className="relative overflow-hidden">
          {savingSection === 'jwt' && <BorderBeam size={200} duration={8} colorFrom="#6366f1" colorTo="#a855f7" />}
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Key className="w-4 h-4 text-purple-500" />
              4. JWT Token & Session Security Config
            </CardTitle>
            <CardDescription>Endpoint: `POST /config/jwt` — Secret key, algorithm, and token lifetime.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveJwt} className="space-y-3.5">
              <FormField label="Secret Signing Key" required>
                <div className="relative">
                  <input
                    type={showSecrets.jwtKey ? 'text' : 'password'}
                    value={jwtForm.secret_key || ''}
                    onChange={(e) => setJwtForm({ ...jwtForm, secret_key: e.target.value })}
                    placeholder="tc_auth_jwt_super_secret_hs256_key"
                    required
                    className="w-full pl-3 pr-9 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecrets({ ...showSecrets, jwtKey: !showSecrets.jwtKey })}
                    className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-200"
                  >
                    {showSecrets.jwtKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Algorithm" required>
                  <select
                    value={jwtForm.algorithm || 'HS256'}
                    onChange={(e) => setJwtForm({ ...jwtForm, algorithm: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white font-mono"
                  >
                    <option value="HS256">HS256 (HMAC SHA-256)</option>
                    <option value="HS384">HS384 (HMAC SHA-384)</option>
                    <option value="HS512">HS512 (HMAC SHA-512)</option>
                    <option value="RS256">RS256 (RSA Signature)</option>
                  </select>
                </FormField>

                <FormField label="Session Duration (Days)" required>
                  <input
                    type="number"
                    value={jwtForm.session_duration_days ?? ''}
                    onChange={(e) => setJwtForm({ ...jwtForm, session_duration_days: Number(e.target.value) })}
                    min={1}
                    max={365}
                    required
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white font-mono"
                  />
                </FormField>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSection === 'jwt'}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingSection === 'jwt' ? 'Saving...' : 'Save JWT Config'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};
