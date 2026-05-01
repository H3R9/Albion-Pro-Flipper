/**
 * Outlier Detection for Albion Online Market Data
 * 
 * Detects artificially low/high prices that are likely:
 * - Manipulation (someone posted a single item at absurd price)
 * - Stale data (very old listing that was never bought)
 * - Buy order vs sell order confusion
 */

export interface OutlierResult {
  isOutlier: boolean;
  reason: string;
  confidence: number;  // 0-1
  expectedRange: { min: number; max: number } | null;
}

/**
 * Check if a price is an outlier given a set of comparison prices from other cities.
 * Uses the IQR (Interquartile Range) method — standard statistical outlier detection.
 */
export function detectPriceOutlier(
  price: number,
  comparisonPrices: number[],
  options?: { multiplier?: number }
): OutlierResult {
  // Need at least 3 comparison prices for meaningful analysis
  const validPrices = comparisonPrices.filter(p => p > 0);
  
  if (validPrices.length < 3) {
    return { isOutlier: false, reason: 'Dados insuficientes para análise', confidence: 0, expectedRange: null };
  }

  const sorted = [...validPrices].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  const multiplier = options?.multiplier ?? 1.5;
  
  const lowerBound = q1 - iqr * multiplier;
  const upperBound = q3 + iqr * multiplier;
  
  const median = sorted[Math.floor(sorted.length / 2)];
  const deviation = Math.abs(price - median) / (median || 1);
  
  if (price < lowerBound) {
    return {
      isOutlier: true,
      reason: `Preço ${Math.round(deviation * 100)}% abaixo da mediana — possível manipulação ou dado obsoleto`,
      confidence: Math.min(1, deviation),
      expectedRange: { min: Math.round(lowerBound), max: Math.round(upperBound) }
    };
  }
  
  if (price > upperBound) {
    return {
      isOutlier: true,
      reason: `Preço ${Math.round(deviation * 100)}% acima da mediana — pode ser listing antigo`,
      confidence: Math.min(1, deviation),
      expectedRange: { min: Math.round(lowerBound), max: Math.round(upperBound) }
    };
  }
  
  return {
    isOutlier: false,
    reason: 'Preço dentro do intervalo esperado',
    confidence: 0,
    expectedRange: { min: Math.round(lowerBound), max: Math.round(upperBound) }
  };
}

/**
 * Quick check: is this price suspiciously low compared to the sell price?
 * Useful for detecting "too good to be true" flips.
 */
export function isSuspiciouslyProfitable(buyPrice: number, sellPrice: number, margin: number): OutlierResult {
  // More than 200% margin is almost certainly wrong data
  if (margin > 200) {
    return {
      isOutlier: true,
      reason: `Margem de ${margin.toFixed(0)}% é irrealisticamente alta — provável dado obsoleto`,
      confidence: 0.95,
      expectedRange: null
    };
  }
  
  // Very high tier items selling for less than their craft cost base
  if (buyPrice < 100 && sellPrice > 50000) {
    return {
      isOutlier: true,
      reason: 'Preço de compra absurdamente baixo — possível order vencida',
      confidence: 0.9,
      expectedRange: null
    };
  }
  
  return { isOutlier: false, reason: '', confidence: 0, expectedRange: null };
}
