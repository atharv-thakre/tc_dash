import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, Terminal, ShieldCheck, Server, Unlock, Zap, Check } from 'lucide-react';

export interface PillarItem {
  id: string;
  label: string;
  badge: string;
  icon: React.ElementType;
  description: string;
}

const DEFAULT_PILLARS: PillarItem[] = [
  {
    id: 'modular',
    label: 'Modular Architecture',
    badge: 'Pluggable',
    icon: Layers,
    description: 'Decomposed into clean auth.account, auth.otp, and auth.session modules.',
  },
  {
    id: 'pythonic',
    label: 'Pure Pythonic',
    badge: 'SQLAlchemy & FastAPI',
    icon: Terminal,
    description: 'Engineered natively with type hints, Pydantic schemas, and SQLAlchemy ORM.',
  },
  {
    id: 'stateful',
    label: 'Stateful JWT Sessions',
    badge: '< 1ms Revocation',
    icon: ShieldCheck,
    description: 'Instant device revocation backed by database session records without waiting for token expiry.',
  },
  {
    id: 'self-hosted',
    label: 'Self-Hosted & Private',
    badge: '100% On-Prem',
    icon: Server,
    description: 'Your user database stays entirely on your infrastructure with zero external telemetry.',
  },
  {
    id: 'zero-lockin',
    label: 'Zero Vendor Lock-in',
    badge: 'Open Source',
    icon: Unlock,
    description: 'No per-user licensing fees, proprietary cloud APIs, or quota limits.',
  },
];

interface FeaturePillsProps {
  pillars?: PillarItem[];
  autoRotateInterval?: number;
  className?: string;
}

export const FeaturePills: React.FC<FeaturePillsProps> = ({
  pillars = DEFAULT_PILLARS,
  autoRotateInterval = 3500,
  className = '',
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % pillars.length);
    }, autoRotateInterval);
    return () => clearInterval(timer);
  }, [pillars.length, autoRotateInterval, isHovered]);

  const activePillar = pillars[activeIndex];

  return (
    <div
      className={`flex flex-col items-center gap-3 w-full max-w-3xl mx-auto ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Crisp Pill Buttons Row */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-md shadow-lg shadow-black/40">
        {pillars.map((pillar, idx) => {
          const Icon = pillar.icon;
          const isActive = idx === activeIndex;

          return (
            <button
              key={pillar.id}
              onClick={() => setActiveIndex(idx)}
              className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer select-none ${
                isActive
                  ? 'text-white'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activePillBackground"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600/90 to-purple-600/90 shadow-md shadow-indigo-500/25 border border-indigo-400/30"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-200' : 'text-zinc-400'}`} />
                <span className="font-medium whitespace-nowrap">{pillar.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Detail Card for Active Pillar */}
      <div className="min-h-[36px] flex items-center justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePillar.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 text-xs text-zinc-300 text-center"
          >
            <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold text-indigo-300 bg-indigo-950/70 border border-indigo-800/80">
              {activePillar.badge}
            </span>
            <span className="text-zinc-400 font-normal">{activePillar.description}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
