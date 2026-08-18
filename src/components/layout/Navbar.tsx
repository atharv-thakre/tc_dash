import React, { useState } from 'react';
import { Check, Database, Globe, Key, LogOut, Menu, Server, Settings, ShieldCheck, User, X } from 'lucide-react';
import { useApiConfig } from '../../contexts/ApiConfigContext';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '../common/Badge';
import { UserAvatar } from '../common/UserAvatar';
import { ApiConfigModal } from '../common/ApiConfigModal';
import { TcAuthLogo } from '../common/TcAuthLogo';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
  activePath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar, activePath, onNavigate }) => {
  const { account, logout, isSuperAdmin } = useAuth();
  const { apiMode } = useApiConfig();
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-3 sm:px-4 md:px-6 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 transition-colors">
        {/* Left Side: Logo & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onToggleMobileSidebar}
            className="p-1.5 sm:p-2 -ml-0.5 text-zinc-400 hover:text-white rounded-lg md:hidden hover:bg-zinc-900 shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <TcAuthLogo
            size="md"
            version="v1.5.1"
            onClick={() => onNavigate('/dashboard')}
          />
        </div>

        {/* Right Side: Status Badge, Mode Switcher, Theme & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* API Server Config Trigger */}
          <button
            onClick={() => setIsConfigModalOpen(true)}
            className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all shadow-2xs cursor-pointer shrink-0 whitespace-nowrap ${
              apiMode === 'demo'
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
            }`}
            title="Configure Backend API Server Endpoint"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${apiMode === 'demo' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${apiMode === 'demo' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            </span>
            <span className="font-mono text-[11px] font-semibold hidden xs:inline">
              {apiMode === 'demo' ? 'Demo Mode' : 'Live Server'}
            </span>
            <span className="font-mono text-[11px] font-semibold xs:hidden">
              {apiMode === 'demo' ? 'Demo' : 'Live'}
            </span>
            <Settings className={`w-3.5 h-3.5 ml-0.5 shrink-0 ${apiMode === 'demo' ? 'text-amber-400/80' : 'text-emerald-400/80'}`} />
          </button>

          {/* User Profile Menu / Auth Buttons */}
          {account ? (
            <div className="relative shrink-0">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 sm:p-1.5 rounded-xl border border-zinc-800 hover:bg-zinc-900 transition-colors"
              >
                <UserAvatar src={account.avatar_url} name={account.name} size="sm" />
                <div className="text-left hidden lg:block pr-1">
                  <p className="text-xs font-semibold leading-none text-zinc-100">{account.name}</p>
                  <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{account.role}</p>
                </div>
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-zinc-800 mb-1">
                    <p className="text-xs font-bold text-zinc-100">{account.name}</p>
                    <p className="text-xs text-zinc-400 truncate">{account.email}</p>
                    <div className="mt-1.5">
                      <Badge variant={isSuperAdmin ? 'purple' : 'default'} icon={<ShieldCheck className="w-3 h-3" />}>
                        {account.role}
                      </Badge>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onNavigate('/profile');
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4 text-zinc-400" />
                    Account Settings
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('/login')}
                className="px-3.5 py-1.5 text-xs font-bold text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('/signup')}
                className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-2xs transition-colors"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Backend API Configuration Modal */}
      <ApiConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
      />
    </>
  );
};
