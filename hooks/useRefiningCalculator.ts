import { useState, useEffect, useMemo } from 'react';
import { fetchMarketData } from '@/lib/albion/api';
import { 
  getRecipeDetails, calculateRRR, calculateItemValue, calculateProfit
} from '@/lib/albion/analysis/refining';

export const CITIES = ['Caerleon', 'Thetford', 'Fort Sterling', 'Lymhurst', 'Bridgewatch', 'Martlock'];

export const MATERIALS = [
  { id: 'WOOD', name: 'Madeira (Wood)', refinedId: 'PLANKS', refinedName: 'Tábua', city: 'Fort Sterling' },
  { id: 'ORE', name: 'Minério (Ore)', refinedId: 'METALBAR', refinedName: 'Barra', city: 'Thetford' },
  { id: 'HIDE', name: 'Pele (Hide)', refinedId: 'LEATHER', refinedName: 'Couro', city: 'Martlock' },
  { id: 'FIBER', name: 'Fibra (Fiber)', refinedId: 'CLOTH', refinedName: 'Tecido', city: 'Lymhurst' },
  { id: 'ROCK', name: 'Pedra (Stone)', refinedId: 'STONEBLOCK', refinedName: 'Bloco de Pedra', city: 'Bridgewatch' },
] as const;

export function useRefiningCalculator() {
  const [material, setMaterial] = useState<typeof MATERIALS[number]>(MATERIALS[0]);
  const [tier, setTier] = useState<number>(4);
  const [enchantment, setEnchantment] = useState<number>(0);
  
  const [buyCity, setBuyCity] = useState<string>('Caerleon');
  const [sellCity, setSellCity] = useState<string>('Caerleon');
  
  const [hasPremium, setHasPremium] = useState<boolean>(true);
  const [useFocus, setUseFocus] = useState<boolean>(false);
  const [bonusLocation, setBonusLocation] = useState<boolean>(true);
  const [hideoutBonus, setHideoutBonus] = useState<number>(0); 
  
  const [stationTax, setStationTax] = useState<number>(500); 
  const [transportCost, setTransportCost] = useState<number>(0);

  // Destiny Board States
  const [mastery, setMastery] = useState<number>(100);
  const [specs, setSpecs] = useState<Record<number, number>>({ 4: 100, 5: 100, 6: 100, 7: 100, 8: 100 });
  const [overrideBaseFocus, setOverrideBaseFocus] = useState<number | null>(null);

  const [prices, setPrices] = useState<Record<string, { buy: number, sell: number, buyDate?: string, sellDate?: string }>>({});
  const [marketData, setMarketData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const isStone = material.id === 'ROCK';

  const clampedEnchantment = (tier < 4 && enchantment > 0) ? 0 : 
                             (isStone && enchantment > 3) ? 3 : 
                             enchantment;

  // Atualiza no estado interno de forma indireta pra não dar warning (ou então remove e apenas usa o valor via clampedEmbroder)
  // Mas como a UI mapeia pro .target.value, melhor colocar num handler ou usar clampedEnchantment nas queries.
  // Vou usar o effect com setImmediate.

  useEffect(() => {
    let changed = false;
    let newEnchantment = enchantment;
    if (tier < 4 && newEnchantment > 0) { 
      newEnchantment = 0; 
      changed = true; 
    }
    if (isStone && newEnchantment > 3) { 
      newEnchantment = 3; 
      changed = true; 
    }
    if (changed) {
      setTimeout(() => setEnchantment(newEnchantment), 0);
    }
  }, [tier, isStone, enchantment]);

  const { ids, qtys } = useMemo(() => {
    const safeEnchantment = (tier < 4 && enchantment > 0) ? 0 : (isStone && enchantment > 3) ? Math.min(3, enchantment) : enchantment;
    return getRecipeDetails(tier, safeEnchantment, isStone, material.id, material.refinedId);
  }, [tier, enchantment, isStone, material.id, material.refinedId]);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const itemsToFetch = [ids.rawId, ids.refinedId];
      if (ids.subRefinedId) itemsToFetch.push(ids.subRefinedId);
      
      const data = await fetchMarketData(itemsToFetch, [...CITIES, 'Black Market']);
      setMarketData(data);
      
      const newPrices: Record<string, { buy: number, sell: number, buyDate?: string, sellDate?: string }> = {};
      
      itemsToFetch.forEach(id => {
        // Compra (menor preço de venda)
        const buyCityData = data.filter(d => d.item_id === id && d.city === buyCity && d.sell_price_min > 0);
        let buyPrice = 0, buyDate = '';
        if (buyCityData.length > 0) {
            const minObj = buyCityData.reduce((prev, curr) => (prev.sell_price_min < curr.sell_price_min) ? prev : curr);
            buyPrice = minObj.sell_price_min;
            buyDate = minObj.sell_price_min_date;
        }
        
        // Venda (menor preço de venda para cálculo padrão)
        const sellCityData = data.filter(d => d.item_id === id && d.city === sellCity && d.sell_price_min > 0);
        let sellPrice = 0, sellDate = '';
        if (sellCityData.length > 0) {
            const minObj = sellCityData.reduce((prev, curr) => (prev.sell_price_min < curr.sell_price_min) ? prev : curr);
            sellPrice = minObj.sell_price_min;
            sellDate = minObj.sell_price_min_date;
        }
        
        // Black Market Exception (Usa max_buy)
        if (sellCity === 'Caerleon') {
           const bmData = data.filter(d => d.item_id === id && d.city === 'Black Market' && d.buy_price_max > 0);
           if (bmData.length > 0) {
               const maxObj = bmData.reduce((prev, curr) => prev.buy_price_max > curr.buy_price_max ? prev : curr);
               if (maxObj.buy_price_max > sellPrice) {
                   sellPrice = maxObj.buy_price_max;
                   sellDate = maxObj.buy_price_max_date;
               }
           }
        }
        
        newPrices[id] = { buy: buyPrice, sell: sellPrice, buyDate, sellDate };
      });
      setPrices(newPrices);
    } catch (e) {
      console.error('Error fetching prices:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => fetchPrices(), 500);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material, tier, enchantment, buyCity, sellCity]);

  const rrr = calculateRRR(bonusLocation, hideoutBonus, useFocus);
  
  // Focus Calculation
  const otherTiersSpecSum = [4, 5, 6, 7, 8].filter(t => t !== tier).reduce((acc, currentTier) => acc + (specs[currentTier] || 0), 0);
  const selectedTierSpec = specs[tier] || 0;
  const focusEfficiency = (mastery * 30) + (selectedTierSpec * 250) + (otherTiersSpecSum * 30);
  
  const baseFocusDefaults: Record<number, number> = { 4: 15, 5: 26, 6: 46, 7: 81, 8: 144 };
  const rawBaseFocus = overrideBaseFocus ?? (baseFocusDefaults[tier] || 15);
  // Base focus doubles with each enchantment level (appr.)
  const baseFocusForEnchantment = rawBaseFocus * Math.pow(2, enchantment);
  
  const actualFocusCost = Math.round(baseFocusForEnchantment * Math.pow(0.5, focusEfficiency / 10000));
  
  const rawData = prices[ids.rawId] || { buy: 0, sell: 0 };
  const subData = prices[ids.subRefinedId] || { buy: 0, sell: 0 };
  const refinedData = prices[ids.refinedId] || { buy: 0, sell: 0 };

  const itemValue = calculateItemValue(tier, enchantment);

  const profitData = calculateProfit(
    rawData.buy || 0, subData.buy || 0, refinedData.sell || 0,
    qtys, rrr, itemValue, stationTax, hasPremium, transportCost
  );

  return {
    state: {
      material, tier, enchantment,
      buyCity, sellCity,
      hasPremium, useFocus, bonusLocation, hideoutBonus, stationTax, transportCost,
      mastery, specs, overrideBaseFocus,
      prices, marketData, loading
    },
    setters: {
      setMaterial, setTier, setEnchantment,
      setBuyCity, setSellCity,
      setHasPremium, setUseFocus, setBonusLocation, setHideoutBonus, setStationTax, setTransportCost,
      setMastery, setSpecs: (tier: number, val: number) => setSpecs(prev => ({ ...prev, [tier]: val })), setOverrideBaseFocus
    },
    computed: {
      ids, qtys, rrr, profitData, rawData, subData, refinedData,
      isT4Magic: tier === 4 && enchantment > 0,
      subTier: tier - 1,
      isStone,
      focusEfficiency, actualFocusCost, baseFocusForEnchantment
    },
    actions: {
      fetchPrices
    }
  };
}
