import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  Database,
  ExternalLink,
  FileCode2,
  Filter,
  Info,
  Layers,
  Search,
  ShieldAlert,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import { DocItem, MethodSpec, LIBRARY_DOCS, API_DOCS } from '../data/docsData';
import { Badge } from '../components/common/Badge';
import { toast } from 'sonner';

interface DocsPageProps {
  section?: string;
  docId?: string;
  onNavigate?: (path: string) => void;
}

export const DocsPage: React.FC<DocsPageProps> = ({ section = 'lib', docId = 'setup', onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState<'lib' | 'api'>(section === 'api' ? 'api' : 'lib');
  const [activeDocId, setActiveDocId] = useState<string>(docId || (section === 'api' ? 'login-routes' : 'setup'));
  const [searchQuery, setSearchQuery] = useState('');
  const [methodSearch, setMethodSearch] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isMobileListOpen, setIsMobileListOpen] = useState(false);

  // Synchronize state if props change from sidebar navigation
  React.useEffect(() => {
    if (section === 'api') {
      setActiveCategory('api');
      if (docId) setActiveDocId(docId);
      else setActiveDocId('login-routes');
    } else {
      setActiveCategory('lib');
      if (docId) setActiveDocId(docId);
      else if (!activeDocId || activeDocId === 'api-overview' || activeDocId === 'login-routes') setActiveDocId('setup');
    }
  }, [section, docId]);

  const currentDocs = activeCategory === 'api' ? API_DOCS : LIBRARY_DOCS;

  const filteredDocs = currentDocs.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeDoc = currentDocs.find((d) => d.id === activeDocId) || currentDocs[0];

  const handleCopy = (text: string, label = 'Copied to clipboard') => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSelectDoc = (id: string, cat: 'lib' | 'api') => {
    setActiveCategory(cat);
    setActiveDocId(id);
    setMethodSearch('');
    setIsMobileListOpen(false);
    if (onNavigate) {
      onNavigate(`/docs/${cat}/${id}`);
    }
  };

  const filteredMethods = activeDoc?.methods?.filter((m) =>
    m.name.toLowerCase().includes(methodSearch.toLowerCase()) ||
    m.signature.toLowerCase().includes(methodSearch.toLowerCase()) ||
    m.description.toLowerCase().includes(methodSearch.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-7xl mx-auto pb-12"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </span>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Documentation & SDK Reference
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 pl-9 sm:pl-11">
            Complete technical specification and developer reference for <code className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">tc_auth</code> by <span className="font-semibold text-slate-700 dark:text-zinc-300">Atharv Thakre</span>.
          </p>
        </div>

        {/* Global Docs Search & GitHub Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/atharv-thakre/tc_auth"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-semibold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl transition-colors"
              title="View Python Source Code on GitHub"
            >
              <span>tc_auth</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
            <a
              href="https://github.com/atharv-thakre/tc_dash"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-semibold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl transition-colors"
              title="View UI Source Code on GitHub"
            >
              <span>tc_dash</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>
      </div>

      {/* Mobile Active Module Bar & Toggle */}
      <div className="lg:hidden p-3.5 bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 shadow-2xs">
        <div className="min-w-0 flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 shrink-0">Current:</span>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate">{activeDoc?.title}</span>
        </div>
        <button
          onClick={() => setIsMobileListOpen(!isMobileListOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 text-xs font-semibold shrink-0 cursor-pointer"
        >
          <span>{isMobileListOpen ? 'Hide Index' : 'Switch Module'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMobileListOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation Sidebar List */}
        <div className={`lg:col-span-4 xl:col-span-3 space-y-4 ${isMobileListOpen ? 'block' : 'hidden lg:block'}`}>
          {/* Category Switcher */}
          <div className="flex p-1 bg-slate-100 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-xl">
            <button
              onClick={() => handleSelectDoc('setup', 'lib')}
              className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeCategory === 'lib'
                  ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-300 shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Python Lib</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono">
                {LIBRARY_DOCS.length}
              </span>
            </button>
            <button
              onClick={() => handleSelectDoc('api-overview', 'api')}
              className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeCategory === 'api'
                  ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-300 shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>REST API</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-mono">
                Soon
              </span>
            </button>
          </div>

          {/* Module Docs List */}
          <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 p-2 space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto">
            {filteredDocs.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 dark:text-zinc-500">
                No documentation modules match your search.
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const isActive = activeDoc.id === doc.id;
                return (
                  <button
                    key={doc.id}
                    onClick={() => handleSelectDoc(doc.id, activeCategory)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all border group cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-zinc-900 border-indigo-200 dark:border-zinc-800 text-indigo-900 dark:text-indigo-200 font-medium shadow-2xs'
                        : 'border-transparent text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900/50 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold truncate">{doc.title}</span>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isActive ? 'text-indigo-500 translate-x-0.5' : 'text-slate-300 dark:text-zinc-600 group-hover:translate-x-0.5'}`} />
                    </div>
                    <div className="flex items-center justify-between gap-1.5">
                      <code className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800/80 text-slate-500 dark:text-zinc-400 truncate">
                        {doc.module}
                      </code>
                      {doc.methods && doc.methods.length > 0 && (
                        <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 shrink-0">
                          {doc.methods.length} {doc.methods.length === 1 ? 'fn' : 'fns'}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Content Details View Area */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {activeDoc ? (
            <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 space-y-8 shadow-2xs">
              {/* Module Main Header */}
              <div className="space-y-3 pb-6 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="indigo" className="font-mono text-xs px-2.5 py-1">
                    {activeDoc.module}
                  </Badge>
                  <span className="text-xs text-slate-400 dark:text-zinc-500 flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    {activeCategory === 'api' ? 'REST API Endpoint Specification' : 'Internal Python Library'}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {activeDoc.title}
                </h2>
                <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
                  {activeDoc.description}
                </p>

                {activeDoc.overview && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-sans">
                    {activeDoc.overview}
                  </div>
                )}
              </div>

              {/* Complete Implementation Example Code snippet */}
              {activeDoc.codeSnippet && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-indigo-500" />
                      Quick Implementation Example
                    </h3>
                    <button
                      onClick={() => handleCopy(activeDoc.codeSnippet!, 'Implementation code copied')}
                      className="px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-lg border border-slate-200 dark:border-zinc-800 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedText === activeDoc.codeSnippet ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Example</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-md">
                    <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/80 border-b border-zinc-800 text-[11px] text-zinc-400 font-mono">
                      <span>Python 3.10+</span>
                      <span>UTF-8</span>
                    </div>
                    <pre className="p-4 text-xs font-mono text-indigo-200 overflow-x-auto leading-relaxed whitespace-pre">
                      <code>{activeDoc.codeSnippet}</code>
                    </pre>
                  </div>
                </div>
              )}

              {/* Data Object Schemas (if available) */}
              {activeDoc.schemas && activeDoc.schemas.length > 0 && (
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-500" />
                    Data Schemas & Return Structures
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    {activeDoc.schemas.map((sch, sIdx) => (
                      <div
                        key={sIdx}
                        className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 overflow-hidden"
                      >
                        <div className="p-3.5 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900/80">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                              {sch.title}
                            </h4>
                            {sch.description && (
                              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                                {sch.description}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleCopy(sch.json, 'Schema JSON copied')}
                            className="px-2 py-1 text-[10px] font-mono text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            Copy JSON
                          </button>
                        </div>
                        <pre className="p-4 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-zinc-950 overflow-x-auto leading-relaxed">
                          <code>{sch.json}</code>
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Method Specifications Breakdown */}
              {activeDoc.methods && activeDoc.methods.length > 0 && (
                <div className="space-y-6 pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-zinc-800">
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-indigo-500" />
                        Method Specifications & API Reference
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Showing {filteredMethods?.length || 0} method{filteredMethods?.length !== 1 ? 's' : ''} for <code className="font-mono text-indigo-500">{activeDoc.module}</code>
                      </p>
                    </div>

                    {/* Method Filter Input */}
                    {activeDoc.methods.length > 2 && (
                      <div className="relative w-full sm:w-56">
                        <Filter className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                        <input
                          type="text"
                          placeholder="Filter methods..."
                          value={methodSearch}
                          onChange={(e) => setMethodSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-[11px] bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 font-mono"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    {filteredMethods?.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 dark:text-zinc-500 bg-slate-50 dark:bg-zinc-900/40 rounded-xl">
                        No methods match "{methodSearch}".
                      </div>
                    ) : (
                      filteredMethods?.map((method, mIdx) => (
                        <div
                          key={mIdx}
                          id={`method-${method.name}`}
                          className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-2xs space-y-4 p-5 transition-all hover:border-slate-300 dark:hover:border-zinc-700"
                        >
                          {/* Method Name & Signature Header */}
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                                  {method.name}
                                </span>
                                {(() => {
                                  const verb = method.name.split(' ')[0].toUpperCase();
                                  if (['GET', 'POST', 'PATCH', 'DELETE', 'PUT'].includes(verb)) {
                                    let badgeColor = 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
                                    if (verb === 'GET') badgeColor = 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
                                    if (verb === 'POST') badgeColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
                                    if (verb === 'PATCH') badgeColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
                                    if (verb === 'DELETE') badgeColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
                                    if (verb === 'PUT') badgeColor = 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
                                    return (
                                      <span className={`px-2 py-0.5 text-[10px] font-mono font-black rounded-md border ${badgeColor}`}>
                                        {verb}
                                      </span>
                                    );
                                  }
                                  return method.isAsync ? (
                                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                                      <Zap className="w-3 h-3" /> ASYNC
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                                      SYNC
                                    </span>
                                  );
                                })()}
                              </div>

                              <button
                                onClick={() => handleCopy(method.signature, 'Method signature copied')}
                                className="px-2 py-1 text-[10px] font-mono text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 rounded transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                                Copy Signature
                              </button>
                            </div>

                            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 overflow-x-auto">
                              <code className="text-xs font-mono text-indigo-300 whitespace-pre">
                                {method.signature}
                              </code>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed pt-1">
                              {method.description}
                            </p>
                          </div>

                          {/* Parameters Table */}
                          {method.parameters && method.parameters.length > 0 && (
                            <div className="space-y-2 pt-2">
                              <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                                Parameters
                              </span>
                              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-800">
                                <table className="w-full text-left text-xs border-collapse">
                                  <thead>
                                    <tr className="bg-slate-50 dark:bg-zinc-900/90 text-slate-500 dark:text-zinc-400 font-semibold border-b border-slate-200 dark:border-zinc-800">
                                      <th className="py-2 px-3 font-mono">Parameter</th>
                                      <th className="py-2 px-3 font-mono">Type</th>
                                      <th className="py-2 px-3 font-mono">Required / Default</th>
                                      <th className="py-2 px-3">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                                    {method.parameters.map((p, pIdx) => (
                                      <tr key={pIdx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/30">
                                        <td className="py-2 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                          {p.name}
                                        </td>
                                        <td className="py-2 px-3 font-mono text-slate-500 dark:text-zinc-400">
                                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-[10px]">
                                            {p.type}
                                          </span>
                                        </td>
                                        <td className="py-2 px-3 font-mono text-[11px]">
                                          {p.required ? (
                                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                                              Required
                                            </span>
                                          ) : (
                                            <span className="text-slate-400 dark:text-zinc-500 text-[11px]">
                                              {p.default ? `Default: ${p.default}` : 'Optional'}
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-2 px-3 text-slate-600 dark:text-zinc-300 leading-snug">
                                          {p.description}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {/* Return Value Card */}
                          {method.returns && (
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800">
                              <span className="p-1 rounded bg-indigo-500/10 text-indigo-500 shrink-0 mt-0.5">
                                <ArrowRight className="w-3.5 h-3.5" />
                              </span>
                              <div className="text-xs space-y-0.5">
                                <span className="font-bold text-slate-900 dark:text-white mr-2">
                                  Returns:
                                </span>
                                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold mr-2">
                                  {method.returns.type}
                                </span>
                                <span className="text-slate-600 dark:text-zinc-300">
                                  — {method.returns.description}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Exceptions List */}
                          {method.exceptions && method.exceptions.length > 0 && (
                            <div className="p-3 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5">
                              <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                                <ShieldAlert className="w-3.5 h-3.5" />
                                Potential Exceptions
                              </span>
                              <ul className="space-y-1 pl-5 list-disc text-amber-900 dark:text-amber-200/90">
                                {method.exceptions.map((exc, eIdx) => (
                                  <li key={eIdx} className="leading-relaxed font-mono text-[11px]">
                                    {exc}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Notes */}
                          {method.notes && (
                            <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-900/30 p-3 rounded-xl border border-slate-200/60 dark:border-zinc-800/60">
                              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                              <span>{method.notes}</span>
                            </div>
                          )}

                          {/* Method Example Code */}
                          {method.example && (
                            <div className="space-y-1.5">
                              <span className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
                                Example Call
                              </span>
                              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-3 overflow-x-auto">
                                <pre className="text-[11px] font-mono text-indigo-200 whitespace-pre">
                                  <code>{method.example}</code>
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800">
              Select a module from the left menu to view documentation.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
