import { MarketData } from './types';

export function sanitizeMarketData(data: unknown): MarketData[] {
  if (!Array.isArray(data)) return [];

  let invalidCount = 0;
  
  const sanitized = data
    .filter((v: any) => {
      if (!v || typeof v !== 'object') {
        invalidCount++;
        return false;
      }
      if (typeof v.item_id !== 'string') {
        invalidCount++;
        return false;
      }
      if (typeof v.city !== 'string') {
        invalidCount++;
        return false;
      }
      if (typeof v.quality !== 'number') {
        invalidCount++;
        return false;
      }
      
      // Basic number checks
      if (typeof v.sell_price_min !== 'number' || v.sell_price_min < 0) {
          invalidCount++;
          return false;
      }
      if (typeof v.buy_price_max !== 'number' || v.buy_price_max < 0) {
          invalidCount++;
          return false;
      }

      return true;
    })
    .map((v: any) => ({
      item_id: v.item_id,
      city: v.city, // Do not lowercase, the app relies on case-sensitive city names
      quality: v.quality,
      sell_price_min: v.sell_price_min,
      sell_price_min_date: v.sell_price_min_date,
      sell_price_max: v.sell_price_max,
      sell_price_max_date: v.sell_price_max_date,
      buy_price_min: v.buy_price_min,
      buy_price_min_date: v.buy_price_min_date,
      buy_price_max: v.buy_price_max,
      buy_price_max_date: v.buy_price_max_date
    })) as MarketData[];
    
  if (invalidCount > 0) {
    console.warn(`[Sanitize] Filtered out ${invalidCount} invalid market data entries.`);
  }

  return sanitized;
}
