import React, { useState, useMemo, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import {
  BookOpen,
  Check,
  ChevronRight,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileCode,
  FileText,
  Hash,
  Info,
  Layers,
  ListTree,
  Maximize2,
  Minimize2,
  PanelRightClose,
  Sparkles,
  WrapText,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { DocumentContent } from '../../types/documents';
import { CodeHighlighter } from './CodeHighlighter';

interface MarkdownViewerProps {
  document: DocumentContent;
  onNavigateFile?: (filePath: string) => void;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({
  document,
  onNavigateFile,
}) => {
  const [viewMode, setViewMode] = useState<'preview' | 'raw' | 'split'>('preview');
  // Collapsed by default as requested
  const [showToc, setShowToc] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [copiedCodeBlock, setCopiedCodeBlock] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wrapRaw, setWrapRaw] = useState(true);
  const contentContainerRef = useRef<HTMLDivElement>(null);

  // Extract Table of Contents from markdown headings
  const toc = useMemo<TocItem[]>(() => {
    if (!document.content) return [];
    const lines = document.content.split('\n');
    const items: TocItem[] = [];

    lines.forEach((line) => {
      const match = line.match(/^(#{1,4})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const rawText = match[2].trim();
        // Remove markdown formatting like bold/links
        const cleanText = rawText.replace(/[*_`\[\]]/g, '').replace(/\(http[^)]+\)/g, '');
        const id = cleanText
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');

        if (cleanText) {
          items.push({
            id,
            text: cleanText,
            level,
          });
        }
      }
    });

    return items;
  }, [document.content]);

  // Active heading observer on scroll
  useEffect(() => {
    if (!contentContainerRef.current || toc.length === 0) return;

    const handleScroll = () => {
      const container = contentContainerRef.current;
      if (!container) return;

      const headingElements = toc
        .map((item) => window.document.getElementById(item.id))
        .filter(Boolean) as HTMLElement[];

      const containerTop = container.getBoundingClientRect().top;

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const el = headingElements[i];
        const rect = el.getBoundingClientRect();
        if (rect.top <= containerTop + 120) {
          setActiveHeadingId(el.id);
          return;
        }
      }

      if (headingElements.length > 0) {
        setActiveHeadingId(headingElements[0].id);
      }
    };

    const container = contentContainerRef.current;
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [toc]);

  const handleCopyContent = () => {
    navigator.clipboard.writeText(document.content);
    setCopied(true);
    toast.success('Document content copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeBlock(code);
    toast.success('Code snippet copied');
    setTimeout(() => setCopiedCodeBlock(null), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([document.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = document.name;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${document.name}`);
  };

  const scrollToHeading = (id: string) => {
    const el = window.document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveHeadingId(id);
    }
  };

  return (
    <div
      className={`flex flex-col bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs overflow-hidden transition-all ${
        isFullscreen ? 'fixed inset-3 z-50 rounded-2xl shadow-2xl' : 'h-full min-h-0 flex-1'
      }`}
    >
      {/* Top File Action & Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3 bg-slate-50/90 dark:bg-zinc-900/70 border-b border-slate-200 dark:border-zinc-800 shrink-0 select-none">
        {/* Left info: Icon, File Name, Stats */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate font-mono">
                {document.name}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                Markdown
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              <span>{document.sizeFormatted}</span>
              <span>•</span>
              <span>{document.lines} lines</span>
              <span>•</span>
              <span>~{Math.max(1, Math.ceil(document.words / 200))} min read</span>
            </div>
          </div>
        </div>

        {/* Right Tools & View Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Switcher */}
          <div className="flex items-center p-0.5 bg-slate-200/80 dark:bg-zinc-800 rounded-lg border border-slate-300/60 dark:border-zinc-700 text-xs">
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === 'preview'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
              title="Rendered Markdown Preview"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === 'raw'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
              title="Raw Markdown Source"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Source</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
              title="Side-by-side Split View"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
          </div>

          {/* TOC Toggle Button */}
          {toc.length > 0 && viewMode !== 'raw' && (
            <button
              onClick={() => setShowToc(!showToc)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                showToc
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 font-semibold shadow-2xs'
                  : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-800'
              }`}
              title={showToc ? 'Collapse On This Page' : 'Expand On This Page'}
            >
              <ListTree className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">On This Page</span>
              <span className="text-[10px] font-mono px-1 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-bold">
                {toc.length}
              </span>
            </button>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopyContent}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 rounded-lg transition-colors cursor-pointer"
            title="Copy entire markdown content"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Static Raw Direct Link */}
          <a
            href={document.staticUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 rounded-lg transition-colors cursor-pointer"
            title="Open static hosted file in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Static Raw</span>
          </a>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="p-1.5 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 rounded-lg transition-colors cursor-pointer"
            title="Download file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 rounded-lg transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Document Body */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Rendered Preview Pane */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div
            ref={contentContainerRef}
            className="flex-1 overflow-y-auto px-4 sm:px-7 lg:px-9 py-5 sm:py-7 space-y-4 scroll-smooth min-h-0 text-[13px] sm:text-[13.5px]"
          >
            <div className="max-w-4xl 2xl:max-w-5xl mx-auto pb-16">
              <Markdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  h1: ({ children, ...props }) => {
                    const text = String(children).replace(/[^\w\s-]/g, '').trim();
                    const id = text.toLowerCase().replace(/\s+/g, '-');
                    return (
                      <h1
                        id={id}
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 pb-2.5 border-b border-slate-200 dark:border-zinc-800 mt-7 first:mt-0 mb-3.5 group flex items-center gap-2"
                        {...props}
                      >
                        <span>{children}</span>
                        <a
                          href={`#${id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            scrollToHeading(id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-indigo-500 hover:text-indigo-600 transition-opacity text-sm font-normal ml-1"
                          aria-label="Link to section"
                        >
                          #
                        </a>
                      </h1>
                    );
                  },
                  h2: ({ children, ...props }) => {
                    const text = String(children).replace(/[^\w\s-]/g, '').trim();
                    const id = text.toLowerCase().replace(/\s+/g, '-');
                    return (
                      <h2
                        id={id}
                        className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-zinc-100 pb-1.5 border-b border-slate-100 dark:border-zinc-800/60 mt-6 mb-2.5 group flex items-center gap-2"
                        {...props}
                      >
                        <span>{children}</span>
                        <a
                          href={`#${id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            scrollToHeading(id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-indigo-500 hover:text-indigo-600 transition-opacity text-xs font-normal ml-1"
                          aria-label="Link to section"
                        >
                          #
                        </a>
                      </h2>
                    );
                  },
                  h3: ({ children, ...props }) => {
                    const text = String(children).replace(/[^\w\s-]/g, '').trim();
                    const id = text.toLowerCase().replace(/\s+/g, '-');
                    return (
                      <h3
                        id={id}
                        className="text-sm sm:text-base font-semibold text-slate-900 dark:text-zinc-100 mt-5 mb-2"
                        {...props}
                      >
                        {children}
                      </h3>
                    );
                  },
                  h4: ({ children, ...props }) => {
                    return (
                      <h4
                        className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-zinc-100 mt-4 mb-1.5"
                        {...props}
                      >
                        {children}
                      </h4>
                    );
                  },
                  p: ({ children, ...props }) => (
                    <p className="text-slate-700 dark:text-zinc-300 leading-relaxed my-2.5 text-[13px] sm:text-[13.5px]" {...props}>
                      {children}
                    </p>
                  ),
                  ul: ({ children, ...props }) => (
                    <ul className="list-disc list-outside pl-5 space-y-1 my-2.5 text-slate-700 dark:text-zinc-300 text-[13px] sm:text-[13.5px]" {...props}>
                      {children}
                    </ul>
                  ),
                  ol: ({ children, ...props }) => (
                    <ol className="list-decimal list-outside pl-5 space-y-1 my-2.5 text-slate-700 dark:text-zinc-300 text-[13px] sm:text-[13.5px]" {...props}>
                      {children}
                    </ol>
                  ),
                  li: ({ children, ...props }) => (
                    <li className="leading-relaxed text-[13px] sm:text-[13.5px]" {...props}>
                      {children}
                    </li>
                  ),
                  blockquote: ({ children, ...props }) => {
                    const text = React.Children.toArray(children)
                      .map((c: any) => (c?.props?.children ? String(c.props.children) : String(c)))
                      .join(' ');

                    const isQuickAI = text.includes('Quick AI Context') || text.includes('AI Context');
                    const isNote = text.includes('Note') || text.includes('IMPORTANT');
                    const isWarning = text.includes('Warning') || text.includes('Caution');

                    return (
                      <div
                        className={`my-3.5 p-3.5 rounded-xl border flex gap-2.5 text-xs sm:text-[13px] ${
                          isQuickAI
                            ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-200'
                            : isWarning
                            ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
                            : isNote
                            ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/60 text-blue-900 dark:text-blue-200'
                            : 'bg-slate-50 dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300'
                        }`}
                      >
                        <div className="shrink-0 mt-0.5">
                          {isQuickAI ? (
                            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          ) : (
                            <Info className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                          )}
                        </div>
                        <div className="leading-relaxed flex-1">{children}</div>
                      </div>
                    );
                  },
                  table: ({ children, ...props }) => (
                    <div className="my-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-800 shadow-2xs bg-white dark:bg-zinc-950/60">
                      <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300 divide-y divide-slate-200 dark:divide-zinc-800" {...props}>
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children, ...props }) => (
                    <thead className="bg-slate-100/90 dark:bg-zinc-900/90 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300" {...props}>
                      {children}
                    </thead>
                  ),
                  th: ({ children, ...props }) => (
                    <th className="px-3.5 py-2.5 font-semibold text-slate-900 dark:text-zinc-100 border-b border-slate-200 dark:border-zinc-800" {...props}>
                      {children}
                    </th>
                  ),
                  td: ({ children, ...props }) => (
                    <td className="px-3.5 py-2 border-t border-slate-100 dark:border-zinc-800/60 align-top text-[12px] leading-relaxed text-slate-700 dark:text-zinc-300" {...props}>
                      {children}
                    </td>
                  ),
                  tr: ({ children, ...props }) => (
                    <tr className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/50 transition-colors" {...props}>
                      {children}
                    </tr>
                  ),
                  code: ({ node, className, children, ...props }: any) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match && !String(children).includes('\n');
                    const codeString = String(children).replace(/\n$/, '');

                    if (isInline) {
                      return (
                        <code
                          className="px-1.5 py-0.5 rounded font-mono text-[11.5px] bg-slate-100 dark:bg-zinc-800/80 text-indigo-700 dark:text-indigo-300 border border-slate-200/80 dark:border-zinc-700/60 font-medium"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }

                    const lang = match ? match[1] : 'text';

                    return (
                      <div className="my-3.5 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 shadow-md">
                        {/* Code Header Bar */}
                        <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400">
                          <span className="font-mono uppercase font-bold tracking-wider text-[10.5px] text-indigo-400">
                            {lang}
                          </span>
                          <button
                            onClick={() => handleCopyCode(codeString)}
                            className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer text-[10.5px] font-medium"
                          >
                            {copiedCodeBlock === codeString ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Snippet</span>
                              </>
                            )}
                          </button>
                        </div>
                        {/* Code Body */}
                        <div className="p-3 overflow-x-auto text-[12px]">
                          <CodeHighlighter code={codeString} language={lang} showLineNumbers={true} />
                        </div>
                      </div>
                    );
                  },
                  a: ({ href, children, ...props }) => {
                    const isInternalDoc = href && (href.startsWith('/documents/') || href.startsWith('/api/') || href.startsWith('/sdk/') || href.startsWith('/llm/'));
                    return (
                      <a
                        href={href}
                        onClick={(e) => {
                          if (isInternalDoc && onNavigateFile && href) {
                            e.preventDefault();
                            const cleanPath = href.replace(/^\/documents\//, '').replace(/^\//, '');
                            onNavigateFile(cleanPath);
                          }
                        }}
                        className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline inline-flex items-center gap-0.5"
                        target={isInternalDoc ? undefined : '_blank'}
                        rel={isInternalDoc ? undefined : 'noreferrer'}
                        {...props}
                      >
                        {children}
                      </a>
                    );
                  },
                }}
              >
                {document.content}
              </Markdown>
            </div>
          </div>
        )}

        {/* Raw Source Pane */}
        {(viewMode === 'raw' || viewMode === 'split') && (
          <div
            className={`flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-hidden min-h-0 ${
              viewMode === 'split' ? 'border-l border-slate-800' : ''
            }`}
          >
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 shrink-0">
              <span className="font-mono text-[11px] font-medium">Raw Markdown Source</span>
              <button
                onClick={() => setWrapRaw(!wrapRaw)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] cursor-pointer transition-colors"
                title="Toggle Word Wrap"
              >
                <WrapText className="w-3 h-3" />
                <span>{wrapRaw ? 'Word Wrap: ON' : 'Word Wrap: OFF'}</span>
              </button>
            </div>
            <div className={`flex-1 overflow-y-auto p-4 min-h-0 ${wrapRaw ? 'whitespace-pre-wrap' : 'overflow-x-auto'}`}>
              <CodeHighlighter code={document.content} language="markdown" showLineNumbers={true} />
            </div>
          </div>
        )}

        {/* Table of Contents Floating/Side Navigation */}
        {showToc && toc.length > 0 && viewMode !== 'raw' && (
          <aside className="w-72 2xl:w-80 border-l border-slate-200 dark:border-zinc-800 p-4 bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-sm overflow-y-auto hidden xl:flex flex-col shrink-0 min-h-0 select-none animate-in fade-in slide-in-from-right-2 duration-150">
            <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-200 dark:border-zinc-800 shrink-0">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                <Hash className="w-3.5 h-3.5 text-indigo-500" />
                <span>On This Page</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-semibold">
                  {toc.length}
                </span>
              </div>
              <button
                onClick={() => setShowToc(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Collapse On This Page"
              >
                <PanelRightClose className="w-3.5 h-3.5" />
              </button>
            </div>

            <nav className="space-y-0.5 overflow-y-auto pr-1 flex-1">
              {toc.map((item, idx) => {
                const isActive = activeHeadingId === item.id;
                return (
                  <button
                    key={idx}
                    onClick={() => scrollToHeading(item.id)}
                    title={item.text}
                    className={`block w-full text-left py-1.5 px-2.5 rounded-lg transition-all text-xs cursor-pointer group ${
                      isActive
                        ? 'bg-indigo-600 text-white dark:bg-indigo-600 dark:text-white font-bold shadow-xs'
                        : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-zinc-50 hover:bg-slate-100 dark:hover:bg-zinc-850/80'
                    } ${
                      item.level === 1
                        ? 'font-medium'
                        : item.level === 2
                        ? 'pl-4 text-[11.5px]'
                        : 'pl-6 text-[11px] opacity-90'
                    }`}
                  >
                    <div className="flex items-start gap-1.5">
                      <ChevronRight
                        className={`w-3 h-3 mt-0.5 shrink-0 transition-transform ${
                          isActive
                            ? 'text-white translate-x-0.5'
                            : 'text-slate-400 dark:text-zinc-500 opacity-60 group-hover:opacity-100'
                        }`}
                      />
                      <span className="line-clamp-2 leading-snug">{item.text}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </aside>
        )}
      </div>
    </div>
  );
};
