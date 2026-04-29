import React, { useState } from 'react';
import {
  formatPrice,
  formatProfit,
  formatTimeAgo,
  getQualityInfo,
  parseItemId,
  getItemIconUrl,
  calculateTax,
  formatSilver,
  getAgeMinutes,
  calculateMargin,
} from '@/lib/albion/utils';
import { getItemFullName } from '@/lib/albion/items';
import { TradeResult } from '@/lib/albion/types';
import { Star, Route, BarChart2, Calculator, Check, Copy } from 'lucide-react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { LiveTimeAgo } from '@/components/albion/LiveTimeAgo';
import { motion } from 'motion/react';
import Image from 'next/image';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function ageIndicator(ageMinutes: number) {
  if (ageMinutes < 15) return { cls: 'border-green-500', bg: 'bg-[var(--mw-green)]', text: 'text-[var(--mw-green)]', label: '< 15 min (fresco)', tooltip: 'Dados muito recentes. Alta chance do preço ainda ser este.' };
  if (ageMinutes <= 30) return { cls: 'border-[var(--mw-gold-bright)]', bg: 'bg-[var(--mw-gold-bright)]', text: 'text-[var(--mw-gold-bright)]', label: '15-30 min', tooltip: 'Dados com idade média. Oportunidade pode estar desaparecendo.' };
  return { cls: 'border-[var(--mw-red)]', bg: 'bg-[var(--mw-red)]', text: 'text-[var(--mw-red)]', label: '> 30 min (velho)', tooltip: 'Risco altíssimo: Dados velhos. Confirme os preços no jogo antes de comprar.' };
}

export const TradeCard = React.memo(({ result, index, isNew, maxProfit }: { result: TradeResult; index: number, isNew?: boolean, maxProfit?: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val > 0 && val <= 9999) {
      setQuantity(val);
    } else if (e.target.value === '') {
      setQuantity(1);
    }
  };

  const p = parseItemId(result.itemId);
  const name = getItemFullName(result.itemId);
  const qi = getQualityInfo(result.quality);
  // User asked for size=40
  const iconUrl = `https://render.albiononline.com/v1/item/${result.itemId}.png?size=40&quality=${result.quality}`;
  const tax = calculateTax(result.sellPrice * quantity, 4.5);

  const buyAge = ageIndicator(result.cityAge);
  const sellAge = ageIndicator(result.bmAge);
  const worstAge = result.worstAge || Math.max(result.cityAge, result.bmAge);
  const overallAgeIndicator = ageIndicator(worstAge);

  const displayProfit = (result.adjustedProfit !== undefined ? result.adjustedProfit : result.profit) * quantity;
  const isHotDeal = displayProfit > 100000 && worstAge < 10;

  const originCity = result.tradeType === 'enchant' ? (result.baseCity || 'Desconhecido') : result.sourceCity;
  const isRed = originCity !== 'Caerleon';
  const routeColor = isRed ? 'bg-[var(--mw-red)]/15 text-[var(--mw-red)] border-[var(--mw-red)]/30' : 'bg-[var(--mw-green)]/15 text-[var(--mw-green)] border-[var(--mw-green)]/30';
  const routeText = isRed ? '🔴 Zona Vermelha' : '🟢 Local (Caerleon, Seguro)';

  const isWeapon = result.itemId.includes('_MAIN_') || result.itemId.includes('_2H_');
  const isArmor = result.itemId.includes('_HEAD') || result.itemId.includes('_ARMOR') || result.itemId.includes('_SHOES');
  const catColor = isWeapon ? 'border-l-[4px] border-l-[var(--mw-red)]' : isArmor ? 'border-l-[4px] border-l-blue-500' : 'border-l-[4px] border-l-[var(--mw-green)]';

  const renderSteps = () => {
    if (result.tradeType === 'buyorder') {
      return (
        <div className="relative pl-6 space-y-4 before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-blue-500/50 before:to-transparent">
          <div className="relative flex items-start gap-4">
            <div className="absolute left-[-28px] bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-slate-900">1</div>
            <div className="flex-1 bg-slate-900/80 p-3 rounded-lg flex flex-col sm:flex-row justify-between gap-2 shadow-sm">
               <div>
                  <div className="text-slate-300 font-medium">Colocar pedido de compra (Buy Order)</div>
                  <div className="text-slate-500 text-xs mt-1">Item: <strong className="text-slate-300">{name}</strong></div>
                  <div className="text-slate-500 text-xs">Local: <strong className="text-slate-300">{result.sourceCity}</strong></div>
               </div>
               <div className="text-right">
                  <div className="text-red-400 font-mono font-bold">-{formatSilver(result.buyPrice)}</div>
                  <div className="text-[10px] text-slate-500">Inclui taxa setup de {formatSilver(result.setupFee!)}</div>
               </div>
            </div>
          </div>
          <div className="relative flex items-start gap-4">
            <div className="absolute left-[-28px] bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-slate-900">2</div>
            <div className="flex-1 bg-slate-900/80 p-3 rounded-lg flex flex-col sm:flex-row justify-between gap-2 shadow-sm">
               <div>
                  <div className="text-slate-300 font-medium">Vender no Mercado Negro (Venda Direta)</div>
                  <div className="text-slate-500 text-xs mt-1">Local: <strong className="text-amber-500">Caerleon (Black Market)</strong></div>
               </div>
               <div className="text-right">
                  <div className="text-green-400 font-mono font-bold">+{formatSilver(result.sellPrice)}</div>
               </div>
            </div>
          </div>
        </div>
      );
    } else if (result.tradeType === 'enchant') {
      const baseName = getItemFullName(result.baseId!);
      let stepNum = 1;
      return (
        <div className="relative pl-6 space-y-4 before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-purple-500/50 before:to-transparent">
          <div className="relative flex items-start gap-4">
            <div className="absolute left-[-28px] bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-slate-900">{stepNum++}</div>
            <div className="flex-1 bg-slate-900/80 p-3 rounded-lg flex flex-col sm:flex-row justify-between gap-2 shadow-sm">
               <div>
                  <div className="text-slate-300 font-medium">{result.baseMethod === 'direct' ? 'Comprar item base' : 'Fazer pedido do item base'}</div>
                  <div className="text-slate-500 text-xs mt-1">Item: <strong className="text-slate-300">{baseName}</strong></div>
                  <div className="text-slate-500 text-xs flex items-center gap-2">
                    <span>Local: <strong className="text-slate-300">{result.baseCity}</strong></span>
                    {result.baseDateStr && (
                      <span className="text-[10px] text-slate-500 bg-slate-800/50 px-1.5 py-0.5 rounded border border-slate-700">
                        <LiveTimeAgo dateStr={result.baseDateStr} />
                      </span>
                    )}
                  </div>
               </div>
               <div className="text-right">
                  <div className="text-red-400 font-mono font-bold">-{formatSilver(result.baseCost!)}</div>
               </div>
            </div>
          </div>
          {result.runesRequired?.map((rune, idx) => {
            const runeMatch = rune.id.match(/^T(\d+)/);
            const runeTier = runeMatch ? runeMatch[1] : '?';
            return (
             <div key={idx} className="relative flex items-start gap-4">
               <div className="absolute left-[-28px] bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-slate-900">{stepNum++}</div>
               <div className="flex-1 bg-slate-900/80 p-3 rounded-lg flex flex-col sm:flex-row justify-between gap-2 shadow-sm">
                  <div>
                     <div className="text-slate-300 font-medium">Material de Encantamento ({rune.method === 'buyorder' ? 'Pedido de Compra' : 'Compra Direta'})</div>
                     <div className="text-slate-500 text-xs mt-1">Qtd: <strong className="text-slate-300">{rune.amount}x <span className="text-amber-500">T{runeTier}</span> {getItemFullName(rune.id)}</strong></div>
                     <div className="text-slate-500 text-xs flex items-center gap-2">
                       <span>Local: <strong className="text-slate-300">{rune.city}</strong></span>
                       {rune.dateStr && (
                         <span className="text-[10px] text-slate-500 bg-slate-800/50 px-1.5 py-0.5 rounded border border-slate-700">
                           <LiveTimeAgo dateStr={rune.dateStr} />
                         </span>
                       )}
                     </div>
                  </div>
                  <div className="text-right">
                     <div className="text-red-400 font-mono font-bold">-{formatSilver(rune.amount * rune.price)}</div>
                     <div className="text-[10px] text-slate-500">{formatSilver(rune.price)} cada</div>
                     <div className="mt-2 text-[9px] text-slate-500 text-right bg-slate-950/40 p-1.5 flex flex-col items-end gap-1 rounded border border-slate-800/80">
                        <div title={`Compra Direta: ${rune.directCity || '?'}`}>
                          <strong>Dir:</strong> {rune.directPrice === Infinity ? '—' : formatSilver(rune.directPrice)}
                          {rune.directDate && rune.directPrice !== Infinity && <span className="ml-1 opacity-70">(<LiveTimeAgo dateStr={rune.directDate} />)</span>}
                        </div>
                        <div title={`Pedido de Compra: ${rune.orderCity || '?'}`}>
                          <strong>Ped:</strong> {rune.orderPrice === Infinity ? '—' : formatSilver(rune.orderPrice)}
                          {rune.orderDate && rune.orderPrice !== Infinity && <span className="ml-1 opacity-70">(<LiveTimeAgo dateStr={rune.orderDate} />)</span>}
                        </div>
                     </div>
                  </div>
               </div>
             </div>
            );
          })}
          <div className="relative flex items-start gap-4">
            <div className="absolute left-[-28px] bg-pink-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-slate-900">{stepNum++}</div>
            <div className="flex-1 bg-slate-900/80 p-3 rounded-lg flex flex-col sm:flex-row justify-between gap-2 shadow-sm">
               <div>
                  <div className="text-slate-300 font-medium">Encantar o item e transportar</div>
                  <div className="text-slate-500 text-xs mt-1">Destino: <strong className="text-slate-300">Caerleon</strong></div>
               </div>
            </div>
          </div>
          <div className="relative flex items-start gap-4">
            <div className="absolute left-[-28px] bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-slate-900">{stepNum++}</div>
            <div className="flex-1 bg-slate-900/80 p-3 rounded-lg flex flex-col sm:flex-row justify-between gap-2 shadow-sm">
               <div>
                  <div className="text-slate-300 font-medium">Vender ao Black Market</div>
               </div>
               <div className="text-right">
                  <div className="text-green-400 font-mono font-bold">+{formatSilver(result.sellPrice)}</div>
               </div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="relative pl-6 space-y-4 before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-emerald-500/50 before:to-transparent">
        <div className="relative flex items-start gap-4">
          <div className="absolute left-[-28px] bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-slate-900">1</div>
          <div className="flex-1 bg-slate-900/80 p-3 rounded-lg flex flex-col sm:flex-row justify-between gap-2 shadow-sm">
             <div>
                <div className="text-slate-300 font-medium">Comprar item (Pronto)</div>
                <div className="text-slate-500 text-xs mt-1">Item: <strong className="text-slate-300">{name}</strong></div>
                <div className="text-slate-500 text-xs">Local: <strong className="text-slate-300">{result.sourceCity}</strong></div>
             </div>
             <div className="text-right">
                <div className="text-red-400 font-mono font-bold">-{formatSilver(result.buyPrice)}</div>
             </div>
          </div>
        </div>
        <div className="relative flex items-start gap-4">
          <div className="absolute left-[-28px] bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-slate-900">2</div>
          <div className="flex-1 bg-slate-900/80 p-3 rounded-lg flex flex-col sm:flex-row justify-between gap-2 shadow-sm">
             <div>
                <div className="text-slate-300 font-medium">Transportar e Vender no BM</div>
                <div className="text-slate-500 text-xs mt-1">Local: <strong className="text-amber-500">Caerleon</strong></div>
             </div>
             <div className="text-right">
                <div className="text-green-400 font-mono font-bold">+{formatSilver(result.sellPrice)}</div>
             </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <motion.div 
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: Math.min(index * 0.05, 0.5), duration: 0.3 }}
      className={cn(
      "border rounded-xl flex flex-col transition-all duration-300 shadow-md hover:shadow-xl overflow-hidden text-sm relative mt-3 group backdrop-blur-sm",
      catColor,
      isHotDeal 
        ? "bg-[var(--mw-card)]/90 border-[var(--mw-gold-bright)]/60 shadow-[0_0_20px_rgba(240,192,64,0.3)] hover:shadow-[0_0_25px_rgba(240,192,64,0.5)]" 
        : "bg-[var(--mw-card)]/60 border-[var(--mw-border)] hover:bg-[var(--mw-card-hover)] hover:border-[var(--mw-gold-primary)]/40",
      isNew && "animate-[pulse_1.5s_ease-in-out_3] border-[var(--mw-green)]/60 shadow-[0_0_15px_rgba(76,175,125,0.4)]"
    )}>
      <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(201,168,76,0.5) 2px, rgba(201,168,76,0.5) 4px)' }}></div>
      {isHotDeal && (
         <div className="absolute top-0 right-0 z-10 translate-x-1.5 -translate-y-1.5">
           <span className="flex h-5 items-center gap-1">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-30"></span>
             <span className="relative inline-flex rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-[10px] font-black text-slate-950 px-2 py-0.5 shadow-lg border border-amber-300/50 uppercase tracking-widest whitespace-nowrap">
               🔥 Hot Deal
             </span>
           </span>
         </div>
      )}
      <div 
        className="flex flex-col lg:flex-row lg:items-center p-4 cursor-pointer relative gap-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* ITEM IDENTITY */}
        <div className="flex items-center gap-4 lg:w-[35%] shrink-0">
          <div className="relative w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-950 rounded-lg flex items-center justify-center border-2 shadow-inner" style={{ borderColor: qi.color }}>
            <Image src={iconUrl} alt={name} width={56} height={56} className="max-w-full max-h-full object-contain filter drop-shadow-md p-1" referrerPolicy="no-referrer" />
            <span className="absolute -bottom-2 -right-2 text-[10px] font-black px-1.5 py-0.5 rounded shadow-md bg-[var(--mw-bg)] border border-[var(--mw-border)] text-[var(--mw-text-main)]">
              T{p.tier}.{p.enchant}
            </span>
            
            {result.flipScore && (
              <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 z-10 font-bold text-[10px] cursor-help" 
                   title={result.flipScore.reason}
                   style={{
                     backgroundColor: 'var(--mw-bg)',
                     borderColor: result.flipScore.recommendation === 'EXECUTE' ? 'var(--mw-green)' : result.flipScore.recommendation === 'WATCH' ? 'var(--mw-gold-bright)' : 'var(--mw-red)',
                     color: result.flipScore.recommendation === 'EXECUTE' ? 'var(--mw-green)' : result.flipScore.recommendation === 'WATCH' ? 'var(--mw-gold-bright)' : 'var(--mw-red)',
                   }}>
                {result.flipScore.totalScore}
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-[var(--mw-text-main)] truncate w-full text-base" title={name}>{name}</span>
            <div className="flex flex-wrap gap-2 text-[11px] text-[var(--mw-text-muted)] mt-1.5 items-center">
              <span className="font-semibold bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded shadow-sm" style={{ color: qi.color }}>{qi.namePT}</span>
              {p.enchant > 0 && <span className="font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded shadow-sm">Encantamento {p.enchant}</span>}
              {result.volume24h !== undefined && (
                <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center border shadow-sm", 
                  result.volume24h >= 20 ? "bg-[var(--mw-green)]/10 text-[var(--mw-green)] border-[var(--mw-green)]/20" :
                  result.volume24h >= 5 ? "bg-[var(--mw-gold-bright)]/10 text-[var(--mw-gold-bright)] border-[var(--mw-gold-bright)]/20" : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                )}>
                  {result.volume24h >= 20 ? '🔥' : result.volume24h >= 5 ? '⚡' : '💤'} Vendas/24h: {result.volume24h}
                </span>
              )}
            </div>
            {/* INLINE OVERALL AGE INDICATOR */}
            <div className="flex mt-2 items-center gap-1 cursor-help" title={overallAgeIndicator.tooltip}>
               <span className="text-[10px] text-[var(--mw-text-muted)] uppercase font-bold tracking-wider mr-1">Idade:</span>
               <div className={cn("w-2 h-2 rounded-full", overallAgeIndicator.bg)}></div>
               <span className={cn("text-[10px] font-bold uppercase", overallAgeIndicator.text)}>{overallAgeIndicator.label}</span>
            </div>
          </div>
        </div>

        {/* CITIES & PRICES */}
        <div className="flex-1 flex flex-row items-center justify-between lg:justify-center gap-6 lg:gap-8 bg-[var(--mw-bg)]/40 rounded-lg p-3 border border-[var(--mw-border)]/50">
          <div className="flex flex-col">
            <span className="text-[10px] text-[var(--mw-text-muted)] uppercase font-bold tracking-wider mb-1">Mercado de Origem</span>
            <div className="flex items-center gap-2">
               <span className={cn("text-xs font-bold px-2 py-0.5 rounded border shadow-sm truncate max-w-[120px]", routeColor)} title={originCity}>{originCity}</span>
            </div>
            <div className="text-[var(--mw-text-main)] font-mono font-bold mt-1 text-sm">{formatPrice(result.buyPrice)}</div>
          </div>
          
          <div className="flex flex-col items-center justify-center">
            <Route size={16} className="text-[var(--mw-text-muted)] hidden sm:block" />
            <div className="h-px w-8 bg-[var(--mw-border)] my-1 hidden sm:block"></div>
            <span className="text-[10px] bg-[var(--mw-bg)] text-[var(--mw-text-muted)] px-1.5 rounded">{routeText.split(' ')[0]}</span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] text-[var(--mw-text-muted)] uppercase font-bold tracking-wider mb-1">Destino (Venda)</span>
            <div className="flex items-center gap-2">
               <span className="text-xs font-bold px-2 py-0.5 rounded border shadow-sm bg-[var(--mw-bg)] text-[var(--mw-gold-bright)] border-[var(--mw-border)]">Black Market</span>
            </div>
            <div className="text-[var(--mw-gold-bright)] font-mono font-bold mt-1 text-sm">{formatPrice(result.sellPrice)}</div>
          </div>
        </div>

        {/* PROFIT & MARGIN */}
        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-[160px] shrink-0 border-t lg:border-t-0 border-[var(--mw-border)]/50 pt-3 lg:pt-0">
          <div className="flex flex-col lg:items-end w-full relative">
             <span className="text-[10px] text-[var(--mw-text-muted)] uppercase font-bold tracking-wider mb-1">Lucro Líquido Estimado</span>
             <span className={cn("font-black text-2xl lg:text-3xl leading-none drop-shadow-md", displayProfit >= 0 ? "text-[var(--mw-gold-bright)]" : "text-[var(--mw-red)]")}>
               {formatSilver(Math.floor(displayProfit))}
             </span>
             {maxProfit && maxProfit > 0 && displayProfit > 0 && (
               <div className="w-full lg:w-32 h-1.5 bg-[var(--mw-bg)]/80 rounded-full mt-2 overflow-hidden border border-[var(--mw-border)]/50 shadow-inner float-right">
                 <div className="h-full bg-gradient-to-r from-[var(--mw-gold-dark)] to-[var(--mw-gold-bright)] rounded-full" style={{ width: `${Math.min(100, Math.max(0, (displayProfit / maxProfit) * 100))}%` }}></div>
               </div>
             )}
          </div>
          <div className={cn("font-mono text-xs font-bold bg-[var(--mw-bg)] px-2 py-1 rounded shadow-inner mt-2", result.margin >= 30 ? "text-[var(--mw-green)] border border-[var(--mw-green)]/20" : "text-[var(--mw-text-main)] border border-[var(--mw-border)]")}>
            {result.margin.toFixed(1)}% de Margem
          </div>
        </div>
      </div>

      {/* Freshness indicator line */}
      <div className={cn("absolute bottom-0 left-0 h-1 transition-all w-full opacity-80", buyAge.cls.replace('border-', 'bg-'))} />

      {isOpen && (
        <div className="border-t border-[var(--mw-border)]/50 bg-[var(--mw-bg)] p-4 sm:p-6 shadow-inner">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* INSTRUCTIONS */}
            <div className="lg:col-span-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                <h4 className="text-[11px] font-black text-[var(--mw-text-muted)] flex items-center gap-2 uppercase tracking-widest bg-[var(--mw-card)] border border-[var(--mw-border)] px-3 py-1.5 rounded w-fit m-0">
                  <Route size={14} className="text-[var(--mw-gold-primary)]" /> Roteiro de Execução
                </h4>
                
                <div className="flex items-center gap-2 bg-[var(--mw-card)] border border-[var(--mw-border)] px-3 py-1.5 rounded text-xs shadow-inner">
                  <span className="text-[var(--mw-text-muted)] font-semibold uppercase">Simulador (Qtd)</span>
                  <input 
                    type="number" 
                    min="1" 
                    max="9999" 
                    value={quantity} 
                    onChange={handleQuantityChange}
                    onClick={(e) => e.stopPropagation()}
                    className="w-16 bg-[var(--mw-bg)] border border-[var(--mw-border)] rounded px-2 py-0.5 text-[var(--mw-gold-bright)] font-mono font-bold outline-none focus:border-[var(--mw-gold-primary)] text-center"
                  />
                </div>
              </div>
              <div className="bg-[var(--mw-card)]/40 p-2 sm:p-4 rounded-xl border border-[var(--mw-border)]">
                 {renderSteps()}
                 
                 {result.scenarios && result.scenarios.length > 1 && (
                   <div className="mt-4 pt-4 border-t border-[var(--mw-border)]">
                     <h5 className="text-[10px] text-[var(--mw-text-muted)] uppercase tracking-wider mb-2 font-bold">Alternativas Encontradas:</h5>
                     <div className="space-y-2">
                       {result.scenarios.filter((s: any) => s.id !== result.scenarioUsed).map((s: any, idx: number) => {
                         const sBaseName = getItemFullName(s.currentBaseId);
                         const sProfit = result.sellPrice - s.totalCost - result.tax;
                         const sMargin = calculateMargin(s.totalCost, sProfit);
                         const isNative = s.runesRequired.length === 0;
                         return (
                           <div key={idx} className="flex flex-col sm:flex-row justify-between bg-[var(--mw-bg)]/50 p-2 rounded border border-[var(--mw-border)] text-[11px]">
                             <div className="flex flex-col gap-1">
                               <strong className="text-[var(--mw-text-main)]">{isNative ? 'Comprar item já pronto' : `Comprar ${sBaseName} + Runas`}</strong>
                               <span className="text-[var(--mw-text-muted)]">
                                 Custo total: <span className="text-[var(--mw-red)] font-mono">{formatSilver(s.totalCost)}</span>
                               </span>
                             </div>
                             <div className="flex flex-col items-end gap-1 mt-2 sm:mt-0">
                               <span className={cn("font-bold", sProfit > 0 ? "text-[var(--mw-green)]" : "text-[var(--mw-red)]")}>Lucro: {sProfit > 0 ? '+' : ''}{formatSilver(sProfit)}</span>
                               <span className="text-[var(--mw-text-muted)] font-mono">MG: {sMargin.toFixed(1)}%</span>
                             </div>
                           </div>
                         );
                       })}
                     </div>
                   </div>
                 )}

                 <div className="mt-6 p-4 bg-gradient-to-r from-[var(--mw-gold-primary)]/10 to-transparent border-l-4 border-[var(--mw-gold-primary)] rounded-r-lg flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
                   <div className="flex items-center gap-3">
                     <div className="bg-[var(--mw-gold-primary)]/20 p-2 rounded-full"><Calculator className="text-[var(--mw-gold-bright)]" size={20} /></div>
                     <div>
                       <span className="text-[var(--mw-text-main)] font-bold uppercase tracking-wide text-xs block">Balanço Final Esperado</span>
                       <span className="text-[10px] text-[var(--mw-text-muted)]">Custo Total: {formatSilver((result.buyPrice + (result.tradeType === 'enchant' && result.baseCost ? result.baseCost : 0)) * quantity)}</span>
                     </div>
                   </div>
                   <div className="text-right">
                     <div className={cn("text-2xl font-black drop-shadow-md", displayProfit >= 0 ? "text-[var(--mw-gold-bright)]" : "text-[var(--mw-red)]")}>
                       {displayProfit >= 0 ? '+' : ''}{formatSilver(Math.floor(displayProfit))}
                     </div>
                     <div className="text-[10px] text-[var(--mw-green)] font-mono bg-[var(--mw-green)]/10 px-2 py-0.5 rounded border border-[var(--mw-green)]/20 inline-block mt-1">Margem Real: {result.margin.toFixed(1)}%</div>
                   </div>
                 </div>
              </div>
            </div>
            
            {/* DATA QUALITY */}
            <div className="flex flex-col gap-4">
              <div className="bg-[var(--mw-card)] rounded-xl border border-[var(--mw-border)] p-4 shadow-sm">
                <h4 className="text-[11px] font-black text-[var(--mw-text-muted)] flex items-center gap-2 mb-4 uppercase tracking-widest">
                  <BarChart2 size={14} className="text-blue-500" /> Qualidade dos Dados
                </h4>
                
                <div className="space-y-3">
                   <div className="flex justify-between items-center pb-2 border-b border-[var(--mw-border)]/50">
                     <span className="text-xs text-[var(--mw-text-muted)]">Preço Compra ({originCity}):</span>
                     <div className="flex flex-col items-end">
                        <span className="font-mono text-xs font-bold text-[var(--mw-text-main)]">{formatPrice(result.buyPrice)}</span>
                        <span className={cn("text-[9px] font-bold px-1.5 rounded mt-0.5 border text-blue-300 border-blue-400 bg-blue-500/10")}>
                          <LiveTimeAgo dateStr={result.buyDate} />
                        </span>
                     </div>
                   </div>
                   
                   <div className="flex justify-between items-center pb-2 border-b border-[var(--mw-border)]/50">
                     <span className="text-xs text-[var(--mw-text-muted)]">Preço Black Market:</span>
                     <div className="flex flex-col items-end">
                        <span className="font-mono text-xs font-bold text-[var(--mw-gold-bright)]">{formatPrice(result.sellPrice)}</span>
                        <span className={cn("text-[9px] font-bold px-1.5 rounded mt-0.5 border text-blue-300 border-blue-400 bg-blue-500/10")}>
                           <LiveTimeAgo dateStr={result.sellDate} />
                        </span>
                     </div>
                   </div>
                   
                   <div className="flex justify-between items-center">
                      <span className="text-xs text-[var(--mw-text-muted)]">Volume (24h BM):</span>
                      <span className={cn("font-mono text-[10px] font-bold px-2 py-0.5 rounded border shadow-sm", 
                         result.volume24h && result.volume24h > 10 ? "text-[var(--mw-green)] bg-[var(--mw-green)]/10 border-[var(--mw-green)]/20" : 
                         result.volume24h && result.volume24h > 0 ? "text-[var(--mw-gold-bright)] bg-[var(--mw-gold-bright)]/10 border-[var(--mw-gold-bright)]/20" : 
                         "text-[var(--mw-text-muted)] bg-[var(--mw-bg)] border-[var(--mw-border)]"
                      )}>
                         {result.volume24h !== undefined ? `${result.volume24h} / 24h` : 'Nenhum'}
                      </span>
                   </div>
                </div>
              </div>
              
              <div className="mt-auto bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-[10px] uppercase font-bold text-blue-300 tracking-wide text-center leading-relaxed">
                 Dica: Sempre confira os preços no jogo antes de viajar para Zona Vermelha.
              </div>
            </div>

          </div>
        </div>
      )}
    </motion.div>
  );
});

TradeCard.displayName = 'TradeCard';
