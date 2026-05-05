import { ExtractedItem, MaterialStock, getEnchantCost } from './constants';
import { MarketData } from '@/lib/albion/types';

export interface ActionPlan {
  item: ExtractedItem;
  action: 'SELL_FLAT' | 'ENCHANT';
  targetEnchantment: number;
  currentPrice: number;
  targetPrice: number;
  materialSteps: { 
    type: 'runa' | 'alma' | 'reliquia', 
    amount: number, 
    unitCost: number, 
    stockUsed: number, 
    toBuy: number 
  }[];
  totalMaterialCostReal: number; // Cost evaluated using market prices
  profitDelta: number; // Additional profit from enchanting
  totalExpectedRevenue: number;
}

export interface ShoppingListItem {
  type: 'runa' | 'alma' | 'reliquia';
  tier: number;
  amountNeeded: number;
  unitCost: number;
  totalCost: number;
}

export interface AnalysisSummary {
  plans: ActionPlan[];
  shoppingList: ShoppingListItem[];
  totalExpectedRevenue: number;
  totalShoppingCost: number;
  netProfit: number;
}

function getBestItemPrice(itemId: string, prices: MarketData[]): number {
  const itemPrices = prices.filter(p => p.item_id === itemId && p.sell_price_min > 0);
  if (itemPrices.length === 0) return 0;
  // Get max sell_price_min across cities (optimistic return)
  return Math.max(...itemPrices.map(p => p.sell_price_min));
}

function getCheapestMaterialPrice(tier: number, type: 'runa' | 'alma' | 'reliquia', prices: MarketData[]): number {
  const matMap: Record<string, string> = {
    'runa': `T${tier}_RUNE`,
    'alma': `T${tier}_SOUL`,
    'reliquia': `T${tier}_RELIC`
  };
  const matId = matMap[type];
  const matPrices = prices.filter(p => p.item_id === matId && p.sell_price_min > 0);
  if (matPrices.length === 0) return 999999; // Prevents buying if not available
  
  // Exclude Black Market maybe? No, just get absolute cheapest
  return Math.min(...matPrices.map(p => p.sell_price_min));
}

export function analyzeLoot(items: ExtractedItem[], prices: MarketData[], currentStock: MaterialStock): AnalysisSummary {
  const plans: ActionPlan[] = [];
  
  // Clone stock so we can deduct
  const stockCopy: MaterialStock = {
    runas: { ...currentStock.runas },
    almas: { ...currentStock.almas },
    reliquias: { ...currentStock.reliquias },
  };

  const shoppingListMap: Record<string, ShoppingListItem> = {};

  for (const item of items) {
    if (['RUNA', 'ALMA', 'RELIQUIA', 'OUTRO'].includes(item.category) || !item.exactId) {
      continue;
    }

    const baseId = item.exactId.split('@')[0];
    const currentPrice = getBestItemPrice(item.enchantment === 0 ? baseId : `${baseId}@${item.enchantment}`, prices);
    
    let bestTargetEnchant = item.enchantment;
    let maxProfitDelta = 0;
    let bestMaterialSteps: ActionPlan['materialSteps'] = [];

    // Evaluate all possible enchantments above current
    for (let target = item.enchantment + 1; target <= 3; target++) {
      const targetId = `${baseId}@${target}`;
      const targetPrice = getBestItemPrice(targetId, prices);
      
      let totalMaterialCost = 0;
      const stepsToTarget: ActionPlan['materialSteps'] = [];
      
      const costPerStep = getEnchantCost(item.tier, item.name);

      for (let step = item.enchantment; step < target; step++) {
        const matType = step === 0 ? 'runa' : step === 1 ? 'alma' : 'reliquia';
        const matPrice = getCheapestMaterialPrice(item.tier, matType, prices);
        totalMaterialCost += (costPerStep * matPrice);
        
        stepsToTarget.push({
          type: matType,
          amount: costPerStep,
          unitCost: matPrice,
          stockUsed: 0,
          toBuy: 0
        });
      }

      const profitDelta = (targetPrice - currentPrice) - totalMaterialCost;
      
      if (profitDelta > maxProfitDelta) {
        maxProfitDelta = profitDelta;
        bestTargetEnchant = target;
        bestMaterialSteps = stepsToTarget;
      }
    }

    if (maxProfitDelta > 0 && bestTargetEnchant > item.enchantment) {
      // We should enchant this item
      // Process stock deduction for this *winning* route (multiply by quantity of item)
      
      const finalSteps: ActionPlan['materialSteps'] = [];
      const qty = item.quantity;
      
      for (const step of bestMaterialSteps) {
        const totalAmountNeeded = step.amount * qty;
        let stockAvailable = 0;
        
        if (step.type === 'runa') {
          stockAvailable = stockCopy.runas[item.tier] || 0;
          const used = Math.min(stockAvailable, totalAmountNeeded);
          stockCopy.runas[item.tier] -= used;
          const toBuy = totalAmountNeeded - used;
          finalSteps.push({ ...step, amount: totalAmountNeeded, stockUsed: used, toBuy });
          
          if (toBuy > 0) {
            const key = `runa_${item.tier}`;
            if (!shoppingListMap[key]) shoppingListMap[key] = { type: 'runa', tier: item.tier, amountNeeded: 0, unitCost: step.unitCost, totalCost: 0 };
            shoppingListMap[key].amountNeeded += toBuy;
            shoppingListMap[key].totalCost += (toBuy * step.unitCost);
          }
        } else if (step.type === 'alma') {
          stockAvailable = stockCopy.almas[item.tier] || 0;
          const used = Math.min(stockAvailable, totalAmountNeeded);
          stockCopy.almas[item.tier] -= used;
          const toBuy = totalAmountNeeded - used;
          finalSteps.push({ ...step, amount: totalAmountNeeded, stockUsed: used, toBuy });

          if (toBuy > 0) {
            const key = `alma_${item.tier}`;
            if (!shoppingListMap[key]) shoppingListMap[key] = { type: 'alma', tier: item.tier, amountNeeded: 0, unitCost: step.unitCost, totalCost: 0 };
            shoppingListMap[key].amountNeeded += toBuy;
            shoppingListMap[key].totalCost += (toBuy * step.unitCost);
          }
        } else if (step.type === 'reliquia') {
          stockAvailable = stockCopy.reliquias[item.tier] || 0;
          const used = Math.min(stockAvailable, totalAmountNeeded);
          stockCopy.reliquias[item.tier] -= used;
          const toBuy = totalAmountNeeded - used;
          finalSteps.push({ ...step, amount: totalAmountNeeded, stockUsed: used, toBuy });

          if (toBuy > 0) {
            const key = `reliquia_${item.tier}`;
            if (!shoppingListMap[key]) shoppingListMap[key] = { type: 'reliquia', tier: item.tier, amountNeeded: 0, unitCost: step.unitCost, totalCost: 0 };
            shoppingListMap[key].amountNeeded += toBuy;
            shoppingListMap[key].totalCost += (toBuy * step.unitCost);
          }
        }
      }

      const targetPrice = getBestItemPrice(`${baseId}@${bestTargetEnchant}`, prices);
      
      plans.push({
        item,
        action: 'ENCHANT',
        targetEnchantment: bestTargetEnchant,
        currentPrice: currentPrice * qty,
        targetPrice: targetPrice * qty,
        materialSteps: finalSteps,
        totalMaterialCostReal: bestMaterialSteps.reduce((acc, step) => acc + (step.amount * step.unitCost * qty), 0),
        profitDelta: maxProfitDelta * qty,
        totalExpectedRevenue: targetPrice * qty
      });
    } else {
      plans.push({
        item,
        action: 'SELL_FLAT',
        targetEnchantment: item.enchantment,
        currentPrice: currentPrice * item.quantity,
        targetPrice: currentPrice * item.quantity,
        materialSteps: [],
        totalMaterialCostReal: 0,
        profitDelta: 0,
        totalExpectedRevenue: currentPrice * item.quantity
      });
    }
  }

  const shoppingList = Object.values(shoppingListMap);
  const totalExpectedRevenue = plans.reduce((sum, p) => sum + p.totalExpectedRevenue, 0);
  const totalShoppingCost = shoppingList.reduce((sum, i) => sum + i.totalCost, 0);
  const netProfit = totalExpectedRevenue - totalShoppingCost;

  return {
    plans,
    shoppingList,
    totalExpectedRevenue,
    totalShoppingCost,
    netProfit
  };
}
