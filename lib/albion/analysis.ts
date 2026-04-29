import {
  calculateMargin,
  getAgeMinutes,
  parseItemId,
  ROYAL_CITIES,
  getEnchantMaterialId,
  getEnchantResourceCount,
  ROUTE_INFO,
} from './utils';

import {
  ScanSettings,
  ScanFilters,
  MarketData,
  TradeResult,
  EnchantScenario,
  EnchantMaterial
} from './types';

function groupByItemQuality(data: MarketData[]) {
  const grouped: Record<string, Record<string, MarketData>> = {};
  for (const entry of data) {
    const key = `${entry.item_id}_${entry.quality}`;
    if (!grouped[key]) grouped[key] = {};
    grouped[key][entry.city] = entry;
  }
  return grouped;
}

function freshnessScore(ageMinutes: number) {
  if (ageMinutes <= 5) return 1.0;
  if (ageMinutes <= 30) return 0.95;
  if (ageMinutes <= 60) return 0.85;
  if (ageMinutes <= 120) return 0.7;
  if (ageMinutes <= 360) return 0.4;
  return 0.1;
}

function analyzeVsBM(data: MarketData[], settings: ScanSettings, filters: ScanFilters, allowedCities: string[]): TradeResult[] {
  const grouped = groupByItemQuality(data);
  const results: TradeResult[] = [];
  const maxAge = settings.maxAge || 120;

  for (const [, cities] of Object.entries(grouped)) {
    const bm = cities['Black Market'];
    if (!bm) continue;

    if (!bm.buy_price_max || bm.buy_price_max <= 0) continue;

    const bmAge = getAgeMinutes(bm.buy_price_max_date);
    if (bmAge > maxAge) continue;

    for (const [cityName, cityData] of Object.entries(cities)) {
      if (cityName === 'Black Market') continue;
      if (!allowedCities.includes(cityName)) continue;
      if (filters.city !== 'all' && cityName !== filters.city) continue;
      if (filters.quality !== 'all' && cityData.quality != filters.quality) continue;

      if (!cityData.sell_price_min || cityData.sell_price_min <= 0) continue;

      const cityAge = getAgeMinutes(cityData.sell_price_min_date);
      if (cityAge > maxAge) continue;

      const buyPrice = cityData.sell_price_min;
      const sellPrice = bm.buy_price_max;

      if (sellPrice <= buyPrice) continue;

      const tax = Math.floor(sellPrice * 0.045);
      const profit = sellPrice - buyPrice - tax;
      const margin = calculateMargin(buyPrice, profit);

      if (profit < (settings.minProfit || 0)) continue;
      if (margin < (settings.minMargin || 0)) continue;

      const worstAge = Math.max(cityAge, bmAge);
      const freshness = freshnessScore(worstAge);
      const score = profit * freshness;

      const route = ROUTE_INFO[cityName] || ROUTE_INFO['Caerleon'];
      const riskCost = Math.floor(buyPrice * route.riskPct);
      const adjustedProfit = profit - riskCost;

      results.push({
        itemId: cityData.item_id,
        quality: cityData.quality,
        sourceCity: cityName,
        destCity: 'Black Market',
        buyPrice,
        sellPrice,
        profit,
        margin,
        tax,
        cityAge,
        bmAge,
        worstAge,
        freshness,
        score,
        tradeType: 'direct',
        buyDate: cityData.sell_price_min_date,
        sellDate: bm.buy_price_max_date,
        riskCost,
        adjustedProfit,
        routeZone: route.zone,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

export function analyzeBlackTrades(data: MarketData[], settings: ScanSettings, filters: ScanFilters) {
  return analyzeVsBM(data, settings, filters, ['Caerleon']);
}

export function analyzeRoyalBM(data: MarketData[], settings: ScanSettings, filters: ScanFilters) {
  return analyzeVsBM(data, settings, filters, ROYAL_CITIES);
}

export function analyzeEnchanting(data: MarketData[], settings: ScanSettings, filters: ScanFilters, globalEnchantMaterials: MarketData[]) {
  const grouped = groupByItemQuality(data);
  const results: TradeResult[] = [];
  const maxAge = settings.maxAge || 120;

  const runePrices: Record<string, { directPrice: number; orderPrice: number; directCity: string; orderCity: string; directDate: string; orderDate: string; directAge: number; orderAge: number }> = {};
  for (const mat of globalEnchantMaterials) {
    if (!runePrices[mat.item_id]) {
      runePrices[mat.item_id] = { directPrice: Infinity, orderPrice: Infinity, directCity: '', orderCity: '', directDate: '', orderDate: '', directAge: Infinity, orderAge: Infinity };
    }
    
    // Use 7 days max age for materials because prices are stable
    const matMaxAge = 10080;

    const directAge = getAgeMinutes(mat.sell_price_min_date);
    if (mat.sell_price_min > 0 && directAge <= matMaxAge) {
      if (mat.sell_price_min < runePrices[mat.item_id].directPrice) {
        runePrices[mat.item_id].directPrice = mat.sell_price_min;
        runePrices[mat.item_id].directCity = mat.city;
        runePrices[mat.item_id].directDate = mat.sell_price_min_date;
        runePrices[mat.item_id].directAge = directAge;
      }
    }
    
    const orderAge = getAgeMinutes(mat.buy_price_max_date);
    if (mat.buy_price_max > 0 && orderAge <= matMaxAge) {
      const price = mat.buy_price_max + 1;
      if (price < runePrices[mat.item_id].orderPrice) {
        runePrices[mat.item_id].orderPrice = price;
        runePrices[mat.item_id].orderCity = mat.city;
        runePrices[mat.item_id].orderDate = mat.buy_price_max_date;
        runePrices[mat.item_id].orderAge = orderAge;
      }
    }
  }

  let filteredByProfit = 0;
  let filteredByRune = 0;
  let filteredByBaseCost = 0;
  let filteredByMaxAge = 0;

  for (const [key, cities] of Object.entries(grouped)) {
    const lastUnderscore = key.lastIndexOf('_');
    const itemIdStr = key.substring(0, lastUnderscore);

    const match = itemIdStr.match(/@(\d+)$/);
    if (!match) continue;
    
    const enchantLevel = parseInt(match[1]);
    if (enchantLevel < 1 || enchantLevel > 3) continue;
    
    const bm = cities['Black Market'];
    if (!bm || !bm.buy_price_max || bm.buy_price_max <= 0) continue;
    const bmAge = getAgeMinutes(bm.buy_price_max_date);
    if (bmAge > maxAge) {
      filteredByMaxAge++;
      continue;
    }

    const sellPrice = bm.buy_price_max;
    const p = parseItemId(itemIdStr);
    const runeAmount = getEnchantResourceCount(itemIdStr);
    
    const baseItemName = itemIdStr.replace(/@\d+$/, '');
    const quality = cities[Object.keys(cities)[0]]?.quality || 1;

    let bestScenario: EnchantScenario | null = null;
    let bestScenarioCost = Infinity;
    const allScenarios: EnchantScenario[] = [];

    for (let startLvl = 0; startLvl <= enchantLevel; startLvl++) {
      const currentBaseId = startLvl === 0 ? baseItemName : `${baseItemName}@${startLvl}`;
      const baseKey = `${currentBaseId}_${quality}`;
      const baseCities = grouped[baseKey];
      
      if (!baseCities) continue;

      let bestBaseCost = Infinity;
      let bestBaseCity: string | null = null;
      let bestBaseMethod: string | null = null;
      let bestBaseAge = 0;
      let bestBaseDateStr = '';

      for (const [cityName, cityData] of Object.entries(baseCities)) {
        if (!ROYAL_CITIES.includes(cityName) && cityName !== 'Caerleon') continue;
        if (filters.city && filters.city !== 'all' && cityName !== filters.city) continue;
        
        if (cityData.sell_price_min > 0) {
          const age = getAgeMinutes(cityData.sell_price_min_date);
          if (age <= maxAge && cityData.sell_price_min < bestBaseCost) {
            bestBaseCost = cityData.sell_price_min;
            bestBaseCity = cityName;
            bestBaseMethod = 'direct';
            bestBaseAge = age;
            bestBaseDateStr = cityData.sell_price_min_date;
          }
        }
        
        if (cityData.buy_price_max > 0) {
          // Ignorar buy orders irrealistas (menos de 40% do sell price) ou itens muito específicos como capas
          const isFactionCape = currentBaseId.includes('CAPEITEM') && currentBaseId !== 'CAPEITEM'; // Qualquer capa q não seja a genérica
          const isUnrealistic = cityData.buy_price_max < 300 || (cityData.sell_price_min > 0 && cityData.buy_price_max < cityData.sell_price_min * 0.40) || isFactionCape;
          if (!isUnrealistic) {
            const age = getAgeMinutes(cityData.buy_price_max_date);
            const boCost = cityData.buy_price_max + 1 + Math.floor((cityData.buy_price_max + 1) * 0.025);
            if (age <= maxAge && boCost < bestBaseCost) {
              bestBaseCost = boCost;
              bestBaseCity = cityName;
              bestBaseMethod = 'buyorder';
              bestBaseAge = age;
              bestBaseDateStr = cityData.buy_price_max_date;
            }
          }
        }
      }

      if (bestBaseCost === Infinity) continue;

      let totalRuneCost = 0;
      let totalRuneSetupFee = 0;
      let missingRune = false;
      let hasDirectRune = false;
      let hasOrderRune = false;
      const runesRequired = [];

      for (let i = startLvl + 1; i <= enchantLevel; i++) {
        const rId = getEnchantMaterialId(p.tier, i);
        if (!rId || !runePrices[rId]) {
          missingRune = true;
          break;
        }
        
        const rData = runePrices[rId];
        const directTotalCost = rData.directPrice === Infinity ? Infinity : rData.directPrice * runeAmount;
        const orderSubtotal = rData.orderPrice === Infinity ? Infinity : rData.orderPrice * runeAmount;
        const orderSetupFee = orderSubtotal === Infinity ? 0 : Math.floor(orderSubtotal * 0.025);
        const orderTotalCost = orderSubtotal === Infinity ? Infinity : orderSubtotal + orderSetupFee;
        
        if (directTotalCost === Infinity && orderTotalCost === Infinity) {
          missingRune = true;
          break;
        }
        
        if (directTotalCost <= orderTotalCost) {
          totalRuneCost += directTotalCost;
          hasDirectRune = true;
        } else {
          totalRuneCost += orderSubtotal;
          totalRuneSetupFee += orderSetupFee;
          hasOrderRune = true;
        }

        runesRequired.push({
          id: rId,
          amount: runeAmount,
          level: i,
          price: directTotalCost <= orderTotalCost ? rData.directPrice : rData.orderPrice,
          city: directTotalCost <= orderTotalCost ? rData.directCity : rData.orderCity,
          method: (directTotalCost <= orderTotalCost ? 'direct' : 'buyorder') as 'direct' | 'buyorder',
          dateStr: directTotalCost <= orderTotalCost ? rData.directDate : rData.orderDate,
          directPrice: rData.directPrice,
          directCity: rData.directCity,
          directDate: rData.directDate,
          orderPrice: rData.orderPrice,
          orderCity: rData.orderCity,
          orderDate: rData.orderDate,
        });
      }
      
      if (missingRune) {
        filteredByRune++;
        continue;
      }

      const totalCost = bestBaseCost + totalRuneCost + totalRuneSetupFee;

      const scenario = {
        id: String.fromCharCode(65 + startLvl),
        startLvl,
        currentBaseId,
        bestBaseCost,
        bestBaseCity,
        bestBaseMethod,
        bestBaseAge,
        bestBaseDateStr,
        totalRuneCost,
        totalRuneSetupFee,
        runesRequired,
        runeMethod: ((hasDirectRune && hasOrderRune) ? 'mixed' : (hasDirectRune ? 'direct' : (runesRequired.length ? 'buyorder' : 'none'))) as 'direct' | 'buyorder' | 'mixed' | 'none',
        totalCost
      };

      allScenarios.push(scenario);

      if (totalCost < bestScenarioCost) {
        bestScenarioCost = totalCost;
        bestScenario = scenario;
      }
    }

    if (allScenarios.length === 0) {
      filteredByBaseCost++;
    }
    
    if (!bestScenario) continue;

    // Remove strict profitability filter allowing slightly lossy scenarios
    // so the InventoryPlanner can evaluate using the player's stock.
    // Extremely negative flips (losses > 80% of flat cost) are ignored.
    if (sellPrice <= bestScenario.bestBaseCost * 0.2) {
      filteredByProfit++;
      continue;
    }

    const bmTax = Math.floor(sellPrice * 0.04);
    const profit = sellPrice - bestScenarioCost - bmTax;
    
    // Completely drop the settings.minProfit strict check here.
    // Allow everything to be scored.

    const worstAge = Math.max(bestScenario.bestBaseAge, bmAge);
    const freshness = freshnessScore(worstAge);
    const score = profit * freshness;

    const route = ROUTE_INFO[bestScenario.bestBaseCity || 'Caerleon'] || ROUTE_INFO['Caerleon'];
    const riskCost = Math.floor(bestScenarioCost * route.riskPct);
    const adjustedProfit = profit - riskCost;

    results.push({
      itemId: itemIdStr,
      quality: quality,
      baseId: bestScenario.currentBaseId,
      runesRequired: bestScenario.runesRequired,
      baseCity: bestScenario.bestBaseCity,
      baseCost: bestScenario.bestBaseCost,
      baseMethod: bestScenario.bestBaseMethod,
      baseDateStr: bestScenario.bestBaseDateStr,
      buyPrice: bestScenarioCost, 
      sourceCity: 'Multi Cidades', 
      destCity: 'Black Market',
      sellPrice: sellPrice,
      profit: profit,
      margin: calculateMargin(bestScenarioCost, profit),
      tax: bmTax + bestScenario.totalRuneSetupFee, 
      cityAge: bestScenario.bestBaseAge,
      bmAge: bmAge,
      worstAge: worstAge,
      freshness: freshness,
      score: score,
      tradeType: 'enchant',
      buyDate: new Date().toISOString(), 
      sellDate: bm.buy_price_max_date,
      runeMethod: bestScenario.runeMethod,
      riskCost,
      adjustedProfit,
      routeZone: route.zone,
      scenarioUsed: bestScenario.id,
      scenarios: allScenarios,
    } satisfies TradeResult);
  }

  if (results.length === 0) {
    results.push({
      itemId: 'DEBUG_INFO',
      quality: 1,
      baseId: `BM:${Object.keys(grouped).length} / MaxAge:${filteredByMaxAge} / BaseCost:${filteredByBaseCost} / Runes:${filteredByRune} / Profit:${filteredByProfit}`,
      runesRequired: [],
      baseCity: 'Debug',
      baseCost: 0,
      baseMethod: 'direct',
      baseDateStr: '',
      buyPrice: 0, 
      sourceCity: 'Multi Cidades', 
      destCity: 'Black Market',
      sellPrice: 0,
      profit: 0,
      margin: 0,
      tax: 0, 
      cityAge: 0,
      bmAge: 0,
      worstAge: 0,
      freshness: 0,
      score: Infinity,
      tradeType: 'enchant',
      buyDate: new Date().toISOString(), 
      sellDate: new Date().toISOString(),
      runeMethod: 'none',
      riskCost: 0,
      adjustedProfit: 0,
      routeZone: 'Safe',
      scenarioUsed: 'A',
      scenarios: [],
    } satisfies TradeResult);
  }

  return results.sort((a, b) => b.score - a.score);
}

export function applyDemandScore(results: TradeResult[]) {
  results.forEach(r => {
    if (r.volume24h !== undefined) {
      r.score = r.profit * r.freshness * Math.log10(r.volume24h + 2);
    }
  });
  return results.sort((a, b) => b.score - a.score);
}

export function analyzeBuyOrderTrades(data: MarketData[], settings: ScanSettings, filters: ScanFilters) {
  const grouped = groupByItemQuality(data);
  const results: TradeResult[] = [];
  const maxAge = settings.maxAge || 120;

  for (const [key, cities] of Object.entries(grouped)) {
    const bm = cities['Black Market'];
    if (!bm || !bm.buy_price_max || bm.buy_price_max <= 0) continue;
    const bmAge = getAgeMinutes(bm.buy_price_max_date);
    if (bmAge > maxAge) continue;

    const sellPrice = bm.buy_price_max;

    for (const [cityName, cityData] of Object.entries(cities)) {
      if (cityName === 'Black Market') continue;
      if (!ROYAL_CITIES.includes(cityName) && cityName !== 'Caerleon') continue;
      if (filters.city !== 'all' && cityName !== filters.city) continue;
      if (filters.quality !== 'all' && cityData.quality != filters.quality) continue;

      if (!cityData.buy_price_max || cityData.buy_price_max <= 0) continue;
      
      const isFactionCape = cityData.item_id.includes('CAPEITEM') && !cityData.item_id.startsWith('T') && cityData.item_id !== 'CAPEITEM'; 
      const isUnrealistic = cityData.buy_price_max < 300 || (cityData.sell_price_min > 0 && cityData.buy_price_max < cityData.sell_price_min * 0.40) || (cityData.item_id.includes('CAPEITEM') && cityData.item_id !== 'CAPEITEM');
      if (isUnrealistic) continue;

      const orderPrice = cityData.buy_price_max + 1;
      const orderAge = getAgeMinutes(cityData.buy_price_max_date);
      if (orderAge > maxAge) continue;

      const setupFee = Math.floor(orderPrice * 0.025);
      const totalBuyCost = orderPrice + setupFee;

      const bmTax = Math.floor(sellPrice * 0.045);
      const profit = sellPrice - totalBuyCost - bmTax;

      if (profit < (settings.minProfit || 0)) continue;
      const margin = calculateMargin(totalBuyCost, profit);
      if (margin < (settings.minMargin || 0)) continue;

      const worstAge = Math.max(orderAge, bmAge);
      const freshness = freshnessScore(worstAge);
      const score = profit * freshness;

      const route = ROUTE_INFO[cityName] || ROUTE_INFO['Caerleon'];
      const riskCost = Math.floor(totalBuyCost * route.riskPct);
      const adjustedProfit = profit - riskCost;

      results.push({
        itemId: cityData.item_id,
        quality: cityData.quality,
        sourceCity: cityName,
        destCity: 'Black Market',
        buyPrice: totalBuyCost,
        originalOrderPrice: orderPrice,
        setupFee: setupFee,
        sellPrice: sellPrice,
        profit: profit,
        adjustedProfit: adjustedProfit,
        margin: margin,
        tax: bmTax,
        cityAge: orderAge,
        bmAge: bmAge,
        worstAge: worstAge,
        freshness: freshness,
        score: score,
        tradeType: 'buyorder',
        buyDate: cityData.buy_price_max_date,
        sellDate: bm.buy_price_max_date,
        riskCost,
        routeZone: route.zone,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
