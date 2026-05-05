import fetch from 'node-fetch';

async function run() {
  const res = await fetch('https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/master/formatted/items.json');
  const items = await res.json();
  const fishTrophies = items.filter(i => i.UniqueName.includes('TROPHY_FISH'));
  console.log(fishTrophies.map(i => i.UniqueName));
  const generalTrophies = items.filter(i => i.UniqueName.includes('TROPHY'));
  // console.log(generalTrophies.map(i => i.UniqueName));
}
run();
