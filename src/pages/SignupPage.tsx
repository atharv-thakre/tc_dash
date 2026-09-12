import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  Send,
  Sparkles,
  User,
  UserPlus,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useApiConfig } from '../contexts/ApiConfigContext';
import { authService } from '../services/auth';
import { FormField } from '../components/common/FormField';
import { ProviderButton } from '../components/common/ProviderButton';
import { SITE_VERSION_LABEL } from '../config/version';
import { BorderBeam } from '../components/reactbits/BorderBeam';
import { ParticlesBackground } from '../components/reactbits/ParticlesBackground';
import { ShinyText } from '../components/reactbits/ShinyText';
import { DecryptedText } from '../components/reactbits/DecryptedText';
import { getErrorMessage } from '../services/apiClient';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  handle: z.string().min(2, 'Handle must be at least 2 characters').regex(/^[a-zA-Z0-9_]+$/, 'Handle can only contain letters, numbers, and underscores'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignupFormData = z.infer<typeof signupSchema>;

export const SignupPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { signupPassword, signupOTP } = useAuth();
  const { apiMode, setApiMode } = useApiConfig();

  const [tab, setTab] = useState<'password' | 'otp' | 'magic_link'>('password');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSendingMagic, setIsSendingMagic] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreVerified, setIsPreVerified] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const formValues = watch();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get('email');
      const otpParam = params.get('otp');
      const verifiedParam = params.get('verified');
      if (emailParam) {
        setValue('email', emailParam);
      }
      if (otpParam) {
        setOtpCode(otpParam);
        setOtpSent(true);
        setTab('otp');
      }
      if (verifiedParam === 'true') {
        setIsPreVerified(true);
        setTab('otp');
        toast.success('Email pre-verified via Magic Link! Fill in your details to finish registration.');
      }
    }
  }, [setValue]);

  const onSubmitPassword = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      await signupPassword(data);
      toast.success('Account created successfully');
      onNavigate('/dashboard');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to create account. Please check details or server connection.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValues.email) {
      toast.error('Please fill in your email address first');
      return;
    }
    setIsSendingOtp(true);
    try {
      const frontendUrl = typeof window !== 'undefined' ? window.location.origin : undefined;
      await authService.sendEmailOTP('signup', { email: formValues.email, frontend_url: frontendUrl });
      setOtpSent(true);
      toast.success('Verification code and link sent to your email.');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to send OTP verification email.'));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValues.email) {
      toast.error('Please fill in your email address first');
      return;
    }
    setIsSendingMagic(true);
    try {
      const frontendUrl = typeof window !== 'undefined' ? window.location.origin : undefined;
      await authService.sendMagicLink('signup', { email: formValues.email, frontend_url: frontendUrl });
      setMagicSent(true);
      toast.success('Magic Link sent to email! Open it in your inbox or enter code below.');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to send Magic Link email.'));
    } finally {
      setIsSendingMagic(false);
    }
  };

  const handleVerifyAndSignupOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      toast.error('Please enter the OTP verification code');
      return;
    }
    if (!formValues.name || !formValues.handle || !formValues.email || !formValues.password) {
      toast.error('Please fill in all registration fields');
      return;
    }
    setIsLoading(true);
    try {
      await signupOTP({
        name: formValues.name,
        email: formValues.email,
        handle: formValues.handle,
        password: formValues.password,
        otp: otpCode,
      });
      toast.success('Account verified and created successfully');
      onNavigate('/dashboard');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to complete signup.'));
    } finally {
      setIsLoading(false);
    }
  };

  // Block access to Signup Page if in Demo Mode
  if (apiMode === 'demo') {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5 animate-in fade-in duration-200">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Live Server Mode Required</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Account registration is disabled in Demo Mock Mode. Switch to Live Server mode to create an account.
            </p>
          </div>
          <div className="pt-2 space-y-2.5">
            <button
              type="button"
              onClick={() => {
                setApiMode('live');
                toast.success('Switched to Live Server mode');
              }}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer border border-indigo-400/30"
            >
              Switch to Live Server Mode
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/login')}
              className="w-full py-2.5 px-4 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 rounded-xl transition-all cursor-pointer border border-zinc-700/60"
            >
              Return to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-[85vh] flex flex-col items-center justify-center p-4 py-8 relative"
    >
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
          duration={12}
          colorFrom="#6366f1"
          colorTo="#a855f7"
        />
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl border mb-3 shadow-inner transition-colors bg-zinc-800/80 border-zinc-700/60 text-indigo-400">
            <UserPlus className="w-6 h-6" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white">Create Account</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/80">
              <DecryptedText text={SITE_VERSION_LABEL} speed={40} maxIterations={8} animateOn="hover" />
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Register your developer account on tc-auth
          </p>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-2.5 mb-5">
          <ProviderButton provider="google" label="Sign up with Google" onSuccessNavigate={() => onNavigate('/dashboard')} />
          <ProviderButton provider="github" label="Sign up with GitHub" onSuccessNavigate={() => onNavigate('/dashboard')} />
          <ProviderButton provider="discord" label="Sign up with Discord" onSuccessNavigate={() => onNavigate('/dashboard')} />
        </div>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase">
            <span className="bg-zinc-900 px-3 text-zinc-500 font-bold tracking-wider">
              or register with credentials
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="relative flex p-1 mb-5 rounded-2xl bg-zinc-950 border border-zinc-800/80">
          {(['password', 'otp', 'magic_link'] as const).map((t) => {
            const isActive = tab === t;
            const label = t === 'password' ? 'Password' : t === 'otp' ? 'Email OTP' : 'Magic Link';
            const Icon = t === 'password' ? KeyRound : t === 'otp' ? Mail : Sparkles;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`relative flex-1 py-2 text-[11px] sm:text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 z-10 select-none ${
                  isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSignupTab"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute inset-0 bg-zinc-800 border border-zinc-700/60 rounded-xl shadow-xs -z-10"
                  />
                )}
                <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                <span className="truncate">{label}</span>
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
              <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-3.5">
                <FormField label="Full Name" error={errors.name?.message} required>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Atharv Thakre"
                      {...register('name')}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                </FormField>

                <FormField label="Handle / Username" error={errors.handle?.message} required>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-sm font-mono text-zinc-500">@</span>
                    <input
                      type="text"
                      placeholder="atharvthakre"
                      {...register('handle')}
                      className="w-full pl-8 pr-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500/50 font-mono text-xs"
                    />
                  </div>
                </FormField>

                <FormField label="Email Address" error={errors.email?.message} required>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                    <input
                      type="email"
                      placeholder="admin@tcauth.dev"
                      {...register('email')}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                </FormField>

                <FormField label="Password" error={errors.password?.message} required>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                    <input
                      type="password"
                      placeholder="At least 6 characters"
                      {...register('password')}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                </FormField>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative w-full py-3 px-4 text-sm font-bold rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer overflow-hidden group select-none bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 border border-indigo-500/30"
                >
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
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
              className="space-y-3.5"
            >
              <FormField label="Full Name" required>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Atharv Thakre"
                    {...register('name')}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </FormField>

              <FormField label="Handle / Username" required>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-sm font-mono text-zinc-500">@</span>
                  <input
                    type="text"
                    placeholder="atharvthakre"
                    {...register('handle')}
                    className="w-full pl-8 pr-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500/50 font-mono text-xs"
                  />
                </div>
              </FormField>

              <FormField label="Email Address" required>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    placeholder="admin@tcauth.dev"
                    {...register('email')}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </FormField>

              <FormField label="Password" required>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...register('password')}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </FormField>

              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp}
                  className="relative w-full py-3 px-4 text-sm font-bold rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer overflow-hidden group select-none bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 border border-indigo-500/30"
                >
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                  {isSendingOtp ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Request Signup OTP</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              ) : (
                <form onSubmit={handleVerifyAndSignupOtp} className="space-y-3">
                  <FormField label="Enter Verification Code" required hint="Enter the 6-digit verification code.">
                    <input
                      type="text"
                      value={otpCode || ''}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="w-full text-center tracking-[0.25em] font-mono text-base py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-indigo-200 placeholder:tracking-normal placeholder:font-sans placeholder:text-zinc-600 placeholder:text-xs focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </FormField>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative w-full py-3 px-4 text-sm font-bold rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer overflow-hidden group select-none bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 border border-indigo-500/30"
                  >
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                    {isLoading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Verify & Create Account</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          )}

          {tab === 'magic_link' && (
            <motion.div
              key="magic_link"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-3.5"
            >
              <div className="flex items-center justify-between pb-1 border-b border-zinc-800/60">
                <ShinyText text="Passwordless Verification" speed={3} className="text-xs font-semibold text-zinc-300" />
                <span className="text-[10px] font-medium text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-800/50 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> One-Click Link
                </span>
              </div>

              <FormField label="Email Address" required hint="We will send an instant sign-up link directly to your inbox.">
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    placeholder="admin@tcauth.dev"
                    {...register('email')}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </FormField>

              {!magicSent ? (
                <button
                  type="button"
                  onClick={handleSendMagicLink}
                  disabled={isSendingMagic}
                  className="relative w-full py-3 px-4 text-sm font-bold rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer overflow-hidden group select-none bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 border border-indigo-500/30"
                >
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                  {isSendingMagic ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Send Magic Verification Link</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/50 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-indigo-200 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Link Dispatched!
                      </span>
                      <button
                        type="button"
                        onClick={() => setMagicSent(false)}
                        className="text-[11px] font-semibold text-zinc-400 hover:text-white underline cursor-pointer"
                      >
                        Resend
                      </button>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Click the link in your email to verify instantly, or fill in your details below and use the 6-digit code.
                    </p>
                  </div>

                  <form onSubmit={handleVerifyAndSignupOtp} className="space-y-3">
                    <FormField label="Full Name" required>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                        <input
                          type="text"
                          placeholder="Atharv Thakre"
                          {...register('name')}
                          className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500/50"
                        />
                      </div>
                    </FormField>

                    <FormField label="Handle / Username" required>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-sm font-mono text-zinc-500">@</span>
                        <input
                          type="text"
                          placeholder="atharvthakre"
                          {...register('handle')}
                          className="w-full pl-8 pr-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500/50 font-mono text-xs"
                        />
                      </div>
                    </FormField>

                    <FormField label="Set Password" required>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                        <input
                          type="password"
                          placeholder="••••••••"
                          {...register('password')}
                          className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500/50"
                        />
                      </div>
                    </FormField>

                    <FormField label="Enter Verification Code" required hint="6-digit code from email">
                      <input
                        type="text"
                        value={otpCode || ''}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        className="w-full text-center tracking-[0.25em] font-mono text-base py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-indigo-200 placeholder:tracking-normal placeholder:font-sans placeholder:text-zinc-600 placeholder:text-xs focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </FormField>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="relative w-full py-3 px-4 text-sm font-bold rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer overflow-hidden group select-none bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 border border-indigo-500/30"
                    >
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                      {isLoading ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Complete Registration</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 pt-4 border-t border-zinc-800/80 text-center text-xs text-zinc-400">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('/login')}
            className="font-bold text-indigo-400 hover:underline hover:text-indigo-300 cursor-pointer"
          >
            Sign in
          </button>
        </div>
      </div>
    </motion.div>
  );
};
