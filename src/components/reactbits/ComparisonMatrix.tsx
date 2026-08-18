import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, AlertCircle, Shield, Sparkles, Layers, DollarSign, Lock, Zap, Server } from 'lucide-react';
import { BorderBeam } from './BorderBeam';
import { Magnet } from './Magnet';

interface ComparisonMatrixProps {
  onGetStarted?: () => void;
}

export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({ onGetStarted }) => {
  const comparisonRows = [
    {
      feature: 'Data Ownership & Self-Hosting',
      category: 'Deployment',
      tcAuth: {
        value: '100% Self-Hosted on your own Cloud / DB',
        status: 'superior',
        note: 'Zero telemetry, full schema access'
      },
      customCode: {
        value: 'Self-hosted (Requires continuous maintenance)',
        status: 'neutral',
        note: 'High technical debt'
      },
      authSaas: {
        value: 'Locked into Proprietary Cloud (Auth0/Clerk/Okta)',
        status: 'inferior',
        note: 'Vendor lock-in risk'
      }
    },
    {
      feature: 'Stateful Session Revocation',
      category: 'Security',
      tcAuth: {
        value: 'Instant (< 1ms) single & all-device purge',
        status: 'superior',
        note: 'Real-time database session verification'
      },
      customCode: {
        value: 'Complex to architect & maintain properly',
        status: 'neutral',
        note: 'Prone to JWT replay exploits'
      },
      authSaas: {
        value: 'Supported via SaaS Webhook latency',
        status: 'neutral',
        note: 'Dependent on external API uptime'
      }
    },
    {
      feature: 'Python DX & Native Integration',
      category: 'Developer Experience',
      tcAuth: {
        value: 'Unified Python SDK with FastAPI & SQLAlchemy',
        status: 'superior',
        note: 'Zero external dependencies'
      },
      customCode: {
        value: 'Hundreds of manual boilerplate lines',
        status: 'neutral',
        note: 'High maintenance surface'
      },
      authSaas: {
        value: 'Generic Python wrapper requiring heavy middleware',
        status: 'inferior',
        note: 'Complex JWT verification flows'
      }
    },
    {
      feature: 'Built-in Admin Audit Portal',
      category: 'Management',
      tcAuth: {
        value: 'Full-featured real-time admin web console',
        status: 'superior',
        note: 'Inspect sessions, users, & OAuth status'
      },
      customCode: {
        value: 'Must design & build dashboard from scratch',
        status: 'inferior',
        note: 'Significant engineering effort'
      },
      authSaas: {
        value: 'Standard hosted vendor dashboard',
        status: 'neutral',
        note: 'Limited customization'
      }
    },
    {
      feature: 'Pricing & Active User (MAU) Limits',
      category: 'Economics',
      tcAuth: {
        value: '100% Open-Source & Unlimited Users',
        status: 'superior',
        note: 'No credit card or usage bills ever'
      },
      customCode: {
        value: 'Free software, but expensive dev hours',
        status: 'neutral',
        note: 'Costly maintenance overhead'
      },
      authSaas: {
        value: 'Steep tier jumps ($$$ per 1,000 MAU)',
        status: 'inferior',
        note: 'Exponential cost scaling'
      }
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Desktop / Tablet Matrix Table */}
      <div className="hidden md:block rounded-2xl border border-zinc-800 bg-zinc-950/90 shadow-2xl overflow-hidden relative">
        <BorderBeam size={280} duration={18} colorFrom="#6366f1" colorTo="#a855f7" />

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80">
                <th className="py-4 px-6 text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 w-1/4">
                  Feature Specification
                </th>
                <th className="py-4 px-6 text-xs font-mono font-bold uppercase tracking-wider text-indigo-300 w-1/3 bg-indigo-950/40 border-x border-indigo-500/30 relative">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    <span>tc_auth v1.5.1 (Open Source)</span>
                  </div>
                </th>
                <th className="py-4 px-6 text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 w-1/5">
                  Custom Auth Code
                </th>
                <th className="py-4 px-6 text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 w-1/5">
                  Heavy Auth SaaS (Auth0/Okta)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 text-xs">
              {comparisonRows.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-zinc-900/30 transition-colors group"
                >
                  {/* Feature Title */}
                  <td className="py-4 px-6">
                    <div className="font-semibold text-zinc-200">{row.feature}</div>
                    <span className="text-[10px] font-mono text-zinc-500">{row.category}</span>
                  </td>

                  {/* tc_auth column (Highlighted) */}
                  <td className="py-4 px-6 bg-indigo-950/20 border-x border-indigo-500/20 group-hover:bg-indigo-950/30 transition-colors">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                      <div>
                        <span className="font-bold text-zinc-100">{row.tcAuth.value}</span>
                        <p className="text-[11px] text-indigo-300/80 font-mono mt-0.5">{row.tcAuth.note}</p>
                      </div>
                    </div>
                  </td>

                  {/* Custom Code column */}
                  <td className="py-4 px-6 text-zinc-400">
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertCircle className="w-3 h-3 text-zinc-500" />
                      </div>
                      <div>
                        <span className="font-medium text-zinc-300">{row.customCode.value}</span>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{row.customCode.note}</p>
                      </div>
                    </div>
                  </td>

                  {/* Auth SaaS column */}
                  <td className="py-4 px-6 text-zinc-400">
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-rose-950/60 border border-rose-800/60 flex items-center justify-center shrink-0 mt-0.5">
                        <XCircle className="w-3 h-3 text-rose-400" />
                      </div>
                      <div>
                        <span className="font-medium text-zinc-300">{row.authSaas.value}</span>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{row.authSaas.note}</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card-Based Matrix View */}
      <div className="md:hidden space-y-4">
        {comparisonRows.map((row, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950/90 shadow-lg space-y-3"
          >
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{row.category}</span>
              <h4 className="text-sm font-bold text-white">{row.feature}</h4>
            </div>

            {/* tc_auth winner badge */}
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/40 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-indigo-300">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                tc_auth v1.5.1 (Open Source)
              </div>
              <div className="text-xs font-semibold text-zinc-100 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>{row.tcAuth.value}</span>
              </div>
              <p className="text-[10px] text-indigo-300/80 font-mono pl-6">{row.tcAuth.note}</p>
            </div>

            {/* Alternatives comparison */}
            <div className="grid grid-cols-1 gap-2 pt-1">
              <div className="p-2.5 rounded-lg bg-zinc-900/70 border border-zinc-800/80 flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                <div className="text-[11px]">
                  <span className="text-zinc-400 font-medium">Custom Code: </span>
                  <span className="text-zinc-300">{row.customCode.value}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-900/70 border border-zinc-800/80 flex items-start gap-2">
                <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-[11px]">
                  <span className="text-zinc-400 font-medium">Auth SaaS: </span>
                  <span className="text-zinc-300">{row.authSaas.value}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
