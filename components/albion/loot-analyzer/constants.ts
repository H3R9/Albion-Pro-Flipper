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

export function getEnchantCost(category: ItemCategory, itemName: string): number {
  if (category === 'ELMO' || category === 'BOTAS' || category === 'CAPA' || category === 'MAO_SECUNDARIA') return 96;
  if (category === 'ARMADURA' || category === 'BOLSA') return 192;
  if (category === 'ARMA_1H') return 288;
  if (category === 'ARMA_2H') return 384;
  
  // Fallbacks by keywords just in case category is OUTRO
  const lower = itemName.toLowerCase();
  
  if (lower.includes('elmo') || lower.includes('capote') || lower.includes('capuz') || 
      lower.includes('botas') || lower.includes('sapatos') || lower.includes('sandálias') || 
      lower.includes('capa') || lower.includes('escudo') || lower.includes('tomo') || lower.includes('tocha') || lower.includes('chifre')) {
    return 96;
  }
  
  if (lower.includes('armadura') || lower.includes('casaco') || lower.includes('robe') || lower.includes('bolsa') || lower.includes('sacola')) {
    return 192;
  }
  
  if (isTwoHanded(itemName)) {
    return 384;
  }
  
  // Default to 1H weapon if not matched above
  return 288;
}

export type ItemCategory = 'ARMA_2H' | 'ARMA_1H' | 'MAO_SECUNDARIA' | 'ARMADURA' | 'ELMO' | 'BOTAS' | 'LUVAS' | 'BOLSA' | 'CAPA' | 'RUNA' | 'ALMA' | 'RELIQUIA' | 'OUTRO';

export interface ExtractedItem {
  name: string;
  quantity: number;
  exactId: string | null;
  tier: number;
  enchantment: number;
  category: ItemCategory;
  quality?: number;
}

export interface MaterialStock {
  runas: Record<number, number>;
  almas: Record<number, number>;
  reliquias: Record<number, number>;
}
