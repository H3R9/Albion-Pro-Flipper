import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated' | 'inset';
}

export function Card({ className, variant = 'default', children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border',
        variant === 'default' && 'bg-[var(--mw-card)]/80 border-[var(--mw-border)] shadow-lg',
        variant === 'glass' && 'bg-[var(--mw-card)]/40 border-[var(--mw-border)]/50 backdrop-blur-sm',
        variant === 'elevated' && 'bg-[var(--mw-card)] border-[var(--mw-border)] shadow-xl',
        variant === 'inset' && 'bg-[var(--mw-bg)] border-[var(--mw-border)] shadow-inner',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('p-6 border-b border-[var(--mw-border)]', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-6', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('p-6 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  );
}
