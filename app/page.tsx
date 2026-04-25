'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAlbionData } from '@/lib/albion/useAlbionData';
import { TradeCard } from '@/components/albion/TradeCard';
import { MaterialsTracker } from '@/components/albion/MaterialsTracker';
import { EnchantAiChat } from '@/components/albion/EnchantAiChat';
import { InventoryPlanner } from '@/components/albion/InventoryPlanner';
import { PARENT_CATEGORIES, CATEGORIES, getAllItemIds } from '@/lib/albion/items';
import { TIERS, ENCHANTS } from '@/lib/albion/utils';
import { Search, Loader2, PlayCircle, Box, Bell, BellOff } from 'lucide-react';
import { requestNotificationPermission, sendNotification } from '@/lib/alerts';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function FlipperApp() {
  const { scan, isScanning, progress, results } = useAlbionData();

  const [currentTab, setCurrentTab] = useState<'mats' | 'enchant' | 'planner'>('mats');
  const [category, setCategory] = useState<string>('all');
  const [tier, setTier] = useState<string>('all');
  const [enchant, setEnchant] = useState<string>('all');
  const [quality, setQuality] = useState<string>('all');
  const [search, setSearch] = useState('');
  
  const [settings, setSettings] = useState({ maxAge: 120, minProfit: 0, minMargin: 0 });
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const previousResultsRef = useRef<Set<string>>(new Set());

  const handleScan = React.useCallback(() => {
    if (currentTab === 'mats' || currentTab === 'planner') return;
    scan(currentTab as 'enchant', category, tier, enchant, settings, { city: 'all', quality });
  }, [currentTab, category, tier, enchant, settings, quality, scan]);

  const toggleAlerts = async () => {
    if (!alertsEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setAlertsEnabled(true);
        sendNotification('Alertas Ativados', { body: 'Você receberá notificações sobre grandes oportunidades no Black Market.' });
      } else {
        alert('Permissão de notificação negada ou não suportada.');
      }
    } else {
      setAlertsEnabled(false);
    }
  };

  // Auto-scan effect when alerts are enabled
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (alertsEnabled && currentTab === 'enchant' && !isScanning) {
      // 5 minutes interval
      interval = setInterval(() => {
        handleScan();
      }, 5 * 60 * 1000);
    }
    return () => clearInterval(interval);
  }, [alertsEnabled, currentTab, isScanning, handleScan]);

  // Alert generation on new results
  useEffect(() => {
    if (isScanning || results.length === 0 || !alertsEnabled) return;
    
    let highestProfit = 0;
    let bestResult: any = null;

    const currentKeys = new Set<string>();

    for (const r of results) {
      // Generate a unique ID for the opportunity to avoid duplicate alerts
      const oppKey = `${r.itemId}-${r.sourceCity || r.baseCity}-${Math.floor(r.buyPrice / 1000)}`;
      currentKeys.add(oppKey);
      
      if (!previousResultsRef.current.has(oppKey)) {
        // Consider it a major opportunity if profit is > 300k and margin > 20%
        const profit = r.sellPrice - r.buyPrice - (r.baseCost || 0);
        if (profit > 300000 && r.margin > 20) {
          if (profit > highestProfit) {
            highestProfit = profit;
            bestResult = r;
          }
        }
      }
    }

    if (bestResult) {
      sendNotification(`Oportunidade Encontrada!`, { 
        body: `Lucro de +${highestProfit.toLocaleString('pt-BR')} Prata (Margem: ${bestResult.margin.toFixed(1)}%)` 
      });
    }

    previousResultsRef.current = currentKeys;
  }, [results, isScanning, alertsEnabled]);

  const filteredResults = results.filter(r => {
    if (!search) return true;
    const s = search.toLowerCase();
    return r.itemId.toLowerCase().includes(s);
  });

  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-950">
      {/* HEADER */}
      <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-amber-400 to-orange-600 p-1.5 rounded-lg shadow-lg shadow-amber-500/20">
              <Box className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight uppercase tracking-widest text-slate-100 drop-shadow-sm">
                Albion <span className="text-amber-500">Pro Flipper</span>
              </h1>
              <span className="text-[10px] text-slate-500 font-mono tracking-wider">MERCADO NEGRO & ARBITRAGEM</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-mono">
            <button
              onClick={toggleAlerts}
              className={cn(
                "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md border shadow-sm transition",
                alertsEnabled 
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20" 
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              )}
            >
              {alertsEnabled ? (
                <><Bell size={14} className="animate-pulse" /> Alertas On</>
              ) : (
                <><BellOff size={14} /> Alertas Off</>
              )}
            </button>
            <div className="hidden sm:flex items-center gap-3 text-slate-400 bg-slate-900 border border-slate-800 rounded-md px-3 py-1.5 shadow-inner">
               <span title="Idade Máxima dos Dados">⏱️ {settings.maxAge}m</span>
               <span className="w-px h-3 bg-slate-700"></span>
               <span title="Lucro Mínimo (Prata)">💰 +{settings.minProfit}</span>
               <span className="w-px h-3 bg-slate-700"></span>
               <span title="Margem Mínima (%)">📈 {settings.minMargin}%</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded shadow-md text-green-400 font-bold uppercase tracking-wider text-[10px]">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
              API West Conectada
            </div>
          </div>
        </div>
      </header>

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
          <div className="flex bg-slate-900 border border-slate-800 rounded-md p-1 h-12 overflow-x-auto w-full md:w-auto">
            {(['mats', 'enchant', 'planner'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab)}
                disabled={isScanning}
                className={cn(
                  "px-6 py-2 rounded text-sm font-bold uppercase tracking-wider whitespace-nowrap transition flex-1 md:flex-none",
                  currentTab === tab 
                    ? "bg-slate-800 text-amber-400 shadow-sm border-b-2 border-amber-400" 
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                )}
              >
                {tab === 'mats' && '1. Onde Comprar Runas'}
                {tab === 'enchant' && '2. Arbitragem BM'}
                {tab === 'planner' && '3. Planejamento Inventário'}
              </button>
            ))}
          </div>
        </div>

        {currentTab === 'enchant' && (
           <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex gap-3 mb-6 shadow-sm overflow-x-auto items-center">
             <button 
               disabled={isScanning}
               onClick={handleScan}
               className={cn(
                 "h-10 px-6 rounded-md font-bold uppercase tracking-wider flex items-center gap-2 transition shadow-lg shrink-0",
                 isScanning 
                   ? "bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700" 
                   : "bg-amber-500 text-slate-950 hover:bg-amber-400 hover:scale-105 active:scale-95"
               )}
             >
               {isScanning ? <Loader2 className="animate-spin" size={18} /> : <PlayCircle size={18} />}
               {isScanning ? 'Analisando...' : 'Encontrar Oportunidades'}
             </button>
             
             <div className="w-px h-6 bg-slate-800 mx-2"></div>

             <select value={category} onChange={e => setCategory(e.target.value)} className="bg-slate-950 border border-slate-700 rounded-md py-2 px-3 text-sm focus:border-amber-500 outline-none text-slate-200 min-w-max">
               <option value="all">Todas as Armas/Armaduras</option>
               {Object.entries(PARENT_CATEGORIES).map(([parent, keys]) => (
                 <optgroup key={parent} label={parent}>
                   {keys.map(key => (
                     <option key={key} value={key}>{CATEGORIES[key] || key}</option>
                   ))}
                 </optgroup>
               ))}
             </select>

             <select value={tier} onChange={e => setTier(e.target.value)} className="bg-slate-950 border border-slate-700 rounded-md py-2 px-3 text-sm focus:border-amber-500 outline-none text-slate-200 min-w-max">
               <option value="all">Tiers (T4+)</option>
               {TIERS.map(t => <option key={t} value={t}>T{t}</option>)}
             </select>
             
             {progress.text && (
               <div className="flex-1 min-w-[200px] flex flex-col items-end gap-1 ml-auto">
                 <span className="text-xs text-slate-400 font-mono">{progress.text}</span>
                 <div className="w-40 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                   <div 
                     className="h-full bg-amber-500 transition-all duration-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]" 
                     style={{ width: `${(progress.current / (progress.total || 1)) * 100}%` }}
                   />
                 </div>
               </div>
             )}
           </div>
        )}

        <div className={cn(currentTab !== 'mats' && "hidden")}>
          <MaterialsTracker />
        </div>

        <div className={cn(currentTab !== 'planner' && "hidden")}>
          <InventoryPlanner results={results} />
        </div>

        <div className={cn(currentTab !== 'enchant' && "hidden")}>
          {/* AI CHAT */}
          {!isScanning && filteredResults.length > 0 && (
            <EnchantAiChat results={filteredResults} />
          )}

          {/* RESULTS INFO */}
          <div className="flex items-end justify-between mb-4 mt-6">
            <h2 className="text-lg font-bold text-slate-200">
              {!isScanning && results.length > 0 && <><span className="text-amber-500">{filteredResults.length}</span> oportunidades encontradas</>}
              {!isScanning && results.length === 0 && progress.current > 0 && "0 oportunidades. Refine seus filtros."}
              {isScanning && "Analisando o mercado..."}
              {!isScanning && progress.current === 0 && "Pronto para escanear."}
            </h2>
            <span className="text-xs text-slate-500">{getAllItemIds().length} itens no banco de dados</span>
          </div>

          {/* TRADE CARDS */}
          <div className="flex flex-col gap-2">
            {!isScanning && filteredResults.length === 0 && progress.current === 0 && (
               <div className="bg-slate-900 border border-dashed border-slate-700 rounded-lg p-12 flex flex-col items-center justify-center text-slate-500">
                  <Search size={48} className="mb-4 opacity-50" />
                  <h3 className="text-xl font-bold text-slate-300 mb-2 uppercase tracking-wide">Scanner Inteligente</h3>
                  <p className="text-sm max-w-md text-center">Clique no botão SCAN para buscar dados em tempo real. Filtre por categoria para focar em itens específicos.</p>
               </div>
            )}

            {filteredResults.slice(0, 100).map((res, i) => (
               <TradeCard key={res.itemId + res.quality + res.sourceCity + i} result={res} index={i} />
            ))}
            
            {filteredResults.length > 100 && (
               <div className="text-center p-4 text-xs font-bold text-slate-500 mt-4 bg-slate-900/50 rounded-md border border-slate-800">
                 Mostrando apenas os top 100 resultados.
               </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
