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
    <div className="bg-[var(--mw-card)] border border-[var(--mw-border)] rounded-xl p-4 flex flex-wrap gap-4 shadow-sm items-center z-10 relative">
      <button 
        disabled={isScanning || !isConfigValid}
        onClick={handleScan}
        title="Ctrl + Enter para iniciar"
        className={cn(
          "h-10 px-6 rounded font-bold uppercase tracking-wider flex items-center gap-2 transition shadow-md shrink-0 text-sm",
          (isScanning || !isConfigValid)
            ? "bg-[var(--mw-card-hover)] text-[var(--mw-text-muted)] cursor-not-allowed border-none" 
            : "bg-[var(--mw-gold-primary)] text-black hover:bg-[var(--mw-gold-bright)] hover:scale-[1.02] active:scale-[0.98]"
        )}
      >
        {isScanning ? <Loader2 className="animate-spin" size={18} /> : <PlayCircle size={18} />}
        {isScanning ? 'Analisando...' : !isConfigValid ? 'Config. Inválida' : 'Procurar Oportunidades'}
      </button>
      
      <div className="w-px h-8 bg-[var(--mw-border)] mx-2 hidden sm:block"></div>
      
      <CustomCategorySelect 
        category={category}
        setCategory={setCategory}
        disabled={isScanning}
        className="w-56 shrink-0"
      />

      <select 
        className="h-10 bg-[var(--mw-bg)] border border-[var(--mw-border)] rounded px-3 text-sm text-[var(--mw-text-main)] focus:border-[var(--mw-gold-primary)] outline-none w-28 shrink-0 transition-colors"
        value={tier}
        onChange={e => setTier(e.target.value)}
        disabled={isScanning}
      >
        <option value="all">Tiers (Todos)</option>
        {TIERS.map(t => (
          <option key={t} value={t}>Tier {t}</option>
        ))}
      </select>

      <select 
        className="h-10 bg-[var(--mw-bg)] border border-[var(--mw-border)] rounded px-3 text-sm text-[var(--mw-text-main)] focus:border-[var(--mw-gold-primary)] outline-none w-36 shrink-0 transition-colors"
        value={enchant}
        onChange={e => setEnchant(e.target.value)}
        disabled={isScanning}
      >
        <option value="all">Encantamentos</option>
        {ENCHANTS.map(e => (
          <option key={e} value={e}>Nível .{e}</option>
        ))}
      </select>

      <select 
        className="h-10 bg-[var(--mw-bg)] border border-[var(--mw-border)] rounded px-3 text-sm text-[var(--mw-text-main)] focus:border-[var(--mw-gold-primary)] outline-none w-44 shrink-0 transition-colors"
        value={quality.toString()}
        onChange={e => setQuality(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
        disabled={isScanning}
      >
        <option value="all">Todas Qualidades</option>
        <option value="1">Normal</option>
        <option value="2">Bom</option>
        <option value="3">Excepcional</option>
        <option value="4">Excelente</option>
        <option value="5">Obra-Prima</option>
      </select>

      {isScanning && (
        <div className="flex-1 min-w-[200px] ml-4 flex flex-col gap-1 justify-center">
          <div className="flex justify-between text-xs text-[var(--mw-text-muted)] font-medium">
            <span className="truncate mr-2">{progress.text}</span>
            <span className="shrink-0">{progress.current} / {progress.total}</span>
          </div>
          <div className="h-1.5 w-full bg-[var(--mw-bg)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--mw-gold-primary)] transition-all duration-300 ease-out" 
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
