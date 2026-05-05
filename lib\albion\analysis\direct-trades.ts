import { calculateMargin, getAgeMinutes, ROYAL_CITIES, ROUTE_INFO } from '../utils';
import type { ScanSettings, ScanFilters, MarketData, TradeResult } from '../types';
import { groupByItemQuality, freshnessScore, BM_TAX_RATE } from './shared';

export function analyzeVsBM(data: MarketData[], settings: ScanSettings, filters: ScanFilters, allowedCities: string[]): TradeResult[] {
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

      const tax = Math.floor(sellPrice * BM_TAX_RATE);
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
        itemId: cityData.item_id, quality: cityData.quality,
        sourceCity: cityName, destCity: 'Black Market',
        buyPrice, sellPrice, profit, margin, tax,
        cityAge, bmAge, worstAge, freshness, score,
        tradeType: 'direct',
        buyDate: cityData.sell_price_min_date,
        sellDate: bm.buy_price_max_date,
        riskCost, adjustedProfit, routeZone: route.zone,
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
