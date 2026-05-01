import type { TradeResult } from '../types';

export function applyDemandScore(results: TradeResult[]) {
  results.forEach(r => {
    if (r.volume24h !== undefined) {
      r.score = r.profit * r.freshness * Math.log10(r.volume24h + 2);
    }
  });
  return results.sort((a, b) => b.score - a.score);
}
