import { Search, Loader2, PlayCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { TIERS, ENCHANTS } from '@/lib/albion/utils';
import { ScanTab } from '@/lib/albion/types';

import { CustomCategorySelect } from './CustomCategorySelect';

interface ScanControlsProps {
  currentTab: ScanTab;
  category: string;
  setCategory: (c: string) => void;
  tier: string;
  setTier: (t: string) => void;
  enchant: string;
  setEnchant: (e: string) => void;
  quality: any;
  setQuality: (q: any) => void;
  isScanning: boolean;
  isConfigValid: boolean;
  handleScan: () => void;
  progress: { current: number; total: number; text: string };
}

export function ScanControls({
  currentTab, category, setCategory, tier, setTier, enchant, setEnchant, quality, setQuality,
  isScanning, isConfigValid, handleScan, progress
}: ScanControlsProps) {
  if (currentTab === 'mats' || currentTab === 'planner') return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-wrap gap-3 mb-6 shadow-sm items-center z-10 relative">
      <button 
        disabled={isScanning || !isConfigValid}
        onClick={handleScan}
        title="Ctrl + Enter para iniciar"
        className={cn(
          "h-10 px-6 rounded-md font-bold uppercase tracking-wider flex items-center gap-2 transition shadow-lg shrink-0",
          (isScanning || !isConfigValid)
            ? "bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700" 
            : "bg-amber-500 text-slate-950 hover:bg-amber-400 hover:scale-105 active:scale-95"
        )}
      >
        {isScanning ? <Loader2 className="animate-spin" size={18} /> : <PlayCircle size={18} />}
        {isScanning ? 'Analisando...' : !isConfigValid ? 'Config. Inválida' : 'Encontrar Oportunidades'}
      </button>
      
      <div className="w-px h-6 bg-slate-800 mx-2"></div>
      
      <CustomCategorySelect 
        category={category}
        setCategory={setCategory}
        disabled={isScanning}
        className="w-56 shrink-0"
      />

      <select 
        className="h-10 bg-slate-950 border border-slate-700 rounded-md px-3 text-sm text-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none w-28 shrink-0"
        value={tier}
        onChange={e => setTier(e.target.value)}
        disabled={isScanning}
      >
        <option value="all">Todos Tiers</option>
        {TIERS.map(t => (
          <option key={t} value={t}>T{t}</option>
        ))}
      </select>

      <select 
        className="h-10 bg-slate-950 border border-slate-700 rounded-md px-3 text-sm text-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none w-36 shrink-0"
        value={enchant}
        onChange={e => setEnchant(e.target.value)}
        disabled={isScanning}
      >
        <option value="all">Todos Encant.</option>
        {ENCHANTS.map(e => (
          <option key={e} value={e}>.{e}</option>
        ))}
      </select>

      <select 
        className="h-10 bg-slate-950 border border-slate-700 rounded-md px-3 text-sm text-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none w-44 shrink-0"
        value={quality.toString()}
        onChange={e => setQuality(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
        disabled={isScanning}
      >
        <option value="all">Todas as Qualidades</option>
        <option value="1">Normal</option>
        <option value="2">Bom</option>
        <option value="3">Excepcional</option>
        <option value="4">Excelente</option>
        <option value="5">Obra-Prima</option>
      </select>

      {isScanning && (
        <div className="flex-1 min-w-[200px] ml-4 flex flex-col gap-1 justify-center">
          <div className="flex justify-between text-xs text-slate-400 font-medium">
            <span className="truncate mr-2">{progress.text}</span>
            <span className="shrink-0">{progress.current} / {progress.total}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 transition-all duration-300 ease-out" 
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
