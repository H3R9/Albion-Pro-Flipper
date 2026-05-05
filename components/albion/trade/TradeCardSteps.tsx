import React from 'react';
import { formatSilver } from '@/lib/albion/utils';
import { getItemFullName } from '@/lib/albion/items';
import { TradeResult } from '@/lib/albion/types';
import { LiveTimeAgo } from '@/components/albion/LiveTimeAgo';

interface TradeCardStepsProps {
  result: TradeResult;
  quantity: number;
}

export function TradeCardSteps({ result, quantity }: TradeCardStepsProps) {
  const name = getItemFullName(result.itemId);

  if (result.tradeType === 'buyorder') {
    return (
      <div className="relative pl-6 space-y-4 before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-blue-500/50 before:to-transparent">
        <StepItem stepNum={1} color="bg-blue-500" title="Colocar pedido de compra (Buy Order)">
          <div className="text-slate-500 text-sm mt-1">Item: <strong className="text-slate-300">{name}</strong></div>
          <div className="text-slate-500 text-sm">Local: <strong className="text-slate-300">{result.sourceCity}</strong></div>
          <div className="text-right">
            <div className="text-red-400 font-mono font-bold">-{formatSilver(result.buyPrice)}</div>
            <div className="text-sm text-slate-500">Inclui taxa setup de {formatSilver(result.setupFee!)}</div>
          </div>
        </StepItem>
        <StepItem stepNum={2} color="bg-amber-500" title="Vender no Mercado Negro (Venda Direta)">
          <div className="text-slate-500 text-sm mt-1">Local: <strong className="text-amber-500">Caerleon (Black Market)</strong></div>
          <div className="text-right">
            <div className="text-green-400 font-mono font-bold">+{formatSilver(result.sellPrice)}</div>
          </div>
        </StepItem>
      </div>
    );
  }
  
  if (result.tradeType === 'enchant') {
    const baseName = getItemFullName(result.baseId!);
    let stepNum = 0;
    return (
      <div className="relative pl-6 space-y-4 before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-purple-500/50 before:to-transparent">
        <StepItem stepNum={++stepNum} color="bg-purple-500" title={result.baseMethod === 'direct' ? 'Comprar item base' : 'Fazer pedido do item base'}>
          <div className="text-slate-500 text-sm mt-1">Item: <strong className="text-slate-300">{baseName}</strong></div>
          <div className="text-slate-500 text-sm flex items-center gap-2">
            <span>Local: <strong className="text-slate-300">{result.baseCity}</strong></span>
            {result.baseDateStr && (
              <span className="text-sm text-slate-500 bg-slate-800/50 px-1.5 py-0.5 rounded border border-slate-700">
                <LiveTimeAgo dateStr={result.baseDateStr} />
              </span>
            )}
          </div>
          <div className="text-right">
            <div className="text-red-400 font-mono font-bold">-{formatSilver(result.baseCost!)}</div>
          </div>
        </StepItem>
        {result.runesRequired?.map((rune, idx) => {
          const runeMatch = rune.id.match(/^T(\d+)/);
          const runeTier = runeMatch ? runeMatch[1] : '?';
          return (
           <StepItem key={idx} stepNum={++stepNum} color="bg-purple-500" title={`Material de Encantamento (${rune.method === 'buyorder' ? 'Pedido de Compra' : 'Compra Direta'})`}>
              <div className="text-slate-500 text-sm mt-1">Qtd: <strong className="text-slate-300">{rune.amount}x <span className="text-amber-500">T{runeTier}</span> {getItemFullName(rune.id)}</strong></div>
              <div className="text-slate-500 text-sm flex items-center gap-2">
                <span>Local: <strong className="text-slate-300">{rune.city}</strong></span>
                {rune.dateStr && (
                  <span className="text-sm text-slate-500 bg-slate-800/50 px-1.5 py-0.5 rounded border border-slate-700">
                    <LiveTimeAgo dateStr={rune.dateStr} />
                  </span>
                )}
              </div>
              <div className="text-right">
                 <div className="text-red-400 font-mono font-bold">-{formatSilver(rune.amount * rune.price)}</div>
                 <div className="text-sm text-slate-500">{formatSilver(rune.price)} cada</div>
                 <div className="mt-2 text-sm text-slate-500 text-right bg-slate-950/40 p-1.5 flex flex-col items-end gap-1 rounded border border-slate-800/80">
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
           </StepItem>
          );
        })}
        <StepItem stepNum={++stepNum} color="bg-pink-500" title="Encantar o item e transportar">
          <div className="text-slate-500 text-sm mt-1">Destino: <strong className="text-slate-300">Caerleon</strong></div>
        </StepItem>
        <StepItem stepNum={++stepNum} color="bg-amber-500" title="Vender ao Black Market">
          <div className="text-right">
            <div className="text-green-400 font-mono font-bold">+{formatSilver(result.sellPrice)}</div>
          </div>
        </StepItem>
      </div>
    );
  }
  
  // Default: direct trade
  return (
    <div className="relative pl-6 space-y-4 before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-emerald-500/50 before:to-transparent">
      <StepItem stepNum={1} color="bg-emerald-500" title="Comprar item (Pronto)">
        <div className="text-slate-500 text-sm mt-1">Item: <strong className="text-slate-300">{name}</strong></div>
        <div className="text-slate-500 text-sm">Local: <strong className="text-slate-300">{result.sourceCity}</strong></div>
        <div className="text-right">
           <div className="text-red-400 font-mono font-bold">-{formatSilver(result.buyPrice)}</div>
        </div>
      </StepItem>
      <StepItem stepNum={2} color="bg-amber-500" title="Transportar e Vender no BM">
        <div className="text-slate-500 text-sm mt-1">Local: <strong className="text-amber-500">Caerleon</strong></div>
        <div className="text-right">
           <div className="text-green-400 font-mono font-bold">+{formatSilver(result.sellPrice)}</div>
        </div>
      </StepItem>
    </div>
  );
}

function StepItem({ stepNum, color, title, children }: { stepNum: number; color: string; title: string; children: React.ReactNode }) {
  return (
    <div className="relative flex items-start gap-4">
      <div className={`absolute left-[-28px] ${color} text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm ring-4 ring-slate-900`}>{stepNum}</div>
      <div className="flex-1 bg-slate-900/80 p-3 rounded-lg flex flex-col sm:flex-row justify-between gap-2 shadow-sm">
         <div>
           <div className="text-slate-300 font-medium">{title}</div>
           {children}
         </div>
      </div>
    </div>
  );
}
