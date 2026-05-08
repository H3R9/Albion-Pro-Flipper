import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Calculator, ArrowRight, TrendingUp, TrendingDown, RefreshCw, AlertTriangle, Info, Settings, Factory, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import { useRefiningCalculator, MATERIALS, CITIES } from '@/hooks/useRefiningCalculator';
import { getItemIconUrl, getItemFullName } from '@/lib/albion/utils';
import { getRenderId, formatItemName } from '@/lib/albion/analysis/refining';
import { cn } from '@/lib/utils';

const timeAgo = (dateStr: string | undefined) => {
  if (!dateStr || dateStr.startsWith('0001-01-01')) return 'Sem dados';
  const diff = Date.now() - new Date(dateStr + "Z").getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  return `${Math.floor(mins / 1440)}d ${Math.floor((mins % 1440) / 60)}h`;
};

const FallbackIcon = () => (
  <div className="w-16 h-16 bg-black/40 rounded flex items-center justify-center border border-white/5">
    <span className="text-white/20 text-[10px] font-bold uppercase">No Image</span>
  </div>
);

// Item Box Component to guarantee consistency
const ItemBox = ({ id, qty, title, price, subtitle, date }: { id: string, qty?: number, title: string, price: number, subtitle: string, date?: string }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 bg-[#151518]/80 backdrop-blur p-4 rounded-xl border border-white/5 shadow-inner w-full flex-1 min-w-0">
      <div className="relative shrink-0 flex items-center justify-center">
         <div className="w-16 h-16 bg-[#101012] rounded drop-shadow-[0_0_10px_rgba(0,0,0,0.5)] flex items-center justify-center p-1 border border-white/10 relative overflow-hidden">
           {id ? (
             <Image 
               unoptimized 
               src={getItemIconUrl(getRenderId(id), 1, 64)} 
               alt={title} 
               width={64} height={64} 
               className="object-contain drop-shadow-md w-full h-full"
               onError={(e) => { e.currentTarget.style.display = 'none'; }}
             />
           ) : <FallbackIcon />}
         </div>
         {qty && (
           <div className="absolute -bottom-2 -right-2 bg-rose-500 text-white font-black text-xs px-2 py-0.5 rounded-full border border-rose-900 shadow-md">
             x{qty}
           </div>
         )}
      </div>
      <div className="flex-1 min-w-0 w-full text-center sm:text-left flex flex-col justify-center h-full">
         <p className="text-xs text-white/40 uppercase tracking-widest font-bold">{subtitle}</p>
         <p className="text-[var(--mw-gold-bright)] font-bold leading-tight truncate w-full text-base sm:text-lg mb-2" title={id || title}>{formatItemName(id) || title}</p>
         <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-2 mt-auto">
            <span className="text-[var(--mw-gold-bright)] font-mono text-sm font-bold bg-[#0a0a0c] px-3 py-1 rounded border border-white/5 shadow-inner">
              {price > 0 ? `${price.toLocaleString()} s/u` : 'Sem Preço'}
            </span>
            {date && <span className="text-xs text-white/30 uppercase tracking-widest font-bold whitespace-nowrap">{timeAgo(date)}</span>}
         </div>
      </div>
    </div>
  );
};

export function RefiningCalculator() {
  const { state, setters, computed, actions } = useRefiningCalculator();
  const [showDestinyPanel, setShowDestinyPanel] = useState(false);
  
  const TIERS = [2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="space-y-8 animate-fade-in pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8 items-center text-center">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-wider text-[var(--mw-text-main)] flex items-center justify-center gap-3 w-full">
          <Factory className="text-cyan-400" size={42} />
          <span>Central de <span className="text-cyan-400">Refino</span></span>
        </h1>
        <p className="text-[var(--mw-text-muted)] text-base max-w-2xl mx-auto">
          Cálculos precisos com RRR hiperbólico, taxas de uso e puxada de API em tempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* PARTE 1: CONFIGURAÇÕES E ESTAÇÃO (GRADE SUPERIOR) */}
        <div className="bg-[#0a0a0c]/80 p-6 rounded-2xl border border-white/5 shadow-xl flex flex-col gap-6">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
               {/* Seleção de Materiais e Logística */}
               <div className="space-y-4 flex flex-col justify-between h-full">
                  <div className="flex-1 flex flex-col gap-2">
                    <h3 className="font-bold text-[var(--mw-text-main)] uppercase tracking-widest text-sm flex items-center gap-2 mb-1">
                      <span className="bg-white/10 text-white w-6 h-6 flex items-center justify-center rounded text-xs">1</span> Receita
                    </h3>
                    <div className="space-y-3">
                      <select value={state.material.id} onChange={e => setters.setMaterial(MATERIALS.find(m => m.id === e.target.value)!)} className="w-full bg-[#151518] border border-white/10 rounded px-4 py-2.5 text-[var(--mw-text-main)] text-sm focus:border-cyan-500/50 outline-none transition-colors appearance-none font-bold">
                        {MATERIALS.map(m => (<option key={m.id} value={m.id}>{m.name}</option>))}
                      </select>
                      <div className="flex items-center gap-3">
                        <select value={state.tier} onChange={e => setters.setTier(Number(e.target.value))} className="flex-1 bg-[#151518] border border-white/10 rounded px-3 py-2.5 text-[var(--mw-gold-bright)] text-sm font-mono font-bold appearance-none text-center outline-none">
                          {TIERS.map(t => <option key={t} value={t}>Tier {t}</option>)}
                         </select>
                         <select value={state.enchantment} onChange={e => setters.setEnchantment(Number(e.target.value))} disabled={state.tier < 4} className="flex-1 bg-[#151518] border border-white/10 rounded px-3 py-2.5 text-cyan-400 text-sm font-mono font-bold disabled:opacity-50 appearance-none text-center outline-none">
                           {[0,1,2,3,4].filter(e => !(computed.isStone && e > 3)).map(e => <option key={e} value={e}>Magic .{e}</option>)}
                         </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-end gap-2">
                    <h3 className="font-bold text-[var(--mw-gold-bright)] uppercase tracking-widest text-sm flex items-center gap-2 mb-1">
                       <span className="bg-[var(--mw-gold-primary)]/20 text-[var(--mw-gold-bright)] w-6 h-6 flex items-center justify-center rounded text-xs">2</span> Logística
                    </h3>
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="text-[10px] uppercase text-white/50 block mb-1 font-bold pl-1 truncate">Comprar (Matérias)</label>
                          <select value={state.buyCity} onChange={e => setters.setBuyCity(e.target.value)} className="w-full bg-[#151518] border border-white/10 rounded px-3 py-2.5 text-[var(--mw-text-main)] text-sm font-bold appearance-none text-center outline-none focus:border-cyan-500/50">
                            {CITIES.map(c => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] uppercase text-white/50 block mb-1 font-bold pl-1 truncate">Vender (Refinados)</label>
                          <select value={state.sellCity} onChange={e => setters.setSellCity(e.target.value)} className="w-full bg-[#151518] border border-white/10 rounded px-3 py-2.5 text-[var(--mw-gold-bright)] text-sm font-bold appearance-none text-center outline-none focus:border-[var(--mw-gold-primary)]/50">
                            {CITIES.map(c => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                    </div>
                  </div>
               </div>

               {/* Estação e Custos */}
               <div className="space-y-4 flex flex-col justify-between h-full">
                  <div className="flex-1 flex flex-col justify-end gap-3">
                      <h3 className="font-bold text-orange-500 uppercase tracking-widest text-sm flex items-center gap-2 mb-1">
                         <span className="bg-orange-500/20 text-orange-500 w-6 h-6 flex items-center justify-center rounded text-xs">3</span> Custos e Bônus
                      </h3>
                     <label className="flex items-center justify-between cursor-pointer p-2.5 bg-[#151518] rounded border border-cyan-900/40 hover:border-cyan-500/50 transition-colors group" title="Cidades com bônus ganham taxa extra de devolução de recursos (RRR).">
                       <span className="text-sm font-bold text-cyan-400 group-hover:text-cyan-300 leading-tight flex items-center gap-2">Cidade Bônus <span className="text-[10px] text-cyan-400/60 block py-0.5 px-2 bg-cyan-900/30 rounded border border-cyan-500/20">{state.material.city}</span></span>
                       <input type="checkbox" checked={state.bonusLocation} onChange={e => {setters.setBonusLocation(e.target.checked); if (e.target.checked) setters.setHideoutBonus(0);}} className="accent-cyan-500 w-4 h-4 cursor-pointer rounded shrink-0" />
                     </label>

                     <div className="grid grid-cols-2 gap-3">
                        <div className="relative flex items-center">
                           <span className="absolute left-3 text-[10px] text-white/50 font-bold uppercase tracking-wider z-10 shrink-0">Estação %</span>
                           <input type="number" value={state.stationTax} onChange={e => setters.setStationTax(Number(e.target.value))} className="w-full bg-[#151518] border border-white/10 rounded px-3 py-2.5 text-rose-400 font-mono font-bold outline-none focus:border-rose-500 text-right pr-3" />
                        </div>
                        <div className="relative flex items-center">
                           <span className="absolute left-3 text-[10px] text-white/50 font-bold uppercase tracking-wider z-10 shrink-0">Frete /u</span>
                           <input type="number" value={state.transportCost} onChange={e => setters.setTransportCost(Number(e.target.value))} className="w-full bg-[#151518] border border-white/10 rounded px-3 py-2.5 text-rose-400 font-mono font-bold outline-none focus:border-rose-500 text-right pr-3" />
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <label className="flex flex-1 items-center justify-between cursor-pointer p-2.5 bg-[#151518] rounded border border-white/10 hover:border-white/20 transition-colors" title="Conta Premium ativa reduz a taxa do mercado na venda de itens de 10.5% para 6.5%.">
                          <span className="text-sm font-bold text-white/80">Taxa Premium</span>
                          <input type="checkbox" checked={state.hasPremium} onChange={e => setters.setHasPremium(e.target.checked)} className="accent-indigo-500 w-4 h-4 cursor-pointer rounded shrink-0" />
                        </label>
                     </div>
                     
                     <label className="flex items-center justify-between cursor-pointer p-3 bg-orange-900/20 rounded-lg border border-orange-500/30 hover:border-orange-500/50 transition-colors group">
                       <span className="text-sm font-bold text-orange-400 group-hover:text-orange-300 flex items-center gap-2">
                         Injetar Foco (+RRR)
                         {state.useFocus && <span className="bg-orange-500/20 text-orange-300 text-xs px-2 py-0.5 rounded border border-orange-500/20 whitespace-nowrap">Custo: {computed.actualFocusCost.toLocaleString()}</span>}
                       </span>
                       <input type="checkbox" checked={state.useFocus} onChange={e => setters.setUseFocus(e.target.checked)} className="accent-orange-500 w-5 h-5 cursor-pointer rounded shrink-0 drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]" />
                     </label>
                  </div>
               </div>
           </div>

           {/* Painel de Destino (Especialização) - Accordion */}
           <div className="w-full rounded-xl border border-orange-900/30 bg-[#101012] overflow-hidden">
              <button 
                onClick={() => setShowDestinyPanel(!showDestinyPanel)}
                className="w-full flex items-center justify-between p-4 focus:outline-none hover:bg-white/5 transition-colors"
              >
                  <h3 className="font-bold text-orange-400 uppercase tracking-widest text-sm flex items-center gap-3">
                     <span className="bg-orange-500/20 text-orange-400 w-6 h-6 flex items-center justify-center rounded text-xs">4</span> Configuração de Especialização (Foco)
                     <span className="text-xs bg-orange-950 text-orange-300 px-2 py-1 rounded font-mono border border-orange-900">Eficiência Total: {computed.focusEfficiency}</span>
                  </h3>
                  {showDestinyPanel ? <ChevronUp className="text-orange-400" /> : <ChevronDown className="text-orange-400" />}
              </button>
              
              {showDestinyPanel && (
                <div className="p-4 border-t border-orange-900/30 grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0a0a0c]/50">
                   {/* Maestria e Atual Tier */}
                   <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between gap-4">
                         <label className="text-xs uppercase text-white/50 font-bold whitespace-nowrap">Maestria Refino (0-100)</label>
                         <input type="number" min="0" max="100" value={state.mastery} onChange={e => setters.setMastery(Math.max(0, Math.min(100, Number(e.target.value))))} className="w-20 bg-[#151518] border border-white/10 rounded px-2 py-1.5 text-[var(--mw-text-main)] font-mono font-bold outline-none text-center focus:border-orange-500 shrink-0" />
                      </div>
                      <div className="flex items-center justify-between gap-4">
                          <label className="text-xs uppercase text-orange-400/80 font-bold whitespace-nowrap flex items-center gap-2">
                             Spec Atual <span className="bg-orange-500/20 text-orange-400 px-1.5 rounded">T{state.tier}</span> (0-100)
                          </label>
                          <input type="number" min="0" max="100" value={state.specs[state.tier]} onChange={e => setters.setSpecs(state.tier, Math.max(0, Math.min(100, Number(e.target.value))))} className="w-20 bg-orange-900/10 border border-orange-500/30 rounded px-2 py-1.5 text-orange-400 font-mono font-bold outline-none text-center focus:border-orange-500 shrink-0" />
                      </div>
                   </div>
                   
                   {/* Outras Tiers */}
                   <div className="flex flex-col gap-3">
                      <label className="text-xs uppercase text-white/50 font-bold">Specs Adicionais (0-100)</label>
                      <div className="flex items-center justify-between gap-2">
                         {TIERS.filter(t => t !== state.tier).map(t => (
                           <div key={t} className="flex flex-col gap-1 items-center flex-1">
                              <span className="text-[10px] text-white/30 font-bold">T{t}</span>
                              <input type="number" min="0" max="100" value={state.specs[t] || 0} onChange={e => setters.setSpecs(t, Math.max(0, Math.min(100, Number(e.target.value))))} className="w-full max-w-[60px] bg-[#151518] border border-white/10 rounded px-1 py-1.5 text-white/50 text-xs font-mono text-center outline-none focus:border-orange-500/50" />
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              )}
           </div>
        </div>

        {/* PARTE 2: BANCADA E CÁLCULO VISUAL */}
        <section className="bg-[var(--mw-card)] rounded-2xl border border-white/5 p-6 shadow-2xl overflow-hidden relative">
           
           <div className="flex justify-end mb-6">
              <button onClick={actions.fetchPrices} disabled={state.loading} className="px-4 py-2 bg-[var(--mw-primary)]/10 hover:bg-[var(--mw-primary)]/20 active:scale-95 text-[var(--mw-gold-bright)] border border-[var(--mw-gold-primary)]/30 rounded shadow-[0_0_15px_rgba(255,200,0,0.1)] font-bold uppercase tracking-widest transition-all flex items-center gap-2 text-xs">
                 <RefreshCw size={14} className={state.loading ? 'animate-spin' : ''} />
                 {state.loading ? 'Sincronizando...' : 'Atualizar Preços'}
              </button>
           </div>

           <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-6 relative z-10 w-full mb-10">
              {/* ENTRADA DE RECURSOS */}
              <div className="flex flex-col gap-4 flex-1 min-w-0">
                 {computed.subTier >= 2 && (
                    <ItemBox 
                       id={computed.ids.subRefinedId} 
                       title={formatItemName(computed.ids.subRefinedId)} 
                       subtitle={`Sub-Recurso T${computed.subTier}`}
                       qty={computed.qtys.subQty}
                       price={computed.subData.buy}
                       date={computed.subData.buyDate}
                    />
                 )}
                 <ItemBox 
                     id={computed.ids.rawId} 
                     title={formatItemName(computed.ids.rawId)} 
                     subtitle={`Bruto T${state.tier}`}
                     qty={computed.qtys.rawQty}
                     price={computed.rawData.buy}
                     date={computed.rawData.buyDate}
                 />
              </div>

              {/* BANCADA E FLECHA CENTRAL */}
              <div className="flex flex-col justify-center items-center py-4 xl:py-0 shrink-0 w-full xl:w-auto relative">
                 <div className="hidden xl:block w-24 h-1.5 bg-gradient-to-r from-transparent via-cyan-500 to-cyan-500 rounded-full relative shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-0 h-0 border-y-[8px] border-y-transparent border-l-[14px] border-l-cyan-400" />
                 </div>
                 <div className="xl:hidden w-1.5 h-16 bg-gradient-to-b from-transparent via-cyan-500 to-cyan-500 rounded-full relative shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-0 h-0 border-x-[8px] border-x-transparent border-t-[14px] border-t-cyan-400" />
                 </div>
                 
                 {/* Mini Tag RRR em cima da flecha */}
                 <div className="absolute xl:-top-8 xl:left-1/2 xl:-translate-x-1/2 bg-[#0a0a0c] border border-cyan-500/30 px-3 py-1 rounded text-cyan-400 font-black text-xs whitespace-nowrap shadow-[0_0_15px_rgba(34,211,238,0.2)] cursor-help"
                      title={`Retorno de Recursos (RRR): Baseado em um Local Production Bonus (LPB) de ${
                        state.bonusLocation ? '58%' : '18%'
                      }${state.useFocus ? ' + 59% (Foco)' : ''}${state.hideoutBonus ? ` + ${state.hideoutBonus}% (Hideout)` : ''}.
Fórmula: 1 - (1 / (1 + LPB/100)).
O Foco reduz a perda de recursos usando seus níveis de Maestria/Especialização.`}>
                   RRR: {(computed.rrr * 100).toFixed(1)}%
                 </div>
              </div>

              {/* SAÍDA / RETORNO */}
              <div className="flex-1 min-w-0 flex">
                 <div className="flex flex-col sm:flex-row items-center gap-5 bg-emerald-900/10 p-5 rounded-xl border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.05)] w-full">
                   <div className="w-16 h-16 shrink-0 bg-[#0a0a0c] rounded drop-shadow-[0_0_20px_rgba(255,200,0,0.15)] flex items-center justify-center p-1 border border-[var(--mw-gold-primary)]/50 relative overflow-hidden group">
                      <Image unoptimized src={getItemIconUrl(getRenderId(computed.ids.refinedId), 1, 64)} alt="Refinado" width={64} height={64} className="object-contain drop-shadow-lg group-hover:scale-110 transition-transform w-full h-full" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                   </div>
                   <div className="flex-1 min-w-0 w-full text-center sm:text-left flex flex-col justify-center">
                      <p className="text-xs text-emerald-400/80 uppercase tracking-widest font-bold mb-1">Produto Final</p>
                      <p className="text-emerald-400 font-bold leading-tight truncate w-full text-lg sm:text-2xl mb-2" title={computed.ids.refinedId}>
                        {formatItemName(computed.ids.refinedId)}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 bg-[#0a0a0c] p-3 rounded border border-emerald-900/30 mt-auto justify-center sm:justify-start">
                         <span className="text-emerald-300 font-black text-xs bg-emerald-500/20 px-2 py-1 rounded whitespace-nowrap">x{computed.qtys.outputQty} Rendimento</span>
                         <span className="text-emerald-400 font-mono text-sm font-bold whitespace-nowrap">{computed.refinedData.sell.toLocaleString()} s/u</span>
                      </div>
                   </div>
                 </div>
              </div>
           </div>

           {/* PARTE 3: RESULTADO FINANCEIRO (Painel Inferior) */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
               <div className="bg-[#0a0a0c] p-4 flex flex-col items-center justify-center text-center">
                  <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-1">Custo Matéria*</p>
                  <p className="font-mono text-rose-400 font-bold text-lg drop-shadow">-{computed.profitData.effectivelyConsumedMaterialsCost.toLocaleString(undefined, {maximumFractionDigits:0})}s</p>
                  <p className="text-[10px] text-white/30 uppercase mt-1">C/ RRR aplicado</p>
               </div>
               <div className="bg-[#0a0a0c] p-4 flex flex-col items-center justify-center text-center">
                  <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-1">Taxas & Frete</p>
                  <p className="font-mono text-rose-500/80 font-bold text-lg drop-shadow">-{(computed.profitData.usageFee + computed.profitData.totalTransportCost).toLocaleString(undefined, {maximumFractionDigits:0})}s</p>
               </div>
               <div className="bg-[#0a0a0c] p-4 flex flex-col items-center justify-center text-center">
                  <p className="text-xs text-emerald-500/60 uppercase tracking-widest font-bold mb-1">Receita Líquida</p>
                  <p className="font-mono text-emerald-400 font-bold text-lg drop-shadow">+{computed.profitData.netRevenue.toLocaleString(undefined, {maximumFractionDigits:0})}s</p>
                  <p className="text-[10px] text-emerald-400/50 uppercase mt-1">Após {(computed.profitData.marketTaxFactor*100).toFixed(1)}% Tax</p>
               </div>
               <div className={cn("p-4 flex flex-col items-center justify-center text-center relative", computed.profitData.profit > 0 ? "bg-emerald-900/10" : "bg-rose-900/10")}>
                  <p className="text-xs uppercase tracking-widest font-bold mb-1 text-white/80">Lucro Limpo</p>
                  <p className={cn("font-mono text-xl md:text-3xl font-black drop-shadow-[0_0_10px_rgba(0,0,0,0.5)] flex items-center gap-2", computed.profitData.profit > 0 ? "text-emerald-400" : "text-rose-400")}>
                    {computed.profitData.profit > 0 ? <TrendingUp size={20}/> : <TrendingDown size={20}/>}
                    {computed.profitData.profit.toLocaleString(undefined, {maximumFractionDigits:0})}
                  </p>
                  <div className="flex gap-2 items-center mt-2">
                    <div className={cn("text-xs font-black px-2 py-0.5 rounded border", computed.profitData.profit > 0 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" : "text-rose-400 bg-rose-500/10 border-rose-500/30")}>
                      {computed.profitData.margin.toFixed(2)}% Margem
                    </div>
                    {state.useFocus && computed.actualFocusCost > 0 && (
                      <div className="text-xs font-black px-2 py-0.5 rounded border text-orange-400 bg-orange-500/10 border-orange-500/30" title="Prata gerada por cada ponto de Foco gasto.">
                        {(computed.profitData.profit / computed.actualFocusCost).toFixed(2)} s/foco
                      </div>
                    )}
                  </div>
               </div>
           </div>

        </section>

      </div>
    </div>
  );
}
