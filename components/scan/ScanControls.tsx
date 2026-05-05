import React, { useState } from 'react';
import { Search, Loader2, PlayCircle, Settings, X, ShieldAlert } from 'lucide-react';
import { cn } from "@/lib/utils";
import { TIERS, ENCHANTS } from '@/lib/albion/utils';
import { ScanTab, ScanSettings } from '@/lib/albion/types';

import { CustomCategorySelect } from './CustomCategorySelect';

interface ScanControlsProps {
  currentTab: ScanTab;
  scanMode: ScanTab;
  setScanMode: (tab: ScanTab) => void;
  uiSettings: ScanSettings;
  setUiSettings: (settings: ScanSettings) => void;
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
  currentTab, scanMode, setScanMode, uiSettings, setUiSettings, category, setCategory, tier, setTier, enchant, setEnchant, quality, setQuality,
  isScanning, isConfigValid, handleScan, progress
}: ScanControlsProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  if (currentTab === 'mats' || currentTab === 'planner') return null;

  return (
    <>
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

      <button 
        onClick={() => setIsSettingsOpen(true)}
        disabled={isScanning}
        className="h-10 w-10 flex items-center justify-center shrink-0 rounded bg-[var(--mw-bg)] hover:bg-[var(--mw-card-hover)] border border-[var(--mw-border)] text-[var(--mw-text-main)] transition-colors"
        title="Configurações do Scanner"
      >
        <Settings size={18} />
      </button>
      
      <div className="w-px h-8 bg-[var(--mw-border)] mx-2 hidden sm:block"></div>
      
      <select 
        className="h-10 bg-[var(--mw-bg)] border border-[var(--mw-border)] rounded px-3 text-sm text-[var(--mw-gold-bright)] font-bold focus:border-[var(--mw-gold-primary)] outline-none w-48 shrink-0 transition-colors"
        value={scanMode}
        onChange={e => setScanMode(e.target.value as ScanTab)}
        disabled={isScanning}
      >
        <option value="enchant">Scanner: Encantamentos</option>
        <option value="black">Scanner: BM Direto (Caerleon)</option>
        <option value="royal">Scanner: Royal ➝ BM</option>
        <option value="buyorders">Scanner: Buy Orders (Crafting)</option>
      </select>

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
          <div className="flex justify-between text-sm text-[var(--mw-text-muted)] font-medium">
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

    {/* Config Modal */}
    {isSettingsOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-[#0f0f11] border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl relative">
          <button 
            onClick={() => setIsSettingsOpen(false)}
            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          
          <h3 className="text-white font-black tracking-widest uppercase mb-6 flex items-center gap-2">
            <Settings size={18} className="text-[var(--mw-gold-primary)]" />
            Configurações do Scanner
          </h3>
          
          <div className="space-y-5">
            <div className="space-y-2 group">
              <label className="block text-sm font-bold text-[var(--mw-text-main)] uppercase tracking-widest">Lucro Mínimo (Prata)</label>
              <input 
                type="number" min="0" step="1000"
                className="w-full bg-[#151518] border border-white/10 rounded-md h-12 px-4 text-white font-mono outline-none focus:border-[var(--mw-gold-primary)] focus:bg-[#1a1a1e] transition-colors"
                value={uiSettings.minProfit}
                onChange={e => setUiSettings({ ...uiSettings, minProfit: Number(e.target.value) || 0 })}
              />
            </div>
            
            <div className="space-y-2 group">
              <label className="block text-sm font-bold text-[var(--mw-text-main)] uppercase tracking-widest">Margem Mínima (%)</label>
              <input 
                type="number" min="0" max="1000" step="5"
                className="w-full bg-[#151518] border border-white/10 rounded-md h-12 px-4 text-white font-mono outline-none focus:border-[var(--mw-gold-primary)] focus:bg-[#1a1a1e] transition-colors"
                value={uiSettings.minMargin}
                onChange={e => setUiSettings({ ...uiSettings, minMargin: Number(e.target.value) || 0 })}
              />
            </div>
            
            <div className="space-y-2 group">
              <label className="block text-sm font-bold text-[var(--mw-text-main)] uppercase tracking-widest">Volume Mínimo (Vendas/24h)</label>
              <input 
                type="number" min="0" step="1"
                className="w-full bg-[#151518] border border-white/10 rounded-md h-12 px-4 text-white font-mono outline-none focus:border-[var(--mw-gold-primary)] focus:bg-[#1a1a1e] transition-colors"
                value={uiSettings.minVolume || 0}
                onChange={e => setUiSettings({ ...uiSettings, minVolume: Number(e.target.value) || 0 })}
              />
              <p className="text-sm text-[var(--mw-text-muted)]">Filtra tens com baixa rotação no mercado.</p>
            </div>
            
            <div className="space-y-2 group">
              <label className="block text-sm font-bold text-[var(--mw-text-main)] uppercase tracking-widest">Idade Máxima do Preço (Minutos)</label>
              <input 
                type="number" min="1" max="10080" step="10"
                className="w-full bg-[#151518] border border-white/10 rounded-md h-12 px-4 text-white font-mono outline-none focus:border-[var(--mw-gold-primary)] focus:bg-[#1a1a1e] transition-colors"
                value={uiSettings.maxAge}
                onChange={e => setUiSettings({ ...uiSettings, maxAge: Number(e.target.value) || 120 })}
              />
            </div>
          </div>
          
          <button 
            onClick={() => setIsSettingsOpen(false)}
            className="w-full mt-8 bg-[var(--mw-gold-primary)] hover:bg-[var(--mw-gold-bright)] text-black font-bold uppercase tracking-widest h-12 rounded transition-colors"
          >
            Salvar
          </button>
        </div>
      </div>
    )}
    </>
  );
}
