import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Calendar,
  ChevronRight,
  Download,
  ExternalLink,
  FileCode,
  FileText,
  Filter,
  Folder,
  FolderOpen,
  Grid,
  HardDrive,
  LayoutGrid,
  List,
  Sparkles,
  X,
} from 'lucide-react';
import { DocumentNode } from '../../types/documents';
import { doesNodeMatch, countMatchingItems } from './FileTreeNode';

interface DirectoryGridProps {
  currentPath: string;
  items: DocumentNode[];
  onSelectFile: (path: string) => void;
  onSelectDirectory: (path: string) => void;
  filterLanguage?: string | null;
  searchFilter?: string;
  onClearFilter?: () => void;
}

export const DirectoryGrid: React.FC<DirectoryGridProps> = ({
  currentPath,
  items,
  onSelectFile,
  onSelectDirectory,
  filterLanguage,
  searchFilter,
  onClearFilter,
}) => {
  const [layoutMode, setLayoutMode] = useState<'table' | 'grid'>('table');

  const isFilterActive = Boolean(filterLanguage || (searchFilter && searchFilter.trim().length > 0));

  // Filter folders and files based on language and search filter
  const { folders, files } = useMemo(() => {
    const rawFolders = items.filter((i) => i.type === 'directory');
    const rawFiles = items.filter((i) => i.type === 'file');

    if (!isFilterActive) {
      return { folders: rawFolders, files: rawFiles };
    }

    const filteredFolders = rawFolders.filter((dir) =>
      doesNodeMatch(dir, filterLanguage, searchFilter)
    );
    const filteredFiles = rawFiles.filter((file) =>
      doesNodeMatch(file, filterLanguage, searchFilter)
    );

    return { folders: filteredFolders, files: filteredFiles };
  }, [items, filterLanguage, searchFilter, isFilterActive]);

  const allItems = useMemo(() => [...folders, ...files], [folders, files]);

  const getFileIcon = (lang?: string, ext?: string) => {
    if (lang === 'markdown' || ext === '.md') {
      return <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />;
    }
    if (lang === 'python' || ext === '.py') {
      return <FileCode className="w-4 h-4 text-emerald-500 shrink-0" />;
    }
    if (lang === 'json' || ext === '.json') {
      return <FileCode className="w-4 h-4 text-amber-500 shrink-0" />;
    }
    return <FileText className="w-4 h-4 text-sky-500 shrink-0" />;
  };

  const getFileTypeLabel = (item: DocumentNode) => {
    if (item.type === 'directory') return 'File folder';
    if (item.extension === '.md') return 'MD File';
    if (item.extension === '.txt') return 'Text Document';
    if (item.extension === '.py') return 'Python Source File';
    if (item.extension === '.json') return 'JSON Document';
    return `${item.extension?.toUpperCase() || ''} File`;
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '12-09-2026 08:59 PM';
    try {
      const date = new Date(isoString);
      return (
        date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }) +
        ' ' +
        date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    } catch {
      return '12-09-2026 08:59 PM';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto">
      {/* Directory Top Bar */}
      <div className="bg-slate-50 dark:bg-zinc-900/70 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100 font-mono">
              {currentPath ? `/documents/${currentPath}` : '/documents'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 flex items-center gap-2">
              <span>
                {folders.length} {folders.length === 1 ? 'folder' : 'folders'} • {files.length}{' '}
                {files.length === 1 ? 'file' : 'files'}
              </span>
              {isFilterActive && (
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold">
                  <Filter className="w-3 h-3" />
                  Filtered view
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Table / Grid Switcher */}
          <div className="flex items-center p-0.5 bg-slate-200/80 dark:bg-zinc-800 rounded-lg border border-slate-300/60 dark:border-zinc-700 text-xs">
            <button
              onClick={() => setLayoutMode('table')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                layoutMode === 'table'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
              title="Details Table View (Windows Explorer style)"
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setLayoutMode('grid')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                layoutMode === 'grid'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
          </div>

          <a
            href={currentPath ? `/documents/${currentPath}` : '/documents'}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-zinc-800 hover:bg-indigo-100 dark:hover:bg-zinc-700 border border-indigo-200 dark:border-zinc-700 rounded-xl transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Static Raw</span>
          </a>
        </div>
      </div>

      {/* Active Filter Notification Ribbon */}
      {isFilterActive && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 rounded-xl text-xs text-indigo-900 dark:text-indigo-200">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>
              Showing results matching{' '}
              {filterLanguage && (
                <strong className="font-mono bg-indigo-100 dark:bg-indigo-900/60 px-1.5 py-0.5 rounded text-indigo-700 dark:text-indigo-300">
                  {filterLanguage}
                </strong>
              )}
              {filterLanguage && searchFilter && ' and '}
              {searchFilter && (
                <>
                  keyword &ldquo;
                  <strong className="font-mono text-indigo-700 dark:text-indigo-300">{searchFilter}</strong>
                  &rdquo;
                </>
              )}
              {' '}({allItems.length} items found)
            </span>
          </div>
          {onClearFilter && (
            <button
              onClick={onClearFilter}
              className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer text-xs"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset filter</span>
            </button>
          )}
        </div>
      )}

      {/* Empty State when 0 items match */}
      {allItems.length === 0 ? (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 p-12 text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-slate-100 dark:bg-zinc-900 text-slate-400">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
            No files match the active filter
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
            There are no {filterLanguage ? `${filterLanguage} ` : ''}files {searchFilter ? `matching "${searchFilter}" ` : ''}in this folder.
          </p>
          {onClearFilter && (
            <button
              onClick={onClearFilter}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Show all files
            </button>
          )}
        </div>
      ) : layoutMode === 'table' ? (
        /* Explorer Table Layout */
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/50 text-slate-500 dark:text-zinc-400 font-semibold select-none">
                  <th className="py-2.5 px-4 font-semibold text-slate-700 dark:text-zinc-300 w-2/5">Name</th>
                  <th className="py-2.5 px-4 font-semibold text-slate-700 dark:text-zinc-300 w-1/4">Date modified</th>
                  <th className="py-2.5 px-4 font-semibold text-slate-700 dark:text-zinc-300 w-1/5">Type</th>
                  <th className="py-2.5 px-4 font-semibold text-slate-700 dark:text-zinc-300 text-right w-1/6">Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-900">
                {allItems.map((item) => {
                  const isDir = item.type === 'directory';
                  const matchCount = isDir && isFilterActive
                    ? countMatchingItems(item, filterLanguage, searchFilter)
                    : (item.children ? item.children.length : 0);

                  return (
                    <tr
                      key={item.path}
                      onClick={() => (isDir ? onSelectDirectory(item.path) : onSelectFile(item.path))}
                      className="hover:bg-indigo-50/50 dark:hover:bg-zinc-900/80 transition-colors cursor-pointer group"
                    >
                      {/* Name with Icon */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {isDir ? (
                            <Folder className="w-4 h-4 text-amber-500 fill-amber-500/20 shrink-0 group-hover:scale-110 transition-transform" />
                          ) : (
                            getFileIcon(item.language, item.extension)
                          )}
                          <span
                            className={`font-mono text-[12px] truncate ${
                              isDir
                                ? 'font-semibold text-slate-900 dark:text-zinc-100'
                                : 'text-slate-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                            }`}
                          >
                            {item.name}
                          </span>
                          {isDir && isFilterActive && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-bold">
                              {matchCount} matching
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date Modified */}
                      <td className="py-2.5 px-4 text-slate-500 dark:text-zinc-400 font-mono text-[11px] whitespace-nowrap">
                        {formatDate(item.modifiedAt)}
                      </td>

                      {/* Type */}
                      <td className="py-2.5 px-4 text-slate-500 dark:text-zinc-400 text-[11px] whitespace-nowrap">
                        {getFileTypeLabel(item)}
                      </td>

                      {/* Size */}
                      <td className="py-2.5 px-4 text-right text-slate-500 dark:text-zinc-400 font-mono text-[11px] whitespace-nowrap">
                        {item.sizeFormatted || (isDir ? `${matchCount} items` : '0 KB')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Bento / Cards Layout */
        <div className="space-y-6">
          {folders.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-2">
                <Folder className="w-3.5 h-3.5 text-amber-500" />
                <span>Folders ({folders.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {folders.map((folder) => {
                  const matchCount = isFilterActive
                    ? countMatchingItems(folder, filterLanguage, searchFilter)
                    : (folder.children ? folder.children.length : 0);

                  return (
                    <button
                      key={folder.path}
                      onClick={() => onSelectDirectory(folder.path)}
                      className="flex items-center justify-between p-3.5 bg-white dark:bg-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-xl transition-all shadow-2xs hover:shadow-sm text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Folder className="w-5 h-5 text-amber-500 fill-amber-500/20 group-hover:scale-110 transition-transform shrink-0" />
                        <span className="font-semibold text-xs text-slate-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                          {folder.name}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                        isFilterActive
                          ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 font-bold'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                      }`}>
                        {matchCount} {isFilterActive ? 'match' : 'items'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {files.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                <span>Files ({files.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {files.map((file) => (
                  <div
                    key={file.path}
                    onClick={() => onSelectFile(file.path)}
                    className="flex flex-col justify-between p-4 bg-white dark:bg-zinc-950 hover:bg-slate-50/90 dark:hover:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-zinc-700 rounded-xl transition-all shadow-2xs hover:shadow-sm text-left cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-900 group-hover:scale-105 transition-transform shrink-0">
                          {getFileIcon(file.language, file.extension)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-900 dark:text-zinc-100 font-mono truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {file.name}
                          </p>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-zinc-500">
                            {getFileTypeLabel(file)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-zinc-900 text-[11px] text-slate-500 dark:text-zinc-400">
                      <span>{file.sizeFormatted || '0 KB'}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold group-hover:underline">
                        Open File &rarr;
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
