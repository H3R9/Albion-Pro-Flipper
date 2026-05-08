import { useState, useCallback } from 'react';
import { fetchMarketData } from '@/lib/albion/api';
import { getRecipeDetails, calculateRRR, calculateItemValue, calculateProfit } from '@/lib/albion/analysis/refining';
import { MATERIALS, CITIES } from './useRefiningCalculator';

export interface RefiningOpportunity {
  tier: number;
  enchantment: number;
  buyCity: string;
  sellCity: string;
  profit: number;
  margin: number;
  profitPerFocus: number;
  rrr: number;
  rawId: string;
  refinedId: string;
  qtys: any;
  profitData: any;
  buyPrice: number;
  sellPrice: number;
  focusCost: number;
}

export function useRefiningScanner() {
  const [loading, setLoading] = useState(false);
  const [opportunities, setOpportunities] = useState<RefiningOpportunity[]>([]);

  const scanOpportunities = useCallback(async (
    material: typeof MATERIALS[number],
    mastery: number,
    specs: Record<number, number>,
    stationTax: number,
    hasPremium: boolean,
    transportCost: number,
    overrideBaseFocus: number | null
  ) => {
    setLoading(true);
    setOpportunities([]);

    try {
      const isStone = material.id === 'ROCK';
      const itemIdsToFetch = new Set<string>();
      const variations: any[] = [];

      for (let t = 4; t <= 8; t++) {
        for (let e = 0; e <= (isStone ? 3 : 4); e++) {
          if (t < 4 && e > 0) continue;
          
          const details = getRecipeDetails(t, e, isStone, material.id, material.refinedId);
          itemIdsToFetch.add(details.ids.rawId);
          itemIdsToFetch.add(details.ids.refinedId);
          if (details.ids.subRefinedId) itemIdsToFetch.add(details.ids.subRefinedId);
          
          variations.push({ tier: t, enchantment: e, details });
        }
      }

      const allIds = Array.from(itemIdsToFetch);
      // Split into chunks of 100 if needed (though 60 is fine)
      const marketData = await fetchMarketData(allIds, [...CITIES, 'Black Market']);

      const results: RefiningOpportunity[] = [];

      // Calculate RRR for Focus in bonus city vs regular city
      // We assume user will refine in the city that has the bonus for this material and with Focus.
      const bonusCity = material.city;
      // We will assume "buyCity" is where they buy raw materials.
      // We will assume "sellCity" is where they sell refined materials.
      // They always refine in the `bonusCity`.
      
      const rrrWithFocus = calculateRRR(true, 0, true);
      const rrrWithoutFocus = calculateRRR(true, 0, false);

      variations.forEach(v => {
        const { tier, enchantment, details } = v;
        const { rawId, subRefinedId, refinedId } = details.ids;
        const { qtys } = details;

        // Focus cost
        const otherTiersSpecSum = [4, 5, 6, 7, 8].filter(t => t !== tier).reduce((acc, currentTier) => acc + (specs[currentTier] || 0), 0);
        const selectedTierSpec = specs[tier] || 0;
        const focusEfficiency = (mastery * 30) + (selectedTierSpec * 250) + (otherTiersSpecSum * 30);
        
        const baseFocusDefaults: Record<number, number> = { 4: 15, 5: 26, 6: 46, 7: 81, 8: 144 };
        const rawBaseFocus = overrideBaseFocus ?? (baseFocusDefaults[tier] || 15);
        const baseFocusForEnchantment = rawBaseFocus * Math.pow(2, enchantment);
        const focusCost = Math.round(baseFocusForEnchantment * Math.pow(0.5, focusEfficiency / 10000));

        const itemValue = calculateItemValue(tier, enchantment);

        // Best Buy Price (Raw)
        const rawMarket = marketData.filter(d => d.item_id === rawId && d.sell_price_min > 0);
        
        // Sub-refined: assume user buys it in the bonus city for simplicity, or we check cheapest everywhere 
        const subMarket = subRefinedId ? marketData.filter(d => d.item_id === subRefinedId && d.sell_price_min > 0) : [];
        let subPrice = 0;
        if (subMarket.length > 0) {
          subPrice = subMarket.reduce((prev, curr) => (prev.sell_price_min < curr.sell_price_min) ? prev : curr).sell_price_min;
        }

        CITIES.forEach(buyCity => {
          const buyCityData = rawMarket.filter(d => d.city === buyCity);
          if (buyCityData.length === 0) return;
          const rawPrice = buyCityData.reduce((prev, curr) => (prev.sell_price_min < curr.sell_price_min) ? prev : curr).sell_price_min;

          CITIES.concat('Black Market').forEach(sellCity => {
            const sellCityData = marketData.filter(d => d.item_id === refinedId && d.city === sellCity);
            if (sellCityData.length === 0) return;

            let sellPrice = 0;
            if (sellCity === 'Black Market') {
                const bmValid = sellCityData.filter(d => d.buy_price_max > 0);
                if (bmValid.length > 0) {
                    sellPrice = bmValid.reduce((prev, curr) => prev.buy_price_max > curr.buy_price_max ? prev : curr).buy_price_max;
                }
            } else {
                const valid = sellCityData.filter(d => d.sell_price_min > 0);
                if (valid.length > 0) {
                    sellPrice = valid.reduce((prev, curr) => prev.sell_price_min < curr.sell_price_min ? prev : curr).sell_price_min;
                }
            }

            if (rawPrice > 0 && sellPrice > 0) {
               // Assuming they use focus for the best opportunities
               const profitData = calculateProfit(rawPrice, subPrice, sellPrice, qtys, rrrWithFocus, itemValue, stationTax, hasPremium, transportCost);
               
               if (profitData.profit > 0) {
                 results.push({
                   tier, enchantment, buyCity, sellCity,
                   profit: profitData.profit,
                   margin: profitData.margin,
                   profitPerFocus: profitData.profit / focusCost,
                   rrr: rrrWithFocus,
                   rawId, refinedId, qtys,
                   profitData,
                   buyPrice: rawPrice,
                   sellPrice, focusCost
                 });
               }
            }
          });
        });
      });

      // Filter to keep only the best sell city for each (tier, enchantment, buyCity) combination
      // Or just sort by Profit/Focus
      results.sort((a, b) => b.profitPerFocus - a.profitPerFocus);
      
      // Limit to top 15 and remove duplicate tier/enchant combinations to show variety
      const uniqueVariations = new Map<string, RefiningOpportunity>();
      results.forEach(r => {
        const key = `${r.tier}.${r.enchantment}`;
        if (!uniqueVariations.has(key)) {
            uniqueVariations.set(key, r);
        } else {
            const existing = uniqueVariations.get(key)!;
            // Only replace if significantly better
            if (r.profitPerFocus > existing.profitPerFocus) {
                uniqueVariations.set(key, r);
            }
        }
      });

      const topResults = Array.from(uniqueVariations.values())
        .sort((a, b) => b.profitPerFocus - a.profitPerFocus)
        .slice(0, 5); // top 5 best variations

      setOpportunities(topResults);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, opportunities, scanOpportunities };
}
