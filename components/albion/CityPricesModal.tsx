"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { CITIES, getItemIconUrl, formatSilver, formatTimeAgo, ROYAL_CITIES } from '@/lib/albion/utils';
import { fetchMarketData } from '@/lib/albion/api';
import { getItemFullName } from '@/lib/albion/items';
import { motion, AnimatePresence } from 'motion/react';

interface CityPricesModalProps {
  itemId: string | null;
  onClose: () => void;
}

export function CityPricesModal({ itemId, onClose }: CityPricesModalProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!itemId) return;
    let isMounted = true;
    const loadPrices = async () => {
      setLoading(true);
      try {
        const result = await fetchMarketData([itemId], CITIES);
        if (isMounted) {
          setData(result.filter(r => r.item_id === itemId));
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadPrices();
    return () => { isMounted = false; };
  }, [itemId]);

  if (!itemId) return null;

  // Aggregate by city
  const cityData = CITIES.map(city => {
    const cityRow = data.find(d => d.city === city);
    return {
      city,
      sellPrice: cityRow ? cityRow.sell_price_min : 0,
      sellDate: cityRow ? cityRow.sell_price_min_date : null,
      buyPrice: cityRow ? cityRow.buy_price_max : 0,
      buyDate: cityRow ? cityRow.buy_price_max_date : null,
    };
  });

  // Sort by sell price (cheapest to most expensive), missing at bottom
  const sortedSell = [...cityData].sort((a, b) => {
    if (a.sellPrice === 0) return 1;
    if (b.sellPrice === 0) return -1;
    return a.sellPrice - b.sellPrice;
  });

  const sortedBuy = [...cityData].sort((a, b) => {
    if (a.buyPrice === 0) return 1;
    if (b.buyPrice === 0) return -1;
    return b.buyPrice - a.buyPrice; // Buy order we want highest first usually, but the prompt says "do mais barato ao mais caro", so let's just sort by price ascending for both? Or just sell price ascending. It says "organized from cheapest to most expensive". So ascending. Wait, for buy orders "cheapest" means the buyer is paying less, so ascending is also fine. Let's do ascending for both just to follow instructions strictly. No, let's keep one table and sort it by Sell Price min.
  });

  const itemName = getItemFullName(itemId);

  return (
    <AnimatePresence>
      {itemId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="w-full max-w-2xl bg-[var(--mw-card)] border border-[var(--mw-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
            style={{ maxHeight: '90vh' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--mw-border)] bg-[var(--mw-bg)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--mw-card)] rounded border border-[var(--mw-border)] flex items-center justify-center p-1">
                  <Image src={getItemIconUrl(itemId)} alt={itemName} width={32} height={32} className="object-contain" unoptimized referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--mw-text-main)] text-sm md:text-base leading-tight">
                    {itemName}
                  </h3>
                  <p className="text-[10px] text-[var(--mw-text-muted)] font-mono uppercase">
                    {itemId}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-[var(--mw-card)] rounded-lg text-[var(--mw-text-muted)] hover:text-red-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-0 overflow-y-auto w-full relative">
              {loading && (
                <div className="absolute inset-0 bg-[var(--mw-bg)]/50 backdrop-blur-sm flex items-center justify-center z-10">
                  <Loader2 className="animate-spin text-emerald-500" size={32} />
                </div>
              )}
              
              <table className="w-full text-left border-collapse text-sm min-w-[500px]">
                <thead className="bg-[var(--mw-bg)] sticky top-0 z-10 border-b border-[var(--mw-border)]">
                  <tr>
                    <th className="py-3 px-4 font-bold text-xs uppercase tracking-widest text-[var(--mw-text-muted)]">Cidade</th>
                    <th className="py-3 px-4 font-bold text-xs uppercase tracking-widest text-[var(--mw-text-muted)]">Venda Direta (Sell)</th>
                    <th className="py-3 px-4 font-bold text-xs uppercase tracking-widest text-[var(--mw-text-muted)]">Pedido de Compra (Buy)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--mw-border)]">
                  {sortedSell.map((row, i) => (
                    <tr key={row.city} className="hover:bg-[var(--mw-bg)]/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-[var(--mw-text-main)] flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[var(--mw-bg)] border border-[var(--mw-border)] flex items-center justify-center text-[10px] text-[var(--mw-text-muted)]">
                          {i + 1}
                        </span>
                        {row.city}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-emerald-400">
                            {formatSilver(row.sellPrice)}
                          </span>
                          <span className="text-[10px] text-[var(--mw-text-muted)]">
                            {formatTimeAgo(row.sellDate)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-amber-400">
                            {formatSilver(row.buyPrice)}
                          </span>
                          <span className="text-[10px] text-[var(--mw-text-muted)]">
                            {formatTimeAgo(row.buyDate)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[var(--mw-border)] bg-[var(--mw-bg)] text-[10px] text-center text-[var(--mw-text-muted)] uppercase tracking-widest font-bold">
              Organizado pelo menor preço de Venda Direta
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
