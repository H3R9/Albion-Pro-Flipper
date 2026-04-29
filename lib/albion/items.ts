import ITEM_NAMES from './item-names.json';

export const CATEGORIES: Record<string, string> = {
  weapons_sword: 'Espadas',
  weapons_axe: 'Machados',
  weapons_mace: 'Maças',
  weapons_hammer: 'Martelos',
  weapons_spear: 'Lanças',
  weapons_dagger: 'Adagas',
  weapons_staff: 'Bastões',
  weapons_bow: 'Arcos',
  weapons_crossbow: 'Bestas',
  weapons_fire: 'Cajados de Fogo',
  weapons_frost: 'Cajados de Gelo',
  weapons_arcane: 'Cajados Arcanos',
  weapons_holy: 'Cajados Sagrados',
  weapons_nature: 'Cajados de Natureza',
  weapons_curse: 'Cajados de Maldição',
  weapons_knuckles: 'Manoplas',
  weapons_other: 'Outras Armas',
  armor_plate_head: 'Elmo de Placa',
  armor_plate_body: 'Peitoral de Placa',
  armor_plate_feet: 'Botas de Placa',
  armor_leather_head: 'Capuz de Couro',
  armor_leather_body: 'Jaqueta de Couro',
  armor_leather_feet: 'Sapatos de Couro',
  armor_cloth_head: 'Capuz de Tecido',
  armor_cloth_body: 'Robe de Tecido',
  armor_cloth_feet: 'Sandálias de Tecido',
  armor_gatherer_head: 'Capuz de Coletor',
  armor_gatherer_body: 'Traje de Coletor',
  armor_gatherer_feet: 'Botas de Coletor',
  tools: 'Ferramentas de Coleta',
  offhand: 'Mão Secundária',
  capes: 'Capas',
  bags: 'Bolsas',
  mounts: 'Montarias',
  consumables: 'Consumíveis',
};

export const PARENT_CATEGORIES: Record<string, string[]> = {
  Armas: [
    'weapons_sword',
    'weapons_axe',
    'weapons_mace',
    'weapons_hammer',
    'weapons_spear',
    'weapons_dagger',
    'weapons_staff',
    'weapons_bow',
    'weapons_crossbow',
    'weapons_fire',
    'weapons_frost',
    'weapons_arcane',
    'weapons_holy',
    'weapons_nature',
    'weapons_curse',
    'weapons_knuckles',
    'weapons_other',
  ],
  'Armadura de Capacete': ['armor_plate_head', 'armor_leather_head', 'armor_cloth_head', 'armor_gatherer_head'],
  'Armadura de Peitoral': ['armor_plate_body', 'armor_leather_body', 'armor_cloth_body', 'armor_gatherer_body'],
  'Armadura de Calçado': ['armor_plate_feet', 'armor_leather_feet', 'armor_cloth_feet', 'armor_gatherer_feet'],
  'Mão Secundária': ['offhand'],
  Capas: ['capes'],
  Bolsas: ['bags'],
  Montaria: ['mounts'],
  Ferramentas: ['tools'],
  Consumível: ['consumables'],
};

function categorize(itemId: string): string {
  const base = itemId.replace(/^T\d+_/, '').split('@')[0];
  if (base.match(/(SWORD|CLAYMORE|DUALSWORD|SCIMITAR|BROADSWORD)/)) return 'weapons_sword';
  if (base.match(/(AXE|HALBERD|CLEAVER|SCYTHE|BATTLEAXE)/) && base.match(/^(MAIN_|2H_)/)) return 'weapons_axe';
  if (base.match(/(MACE|FLAIL|ROCKMACE|INCUBUSMACE|MORNINGSTAR)/)) return 'weapons_mace';
  if (base.match(/(HAMMER|POLEHAMMER|RAM_|GROVEKEEPER)/)) return 'weapons_hammer';
  if (base.match(/(SPEAR|PIKE|GLAIVE|TRIDENT|LANCE|PITCHFORK|DAYBREAKER|HARPOON)/)) return 'weapons_spear';
  if (base.match(/(DAGGER|CLAW|SICKLE|KATAR|RAPIER|GAUNTLET|IRONGAUNTLETS|BLOODLETTER|DEATHGIVERS)/)) return 'weapons_dagger';
  if (base.match(/(QUARTERSTAFF|IRONCLADEDSTAFF|DOUBLEBLADEDSTAFF|COMBATSTAFF|TWINSCYTHE|ROCKSTAFF|GRAILSEEKER)/)) return 'weapons_staff';
  if (base.match(/BOW/) && base.match(/^2H_/)) return 'weapons_bow';
  if (base.match(/CROSSBOW/)) return 'weapons_crossbow';
  if (base.match(/(FIRE|INFERNO|WILDFIRE|BRIMSTONE|DAWNSONG)/) && base.match(/(STAFF|RING)/)) return 'weapons_fire';
  if (base.match(/(FROST|GLACIAL|ICE|HOARFROST|CHILLHOWL)/)) return 'weapons_frost';
  if (base.match(/(ARCANE|ENIGMATIC|WITCHWORK|OCCULT|EVENSONG)/)) return 'weapons_arcane';
  if (base.match(/(HOLY|DIVINE|LIFETOUCH|FALLEN|REDEMPTION)/)) return 'weapons_holy';
  if (base.match(/(NATURE|WILD|BLIGHT|DRUIDIC|RAMPANT)/)) return 'weapons_nature';
  if (base.match(/(CURSED|DEMONIC|SKULLORB|SHADOW|LIFECURSE)/) || base.match(/CURSE/)) return 'weapons_curse';
  if (base.match(/KNUCKLE/)) return 'weapons_knuckles';
  
  if (base.startsWith('HEAD_PLATE')) return 'armor_plate_head';
  if (base.startsWith('ARMOR_PLATE')) return 'armor_plate_body';
  if (base.startsWith('SHOES_PLATE')) return 'armor_plate_feet';
  
  if (base.startsWith('HEAD_LEATHER')) return 'armor_leather_head';
  if (base.startsWith('ARMOR_LEATHER')) return 'armor_leather_body';
  if (base.startsWith('SHOES_LEATHER')) return 'armor_leather_feet';
  
  if (base.startsWith('HEAD_CLOTH')) return 'armor_cloth_head';
  if (base.startsWith('ARMOR_CLOTH')) return 'armor_cloth_body';
  if (base.startsWith('SHOES_CLOTH')) return 'armor_cloth_feet';

  if (base.startsWith('HEAD_GATHERER')) return 'armor_gatherer_head';
  if (base.startsWith('ARMOR_GATHERER')) return 'armor_gatherer_body';
  if (base.startsWith('SHOES_GATHERER')) return 'armor_gatherer_feet';

  if (base.startsWith('OFF_')) return 'offhand';
  if (base.startsWith('CAPE')) return 'capes';
  if (base.startsWith('BAG')) return 'bags';
  if (base.startsWith('MOUNT_')) return 'mounts';
  if (base.match(/^(POTION_|MEAL_)/)) return 'consumables';
  if (base.match(/^2H_TOOL_/)) return 'tools';

  if (base.match(/^(MAIN_|2H_)/)) return 'weapons_other';
  
  return 'other';
}

const ALL_ITEM_IDS = Object.keys(ITEM_NAMES) as string[];

export function getAllItemIds(): string[] {
  return ALL_ITEM_IDS;
}

export function getItemDisplayName(itemId: string): string {
  const names = ITEM_NAMES as Record<string, string>;
  if (names[itemId]) return names[itemId];
  const base = itemId.split('@')[0];
  if (names[base]) return names[base];
  return base.replace(/^T\d+_/, '').replace(/_/g, ' ');
}

export function getItemFullName(itemId: string): string {
  return getItemDisplayName(itemId);
}

export function getItemsByCategory(categoryKey: string): string[] {
  const allIds = getAllItemIds();
  if (categoryKey === 'all') return allIds;

  // Check if it's a parent category
  if (PARENT_CATEGORIES[categoryKey]) {
    const subCategories = PARENT_CATEGORIES[categoryKey];
    return allIds.filter((id) => subCategories.includes(categorize(id)));
  }

  // Otherwise treat as a specific subcategory
  return allIds.filter((id) => categorize(id) === categoryKey);
}

export function filterItems(items: string[], tierFilter: string, enchantFilter: string): string[] {
  return items.filter((id) => {
    const match = id.match(/^T(\d+)/);
    const tier = match ? match[1] : '0';
    const enc = id.includes('@') ? id.split('@')[1] : '0';
    if (tierFilter !== 'all' && tier !== tierFilter) return false;
    if (enchantFilter !== 'all' && enc !== enchantFilter) return false;
    return true;
  });
}
