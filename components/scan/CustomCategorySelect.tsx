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
          "h-10 w-full bg-slate-950 border border-slate-700 rounded-md px-3 text-sm text-slate-200 flex items-center justify-between outline-none transition-colors",
          isOpen ? "border-amber-500 ring-1 ring-amber-500" : "focus:border-amber-500 focus:ring-1 focus:ring-amber-500",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className="truncate pr-2">{getLabel(category)}</span>
        <ChevronDown size={16} className={cn("text-slate-400 transition-transform shrink-0", isOpen && "rotate-180")} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-1 w-64 max-h-80 overflow-y-auto bg-slate-900 border border-slate-700 rounded-md shadow-xl z-50 p-1 flex flex-col gap-1 origin-top scrollbar-hide">
          <button
            className={cn("text-left px-3 py-2 rounded text-sm hover:bg-slate-800 transition-colors", category === 'all' ? "bg-slate-800 text-amber-500" : "text-slate-200")}
            onClick={() => { setCategory('all'); setIsOpen(false); }}
          >
            Todas as Categorias
          </button>

          <div className="px-3 py-1 text-xs font-black uppercase text-slate-500 mt-1">Categorias Principais</div>
          {Object.keys(PARENT_CATEGORIES).map(key => (
            <button
              key={key}
              className={cn("text-left px-3 py-2 rounded text-sm hover:bg-slate-800 transition-colors pl-4", category === key ? "bg-slate-800 text-amber-500" : "text-slate-200")}
              onClick={() => { setCategory(key); setIsOpen(false); }}
            >
              {key}
            </button>
          ))}

          <div className="px-3 py-1 text-xs font-black uppercase text-slate-500 mt-1">Subcategorias</div>
          {Object.entries(CATEGORIES).map(([key, label]) => (
            <button
              key={key}
              className={cn("text-left px-3 py-2 rounded text-sm hover:bg-slate-800 transition-colors pl-4", category === key ? "bg-slate-800 text-amber-500" : "text-slate-200")}
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
