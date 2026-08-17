import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  KeyRound,
  Shield,
  Zap,
  Terminal,
  Users,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  Lock,
  Code2,
  Sliders,
  Send,
  Mail,
  Play,
  LogIn,
  UserPlus,
  ChevronRight,
  Database,
  ExternalLink,
  Cpu,
  Layers,
  Flame,
  X,
  Radio,
  Server,
  Activity,
  Globe,
  Menu
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApiConfig } from '../contexts/ApiConfigContext';
import { toast } from 'sonner';

// React Bits Components
import { ShinyText } from '../components/reactbits/ShinyText';
import { DecryptedText } from '../components/reactbits/DecryptedText';
import { SplitText } from '../components/reactbits/SplitText';
import { FeaturePills } from '../components/reactbits/FeaturePills';
import { SpotlightCard } from '../components/reactbits/SpotlightCard';
import { TiltedCard } from '../components/reactbits/TiltedCard';
import { BorderBeam } from '../components/reactbits/BorderBeam';
import { Magnet } from '../components/reactbits/Magnet';
import { ParticlesBackground } from '../components/reactbits/ParticlesBackground';
import { SquaresBackground } from '../components/reactbits/SquaresBackground';
import { AnimatedCounter } from '../components/reactbits/AnimatedCounter';
import { InteractiveTerminal } from '../components/reactbits/InteractiveTerminal';
import { ArchitectureFlow } from '../components/reactbits/ArchitectureFlow';
import { FloatingDock } from '../components/reactbits/FloatingDock';
import { FeatureBentoHub } from '../components/reactbits/FeatureBentoHub';
import { PlaygroundShowcase } from '../components/reactbits/PlaygroundShowcase';
import { ComparisonMatrix } from '../components/reactbits/ComparisonMatrix';
import { TcAuthLogo } from '../components/common/TcAuthLogo';

interface LandingPageProps {
  onNavigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { account, loginPassword } = useAuth();
  const { apiMode, setApiMode } = useApiConfig();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'init' | 'otp' | 'sessions' | 'rest'>('init');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(label);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const handleLaunchDemo = async () => {
    setApiMode('demo');
    try {
      await loginPassword({
        identifier: 'admin@tcauth.dev',
        password: 'password123',
      });
      toast.success('Launched Live Demo Console as Superadmin!');
    } catch {
      // If direct login encounters any issue, continue navigation to dashboard in demo mode
    }
    onNavigate('/dashboard');
  };

  const codeSnippets = {
    init: `# 1. Install & Initialize tc_auth
from tc_auth import Auth
from sqlalchemy import create_engine
from fastapi import FastAPI

app = FastAPI(title="Production Auth API")
engine = create_engine("postgresql+psycopg2://user:pass@localhost:5432/authdb")

# Initialize tc_auth with your database engine and secret
auth = Auth(
    app=app,
    engine=engine,
    secret_key="your-secure-jwt-secret-key-32-chars",
    session_duration_days=7
)

# User registration & password login
account = auth.account.create(
    name="Jane Doe",
    email="jane@example.com",
    password="superSecretPassword123!"
)

# Verify credentials & generate stateful session
session_data = auth.service.login(
    identifier="jane@example.com",
    password="superSecretPassword123!",
    ip_address="203.0.113.10"
)

print("JWT Access Token:", session_data["access_token"])`,

    otp: `# 2. Passwordless Email OTP Flow
from tc_auth import Auth

auth = Auth(app=app, engine=engine, secret_key="your-jwt-secret")

# Step A: Dispatch 6-digit cryptographic OTP to user's email
otp_code = auth.otp.create_otp(
    email="jane@example.com",
    purpose="login",
    expires_minutes=10
)

# Step B: Verify the OTP & automatically issue active session token
verification = auth.service.verify_otp_and_login(
    email="jane@example.com",
    otp_code="849201",
    ip_address="203.0.113.10"
)

if verification["status"] == "success":
    print("User authenticated:", verification["account"]["name"])
    print("Session ID:", verification["session"]["id"])`,

    sessions: `# 3. Stateful Database Session Management
from tc_auth import Auth

auth = Auth(app=app, engine=engine, secret_key="your-jwt-secret")

# List all active connected sessions for a given account ID
active_sessions = auth.session.get_user_sessions(account_id=1)
print(f"Total active devices: {len(active_sessions)}")

# Instantly revoke a specific compromised session token
auth.session.revoke_session(session_id=42)

# Purge all sessions across all devices (force global re-login)
auth.session.revoke_all_sessions(account_id=1)`,

    rest: `# 4. Standard REST API Call (cURL)
curl -X POST https://api.example.com/tc-auth/login/password \\
  -H "Content-Type: application/json" \\
  -d '{
    "identifier": "jane@example.com",
    "password": "superSecretPassword123!"
  }'

# Response: 200 OK
# {
#   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "token_type": "Bearer",
#   "account": {
#     "id": 1,
#     "name": "Jane Doe",
#     "email": "jane@example.com",
#     "role": "superadmin"
#   }
# }`
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500 selection:text-white font-sans antialiased relative">
      {/* Dynamic React Bits Canvas Particle Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <ParticlesBackground
          particleCount={50}
          particleColor="rgba(99, 102, 241, 0.35)"
          lineColor="rgba(129, 140, 248, 0.08)"
          minDistance={120}
          speed={0.4}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] bg-gradient-to-b from-indigo-500/15 via-purple-500/5 to-transparent blur-3xl opacity-80 pointer-events-none" />
      </div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo & Version */}
          <TcAuthLogo
            size="md"
            version="v1.5.0"
            onClick={() => onNavigate('/')}
          />

          {/* Center Navigation Links - Desktop */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs font-semibold text-zinc-400">
            <a href="#features" className="hover:text-indigo-400 transition-colors whitespace-nowrap">
              Features
            </a>
            <a href="#terminal-section" className="hover:text-indigo-400 transition-colors whitespace-nowrap">
              CLI Shell
            </a>
            <a href="#playground" className="hover:text-indigo-400 transition-colors whitespace-nowrap">
              Live Playground
            </a>
            <a href="#architecture" className="hover:text-indigo-400 transition-colors whitespace-nowrap">
              Architecture
            </a>
            <button
              onClick={() => onNavigate('/docs/lib/setup')}
              className="hover:text-indigo-400 transition-colors cursor-pointer whitespace-nowrap"
            >
              Python Docs
            </button>
            <a
              href="https://github.com/atharv-thakre/tc_auth"
              target="_blank"
              rel="noreferrer"
              className="hover:text-indigo-400 transition-colors whitespace-nowrap"
            >
              tc_auth (Python)
            </a>
            <a
              href="https://github.com/atharv-thakre/tc-dash"
              target="_blank"
              rel="noreferrer"
              className="hover:text-indigo-400 transition-colors whitespace-nowrap"
            >
              tc-dash (UI)
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {account ? (
              <Magnet magnetStrength={0.2}>
                <button
                  onClick={() => onNavigate('/dashboard')}
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 transition-all cursor-pointer whitespace-nowrap"
                >
                  <span className="hidden xs:inline">Open Dashboard</span>
                  <span className="xs:hidden">Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Magnet>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Magnet magnetStrength={0.2}>
                  <button
                    onClick={handleLaunchDemo}
                    className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer whitespace-nowrap"
                    title="Launch instant live demo"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Try Demo</span>
                  </button>
                </Magnet>

                <button
                  onClick={() => onNavigate('/login')}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-300 hover:text-white hover:bg-zinc-900 transition-all cursor-pointer whitespace-nowrap"
                >
                  Sign In
                </button>

                <Magnet magnetStrength={0.2}>
                  <button
                    onClick={() => onNavigate('/signup')}
                    className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/25 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Magnet>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 text-zinc-400 hover:text-white rounded-lg lg:hidden hover:bg-zinc-900 border border-zinc-800 shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-xl px-4 py-4 space-y-3 overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-zinc-300">
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-900 hover:text-indigo-400 border border-zinc-800"
                >
                  Features
                </a>
                <a
                  href="#terminal-section"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-900 hover:text-indigo-400 border border-zinc-800"
                >
                  CLI Shell
                </a>
                <a
                  href="#playground"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-900 hover:text-indigo-400 border border-zinc-800"
                >
                  Live Playground
                </a>
                <a
                  href="#architecture"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-900 hover:text-indigo-400 border border-zinc-800"
                >
                  Architecture
                </a>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('/docs/lib/setup');
                  }}
                  className="p-2.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-900 hover:text-indigo-400 border border-zinc-800 text-left"
                >
                  Python Docs
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('/docs/api/login-routes');
                  }}
                  className="p-2.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-900 hover:text-indigo-400 border border-zinc-800 text-left"
                >
                  REST API
                </button>
              </div>

              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('/login');
                  }}
                  className="text-xs font-bold text-zinc-300 hover:text-white py-2"
                >
                  Sign In
                </button>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-mono border border-zinc-800 bg-zinc-900 text-zinc-400">
                  <span className={`w-1.5 h-1.5 rounded-full ${apiMode === 'demo' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-pulse'}`} />
                  <span className="capitalize">{apiMode} Mode</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10">
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Clean, Elegant Version Announcement Pill */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-zinc-900/90 border border-zinc-800 text-zinc-300 shadow-sm"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-white">v1.5.0</span>
                <span className="text-zinc-600">•</span>
                <span className="text-indigo-300">Modular Python Auth Suite</span>
              </div>
              <span className="text-zinc-700">|</span>
              <button
                onClick={() => copyToClipboard('pip install tc_auth', 'pip install tc_auth')}
                className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Copy install command"
              >
                <Terminal className="w-3 h-3 text-indigo-400" />
                <span>pip install tc_auth</span>
                {copiedSnippet === 'pip install tc_auth' ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-zinc-500" />
                )}
              </button>
            </motion.div>

            {/* High-Impact Display Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]"
            >
              Authentication Made{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                Modular, Secure & Pythonic
              </span>
            </motion.h1>

            {/* Crisp Feature Pills Interactive Component */}
            <div className="py-2">
              <FeaturePills />
            </div>

            {/* Sub-headline */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-zinc-400 font-normal max-w-2xl mx-auto leading-relaxed"
            >
              A self-hosted, modular authentication framework for Python backends.
              Featuring database-backed stateful JWT sessions, passwordless email OTP,
              Google & GitHub OAuth 2.0, and a live administration console.
            </motion.p>

            {/* Options To Launch in Demo, Sign In, or Create Account */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="pt-2 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-center gap-3">
                {/* 1. Try Live Demo Option with Magnet */}
                <Magnet magnetStrength={0.3}>
                  <button
                    onClick={handleLaunchDemo}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 shadow-lg shadow-amber-950/30 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Try Live Demo</span>
                  </button>
                </Magnet>

                {/* 2. Sign In Option with Magnet */}
                <Magnet magnetStrength={0.3}>
                  <button
                    onClick={() => onNavigate('/login')}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-500/25 transition-all cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Console</span>
                  </button>
                </Magnet>

                {/* 3. Register / Get Started Option */}
                <Magnet magnetStrength={0.3}>
                  <button
                    onClick={() => onNavigate('/signup')}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-zinc-900 border border-zinc-700/80 text-zinc-100 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer shadow-md"
                  >
                    <UserPlus className="w-4 h-4 text-indigo-400" />
                    <span>Create Account</span>
                  </button>
                </Magnet>
              </div>

              {/* Pip Install Copy Box with ShinyText */}
              <div className="flex items-center justify-center pt-2">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-300 font-mono text-xs shadow-inner">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <ShinyText text="pip install tc_auth" speed={5} className="text-zinc-200" />
                  <button
                    onClick={() => copyToClipboard('pip install tc_auth', 'pip install tc_auth')}
                    className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Copy command"
                  >
                    {copiedSnippet === 'pip install tc_auth' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Interactive Code Preview Card with BorderBeam Effect */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-14 max-w-4xl mx-auto rounded-2xl border border-zinc-800 bg-zinc-900/90 shadow-2xl overflow-hidden backdrop-blur-sm relative"
          >
            <BorderBeam size={260} duration={12} colorFrom="#6366f1" colorTo="#a855f7" />

            {/* Code Tabs Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-zinc-800 bg-zinc-950/80">
              <div className="flex items-center justify-between sm:justify-start gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-1 sm:ml-2 text-xs font-mono font-bold text-zinc-400">
                    tc_auth_python_suite
                  </span>
                </div>

                {/* Mobile Copy Code */}
                <button
                  onClick={() => copyToClipboard(codeSnippets[activeCodeTab], `${activeCodeTab} snippet`)}
                  className="sm:hidden flex items-center gap-1 px-2 py-1 text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedSnippet === `${activeCodeTab} snippet` ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span className="text-[11px]">{copiedSnippet === `${activeCodeTab} snippet` ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg overflow-x-auto max-w-full">
                <button
                  onClick={() => setActiveCodeTab('init')}
                  className={`px-2 sm:px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    activeCodeTab === 'init'
                      ? 'bg-zinc-800 text-indigo-400 shadow-2xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Quickstart
                </button>
                <button
                  onClick={() => setActiveCodeTab('otp')}
                  className={`px-2 sm:px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    activeCodeTab === 'otp'
                      ? 'bg-zinc-800 text-indigo-400 shadow-2xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Email OTP
                </button>
                <button
                  onClick={() => setActiveCodeTab('sessions')}
                  className={`px-2 sm:px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    activeCodeTab === 'sessions'
                      ? 'bg-zinc-800 text-indigo-400 shadow-2xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Sessions
                </button>
                <button
                  onClick={() => setActiveCodeTab('rest')}
                  className={`px-2 sm:px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    activeCodeTab === 'rest'
                      ? 'bg-zinc-800 text-indigo-400 shadow-2xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  REST API
                </button>
              </div>

              {/* Desktop Copy Code */}
              <button
                onClick={() => copyToClipboard(codeSnippets[activeCodeTab], `${activeCodeTab} snippet`)}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                {copiedSnippet === `${activeCodeTab} snippet` ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 text-[11px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Body */}
            <div className="p-5 bg-zinc-950 text-zinc-200 font-mono text-xs overflow-x-auto leading-relaxed max-h-[380px]">
              <pre>
                <code>{codeSnippets[activeCodeTab]}</code>
              </pre>
            </div>
          </motion.div>
        </section>

        {/* LIVE METRICS / STATS BAR WITH ANIMATED COUNTERS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-y border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-white font-mono flex items-center justify-center">
                <AnimatedCounter to={100} suffix="%" />
              </div>
              <p className="text-xs text-zinc-400 font-medium">Self-Hosted & Private</p>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-indigo-400 font-mono flex items-center justify-center">
                <AnimatedCounter to={0} prefix="< " suffix="ms" decimals={0} />
              </div>
              <p className="text-xs text-zinc-400 font-medium">Session Revocation Latency</p>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-purple-400 font-mono flex items-center justify-center">
                <AnimatedCounter to={4} suffix=" Strategies" />
              </div>
              <p className="text-xs text-zinc-400 font-medium">Password, OTP, Google, GitHub</p>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono flex items-center justify-center">
                <AnimatedCounter to={0} prefix="$" suffix=" / Unlimited" />
              </div>
              <p className="text-xs text-zinc-400 font-medium">Open Source & Free</p>
            </div>
          </div>
        </section>

        {/* INTERACTIVE DEVELOPER TERMINAL SECTION */}
        <section id="terminal-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 border border-indigo-800/60">
              Developer Experience
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Interactive CLI Emulator
            </h2>
            <p className="text-sm text-zinc-400">
              Run commands directly in this simulated tc_auth shell. Try initializing the database, dispatching OTPs, inspecting tokens, or typing <code className="font-mono text-indigo-400">help</code>.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <InteractiveTerminal />
          </div>
        </section>

        {/* CORE PILLARS / BENTO ARCHITECTURE HUB */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-800/80">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 border border-indigo-800/60">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Engineered for Modern Security & DX
            </h2>
            <p className="text-sm text-zinc-400">
              Interactive architecture widgets showing stateful session control, multi-strategy identity providers, and granular RBAC scopes.
            </p>
          </div>

          <FeatureBentoHub onNavigateDocs={() => onNavigate('/docs/lib/setup')} />
        </section>

        {/* INTERACTIVE PLAYGROUND TESTER */}
        <section id="playground" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-800/80">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/60">
              Interactive Test Suite
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Test tc_auth in Real Time
            </h2>
            <p className="text-sm text-zinc-400">
              Try the core authentication mechanics right here in your browser before integrating into your backend.
            </p>
          </div>

          {/* Playground Card */}
          <PlaygroundShowcase onNavigateDocs={() => onNavigate('/docs/api/login-routes')} />
        </section>

        {/* ARCHITECTURE & INTERACTIVE PIPELINE FLOW */}
        <section id="architecture" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-800/80">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-950/60 border border-purple-800/60">
              Architecture & Strategy
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Interactive System Architecture
            </h2>
            <p className="text-sm text-zinc-400">
              Click on each pipeline node to inspect security mechanisms, data models, and implementation snippets.
            </p>
          </div>

          <ArchitectureFlow />

          {/* Comparison Matrix Component */}
          <div className="mt-16">
            <ComparisonMatrix onGetStarted={() => onNavigate('/signup')} />
          </div>
        </section>

        {/* 3-STEP QUICKSTART */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-800/80">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 border border-indigo-800/60">
              Get Started in Minutes
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Three Steps to Full Production Auth
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <TiltedCard className="h-full bg-zinc-900 border border-zinc-800 p-6 space-y-3">
              <div className="text-3xl font-black font-mono text-indigo-400">01</div>
              <h3 className="text-base font-bold text-white">Install Package</h3>
              <p className="text-xs text-zinc-400">
                Install tc_auth into your Python virtual environment using pip.
              </p>
              <div className="p-2.5 rounded-lg bg-zinc-950 text-zinc-300 font-mono text-[11px] flex items-center justify-between">
                <span>pip install tc_auth</span>
                <button
                  onClick={() => copyToClipboard('pip install tc_auth', 'pip install')}
                  className="p-1 hover:text-white text-zinc-500"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </TiltedCard>

            {/* Step 2 */}
            <TiltedCard className="h-full bg-zinc-900 border border-zinc-800 p-6 space-y-3">
              <div className="text-3xl font-black font-mono text-indigo-400">02</div>
              <h3 className="text-base font-bold text-white">Initialize & Configure</h3>
              <p className="text-xs text-zinc-400">
                Instantiate Auth with your database engine, secret key, and session policy.
              </p>
              <div className="p-2.5 rounded-lg bg-zinc-950 text-zinc-300 font-mono text-[11px]">
                auth = Auth(app, engine, secret_key=SECRET)
              </div>
            </TiltedCard>

            {/* Step 3 */}
            <TiltedCard className="h-full bg-zinc-900 border border-zinc-800 p-6 space-y-3">
              <div className="text-3xl font-black font-mono text-indigo-400">03</div>
              <h3 className="text-base font-bold text-white">Manage & Monitor</h3>
              <p className="text-xs text-zinc-400">
                Open the interactive control panel to configure SMTP, Google/GitHub OAuth, and audit sessions.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => onNavigate('/signup')}
                  className="flex-1 py-2.5 px-3 rounded-lg text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-all cursor-pointer text-center"
                >
                  Create Account
                </button>
                <button
                  onClick={() => onNavigate('/login')}
                  className="flex-1 py-2.5 px-3 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer text-center"
                >
                  Sign In →
                </button>
              </div>
            </TiltedCard>
          </div>
        </section>

        {/* BOTTOM CTA BANNER WITH SPOTLIGHT */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="rounded-3xl bg-gradient-to-br from-indigo-950 via-zinc-900 to-zinc-950 p-8 sm:p-12 text-white border border-indigo-800/60 shadow-2xl relative overflow-hidden text-center space-y-6">
            <BorderBeam size={320} duration={16} colorFrom="#818cf8" colorTo="#c084fc" />

            <div className="max-w-2xl mx-auto space-y-4 relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                Ready to Secure Your Python Application?
              </h2>
              <p className="text-sm text-indigo-200/80 leading-relaxed">
                Take complete ownership of your authentication layer. Sign into your control panel, create an account, or explore the documentation.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Magnet magnetStrength={0.25}>
                  <button
                    onClick={handleLaunchDemo}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-amber-400 text-zinc-950 hover:bg-amber-300 shadow-lg transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Launch Live Demo</span>
                  </button>
                </Magnet>

                <Magnet magnetStrength={0.25}>
                  <button
                    onClick={() => onNavigate('/login')}
                    className="px-6 py-3 rounded-xl text-xs font-bold bg-white text-indigo-950 hover:bg-indigo-50 shadow-lg transition-all cursor-pointer"
                  >
                    Sign In to Console
                  </button>
                </Magnet>

                <Magnet magnetStrength={0.25}>
                  <button
                    onClick={() => onNavigate('/signup')}
                    className="px-6 py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all cursor-pointer"
                  >
                    Create Account
                  </button>
                </Magnet>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Action Dock for Fast Interactive Navigation */}
      <FloatingDock onNavigate={onNavigate} onLaunchDemo={handleLaunchDemo} />

      {/* FOOTER */}
      <footer className="border-t border-zinc-800 bg-zinc-950 py-12 pb-24 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <TcAuthLogo size="sm" version="v1.5.0" />
              <span>•</span>
              <span>Modular Authentication Framework for Python</span>
              <span>•</span>
              <span>
                Created by{' '}
                <a
                  href="https://github.com/atharv-thakre"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-zinc-300 hover:text-indigo-400 transition-colors underline decoration-zinc-700 underline-offset-4"
                >
                  Atharv Thakre
                </a>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-semibold">
              <a
                href="https://github.com/atharv-thakre/tc_auth"
                target="_blank"
                rel="noreferrer"
                className="hover:text-indigo-400 transition-colors flex items-center gap-1.5 text-zinc-300"
              >
                <span>GitHub: tc_auth</span>
                <ArrowRight className="w-3 h-3 -rotate-45" />
              </a>
              <a
                href="https://github.com/atharv-thakre/tc-dash"
                target="_blank"
                rel="noreferrer"
                className="hover:text-indigo-400 transition-colors flex items-center gap-1.5 text-zinc-300"
              >
                <span>GitHub: tc-dash</span>
                <ArrowRight className="w-3 h-3 -rotate-45" />
              </a>
              <button onClick={() => onNavigate('/docs/lib/setup')} className="hover:text-indigo-400 cursor-pointer">
                Docs
              </button>
              <button onClick={handleLaunchDemo} className="hover:text-amber-400 cursor-pointer flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Live Demo</span>
              </button>
              <button onClick={() => onNavigate('/login')} className="hover:text-indigo-400 cursor-pointer">
                Sign In
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-600 gap-2">
            <div>© {new Date().getFullYear()} Atharv Thakre. Open source under MIT License.</div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/atharv-thakre/tc_auth"
                target="_blank"
                rel="noreferrer"
                className="hover:text-zinc-400 transition-colors"
              >
                Python Backend (FastAPI / Flask)
              </a>
              <span>•</span>
              <a
                href="https://github.com/atharv-thakre/tc-dash"
                target="_blank"
                rel="noreferrer"
                className="hover:text-zinc-400 transition-colors"
              >
                React Admin Dashboard
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
