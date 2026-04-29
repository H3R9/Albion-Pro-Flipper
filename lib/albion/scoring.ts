export interface FlipScore {
  totalScore: number;      // 0-100
  profitScore: number;     // peso: 35%
  freshnessScore: number;  // peso: 25%
  roiScore: number;        // peso: 25%
  riskScore: number;       // peso: 15%
  recommendation: 'EXECUTE' | 'WATCH' | 'SKIP';
  reason: string;
}

function generateReason(totalScore: number, age: number, roi: number): string {
  if (totalScore >= 65) {
    if (age < 15) return "Ótimo lucro recente.";
    return "Bom lucro, mas preste atenção no tempo.";
  }
  if (totalScore >= 40) {
    if (roi < 10) return "Margem baixa, risco de mercado.";
    if (age >= 15) return "Dados pouco frescos, observe.";
    return "Lucro modesto.";
  }
  return "Margem ruim ou dados muito velhos. Evite.";
}

export function scoreFlip(flip: {
  netProfit: number;
  dataAgeMinutes: number;
  buyPrice: number;
  tier: string;
  enchantment: number;
}): FlipScore {
  // Profit Score: logarítmico para não favorecer absurdamente itens caríssimos
  // We use max(1) to avoid log of negative or zero
  const profitScore = Math.min(100, Math.max(0, Math.log10(Math.max(1, flip.netProfit / 1000)) * 30));
  
  // Freshness Score: decai exponencialmente após 10 minutos
  const freshnessScore = Math.max(0, 100 * Math.exp(-0.05 * flip.dataAgeMinutes));
  
  // ROI Score
  const roi = flip.buyPrice > 0 ? (flip.netProfit / flip.buyPrice) * 100 : 0;
  const roiScore = Math.min(100, Math.max(0, roi * 3));
  
  // Risk Score: T8 enchanted = maior risco de competição
  const tierNum = parseInt(flip.tier.replace('T', '')) || 4;
  const riskPenalty = (tierNum >= 7 ? 20 : 0) + (flip.enchantment >= 2 ? 15 : 0);
  const riskScore = Math.max(0, 100 - riskPenalty);
  
  const totalScore = (
    profitScore * 0.35 +
    freshnessScore * 0.25 +
    roiScore * 0.25 +
    riskScore * 0.15
  );
  
  return {
    totalScore: Math.round(totalScore),
    profitScore, freshnessScore, roiScore, riskScore,
    recommendation: totalScore >= 65 ? 'EXECUTE' : totalScore >= 40 ? 'WATCH' : 'SKIP',
    reason: generateReason(totalScore, flip.dataAgeMinutes, roi)
  };
}
