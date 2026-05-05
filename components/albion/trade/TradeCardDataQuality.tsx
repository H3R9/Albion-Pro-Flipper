import React from 'react';
import { formatSilver, formatPrice } from '@/lib/albion/utils';
import { getItemFullName } from '@/lib/albion/items';
import { TradeResult } from '@/lib/albion/types';
import { LiveTimeAgo } from '@/components/albion/LiveTimeAgo';
import { BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TradeCardDataQualityProps {
  result: TradeResult;
}

export function TradeCardDataQuality({ result }: TradeCardDataQualityProps) {
  const originCity = result.tradeType === 'enchant' ? (result.baseCity || 'Desconhecido') : result.sourceCity;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-[var(--mw-card)] rounded-xl border border-[var(--mw-border)] p-4 shadow-sm">
        <h4 className="text-sm font-black text-[var(--mw-text-muted)] flex items-center gap-2 mb-4 uppercase tracking-widest">
          <BarChart2 size={14} className="text-blue-500" /> Qualidade dos Dados
        </h4>
        
        <div className="space-y-3">
           <div className="flex justify-between items-center pb-2 border-b border-[var(--mw-border)]/50">
             <span className="text-sm text-[var(--mw-text-muted)]">Preço Compra ({originCity}):</span>
             <div className="flex flex-col items-end">
                <span className="font-mono text-sm font-bold text-[var(--mw-text-main)]">{formatPrice(result.buyPrice)}</span>
                <span className={cn("text-sm font-bold px-1.5 rounded mt-0.5 border text-blue-300 border-blue-400 bg-blue-500/10")}>
                  <LiveTimeAgo dateStr={result.buyDate} />
                </span>
             </div>
           </div>
           
           <div className="flex justify-between items-center pb-2 border-b border-[var(--mw-border)]/50">
             <span className="text-sm text-[var(--mw-text-muted)]">Preço Black Market:</span>
             <div className="flex flex-col items-end">
                <span className="font-mono text-sm font-bold text-[var(--mw-gold-bright)]">{formatPrice(result.sellPrice)}</span>
                <span className={cn("text-sm font-bold px-1.5 rounded mt-0.5 border text-blue-300 border-blue-400 bg-blue-500/10")}>
                   <LiveTimeAgo dateStr={result.sellDate} />
                </span>
             </div>
           </div>
           
           <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--mw-text-muted)]">Volume (24h BM):</span>
              <span className={cn("font-mono text-sm font-bold px-2 py-0.5 rounded border shadow-sm", 
                 result.volume24h && result.volume24h > 10 ? "text-[var(--mw-green)] bg-[var(--mw-green)]/10 border-[var(--mw-green)]/20" : 
                 result.volume24h && result.volume24h > 0 ? "text-[var(--mw-gold-bright)] bg-[var(--mw-gold-bright)]/10 border-[var(--mw-gold-bright)]/20" : 
                 "text-[var(--mw-text-muted)] bg-[var(--mw-bg)] border-[var(--mw-border)]"
              )}>
                 {result.volume24h !== undefined ? `${result.volume24h} / 24h` : 'Nenhum'}
              </span>
           </div>
        </div>
      </div>
      
      <div className="mt-auto bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm uppercase font-bold text-blue-300 tracking-wide text-center leading-relaxed">
         Dica: Sempre confira os preços no jogo antes de viajar para Zona Vermelha.
      </div>
    </div>
  );
}
