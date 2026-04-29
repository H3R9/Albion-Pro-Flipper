import React, { useState, useEffect, useRef } from 'react';
import { fetchMarketData, fetchPriceTrend } from '@/lib/albion/api';
import { ROYAL_CITIES, formatSilver, getItemIconUrl, getAgeMinutes, formatTimeAgo, CITIES, ALL_LOCATIONS } from '@/lib/albion/utils';
import { getItemFullName } from '@/lib/albion/items';
import { Loader2, TrendingUp, TrendingDown, Minus, MapPin, RefreshCw, Bell, BellOff } from 'lucide-react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { requestNotificationPermission, sendNotification } from '@/lib/alerts';
import { LiveTimeAgo } from '@/components/albion/LiveTimeAgo';

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
    <div className="bg-[#0b0c10]/80 border border-slate-800 rounded-2xl p-6 shadow-xl w-full mx-auto mt-6 backdrop-blur-sm relative z-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-slate-800 pb-6 relative">
        <div>
          <h2 className="text-2xl font-black text-slate-100 flex items-center gap-3 drop-shadow-md">
            <RefreshCw className="text-amber-500" size={28} />
            Mercado de Encantamentos
          </h2>
          <p className="text-slate-400 mt-2 text-sm max-w-2xl leading-relaxed">
            Rastreie as cidades com os melhores preços para comprar <strong className="text-slate-300">Runas, Almas e Relíquias</strong>. 
            Identifique as melhores opções para <strong className="text-amber-500 font-bold">Venda Direta</strong> (se precisa urgente) ou <strong className="text-blue-400 font-bold">Pedidos de Compra</strong> (se quer economizar).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleAlerts}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-sm font-bold rounded-md transition shadow-sm",
              alertsEnabled 
                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20" 
                : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200 hover:bg-slate-700"
            )}
          >
            {alertsEnabled ? <Bell className="animate-pulse" size={16} /> : <BellOff size={16} />}
            <span className="hidden sm:inline">Monitoramento</span>
          </button>
          
          <button 
            onClick={fetchMaterials} 
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-lg transition border border-amber-600 disabled:opacity-50 shadow-md whitespace-nowrap"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
            Atualizar Cotações
          </button>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-amber-500/20 rounded-xl p-4 mb-8 flex gap-4 items-start shadow-inner">
        <div className="bg-amber-500/10 p-2 rounded-full hidden sm:block">
          <RefreshCw size={24} className="text-amber-500" />
        </div>
        <div className="flex-1">
          <h4 className="text-amber-500 font-bold text-sm mb-1">Os preços estão desatualizados? Atualize você mesmo!</h4>
          <p className="text-slate-400 text-xs leading-relaxed max-w-4xl">
            Esta ferramenta usa preços do <strong className="text-slate-300">Albion Data Project</strong>, mantido pela comunidade. Para atualizar as cotações: baixe e execute o <a href="https://github.com/ao-data/albiondata-client/releases" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline hover:text-amber-300">Albion Data Client (GitHub)</a> em seu computador enquanto joga. Sempre que você visita o mercado do jogo e visualiza itens, o client atualiza a rede global automaticamente e os preços novos aparecerão aqui após clicar em &quot;Atualizar Cotações&quot;!
          </p>
        </div>
      </div>
      
      {!loading && data.length > 0 && (
        <div className="mb-8">
          <MaterialsAiChat materialsData={data} />
        </div>
      )}

      {loading && data.length === 0 ? (
        <div className="text-center py-12 text-slate-400 flex flex-col items-center">
          <Loader2 size={32} className="animate-spin mb-4 text-amber-500" />
          Carregando dados de runas, almas e relíquias...
        </div>
      ) : (
        <div className="space-y-8">
          {[4, 5, 6, 7, 8].map(tier => {
            const tierItems = itemsByTier[tier];
            if (!tierItems || tierItems.length === 0) return null;

            return (
              <div key={tier} className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-xl mb-6">
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-5 py-3 font-bold text-slate-100 flex items-center gap-3 border-b border-slate-700">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <span className="font-bold text-amber-500 text-lg">{tier}</span>
                  </div>
                  <span className="text-lg uppercase tracking-wide">Materiais Tier {tier}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#0b0c10]/80 text-slate-300 border-b border-slate-700 font-bold text-xs uppercase tracking-wider">
                      <tr>
                        <th className="p-4 pl-6">Material</th>
                        <th className="p-4 text-right">Compra Origin (Multi)</th>
                        <th className="p-4 text-right">Vender em Caerleon</th>
                        <th className="p-4 text-center">Lucro Estimado</th>
                        <th className="p-4 text-center">Tendência (Global)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {tierItems.map(item => {
                        const hasDirect = item.bestDirectPrice < Infinity;
                        const hasOrder = item.bestOrderPrice < Infinity;

                        return (
                          <tr key={item.itemId} className="hover:bg-slate-800/40 transition">
                            <td className="p-4 pl-6 flex items-center gap-3">
                              <img src={item.icon} alt={item.name} className="w-12 h-12 object-contain bg-slate-900/80 rounded block shadow-sm border border-slate-700" />
                              <span className="font-bold text-slate-100 text-base"><span className="text-amber-500 mr-2 drop-shadow">T{item.tier}</span>{item.name}</span>
                            </td>
                            
                            <td className="p-4 text-right">
                              {hasOrder ? (
                                <div className="flex flex-col items-end gap-1.5">
                                  <div className="flex items-center gap-2 text-slate-100 font-mono text-base bg-slate-950/50 px-2 py-0.5 rounded border border-slate-800">
                                    <span className="text-blue-300 text-[10px] font-sans tracking-wide uppercase">PEDIDO ({item.bestOrderCity})</span>
                                    <span className="font-black text-blue-400 drop-shadow-sm">{formatSilver(item.bestOrderPrice)}</span>
                                  </div>
                                </div>
                              ) : null}
                              {hasDirect ? (
                                <div className="flex flex-col items-end gap-1.5 mt-1">
                                  <div className="flex items-center gap-2 text-slate-100 font-mono text-base bg-slate-950/50 px-2 py-0.5 rounded border border-slate-800">
                                    <span className="text-amber-500 text-[10px] font-sans tracking-wide uppercase">DIRETA ({item.bestDirectCity})</span>
                                    <span className="font-black text-amber-400 drop-shadow-sm">{formatSilver(item.bestDirectPrice)}</span>
                                  </div>
                                </div>
                              ) : null}
                              {!hasDirect && !hasOrder && <span className="text-slate-500 text-sm italic">Indisponível</span>}
                            </td>
                            
                            <td className="p-4 text-right">
                              {item.caerleonSellPrice && item.caerleonSellPrice < Infinity ? (
                                <div className="flex flex-col items-end gap-1.5">
                                  <div className="flex items-center gap-2 text-slate-100 font-mono text-base bg-slate-950/50 px-2 py-0.5 rounded border border-slate-800">
                                    <span className="text-emerald-400 text-[10px] font-sans tracking-wide uppercase">VENDA DIRETA</span>
                                    <span className="font-black text-emerald-400 drop-shadow-sm">{formatSilver(item.caerleonSellPrice)}</span>
                                  </div>
                                </div>
                              ) : null}
                              {item.caerleonBuyOrder && item.caerleonBuyOrder > 0 ? (
                                <div className="flex flex-col items-end gap-1.5 mt-1">
                                  <div className="flex items-center gap-2 text-slate-100 font-mono text-base bg-slate-950/50 px-2 py-0.5 rounded border border-slate-800">
                                    <span className="text-blue-300 text-[10px] font-sans tracking-wide uppercase">PARA PEDIDO BM</span>
                                    <span className="font-black text-blue-400 drop-shadow-sm">{formatSilver(item.caerleonBuyOrder)}</span>
                                  </div>
                                </div>
                              ) : null}
                              {(!item.caerleonSellPrice || item.caerleonSellPrice === Infinity) && (!item.caerleonBuyOrder || item.caerleonBuyOrder === 0) && (
                                <span className="text-slate-500 text-sm italic">Indisponível</span>
                              )}
                            </td>

                            <td className="p-4 text-center">
                              {(() => {
                                const bestBuy = Math.min(item.bestDirectPrice, item.bestOrderPrice);
                                const bestSell = Math.max(item.caerleonSellPrice !== Infinity ? item.caerleonSellPrice! : 0, item.caerleonBuyOrder || 0);

                                if (bestBuy === Infinity || bestSell === 0) return <span className="text-slate-500">-</span>;
                                
                                const valTax = Math.floor(bestSell * 0.04);
                                const profit = bestSell - bestBuy - valTax;
                                const margin = (profit / bestBuy) * 100;
                                
                                return (
                                  <div className="flex flex-col items-center">
                                    <span className={cn("font-bold font-mono text-base", profit > 0 ? "text-green-400" : "text-red-400")}>
                                      {profit > 0 ? '+' : ''}{formatSilver(profit)}
                                    </span>
                                    <span className="text-xs text-slate-400">{margin.toFixed(1)}%</span>
                                  </div>
                                );
                              })()}
                            </td>

                            <td className="p-4 text-center">
                              {!item.trend ? (
                                <Loader2 size={14} className="animate-spin text-slate-500 mx-auto" />
                              ) : (
                                <div className={cn(
                                  "flex items-center justify-center gap-1 font-bold text-xs",
                                  item.trend === 'up' ? "text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1.5 rounded shadow-inner" : item.trend === 'down' ? "text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1.5 rounded shadow-inner" : "text-slate-300 bg-slate-800/80 border border-slate-700 px-2.5 py-1.5 rounded shadow-inner"
                                )}>
                                  {item.trend === 'up' && <TrendingUp size={14} className="drop-shadow-sm" />}
                                  {item.trend === 'down' && <TrendingDown size={14} className="drop-shadow-sm" />}
                                  {item.trend === 'stable' && <Minus size={14} className="drop-shadow-sm" />}
                                  {item.changePercent !== undefined && item.changePercent !== 0 ? (item.changePercent > 0 ? '+' : '') + item.changePercent + '%' : ''}
                                  {item.changePercent === 0 && <span className="text-slate-400 font-normal text-[10px]">SEM DADOS</span>}
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
