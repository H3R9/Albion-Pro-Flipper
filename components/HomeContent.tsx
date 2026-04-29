import React, { useState } from 'react';
import { MaterialsTracker } from '@/components/albion/MaterialsTracker';
import { EnchantAiChat } from '@/components/albion/EnchantAiChat';
import { Dashboard } from '@/components/albion/Dashboard';
import { InventoryPlanner } from '@/components/albion/InventoryPlanner';
import { SavedReports } from '@/components/albion/SavedReports';
import { CraftingCalculator } from '@/components/albion/CraftingCalculator';
import { AlertsConfigModal } from '@/components/alerts/AlertsConfigModal';
import { PARENT_CATEGORIES, CATEGORIES, getAllItemIds } from '@/lib/albion/items';
import { Box, TrendingUp, Clock, MapPin, Wallet } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { cn } from "@/lib/utils";
import { VirtualizedResultsList } from '@/components/albion/VirtualizedResultsList';
import { useScanLogic } from '@/hooks/useScanLogic';
import { ScanControls } from '@/components/scan/ScanControls';
import { ScanFiltersTopBar } from '@/components/scan/ScanFilters';
import { useHotkeys } from '@/hooks/useHotkeys';
import { useSessionStats } from '@/hooks/useSessionStats';
import { formatSilver } from '@/lib/albion/utils';

export default function HomeContent() {
  const {
    isScanning, progress, results, filteredResults,
    currentTab, setCurrentTab,
    category, setCategory, tier, setTier, enchant, setEnchant, quality, setQuality,
    search, setSearch, settings, setSettings,
    alertsEnabled, toggleAlerts, handleScan, isConfigValid,
    autoRefreshInterval, setAutoRefreshInterval, nextRefreshTime,
    alertSettings, setAlertSettings, newPulseKeys
  } = useScanLogic();

  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const { refreshes, stats, isNewRecord } = useSessionStats(results, isScanning);

  useHotkeys('enter', () => {
    if (!isScanning && isConfigValid) handleScan();
  }, true); // Ctrl + Enter

  useHotkeys('k', () => {
    const el = document.getElementById('search-input');
    if (el) el.focus();
  }, true); // Ctrl + K

  useHotkeys('1', () => setCurrentTab('dashboard'));
  useHotkeys('2', () => setCurrentTab('mats'));
  useHotkeys('3', () => setCurrentTab('enchant'));
  useHotkeys('4', () => setCurrentTab('planner'));
  useHotkeys('5', () => setCurrentTab('reports'));
  useHotkeys('6', () => setCurrentTab('calc'));

  useHotkeys('escape', (e) => {
    if (document.activeElement && 'blur' in document.activeElement) {
        (document.activeElement as HTMLElement).blur();
    }
  }); // Escape


  return (
    <div className="flex flex-col min-h-screen font-sans bg-[var(--mw-bg)]">
      <AlertsConfigModal 
        isOpen={isAlertsModalOpen} 
        onClose={() => setIsAlertsModalOpen(false)} 
        alertSettings={alertSettings}
        setAlertSettings={setAlertSettings}
      />
      <Header 
        alertsEnabled={alertsEnabled} 
        toggleAlerts={toggleAlerts} 
        settings={settings} 
        autoRefreshInterval={autoRefreshInterval}
        setAutoRefreshInterval={setAutoRefreshInterval}
        nextRefreshTime={nextRefreshTime}
        onOpenAlertsModal={() => setIsAlertsModalOpen(true)}
      />

      {/* MAIN */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        
        {/* TABS & SCAN */}
        <div className="flex flex-wrap items-center gap-3 mb-6 pb-4 border-b border-[var(--mw-border)]">
          <div className="flex bg-[var(--mw-card)] border border-[var(--mw-border)] rounded-md p-1 overflow-x-auto w-full md:w-auto scrollbar-hide">
            {(['dashboard', 'mats', 'enchant', 'planner', 'reports', 'calc'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab)}
                disabled={isScanning}
                className={cn(
                  "px-6 py-2.5 rounded text-sm font-bold uppercase tracking-wider whitespace-nowrap transition flex-1 md:flex-none",
                  currentTab === tab 
                    ? "bg-[var(--mw-bg)] text-[var(--mw-gold-bright)] shadow-sm border-b-2 border-[var(--mw-gold-bright)]" 
                    : "text-[var(--mw-text-muted)] hover:bg-[var(--mw-card-hover)] hover:text-[var(--mw-text-main)]"
                )}
              >
                {tab === 'dashboard' && '0. Dashboard'}
                {tab === 'mats' && '1. Comprar Runas'}
                {tab === 'enchant' && '2. Arbitragem BM'}
                {tab === 'planner' && '3. Planejamento'}
                {tab === 'reports' && '4. Relatórios'}
                {tab === 'calc' && '5. Calc Manual'}
              </button>
            ))}
          </div>
        </div>

        {currentTab === 'dashboard' && (
           <Dashboard stats={stats} refreshes={refreshes} isNewRecord={isNewRecord} />
        )}

        {currentTab === 'enchant' && (
          <ScanControls 
            currentTab={currentTab}
            category={category} setCategory={setCategory}
            tier={tier} setTier={setTier}
            enchant={enchant} setEnchant={setEnchant}
            quality={quality} setQuality={setQuality}
            isScanning={isScanning} isConfigValid={isConfigValid}
            handleScan={handleScan} progress={progress}
          />
        )}

        <div className={cn(currentTab !== 'mats' && "hidden")}>
          <MaterialsTracker />
        </div>

        <div className={cn(currentTab !== 'planner' && "hidden")}>
          <InventoryPlanner results={results} settings={settings} />
        </div>

        <div className={cn(currentTab !== 'reports' && "hidden")}>
          <SavedReports />
        </div>

        <div className={cn(currentTab !== 'calc' && "hidden")}>
          <CraftingCalculator />
        </div>

        <div className={cn(currentTab !== 'enchant' && "hidden")}>
          <div className="flex flex-col gap-6 relative">
            
            {/* Quick Metrics */}
            {filteredResults.length > 0 && !isScanning && (
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                 <div className="bg-[var(--mw-card)]/50 border border-[var(--mw-border)] rounded-lg p-3 flex items-center gap-3">
                   <div className="w-8 h-8 rounded bg-[var(--mw-gold-dark)]/20 text-[var(--mw-gold-bright)] flex items-center justify-center shrink-0 border border-[var(--mw-gold-bright)]/30"><Wallet size={16} /></div>
                   <div>
                     <p className="text-[9px] uppercase tracking-widest text-[var(--mw-text-muted)] font-bold">Maior Lucro Agora</p>
                     <p className="font-mono text-sm font-bold text-[var(--mw-gold-bright)]">{formatSilver(Math.max(...filteredResults.map(r => r.adjustedProfit ?? r.profit)))}</p>
                   </div>
                 </div>
                 <div className="bg-[var(--mw-card)]/50 border border-[var(--mw-border)] rounded-lg p-3 flex items-center gap-3">
                   <div className="w-8 h-8 rounded bg-[var(--mw-green)]/20 text-[var(--mw-green)] flex items-center justify-center shrink-0 border border-[var(--mw-green)]/30"><TrendingUp size={16} /></div>
                   <div>
                     <p className="text-[9px] uppercase tracking-widest text-[var(--mw-text-muted)] font-bold">ROI Médio (Top 10)</p>
                     <p className="font-mono text-sm font-bold text-[var(--mw-green)]">
                       {(() => {
                         const top10 = filteredResults.slice().sort((a,b) => (b.adjustedProfit??b.profit) - (a.adjustedProfit??a.profit)).slice(0, 10);
                         const avg = top10.reduce((acc, r) => acc + (r.buyPrice > 0 ? ((r.adjustedProfit??r.profit)/r.buyPrice)*100 : 0), 0) / (top10.length || 1);
                         return avg.toFixed(1) + '%';
                       })()}
                     </p>
                   </div>
                 </div>
                 <div className="bg-[var(--mw-card)]/50 border border-[var(--mw-border)] rounded-lg p-3 flex items-center gap-3">
                   <div className="w-8 h-8 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30"><Clock size={16} /></div>
                   <div>
                     <p className="text-[9px] uppercase tracking-widest text-[var(--mw-text-muted)] font-bold">Oport. Frescas</p>
                     <p className="font-mono text-sm font-bold text-blue-400">{filteredResults.filter(r => r.worstAge < 15).length} items &lt;15m</p>
                   </div>
                 </div>
                 <div className="bg-[var(--mw-card)]/50 border border-[var(--mw-border)] rounded-lg p-3 flex items-center gap-3">
                   <div className="w-8 h-8 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30"><MapPin size={16} /></div>
                   <div>
                     <p className="text-[9px] uppercase tracking-widest text-[var(--mw-text-muted)] font-bold">Melhor Cidade (Top 10)</p>
                     <p className="font-sans text-sm font-bold text-[var(--mw-text-main)] truncate max-w-[100px]">
                       {(() => {
                          const top10 = filteredResults.slice().sort((a,b) => (b.adjustedProfit??b.profit) - (a.adjustedProfit??a.profit)).slice(0, 10);
                          const counts: Record<string, number> = {};
                          top10.forEach(r => { const c = r.sourceCity || r.baseCity || 'ND'; counts[c] = (counts[c]||0)+1; });
                          let top = '-'; let max = 0;
                          for(const [c, cnt] of Object.entries(counts)) { if(cnt>max){max=cnt;top=c;} }
                          return top;
                       })()}
                     </p>
                   </div>
                 </div>
               </div>
            )}

            <div className="w-full min-w-0 mt-2">
              <ScanFiltersTopBar 
                currentTab={currentTab} 
                isScanning={isScanning} 
                search={search} 
                setSearch={setSearch} 
                filteredResultsLength={filteredResults.length} 
                totalItemsInDb={getAllItemIds().length} 
              />
              <VirtualizedResultsList 
                results={filteredResults} 
                isScanning={isScanning} 
                hasProgress={progress.current > 0} 
                newPulseKeys={newPulseKeys}
              />
            </div>
            {!isScanning && filteredResults.length > 0 && currentTab === 'enchant' && (
              <EnchantAiChat results={filteredResults} settings={settings} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
