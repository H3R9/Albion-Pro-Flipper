export type LaborerType = 
  | 'WOOD' | 'STONE' | 'ORE' | 'FIBER' | 'HIDE' | 'FISHING' 
  | 'MERCENARY' 
  | 'WARRIOR' | 'HUNTER' | 'MAGE' | 'TOOLMAKER';

export interface LaborerData {
  id: LaborerType;
  name: string;
  category: 'GATHERING' | 'MERCENARY' | 'CRAFTING';
  hasSpecificTrophy: boolean;
  contractPrefix: string;
  journalPrefix: string;
  trophyPrefix: string | null;
  minTier: number;
  maxTier: number;
  trophyMinTier: number | null;
}

export const LABORERS: LaborerData[] = [
  {
    id: 'WOOD',
    name: 'Lenhador',
    category: 'GATHERING',
    hasSpecificTrophy: true,
    contractPrefix: 'LABOURER_CONTRACT_WOOD',
    journalPrefix: 'JOURNAL_WOOD',
    trophyPrefix: 'FURNITUREITEM_TROPHY_WOOD',
    minTier: 2,
    maxTier: 8,
    trophyMinTier: 2,
  },
  {
    id: 'STONE',
    name: 'Cortador de Pedra',
    category: 'GATHERING',
    hasSpecificTrophy: true,
    contractPrefix: 'LABOURER_CONTRACT_STONE',
    journalPrefix: 'JOURNAL_STONE',
    trophyPrefix: 'FURNITUREITEM_TROPHY_ROCK',
    minTier: 2,
    maxTier: 8,
    trophyMinTier: 2,
  },
  {
    id: 'ORE',
    name: 'Prospector',
    category: 'GATHERING',
    hasSpecificTrophy: true,
    contractPrefix: 'LABOURER_CONTRACT_ORE',
    journalPrefix: 'JOURNAL_ORE',
    trophyPrefix: 'FURNITUREITEM_TROPHY_ORE',
    minTier: 2,
    maxTier: 8,
    trophyMinTier: 2,
  },
  {
    id: 'FIBER',
    name: 'Ceifeiro',
    category: 'GATHERING',
    hasSpecificTrophy: true,
    contractPrefix: 'LABOURER_CONTRACT_FIBER',
    journalPrefix: 'JOURNAL_FIBER',
    trophyPrefix: 'FURNITUREITEM_TROPHY_FIBER',
    minTier: 2,
    maxTier: 8,
    trophyMinTier: 2,
  },
  {
    id: 'HIDE',
    name: 'Guarda-caça',
    category: 'GATHERING',
    hasSpecificTrophy: true,
    contractPrefix: 'LABOURER_CONTRACT_HIDE',
    journalPrefix: 'JOURNAL_HIDE',
    trophyPrefix: 'FURNITUREITEM_TROPHY_HIDE',
    minTier: 2,
    maxTier: 8,
    trophyMinTier: 2,
  },
  {
    id: 'FISHING',
    name: 'Pescador',
    category: 'GATHERING',
    hasSpecificTrophy: true, 
    contractPrefix: 'LABOURER_CONTRACT_FISHERMAN',
    journalPrefix: 'JOURNAL_FISHING',
    trophyPrefix: 'FURNITUREITEM_TROPHY_FISH',
    minTier: 2,
    maxTier: 8,
    trophyMinTier: 2,
  },
  {
    id: 'MERCENARY',
    name: 'Mercenário',
    category: 'MERCENARY',
    hasSpecificTrophy: true,
    contractPrefix: 'LABOURER_CONTRACT_MERCENARY',
    journalPrefix: 'JOURNAL_MERCENARY',
    trophyPrefix: 'FURNITUREITEM_TROPHY_MERCENARY',
    minTier: 2,
    maxTier: 8,
    trophyMinTier: 2,
  },
  {
    id: 'WARRIOR',
    name: 'Ferreiro',
    category: 'CRAFTING',
    hasSpecificTrophy: false,
    contractPrefix: 'LABOURER_CONTRACT_WARRIOR',
    journalPrefix: 'JOURNAL_WARRIOR',
    trophyPrefix: null,
    minTier: 2,
    maxTier: 8,
    trophyMinTier: null,
  },
  {
    id: 'HUNTER',
    name: 'Flecheiro',
    category: 'CRAFTING',
    hasSpecificTrophy: false,
    contractPrefix: 'LABOURER_CONTRACT_HUNTER',
    journalPrefix: 'JOURNAL_HUNTER',
    trophyPrefix: null,
    minTier: 2,
    maxTier: 8,
    trophyMinTier: null,
  },
  {
    id: 'MAGE',
    name: 'Imbuidor',
    category: 'CRAFTING',
    hasSpecificTrophy: false,
    contractPrefix: 'LABOURER_CONTRACT_MAGE',
    journalPrefix: 'JOURNAL_MAGE',
    trophyPrefix: null,
    minTier: 2,
    maxTier: 8,
    trophyMinTier: null,
  },
  {
    id: 'TOOLMAKER',
    name: 'Latoeiro',
    category: 'CRAFTING',
    hasSpecificTrophy: false,
    contractPrefix: 'LABOURER_CONTRACT_TOOLMAKER',
    journalPrefix: 'JOURNAL_TOOLMAKER',
    trophyPrefix: null,
    minTier: 2,
    maxTier: 8,
    trophyMinTier: null,
  }
];

// Funções Helpers para obter nomes (pois faltam no item-names.json)
export function getLaborerItemName(tier: number, itemId: string, workerName: string): string {
  if (itemId.includes('BED')) return `Cama (T${tier})`;
  if (itemId.includes('TABLE')) return `Mesa (T${tier})`;
  if (itemId.includes('CONTRACT')) return `Contrato de ${workerName} (T${tier})`;
  
  if (itemId.includes('TROPHY')) {
    if (itemId === 'T8_FURNITUREITEM_TROPHY_FISHING_BOSS') return `Troféu de Tubarão`;
    if (itemId.includes('FURNITUREITEM_TROPHY_GENERAL') || itemId === `T${tier}_FURNITUREITEM_TROPHY`) {
      return `Troféu Geral (T${tier})`;
    }
    return `Troféu de ${workerName} (T${tier})`;
  }
  
  if (itemId.includes('JOURNAL')) {
    if (itemId.includes('EMPTY')) return `Diário de ${workerName} Vazio (T${tier})`;
    if (itemId.includes('FULL')) return `Diário de ${workerName} Cheio (T${tier})`;
    return `Diário de ${workerName} (T${tier})`;
  }

  return itemId; // Fallback
}
