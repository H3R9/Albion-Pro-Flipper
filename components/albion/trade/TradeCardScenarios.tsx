import React from 'react';
import { formatSilver, calculateMargin } from '@/lib/albion/utils';
import { getItemFullName } from '@/lib/albion/items';
import { TradeResult } from '@/lib/albion/types';
import { cn } from '@/lib/utils';

interface TradeCardScenariosProps {
  result: TradeResult;
}

export function TradeCardScenarios({ result }: TradeCardScenariosProps) {
  if (!result.scenarios || result.scenarios.length <= 1) return null;

  return (
    <div className="mt-4 pt-4 border-t border-[var(--mw-border)]">
      <h5 className="text-sm text-[var(--mw-text-muted)] uppercase tracking-wider mb-2 font-bold">Alternativas Encontradas:</h5>
      <div className="space-y-2">
        {result.scenarios.filter((s: any) => s.id !== result.scenarioUsed).map((s: any, idx: number) => {
          const sBaseName = getItemFullName(s.currentBaseId);
          const sProfit = result.sellPrice - s.totalCost - result.tax;
          const sMargin = calculateMargin(s.totalCost, sProfit);
          const isNative = s.runesRequired.length === 0;
          return (
            <div key={idx} className="flex flex-col sm:flex-row justify-between bg-[var(--mw-bg)]/50 p-2 rounded border border-[var(--mw-border)] text-sm">
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
  );
}
