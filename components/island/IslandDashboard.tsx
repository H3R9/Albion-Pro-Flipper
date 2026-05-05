import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BUILDINGS, getBuildingMaterials } from '@/lib/albion/buildings';
import { fetchMarketData } from '@/lib/albion/api';
import { ALL_LOCATIONS, getItemIconUrl, formatSilver, getAgeMinutes } from '@/lib/albion/utils';
import { getItemFullName } from '@/lib/albion/items';
import { Hammer, ArrowRight, Loader2, MapPin, Users, Coins, Scissors } from 'lucide-react';
import Image from 'next/image';
import { LaborersAssembly } from './LaborersAssembly';
import { CityPricesModal } from '../albion/CityPricesModal';
import { LaborersProfitCalculator } from './LaborersProfitCalculator';
import { FishChopperCalculator } from './FishChopperCalculator';
import type { MarketData } from '@/lib/albion/types';

export function IslandDashboard() {
  const [activeTab, setActiveTab] = useState<'buildings' | 'laborers' | 'laborer-profit' | 'fish-chopper'>('buildings');

  const [pricesModalItem, setPricesModalItem] = useState<string | null>(null);

  const categories = Array.from(new Set(BUILDINGS.map(b => b.category)));
  const initialCat = categories[0] || '';
  const initialBuilding = BUILDINGS.find(b => b.category === initialCat);

  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(initialBuilding?.id || null);
  
  const selectedBuilding = useMemo(() => BUILDINGS.find(b => b.id === selectedBuildingId), [selectedBuildingId]);
  
  const [currentTier, setCurrentTier] = useState<number>(0);
  const [targetTier, setTargetTier] = useState<number>(initialBuilding?.maxTier || 0);
  const [quantity, setQuantity] = useState<number>(1);

  const [isLoading, setIsLoading] = useState(false);
  const [marketData, setMarketData] = useState<MarketData[]>([]);

  const handleCategoryChange = (cat: typeof categories[0]) => {
    setSelectedCategory(cat);
    const list = BUILDINGS.filter(b => b.category === cat);
    if (list.length > 0) {
      setSelectedBuildingId(list[0].id);
      setCurrentTier(0);
      setTargetTier(list[0].maxTier);
    } else {
      setSelectedBuildingId(null);
    }
  };

  const handleBuildingChange = (id: string) => {
    setSelectedBuildingId(id);
    const b = BUILDINGS.find(b => b.id === id);
    if (b) {
      setCurrentTier(0);
      setTargetTier(b.maxTier);
    }
  };

  const handleCurrentTierChange = (val: number) => {
    setCurrentTier(val);
    if (targetTier <= val && val !== 0) {
      setTargetTier(val);
    }
  };

  const requiredMaterials = useMemo(() => {
    if (!selectedBuilding) return {};
    const mats = getBuildingMaterials(selectedBuilding.id, currentTier, Math.max(currentTier, targetTier));
    const scaledMats: Record<string, number> = {};
    for (const [k, v] of Object.entries(mats)) {
      scaledMats[k] = v * quantity;
    }
    return scaledMats;
  }, [selectedBuilding, currentTier, targetTier, quantity]);

  const materialIds = Object.keys(requiredMaterials);

  const materialIdsStr = materialIds.join(',');

  useEffect(() => {
    if (!materialIdsStr) {
      return;
    }

    let isMounted = true;
    const fetchPrices = async () => {
      setIsLoading(true);
      try {
        const data = await fetchMarketData(materialIdsStr.split(','), ALL_LOCATIONS);
        if (isMounted) setMarketData(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchPrices, 500);
    return () => { isMounted = false; clearTimeout(debounce); };
  }, [materialIdsStr]);

  // Calculate costs per city
  const cityCosts = useMemo(() => {
    if (materialIds.length === 0 || marketData.length === 0) return {};
    
    const costs: Record<string, { total: number; detail: Record<string, number>; maxAge: number }> = {};
    ALL_LOCATIONS.forEach(loc => {
      costs[loc] = { total: 0, detail: {}, maxAge: 0 };
    });

    for (const mat of materialIds) {
      const qty = requiredMaterials[mat];
      const matData = marketData.filter(d => d.item_id === mat && d.sell_price_min > 0 && getAgeMinutes(d.sell_price_min_date) < 1440); // 24h

      ALL_LOCATIONS.forEach(loc => {
        const localDat = matData.find(d => d.city === loc);
        const price = localDat ? localDat.sell_price_min : 0; // If 0, meaning not available or too old, we handle later
        const age = localDat ? getAgeMinutes(localDat.sell_price_min_date) : 0;
        costs[loc].detail[mat] = price * qty;
        costs[loc].total += (price * qty);
        
        if (price > 0 && age > costs[loc].maxAge) {
          costs[loc].maxAge = age;
        }
      });
    }

    return costs;
  }, [marketData, requiredMaterials, materialIds]);

  const sortedCities = ALL_LOCATIONS.slice().sort((a, b) => {
    const costA = cityCosts[a]?.total || 0;
    const costB = cityCosts[b]?.total || 0;
    if (costA === 0) return 1;
    if (costB === 0) return -1;
    return costA - costB;
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-24">
      
      {/* Tabs */}
      <div className="flex gap-4 border-b border-[var(--mw-border)] pb-2 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab('buildings')}
          className={`flex items-center gap-2 px-4 py-2 font-bold uppercase tracking-wider text-sm transition-colors whitespace-nowrap border-b-2 ${
            activeTab === 'buildings'
              ? 'text-emerald-400 border-emerald-500'
              : 'text-[var(--mw-text-muted)] border-transparent hover:text-[var(--mw-text-main)] hover:border-[var(--mw-border)]'
          }`}
        >
          <Hammer size={18} />
          Arena de Construções
        </button>
        <button
          onClick={() => setActiveTab('laborers')}
          className={`flex items-center gap-2 px-4 py-2 font-bold uppercase tracking-wider text-sm transition-colors whitespace-nowrap border-b-2 ${
            activeTab === 'laborers'
              ? 'text-emerald-400 border-emerald-500'
              : 'text-[var(--mw-text-muted)] border-transparent hover:text-[var(--mw-text-main)] hover:border-[var(--mw-border)]'
          }`}
        >
          <Users size={18} />
          Montagem de Casas
        </button>
        <button
          onClick={() => setActiveTab('laborer-profit')}
          className={`flex items-center gap-2 px-4 py-2 font-bold uppercase tracking-wider text-sm transition-colors whitespace-nowrap border-b-2 ${
            activeTab === 'laborer-profit'
              ? 'text-emerald-400 border-emerald-500'
              : 'text-[var(--mw-text-muted)] border-transparent hover:text-[var(--mw-text-main)] hover:border-[var(--mw-border)]'
          }`}
        >
          <Coins size={18} />
          Lucro de Trabalhadores
        </button>
        <button
          onClick={() => setActiveTab('fish-chopper')}
          className={`flex items-center gap-2 px-4 py-2 font-bold uppercase tracking-wider text-sm transition-colors whitespace-nowrap border-b-2 ${
            activeTab === 'fish-chopper'
              ? 'text-emerald-400 border-emerald-500'
              : 'text-[var(--mw-text-muted)] border-transparent hover:text-[var(--mw-text-main)] hover:border-[var(--mw-border)]'
          }`}
        >
          <Scissors size={18} />
          Picador de Peixes
        </button>
      </div>

      {activeTab === 'buildings' && (
      <>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[var(--mw-card)] p-6 rounded-2xl border border-[var(--mw-border)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="w-full">
            <h1 className="text-2xl md:text-3xl font-black uppercase text-[var(--mw-text-main)] mb-1 flex items-center gap-3">
              <Hammer className="text-emerald-500" />
              Arena de Construções
            </h1>
            <p className="text-[var(--mw-text-muted)] text-sm">
              Calcule os materiais necessários e os custos de infraestrutura da sua Ilha.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Lado Esquerdo - Controles */}
          <div className="col-span-1 lg:col-span-4 flex flex-col gap-4">
            <div className="bg-[var(--mw-card)] rounded-xl border border-[var(--mw-border)] p-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--mw-text-muted)] mb-3">Categoria</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold uppercase transition-colors border ${
                      selectedCategory === cat 
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                        : 'bg-[var(--mw-bg)] border-[var(--mw-border)] text-[var(--mw-text-muted)] hover:text-[var(--mw-text-main)]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--mw-text-muted)] mt-6 mb-3">Construção</h3>
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto scrollbar-hide">
                {BUILDINGS.filter(b => b.category === selectedCategory).map(b => (
                  <button
                    key={b.id}
                    onClick={() => handleBuildingChange(b.id)}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
                      selectedBuildingId === b.id
                        ? 'bg-[var(--mw-bg)] border-emerald-500/50 text-[var(--mw-text-main)] shadow-inner'
                        : 'bg-transparent border-transparent text-[var(--mw-text-muted)] hover:bg-[var(--mw-bg)] hover:border-[var(--mw-border)]'
                    }`}
                  >
                    <span className="font-bold text-sm">{b.name}</span>
                    <span className="text-sm uppercase font-black opacity-50 border px-1.5 rounded">T{b.maxTier}</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedBuilding && (
              <div className="bg-[var(--mw-card)] border border-[var(--mw-border)] rounded-xl p-4 flex flex-col gap-4">
                 <div>
                   <label className="text-sm font-bold uppercase tracking-widest text-[var(--mw-text-muted)] mb-2 block">
                     Nível Atual (Sua Ilha)
                   </label>
                   <select 
                     value={currentTier} 
                     onChange={e => handleCurrentTierChange(Number(e.target.value))}
                     className="w-full bg-[var(--mw-bg)] border border-[var(--mw-border)] rounded-lg p-2.5 text-sm text-[var(--mw-text-main)] focus:outline-none focus:border-emerald-500/50"
                   >
                     <option value={0}>Não Construído</option>
                     {Array.from({length: selectedBuilding.maxTier - selectedBuilding.minTier + 1}).map((_, i) => {
                       const t = selectedBuilding.minTier + i;
                       return <option key={t} value={t}>Tier {t}</option>
                     })}
                   </select>
                 </div>
                 
                 <div className="flex justify-center rotate-90 md:rotate-0 text-[var(--mw-border)]">
                   <ArrowRight size={20} />
                 </div>

                 <div>
                   <label className="text-sm font-bold uppercase tracking-widest text-[var(--mw-text-muted)] mb-2 block">
                     Nível Desejado
                   </label>
                   <select 
                     value={targetTier} 
                     onChange={e => setTargetTier(Number(e.target.value))}
                     className="w-full bg-[var(--mw-bg)] border border-[var(--mw-border)] rounded-lg p-2.5 text-sm text-[var(--mw-text-main)] focus:outline-none focus:border-emerald-500/50"
                   >
                     {Array.from({length: selectedBuilding.maxTier - Math.max(selectedBuilding.minTier, currentTier) + 1}).map((_, i) => {
                       const t = Math.max(selectedBuilding.minTier, currentTier === 0 ? selectedBuilding.minTier : currentTier) + i;
                       return <option key={t} value={t}>Tier {t}</option>
                     })}
                   </select>
                 </div>
                 
                 <div className="pt-2 border-t border-[var(--mw-border)] mt-2">
                   <label className="text-sm font-bold uppercase tracking-widest text-[var(--mw-text-muted)] mb-2 block">
                     Quantidade de Construções
                   </label>
                   <input 
                     type="number"
                     min={1}
                     value={quantity}
                     onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                     className="w-full bg-[var(--mw-bg)] border border-[var(--mw-border)] rounded-lg p-2.5 text-sm text-[var(--mw-text-main)] focus:outline-none focus:border-emerald-500/50"
                   />
                 </div>
              </div>
            )}
          </div>

          {/* Lado Direito - Resultados */}
          <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">
            
            <div className="bg-[var(--mw-card)] rounded-xl border border-[var(--mw-border)] p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black uppercase tracking-wider text-[var(--mw-text-main)]">
                  Recursos Necessários
                </h2>
                {isLoading && <Loader2 className="animate-spin text-emerald-500" size={20} />}
              </div>

              {materialIds.length === 0 ? (
                <div className="text-center py-8 text-[var(--mw-text-muted)] text-sm">
                  Selecione os níveis corretos para ver a receita.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {materialIds.map(mat => (
                    <div key={mat} onClick={() => setPricesModalItem(mat)} className="bg-[var(--mw-bg)] border border-[var(--mw-border)] rounded-lg p-3 flex items-center gap-3 relative overflow-hidden group cursor-pointer hover:border-emerald-500/50 transition-colors">
                      <div className="absolute top-0 right-0 w-8 h-8 bg-emerald-500/5 rounded-bl-xl group-hover:scale-150 transition-transform"></div>
                      <Image src={getItemIconUrl(mat)} alt={mat} width={36} height={36} className="object-contain" unoptimized />
                      <div>
                        <p className="text-sm text-[var(--mw-text-muted)] leading-tight mb-0.5 line-clamp-1 truncate pr-2" title={getItemFullName(mat)}>
                          {getItemFullName(mat)}
                        </p>
                        <p className="font-mono text-sm font-bold text-[var(--mw-text-main)]">
                           x{requiredMaterials[mat].toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[var(--mw-card)] rounded-xl border border-[var(--mw-border)] p-6">
               <h2 className="text-lg font-black uppercase tracking-wider text-[var(--mw-text-main)] mb-6 flex items-center gap-2">
                  <MapPin size={20} className="text-[var(--mw-gold-primary)]" />
                  Orçamento por Cidade
                </h2>

                <div className="flex flex-col gap-3">
                  {sortedCities.map((city, index) => {
                    const cost = cityCosts[city]?.total || 0;
                    const isCheapest = index === 0 && cost > 0;
                    
                    return (
                      <div 
                        key={city} 
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          isCheapest 
                            ? 'bg-[var(--mw-gold-primary)]/5 border-[var(--mw-gold-primary)]/30' 
                            : 'bg-[var(--mw-bg)] border-[var(--mw-border)]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                           <span className="w-6 h-6 rounded-full bg-[var(--mw-card)] flex items-center justify-center text-sm font-bold text-[var(--mw-text-muted)] border border-[var(--mw-border)]">
                             {index + 1}
                           </span>
                           <span className={`font-bold ${isCheapest ? 'text-[var(--mw-gold-bright)]' : 'text-[var(--mw-text-main)]'}`}>
                             {city}
                           </span>
                        </div>
                        
                        <div className="text-right">
                           {cost > 0 ? (
                             <div className="flex flex-col items-end">
                               <span className="font-mono font-bold text-[var(--mw-text-main)]">
                                 {formatSilver(cost)}
                               </span>
                               <span className="text-sm text-[var(--mw-text-muted)] uppercase tracking-widest font-bold">
                                 Atualizado há {Math.round(cityCosts[city]?.maxAge || 0)} min
                               </span>
                             </div>
                           ) : (
                             <span className="text-sm uppercase font-bold text-[var(--mw-text-muted)] px-2 py-1 bg-[var(--mw-card)] rounded border border-[var(--mw-border)]">
                               Sem Custo
                             </span>
                           )}
                        </div>
                      </div>
                    );
                  })}
                </div>
            </div>

          </div>

        </div>
      </>
      )}

      {activeTab === 'laborers' && (
        <LaborersAssembly onItemClick={(id) => setPricesModalItem(id)} />
      )}

      {activeTab === 'laborer-profit' && (
        <LaborersProfitCalculator />
      )}

      {activeTab === 'fish-chopper' && (
        <FishChopperCalculator />
      )}

      <CityPricesModal 
        itemId={pricesModalItem} 
        onClose={() => setPricesModalItem(null)} 
      />
    </div>
  );
}
