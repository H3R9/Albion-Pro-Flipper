import fetch from 'node-fetch';

async function check(id) {
  const res = await fetch(`https://render.albiononline.com/v1/item/${id}.png`);
  console.log(id, res.status);
}

async function run() {
  await check('T4_FURNITUREITEM_TROPHY_ROCK');
  await check('T4_FURNITUREITEM_TROPHY_FISH');
  await check('T5_FURNITUREITEM_TROPHY_SHARK');
  await check('T8_FURNITUREITEM_TROPHY_FISHING_BOSS');
  await check('T4_FURNITUREITEM_TROPHY_GENERAL');
  await check('T4_FURNITUREITEM_TROPHY');
}

run();
