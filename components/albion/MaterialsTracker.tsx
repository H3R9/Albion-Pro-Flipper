import React, { useState, useEffect, useRef } from 'react';
import { fetchMarketData, fetchPriceTrend } from '@/lib/albion/api';
import { ROYAL_CITIES, formatSilver, getItemIconUrl, getAgeMinutes, formatTimeAgo, CITIES, ALL_LOCATIONS } from '@/lib/albion/utils';
import { getItemFullName } from '@/lib/albion/items';
import { Loader2, TrendingUp, TrendingDown, Minus, MapPin, RefreshCw, Bell, BellOff } from 'lucide-react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { requestNotificationPermission, sendNotification } from '@/lib/alerts';
import { LiveTimeAgo } from '@/components/albion/LiveTimeAgo';
import Image from 'next/image';

import { MaterialsAiChat } from './MaterialsAiChat';
import { toast } from 'sonner';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface MaterialData {
  itemId: string;
  name: string;
  icon: string;
  tier: number;
  
  bestDirectPrice: number;
  bestDirectCity: string;
  bestDirectDate?: string;
  
  bestOrderPrice: number;
  bestOrderCity: string;
  bestOrderDate?: string;

  caerleonSellPrice?: number;
  caerleonBuyOrder?: number;

  trend?: 'up' | 'down' | 'stable';
  changePercent?: number;
}

export function MaterialsTracker() {
  const [data, setData] = useState<MaterialData[]>([]);
  const [loading, setLoading] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const previousMaterialsRef = useRef<Record<string, { direct: number; order: number }>>({});

  const toggleAlerts = async () => {
    if (!alertsEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setAlertsEnabled(true);
        sendNotification('Monitoramento de Materiais Ativado', { body: 'Você receberá alertas quando o preço dos itens de melhor compra cair significativamente.' });
      } else {
        toast.warning('Permissão de notificação negada ou não suportada.');
      }
    } else {
      setAlertsEnabled(false);
    }
  };

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const mats: string[] = [];
      for (let t = 4; t <= 8; t++) {
        mats.push(`T${t}_RUNE`, `T${t}_SOUL`, `T${t}_RELIC`, `T${t}_SHARD_AVALONIAN`);
      }

      // We want to check all cities including Caerleon
      const locations = [...ROYAL_CITIES, 'Caerleon'];
      const rawData = await fetchMarketData(mats, locations);

      // Group by item
      const grouped: Record<string, any[]> = {};
      mats.forEach(m => grouped[m] = []);
      rawData.forEach(d => {
        if (grouped[d.item_id]) {
          grouped[d.item_id].push(d);
        }
      });

      const processedData: MaterialData[] = [];

      for (const itemId of mats) {
        const itemEntries = grouped[itemId] || [];
        
        const validDirects = itemEntries
          .filter(e => e.sell_price_min > 0 && getAgeMinutes(e.sell_price_min_date) <= 360)
          .sort((a, b) => a.sell_price_min - b.sell_price_min);
          
        const bestDirectPrice = validDirects.length > 0 ? validDirects[0].sell_price_min : Infinity;

        const validOrders = itemEntries
          .filter(e => e.buy_price_max > 0 && getAgeMinutes(e.buy_price_max_date) <= 360 && (bestDirectPrice === Infinity || e.buy_price_max >= bestDirectPrice * 0.2))
          .sort((a, b) => a.buy_price_max - b.buy_price_max);

        // We calculate best order price adding +1 to max buy order
        const bestOrderEntry = validOrders.length > 0 ? validOrders[0] : null;

        const caerleonSell = itemEntries.find(e => e.city === 'Caerleon' && e.sell_price_min > 0 && getAgeMinutes(e.sell_price_min_date) <= 360);
        const caerleonBuy = itemEntries.find(e => e.city === 'Caerleon' && e.buy_price_max > 0 && getAgeMinutes(e.buy_price_max_date) <= 360);

        const tierMatch = itemId.match(/^T(\d+)/);
        const tier = tierMatch ? parseInt(tierMatch[1], 10) : 0;

        processedData.push({
          itemId,
          name: getItemFullName(itemId),
          icon: getItemIconUrl(itemId, 1, 64),
          tier,
          
          bestDirectPrice,
          bestDirectCity: validDirects.length > 0 ? validDirects[0].city : 'N/A',
          bestDirectDate: validDirects.length > 0 ? validDirects[0].sell_price_min_date : undefined,
          
          bestOrderPrice: bestOrderEntry ? bestOrderEntry.buy_price_max + 1 : Infinity,
          bestOrderCity: bestOrderEntry ? bestOrderEntry.city : 'N/A',
          bestOrderDate: bestOrderEntry ? bestOrderEntry.buy_price_max_date : undefined,
          
          caerleonSellPrice: caerleonSell ? caerleonSell.sell_price_min - 1 : Infinity,
          caerleonBuyOrder: caerleonBuy ? caerleonBuy.buy_price_max : 0,
        });
      }

      setData(processedData);

      // Fetch trends in background
      processedData.forEach(async (mat, idx) => {
        const trendData = await fetchPriceTrend(mat.itemId);
        setData(prev => {
          const newData = [...prev];
          if (newData[idx]) {
            if (trendData) {
              newData[idx].trend = trendData.trend as any;
              newData[idx].changePercent = trendData.changePercent;
            } else {
              newData[idx].trend = 'stable';
              newData[idx].changePercent = 0;
            }
          }
          return newData;
        });
      });

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (alertsEnabled) {
      // 3 minutes interval
      interval = setInterval(() => {
        fetchMaterials();
      }, 3 * 60 * 1000);
    }
    return () => clearInterval(interval);
  }, [alertsEnabled]);

  // Alert check for new data
  useEffect(() => {
    if (!alertsEnabled || data.length === 0) return;
    
    let notify = false;
    let bestDropItem: MaterialData | null = null;
    let minPriceChange = 0;

    data.forEach(item => {
      const prev = previousMaterialsRef.current[item.itemId];
      if (prev) {
        if (prev.direct > 0 && item.bestDirectPrice > 0 && item.bestDirectPrice < prev.direct) {
          const drop = prev.direct - item.bestDirectPrice;
          if (drop / prev.direct > 0.1 || drop > 50) {
            notify = true;
            bestDropItem = item;
            minPriceChange = drop;
          }
        }
      }
      previousMaterialsRef.current[item.itemId] = { direct: item.bestDirectPrice, order: item.bestOrderPrice };
    });

    if (notify && bestDropItem !== null) {
      const dropItem = bestDropItem as MaterialData;
      sendNotification(`Queda de Preço: ${dropItem.name}`, {
        body: `Venda Direta caiu para ${formatSilver(dropItem.bestDirectPrice)} em ${dropItem.bestDirectCity}.`
      });
    }

  }, [data, alertsEnabled]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMaterials();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Group by Tier
  const itemsByTier: Record<number, MaterialData[]> = {};
  data.forEach(item => {
    if (!itemsByTier[item.tier]) itemsByTier[item.tier] = [];
    itemsByTier[item.tier].push(item);
  });

  return (
    <div className="bg-[var(--mw-card)]/80 border border-[var(--mw-border)] rounded-xl p-6 shadow-lg w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-[var(--mw-border)] pb-6 relative">
        <div>
          <h2 className="text-xl font-black text-[var(--mw-text-main)] flex items-center gap-3 drop-shadow-md">
            <RefreshCw className="text-[var(--mw-gold-bright)]" size={24} />
            Mercado de Encantamentos
          </h2>
          <p className="text-[var(--mw-text-muted)] mt-2 text-sm max-w-2xl leading-relaxed">
            Rastreie as cidades com os melhores preços para comprar <strong className="text-[var(--mw-text-main)]">Runas, Almas e Relíquias</strong>. 
            Identifique as melhores opções para <strong className="text-[var(--mw-gold-primary)] font-bold">Venda Direta</strong> (se precisa urgente) ou <strong className="text-blue-400 font-bold">Pedidos de Compra</strong> (se quer economizar).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleAlerts}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-sm font-bold rounded-md transition shadow-sm",
              alertsEnabled 
                ? "bg-[var(--mw-gold-dark)]/20 text-[var(--mw-gold-bright)] border border-[var(--mw-gold-bright)]/30 hover:bg-[var(--mw-gold-dark)]/30" 
                : "bg-[var(--mw-bg)] text-[var(--mw-text-muted)] border border-[var(--mw-border)] hover:text-white hover:bg-[var(--mw-card-hover)]"
            )}
          >
            {alertsEnabled ? <Bell className="animate-pulse" size={16} /> : <BellOff size={16} />}
            <span className="hidden sm:inline">Monitoramento</span>
          </button>
          
          <button 
            onClick={fetchMaterials} 
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-[var(--mw-gold-primary)] hover:bg-[var(--mw-gold-bright)] text-black font-bold rounded shadow-md whitespace-nowrap text-sm disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Atualizar Cotações
          </button>
        </div>
      </div>

      <div className="bg-[var(--mw-bg)]/60 border border-[var(--mw-border)] rounded-xl p-4 mb-8 flex gap-4 items-start shadow-sm">
        <div className="bg-[var(--mw-gold-primary)]/10 p-2 rounded-lg hidden sm:block">
          <RefreshCw size={20} className="text-[var(--mw-gold-bright)]" />
        </div>
        <div className="flex-1">
          <h4 className="text-[var(--mw-gold-bright)] font-bold text-sm mb-1">Os preços estão desatualizados? Atualize você mesmo!</h4>
          <p className="text-[var(--mw-text-muted)] text-xs leading-relaxed max-w-4xl">
            Esta ferramenta usa preços do <strong className="text-[var(--mw-text-main)]">Albion Data Project</strong>, mantido pela comunidade. Para atualizar as cotações: baixe e execute o <a href="https://github.com/ao-data/albiondata-client/releases" target="_blank" rel="noreferrer" className="text-[var(--mw-gold-primary)] hover:underline hover:text-[var(--mw-gold-bright)]">Albion Data Client (GitHub)</a> em seu computador enquanto joga. Sempre que você visita o mercado do jogo e visualiza itens, o client atualiza a rede global automaticamente e os preços novos aparecerão aqui após clicar em &quot;Atualizar Cotações&quot;!
          </p>
        </div>
      </div>
      
      {!loading && data.length > 0 && (
        <div className="mb-8">
          <MaterialsAiChat materialsData={data} />
        </div>
      )}

      {loading && data.length === 0 ? (
        <div className="text-center py-12 text-[var(--mw-text-muted)] flex flex-col items-center">
          <Loader2 size={32} className="animate-spin mb-4 text-[var(--mw-gold-bright)]" />
          Carregando dados de runas, almas e relíquias...
        </div>
      ) : (
        <div className="space-y-8">
          {[4, 5, 6, 7, 8].map(tier => {
            const tierItems = itemsByTier[tier];
            if (!tierItems || tierItems.length === 0) return null;

            return (
              <div key={tier} className="bg-[var(--mw-bg)] border border-[var(--mw-border)] rounded-xl overflow-hidden shadow-sm mb-6">
                <div className="bg-[var(--mw-card)] px-5 py-3 font-bold text-[var(--mw-text-main)] flex items-center gap-3 border-b border-[var(--mw-border)]">
                  <div className="w-8 h-8 rounded bg-[var(--mw-gold-primary)]/10 border border-[var(--mw-gold-primary)]/20 flex items-center justify-center">
                    <span className="font-bold text-[var(--mw-gold-bright)] text-sm">{tier}</span>
                  </div>
                  <span className="text-sm uppercase tracking-widest">Materiais Tier {tier}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#0b0c10]/40 text-[var(--mw-text-muted)] border-b border-[var(--mw-border)] font-bold text-[10px] uppercase tracking-widest">
                      <tr>
                        <th className="p-4 pl-6">Material</th>
                        <th className="p-4 text-right">Compra Origin (Multi)</th>
                        <th className="p-4 text-right">Vender em Caerleon</th>
                        <th className="p-4 text-center">Lucro Estimado</th>
                        <th className="p-4 text-center">Tendência (Global)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--mw-border)]/50">
                      {tierItems.map(item => {
                        const hasDirect = item.bestDirectPrice < Infinity;
                        const hasOrder = item.bestOrderPrice < Infinity;

                        return (
                          <tr key={item.itemId} className="hover:bg-[var(--mw-card-hover)] transition-colors">
                            <td className="p-4 pl-6 flex items-center gap-3">
                              <div className="w-10 h-10 rounded bg-[var(--mw-bg)] flex items-center justify-center border border-[var(--mw-border)] shrink-0 shadow-sm p-1">
                                <Image src={item.icon} alt={item.name} width={40} height={40} className="object-contain" unoptimized referrerPolicy="no-referrer" />
                              </div>
                              <span className="font-bold text-[var(--mw-text-main)] text-sm"><span className="text-[var(--mw-gold-bright)] mr-1 drop-shadow-sm">T{item.tier}</span>{item.name}</span>
                            </td>
                            
                            <td className="p-4 text-right">
                              {hasOrder ? (
                                <div className="flex flex-col items-end gap-1.5">
                                  <div className="flex items-center gap-2 text-[var(--mw-text-main)] font-mono text-sm bg-[var(--mw-card)] px-2 py-0.5 rounded border border-[var(--mw-border)] shadow-sm">
                                    <span className="text-blue-400 text-[9px] font-sans tracking-widest uppercase">PEDIDO ({item.bestOrderCity})</span>
                                    <span className="font-black text-blue-400">{formatSilver(item.bestOrderPrice)}</span>
                                  </div>
                                </div>
                              ) : null}
                              {hasDirect ? (
                                <div className="flex flex-col items-end gap-1.5 mt-1">
                                  <div className="flex items-center gap-2 text-[var(--mw-text-main)] font-mono text-sm bg-[var(--mw-card)] px-2 py-0.5 rounded border border-[var(--mw-border)] shadow-sm">
                                    <span className="text-[var(--mw-gold-bright)] text-[9px] font-sans tracking-widest uppercase">DIRETA ({item.bestDirectCity})</span>
                                    <span className="font-black text-[var(--mw-gold-bright)]">{formatSilver(item.bestDirectPrice)}</span>
                                  </div>
                                </div>
                              ) : null}
                              {!hasDirect && !hasOrder && <span className="text-[var(--mw-text-muted)] text-[10px] uppercase font-bold tracking-widest">Indisponível</span>}
                            </td>
                            
                            <td className="p-4 text-right">
                              {item.caerleonSellPrice && item.caerleonSellPrice < Infinity ? (
                                <div className="flex flex-col items-end gap-1.5">
                                  <div className="flex items-center gap-2 text-[var(--mw-text-main)] font-mono text-sm bg-[var(--mw-card)] px-2 py-0.5 rounded border border-[var(--mw-border)] shadow-sm">
                                    <span className="text-[var(--mw-green)] text-[9px] font-sans tracking-widest uppercase">VENDA DIRETA</span>
                                    <span className="font-black text-[var(--mw-green)]">{formatSilver(item.caerleonSellPrice)}</span>
                                  </div>
                                </div>
                              ) : null}
                              {item.caerleonBuyOrder && item.caerleonBuyOrder > 0 ? (
                                <div className="flex flex-col items-end gap-1.5 mt-1">
                                  <div className="flex items-center gap-2 text-[var(--mw-text-main)] font-mono text-sm bg-[var(--mw-card)] px-2 py-0.5 rounded border border-[var(--mw-border)] shadow-sm">
                                    <span className="text-blue-400 text-[9px] font-sans tracking-widest uppercase">PARA PEDIDO BM</span>
                                    <span className="font-black text-blue-400">{formatSilver(item.caerleonBuyOrder)}</span>
                                  </div>
                                </div>
                              ) : null}
                              {(!item.caerleonSellPrice || item.caerleonSellPrice === Infinity) && (!item.caerleonBuyOrder || item.caerleonBuyOrder === 0) && (
                                <span className="text-[var(--mw-text-muted)] text-[10px] uppercase font-bold tracking-widest">Indisponível</span>
                              )}
                            </td>

                            <td className="p-4 text-center">
                              {(() => {
                                const bestBuy = Math.min(item.bestDirectPrice, item.bestOrderPrice);
                                const bestSell = Math.max(item.caerleonSellPrice !== Infinity ? item.caerleonSellPrice! : 0, item.caerleonBuyOrder || 0);

                                if (bestBuy === Infinity || bestSell === 0) return <span className="text-[var(--mw-text-muted)]">-</span>;
                                
                                const valTax = Math.floor(bestSell * 0.04);
                                const profit = bestSell - bestBuy - valTax;
                                const margin = (profit / bestBuy) * 100;
                                
                                return (
                                  <div className="flex flex-col items-center">
                                    <span className={cn("font-bold font-mono text-sm", profit > 0 ? "text-[var(--mw-green)]" : "text-[var(--mw-red)]")}>
                                      {profit > 0 ? '+' : ''}{formatSilver(profit)}
                                    </span>
                                    <span className="text-[10px] text-[var(--mw-text-muted)] mt-0.5 font-mono">{margin.toFixed(1)}%</span>
                                  </div>
                                );
                              })()}
                            </td>

                            <td className="p-4 text-center">
                              {!item.trend ? (
                                <Loader2 size={14} className="animate-spin text-[var(--mw-text-muted)] mx-auto" />
                              ) : (
                                <div className={cn(
                                  "flex items-center justify-center gap-1 font-bold text-[10px] px-2 py-1 rounded w-max mx-auto shadow-sm tracking-wide",
                                  item.trend === 'up' ? "text-[var(--mw-green)] bg-[var(--mw-green)]/10 border border-[var(--mw-green)]/20" : item.trend === 'down' ? "text-[var(--mw-red)] bg-[var(--mw-red)]/10 border border-[var(--mw-red)]/20" : "text-[var(--mw-text-muted)] bg-[var(--mw-bg)] border border-[var(--mw-border)]"
                                )}>
                                  {item.trend === 'up' && <TrendingUp size={12} />}
                                  {item.trend === 'down' && <TrendingDown size={12} />}
                                  {item.trend === 'stable' && <Minus size={12} />}
                                  {item.changePercent !== undefined && item.changePercent !== 0 ? (item.changePercent > 0 ? '+' : '') + item.changePercent + '%' : ''}
                                  {item.changePercent === 0 && <span className="font-normal opacity-70">SEM DADOS</span>}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
