import React, { useState, useEffect } from 'react';
import { fetchPriceTrend } from '@/lib/albion/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatSilver } from '@/lib/albion/utils';

interface TrendData {
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  avgPrice: number;
  historyPoints: number[];
}

export function TradeCardTrend({ itemId }: { itemId: string }) {
  const [data, setData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadTrend = async () => {
      setLoading(true);
      setError(false);
      try {
        const trendData = await fetchPriceTrend(itemId);
        if (mounted) {
          setData(trendData);
        }
      } catch (err) {
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadTrend();
    return () => { mounted = false; };
  }, [itemId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 border border-[var(--mw-border)] rounded-xl bg-[var(--mw-card)]/40 animate-pulse">
        <Activity className="text-[var(--mw-gold-primary)] animate-bounce" size={24} />
      </div>
    );
  }

  if (error || !data || data.historyPoints.length === 0) {
    return (
      <div className="flex items-center justify-center p-6 border border-[var(--mw-border)] border-dashed rounded-xl bg-[var(--mw-card)]/20">
        <span className="text-sm text-[var(--mw-text-muted)] uppercase tracking-wide">Gráfico indisponível para este item</span>
      </div>
    );
  }

  const chartData = data.historyPoints.map((point, index) => ({
    name: index,
    price: point
  }));

  const TrendIcon = data.trend === 'up' ? TrendingUp : (data.trend === 'down' ? TrendingDown : Minus);
  const trendColor = data.trend === 'up' ? 'text-[var(--mw-green)]' : (data.trend === 'down' ? 'text-[var(--mw-red)]' : 'text-gray-400');

  return (
    <div className="flex flex-col border border-[var(--mw-border)] rounded-xl bg-[var(--mw-card)]/40 p-4 shadow-inner">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-black text-[var(--mw-text-muted)] flex items-center gap-2 uppercase tracking-widest m-0">
          <Activity size={14} className="text-[var(--mw-gold-primary)]" />
          Histórico Black Market (BM)
        </h4>

        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-bold px-2 py-1 bg-black/40 rounded border border-[var(--mw-border)] flex items-center gap-1", trendColor)}>
            <TrendIcon size={12} /> {data.changePercent > 0 ? '+' : ''}{data.changePercent}%
          </span>
          <span className="text-sm text-[var(--mw-text-main)] bg-[var(--mw-bg)] px-2 py-1 rounded font-mono border border-[var(--mw-border)]">
            Média: {formatSilver(data.avgPrice)}
          </span>
        </div>
      </div>

      <div className="h-40 w-full relative -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[var(--mw-card)] border border-[var(--mw-border)] p-2 rounded shadow-lg text-sm font-mono font-bold text-[var(--mw-gold-bright)]">
                      {formatSilver(payload[0].value as number)}
                    </div>
                  );
                }
                return null;
              }}
              cursor={{ stroke: 'rgba(201,168,76,0.2)', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="var(--mw-gold-primary)" 
              strokeWidth={3} 
              dot={false}
              activeDot={{ r: 6, fill: 'var(--mw-gold-bright)', stroke: '#1a1a1a', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-sm text-[var(--mw-text-muted)] text-center uppercase tracking-widest">
        Mostrando pontos das últimas 24/48 horas
      </div>
    </div>
  );
}
