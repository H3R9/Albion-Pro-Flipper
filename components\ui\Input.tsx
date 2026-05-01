import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  hint?: string;
  prefix?: React.ReactNode;
  error?: string;
}

export function Input({ label, hint, prefix, error, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[10px] font-bold uppercase tracking-widest text-[var(--mw-text-muted)]"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--mw-text-muted)]">
            {prefix}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full bg-[var(--mw-card)] border border-[var(--mw-border)] rounded-lg text-[var(--mw-text-main)] text-sm',
            'focus:border-[var(--mw-gold-primary)] focus:outline-none transition-colors font-mono',
            'placeholder:text-[var(--mw-text-muted)]/50',
            prefix ? 'pl-9 pr-3 py-2.5' : 'px-3 py-2.5',
            error && 'border-[var(--mw-red)] focus:border-[var(--mw-red)]',
            className
          )}
          {...props}
        />
      </div>
      {hint && !error && (
        <p className="text-[10px] text-[var(--mw-text-muted)] leading-relaxed">{hint}</p>
      )}
      {error && (
        <p className="text-[10px] text-[var(--mw-red)] font-bold">{error}</p>
      )}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  options: { value: string | number; label: string }[];
}

export function Select({ label, hint, options, className, id, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-[10px] font-bold uppercase tracking-widest text-[var(--mw-text-muted)]"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full bg-[var(--mw-card)] border border-[var(--mw-border)] rounded-lg p-2.5 text-sm',
          'text-[var(--mw-text-main)] focus:border-[var(--mw-gold-primary)] focus:outline-none transition-colors',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && (
        <p className="text-[10px] text-[var(--mw-text-muted)] leading-relaxed">{hint}</p>
      )}
    </div>
  );
}
