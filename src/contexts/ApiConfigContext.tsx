import React, { createContext, useContext, useState } from 'react';
import {
  ApiMode,
  BUILTIN_PRESETS,
  deleteCustomPreset,
  getCustomBaseUrl,
  getCustomPresets,
  getStoredApiMode,
  saveCustomPreset,
  ServerPreset,
  setCustomBaseUrl as saveCustomBaseUrl,
  setStoredApiMode,
} from '../services/apiClient';

interface ApiConfigContextType {
  apiMode: ApiMode;
  setApiMode: (mode: ApiMode) => void;
  baseUrl: string;
  setBaseUrl: (url: string) => void;
  builtinPresets: ServerPreset[];
  customPresets: ServerPreset[];
  allPresets: ServerPreset[];
  addPreset: (name: string, url: string) => ServerPreset;
  removePreset: (id: string) => void;
}

const ApiConfigContext = createContext<ApiConfigContextType | undefined>(undefined);

export const ApiConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiMode, setApiModeState] = useState<ApiMode>(getStoredApiMode);
  const [baseUrl, setBaseUrlState] = useState<string>(getCustomBaseUrl);
  const [customPresets, setCustomPresets] = useState<ServerPreset[]>(getCustomPresets);

  const setApiMode = (mode: ApiMode) => {
    setStoredApiMode(mode);
    setApiModeState(mode);
  };

  const setBaseUrl = (url: string) => {
    saveCustomBaseUrl(url);
    setBaseUrlState(url);
  };

  const addPreset = (name: string, url: string): ServerPreset => {
    const created = saveCustomPreset(name, url);
    setCustomPresets(getCustomPresets());
    return created;
  };

  const removePreset = (id: string) => {
    deleteCustomPreset(id);
    setCustomPresets(getCustomPresets());
  };

  const allPresets = [...BUILTIN_PRESETS, ...customPresets];

  return (
    <ApiConfigContext.Provider
      value={{
        apiMode,
        setApiMode,
        baseUrl,
        setBaseUrl,
        builtinPresets: BUILTIN_PRESETS,
        customPresets,
        allPresets,
        addPreset,
        removePreset,
      }}
    >
      {children}
    </ApiConfigContext.Provider>
  );
};

export function useApiConfig() {
  const ctx = useContext(ApiConfigContext);
  if (!ctx) throw new Error('useApiConfig must be used within ApiConfigProvider');
  return ctx;
}

