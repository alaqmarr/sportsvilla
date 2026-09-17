import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`bg-sv-surface-raised animate-pulse rounded-sv-sm ${className}`}
      {...props}
    />
  );
}

export interface SkeletonTextProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
  gap?: string;
  className?: string;
}

export function SkeletonText({
  lines = 3,
  gap = "space-y-2",
  className = "",
  ...props
}: SkeletonTextProps) {
  return (
    <div className={`${gap} ${className}`} {...props}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={`h-3.5 ${
            index === lines - 1 ? "w-3/5" : index === 0 ? "w-4/5" : "w-full"
          }`}
        />
      ))}
    </div>
  );
}

export interface SkeletonAvatarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const avatarSizes = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
};

export function SkeletonAvatar({
  size = "md",
  className = "",
  ...props
}: SkeletonAvatarProps) {
  return (
    <div
      className={`rounded-full bg-sv-surface-raised animate-pulse flex-shrink-0 ${avatarSizes[size]} ${className}`}
      {...props}
    />
  );
}

export interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hasFooter?: boolean;
  className?: string;
}

export function SkeletonCard({
  hasFooter = false,
  className = "",
  ...props
}: SkeletonCardProps) {
  return (
    <div
      className={`border border-sv-border bg-sv-surface rounded-sv-lg p-5 sm:p-6 space-y-4 shadow-sv-sm ${className}`}
      {...props}
    >
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-8 w-8 rounded-sv-sm" />
      </div>
      <SkeletonText lines={3} />
      {hasFooter && (
        <div className="pt-3 border-t border-sv-border-subtle flex justify-between">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/5" />
        </div>
      )}
    </div>
  );
}

export interface TableSkeletonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  className = "",
  ...props
}: TableSkeletonProps) {
  return (
    <div
      className={`border border-sv-border bg-sv-surface rounded-sv-lg overflow-hidden shadow-sv-sm p-4 space-y-3 ${className}`}
      {...props}
    >
      <div className="flex gap-4 border-b border-sv-border pb-3">
        {Array.from({ length: columns }).map((_, c) => (
          <Skeleton key={`head-${c}`} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={`row-${r}`} className="flex gap-4 py-2 border-b border-sv-border-subtle last:border-none">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton
              key={`cell-${r}-${c}`}
              className={`h-4 ${c === 0 ? "w-1/4" : "flex-1"}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
