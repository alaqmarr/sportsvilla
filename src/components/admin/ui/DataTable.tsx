"use client";

import React from "react";
import { FiChevronLeft, FiChevronRight, FiInbox } from "react-icons/fi";

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T, index: number) => React.ReactNode;
  align?: "left" | "center" | "right";
  width?: string;
  className?: string;
}

export interface DataTablePagination {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  isLoading?: boolean;
  loadingRows?: number;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  emptyAction?: React.ReactNode;
  stickyHeader?: boolean;
  onRowClick?: (row: T) => void;
  className?: string;
  pagination?: DataTablePagination;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  loadingRows = 5,
  emptyTitle = "No data found",
  emptyMessage = "There are no records to display at this time.",
  emptyIcon,
  emptyAction,
  stickyHeader = false,
  onRowClick,
  className = "",
  pagination,
}: DataTableProps<T>) {
  const alignClass = (align?: "left" | "center" | "right") => {
    switch (align) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "text-left";
    }
  };

  return (
    <div
      className={`border border-sv-border bg-sv-surface rounded-sv-lg overflow-hidden shadow-sv-sm flex flex-col ${className}`}
    >
      <div className="overflow-x-auto styled-scrollbar flex-1">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr
              className={`border-b border-sv-border bg-sv-surface-raised text-xs font-semibold uppercase tracking-wider text-sv-text-muted ${
                stickyHeader ? "sticky top-0 z-10" : ""
              }`}
            >
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={`px-4 py-3 sm:px-5 sm:py-3.5 ${alignClass(
                    col.align
                  )} ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-sv-border-subtle bg-sv-surface">
            {isLoading ? (
              Array.from({ length: loadingRows }).map((_, rIndex) => (
                <tr key={`skeleton-${rIndex}`} className="animate-pulse">
                  {columns.map((col, cIndex) => (
                    <td
                      key={`skeleton-${rIndex}-${cIndex}`}
                      className="px-4 py-3.5 sm:px-5 sm:py-4"
                    >
                      <div className="h-4 bg-sv-surface-raised rounded-sv-xs w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 px-4 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                    <div className="w-12 h-12 rounded-sv-md bg-sv-surface-raised border border-sv-border flex items-center justify-center text-sv-text-muted text-xl mb-3">
                      {emptyIcon || <FiInbox />}
                    </div>
                    <p className="text-base font-bold text-sv-text mb-1 font-sans">
                      {emptyTitle}
                    </p>
                    <p className="text-xs text-sv-text-muted mb-4 leading-relaxed">
                      {emptyMessage}
                    </p>
                    {emptyAction && <div>{emptyAction}</div>}
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rIndex) => {
                const rowKey = keyExtractor(row, rIndex);
                const isClickable = Boolean(onRowClick);

                return (
                  <tr
                    key={rowKey}
                    onClick={() => onRowClick?.(row)}
                    className={`transition-colors duration-sv-fast group ${
                      isClickable
                        ? "cursor-pointer hover:bg-sv-surface-hover"
                        : "hover:bg-sv-surface-hover/50"
                    }`}
                  >
                    {columns.map((col) => (
                      <td
                        key={`${rowKey}-${col.key}`}
                        className={`px-4 py-3.5 sm:px-5 sm:py-4 text-sv-text text-sm ${alignClass(
                          col.align
                        )} ${col.className || ""}`}
                      >
                        {col.render
                          ? col.render(row, rIndex)
                          : ((row as Record<string, unknown>)[col.key] as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="p-3 sm:px-5 sm:py-3.5 border-t border-sv-border-subtle bg-sv-surface-raised flex items-center justify-between gap-4 text-xs text-sv-text-muted">
          <div>
            {typeof pagination.totalItems === "number" ? (
              <span>
                Total <strong className="text-sv-text">{pagination.totalItems}</strong> entries
              </span>
            ) : (
              <span>
                Page <strong className="text-sv-text">{pagination.page}</strong> of{" "}
                <strong className="text-sv-text">{pagination.totalPages || 1}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              className="px-2.5 py-1.5 rounded-sv-sm border border-sv-border bg-sv-surface text-sv-text hover:bg-sv-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1 font-medium"
            >
              <FiChevronLeft />
              <span className="hidden sm:inline">Prev</span>
            </button>
            <span className="px-2 py-1 text-sv-text font-semibold">
              {pagination.page} / {pagination.totalPages || 1}
            </span>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              className="px-2.5 py-1.5 rounded-sv-sm border border-sv-border bg-sv-surface text-sv-text hover:bg-sv-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1 font-medium"
            >
              <span className="hidden sm:inline">Next</span>
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
