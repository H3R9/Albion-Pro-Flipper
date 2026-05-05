import type { MarketData } from '../types';

/** Black Market tax rate — 4% as of current patch */
export const BM_TAX_RATE = 0.04;

export function groupByItemQuality(data: MarketData[]) {
  const grouped: Record<string, Record<string, MarketData>> = {};
  for (const entry of data) {
    const key = `${entry.item_id}_${entry.quality}`;
    if (!grouped[key]) grouped[key] = {};
    grouped[key][entry.city] = entry;
  }
  return grouped;
}

export function freshnessScore(ageMinutes: number) {
  if (ageMinutes <= 5) return 1.0;
  if (ageMinutes <= 30) return 0.95;
  if (ageMinutes <= 60) return 0.85;
  if (ageMinutes <= 120) return 0.7;
  if (ageMinutes <= 360) return 0.4;
  return 0.1;
}
