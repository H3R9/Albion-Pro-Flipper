import React, { useState } from 'react';
import {
  formatSilver,
  calculateTax,
  parseItemId,
} from '@/lib/albion/utils';
import { TradeResult } from '@/lib/albion/types';
import { Route, Calculator } from 'lucide-react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion } from 'motion/react';

// Sub-components
import { TradeCardHeader } from './trade/TradeCardHeader';
import { TradeCardPrices } from './trade/TradeCardPrices';
import { TradeCardProfit } from './trade/TradeCardProfit';
import { TradeCardSteps } from './trade/TradeCardSteps';
import { TradeCardScenarios } from './trade/TradeCardScenarios';
import { TradeCardDataQuality } from './trade/TradeCardDataQuality';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function ageIndicator(ageMinutes: number) {
  if (ageMinutes < 15) return { cls: 'border-green-500', bg: 'bg-[var(--mw-green)]' };
  if (ageMinutes <= 30) return { cls: 'border-[var(--mw-gold-bright)]', bg: 'bg-[var(--mw-gold-bright)]' };
  return { cls: 'border-[var(--mw-red)]', bg: 'bg-[var(--mw-red)]' };
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
  const worstAge = result.worstAge || Math.max(result.cityAge, result.bmAge);
  const displayProfit = (result.adjustedProfit !== undefined ? result.adjustedProfit : result.profit) * quantity;
  const isHotDeal = displayProfit > 100000 && worstAge < 10;

  const isWeapon = result.itemId.includes('_MAIN_') || result.itemId.includes('_2H_');
  const isArmor = result.itemId.includes('_HEAD') || result.itemId.includes('_ARMOR') || result.itemId.includes('_SHOES');
  const catColor = isWeapon ? 'border-l-[4px] border-l-[var(--mw-red)]' : isArmor ? 'border-l-[4px] border-l-blue-500' : 'border-l-[4px] border-l-[var(--mw-green)]';

  const buyAge = ageIndicator(result.cityAge);

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

      {/* Main Row: Header + Prices + Profit */}
      <div 
        className="flex flex-col lg:flex-row lg:items-center p-4 cursor-pointer relative gap-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <TradeCardHeader result={result} />
        <TradeCardPrices result={result} />
        <TradeCardProfit result={result} quantity={quantity} maxProfit={maxProfit} />
      </div>

      {/* Freshness indicator line */}
      <div className={cn("absolute bottom-0 left-0 h-1 transition-all w-full opacity-80", buyAge.cls.replace('border-', 'bg-'))} />

      {/* Expanded Details */}
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
                 <TradeCardSteps result={result} quantity={quantity} />
                 <TradeCardScenarios result={result} />

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
            <TradeCardDataQuality result={result} />
          </div>
        </div>
      )}
    </motion.div>
  );
});

TradeCard.displayName = 'TradeCard';
