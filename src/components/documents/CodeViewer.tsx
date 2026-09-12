import React, { useState } from 'react';
import {
  Check,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileCode,
  FileText,
  Maximize2,
  Minimize2,
  Search,
  WrapText,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { DocumentContent } from '../../types/documents';
import { CodeHighlighter } from './CodeHighlighter';

interface CodeViewerProps {
  document: DocumentContent;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ document }) => {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wrapLines, setWrapLines] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCopyContent = () => {
    navigator.clipboard.writeText(document.content);
    setCopied(true);
    toast.success(`${document.name} copied to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const mimeType =
      document.language === 'python'
        ? 'text/x-python;charset=utf-8'
        : document.language === 'json'
        ? 'application/json;charset=utf-8'
        : 'text/plain;charset=utf-8';

    const blob = new Blob([document.content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = document.name;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${document.name}`);
  };

  const getLanguageColor = (lang: string) => {
    switch (lang) {
      case 'python':
        return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'json':
        return 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'typescript':
      case 'javascript':
        return 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800';
      default:
        return 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-300 dark:border-zinc-700';
    }
  };

  const matchCount = searchQuery
    ? (document.content.toLowerCase().match(new RegExp(searchQuery.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length
    : 0;

  return (
    <div
      className={`flex flex-col bg-slate-950 rounded-xl border border-slate-800 shadow-2xs overflow-hidden transition-all text-slate-100 ${
        isFullscreen ? 'fixed inset-3 z-50 rounded-xl shadow-2xl' : 'h-full min-h-0 flex-1'
      }`}
    >
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-2.5 bg-slate-900 border-b border-slate-800 shrink-0 select-none">
        {/* File Details */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            {document.language === 'python' ? <FileCode className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5 text-sky-400" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white truncate font-mono">
                {document.name}
              </span>
              <span
                className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${getLanguageColor(
                  document.language
                )}`}
              >
                {document.language}
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-[11px] text-slate-400 mt-0.5">
              <span>{document.sizeFormatted}</span>
              <span>•</span>
              <span>{document.lines} lines</span>
              <span>•</span>
              <span>{document.content.length.toLocaleString()} chars</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Search Toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
              searchOpen
                ? 'bg-indigo-950 text-indigo-300 border-indigo-700'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Search in file"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Find</span>
          </button>

          {/* Word Wrap Toggle */}
          <button
            onClick={() => setWrapLines(!wrapLines)}
            className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
              wrapLines
                ? 'bg-indigo-950 text-indigo-300 border-indigo-700'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Toggle word wrap"
          >
            <WrapText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{wrapLines ? 'Wrap: On' : 'Wrap: Off'}</span>
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopyContent}
            className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors cursor-pointer"
            title="Copy file contents"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Static Raw Direct Link */}
          <a
            href={document.staticUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors cursor-pointer"
            title="Open raw static hosted file in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Raw Link</span>
          </a>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors cursor-pointer"
            title="Download file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* In-File Search Sub-Bar */}
      {searchOpen && (
        <div className="flex items-center gap-3 px-4 py-1.5 bg-slate-900/90 border-b border-slate-800 text-xs shrink-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find in code..."
              autoFocus
              className="w-full pl-8 pr-3 py-1 bg-slate-950 border border-slate-700 rounded-md text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
            />
          </div>
          {searchQuery && (
            <span className="text-slate-400 font-mono text-[11px]">
              {matchCount} {matchCount === 1 ? 'match' : 'matches'}
            </span>
          )}
          <button
            onClick={() => {
              setSearchQuery('');
              setSearchOpen(false);
            }}
            className="p-1 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Code Body */}
      <div className={`flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 ${wrapLines ? 'whitespace-pre-wrap' : 'overflow-x-auto'}`}>
        <CodeHighlighter
          code={document.content}
          language={document.language}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
};
