const fs = require('fs');
async function run() {
  const res = await fetch('https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/master/buildings.xml');
  const text = await res.text();
  fs.writeFileSync('buildings.xml', text);
  console.log('done');
}
run();
