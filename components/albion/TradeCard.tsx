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

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function ageIndicator(ageMinutes: number) {
  if (ageMinutes <= 10) return { cls: 'border-green-500', label: 'Muito recente' };
  if (ageMinutes <= 30) return { cls: 'border-green-400', label: 'Recente' };
  if (ageMinutes <= 60) return { cls: 'border-yellow-500', label: 'Aceitável' };
  if (ageMinutes <= 120) return { cls: 'border-orange-500', label: 'Dados velhos' };
  return { cls: 'border-red-500', label: 'Muito antigo' };
}

export const TradeCard = React.memo(({ result, index }: { result: TradeResult; index: number }) => {
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
  const iconUrl = getItemIconUrl(result.itemId, result.quality, 64);
  const tax = calculateTax(result.sellPrice * quantity, 4);

  const buyAge = ageIndicator(result.cityAge);
  const sellAge = ageIndicator(result.bmAge);

  const displayProfit = (result.adjustedProfit !== undefined ? result.adjustedProfit : result.profit) * quantity;

  const originCity = result.tradeType === 'enchant' ? (result.baseCity || 'Desconhecido') : result.sourceCity;
  const isRed = originCity !== 'Caerleon';
  const routeColor = isRed ? 'bg-red-500/15 text-red-500 border-red-500/30' : 'bg-green-500/15 text-green-500 border-green-500/30';
  const routeText = isRed ? '🔴 Zona Vermelha' : '🟢 Local (Caerleon, Seguro)';

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
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl flex flex-col transition-all duration-300 shadow-md hover:shadow-xl hover:border-slate-500/80 overflow-hidden text-sm relative mt-3 group backdrop-blur-sm">
      <div 
        className="flex flex-col lg:flex-row lg:items-center p-4 cursor-pointer relative gap-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* ITEM IDENTITY */}
        <div className="flex items-center gap-4 lg:w-[35%] shrink-0">
          <div className="relative w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-950 rounded-lg flex items-center justify-center border-2 shadow-inner" style={{ borderColor: qi.color }}>
            <img src={iconUrl} alt={name} className="max-w-full max-h-full object-contain filter drop-shadow-md p-1" />
            <span className="absolute -bottom-2 -right-2 text-[10px] font-black px-1.5 py-0.5 rounded shadow-md bg-slate-900 border border-slate-700 text-slate-100">
              T{p.tier}.{p.enchant}
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-slate-100 truncate w-full text-base" title={name}>{name}</span>
            <div className="flex flex-wrap gap-2 text-[11px] text-slate-400 mt-1.5 items-center">
              <span className="font-semibold bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded shadow-sm" style={{ color: qi.color }}>{qi.namePT}</span>
              {p.enchant > 0 && <span className="font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded shadow-sm">Encantamento {p.enchant}</span>}
              {result.volume24h !== undefined && (
                <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center border shadow-sm", 
                  result.volume24h >= 20 ? "bg-green-500/10 text-green-400 border-green-500/20" :
                  result.volume24h >= 5 ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                )}>
                  {result.volume24h >= 20 ? '🔥' : result.volume24h >= 5 ? '⚡' : '💤'} Vendas/24h: {result.volume24h}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* CITIES & PRICES */}
        <div className="flex-1 flex flex-row items-center justify-between lg:justify-center gap-6 lg:gap-8 bg-slate-900/40 rounded-lg p-3 border border-slate-800/50">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Mercado de Origem</span>
            <div className="flex items-center gap-2">
               <span className={cn("text-xs font-bold px-2 py-0.5 rounded border shadow-sm truncate max-w-[120px]", routeColor)} title={originCity}>{originCity}</span>
            </div>
            <div className="text-slate-300 font-mono font-bold mt-1 text-sm">{formatPrice(result.buyPrice)}</div>
          </div>
          
          <div className="flex flex-col items-center justify-center">
            <Route size={16} className="text-slate-500 hidden sm:block" />
            <div className="h-px w-8 bg-slate-600 my-1 hidden sm:block"></div>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 rounded">{routeText.split(' ')[0]}</span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Destino (Venda)</span>
            <div className="flex items-center gap-2">
               <span className="text-xs font-bold px-2 py-0.5 rounded border shadow-sm bg-slate-950 text-amber-500 border-slate-800">Black Market</span>
            </div>
            <div className="text-amber-400 font-mono font-bold mt-1 text-sm">{formatPrice(result.sellPrice)}</div>
          </div>
        </div>

        {/* PROFIT & MARGIN */}
        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-[160px] shrink-0 border-t lg:border-t-0 border-slate-700/50 pt-3 lg:pt-0">
          <div className="flex flex-col lg:items-end">
             <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Lucro Líquido Estimado</span>
             <span className={cn("font-black text-xl lg:text-2xl leading-none drop-shadow-md", displayProfit >= 0 ? "text-green-400" : "text-red-400")}>
               {displayProfit >= 0 ? '+' : ''}{formatProfit(Math.floor(displayProfit))}
             </span>
          </div>
          <div className={cn("font-mono text-xs font-bold bg-slate-900 px-2 py-1 rounded shadow-inner mt-2", result.margin >= 30 ? "text-emerald-400 border border-emerald-500/20" : "text-slate-300 border border-slate-700")}>
            {result.margin.toFixed(1)}% de Margem
          </div>
        </div>
      </div>

      {/* Freshness indicator line */}
      <div className={cn("absolute bottom-0 left-0 h-1 transition-all w-full opacity-80", buyAge.cls.replace('border-', 'bg-'))} />

      {isOpen && (
        <div className="border-t border-slate-700/50 bg-slate-950 p-4 sm:p-6 shadow-inner">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* INSTRUCTIONS */}
            <div className="lg:col-span-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                <h4 className="text-[11px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-widest bg-slate-900 border border-slate-800 px-3 py-1.5 rounded w-fit m-0">
                  <Route size={14} className="text-amber-500" /> Roteiro de Execução
                </h4>
                
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded text-xs shadow-inner">
                  <span className="text-slate-400 font-semibold uppercase">Simulador (Qtd)</span>
                  <input 
                    type="number" 
                    min="1" 
                    max="9999" 
                    value={quantity} 
                    onChange={handleQuantityChange}
                    onClick={(e) => e.stopPropagation()}
                    className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-amber-500 font-mono font-bold outline-none focus:border-amber-500 text-center"
                  />
                </div>
              </div>
              <div className="bg-slate-900/30 p-2 sm:p-4 rounded-xl border border-slate-800/60">
                 {renderSteps()}
                 
                 {result.scenarios && result.scenarios.length > 1 && (
                   <div className="mt-4 pt-4 border-t border-slate-800/60">
                     <h5 className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-bold">Alternativas Encontradas:</h5>
                     <div className="space-y-2">
                       {result.scenarios.filter((s: any) => s.id !== result.scenarioUsed).map((s: any, idx: number) => {
                         const sBaseName = getItemFullName(s.currentBaseId);
                         const sProfit = result.sellPrice - s.totalCost - result.tax;
                         const sMargin = calculateMargin(s.totalCost, sProfit);
                         const isNative = s.runesRequired.length === 0;
                         return (
                           <div key={idx} className="flex flex-col sm:flex-row justify-between bg-slate-950/50 p-2 rounded border border-slate-800/50 text-[11px]">
                             <div className="flex flex-col gap-1">
                               <strong className="text-slate-300">{isNative ? 'Comprar item já pronto' : `Comprar ${sBaseName} + Runas`}</strong>
                               <span className="text-slate-500">
                                 Custo total: <span className="text-red-400 font-mono">{formatSilver(s.totalCost)}</span>
                               </span>
                             </div>
                             <div className="flex flex-col items-end gap-1 mt-2 sm:mt-0">
                               <span className={cn("font-bold", sProfit > 0 ? "text-green-400" : "text-red-400")}>Lucro: {sProfit > 0 ? '+' : ''}{formatSilver(sProfit)}</span>
                               <span className="text-slate-500 font-mono">MG: {sMargin.toFixed(1)}%</span>
                             </div>
                           </div>
                         );
                       })}
                     </div>
                   </div>
                 )}

                 <div className="mt-6 p-4 bg-gradient-to-r from-amber-500/10 to-transparent border-l-4 border-amber-500 rounded-r-lg flex flex-col sm:flex-row justify-between items-center gap-4">
                   <div className="flex items-center gap-3">
                     <div className="bg-amber-500/20 p-2 rounded-full"><Calculator className="text-amber-500" size={20} /></div>
                     <div>
                       <span className="text-slate-300 font-bold uppercase tracking-wide text-xs block">Balanço Final Esperado</span>
                       <span className="text-[10px] text-slate-500">Custo Total: {formatSilver((result.buyPrice + (result.tradeType === 'enchant' && result.baseCost ? result.baseCost : 0)) * quantity)}</span>
                     </div>
                   </div>
                   <div className="text-right">
                     <div className={cn("text-2xl font-black drop-shadow-md", displayProfit >= 0 ? "text-amber-400" : "text-red-400")}>
                       {displayProfit >= 0 ? '+' : ''}{formatSilver(Math.floor(displayProfit))}
                     </div>
                     <div className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 inline-block mt-1">Margem Real: {result.margin.toFixed(1)}%</div>
                   </div>
                 </div>
              </div>
            </div>
            
            {/* DATA QUALITY */}
            <div className="flex flex-col gap-4">
              <div className="bg-slate-900 rounded-xl border border-slate-800/60 p-4">
                <h4 className="text-[11px] font-black text-slate-400 flex items-center gap-2 mb-4 uppercase tracking-widest">
                  <BarChart2 size={14} className="text-blue-500" /> Qualidade dos Dados
                </h4>
                
                <div className="space-y-3">
                   <div className="flex justify-between items-center pb-2 border-b border-slate-800/50">
                     <span className="text-xs text-slate-400">Preço Compra ({originCity}):</span>
                     <div className="flex flex-col items-end">
                        <span className="font-mono text-xs font-bold text-slate-200">{formatPrice(result.buyPrice)}</span>
                        <span className={cn("text-[9px] font-bold px-1.5 rounded mt-0.5 border", buyAge.cls.replace('border-', 'text-').replace('border-', 'bg-').replace('text-', 'bg-').replace('500', '500/10') , buyAge.cls.replace('border-', 'text-').replace('border-', 'border-').replace('500', '500/20'))}>
                          <LiveTimeAgo dateStr={result.buyDate} />
                        </span>
                     </div>
                   </div>
                   
                   <div className="flex justify-between items-center pb-2 border-b border-slate-800/50">
                     <span className="text-xs text-slate-400">Preço Black Market:</span>
                     <div className="flex flex-col items-end">
                        <span className="font-mono text-xs font-bold text-amber-400">{formatPrice(result.sellPrice)}</span>
                        <span className={cn("text-[9px] font-bold px-1.5 rounded mt-0.5 border", sellAge.cls.replace('border-', 'text-').replace('border-', 'bg-').replace('text-', 'bg-').replace('500', '500/10') , sellAge.cls.replace('border-', 'text-').replace('border-', 'border-').replace('500', '500/20'))}>
                           <LiveTimeAgo dateStr={result.sellDate} />
                        </span>
                     </div>
                   </div>
                   
                   <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Volume (24h BM):</span>
                      <span className={cn("font-mono text-xs font-bold px-2 py-0.5 rounded border", 
                         result.volume24h && result.volume24h > 10 ? "text-green-400 bg-green-500/10 border-green-500/20" : 
                         result.volume24h && result.volume24h > 0 ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" : 
                         "text-slate-400 bg-slate-800 border-slate-700"
                      )}>
                         {result.volume24h !== undefined ? `${result.volume24h} / 24h` : 'Nenhum'}
                      </span>
                   </div>
                </div>
              </div>
              
              <div className="mt-auto bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-[11px] text-blue-200/80 italic text-center">
                 Dica: Sempre confira os preços in-game antes de viajar para Zona Vermelha. Transportes fora de Caerleon correm risco de gank.
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
});

TradeCard.displayName = 'TradeCard';
