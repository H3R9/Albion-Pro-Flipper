import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchMarketData } from '@/lib/albion/api';
import { ALL_LOCATIONS, CITIES, getItemIconUrl, formatSilver } from '@/lib/albion/utils';
import { Hammer, Users, RefreshCw, Calculator, Pickaxe, Sword, FishSymbol, Activity, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { LABORERS, getLaborerItemName } from '@/lib/albion/laborers';

// Constants
const TIERS = [4, 5, 6, 7, 8];
const GATHER_BASE = { 4: 48, 5: 32, 6: 32, 7: 38.4, 8: 38.4 };
const CRAFT_BASE_100 = { 4: 16, 5: 8, 6: 5.3, 7: 4.46, 8: 4.1 };
const MERC_BASE = { 4: 1123, 5: 1746, 6: 2690, 7: 4202, 8: 6584 };

// Journal NPCs fallback prices
const JOURNAL_NPC_PRICE: Record<number, number> = { 2: 500, 3: 1000, 4: 2000, 5: 4000, 6: 8000, 7: 16000, 8: 32000 };

const GATHER_WORKERS = [
  { id: 'prospector', en: 'Prospector', pt: 'Prospector', mat: 'Minério Bruto', apiKey: 'ORE', img: 'T4_ORE' },
  { id: 'lumberjack', en: 'Lumberjack', pt: 'Lenhador', mat: 'Madeira Bruta', apiKey: 'WOOD', img: 'T4_WOOD' },
  { id: 'cropper', en: 'Cropper', pt: 'Colhedor', mat: 'Fibra Bruta', apiKey: 'FIBER', img: 'T4_FIBER' },
  { id: 'gamekeeper', en: 'Gamekeeper', pt: 'Guardador', mat: 'Couro Bruto', apiKey: 'HIDE', img: 'T4_HIDE' },
  { id: 'stonecutter', en: 'Stonecutter', pt: 'Cortador de Pedra', mat: 'Pedra Bruta', apiKey: 'ROCK', img: 'T4_ROCK' },
];

const CRAFT_WORKERS = [
  { id: 'blacksmith', en: 'Blacksmith', pt: 'Ferreiro', mat: 'Barras, Couro, Tábua', journalKey: 'WARRIOR', mix: { METALBAR: 0.65, LEATHER: 0.25, PLANKS: 0.10 }, img: 'T4_METALBAR' },
  { id: 'fletcher', en: 'Fletcher', pt: 'Fletxeiro', mat: 'Couro, Tábua, Tecido', journalKey: 'HUNTER', mix: { LEATHER: 0.55, PLANKS: 0.30, CLOTH: 0.15 }, img: 'T4_LEATHER' },
  { id: 'imbuer', en: 'Imbuer', pt: 'Imbuidor', mat: 'Tecido, Couro, Barra', journalKey: 'MAGE', mix: { CLOTH: 0.65, LEATHER: 0.25, METALBAR: 0.10 }, img: 'T4_CLOTH' },
  { id: 'tinker', en: 'Tinker', pt: 'Ferramenteiro', mat: 'Tábua, Barra, Tecido, Couro', journalKey: 'TOOLMAKER', mix: { PLANKS: 0.42, METALBAR: 0.21, CLOTH: 0.21, LEATHER: 0.10 }, img: 'T4_PLANKS' },
];

export function LaborersProfitCalculator() {
  const [happiness, setHappiness] = useState<number>(150);
  const [city, setCity] = useState<string>('Caerleon');
  const [marketPrices, setMarketPrices] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [fillMode, setFillMode] = useState<'buy_full' | 'fill_myself'>('buy_full');

  // Build items list
  const allNeededItems = useMemo(() => {
    const items = new Set<string>();
    
    for (const t of TIERS) {
      // Raw mats flat and enchanted
      const rawMats = ['ORE', 'WOOD', 'FIBER', 'HIDE', 'ROCK'];
      for (const mat of rawMats) {
        items.add(`T${t}_${mat}`);
        // Add enchanted variants
        items.add(`T${t}_${mat}_LEVEL1@1`);
        items.add(`T${t}_${mat}_LEVEL2@2`);
        items.add(`T${t}_${mat}_LEVEL3@3`);
      }
      // Refined
      items.add(`T${t}_METALBAR`); items.add(`T${t}_PLANKS`); items.add(`T${t}_CLOTH`); items.add(`T${t}_LEATHER`);
      
      // Fish and extras
      items.add(`T${t}_FISH_FRESHWATER_ALL_COMMON`);
      items.add(`T${t}_FISH_SALTWATER_ALL_COMMON`);
      items.add(`T${t}_FISH_FRESHWATER_FOREST_RARE`);
      items.add(`T${t}_FISH_FRESHWATER_MOUNTAIN_RARE`);
      items.add(`T${t}_FISH_FRESHWATER_STEPPE_RARE`);
      items.add(`T${t}_FISH_FRESHWATER_SWAMP_RARE`);
      items.add(`T${t}_FISH_SALTWATER_ALL_RARE`);
      if (t === 8) items.add('T8_FISH_SALTWATER_ALL_BOSS_SHARK');
      items.add(`T1_SEAWEED`);
      items.add(`T1_FISHCHOPS`);

      // Journals
      const jTypes = ['ORE', 'WOOD', 'FIBER', 'HIDE', 'ROCK', 'WARRIOR', 'HUNTER', 'MAGE', 'TOOLMAKER', 'MERCENARY', 'FISHING'];
      for (const j of jTypes) {
        items.add(`T${t}_JOURNAL_${j}_EMPTY`);
        items.add(`T${t}_JOURNAL_${j}_FULL`);
      }
    }
    return Array.from(items);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchPrices = async () => {
      setIsLoading(true);
      try {
         // Filter to only the selected city
         const data = await fetchMarketData(allNeededItems, [city]);
         if (!isMounted) return;
         
         const prices: Record<string, number> = {};
         for (const item of allNeededItems) {
            const row = data.find(r => r.item_id === item && r.city === city && r.sell_price_min > 0);
            prices[item] = row ? row.sell_price_min : 0;
         }
         setMarketPrices(prices);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    fetchPrices();
    
    return () => { isMounted = false; };
  }, [allNeededItems, city]);

  const getP = (id: string) => marketPrices[id] || 0;

  const renderGatherWorker = (worker: typeof GATHER_WORKERS[0]) => {
    return (
      <div key={worker.id} className="bg-black/30 border border-white/5 rounded-lg overflow-hidden flex flex-col hover:border-white/10 transition-colors">
        <div className="flex items-center gap-3 p-4 border-b border-white/5 bg-black/40">
           <img src={getItemIconUrl(worker.img)} alt={worker.en} className="w-10 h-10 object-contain drop-shadow-md" />
           <div>
             <h3 className="font-bold text-sm text-[var(--mw-text-main)] uppercase tracking-wide">{worker.pt}</h3>
             <p className="text-[10px] text-[var(--mw-text-muted)] uppercase tracking-widest">{worker.mat}</p>
           </div>
        </div>
        <div className="grid grid-cols-5 text-center divide-x divide-white/5">
          {TIERS.map(t => {
            const baseYield = GATHER_BASE[t as keyof typeof GATHER_BASE];
            const actualYield = Math.floor(baseYield * (happiness / 100));
            // Considera a chance de vir itens encantados (aproximação baseada em taxas comuns do open world)
            const pFlat = getP(`T${t}_${worker.apiKey}`);
            const p1 = getP(`T${t}_${worker.apiKey}_LEVEL1@1`);
            const p2 = getP(`T${t}_${worker.apiKey}_LEVEL2@2`);
            const p3 = getP(`T${t}_${worker.apiKey}_LEVEL3@3`);
            
            const expectedResourcePrice = (pFlat * 0.85) + (p1 * 0.12) + (p2 * 0.025) + (p3 * 0.005);
            
            const revenue = actualYield * expectedResourcePrice;
            
            const emptyCost = getP(`T${t}_JOURNAL_${worker.apiKey}_EMPTY`) || JOURNAL_NPC_PRICE[t];
            const fullCost = getP(`T${t}_JOURNAL_${worker.apiKey}_FULL`);
            
            const cost = fillMode === 'buy_full' ? fullCost : emptyCost;
            const profit = revenue - cost + (fillMode === 'buy_full' ? emptyCost : 0); // se você comprou cheio, você recebe o vazio de volta (revenue)

            return (
              <div key={t} className="p-3 flex flex-col items-center justify-center gap-1">
                <span className="text-xs font-bold text-white/40">T{t}</span>
                <span className="text-sm font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">{formatSilver(profit)}</span>
                <span className="text-[10px] text-white/30 truncate w-full" title={`Qtd: ${actualYield} | Preço Médio: ${formatSilver(expectedResourcePrice)}`}>
                  {actualYield} rec.
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCraftWorker = (worker: typeof CRAFT_WORKERS[0]) => {
    return (
      <div key={worker.id} className="bg-black/30 border border-white/5 rounded-lg overflow-hidden flex flex-col hover:border-white/10 transition-colors">
        <div className="flex items-center gap-3 p-4 border-b border-white/5 bg-black/40">
           <img src={getItemIconUrl(worker.img)} alt={worker.en} className="w-10 h-10 object-contain drop-shadow-md" />
           <div>
             <h3 className="font-bold text-sm text-[var(--mw-text-main)] uppercase tracking-wide">{worker.pt}</h3>
             <p className="text-[10px] text-[var(--mw-text-muted)] uppercase tracking-widest truncate w-40" title={worker.mat}>{worker.mat}</p>
           </div>
        </div>
        <div className="grid grid-cols-5 text-center divide-x divide-white/5">
          {TIERS.map(t => {
            const qtyTotal = Math.floor(CRAFT_BASE_100[t as keyof typeof CRAFT_BASE_100] * (happiness / 100));
            let revenue = 0;
            
            for (const [item, pct] of Object.entries(worker.mix)) {
               const qty = Math.floor(qtyTotal * (pct as number));
               revenue += qty * getP(`T${t}_${item}`);
            }
            
            const emptyCost = getP(`T${t}_JOURNAL_${worker.journalKey}_EMPTY`) || JOURNAL_NPC_PRICE[t];
            const fullCost = getP(`T${t}_JOURNAL_${worker.journalKey}_FULL`);
            
            const cost = fillMode === 'buy_full' ? fullCost : emptyCost;
            const profit = revenue - cost + (fillMode === 'buy_full' ? emptyCost : 0);

            return (
              <div key={t} className="p-3 flex flex-col items-center justify-center gap-1">
                <span className="text-xs font-bold text-white/40">T{t}</span>
                <span className="text-sm font-black text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]">{formatSilver(profit)}</span>
                <span className="text-[10px] text-white/30 truncate w-full" title={`Qtd: ${qtyTotal}`}>
                  {qtyTotal} ref.
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* HUD Info Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Controls */}
        <div className="md:col-span-2 bg-[#151518] rounded-xl border border-white/5 p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--mw-gold-primary)]/5 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row gap-6 relative">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-black tracking-widest uppercase text-white/40 flex items-center gap-2">
                <Activity size={12} className="text-[var(--mw-gold-primary)]" /> Felicidade (100% - 150%)
              </label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="100" max="150" step="1" 
                  value={happiness} 
                  onChange={e => setHappiness(Number(e.target.value))}
                  className="w-full accent-[var(--mw-gold-primary)]"
                />
                <span className="font-mono text-lg font-black text-[var(--mw-gold-primary)] w-16 text-right">
                  {happiness}%
                </span>
              </div>
              <p className="text-[10px] text-white/30 leading-relaxed max-w-sm">Dica: Um trabalhador T8 necessita de todos os troféus para atingir 150%. Se usar diário 1 tier abaixo, consegue fácil.</p>
            </div>

            <div className="w-px bg-white/5 hidden sm:block"></div>

            <div className="space-y-2 flex-1">
               <label className="text-[10px] font-black tracking-widest uppercase text-white/40">Estratégia de Diário</label>
               <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                 <button 
                  onClick={() => setFillMode('buy_full')}
                  className={cn("flex-1 py-2 text-[11px] font-bold rounded-md uppercase tracking-wider transition-all", 
                    fillMode === 'buy_full' ? "bg-[var(--mw-gold-primary)]/20 text-[var(--mw-gold-primary)] shadow-sm" : "text-white/40 hover:text-white"
                  )}>
                   Comprar Cheios
                 </button>
                 <button 
                  onClick={() => setFillMode('fill_myself')}
                  className={cn("flex-1 py-2 text-[11px] font-bold rounded-md uppercase tracking-wider transition-all", 
                    fillMode === 'fill_myself' ? "bg-[var(--mw-gold-primary)]/20 text-[var(--mw-gold-primary)] shadow-sm" : "text-white/40 hover:text-white"
                  )}>
                   Encher Sozinho
                 </button>
               </div>
            </div>

            <div className="space-y-2 flex-1">
               <label className="text-[10px] font-black tracking-widest uppercase text-white/40">Cidade BDF</label>
               <select 
                  value={city} 
                  onChange={e => setCity(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg h-10 px-3 text-sm text-[var(--mw-text-main)] focus:outline-none focus:border-[var(--mw-gold-primary)] focus:ring-1 focus:ring-[var(--mw-gold-primary)]"
                >
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
          </div>
        </div>

        {/* Global Stats */}
        <div className="bg-gradient-to-br from-emerald-900/20 to-sky-900/20 rounded-xl border border-white/5 p-6 shadow-xl flex flex-col justify-center relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
           <h3 className="text-sm font-black text-white/80 tracking-widest uppercase mb-1 drop-shadow-sm flex items-center justify-between">
             <span className="flex items-center gap-2"><Calculator size={16} /> Margem Média</span>
             {isLoading && <Loader2 size={16} className="text-[var(--mw-gold-primary)] animate-spin" />}
           </h3>
           <p className="text-xs text-white/50 mb-4 mt-1 leading-relaxed">
             No modo <strong>{fillMode === 'buy_full' ? "Comprar Cheio" : "Encher Sozinho"}</strong>, o lucro líquido considera o retorno do journal vazio.
           </p>
           <div className="flex gap-2 text-[10px] text-white/40 tracking-wider">
             <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">COLETORES BRUTOS</span>
             <span className="bg-sky-500/10 text-sky-400 px-2 py-1 rounded border border-sky-500/20">ARTESÃOS</span>
           </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gatherers Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-white/5">
             <Pickaxe size={20} className="text-emerald-500" />
             <h2 className="text-lg font-black text-white uppercase tracking-widest">Coletores</h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
             {GATHER_WORKERS.map(renderGatherWorker)}
          </div>
        </div>

        {/* Crafters Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-white/5">
             <Hammer size={20} className="text-sky-500" />
             <h2 className="text-lg font-black text-white uppercase tracking-widest">Artesãos</h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
             {CRAFT_WORKERS.map(renderCraftWorker)}
          </div>
          
          {/* Mercenaries / Fishers */}
          <div className="grid grid-cols-1 gap-3 mt-6">
             <div className="flex items-center gap-3 pb-2 border-b border-white/5 mt-4">
               <Sword size={20} className="text-rose-500" />
               <h2 className="text-lg font-black text-white uppercase tracking-widest">Mercenários (Prata Fixa)</h2>
             </div>
             
             <div className="bg-black/30 border border-white/5 rounded-lg overflow-hidden flex flex-col hover:border-white/10 transition-colors">
                <div className="flex items-center gap-3 p-4 border-b border-white/5 bg-black/40">
                   <div className="w-10 h-10 rounded bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                     <Sword size={24} className="text-rose-400" />
                   </div>
                   <div>
                     <h3 className="font-bold text-sm text-[var(--mw-text-main)] uppercase tracking-wide">Mercenário</h3>
                     <p className="text-[10px] text-[var(--mw-text-muted)] uppercase tracking-widest">Retorna Prata Fixa do Jogo</p>
                   </div>
                </div>
                <div className="grid grid-cols-5 text-center divide-x divide-white/5">
                  {TIERS.map(t => {
                    const base = MERC_BASE[t as keyof typeof MERC_BASE];
                    const avgSilver = Math.round(base * (happiness / 100)); // Average because >100% is a chance for double
                    
                    const emptyCost = getP(`T${t}_JOURNAL_MERCENARY_EMPTY`) || JOURNAL_NPC_PRICE[t];
                    const fullCost = getP(`T${t}_JOURNAL_MERCENARY_FULL`);
                    
                    const cost = fillMode === 'buy_full' ? fullCost : emptyCost;
                    const profit = avgSilver - cost + (fillMode === 'buy_full' ? emptyCost : 0);

                    return (
                      <div key={t} className="p-3 flex flex-col items-center justify-center gap-1">
                        <span className="text-xs font-bold text-white/40">T{t}</span>
                        <span className="text-sm font-black text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]">{formatSilver(profit)}</span>
                        <span className="text-[10px] text-white/30 truncate w-full" title={`Média de Prata: ${avgSilver}`}>
                          {avgSilver} Prata
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

               {/* Pesca */}
              <div className="bg-black/30 border border-white/5 rounded-lg overflow-hidden flex flex-col hover:border-white/10 transition-colors mt-2">
                <div className="flex items-center gap-3 p-4 border-b border-white/5 bg-black/40">
                   <div className="w-10 h-10 rounded bg-blue-500/10 flex items-center justify-center border border-blue-500/20 drop-shadow-md">
                     <FishSymbol size={24} className="text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]" />
                   </div>
                   <div>
                     <h3 className="font-bold text-sm text-[var(--mw-text-main)] uppercase tracking-wide">Pescador</h3>
                     <p className="text-[10px] text-[var(--mw-text-muted)] uppercase tracking-widest">Base Px. Comum (Drop Variável)</p>
                   </div>
                </div>
                <div className="p-3 bg-blue-950/20 border-b border-blue-500/10 text-center">
                  <p className="text-[10px] text-blue-300/60 leading-relaxed font-medium">Atenção: Pescadores requerem <strong>Peixes Empalhados (Ex: Tubarão)</strong> na casa para 150%.<br/>Calculando o retorno como uma cesta estimada: <strong className="text-blue-300">80% Peixe Comum + 10% Peixes Raros (Enguias, etc) + 10% Algas</strong>.</p>
                </div>
                <div className="grid grid-cols-5 text-center divide-x divide-white/5">
                  {TIERS.map(t => {
                    const baseYield = GATHER_BASE[t as keyof typeof GATHER_BASE];
                    const actualYield = Math.floor(baseYield * (happiness / 100));
                    
                    const pCommon = Math.max(getP(`T${t}_FISH_FRESHWATER_ALL_COMMON`), getP(`T${t}_FISH_SALTWATER_ALL_COMMON`));
                    const pRares = [
                      getP(`T${t}_FISH_FRESHWATER_FOREST_RARE`),
                      getP(`T${t}_FISH_FRESHWATER_MOUNTAIN_RARE`),
                      getP(`T${t}_FISH_FRESHWATER_STEPPE_RARE`),
                      getP(`T${t}_FISH_FRESHWATER_SWAMP_RARE`),
                      getP(`T${t}_FISH_SALTWATER_ALL_RARE`)
                    ].filter(p => p > 0);
                    
                    const pRareAvg = pRares.length > 0 ? pRares.reduce((a, b) => a + b, 0) / pRares.length : 0;
                    const pSeaweed = getP('T1_SEAWEED');
                    
                    // The weighted estimated value of a single fished item
                    const estimatedItemPrice = (pCommon * 0.80) + (pRareAvg * 0.10) + (pSeaweed * 0.10);
                    
                    const revenue = actualYield * estimatedItemPrice;
                    
                    const emptyCost = getP(`T${t}_JOURNAL_FISHING_EMPTY`) || JOURNAL_NPC_PRICE[t];
                    const fullCost = getP(`T${t}_JOURNAL_FISHING_FULL`);
                    
                    const cost = fillMode === 'buy_full' ? fullCost : emptyCost;
                    const profit = revenue - cost + (fillMode === 'buy_full' ? emptyCost : 0);

                    return (
                      <div key={t} className="p-3 flex flex-col items-center justify-center gap-1 hover:bg-white/5 transition-colors">
                        <span className="text-xs font-bold text-white/40">T{t}</span>
                        <span className={cn("text-sm font-black drop-shadow-[0_0_8px_rgba(96,165,250,0.3)]", 
                          profit > 0 ? "text-blue-400" : "text-blue-600"
                        )}>
                          ~{formatSilver(profit)}
                        </span>
                        <span className="text-[10px] text-white/30 truncate w-full" title={`Base estimada cesta (80% com., 10% raro, 10% alga) x ${actualYield} itens`}>
                          {actualYield} base
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

          </div>

        </div>
      </div>

    </div>
  );
}
