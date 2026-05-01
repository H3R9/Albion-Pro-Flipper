"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { getItemIconUrl, formatSilver, CITIES, formatTimeAgo } from '@/lib/albion/utils';
import { LABORERS, LaborerType, getLaborerItemName } from '@/lib/albion/laborers';
import { Home, Castle, Users, Bed, Check, Calculator, Loader2, TrendingUp } from 'lucide-react';
import { getBuildingMaterials } from '@/lib/albion/buildings';
import { fetchMarketData } from '@/lib/albion/api';

type BuildingType = 'HOUSE' | 'GUILD_HALL';

const getCapacity = (type: BuildingType, tier: number) => {
  if (type === 'HOUSE') {
    if (tier === 2) return 1;
    if (tier === 3 || tier === 4) return 2;
    if (tier >= 5) return 3;
  } else {
    // Guild Halls have a FIXED capacity of 15 laborers regardless of tier.
    // The tier only limits the max tier of laborers/furniture that can be placed inside.
    return 15;
  }
  return 0;
}

export function LaborersAssembly({ onItemClick }: { onItemClick?: (id: string) => void }) {
  const [selectedLaborerId, setSelectedLaborerId] = useState<LaborerType>('WOOD');
  const [buildingType, setBuildingType] = useState<BuildingType>('HOUSE');
  const [targetTier, setTargetTier] = useState<number>(5);
  const [quantity, setQuantity] = useState<number>(1);
  const [resourceValue, setResourceValue] = useState<number>(15000); // Estimativa de prata pura
  const [isCalculating, setIsCalculating] = useState(false);
  const [marketPrices, setMarketPrices] = useState<Record<string, number>>({});

  const capacityPerBuilding = getCapacity(buildingType, targetTier);
  const totalCapacity = capacityPerBuilding * quantity;

  const laborer = LABORERS.find(l => l.id === selectedLaborerId)!;
  const laborerTier = Math.max(laborer.minTier, Math.min(targetTier, laborer.maxTier));

  const tablesPerBuilding = Math.ceil(capacityPerBuilding / 4);
  const totalTables = tablesPerBuilding * quantity;

  const trophiesPerTierPerBuilding = Math.ceil(capacityPerBuilding / 3);
  const totalTrophiesPerTier = trophiesPerTierPerBuilding * quantity;

  const generalTrophyTiers = useMemo(() => Array.from({length: targetTier - 2 + 1}).map((_, i) => i + 2), [targetTier]);
  const specificTrophyTiers = useMemo(() => (laborer.hasSpecificTrophy && laborer.trophyMinTier)
    ? Array.from({length: targetTier - laborer.trophyMinTier + 1}).map((_, i) => laborer.trophyMinTier! + i)
    : [], [targetTier, laborer.hasSpecificTrophy, laborer.trophyMinTier]);

  const extraTrophies = useMemo(() => {
    const extras: string[] = [];
    if (laborer.id === 'FISHING') {
      if (targetTier >= 8) extras.push('T8_FURNITUREITEM_TROPHY_FISHING_BOSS');
    }
    return extras;
  }, [laborer.id, targetTier]);

  const buildingId = buildingType === 'HOUSE' ? 'house' : 'guildhall';
  
  // Obter os materiais da casa - multiplicamos pela quantidade de casas
  const totalHouseMats = useMemo(() => {
    const houseMatsBase = getBuildingMaterials(buildingId, 0, targetTier);
    const mats: Record<string, number> = {};
    for (const [mat, qty] of Object.entries(houseMatsBase)) {
      mats[mat] = qty * quantity;
    }
    return mats;
  }, [buildingId, targetTier, quantity]);

  // Juntar todos os itens necessários
  const allNeededItems = useMemo(() => {
    const items = new Set<string>();
    for (const mat of Object.keys(totalHouseMats)) items.add(mat);
    items.add(`T${laborerTier}_${laborer.contractPrefix}`);
    items.add(`T${laborerTier}_FURNITUREITEM_BED`);
    items.add(`T${laborerTier}_FURNITUREITEM_TABLE`);
    generalTrophyTiers.forEach(t => items.add(`T${t}_FURNITUREITEM_TROPHY_GENERAL`));
    specificTrophyTiers.forEach(t => items.add(`T${t}_${laborer.trophyPrefix}`));
    extraTrophies.forEach(t => items.add(t));
    items.add(`T${laborerTier}_${laborer.journalPrefix}_EMPTY`);
    items.add(`T${laborerTier}_${laborer.journalPrefix}_FULL`);
    return Array.from(items);
  }, [totalHouseMats, laborerTier, laborer.contractPrefix, laborer.trophyPrefix, laborer.journalPrefix, generalTrophyTiers, specificTrophyTiers, extraTrophies]);

  useEffect(() => {
    let isMounted = true;
    const fetchPrices = async () => {
      setIsCalculating(true);
      try {
        const data = await fetchMarketData(allNeededItems, CITIES);
        if (!isMounted) return;
        
        const prices: Record<string, number> = {};
        for (const item of allNeededItems) {
          const itemRows = data.filter(r => r.item_id === item && r.sell_price_min > 0);
          if (itemRows.length > 0) {
            prices[item] = Math.min(...itemRows.map(r => r.sell_price_min));
          } else {
            prices[item] = 0;
          }
        }
        setMarketPrices(prices);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setIsCalculating(false);
      }
    };
    
    // debounce to prevent excessive calls when changing sliders/dropdowns
    const timer = setTimeout(() => {
      fetchPrices();
    }, 1000);
    
    return () => { isMounted = false; clearTimeout(timer); };
  }, [allNeededItems]);

  // Cálculos de ROI
  const getP = (id: string) => marketPrices[id] || 0;

  let totalMaterialsCost = 0;
  for (const [mat, qty] of Object.entries(totalHouseMats)) {
    totalMaterialsCost += getP(mat) * qty;
  }

  const contractCost = getP(`T${laborerTier}_${laborer.contractPrefix}`) * totalCapacity;
  const bedsCost = getP(`T${laborerTier}_FURNITUREITEM_BED`) * totalCapacity;
  const tablesCost = getP(`T${laborerTier}_FURNITUREITEM_TABLE`) * totalTables;
  
  let generalTrophiesCost = 0;
  generalTrophyTiers.forEach(t => {
    generalTrophiesCost += getP(`T${t}_FURNITUREITEM_TROPHY_GENERAL`) * totalTrophiesPerTier;
  });

  let specificTrophiesCost = 0;
  specificTrophyTiers.forEach(t => {
    specificTrophiesCost += getP(`T${t}_${laborer.trophyPrefix}`) * totalTrophiesPerTier;
  });
  extraTrophies.forEach(t => {
    specificTrophiesCost += getP(t) * totalTrophiesPerTier;
  });

  const furnitureCost = bedsCost + tablesCost + generalTrophiesCost + specificTrophiesCost;
  const initialInvestment = totalMaterialsCost + contractCost + furnitureCost;

  const emptyJournalCost = getP(`T${laborerTier}_${laborer.journalPrefix}_EMPTY`);
  const fullJournalCost = getP(`T${laborerTier}_${laborer.journalPrefix}_FULL`);

  // Lucro diário por trabalhador = Receita - Custo
  // Receita = (Valor estimado dos recursos retornados) + (Valor do diário vazio, que você assume que volta)
  // Custo = (Valor da compra do diário cheio no mercado)
  const baseRevenue = resourceValue + emptyJournalCost;
  const profitPerWorkerPerDay = baseRevenue - fullJournalCost;
  const totalDailyProfit = profitPerWorkerPerDay * totalCapacity;

  const paybackDays = totalDailyProfit > 0 ? initialInvestment / totalDailyProfit : Infinity;

  return (
    <div className="space-y-6">
      <div className="bg-[var(--mw-card)] rounded-xl border border-[var(--mw-border)] p-6">
        <h2 className="text-lg font-black uppercase tracking-wider text-[var(--mw-text-main)] mb-6 flex items-center gap-2">
          <Home size={20} className="text-emerald-500" />
          Configuração da Propriedade
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-[var(--mw-text-muted)] mb-2 block">Tipo de Construção</label>
            <div className="flex gap-2">
              <button 
                onClick={() => setBuildingType('HOUSE')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-xs font-bold transition-colors ${
                  buildingType === 'HOUSE' 
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                    : 'bg-[var(--mw-bg)] border-[var(--mw-border)] text-[var(--mw-text-muted)] hover:text-[var(--mw-text-main)]'
                }`}
              >
                <Home size={14} /> Casa
              </button>
              <button 
                onClick={() => setBuildingType('GUILD_HALL')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-xs font-bold transition-colors ${
                  buildingType === 'GUILD_HALL' 
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                    : 'bg-[var(--mw-bg)] border-[var(--mw-border)] text-[var(--mw-text-muted)] hover:text-[var(--mw-text-main)]'
                }`}
              >
                <Castle size={14} /> Guild Hall
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-[var(--mw-text-muted)] mb-2 block">Tier da Construção</label>
            <select 
              value={targetTier.toString()} 
              onChange={(e) => setTargetTier(parseInt(e.target.value))}
              className="w-full bg-[var(--mw-bg)] border border-[var(--mw-border)] rounded-lg p-2.5 text-sm text-[var(--mw-text-main)] focus:outline-none focus:border-emerald-500/50"
            >
              {[2, 3, 4, 5, 6, 7, 8].map(t => (
                <option key={t} value={t.toString()}>T{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-[var(--mw-text-muted)] mb-2 block">Quantidade</label>
            <input 
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-[var(--mw-bg)] border border-[var(--mw-border)] rounded-lg p-2.5 text-sm text-[var(--mw-text-main)] focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="flex flex-col justify-end">
            <div className="w-full rounded-xl bg-emerald-500/10 flex items-center p-2.5 border border-emerald-500/30 gap-3">
              <Users size={20} className="text-emerald-500 flex-shrink-0" />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/80">Capacidade Total</div>
                <div className="text-sm font-black text-emerald-400 leading-none">
                  {totalCapacity} trabalhadores
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--mw-card)] rounded-xl border border-[var(--mw-border)] p-6">
        <h2 className="text-lg font-black uppercase tracking-wider text-[var(--mw-text-main)] mb-6 flex items-center justify-between">
          <span>Escolha a Profissão</span>
        </h2>
        <div className="flex flex-wrap gap-2">
          {LABORERS.map(l => {
            const isSelected = selectedLaborerId === l.id;
            return (
              <button 
                key={l.id} 
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors border ${
                  isSelected 
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                    : 'bg-[var(--mw-bg)] border-[var(--mw-border)] text-[var(--mw-text-muted)] hover:text-[var(--mw-text-main)]'
                }`}
                onClick={() => setSelectedLaborerId(l.id)}
              >
                {l.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ROI & Calculator Section */}
      <div className="bg-[var(--mw-card)] rounded-xl border border-[var(--mw-border)] overflow-hidden">
        <div className="p-6 border-b border-[var(--mw-border)] bg-[var(--mw-bg)]/50 relative">
          {isCalculating && (
            <div className="absolute top-4 right-4 flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase">
              <Loader2 size={14} className="animate-spin" /> Atualizando Mercado...
            </div>
          )}
          <h2 className="text-lg font-black uppercase tracking-wider text-[var(--mw-text-main)] flex items-center gap-2 mb-2">
            <Calculator size={20} className="text-amber-500" />
            Análise Financeira & ROI
          </h2>
          <p className="text-sm text-[var(--mw-text-muted)] max-w-2xl">
            Estimativa do custo total de investimento e o lucro esperado gerado por diário (assumindo a venda e compra direta no mercado).
          </p>
        </div>
        
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Custo de Setup */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm tracking-widest text-[var(--mw-text-muted)] uppercase border-b border-[var(--mw-border)] pb-2 flex justify-between">
              Custos de Instalação
              <span className="text-rose-400">{formatSilver(initialInvestment)}</span>
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center group cursor-pointer" onClick={() => onItemClick?.(`T${targetTier}_STONEBLOCK`)}>
                <span className="text-[var(--mw-text-muted)] group-hover:text-emerald-400 transition-colors">Materiais da Construção</span>
                <span className="font-mono text-[var(--mw-text-main)]">{formatSilver(totalMaterialsCost)}</span>
              </div>
              <div className="flex justify-between items-center group cursor-pointer" onClick={() => onItemClick?.(`T${laborerTier}_${laborer.contractPrefix}`)}>
                <span className="text-[var(--mw-text-muted)] group-hover:text-emerald-400 transition-colors">Contratos ({totalCapacity}x)</span>
                <span className="font-mono text-[var(--mw-text-main)]">{formatSilver(contractCost)}</span>
              </div>
              <div className="flex justify-between items-center group cursor-pointer" onClick={() => onItemClick?.(`T${laborerTier}_FURNITUREITEM_BED`)}>
                <span className="text-[var(--mw-text-muted)] group-hover:text-emerald-400 transition-colors">Camas & Mesas</span>
                <span className="font-mono text-[var(--mw-text-main)]">{formatSilver(bedsCost + tablesCost)}</span>
              </div>
              <div className="flex justify-between items-center group cursor-pointer" onClick={() => onItemClick?.(`T${laborerTier}_FURNITUREITEM_TROPHY_GENERAL`)}>
                <span className="text-[var(--mw-text-muted)] group-hover:text-emerald-400 transition-colors">Troféus (Gerais + Específicos)</span>
                <span className="font-mono text-[var(--mw-text-main)]">{formatSilver(generalTrophiesCost + specificTrophiesCost)}</span>
              </div>
            </div>
            <div className="text-[10px] text-[var(--mw-text-muted)] italic leading-tight">
              * Baseado no menor preço de venda direta &quot;Sell Order&quot; nas Cidades Reais neste momento.
            </div>
          </div>

          {/* Economia do Diário */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm tracking-widest text-[var(--mw-text-muted)] uppercase border-b border-[var(--mw-border)] pb-2 flex justify-between">
              Economia do Diário
              <span className="text-emerald-400">{formatSilver(profitPerWorkerPerDay)} / trab.</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-[var(--mw-text-muted)] mb-1 block">Retorno Estimado (Prata Bruta vs Recursos)</label>
                <div className="flex relative">
                  <input 
                    type="number"
                    value={resourceValue}
                    onChange={(e) => setResourceValue(Number(e.target.value) || 0)}
                    className="w-full bg-[var(--mw-bg)] border border-[var(--mw-border)] rounded-lg p-2 pl-8 font-mono text-sm text-[var(--mw-text-main)] focus:outline-none focus:border-emerald-500/50"
                  />
                  <span className="absolute left-3 top-2.5 text-[var(--mw-text-muted)]">$</span>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center text-[var(--mw-text-muted)] group cursor-pointer" onClick={() => onItemClick?.(`T${laborerTier}_${laborer.journalPrefix}_FULL`)}>
                  <span className="group-hover:text-amber-400 line-clamp-1">(-) Custo Diário Cheio</span>
                  <span className="font-mono text-rose-400 flex-shrink-0">{formatSilver(fullJournalCost)}</span>
                </div>
                <div className="flex justify-between items-center text-[var(--mw-text-muted)] group cursor-pointer" onClick={() => onItemClick?.(`T${laborerTier}_${laborer.journalPrefix}_EMPTY`)}>
                  <span className="group-hover:text-emerald-400 line-clamp-1">(+) Valor Diário Vazio (Retorno)</span>
                  <span className="font-mono text-emerald-400 flex-shrink-0">{formatSilver(emptyJournalCost)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ROI e Resumo */}
          <div className="flex flex-col justify-center items-center bg-emerald-500/5 rounded-xl border border-emerald-500/20 p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <TrendingUp size={32} className="text-emerald-500 mb-4" />
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--mw-text-muted)] mb-1">
              Lucro Estimado Diário (Total)
            </div>
            <div className="text-3xl font-black text-emerald-400 mb-1 leading-none font-mono tracking-tight">
              {formatSilver(totalDailyProfit)}
            </div>
            <div className="text-xs text-[var(--mw-text-muted)] mb-6 text-center">
              Para todos os {totalCapacity} trabalhadores
            </div>

            <div className="w-full border-t border-emerald-500/20 pt-4 text-center">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--mw-text-muted)] mb-1">
                Tempo de Retorno (ROI)
              </div>
              <div className="text-lg font-black text-[var(--mw-text-main)]">
                {paybackDays > 0 && paybackDays !== Infinity 
                  ? `${Math.ceil(paybackDays)} dias` 
                  : 'Nunca (Prejuízo)'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista visual de móveis */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-[var(--mw-card)] border border-[var(--mw-border)] rounded-xl overflow-hidden relative">
          <div className="p-6 border-b border-[var(--mw-border)] bg-[var(--mw-bg)]/50">
            <h3 className="text-lg font-black uppercase tracking-wider text-[var(--mw-text-main)] flex items-center gap-2">
              Lista de Compras
            </h3>
          </div>

          <div className="p-6">
            <div className="space-y-8">
              
              {/* Informativo de Felicidade */}
              <div className="bg-sky-500/10 border border-sky-500/30 rounded-lg p-4 text-sm text-[var(--mw-text-main)]">
                <p className="font-bold text-sky-400 mb-1 flex items-center gap-2">
                  <Check size={16} /> Como atingir a Felicidade Máxima com Troféus
                </p>
                <p className="text-xs text-[var(--mw-text-muted)] mt-2">
                  Para obter a felicidade máxima em qualquer trabalhador, você <strong>DEVE colocar AMBOS: Troféus Gerais E Troféus Específicos</strong> do trabalhador. Troféus do mesmo tipo e tier NÃO acumulam! Você precisa de 1 de cada tier para a casa inteira (cada troféu afeta até 3 trabalhadores).
                </p>
                <ul className="list-disc pl-5 mt-3 space-y-1 text-xs text-[var(--mw-text-muted)]">
                  <li><strong>1x Troféu Geral de cada Tier</strong> (Do T2 até o tier da casa). Dá +5 de felicidade cada.</li>
                  {laborer.hasSpecificTrophy && (
                    <li className="text-emerald-400 font-semibold"><strong>1x Troféu Específico de cada Tier</strong> (Do T2 até o tier da casa). Dá +10 de felicidade cada.</li>
                  )}
                  {!laborer.hasSpecificTrophy && laborer.category === 'CRAFTING' && (
                    <li className="text-amber-400"><strong>Atenção:</strong> Artesões NÃO possuem troféus específicos. A felicidade total deles depende apenas de Troféus Gerais (+5 cada tier) e do <strong>Lunário do Explorador</strong> (Troféu T3 universal raro que dá bônus a todos os tipos de trabalhadores).</li>
                  )}
                  {laborer.id === 'FISHING' && (
                    <li className="text-sky-300"><strong>Tubarão:</strong> O Troféu de Tubarão é um troféu T8 exclusivo de Pescadores. Só pode ser colocado em casas T8, e fornece bônus de felicidade extra significativo!</li>
                  )}
                </ul>
                <div className="mt-3 p-3 bg-black/20 rounded border border-white/5 text-xs">
                  <strong className="text-white">Exemplo prático (Casa T6 com Pescador):</strong><br />
                  Troféus Gerais (T2 ao T6 = 5 tiers × +5 = +25 de feli.) + Troféus do Pescador (T2 ao T6 = 5 tiers × +10 = +50 de feli.) = <strong>75/100 de felicidade nos troféus.</strong><br />
                  <span className="text-rose-300 block mt-1">
                    *Para atingir 100/100: faça upgrade da casa para T7 ou T8 para colocar troféus de tiers superiores. Uma casa T6 bloqueia troféus acima do T6. Em T8, você pode adicionar o Troféu do Tubarão para o bônus máximo!
                  </span>
                </div>
              </div>

              {/* Contratos, Camas e Mesas */}
              <div>
                <h4 className="font-bold text-sm tracking-widest text-[var(--mw-text-muted)] mb-4 uppercase flex items-center gap-2">
                  <Bed size={16} /> Mobília Fundamental & Contratos
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ItemRow itemId={`T${laborerTier}_${laborer.contractPrefix}`} amount={totalCapacity} laborerName={laborer.name} tier={laborerTier} unitPrice={getP(`T${laborerTier}_${laborer.contractPrefix}`)} onClick={() => onItemClick?.(`T${laborerTier}_${laborer.contractPrefix}`)} />
                  <ItemRow itemId={`T${laborerTier}_FURNITUREITEM_BED`} amount={totalCapacity} laborerName={laborer.name} tier={laborerTier} unitPrice={getP(`T${laborerTier}_FURNITUREITEM_BED`)} onClick={() => onItemClick?.(`T${laborerTier}_FURNITUREITEM_BED`)} />
                  <ItemRow itemId={`T${laborerTier}_FURNITUREITEM_TABLE`} amount={totalTables} laborerName={laborer.name} tier={laborerTier} unitPrice={getP(`T${laborerTier}_FURNITUREITEM_TABLE`)} note="1 a cada 4 trabalhadores" onClick={() => onItemClick?.(`T${laborerTier}_FURNITUREITEM_TABLE`)} />
                </div>
              </div>

              {/* Troféus Gerais */}
              <div>
                <h4 className="font-bold text-sm tracking-widest text-[var(--mw-text-muted)] mb-4 uppercase">
                  Troféus Gerais
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {generalTrophyTiers.map(t => (
                    <ItemRow key={`gen_${t}`} itemId={`T${t}_FURNITUREITEM_TROPHY_GENERAL`} amount={totalTrophiesPerTier} laborerName={laborer.name} tier={t} unitPrice={getP(`T${t}_FURNITUREITEM_TROPHY_GENERAL`)} onClick={() => onItemClick?.(`T${t}_FURNITUREITEM_TROPHY_GENERAL`)} />
                  ))}
                </div>
              </div>

              {/* Troféus Específicos */}
              {specificTrophyTiers.length > 0 && (
                <div>
                  <h4 className="font-bold text-sm tracking-widest text-[var(--mw-text-muted)] mb-4 uppercase">
                    Troféus Específicos
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {specificTrophyTiers.map(t => (
                      <ItemRow key={`esp_${t}`} itemId={`T${t}_${laborer.trophyPrefix}`} amount={totalTrophiesPerTier} laborerName={laborer.name} tier={t} unitPrice={getP(`T${t}_${laborer.trophyPrefix}`)} onClick={() => onItemClick?.(`T${t}_${laborer.trophyPrefix}`)} />
                    ))}
                    {extraTrophies.map(t => (
                      <ItemRow key={t} itemId={t} amount={totalTrophiesPerTier} laborerName={laborer.name} tier={t.startsWith('T7') ? 7 : 8} unitPrice={getP(t)} onClick={() => onItemClick?.(t)} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ItemRow({ itemId, amount, laborerName, tier, note, unitPrice, onClick }: { itemId: string, amount: number, laborerName: string, tier: number, note?: string; unitPrice?: number; onClick?: () => void }) {
  const name = getLaborerItemName(tier, itemId, laborerName);
  
  return (
    <div 
      className="flex items-center gap-3 bg-[var(--mw-bg)] p-3 rounded-xl border border-[var(--mw-border)] group hover:border-emerald-500/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="w-12 h-12 bg-[var(--mw-card)] rounded-lg border border-[var(--mw-border)] overflow-hidden flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform relative">
        <Image src={getItemIconUrl(itemId)} alt={name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain p-1" referrerPolicy="no-referrer" />
      </div>
      <div className="flex-grow min-w-0">
        <div className="font-mono text-sm font-bold text-[var(--mw-text-main)] mb-0.5 flex justify-between">
          <span className="text-emerald-400">{amount}x</span>
          {unitPrice !== undefined && (
            <span className="text-amber-400 text-xs">{formatSilver(unitPrice * amount)}</span>
          )}
        </div>
        <div className="text-xs font-bold text-[var(--mw-text-main)] truncate" title={name}>
          {name}
        </div>
        {note && <div className="text-[10px] text-[var(--mw-text-muted)] mt-1">{note}</div>}
      </div>
    </div>
  );
}

