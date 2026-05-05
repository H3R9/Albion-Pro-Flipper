import React from 'react';
import { formatPrice } from '@/lib/albion/utils';
import { TradeResult } from '@/lib/albion/types';
import { Route } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TradeCardPricesProps {
  result: TradeResult;
}

export function TradeCardPrices({ result }: TradeCardPricesProps) {
  const originCity = result.tradeType === 'enchant' ? (result.baseCity || 'Desconhecido') : result.sourceCity;
  const isRed = originCity !== 'Caerleon';
  const routeColor = isRed ? 'bg-[var(--mw-red)]/15 text-[var(--mw-red)] border-[var(--mw-red)]/30' : 'bg-[var(--mw-green)]/15 text-[var(--mw-green)] border-[var(--mw-green)]/30';
  const routeEmoji = isRed ? '🔴' : '🟢';

  return (
    <div className="flex-1 flex flex-row items-center justify-between lg:justify-center gap-6 lg:gap-8 bg-[var(--mw-bg)]/40 rounded-lg p-3 border border-[var(--mw-border)]/50">
      <div className="flex flex-col">
        <span className="text-sm text-[var(--mw-text-muted)] uppercase font-bold tracking-wider mb-1">Mercado de Origem</span>
        <div className="flex items-center gap-2">
           <span className={cn("text-sm font-bold px-2 py-0.5 rounded border shadow-sm truncate max-w-[120px]", routeColor)} title={originCity}>{originCity}</span>
        </div>
        <div className="text-[var(--mw-text-main)] font-mono font-bold mt-1 text-sm">{formatPrice(result.buyPrice)}</div>
      </div>
      
      <div className="flex flex-col items-center justify-center">
        <Route size={16} className="text-[var(--mw-text-muted)] hidden sm:block" />
        <div className="h-px w-8 bg-[var(--mw-border)] my-1 hidden sm:block"></div>
        <span className="text-sm bg-[var(--mw-bg)] text-[var(--mw-text-muted)] px-1.5 rounded">{routeEmoji}</span>
      </div>

      <div className="flex flex-col items-end">
        <span className="text-sm text-[var(--mw-text-muted)] uppercase font-bold tracking-wider mb-1">Destino (Venda)</span>
        <div className="flex items-center gap-2">
           <span className="text-sm font-bold px-2 py-0.5 rounded border shadow-sm bg-[var(--mw-bg)] text-[var(--mw-gold-bright)] border-[var(--mw-border)]">Black Market</span>
        </div>
        <div className="text-[var(--mw-gold-bright)] font-mono font-bold mt-1 text-sm">{formatPrice(result.sellPrice)}</div>
      </div>
    </div>
  );
}
