import React from "react";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-[#2a2d3e]/50 rounded-lg ${className}`}
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="w-full">
      <div className="flex gap-4 border-b border-[#2a2d3e] pb-4 mb-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full max-w-[120px]" />
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 border-b border-[#2a2d3e]/50 pb-4">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className={`h-12 w-full ${c === 0 ? "max-w-[200px]" : "max-w-[150px]"}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-[#161923] border border-[#2a2d3e] rounded-2xl p-6 w-full">
      <div className="flex justify-between items-start mb-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-24 w-full mb-4" />
      <div className="flex gap-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-10 w-1/2" />
      </div>
    </div>
  );
}
