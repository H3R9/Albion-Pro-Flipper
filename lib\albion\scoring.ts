export interface FlipScore {
  totalScore: number;      // 0-100
  profitScore: number;     // peso: 30%
  freshnessScore: number;  // peso: 20%
  roiScore: number;        // peso: 20%
  volumeScore: number;     // peso: 15%
  stabilityScore: number;  // peso: 15%
  recommendation: 'EXECUTE' | 'STRONG_BUY' | 'WATCH' | 'RISKY' | 'SKIP';
  reason: string;
  riskFactors: string[];
}

function generateReason(
  totalScore: number, 
  age: number, 
  roi: number, 
  volume: number,
  riskFactors: string[]
): string {
  if (totalScore >= 75) {
    if (age < 10 && volume >= 10) return "Oportunidade excelente! Dados frescos e volume alto.";
    if (age < 15) return "Ótimo lucro com dados recentes.";
    return "Lucro forte, mas monitore a idade dos dados.";
  }
  if (totalScore >= 60) {
    if (volume >= 10) return "Bom lucro com demanda consistente.";
    if (age < 15) return "Bom lucro recente, volume pode ser baixo.";
    return "Bom lucro, mas preste atenção no tempo e volume.";
  }
  if (totalScore >= 45) {
    if (roi < 10) return "Margem apertada — risco de mercado.";
    if (age >= 20) return "Dados velhos, confirme no jogo antes de comprar.";
    if (volume < 3) return "Volume muito baixo — pode demorar para vender.";
    return "Lucro modesto. Considere se vale a viagem.";
  }
  if (totalScore >= 30) {
    if (riskFactors.length > 0) return `Riscos: ${riskFactors.join(', ')}. Cautela.`;
    return "Margem baixa ou dados velhos. Avalie com cuidado.";
  }
  return "Margem ruim, dados velhos ou risco alto. Evite.";
}

function getRecommendation(score: number): FlipScore['recommendation'] {
  if (score >= 75) return 'EXECUTE';
  if (score >= 60) return 'STRONG_BUY';
  if (score >= 45) return 'WATCH';
  if (score >= 30) return 'RISKY';
  return 'SKIP';
}

/**
 * Scoring 2.0 — Multi-factor scoring with volume and stability analysis
 * 
 * Weights:
 *   - Profit: 30%      — logarithmic scale to avoid extreme item bias
 *   - Freshness: 20%   — exponential decay after 10 minutes  
 *   - ROI: 20%         — return on investment percentage
 *   - Volume: 15%      — Black Market demand (24h sales)
 *   - Stability: 15%   — tier/enchant risk + competition factor
 */
export function scoreFlip(flip: {
  netProfit: number;
  dataAgeMinutes: number;
  buyPrice: number;
  tier: string;
  enchantment: number;
  volume24h?: number;
  trendDirection?: 'up' | 'down' | 'stable';
}): FlipScore {
  const riskFactors: string[] = [];

  // ═══ PROFIT SCORE (30%) ═══
  // Logarithmic to avoid insanely expensive items dominating
  // 1K profit = ~0, 10K = ~30, 100K = ~60, 1M = ~90
  const profitScore = Math.min(100, Math.max(0, Math.log10(Math.max(1, flip.netProfit / 1000)) * 30));
  
  // ═══ FRESHNESS SCORE (20%) ═══
  // Exponential decay: 100% at 0min, ~61% at 10min, ~37% at 20min, ~22% at 30min
  const freshnessScore = Math.max(0, 100 * Math.exp(-0.05 * flip.dataAgeMinutes));
  if (flip.dataAgeMinutes > 30) riskFactors.push('Dados > 30min');
  
  // ═══ ROI SCORE (20%) ═══
  // Capped at ~33% ROI for max score
  const roi = flip.buyPrice > 0 ? (flip.netProfit / flip.buyPrice) * 100 : 0;
  const roiScore = Math.min(100, Math.max(0, roi * 3));
  if (roi < 5) riskFactors.push('ROI < 5%');
  
  // ═══ VOLUME SCORE (15%) — NEW ═══
  // Volume is critical: items with 0 sales in 24h are likely traps
  // 0 = 0pts, 1-3 = 30pts, 4-10 = 60pts, 11-20 = 85pts, 20+ = 100pts
  let volumeScore: number;
  const vol = flip.volume24h ?? 0;
  if (vol === 0) {
    volumeScore = 0;
    riskFactors.push('Sem vendas no BM (24h)');
  } else if (vol <= 3) {
    volumeScore = 30;
    riskFactors.push('Volume baixo (< 4/24h)');
  } else if (vol <= 10) {
    volumeScore = 60;
  } else if (vol <= 20) {
    volumeScore = 85;
  } else {
    volumeScore = 100;
  }
  
  // ═══ STABILITY SCORE (15%) — NEW (replaces old riskScore) ═══
  // Combines tier risk, enchant risk, and trend direction
  const tierNum = parseInt(flip.tier.replace('T', '')) || 4;
  let stabilityPenalty = 0;
  
  // Higher tiers = more competition
  if (tierNum >= 8) { stabilityPenalty += 25; riskFactors.push('T8: competição alta'); }
  else if (tierNum >= 7) { stabilityPenalty += 15; }
  
  // Higher enchantments = less demand, more risk
  if (flip.enchantment >= 3) { stabilityPenalty += 20; riskFactors.push('Encant .3+: nicho'); }
  else if (flip.enchantment >= 2) { stabilityPenalty += 10; }
  
  // Trend direction affects stability
  if (flip.trendDirection === 'down') { stabilityPenalty += 15; riskFactors.push('Preço em queda'); }
  else if (flip.trendDirection === 'up') { stabilityPenalty -= 10; }
  
  const stabilityScore = Math.max(0, Math.min(100, 100 - stabilityPenalty));
  
  // ═══ COMPOSITE SCORE ═══
  const totalScore = (
    profitScore * 0.30 +
    freshnessScore * 0.20 +
    roiScore * 0.20 +
    volumeScore * 0.15 +
    stabilityScore * 0.15
  );
  
  return {
    totalScore: Math.round(totalScore),
    profitScore: Math.round(profitScore),
    freshnessScore: Math.round(freshnessScore),
    roiScore: Math.round(roiScore),
    volumeScore: Math.round(volumeScore),
    stabilityScore: Math.round(stabilityScore),
    recommendation: getRecommendation(totalScore),
    reason: generateReason(totalScore, flip.dataAgeMinutes, roi, vol, riskFactors),
    riskFactors,
  };
}
