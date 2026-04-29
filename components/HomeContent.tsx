import React from 'react';
import { MaterialsTracker } from '@/components/albion/MaterialsTracker';
import { EnchantAiChat } from '@/components/albion/EnchantAiChat';
import { InventoryPlanner } from '@/components/albion/InventoryPlanner';
import { SavedReports } from '@/components/albion/SavedReports';
import { CraftingCalculator } from '@/components/albion/CraftingCalculator';
import { PARENT_CATEGORIES, CATEGORIES, getAllItemIds } from '@/lib/albion/items';
import { Box } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { cn } from "@/lib/utils";
import { VirtualizedResultsList } from '@/components/albion/VirtualizedResultsList';
import { useScanLogic } from '@/hooks/useScanLogic';
import { ScanControls } from '@/components/scan/ScanControls';
import { ScanFiltersTopBar } from '@/components/scan/ScanFilters';
import { useHotkeys } from '@/hooks/useHotkeys';

export default function HomeContent() {
  const {
    isScanning, progress, results, filteredResults,
    currentTab, setCurrentTab,
    category, setCategory, tier, setTier, enchant, setEnchant, quality, setQuality,
    search, setSearch, settings, setSettings,
    alertsEnabled, toggleAlerts, handleScan, isConfigValid
  } = useScanLogic();

  useHotkeys('enter', () => {
    if (!isScanning && isConfigValid) handleScan();
  }, true); // Ctrl + Enter

  useHotkeys('k', () => {
    const el = document.getElementById('search-input');
    if (el) el.focus();
  }, true); // Ctrl + K

  useHotkeys('1', () => setCurrentTab('mats'));
  useHotkeys('2', () => setCurrentTab('enchant'));
  useHotkeys('3', () => setCurrentTab('planner'));
  useHotkeys('4', () => setCurrentTab('reports'));
  useHotkeys('5', () => setCurrentTab('calc'));

  useHotkeys('escape', (e) => {
    if (document.activeElement && 'blur' in document.activeElement) {
        (document.activeElement as HTMLElement).blur();
    }
  }); // Escape


  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-950">
      <Header alertsEnabled={alertsEnabled} toggleAlerts={toggleAlerts} settings={settings} />

      {/* MAIN */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border border-slate-700/50 shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <Box size={120} />
           </div>
           <h2 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight mb-2">Sistema de Arbitragem do <span className="text-amber-500">Mercado Negro</span></h2>
           <p className="text-slate-400 text-sm max-w-3xl leading-relaxed">
             O Black Market (Caerleon) compra itens dos jogadores para distribuir como loot pelo mundo. 
             Esta ferramenta analisa os preços nas cidades de <span className="text-slate-300 font-semibold">Fort Sterling, Lymhurst, Bridgewatch, Martlock e Thetford</span> 
             para encontrar oportunidades de lucro comprando materiais (Runas/Almas), encantando itens e transportando-os para venda direta ao NPC.
           </p>
        </div>

        {/* TABS & SCAN */}
        <div className="flex flex-wrap items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="flex bg-slate-900 border border-slate-800 rounded-md p-1 overflow-x-auto w-full md:w-auto scrollbar-hide">
            {(['mats', 'enchant', 'planner', 'reports', 'calc'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab)}
                disabled={isScanning}
                className={cn(
                  "px-6 py-2.5 rounded text-sm font-bold uppercase tracking-wider whitespace-nowrap transition flex-1 md:flex-none",
                  currentTab === tab 
                    ? "bg-slate-800 text-amber-400 shadow-sm border-b-2 border-amber-400" 
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                )}
              >
                {tab === 'mats' && '1. Onde Comprar Runas'}
                {tab === 'enchant' && '2. Arbitragem BM'}
                {tab === 'planner' && '3. Planejamento Inventário'}
                {tab === 'reports' && '4. Relatórios Salvos'}
                {tab === 'calc' && '5. Calculadora Manual'}
              </button>
            ))}
          </div>
        </div>

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
            <div className="w-full min-w-0 mt-6">
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
