import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AnalysisSummary } from './engine';
import { ArrowRight, ShoppingCart, TrendingUp, Package, MoveRight, Clock, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { getItemIconUrl } from '@/lib/albion/utils';

const qualityLabels: Record<number, string> = {
  1: 'Normal',
  2: 'Boa',
  3: 'Excepcional',
  4: 'Excelente',
  5: 'Obra-prima'
};

interface Props {
  summary: AnalysisSummary;
}

function formatSilver(amount: number) {
  return new Intl.NumberFormat('pt-BR').format(Math.floor(amount));
}

function formatOldDate(dateStr?: string) {
  if (!dateStr || dateStr.startsWith('0001')) return 'Sem dados';
  try {
    // A API do Albion Data Project retorna a data em UTC mas sem o 'Z' no final.
    const utcDateStr = dateStr.endsWith('Z') ? dateStr : `${dateStr}Z`;
    const date = new Date(utcDateStr);
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  } catch {
    return dateStr;
  }
}

function isDateOld(dateStr?: string) {
  if (!dateStr || dateStr.startsWith('0001')) return true;
  try {
    const utcDateStr = dateStr.endsWith('Z') ? dateStr : `${dateStr}Z`;
    const date = new Date(utcDateStr);
    const diff = (new Date()).getTime() - date.getTime();
    return diff > 1000 * 60 * 60 * 24; // > 24 hours
  } catch {
    return true;
  }
}

export function ActionPlanView({ summary }: Props) {
  const enchantPlans = [...summary.plans]
    .filter(p => p.action === 'ENCHANT')
    .sort((a, b) => {
      const roiA = a.profitDelta / Math.max(1, a.totalMaterialCostReal);
      const roiB = b.profitDelta / Math.max(1, b.totalMaterialCostReal);
      if (Math.abs(roiA - roiB) < 0.01) {
        return b.profitDelta - a.profitDelta;
      }
      return roiB - roiA;
    });

  const sellPlans = [...summary.plans]
    .filter(p => p.action === 'SELL_FLAT')
    .sort((a, b) => b.totalExpectedRevenue - a.totalExpectedRevenue);

  const keepPlans = [...summary.plans]
    .filter(p => p.action === 'KEEP_IN_CHEST')
    .sort((a, b) => b.profitDelta - a.profitDelta);

  return (
    <div className="flex flex-col gap-6 mt-6 animate-in fade-in duration-500">
      <Card className="p-8 border-[var(--mw-gold-primary)]/30 border-2 relative overflow-hidden bg-black/40">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[var(--mw-gold-primary)] to-[var(--mw-gold-dark)]" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="flex flex-col gap-1 p-4 bg-[var(--mw-bg)] border border-[var(--mw-border)] rounded-xl">
             <span className="text-sm text-[var(--mw-text-muted)] uppercase tracking-wider font-bold">Ganho Estimado</span>
             <span className="text-2xl font-black text-[var(--mw-text-main)]">{formatSilver(summary.totalExpectedRevenue)}</span>
          </div>
          <div className="flex flex-col gap-1 p-4 bg-[var(--mw-bg)] border border-[var(--mw-border)] rounded-xl ring-1 ring-[var(--mw-gold-primary)]/50">
             <span className="text-sm text-[var(--mw-gold-primary)] uppercase tracking-wider font-bold">Lucro Líquido (Removendo Custos)</span>
             <span className="text-2xl font-black text-[var(--mw-green)]">+{formatSilver(summary.netProfit)}</span>
          </div>
        </div>

        {enchantPlans.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-black text-[var(--mw-gold-primary)] uppercase flex items-center gap-2 mb-4 tracking-widest border-b border-[var(--mw-border)] pb-2">
              <TrendingUp size={20} /> Encantar — Ação Recomendada
            </h3>
            <div className="flex flex-col gap-4">
              {enchantPlans.map((plan, i) => (
                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-[var(--mw-border)] bg-[var(--mw-bg)]/80 rounded-xl relative overflow-hidden group hover:border-[var(--mw-gold-primary)]/50 transition-colors">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--mw-gold-primary)]/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex items-center gap-4">
                    {plan.item.exactId && (
                      <div className="relative w-12 h-12 flex-shrink-0">
                        <Image src={getItemIconUrl(plan.item.exactId, 1, 50)} alt={plan.item.name} fill sizes="48px" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--mw-text-main)]">{plan.item.name}</span>
                        <Badge variant="outline" className="text-xs text-[var(--mw-gold-primary)] border-[var(--mw-gold-primary)]/30">x{plan.item.quantity}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm mt-1">
                        <span className="text-[var(--mw-text-muted)]">T{plan.item.tier}.{plan.item.enchantment} ({qualityLabels[plan.item.quality || 1]})</span>
                        <MoveRight size={14} className="text-[var(--mw-gold-primary)]" />
                        <span className="text-[var(--mw-gold-bright)] font-bold">T{plan.item.tier}.{plan.targetEnchantment}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 text-sm md:items-end">
                    <span className="text-[var(--mw-text-muted)] mt-1">ROI: <span className="text-[var(--mw-gold-primary)] font-black">{((plan.profitDelta / Math.max(1, plan.totalMaterialCostReal)) * 100).toFixed(1)}%</span></span>
                    <span className="text-[var(--mw-text-muted)]">Lucro Extra: <span className="text-[var(--mw-green)] font-bold">+{formatSilver(plan.profitDelta)}</span></span>
                    
                    {plan.targetPriceDate && (
                      <div className={`flex flex-col items-end gap-1 mt-2 text-[11px] ${isDateOld(plan.targetPriceDate) ? 'text-red-400' : 'text-[var(--mw-text-muted)]'}`}>
                        <span className="flex items-center gap-1">
                          {isDateOld(plan.targetPriceDate) ? <AlertTriangle size={12} /> : <Clock size={12} />}
                          {plan.targetPriceCity}: {formatOldDate(plan.targetPriceDate)}
                        </span>
                        {(plan.targetMonthlyVolume !== undefined) && (
                          <span className={`flex items-center gap-1 ${plan.targetMonthlyVolume < 100 ? 'text-red-400' : 'text-[var(--mw-text-muted)]'}`}>
                            {plan.targetMonthlyVolume < 100 ? <AlertTriangle size={12} /> : <TrendingUp size={12} />}
                            {plan.targetMonthlyVolume} vendas/últimos 30 dias
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {keepPlans.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-black text-orange-400 uppercase flex items-center gap-2 mb-4 tracking-widest border-b border-[var(--mw-border)] pb-2">
              <Package size={20} /> Guardar no Baú (Falta Prata/Materiais)
            </h3>
            <div className="flex flex-col gap-4">
              {keepPlans.map((plan, i) => (
                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-orange-500/30 bg-orange-500/5 rounded-xl">
                  <div className="flex items-center gap-4">
                    {plan.item.exactId && (
                      <div className="relative w-10 h-10 flex-shrink-0 opacity-70 grayscale">
                        <Image src={getItemIconUrl(plan.item.exactId, 1, 50)} alt={plan.item.name} fill sizes="40px" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--mw-text-main)] text-orange-100">{plan.item.name} <span className="text-xs font-normal">x{plan.item.quantity}</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-sm mt-1">
                        <span className="text-[var(--mw-text-muted)]">T{plan.item.tier}.{plan.item.enchantment} ({qualityLabels[plan.item.quality || 1]})</span>
                        <MoveRight size={14} className="text-orange-400" />
                        <span className="text-orange-300 font-bold">Encantar futuramente para T{plan.item.tier}.{plan.targetEnchantment}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 text-sm md:items-end">
                    <span className="text-orange-200">Lucro Potencial Perdido: <strong className="text-orange-400">+{formatSilver(plan.profitDelta)}</strong></span>
                    {plan.targetPriceDate && (
                      <div className={`flex flex-col items-end gap-1 mt-1 text-[11px] ${isDateOld(plan.targetPriceDate) ? 'text-red-400' : 'text-orange-300'}`}>
                        <span className="flex items-center gap-1">
                          {isDateOld(plan.targetPriceDate) ? <AlertTriangle size={12} /> : <Clock size={12} />}
                          {plan.targetPriceCity}: {formatOldDate(plan.targetPriceDate)}
                        </span>
                        {(plan.targetMonthlyVolume !== undefined) && (
                          <span className={`flex items-center gap-1 ${plan.targetMonthlyVolume < 100 ? 'text-red-400' : 'opacity-80'}`}>
                            {plan.targetMonthlyVolume < 100 ? <AlertTriangle size={12} /> : <TrendingUp size={12} />}
                            {plan.targetMonthlyVolume} vendas/últimos 30 dias
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {sellPlans.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-black text-[var(--mw-text-main)] uppercase flex items-center gap-2 mb-4 tracking-widest border-b border-[var(--mw-border)] pb-2">
              <ShoppingCart size={20} /> Vender Flat — Não Lucrativo Encantar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sellPlans.map((plan, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border border-[var(--mw-border)] rounded-lg bg-[var(--mw-bg)]/50">
                  {plan.item.exactId && (
                    <div className="relative w-8 h-8 flex-shrink-0">
                      <Image src={getItemIconUrl(plan.item.exactId, 1, 40)} alt={plan.item.name} fill sizes="32px" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[var(--mw-text-main)]">{plan.item.name} <span className="text-[var(--mw-text-muted)] font-normal text-xs ml-1">x{plan.item.quantity}</span></span>
                    <span className="text-xs text-[var(--mw-text-muted)]">T{plan.item.tier}.{plan.item.enchantment} ({qualityLabels[plan.item.quality || 1]})</span>
                    {plan.targetPriceDate && (
                       <div className={`flex flex-col gap-1 mt-1 text-[10px] ${isDateOld(plan.targetPriceDate) ? 'text-red-400' : 'text-[var(--mw-text-muted)] opacity-70'}`}>
                         <span className="flex items-center gap-1">
                           {isDateOld(plan.targetPriceDate) ? <AlertTriangle size={10} /> : <Clock size={10} />}
                           {plan.targetPriceCity}: {formatOldDate(plan.targetPriceDate)}
                         </span>
                         {(plan.targetMonthlyVolume !== undefined) && (
                           <span className={`flex items-center gap-1 ${plan.targetMonthlyVolume < 100 ? 'text-red-400 font-bold' : ''}`}>
                             {plan.targetMonthlyVolume < 100 ? <AlertTriangle size={10} /> : <TrendingUp size={10} />}
                             {plan.targetMonthlyVolume} vendas / 30d
                           </span>
                         )}
                       </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {summary.shoppingList.length > 0 && (
          <div>
             <h3 className="text-lg font-black text-[var(--mw-text-main)] uppercase flex items-center gap-2 mb-4 tracking-widest border-b border-[var(--mw-border)] pb-2">
              <ShoppingCart size={20} /> Lista de Compras Adicional
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...summary.shoppingList].sort((a, b) => b.totalCost - a.totalCost).map((shop, i) => (
                <div key={i} className="flex items-center gap-3 p-4 border border-[var(--mw-border)] rounded-xl bg-[var(--mw-bg)]">
                  <div className="w-10 h-10 relative flex-shrink-0">
                    <Image 
                      src={getItemIconUrl(`T${shop.tier}_${shop.type === 'runa' ? 'RUNE' : shop.type === 'alma' ? 'SOUL' : 'RELIC'}`, 1, 50)} 
                      alt={shop.type} 
                      fill 
                      sizes="40px"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[var(--mw-text-main)] capitalize">{shop.type} T{shop.tier}</span>
                    <span className="text-sm text-[var(--mw-text-muted)]">Comprar no Mercado: <span className="text-[var(--mw-gold-primary)] font-bold">{shop.amountNeeded}x</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </Card>
    </div>
  );
}
