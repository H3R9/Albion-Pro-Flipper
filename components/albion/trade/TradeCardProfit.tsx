import React from 'react';
import { formatSilver } from '@/lib/albion/utils';
import { TradeResult } from '@/lib/albion/types';
import { cn } from '@/lib/utils';

interface TradeCardProfitProps {
  result: TradeResult;
  quantity: number;
  maxProfit?: number;
}

export function TradeCardProfit({ result, quantity, maxProfit }: TradeCardProfitProps) {
  const displayProfit = (result.adjustedProfit !== undefined ? result.adjustedProfit : result.profit) * quantity;

  return (
    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-[160px] shrink-0 border-t lg:border-t-0 border-[var(--mw-border)]/50 pt-3 lg:pt-0">
      <div className="flex flex-col lg:items-end w-full relative">
         <span className="text-sm text-[var(--mw-text-muted)] uppercase font-bold tracking-wider mb-1">Lucro Líquido Estimado</span>
         <span className={cn("font-black text-2xl lg:text-3xl leading-none drop-shadow-md", displayProfit >= 0 ? "text-[var(--mw-gold-bright)]" : "text-[var(--mw-red)]")}>
           {formatSilver(Math.floor(displayProfit))}
         </span>
         {maxProfit && maxProfit > 0 && displayProfit > 0 && (
           <div className="w-full lg:w-32 h-1.5 bg-[var(--mw-bg)]/80 rounded-full mt-2 overflow-hidden border border-[var(--mw-border)]/50 shadow-inner float-right">
             <div className="h-full bg-gradient-to-r from-[var(--mw-gold-dark)] to-[var(--mw-gold-bright)] rounded-full" style={{ width: `${Math.min(100, Math.max(0, (displayProfit / maxProfit) * 100))}%` }}></div>
           </div>
         )}
      </div>
      <div className={cn("font-mono text-sm font-bold bg-[var(--mw-bg)] px-2 py-1 rounded shadow-inner mt-2", result.margin >= 30 ? "text-[var(--mw-green)] border border-[var(--mw-green)]/20" : "text-[var(--mw-text-main)] border border-[var(--mw-border)]")}>
        {result.margin.toFixed(1)}% de Margem
      </div>
    </div>
  );
}
