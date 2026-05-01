import fetch from 'node-fetch';

async function check(id) {
  const res = await fetch(`https://render.albiononline.com/v1/item/${id}.png`);
  console.log(id, res.status);
}

async function run() {
  await check('T4_JOURNAL_FISHING_EMPTY');
  await check('T4_JOURNAL_FISH_EMPTY');
  await check('T4_LABOURER_CONTRACT_FISHING');
  await check('T4_LABOURER_CONTRACT_FISH');
}

run();
