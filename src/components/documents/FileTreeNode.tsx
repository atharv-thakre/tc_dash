import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileCode,
  FileText,
  Folder,
  FolderOpen,
} from 'lucide-react';
import { DocumentNode } from '../../types/documents';

interface FileTreeNodeProps {
  node: DocumentNode;
  activeFilePath: string | null;
  onSelectFile: (path: string) => void;
  onSelectDirectory?: (path: string) => void;
  filterLanguage?: string | null;
  searchFilter?: string;
  depth?: number;
  isInitiallyExpanded?: boolean;
}

// Recursively checks if a node or any of its descendants matches the active filters
export function doesNodeMatch(
  node: DocumentNode,
  filterLanguage?: string | null,
  searchFilter?: string
): boolean {
  const langMatch = !filterLanguage || node.language === filterLanguage;
  const searchMatch =
    !searchFilter ||
    !searchFilter.trim() ||
    node.name.toLowerCase().includes(searchFilter.toLowerCase().trim()) ||
    node.path.toLowerCase().includes(searchFilter.toLowerCase().trim());

  if (node.type === 'file') {
    return Boolean(langMatch && searchMatch);
  }

  // Directory node: check if directory name/path matches search while also containing items,
  // or if any child matches
  if (node.children && node.children.length > 0) {
    return node.children.some((child) => doesNodeMatch(child, filterLanguage, searchFilter));
  }

  return false;
}

// Counts total matching files inside a directory tree
export function countMatchingItems(
  node: DocumentNode,
  filterLanguage?: string | null,
  searchFilter?: string
): number {
  if (node.type === 'file') {
    return doesNodeMatch(node, filterLanguage, searchFilter) ? 1 : 0;
  }
  if (!node.children) return 0;
  return node.children.reduce(
    (acc, child) =>
      acc + (child.type === 'file' ? (doesNodeMatch(child, filterLanguage, searchFilter) ? 1 : 0) : countMatchingItems(child, filterLanguage, searchFilter)),
    0
  );
}

export const FileTreeNode: React.FC<FileTreeNodeProps> = ({
  node,
  activeFilePath,
  onSelectFile,
  onSelectDirectory,
  filterLanguage,
  searchFilter = '',
  depth = 0,
  isInitiallyExpanded = false,
}) => {
  const isFilterActive = Boolean(filterLanguage || (searchFilter && searchFilter.trim().length > 0));
  const isSelfOrDescendantMatching = doesNodeMatch(node, filterLanguage, searchFilter);

  const isActiveDescendant = Boolean(activeFilePath && activeFilePath.startsWith(node.path + '/'));

  // Open by default if filters are active and matching, or if it's the active path
  const [isOpen, setIsOpen] = useState<boolean>(
    isInitiallyExpanded || isActiveDescendant || (isFilterActive && isSelfOrDescendantMatching)
  );

  // Sync open state when filters, active selection, or initial expanded change
  useEffect(() => {
    if (isActiveDescendant || (isFilterActive && isSelfOrDescendantMatching) || isInitiallyExpanded) {
      setIsOpen(true);
    }
  }, [activeFilePath, searchFilter, filterLanguage, isActiveDescendant, isFilterActive, isSelfOrDescendantMatching, isInitiallyExpanded]);

  // Helper for file icon & color
  const getFileIcon = (ext?: string, lang?: string) => {
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

  // If filter is active and this node or its subtree does NOT match, hide it
  if (isFilterActive && !isSelfOrDescendantMatching) {
    return null;
  }

  // Directory item
  if (node.type === 'directory') {
    const rawCount = node.children ? node.children.length : 0;
    const matchCount = isFilterActive
      ? countMatchingItems(node, filterLanguage, searchFilter)
      : rawCount;

    return (
      <div className="select-none">
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (onSelectDirectory) onSelectDirectory(node.path);
          }}
          style={{ paddingLeft: `${Math.max(8, depth * 14 + 8)}px` }}
          className="flex items-center justify-between w-full py-1.5 pr-2.5 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900/70 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-zinc-200 transition-transform">
              {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </span>
            {isOpen ? (
              <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-amber-500/80 shrink-0" />
            )}
            <span className="truncate font-semibold text-[13px]">{node.name}</span>
          </div>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
            isFilterActive
              ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 font-bold'
              : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
          }`}>
            {matchCount}
          </span>
        </button>

        {isOpen && node.children && node.children.length > 0 && (
          <div className="space-y-0.5 mt-0.5 border-l border-slate-200 dark:border-zinc-800 ml-4">
            {node.children.map((child) => (
              <FileTreeNode
                key={child.path}
                node={child}
                activeFilePath={activeFilePath}
                onSelectFile={onSelectFile}
                onSelectDirectory={onSelectDirectory}
                filterLanguage={filterLanguage}
                searchFilter={searchFilter}
                depth={depth + 1}
                isInitiallyExpanded={isInitiallyExpanded}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // File item
  const isActive = activeFilePath === node.path;

  return (
    <button
      onClick={() => onSelectFile(node.path)}
      style={{ paddingLeft: `${Math.max(8, depth * 14 + 8)}px` }}
      className={`flex items-center justify-between w-full py-1.5 pr-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer group ${
        isActive
          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200/80 dark:border-indigo-800/80 shadow-2xs'
          : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100/80 dark:hover:bg-zinc-900/60 hover:text-slate-900 dark:hover:text-zinc-200 border border-transparent'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        {getFileIcon(node.extension, node.language)}
        <span className="truncate font-mono text-[12px]">{node.name}</span>
      </div>
      {node.sizeFormatted && (
        <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 opacity-80 group-hover:opacity-100">
          {node.sizeFormatted}
        </span>
      )}
    </button>
  );
};
