import React, { useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileCode2,
  Globe,
  KeyRound,
  LayoutDashboard,
  Link,
  LogOut,
  ShieldCheck,
  Sliders,
  Sparkles,
  Terminal,
  User,
  Users,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { Badge } from '../common/Badge';
import { SidebarAuthorCard } from './SidebarAuthorCard';
import { LIBRARY_DOCS, API_DOCS } from '../../data/docsData';

interface SidebarProps {
  activePath: string;
  onNavigate: (path: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePath,
  onNavigate,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { account, logout, isSuperAdmin } = useAuth();

  // Collapsible Documentation States
  const [isDocsOpen, setIsDocsOpen] = useState(true);
  const [isLibOpen, setIsLibOpen] = useState(true);
  const [isApiOpen, setIsApiOpen] = useState(false);

  const navItems = [
    { label: 'Landing Page', path: '/', icon: Globe, requiresSuperAdmin: false },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, requiresSuperAdmin: false },
    { label: 'Accounts', path: '/accounts', icon: Users, requiresSuperAdmin: true },
    { label: 'OAuth Links', path: '/oauth-links', icon: Link, requiresSuperAdmin: true },
    { label: 'Active Sessions', path: '/sessions', icon: ShieldCheck, requiresSuperAdmin: true },
    { label: 'OTP Records', path: '/otp', icon: KeyRound, requiresSuperAdmin: true },
    { label: 'System Config', path: '/config', icon: Sliders, requiresSuperAdmin: true },
  ];

  const handleNavClick = (path: string) => {
    onNavigate(path);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          'fixed md:static inset-y-0 left-0 z-40 flex flex-col w-64 bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 transition-transform duration-200 ease-in-out md:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col flex-1 p-4 overflow-y-auto space-y-6">
          {/* Main Management Section */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-2">
              Management
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePath === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={cn(
                    'flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-semibold transition-all group border border-transparent cursor-pointer',
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 dark:bg-zinc-900 dark:text-white dark:border-zinc-800'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900/60 hover:text-slate-900 dark:hover:text-zinc-100'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn('w-4 h-4 transition-transform group-hover:scale-110', isActive ? 'text-white' : 'text-slate-400 dark:text-zinc-500')} />
                    <span>{item.label}</span>
                  </div>
                  {item.requiresSuperAdmin && (
                    <span className={cn('text-[10px] font-mono px-1.5 py-0.2 rounded-md', isActive ? 'bg-indigo-500/20 text-indigo-300 dark:bg-zinc-800 dark:text-zinc-400' : 'bg-slate-100 dark:bg-zinc-900 text-slate-400 dark:text-zinc-500')}>
                      admin
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Expandable/Collapsible Documentation Section */}
          <div className="space-y-1">
            <button
              onClick={() => setIsDocsOpen(!isDocsOpen)}
              className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span>Documentation</span>
              </div>
              {isDocsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {isDocsOpen && (
              <div className="pl-1 pt-1 space-y-1">
                {/* Expandable API Docs Group */}
                <div className="space-y-0.5">
                  <button
                    onClick={() => {
                      setIsApiOpen(!isApiOpen);
                      if (!activePath.startsWith('/docs/api')) {
                        handleNavClick(`/docs/api/${API_DOCS[0].id}`);
                      }
                    }}
                    className={cn(
                      'flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border border-transparent cursor-pointer',
                      activePath.startsWith('/docs/api')
                        ? 'bg-indigo-50 dark:bg-zinc-900 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-zinc-800 font-bold'
                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900/60 hover:text-slate-900 dark:hover:text-zinc-100'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-indigo-500" />
                      <span>REST API (api)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-indigo-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-300 font-bold">
                        {API_DOCS.length}
                      </span>
                      {isApiOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </div>
                  </button>

                  {isApiOpen && (
                    <div className="pl-4 space-y-0.5 border-l border-slate-200 dark:border-zinc-800 ml-3 py-1">
                      {API_DOCS.map((doc) => {
                        const targetPath = `/docs/api/${doc.id}`;
                        const isActive = activePath === targetPath;
                        return (
                          <button
                            key={doc.id}
                            onClick={() => handleNavClick(targetPath)}
                            className={cn(
                              'block w-full text-left px-2 py-1 text-[11px] rounded-md transition-all font-mono truncate cursor-pointer',
                              isActive
                                ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-zinc-900'
                                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                            )}
                          >
                            • {doc.title}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Expandable Library Usage Docs (lib) */}
                <div className="space-y-0.5">
                  <button
                    onClick={() => setIsLibOpen(!isLibOpen)}
                    className={cn(
                      'flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border border-transparent cursor-pointer',
                      activePath.startsWith('/docs/lib') || activePath === '/docs'
                        ? 'bg-indigo-50 dark:bg-zinc-900 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-zinc-800 font-bold'
                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900/60 hover:text-slate-900 dark:hover:text-zinc-100'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <FileCode2 className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Library Usage (lib)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        {LIBRARY_DOCS.length}
                      </span>
                      {isLibOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </div>
                  </button>

                  {isLibOpen && (
                    <div className="pl-3 space-y-0.5 border-l border-slate-200 dark:border-zinc-800 ml-3 py-1 max-h-64 overflow-y-auto">
                      {LIBRARY_DOCS.map((doc) => {
                        const targetPath = `/docs/lib/${doc.id}`;
                        const isDocActive = activePath === targetPath || (activePath === '/docs' && doc.id === 'setup');
                        return (
                          <button
                            key={doc.id}
                            onClick={() => handleNavClick(targetPath)}
                            className={cn(
                              'block w-full text-left px-2 py-1 text-[11px] rounded-md transition-all truncate cursor-pointer',
                              isDocActive
                                ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-zinc-900/80'
                                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-900/40'
                            )}
                          >
                            {doc.title}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Personal Account Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-2">
              Personal Account
            </p>
            <button
              onClick={() => handleNavClick('/profile')}
              className={cn(
                'flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-semibold transition-all group border border-transparent cursor-pointer',
                activePath === '/profile'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 dark:bg-zinc-900 dark:text-white dark:border-zinc-800'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900/60 hover:text-slate-900 dark:hover:text-zinc-100'
              )}
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                <span>My Profile</span>
              </div>
            </button>
          </div>

          {/* Interactive Role & Author Card */}
          <div className="mt-auto pt-2 space-y-3">
            <SidebarAuthorCard isSuperAdmin={isSuperAdmin} />

            {account && (
              <button
                onClick={() => logout()}
                className="flex items-center justify-center gap-2 w-full px-3 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all shadow-2xs cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
