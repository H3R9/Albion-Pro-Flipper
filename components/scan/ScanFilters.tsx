import { ScanSettings, ScanTab } from '@/lib/albion/types';
import { Search } from 'lucide-react';

interface ScanFiltersProps {
  currentTab: ScanTab;
  isScanning: boolean;
  search: string;
  setSearch: (s: string) => void;
  filteredResultsLength: number;
  totalItemsInDb: number;
}

export function ScanFiltersTopBar({
  currentTab, isScanning, search, setSearch, filteredResultsLength, totalItemsInDb
}: ScanFiltersProps) {
  if (currentTab === 'mats' || currentTab === 'planner' || currentTab === 'reports') return null;

  return (
    <div className="flex justify-between items-end mb-4 border-b border-[var(--mw-border)] pb-4">
      <div className="relative">
        <label className="text-sm font-bold text-[var(--mw-text-muted)] uppercase tracking-widest mb-1.5 block">Filtro Rápido</label>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mw-text-muted)]" />
          <input 
            id="search-input"
            type="text" 
            placeholder="Ex: T4_Axe, Mercenary... (Ctrl+K)"
            disabled={isScanning}
            className="h-10 pl-10 pr-4 bg-[var(--mw-bg)] border border-[var(--mw-border)] rounded-lg text-sm text-[var(--mw-text-main)] focus:border-[var(--mw-gold-primary)] outline-none w-64 shadow-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-sm font-bold text-[var(--mw-text-main)]">
          Encontrados: <span className="text-[var(--mw-gold-bright)]">{filteredResultsLength}</span>
        </span>
        <span className="text-sm text-[var(--mw-text-muted)] uppercase tracking-widest">Base de Dados: {totalItemsInDb}</span>
      </div>
    </div>
  );
}
