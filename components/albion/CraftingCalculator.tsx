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
  const bmTax = Math.floor(bmPrice * 0.04);
  const profit = bmPrice - failureAdjustedCost - bmTax;
  const margin = failureAdjustedCost > 0 ? (profit / failureAdjustedCost) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="bg-[var(--mw-card)] border border-[var(--mw-border)] rounded-xl overflow-hidden shadow-lg">
        <div className="p-6 border-b border-[var(--mw-border)]">
          <h2 className="text-xl font-bold text-[var(--mw-gold-bright)] flex items-center gap-2">
            <Coins size={20} />
            Calculadora de Lucro de Crafting & Encantamento
          </h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 bg-[var(--mw-bg)] p-4 rounded-xl border border-[var(--mw-border)] shadow-sm">
              <h3 className="font-bold text-[var(--mw-text-main)] uppercase tracking-widest text-[11px]">Configuração do Item Base</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-[var(--mw-text-muted)]">Tipo de Item</label>
                  <select 
                    value={itemType} 
                    onChange={e => setItemType(e.target.value)}
                    className="w-full bg-[var(--mw-card)] border border-[var(--mw-border)] rounded p-2 text-sm text-[var(--mw-text-main)] focus:border-[var(--mw-gold-primary)] outline-none"
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
                  <label className="text-[10px] font-bold tracking-widest uppercase text-[var(--mw-text-muted)]">Tier</label>
                  <select 
                    value={tier} 
                    onChange={e => setTier(Number(e.target.value))}
                    className="w-full bg-[var(--mw-card)] border border-[var(--mw-border)] rounded p-2 text-sm text-[var(--mw-text-main)] focus:border-[var(--mw-gold-primary)] outline-none"
                  >
                    {[4,5,6,7,8].map(t => <option key={t} value={t}>Tier {t}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-[var(--mw-text-muted)]">Encantamento Inicial</label>
                  <select 
                    value={enchantLvl} 
                    onChange={e => setEnchantLvl(Number(e.target.value))}
                    className="w-full bg-[var(--mw-card)] border border-[var(--mw-border)] rounded p-2 text-sm text-[var(--mw-text-main)] focus:border-[var(--mw-gold-primary)] outline-none"
                  >
                    <option value={0}>Flat (.0)</option>
                    <option value={1}>.1 (Runa)</option>
                    <option value={2}>.2 (Alma)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-[var(--mw-text-muted)]">Encantamento Alvo</label>
                  <select 
                    value={targetEnchantLvl} 
                    onChange={e => setTargetEnchantLvl(Number(e.target.value))}
                    className="w-full bg-[var(--mw-card)] border border-[var(--mw-border)] rounded p-2 text-sm text-[var(--mw-text-main)] focus:border-[var(--mw-gold-primary)] outline-none"
                  >
                    <option value={0}>Nenhum (.0)</option>
                    <option value={1}>.1 (Runa)</option>
                    <option value={2}>.2 (Alma)</option>
                    <option value={3}>.3 (Relíquia)</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2 pt-2">
                 <label className="text-[10px] font-bold tracking-widest uppercase text-[var(--mw-text-muted)]">Taxa Falha/Perda Item (%)</label>
                 <input type="number" min={0} max={100} value={failureRate} onChange={e => setFailureRate(Number(e.target.value))} className="flex h-10 w-full rounded border text-[var(--mw-text-main)] bg-[var(--mw-card)] border-[var(--mw-border)] px-3 py-2 text-sm focus:border-[var(--mw-gold-primary)] outline-none" />
                 <p className="text-[10px] text-[var(--mw-gold-dark)] flex items-center gap-1 uppercase tracking-widest font-bold mt-1"><AlertTriangle size={12}/> Opcional. Útil para riscos adicionais.</p>
              </div>

            </div>

            <div className="space-y-4 bg-[var(--mw-bg)] p-4 rounded-xl border border-[var(--mw-border)] shadow-sm">
              <h3 className="font-bold text-[var(--mw-text-main)] uppercase tracking-widest text-[11px]">Mercado e Insumos</h3>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-widest uppercase text-[var(--mw-text-muted)]">Custo de Aquisição Base (Prata)</label>
                <input type="number" min={0} value={baseCost} onChange={e => setBaseCost(Number(e.target.value))} className="flex h-10 w-full rounded border text-[var(--mw-text-main)] bg-[var(--mw-card)] border-[var(--mw-border)] px-3 py-2 text-sm focus:border-[var(--mw-gold-primary)] outline-none" />
              </div>

              {targetEnchantLvl >= 1 && enchantLvl < 1 && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-[var(--mw-text-muted)]">Runa T{tier} (Unid.) - Qtde: {runesRequired}</label>
                  <input type="number" min={0} value={runeCost} onChange={e => setRuneCost(Number(e.target.value))} className="flex h-10 w-full rounded border text-[var(--mw-text-main)] bg-[var(--mw-card)] border-[var(--mw-border)] px-3 py-2 text-sm focus:border-[var(--mw-gold-primary)] outline-none" />
                </div>
              )}
              {targetEnchantLvl >= 2 && enchantLvl < 2 && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-[var(--mw-text-muted)]">Alma T{tier} (Unid.) - Qtde: {runesRequired}</label>
                  <input type="number" min={0} value={runeCost2} onChange={e => setRuneCost2(Number(e.target.value))} className="flex h-10 w-full rounded border text-[var(--mw-text-main)] bg-[var(--mw-card)] border-[var(--mw-border)] px-3 py-2 text-sm focus:border-[var(--mw-gold-primary)] outline-none" />
                </div>
              )}
              {targetEnchantLvl >= 3 && enchantLvl < 3 && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-[var(--mw-text-muted)]">Relíquia T{tier} (Unid.) - Qtde: {runesRequired}</label>
                  <input type="number" min={0} value={runeCost3} onChange={e => setRuneCost3(Number(e.target.value))} className="flex h-10 w-full rounded border text-[var(--mw-text-main)] bg-[var(--mw-card)] border-[var(--mw-border)] px-3 py-2 text-sm focus:border-[var(--mw-gold-primary)] outline-none" />
                </div>
              )}

              <div className="space-y-2 pt-4 border-t border-[var(--mw-border)] mt-4">
                <label className="text-[10px] font-bold tracking-widest uppercase text-[var(--mw-gold-bright)]">Preço Estimado de Venda (BM)</label>
                <input type="number" min={0} value={bmPrice} onChange={e => setBmPrice(Number(e.target.value))} className="flex h-10 w-full rounded border text-[var(--mw-gold-bright)] bg-[var(--mw-card)] border-[var(--mw-gold-dark)] px-3 py-2 text-sm focus:border-[var(--mw-gold-primary)] outline-none" />
              </div>
            </div>
          </div>

          <div className="bg-[var(--mw-bg)] p-6 rounded-xl border border-[var(--mw-border)] grid grid-cols-2 md:grid-cols-4 gap-6 text-center shadow-inner">
            <div className="flex flex-col gap-1 items-center justify-center">
               <div className="text-[var(--mw-text-muted)] text-[10px] uppercase font-bold tracking-widest mb-1">Custo Produção</div>
               <div className="text-xl font-mono text-[var(--mw-text-main)] font-black">{formatSilver(failureAdjustedCost)}</div>
            </div>
            <div className="flex flex-col gap-1 items-center justify-center border-l border-[var(--mw-border)]">
               <div className="text-[var(--mw-text-muted)] text-[10px] uppercase font-bold tracking-widest mb-1">Taxa BM (4%)</div>
               <div className="text-xl font-mono text-[var(--mw-red)] font-black">-{formatSilver(bmTax)}</div>
            </div>
            <div className="flex flex-col gap-1 items-center justify-center border-l border-[var(--mw-border)]">
               <div className="text-[var(--mw-text-muted)] text-[10px] uppercase font-bold tracking-widest mb-1">Lucro Estimado</div>
               <div className={`text-2xl font-black font-mono ${profit > 0 ? 'text-[var(--mw-green)] drop-shadow-sm' : 'text-[var(--mw-red)]'}`}>
                 {profit > 0 ? '+' : ''}{formatSilver(profit)}
               </div>
            </div>
            <div className="flex flex-col gap-1 items-center justify-center border-l border-[var(--mw-border)] relative">
               <div className="text-[var(--mw-text-muted)] text-[10px] uppercase font-bold tracking-widest mb-1">Margem Retorno</div>
               <div className={`text-xl font-bold font-mono ${margin > 20 ? 'text-[var(--mw-gold-bright)]' : margin > 0 ? 'text-[var(--mw-green)]' : 'text-[var(--mw-red)]'}`}>
                 {margin.toFixed(2)}%
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
