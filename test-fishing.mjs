import fs from 'fs';
const data = fs.readFileSync('buildings.xml', 'utf8');
const regex = /uniquename="T[^"]*TROPHY_FISH[^"]*"/g;
const matches = [...data.matchAll(regex)].map(m => m[0].split('"')[1]);
const unique = [...new Set(matches)].sort();
console.log(unique);
