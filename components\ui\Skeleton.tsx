import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'card' | 'text' | 'circle' | 'badge' | 'bar';
  count?: number;
}

function SkeletonBase({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-[var(--mw-card)] rounded-lg',
        'before:absolute before:inset-0 before:-translate-x-full',
        'before:animate-[shimmer_2s_infinite]',
        'before:bg-gradient-to-r before:from-transparent before:via-[var(--mw-border)]/30 before:to-transparent',
        className
      )}
    />
  );
}

export function Skeleton({ className, variant = 'text', count = 1 }: SkeletonProps) {
  if (variant === 'card') {
    return (
      <div className={cn('border border-[var(--mw-border)] rounded-xl p-4 space-y-4', className)}>
        <div className="flex items-center gap-4">
          <SkeletonBase className="w-14 h-14 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonBase className="h-4 w-3/4" />
            <SkeletonBase className="h-3 w-1/2" />
          </div>
          <SkeletonBase className="h-8 w-24 rounded-lg" />
        </div>
        <div className="flex justify-between">
          <SkeletonBase className="h-6 w-28" />
          <SkeletonBase className="h-6 w-20" />
          <SkeletonBase className="h-8 w-32 rounded-lg" />
        </div>
      </div>
    );
  }

  if (variant === 'circle') {
    return <SkeletonBase className={cn('w-10 h-10 rounded-full', className)} />;
  }

  if (variant === 'badge') {
    return <SkeletonBase className={cn('h-5 w-16 rounded', className)} />;
  }

  if (variant === 'bar') {
    return <SkeletonBase className={cn('h-2 w-full rounded-full', className)} />;
  }

  // Text variant
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBase 
          key={i} 
          className={cn('h-3', i === count - 1 ? 'w-3/4' : 'w-full')} 
        />
      ))}
    </div>
  );
}

// Pre-built skeleton for TradeCard loading state
export function TradeCardSkeleton() {
  return (
    <div className="border border-[var(--mw-border)] rounded-xl bg-[var(--mw-card)]/40 overflow-hidden mt-3 border-l-4 border-l-[var(--mw-border)]">
      <div className="flex flex-col lg:flex-row lg:items-center p-4 gap-4">
        {/* Header skeleton */}
        <div className="flex items-center gap-4 lg:w-[35%] shrink-0">
          <SkeletonBase className="w-14 h-14 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonBase className="h-4 w-48" />
            <div className="flex gap-2">
              <SkeletonBase className="h-4 w-14 rounded" />
              <SkeletonBase className="h-4 w-20 rounded" />
              <SkeletonBase className="h-4 w-24 rounded" />
            </div>
            <SkeletonBase className="h-3 w-28" />
          </div>
        </div>
        {/* Prices skeleton */}
        <div className="flex-1 flex items-center justify-between bg-[var(--mw-bg)]/20 rounded-lg p-3 gap-6">
          <div className="space-y-2">
            <SkeletonBase className="h-3 w-24" />
            <SkeletonBase className="h-5 w-16 rounded" />
            <SkeletonBase className="h-4 w-20" />
          </div>
          <SkeletonBase className="w-8 h-px" />
          <div className="space-y-2 items-end flex flex-col">
            <SkeletonBase className="h-3 w-20" />
            <SkeletonBase className="h-5 w-20 rounded" />
            <SkeletonBase className="h-4 w-16" />
          </div>
        </div>
        {/* Profit skeleton */}
        <div className="lg:w-[160px] shrink-0 space-y-2 flex flex-col items-end">
          <SkeletonBase className="h-3 w-28" />
          <SkeletonBase className="h-8 w-24" />
          <SkeletonBase className="h-1.5 w-32 rounded-full" />
          <SkeletonBase className="h-5 w-20 rounded" />
        </div>
      </div>
      <SkeletonBase className="h-1 w-full rounded-none" />
    </div>
  );
}

export function TradeCardSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-0">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ opacity: 1 - (i * 0.15) }}>
          <TradeCardSkeleton />
        </div>
      ))}
    </div>
  );
}
