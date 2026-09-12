import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  UserCheck,
  Sparkles,
  Github,
  ExternalLink,
  Code2,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface SidebarAuthorCardProps {
  role?: string;
  isSuperAdmin: boolean;
  isCollapsed?: boolean;
}

export const SidebarAuthorCard: React.FC<SidebarAuthorCardProps> = ({
  role = 'Superadmin',
  isSuperAdmin,
  isCollapsed = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-2 py-1">
        <motion.a
          href="https://github.com/atharv-thakre/tc_auth"
          target="_blank"
          rel="noreferrer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="tc_auth on GitHub"
          className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700/80 flex items-center justify-center text-slate-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-2xs transition-colors"
        >
          <Github className="w-4 h-4" />
        </motion.a>
      </div>
    );
  }

  return (
    <div className="w-full">
      <AnimatePresence initial={false} mode="wait">
        {!isExpanded ? (
          /* Compact Collapsed State (similar size and height to Sign Out button) */
          <motion.button
            key="collapsed-button"
            type="button"
            onClick={() => setIsExpanded(true)}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-between w-full px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-100/90 dark:bg-zinc-900/90 hover:bg-slate-200/70 dark:hover:bg-zinc-800/90 hover:border-indigo-500/40 text-slate-700 dark:text-zinc-200 transition-all shadow-2xs cursor-pointer group"
            title="Click to view author and role details"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-5 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/25 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400">
                {isSuperAdmin ? (
                  <ShieldCheck className="w-3.5 h-3.5" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5" />
                )}
              </div>
              <span className="truncate text-xs font-semibold text-slate-800 dark:text-zinc-200">
                {isSuperAdmin ? 'Superadmin' : (role || 'User Session')}
              </span>
              <Badge
                variant={isSuperAdmin ? 'purple' : 'neutral'}
                size="sm"
                className="font-mono font-bold text-[9px] px-1.5 py-0.2 shrink-0 hidden sm:inline-flex"
              >
                {isSuperAdmin ? 'ADMIN' : 'USER'}
              </Badge>
            </div>

            <div className="flex items-center gap-1 text-slate-400 dark:text-zinc-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0">
              <span className="text-[10px] font-sans opacity-70">Author</span>
              <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
            </div>
          </motion.button>
        ) : (
          /* Expanded Card View with full details */
          <motion.div
            key="expanded-card"
            initial={{ opacity: 0, height: 'auto', scale: 0.98 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="relative overflow-hidden rounded-2xl border border-indigo-500/30 dark:border-indigo-500/30 bg-slate-50/95 dark:bg-zinc-900/95 p-3.5 shadow-md backdrop-blur-md transition-all group"
          >
            {/* Ambient background light */}
            <div className="pointer-events-none absolute -top-12 -right-12 w-28 h-28 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-500" />

            {/* Clickable Header row to toggle collapse */}
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="w-full flex items-center justify-between gap-2 mb-2 relative z-10 text-left cursor-pointer group/header"
              title="Click to collapse"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/25 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400">
                  {isSuperAdmin ? (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  ) : (
                    <UserCheck className="w-3.5 h-3.5" />
                  )}
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 tracking-tight truncate">
                  {isSuperAdmin ? 'Superadmin Mode' : 'User Session'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Badge
                  variant={isSuperAdmin ? 'purple' : 'neutral'}
                  size="sm"
                  className="shrink-0 font-mono font-bold text-[9px] px-2 py-0.5"
                >
                  {isSuperAdmin ? 'SUPERADMIN' : 'USER'}
                </Badge>
                <div className="w-5 h-5 rounded-md flex items-center justify-center text-slate-400 dark:text-zinc-400 group-hover/header:text-indigo-500 group-hover/header:bg-indigo-500/10 transition-all">
                  <ChevronUp className="w-3.5 h-3.5" />
                </div>
              </div>
            </button>

            {/* Description */}
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed mb-3 relative z-10">
              {isSuperAdmin
                ? 'Full administrative control over tenant accounts, OAuth & tokens.'
                : 'Standard dashboard permissions.'}
            </p>

            {/* Author & Open Source Repositories */}
            <div className="pt-2.5 border-t border-slate-200 dark:border-zinc-800/80 relative z-10 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                  <span>Author</span>
                </span>
                <a
                  href="https://github.com/atharv-thakre"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-slate-800 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1 group/author"
                >
                  <span>Atharv Thakre</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-50 group-hover/author:opacity-100 group-hover/author:translate-x-0.5 transition-all" />
                </a>
              </div>

              {/* Interactive GitHub Chips */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <motion.a
                  href="https://github.com/atharv-thakre/tc_auth"
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800/90 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-zinc-700/70 hover:border-indigo-500/40 text-[10px] font-mono text-slate-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all shadow-2xs"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Code2 className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
                    <span className="truncate font-semibold">tc_auth</span>
                  </div>
                  <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-sans ml-1 shrink-0">Py ↗</span>
                </motion.a>

                <motion.a
                  href="https://github.com/atharv-thakre/tc_dash"
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800/90 hover:bg-violet-50 dark:hover:bg-violet-950/40 border border-slate-200 dark:border-zinc-700/70 hover:border-violet-500/40 text-[10px] font-mono text-slate-700 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-violet-300 transition-all shadow-2xs"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Layers className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400 shrink-0" />
                    <span className="truncate font-semibold">tc_dash</span>
                  </div>
                  <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-sans ml-1 shrink-0">UI ↗</span>
                </motion.a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
