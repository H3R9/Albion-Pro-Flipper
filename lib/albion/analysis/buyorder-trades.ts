import { calculateMargin, getAgeMinutes, ROYAL_CITIES, ROUTE_INFO } from '../utils';
import type { ScanSettings, ScanFilters, MarketData, TradeResult } from '../types';
import { groupByItemQuality, freshnessScore, BM_TAX_RATE } from './shared';

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

      const isUnrealistic = cityData.buy_price_max < 300 || 
        (cityData.sell_price_min > 0 && cityData.buy_price_max < cityData.sell_price_min * 0.40) || 
        (cityData.item_id.includes('CAPEITEM') && cityData.item_id !== 'CAPEITEM');
      if (isUnrealistic) continue;

      const orderPrice = cityData.buy_price_max + 1;
      const orderAge = getAgeMinutes(cityData.buy_price_max_date);
      if (orderAge > maxAge) continue;

      const setupFee = Math.floor(orderPrice * 0.025);
      const totalBuyCost = orderPrice + setupFee;
      const bmTax = Math.floor(sellPrice * BM_TAX_RATE);
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
        itemId: cityData.item_id, quality: cityData.quality,
        sourceCity: cityName, destCity: 'Black Market',
        buyPrice: totalBuyCost, originalOrderPrice: orderPrice, setupFee,
        sellPrice, profit, adjustedProfit, margin, tax: bmTax,
        cityAge: orderAge, bmAge, worstAge, freshness, score,
        tradeType: 'buyorder',
        buyDate: cityData.buy_price_max_date,
        sellDate: bm.buy_price_max_date,
        riskCost, routeZone: route.zone,
      });
    }
  }
  return results.sort((a, b) => b.score - a.score);
}
