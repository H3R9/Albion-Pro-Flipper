import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PARENT_CATEGORIES, CATEGORIES } from '@/lib/albion/items';

interface CustomCategorySelectProps {
  category: string;
  setCategory: (c: string) => void;
  disabled: boolean;
  className?: string;
}

export function CustomCategorySelect({ category, setCategory, disabled, className }: CustomCategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getLabel = (val: string) => {
    if (val === 'all') return 'Todas as Categorias';
    if (PARENT_CATEGORIES[val]) return val;
    if (CATEGORIES[val]) return CATEGORIES[val];
    return val;
  };

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-10 w-full bg-[var(--mw-bg)] border border-[var(--mw-border)] rounded px-3 text-sm text-[var(--mw-text-main)] flex items-center justify-between outline-none transition-colors",
          isOpen ? "border-[var(--mw-gold-primary)] ring-1 ring-[var(--mw-gold-primary)]" : "focus:border-[var(--mw-gold-primary)]",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className="truncate pr-2">{getLabel(category)}</span>
        <ChevronDown size={16} className={cn("text-[var(--mw-text-muted)] transition-transform shrink-0", isOpen && "rotate-180")} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-1 w-64 max-h-80 overflow-y-auto bg-[var(--mw-card)] border border-[var(--mw-border)] rounded shadow-xl z-50 p-1 flex flex-col gap-1 origin-top scrollbar-hide">
          <button
            className={cn("text-left px-3 py-2 rounded text-sm hover:bg-[var(--mw-card-hover)] transition-colors", category === 'all' ? "bg-[var(--mw-card-hover)] text-[var(--mw-gold-bright)]" : "text-[var(--mw-text-main)]")}
            onClick={() => { setCategory('all'); setIsOpen(false); }}
          >
            Todas as Categorias
          </button>

          <div className="px-3 py-1 text-xs font-black uppercase text-[var(--mw-text-muted)] mt-1">Categorias Principais</div>
          {Object.keys(PARENT_CATEGORIES).map(key => (
            <button
              key={key}
              className={cn("text-left px-3 py-2 rounded text-sm hover:bg-[var(--mw-card-hover)] transition-colors pl-4", category === key ? "bg-[var(--mw-card-hover)] text-[var(--mw-gold-bright)]" : "text-[var(--mw-text-main)]")}
              onClick={() => { setCategory(key); setIsOpen(false); }}
            >
              {key}
            </button>
          ))}

          <div className="px-3 py-1 text-xs font-black uppercase text-[var(--mw-text-muted)] mt-1">Subcategorias</div>
          {Object.entries(CATEGORIES).map(([key, label]) => (
            <button
              key={key}
              className={cn("text-left px-3 py-2 rounded text-sm hover:bg-[var(--mw-card-hover)] transition-colors pl-4", category === key ? "bg-[var(--mw-card-hover)] text-[var(--mw-gold-bright)]" : "text-[var(--mw-text-main)]")}
              onClick={() => { setCategory(key); setIsOpen(false); }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
