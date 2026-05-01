import fetch from 'node-fetch'; // tsx has polyfill or I can use native fetch

async function check(id) {
  const res = await fetch(`https://render.albiononline.com/v1/item/${id}.png`);
  console.log(id, res.status);
}

async function run() {
  await check('T2_FURNITUREITEM_BED');
  await check('T4_FURNITUREITEM_TROPHY_WOOD');
  await check('T5_LABOURER_CONTRACT_WOOD');
  await check('T4_PLANKS');
}

run();
