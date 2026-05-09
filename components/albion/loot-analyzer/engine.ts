import { ExtractedItem, MaterialStock, getEnchantCost } from './constants';
import { MarketData } from '@/lib/albion/types';

export interface ActionPlan {
  item: ExtractedItem;
  action: 'SELL_FLAT' | 'ENCHANT' | 'KEEP_IN_CHEST';
  targetEnchantment: number;
  currentPrice: number;
  targetPrice: number;
  targetPriceDate?: string;
  targetPriceCity?: string;
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

function getBestItemPriceResult(itemId: string, quality: number, prices: MarketData[]): { price: number, date: string, city: string } {
  let itemPrices = prices.filter(p => p.item_id === itemId && p.sell_price_min > 0 && p.quality === quality);
  // Se não encontrar o preço daquela qualidade exata (excepcional ex.), cai pro padrão (qualidade 1)
  if (itemPrices.length === 0) {
    itemPrices = prices.filter(p => p.item_id === itemId && p.sell_price_min > 0 && p.quality === 1);
  }
  // Se ainda não tiver qualidade 1, pega a primeira q tiver (às vezes a API agrega em quality 0 ou sem)
  if (itemPrices.length === 0) {
    itemPrices = prices.filter(p => p.item_id === itemId && p.sell_price_min > 0);
  }
  
  if (itemPrices.length === 0) return { price: 0, date: '', city: '' };
  
  const best = itemPrices.reduce((prev, current) => (prev.sell_price_min > current.sell_price_min) ? prev : current);
  return { price: best.sell_price_min, date: best.sell_price_min_date, city: best.city };
}

function getBestItemPrice(itemId: string, quality: number, prices: MarketData[]): number {
  return getBestItemPriceResult(itemId, quality, prices).price;
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

export function analyzeLoot(items: ExtractedItem[], prices: MarketData[], currentStock: MaterialStock, budget: number = Infinity): AnalysisSummary {
  const plans: ActionPlan[] = [];
  
  const stockCopy: MaterialStock = {
    runas: { ...currentStock.runas },
    almas: { ...currentStock.almas },
    reliquias: { ...currentStock.reliquias },
  };

  const shoppingListMap: Record<string, ShoppingListItem> = {};

  interface Candidate {
    itemRef: ExtractedItem;
    baseId: string;
    currentEnchant: number;
    currentPrice: number;
    targetEnchant: number;
    targetPrice: number;
    targetPriceDate?: string;
    targetPriceCity?: string;
    profitDelta: number;
    materialSteps: { type: 'runa' | 'alma' | 'reliquia', amount: number, unitCost: number }[];
    totalMaterialCostReal: number;
    roi: number;
  }

  const allCandidates: Candidate[] = [];
  const nonCandidates: ExtractedItem[] = [];

  for (const item of items) {
    if (['RUNA', 'ALMA', 'RELIQUIA', 'OUTRO'].includes(item.category) || !item.exactId) {
      continue;
    }

    const baseId = item.exactId.split('@')[0];
    const itemQuality = item.quality || 1;
    const currentPrice = getBestItemPrice(item.enchantment === 0 ? baseId : `${baseId}@${item.enchantment}`, itemQuality, prices);
    
    let bestTargetEnchant = item.enchantment;
    let maxProfitDelta = 0;
    let bestMaterialSteps: Candidate['materialSteps'] = [];

    for (let target = item.enchantment + 1; target <= 3; target++) {
      const targetId = `${baseId}@${target}`;
      const targetPrice = getBestItemPrice(targetId, itemQuality, prices);
      
      let totalMaterialCost = 0;
      const stepsToTarget: Candidate['materialSteps'] = [];
      const costPerStep = getEnchantCost(item.category, item.name);

      for (let step = item.enchantment; step < target; step++) {
        const matType = step === 0 ? 'runa' : step === 1 ? 'alma' : 'reliquia';
        const matPrice = getCheapestMaterialPrice(item.tier, matType, prices);
        totalMaterialCost += (costPerStep * matPrice);
        stepsToTarget.push({ type: matType, amount: costPerStep, unitCost: matPrice });
      }

      const profitDelta = (targetPrice - currentPrice) - totalMaterialCost;
      
      if (profitDelta > maxProfitDelta) {
        maxProfitDelta = profitDelta;
        bestTargetEnchant = target;
        bestMaterialSteps = stepsToTarget;
      }
    }

    if (maxProfitDelta > 0 && bestTargetEnchant > item.enchantment) {
      const totalCostReal = bestMaterialSteps.reduce((acc, step) => acc + step.amount * step.unitCost, 0);
      const roi = totalCostReal > 0 ? maxProfitDelta / totalCostReal : Infinity;
      
      const targetPriceResult = getBestItemPriceResult(`${baseId}@${bestTargetEnchant}`, itemQuality, prices);
      const c: Candidate = {
        itemRef: item, baseId, currentEnchant: item.enchantment, currentPrice,
        targetEnchant: bestTargetEnchant, targetPrice: targetPriceResult.price,
        targetPriceDate: targetPriceResult.date, targetPriceCity: targetPriceResult.city,
        profitDelta: maxProfitDelta, materialSteps: bestMaterialSteps, totalMaterialCostReal: totalCostReal, roi
      };
      
      for (let i = 0; i < item.quantity; i++) {
        allCandidates.push(c);
      }
    } else {
      nonCandidates.push(item);
    }
  }

  allCandidates.sort((a, b) => b.roi - a.roi);

  let remainingBudget = budget;
  
  interface ItemAllocation {
    candidate: Candidate;
    enchantedQty: number;
    aggregatedSteps: { type: 'runa' | 'alma' | 'reliquia', amount: number, unitCost: number, stockUsed: number, toBuy: number }[];
  }
  
  const allocations = new Map<ExtractedItem, ItemAllocation>();

  for (const c of allCandidates) {
    let alloc = allocations.get(c.itemRef);
    if (!alloc) {
      alloc = {
        candidate: c,
        enchantedQty: 0,
        aggregatedSteps: c.materialSteps.map(s => ({ ...s, amount: 0, stockUsed: 0, toBuy: 0 }))
      };
      allocations.set(c.itemRef, alloc);
    }

    let cashNeeded = 0;
    const tempStock = {
      runas: { ...stockCopy.runas },
      almas: { ...stockCopy.almas },
      reliquias: { ...stockCopy.reliquias },
    };

    const tempBought: Record<string, number> = {};

    for (const step of c.materialSteps) {
      let stockAvailable = 0;
      if (step.type === 'runa') {
        stockAvailable = tempStock.runas[c.itemRef.tier] || 0;
        const used = Math.min(stockAvailable, step.amount);
        tempStock.runas[c.itemRef.tier] -= used;
        const toBuy = step.amount - used;
        cashNeeded += toBuy * step.unitCost;
        tempBought[`runa_${c.itemRef.tier}`] = toBuy;
      } else if (step.type === 'alma') {
        stockAvailable = tempStock.almas[c.itemRef.tier] || 0;
        const used = Math.min(stockAvailable, step.amount);
        tempStock.almas[c.itemRef.tier] -= used;
        const toBuy = step.amount - used;
        cashNeeded += toBuy * step.unitCost;
        tempBought[`alma_${c.itemRef.tier}`] = toBuy;
      } else if (step.type === 'reliquia') {
        stockAvailable = tempStock.reliquias[c.itemRef.tier] || 0;
        const used = Math.min(stockAvailable, step.amount);
        tempStock.reliquias[c.itemRef.tier] -= used;
        const toBuy = step.amount - used;
        cashNeeded += toBuy * step.unitCost;
        tempBought[`reliquia_${c.itemRef.tier}`] = toBuy;
      }
    }

    if (cashNeeded <= remainingBudget) {
      remainingBudget -= cashNeeded;
      alloc.enchantedQty++;
      
      // Officially deduct and record
      for (let i = 0; i < c.materialSteps.length; i++) {
        const step = c.materialSteps[i];
        let stockAvailable = 0;
        let toBuy = 0;
        let used = 0;
        
        if (step.type === 'runa') {
          stockAvailable = stockCopy.runas[c.itemRef.tier] || 0;
          used = Math.min(stockAvailable, step.amount);
          stockCopy.runas[c.itemRef.tier] -= used;
          toBuy = step.amount - used;
          if (toBuy > 0) {
            const key = `runa_${c.itemRef.tier}`;
            if (!shoppingListMap[key]) shoppingListMap[key] = { type: 'runa', tier: c.itemRef.tier, amountNeeded: 0, unitCost: step.unitCost, totalCost: 0 };
            shoppingListMap[key].amountNeeded += toBuy;
            shoppingListMap[key].totalCost += (toBuy * step.unitCost);
          }
        } else if (step.type === 'alma') {
          stockAvailable = stockCopy.almas[c.itemRef.tier] || 0;
          used = Math.min(stockAvailable, step.amount);
          stockCopy.almas[c.itemRef.tier] -= used;
          toBuy = step.amount - used;
          if (toBuy > 0) {
            const key = `alma_${c.itemRef.tier}`;
            if (!shoppingListMap[key]) shoppingListMap[key] = { type: 'alma', tier: c.itemRef.tier, amountNeeded: 0, unitCost: step.unitCost, totalCost: 0 };
            shoppingListMap[key].amountNeeded += toBuy;
            shoppingListMap[key].totalCost += (toBuy * step.unitCost);
          }
        } else if (step.type === 'reliquia') {
          stockAvailable = stockCopy.reliquias[c.itemRef.tier] || 0;
          used = Math.min(stockAvailable, step.amount);
          stockCopy.reliquias[c.itemRef.tier] -= used;
          toBuy = step.amount - used;
          if (toBuy > 0) {
            const key = `reliquia_${c.itemRef.tier}`;
            if (!shoppingListMap[key]) shoppingListMap[key] = { type: 'reliquia', tier: c.itemRef.tier, amountNeeded: 0, unitCost: step.unitCost, totalCost: 0 };
            shoppingListMap[key].amountNeeded += toBuy;
            shoppingListMap[key].totalCost += (toBuy * step.unitCost);
          }
        }
        
        alloc.aggregatedSteps[i].amount += step.amount;
        alloc.aggregatedSteps[i].stockUsed += used;
        alloc.aggregatedSteps[i].toBuy += toBuy;
      }
    }
  }

  // Construct plans
  for (const item of items) {
    if (['RUNA', 'ALMA', 'RELIQUIA', 'OUTRO'].includes(item.category) || !item.exactId) {
      continue;
    }

    const alloc = allocations.get(item);
    
    if (alloc && alloc.enchantedQty > 0) {
      const qty = alloc.enchantedQty;
      const c = alloc.candidate;
      
      plans.push({
        item: { ...item, quantity: qty },
        action: 'ENCHANT',
        targetEnchantment: c.targetEnchant,
        currentPrice: c.currentPrice * qty,
        targetPrice: c.targetPrice * qty,
        targetPriceDate: c.targetPriceDate,
        targetPriceCity: c.targetPriceCity,
        materialSteps: alloc.aggregatedSteps,
        totalMaterialCostReal: alloc.aggregatedSteps.reduce((acc, step) => acc + (step.amount * step.unitCost), 0),
        profitDelta: c.profitDelta * qty,
        totalExpectedRevenue: c.targetPrice * qty
      });
      
      const missingQty = item.quantity - qty;
      if (missingQty > 0) {
        plans.push({
          item: { ...item, quantity: missingQty },
          action: 'KEEP_IN_CHEST',
          targetEnchantment: c.targetEnchant,
          currentPrice: c.currentPrice * missingQty,
          targetPrice: c.targetPrice * missingQty,
          targetPriceDate: c.targetPriceDate,
          targetPriceCity: c.targetPriceCity,
          materialSteps: [],
          totalMaterialCostReal: 0,
          profitDelta: c.profitDelta * missingQty, // potential
          totalExpectedRevenue: c.currentPrice * missingQty
        });
      }
    } else if (alloc) {
      // Was candidate but qty=0 (no budget)
      const c = alloc.candidate;
      plans.push({
        item,
        action: 'KEEP_IN_CHEST',
        targetEnchantment: c.targetEnchant,
        currentPrice: c.currentPrice * item.quantity,
        targetPrice: c.targetPrice * item.quantity,
        targetPriceDate: c.targetPriceDate,
        targetPriceCity: c.targetPriceCity,
        materialSteps: [],
        totalMaterialCostReal: 0,
        profitDelta: c.profitDelta * item.quantity, // potential
        totalExpectedRevenue: c.currentPrice * item.quantity
      });
    } else {
      // Was nonCandidate (not profitable to enchant)
      const baseId = item.exactId.split('@')[0];
      const itemQuality = item.quality || 1;
      const currentPriceResult = getBestItemPriceResult(item.enchantment === 0 ? baseId : `${baseId}@${item.enchantment}`, itemQuality, prices);
      
      plans.push({
        item,
        action: 'SELL_FLAT',
        targetEnchantment: item.enchantment,
        currentPrice: currentPriceResult.price * item.quantity,
        targetPrice: currentPriceResult.price * item.quantity,
        targetPriceDate: currentPriceResult.date,
        targetPriceCity: currentPriceResult.city,
        materialSteps: [],
        totalMaterialCostReal: 0,
        profitDelta: 0,
        totalExpectedRevenue: currentPriceResult.price * item.quantity
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
