import fs from 'fs';
const data = JSON.parse(fs.readFileSync('lib/albion/item-names.json', 'utf8'));
const keys = Object.keys(data).filter(k => k.includes('TROPHY'));
const prefixes = ['WOOD', 'STONE', 'ORE', 'FIBER', 'HIDE', 'FISHING', 'MERCENARY'];
prefixes.forEach(p => {
  const specific = keys.filter(k => k.includes(p) && !k.includes('@'));
  console.log(p, specific);
});
console.log("GENERAL", keys.filter(k => k.includes('TROPHY') && !k.includes('MERCENARY') && !k.includes('WOOD') && !k.includes('STONE') && !k.includes('ORE') && !k.includes('FIBER') && !k.includes('HIDE') && !k.includes('FISHING') && !k.includes('@')));
