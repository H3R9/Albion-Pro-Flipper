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
  'Armadura de Capacete': ['armor_plate_head', 'armor_leather_head', 'armor_cloth_head'],
  'Armadura de Peitoral': ['armor_plate_body', 'armor_leather_body', 'armor_cloth_body'],
  'Armadura de Calçado': ['armor_plate_feet', 'armor_leather_feet', 'armor_cloth_feet'],
  'Mão Secundária': ['offhand'],
  Capas: ['capes'],
  Bolsas: ['bags'],
  Montaria: ['mounts'],
  Consumível: ['consumables'],
};

function categorize(itemId: string): string {
  const base = itemId.replace(/^T\d+_/, '').split('@')[0];
  if (base.match(/(SWORD|CLAYMORE|DUALSWORD|SCIMITAR)/)) return 'weapons_sword';
  if (base.match(/(AXE|HALBERD|GLAIVE|CLEAVER|SCYTHE|HARPOON)/) && base.match(/^(MAIN_|2H_)/)) return 'weapons_axe';
  if (base.match(/(MACE|FLAIL|DUALMACE|ROCKMACE)/) && !base.includes('HAMMER')) return 'weapons_mace';
  if (base.match(/(HAMMER|POLEHAMMER|RAM_|DUALHAMMER)/)) return 'weapons_hammer';
  if (base.match(/(SPEAR|PIKE|TRIDENT|LANCE|PITCHFORK)/)) return 'weapons_spear';
  if (base.match(/(DAGGER|CLAW|SICKLE|KATAR|RAPIER|GAUNTLET|SICKLE|IRONGAUNTLETS)/)) return 'weapons_dagger';
  if (base.match(/(QUARTERSTAFF|IRONCLADEDSTAFF|DOUBLEBLADEDSTAFF|COMBATSTAFF|TWINSCYTHE|ROCKSTAFF)/))
    return 'weapons_staff';
  if (base.match(/BOW/) && base.match(/^2H_/)) return 'weapons_bow';
  if (base.match(/CROSSBOW/)) return 'weapons_crossbow';
  if (base.match(/(FIRE|INFERNO)/) && base.match(/(STAFF|RING)/)) return 'weapons_fire';
  if (base.match(/(FROST|GLACIAL|ICE|ICECRYSTAL)/) && base.match(/(STAFF|GAUNTLET|CRYSTAL|RING)/)) return 'weapons_frost';
  if (base.match(/(ARCANE|ENIGMATIC)/)) return 'weapons_arcane';
  if (base.match(/(HOLY|DIVINE)/) && base.match(/STAFF|CHIME|RING/)) return 'weapons_holy';
  if (base.match(/(NATURE|WILD)/) && base.match(/STAFF|RING/)) return 'weapons_nature';
  if (base.match(/(CURSED|DEMONIC|SKULLORB|SHADOW)/)) return 'weapons_curse';
  if (base.match(/KNUCKLE/)) return 'weapons_knuckles';
  if (base.match(/^(MAIN_|2H_)/)) return 'weapons_other';
  if (base.startsWith('HEAD_PLATE')) return 'armor_plate_head';
  if (base.startsWith('ARMOR_PLATE')) return 'armor_plate_body';
  if (base.startsWith('SHOES_PLATE')) return 'armor_plate_feet';
  if (base.startsWith('HEAD_LEATHER')) return 'armor_leather_head';
  if (base.startsWith('ARMOR_LEATHER')) return 'armor_leather_body';
  if (base.startsWith('SHOES_LEATHER')) return 'armor_leather_feet';
  if (base.startsWith('HEAD_CLOTH')) return 'armor_cloth_head';
  if (base.startsWith('ARMOR_CLOTH')) return 'armor_cloth_body';
  if (base.startsWith('SHOES_CLOTH')) return 'armor_cloth_feet';
  if (base.startsWith('OFF_')) return 'offhand';
  if (base.startsWith('CAPE')) return 'capes';
  if (base.startsWith('BAG')) return 'bags';
  if (base.startsWith('MOUNT_')) return 'mounts';
  if (base.match(/^(POTION_|MEAL_)/)) return 'consumables';
  return 'other';
}


function generateFallbackItems(): string[] {
  const bases = [
      // SWORDS
      'MAIN_SWORD','2H_CLAYMORE','2H_DUALSWORD','MAIN_SCIMITAR_MORGANA','2H_CLEAVER_HELL','2H_DUALSCIMITAR_UNDEAD','2H_CLAYMORE_AVALON',
      // AXES
      'MAIN_AXE','2H_HALBERD','2H_DUALAXE','MAIN_AXE_KEEPER','2H_HALBERD_MORGANA','2H_SCYTHE_HELL','2H_DUALAXE_AVALON',
      // MACES
      'MAIN_MACE','2H_MACE','2H_FLAIL','MAIN_ROCKMACE_KEEPER','MAIN_MACE_HELL','2H_MACE_MORGANA','2H_DUALMACE_AVALON',
      // HAMMERS
      'MAIN_HAMMER','2H_POLEHAMMER','2H_HAMMER','2H_HAMMER_UNDEAD','2H_DUALHAMMER_HELL','2H_RAM_KEEPER','2H_HAMMER_AVALON',
      // SPEARS
      'MAIN_SPEAR','2H_SPEAR','2H_GLAIVE','MAIN_SPEAR_KEEPER','2H_HARPOON_HELL','2H_TRIDENT_UNDEAD','2H_PITCHFORK_MORGANA','MAIN_SPEAR_LANCE_AVALON',
      // DAGGERS
      'MAIN_DAGGER','2H_DAGGERPAIR','2H_CLAWPAIR','MAIN_RAPIER_MORGANA','MAIN_DAGGER_HELL','2H_IRONGAUNTLETS_HELL','2H_DUALSICKLE_UNDEAD','2H_DAGGER_KATAR_AVALON',
      // QUARTERSTAFFS
      '2H_QUARTERSTAFF','2H_IRONCLADEDSTAFF','2H_DOUBLEBLADEDSTAFF','2H_COMBATSTAFF_MORGANA','2H_TWINSCYTHE_HELL','2H_ROCKSTAFF_KEEPER','2H_QUARTERSTAFF_AVALON',
      // BOWS
      '2H_BOW','2H_WARBOW','2H_LONGBOW','2H_BOW_HELL','2H_BOW_KEEPER','2H_BOW_UNDEAD','2H_BOW_AVALON',
      // CROSSBOWS
      'MAIN_CROSSBOW','2H_CROSSBOWLARGE','2H_CROSSBOW','2H_REPEATINGCROSSBOW_UNDEAD','2H_DUALCROSSBOW_HELL','2H_CROSSBOWLARGE_MORGANA','2H_CROSSBOW_AVALON',
      // FIRE
      'MAIN_FIRESTAFF','2H_FIRESTAFF','2H_INFERNOSTAFF','MAIN_FIRESTAFF_KEEPER','2H_FIRESTAFF_HELL','2H_INFERNOSTAFF_MORGANA','2H_FIRE_RING_AVALON',
      // FROST
      'MAIN_FROSTSTAFF','2H_FROSTSTAFF','2H_GLACIALSTAFF','MAIN_FROSTSTAFF_KEEPER','2H_ICEGAUNTLETS_HELL','2H_ICECRYSTAL_UNDEAD','2H_ICE_RING_AVALON',
      // ARCANE
      'MAIN_ARCANESTAFF','2H_ARCANESTAFF','2H_ENIGMATICSTAFF','MAIN_ARCANESTAFF_UNDEAD','2H_ARCANESTAFF_HELL','2H_ENIGMATICSTAFF_MORGANA','2H_ARCANE_RING_AVALON',
      // HOLY
      'MAIN_HOLYSTAFF','2H_HOLYSTAFF','2H_DIVINESTAFF','MAIN_HOLYSTAFF_MORGANA','2H_HOLYSTAFF_HELL','2H_DIVINESTAFF_UNDEAD','2H_HOLY_RING_AVALON',
      // NATURE
      'MAIN_NATURESTAFF','2H_NATURESTAFF','2H_WILDSTAFF','MAIN_NATURESTAFF_KEEPER','2H_NATURESTAFF_HELL','2H_NATURESTAFF_KEEPER','2H_NATURE_RING_AVALON',
      // CURSED
      'MAIN_CURSEDSTAFF','2H_CURSEDSTAFF','2H_DEMONICSTAFF','MAIN_CURSEDSTAFF_UNDEAD','2H_SKULLORB_HELL','2H_CURSEDSTAFF_MORGANA','2H_CURSED_RING_AVALON',
      
      // GLOVES/KNUCKLES
      '2H_KNUCKLES_SET1','2H_KNUCKLES_SET2','2H_KNUCKLES_SET3','2H_KNUCKLES_KEEPER','2H_KNUCKLES_HELL','2H_KNUCKLES_MORGANA','2H_KNUCKLES_AVALON',

      // PLATE ARMOR
      'HEAD_PLATE_SET1','HEAD_PLATE_SET2','HEAD_PLATE_SET3','HEAD_PLATE_UNDEAD','HEAD_PLATE_HELL','HEAD_PLATE_KEEPER','HEAD_PLATE_AVALON',
      'ARMOR_PLATE_SET1','ARMOR_PLATE_SET2','ARMOR_PLATE_SET3','ARMOR_PLATE_UNDEAD','ARMOR_PLATE_HELL','ARMOR_PLATE_KEEPER','ARMOR_PLATE_AVALON',
      'SHOES_PLATE_SET1','SHOES_PLATE_SET2','SHOES_PLATE_SET3','SHOES_PLATE_UNDEAD','SHOES_PLATE_HELL','SHOES_PLATE_KEEPER','SHOES_PLATE_AVALON',
      // LEATHER ARMOR
      'HEAD_LEATHER_SET1','HEAD_LEATHER_SET2','HEAD_LEATHER_SET3','HEAD_LEATHER_MORGANA','HEAD_LEATHER_HELL','HEAD_LEATHER_UNDEAD','HEAD_LEATHER_AVALON',
      'ARMOR_LEATHER_SET1','ARMOR_LEATHER_SET2','ARMOR_LEATHER_SET3','ARMOR_LEATHER_MORGANA','ARMOR_LEATHER_HELL','ARMOR_LEATHER_UNDEAD','ARMOR_LEATHER_AVALON',
      'SHOES_LEATHER_SET1','SHOES_LEATHER_SET2','SHOES_LEATHER_SET3','SHOES_LEATHER_MORGANA','SHOES_LEATHER_HELL','SHOES_LEATHER_UNDEAD','SHOES_LEATHER_AVALON',
      // CLOTH ARMOR
      'HEAD_CLOTH_SET1','HEAD_CLOTH_SET2','HEAD_CLOTH_SET3','HEAD_CLOTH_KEEPER','HEAD_CLOTH_HELL','HEAD_CLOTH_MORGANA','HEAD_CLOTH_AVALON',
      'ARMOR_CLOTH_SET1','ARMOR_CLOTH_SET2','ARMOR_CLOTH_SET3','ARMOR_CLOTH_KEEPER','ARMOR_CLOTH_HELL','ARMOR_CLOTH_MORGANA','ARMOR_CLOTH_AVALON',
      'SHOES_CLOTH_SET1','SHOES_CLOTH_SET2','SHOES_CLOTH_SET3','SHOES_CLOTH_KEEPER','SHOES_CLOTH_HELL','SHOES_CLOTH_MORGANA','SHOES_CLOTH_AVALON',
      // OFFHANDS
      'OFF_SHIELD','OFF_BOOK','OFF_TORCH','OFF_SHIELD_HELL','OFF_SHIELD_UNDEAD','OFF_TOWERSHIELD_UNDEAD','OFF_HORN_KEEPER','OFF_JESTERCANE_HELL','OFF_LAMP_UNDEAD','OFF_ORB_MORGANA','OFF_TOTEM_KEEPER',
      'CAPE','BAG','CAPEITEM_UNDEAD','CAPEITEM_MORGANA','CAPEITEM_KEEPER','CAPEITEM_DEMON','CAPEITEM_THEFTFORD','CAPEITEM_FORTSTERLING','CAPEITEM_LYMHURST','CAPEITEM_MARTLOCK','CAPEITEM_BRIDGEWATCH',
      ...Object.keys(ITEM_NAMES).map(k => k.split('@')[0].replace(/^T\d+_/, '')) 
  ];
  
  const uniqueBases = Array.from(new Set(bases));
  const items: string[] = [];
  
  for (const b of uniqueBases) {
      if (b.startsWith('POTION_') || b.startsWith('MEAL_')) {
          for (const t of [4,5,6,7,8]) {
            for (const e of [0,1,2,3]) {
              items.push(e===0 ? `T${t}_${b}` : `T${t}_${b}@${e}`);
            }
          }
          continue;
      }
      for (const t of [4,5,6,7,8]) {
          for (const e of [0,1,2,3,4]) {
              items.push(e===0 ? `T${t}_${b}` : `T${t}_${b}@${e}`);
          }
      }
  }
  return items;
}

const ALL_ITEM_IDS = generateFallbackItems();

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
