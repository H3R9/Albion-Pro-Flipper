import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'gold' | 'green' | 'red' | 'blue' | 'purple' | 'orange' | 'outline';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  pulse?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[var(--mw-card)] border-[var(--mw-border)] text-[var(--mw-text-main)]',
  gold: 'bg-[var(--mw-gold-bright)]/10 border-[var(--mw-gold-bright)]/20 text-[var(--mw-gold-bright)]',
  green: 'bg-[var(--mw-green)]/10 border-[var(--mw-green)]/20 text-[var(--mw-green)]',
  red: 'bg-[var(--mw-red)]/10 border-[var(--mw-red)]/20 text-[var(--mw-red)]',
  blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  orange: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
  outline: 'bg-transparent border-[var(--mw-border)] text-[var(--mw-text-muted)]',
};

export function Badge({ variant = 'default', size = 'sm', pulse, icon, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-bold uppercase tracking-wider border rounded shadow-sm whitespace-nowrap',
        size === 'sm' && 'px-1.5 py-0.5 text-[10px]',
        size === 'md' && 'px-2 py-1 text-xs',
        pulse && 'animate-pulse',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  );
}

// Pre-built specific badges for Albion

export function TierBadge({ tier, enchant }: { tier: number; enchant: number }) {
  return (
    <Badge variant="default" className="font-black font-mono">
      T{tier}.{enchant}
    </Badge>
  );
}

export function QualityBadge({ name, color }: { name: string; color: string }) {
  return (
    <Badge variant="outline" style={{ color }} className="font-semibold">
      {name}
    </Badge>
  );
}

export function VolumeBadge({ volume }: { volume: number }) {
  const variant = volume >= 20 ? 'green' : volume >= 5 ? 'gold' : 'orange';
  const emoji = volume >= 20 ? '🔥' : volume >= 5 ? '⚡' : '💤';
  return (
    <Badge variant={variant}>
      {emoji} Vendas/24h: {volume}
    </Badge>
  );
}

export function ScoreBadge({ score, recommendation }: { score: number; recommendation: string }) {
  const variant = recommendation === 'EXECUTE' ? 'green' : recommendation === 'WATCH' ? 'gold' : 'red';
  return (
    <Badge variant={variant} size="md" className="font-black">
      {score}
    </Badge>
  );
}

export function AgeBadge({ ageMinutes }: { ageMinutes: number }) {
  if (ageMinutes < 15) return <Badge variant="green">{'< 15 min'}</Badge>;
  if (ageMinutes <= 30) return <Badge variant="gold">15-30 min</Badge>;
  return <Badge variant="red">{'> 30 min'}</Badge>;
}
