'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-text-secondary/10',
        className
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-background-secondary p-6 rounded-2xl border border-text-secondary/15">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <Skeleton className="w-20 h-6 rounded-full" />
      </div>
      <Skeleton className="w-3/4 h-5 mb-2" />
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-24 h-4 mt-6" />
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 rounded-xl bg-background-tertiary border border-text-secondary/10"
        >
          <div className="flex items-center gap-x-3">
            <Skeleton className="w-6 h-5" />
            <Skeleton className="w-24 h-4" />
          </div>
          <Skeleton className="w-12 h-5" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 p-4 rounded-lg bg-background-secondary border border-text-secondary/10"
        >
          <Skeleton className="w-8 h-5" />
          <Skeleton className="w-32 h-5" />
          <Skeleton className="w-16 h-5" />
          <Skeleton className="w-12 h-4 ml-auto" />
          <Skeleton className="w-12 h-4" />
          <Skeleton className="w-16 h-4" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton({ title }: { title?: string }) {
  return (
    <div className="mx-auto max-w-7xl p-4">
      <div className="mb-8">
        {title ? (
          <h1 className="text-3xl font-bold text-text-primary">{title}</h1>
        ) : (
          <Skeleton className="w-48 h-8" />
        )}
        <Skeleton className="w-72 h-4 mt-2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
