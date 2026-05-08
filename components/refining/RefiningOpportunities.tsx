import React from 'react';
import { RefreshCw, TrendingUp, Zap, MapPin } from 'lucide-react';
import { MATERIALS } from '@/hooks/useRefiningCalculator';
import { useRefiningScanner, RefiningOpportunity } from '@/hooks/useRefiningScanner';
import { formatItemName, getRenderId } from '@/lib/albion/analysis/refining';
import { getItemIconUrl } from '@/lib/albion/utils';
import Image from 'next/image';

interface Props {
  material: typeof MATERIALS[number];
  mastery: number;
  specs: Record<number, number>;
  stationTax: number;
  hasPremium: boolean;
  transportCost: number;
  overrideBaseFocus: number | null;
  onApplyOpportunity: (tier: number, enchantment: number, buyCity: string, sellCity: string) => void;
}

export function RefiningOpportunities({
  material, mastery, specs, stationTax, hasPremium, transportCost, overrideBaseFocus, onApplyOpportunity
}: Props) {
  const { loading, opportunities, scanOpportunities } = useRefiningScanner();

  return (
    <div className="bg-[#0a0a0c]/80 p-6 rounded-2xl border border-orange-500/20 shadow-xl flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black uppercase tracking-wider text-orange-400 flex items-center gap-2">
            <Zap size={24} className="text-orange-500" />
            Scanner de Oportunidades: {material.name}
          </h2>
          <p className="text-sm text-white/50 mt-1">Busca as melhores margens e maior retorno por Foco em todos os Tiers e Cidades.</p>
        </div>
        <button 
          onClick={() => scanOpportunities(material, mastery, specs, stationTax, hasPremium, transportCost, overrideBaseFocus)} 
          disabled={loading} 
          className="px-5 py-2.5 bg-orange-500/10 hover:bg-orange-500/20 active:scale-95 text-orange-400 border border-orange-500/30 rounded shadow-[0_0_15px_rgba(249,115,22,0.15)] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 text-sm"
        >
           <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
           {loading ? 'Varrendo Mercado...' : 'Procurar Oportunidades'}
        </button>
      </div>

      {opportunities.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {opportunities.map((opp, idx) => (
            <div key={idx} className="bg-[#151518] rounded-xl border border-white/5 p-4 flex flex-col gap-4 shadow-md relative overflow-hidden group hover:border-orange-500/50 transition-colors">
               <div className="absolute top-0 right-0 bg-orange-500/20 text-orange-400 text-[10px] font-black px-2 py-1 rounded-bl-lg border-b border-l border-orange-500/30">
                 RANK #{idx + 1}
               </div>

               <div className="flex items-center gap-3">
                 <div className="w-12 h-12 shrink-0 bg-[#0a0a0c] rounded drop-shadow-md flex items-center justify-center p-1 border border-white/10">
                   <Image unoptimized src={getItemIconUrl(getRenderId(opp.refinedId), 1, 48)} alt="Item" width={48} height={48} className="object-contain" />
                 </div>
                 <div>
                   <p className="text-sm font-bold text-[var(--mw-gold-bright)] truncate leading-tight">
                     {formatItemName(opp.refinedId)}
                   </p>
                   <div className="flex gap-2 items-center mt-1">
                     <span className="text-[10px] text-cyan-400 bg-cyan-900/30 px-1.5 py-0.5 rounded border border-cyan-500/20">T{opp.tier}.{opp.enchantment}</span>
                     <span className="text-[10px] text-emerald-400 bg-emerald-900/30 px-1.5 py-0.5 rounded border border-emerald-500/20">{opp.margin.toFixed(1)}% Margem</span>
                   </div>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-2 text-xs">
                 <div className="bg-[#0a0a0c] p-2 rounded border border-white/5 flex flex-col gap-1">
                   <span className="text-white/40 uppercase font-bold text-[9px] flex items-center gap-1"><MapPin size={10}/> Comprar Bruto em</span>
                   <span className="text-rose-400 font-bold truncate">{opp.buyCity}</span>
                   <span className="font-mono text-white/60">{opp.buyPrice.toLocaleString()}s</span>
                 </div>
                 <div className="bg-[#0a0a0c] p-2 rounded border border-white/5 flex flex-col gap-1">
                   <span className="text-white/40 uppercase font-bold text-[9px] flex items-center gap-1"><MapPin size={10}/> Vender (Refinado)</span>
                   <span className="text-emerald-400 font-bold truncate">{opp.sellCity}</span>
                   <span className="font-mono text-white/60">{opp.sellPrice.toLocaleString()}s</span>
                 </div>
               </div>

               <div className="flex flex-col gap-1 mt-auto">
                 <div className="flex justify-between items-center bg-orange-900/10 p-2 rounded border border-orange-500/10">
                   <span className="text-xs text-orange-400/80 font-bold uppercase">Prata por Foco</span>
                   <span className="text-sm text-orange-400 font-black font-mono">{(opp.profitPerFocus).toFixed(2)}s / pt</span>
                 </div>
                 <div className="flex justify-between items-center px-2 pt-1">
                   <span className="text-[10px] text-white/50 uppercase font-bold">Custo: {opp.focusCost} foco</span>
                   <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                     <TrendingUp size={12}/> +{(opp.profit).toLocaleString(undefined, {maximumFractionDigits:0})}s Líquido
                   </span>
                 </div>
               </div>
               
               <button 
                 onClick={() => onApplyOpportunity(opp.tier, opp.enchantment, opp.buyCity, opp.sellCity)}
                 className="mt-2 w-full py-2 bg-white/5 hover:bg-orange-500/20 text-white hover:text-orange-300 font-bold text-xs uppercase tracking-wider rounded border border-transparent hover:border-orange-500/50 transition-colors"
               >
                 Aplicar à Calculadora
               </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
