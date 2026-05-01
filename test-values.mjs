import fs from 'fs';
const data = JSON.parse(fs.readFileSync('lib/albion/item-names.json', 'utf8'));
const values = Object.values(data);
console.log("Camas:", values.filter(v => v.includes('Cama')).slice(0, 5));
console.log("Mesas:", values.filter(v => v.includes('Mesa')).slice(0, 5));
console.log("Trofeus:", values.filter(v => v.includes('Troféu') || v.includes('Trophy') || v.includes('troféu')).slice(0, 5));
console.log("Contratos:", values.filter(v => v.includes('Contrato')).slice(0, 5));
