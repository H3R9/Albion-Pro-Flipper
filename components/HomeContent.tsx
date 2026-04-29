import React, { useState } from 'react';
import { MaterialsTracker } from '@/components/albion/MaterialsTracker';
import { EnchantAiChat } from '@/components/albion/EnchantAiChat';
import { Dashboard } from '@/components/albion/Dashboard';
import { InventoryPlanner } from '@/components/albion/InventoryPlanner';
import { SavedReports } from '@/components/albion/SavedReports';
import { CraftingCalculator } from '@/components/albion/CraftingCalculator';
import { AlertsConfigModal } from '@/components/alerts/AlertsConfigModal';
import { PARENT_CATEGORIES, CATEGORIES, getAllItemIds } from '@/lib/albion/items';
import { Box, TrendingUp, Clock, MapPin, Wallet, Menu, X, LayoutDashboard, ShoppingCart, Crosshair, PackageOpen, FileText, Calculator } from 'lucide-react';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'enchant', label: 'Scanner BM', icon: <Crosshair size={18} /> },
    { id: 'mats', label: 'Mercado de Runas', icon: <ShoppingCart size={18} /> },
    { id: 'planner', label: 'Inventário', icon: <PackageOpen size={18} /> },
    { id: 'reports', label: 'Relatórios', icon: <FileText size={18} /> },
    { id: 'calc', label: 'Calculadora', icon: <Calculator size={18} /> },
  ] as const;

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--mw-bg)] font-sans">
      <AlertsConfigModal 
        isOpen={isAlertsModalOpen} 
        onClose={() => setIsAlertsModalOpen(false)} 
        alertSettings={alertSettings}
        setAlertSettings={setAlertSettings}
      />
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[var(--mw-card)] border-r border-[var(--mw-border)] transition-transform duration-300 md:translate-x-0 md:static md:shrink-0 flex flex-col",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--mw-border)]">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-[var(--mw-gold-primary)]/10">
              <Box size={24} className="text-[var(--mw-gold-bright)]" />
            </div>
            <h1 className="font-black text-sm uppercase tracking-widest text-[var(--mw-text-main)]">
              Aureus <span className="text-[var(--mw-gold-bright)]">Analytics</span>
            </h1>
          </div>
          <button className="md:hidden text-[var(--mw-text-muted)] hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentTab(item.id as any);
                setIsSidebarOpen(false);
              }}
              disabled={isScanning}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold tracking-wide transition-all",
                currentTab === item.id 
                  ? "bg-[var(--mw-gold-primary)]/10 text-[var(--mw-gold-bright)] border border-[var(--mw-gold-primary)]/20 shadow-sm" 
                  : "text-[var(--mw-text-muted)] hover:bg-[var(--mw-card-hover)] hover:text-[var(--mw-text-main)] border border-transparent"
              )}
            >
              <div className={cn("transition-colors", currentTab === item.id ? "text-[var(--mw-gold-bright)]" : "text-[var(--mw-text-muted)]")}>{item.icon}</div>
              {item.label}
            </button>
          ))}
        </div>
        
        <div className="p-4 border-t border-[var(--mw-border)]">
           <div className="p-4 bg-[var(--mw-bg)] rounded-xl border border-[var(--mw-border)]/50 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--mw-gold-primary)]/10 rounded-full blur-xl"></div>
             <p className="text-[10px] font-bold text-[var(--mw-gold-dark)] uppercase tracking-widest mb-1">Status do Sistema</p>
             <div className="flex items-center gap-2 text-xs font-mono text-[var(--mw-text-main)]">
               <span className="w-2 h-2 rounded-full bg-[var(--mw-green)] shadow-[0_0_8px_rgba(76,175,125,0.6)] animate-pulse"></span>
               Mercado Ativo
             </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header 
          alertsEnabled={alertsEnabled} 
          toggleAlerts={toggleAlerts} 
          settings={settings} 
          autoRefreshInterval={autoRefreshInterval}
          setAutoRefreshInterval={setAutoRefreshInterval}
          nextRefreshTime={nextRefreshTime}
          onOpenAlertsModal={() => setIsAlertsModalOpen(true)}
          onMenuToggle={() => setIsSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
          <div className="max-w-7xl mx-auto w-full">

            {currentTab === 'dashboard' && (
               <Dashboard stats={stats} refreshes={refreshes} isNewRecord={isNewRecord} />
            )}

            {currentTab === 'enchant' && (
              <div className="mb-6">
                <ScanControls 
                  currentTab={currentTab}
                  category={category} setCategory={setCategory}
                  tier={tier} setTier={setTier}
                  enchant={enchant} setEnchant={setEnchant}
                  quality={quality} setQuality={setQuality}
                  isScanning={isScanning} isConfigValid={isConfigValid}
                  handleScan={handleScan} progress={progress}
                />
              </div>
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
                   <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                     <div className="bg-[var(--mw-card)] border border-[var(--mw-border)] rounded-xl p-4 flex items-center gap-4 shadow-sm hover:border-[var(--mw-gold-dark)]/50 transition-colors">
                       <div className="w-10 h-10 rounded-lg bg-[var(--mw-gold-dark)]/10 text-[var(--mw-gold-bright)] flex items-center justify-center shrink-0 border border-[var(--mw-gold-bright)]/20"><Wallet size={20} /></div>
                       <div>
                         <p className="text-[10px] uppercase tracking-wider text-[var(--mw-text-muted)] font-bold mb-0.5">Maior Lucro Agora</p>
                         <p className="font-mono text-base font-bold text-[var(--mw-gold-bright)]">{formatSilver(Math.max(...filteredResults.map(r => r.adjustedProfit ?? r.profit)))}</p>
                       </div>
                     </div>
                     <div className="bg-[var(--mw-card)] border border-[var(--mw-border)] rounded-xl p-4 flex items-center gap-4 shadow-sm hover:border-[var(--mw-green)]/50 transition-colors">
                       <div className="w-10 h-10 rounded-lg bg-[var(--mw-green)]/10 text-[var(--mw-green)] flex items-center justify-center shrink-0 border border-[var(--mw-green)]/20"><TrendingUp size={20} /></div>
                       <div>
                         <p className="text-[10px] uppercase tracking-wider text-[var(--mw-text-muted)] font-bold mb-0.5">ROI Médio (Top 10)</p>
                         <p className="font-mono text-base font-bold text-[var(--mw-green)]">
                           {(() => {
                             const top10 = filteredResults.slice().sort((a,b) => (b.adjustedProfit??b.profit) - (a.adjustedProfit??a.profit)).slice(0, 10);
                             const avg = top10.reduce((acc, r) => acc + (r.buyPrice > 0 ? ((r.adjustedProfit??r.profit)/r.buyPrice)*100 : 0), 0) / (top10.length || 1);
                             return avg.toFixed(1) + '%';
                           })()}
                         </p>
                       </div>
                     </div>
                     <div className="bg-[var(--mw-card)] border border-[var(--mw-border)] rounded-xl p-4 flex items-center gap-4 shadow-sm hover:border-blue-500/50 transition-colors">
                       <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20"><Clock size={20} /></div>
                       <div>
                         <p className="text-[10px] uppercase tracking-wider text-[var(--mw-text-muted)] font-bold mb-0.5">Oport. Frescas</p>
                         <p className="font-mono text-base font-bold text-blue-400">{filteredResults.filter(r => r.worstAge < 15).length} items &lt;15m</p>
                       </div>
                     </div>
                     <div className="bg-[var(--mw-card)] border border-[var(--mw-border)] rounded-xl p-4 flex items-center gap-4 shadow-sm hover:border-purple-500/50 transition-colors">
                       <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20"><MapPin size={20} /></div>
                       <div>
                         <p className="text-[10px] uppercase tracking-wider text-[var(--mw-text-muted)] font-bold mb-0.5">Melhor Cidade (Top 10)</p>
                         <p className="font-sans text-base font-bold text-[var(--mw-text-main)] truncate max-w-[120px]">
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

          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

