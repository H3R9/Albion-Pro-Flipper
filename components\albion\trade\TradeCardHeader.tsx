import React from 'react';
import { parseItemId, getQualityInfo, getItemIconUrl } from '@/lib/albion/utils';
import { getItemFullName } from '@/lib/albion/items';
import { TradeResult } from '@/lib/albion/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { LiveTimeAgo } from '@/components/albion/LiveTimeAgo';

function ageIndicator(ageMinutes: number) {
  if (ageMinutes < 15) return { bg: 'bg-[var(--mw-green)]', text: 'text-[var(--mw-green)]', label: '< 15 min (fresco)', tooltip: 'Dados muito recentes. Alta chance do preço ainda ser este.' };
  if (ageMinutes <= 30) return { bg: 'bg-[var(--mw-gold-bright)]', text: 'text-[var(--mw-gold-bright)]', label: '15-30 min', tooltip: 'Dados com idade média. Oportunidade pode estar desaparecendo.' };
  return { bg: 'bg-[var(--mw-red)]', text: 'text-[var(--mw-red)]', label: '> 30 min (velho)', tooltip: 'Risco altíssimo: Dados velhos. Confirme os preços no jogo antes de comprar.' };
}

interface TradeCardHeaderProps {
  result: TradeResult;
}

export function TradeCardHeader({ result }: TradeCardHeaderProps) {
  const p = parseItemId(result.itemId);
  const name = getItemFullName(result.itemId);
  const qi = getQualityInfo(result.quality);
  const iconUrl = `https://render.albiononline.com/v1/item/${result.itemId}.png?size=40&quality=${result.quality}`;
  const worstAge = result.worstAge || Math.max(result.cityAge, result.bmAge);
  const overallAgeIndicator = ageIndicator(worstAge);

  return (
    <div className="flex items-center gap-4 lg:w-[35%] shrink-0">
      <div className="relative w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-950 rounded-lg flex items-center justify-center border-2 shadow-inner" style={{ borderColor: qi.color }}>
        <Image src={iconUrl} alt={name} width={56} height={56} className="max-w-full max-h-full object-contain filter drop-shadow-md p-1" referrerPolicy="no-referrer" priority unoptimized />
        <span className="absolute -bottom-2 -right-2 text-[10px] font-black px-1.5 py-0.5 rounded shadow-md bg-[var(--mw-bg)] border border-[var(--mw-border)] text-[var(--mw-text-main)]">
          T{p.tier}.{p.enchant}
        </span>
        
        {result.flipScore && (
          <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 z-10 font-bold text-[10px] cursor-help" 
               title={result.flipScore.reason}
               style={{
                 backgroundColor: 'var(--mw-bg)',
                 borderColor: result.flipScore.recommendation === 'EXECUTE' ? 'var(--mw-green)' : result.flipScore.recommendation === 'WATCH' ? 'var(--mw-gold-bright)' : 'var(--mw-red)',
                 color: result.flipScore.recommendation === 'EXECUTE' ? 'var(--mw-green)' : result.flipScore.recommendation === 'WATCH' ? 'var(--mw-gold-bright)' : 'var(--mw-red)',
               }}>
            {result.flipScore.totalScore}
          </div>
        )}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="font-bold text-[var(--mw-text-main)] truncate w-full text-base" title={name}>{name}</span>
        <div className="flex flex-wrap gap-2 text-[11px] text-[var(--mw-text-muted)] mt-1.5 items-center">
          <span className="font-semibold bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded shadow-sm" style={{ color: qi.color }}>{qi.namePT}</span>
          {p.enchant > 0 && <span className="font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded shadow-sm">Encantamento {p.enchant}</span>}
          {result.volume24h !== undefined && (
            <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center border shadow-sm", 
              result.volume24h >= 20 ? "bg-[var(--mw-green)]/10 text-[var(--mw-green)] border-[var(--mw-green)]/20" :
              result.volume24h >= 5 ? "bg-[var(--mw-gold-bright)]/10 text-[var(--mw-gold-bright)] border-[var(--mw-gold-bright)]/20" : "bg-orange-500/10 text-orange-400 border-orange-500/20"
            )}>
              {result.volume24h >= 20 ? '🔥' : result.volume24h >= 5 ? '⚡' : '💤'} Vendas/24h: {result.volume24h}
            </span>
          )}
        </div>
        <div className="flex mt-2 items-center gap-1 cursor-help" title={overallAgeIndicator.tooltip}>
           <span className="text-[10px] text-[var(--mw-text-muted)] uppercase font-bold tracking-wider mr-1">Idade:</span>
           <div className={cn("w-2 h-2 rounded-full", overallAgeIndicator.bg)}></div>
           <span className={cn("text-[10px] font-bold uppercase", overallAgeIndicator.text)}>{overallAgeIndicator.label}</span>
        </div>
      </div>
    </div>
  );
}
