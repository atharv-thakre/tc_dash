import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  Database,
  Globe,
  Plus,
  Server,
  Trash2,
  BookmarkPlus,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Radio,
  X,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useApiConfig } from '../../contexts/ApiConfigContext';
import { Modal } from './Modal';
import { toast } from 'sonner';
import { configService } from '../../services/config';
import { getErrorMessage, getErrorDetails, ApiErrorDetails } from '../../services/apiClient';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({ isOpen, onClose }) => {
  const {
    apiMode,
    setApiMode,
    baseUrl,
    setBaseUrl,
    builtinPresets,
    customPresets,
    addPreset,
    removePreset,
  } = useApiConfig();

  const [inputUrl, setInputUrl] = useState(baseUrl);
  const [selectedMode, setSelectedMode] = useState(apiMode);
  const [isAddingPreset, setIsAddingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  // Interactive Live Ping / Pulse State
  const [isPinging, setIsPinging] = useState(false);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [pingResult, setPingResult] = useState<{
    latency: number;
    success: boolean;
    error?: string;
    details?: ApiErrorDetails;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setInputUrl(baseUrl);
      setSelectedMode(apiMode);
      setIsAddingPreset(false);
      setNewPresetName('');
      setPingResult(null);
    }
  }, [isOpen, baseUrl, apiMode]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setApiMode(selectedMode);
    const targetUrl = inputUrl.trim() || 'https://api.codesena.me/tc-auth';
    setBaseUrl(targetUrl);
    toast.success('API configuration updated successfully');
    onClose();
  };

  const handleCreateCustomPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) {
      toast.error('Please enter a valid URL first');
      return;
    }
    const name = newPresetName.trim() || inputUrl.trim().replace(/^https?:\/\//, '');
    addPreset(name, inputUrl.trim());
    toast.success(`Saved preset "${name}"`);
    setIsAddingPreset(false);
    setNewPresetName('');
  };

  const handleSelectPreset = (url: string) => {
    setInputUrl(url);
    setSelectedMode('live');
    setPingResult(null);
  };

  const handleDeletePreset = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removePreset(id);
    toast.success(`Removed preset "${name}"`);
  };

  const handleTestPulse = async () => {
    if (!inputUrl.trim()) {
      toast.error('Please enter a server URL to test');
      return;
    }
    setIsPinging(true);
    setPingResult(null);
    setShowErrorDetails(false);
    const start = performance.now();
    try {
      await configService.testPulse(inputUrl.trim());
      const elapsed = Math.round(performance.now() - start);
      setPingResult({
        latency: Math.max(10, elapsed),
        success: true,
      });
      toast.success(`Server reachable (${elapsed}ms)`);
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - start);
      const simpleMsg = getErrorMessage(err, 'Server unreachable');
      const details = getErrorDetails(err, inputUrl.trim());
      setPingResult({
        latency: elapsed,
        success: false,
        error: simpleMsg,
        details,
      });
      toast.error(simpleMsg);
    } finally {
      setIsPinging(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <div className="space-y-5">
        {/* Modal Header */}
        <div className="flex items-start gap-3.5 pr-8 pb-4 border-b border-zinc-800/80">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0 mt-0.5">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Backend Server Configuration
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
              Switch between offline mock demo mode and your live FastAPI authentication backend.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Section 1: Mode Selection */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Execution Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Demo Card */}
              <button
                type="button"
                onClick={() => {
                  setSelectedMode('demo');
                  setPingResult(null);
                }}
                className={`relative flex flex-col p-3.5 rounded-xl border text-left transition-all cursor-pointer select-none ${
                  selectedMode === 'demo'
                    ? 'border-amber-500/80 bg-amber-500/10 ring-1 ring-amber-500/40 text-white'
                    : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-lg ${
                        selectedMode === 'demo'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      <Database className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs text-zinc-100">Demo Mock Mode</span>
                  </div>
                  {selectedMode === 'demo' && (
                    <span className="p-0.5 rounded-full bg-amber-500 text-zinc-950">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  In-memory simulation with realistic tokens and instant response times.
                </p>
              </button>

              {/* Live Card */}
              <button
                type="button"
                onClick={() => setSelectedMode('live')}
                className={`relative flex flex-col p-3.5 rounded-xl border text-left transition-all cursor-pointer select-none ${
                  selectedMode === 'live'
                    ? 'border-indigo-500/80 bg-indigo-500/10 ring-1 ring-indigo-500/40 text-white'
                    : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-lg ${
                        selectedMode === 'live'
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      <Globe className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs text-zinc-100">Live Backend</span>
                  </div>
                  {selectedMode === 'live' && (
                    <span className="p-0.5 rounded-full bg-indigo-500 text-white">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  Real HTTP REST requests connecting directly to your FastAPI backend.
                </p>
              </button>
            </div>
          </div>

          {/* Section 2: Base URL & Ping */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Backend Server URL
              </label>
              <button
                type="button"
                onClick={() => setIsAddingPreset(!isAddingPreset)}
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>{isAddingPreset ? 'Cancel' : '+ Save as Preset'}</span>
              </button>
            </div>

            <div className="relative">
              <div className="absolute left-3.5 top-3 text-zinc-500 pointer-events-none">
                <Globe className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  setPingResult(null);
                }}
                placeholder="https://api.codesena.me/tc-auth or /tc-auth"
                className="w-full pl-10 pr-24 py-2.5 text-xs sm:text-sm bg-zinc-900/90 border border-zinc-750 rounded-xl font-mono text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50"
              />
              <div className="absolute right-1.5 top-1.5">
                <button
                  type="button"
                  onClick={handleTestPulse}
                  disabled={isPinging}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all border border-zinc-700/60"
                >
                  <Zap className={`w-3.5 h-3.5 ${isPinging ? 'text-amber-400 animate-spin' : 'text-indigo-400'}`} />
                  <span>{isPinging ? 'Testing...' : 'Test Ping'}</span>
                </button>
              </div>
            </div>

            {/* Inline Ping Result Banner */}
            <AnimatePresence>
              {pingResult && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className={`rounded-xl border text-xs overflow-hidden ${
                    pingResult.success
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  }`}
                >
                  <div className="px-3 py-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {pingResult.success ? (
                        <>
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="font-semibold truncate">Server Online (Pulse OK)</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span className="font-semibold truncate">{pingResult.error || 'Server Unreachable'}</span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-black/40 text-zinc-300">
                        {pingResult.latency}ms
                      </span>
                      {!pingResult.success && pingResult.details && (
                        <button
                          type="button"
                          onClick={() => setShowErrorDetails(!showErrorDetails)}
                          className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-md border border-rose-500/30 transition-colors cursor-pointer"
                          title="View Technical Details"
                        >
                          <Info className="w-3 h-3" />
                          <span>{showErrorDetails ? 'Hide' : 'Details'}</span>
                          {showErrorDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Technical Details */}
                  {showErrorDetails && pingResult.details && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-3 py-2.5 border-t border-rose-800/40 bg-zinc-950/60 font-mono text-[10px] space-y-2 text-zinc-300"
                    >
                      <div className="flex justify-between items-center text-zinc-400">
                        <span className="font-sans font-semibold">Tested URL:</span>
                        <span className="text-zinc-200 truncate max-w-[220px]">{pingResult.details.url}</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-400">
                        <span className="font-sans font-semibold">Error Status:</span>
                        <span className="text-rose-400">{pingResult.details.code || 'ERR_CONNECTION'}</span>
                      </div>
                      {pingResult.details.suggestions.length > 0 && (
                        <div className="pt-1.5 border-t border-zinc-800/80 font-sans">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Troubleshooting Tips:</p>
                          <ul className="list-disc list-inside space-y-0.5 text-zinc-300 text-[11px]">
                            {pingResult.details.suggestions.map((s, idx) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Save Preset Inline Drawer */}
            <AnimatePresence>
              {isAddingPreset && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 rounded-xl bg-zinc-950 border border-indigo-500/40 space-y-2 mt-1">
                    <div className="text-[11px] font-semibold text-indigo-300 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" />
                        Save Current URL as Local Preset
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAddingPreset(false)}
                        className="text-zinc-500 hover:text-zinc-300"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newPresetName}
                        onChange={(e) => setNewPresetName(e.target.value)}
                        placeholder="Preset label (e.g. Staging Server)"
                        className="flex-1 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-hidden focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={handleCreateCustomPreset}
                        className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section 3: Presets List */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span className="font-bold uppercase tracking-wider">Quick Presets</span>
              <span className="text-[10px] text-zinc-500 font-mono">Stored Locally</span>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {/* Builtin Presets */}
              {builtinPresets.map((preset) => {
                const isSelected = inputUrl === preset.url;
                const isDefault = preset.id === 'codesena-live';
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.url)}
                    className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-indigo-950/90 border-indigo-500 text-indigo-200 font-bold ring-1 ring-indigo-500/50'
                        : isDefault
                        ? 'bg-zinc-900 hover:bg-zinc-850 border-indigo-500/40 text-indigo-300'
                        : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <Radio className={`w-3 h-3 ${isSelected ? 'text-indigo-400' : 'text-zinc-600'}`} />
                    <span>{preset.url}</span>
                    {isDefault && (
                      <span className="px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[9px] uppercase font-bold tracking-wider">
                        Default
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Custom Presets */}
              {customPresets.map((preset) => {
                const isSelected = inputUrl === preset.url;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.url)}
                    className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-indigo-950/90 border-indigo-500 text-indigo-200 font-bold ring-1 ring-indigo-500/50'
                        : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <span className="text-zinc-400 group-hover:text-zinc-200 font-sans font-medium text-[11px]">
                      {preset.name}:
                    </span>
                    <span className="truncate max-w-[150px]">{preset.url}</span>
                    <button
                      type="button"
                      onClick={(e) => handleDeletePreset(preset.id, preset.name, e)}
                      title="Delete custom preset"
                      className="p-0.5 ml-1 text-zinc-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 mt-2 flex items-center justify-between border-t border-zinc-800/80">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span
                className={`w-2 h-2 rounded-full ${
                  selectedMode === 'demo' ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
                }`}
              />
              <span>
                Target: <span className="font-semibold text-zinc-200 capitalize">{selectedMode}</span>
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
              >
                Apply Configuration
              </button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};
