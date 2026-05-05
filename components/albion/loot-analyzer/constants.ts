export const ENCHANT_COST: Record<number, { oneHand: number; twoHand: number }> = {
  4: { oneHand: 64,  twoHand: 128 },
  5: { oneHand: 96,  twoHand: 192 },
  6: { oneHand: 192, twoHand: 384 },
  7: { oneHand: 256, twoHand: 512 },
  8: { oneHand: 320, twoHand: 640 },
};

const TWO_HAND_KEYWORDS = [
  'arco longo', 'grande arco', 'cajado', 'báculo', 'foice', 'alabarda',
  'machado duplo', 'espadão', 'clava pesada', 'maça pesada', 'martelo duplo',
  'lança de batalha', 'adaga dupla', 'foice negra', 'cajado de batalha',
  'great', 'staff', 'bow', 'pike', 'scythe', 'halberd', 'claymore',
];

export function isTwoHanded(itemName: string): boolean {
  const lower = itemName.toLowerCase();
  return TWO_HAND_KEYWORDS.some(kw => lower.includes(kw));
}

export function getEnchantCost(tier: number, itemName: string): number {
  const costs = ENCHANT_COST[tier] ?? { oneHand: 192, twoHand: 384 };
  return isTwoHanded(itemName) ? costs.twoHand : costs.oneHand;
}

export type ItemCategory = 'ARMA_2H' | 'ARMA_1H' | 'ARMADURA' | 'ELMO' | 'BOTAS' | 'LUVAS' | 'BOLSA' | 'CAPA' | 'RUNA' | 'ALMA' | 'RELIQUIA' | 'OUTRO';

export interface ExtractedItem {
  name: string;
  quantity: number;
  exactId: string | null;
  tier: number;
  enchantment: number;
  category: ItemCategory;
}

export interface MaterialStock {
  runas: Record<number, number>;
  almas: Record<number, number>;
  reliquias: Record<number, number>;
}
