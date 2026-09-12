import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileCode,
  FileText,
  Filter,
  Folder,
  FolderOpen,
  FolderTree,
  Globe,
  HardDrive,
  Layers,
  ListTree,
  Loader2,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Search,
  Sparkles,
  Terminal,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { DocumentNode, DocumentContent, TreeStats, DocumentSearchMatch } from '../types/documents';
import { FileTreeNode } from '../components/documents/FileTreeNode';
import { MarkdownViewer } from '../components/documents/MarkdownViewer';
import { CodeViewer } from '../components/documents/CodeViewer';
import { DirectoryGrid } from '../components/documents/DirectoryGrid';

interface DocumentsExplorerPageProps {
  initialPath?: string;
  onNavigate?: (path: string) => void;
}

export const DocumentsExplorerPage: React.FC<DocumentsExplorerPageProps> = ({
  initialPath,
  onNavigate,
}) => {
  const [tree, setTree] = useState<DocumentNode[]>([]);
  const [stats, setStats] = useState<TreeStats | null>(null);
  const [loadingTree, setLoadingTree] = useState<boolean>(true);

  // Initialize initial file / directory state
  const initialResolved = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const queryFile = params.get('file');
    const queryDir = params.get('dir');

    if (queryFile) return { file: queryFile, dir: null };
    if (queryDir) return { file: null, dir: queryDir };

    if (initialPath) {
      const clean = initialPath.replace(/^\/documents\/?/, '').replace(/^documents\/?/, '').trim();
      if (clean) {
        if (clean.endsWith('.md') || clean.endsWith('.txt') || clean.endsWith('.py') || clean.endsWith('.json')) {
          return { file: clean, dir: null };
        } else {
          return { file: null, dir: clean };
        }
      }
    }
    // Default to root README.md
    return { file: 'README.md', dir: null };
  }, [initialPath]);

  const [activeFilePath, setActiveFilePath] = useState<string | null>(initialResolved.file);
  const [activeDirectoryPath, setActiveDirectoryPath] = useState<string | null>(initialResolved.dir);
  const [currentDocument, setCurrentDocument] = useState<DocumentContent | null>(null);
  const [loadingDoc, setLoadingDoc] = useState<boolean>(false);
  const [docError, setDocError] = useState<string | null>(null);

  // Search & Filter state
  const [treeSearch, setTreeSearch] = useState<string>('');
  const [activeLanguageFilter, setActiveLanguageFilter] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [expandAll, setExpandAll] = useState<boolean>(false);

  // Full-Text Search state
  const [fullTextQuery, setFullTextQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<DocumentSearchMatch[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);

  // Fetch File Tree
  const fetchTree = async () => {
    setLoadingTree(true);
    try {
      const res = await fetch('/api/documents/tree');
      if (!res.ok) throw new Error(`Failed to load file tree: ${res.statusText}`);
      const data = await res.json();
      setTree(data.tree || []);
      setStats(data.stats || null);
    } catch (err: any) {
      console.error('Failed to load documents tree', err);
      toast.error('Failed to load file tree');
    } finally {
      setLoadingTree(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

  // Fetch File Content whenever activeFilePath changes
  useEffect(() => {
    if (!activeFilePath) {
      setCurrentDocument(null);
      return;
    }

    // Guard against directory paths being fetched as files
    if (activeFilePath === 'documents' || activeFilePath === '/documents' || activeFilePath === '') {
      setActiveFilePath(null);
      setActiveDirectoryPath('');
      return;
    }

    const fetchFileContent = async () => {
      setLoadingDoc(true);
      setDocError(null);
      try {
        const res = await fetch(`/api/documents/file?path=${encodeURIComponent(activeFilePath)}`);
        if (!res.ok) {
          throw new Error(`File not found: ${activeFilePath}`);
        }
        const data: DocumentContent = await res.json();
        setCurrentDocument(data);
      } catch (err: any) {
        console.error('Failed to load file content', err);
        setDocError(err?.message || 'Failed to load file');
        setCurrentDocument(null);
      } finally {
        setLoadingDoc(false);
      }
    };

    fetchFileContent();

    // Sync URL query parameter
    const url = new URL(window.location.href);
    url.searchParams.delete('dir');
    url.searchParams.set('file', activeFilePath);
    window.history.replaceState({}, '', url.toString());
  }, [activeFilePath]);

  // Full-Text Search Handler
  const handleFullTextSearch = async (q: string) => {
    setFullTextQuery(q);
    if (!q || q.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);
    try {
      const res = await fetch(`/api/documents/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectFile = (filePath: string) => {
    setActiveFilePath(filePath);
    setActiveDirectoryPath(null);
    setShowSearchResults(false);
    setIsMobileSidebarOpen(false);
  };

  const handleSelectDirectory = (dirPath: string) => {
    setActiveDirectoryPath(dirPath);
    setActiveFilePath(null);
    setCurrentDocument(null);
    setShowSearchResults(false);
    setIsMobileSidebarOpen(false);

    // Sync URL
    const url = new URL(window.location.href);
    url.searchParams.delete('file');
    if (dirPath) {
      url.searchParams.set('dir', dirPath);
    } else {
      url.searchParams.delete('dir');
    }
    window.history.replaceState({}, '', url.toString());
  };

  // Find Directory Nodes for current directory view
  const currentDirectoryItems = useMemo<DocumentNode[]>(() => {
    if (!activeDirectoryPath) return tree;

    const findNode = (nodes: DocumentNode[], targetPath: string): DocumentNode | null => {
      for (const node of nodes) {
        if (node.path === targetPath) return node;
        if (node.children) {
          const found = findNode(node.children, targetPath);
          if (found) return found;
        }
      }
      return null;
    };

    const targetNode = findNode(tree, activeDirectoryPath);
    return targetNode?.children || [];
  }, [tree, activeDirectoryPath]);

  // Breadcrumbs calculation (avoids duplicated 'documents > documents')
  const breadcrumbSegments = useMemo(() => {
    const current = activeFilePath || activeDirectoryPath || '';
    if (!current) return [];
    return current
      .replace(/^\/documents\/?/, '')
      .replace(/^documents\/?/, '')
      .split('/')
      .filter((s) => s && s !== 'documents');
  }, [activeFilePath, activeDirectoryPath]);

  return (
    <div className="flex flex-col h-full min-h-0 w-full overflow-hidden">
      {/* Top Bar: Title, Search, Stats, Quick Actions */}
      <div className="bg-white dark:bg-zinc-950 p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-2xs mb-2.5 shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Branding & Stats */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden p-1.5 bg-slate-100 dark:bg-zinc-900 rounded-lg text-slate-700 dark:text-zinc-300 cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-500/20 shrink-0">
              <FolderTree className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100">
                  Visual File Explorer
                </h1>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold">
                  /documents
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 hidden sm:block">
                Filesystem explorer & documentation viewer backed by static mount
              </p>
            </div>
          </div>

          {/* Center: Global Document Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={fullTextQuery}
              onChange={(e) => handleFullTextSearch(e.target.value)}
              placeholder="Search in all documents and code files..."
              className="w-full pl-8 pr-8 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {fullTextQuery && (
              <button
                onClick={() => {
                  setFullTextQuery('');
                  setSearchResults([]);
                  setShowSearchResults(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Live Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xl max-h-80 overflow-y-auto p-2">
                <div className="flex items-center justify-between px-2.5 py-1 border-b border-slate-100 dark:border-zinc-900 text-[11px] text-slate-400">
                  <span>
                    {isSearching ? 'Searching...' : `${searchResults.length} results found for "${fullTextQuery}"`}
                  </span>
                  <button
                    onClick={() => setShowSearchResults(false)}
                    className="text-xs hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer font-medium"
                  >
                    Close
                  </button>
                </div>
                {searchResults.length === 0 && !isSearching ? (
                  <div className="p-3 text-center text-xs text-slate-400">
                    No documents matching "{fullTextQuery}"
                  </div>
                ) : (
                  <div className="space-y-1 py-1">
                    {searchResults.map((result) => (
                      <button
                        key={result.path}
                        onClick={() => handleSelectFile(result.path)}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-zinc-800 cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">
                            {result.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400">
                            {result.path}
                          </span>
                        </div>
                        {result.snippets && result.snippets.length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            {result.snippets.slice(0, 2).map((snip, sIdx) => (
                              <p
                                key={sIdx}
                                className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono truncate pl-2 border-l border-indigo-400/40"
                              >
                                <span className="text-slate-400 mr-1.5">L{snip.line}:</span>
                                {snip.text}
                              </p>
                            ))}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={fetchTree}
              disabled={loadingTree}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-lg transition-colors cursor-pointer"
              title="Refresh file tree"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingTree ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <a
              href="/documents"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/80 rounded-lg transition-colors cursor-pointer"
              title="Open raw static directory mount in new tab"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Static Root</span>
            </a>
          </div>
        </div>

        {/* Quick Filter Language Chips */}
        {stats && (
          <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-slate-100 dark:border-zinc-900 overflow-x-auto text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 shrink-0">
              Filter:
            </span>
            <button
              onClick={() => {
                setActiveLanguageFilter(null);
              }}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer shrink-0 ${
                activeLanguageFilter === null
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold'
                  : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800'
              }`}
            >
              All Files ({stats.totalFiles})
            </button>
            {Object.entries(stats.languages).map(([lang, count]) => (
              <button
                key={lang}
                onClick={() => {
                  const nextFilter = activeLanguageFilter === lang ? null : lang;
                  setActiveLanguageFilter(nextFilter);
                  if (nextFilter && currentDocument && currentDocument.language !== nextFilter) {
                    setActiveFilePath(null);
                    setCurrentDocument(null);
                  }
                }}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer shrink-0 capitalize ${
                  activeLanguageFilter === lang
                    ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                    : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800'
                }`}
              >
                {lang} ({count})
              </button>
            ))}
            <span className="ml-auto text-[11px] font-mono text-slate-400 dark:text-zinc-500 hidden md:inline shrink-0">
              Total Size: {stats.totalBytesFormatted}
            </span>
          </div>
        )}
      </div>

      {/* Main Body: Split Sidebar File Tree + Content Viewer */}
      <div className="flex-1 min-h-0 flex gap-3 overflow-hidden relative">
        {/* Left Sidebar: File Tree Explorer */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-2xs flex flex-col overflow-hidden transition-all duration-300 ease-in-out shrink-0 min-h-0 ${
            isMobileSidebarOpen
              ? 'translate-x-0 inset-y-3 left-3 z-50 shadow-2xl w-64 sm:w-72'
              : isSidebarCollapsed
              ? '-translate-x-full lg:translate-x-0 lg:w-0 lg:p-0 lg:border-0 lg:opacity-0 pointer-events-none'
              : '-translate-x-full lg:translate-x-0 w-64 sm:w-72 lg:opacity-100'
          }`}
        >
          {/* Tree Header / Actions */}
          <div className="p-2.5 border-b border-slate-100 dark:border-zinc-900 space-y-2 shrink-0">
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleSelectDirectory('')}
                className="flex items-center gap-2 text-left cursor-pointer group"
                title="View Root Directory"
              >
                <Folder className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200 group-hover:text-indigo-600 font-mono">
                  documents/
                </span>
              </button>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setExpandAll(!expandAll)}
                  className="px-2 py-0.5 text-[10px] font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100 bg-slate-100 dark:bg-zinc-900 rounded-md cursor-pointer"
                >
                  {expandAll ? 'Collapse' : 'Expand'}
                </button>
                <button
                  onClick={() => handleSelectDirectory('')}
                  className="px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 rounded-md cursor-pointer"
                  title="View Root Directory Grid"
                >
                  Root View
                </button>
                <button
                  onClick={() => setIsSidebarCollapsed(true)}
                  className="hidden lg:flex p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-md cursor-pointer transition-colors"
                  title="Slide file tree away for full-width doc reading"
                >
                  <PanelLeftClose className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="lg:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tree Filter Input */}
            <div className="relative">
              <input
                type="text"
                value={treeSearch}
                onChange={(e) => setTreeSearch(e.target.value)}
                placeholder="Filter files in tree..."
                className="w-full pl-7 pr-3 py-1 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-800 dark:text-zinc-200 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
              />
              <Filter className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
              {treeSearch && (
                <button
                  onClick={() => setTreeSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Tree Node List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5 min-h-0">
            {loadingTree ? (
              <div className="flex flex-col items-center justify-center p-8 space-y-2 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                <span className="text-xs">Scanning directory...</span>
              </div>
            ) : tree.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No documents found in `/documents`
              </div>
            ) : (
              tree.map((node) => (
                <FileTreeNode
                  key={node.path}
                  node={node}
                  activeFilePath={activeFilePath}
                  onSelectFile={handleSelectFile}
                  onSelectDirectory={handleSelectDirectory}
                  filterLanguage={activeLanguageFilter}
                  searchFilter={treeSearch}
                  isInitiallyExpanded={expandAll}
                />
              ))
            )}
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {isMobileSidebarOpen && (
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* Right Content Area */}
        <main className="flex-1 min-w-0 h-full min-h-0 flex flex-col overflow-hidden">
          {/* Breadcrumbs Bar */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 mb-2 bg-white dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400 overflow-x-auto shrink-0 shadow-2xs">
            {isSidebarCollapsed && (
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs cursor-pointer mr-1 transition-colors border border-indigo-200/80 dark:border-indigo-800/80 shadow-2xs shrink-0 animate-in fade-in"
                title="Slide file tree back open"
              >
                <PanelLeftOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span>Files</span>
              </button>
            )}

            <button
              onClick={() => handleSelectDirectory('')}
              className={`flex items-center gap-1 font-semibold cursor-pointer transition-colors ${
                breadcrumbSegments.length === 0
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'hover:text-indigo-600 text-slate-700 dark:text-zinc-300'
              }`}
            >
              <Folder className="w-3.5 h-3.5 text-amber-500" />
              <span>documents</span>
            </button>

            {breadcrumbSegments.map((seg, idx) => {
              const isLast = idx === breadcrumbSegments.length - 1;
              const segPath = breadcrumbSegments.slice(0, idx + 1).join('/');

              return (
                <React.Fragment key={segPath}>
                  <ChevronRight className="w-3 h-3 text-slate-300 dark:text-zinc-700 shrink-0" />
                  <button
                    onClick={() => {
                      if (isLast && activeFilePath) return;
                      handleSelectDirectory(segPath);
                    }}
                    className={`truncate cursor-pointer ${
                      isLast
                        ? 'font-bold text-slate-900 dark:text-zinc-100 font-mono'
                        : 'hover:text-indigo-600 text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    {seg}
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          {/* Main Viewer Render Container */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            {loadingDoc ? (
              <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p className="text-xs text-slate-500">Loading document content...</p>
              </div>
            ) : docError ? (
              <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-zinc-950 rounded-xl border border-rose-200 dark:border-rose-900/40 p-8 text-center space-y-3">
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-xl">
                  <X className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                  Unable to load document
                </h3>
                <p className="text-xs text-slate-500 max-w-md">{docError}</p>
                <div className="flex items-center gap-3 justify-center">
                  <button
                    onClick={() => handleSelectFile('README.md')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Open README.md
                  </button>
                  <button
                    onClick={() => handleSelectDirectory('')}
                    className="px-4 py-2 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Browse Folder Table
                  </button>
                </div>
              </div>
            ) : currentDocument ? (
              currentDocument.extension === '.md' || currentDocument.language === 'markdown' ? (
                <MarkdownViewer
                  document={currentDocument}
                  onNavigateFile={(path) => handleSelectFile(path)}
                />
              ) : (
                <CodeViewer document={currentDocument} />
              )
            ) : (
              <div className="h-full min-h-0 overflow-y-auto bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
                <DirectoryGrid
                  currentPath={activeDirectoryPath || ''}
                  items={currentDirectoryItems}
                  onSelectFile={handleSelectFile}
                  onSelectDirectory={handleSelectDirectory}
                  filterLanguage={activeLanguageFilter}
                  searchFilter={treeSearch}
                  onClearFilter={() => {
                    setActiveLanguageFilter(null);
                    setTreeSearch('');
                  }}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
