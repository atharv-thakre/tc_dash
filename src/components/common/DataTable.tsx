import React, { useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  error?: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
  onRefresh?: () => void;
  actions?: (item: T) => React.ReactNode;
  pageSize?: number;

  // Server-side pagination props
  page?: number;
  limit?: number;
  totalCount?: number;
  onPageChange?: (newPage: number) => void;
  onLimitChange?: (newLimit: number) => void;
}

export function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  isLoading = false,
  error = null,
  emptyTitle = 'No data found',
  emptyDescription = 'There are no records matching your request.',
  onRefresh,
  actions,
  pageSize = 10,
  page,
  limit,
  totalCount,
  onPageChange,
  onLimitChange,
}: DataTableProps<T>) {
  const [internalPage, setInternalPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const isServerPaginated = Boolean(onPageChange);
  const currentPage = isServerPaginated ? (page ?? 1) : internalPage;
  const currentLimit = isServerPaginated ? (limit ?? 10) : pageSize;

  // Handle Sorting
  const handleSort = (key?: keyof T) => {
    if (!key) return;
    if (sortColumn === key) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else setSortColumn(null);
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  let sortedData = [...data];
  if (sortColumn) {
    sortedData.sort((a, b) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];
      if (valA == null) return 1;
      if (valB == null) return -1;
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Pagination calculation
  const totalItems = isServerPaginated ? (totalCount ?? data.length) : sortedData.length;
  const totalPages = Math.ceil(totalItems / currentLimit) || 1;
  const paginatedData = isServerPaginated
    ? sortedData
    : sortedData.slice((currentPage - 1) * currentLimit, currentPage * currentLimit);

  const startEntry = (currentPage - 1) * currentLimit + 1;
  const endEntry = isServerPaginated
    ? startEntry + data.length - 1
    : Math.min(currentPage * currentLimit, sortedData.length);

  const handlePrevPage = () => {
    if (currentPage <= 1) return;
    if (isServerPaginated && onPageChange) {
      onPageChange(currentPage - 1);
    } else {
      setInternalPage((p) => Math.max(1, p - 1));
    }
  };

  const handleNextPage = () => {
    if (isServerPaginated) {
      if (onPageChange && (totalCount != null ? currentPage * currentLimit < totalCount : data.length >= currentLimit)) {
        onPageChange(currentPage + 1);
      }
    } else {
      setInternalPage((p) => Math.min(totalPages, p + 1));
    }
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xs overflow-hidden transition-all">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-500 font-medium">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={cn('px-3.5 sm:px-6 py-3 sm:py-3.5 tracking-wider uppercase text-[11px] sm:text-xs font-semibold whitespace-nowrap', col.className)}
                >
                  {col.sortable && col.accessorKey ? (
                    <button
                      onClick={() => handleSort(col.accessorKey)}
                      className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      {col.header}
                      {sortColumn === col.accessorKey ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-indigo-500" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-indigo-500" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-600 opacity-60 hover:opacity-100" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
              {actions && <th className="px-3.5 sm:px-6 py-3 sm:py-3.5 text-right tracking-wider uppercase text-[11px] sm:text-xs font-semibold">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-6 py-4">
                      <div className="h-4 bg-slate-200 dark:bg-zinc-900 rounded-md w-3/4" />
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 text-right">
                      <div className="h-4 bg-slate-200 dark:bg-zinc-900 rounded-md w-8 ml-auto" />
                    </td>
                  )}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="py-12 text-center text-rose-500">
                  <p className="font-medium">Failed to load data</p>
                  <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">{error}</p>
                  {onRefresh && (
                    <button
                      onClick={onRefresh}
                      className="mt-3 px-3 py-1.5 text-xs bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20 font-medium transition-colors"
                    >
                      Retry
                    </button>
                  )}
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="py-12 text-center">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              paginatedData.map((item, rowIdx) => (
                <tr
                  key={item.id ? String(item.id) : rowIdx}
                  className="hover:bg-slate-50/60 dark:hover:bg-zinc-900/50 transition-colors"
                >
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className={cn('px-3.5 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-800 dark:text-zinc-200', col.className)}>
                      {col.cell ? col.cell(item) : col.accessorKey ? String(item[col.accessorKey] ?? '') : ''}
                    </td>
                  ))}
                  {actions && <td className="px-3.5 sm:px-6 py-3 sm:py-4 text-right whitespace-nowrap text-xs">{actions(item)}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {!isLoading && !error && data.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3.5 sm:px-6 py-3 sm:py-3.5 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 text-xs text-slate-500 dark:text-zinc-400">
          <div className="flex items-center gap-4">
            <div>
              Showing <span className="font-semibold text-slate-900 dark:text-zinc-100">{startEntry}</span> to{' '}
              <span className="font-semibold text-slate-900 dark:text-zinc-100">{endEntry}</span>
              {totalItems > 0 && (
                <>
                  {' '}of <span className="font-semibold text-slate-900 dark:text-zinc-100">{totalItems}</span> entries
                </>
              )}
            </div>

            {onLimitChange && (
              <div className="flex items-center gap-1.5 ml-2">
                <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">Per page:</span>
                <select
                  value={currentLimit || 10}
                  onChange={(e) => onLimitChange(Number(e.target.value))}
                  className="px-2 py-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md text-xs text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-slate-700 dark:text-zinc-300">
              Page {currentPage} {isServerPaginated && totalCount == null ? '' : `of ${totalPages}`}
            </span>
            <button
              onClick={handleNextPage}
              disabled={
                isServerPaginated
                  ? (totalCount != null ? currentPage * currentLimit >= totalCount : data.length < currentLimit)
                  : currentPage >= totalPages
              }
              className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
