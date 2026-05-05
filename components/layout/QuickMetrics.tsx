import React from 'react';
import { Wallet, TrendingUp, Clock, MapPin } from 'lucide-react';
import { formatSilver } from '@/lib/albion/utils';
import type { TradeResult } from '@/lib/albion/types';

interface QuickMetricsProps {
  results: TradeResult[];
}

export function QuickMetrics({ results }: QuickMetricsProps) {
  if (results.length === 0) return null;

  const maxProfit = Math.max(...results.map(r => r.adjustedProfit ?? r.profit));
  
  const top10 = results.slice().sort((a, b) => (b.adjustedProfit ?? b.profit) - (a.adjustedProfit ?? a.profit)).slice(0, 10);
  const avgROI = top10.reduce((acc, r) => acc + (r.buyPrice > 0 ? ((r.adjustedProfit ?? r.profit) / r.buyPrice) * 100 : 0), 0) / (top10.length || 1);
  
  const freshCount = results.filter(r => r.worstAge < 15).length;
  
  const counts: Record<string, number> = {};
  top10.forEach(r => { const c = r.sourceCity || r.baseCity || 'ND'; counts[c] = (counts[c] || 0) + 1; });
  let bestCity = '-';
  let maxCount = 0;
  for (const [c, cnt] of Object.entries(counts)) { if (cnt > maxCount) { maxCount = cnt; bestCity = c; } }

  const cards = [
    { label: 'Maior Lucro Agora', value: formatSilver(maxProfit), color: 'var(--mw-gold-bright)', borderHover: 'hover:border-[var(--mw-gold-dark)]/50', bg: 'bg-[var(--mw-gold-dark)]/10', borderIcon: 'border-[var(--mw-gold-bright)]/20', icon: <Wallet size={20} /> },
    { label: 'ROI Médio (Top 10)', value: avgROI.toFixed(1) + '%', color: 'var(--mw-green)', borderHover: 'hover:border-[var(--mw-green)]/50', bg: 'bg-[var(--mw-green)]/10', borderIcon: 'border-[var(--mw-green)]/20', icon: <TrendingUp size={20} /> },
    { label: 'Oport. Frescas', value: `${freshCount} items <15m`, color: 'rgb(96, 165, 250)', borderHover: 'hover:border-blue-500/50', bg: 'bg-blue-500/10', borderIcon: 'border-blue-500/20', icon: <Clock size={20} /> },
    { label: 'Melhor Cidade (Top 10)', value: bestCity, color: 'var(--mw-text-main)', borderHover: 'hover:border-purple-500/50', bg: 'bg-purple-500/10', borderIcon: 'border-purple-500/20', icon: <MapPin size={20} />, textClass: 'font-sans' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
      {cards.map(card => (
        <div key={card.label} className={`bg-[var(--mw-card)] border border-[var(--mw-border)] rounded-xl p-4 flex items-center gap-4 shadow-sm ${card.borderHover} transition-colors`}>
          <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center shrink-0 border ${card.borderIcon}`} style={{ color: card.color }}>
            {card.icon}
          </div>
          <div>
            <p className="text-sm uppercase tracking-wider text-[var(--mw-text-muted)] font-bold mb-0.5">{card.label}</p>
            <p className={`font-mono text-base font-bold truncate max-w-[120px] ${card.textClass || ''}`} style={{ color: card.color }}>{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
