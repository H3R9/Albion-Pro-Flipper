import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--mw-green)] hover:bg-emerald-500 text-black font-black shadow-[0_0_20px_rgba(76,175,125,0.3)]',
  secondary: 'bg-[var(--mw-card)] hover:bg-[var(--mw-card-hover)] text-[var(--mw-text-main)] border border-[var(--mw-border)]',
  ghost: 'bg-transparent hover:bg-[var(--mw-card)] text-[var(--mw-text-muted)] hover:text-[var(--mw-text-main)]',
  danger: 'bg-[var(--mw-red)]/20 hover:bg-[var(--mw-red)]/30 text-[var(--mw-red)] border border-[var(--mw-red)]/30',
  gold: 'bg-[var(--mw-gold-primary)] hover:bg-[var(--mw-gold-bright)] text-black font-bold shadow-md',
  outline: 'bg-transparent hover:bg-[var(--mw-card)] text-[var(--mw-text-main)] border border-[var(--mw-border)] hover:border-[var(--mw-gold-primary)]/40',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-6 py-3 text-sm rounded-xl gap-2',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  loading,
  icon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}
