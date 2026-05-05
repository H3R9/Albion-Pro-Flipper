import https from 'https';
const url = 'https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/master/formatted/items.json';

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const items = JSON.parse(data);
      const fishes = items.filter(i => i.UniqueName && i.UniqueName.includes('FISH') && i.LocalizedNames && i.LocalizedNames['PT-BR']);
      for (const f of fishes) {
        console.log(`"${f.UniqueName}": "${f.LocalizedNames['PT-BR']}",`);
      }
    } catch(e) {
      console.error(e);
    }
  });
}).on('error', (e) => {
  console.error(e);
});
