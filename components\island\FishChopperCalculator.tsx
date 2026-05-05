import React, { useState, useEffect, useMemo } from 'react';
import { fetchMarketData } from '@/lib/albion/api';
import { ALL_LOCATIONS, getItemIconUrl, formatSilver, getAgeMinutes } from '@/lib/albion/utils';
import { getItemFullName } from '@/lib/albion/items';
import { Scissors, AlertCircle, TrendingUp, TrendingDown, ArrowRight, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { CityPricesModal } from '../albion/CityPricesModal';

const TIERS = [3, 4, 5, 6, 7, 8];
const WATER_TYPES = ['FRESHWATER', 'SALTWATER'];

const FISH_YIELDS: Record<number, number> = {
  3: 3,
  4: 4,
  5: 6,
  6: 8,
  7: 10,
  8: 14
};

const RARE_FISH_YIELDS: Record<number, number> = {
  3: 10,
  5: 20,
  7: 30
};

// Note: Rare fish only exist in odd tiers (T3, T5, T7) in Albion Online.
// T4, T6, T8 rare fish do not exist and will be filtered out.

import type { MarketData } from '@/lib/albion/types';

export function FishChopperCalculator() {
  const [selectedCity, setSelectedCity] = useState(ALL_LOCATIONS[0]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pricesModalItem, setPricesModalItem] = useState<string | null>(null);
  
  const allNeededItems = useMemo(() => {
    const list = new Set<string>();
    list.add('T1_FISHCHOPS');
    TIERS.forEach(t => {
      list.add(`T${t}_FISH_FRESHWATER_ALL_COMMON`);
      list.add(`T${t}_FISH_SALTWATER_ALL_COMMON`);
      list.add(`T${t}_FISH_FRESHWATER_FOREST_RARE`);
      list.add(`T${t}_FISH_FRESHWATER_MOUNTAIN_RARE`);
      list.add(`T${t}_FISH_FRESHWATER_STEPPE_RARE`);
      list.add(`T${t}_FISH_FRESHWATER_SWAMP_RARE`);
      list.add(`T${t}_FISH_SALTWATER_ALL_RARE`);
    });
    list.add('T8_FISH_SALTWATER_ALL_BOSS_SHARK');
    return Array.from(list);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchPrices = async () => {
      setIsLoading(true);
      try {
        const data = await fetchMarketData(allNeededItems, ALL_LOCATIONS);
        if (isMounted) setMarketData(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchPrices();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchPrices, 5 * 60 * 1000);
    return () => { isMounted = false; clearInterval(interval); };
  }, [allNeededItems]);

  const getPrice = (itemId: string, city: string) => {
    const d = marketData.find(x => x.item_id === itemId && x.city === city && x.sell_price_min > 0);
    return d ? d.sell_price_min : 0;
  };
  
  const getAge = (itemId: string, city: string) => {
    const d = marketData.find(x => x.item_id === itemId && x.city === city && x.sell_price_min > 0);
    return d ? getAgeMinutes(d.sell_price_min_date) : 0;
  };

  const choppedPrice = getPrice('T1_FISHCHOPS', selectedCity);
  const choppedAge = getAge('T1_FISHCHOPS', selectedCity);

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[var(--mw-card)] p-6 rounded-2xl border border-[var(--mw-border)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="w-full">
          <h1 className="text-2xl md:text-3xl font-black uppercase text-[var(--mw-text-main)] mb-1 flex items-center gap-3">
             <div className="bg-cyan-500/20 p-2 rounded-lg text-cyan-400">
                <Scissors size={24} />
             </div>
             Calculadora de Picador de Peixes
          </h1>
          <p className="text-[var(--mw-text-muted)] text-sm">
            Verifique instantaneamente se vale a pena vender o peixe inteiro ou picá-lo em Peixe Picado (T1_FISHCHOPS).
          </p>
        </div>
      </div>

      <div className="bg-[var(--mw-card)] rounded-xl border border-[var(--mw-border)] p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--mw-text-muted)] whitespace-nowrap">Cidade Onde Vai Vender:</h3>
          <select 
            value={selectedCity} 
            onChange={e => setSelectedCity(e.target.value)}
            className="w-full md:w-[200px] bg-[var(--mw-bg)] border border-[var(--mw-border)] rounded-lg p-2.5 text-sm font-bold text-[var(--mw-text-main)] focus:outline-none focus:border-cyan-500/50"
          >
            {ALL_LOCATIONS.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
        
        {isLoading ? (
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
             <Loader2 size={16} className="animate-spin" /> Atualizando preços...
          </div>
        ) : (
          <div className="flex items-center gap-4 bg-cyan-950/30 border border-cyan-500/20 px-4 py-2 rounded-lg cursor-pointer hover:bg-cyan-900/40 transition-colors"
               onClick={() => setPricesModalItem('T1_FISHCHOPS')}>
             <Image src={getItemIconUrl('T1_FISHCHOPS')} alt="Peixe Picado" width={32} height={32} unoptimized />
             <div>
               <p className="text-[10px] text-cyan-400/70 font-bold uppercase tracking-wider">Peixe Picado ({selectedCity})</p>
               <div className="flex items-center gap-2">
                 <p className="font-mono text-base font-black text-cyan-400">{formatSilver(choppedPrice)}</p>
                 {choppedPrice > 0 && <span className="text-[10px] text-white/30">{Math.round(choppedAge)}m atrás</span>}
               </div>
             </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {WATER_TYPES.map(waterType => {
           // Find all items belonging to this water type
           const itemsForWater = allNeededItems.filter(id => id.includes(`FISH_${waterType}`) || (waterType === 'FRESHWATER' && (id.includes('FOREST') || id.includes('MOUNTAIN') || id.includes('STEPPE') || id.includes('SWAMP'))));
           
           // Sort by tier
           itemsForWater.sort((a, b) => {
             const tA = parseInt(a.charAt(1)) || 0;
             const tB = parseInt(b.charAt(1)) || 0;
             if (tA !== tB) return tA - tB;
             if (a.includes('COMMON') && !b.includes('COMMON')) return -1;
             if (!a.includes('COMMON') && b.includes('COMMON')) return 1;
             return a.localeCompare(b);
           });

           return (
           <div key={waterType} className="flex flex-col gap-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-center text-white/50 bg-white/5 py-2 rounded border border-white/5">
                 {waterType === 'FRESHWATER' ? 'Peixes de Água Doce' : 'Peixes de Água Salgada'}
              </h3>
              
              <div className="flex flex-col gap-3">
                 {itemsForWater.map(itemId => {
                   const tMatch = itemId.match(/^T(\d+)/);
                   const t = tMatch ? parseInt(tMatch[1]) : 0;
                   const fishPrice = getPrice(itemId, selectedCity);
                   const age = getAge(itemId, selectedCity);
                   let yieldAmount = 0;
                   if (itemId === 'T8_FISH_SALTWATER_ALL_BOSS_SHARK') {
                     yieldAmount = 200;
                   } else if (itemId.includes('RARE')) {
                     yieldAmount = RARE_FISH_YIELDS[t] || 0;
                   } else {
                     yieldAmount = FISH_YIELDS[t] || 0;
                   }
                   
                   // Skip rare fish that don't exist in this tier (T4, T6, T8 have no rare fish)
                   if (yieldAmount === 0) return null;
                   
                   const totalChoppedValue = yieldAmount * choppedPrice;
                   
                   const profit = totalChoppedValue - fishPrice;
                   
                   const isProfitable = profit > 0 && fishPrice > 0 && choppedPrice > 0;
                   const noData = fishPrice === 0;

                   return (
                     <div key={itemId} className={cn("bg-black/30 border rounded-xl overflow-hidden flex items-stretch transition-colors",
                        isProfitable ? "border-cyan-500/30 hover:border-cyan-500/60" : "border-white/5 hover:border-white/10"
                     )}>
                        <div 
                          className="p-3 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-white/5"
                          onClick={() => setPricesModalItem(itemId)}
                        >
                          <Image src={getItemIconUrl(itemId)} alt={itemId} width={48} height={48} unoptimized />
                        </div>
                        <div className="p-3 flex-1 flex flex-col justify-center">
                           <h4 className="text-[11px] font-bold text-white/70 mb-1 leading-tight">{getItemFullName(itemId)}</h4>
                           <div className="flex items-center gap-4">
                              <div>
                                 <p className="text-[10px] text-white/40 uppercase">Preço Venda</p>
                                 <p className="font-mono text-sm font-bold text-white/90">
                                   {noData ? '--' : formatSilver(fishPrice)}
                                 </p>
                              </div>
                              <ArrowRight size={14} className="text-white/20" />
                              <div>
                                 <p className="text-[10px] text-white/40 uppercase">Rende {yieldAmount}x Picado</p>
                                 <p className="font-mono text-sm font-bold text-cyan-400">
                                   {choppedPrice === 0 ? '--' : formatSilver(totalChoppedValue)}
                                 </p>
                              </div>
                           </div>
                        </div>
                        <div className={cn("p-3 w-28 flex flex-col items-center justify-center border-l shrink-0",
                           isProfitable ? "bg-cyan-500/10 border-cyan-500/20" : "bg-red-500/5 border-red-500/10"
                        )}>
                           {noData || choppedPrice === 0 ? (
                              <p className="text-[10px] font-bold text-white/30 uppercase">Sem Dados</p>
                           ) : (
                              <>
                                <p className="text-[9px] text-white/50 uppercase mb-1 font-bold text-center">
                                   {isProfitable ? 'Lucro (Picar)' : 'Prejuízo (Picar)'}
                                </p>
                                <div className={cn("flex items-center gap-1 font-mono text-sm font-black text-center", 
                                   isProfitable ? "text-cyan-400" : "text-red-400"
                                )}>
                                   {isProfitable ? '+' : ''}{formatSilver(profit)}
                                </div>
                              </>
                           )}
                        </div>
                     </div>
                   )
                 })}
              </div>
           </div>
        )})}
      </div>

      <CityPricesModal 
        itemId={pricesModalItem} 
        onClose={() => setPricesModalItem(null)} 
      />
    </div>
  );
}
