import { getItemDisplayName } from '../items';

export interface RefiningParams {
  tier: number;
  enchantment: number;
  materialId: string; // 'WOOD', 'ORE', etc.
  isStone: boolean;
  refinedIdBase: string; // 'PLANKS', 'METALBAR', etc.
  bonusLocation: boolean;
  hideoutBonus: number; // 0 to 50
  useFocus: boolean;
  stationTax: number;
  hasPremium: boolean;
  city: string; // e.g. Fort Sterling
}

export interface RefiningItemIds {
  rawId: string;
  subRefinedId: string;
  refinedId: string;
}

export interface RefiningQuantities {
  rawQty: number;
  subQty: number;
  outputQty: number;
}

/**
 * 1. Normalization: Get exact render IDs and API IDs
 */
export const getRawId = (tier: number, enchantment: number, materialId: string) => {
  return `T${tier}_${materialId}${enchantment > 0 ? '_LEVEL' + enchantment + '@' + enchantment : ''}`;
};

export const getRefinedId = (tier: number, enchantment: number, refinedIdBase: string, isStone: boolean) => {
  if (isStone) return `T${tier}_${refinedIdBase}`; // Stone blocks don't hold enchantments in ID
  return `T${tier}_${refinedIdBase}${enchantment > 0 ? '_LEVEL' + enchantment + '@' + enchantment : ''}`;
};

export const getRenderId = (id: string) => Math.max(0, id.indexOf('_LEVEL')) > -1 ? id.replace(/_LEVEL\d+/g, '') : id;

/**
 * 2. Get the recipe required items
 */
export const getRecipeDetails = (tier: number, enchantment: number, isStone: boolean, materialId: string, refinedIdBase: string): { ids: RefiningItemIds, qtys: RefiningQuantities } => {
  const isT4Magic = tier === 4 && enchantment > 0;
  const subTier = tier - 1;
  const subEnchantment = (isT4Magic || isStone || subTier < 4) ? 0 : enchantment;

  const rawId = getRawId(tier, enchantment, materialId);
  const subRefinedId = subTier >= 2 ? getRefinedId(subTier, subEnchantment, refinedIdBase, isStone) : '';
  const refinedId = getRefinedId(tier, enchantment, refinedIdBase, isStone);

  const rawQtyMap: Record<number, number> = { 2: 2, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 7 };
  const rawQty = rawQtyMap[tier] || 2;
  const subQty = tier >= 3 ? 1 : 0;
  const outputMultiplier = isStone ? Math.pow(2, enchantment) : 1;
  const outputQty = 1 * outputMultiplier;

  return {
    ids: { rawId, subRefinedId, refinedId },
    qtys: { rawQty, subQty, outputQty }
  };
};

/**
 * 3. Calculations for RRR and Costs
 */
export const calculateRRR = (bonusLocation: boolean, hideoutBonus: number, useFocus: boolean): number => {
  let lpbTarget = 18; // Default off
  if (bonusLocation) lpbTarget = 58; 
  if (hideoutBonus > 0 && hideoutBonus <= 100) lpbTarget = hideoutBonus;
  if (useFocus) lpbTarget += 59; // Focus adds static 5900 points (+59% LPB)
  
  return 1 - (1 / (1 + (lpbTarget / 100)));
};

export const calculateItemValue = (tier: number, enchantment: number): number => {
  const ITEM_VALUES: Record<number, number> = { 2: 1, 3: 2, 4: 8, 5: 16, 6: 32, 7: 64, 8: 128 };
  return (ITEM_VALUES[tier] || 1) * Math.pow(2, enchantment);
};

export const calculateProfit = (
  rawPrice: number, subPrice: number, refinedPrice: number,
  qtys: RefiningQuantities, rrr: number, itemValue: number,
  stationTax: number, hasPremium: boolean, transportCost: number = 0
) => {
  const materialsCostGross = (qtys.rawQty * rawPrice) + (qtys.subQty * subPrice);
  const effectivelyConsumedMaterialsCost = materialsCostGross * (1 - rrr);

  // Tax fee: (StationTax / 100) * ItemValue * 0.1125
  const usageFee = (stationTax / 100) * itemValue * 0.1125;
  const totalTransportCost = transportCost * qtys.outputQty;
  const totalCost = effectivelyConsumedMaterialsCost + usageFee + totalTransportCost;

  const marketTaxFactor = hasPremium ? 0.065 : 0.105;
  const grossRevenue = (refinedPrice * qtys.outputQty);
  const netRevenue = grossRevenue * (1 - marketTaxFactor);

  const profit = netRevenue - totalCost;
  const margin = totalCost > 0 ? (profit / totalCost) * 100 : 0;

  return {
    materialsCostGross, effectivelyConsumedMaterialsCost, usageFee, totalTransportCost, totalCost,
    grossRevenue, netRevenue, profit, margin, marketTaxFactor
  };
};

export const formatItemName = (id: string) => {
  return getItemDisplayName(id);
};
