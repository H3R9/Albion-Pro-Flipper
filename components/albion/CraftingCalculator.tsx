import React, { useState, useMemo } from 'react';
import { Coins, AlertTriangle } from 'lucide-react';
import { formatSilver, getEnchantResourceCount } from '@/lib/albion/utils';

export function CraftingCalculator() {
  const [tier, setTier] = useState<number>(4);
  const [enchantLvl, setEnchantLvl] = useState<number>(0);
  const [targetEnchantLvl, setTargetEnchantLvl] = useState<number>(1);
  const [baseCost, setBaseCost] = useState<number>(0);
  const [runeCost, setRuneCost] = useState<number>(0);
  const [runeCost2, setRuneCost2] = useState<number>(0);
  const [runeCost3, setRuneCost3] = useState<number>(0);
  const [bmPrice, setBmPrice] = useState<number>(0);
  const [itemType, setItemType] = useState<string>('MAIN_SWORD');

  // Factoring in item loss during enchanting if requested (though not native to standard albion enchanting, 
  // users asked to factor it in - might represent rerolling or other risky crafting mechanisms).
  const [failureRate, setFailureRate] = useState<number>(0);

  const runesRequired = getEnchantResourceCount(`T${tier}_${itemType}`);

  const totalCost = useMemo(() => {
    let cost = baseCost;
    if (targetEnchantLvl >= 1 && enchantLvl < 1) cost += runeCost * runesRequired;
    if (targetEnchantLvl >= 2 && enchantLvl < 2) cost += runeCost2 * runesRequired;
    if (targetEnchantLvl >= 3 && enchantLvl < 3) cost += runeCost3 * runesRequired;
    return cost;
  }, [baseCost, runeCost, runeCost2, runeCost3, runesRequired, targetEnchantLvl, enchantLvl]);

  const failureAdjustedCost = totalCost / (1 - (failureRate / 100));
  const bmTax = Math.floor(bmPrice * 0.045);
  const profit = bmPrice - failureAdjustedCost - bmTax;
  const margin = failureAdjustedCost > 0 ? (profit / failureAdjustedCost) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-amber-500 flex items-center gap-2">
            <Coins size={20} />
            Calculadora de Lucro de Crafting & Encantamento
          </h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <h3 className="font-bold text-slate-300">Configuração do Item Base</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-200">Tipo de Item</label>
                  <select 
                    value={itemType} 
                    onChange={e => setItemType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-sm text-slate-200 focus:border-amber-500 outline-none"
                  >
                    <option value="MAIN_SWORD">Arma 1H</option>
                    <option value="2H_BOW">Arma 2H</option>
                    <option value="HEAD_PLATE">Equip Cabeça</option>
                    <option value="ARMOR_CLOTH">Equip Peito</option>
                    <option value="SHOES_LEATHER">Equip Botas</option>
                    <option value="OFF_SHIELD">Off-Hand</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-200">Tier</label>
                  <select 
                    value={tier} 
                    onChange={e => setTier(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-sm text-slate-200 focus:border-amber-500 outline-none"
                  >
                    {[4,5,6,7,8].map(t => <option key={t} value={t}>Tier {t}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-200">Encantamento Inicial</label>
                  <select 
                    value={enchantLvl} 
                    onChange={e => setEnchantLvl(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-sm text-slate-200 focus:border-amber-500 outline-none"
                  >
                    <option value={0}>Flat (.0)</option>
                    <option value={1}>.1 (Runa)</option>
                    <option value={2}>.2 (Alma)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-200">Encantamento Alvo</label>
                  <select 
                    value={targetEnchantLvl} 
                    onChange={e => setTargetEnchantLvl(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-sm text-slate-200 focus:border-amber-500 outline-none"
                  >
                    <option value={0}>Nenhum (.0)</option>
                    <option value={1}>.1 (Runa)</option>
                    <option value={2}>.2 (Alma)</option>
                    <option value={3}>.3 (Relíquia)</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                 <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-200">Taxa Falha/Perda Item (%)</label>
                 <input type="number" min={0} max={100} value={failureRate} onChange={e => setFailureRate(Number(e.target.value))} className="flex h-10 w-full rounded-md border text-slate-100 bg-slate-900 border-slate-700 px-3 py-2 text-sm focus:border-amber-500 outline-none" />
                 <p className="text-xs text-amber-500/80 flex items-center gap-1"><AlertTriangle size={12}/> Opcional. Útil para craftings arriscados.</p>
              </div>

            </div>

            <div className="space-y-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <h3 className="font-bold text-slate-300">Mercado e Insumos</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-200">Custo de Aquisição Base (Prata)</label>
                <input type="number" min={0} value={baseCost} onChange={e => setBaseCost(Number(e.target.value))} className="flex h-10 w-full rounded-md border text-slate-100 bg-slate-900 border-slate-700 px-3 py-2 text-sm focus:border-amber-500 outline-none" />
              </div>

              {targetEnchantLvl >= 1 && enchantLvl < 1 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-200">Runa T{tier} (Unid.) - Qtde: {runesRequired}</label>
                  <input type="number" min={0} value={runeCost} onChange={e => setRuneCost(Number(e.target.value))} className="flex h-10 w-full rounded-md border text-slate-100 bg-slate-900 border-slate-700 px-3 py-2 text-sm focus:border-amber-500 outline-none" />
                </div>
              )}
              {targetEnchantLvl >= 2 && enchantLvl < 2 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-200">Alma T{tier} (Unid.) - Qtde: {runesRequired}</label>
                  <input type="number" min={0} value={runeCost2} onChange={e => setRuneCost2(Number(e.target.value))} className="flex h-10 w-full rounded-md border text-slate-100 bg-slate-900 border-slate-700 px-3 py-2 text-sm focus:border-amber-500 outline-none" />
                </div>
              )}
              {targetEnchantLvl >= 3 && enchantLvl < 3 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-200">Relíquia T{tier} (Unid.) - Qtde: {runesRequired}</label>
                  <input type="number" min={0} value={runeCost3} onChange={e => setRuneCost3(Number(e.target.value))} className="flex h-10 w-full rounded-md border text-slate-100 bg-slate-900 border-slate-700 px-3 py-2 text-sm focus:border-amber-500 outline-none" />
                </div>
              )}

              <div className="space-y-2 pt-4 border-t border-slate-700">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-amber-400">Preço Estimado de Venda (BM)</label>
                <input type="number" min={0} value={bmPrice} onChange={e => setBmPrice(Number(e.target.value))} className="flex h-10 w-full rounded-md border text-slate-100 bg-slate-900 border-slate-700 px-3 py-2 text-sm focus:border-amber-500 outline-none" />
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
               <div className="text-slate-400 text-sm mb-1">Custo Produção</div>
               <div className="text-xl font-mono text-slate-200">{formatSilver(failureAdjustedCost)}</div>
            </div>
            <div>
               <div className="text-slate-400 text-sm mb-1">Taxa BM (4.5%)</div>
               <div className="text-xl font-mono text-red-400">-{formatSilver(bmTax)}</div>
            </div>
            <div>
               <div className="text-slate-400 text-sm mb-1">Lucro Estimado</div>
               <div className={`text-2xl font-black font-mono space-x-1 ${profit > 0 ? 'text-green-500' : 'text-red-500'}`}>
                 {formatSilver(profit)}
               </div>
            </div>
            <div>
               <div className="text-slate-400 text-sm mb-1">Margem Retorno</div>
               <div className={`text-xl font-bold font-mono space-x-1 ${margin > 20 ? 'text-amber-400' : margin > 0 ? 'text-green-400' : 'text-red-500'}`}>
                 {margin.toFixed(2)}%
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
