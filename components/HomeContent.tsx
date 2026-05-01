import React, { useState, lazy, Suspense } from 'react';
import { Dashboard } from '@/components/albion/Dashboard';
import { PARENT_CATEGORIES, CATEGORIES, getAllItemIds } from '@/lib/albion/items';
import { LayoutDashboard, ShoppingCart, Crosshair, PackageOpen, FileText, Calculator, Home, Hammer, Settings } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { QuickMetrics } from '@/components/layout/QuickMetrics';
import { cn } from "@/lib/utils";
import { VirtualizedResultsList } from '@/components/albion/VirtualizedResultsList';
import { useScanLogic } from '@/hooks/useScanLogic';
import { ScanControls } from '@/components/scan/ScanControls';
import { ScanFiltersTopBar } from '@/components/scan/ScanFilters';
import { useHotkeys } from '@/hooks/useHotkeys';
import { useSessionStats } from '@/hooks/useSessionStats';
import { ArenaMenu } from '@/components/ArenaMenu';
import { EnchantAiChat } from '@/components/albion/EnchantAiChat';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { TradeCardSkeletonList } from '@/components/ui/Skeleton';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import type { ScanTab } from '@/lib/albion/types';

// Lazy-loaded heavy modules (only loaded when user navigates to them)
const MaterialsTracker = lazy(() => import('@/components/albion/MaterialsTracker').then(m => ({ default: m.MaterialsTracker })));
const InventoryPlanner = lazy(() => import('@/components/albion/InventoryPlanner').then(m => ({ default: m.InventoryPlanner })));
const SavedReports = lazy(() => import('@/components/albion/SavedReports').then(m => ({ default: m.SavedReports })));
const CraftingCalculator = lazy(() => import('@/components/albion/CraftingCalculator').then(m => ({ default: m.CraftingCalculator })));
const IslandDashboard = lazy(() => import('@/components/island/IslandDashboard').then(m => ({ default: m.IslandDashboard })));
const SettingsDashboard = lazy(() => import('@/components/settings/SettingsDashboard').then(m => ({ default: m.SettingsDashboard })));

const LazyFallback = () => (
  <div className="flex items-center justify-center py-20">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-[var(--mw-gold-primary)] border-t-transparent rounded-full animate-spin" />
      <span className="text-xs text-[var(--mw-text-muted)] uppercase tracking-widest font-bold">Carregando módulo...</span>
    </div>
  </div>
);

export default function HomeContent() {
  const [appMode, setAppMode] = useState<'hub' | 'operations' | 'island' | 'settings'>('hub');
  
  const {
    isScanning, progress, results, filteredResults,
    currentTab, setCurrentTab,
    category, setCategory, tier, setTier, enchant, setEnchant, quality, setQuality,
    search, setSearch, settings: uiSettings, setSettings: setUiSettings,
    alertsEnabled, toggleAlerts, handleScan, isConfigValid,
    autoRefreshInterval, setAutoRefreshInterval, nextRefreshTime,
    alertSettings, setAlertSettings, newPulseKeys
  } = useScanLogic();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { refreshes, stats, isNewRecord } = useSessionStats(results, isScanning);

  // Hotkeys
  useHotkeys('enter', () => {
    if (!isScanning && isConfigValid && appMode === 'operations') handleScan();
  }, true);
  useHotkeys('k', () => {
    if (appMode !== 'operations') return;
    const el = document.getElementById('search-input');
    if (el) el.focus();
  }, true);
  useHotkeys('1', () => appMode === 'operations' && setCurrentTab('dashboard'));
  useHotkeys('2', () => appMode === 'operations' && setCurrentTab('mats'));
  useHotkeys('3', () => appMode === 'operations' && setCurrentTab('enchant'));
  useHotkeys('4', () => appMode === 'operations' && setCurrentTab('planner'));
  useHotkeys('5', () => appMode === 'operations' && setCurrentTab('reports'));
  useHotkeys('6', () => appMode === 'operations' && setCurrentTab('calc'));
  useHotkeys('escape', () => {
    if (document.activeElement && 'blur' in document.activeElement) {
      (document.activeElement as HTMLElement).blur();
    }
  });

  const opsNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'enchant', label: 'Scanner BM', icon: <Crosshair size={18} /> },
    { id: 'mats', label: 'Mercado de Runas', icon: <ShoppingCart size={18} /> },
    { id: 'planner', label: 'Inventário', icon: <PackageOpen size={18} /> },
    { id: 'reports', label: 'Relatórios', icon: <FileText size={18} /> },
    { id: 'calc', label: 'Calculadora', icon: <Calculator size={18} /> },
  ] as const;

  const islandNavItems = [
    { id: 'island-dashboard', label: 'Construções', icon: <Hammer size={18} /> },
  ] as const;

  const handleSelectModule = (module: 'operations' | 'island' | 'settings') => {
    setAppMode(module);
    if (module === 'island') setCurrentTab('island-dashboard' as ScanTab);
    if (module === 'operations' && (currentTab as string) === 'island-dashboard') setCurrentTab('dashboard');
  };

  const activeNavItems = appMode === 'island' ? islandNavItems : (appMode === 'settings' ? [] : opsNavItems);

  // ═══ HUB MODE ═══
  if (appMode === 'hub') {
    return (
      <div className="font-sans">
        <ArenaMenu onSelectModule={handleSelectModule} />
      </div>
    );
  }

  // ═══ MAIN APP ═══
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--mw-bg)] font-sans">
      <Sidebar
        appMode={appMode}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isScanning={isScanning}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        setAppMode={setAppMode}
        navItems={activeNavItems}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header 
          alertsEnabled={alertsEnabled} 
          toggleAlerts={toggleAlerts} 
          settings={uiSettings} 
          autoRefreshInterval={autoRefreshInterval}
          setAutoRefreshInterval={setAutoRefreshInterval}
          nextRefreshTime={nextRefreshTime}
          onOpenAlertsModal={() => setAppMode('settings')}
          onMenuToggle={() => setIsSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
          <div className="max-w-7xl mx-auto w-full h-full">
            
            {/* Settings Module */}
            {appMode === 'settings' && (
              <div className="w-full h-full">
                <button onClick={() => setAppMode('hub')} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--mw-text-muted)] hover:text-[var(--mw-text-main)] transition-colors mb-4">
                  ← Voltar à Arena
                </button>
                <ErrorBoundary>
                  <Suspense fallback={<LazyFallback />}>
                    <SettingsDashboard alertSettings={alertSettings} setAlertSettings={setAlertSettings} />
                  </Suspense>
                </ErrorBoundary>
              </div>
            )}

            {/* Island Module */}
            {appMode === 'island' && (
              <div className="w-full h-full">
                <button onClick={() => setAppMode('hub')} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--mw-text-muted)] hover:text-[var(--mw-text-main)] transition-colors mb-4">
                  ← Voltar à Arena
                </button>
                <ErrorBoundary>
                  <Suspense fallback={<LazyFallback />}>
                    <IslandDashboard />
                  </Suspense>
                </ErrorBoundary>
              </div>
            )}

            {/* Operations Module */}
            {appMode === 'operations' && (
              <>
                {currentTab === 'dashboard' && (
                  <ErrorBoundary>
                    <Dashboard stats={stats} refreshes={refreshes} isNewRecord={isNewRecord} />
                  </ErrorBoundary>
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
                  <ErrorBoundary>
                    <Suspense fallback={<LazyFallback />}>
                      <MaterialsTracker />
                    </Suspense>
                  </ErrorBoundary>
                </div>

                <div className={cn(currentTab !== 'planner' && "hidden")}>
                  <ErrorBoundary>
                    <Suspense fallback={<LazyFallback />}>
                      <InventoryPlanner results={results} settings={uiSettings} />
                    </Suspense>
                  </ErrorBoundary>
                </div>

                <div className={cn(currentTab !== 'reports' && "hidden")}>
                  <ErrorBoundary>
                    <Suspense fallback={<LazyFallback />}>
                      <SavedReports />
                    </Suspense>
                  </ErrorBoundary>
                </div>

                <div className={cn(currentTab !== 'calc' && "hidden")}>
                  <ErrorBoundary>
                    <Suspense fallback={<LazyFallback />}>
                      <CraftingCalculator />
                    </Suspense>
                  </ErrorBoundary>
                </div>

                <div className={cn(currentTab !== 'enchant' && "hidden")}>
                  <div className="flex flex-col gap-6 relative">
                    {filteredResults.length > 0 && !isScanning && (
                      <QuickMetrics results={filteredResults} />
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
                      <ErrorBoundary>
                        <EnchantAiChat results={filteredResults} settings={uiSettings} />
                      </ErrorBoundary>
                    )}
                  </div>
                </div>
              </>
            )}
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

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        appMode={appMode} 
        currentTab={currentTab} 
        onNavigate={(mode, tab) => {
          setAppMode(mode);
          if (tab) setCurrentTab(tab as ScanTab);
          if (mode === 'island') setCurrentTab('island-dashboard' as ScanTab);
        }}
      />
    </div>
  );
}
