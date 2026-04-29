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
    <div className="flex justify-between items-end mb-4 border-b border-slate-800 pb-4">
      <div className="relative">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Pesquisar Resultado (Filtro Local)</label>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            id="search-input"
            type="text" 
            placeholder="Ex: T4_Axe, Mercenary... (Ctrl+K)"
            disabled={isScanning}
            className="h-10 pl-10 pr-4 bg-slate-900 border border-slate-700 rounded-md text-sm text-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none w-64"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-sm font-bold text-slate-300">
          Resultados: <span className="text-amber-500">{filteredResultsLength}</span>
        </span>
        <span className="text-xs text-slate-500">{totalItemsInDb} itens no banco de dados</span>
      </div>
    </div>
  );
}
