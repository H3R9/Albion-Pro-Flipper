import fs from 'fs';
const itemNamesStr = fs.readFileSync('lib/albion/item-names.json', 'utf8');
const data = JSON.parse(itemNamesStr);

const keys = Object.keys(data);
function findPrefix(prefix) {
  return keys.filter(k => k.startsWith(prefix) && !k.includes('@'));
}

console.log("Wood Trophies:", findPrefix('T2_FURNITUREITEM_TROPHY_WOOD'));
console.log("Mercenary Trophies:", findPrefix('T2_FURNITUREITEM_TROPHY_MERCENARY'));
console.log("Mage Trophies:", findPrefix('T2_FURNITUREITEM_TROPHY_MAGE'));
console.log("Fishing Trophies:", findPrefix('T2_FURNITUREITEM_TROPHY_FISHING'));
console.log("General Trophies:", findPrefix('T2_FURNITUREITEM_TROPHY'));
console.log("Beds:", findPrefix('T2_FURNITUREITEM_BED'));
console.log("Tables:", findPrefix('T2_FURNITUREITEM_TABLE'));
console.log("Contracts:", findPrefix('T2_LABOURER_CONTRACT'));
