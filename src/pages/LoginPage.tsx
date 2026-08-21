import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BookmarkPlus,
  Check,
  Globe,
  KeyRound,
  Lock,
  Mail,
  Plus,
  RotateCcw,
  Send,
  Server,
  Settings2,
  Trash2,
  Zap,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useApiConfig } from '../contexts/ApiConfigContext';
import { authService } from '../services/auth';
import { configService, PulseResponse } from '../services/config';
import { FormField } from '../components/common/FormField';
import { ProviderButton } from '../components/common/ProviderButton';
import { getErrorMessage } from '../services/apiClient';
import { BorderBeam } from '../components/reactbits/BorderBeam';
import { DecryptedText } from '../components/reactbits/DecryptedText';
import { ParticlesBackground } from '../components/reactbits/ParticlesBackground';
import { ShinyText } from '../components/reactbits/ShinyText';

const passwordSchema = z.object({
  identifier: z.string().min(1, 'Email or handle is required'),
  password: z.string().min(1, 'Password is required'),
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export const LoginPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { loginPassword, loginOTP, loginOAuth, forgotPassword } = useAuth();
  const {
    apiMode,
    setApiMode,
    baseUrl,
    setBaseUrl,
    builtinPresets,
    customPresets,
    addPreset,
    removePreset,
  } = useApiConfig();

  const [tab, setTab] = useState<'password' | 'otp' | 'reset'>('password');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Forgot / Reset Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isTestingPulse, setIsTestingPulse] = useState(false);
  const [pulseResult, setPulseResult] = useState<PulseResponse | null>(null);
  const [pulseError, setPulseError] = useState<string | null>(null);

  // Server Endpoint Settings
  const [showServerSettings, setShowServerSettings] = useState(false);
  const [inputUrl, setInputUrl] = useState(baseUrl);
  const [isAddingPreset, setIsAddingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmitPassword = async (data: PasswordFormData) => {
    setIsLoading(true);
    try {
      await loginPassword(data);
      toast.success('Signed in successfully');
      onNavigate('/dashboard');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to sign in. Please check credentials or server connection.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (apiMode === 'demo') {
      setIsLoading(true);
      try {
        await loginPassword({
          identifier: 'admin@tcauth.dev',
          password: 'password123',
        });
        toast.success('Signed in as SuperAdmin in Demo Mode');
        onNavigate('/dashboard');
      } catch (err: any) {
        toast.error(getErrorMessage(err, 'Failed to sign in as demo superadmin'));
      } finally {
        setIsLoading(false);
      }
      return;
    }
    handleSubmitPassword(onSubmitPassword)(e);
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (apiMode === 'demo') {
      setIsLoading(true);
      try {
        await loginPassword({
          identifier: 'admin@tcauth.dev',
          password: 'password123',
        });
        toast.success('Signed in as SuperAdmin in Demo Mode');
        onNavigate('/dashboard');
      } catch (err: any) {
        toast.error(getErrorMessage(err, 'Failed to sign in as demo superadmin'));
      } finally {
        setIsLoading(false);
      }
      return;
    }
    if (!otpEmail) {
      toast.error('Please enter your email address');
      return;
    }
    setIsSendingOtp(true);
    try {
      await authService.sendEmailOTP('login', { email: otpEmail });
      setOtpSent(true);
      toast.success('OTP sent to email. Code expires soon.');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to send OTP code.'));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (apiMode === 'demo') {
      setIsLoading(true);
      try {
        await loginPassword({
          identifier: 'admin@tcauth.dev',
          password: 'password123',
        });
        toast.success('Signed in as SuperAdmin in Demo Mode');
        onNavigate('/dashboard');
      } catch (err: any) {
        toast.error(getErrorMessage(err, 'Failed to sign in as demo superadmin'));
      } finally {
        setIsLoading(false);
      }
      return;
    }
    if (!otpCode) {
      toast.error('Please enter the OTP code');
      return;
    }
    setIsLoading(true);
    try {
      await loginOTP({ email: otpEmail, otp: otpCode });
      toast.success('Signed in with OTP successfully');
      onNavigate('/dashboard');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Invalid or expired OTP code.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (apiMode === 'demo') {
      setIsLoading(true);
      try {
        await loginPassword({
          identifier: 'admin@tcauth.dev',
          password: 'password123',
        });
        toast.success('Signed in as SuperAdmin in Demo Mode');
        onNavigate('/dashboard');
      } catch (err: any) {
        toast.error(getErrorMessage(err, 'Failed to sign in as demo superadmin'));
      } finally {
        setIsLoading(false);
      }
      return;
    }
    if (!forgotEmail) {
      toast.error('Please enter your email address');
      return;
    }
    setIsSendingReset(true);
    try {
      await authService.sendEmailOTP('reset', { email: forgotEmail });
      setResetSent(true);
      toast.success('Password reset code sent to your email.');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to send reset code.'));
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (apiMode === 'demo') {
      setIsLoading(true);
      try {
        await loginPassword({
          identifier: 'admin@tcauth.dev',
          password: 'password123',
        });
        toast.success('Signed in as SuperAdmin in Demo Mode');
        onNavigate('/dashboard');
      } catch (err: any) {
        toast.error(getErrorMessage(err, 'Failed to sign in as demo superadmin'));
      } finally {
        setIsLoading(false);
      }
      return;
    }
    if (!forgotOtp) {
      toast.error('Please enter the reset code');
      return;
    }
    setIsLoading(true);
    try {
      await forgotPassword({ email: forgotEmail, otp: forgotOtp });
      toast.success('Password verified & signed in successfully.');
      onNavigate('/dashboard');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to reset password. Check verification code.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestPulse = async () => {
    setIsTestingPulse(true);
    setPulseResult(null);
    setPulseError(null);
    try {
      const res = await configService.testPulse(inputUrl.trim());
      setPulseResult(res);
      toast.success(`Server Pulse OK: status=${res.status}, state=${res.state}`);
    } catch (err: any) {
      const msg = getErrorMessage(err, 'Pulse connection check failed.');
      setPulseError(msg);
      toast.error(msg);
    } finally {
      setIsTestingPulse(false);
    }
  };

  const handleSaveUrl = () => {
    const target = inputUrl.trim() || 'https://api.codesena.me/tc-auth';
    setBaseUrl(target);
    setApiMode('live');
    toast.success(`Server URL updated: ${target}`);
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center p-4 py-8 relative">
      {/* Subtle particle effect */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <ParticlesBackground particleCount={25} particleColor="rgba(99, 102, 241, 0.25)" speed={0.3} />
      </div>

      {/* Back to Landing Page Link */}
      <button
        onClick={() => onNavigate('/')}
        className="mb-4 flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer px-3 py-1.5 rounded-xl hover:bg-zinc-900 border border-transparent hover:border-zinc-800 relative z-10"
      >
        <ArrowRight className="w-3.5 h-3.5 rotate-180" />
        <span>Back to Product Overview</span>
      </button>

      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 transition-all relative overflow-hidden z-10">
        <BorderBeam
          size={240}
          duration={apiMode === 'demo' ? 8 : 12}
          colorFrom={apiMode === 'demo' ? '#f59e0b' : '#6366f1'}
          colorTo={apiMode === 'demo' ? '#fbbf24' : '#a855f7'}
        />

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl border mb-3 shadow-inner transition-colors ${
            apiMode === 'demo'
              ? 'bg-amber-500/10 border-amber-500/25 text-amber-400'
              : 'bg-zinc-800/80 border-zinc-700/60 text-indigo-400'
          }`}>
            {apiMode === 'demo' ? <Zap className="w-6 h-6 fill-amber-400/20 text-amber-400" /> : <KeyRound className="w-6 h-6" />}
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white">tc-auth</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/80">
              <DecryptedText text="v1.5.1" speed={40} maxIterations={8} animateOn="hover" />
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Superadmin Authentication & Session Management Dashboard
          </p>
        </div>

        {/* Backend API Mode & Pulse Connection Status */}
        <div className="mb-6 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              API SERVER MODE
            </span>
            <button
              type="button"
              onClick={() => setShowServerSettings(!showServerSettings)}
              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5" />
              {showServerSettings ? 'Hide URL Config' : 'Configure URL'}
            </button>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setApiMode('demo')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                apiMode === 'demo'
                  ? 'border-amber-500/80 bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Demo Mock
            </button>

            <button
              type="button"
              onClick={() => setApiMode('live')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                apiMode === 'live'
                  ? 'border-emerald-500/80 bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Server
            </button>
          </div>

          {/* Server Connection Pulse Button */}
          <div className="pt-2 border-t border-zinc-800/60">
            <button
              type="button"
              onClick={handleTestPulse}
              disabled={isTestingPulse}
              className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 text-[11px] font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Activity className={`w-3.5 h-3.5 text-indigo-400 ${isTestingPulse ? 'animate-spin' : ''}`} />
              {isTestingPulse ? 'Checking Pulse...' : 'Test Server Connection (/config/pulse)'}
            </button>
          </div>

          {pulseResult && (
            <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs font-mono space-y-2 shadow-inner animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${apiMode === 'demo' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'}`} />
                  <span className="font-bold text-zinc-100 text-xs flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Pulse: {pulseResult.status}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-zinc-800/90 text-zinc-300 text-[10px] font-semibold tracking-wider uppercase border border-zinc-700/70">
                  {pulseResult.state}
                </span>
              </div>
              {pulseResult.response && (
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
                  <span className="text-zinc-400 font-sans font-medium">Response</span>
                  <span className="text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-md font-mono text-[11px] font-bold">
                    {pulseResult.response}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-500 font-mono">
                <span>System Time</span>
                <span className="text-zinc-400">{pulseResult.system_time}</span>
              </div>
            </div>
          )}

          {pulseError && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-xs space-y-1.5 shadow-inner animate-in fade-in duration-150">
              <div className="flex items-center gap-1.5 font-bold text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Pulse Connection Failed</span>
              </div>
              <div className="text-[11px] text-rose-200/90 font-sans leading-relaxed">{pulseError}</div>
            </div>
          )}

          {/* Lower Toggleable Section: Live Backend Base URL */}
          {showServerSettings && (
            <div className="pt-3 border-t border-zinc-800/80 space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  BACKEND BASE URL PATH
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingPreset(!isAddingPreset)}
                  className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                >
                  <BookmarkPlus className="w-3 h-3" />
                  <span>{isAddingPreset ? 'Close' : '+ Save Preset'}</span>
                </button>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Globe className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={inputUrl || ''}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://api.codesena.me/tc-auth or /tc-auth"
                    className="w-full pl-8 pr-2 py-1.5 text-xs bg-zinc-900 border border-zinc-700/80 rounded-xl text-zinc-100 font-mono focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSaveUrl}
                  className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors cursor-pointer shadow-sm shrink-0"
                >
                  Set
                </button>
              </div>

              {/* Add Custom Preset Inline Form */}
              {isAddingPreset && (
                <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-indigo-500/30 space-y-2">
                  <div className="text-[10px] font-semibold text-indigo-300 flex items-center gap-1">
                    <Plus className="w-3 h-3" />
                    <span>Save Current URL to Local Presets</span>
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                      placeholder="Preset name (e.g. My Server)"
                      className="flex-1 px-2 py-1 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-hidden focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!inputUrl.trim()) {
                          toast.error('Enter a URL first');
                          return;
                        }
                        const name = newPresetName.trim() || inputUrl.trim();
                        addPreset(name, inputUrl.trim());
                        toast.success(`Saved preset "${name}" locally`);
                        setIsAddingPreset(false);
                        setNewPresetName('');
                      }}
                      className="px-2.5 py-1 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Presets */}
              <div className="space-y-1.5 pt-0.5">
                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                  <span className="text-zinc-500 font-medium">Presets:</span>
                  <span className="text-[9px] text-zinc-600 font-mono">Stored Locally</span>
                </div>

                <div className="flex flex-wrap gap-1.5 items-center">
                  {/* Builtin Presets */}
                  {builtinPresets.map((p) => {
                    const isSelected = baseUrl === p.url;
                    const isDefault = p.id === 'codesena-live';
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setInputUrl(p.url);
                          setBaseUrl(p.url);
                          toast.success(`Set base URL to ${p.url}`);
                        }}
                        className={`px-2 py-1 rounded font-mono text-[11px] border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-500/20 text-indigo-200 border-indigo-500/50 font-bold ring-1 ring-indigo-500/30'
                            : isDefault
                            ? 'bg-indigo-950/40 hover:bg-indigo-900/40 text-indigo-300 border-indigo-800/60 font-semibold'
                            : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700/60'
                        }`}
                      >
                        <span>{p.url}</span>
                        {isDefault && (
                          <span className="px-1 py-0.2 rounded bg-indigo-500/30 text-indigo-300 text-[8px] uppercase font-bold tracking-wider">
                            Default
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {/* Custom Presets */}
                  {customPresets.map((p) => {
                    const isSelected = baseUrl === p.url;
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setInputUrl(p.url);
                          setBaseUrl(p.url);
                          toast.success(`Set base URL to ${p.url}`);
                        }}
                        className={`px-2 py-1 rounded font-mono text-[11px] border transition-all cursor-pointer flex items-center gap-1.5 select-none ${
                          isSelected
                            ? 'bg-indigo-500/20 text-indigo-200 border-indigo-500/50 font-bold ring-1 ring-indigo-500/30'
                            : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700/60'
                        }`}
                      >
                        <span className="text-zinc-400 font-sans font-medium text-[10px]">{p.name}:</span>
                        <span className="truncate max-w-[130px]">{p.url}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removePreset(p.id);
                            toast.success(`Removed preset "${p.name}"`);
                          }}
                          title="Delete preset"
                          className="p-0.5 text-zinc-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-2.5 mb-5">
          <ProviderButton provider="google" onSuccessNavigate={() => onNavigate('/dashboard')} />
          <ProviderButton provider="github" onSuccessNavigate={() => onNavigate('/dashboard')} />
        </div>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase">
            <span className="bg-zinc-900 px-3 text-zinc-500 font-bold tracking-wider">
              or sign in with credentials
            </span>
          </div>
        </div>

        {/* Tab Switcher: Password vs OTP vs Reset */}
        <div className="relative flex p-1 mb-5 rounded-2xl bg-zinc-950 border border-zinc-800/80">
          {(['password', 'otp', 'reset'] as const).map((t) => {
            const isActive = tab === t;
            const label = t === 'password' ? 'Password' : t === 'otp' ? 'Email OTP' : 'Reset';
            const Icon = t === 'password' ? KeyRound : t === 'otp' ? Mail : RotateCcw;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`relative flex-1 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 z-10 select-none ${
                  isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeLoginTab"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute inset-0 bg-zinc-800 border border-zinc-700/60 rounded-xl shadow-xs -z-10"
                  />
                )}
                <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? (apiMode === 'demo' ? 'text-amber-400' : 'text-indigo-400') : 'text-zinc-500'}`} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'password' && (
            <motion.div
              key="password"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <form onSubmit={handlePasswordFormSubmit} className="space-y-4">
                <FormField label="Email or Handle" error={passwordErrors.identifier?.message} required>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="admin@tcauth.dev or atharv"
                      {...registerPassword('identifier')}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                </FormField>

                <FormField label="Password" error={passwordErrors.password?.message} required>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      {...registerPassword('password')}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                </FormField>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`relative w-full py-3 px-4 text-sm font-bold rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-3 cursor-pointer overflow-hidden group select-none ${
                    apiMode === 'demo'
                      ? 'bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 border border-amber-300/60 font-black'
                      : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 border border-indigo-500/30'
                  }`}
                >
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                  {isLoading ? (
                    <span className={`w-4 h-4 border-2 ${apiMode === 'demo' ? 'border-zinc-950' : 'border-white'} border-t-transparent rounded-full animate-spin`} />
                  ) : (
                    <>
                      {apiMode === 'demo' ? (
                        <>
                          <Zap className="w-4 h-4 text-zinc-950 fill-zinc-950" />
                          <span>Sign In as SuperAdmin</span>
                          <ArrowRight className="w-4 h-4 text-zinc-950 group-hover:translate-x-0.5 transition-transform" />
                        </>
                      ) : (
                        <>
                          <span>Sign In to Dashboard</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </>
                      )}
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {tab === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              {!otpSent ? (
                <form onSubmit={handleRequestOtp} noValidate={apiMode === 'demo'} className="space-y-4">
                  <FormField label="Email Address" required={apiMode !== 'demo'} hint="Enter your email to receive a one-time sign-in code.">
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                      <input
                        type="email"
                        value={otpEmail || ''}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        placeholder="admin@tcauth.dev"
                        required={apiMode !== 'demo'}
                        className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>
                  </FormField>

                  <button
                    type="submit"
                    formNoValidate={apiMode === 'demo'}
                    disabled={isSendingOtp}
                    className={`relative w-full py-3 px-4 text-sm font-bold rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-3 cursor-pointer overflow-hidden group select-none ${
                      apiMode === 'demo'
                        ? 'bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 border border-amber-300/60 font-black'
                        : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 border border-indigo-500/30'
                    }`}
                  >
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                    {isSendingOtp ? (
                      <span className={`w-4 h-4 border-2 ${apiMode === 'demo' ? 'border-zinc-950' : 'border-white'} border-t-transparent rounded-full animate-spin`} />
                    ) : (
                      <>
                        {apiMode === 'demo' ? (
                          <>
                            <Zap className="w-4 h-4 text-zinc-950 fill-zinc-950" />
                            <span>Sign In as SuperAdmin</span>
                            <ArrowRight className="w-4 h-4 text-zinc-950 group-hover:translate-x-0.5 transition-transform" />
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Send Sign-In OTP</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                          </>
                        )}
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} noValidate={apiMode === 'demo'} className="space-y-4">
                  <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                      Code sent to <strong className="text-white">{otpEmail}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="underline text-[11px] font-semibold text-zinc-400 hover:text-white cursor-pointer"
                    >
                      Change
                    </button>
                  </div>

                  <FormField label="Enter Verification Code" required={apiMode !== 'demo'} hint="Enter the 6-digit code sent to your inbox.">
                    <input
                      type="text"
                      value={otpCode || ''}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      required={apiMode !== 'demo'}
                      maxLength={12}
                      className="w-full text-center tracking-[0.25em] font-mono text-base py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-indigo-200 placeholder:tracking-normal placeholder:font-sans placeholder:text-zinc-600 placeholder:text-xs focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </FormField>

                  {apiMode === 'demo' && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Demo Mode: Any 6-digit code works
                      </span>
                      <button
                        type="button"
                        onClick={() => setOtpCode('123456')}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-bold text-[10px] border border-amber-500/30 transition-all cursor-pointer"
                      >
                        Fill Code (123456)
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    formNoValidate={apiMode === 'demo'}
                    disabled={isLoading}
                    className={`relative w-full py-3 px-4 text-sm font-bold rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-3 cursor-pointer overflow-hidden group select-none ${
                      apiMode === 'demo'
                        ? 'bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 border border-amber-300/60 font-black'
                        : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 border border-indigo-500/30'
                    }`}
                  >
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                    {isLoading ? (
                      <span className={`w-4 h-4 border-2 ${apiMode === 'demo' ? 'border-zinc-950' : 'border-white'} border-t-transparent rounded-full animate-spin`} />
                    ) : (
                      <>
                        {apiMode === 'demo' && <Zap className="w-4 h-4 text-zinc-950 fill-zinc-950" />}
                        <span>Sign In as SuperAdmin</span>
                        <ArrowRight className={`w-4 h-4 group-hover:translate-x-0.5 transition-transform ${apiMode === 'demo' ? 'text-zinc-950' : ''}`} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          )}

          {tab === 'reset' && (
            <motion.div
              key="reset"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              {/* Clean ReactBits header badge */}
              <div className="flex items-center justify-between pb-1 border-b border-zinc-800/60">
                <ShinyText text="Password Recovery" speed={3} className="text-xs font-semibold text-zinc-300" />
                <span className="text-[10px] font-medium text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded-full border border-zinc-800">
                  Self-Service
                </span>
              </div>

              {!resetSent ? (
                <form onSubmit={handleRequestResetOtp} noValidate={apiMode === 'demo'} className="space-y-4">
                  <FormField label="Registered Email" required={apiMode !== 'demo'} hint="Enter your account email to receive a recovery code.">
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required={apiMode !== 'demo'}
                        className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>
                  </FormField>

                  <button
                    type="submit"
                    formNoValidate={apiMode === 'demo'}
                    disabled={isSendingReset}
                    className={`relative w-full py-3 px-4 text-sm font-bold rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-3 cursor-pointer overflow-hidden group select-none ${
                      apiMode === 'demo'
                        ? 'bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 border border-amber-300/60 font-black'
                        : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 border border-indigo-500/30'
                    }`}
                  >
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                    {isSendingReset ? (
                      <span className={`w-4 h-4 border-2 ${apiMode === 'demo' ? 'border-zinc-950' : 'border-white'} border-t-transparent rounded-full animate-spin`} />
                    ) : (
                      <>
                        {apiMode === 'demo' ? (
                          <>
                            <Zap className="w-4 h-4 text-zinc-950 fill-zinc-950" />
                            <span>Sign In as SuperAdmin</span>
                            <ArrowRight className="w-4 h-4 text-zinc-950 group-hover:translate-x-0.5 transition-transform" />
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Send Reset Code</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                          </>
                        )}
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleForgotPassword} noValidate={apiMode === 'demo'} className="space-y-4">
                  <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                      Reset code sent to <strong className="text-white">{forgotEmail}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setResetSent(false)}
                      className="underline text-[11px] font-semibold text-zinc-400 hover:text-white cursor-pointer"
                    >
                      Change
                    </button>
                  </div>

                  <FormField label="Enter Verification Code" required={apiMode !== 'demo'} hint="Enter the 6-digit code sent to your inbox.">
                    <input
                      type="text"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value)}
                      placeholder="Enter 6-digit code"
                      required={apiMode !== 'demo'}
                      maxLength={12}
                      className="w-full text-center tracking-[0.25em] font-mono text-base py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-indigo-200 placeholder:tracking-normal placeholder:font-sans placeholder:text-zinc-600 placeholder:text-xs focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </FormField>

                  {apiMode === 'demo' && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Demo Mode: Any 6-digit code works
                      </span>
                      <button
                        type="button"
                        onClick={() => setForgotOtp('123456')}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-bold text-[10px] border border-amber-500/30 transition-all cursor-pointer"
                      >
                        Fill Code (123456)
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    formNoValidate={apiMode === 'demo'}
                    disabled={isLoading}
                    className={`relative w-full py-3 px-4 text-sm font-bold rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-3 cursor-pointer overflow-hidden group select-none ${
                      apiMode === 'demo'
                        ? 'bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 border border-amber-300/60 font-black'
                        : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 border border-indigo-500/30'
                    }`}
                  >
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                    {isLoading ? (
                      <span className={`w-4 h-4 border-2 ${apiMode === 'demo' ? 'border-zinc-950' : 'border-white'} border-t-transparent rounded-full animate-spin`} />
                    ) : (
                      <>
                        {apiMode === 'demo' && <Zap className="w-4 h-4 text-zinc-950 fill-zinc-950" />}
                        <span>Sign In as SuperAdmin</span>
                        <ArrowRight className={`w-4 h-4 group-hover:translate-x-0.5 transition-transform ${apiMode === 'demo' ? 'text-zinc-950' : ''}`} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 pt-4 border-t border-zinc-800/80 text-center text-xs text-zinc-400">
          Don't have an account?{' '}
          <button
            onClick={() => {
              if (apiMode === 'demo') {
                toast.error('Sign up is only available in Live Server mode. Please switch to Live Server mode first.');
              } else {
                onNavigate('/signup');
              }
            }}
            className="font-bold text-indigo-400 hover:underline hover:text-indigo-300 cursor-pointer"
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
};
