import fetch from 'node-fetch';

const prefixes = ['WOOD', 'STONE', 'ORE', 'FIBER', 'HIDE', 'FISHING', 'MERCENARY'];

async function run() {
  for (const p of prefixes) {
    const id = `T4_FURNITUREITEM_TROPHY_${p}`;
    const res = await fetch(`https://render.albiononline.com/v1/item/${id}.png`);
    console.log(id, res.status);
  }
}

run();
