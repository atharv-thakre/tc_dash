import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading authentication data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] w-full p-8">
      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 animate-pulse">{message}</p>
    </div>
  );
};
