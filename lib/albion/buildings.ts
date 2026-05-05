export type ItemId = string;

export interface BuildingTier {
  tier: number;
  materials: Record<ItemId, number>;
}

export interface Building {
  id: string;
  name: string;
  category: 'Casas' | 'Militar' | 'Economia' | 'Agricultura';
  minTier: number;
  maxTier: number;
  tiers: BuildingTier[]; 
}

const houseMaterials = (tier: number): Record<string, number> => {
  const wood = 30 * Math.pow(2, tier - 2);
  const rock = 3 * Math.pow(2, tier - 2);
  return { "T1_WOOD": wood, "T1_ROCK": rock, [`T${tier}_STONEBLOCK`]: 180 };
};

const guildHallMaterials = (tier: number): Record<string, number> => {
  const wood = 150 * Math.pow(2, tier - 2);
  const rock = 15 * Math.pow(2, tier - 2);
  return { "T1_WOOD": wood, "T1_ROCK": rock, [`T${tier}_STONEBLOCK`]: 900 };
};

const craftStationMaterials = (tier: number): Record<string, number> => {
  const wood = tier === 2 ? 50 : 100 * Math.pow(2, tier - 3);
  const rock = tier === 2 ? 5 : 10 * Math.pow(2, tier - 3);
  return { "T1_WOOD": wood, "T1_ROCK": rock, [`T${tier}_STONEBLOCK`]: 300 };
};

const refineStationMaterials = (tier: number, isStonemason: boolean): Record<string, number> => {
  const wood = tier === 2 ? 25 : 50 * Math.pow(2, tier - 3);
  const rock = isStonemason ? (tier === 2 ? 25 : 50 * Math.pow(2, tier - 3)) : (tier === 2 ? 3 : 5 * Math.pow(2, tier - 3));
  const blockType = isStonemason ? `T${tier}_ROCK` : `T${tier}_STONEBLOCK`;
  return { "T1_WOOD": wood, "T1_ROCK": rock, [blockType]: 150 };
};

export const BUILDINGS: Building[] = [
  // Casas
  {
    id: 'guildhall', name: 'Salão de Guilda', category: 'Casas', minTier: 2, maxTier: 8,
    tiers: [2,3,4,5,6,7,8].map(t => ({ tier: t, materials: guildHallMaterials(t) }))
  },
  {
    id: 'house', name: 'Casa', category: 'Casas', minTier: 2, maxTier: 8,
    tiers: [2,3,4,5,6,7,8].map(t => ({ tier: t, materials: houseMaterials(t) }))
  },
  // Militar
  {
    id: 'warriorforge', name: 'Forja do Guerreiro', category: 'Militar', minTier: 2, maxTier: 8,
    tiers: [2,3,4,5,6,7,8].map(t => ({ tier: t, materials: craftStationMaterials(t) }))
  },
  {
    id: 'magetower', name: 'Torre do Mago', category: 'Militar', minTier: 2, maxTier: 8,
    tiers: [2,3,4,5,6,7,8].map(t => ({ tier: t, materials: craftStationMaterials(t) }))
  },
  {
    id: 'hunterlodge', name: 'Cabana do Caçador', category: 'Militar', minTier: 2, maxTier: 8,
    tiers: [2,3,4,5,6,7,8].map(t => ({ tier: t, materials: craftStationMaterials(t) }))
  },
  // Economia
  {
    id: 'lumbermill', name: 'Serraria', category: 'Economia', minTier: 2, maxTier: 8,
    tiers: [2,3,4,5,6,7,8].map(t => ({ tier: t, materials: refineStationMaterials(t, false) }))
  },
  {
    id: 'smelter', name: 'Fundição', category: 'Economia', minTier: 2, maxTier: 8,
    tiers: [2,3,4,5,6,7,8].map(t => ({ tier: t, materials: refineStationMaterials(t, false) }))
  },
  {
    id: 'tanner', name: 'Curtume', category: 'Economia', minTier: 2, maxTier: 8,
    tiers: [2,3,4,5,6,7,8].map(t => ({ tier: t, materials: refineStationMaterials(t, false) }))
  },
  {
    id: 'weaver', name: 'Tecelagem', category: 'Economia', minTier: 2, maxTier: 8,
    tiers: [2,3,4,5,6,7,8].map(t => ({ tier: t, materials: refineStationMaterials(t, false) }))
  },
  {
    id: 'toolmaker', name: 'Ferramenteiro', category: 'Economia', minTier: 2, maxTier: 8,
    tiers: [2,3,4,5,6,7,8].map(t => ({ tier: t, materials: craftStationMaterials(t) }))
  },
  {
    id: 'stonemason', name: 'Canteiro', category: 'Economia', minTier: 2, maxTier: 8,
    tiers: [2,3,4,5,6,7,8].map(t => ({ tier: t, materials: refineStationMaterials(t, true) }))
  },
  {
    id: 'repairstation', name: 'Oficina', category: 'Economia', minTier: 2, maxTier: 8,
    tiers: [2,3,4,5,6,7,8].map(t => ({ 
      tier: t, 
      materials: { "T1_WOOD": 90, "T1_ROCK": 90, [`T${t}_PLANKS`]: 90, [`T${t}_STONEBLOCK`]: 90 } 
    }))
  },
  // Agricultura
  {
    id: 'alchemist', name: 'Laboratório', category: 'Agricultura', minTier: 2, maxTier: 8,
    tiers: [2,3,4,5,6,7,8].map(t => ({ tier: t, materials: craftStationMaterials(t) }))
  },
  {
    id: 'cook', name: 'Cozinha', category: 'Agricultura', minTier: 2, maxTier: 8,
    tiers: [2,3,4,5,6,7,8].map(t => ({ tier: t, materials: craftStationMaterials(t) }))
  },
  {
    id: 'mill', name: 'Moinho', category: 'Agricultura', minTier: 1, maxTier: 1,
    tiers: [{ tier: 1, materials: { "T1_WOOD": 50, "T1_ROCK": 5, "T3_STONEBLOCK": 150 } }]
  },
  {
    id: 'butcher', name: 'Açougue', category: 'Agricultura', minTier: 2, maxTier: 8,
    tiers: [2,3,4,5,6,7,8].map(t => ({ 
      tier: t, 
      materials: t === 2 
        ? { "T1_WOOD": 75, "T1_ROCK": 75, "T2_PLANKS": 100, "T2_STONEBLOCK": 100 }
        : refineStationMaterials(t, false) 
    }))
  },
  {
    id: 'saddler', name: 'Selaria', category: 'Agricultura', minTier: 3, maxTier: 8,
    tiers: [3,4,5,6,7,8].map(t => ({ tier: t, materials: craftStationMaterials(t) }))
  },
  {
    id: 'farm', name: 'Fazenda', category: 'Agricultura', minTier: 1, maxTier: 1,
    tiers: [{ tier: 1, materials: { "T1_WOOD": 15, "T1_ROCK": 15 } }]
  },
  {
    id: 'herbgarden', name: 'Horta', category: 'Agricultura', minTier: 2, maxTier: 2,
    tiers: [{ tier: 2, materials: { "T1_WOOD": 25, "T1_ROCK": 25, "T2_PLANKS": 25, "T2_STONEBLOCK": 25 } }]
  },
  {
    id: 'pasture', name: 'Pasto', category: 'Agricultura', minTier: 3, maxTier: 3,
    tiers: [{ tier: 3, materials: { "T1_WOOD": 30, "T1_ROCK": 30, "T3_PLANKS": 30, "T3_STONEBLOCK": 30 } }]
  },
  {
    id: 'kennel', name: 'Canil', category: 'Agricultura', minTier: 6, maxTier: 6,
    tiers: [{ tier: 6, materials: { "T6_WOOD": 50, "T6_ROCK": 50, "T6_METALBAR": 10 } }]
  }
];

export function getBuildingMaterials(buildingId: string, currentTier: number, targetTier: number): Record<string, number> {
  const building = BUILDINGS.find(b => b.id === buildingId);
  if (!building) return {};

  const totalMaterials: Record<string, number> = {};

  // For a new building, currentTier is usually 0.
  // We sum the materials for every tier > currentTier and <= targetTier
  const fromTier = currentTier === 0 ? building.minTier : currentTier + 1;
  
  for (let t = fromTier; t <= targetTier; t++) {
    const tierParams = building.tiers.find(bt => bt.tier === t);
    if (!tierParams) continue;

    for (const [item, qty] of Object.entries(tierParams.materials)) {
      totalMaterials[item] = (totalMaterials[item] || 0) + qty;
    }
  }

  return totalMaterials;
}
