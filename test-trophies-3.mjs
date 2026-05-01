import fetch from 'node-fetch';

async function check(id) {
  const res = await fetch(`https://render.albiononline.com/v1/item/${id}.png`);
  console.log(id, res.status);
}

async function run() {
  await check('T2_FURNITUREITEM_TROPHY_GENERAL');
  await check('T3_FURNITUREITEM_TROPHY_GENERAL');
  await check('T2_FURNITUREITEM_BED');
  await check('T2_FURNITUREITEM_TABLE');
}

run();
