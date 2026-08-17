import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingState } from './LoadingState';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireSuperAdmin = false }) => {
  const { account, isLoading, isSuperAdmin } = useAuth();

  if (isLoading) {
    return <LoadingState message="Authenticating session..." />;
  }

  if (!account) {
    // If not logged in, render redirect / login trigger handled by parent App router or page switch
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="p-4 rounded-full bg-indigo-500/10 text-indigo-500 mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Authentication Required</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm">
          Please log in to access the tc-auth administration dashboard.
        </p>
      </div>
    );
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="p-4 rounded-full bg-amber-500/10 text-amber-500 mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Access Restricted</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md">
          This administration section requires the <code className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-xs">superadmin</code> role. Your current role is <code className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 font-mono text-xs">{account.role}</code>.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
