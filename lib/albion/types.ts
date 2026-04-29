import type { FlipScore } from './scoring';

export interface ScanSettings {
  maxAge: number;
  minProfit: number;
  minMargin: number;
}

export interface ScanFilters {
  city: 'all' | 'Caerleon' | 'Martlock' | 'Thetford' | 'Fort Sterling' | 'Lymhurst' | 'Bridgewatch' | 'Brecilien';
  quality: 'all' | 1 | 2 | 3 | 4 | 5;
}

export interface EnchantRequired {
  id: string;
  amount: number;
  level: number;
  price: number;
  city: string;
  method: 'direct' | 'buyorder';
  dateStr: string;
  directPrice: number;
  directCity: string;
  directDate: string;
  orderPrice: number;
  orderCity: string;
  orderDate: string;
}

export interface EnchantScenario {
  id: string;
  startLvl: number;
  currentBaseId: string;
  bestBaseCost: number;
  bestBaseCity: string | null;
  bestBaseMethod: string | null;
  bestBaseAge: number;
  bestBaseDateStr: string;
  totalRuneCost: number;
  totalRuneSetupFee: number;
  runesRequired: EnchantRequired[];
  runeMethod: 'direct' | 'buyorder' | 'mixed' | 'none';
  totalCost: number;
}

export interface TradeResult {
  itemId: string;
  quality: number;
  sourceCity: string;
  destCity: string;
  buyPrice: number;
  sellPrice: number;
  profit: number;
  margin: number;
  tax: number;
  cityAge: number;
  bmAge: number;
  worstAge: number;
  freshness: number;
  score: number;
  tradeType: string;
  buyDate: string;
  sellDate: string;
  riskCost: number;
  adjustedProfit: number;
  routeZone: string;
  volume24h?: number;
  flipScore?: FlipScore;

  baseId?: string;
  runesRequired?: EnchantRequired[];
  baseCity?: string | null;
  baseCost?: number;
  baseMethod?: string | null;
  baseDateStr?: string;
  runeMethod?: string;
  scenarioUsed?: string;
  quantity?: number;

  originalOrderPrice?: number;
  setupFee?: number;
  scenarios?: EnchantScenario[];
  
  trendData?: unknown;
  isNew?: boolean;
}

export interface EnchantMaterial {
  directPrice: number;
  orderPrice: number;
  directCity: string;
  orderCity: string;
  directDate: string;
  orderDate: string;
  directAge: number;
  orderAge: number;
}

export interface ScanProgress {
  current: number;
  total: number;
  text: string;
}

export type ScanTab = 'dashboard' | 'mats' | 'enchant' | 'planner' | 'reports' | 'calc' | 'black' | 'royal' | 'buyorders';

// Added this to export MarketData as well, since it's closely related and avoids duplicate type definitions later.
export interface MarketData {
  item_id: string;
  city: string;
  quality: number;
  sell_price_min: number;
  sell_price_min_date: string;
  sell_price_max: number;
  sell_price_max_date: string;
  buy_price_min: number;
  buy_price_min_date: string;
  buy_price_max: number;
  buy_price_max_date: string;
}
