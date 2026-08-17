import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, Shield, Mail, KeyRound, Globe, ArrowRight, CheckCircle2, Lock, Cpu, Server, Layers, Zap } from 'lucide-react';
import { BorderBeam } from './BorderBeam';
import { Magnet } from './Magnet';

interface NodeInfo {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  badge: string;
  description: string;
  codeSnippet: string;
  metrics: { label: string; value: string }[];
  accentColor: string;
}

export const ArchitectureFlow: React.FC = () => {
  const [activeNodeId, setActiveNodeId] = useState<string>('framework');

  const nodes: Record<string, NodeInfo> = {
    client: {
      id: 'client',
      title: 'Client Apps & SPAs',
      category: 'Frontend / API Consumer',
      icon: <Globe className="w-5 h-5 text-sky-400" />,
      badge: 'HTTP / REST',
      description:
        'Dispatches standard Bearer JWT tokens in Authorization headers or HTTP-only cookies to your backend endpoints.',
      codeSnippet: `// Frontend Token Dispatch
fetch("https://api.domain.com/tc-auth/me", {
  headers: {
    "Authorization": \`Bearer \${token}\`
  }
});`,
      metrics: [
        { label: 'Token Protocol', value: 'Bearer JWT (HS256)' },
        { label: 'Transport', value: 'HTTPS / WSS' },
      ],
      accentColor: 'from-sky-500/20 to-sky-950/40',
    },
    framework: {
      id: 'framework',
      title: 'tc_auth Core Engine',
      category: 'FastAPI & Python ASGI',
      icon: <Shield className="w-5 h-5 text-indigo-400" />,
      badge: 'Core Gateway',
      description:
        'Validates HMAC-SHA256 JWT signatures, inspects session claims in real-time, manages brute-force guards, and routes user identity.',
      codeSnippet: `# Pure Python Auth Core Gateway
auth = Auth(
    app=app,
    engine=engine,
    secret_key=SECRET_KEY,
    session_duration_days=7
)

@app.get("/protected")
def protected_route(user = Depends(auth.require_auth)):
    return {"user": user.name, "role": user.role}`,
      metrics: [
        { label: 'Signing Algorithm', value: 'HMAC-SHA256' },
        { label: 'Session Verification', value: '< 1ms Latency' },
      ],
      accentColor: 'from-indigo-500/20 to-indigo-950/40',
    },
    database: {
      id: 'database',
      title: 'Stateful Database',
      category: 'PostgreSQL / MySQL / SQLite',
      icon: <Database className="w-5 h-5 text-purple-400" />,
      badge: 'SQLAlchemy ORM',
      description:
        'Holds stateful tables for accounts, active sessions, OTP attempt logs, and linked OAuth identity providers.',
      codeSnippet: `-- Core relational schema for active sessions
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    account_id INT REFERENCES accounts(id),
    token_hash VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_revoked BOOLEAN DEFAULT FALSE
);`,
      metrics: [
        { label: 'ORM Compatibility', value: 'SQLAlchemy 2.0+' },
        { label: 'Data Sovereignty', value: '100% On-Prem / Cloud' },
      ],
      accentColor: 'from-purple-500/20 to-purple-950/40',
    },
    smtp: {
      id: 'smtp',
      title: 'SMTP Mailer Engine',
      category: 'Passwordless OTP Delivery',
      icon: <Mail className="w-5 h-5 text-emerald-400" />,
      badge: 'Zero-Password Auth',
      description:
        'Direct connection to SMTP mail relays (SendGrid, AWS SES, Resend, or local Postfix) for 6-digit email OTPs.',
      codeSnippet: `# Dispatch cryptographic OTP code
auth.otp.create_otp(
    email="user@domain.com",
    purpose="login",
    expires_minutes=10
)`,
      metrics: [
        { label: 'OTP Cryptography', value: '6-Digit Secure PRNG' },
        { label: 'Default Expiration', value: '300s TTL (5 Min)' },
      ],
      accentColor: 'from-emerald-500/20 to-emerald-950/40',
    },
    oauth: {
      id: 'oauth',
      title: 'OAuth 2.0 & OIDC',
      category: 'Google & GitHub Federation',
      icon: <KeyRound className="w-5 h-5 text-amber-400" />,
      badge: 'Social SSO',
      description:
        'Secure authorization code exchange for single-click login with Google and GitHub with unified account merging.',
      codeSnippet: `# Handle OAuth 2.0 callback and token link
account = auth.service.handle_oauth_callback(
    provider="google",
    code=auth_code,
    redirect_uri="https://app.com/callback"
)`,
      metrics: [
        { label: 'Supported Identity', value: 'Google, GitHub' },
        { label: 'Security Model', value: 'OAuth 2.0 + PKCE' },
      ],
      accentColor: 'from-amber-500/20 to-amber-950/40',
    },
  };

  const selected = nodes[activeNodeId] || nodes.framework;

  return (
    <div className="space-y-6">
      {/* Node Flow Pipeline Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Object.values(nodes).map((node) => {
          const isActive = node.id === activeNodeId;
          return (
            <motion.button
              key={node.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveNodeId(node.id)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[115px] ${
                isActive
                  ? 'bg-zinc-900/90 border-indigo-500 shadow-lg shadow-indigo-500/15 ring-1 ring-indigo-500/50'
                  : 'bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/40 text-zinc-400'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 ${
                    isActive
                      ? 'bg-indigo-950/80 border-indigo-500/50 shadow-inner'
                      : 'bg-zinc-900 border-zinc-800'
                  }`}
                >
                  {node.icon}
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  isActive ? 'text-indigo-300 bg-indigo-950/70 border border-indigo-800/80' : 'text-zinc-500 bg-zinc-900'
                }`}>
                  {node.badge}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white leading-tight mb-0.5">
                  {node.title}
                </h4>
                <p className="text-[11px] text-zinc-400 font-mono leading-none">
                  {node.category}
                </p>
              </div>

              {isActive && (
                <motion.div
                  layoutId="activeFlowBar"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Deep Inspection Panel for Selected Node */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selected.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-950/90 p-6 sm:p-7 backdrop-blur-xl shadow-2xl relative overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Description & Metrics */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                  {selected.icon}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{selected.title}</h3>
                  <span className="text-xs font-mono text-indigo-400">{selected.category}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{selected.description}</p>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {selected.metrics.map((m, i) => (
                  <div key={i} className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-zinc-500">{m.label}</span>
                    <p className="text-xs font-bold font-mono text-zinc-200">{m.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Code Sandbox View */}
            <div className="lg:col-span-7 rounded-xl border border-zinc-800 bg-zinc-900/90 p-4 font-mono text-xs overflow-hidden space-y-2 shadow-inner">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[11px] text-zinc-400">
                <span className="flex items-center gap-1.5 text-indigo-400 font-bold">
                  <Cpu className="w-3.5 h-3.5" /> Spec Implementation
                </span>
                <span className="text-emerald-400 font-mono text-[10px]">Validated Architecture</span>
              </div>
              <pre className="text-[11px] text-zinc-200 leading-relaxed overflow-x-auto p-1 max-h-[200px]">
                <code>{selected.codeSnippet}</code>
              </pre>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
