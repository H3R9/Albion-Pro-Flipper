import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Calculator, ArrowRight, TrendingUp, TrendingDown, RefreshCw, AlertTriangle, Info } from 'lucide-react';
import { fetchMarketData } from '@/lib/albion/api';
import Image from 'next/image';

const MATERIALS = [
  { id: 'WOOD', name: 'Madeira (Wood)', refinedId: 'PLANKS', refinedName: 'Tábua', city: 'Fort Sterling' },
  { id: 'ORE', name: 'Minério (Ore)', refinedId: 'METALBAR', refinedName: 'Barra', city: 'Thetford' },
  { id: 'HIDE', name: 'Pele (Hide)', refinedId: 'LEATHER', refinedName: 'Couro', city: 'Martlock' },
  { id: 'FIBER', name: 'Fibra (Fiber)', refinedId: 'CLOTH', refinedName: 'Tecido', city: 'Lymhurst' },
  { id: 'ROCK', name: 'Pedra (Stone)', refinedId: 'STONEBLOCK', refinedName: 'Bloco de Pedra', city: 'Bridgewatch' },
] as const;

const TIERS = [2, 3, 4, 5, 6, 7, 8];

const CITIES = ['Caerleon', 'Thetford', 'Fort Sterling', 'Lymhurst', 'Bridgewatch', 'Martlock'];

import { getItemDisplayName } from '@/lib/albion/items';
import { getItemIconUrl } from '@/lib/albion/utils';

const formatItemName = (id: string, isEnchantedMultiplier?: boolean) => {
  const name = getItemDisplayName(id);
  // Optional: IF isEnchantedMultiplier is true we might want to strip " Incomum" etc to just be "Travertino", but honestly the exact name is best.
  return name;
};

const getRenderId = (id: string) => {
  return id.replace(/_LEVEL\d+/g, '');
};

const timeAgo = (dateStr: string | undefined) => {
  if (!dateStr || dateStr.startsWith('0001-01-01')) return 'Sem dados';
  const diff = Date.now() - new Date(dateStr + "Z").getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  return `${Math.floor(mins / 1440)}d ${Math.floor((mins % 1440) / 60)}h`;
};

export function RefiningCalculator() {
  const [material, setMaterial] = useState<typeof MATERIALS[number]>(MATERIALS[0]);
  const [tier, setTier] = useState<number>(4);
  const [enchantment, setEnchantment] = useState<number>(0);
  
  // Locations
  const [buyCity, setBuyCity] = useState<string>('Caerleon');
  const [sellCity, setSellCity] = useState<string>('Caerleon');
  
  // Perks / Settings
  const [hasPremium, setHasPremium] = useState<boolean>(true);
  const [useFocus, setUseFocus] = useState<boolean>(false);
  const [bonusLocation, setBonusLocation] = useState<boolean>(true);
  const [hideoutBonus, setHideoutBonus] = useState<number>(0); // 0 = not HO, else HO base (0 to 50%)
  
  // Market Params
  const [stationTax, setStationTax] = useState<number>(500); // 500 silver / 100 nutrition
  const [nutritionCost, setNutritionCost] = useState<number>(18); // Default nutrition required base

  // Local State for Prices & Fetches
  const [prices, setPrices] = useState<Record<string, { buy: number, sell: number, buyDate?: string, sellDate?: string }>>({});
  const [marketData, setMarketData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Deriving Item Variables
  const isStone = material.id === 'ROCK';
  
  // Fix rock enchant limits and T2/T3 enchant limits
  useEffect(() => {
    // eslint-disable-next-line
    if (tier < 4 && enchantment > 0) setEnchantment(0);
    // eslint-disable-next-line
    if (isStone && enchantment > 3) setEnchantment(3);
  }, [tier, isStone, enchantment]);

  // ID Builder function
  const getRawId = (t: number, e: number) => `T${t}_${material.id}${e > 0 ? '_LEVEL' + e + '@' + e : ''}`;
  const getRefinedId = (t: number, e: number) => {
    if (isStone) return `T${t}_${material.refinedId}`; // Stone blocks don't hold enchantments in their item IDs
    return `T${t}_${material.refinedId}${e > 0 ? '_LEVEL' + e + '@' + e : ''}`;
  };

  const rawId = getRawId(tier, enchantment);
  
  // Exception rule: T4.x relies on T3.0 ALWAYS (for everything except stone, where it's also T3.0).
  const isT4Magic = tier === 4 && enchantment > 0;
  const subTier = tier - 1;
  const subEnchantment = isT4Magic || isStone || subTier < 4 ? 0 : enchantment;
  
  const subRefinedId = subTier >= 2 ? getRefinedId(subTier, subEnchantment) : '';
  const refinedId = getRefinedId(tier, enchantment);

  // Requirements quantities (From Official Prompt v2.0 Rule)
  // T2: 2 Brutos = 1 refinado
  // T3: 2 Brutos + 1 Refinado T2 = 1 refinado
  // T4: 3 Brutos + 1 Refinado T3 = 1 refinado
  // T5: 4 Brutos + 1 Refinado T4 = 1 refinado
  // T6: 5 Brutos + 1 Refinado T5 = 1 refinado
  // T7: 6 Brutos + 1 Refinado T6 = 1 refinado
  // T8: 7 Brutos + 1 Refinado T7 = 1 refinado
  const rawQtyMap: Record<number, number> = { 2: 2, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 7 };
  const rawQty = rawQtyMap[tier] || 2;
  const subQty = tier >= 3 ? 1 : 0;
  
  // Output multipliers for stone based on enchantment (1, 2, 4, 8)
  const outputMultiplier = isStone ? Math.pow(2, enchantment) : 1;
  const outputQty = 1 * outputMultiplier;

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const itemsToFetch = [rawId, refinedId];
      if (subRefinedId) itemsToFetch.push(subRefinedId);
      
      const data = await fetchMarketData(itemsToFetch, [...CITIES, 'Black Market']);
      setMarketData(data);
      
      const newPrices: Record<string, { buy: number, sell: number, buyDate?: string, sellDate?: string }> = {};
      itemsToFetch.forEach(id => {
        // Buy City (Where we buy raws/subs) -> Look for minimum sell prices (Buy orders is too tedious, we assume fast-buy)
        const buyCityData = data.filter(d => d.item_id === id && d.city === buyCity && d.sell_price_min > 0);
        let buyPrice = 0;
        let buyDate = '';
        if (buyCityData.length > 0) {
            const minObj = buyCityData.reduce((prev, curr) => (prev.sell_price_min < curr.sell_price_min) ? prev : curr);
            buyPrice = minObj.sell_price_min;
            buyDate = minObj.sell_price_min_date;
        }
        
        // Sell City (Where we sell refined) -> Look for maximum buy orders or minimum sell prices. 
        // We will just use sell_price_min for standard calculation (assume we setup sell orders!)
        const sellCityData = data.filter(d => d.item_id === id && d.city === sellCity && d.sell_price_min > 0);
        let sellPrice = 0;
        let sellDate = '';
        if (sellCityData.length > 0) {
            const minObj = sellCityData.reduce((prev, curr) => (prev.sell_price_min < curr.sell_price_min) ? prev : curr);
            sellPrice = minObj.sell_price_min;
            sellDate = minObj.sell_price_min_date;
        }
        
        // Black market exception
        if (sellCity === 'Caerleon') {
           const bmData = data.filter(d => d.item_id === id && d.city === 'Black Market' && d.buy_price_max > 0);
           if (bmData.length > 0) {
               const maxObj = bmData.reduce((prev, curr) => prev.buy_price_max > curr.buy_price_max ? prev : curr);
               if (maxObj.buy_price_max > sellPrice) {
                   sellPrice = maxObj.buy_price_max;
                   sellDate = maxObj.buy_price_max_date;
               }
           }
        }
        
        newPrices[id] = { buy: buyPrice, sell: sellPrice, buyDate, sellDate };
      });
      setPrices(newPrices);
    } catch (e) {
      console.error('Error fetching prices:', e);
    } finally {
      setLoading(false);
    }
  };

  // Run auto fetch when dependencies update
  useEffect(() => {
    // We can't setState inside useEffect easily if it triggers loop, so wrap safe:
    const timeout = setTimeout(() => fetchPrices(), 500);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material, tier, enchantment, buyCity, sellCity]);

  // RRR Formulas - LPB math: RRR = 1 - 1/(1 + LPB/100)
  // Bases: No bonus = 18%, Bonus City = 58%
  // Hideouts could be more (e.g. 15% to 56% bonus).
  let lpbTarget = 18; // Default off
  if (bonusLocation) lpbTarget = material.city === material.city ? 58 + hideoutBonus : 58; // Simplified, Hideout overrides later
  if (hideoutBonus > 0) lpbTarget = hideoutBonus;

  if (useFocus) lpbTarget += 59; // Focus adds static 5900 points (+59% LPB)

  const rrr = 1 - (1 / (1 + (lpbTarget / 100)));

  // Material Costs
  const rawData = prices[rawId] || { buy: 0, sell: 0 };
  const subData = prices[subRefinedId] || { buy: 0, sell: 0 };
  const refinedData = prices[refinedId] || { buy: 0, sell: 0 };

  const rawPrice = rawData.buy || 0;
  const subPrice = subData.buy || 0;
  const refinedPrice = refinedData.sell || 0;

  // Total gross cost of recipe materials (Without RRR)
  const materialsCostGross = (rawQty * rawPrice) + (subQty * subPrice);

  // Effective cost = materials consumed
  const effectivelyConsumedMaterialsCost = materialsCostGross * (1 - rrr);

  // Item Values (Nutrition and City Taxes)
  const ITEM_VALUES: Record<number, number> = { 2: 1, 3: 2, 4: 8, 5: 16, 6: 32, 7: 64, 8: 128 };
  const itemValue = (ITEM_VALUES[tier] || 1) * Math.pow(2, enchantment);
  
  // Tax fee: (StationTax / 100) * ItemValue * 0.1125
  const usageFee = (stationTax / 100) * itemValue * 0.1125;
  
  const totalCost = effectivelyConsumedMaterialsCost + usageFee;

  // Market Taxes
  // Premium Setup fee: 2.5%, Premium Tax: 4%. Total premium = 6.5%.
  // Non-Premium Setup: 2.5%, Non-Premium Tax: 8%. Total non-premium = 10.5%.
  const marketTaxFactor = hasPremium ? 0.065 : 0.105;
  
  // Total Revenue of the crafted batch
  const grossRevenue = (refinedPrice * outputQty);
  const netRevenue = grossRevenue * (1 - marketTaxFactor);

  const profit = netRevenue - totalCost;
  const margin = totalCost > 0 ? (profit / totalCost) * 100 : 0;

  return (
    <div className="space-y-8 animate-fade-in pb-20 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4 mb-8 items-center text-center">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-wider text-[var(--mw-text-main)] flex items-center justify-center gap-3 w-full">
          <Calculator className="text-cyan-400" size={42} />
          <span>Calculadora de <span className="text-cyan-400">Refino</span></span>
        </h1>
        <p className="text-[var(--mw-text-muted)] text-base max-w-2xl mx-auto">
          Uma interface analítica poderosa baseada no Guia V2.0. Obtenha spreads cruzados entre cidades e descubra a real margem de lucro oculta de todos os materiais do The Royal Continent ao Black Market.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* PARTE ESQUERDA - CONFIGURAÇÕES (Span 4) */}
        <div className="xl:col-span-4 space-y-4">
          <Card className="p-5 border-cyan-900/30 bg-[#101012] space-y-4">
             <h3 className="font-bold text-[var(--mw-text-main)] uppercase tracking-widest text-sm border-b border-white/10 pb-2">1. Receita Básica</h3>
             
             <div className="space-y-3">
               <div>
                  <label className="text-sm uppercase text-white/50 block mb-1 font-bold">Tipo de Material</label>
                  <select value={material.id} onChange={e => setMaterial(MATERIALS.find(m => m.id === e.target.value)!)} className="w-full bg-[#151518] border border-white/10 rounded px-3 py-3 text-[var(--mw-text-main)] text-sm focus:border-cyan-500/50 outline-none transition-colors appearance-none font-bold text-center">
                    {MATERIALS.map(m => (<option key={m.id} value={m.id}>{m.name}</option>))}
                  </select>
               </div>
               
               <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm uppercase text-white/50 block mb-1 font-bold">Tier Alvo</label>
                    <select value={tier} onChange={e => setTier(Number(e.target.value))} className="w-full bg-[#151518] border border-white/10 rounded px-3 py-3 text-[var(--mw-gold-bright)] text-sm font-mono font-bold appearance-none text-center">
                      {TIERS.map(t => <option key={t} value={t}>Tier {t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm uppercase text-white/50 block mb-1 font-bold">Encantamento</label>
                    <select value={enchantment} onChange={e => setEnchantment(Number(e.target.value))} disabled={tier < 4} className="w-full bg-[#151518] border border-white/10 rounded px-3 py-3 text-cyan-400 text-sm font-mono font-bold disabled:opacity-50 appearance-none text-center">
                      {[0,1,2,3,4].filter(e => !(isStone && e > 3)).map(e => <option key={e} value={e}>Magic .{e}</option>)}
                    </select>
                  </div>
               </div>
               
               {isStone && enchantment > 0 && (
                 <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded flex gap-3 text-rose-400 text-sm shadow-inner">
                   <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                   <span>Blocos não possuem versão encantada. Refinar Pedra Encantada apenas multiplica a saída, gerando <strong>{outputMultiplier}x</strong> Blocos normais!</span>
                 </div>
               )}
               {isT4Magic && !isStone && (
                 <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded flex gap-3 text-blue-400 text-sm shadow-inner">
                   <Info size={18} className="shrink-0 mt-0.5" />
                   <span>T4 Encantado obrigatoriamente consome Sub-Recurso T3 Base (.0) - Exceção da regra Albion!</span>
                 </div>
               )}
               {subTier >= 4 && enchantment > 0 && !isStone && (
                 <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded flex gap-3 text-emerald-400 text-sm shadow-inner">
                   <Info size={18} className="shrink-0 mt-0.5" />
                   <span>Acompanhando a linha {tier}.{enchantment}, consome obrigatoriamente sub-recurso mágico correspondente {subTier}.{enchantment}</span>
                 </div>
               )}
             </div>
          </Card>

          <Card className="p-5 border-[var(--mw-gold-primary)]/20 bg-[#101012] space-y-4">
             <div className="flex justify-between border-b border-white/10 pb-2 items-center">
               <h3 className="font-bold text-[var(--mw-gold-bright)] uppercase tracking-widest text-sm">2. Logística</h3>
             </div>
             
             <div className="space-y-3">
               <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm uppercase text-white/50 block mb-1 font-bold truncate" title="Cidade de Compra">Comprar Em</label>
                    <div className="relative">
                      <select value={buyCity} onChange={e => setBuyCity(e.target.value)} className="w-full bg-[#151518] border border-white/10 rounded px-3 py-3 text-[var(--mw-text-main)] text-sm font-bold appearance-none text-center outline-none focus:border-cyan-500/50 transition-colors">
                        {CITIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm uppercase text-white/50 block mb-1 font-bold truncate" title="Cidade de Venda">Vender Em</label>
                    <div className="relative">
                      <select value={sellCity} onChange={e => setSellCity(e.target.value)} className="w-full bg-[#151518] border border-white/10 rounded px-3 py-3 text-[var(--mw-gold-bright)] text-sm font-bold appearance-none text-center outline-none focus:border-[var(--mw-gold-primary)]/50 transition-colors">
                        {CITIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-4 overflow-x-auto rounded border border-white/10 bg-[#0a0a0c]">
                  <table className="w-full text-sm text-left border-collapse min-w-[500px]">
                    <thead className="bg-[#151518]">
                      <tr className="text-white/40 uppercase tracking-widest border-b border-white/10">
                        <th className="p-3 text-sm font-bold w-1/4">Cidade</th>
                        <th className="p-3 text-sm font-bold tooltip text-right" title={formatItemName(rawId)}>Bruto</th>
                        {subRefinedId && <th className="p-3 text-sm font-bold tooltip text-right" title={formatItemName(subRefinedId)}>Sub</th>}
                        <th className="p-3 text-sm font-bold tooltip text-right" title={formatItemName(refinedId)}>Refinado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {[...CITIES, 'Black Market'].map(city => {
                        const rawCityDataList = marketData.filter(d => d.city === city && d.item_id === rawId);
                        const subCityDataList = subRefinedId ? marketData.filter(d => d.city === city && d.item_id === subRefinedId) : [];
                        const refCityDataList = marketData.filter(d => d.city === city && d.item_id === refinedId);
                        
                        const getBest = (list: any[]) => {
                          if (!list || list.length === 0) return null;
                          let best = list[0];
                          for (let i = 1; i < list.length; i++) {
                            if (list[i].sell_price_min > 0 && (best.sell_price_min === 0 || list[i].sell_price_min < best.sell_price_min)) best = list[i];
                          }
                          return best;
                        };

                        const rawCityData = getBest(rawCityDataList);
                        const subCityData = getBest(subCityDataList);
                        const refCityData = getBest(refCityDataList);

                        const renderPrice = (d: any) => {
                           if (!d) return <span className="text-white/20 p-3 block text-right">-</span>;
                           return (
                             <div className="flex flex-col p-3 gap-2 font-mono text-sm sm:text-base">
                               <div className="flex justify-between sm:justify-end sm:gap-3 items-center" title="Compra Direta (Paga o menor Preço de Venda do Mercado)">
                                 <span className="text-emerald-400/50 font-sans font-bold text-xs sm:hidden">CD:</span>
                                 <span className="text-emerald-400 font-bold">{d.sell_price_min > 0 ? d.sell_price_min.toLocaleString() : '-'}</span>
                               </div>
                               <div className="flex justify-between sm:justify-end sm:gap-3 items-center" title="Venda Direta (Vende pro maior Pedido de Compra)">
                                 <span className="text-amber-400/50 font-sans font-bold text-xs sm:hidden">VD:</span>
                                 <span className="text-amber-400 font-bold">{d.buy_price_max > 0 ? d.buy_price_max.toLocaleString() : '-'}</span>
                               </div>
                             </div>
                           );
                        };

                        return (
                          <tr key={city} className="hover:bg-white/[0.02]">
                            <td className="p-3 text-white/80 font-bold text-sm uppercase border-r border-white/5">{city === 'Black Market' ? 'BM' : city}</td>
                            <td className="p-0 border-r border-white/5">{renderPrice(rawCityData)}</td>
                            {subRefinedId && <td className="p-0 border-r border-white/5">{renderPrice(subCityData)}</td>}
                            <td className="p-0">{renderPrice(refCityData)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  <div className="bg-[#151518] p-2 text-center text-xs sm:text-sm text-white/30 uppercase tracking-widest border-t border-white/10 font-bold">
                    MERCADO GLOBAL: Valores Superiores = Compra Direta | Valores Inferiores = Venda Direta
                  </div>
                </div>
             </div>
          </Card>

          <Card className="p-5 border-orange-500/30 bg-[#101012] space-y-4">
             <h3 className="font-bold text-orange-500 uppercase tracking-widest text-sm border-b border-white/10 pb-2">3. Modificadores RRR e Foco</h3>
             
             <div className="space-y-3">
                 <label className="flex items-center justify-between cursor-pointer p-3 bg-[#151518] rounded border border-white/10 hover:border-white/20 transition-colors shadow-inner group">
                   <div className="flex flex-col">
                     <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">Refinar na Cidade Bônus</span>
                     <span className="text-sm text-white/40 uppercase tracking-wider">{material.city} tem 58% bônus base</span>
                   </div>
                   <input type="checkbox" checked={bonusLocation} onChange={e => {setBonusLocation(e.target.checked); if (e.target.checked) setHideoutBonus(0);}} className="accent-[var(--mw-gold-primary)] w-5 h-5 cursor-pointer" />
                 </label>
                 
                 <label className="flex items-center justify-between cursor-pointer p-3 bg-orange-900/20 rounded border border-orange-500/30 hover:border-orange-500/50 transition-colors shadow-inner group">
                   <div className="flex flex-col">
                     <span className="text-sm font-bold text-orange-400 group-hover:text-orange-300 transition-colors">Injetar Foco (Premium Focus)</span>
                     <span className="text-sm text-orange-400/50 uppercase tracking-wider">+59% no Base LPB Equation</span>
                   </div>
                   <input type="checkbox" checked={useFocus} onChange={e => setUseFocus(e.target.checked)} className="accent-orange-500 w-5 h-5 cursor-pointer" />
                 </label>

                 <label className="flex items-center justify-between cursor-pointer p-3 bg-[#151518] rounded border border-white/10 hover:border-white/20 transition-colors shadow-inner">
                   <div className="flex flex-col">
                     <span className="text-sm font-bold text-[var(--mw-text-main)]">Premium Setup Status</span>
                     <span className="text-sm text-white/40 uppercase tracking-wider">Metade do imposto de sell-order (6.5%)</span>
                   </div>
                   <input type="checkbox" checked={hasPremium} onChange={e => setHasPremium(e.target.checked)} className="accent-indigo-500 w-5 h-5 cursor-pointer" />
                 </label>
             </div>
             
             <div className="pt-2">
                <label className="text-sm uppercase text-white/50 block mb-1 font-bold">Imposto Cidadão da Tenda de Refino (Tax Fee / 100 nut)</label>
                <div className="relative flex items-center">
                  <input type="number" value={stationTax} onChange={e => setStationTax(Number(e.target.value))} className="w-full bg-[#151518] border border-white/10 rounded px-3 py-3 pl-4 text-rose-400 text-lg font-mono font-bold outline-none focus:border-rose-500" />
                  <span className="absolute right-4 text-white/30 text-sm font-bold tracking-widest uppercase">Pratas</span>
                </div>
             </div>
          </Card>
        </div>

        {/* PARTE DIREITA - WORKSHOP VISUAL (Span 8) */}
        <div className="xl:col-span-8 flex flex-col gap-6">
           <Card className="flex-1 p-6 lg:p-8 flex flex-col justify-between border-white/5 bg-[var(--mw-card)] relative overflow-hidden backdrop-blur">
             <div className="absolute top-0 right-0 p-32 opacity-[0.02] pointer-events-none">
                 <Calculator size={400} />
             </div>
             
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 z-10 relative">
               <h2 className="text-2xl font-black uppercase tracking-widest text-[var(--mw-text-main)] flex items-center gap-2">
                 Resultados Mágicos da Forja
               </h2>
               <button onClick={fetchPrices} disabled={loading} className="w-full sm:w-auto px-5 py-3 bg-[var(--mw-primary)]/10 hover:bg-[var(--mw-primary)]/20 active:scale-95 text-[var(--mw-gold-bright)] border border-[var(--mw-gold-primary)]/30 rounded shadow-[0_0_15px_rgba(255,200,0,0.1)] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 text-sm">
                 <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                 {loading ? 'Puxando API Live...' : 'Forçar Sync dos Preços Market'}
               </button>
             </div>

             {/* RRR Display Top */}
             <div className="flex justify-center mb-12 z-10 relative">
               <div className="inline-flex flex-col items-center gap-1 bg-[#0a0a0c] border border-cyan-900/40 px-10 py-5 rounded-2xl shadow-2xl relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/10 to-transparent"></div>
                 <span className="text-sm text-cyan-400/50 uppercase tracking-[0.3em] font-black z-10">Retorno Material (RRR)</span>
                 <span className="text-5xl font-black text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.5)] z-10">{(rrr * 100).toFixed(1)}%</span>
               </div>
             </div>

              {/* Workbench Layout */}
             <div className="flex flex-col xl:flex-row gap-6 xl:gap-8 items-center justify-between z-10 relative mt-4 mb-14">
                
                {/* MATERIAIS - ESQUERDA */}
                <div className="flex flex-col gap-5 w-full xl:w-[45%]">
                   {subTier >= 2 && (
                     <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#151518]/80 backdrop-blur p-4 sm:p-5 rounded-xl border border-white/5 shadow-inner">
                        <div className="w-16 h-16 shrink-0 bg-[#101012] rounded drop-shadow-[0_0_10px_rgba(0,0,0,0.5)] flex items-center justify-center p-1 border border-white/10 relative overflow-hidden hidden sm:flex">
                           <Image unoptimized src={getItemIconUrl(getRenderId(subRefinedId), 1, 64)} alt="Sub-recurso" width={64} height={64} className="object-contain drop-shadow-md" />
                        </div>
                        <div className="flex-1 min-w-0 w-full">
                           <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Sub-Recurso (T{subTier})</p>
                           <p className="text-white font-bold leading-tight truncate w-full text-base sm:text-lg mb-2" title={subRefinedId}>{formatItemName(subRefinedId)}</p>
                           <div className="flex flex-wrap justify-between items-center gap-2">
                             <div className="flex items-center gap-2">
                               <span className="text-rose-400 font-black text-xs sm:text-sm bg-rose-500/10 px-2 py-0.5 rounded whitespace-nowrap">x{subQty} req</span>
                               <span className="text-xs sm:text-sm text-white/30 uppercase tracking-widest font-bold whitespace-nowrap">{timeAgo(subData.buyDate)}</span>
                             </div>
                             <span className="text-[var(--mw-gold-bright)] font-mono text-sm sm:text-base font-bold bg-[#0a0a0c] px-2 sm:px-3 py-1 rounded border border-white/5 shadow-inner">{subPrice.toLocaleString()}s/u</span>
                           </div>
                        </div>
                     </div>
                   )}
                   
                   <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#151518]/80 backdrop-blur p-4 sm:p-5 rounded-xl border border-white/5 shadow-inner">
                        <div className="w-16 h-16 shrink-0 bg-[#101012] rounded drop-shadow-[0_0_10px_rgba(0,0,0,0.5)] flex items-center justify-center p-1 border border-white/10 relative overflow-hidden hidden sm:flex">
                           <Image unoptimized src={getItemIconUrl(getRenderId(rawId), 1, 64)} alt="Bruto" width={64} height={64} className="object-contain drop-shadow-md" />
                        </div>
                        <div className="flex-1 min-w-0 w-full">
                           <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Matéria Bruta (T{tier})</p>
                           <p className="text-[var(--mw-gold-bright)] font-bold leading-tight truncate w-full text-base sm:text-lg mb-2" title={rawId}>{formatItemName(rawId, isStone)}</p>
                           <div className="flex flex-wrap justify-between items-center gap-2">
                             <div className="flex items-center gap-2">
                               <span className="text-rose-400 font-black text-xs sm:text-sm bg-rose-500/10 px-2 py-0.5 rounded whitespace-nowrap">x{rawQty} req</span>
                               <span className="text-xs sm:text-sm text-white/30 uppercase tracking-widest font-bold whitespace-nowrap">{timeAgo(rawData.buyDate)}</span>
                             </div>
                             <span className="text-[var(--mw-gold-bright)] font-mono text-sm sm:text-base font-bold bg-[#0a0a0c] px-2 sm:px-3 py-1 rounded border border-white/5 shadow-inner">{rawPrice.toLocaleString()}s/u</span>
                           </div>
                        </div>
                   </div>
                </div>

                {/* Seta do meio */}
                <div className="flex justify-center items-center py-2 xl:py-0 shrink-0">
                   <div className="w-24 h-1.5 bg-gradient-to-r from-transparent via-cyan-500 to-cyan-500 rounded-full relative shadow-[0_0_10px_rgba(34,211,238,0.5)] hidden xl:block">
                      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-0 h-0 border-y-[8px] border-y-transparent border-l-[14px] border-l-cyan-400" />
                   </div>
                   <ArrowRight size={40} className="text-cyan-400 xl:hidden rotate-90 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                </div>

                {/* PRODUTO FINAL - DIREITA */}
                <div className="flex flex-col sm:flex-row items-center gap-5 bg-emerald-900/10 p-5 sm:p-8 rounded-xl border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.05)] relative overflow-hidden w-full xl:w-[45%] h-full">
                   <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 bg-[#0a0a0c] rounded drop-shadow-[0_0_20px_rgba(255,200,0,0.15)] flex items-center justify-center p-2 border border-[var(--mw-gold-primary)]/50 relative z-10 group hover:scale-105 transition-transform duration-300 overflow-hidden">
                      <Image unoptimized src={getItemIconUrl(getRenderId(refinedId), 1, 128)} alt="Refinado" width={128} height={128} className="object-contain drop-shadow-lg group-hover:brightness-110 transition-all" />
                   </div>
                   <div className="flex-1 flex flex-col justify-center z-10 min-w-0 w-full text-center sm:text-left">
                      <p className="text-xs sm:text-sm text-emerald-400/80 uppercase tracking-widest font-bold mb-1">Saída Produtiva</p>
                      <p className="text-emerald-400 font-bold leading-tight truncate w-full text-lg sm:text-2xl mb-4" title={refinedId}>{formatItemName(refinedId)}</p>
                      <div className="flex flex-col gap-3 w-full bg-[#0a0a0c] p-3 sm:p-4 rounded border border-emerald-900/30">
                        <div className="flex flex-wrap justify-between items-center w-full gap-2">
                           <span className="text-white/50 text-xs sm:text-sm uppercase font-bold tracking-wider">Multiplicador</span>
                           <span className="text-emerald-300 font-black text-sm bg-emerald-500/20 px-2 py-1 rounded whitespace-nowrap">Gera x{outputQty}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center w-full gap-2 pt-2 border-t border-white/5">
                           <div className="flex gap-1.5 items-center">
                              <span className="text-white/50 text-xs sm:text-sm uppercase font-bold tracking-wider">Preço Market</span>
                              <span className="text-xs sm:text-sm text-emerald-400/50 uppercase tracking-widest font-bold whitespace-nowrap">({timeAgo(refinedData.sellDate)})</span>
                           </div>
                           <span className="text-emerald-400 font-mono text-base sm:text-lg tracking-wider font-bold whitespace-nowrap">{refinedPrice.toLocaleString()}s/u</span>
                        </div>
                      </div>
                   </div>
                </div>
             </div>

             {/* TABELA DE SPREADS (Rodapé do Card Direito) */}
             <div className="bg-[#0a0a0c] border border-white/10 rounded-2xl overflow-hidden mt-auto shadow-xl">
               <div className="grid grid-cols-2 lg:grid-cols-4 text-center">
                 
                 <div className="p-4 sm:p-5 flex flex-col justify-center gap-2 hover:bg-white/[0.02] transition-colors border-b border-r border-white/10 lg:border-b-0">
                   <p className="text-xs sm:text-sm text-white/40 uppercase tracking-widest font-bold">Custo Efetivo</p>
                   <p className="font-mono text-rose-400 font-bold text-lg sm:text-xl drop-shadow">-{totalCost.toLocaleString(undefined, {maximumFractionDigits:0})}s</p>
                   <p className="text-xs sm:text-sm text-white/30 uppercase tracking-widest font-bold mx-auto opacity-70">Abatida c/ RRR ({buyCity})</p>
                 </div>
                 
                 <div className="p-4 sm:p-5 flex flex-col justify-center gap-2 hover:bg-white/[0.02] transition-colors border-b border-white/10 lg:border-b-0 lg:border-r">
                   <p className="text-xs sm:text-sm text-white/40 uppercase tracking-widest font-bold">Taxas Market</p>
                   {/* We represent exact market fee cut off the gross */}
                   <p className="font-mono text-amber-500/80 font-bold text-lg sm:text-xl drop-shadow">-{((marketTaxFactor) * grossRevenue).toLocaleString(undefined, {maximumFractionDigits:0})}s</p>
                   <p className="text-xs sm:text-sm text-white/30 uppercase tracking-widest font-bold mx-auto opacity-70">{(marketTaxFactor*100).toFixed(1)}% do Venda Final</p>
                 </div>

                 <div className="p-4 sm:p-5 flex flex-col justify-center gap-2 bg-emerald-900/10 hover:bg-emerald-900/20 transition-colors border-r border-white/10 lg:border-r">
                   <p className="text-xs sm:text-sm text-emerald-500/60 uppercase tracking-widest font-bold">Venda Final (Net)</p>
                   <p className="font-mono text-emerald-400 font-bold text-lg sm:text-xl drop-shadow">+{netRevenue.toLocaleString(undefined, {maximumFractionDigits:0})}s</p>
                   <p className="text-xs sm:text-sm text-emerald-400/40 uppercase tracking-widest font-bold mx-auto opacity-70">No Market de {sellCity}</p>
                 </div>

                 <div className="p-5 sm:p-6 flex flex-col justify-center gap-2 relative bg-[var(--mw-primary)]/[0.02] lg:border-l-[3px] lg:border-l-[var(--mw-primary)] lg:border-[var(--mw-primary)]">
                   <p className="text-sm border-b border-white/5 pb-2 mb-1 text-[var(--mw-text-main)] uppercase tracking-[0.2em] font-black">Lucro Genuíno (1x)</p>
                   <p className={`font-mono text-2xl sm:text-4xl font-black drop-shadow-[0_0_10px_rgba(0,0,0,0.5)] flex items-center justify-center gap-2 py-1 ${profit > 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                      {profit > 0 ? <TrendingUp size={28}/> : <TrendingDown size={28}/>}
                      {profit.toLocaleString(undefined, {maximumFractionDigits:0})}s
                   </p>
                   <div className="flex justify-center mt-1">
                     <span className={`text-base px-4 py-1.5 font-black uppercase tracking-widest rounded-full border ${margin > 0 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-rose-400 border-rose-500/30 bg-rose-500/10'}`}>
                       Margem: {margin.toFixed(2)}%
                     </span>
                   </div>
                 </div>

               </div>
               {/* Rodapé da tabela com as Info extras */}
               <div className="border-t border-white/5 bg-[#050505] p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs sm:text-sm text-white/30 uppercase tracking-wider font-bold text-center sm:text-left">
                  <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
                     <span>Taxas Setup Cidadão: -{usageFee.toLocaleString(undefined, {maximumFractionDigits:0})}s</span>
                     <span>Custo Bruto Materiais: {materialsCostGross.toLocaleString(undefined, {maximumFractionDigits:0})}s</span>
                  </div>
                  <span>Atualizado pelo Albion Online Data Project.</span>
               </div>
             </div>

           </Card>
        </div>
      </div>
    </div>
  );
}
